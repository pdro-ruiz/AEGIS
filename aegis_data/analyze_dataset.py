#!/usr/bin/env python3
"""
AEGIS AI - Análisis Exploratorio del Dataset DDoS
=================================================

Script para analizar y visualizar el dataset generado para detección de DDoS
en redes IoT industriales.

Autor: AEGIS AI Development Team
Fecha: 2025-06-24
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.figure_factory as ff
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Configurar estilo
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def load_dataset():
    """Carga el dataset generado"""
    print("Cargando dataset...")
    df = pd.read_csv('/home/ubuntu/aegis_data/ddos_dataset.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    print(f"Dataset cargado: {df.shape[0]} muestras, {df.shape[1]} características")
    return df

def basic_statistics(df):
    """Genera estadísticas básicas del dataset"""
    print("\n" + "="*60)
    print("ANÁLISIS ESTADÍSTICO BÁSICO")
    print("="*60)
    
    # Información general
    print(f"\nInformación del dataset:")
    print(f"- Forma: {df.shape}")
    print(f"- Memoria utilizada: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    print(f"- Valores nulos: {df.isnull().sum().sum()}")
    
    # Distribución de clases
    print(f"\nDistribución de clases:")
    class_dist = df['label'].value_counts()
    for label, count in class_dist.items():
        label_name = "Normal" if label == 0 else "DDoS"
        percentage = (count / len(df)) * 100
        print(f"- {label_name}: {count} ({percentage:.1f}%)")
    
    # Distribución por tipo de dispositivo/ataque
    print(f"\nDistribución por tipo:")
    device_dist = df['device_type'].value_counts()
    for device, count in device_dist.items():
        percentage = (count / len(df)) * 100
        print(f"- {device}: {count} ({percentage:.1f}%)")
    
    # Estadísticas por protocolo
    print(f"\nDistribución por protocolo:")
    protocol_dist = df['protocol'].value_counts()
    for protocol, count in protocol_dist.items():
        percentage = (count / len(df)) * 100
        print(f"- {protocol}: {count} ({percentage:.1f}%)")
    
    return class_dist, device_dist, protocol_dist

def create_correlation_analysis(df):
    """Crea análisis de correlación entre características"""
    print("\nGenerando análisis de correlación...")
    
    # Seleccionar características numéricas
    numeric_cols = ['duration', 'total_packets', 'total_bytes', 'avg_packet_size', 
                   'packet_rate', 'bytes_per_second', 'tcp_flags', 'inter_arrival_time', 'label']
    
    correlation_matrix = df[numeric_cols].corr()
    
    # Crear heatmap con plotly
    fig = px.imshow(correlation_matrix, 
                    text_auto=True, 
                    aspect="auto",
                    title="Matriz de Correlación - Características del Dataset",
                    color_continuous_scale='RdBu_r')
    
    fig.update_layout(
        width=800, 
        height=600,
        title_x=0.5
    )
    
    fig.write_html('/home/ubuntu/aegis_data/correlation_matrix.html')
    print("Matriz de correlación guardada: correlation_matrix.html")
    
    return correlation_matrix

def create_feature_distributions(df):
    """Crea visualizaciones de distribución de características"""
    print("\nGenerando distribuciones de características...")
    
    # Características clave para analizar
    key_features = ['packet_rate', 'bytes_per_second', 'total_packets', 'duration', 'avg_packet_size']
    
    # Crear subplots
    fig = make_subplots(
        rows=3, cols=2,
        subplot_titles=[f'Distribución: {feature}' for feature in key_features] + ['TCP Flags'],
        specs=[[{"secondary_y": False}, {"secondary_y": False}],
               [{"secondary_y": False}, {"secondary_y": False}],
               [{"secondary_y": False}, {"secondary_y": False}]]
    )
    
    colors = ['blue', 'red']
    labels = ['Normal', 'DDoS']
    
    row, col = 1, 1
    for i, feature in enumerate(key_features):
        for label_val, color, label_name in zip([0, 1], colors, labels):
            data = df[df['label'] == label_val][feature]
            
            fig.add_trace(
                go.Histogram(
                    x=data,
                    name=f'{label_name} - {feature}',
                    opacity=0.7,
                    marker_color=color,
                    showlegend=(i == 0)  # Solo mostrar leyenda en el primer gráfico
                ),
                row=row, col=col
            )
        
        col += 1
        if col > 2:
            col = 1
            row += 1
    
    # Añadir distribución de TCP flags
    tcp_flags_normal = df[df['label'] == 0]['tcp_flags'].value_counts()
    tcp_flags_ddos = df[df['label'] == 1]['tcp_flags'].value_counts()
    
    fig.add_trace(
        go.Bar(x=tcp_flags_normal.index, y=tcp_flags_normal.values, 
               name='Normal - TCP Flags', marker_color='blue', opacity=0.7),
        row=3, col=2
    )
    fig.add_trace(
        go.Bar(x=tcp_flags_ddos.index, y=tcp_flags_ddos.values, 
               name='DDoS - TCP Flags', marker_color='red', opacity=0.7),
        row=3, col=2
    )
    
    fig.update_layout(
        height=1000,
        title_text="Distribuciones de Características por Clase",
        title_x=0.5,
        showlegend=True
    )
    
    fig.write_html('/home/ubuntu/aegis_data/feature_distributions.html')
    print("Distribuciones de características guardadas: feature_distributions.html")

def create_temporal_analysis(df):
    """Crea análisis temporal del tráfico"""
    print("\nGenerando análisis temporal...")
    
    # Agregar columnas temporales
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    
    # Análisis por hora del día
    hourly_stats = df.groupby(['hour', 'label']).size().reset_index(name='count')
    
    fig = px.line(hourly_stats, x='hour', y='count', color='label',
                  title='Distribución Temporal del Tráfico por Hora',
                  labels={'label': 'Tipo de Tráfico', 'count': 'Número de Flujos'},
                  color_discrete_map={0: 'blue', 1: 'red'})
    
    fig.update_layout(
        xaxis_title="Hora del Día",
        yaxis_title="Número de Flujos",
        title_x=0.5
    )
    
    fig.write_html('/home/ubuntu/aegis_data/temporal_analysis.html')
    print("Análisis temporal guardado: temporal_analysis.html")

def create_network_topology_viz(df):
    """Crea visualización de la topología de red"""
    print("\nGenerando visualización de topología de red...")
    
    # Extraer subredes
    df['src_subnet'] = df['src_ip'].str.rsplit('.', n=1).str[0]
    df['dst_subnet'] = df['dst_ip'].str.rsplit('.', n=1).str[0]
    
    # Contar flujos entre subredes
    subnet_flows = df.groupby(['src_subnet', 'dst_subnet', 'label']).size().reset_index(name='flow_count')
    
    # Crear gráfico de red
    fig = go.Figure()
    
    # Añadir flujos normales
    normal_flows = subnet_flows[subnet_flows['label'] == 0]
    fig.add_trace(go.Scatter(
        x=normal_flows['src_subnet'],
        y=normal_flows['dst_subnet'],
        mode='markers',
        marker=dict(size=normal_flows['flow_count']/50, color='blue', opacity=0.6),
        name='Tráfico Normal',
        text=normal_flows['flow_count'],
        hovertemplate='Origen: %{x}<br>Destino: %{y}<br>Flujos: %{text}<extra></extra>'
    ))
    
    # Añadir flujos DDoS
    ddos_flows = subnet_flows[subnet_flows['label'] == 1]
    fig.add_trace(go.Scatter(
        x=ddos_flows['src_subnet'],
        y=ddos_flows['dst_subnet'],
        mode='markers',
        marker=dict(size=ddos_flows['flow_count']/50, color='red', opacity=0.8),
        name='Ataques DDoS',
        text=ddos_flows['flow_count'],
        hovertemplate='Origen: %{x}<br>Destino: %{y}<br>Flujos: %{text}<extra></extra>'
    ))
    
    fig.update_layout(
        title='Mapa de Flujos de Red por Subred',
        xaxis_title='Subred Origen',
        yaxis_title='Subred Destino',
        title_x=0.5,
        height=600
    )
    
    fig.write_html('/home/ubuntu/aegis_data/network_topology.html')
    print("Visualización de topología guardada: network_topology.html")

def create_attack_analysis(df):
    """Crea análisis específico de ataques DDoS"""
    print("\nGenerando análisis de ataques DDoS...")
    
    # Filtrar solo ataques DDoS
    ddos_data = df[df['label'] == 1].copy()
    
    # Análisis por tipo de ataque
    attack_types = ddos_data['device_type'].str.replace('attack_', '').value_counts()
    
    # Crear gráfico de barras para tipos de ataque
    fig1 = px.bar(
        x=attack_types.index,
        y=attack_types.values,
        title='Distribución de Tipos de Ataques DDoS',
        labels={'x': 'Tipo de Ataque', 'y': 'Número de Muestras'},
        color=attack_types.values,
        color_continuous_scale='Reds'
    )
    fig1.update_layout(title_x=0.5)
    fig1.write_html('/home/ubuntu/aegis_data/attack_types.html')
    
    # Análisis de intensidad de ataques
    fig2 = make_subplots(
        rows=2, cols=2,
        subplot_titles=['Tasa de Paquetes', 'Bytes por Segundo', 'Duración', 'Tamaño de Paquete'],
        specs=[[{"secondary_y": False}, {"secondary_y": False}],
               [{"secondary_y": False}, {"secondary_y": False}]]
    )
    
    attack_metrics = ['packet_rate', 'bytes_per_second', 'duration', 'avg_packet_size']
    positions = [(1,1), (1,2), (2,1), (2,2)]
    
    for metric, (row, col) in zip(attack_metrics, positions):
        for attack_type in ['volumetrico', 'protocolo_tcp_syn', 'aplicacion_http']:
            data = ddos_data[ddos_data['device_type'] == f'attack_{attack_type}'][metric]
            
            fig2.add_trace(
                go.Box(y=data, name=f'{attack_type}', showlegend=(row==1 and col==1)),
                row=row, col=col
            )
    
    fig2.update_layout(
        height=800,
        title_text="Análisis de Intensidad por Tipo de Ataque DDoS",
        title_x=0.5
    )
    
    fig2.write_html('/home/ubuntu/aegis_data/attack_intensity.html')
    print("Análisis de ataques guardado: attack_types.html, attack_intensity.html")

def create_ml_readiness_report(df):
    """Crea reporte de preparación para ML"""
    print("\nGenerando reporte de preparación para ML...")
    
    report = {
        "dataset_summary": {
            "total_samples": len(df),
            "features": df.shape[1],
            "class_balance": df['label'].value_counts().to_dict(),
            "missing_values": df.isnull().sum().sum(),
            "data_types": df.dtypes.astype(str).to_dict()
        },
        "feature_analysis": {
            "numeric_features": df.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical_features": df.select_dtypes(include=['object']).columns.tolist(),
            "target_variable": "label",
            "feature_ranges": {}
        },
        "data_quality": {
            "outliers_detected": {},
            "skewness": {},
            "correlation_with_target": {}
        },
        "recommendations": []
    }
    
    # Análisis de características numéricas
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if col != 'label':
            # Rangos
            report["feature_analysis"]["feature_ranges"][col] = {
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "std": float(df[col].std())
            }
            
            # Outliers (usando IQR)
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
            report["data_quality"]["outliers_detected"][col] = int(outliers)
            
            # Skewness
            report["data_quality"]["skewness"][col] = float(df[col].skew())
            
            # Correlación con target
            report["data_quality"]["correlation_with_target"][col] = float(df[col].corr(df['label']))
    
    # Recomendaciones
    if report["dataset_summary"]["missing_values"] == 0:
        report["recommendations"].append("✓ No hay valores faltantes - dataset listo para ML")
    
    balance_ratio = min(report["dataset_summary"]["class_balance"].values()) / max(report["dataset_summary"]["class_balance"].values())
    if balance_ratio > 0.4:
        report["recommendations"].append("✓ Dataset balanceado - no se requiere técnicas de balanceo")
    else:
        report["recommendations"].append("⚠ Dataset desbalanceado - considerar SMOTE o undersampling")
    
    high_corr_features = [k for k, v in report["data_quality"]["correlation_with_target"].items() if abs(v) > 0.5]
    if high_corr_features:
        report["recommendations"].append(f"✓ Características con alta correlación encontradas: {high_corr_features}")
    
    # Guardar reporte
    with open('/home/ubuntu/aegis_data/ml_readiness_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False, default=str)
    
    print("Reporte de preparación ML guardado: ml_readiness_report.json")
    return report

def main():
    """Función principal de análisis"""
    print("="*60)
    print("AEGIS AI - Análisis Exploratorio del Dataset DDoS")
    print("="*60)
    
    # Cargar dataset
    df = load_dataset()
    
    # Análisis estadístico básico
    class_dist, device_dist, protocol_dist = basic_statistics(df)
    
    # Análisis de correlación
    correlation_matrix = create_correlation_analysis(df)
    
    # Distribuciones de características
    create_feature_distributions(df)
    
    # Análisis temporal
    create_temporal_analysis(df)
    
    # Visualización de topología
    create_network_topology_viz(df)
    
    # Análisis específico de ataques
    create_attack_analysis(df)
    
    # Reporte de preparación para ML
    ml_report = create_ml_readiness_report(df)
    
    print("\n" + "="*60)
    print("ANÁLISIS COMPLETADO")
    print("="*60)
    print("\nArchivos generados:")
    print("- correlation_matrix.html")
    print("- feature_distributions.html") 
    print("- temporal_analysis.html")
    print("- network_topology.html")
    print("- attack_types.html")
    print("- attack_intensity.html")
    print("- ml_readiness_report.json")
    
    print(f"\nRecomendaciones clave para ML:")
    for rec in ml_report["recommendations"]:
        print(f"  {rec}")
    
    print(f"\nCaracterísticas con mayor correlación con el target:")
    high_corr = {k: v for k, v in ml_report["data_quality"]["correlation_with_target"].items() 
                 if abs(v) > 0.3}
    for feature, corr in sorted(high_corr.items(), key=lambda x: abs(x[1]), reverse=True):
        print(f"  - {feature}: {corr:.3f}")

if __name__ == "__main__":
    main()
