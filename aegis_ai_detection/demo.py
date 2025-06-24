#!/usr/bin/env python3
"""
AEGIS AI - Script de Demostración
Demostración completa de las capacidades del sistema de detección
"""

import json
import numpy as np
import pandas as pd
from inference import AEGISThreatDetector, create_sample_features
from datetime import datetime
import time

def print_header(title):
    """Imprimir encabezado formateado"""
    print("\n" + "=" * 60)
    print(f"🔹 {title}")
    print("=" * 60)

def print_threat_result(result, sample_name=""):
    """Imprimir resultado de amenaza formateado"""
    if "error" in result:
        print(f"❌ Error: {result['error']}")
        return
    
    pred = result["prediction"]
    threat_emoji = {
        "BAJO": "🟢",
        "MEDIO": "🟡", 
        "ALTO": "🟠",
        "CRÍTICO": "🔴"
    }
    
    status_emoji = "🚨" if pred["is_ddos"] else "✅"
    level_emoji = threat_emoji.get(pred["threat_level"], "⚪")
    
    print(f"\n{sample_name}")
    print(f"{status_emoji} Estado: {'AMENAZA DETECTADA' if pred['is_ddos'] else 'TRÁFICO NORMAL'}")
    print(f"{level_emoji} Nivel de Amenaza: {pred['threat_level']} (Score: {pred['threat_score']}/100)")
    print(f"📊 Probabilidad: {pred['probability']:.3f}")
    print(f"🤖 Modelo: {result['model_info']['model_name']}")
    print(f"⏰ Timestamp: {result['timestamp']}")

def demo_single_predictions():
    """Demostrar predicciones individuales"""
    print_header("DEMOSTRACIÓN DE PREDICCIONES INDIVIDUALES")
    
    detector = AEGISThreatDetector()
    
    # Caso 1: Tráfico normal
    print("\n🔍 Analizando tráfico normal...")
    normal_features = {
        "duration": 2.5,
        "total_packets": 50,
        "total_bytes": 25000,
        "avg_packet_size": 500,
        "packet_rate": 20.0,
        "bytes_per_second": 10000.0,
        "inter_arrival_time": 0.05,
        "src_port": 443,
        "dst_port": 12345,
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
        "packets_per_second": 20.0,
        "packet_rate_log": 2.996,
        "bytes_per_second_log": 9.210,
        "is_iot_device": 1
    }
    
    result = detector.predict_single(normal_features)
    print_threat_result(result, "📈 Muestra 1: Tráfico HTTP Normal")
    
    # Caso 2: Posible ataque DDoS
    print("\n🔍 Analizando posible ataque DDoS...")
    ddos_features = {
        "duration": 0.1,
        "total_packets": 2000,
        "total_bytes": 200000,
        "avg_packet_size": 100,
        "packet_rate": 20000.0,
        "bytes_per_second": 2000000.0,
        "inter_arrival_time": 0.00005,
        "src_port": 80,
        "dst_port": 80,
        "tcp_flags": 2,
        "hour": 3,
        "day_of_week": 1,
        "is_weekend": 0,
        "is_internal_traffic": 0,
        "is_external_source": 1,
        "is_well_known_port": 1,
        "is_ephemeral_port": 0,
        "is_tcp": 1,
        "is_udp": 0,
        "is_icmp": 0,
        "has_syn_flag": 1,
        "has_ack_flag": 0,
        "has_fin_flag": 0,
        "has_rst_flag": 0,
        "bytes_per_packet": 100.0,
        "packets_per_second": 20000.0,
        "packet_rate_log": 9.903,
        "bytes_per_second_log": 14.509,
        "is_iot_device": 0
    }
    
    result = detector.predict_single(ddos_features)
    print_threat_result(result, "🚨 Muestra 2: Tráfico Sospechoso de DDoS")
    
    # Caso 3: Tráfico IoT normal
    print("\n🔍 Analizando tráfico IoT...")
    iot_features = {
        "duration": 5.0,
        "total_packets": 10,
        "total_bytes": 1000,
        "avg_packet_size": 100,
        "packet_rate": 2.0,
        "bytes_per_second": 200.0,
        "inter_arrival_time": 0.5,
        "src_port": 1883,
        "dst_port": 1883,
        "tcp_flags": 24,
        "hour": 10,
        "day_of_week": 3,
        "is_weekend": 0,
        "is_internal_traffic": 1,
        "is_external_source": 0,
        "is_well_known_port": 0,
        "is_ephemeral_port": 0,
        "is_tcp": 1,
        "is_udp": 0,
        "is_icmp": 0,
        "has_syn_flag": 1,
        "has_ack_flag": 1,
        "has_fin_flag": 0,
        "has_rst_flag": 0,
        "bytes_per_packet": 100.0,
        "packets_per_second": 2.0,
        "packet_rate_log": 0.693,
        "bytes_per_second_log": 5.298,
        "is_iot_device": 1
    }
    
    result = detector.predict_single(iot_features)
    print_threat_result(result, "🌐 Muestra 3: Tráfico MQTT IoT")

def demo_batch_predictions():
    """Demostrar predicciones en lote"""
    print_header("DEMOSTRACIÓN DE PREDICCIONES EN LOTE")
    
    detector = AEGISThreatDetector()
    
    # Crear lote mixto de muestras
    batch_samples = []
    
    # Agregar 3 muestras normales
    for i in range(3):
        normal = create_sample_features()
        normal["packet_rate"] = np.random.uniform(10, 50)
        normal["bytes_per_second"] = np.random.uniform(5000, 25000)
        batch_samples.append(normal)
    
    # Agregar 2 muestras de ataque
    for i in range(2):
        attack = create_sample_features()
        attack["packet_rate"] = np.random.uniform(5000, 20000)
        attack["bytes_per_second"] = np.random.uniform(500000, 2000000)
        attack["inter_arrival_time"] = np.random.uniform(0.00001, 0.0001)
        attack["is_external_source"] = 1
        attack["is_internal_traffic"] = 0
        batch_samples.append(attack)
    
    print(f"🔍 Analizando lote de {len(batch_samples)} muestras...")
    
    results = detector.predict_batch(batch_samples)
    
    # Estadísticas del lote
    threats_detected = sum(1 for r in results if r["prediction"]["is_ddos"])
    high_risk = sum(1 for r in results if r["prediction"]["threat_score"] >= 61)
    critical_risk = sum(1 for r in results if r["prediction"]["threat_score"] >= 81)
    
    print(f"\n📊 RESUMEN DEL LOTE:")
    print(f"   Total de muestras: {len(results)}")
    print(f"   🚨 Amenazas detectadas: {threats_detected}")
    print(f"   🟠 Riesgo alto: {high_risk}")
    print(f"   🔴 Riesgo crítico: {critical_risk}")
    
    # Mostrar resultados individuales
    for i, result in enumerate(results, 1):
        print_threat_result(result, f"📋 Muestra {i}")

def demo_model_analysis():
    """Demostrar análisis del modelo"""
    print_header("ANÁLISIS DEL MODELO")
    
    detector = AEGISThreatDetector()
    
    # Información del modelo
    print("🤖 INFORMACIÓN DEL MODELO:")
    print(f"   Nombre: {detector.model_name}")
    print(f"   Características: {len(detector.feature_names)}")
    
    # Rendimiento
    performance = detector.get_model_performance()
    if "performance_metrics" in performance:
        metrics = performance["performance_metrics"]
        print(f"\n📈 MÉTRICAS DE RENDIMIENTO:")
        print(f"   Accuracy: {metrics.get('accuracy', 'N/A'):.4f}")
        print(f"   Precision: {metrics.get('precision', 'N/A'):.4f}")
        print(f"   Recall: {metrics.get('recall', 'N/A'):.4f}")
        print(f"   F1 Score: {metrics.get('f1', 'N/A'):.4f}")
        print(f"   AUC-ROC: {metrics.get('auc', 'N/A'):.4f}")
    
    # Importancia de características
    importance = detector.get_feature_importance()
    if importance:
        print(f"\n🔝 TOP 10 CARACTERÍSTICAS MÁS IMPORTANTES:")
        top_features = list(importance['feature_importance'].items())[:10]
        for i, (feature, score) in enumerate(top_features, 1):
            print(f"   {i:2d}. {feature:<25} {score:.4f}")

def demo_threat_scoring():
    """Demostrar sistema de scoring de amenazas"""
    print_header("SISTEMA DE SCORING DE AMENAZAS")
    
    detector = AEGISThreatDetector()
    
    print("🎯 NIVELES DE AMENAZA:")
    print("   🟢 BAJO (0-30):     Tráfico normal, sin amenaza")
    print("   🟡 MEDIO (31-60):   Actividad sospechosa")
    print("   🟠 ALTO (61-80):    Probable amenaza")
    print("   🔴 CRÍTICO (81-100): Amenaza confirmada")
    
    # Ejemplos de diferentes niveles
    test_cases = [
        ("Tráfico web normal", 0.15),
        ("Actividad sospechosa", 0.45),
        ("Probable ataque", 0.75),
        ("Ataque confirmado", 0.95)
    ]
    
    print(f"\n📊 EJEMPLOS DE SCORING:")
    for description, probability in test_cases:
        threat_score = detector.calculate_threat_score(probability)
        threat_level = detector.interpret_threat_level(threat_score)
        level_emoji = {"BAJO": "🟢", "MEDIO": "🟡", "ALTO": "🟠", "CRÍTICO": "🔴"}
        
        print(f"   {level_emoji[threat_level]} {description:<20} Score: {threat_score:3d} | Nivel: {threat_level}")

def demo_real_time_simulation():
    """Simular detección en tiempo real"""
    print_header("SIMULACIÓN DE DETECCIÓN EN TIEMPO REAL")
    
    detector = AEGISThreatDetector()
    
    print("🔄 Simulando flujo de tráfico en tiempo real...")
    print("   (Presiona Ctrl+C para detener)")
    
    try:
        for i in range(10):  # Simular 10 muestras
            # Generar muestra aleatoria
            features = create_sample_features()
            
            # 30% probabilidad de ser ataque
            if np.random.random() < 0.3:
                # Modificar para parecer ataque
                features["packet_rate"] = np.random.uniform(1000, 10000)
                features["bytes_per_second"] = np.random.uniform(100000, 1000000)
                features["inter_arrival_time"] = np.random.uniform(0.0001, 0.001)
                features["is_external_source"] = 1
            
            # Realizar detección
            result = detector.predict_single(features)
            
            # Mostrar resultado
            timestamp = datetime.now().strftime("%H:%M:%S")
            pred = result["prediction"]
            status = "🚨 AMENAZA" if pred["is_ddos"] else "✅ NORMAL"
            
            print(f"[{timestamp}] {status} | Score: {pred['threat_score']:3d} | Nivel: {pred['threat_level']}")
            
            time.sleep(1)  # Esperar 1 segundo
            
    except KeyboardInterrupt:
        print("\n⏹️  Simulación detenida por el usuario")

def main():
    """Función principal de demostración"""
    print("🚀 AEGIS AI - DEMOSTRACIÓN COMPLETA DEL SISTEMA")
    print("Sistema de Detección de Anomalías DDoS para Redes IoT")
    print("=" * 60)
    
    try:
        # Ejecutar todas las demostraciones
        demo_single_predictions()
        demo_batch_predictions()
        demo_model_analysis()
        demo_threat_scoring()
        demo_real_time_simulation()
        
        print_header("DEMOSTRACIÓN COMPLETADA")
        print("✅ Todas las funcionalidades han sido demostradas exitosamente")
        print("📚 Para más información, consulta el README.md")
        print("🔗 Para integración con dashboard, usa api_server.py")
        
    except Exception as e:
        print(f"\n❌ Error durante la demostración: {e}")

if __name__ == "__main__":
    main()
