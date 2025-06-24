# AEGIS AI - Dataset de Detección de Ataques DDoS en Redes IoT

## Descripción General

Este dataset sintético ha sido diseñado específicamente para el entrenamiento de modelos de machine learning en la detección de ataques DDoS (Distributed Denial of Service) en redes IoT industriales. El dataset forma parte del proyecto **AEGIS AI**, un sistema de ciberseguridad autónomo para redes IoT industriales.

### Características del Dataset

- **Total de muestras**: 10,000
- **Distribución balanceada**: 50% tráfico normal, 50% ataques DDoS
- **Características**: 16 características base + 19 características derivadas (35 total)
- **Formato**: CSV y Pickle
- **Etiquetas**: Binarias (0=Normal, 1=DDoS)

## Estructura de Archivos

```
~/aegis_data/
├── ddos_dataset.csv                   # Dataset principal en formato CSV
├── ddos_dataset.pkl                   # Dataset principal en formato Pickle
├── dataset_documentation.json         # Documentación completa del dataset
├── processed_ml_data.pkl              # Datos procesados listos para ML
├── raw_ml_data.pkl                    # Datos divididos sin procesar
├── preprocessor.pkl                   # Pipeline de preprocesamiento
├── ml_data_summary.json               # Resumen de preparación ML
├── ml_readiness_report.json           # Reporte de calidad de datos
├── correlation_matrix.html            # Matriz de correlación interactiva
├── feature_distributions.html         # Distribuciones de características
├── temporal_analysis.html             # Análisis temporal del tráfico
├── network_topology.html              # Visualización de topología de red
├── attack_types.html                  # Análisis de tipos de ataques
├── attack_intensity.html              # Análisis de intensidad de ataques
├── generate_ddos_dataset.py           # Script generador del dataset
├── analyze_dataset.py                 # Script de análisis exploratorio
├── prepare_ml_data.py                 # Script de preparación para ML
└── README.md                          # Este archivo
```

## Características del Dataset

### Características Base (16)

| Característica | Tipo | Descripción | Unidad |
|----------------|------|-------------|--------|
| `timestamp` | datetime | Marca temporal del flujo | YYYY-MM-DD HH:MM:SS |
| `src_ip` | string | Dirección IP de origen | - |
| `dst_ip` | string | Dirección IP de destino | - |
| `src_port` | integer | Puerto de origen | 1-65535 |
| `dst_port` | integer | Puerto de destino | 1-65535 |
| `protocol` | string | Protocolo (TCP/UDP/ICMP) | - |
| `duration` | float | Duración de la conexión | segundos |
| `total_packets` | integer | Número total de paquetes | paquetes |
| `total_bytes` | integer | Bytes totales transferidos | bytes |
| `avg_packet_size` | float | Tamaño promedio de paquete | bytes |
| `packet_rate` | float | Frecuencia de paquetes | paquetes/segundo |
| `bytes_per_second` | float | Tasa de transferencia | bytes/segundo |
| `tcp_flags` | integer | Flags TCP combinados | valor decimal |
| `inter_arrival_time` | float | Tiempo entre paquetes | segundos |
| `device_type` | string | Tipo de dispositivo/ataque | - |
| `label` | integer | Etiqueta (0=Normal, 1=DDoS) | - |

### Características Derivadas (19)

| Característica | Descripción |
|----------------|-------------|
| `hour` | Hora del día (0-23) |
| `day_of_week` | Día de la semana (0-6) |
| `is_weekend` | Indicador de fin de semana |
| `is_internal_traffic` | Tráfico interno (192.168.x.x) |
| `is_external_source` | Origen externo a la red IoT |
| `is_tcp/udp/icmp` | Indicadores de protocolo |
| `is_well_known_port` | Puerto conocido (≤1023) |
| `is_ephemeral_port` | Puerto efímero (≥32768) |
| `is_iot_device` | Dispositivo IoT legítimo |
| `bytes_per_packet` | Ratio bytes/paquete |
| `packets_per_second` | Paquetes por segundo recalculado |
| `has_syn/ack/fin/rst_flag` | Indicadores de flags TCP |
| `packet_rate_log` | Log de tasa de paquetes |
| `bytes_per_second_log` | Log de tasa de bytes |

## Tipos de Dispositivos IoT Simulados

### Dispositivos Legítimos

1. **Sensores de Temperatura** (`sensor_temperatura`)
   - Protocolos: Modbus/TCP, MQTT, HTTP
   - Puertos: 502, 1883, 8080
   - Tasa de paquetes: 1-10 pps
   - Tamaño de paquete: 64-256 bytes

2. **Cámaras IP** (`camara_ip`)
   - Protocolos: HTTP, HTTPS, RTSP
   - Puertos: 80, 443, 554, 8080
   - Tasa de paquetes: 15-50 pps
   - Tamaño de paquete: 512-1500 bytes

3. **Controladores PLC** (`controlador_plc`)
   - Protocolos: Modbus, EtherNet/IP, DNP3
   - Puertos: 502, 44818, 2404
   - Tasa de paquetes: 5-25 pps
   - Tamaño de paquete: 128-512 bytes

4. **Gateways IoT** (`gateway_iot`)
   - Protocolos: MQTT, MQTT-S, CoAP
   - Puertos: 1883, 8883, 5683
   - Tasa de paquetes: 10-40 pps
   - Tamaño de paquete: 256-1024 bytes

## Tipos de Ataques DDoS Simulados

### 1. Ataques Volumétricos (`attack_volumetrico`)
- **Objetivo**: Saturar el ancho de banda
- **Multiplicador de tráfico**: 50-200x normal
- **Duración**: 30-300 segundos
- **Protocolos**: TCP, UDP, ICMP
- **Características**: Alto volumen de paquetes y bytes

### 2. Ataques de Protocolo TCP SYN (`attack_protocolo_tcp_syn`)
- **Objetivo**: Agotar recursos de conexión
- **Multiplicador de tráfico**: 20-100x normal
- **Duración**: 60-600 segundos
- **Protocolos**: TCP únicamente
- **Características**: Paquetes SYN sin completar handshake

### 3. Ataques de Aplicación HTTP (`attack_aplicacion_http`)
- **Objetivo**: Saturar servicios web
- **Multiplicador de tráfico**: 10-50x normal
- **Duración**: 120-900 segundos
- **Protocolos**: TCP (HTTP/HTTPS)
- **Características**: Requests HTTP malformados o excesivos

## Topología de Red Simulada

- **Red IoT**: 192.168.100.0/24 (dispositivos IoT industriales)
- **Red Externa**: 10.0.0.0/24 (red corporativa/externa)
- **Red Atacantes**: 172.16.0.0/24 (fuentes de ataques)

## Uso del Dataset

### Carga Rápida

```python
import pandas as pd
import pickle

# Cargar dataset completo
df = pd.read_csv('~/aegis_data/ddos_dataset.csv')

# O cargar datos preparados para ML
with open('~/aegis_data/processed_ml_data.pkl', 'rb') as f:
    ml_data = pickle.load(f)

X_train = ml_data['X_train']
y_train = ml_data['y_train']
```

### Ejemplo de Entrenamiento

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# Cargar datos procesados
with open('~/aegis_data/processed_ml_data.pkl', 'rb') as f:
    data = pickle.load(f)

# Entrenar modelo
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(data['X_train'], data['y_train'])

# Evaluar
y_pred = model.predict(data['X_test'])
print(classification_report(data['y_test'], y_pred))

# Guardar modelo
joblib.dump(model, 'ddos_detector_model.pkl')
```

## Calidad de los Datos

### Estadísticas de Calidad
- ✅ **Sin valores faltantes**: 0 valores nulos
- ✅ **Dataset balanceado**: 50/50 distribución de clases
- ✅ **Outliers manejados**: Procesados usando método IQR
- ✅ **Características normalizadas**: StandardScaler aplicado
- ✅ **División estratificada**: Mantiene proporción de clases

### Características con Mayor Correlación con el Target
1. `total_packets`: 0.740
2. `duration`: 0.703
3. `src_port`: 0.646
4. `total_bytes`: 0.512
5. `inter_arrival_time`: -0.474
6. `packet_rate`: 0.437

## Visualizaciones Disponibles

El dataset incluye múltiples visualizaciones interactivas en formato HTML:

1. **Matriz de Correlación**: Relaciones entre características
2. **Distribuciones de Características**: Comparación Normal vs DDoS
3. **Análisis Temporal**: Patrones temporales del tráfico
4. **Topología de Red**: Flujos entre subredes
5. **Análisis de Ataques**: Tipos e intensidad de ataques DDoS

## Scripts Incluidos

### 1. `generate_ddos_dataset.py`
Genera el dataset sintético completo con tráfico normal y ataques DDoS.

```bash
python generate_ddos_dataset.py
```

### 2. `analyze_dataset.py`
Realiza análisis exploratorio y genera visualizaciones.

```bash
python analyze_dataset.py
```

### 3. `prepare_ml_data.py`
Prepara los datos para entrenamiento de modelos ML.

```bash
python prepare_ml_data.py
```

## Casos de Uso Recomendados

### 1. Detección de Anomalías
- Usar características de tasa de paquetes y bytes
- Modelos recomendados: Isolation Forest, One-Class SVM

### 2. Clasificación Binaria
- Usar todas las características disponibles
- Modelos recomendados: Random Forest, Gradient Boosting, SVM

### 3. Detección en Tiempo Real
- Usar características de ventana deslizante
- Modelos recomendados: Redes neuronales, modelos online

### 4. Análisis de Protocolos Industriales
- Enfocarse en puertos 502 (Modbus), 44818 (EtherNet/IP)
- Analizar patrones de flags TCP específicos

## Limitaciones y Consideraciones

1. **Datos Sintéticos**: Los datos son generados artificialmente y pueden no capturar toda la complejidad del tráfico real
2. **Protocolos Limitados**: Se enfoca principalmente en TCP/UDP/ICMP
3. **Topología Simplificada**: Red simulada con 3 subredes principales
4. **Ataques Específicos**: Solo incluye 3 tipos principales de DDoS
5. **Sin Cifrado**: No simula tráfico cifrado o túneles VPN

## Próximos Pasos

Para mejorar el dataset en futuras versiones:

1. Añadir más protocolos industriales (OPC-UA, BACnet)
2. Incluir ataques más sofisticados (APT, Man-in-the-Middle)
3. Simular tráfico cifrado y análisis de metadatos
4. Añadir ruido de red más realista
5. Incluir datos de múltiples días/semanas

## Contacto y Soporte

Este dataset fue creado como parte del proyecto AEGIS AI para investigación y desarrollo en ciberseguridad IoT industrial.

**Fecha de Creación**: 2025-06-24  
**Versión**: 1.0  
**Licencia**: Para uso en investigación y desarrollo del proyecto AEGIS AI

---

*Para más información sobre el proyecto AEGIS AI, consulte la documentación técnica en `~/Uploads/AEGIS_AI_resumen.md`*
