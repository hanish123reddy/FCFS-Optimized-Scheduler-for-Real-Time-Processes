"""
Real-World Cloud Workload Datasets for DP-FCFS Simulator.
Provides pre-configured, realistic cloud industry benchmark traces:
1. E-Commerce Flash Sale Surge (Convoy-heavy test)
2. Big Data Analytics (Spark/Hadoop batch jobs)
3. High-Frequency Microservices API (latency-sensitive micro-bursts)
4. AI/ML Deep Learning Pipeline (compute & memory-intensive training/inferencing)
5. IoT Sensor Fleet Telemetry (continuous high I/O sensor streaming)
"""

REAL_WORLD_SCENARIOS = {
    "ecommerce_surge": {
        "id": "ecommerce_surge",
        "name": "E-Commerce Flash Sale Surge",
        "category": "Retail & Web",
        "icon": "ShoppingCart",
        "description": "Simulates a massive Black Friday flash sale. A massive inventory reconciliation batch query arrives first, followed by rapid bursts of checkout and payment verification tasks, testing convoy mitigation.",
        "difficulty": "Convoy Critical",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "ECM-01", "name": "Global Inventory Sync (Heavy Batch)", "arrival_time": 0.0, "actual_burst_time": 65.0, "data_size_mb": 950, "cpu_cycles_m": 4200, "io_ops": 8500, "priority": 1},
            {"id": "ECM-02", "name": "User 8102 Payment Checkout", "arrival_time": 0.2, "actual_burst_time": 1.2, "data_size_mb": 8, "cpu_cycles_m": 40, "io_ops": 150, "priority": 5},
            {"id": "ECM-03", "name": "User 8103 Coupon Validation", "arrival_time": 0.4, "actual_burst_time": 1.5, "data_size_mb": 12, "cpu_cycles_m": 60, "io_ops": 180, "priority": 4},
            {"id": "ECM-04", "name": "User 8104 Cart Calculation", "arrival_time": 0.6, "actual_burst_time": 2.0, "data_size_mb": 15, "cpu_cycles_m": 80, "io_ops": 220, "priority": 4},
            {"id": "ECM-05", "name": "Fraud Detection Micro-Check", "arrival_time": 0.8, "actual_burst_time": 3.2, "data_size_mb": 25, "cpu_cycles_m": 120, "io_ops": 300, "priority": 5},
            {"id": "ECM-06", "name": "Order Confirmation Dispatch", "arrival_time": 1.0, "actual_burst_time": 1.8, "data_size_mb": 10, "cpu_cycles_m": 50, "io_ops": 200, "priority": 3},
            {"id": "ECM-07", "name": "Catalog Recommendation Query", "arrival_time": 1.4, "actual_burst_time": 4.5, "data_size_mb": 40, "cpu_cycles_m": 180, "io_ops": 450, "priority": 3},
            {"id": "ECM-08", "name": "Shipping Rate Calculation", "arrival_time": 1.8, "actual_burst_time": 2.2, "data_size_mb": 18, "cpu_cycles_m": 90, "io_ops": 260, "priority": 4},
            {"id": "ECM-09", "name": "Payment Gateway Tokenization", "arrival_time": 2.2, "actual_burst_time": 1.4, "data_size_mb": 9, "cpu_cycles_m": 45, "io_ops": 170, "priority": 5},
            {"id": "ECM-10", "name": "Analytics Clickstream Ingest", "arrival_time": 2.5, "actual_burst_time": 5.0, "data_size_mb": 60, "cpu_cycles_m": 220, "io_ops": 600, "priority": 2},
            {"id": "ECM-11", "name": "Warehouse Dispatch Notification", "arrival_time": 2.9, "actual_burst_time": 2.8, "data_size_mb": 22, "cpu_cycles_m": 110, "io_ops": 310, "priority": 3},
            {"id": "ECM-12", "name": "Email Invoice PDF Generator", "arrival_time": 3.4, "actual_burst_time": 3.6, "data_size_mb": 35, "cpu_cycles_m": 140, "io_ops": 380, "priority": 4}
        ]
    },
    "bigdata_analytics": {
        "id": "bigdata_analytics",
        "name": "Big Data Analytics (Spark/Hadoop)",
        "category": "Enterprise Data",
        "icon": "Database",
        "description": "Simulates large ETL extract-transform-load jobs, data warehouse partition scans, and aggregations with massive data sizes and memory requirements.",
        "difficulty": "Resource Heavy",
        "recommended_algo": "SJF / DP-FCFS",
        "tasks": [
            {"id": "BDA-01", "name": "Parquet Partition Scan (Region-US)", "arrival_time": 0.0, "actual_burst_time": 42.0, "data_size_mb": 850, "cpu_cycles_m": 2800, "io_ops": 6500, "priority": 2},
            {"id": "BDA-02", "name": "Dimension Table Broadcast Join", "arrival_time": 1.0, "actual_burst_time": 14.0, "data_size_mb": 220, "cpu_cycles_m": 900, "io_ops": 1800, "priority": 3},
            {"id": "BDA-03", "name": "Customer Segmentation Clustering", "arrival_time": 1.5, "actual_burst_time": 58.0, "data_size_mb": 980, "cpu_cycles_m": 4100, "io_ops": 7200, "priority": 1},
            {"id": "BDA-04", "name": "Fast Metadata Header Parse", "arrival_time": 2.0, "actual_burst_time": 3.0, "data_size_mb": 30, "cpu_cycles_m": 120, "io_ops": 400, "priority": 4},
            {"id": "BDA-05", "name": "Revenue Daily Aggregation", "arrival_time": 2.5, "actual_burst_time": 28.0, "data_size_mb": 450, "cpu_cycles_m": 1600, "io_ops": 3400, "priority": 2},
            {"id": "BDA-06", "name": "Data Quality Null Checker", "arrival_time": 3.0, "actual_burst_time": 4.5, "data_size_mb": 45, "cpu_cycles_m": 150, "io_ops": 500, "priority": 4},
            {"id": "BDA-07", "name": "Snowflake Incremental Loader", "arrival_time": 3.8, "actual_burst_time": 34.0, "data_size_mb": 560, "cpu_cycles_m": 2100, "io_ops": 4200, "priority": 2},
            {"id": "BDA-08", "name": "Schema Registry Evolution Sync", "arrival_time": 4.2, "actual_burst_time": 2.5, "data_size_mb": 20, "cpu_cycles_m": 90, "io_ops": 250, "priority": 5}
        ]
    },
    "microservices_api": {
        "id": "microservices_api",
        "name": "High-Frequency Microservices API",
        "category": "Cloud Native",
        "icon": "Cpu",
        "description": "High-throughput, ultra low-latency REST and gRPC API micro-requests requiring minimal response times and strict SLA compliance.",
        "difficulty": "Latency Sensitive",
        "recommended_algo": "Round Robin / DP-FCFS",
        "tasks": [
            {"id": "API-01", "name": "JWT Token Authentication", "arrival_time": 0.0, "actual_burst_time": 1.2, "data_size_mb": 5, "cpu_cycles_m": 40, "io_ops": 100, "priority": 5},
            {"id": "API-02", "name": "Redis Session Fetch", "arrival_time": 0.1, "actual_burst_time": 0.8, "data_size_mb": 2, "cpu_cycles_m": 25, "io_ops": 80, "priority": 5},
            {"id": "API-03", "name": "User Profile REST Get", "arrival_time": 0.3, "actual_burst_time": 2.1, "data_size_mb": 15, "cpu_cycles_m": 70, "io_ops": 210, "priority": 4},
            {"id": "API-04", "name": "Push Notification Webhook", "arrival_time": 0.5, "actual_burst_time": 3.4, "data_size_mb": 28, "cpu_cycles_m": 130, "io_ops": 350, "priority": 3},
            {"id": "API-05", "name": "Config Dynamic Refresh", "arrival_time": 0.7, "actual_burst_time": 1.0, "data_size_mb": 6, "cpu_cycles_m": 35, "io_ops": 110, "priority": 4},
            {"id": "API-06", "name": "Rate Limiter Token Bucket", "arrival_time": 0.9, "actual_burst_time": 0.6, "data_size_mb": 1, "cpu_cycles_m": 20, "io_ops": 60, "priority": 5},
            {"id": "API-07", "name": "GraphQL User Feed Query", "arrival_time": 1.2, "actual_burst_time": 4.8, "data_size_mb": 50, "cpu_cycles_m": 210, "io_ops": 520, "priority": 3},
            {"id": "API-08", "name": "Audit Trail Async Logging", "arrival_time": 1.5, "actual_burst_time": 1.6, "data_size_mb": 12, "cpu_cycles_m": 55, "io_ops": 180, "priority": 4}
        ]
    },
    "ai_deeplearning": {
        "id": "ai_deeplearning",
        "name": "AI & Deep Learning Pipeline",
        "category": "Machine Learning",
        "icon": "Zap",
        "description": "Multi-stage machine learning workflow spanning embedding generation, LLM token generation, vector search, and model weights checkpointing.",
        "difficulty": "Compute Intensive",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "AI-01", "name": "LLM 7B Context Embedding Gen", "arrival_time": 0.0, "actual_burst_time": 38.0, "data_size_mb": 620, "cpu_cycles_m": 3200, "io_ops": 2800, "priority": 2},
            {"id": "AI-02", "name": "FAISS Vector Similarity Search", "arrival_time": 0.8, "actual_burst_time": 6.5, "data_size_mb": 80, "cpu_cycles_m": 340, "io_ops": 800, "priority": 4},
            {"id": "AI-03", "name": "PyTorch Fine-tuning Mini-Batch", "arrival_time": 1.2, "actual_burst_time": 72.0, "data_size_mb": 990, "cpu_cycles_m": 4800, "io_ops": 4100, "priority": 1},
            {"id": "AI-04", "name": "Prompt Safety Classifier", "arrival_time": 1.5, "actual_burst_time": 2.2, "data_size_mb": 15, "cpu_cycles_m": 95, "io_ops": 240, "priority": 5},
            {"id": "AI-05", "name": "Token Stream De-quantization", "arrival_time": 2.0, "actual_burst_time": 12.0, "data_size_mb": 180, "cpu_cycles_m": 750, "io_ops": 1200, "priority": 3},
            {"id": "AI-06", "name": "Model Checkpoint S3 Upload", "arrival_time": 3.0, "actual_burst_time": 24.0, "data_size_mb": 420, "cpu_cycles_m": 1200, "io_ops": 3100, "priority": 2}
        ]
    },
    "iot_telemetry": {
        "id": "iot_telemetry",
        "name": "IoT Sensor Fleet Telemetry",
        "category": "Smart Systems",
        "icon": "Activity",
        "description": "Streams continuous environmental sensor, GPS, and industrial telemetry packets with rapid arrival rates and heavy I/O database writes.",
        "difficulty": "I/O Intensive",
        "recommended_algo": "Priority / DP-FCFS",
        "tasks": [
            {"id": "IOT-01", "name": "Turbine Vibration Sensor Batch", "arrival_time": 0.0, "actual_burst_time": 3.2, "data_size_mb": 35, "cpu_cycles_m": 110, "io_ops": 850, "priority": 4},
            {"id": "IOT-02", "name": "Emergency Pressure Valve Alarm", "arrival_time": 0.2, "actual_burst_time": 1.0, "data_size_mb": 8, "cpu_cycles_m": 50, "io_ops": 300, "priority": 5},
            {"id": "IOT-03", "name": "Fleet GPS Coordinate Ingest", "arrival_time": 0.4, "actual_burst_time": 2.8, "data_size_mb": 25, "cpu_cycles_m": 90, "io_ops": 720, "priority": 3},
            {"id": "IOT-04", "name": "Battery Voltage Telemetry Log", "arrival_time": 0.7, "actual_burst_time": 2.2, "data_size_mb": 18, "cpu_cycles_m": 75, "io_ops": 580, "priority": 3},
            {"id": "IOT-05", "name": "Temperature Anomaly Detection", "arrival_time": 1.0, "actual_burst_time": 8.5, "data_size_mb": 110, "cpu_cycles_m": 420, "io_ops": 1400, "priority": 4},
            {"id": "IOT-06", "name": "Industrial PLC State Sync", "arrival_time": 1.4, "actual_burst_time": 4.1, "data_size_mb": 45, "cpu_cycles_m": 160, "io_ops": 960, "priority": 4}
        ]
    },
    "fintech_hft": {
        "id": "fintech_hft",
        "name": "FinTech HFT & Risk Modeling",
        "category": "Financial Tech",
        "icon": "TrendingUp",
        "description": "Ultra-low latency algorithmic trading micro-orders coupled with massive asynchronous Monte Carlo value-at-risk (VaR) portfolio simulations.",
        "difficulty": "Latency & Compute Hybrid",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "HFT-01", "name": "Order Book Arbitrage Match", "arrival_time": 0.0, "actual_burst_time": 0.8, "data_size_mb": 5, "cpu_cycles_m": 35, "io_ops": 90, "priority": 5},
            {"id": "HFT-02", "name": "Portfolio Monte Carlo VaR (50k Runs)", "arrival_time": 0.1, "actual_burst_time": 68.0, "data_size_mb": 890, "cpu_cycles_m": 4600, "io_ops": 3200, "priority": 2},
            {"id": "HFT-03", "name": "Fix Protocol Heartbeat Check", "arrival_time": 0.3, "actual_burst_time": 0.5, "data_size_mb": 2, "cpu_cycles_m": 15, "io_ops": 40, "priority": 5},
            {"id": "HFT-04", "name": "Credit Default Swap Matrix Calc", "arrival_time": 0.5, "actual_burst_time": 44.0, "data_size_mb": 620, "cpu_cycles_m": 2900, "io_ops": 2800, "priority": 2},
            {"id": "HFT-05", "name": "Sub-millisecond Fill Execution", "arrival_time": 0.7, "actual_burst_time": 0.9, "data_size_mb": 6, "cpu_cycles_m": 45, "io_ops": 110, "priority": 5},
            {"id": "HFT-06", "name": "SEC Regulatory Compliance Logger", "arrival_time": 1.0, "actual_burst_time": 3.4, "data_size_mb": 35, "cpu_cycles_m": 140, "io_ops": 650, "priority": 3},
            {"id": "HFT-07", "name": "Black-Scholes Options Greeks Engine", "arrival_time": 1.4, "actual_burst_time": 18.0, "data_size_mb": 240, "cpu_cycles_m": 1100, "io_ops": 950, "priority": 3}
        ]
    },
    "genomic_healthcare": {
        "id": "genomic_healthcare",
        "name": "Genomic DNA & Healthcare PACS",
        "category": "Biotech & Medicine",
        "icon": "Dna",
        "description": "High-throughput bioinformatics pipeline processing FASTQ/BAM chromosome alignment alongside urgent ICU vital emergency alerts.",
        "difficulty": "Massive Memory & SLA",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "GEN-01", "name": "ICU Cardiac Arrhythmia Alert", "arrival_time": 0.0, "actual_burst_time": 0.7, "data_size_mb": 4, "cpu_cycles_m": 30, "io_ops": 80, "priority": 5},
            {"id": "GEN-02", "name": "BWA-MEM DNA Chromosome 21 Alignment", "arrival_time": 0.2, "actual_burst_time": 82.0, "data_size_mb": 1200, "cpu_cycles_m": 5400, "io_ops": 8900, "priority": 1},
            {"id": "GEN-03", "name": "EHR Patient Record Lookup", "arrival_time": 0.5, "actual_burst_time": 1.3, "data_size_mb": 12, "cpu_cycles_m": 55, "io_ops": 180, "priority": 4},
            {"id": "GEN-04", "name": "MRI 3D Volumetric PACS Render", "arrival_time": 0.8, "actual_burst_time": 36.0, "data_size_mb": 510, "cpu_cycles_m": 2400, "io_ops": 4100, "priority": 3},
            {"id": "GEN-05", "name": "GATK Variant Calling (SNP/Indel)", "arrival_time": 1.2, "actual_burst_time": 54.0, "data_size_mb": 780, "cpu_cycles_m": 3800, "io_ops": 5600, "priority": 2},
            {"id": "GEN-06", "name": "Pharmacy Drug Interaction Check", "arrival_time": 1.6, "actual_burst_time": 2.1, "data_size_mb": 18, "cpu_cycles_m": 85, "io_ops": 240, "priority": 4}
        ]
    },
    "autonomous_robotics": {
        "id": "autonomous_robotics",
        "name": "Autonomous Edge & Robotics Swarm",
        "category": "Robotics & Edge",
        "icon": "Bot",
        "description": "Real-time edge compute cluster balancing mission-critical LiDAR obstacle evasion with background cloud map synchronization.",
        "difficulty": "Critical Convoy Risk",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "AV-01", "name": "SLAM Point-Cloud Global Optimization", "arrival_time": 0.0, "actual_burst_time": 60.0, "data_size_mb": 880, "cpu_cycles_m": 4100, "io_ops": 6200, "priority": 1},
            {"id": "AV-02", "name": "Pedestrian Emergency Braking Vector", "arrival_time": 0.1, "actual_burst_time": 0.6, "data_size_mb": 3, "cpu_cycles_m": 25, "io_ops": 60, "priority": 5},
            {"id": "AV-03", "name": "Traffic Sign Optical Recognition", "arrival_time": 0.3, "actual_burst_time": 2.4, "data_size_mb": 25, "cpu_cycles_m": 120, "io_ops": 310, "priority": 4},
            {"id": "AV-04", "name": "V2X Mesh Inter-Vehicle Ping", "arrival_time": 0.6, "actual_burst_time": 0.8, "data_size_mb": 5, "cpu_cycles_m": 35, "io_ops": 90, "priority": 5},
            {"id": "AV-05", "name": "Waymo Trajectory Path Planner", "arrival_time": 0.9, "actual_burst_time": 4.5, "data_size_mb": 45, "cpu_cycles_m": 210, "io_ops": 440, "priority": 4},
            {"id": "AV-06", "name": "HD Map Tile Delta Compression", "arrival_time": 1.5, "actual_burst_time": 26.0, "data_size_mb": 390, "cpu_cycles_m": 1700, "io_ops": 2900, "priority": 2}
        ]
    },
    "video_streaming_4k": {
        "id": "video_streaming_4k",
        "name": "4K Video Transcode & Live CDN",
        "category": "Media & Streaming",
        "icon": "Video",
        "description": "Multi-bitrate FFmpeg H.265 chunk encoding with strict segment deadline constraints and live CDN manifest dispatching.",
        "difficulty": "Continuous High Throughput",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "VID-01", "name": "4K HDR Chunk Encode (GOP 60)", "arrival_time": 0.0, "actual_burst_time": 50.0, "data_size_mb": 750, "cpu_cycles_m": 3600, "io_ops": 4500, "priority": 2},
            {"id": "VID-02", "name": "HLS m3u8 Manifest Segment Refresh", "arrival_time": 0.2, "actual_burst_time": 0.9, "data_size_mb": 4, "cpu_cycles_m": 30, "io_ops": 120, "priority": 5},
            {"id": "VID-03", "name": "Audio Dolby Atmos Downmix", "arrival_time": 0.5, "actual_burst_time": 5.5, "data_size_mb": 60, "cpu_cycles_m": 240, "io_ops": 600, "priority": 3},
            {"id": "VID-04", "name": "DRM Widevine License Token Gen", "arrival_time": 0.8, "actual_burst_time": 1.1, "data_size_mb": 8, "cpu_cycles_m": 45, "io_ops": 150, "priority": 5},
            {"id": "VID-05", "name": "1080p WebM Preview Chunk Encode", "arrival_time": 1.2, "actual_burst_time": 18.0, "data_size_mb": 250, "cpu_cycles_m": 1100, "io_ops": 1800, "priority": 3},
            {"id": "VID-06", "name": "Thumbnail Mosaic Sprite Stoppage", "arrival_time": 1.8, "actual_burst_time": 3.8, "data_size_mb": 35, "cpu_cycles_m": 160, "io_ops": 380, "priority": 4}
        ]
    },
    "cyber_threat_siem": {
        "id": "cyber_threat_siem",
        "name": "Cyber Threat & SIEM Log Ingestion",
        "category": "Cybersecurity",
        "icon": "ShieldAlert",
        "description": "Massive firewall packet ingestion with immediate automated response to active DDoS attacks and zero-day intrusion signatures.",
        "difficulty": "Burst & High Priority",
        "recommended_algo": "DP-FCFS",
        "tasks": [
            {"id": "SEC-01", "name": "Palo Alto Firewall Syslog Aggregation", "arrival_time": 0.0, "actual_burst_time": 45.0, "data_size_mb": 680, "cpu_cycles_m": 2900, "io_ops": 7500, "priority": 2},
            {"id": "SEC-02", "name": "SYN Flood DDoS IP Blacklist Inject", "arrival_time": 0.1, "actual_burst_time": 0.6, "data_size_mb": 3, "cpu_cycles_m": 25, "io_ops": 80, "priority": 5},
            {"id": "SEC-03", "name": "YARA Malware Binary Memory Scan", "arrival_time": 0.4, "actual_burst_time": 32.0, "data_size_mb": 420, "cpu_cycles_m": 2100, "io_ops": 3400, "priority": 3},
            {"id": "SEC-04", "name": "SSH Brute-force Session Terminate", "arrival_time": 0.7, "actual_burst_time": 0.8, "data_size_mb": 5, "cpu_cycles_m": 35, "io_ops": 90, "priority": 5},
            {"id": "SEC-05", "name": "Zeek Deep Packet Inspection Stream", "arrival_time": 1.1, "actual_burst_time": 22.0, "data_size_mb": 310, "cpu_cycles_m": 1400, "io_ops": 2800, "priority": 3},
            {"id": "SEC-06", "name": "Kerberos Ticket Anomaly Scoring", "arrival_time": 1.5, "actual_burst_time": 4.0, "data_size_mb": 40, "cpu_cycles_m": 180, "io_ops": 420, "priority": 4}
        ]
    }
}


def generate_custom_workload(count=10, distribution="mixed", name="Custom Generated Workload"):
    """
    Generates dynamic custom cloud workloads.
    distribution: 'mixed', 'convoy_heavy', 'uniform_light', 'high_priority'
    """
    import random
    tasks = []
    current_time = 0.0

    for i in range(1, count + 1):
        task_id = f"CUST-{i:03d}"
        
        if distribution == "convoy_heavy" and i == 1:
            # Huge convoy leader
            data_size = random.uniform(800, 1100)
            cpu_cycles = random.uniform(3500, 5000)
            io_ops = random.uniform(6000, 9000)
            priority = 1
            burst = 70.0
        elif distribution == "convoy_heavy":
            # Trailing tiny tasks
            data_size = random.uniform(5, 30)
            cpu_cycles = random.uniform(30, 150)
            io_ops = random.uniform(100, 400)
            priority = random.choice([4, 5])
            burst = (data_size * 0.012) + (cpu_cycles * 0.006) + (io_ops * 0.0015) + (6 - priority) * 0.2
        elif distribution == "uniform_light":
            data_size = random.uniform(10, 80)
            cpu_cycles = random.uniform(50, 400)
            io_ops = random.uniform(200, 1000)
            priority = random.randint(2, 5)
            burst = (data_size * 0.012) + (cpu_cycles * 0.006) + (io_ops * 0.0015) + (6 - priority) * 0.2
        else: # mixed
            data_size = random.uniform(10, 700)
            cpu_cycles = random.uniform(50, 3500)
            io_ops = random.uniform(100, 6000)
            priority = random.randint(1, 5)
            burst = (data_size * 0.012) + (cpu_cycles * 0.006) + (io_ops * 0.0015) + (6 - priority) * 0.2

        burst = round(max(0.5, min(120.0, burst)), 2)
        tasks.append({
            "id": task_id,
            "name": f"Cloud Task #{i} ({distribution.title()})",
            "arrival_time": round(current_time, 2),
            "actual_burst_time": burst,
            "data_size_mb": round(data_size, 1),
            "cpu_cycles_m": round(cpu_cycles, 1),
            "io_ops": int(io_ops),
            "priority": priority
        })
        current_time += round(random.uniform(0.1, 0.8), 2)

    return {
        "id": "custom_generated",
        "name": name,
        "category": "Synthetic Benchmark",
        "icon": "Cpu",
        "description": f"Dynamically synthesized {count}-task workload profile using {distribution} distribution characteristics.",
        "difficulty": "Configurable",
        "recommended_algo": "DP-FCFS",
        "tasks": tasks
    }
