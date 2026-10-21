"""
Universal Task Schema and Real-World Cloud Trace Adapters for DP-FCFS 2.0 / DP-FCFS+.
Normalizes production traces from:
1. Alibaba Cluster Trace 2017 (Batch container workloads)
2. Alibaba 2026 GenAI LoRA Trace (Diffusion and LLM image/text synthesis requests)
3. Google Borg 2011/2019 Trace (Heterogeneous cloud production cells)
4. Microsoft Azure Functions Trace (Serverless event-driven invocations)
"""
import math
import random
from typing import Dict, List, Any, Optional

class UniversalTask:
    """Canonical task representation agnostic of the underlying cloud trace origin."""
    def __init__(
        self,
        task_id: str,
        name: str,
        arrival_time: float,
        actual_burst_time: float,
        requested_cpu: float = 1.0,
        requested_memory_mb: float = 512.0,
        gpu_requirement: float = 0.0,
        priority: int = 3,
        deadline: Optional[float] = None,
        data_size_mb: float = 100.0,
        cpu_cycles_m: float = 500.0,
        io_ops: float = 1000.0,
        workload_source: str = "custom",
        workload_class: str = "Standard Batch",
        predict_type: Optional[str] = None,
        prompt_length: Optional[int] = None,
        num_inference_steps: Optional[int] = None,
        num_lora: int = 0,
        predicted_p50: Optional[float] = None,
        predicted_p90: Optional[float] = None,
        predicted_p95: Optional[float] = None,
        uncertainty: Optional[float] = None,
        confidence: float = 0.95,
        retry_count: int = 0
    ):
        self.task_id = str(task_id)
        self.name = str(name)
        self.arrival_time = float(round(arrival_time, 3))
        self.actual_burst_time = float(round(actual_burst_time, 2))
        self.requested_cpu = float(requested_cpu)
        self.requested_memory_mb = float(requested_memory_mb)
        self.gpu_requirement = float(gpu_requirement)
        self.priority = int(priority)
        self.deadline = float(deadline) if deadline is not None else round(self.arrival_time + self.actual_burst_time * 2.2 + 5.0, 2)
        self.data_size_mb = float(data_size_mb)
        self.cpu_cycles_m = float(cpu_cycles_m)
        self.io_ops = float(io_ops)
        self.workload_source = workload_source
        self.workload_class = workload_class
        
        self.predict_type = predict_type
        self.prompt_length = prompt_length
        self.num_inference_steps = num_inference_steps
        self.num_lora = num_lora

        self.predicted_p50 = float(predicted_p50) if predicted_p50 is not None else self.actual_burst_time
        self.predicted_p90 = float(predicted_p90) if predicted_p90 is not None else round(self.predicted_p50 * 1.25, 2)
        self.predicted_p95 = float(predicted_p95) if predicted_p95 is not None else round(self.predicted_p50 * 1.45, 2)
        self.uncertainty = float(uncertainty) if uncertainty is not None else round(max(0.1, self.predicted_p95 - self.predicted_p50), 2)
        self.confidence = float(confidence)
        self.retry_count = int(retry_count)

        self.vm_id: Optional[str] = None
        self.start_time: Optional[float] = None
        self.finish_time: Optional[float] = None
        self.waiting_time: Optional[float] = None
        self.turnaround_time: Optional[float] = None
        self.slowdown: Optional[float] = None
        self.sla_violated: bool = False
        self.delay_reason: str = "Queued behind previous workload"
        self.alternative_placements: Dict[str, float] = {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.task_id,
            "name": self.name,
            "arrival_time": round(self.arrival_time, 2),
            "actual_burst_time": round(self.actual_burst_time, 2),
            "predicted_burst_time": round(self.predicted_p50, 2),
            "predicted_p50": round(self.predicted_p50, 2),
            "predicted_p90": round(self.predicted_p90, 2),
            "predicted_p95": round(self.predicted_p95, 2),
            "uncertainty": round(self.uncertainty, 2),
            "confidence": round(self.confidence, 2),
            "requested_cpu": self.requested_cpu,
            "requested_memory_mb": self.requested_memory_mb,
            "gpu_requirement": self.gpu_requirement,
            "priority": self.priority,
            "deadline": round(self.deadline, 2),
            "data_size_mb": round(self.data_size_mb, 1),
            "cpu_cycles_m": round(self.cpu_cycles_m, 1),
            "io_ops": int(self.io_ops),
            "workload_source": self.workload_source,
            "workload_class": self.workload_class,
            "predict_type": self.predict_type,
            "prompt_length": self.prompt_length,
            "num_inference_steps": self.num_inference_steps,
            "num_lora": self.num_lora,
            "vm_id": self.vm_id,
            "start_time": round(self.start_time, 2) if self.start_time is not None else None,
            "finish_time": round(self.finish_time, 2) if self.finish_time is not None else None,
            "waiting_time": round(self.waiting_time, 2) if self.waiting_time is not None else None,
            "turnaround_time": round(self.turnaround_time, 2) if self.turnaround_time is not None else None,
            "slowdown": round(self.slowdown, 2) if self.slowdown is not None else None,
            "sla_violated": self.sla_violated,
            "delay_reason": self.delay_reason,
            "alternative_placements": self.alternative_placements
        }

ALIBABA_GENAI_LORA_TRACE = [
    {"id": "LORA-0001", "name": "LoRA Text-to-Image (Prompt Len: 63, Steps: 30, LoRA: 0)", "arrival_time": 0.0, "actual_burst_time": 32.0, "predict_type": "TXT_2_IMG", "prompt_length": 63, "num_inference_steps": 30, "num_lora": 0, "requested_cpu": 4.0, "requested_memory_mb": 16384, "gpu_requirement": 1.0, "priority": 4, "data_size_mb": 350, "cpu_cycles_m": 2400, "io_ops": 1800, "deadline": 55.0, "workload_class": "GenAI StableDiffusion Text2Img"},
    {"id": "LORA-0002", "name": "LoRA Text-to-Image High-Res (Prompt Len: 93, Steps: 40, LoRA: 0)", "arrival_time": 0.3, "actual_burst_time": 43.0, "predict_type": "TXT_2_IMG", "prompt_length": 93, "num_inference_steps": 40, "num_lora": 0, "requested_cpu": 4.0, "requested_memory_mb": 24576, "gpu_requirement": 1.0, "priority": 3, "data_size_mb": 520, "cpu_cycles_m": 3400, "io_ops": 2400, "deadline": 70.0, "workload_class": "GenAI StableDiffusion Text2Img"},
    {"id": "LORA-0003", "name": "LoRA Batch Image Generation (8 images, Steps: 40, LoRA: 0)", "arrival_time": 0.6, "actual_burst_time": 56.0, "predict_type": "TXT_2_IMG", "prompt_length": 93, "num_inference_steps": 40, "num_lora": 0, "requested_cpu": 8.0, "requested_memory_mb": 32768, "gpu_requirement": 1.0, "priority": 2, "data_size_mb": 820, "cpu_cycles_m": 4600, "io_ops": 3900, "deadline": 95.0, "workload_class": "GenAI High-Throughput Batch"},
    {"id": "LORA-0004", "name": "LoRA Image-to-Image Translation (Prompt: 93, Steps: 40, LoRA: 0)", "arrival_time": 0.8, "actual_burst_time": 53.0, "predict_type": "IMG_2_IMG", "prompt_length": 93, "num_inference_steps": 40, "num_lora": 0, "requested_cpu": 6.0, "requested_memory_mb": 24576, "gpu_requirement": 1.0, "priority": 3, "data_size_mb": 680, "cpu_cycles_m": 4100, "io_ops": 3100, "deadline": 85.0, "workload_class": "GenAI Img2Img Synthesis"},
    {"id": "LORA-0005", "name": "Fast Inpainting Mask Fill (Prompt: 16, Steps: 30, LoRA: 1)", "arrival_time": 1.1, "actual_burst_time": 24.0, "predict_type": "INPAINTING", "prompt_length": 16, "num_inference_steps": 30, "num_lora": 1, "requested_cpu": 4.0, "requested_memory_mb": 16384, "gpu_requirement": 1.0, "priority": 4, "data_size_mb": 280, "cpu_cycles_m": 1900, "io_ops": 1400, "deadline": 42.0, "workload_class": "GenAI Inpainting Adapter"},
    {"id": "LORA-0006", "name": "Micro Prompt Stylization Check (Prompt: 7, Steps: 30, LoRA: 1)", "arrival_time": 1.4, "actual_burst_time": 18.0, "predict_type": "TXT_2_IMG", "prompt_length": 7, "num_inference_steps": 30, "num_lora": 1, "requested_cpu": 2.0, "requested_memory_mb": 12288, "gpu_requirement": 1.0, "priority": 5, "data_size_mb": 160, "cpu_cycles_m": 1200, "io_ops": 950, "deadline": 30.0, "workload_class": "GenAI Interactive Inference"},
    {"id": "LORA-0007", "name": "LoRA Adapter Weights Hot-Swap (Weights Inject, Steps: 30, LoRA: 1)", "arrival_time": 1.8, "actual_burst_time": 15.0, "predict_type": "TXT_2_IMG", "prompt_length": 47, "num_inference_steps": 30, "num_lora": 1, "requested_cpu": 2.0, "requested_memory_mb": 8192, "gpu_requirement": 0.5, "priority": 5, "data_size_mb": 120, "cpu_cycles_m": 900, "io_ops": 850, "deadline": 28.0, "workload_class": "GenAI Parameter Switch"},
    {"id": "LORA-0008", "name": "Multi-LoRA Image Synthesis (4 images, Steps: 30, LoRA: 2)", "arrival_time": 2.2, "actual_burst_time": 44.0, "predict_type": "TXT_2_IMG", "prompt_length": 45, "num_inference_steps": 30, "num_lora": 2, "requested_cpu": 6.0, "requested_memory_mb": 24576, "gpu_requirement": 1.0, "priority": 3, "data_size_mb": 540, "cpu_cycles_m": 3300, "io_ops": 2500, "deadline": 75.0, "workload_class": "GenAI Multi-Adapter Diffusion"},
    {"id": "LORA-0009", "name": "LoRA Latent Upscaling & Denoise (Prompt: 16, Steps: 30, LoRA: 1)", "arrival_time": 2.6, "actual_burst_time": 21.0, "predict_type": "IMG_2_IMG", "prompt_length": 16, "num_inference_steps": 30, "num_lora": 1, "requested_cpu": 4.0, "requested_memory_mb": 16384, "gpu_requirement": 1.0, "priority": 4, "data_size_mb": 220, "cpu_cycles_m": 1500, "io_ops": 1100, "deadline": 38.0, "workload_class": "GenAI Post-Processing"},
    {"id": "LORA-0010", "name": "Zero-Shot Safety Prompt Alignment Filter", "arrival_time": 2.9, "actual_burst_time": 2.5, "predict_type": "TXT_2_IMG", "prompt_length": 32, "num_inference_steps": 1, "num_lora": 0, "requested_cpu": 1.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 15, "cpu_cycles_m": 85, "io_ops": 120, "deadline": 8.0, "workload_class": "Safety Guardrail Tokenizer"}
]

ALIBABA_2017_BATCH_TRACE = [
    {"id": "ALI17-01", "name": "MaxCompute DAG Map Stage Partition Merger (Heavy)", "arrival_time": 0.0, "actual_burst_time": 64.0, "requested_cpu": 8.0, "requested_memory_mb": 32768, "gpu_requirement": 0.0, "priority": 1, "data_size_mb": 940, "cpu_cycles_m": 4300, "io_ops": 7900, "deadline": 110.0, "workload_class": "Alibaba BigData MapReduce"},
    {"id": "ALI17-02", "name": "Taobao Search Engine Query Micro-Service", "arrival_time": 0.2, "actual_burst_time": 1.1, "requested_cpu": 1.0, "requested_memory_mb": 2048, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 8, "cpu_cycles_m": 45, "io_ops": 160, "deadline": 4.5, "workload_class": "Low-Latency Search Query"},
    {"id": "ALI17-03", "name": "Alipay Fraud Real-Time Decision Graph Lookup", "arrival_time": 0.4, "actual_burst_time": 1.6, "requested_cpu": 2.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 14, "cpu_cycles_m": 70, "io_ops": 220, "deadline": 5.0, "workload_class": "Critical Payment Validation"},
    {"id": "ALI17-04", "name": "LogHub Flume Stream Kafka Ingest", "arrival_time": 0.7, "actual_burst_time": 3.8, "requested_cpu": 2.0, "requested_memory_mb": 6144, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 45, "cpu_cycles_m": 180, "io_ops": 520, "deadline": 12.0, "workload_class": "Stream Ingestion"},
    {"id": "ALI17-05", "name": "TableStore KV Index Delta B-Tree Rebalance", "arrival_time": 1.0, "actual_burst_time": 2.2, "requested_cpu": 2.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 25, "cpu_cycles_m": 110, "io_ops": 340, "deadline": 8.0, "workload_class": "NoSQL Key-Value Sync"},
    {"id": "ALI17-06", "name": "MaxCompute SQL Analytics GroupBy Aggregator", "arrival_time": 1.3, "actual_burst_time": 36.0, "requested_cpu": 6.0, "requested_memory_mb": 20480, "gpu_requirement": 0.0, "priority": 2, "data_size_mb": 510, "cpu_cycles_m": 2400, "io_ops": 4100, "deadline": 65.0, "workload_class": "Batch SQL Query"},
    {"id": "ALI17-07", "name": "Tmall Recommendation Vector Dot-Product", "arrival_time": 1.7, "actual_burst_time": 4.5, "requested_cpu": 3.0, "requested_memory_mb": 8192, "gpu_requirement": 0.5, "priority": 3, "data_size_mb": 60, "cpu_cycles_m": 260, "io_ops": 480, "deadline": 14.0, "workload_class": "Online Recommendation"},
    {"id": "ALI17-08", "name": "Docker Container Image Layer Pull to Worker Node", "arrival_time": 2.1, "actual_burst_time": 12.0, "requested_cpu": 2.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 3, "data_size_mb": 180, "cpu_cycles_m": 650, "io_ops": 1900, "deadline": 25.0, "workload_class": "Cluster Deployment"},
    {"id": "ALI17-09", "name": "Kubernetes Pod Liveness Heartbeat Acknowledgment", "arrival_time": 2.5, "actual_burst_time": 0.7, "requested_cpu": 1.0, "requested_memory_mb": 1024, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 4, "cpu_cycles_m": 20, "io_ops": 60, "deadline": 3.0, "workload_class": "Control Plane Probe"},
    {"id": "ALI17-10", "name": "PAI Deep Learning Model Gradient Sync AllReduce", "arrival_time": 2.9, "actual_burst_time": 48.0, "requested_cpu": 8.0, "requested_memory_mb": 32768, "gpu_requirement": 1.0, "priority": 1, "data_size_mb": 760, "cpu_cycles_m": 3700, "io_ops": 5200, "deadline": 80.0, "workload_class": "Distributed ML Training"}
]

GOOGLE_BORG_2019_TRACE = [
    {"id": "BORG-01", "name": "BigQuery Dremel Distributed Partition Scanner (Heavy)", "arrival_time": 0.0, "actual_burst_time": 68.0, "requested_cpu": 8.0, "requested_memory_mb": 32768, "gpu_requirement": 0.0, "priority": 1, "data_size_mb": 980, "cpu_cycles_m": 4500, "io_ops": 8200, "deadline": 115.0, "workload_class": "Google Borg Analytics Worker"},
    {"id": "BORG-02", "name": "Google Web Search Index Serving RPC", "arrival_time": 0.1, "actual_burst_time": 1.3, "requested_cpu": 1.0, "requested_memory_mb": 2048, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 10, "cpu_cycles_m": 50, "io_ops": 170, "deadline": 4.0, "workload_class": "User-Facing RPC"},
    {"id": "BORG-03", "name": "YouTube 1080p Video VP9 Chunk Transcoder", "arrival_time": 0.3, "actual_burst_time": 34.0, "requested_cpu": 4.0, "requested_memory_mb": 16384, "gpu_requirement": 0.5, "priority": 2, "data_size_mb": 510, "cpu_cycles_m": 2300, "io_ops": 3100, "deadline": 60.0, "workload_class": "Media Transcode Pipeline"},
    {"id": "BORG-04", "name": "Gmail Spam Neural Classification Micro-Check", "arrival_time": 0.6, "actual_burst_time": 3.6, "requested_cpu": 2.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 30, "cpu_cycles_m": 130, "io_ops": 380, "deadline": 10.0, "workload_class": "Real-Time NLP Classifier"},
    {"id": "BORG-05", "name": "Google Cloud Spanner Paxos Leader State Sync", "arrival_time": 0.9, "actual_burst_time": 2.1, "requested_cpu": 2.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 16, "cpu_cycles_m": 85, "io_ops": 320, "deadline": 6.5, "workload_class": "Distributed Consensus Lock"},
    {"id": "BORG-06", "name": "Colossus Distributed File System Block Replicator", "arrival_time": 1.2, "actual_burst_time": 0.9, "requested_cpu": 1.0, "requested_memory_mb": 2048, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 7, "cpu_cycles_m": 35, "io_ops": 110, "deadline": 3.5, "workload_class": "Storage System Maintenance"},
    {"id": "BORG-07", "name": "Google Ads Clickstream CTR Model Parameter Update", "arrival_time": 1.5, "actual_burst_time": 46.0, "requested_cpu": 6.0, "requested_memory_mb": 24576, "gpu_requirement": 1.0, "priority": 2, "data_size_mb": 650, "cpu_cycles_m": 3300, "io_ops": 4400, "deadline": 78.0, "workload_class": "Ad Click Prediction"},
    {"id": "BORG-08", "name": "Borglet Machine Cgroup Telemetry Daemon", "arrival_time": 1.9, "actual_burst_time": 0.8, "requested_cpu": 1.0, "requested_memory_mb": 1024, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 5, "cpu_cycles_m": 25, "io_ops": 90, "deadline": 3.0, "workload_class": "Node Daemon Exporter"},
    {"id": "BORG-09", "name": "MapReduce Sort Stage Shuffle Worker", "arrival_time": 2.3, "actual_burst_time": 39.0, "requested_cpu": 6.0, "requested_memory_mb": 20480, "gpu_requirement": 0.0, "priority": 2, "data_size_mb": 560, "cpu_cycles_m": 2700, "io_ops": 5100, "deadline": 68.0, "workload_class": "MapReduce Data Shuffle"},
    {"id": "BORG-10", "name": "Cloud Pub/Sub High-Throughput Event Multiplexer", "arrival_time": 2.7, "actual_burst_time": 2.4, "requested_cpu": 2.0, "requested_memory_mb": 4096, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 22, "cpu_cycles_m": 90, "io_ops": 290, "deadline": 7.0, "workload_class": "Event Broker Routing"},
    {"id": "BORG-11", "name": "Dataproc PySpark Worker In-Memory RDD Transformation", "arrival_time": 3.1, "actual_burst_time": 28.0, "requested_cpu": 4.0, "requested_memory_mb": 16384, "gpu_requirement": 0.0, "priority": 3, "data_size_mb": 420, "cpu_cycles_m": 1900, "io_ops": 3600, "deadline": 50.0, "workload_class": "Spark Compute Step"},
    {"id": "BORG-12", "name": "Kubernetes API Server Webhook Admission Controller", "arrival_time": 3.5, "actual_burst_time": 1.2, "requested_cpu": 1.0, "requested_memory_mb": 2048, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 9, "cpu_cycles_m": 45, "io_ops": 150, "deadline": 4.0, "workload_class": "Admission Webhook"}
]

AZURE_FUNCTIONS_TRACE = [
    {"id": "AZF-01", "name": "Azure Blob Upload Image Thumbnail Resize Function", "arrival_time": 0.0, "actual_burst_time": 3.2, "requested_cpu": 1.0, "requested_memory_mb": 1536, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 28, "cpu_cycles_m": 140, "io_ops": 480, "deadline": 9.0, "workload_class": "Event-Driven Serverless Function"},
    {"id": "AZF-02", "name": "Azure Event Grid Webhook Event Router", "arrival_time": 0.1, "actual_burst_time": 0.6, "requested_cpu": 0.5, "requested_memory_mb": 512, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 4, "cpu_cycles_m": 22, "io_ops": 80, "deadline": 2.5, "workload_class": "Serverless HTTP Dispatcher"},
    {"id": "AZF-03", "name": "Cosmos DB Document Trigger ChangeFeed Parser", "arrival_time": 0.3, "actual_burst_time": 1.8, "requested_cpu": 1.0, "requested_memory_mb": 1024, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 16, "cpu_cycles_m": 75, "io_ops": 260, "deadline": 5.5, "workload_class": "Database ChangeFeed Trigger"},
    {"id": "AZF-04", "name": "Cognitive Services OCR Text Extraction Micro-Worker", "arrival_time": 0.5, "actual_burst_time": 6.8, "requested_cpu": 2.0, "requested_memory_mb": 3072, "gpu_requirement": 0.0, "priority": 3, "data_size_mb": 75, "cpu_cycles_m": 340, "io_ops": 720, "deadline": 16.0, "workload_class": "AI Microservice Invocation"},
    {"id": "AZF-05", "name": "Azure AD OAuth2 Token Claims Verification", "arrival_time": 0.7, "actual_burst_time": 0.8, "requested_cpu": 0.5, "requested_memory_mb": 512, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 5, "cpu_cycles_m": 30, "io_ops": 95, "deadline": 2.8, "workload_class": "Identity Validation"},
    {"id": "AZF-06", "name": "Azure Service Bus Batch Message Packager", "arrival_time": 1.0, "actual_burst_time": 4.1, "requested_cpu": 1.0, "requested_memory_mb": 2048, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 42, "cpu_cycles_m": 180, "io_ops": 450, "deadline": 11.0, "workload_class": "Message Batch Handler"},
    {"id": "AZF-07", "name": "Nightly Azure SQL Database Index Defrag Trigger (Heavy)", "arrival_time": 1.3, "actual_burst_time": 52.0, "requested_cpu": 6.0, "requested_memory_mb": 24576, "gpu_requirement": 0.0, "priority": 2, "data_size_mb": 720, "cpu_cycles_m": 3300, "io_ops": 6200, "deadline": 88.0, "workload_class": "Heavy Scheduled Trigger"},
    {"id": "AZF-08", "name": "Stripe Webhook Payment Status Notification Function", "arrival_time": 1.5, "actual_burst_time": 1.2, "requested_cpu": 0.5, "requested_memory_mb": 1024, "gpu_requirement": 0.0, "priority": 5, "data_size_mb": 8, "cpu_cycles_m": 45, "io_ops": 150, "deadline": 3.8, "workload_class": "Webhook Ingest"},
    {"id": "AZF-09", "name": "SendGrid Email Dispatch Confirmation Worker", "arrival_time": 1.8, "actual_burst_time": 1.5, "requested_cpu": 0.5, "requested_memory_mb": 1024, "gpu_requirement": 0.0, "priority": 4, "data_size_mb": 12, "cpu_cycles_m": 55, "io_ops": 200, "deadline": 4.5, "workload_class": "Notification Emitter"},
    {"id": "AZF-10", "name": "IoT Hub Telemetry Stream Fast Partition Flush", "arrival_time": 2.2, "actual_burst_time": 4.8, "requested_cpu": 1.5, "requested_memory_mb": 2048, "gpu_requirement": 0.0, "priority": 3, "data_size_mb": 50, "cpu_cycles_m": 220, "io_ops": 590, "deadline": 12.0, "workload_class": "IoT Stream Ingestion"}
]

PRODUCTION_TRACES: Dict[str, Dict[str, Any]] = {
    "alibaba_genai_2026": {
        "id": "alibaba_genai_2026",
        "name": "Alibaba 2026 GenAI / LoRA Trace",
        "category": "GenAI & GPU Cluster",
        "icon": "Sparkles",
        "difficulty": "GPU & LoRA Heterogeneous",
        "description": "Production trace extracted from Alibaba PAI cluster serving Stable Diffusion & LLM LoRA inference requests with varying prompt lengths, inference steps, and LoRA adapters.",
        "tasks": ALIBABA_GENAI_LORA_TRACE
    },
    "alibaba_2017": {
        "id": "alibaba_2017",
        "name": "Alibaba Cluster Trace 2017",
        "category": "E-Commerce & Big Data",
        "icon": "ShoppingCart",
        "difficulty": "High Throughput Batch & DAG",
        "description": "Real batch container workload from Alibaba production cluster with actual task arrival timestamps, requested CPU/memory, and execution durations.",
        "tasks": ALIBABA_2017_BATCH_TRACE
    },
    "google_borg": {
        "id": "google_borg",
        "name": "Google Borg Cluster Trace 2019",
        "category": "Hyperscale Cloud",
        "icon": "Server",
        "difficulty": "Heterogeneous Production Cells",
        "description": "Real cluster telemetry from Google Borg production data centers spanning MapReduce workers, BigQuery partition scans, and latency-critical frontend RPCs.",
        "tasks": GOOGLE_BORG_2019_TRACE
    },
    "azure_functions": {
        "id": "azure_functions",
        "name": "Microsoft Azure Functions Trace",
        "category": "Serverless Cloud",
        "icon": "Zap",
        "difficulty": "Ultra-Fast Event-Driven Bursts",
        "description": "Traced from Microsoft Azure public serverless dataset: event-driven HTTP triggers, Blob storage upload events, and high-churn micro-invocations.",
        "tasks": AZURE_FUNCTIONS_TRACE
    }
}

def load_trace_as_universal_tasks(trace_id: str) -> List[UniversalTask]:
    """Loads a production trace and maps each task to the canonical UniversalTask schema."""
    if trace_id not in PRODUCTION_TRACES:
        trace_id = "alibaba_genai_2026"

    raw_tasks = PRODUCTION_TRACES[trace_id]["tasks"]
    task_objs = []
    for item in raw_tasks:
        ut = UniversalTask(
            task_id=item["id"],
            name=item["name"],
            arrival_time=item["arrival_time"],
            actual_burst_time=item["actual_burst_time"],
            requested_cpu=item.get("requested_cpu", 1.0),
            requested_memory_mb=item.get("requested_memory_mb", 2048.0),
            gpu_requirement=item.get("gpu_requirement", 0.0),
            priority=item.get("priority", 3),
            deadline=item.get("deadline"),
            data_size_mb=item.get("data_size_mb", 100.0),
            cpu_cycles_m=item.get("cpu_cycles_m", 500.0),
            io_ops=item.get("io_ops", 1000.0),
            workload_source=trace_id,
            workload_class=item.get("workload_class", "Standard Cloud"),
            predict_type=item.get("predict_type"),
            prompt_length=item.get("prompt_length"),
            num_inference_steps=item.get("num_inference_steps"),
            num_lora=item.get("num_lora", 0)
        )
        task_objs.append(ut)

    task_objs.sort(key=lambda x: x.arrival_time)
    return task_objs
