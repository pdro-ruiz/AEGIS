
#!/usr/bin/env python3
"""
AEGIS AI - Sistema de Inferencia en Tiempo Real
Módulo para detección de amenazas DDoS en tiempo real
"""

import json
import pickle
import numpy as np
import pandas as pd
import joblib
from typing import Dict, List, Union, Optional
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

class AEGISThreatDetector:
    """Detector de amenazas en tiempo real para AEGIS AI"""
    
    def __init__(self, model_path: str = "models/best_model.pkl", 
                 model_info_path: str = "models/model_info.json"):
        """
        Inicializar detector de amenazas
        
        Args:
            model_path: Ruta al modelo entrenado
            model_info_path: Ruta a la información del modelo
        """
        self.model = None
        self.model_info = None
        self.feature_names = []
        self.model_name = ""
        
        self.load_model(model_path, model_info_path)
        
    def load_model(self, model_path: str, model_info_path: str):
        """Cargar modelo entrenado y su información"""
        try:
            # Cargar modelo
            self.model = joblib.load(model_path)
            
            # Cargar información del modelo
            with open(model_info_path, 'r') as f:
                self.model_info = json.load(f)
                
            self.feature_names = self.model_info['feature_names']
            self.model_name = self.model_info['model_name']
            
            print(f"✅ Modelo cargado: {self.model_name}")
            print(f"📊 Características esperadas: {len(self.feature_names)}")
            
        except Exception as e:
            raise Exception(f"Error cargando modelo: {e}")
    
    def calculate_threat_score(self, probability: float) -> int:
        """
        Calcular score de amenaza (0-100)
        
        Args:
            probability: Probabilidad de amenaza (0-1)
            
        Returns:
            Score de amenaza (0-100)
        """
        return int(probability * 100)
    
    def interpret_threat_level(self, threat_score: int) -> str:
        """
        Interpretar nivel de amenaza basado en score
        
        Args:
            threat_score: Score de amenaza (0-100)
            
        Returns:
            Nivel de amenaza interpretado
        """
        if threat_score <= 30:
            return "BAJO"
        elif threat_score <= 60:
            return "MEDIO"
        elif threat_score <= 80:
            return "ALTO"
        else:
            return "CRÍTICO"
    
    def predict_single(self, features: Union[Dict, List, np.ndarray]) -> Dict:
        """
        Realizar predicción para una sola muestra
        
        Args:
            features: Características de la muestra (dict, list o array)
            
        Returns:
            Diccionario con resultados de la predicción
        """
        try:
            # Convertir features a formato adecuado
            if isinstance(features, dict):
                # Asegurar que todas las características estén presentes
                feature_array = []
                for feature_name in self.feature_names:
                    if feature_name in features:
                        feature_array.append(features[feature_name])
                    else:
                        raise ValueError(f"Característica faltante: {feature_name}")
                features = np.array(feature_array).reshape(1, -1)
                
            elif isinstance(features, list):
                features = np.array(features).reshape(1, -1)
                
            elif isinstance(features, np.ndarray):
                if features.ndim == 1:
                    features = features.reshape(1, -1)
            
            # Validar dimensiones
            if features.shape[1] != len(self.feature_names):
                raise ValueError(f"Número incorrecto de características. "
                               f"Esperado: {len(self.feature_names)}, "
                               f"Recibido: {features.shape[1]}")
            
            # Realizar predicción
            prediction = self.model.predict(features)[0]
            probability = self.model.predict_proba(features)[0, 1]  # Probabilidad de DDoS
            threat_score = self.calculate_threat_score(probability)
            threat_level = self.interpret_threat_level(threat_score)
            
            # Preparar resultado
            result = {
                "timestamp": datetime.now().isoformat(),
                "prediction": {
                    "is_ddos": bool(prediction),
                    "probability": float(probability),
                    "threat_score": threat_score,
                    "threat_level": threat_level
                },
                "model_info": {
                    "model_name": self.model_name,
                    "confidence": float(max(probability, 1 - probability))
                }
            }
            
            return result
            
        except Exception as e:
            return {
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "prediction": None
            }
    
    def predict_batch(self, features_batch: Union[List[Dict], List[List], np.ndarray]) -> List[Dict]:
        """
        Realizar predicciones para múltiples muestras
        
        Args:
            features_batch: Lote de características
            
        Returns:
            Lista de diccionarios con resultados
        """
        results = []
        
        try:
            # Convertir a formato numpy
            if isinstance(features_batch, list) and isinstance(features_batch[0], dict):
                # Lista de diccionarios
                feature_matrix = []
                for features in features_batch:
                    feature_array = []
                    for feature_name in self.feature_names:
                        if feature_name in features:
                            feature_array.append(features[feature_name])
                        else:
                            raise ValueError(f"Característica faltante: {feature_name}")
                    feature_matrix.append(feature_array)
                features_batch = np.array(feature_matrix)
                
            elif isinstance(features_batch, list):
                features_batch = np.array(features_batch)
            
            # Validar dimensiones
            if features_batch.shape[1] != len(self.feature_names):
                raise ValueError(f"Número incorrecto de características. "
                               f"Esperado: {len(self.feature_names)}, "
                               f"Recibido: {features_batch.shape[1]}")
            
            # Realizar predicciones
            predictions = self.model.predict(features_batch)
            probabilities = self.model.predict_proba(features_batch)[:, 1]
            
            # Procesar resultados
            for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
                threat_score = self.calculate_threat_score(prob)
                threat_level = self.interpret_threat_level(threat_score)
                
                result = {
                    "sample_id": i,
                    "timestamp": datetime.now().isoformat(),
                    "prediction": {
                        "is_ddos": bool(pred),
                        "probability": float(prob),
                        "threat_score": threat_score,
                        "threat_level": threat_level
                    },
                    "model_info": {
                        "model_name": self.model_name,
                        "confidence": float(max(prob, 1 - prob))
                    }
                }
                results.append(result)
                
        except Exception as e:
            # En caso de error, devolver error para todas las muestras
            error_result = {
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "prediction": None
            }
            results = [error_result] * len(features_batch)
        
        return results
    
    def get_feature_importance(self) -> Optional[Dict]:
        """
        Obtener importancia de características del modelo
        
        Returns:
            Diccionario con importancia de características o None
        """
        try:
            if hasattr(self.model, 'feature_importances_'):
                importances = self.model.feature_importances_
                feature_importance = {}
                
                for feature, importance in zip(self.feature_names, importances):
                    feature_importance[feature] = float(importance)
                
                # Ordenar por importancia
                sorted_features = dict(sorted(feature_importance.items(), 
                                            key=lambda x: x[1], reverse=True))
                
                return {
                    "model_name": self.model_name,
                    "feature_importance": sorted_features,
                    "top_5_features": list(sorted_features.keys())[:5]
                }
            else:
                return None
                
        except Exception as e:
            print(f"Error obteniendo importancia de características: {e}")
            return None
    
    def get_model_performance(self) -> Dict:
        """
        Obtener métricas de rendimiento del modelo
        
        Returns:
            Diccionario con métricas de rendimiento
        """
        if self.model_info and 'performance' in self.model_info:
            return {
                "model_name": self.model_name,
                "performance_metrics": self.model_info['performance'],
                "training_date": self.model_info.get('training_date', 'Unknown')
            }
        else:
            return {"error": "Información de rendimiento no disponible"}

def create_sample_features() -> Dict:
    """
    Crear características de muestra para testing
    
    Returns:
        Diccionario con características de ejemplo
    """
    return {
        "duration": 1.5,
        "total_packets": 150,
        "total_bytes": 75000,
        "avg_packet_size": 500,
        "packet_rate": 100.0,
        "bytes_per_second": 50000.0,
        "inter_arrival_time": 0.01,
        "src_port": 12345,
        "dst_port": 80,
        "tcp_flags": 24,
        "hour": 14,
        "day_of_week": 2,
        "is_weekend": 0,
        "is_internal_traffic": 1,
        "is_external_source": 0,
        "is_well_known_port": 1,
        "is_ephemeral_port": 0,
        "is_tcp": 1,
        "is_udp": 0,
        "is_icmp": 0,
        "has_syn_flag": 1,
        "has_ack_flag": 1,
        "has_fin_flag": 0,
        "has_rst_flag": 0,
        "bytes_per_packet": 500.0,
        "packets_per_second": 100.0,
        "packet_rate_log": 4.605,
        "bytes_per_second_log": 10.820,
        "is_iot_device": 1
    }

if __name__ == "__main__":
    # Ejemplo de uso
    print("🔍 AEGIS AI - Sistema de Inferencia en Tiempo Real")
    print("=" * 50)
    
    try:
        # Inicializar detector
        detector = AEGISThreatDetector()
        
        # Crear muestra de ejemplo
        sample_features = create_sample_features()
        
        # Realizar predicción
        result = detector.predict_single(sample_features)
        
        print("\n📊 Resultado de predicción:")
        print(json.dumps(result, indent=2))
        
        # Obtener importancia de características
        importance = detector.get_feature_importance()
        if importance:
            print(f"\n🔝 Top 5 características más importantes:")
            for i, feature in enumerate(importance['top_5_features'], 1):
                print(f"   {i}. {feature}")
        
        # Obtener rendimiento del modelo
        performance = detector.get_model_performance()
        print(f"\n📈 Rendimiento del modelo:")
        if 'performance_metrics' in performance:
            metrics = performance['performance_metrics']
            print(f"   Accuracy: {metrics.get('accuracy', 'N/A'):.4f}")
            print(f"   F1 Score: {metrics.get('f1', 'N/A'):.4f}")
            print(f"   AUC-ROC: {metrics.get('auc', 'N/A'):.4f}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
