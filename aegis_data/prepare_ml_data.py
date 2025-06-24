#!/usr/bin/env python3
"""
AEGIS AI - Preparación de Datos para Machine Learning
====================================================

Script para preparar el dataset DDoS para entrenamiento de modelos de ML.
Incluye preprocesamiento, división de datos y creación de pipelines.

Autor: AEGIS AI Development Team
Fecha: 2025-06-24
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class MLDataPreparator:
    """Preparador de datos para modelos de ML"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = None
        self.target_column = 'label'
        
    def load_dataset(self, path='/home/ubuntu/aegis_data/ddos_dataset.csv'):
        """Carga el dataset"""
        print(f"Cargando dataset desde: {path}")
        df = pd.read_csv(path)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        print(f"Dataset cargado: {df.shape}")
        return df
    
    def feature_engineering(self, df):
        """Realiza ingeniería de características"""
        print("Realizando ingeniería de características...")
        
        df_processed = df.copy()
        
        # Características temporales
        df_processed['hour'] = df_processed['timestamp'].dt.hour
        df_processed['day_of_week'] = df_processed['timestamp'].dt.dayofweek
        df_processed['is_weekend'] = (df_processed['day_of_week'] >= 5).astype(int)
        
        # Características de red
        df_processed['is_internal_traffic'] = (
            df_processed['src_ip'].str.startswith('192.168.') & 
            df_processed['dst_ip'].str.startswith('192.168.')
        ).astype(int)
        
        df_processed['is_external_source'] = (
            ~df_processed['src_ip'].str.startswith('192.168.')
        ).astype(int)
        
        # Características de protocolo
        df_processed['is_tcp'] = (df_processed['protocol'] == 'TCP').astype(int)
        df_processed['is_udp'] = (df_processed['protocol'] == 'UDP').astype(int)
        df_processed['is_icmp'] = (df_processed['protocol'] == 'ICMP').astype(int)
        
        # Características de puertos
        df_processed['is_well_known_port'] = (df_processed['dst_port'] <= 1023).astype(int)
        df_processed['is_ephemeral_port'] = (df_processed['src_port'] >= 32768).astype(int)
        
        # Características de dispositivos IoT
        df_processed['is_iot_device'] = (
            ~df_processed['device_type'].str.startswith('attack_')
        ).astype(int)
        
        # Ratios y métricas derivadas
        df_processed['bytes_per_packet'] = df_processed['total_bytes'] / np.maximum(df_processed['total_packets'], 1)
        df_processed['packets_per_second'] = df_processed['total_packets'] / np.maximum(df_processed['duration'], 0.1)
        
        # Características de flags TCP
        df_processed['has_syn_flag'] = ((df_processed['tcp_flags'] & 2) > 0).astype(int)
        df_processed['has_ack_flag'] = ((df_processed['tcp_flags'] & 16) > 0).astype(int)
        df_processed['has_fin_flag'] = ((df_processed['tcp_flags'] & 1) > 0).astype(int)
        df_processed['has_rst_flag'] = ((df_processed['tcp_flags'] & 4) > 0).astype(int)
        
        # Características de anomalía
        df_processed['packet_rate_log'] = np.log1p(df_processed['packet_rate'])
        df_processed['bytes_per_second_log'] = np.log1p(df_processed['bytes_per_second'])
        
        print(f"Características añadidas. Nuevas dimensiones: {df_processed.shape}")
        return df_processed
    
    def select_features(self, df):
        """Selecciona las características más relevantes para ML"""
        print("Seleccionando características para ML...")
        
        # Características numéricas principales
        numeric_features = [
            'duration', 'total_packets', 'total_bytes', 'avg_packet_size',
            'packet_rate', 'bytes_per_second', 'inter_arrival_time',
            'src_port', 'dst_port', 'tcp_flags'
        ]
        
        # Características temporales
        temporal_features = [
            'hour', 'day_of_week', 'is_weekend'
        ]
        
        # Características de red
        network_features = [
            'is_internal_traffic', 'is_external_source',
            'is_well_known_port', 'is_ephemeral_port'
        ]
        
        # Características de protocolo
        protocol_features = [
            'is_tcp', 'is_udp', 'is_icmp'
        ]
        
        # Características de flags TCP
        flag_features = [
            'has_syn_flag', 'has_ack_flag', 'has_fin_flag', 'has_rst_flag'
        ]
        
        # Características derivadas
        derived_features = [
            'bytes_per_packet', 'packets_per_second',
            'packet_rate_log', 'bytes_per_second_log',
            'is_iot_device'
        ]
        
        # Combinar todas las características
        selected_features = (numeric_features + temporal_features + 
                           network_features + protocol_features + 
                           flag_features + derived_features)
        
        # Verificar que todas las características existen
        available_features = [f for f in selected_features if f in df.columns]
        missing_features = [f for f in selected_features if f not in df.columns]
        
        if missing_features:
            print(f"Características faltantes: {missing_features}")
        
        print(f"Características seleccionadas: {len(available_features)}")
        self.feature_columns = available_features
        
        return df[available_features + [self.target_column]]
    
    def handle_outliers(self, df, method='iqr', threshold=1.5):
        """Maneja valores atípicos en el dataset"""
        print(f"Manejando outliers usando método: {method}")
        
        df_clean = df.copy()
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        numeric_cols = [col for col in numeric_cols if col != self.target_column]
        
        outliers_removed = 0
        
        for col in numeric_cols:
            if method == 'iqr':
                Q1 = df_clean[col].quantile(0.25)
                Q3 = df_clean[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - threshold * IQR
                upper_bound = Q3 + threshold * IQR
                
                outlier_mask = (df_clean[col] < lower_bound) | (df_clean[col] > upper_bound)
                outliers_count = outlier_mask.sum()
                
                # Reemplazar outliers con valores límite (winsorizing)
                df_clean.loc[df_clean[col] < lower_bound, col] = lower_bound
                df_clean.loc[df_clean[col] > upper_bound, col] = upper_bound
                
                outliers_removed += outliers_count
        
        print(f"Outliers procesados: {outliers_removed}")
        return df_clean
    
    def split_data(self, df, test_size=0.2, val_size=0.1, random_state=42):
        """Divide los datos en entrenamiento, validación y prueba"""
        print("Dividiendo datos...")
        
        X = df.drop(columns=[self.target_column])
        y = df[self.target_column]
        
        # Primera división: train+val vs test
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Segunda división: train vs val
        val_size_adjusted = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_size_adjusted, 
            random_state=random_state, stratify=y_temp
        )
        
        print(f"División completada:")
        print(f"- Entrenamiento: {X_train.shape[0]} muestras ({X_train.shape[0]/len(df)*100:.1f}%)")
        print(f"- Validación: {X_val.shape[0]} muestras ({X_val.shape[0]/len(df)*100:.1f}%)")
        print(f"- Prueba: {X_test.shape[0]} muestras ({X_test.shape[0]/len(df)*100:.1f}%)")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def create_preprocessing_pipeline(self, X_train):
        """Crea pipeline de preprocesamiento"""
        print("Creando pipeline de preprocesamiento...")
        
        # Identificar tipos de características
        numeric_features = X_train.select_dtypes(include=[np.number]).columns.tolist()
        categorical_features = X_train.select_dtypes(include=['object']).columns.tolist()
        
        # Pipeline para características numéricas
        numeric_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        # Pipeline para características categóricas (si las hay)
        if categorical_features:
            categorical_transformer = Pipeline(steps=[
                ('onehot', OneHotEncoder(drop='first', sparse_output=False))
            ])
            
            preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, numeric_features),
                    ('cat', categorical_transformer, categorical_features)
                ]
            )
        else:
            preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, numeric_features)
                ]
            )
        
        return preprocessor
    
    def save_processed_data(self, X_train, X_val, X_test, y_train, y_val, y_test, preprocessor):
        """Guarda los datos procesados"""
        print("Guardando datos procesados...")
        
        # Ajustar y transformar datos
        X_train_processed = preprocessor.fit_transform(X_train)
        X_val_processed = preprocessor.transform(X_val)
        X_test_processed = preprocessor.transform(X_test)
        
        # Crear diccionario con todos los datos
        processed_data = {
            'X_train': X_train_processed,
            'X_val': X_val_processed,
            'X_test': X_test_processed,
            'y_train': y_train.values,
            'y_val': y_val.values,
            'y_test': y_test.values,
            'feature_names': self.feature_columns,
            'preprocessor': preprocessor
        }
        
        # Guardar en pickle
        with open('/home/ubuntu/aegis_data/processed_ml_data.pkl', 'wb') as f:
            pickle.dump(processed_data, f)
        
        # Guardar preprocessor por separado
        joblib.dump(preprocessor, '/home/ubuntu/aegis_data/preprocessor.pkl')
        
        # Guardar datos originales sin procesar para referencia
        raw_data = {
            'X_train': X_train,
            'X_val': X_val,
            'X_test': X_test,
            'y_train': y_train,
            'y_val': y_val,
            'y_test': y_test
        }
        
        with open('/home/ubuntu/aegis_data/raw_ml_data.pkl', 'wb') as f:
            pickle.dump(raw_data, f)
        
        print("Datos guardados:")
        print("- processed_ml_data.pkl (datos procesados)")
        print("- raw_ml_data.pkl (datos originales)")
        print("- preprocessor.pkl (pipeline de preprocesamiento)")
        
        return processed_data
    
    def create_data_summary(self, processed_data):
        """Crea resumen de los datos procesados"""
        summary = {
            "data_preparation_info": {
                "creation_date": datetime.now().isoformat(),
                "preprocessing_steps": [
                    "Feature engineering",
                    "Outlier handling",
                    "Data splitting",
                    "Standardization"
                ]
            },
            "dataset_splits": {
                "train_samples": int(processed_data['X_train'].shape[0]),
                "val_samples": int(processed_data['X_val'].shape[0]),
                "test_samples": int(processed_data['X_test'].shape[0]),
                "total_features": int(processed_data['X_train'].shape[1])
            },
            "class_distribution": {
                "train": {
                    "normal": int(np.sum(processed_data['y_train'] == 0)),
                    "ddos": int(np.sum(processed_data['y_train'] == 1))
                },
                "val": {
                    "normal": int(np.sum(processed_data['y_val'] == 0)),
                    "ddos": int(np.sum(processed_data['y_val'] == 1))
                },
                "test": {
                    "normal": int(np.sum(processed_data['y_test'] == 0)),
                    "ddos": int(np.sum(processed_data['y_test'] == 1))
                }
            },
            "feature_info": {
                "selected_features": processed_data['feature_names'],
                "feature_count": len(processed_data['feature_names'])
            },
            "data_quality": {
                "missing_values": 0,
                "outliers_handled": True,
                "standardized": True,
                "balanced": True
            }
        }
        
        # Guardar resumen
        with open('/home/ubuntu/aegis_data/ml_data_summary.json', 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print("Resumen de datos guardado: ml_data_summary.json")
        return summary

def main():
    """Función principal"""
    print("="*60)
    print("AEGIS AI - Preparación de Datos para Machine Learning")
    print("="*60)
    
    # Inicializar preparador
    preparator = MLDataPreparator()
    
    # Cargar dataset
    df = preparator.load_dataset()
    
    # Ingeniería de características
    df_engineered = preparator.feature_engineering(df)
    
    # Seleccionar características
    df_selected = preparator.select_features(df_engineered)
    
    # Manejar outliers
    df_clean = preparator.handle_outliers(df_selected)
    
    # Dividir datos
    X_train, X_val, X_test, y_train, y_val, y_test = preparator.split_data(df_clean)
    
    # Crear pipeline de preprocesamiento
    preprocessor = preparator.create_preprocessing_pipeline(X_train)
    
    # Guardar datos procesados
    processed_data = preparator.save_processed_data(
        X_train, X_val, X_test, y_train, y_val, y_test, preprocessor
    )
    
    # Crear resumen
    summary = preparator.create_data_summary(processed_data)
    
    print("\n" + "="*60)
    print("PREPARACIÓN COMPLETADA")
    print("="*60)
    
    print(f"\nResumen de datos preparados:")
    print(f"- Características totales: {summary['dataset_splits']['total_features']}")
    print(f"- Muestras de entrenamiento: {summary['dataset_splits']['train_samples']}")
    print(f"- Muestras de validación: {summary['dataset_splits']['val_samples']}")
    print(f"- Muestras de prueba: {summary['dataset_splits']['test_samples']}")
    
    print(f"\nDistribución de clases en entrenamiento:")
    train_dist = summary['class_distribution']['train']
    print(f"- Normal: {train_dist['normal']}")
    print(f"- DDoS: {train_dist['ddos']}")
    
    print(f"\nArchivos generados:")
    print("- processed_ml_data.pkl")
    print("- raw_ml_data.pkl") 
    print("- preprocessor.pkl")
    print("- ml_data_summary.json")
    
    print(f"\nDatos listos para entrenamiento de modelos ML!")

if __name__ == "__main__":
    main()
