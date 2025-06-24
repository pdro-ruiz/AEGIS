
# AEGIS AI - Sistema de Detección de Anomalías DDoS

Sistema de ciberseguridad autónomo para detección de ataques DDoS en redes IoT industriales.

## 🎯 Descripción

AEGIS AI implementa múltiples algoritmos de machine learning para detectar ataques DDoS en tiempo real, proporcionando:

- **Detección Multi-Modelo**: Random Forest, XGBoost y Redes Neuronales
- **Sistema de Scoring**: Puntuación de amenazas de 0-100
- **Explicabilidad**: Análisis SHAP y feature importance
- **Inferencia en Tiempo Real**: API lista para integración con dashboard

## 📊 Características del Dataset

- **10,000 muestras** balanceadas (50% normal, 50% DDoS)
- **29 características** de tráfico de red y protocolos IoT
- **División**: 70% entrenamiento, 10% validación, 20% prueba
- **Preprocesamiento**: Normalización, manejo de outliers, ingeniería de características

### Características Principales:
- Métricas de tráfico: duración, paquetes, bytes, tasas
- Información de puertos y protocolos
- Características temporales (hora, día de semana)
- Flags TCP y características de red
- Indicadores específicos de dispositivos IoT

## 🚀 Instalación y Uso

### 1. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 2. Entrenar Modelos
```bash
python train_models.py
```

### 3. Usar Inferencia
```python
from inference import AEGISThreatDetector

# Inicializar detector
detector = AEGISThreatDetector()

# Características de ejemplo
features = {
    "duration": 1.5,
    "total_packets": 150,
    "total_bytes": 75000,
    # ... más características
}

# Realizar predicción
result = detector.predict_single(features)
print(f"Threat Score: {result['prediction']['threat_score']}")
print(f"Threat Level: {result['prediction']['threat_level']}")
```

## 📈 Resultados del Entrenamiento

Después del entrenamiento, encontrarás:

- `models/best_model.pkl`: Mejor modelo entrenado
- `metrics.json`: Métricas de todos los modelos
- `plots/`: Gráficos de análisis y visualizaciones
- `reports/`: Reportes detallados de rendimiento

## 🎯 Sistema de Scoring de Amenazas

| Score | Nivel | Descripción |
|-------|-------|-------------|
| 0-30  | BAJO  | Tráfico normal, sin amenaza detectada |
| 31-60 | MEDIO | Actividad sospechosa, monitoreo requerido |
| 61-80 | ALTO  | Probable amenaza, acción recomendada |
| 81-100| CRÍTICO| Amenaza confirmada, respuesta inmediata |

## 🔧 Integración con Dashboard

### API de Inferencia
```python
# Para una sola muestra
result = detector.predict_single(features_dict)

# Para múltiples muestras
results = detector.predict_batch(features_list)

# Obtener importancia de características
importance = detector.get_feature_importance()
```

### Formato de Respuesta
```json
{
  "timestamp": "2025-06-24T10:30:00",
  "prediction": {
    "is_ddos": true,
    "probability": 0.85,
    "threat_score": 85,
    "threat_level": "CRÍTICO"
  },
  "model_info": {
    "model_name": "XGBoost",
    "confidence": 0.85
  }
}
```

## 📊 Métricas de Evaluación

El sistema evalúa modelos usando:

- **Accuracy**: Precisión general
- **Precision**: Precisión en detección de DDoS
- **Recall**: Sensibilidad para detectar ataques
- **F1-Score**: Media armónica de precision y recall
- **AUC-ROC**: Área bajo la curva ROC
- **Cross-Validation**: Validación cruzada de 5 folds

## 🔍 Explicabilidad del Modelo

### Feature Importance
- Ranking de características más importantes
- Visualizaciones de contribución por característica

### Análisis SHAP
- Valores SHAP para explicar predicciones individuales
- Summary plots para entender el comportamiento del modelo
- Interpretación de decisiones del modelo

## 🛡️ Casos de Uso Detectados

1. **Ataques DDoS Volumétricos**: Alto volumen de paquetes/bytes
2. **Ataques de Protocolo**: Explotación de vulnerabilidades TCP/UDP
3. **Ataques de Aplicación**: Patrones anómalos en protocolos IoT
4. **Escaneo de Red**: Patrones de reconocimiento de red

## 📁 Estructura de Archivos

```
aegis_ai_detection/
├── train_models.py          # Script de entrenamiento
├── inference.py             # Sistema de inferencia
├── requirements.txt         # Dependencias
├── README.md               # Documentación
├── models/                 # Modelos entrenados
│   ├── best_model.pkl
│   └── model_info.json
├── plots/                  # Visualizaciones
│   ├── feature_importance_analysis.png
│   ├── shap_summary.png
│   └── confusion_matrices.png
└── reports/                # Reportes detallados
    └── detailed_report.json
```

## 🔄 Integración con Dashboard Web

Para integrar con el dashboard web de AEGIS AI:

1. **Importar el detector**:
```python
from inference import AEGISThreatDetector
detector = AEGISThreatDetector()
```

2. **Endpoint de API**:
```python
@app.post("/detect")
async def detect_threat(features: dict):
    result = detector.predict_single(features)
    return result
```

3. **WebSocket para tiempo real**:
```python
async def real_time_detection(websocket, features_stream):
    for features in features_stream:
        result = detector.predict_single(features)
        await websocket.send_json(result)
```

## 🎯 Próximos Pasos

1. **Optimización de Hiperparámetros**: Búsqueda automática de mejores parámetros
2. **Modelos Ensemble**: Combinación de múltiples modelos
3. **Detección de Drift**: Monitoreo de degradación del modelo
4. **Reentrenamiento Automático**: Pipeline de actualización continua
5. **Integración con SIEM**: Conectores para sistemas de seguridad

---

**Desarrollado para AEGIS AI - Sistema de Ciberseguridad Autónomo**
