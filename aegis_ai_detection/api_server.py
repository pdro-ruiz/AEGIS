#!/usr/bin/env python3
"""
AEGIS AI - API Server para Integración con Dashboard
Servidor FastAPI para detección de amenazas en tiempo real
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import json
from datetime import datetime

from inference import AEGISThreatDetector

# Inicializar FastAPI
app = FastAPI(
    title="AEGIS AI Detection API",
    description="API para detección de amenazas DDoS en tiempo real",
    version="1.0.0"
)

# Configurar CORS para permitir conexiones desde el dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar detector
try:
    detector = AEGISThreatDetector()
    print("✅ Detector AEGIS AI inicializado correctamente")
except Exception as e:
    print(f"❌ Error inicializando detector: {e}")
    detector = None

# Modelos Pydantic para validación
class NetworkFeatures(BaseModel):
    duration: float
    total_packets: int
    total_bytes: int
    avg_packet_size: float
    packet_rate: float
    bytes_per_second: float
    inter_arrival_time: float
    src_port: int
    dst_port: int
    tcp_flags: int
    hour: int
    day_of_week: int
    is_weekend: int
    is_internal_traffic: int
    is_external_source: int
    is_well_known_port: int
    is_ephemeral_port: int
    is_tcp: int
    is_udp: int
    is_icmp: int
    has_syn_flag: int
    has_ack_flag: int
    has_fin_flag: int
    has_rst_flag: int
    bytes_per_packet: float
    packets_per_second: float
    packet_rate_log: float
    bytes_per_second_log: float
    is_iot_device: int

class BatchFeatures(BaseModel):
    samples: List[NetworkFeatures]

# Endpoints de la API

@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "message": "AEGIS AI Detection API",
        "version": "1.0.0",
        "status": "active" if detector else "error",
        "endpoints": {
            "/detect": "POST - Detectar amenaza en una muestra",
            "/detect/batch": "POST - Detectar amenazas en múltiples muestras",
            "/model/info": "GET - Información del modelo",
            "/model/performance": "GET - Métricas de rendimiento",
            "/model/importance": "GET - Importancia de características",
            "/health": "GET - Estado de salud del servicio"
        }
    }

@app.get("/health")
async def health_check():
    """Verificar estado de salud del servicio"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": True,
        "model_name": detector.model_name
    }

@app.post("/detect")
async def detect_threat(features: NetworkFeatures):
    """Detectar amenaza en una sola muestra"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    try:
        # Convertir a diccionario
        features_dict = features.dict()
        
        # Realizar predicción
        result = detector.predict_single(features_dict)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en detección: {str(e)}")

@app.post("/detect/batch")
async def detect_threats_batch(batch: BatchFeatures):
    """Detectar amenazas en múltiples muestras"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    try:
        # Convertir a lista de diccionarios
        features_list = [sample.dict() for sample in batch.samples]
        
        # Realizar predicciones
        results = detector.predict_batch(features_list)
        
        return {
            "total_samples": len(results),
            "results": results,
            "summary": {
                "threats_detected": sum(1 for r in results if r.get("prediction", {}).get("is_ddos", False)),
                "high_risk": sum(1 for r in results if r.get("prediction", {}).get("threat_score", 0) >= 61),
                "critical_risk": sum(1 for r in results if r.get("prediction", {}).get("threat_score", 0) >= 81)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en detección batch: {str(e)}")

@app.get("/model/info")
async def get_model_info():
    """Obtener información del modelo"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    return {
        "model_name": detector.model_name,
        "feature_count": len(detector.feature_names),
        "feature_names": detector.feature_names,
        "model_info": detector.model_info
    }

@app.get("/model/performance")
async def get_model_performance():
    """Obtener métricas de rendimiento del modelo"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    return detector.get_model_performance()

@app.get("/model/importance")
async def get_feature_importance():
    """Obtener importancia de características"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    importance = detector.get_feature_importance()
    if importance is None:
        raise HTTPException(status_code=404, detail="Importancia de características no disponible")
    
    return importance

@app.post("/simulate/normal")
async def simulate_normal_traffic():
    """Simular tráfico normal para testing"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    # Características de tráfico normal
    normal_features = {
        "duration": 2.1,
        "total_packets": 45,
        "total_bytes": 22500,
        "avg_packet_size": 500,
        "packet_rate": 21.4,
        "bytes_per_second": 10714.3,
        "inter_arrival_time": 0.047,
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
        "packets_per_second": 21.4,
        "packet_rate_log": 3.064,
        "bytes_per_second_log": 9.279,
        "is_iot_device": 1
    }
    
    result = detector.predict_single(normal_features)
    result["simulation_type"] = "normal_traffic"
    return result

@app.post("/simulate/ddos")
async def simulate_ddos_attack():
    """Simular ataque DDoS para testing"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector no disponible")
    
    # Características de ataque DDoS
    ddos_features = {
        "duration": 0.1,
        "total_packets": 1500,
        "total_bytes": 150000,
        "avg_packet_size": 100,
        "packet_rate": 15000.0,
        "bytes_per_second": 1500000.0,
        "inter_arrival_time": 0.00007,
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
        "packets_per_second": 15000.0,
        "packet_rate_log": 9.616,
        "bytes_per_second_log": 14.221,
        "is_iot_device": 0
    }
    
    result = detector.predict_single(ddos_features)
    result["simulation_type"] = "ddos_attack"
    return result

if __name__ == "__main__":
    print("🚀 Iniciando AEGIS AI Detection API Server...")
    print("📡 API disponible en: http://localhost:8000")
    print("📚 Documentación en: http://localhost:8000/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
