
#!/usr/bin/env python3
"""
AEGIS AI - Sistema de Detección de Anomalías DDoS
Entrenamiento y evaluación de modelos de ML para detección de ataques DDoS en redes IoT
"""

import os
import json
import pickle
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report, roc_curve
)
from sklearn.model_selection import cross_val_score
import xgboost as xgb
import shap
import joblib

warnings.filterwarnings('ignore')

class AEGISModelTrainer:
    """Entrenador de modelos para AEGIS AI"""
    
    def __init__(self, data_path="/home/ubuntu/aegis_data/processed_ml_data.pkl"):
        self.data_path = data_path
        self.models = {}
        self.results = {}
        self.feature_names = []
        self.best_model = None
        self.best_model_name = None
        self.best_score = 0
        
        # Crear directorios necesarios
        os.makedirs("models", exist_ok=True)
        os.makedirs("plots", exist_ok=True)
        os.makedirs("reports", exist_ok=True)
        
    def load_data(self):
        """Cargar datos preprocesados"""
        print("🔄 Cargando datos preprocesados...")
        
        with open(self.data_path, 'rb') as f:
            data = pickle.load(f)
        
        self.X_train = data['X_train']
        self.X_val = data['X_val'] 
        self.X_test = data['X_test']
        self.y_train = data['y_train']
        self.y_val = data['y_val']
        self.y_test = data['y_test']
        self.feature_names = data['feature_names']
        
        print(f"✅ Datos cargados:")
        print(f"   - Entrenamiento: {self.X_train.shape[0]} muestras")
        print(f"   - Validación: {self.X_val.shape[0]} muestras") 
        print(f"   - Prueba: {self.X_test.shape[0]} muestras")
        print(f"   - Características: {len(self.feature_names)}")
        
    def initialize_models(self):
        """Inicializar modelos de ML"""
        print("\n🤖 Inicializando modelos...")
        
        self.models = {
            'RandomForest': RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ),
            'XGBoost': xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='logloss'
            ),
            'NeuralNetwork': MLPClassifier(
                hidden_layer_sizes=(100, 50),
                activation='relu',
                solver='adam',
                alpha=0.001,
                batch_size=200,
                learning_rate='adaptive',
                max_iter=300,
                random_state=42
            )
        }
        
        print(f"✅ {len(self.models)} modelos inicializados")
        
    def train_and_evaluate(self):
        """Entrenar y evaluar todos los modelos"""
        print("\n🚀 Iniciando entrenamiento y evaluación...")
        
        for name, model in self.models.items():
            print(f"\n📊 Entrenando {name}...")
            
            # Entrenar modelo
            model.fit(self.X_train, self.y_train)
            
            # Predicciones
            y_pred_val = model.predict(self.X_val)
            y_pred_test = model.predict(self.X_test)
            y_proba_val = model.predict_proba(self.X_val)[:, 1]
            y_proba_test = model.predict_proba(self.X_test)[:, 1]
            
            # Métricas de validación
            val_metrics = self._calculate_metrics(self.y_val, y_pred_val, y_proba_val)
            
            # Métricas de prueba
            test_metrics = self._calculate_metrics(self.y_test, y_pred_test, y_proba_test)
            
            # Cross-validation
            cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5, scoring='f1')
            
            # Guardar resultados
            self.results[name] = {
                'model': model,
                'validation_metrics': val_metrics,
                'test_metrics': test_metrics,
                'cv_f1_mean': cv_scores.mean(),
                'cv_f1_std': cv_scores.std(),
                'predictions_val': y_pred_val,
                'predictions_test': y_pred_test,
                'probabilities_val': y_proba_val,
                'probabilities_test': y_proba_test
            }
            
            print(f"   Validación - F1: {val_metrics['f1']:.4f}, AUC: {val_metrics['auc']:.4f}")
            print(f"   Prueba - F1: {test_metrics['f1']:.4f}, AUC: {test_metrics['auc']:.4f}")
            print(f"   CV F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
            
            # Determinar mejor modelo basado en F1 de validación
            if val_metrics['f1'] > self.best_score:
                self.best_score = val_metrics['f1']
                self.best_model = model
                self.best_model_name = name
                
        print(f"\n🏆 Mejor modelo: {self.best_model_name} (F1: {self.best_score:.4f})")
        
    def _calculate_metrics(self, y_true, y_pred, y_proba):
        """Calcular métricas de evaluación"""
        return {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred),
            'recall': recall_score(y_true, y_pred),
            'f1': f1_score(y_true, y_pred),
            'auc': roc_auc_score(y_true, y_proba)
        }
        
    def create_threat_score(self, probabilities):
        """Crear sistema de scoring de amenazas (0-100)"""
        return (probabilities * 100).astype(int)
        
    def generate_feature_importance(self):
        """Generar análisis de importancia de características"""
        print("\n📈 Generando análisis de importancia de características...")
        
        # Feature importance para Random Forest y XGBoost
        fig, axes = plt.subplots(2, 2, figsize=(20, 15))
        fig.suptitle('AEGIS AI - Análisis de Importancia de Características', fontsize=16, fontweight='bold')
        
        for idx, (name, result) in enumerate(self.results.items()):
            if name in ['RandomForest', 'XGBoost']:
                model = result['model']
                
                if hasattr(model, 'feature_importances_'):
                    importances = model.feature_importances_
                    indices = np.argsort(importances)[::-1][:15]  # Top 15
                    
                    row = idx // 2
                    col = idx % 2
                    
                    axes[row, col].bar(range(len(indices)), importances[indices])
                    axes[row, col].set_title(f'{name} - Top 15 Características')
                    axes[row, col].set_xticks(range(len(indices)))
                    axes[row, col].set_xticklabels([self.feature_names[i] for i in indices], 
                                                 rotation=45, ha='right')
                    axes[row, col].set_ylabel('Importancia')
        
        # ROC Curves
        axes[1, 1].clear()
        for name, result in self.results.items():
            fpr, tpr, _ = roc_curve(self.y_test, result['probabilities_test'])
            auc = result['test_metrics']['auc']
            axes[1, 1].plot(fpr, tpr, label=f'{name} (AUC = {auc:.3f})')
        
        axes[1, 1].plot([0, 1], [0, 1], 'k--', label='Random')
        axes[1, 1].set_xlabel('Tasa de Falsos Positivos')
        axes[1, 1].set_ylabel('Tasa de Verdaderos Positivos')
        axes[1, 1].set_title('Curvas ROC - Comparación de Modelos')
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('plots/feature_importance_analysis.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def generate_shap_analysis(self):
        """Generar análisis SHAP para explicabilidad"""
        print("\n🔍 Generando análisis SHAP...")
        
        try:
            # SHAP para el mejor modelo
            if self.best_model_name in ['RandomForest', 'XGBoost']:
                explainer = shap.TreeExplainer(self.best_model)
                shap_values = explainer.shap_values(self.X_test[:500])  # Muestra para eficiencia
                
                # Si es clasificación binaria, tomar valores de la clase positiva
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]
                
                # Summary plot
                plt.figure(figsize=(12, 8))
                shap.summary_plot(shap_values, self.X_test[:500], 
                                feature_names=self.feature_names, show=False)
                plt.title(f'AEGIS AI - Análisis SHAP ({self.best_model_name})', fontweight='bold')
                plt.tight_layout()
                plt.savefig('plots/shap_summary.png', dpi=300, bbox_inches='tight')
                plt.close()
                
                # Feature importance plot
                plt.figure(figsize=(10, 8))
                shap.summary_plot(shap_values, self.X_test[:500], 
                                feature_names=self.feature_names, plot_type="bar", show=False)
                plt.title(f'AEGIS AI - Importancia SHAP ({self.best_model_name})', fontweight='bold')
                plt.tight_layout()
                plt.savefig('plots/shap_importance.png', dpi=300, bbox_inches='tight')
                plt.close()
                
                print("✅ Análisis SHAP completado")
                
        except Exception as e:
            print(f"⚠️ Error en análisis SHAP: {e}")
            
    def create_confusion_matrices(self):
        """Crear matrices de confusión para todos los modelos"""
        print("\n📊 Generando matrices de confusión...")
        
        fig, axes = plt.subplots(1, 3, figsize=(18, 5))
        fig.suptitle('AEGIS AI - Matrices de Confusión (Datos de Prueba)', fontsize=16, fontweight='bold')
        
        for idx, (name, result) in enumerate(self.results.items()):
            cm = confusion_matrix(self.y_test, result['predictions_test'])
            
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                       xticklabels=['Normal', 'DDoS'], 
                       yticklabels=['Normal', 'DDoS'],
                       ax=axes[idx])
            axes[idx].set_title(f'{name}')
            axes[idx].set_xlabel('Predicción')
            axes[idx].set_ylabel('Real')
            
        plt.tight_layout()
        plt.savefig('plots/confusion_matrices.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def save_results(self):
        """Guardar resultados y métricas"""
        print("\n💾 Guardando resultados...")
        
        # Preparar métricas para JSON
        metrics_summary = {}
        for name, result in self.results.items():
            metrics_summary[name] = {
                'validation_metrics': result['validation_metrics'],
                'test_metrics': result['test_metrics'],
                'cv_f1_mean': float(result['cv_f1_mean']),
                'cv_f1_std': float(result['cv_f1_std'])
            }
        
        # Agregar información del mejor modelo
        metrics_summary['best_model'] = {
            'name': self.best_model_name,
            'validation_f1': float(self.best_score),
            'test_metrics': self.results[self.best_model_name]['test_metrics']
        }
        
        # Guardar métricas
        with open('metrics.json', 'w') as f:
            json.dump(metrics_summary, f, indent=2)
            
        # Guardar mejor modelo
        joblib.dump(self.best_model, 'models/best_model.pkl')
        
        # Guardar información adicional del modelo
        model_info = {
            'model_name': self.best_model_name,
            'feature_names': self.feature_names,
            'training_date': pd.Timestamp.now().isoformat(),
            'model_params': self.best_model.get_params(),
            'performance': self.results[self.best_model_name]['test_metrics']
        }
        
        with open('models/model_info.json', 'w') as f:
            json.dump(model_info, f, indent=2)
            
        print(f"✅ Modelo guardado: models/best_model.pkl")
        print(f"✅ Métricas guardadas: metrics.json")
        
    def generate_detailed_report(self):
        """Generar reporte detallado de resultados"""
        print("\n📋 Generando reporte detallado...")
        
        report = {
            "aegis_ai_detection_report": {
                "timestamp": pd.Timestamp.now().isoformat(),
                "dataset_info": {
                    "train_samples": len(self.X_train),
                    "validation_samples": len(self.X_val),
                    "test_samples": len(self.X_test),
                    "features": len(self.feature_names),
                    "feature_list": self.feature_names
                },
                "models_evaluated": list(self.results.keys()),
                "best_model": {
                    "name": self.best_model_name,
                    "validation_f1": float(self.best_score),
                    "test_performance": self.results[self.best_model_name]['test_metrics']
                },
                "model_comparison": {},
                "threat_scoring": {
                    "description": "Sistema de scoring 0-100 basado en probabilidad de amenaza",
                    "formula": "threat_score = int(probability * 100)",
                    "interpretation": {
                        "0-30": "Riesgo Bajo",
                        "31-60": "Riesgo Medio", 
                        "61-80": "Riesgo Alto",
                        "81-100": "Riesgo Crítico"
                    }
                }
            }
        }
        
        # Agregar comparación de modelos
        for name, result in self.results.items():
            report["aegis_ai_detection_report"]["model_comparison"][name] = {
                "validation_metrics": result['validation_metrics'],
                "test_metrics": result['test_metrics'],
                "cross_validation": {
                    "f1_mean": float(result['cv_f1_mean']),
                    "f1_std": float(result['cv_f1_std'])
                }
            }
        
        with open('reports/detailed_report.json', 'w') as f:
            json.dump(report, f, indent=2)
            
        print("✅ Reporte detallado guardado: reports/detailed_report.json")
        
    def run_full_pipeline(self):
        """Ejecutar pipeline completo de entrenamiento"""
        print("🚀 AEGIS AI - Sistema de Detección de Anomalías DDoS")
        print("=" * 60)
        
        try:
            self.load_data()
            self.initialize_models()
            self.train_and_evaluate()
            self.generate_feature_importance()
            self.generate_shap_analysis()
            self.create_confusion_matrices()
            self.save_results()
            self.generate_detailed_report()
            
            print("\n" + "=" * 60)
            print("✅ ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
            print(f"🏆 Mejor modelo: {self.best_model_name}")
            print(f"📊 F1 Score: {self.best_score:.4f}")
            print(f"💾 Modelo guardado en: models/best_model.pkl")
            print("📈 Gráficos disponibles en: plots/")
            print("📋 Reportes disponibles en: reports/")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ Error durante el entrenamiento: {e}")
            raise

if __name__ == "__main__":
    trainer = AEGISModelTrainer()
    trainer.run_full_pipeline()
