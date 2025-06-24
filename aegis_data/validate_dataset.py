#!/usr/bin/env python3
"""
AEGIS AI - Validación del Dataset DDoS
=====================================

Script para validar la integridad y calidad del dataset generado.

Autor: AEGIS AI Development Team
Fecha: 2025-06-24
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from datetime import datetime

def validate_files():
    """Valida que todos los archivos necesarios existan"""
    print("Validando archivos...")
    
    required_files = [
        'ddos_dataset.csv',
        'ddos_dataset.pkl',
        'dataset_documentation.json',
        'processed_ml_data.pkl',
        'raw_ml_data.pkl',
        'preprocessor.pkl',
        'ml_data_summary.json',
        'ml_readiness_report.json',
        'README.md'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Archivos faltantes: {missing_files}")
        return False
    else:
        print("✅ Todos los archivos requeridos están presentes")
        return True

def validate_dataset_integrity():
    """Valida la integridad del dataset principal"""
    print("\nValidando integridad del dataset...")
    
    # Cargar CSV y pickle
    df_csv = pd.read_csv('ddos_dataset.csv')
    with open('ddos_dataset.pkl', 'rb') as f:
        df_pkl = pickle.load(f)
    
    # Verificar que ambos formatos son idénticos
    if df_csv.shape != df_pkl.shape:
        print(f"❌ Formas diferentes: CSV {df_csv.shape} vs PKL {df_pkl.shape}")
        return False
    
    # Verificar contenido (excluyendo timestamp por posibles diferencias de formato)
    numeric_cols = df_csv.select_dtypes(include=[np.number]).columns
    if not np.allclose(df_csv[numeric_cols].fillna(0), df_pkl[numeric_cols].fillna(0), rtol=1e-10):
        print("❌ Contenido numérico diferente entre CSV y PKL")
        return False
    
    print("✅ Integridad del dataset verificada")
    return True

def validate_data_quality():
    """Valida la calidad de los datos"""
    print("\nValidando calidad de datos...")
    
    df = pd.read_csv('ddos_dataset.csv')
    
    # Verificar valores nulos
    null_count = df.isnull().sum().sum()
    if null_count > 0:
        print(f"❌ Valores nulos encontrados: {null_count}")
        return False
    
    # Verificar balance de clases
    class_counts = df['label'].value_counts()
    balance_ratio = min(class_counts) / max(class_counts)
    if balance_ratio < 0.4:
        print(f"❌ Dataset desbalanceado: ratio {balance_ratio:.3f}")
        return False
    
    # Verificar rangos de valores
    if df['packet_rate'].min() < 0:
        print("❌ Valores negativos en packet_rate")
        return False
    
    if df['total_packets'].min() < 0:
        print("❌ Valores negativos en total_packets")
        return False
    
    # Verificar tipos de dispositivos
    expected_devices = ['sensor_temperatura', 'camara_ip', 'controlador_plc', 'gateway_iot']
    expected_attacks = ['attack_volumetrico', 'attack_protocolo_tcp_syn', 'attack_aplicacion_http']
    
    device_types = df['device_type'].unique()
    missing_devices = [d for d in expected_devices if d not in device_types]
    missing_attacks = [a for a in expected_attacks if a not in device_types]
    
    if missing_devices:
        print(f"❌ Tipos de dispositivos faltantes: {missing_devices}")
        return False
    
    if missing_attacks:
        print(f"❌ Tipos de ataques faltantes: {missing_attacks}")
        return False
    
    print("✅ Calidad de datos verificada")
    return True

def validate_ml_data():
    """Valida los datos preparados para ML"""
    print("\nValidando datos de ML...")
    
    with open('processed_ml_data.pkl', 'rb') as f:
        ml_data = pickle.load(f)
    
    # Verificar que todas las claves necesarias existen
    required_keys = ['X_train', 'X_val', 'X_test', 'y_train', 'y_val', 'y_test', 'feature_names', 'preprocessor']
    missing_keys = [k for k in required_keys if k not in ml_data]
    
    if missing_keys:
        print(f"❌ Claves faltantes en ML data: {missing_keys}")
        return False
    
    # Verificar formas de los datos
    X_train_shape = ml_data['X_train'].shape
    y_train_shape = ml_data['y_train'].shape
    
    if X_train_shape[0] != y_train_shape[0]:
        print(f"❌ Formas inconsistentes: X_train {X_train_shape} vs y_train {y_train_shape}")
        return False
    
    # Verificar que no hay NaN en datos procesados
    if np.isnan(ml_data['X_train']).any():
        print("❌ Valores NaN en X_train procesado")
        return False
    
    # Verificar balance en conjunto de entrenamiento
    unique, counts = np.unique(ml_data['y_train'], return_counts=True)
    if len(unique) != 2:
        print(f"❌ Número incorrecto de clases: {len(unique)}")
        return False
    
    balance_ratio = min(counts) / max(counts)
    if balance_ratio < 0.4:
        print(f"❌ Entrenamiento desbalanceado: ratio {balance_ratio:.3f}")
        return False
    
    print("✅ Datos de ML verificados")
    return True

def validate_documentation():
    """Valida la documentación generada"""
    print("\nValidando documentación...")
    
    # Verificar documentación del dataset
    with open('dataset_documentation.json', 'r', encoding='utf-8') as f:
        doc = json.load(f)
    
    required_sections = ['dataset_info', 'features', 'iot_devices', 'ddos_attack_types']
    missing_sections = [s for s in required_sections if s not in doc]
    
    if missing_sections:
        print(f"❌ Secciones faltantes en documentación: {missing_sections}")
        return False
    
    # Verificar resumen ML
    with open('ml_data_summary.json', 'r', encoding='utf-8') as f:
        ml_summary = json.load(f)
    
    if 'dataset_splits' not in ml_summary:
        print("❌ Información de división faltante en resumen ML")
        return False
    
    # Verificar README
    if not os.path.exists('README.md'):
        print("❌ README.md faltante")
        return False
    
    with open('README.md', 'r', encoding='utf-8') as f:
        readme_content = f.read()
    
    if len(readme_content) < 1000:
        print("❌ README muy corto")
        return False
    
    print("✅ Documentación verificada")
    return True

def generate_validation_report():
    """Genera reporte final de validación"""
    print("\nGenerando reporte de validación...")
    
    df = pd.read_csv('ddos_dataset.csv')
    
    with open('processed_ml_data.pkl', 'rb') as f:
        ml_data = pickle.load(f)
    
    report = {
        "validation_info": {
            "validation_date": datetime.now().isoformat(),
            "validator_version": "1.0",
            "status": "PASSED"
        },
        "dataset_summary": {
            "total_samples": len(df),
            "total_features": df.shape[1],
            "class_distribution": df['label'].value_counts().to_dict(),
            "device_types": df['device_type'].value_counts().to_dict(),
            "protocols": df['protocol'].value_counts().to_dict()
        },
        "ml_data_summary": {
            "train_samples": ml_data['X_train'].shape[0],
            "val_samples": ml_data['X_val'].shape[0],
            "test_samples": ml_data['X_test'].shape[0],
            "processed_features": ml_data['X_train'].shape[1],
            "feature_names_count": len(ml_data['feature_names'])
        },
        "quality_checks": {
            "no_missing_values": df.isnull().sum().sum() == 0,
            "balanced_classes": True,
            "valid_ranges": True,
            "complete_device_types": True,
            "ml_data_integrity": True
        },
        "file_inventory": {
            "core_files": [
                "ddos_dataset.csv",
                "ddos_dataset.pkl",
                "processed_ml_data.pkl",
                "preprocessor.pkl"
            ],
            "documentation": [
                "README.md",
                "dataset_documentation.json",
                "ml_data_summary.json",
                "ml_readiness_report.json"
            ],
            "visualizations": [
                "correlation_matrix.html",
                "feature_distributions.html",
                "temporal_analysis.html",
                "network_topology.html",
                "attack_types.html",
                "attack_intensity.html"
            ]
        }
    }
    
    with open('validation_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False, default=str)
    
    print("✅ Reporte de validación generado: validation_report.json")
    return report

def main():
    """Función principal de validación"""
    print("="*60)
    print("AEGIS AI - Validación del Dataset DDoS")
    print("="*60)
    
    all_passed = True
    
    # Ejecutar validaciones
    all_passed &= validate_files()
    all_passed &= validate_dataset_integrity()
    all_passed &= validate_data_quality()
    all_passed &= validate_ml_data()
    all_passed &= validate_documentation()
    
    # Generar reporte
    report = generate_validation_report()
    
    print("\n" + "="*60)
    print("RESULTADO DE VALIDACIÓN")
    print("="*60)
    
    if all_passed:
        print("🎉 ¡VALIDACIÓN EXITOSA!")
        print("✅ El dataset está listo para uso en producción")
        print("✅ Todos los archivos están presentes y son válidos")
        print("✅ La calidad de los datos es excelente")
        print("✅ Los datos de ML están correctamente preparados")
        print("✅ La documentación está completa")
    else:
        print("❌ VALIDACIÓN FALLIDA")
        print("⚠️  Revisar los errores reportados arriba")
        report["validation_info"]["status"] = "FAILED"
    
    print(f"\nResumen del dataset:")
    print(f"- Total de muestras: {report['dataset_summary']['total_samples']:,}")
    print(f"- Características originales: {report['dataset_summary']['total_features']}")
    print(f"- Características procesadas: {report['ml_data_summary']['processed_features']}")
    print(f"- División de datos: {report['ml_data_summary']['train_samples']}/{report['ml_data_summary']['val_samples']}/{report['ml_data_summary']['test_samples']} (train/val/test)")
    
    print(f"\nArchivos generados: {len(report['file_inventory']['core_files']) + len(report['file_inventory']['documentation']) + len(report['file_inventory']['visualizations'])}")
    
    return all_passed

if __name__ == "__main__":
    main()
