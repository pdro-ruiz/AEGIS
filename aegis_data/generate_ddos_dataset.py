#!/usr/bin/env python3
"""
AEGIS AI - Generador de Dataset para Detección de Ataques DDoS en Redes IoT
===========================================================================

Este script genera un dataset sintético balanceado para entrenar modelos de ML
en la detección de ataques DDoS en entornos IoT industriales.

Características generadas:
- Tráfico normal de dispositivos IoT (sensores, cámaras, controladores)
- Patrones de ataques DDoS (volumétricos, de protocolo, de aplicación)
- Características de flujo de red realistas

Autor: AEGIS AI Development Team
Fecha: 2025-06-24
"""

import pandas as pd
import numpy as np
import pickle
import json
from datetime import datetime, timedelta
import random
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# Configuración de semilla para reproducibilidad
np.random.seed(42)
random.seed(42)

class IoTDDoSDatasetGenerator:
    """Generador de dataset sintético para detección de DDoS en redes IoT"""
    
    def __init__(self):
        # Configuración de dispositivos IoT típicos
        self.iot_devices = {
            'sensor_temperatura': {
                'port_range': [502, 1883, 8080],  # Modbus, MQTT, HTTP
                'packet_size_range': (64, 256),
                'frequency_range': (1, 10),  # paquetes por segundo
                'protocols': ['TCP', 'UDP']
            },
            'camara_ip': {
                'port_range': [80, 443, 554, 8080],  # HTTP, HTTPS, RTSP
                'packet_size_range': (512, 1500),
                'frequency_range': (15, 50),
                'protocols': ['TCP', 'UDP']
            },
            'controlador_plc': {
                'port_range': [502, 44818, 2404],  # Modbus, EtherNet/IP, DNP3
                'packet_size_range': (128, 512),
                'frequency_range': (5, 25),
                'protocols': ['TCP']
            },
            'gateway_iot': {
                'port_range': [1883, 8883, 5683],  # MQTT, MQTT-S, CoAP
                'packet_size_range': (256, 1024),
                'frequency_range': (10, 40),
                'protocols': ['TCP', 'UDP']
            }
        }
        
        # Configuración de ataques DDoS
        self.ddos_patterns = {
            'volumetrico': {
                'packet_rate_multiplier': (50, 200),  # 50-200x el tráfico normal
                'packet_size_range': (64, 1500),
                'duration_range': (30, 300),  # segundos
                'protocols': ['TCP', 'UDP', 'ICMP']
            },
            'protocolo_tcp_syn': {
                'packet_rate_multiplier': (20, 100),
                'packet_size_range': (40, 80),  # SYN packets pequeños
                'duration_range': (60, 600),
                'protocols': ['TCP']
            },
            'aplicacion_http': {
                'packet_rate_multiplier': (10, 50),
                'packet_size_range': (200, 1500),
                'duration_range': (120, 900),
                'protocols': ['TCP']
            }
        }
        
        # Rangos de IPs para la red IoT simulada
        self.network_ranges = {
            'iot_subnet': '192.168.100.',
            'external_subnet': '10.0.0.',
            'attacker_subnet': '172.16.0.'
        }
        
    def generate_ip_address(self, subnet_type: str) -> str:
        """Genera una dirección IP según el tipo de subred"""
        base = self.network_ranges[subnet_type]
        return base + str(random.randint(1, 254))
    
    def generate_normal_traffic(self, num_samples: int) -> pd.DataFrame:
        """Genera tráfico normal de dispositivos IoT"""
        data = []
        
        for _ in range(num_samples):
            # Seleccionar tipo de dispositivo IoT
            device_type = random.choice(list(self.iot_devices.keys()))
            device_config = self.iot_devices[device_type]
            
            # Generar características del flujo
            src_ip = self.generate_ip_address('iot_subnet')
            dst_ip = self.generate_ip_address('iot_subnet') if random.random() > 0.3 else self.generate_ip_address('external_subnet')
            
            src_port = random.choice(device_config['port_range'])
            dst_port = random.randint(1024, 65535) if random.random() > 0.5 else random.choice(device_config['port_range'])
            
            protocol = random.choice(device_config['protocols'])
            
            # Características temporales y de volumen
            duration = np.random.exponential(scale=30)  # Distribución exponencial para duración
            packet_rate = random.uniform(*device_config['frequency_range'])
            total_packets = int(duration * packet_rate)
            
            avg_packet_size = random.uniform(*device_config['packet_size_range'])
            total_bytes = int(total_packets * avg_packet_size)
            
            # Flags TCP (para tráfico TCP normal)
            tcp_flags = self._generate_normal_tcp_flags() if protocol == 'TCP' else 0
            
            # Características adicionales
            inter_arrival_time = 1.0 / packet_rate if packet_rate > 0 else 1.0
            bytes_per_second = total_bytes / duration if duration > 0 else 0
            
            # Timestamp simulado
            timestamp = datetime.now() - timedelta(seconds=random.randint(0, 86400))
            
            data.append({
                'timestamp': timestamp,
                'src_ip': src_ip,
                'dst_ip': dst_ip,
                'src_port': src_port,
                'dst_port': dst_port,
                'protocol': protocol,
                'duration': duration,
                'total_packets': total_packets,
                'total_bytes': total_bytes,
                'avg_packet_size': avg_packet_size,
                'packet_rate': packet_rate,
                'bytes_per_second': bytes_per_second,
                'tcp_flags': tcp_flags,
                'inter_arrival_time': inter_arrival_time,
                'device_type': device_type,
                'label': 0  # Normal = 0
            })
        
        return pd.DataFrame(data)
    
    def generate_ddos_traffic(self, num_samples: int) -> pd.DataFrame:
        """Genera tráfico de ataques DDoS"""
        data = []
        
        for _ in range(num_samples):
            # Seleccionar tipo de ataque DDoS
            attack_type = random.choice(list(self.ddos_patterns.keys()))
            attack_config = self.ddos_patterns[attack_type]
            
            # IPs de atacante y víctima
            src_ip = self.generate_ip_address('attacker_subnet')
            dst_ip = self.generate_ip_address('iot_subnet')  # Atacando dispositivos IoT
            
            # Puertos típicos de ataques
            if attack_type == 'aplicacion_http':
                dst_port = random.choice([80, 443, 8080])
            elif attack_type == 'protocolo_tcp_syn':
                dst_port = random.choice([22, 23, 80, 443, 502])
            else:
                dst_port = random.randint(1, 65535)
            
            src_port = random.randint(1024, 65535)
            protocol = random.choice(attack_config['protocols'])
            
            # Características de ataque intensivo
            duration = random.uniform(*attack_config['duration_range'])
            normal_rate = 10  # Tasa normal base
            rate_multiplier = random.uniform(*attack_config['packet_rate_multiplier'])
            packet_rate = normal_rate * rate_multiplier
            
            total_packets = int(duration * packet_rate)
            avg_packet_size = random.uniform(*attack_config['packet_size_range'])
            total_bytes = int(total_packets * avg_packet_size)
            
            # Flags TCP maliciosos para ataques de protocolo
            if attack_type == 'protocolo_tcp_syn':
                tcp_flags = 2  # Solo SYN flag
            elif protocol == 'TCP':
                tcp_flags = self._generate_malicious_tcp_flags()
            else:
                tcp_flags = 0
            
            # Características adicionales
            inter_arrival_time = 1.0 / packet_rate if packet_rate > 0 else 0.001
            bytes_per_second = total_bytes / duration if duration > 0 else 0
            
            # Timestamp simulado
            timestamp = datetime.now() - timedelta(seconds=random.randint(0, 86400))
            
            data.append({
                'timestamp': timestamp,
                'src_ip': src_ip,
                'dst_ip': dst_ip,
                'src_port': src_port,
                'dst_port': dst_port,
                'protocol': protocol,
                'duration': duration,
                'total_packets': total_packets,
                'total_bytes': total_bytes,
                'avg_packet_size': avg_packet_size,
                'packet_rate': packet_rate,
                'bytes_per_second': bytes_per_second,
                'tcp_flags': tcp_flags,
                'inter_arrival_time': inter_arrival_time,
                'device_type': f'attack_{attack_type}',
                'label': 1  # DDoS = 1
            })
        
        return pd.DataFrame(data)
    
    def _generate_normal_tcp_flags(self) -> int:
        """Genera flags TCP normales"""
        # Combinaciones típicas: SYN(2), ACK(16), SYN+ACK(18), FIN+ACK(17), etc.
        normal_flags = [2, 16, 18, 17, 24, 25]
        return random.choice(normal_flags)
    
    def _generate_malicious_tcp_flags(self) -> int:
        """Genera flags TCP maliciosos"""
        # Flags anómalos: solo SYN(2), FIN+SYN(3), RST+SYN(6), etc.
        malicious_flags = [2, 3, 6, 0, 255]  # Incluye flags inválidos
        return random.choice(malicious_flags)
    
    def add_noise_and_variations(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade ruido realista y variaciones a los datos"""
        df = df.copy()
        
        # Añadir ruido gaussiano a métricas numéricas
        noise_columns = ['duration', 'packet_rate', 'bytes_per_second', 'avg_packet_size']
        for col in noise_columns:
            if col in df.columns:
                noise = np.random.normal(0, df[col].std() * 0.05, len(df))
                df[col] = np.maximum(df[col] + noise, 0)  # Evitar valores negativos
        
        # Simular pérdida de paquetes ocasional
        packet_loss_mask = np.random.random(len(df)) < 0.02  # 2% de pérdida
        df.loc[packet_loss_mask, 'total_packets'] *= np.random.uniform(0.8, 0.95, packet_loss_mask.sum())
        
        # Recalcular métricas derivadas
        df['packet_rate'] = df['total_packets'] / np.maximum(df['duration'], 0.1)
        df['bytes_per_second'] = df['total_bytes'] / np.maximum(df['duration'], 0.1)
        df['avg_packet_size'] = df['total_bytes'] / np.maximum(df['total_packets'], 1)
        
        return df
    
    def generate_dataset(self, total_samples: int = 10000, balance_ratio: float = 0.5) -> pd.DataFrame:
        """Genera el dataset completo balanceado"""
        print(f"Generando dataset con {total_samples} muestras...")
        
        # Calcular número de muestras por clase
        ddos_samples = int(total_samples * balance_ratio)
        normal_samples = total_samples - ddos_samples
        
        print(f"- Tráfico normal: {normal_samples} muestras")
        print(f"- Ataques DDoS: {ddos_samples} muestras")
        
        # Generar datos
        normal_data = self.generate_normal_traffic(normal_samples)
        ddos_data = self.generate_ddos_traffic(ddos_samples)
        
        # Combinar datasets
        dataset = pd.concat([normal_data, ddos_data], ignore_index=True)
        
        # Añadir ruido y variaciones
        dataset = self.add_noise_and_variations(dataset)
        
        # Mezclar aleatoriamente
        dataset = dataset.sample(frac=1, random_state=42).reset_index(drop=True)
        
        print(f"Dataset generado exitosamente: {len(dataset)} muestras")
        print(f"Distribución de clases:")
        print(dataset['label'].value_counts())
        
        return dataset

def create_feature_documentation() -> Dict:
    """Crea documentación de las características del dataset"""
    return {
        "dataset_info": {
            "name": "AEGIS AI DDoS Detection Dataset",
            "version": "1.0",
            "creation_date": datetime.now().isoformat(),
            "description": "Dataset sintético para detección de ataques DDoS en redes IoT industriales",
            "total_samples": None,  # Se actualizará después
            "class_distribution": None  # Se actualizará después
        },
        "features": {
            "timestamp": {
                "type": "datetime",
                "description": "Marca temporal del flujo de red",
                "format": "YYYY-MM-DD HH:MM:SS"
            },
            "src_ip": {
                "type": "string",
                "description": "Dirección IP de origen",
                "example": "192.168.100.15"
            },
            "dst_ip": {
                "type": "string",
                "description": "Dirección IP de destino",
                "example": "192.168.100.25"
            },
            "src_port": {
                "type": "integer",
                "description": "Puerto de origen",
                "range": "1-65535"
            },
            "dst_port": {
                "type": "integer",
                "description": "Puerto de destino",
                "range": "1-65535"
            },
            "protocol": {
                "type": "string",
                "description": "Protocolo de transporte",
                "values": ["TCP", "UDP", "ICMP"]
            },
            "duration": {
                "type": "float",
                "description": "Duración de la conexión en segundos",
                "unit": "seconds"
            },
            "total_packets": {
                "type": "integer",
                "description": "Número total de paquetes en el flujo",
                "unit": "packets"
            },
            "total_bytes": {
                "type": "integer",
                "description": "Bytes totales transferidos",
                "unit": "bytes"
            },
            "avg_packet_size": {
                "type": "float",
                "description": "Tamaño promedio de paquete",
                "unit": "bytes"
            },
            "packet_rate": {
                "type": "float",
                "description": "Frecuencia de paquetes por segundo",
                "unit": "packets/second"
            },
            "bytes_per_second": {
                "type": "float",
                "description": "Tasa de transferencia de datos",
                "unit": "bytes/second"
            },
            "tcp_flags": {
                "type": "integer",
                "description": "Flags TCP combinados (valor decimal)",
                "note": "SYN=2, ACK=16, FIN=1, RST=4, etc."
            },
            "inter_arrival_time": {
                "type": "float",
                "description": "Tiempo promedio entre paquetes",
                "unit": "seconds"
            },
            "device_type": {
                "type": "string",
                "description": "Tipo de dispositivo IoT o tipo de ataque",
                "values": ["sensor_temperatura", "camara_ip", "controlador_plc", "gateway_iot", "attack_volumetrico", "attack_protocolo_tcp_syn", "attack_aplicacion_http"]
            },
            "label": {
                "type": "integer",
                "description": "Etiqueta de clasificación",
                "values": {
                    "0": "Tráfico normal",
                    "1": "Ataque DDoS"
                }
            }
        },
        "iot_devices": {
            "sensor_temperatura": "Sensores de temperatura industrial con comunicación Modbus/MQTT",
            "camara_ip": "Cámaras IP de vigilancia industrial",
            "controlador_plc": "Controladores lógicos programables (PLC)",
            "gateway_iot": "Gateways IoT para agregación de datos"
        },
        "ddos_attack_types": {
            "volumetrico": "Ataques de volumen alto para saturar ancho de banda",
            "protocolo_tcp_syn": "Ataques SYN flood para agotar recursos de conexión",
            "aplicacion_http": "Ataques a nivel de aplicación HTTP/HTTPS"
        },
        "network_topology": {
            "iot_subnet": "192.168.100.0/24 - Red de dispositivos IoT",
            "external_subnet": "10.0.0.0/24 - Red externa/corporativa",
            "attacker_subnet": "172.16.0.0/24 - Red de atacantes simulados"
        }
    }

def main():
    """Función principal para generar el dataset"""
    print("=" * 60)
    print("AEGIS AI - Generador de Dataset DDoS para Redes IoT")
    print("=" * 60)
    
    # Crear generador
    generator = IoTDDoSDatasetGenerator()
    
    # Generar dataset
    dataset = generator.generate_dataset(total_samples=10000, balance_ratio=0.5)
    
    # Crear documentación
    documentation = create_feature_documentation()
    documentation["dataset_info"]["total_samples"] = len(dataset)
    documentation["dataset_info"]["class_distribution"] = dataset['label'].value_counts().to_dict()
    
    # Guardar en formato CSV
    csv_path = "/home/ubuntu/aegis_data/ddos_dataset.csv"
    dataset.to_csv(csv_path, index=False)
    print(f"\nDataset guardado en CSV: {csv_path}")
    
    # Guardar en formato pickle
    pickle_path = "/home/ubuntu/aegis_data/ddos_dataset.pkl"
    with open(pickle_path, 'wb') as f:
        pickle.dump(dataset, f)
    print(f"Dataset guardado en pickle: {pickle_path}")
    
    # Guardar documentación
    doc_path = "/home/ubuntu/aegis_data/dataset_documentation.json"
    with open(doc_path, 'w', encoding='utf-8') as f:
        json.dump(documentation, f, indent=2, ensure_ascii=False, default=str)
    print(f"Documentación guardada: {doc_path}")
    
    # Mostrar estadísticas básicas
    print("\n" + "=" * 60)
    print("ESTADÍSTICAS DEL DATASET")
    print("=" * 60)
    
    print(f"\nForma del dataset: {dataset.shape}")
    print(f"\nDistribución de clases:")
    print(dataset['label'].value_counts())
    
    print(f"\nTipos de dispositivos/ataques:")
    print(dataset['device_type'].value_counts())
    
    print(f"\nProtocolos:")
    print(dataset['protocol'].value_counts())
    
    print(f"\nEstadísticas de características numéricas:")
    numeric_cols = ['duration', 'total_packets', 'total_bytes', 'packet_rate', 'bytes_per_second']
    print(dataset[numeric_cols].describe())
    
    print(f"\nDataset generado exitosamente en ~/aegis_data/")
    print("Archivos creados:")
    print("- ddos_dataset.csv (formato CSV)")
    print("- ddos_dataset.pkl (formato pickle)")
    print("- dataset_documentation.json (documentación)")

if __name__ == "__main__":
    main()
