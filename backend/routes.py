"""
API Routes Definition for DP-FCFS Backend.
Provides endpoints for task management, ML burst time prediction, discrete-event cloud simulation,
and multi-algorithm benchmarking (FCFS vs Non-Preemptive SJF vs DP-FCFS).
"""
import os
import json
import random
import copy
from flask import Blueprint, jsonify, request, send_from_directory
from predictor import predictor
from scheduler import scheduler_engine
from workloads import REAL_WORLD_SCENARIOS, generate_custom_workload
from trace_adapters import PRODUCTION_TRACES, load_trace_as_universal_tasks, UniversalTask
from uncertainty_model import uncertainty_predictor
from dp_fcfs_plus import dp_fcfs_plus_engine
from leak_free_engine import leak_free_engine

api_bp = Blueprint('api', __name__)


# In-memory initial workload dataset
INITIAL_TASKS = [
    {"id": "TSK-101", "name": "ETL Pipeline Process", "arrival_time": 0.0, "actual_burst_time": 45.0, "data_size_mb": 450, "cpu_cycles_m": 2200, "io_ops": 3500, "priority": 1},
    {"id": "TSK-102", "name": "Image Thumbnail Gen", "arrival_time": 0.5, "actual_burst_time": 3.0, "data_size_mb": 25, "cpu_cycles_m": 120, "io_ops": 400, "priority": 3},
    {"id": "TSK-103", "name": "User Auth Verification", "arrival_time": 1.0, "actual_burst_time": 1.5, "data_size_mb": 10, "cpu_cycles_m": 60, "io_ops": 200, "priority": 5},
    {"id": "TSK-104", "name": "Database Query Analytics", "arrival_time": 1.5, "actual_burst_time": 38.0, "data_size_mb": 380, "cpu_cycles_m": 1900, "io_ops": 4800, "priority": 2},
    {"id": "TSK-105", "name": "Email Notification Batch", "arrival_time": 2.0, "actual_burst_time": 4.0, "data_size_mb": 30, "cpu_cycles_m": 150, "io_ops": 600, "priority": 4},
    {"id": "TSK-106", "name": "Log Aggregation Sync", "arrival_time": 2.5, "actual_burst_time": 2.5, "data_size_mb": 20, "cpu_cycles_m": 100, "io_ops": 300, "priority": 3},
    {"id": "TSK-107", "name": "Deep Learning Inference", "arrival_time": 3.0, "actual_burst_time": 52.0, "data_size_mb": 600, "cpu_cycles_m": 3500, "io_ops": 2000, "priority": 1},
    {"id": "TSK-108", "name": "Cache Maintenance Job", "arrival_time": 3.5, "actual_burst_time": 2.0, "data_size_mb": 15, "cpu_cycles_m": 80, "io_ops": 250, "priority": 4}
]

tasks_store = [dict(t) for t in INITIAL_TASKS]
# Attach initial ML predictions
for t in tasks_store:
    t['predicted_burst_time'] = predictor.predict_burst_time(
        t['data_size_mb'], t['cpu_cycles_m'], t['io_ops'], t['priority']
    )

servers_store = [
    {"id": "VM-1", "name": "Cloud Node Alpha (VM-1)", "cpus": 4, "ram_gb": 16, "status": "active"},
    {"id": "VM-2", "name": "Cloud Node Beta (VM-2)", "cpus": 4, "ram_gb": 16, "status": "active"},
    {"id": "VM-3", "name": "Cloud Node Gamma (VM-3)", "cpus": 4, "ram_gb": 16, "status": "active"}
]

@api_bp.route('/', methods=['GET'])
def index():
    return jsonify({
        "project": "Dynamic Predictive FCFS (DP-FCFS)",
        "version": "2.0.0",
        "status": "Running"
    })

@api_bp.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@api_bp.route('/api/version', methods=['GET'])
def version():
    return jsonify({"version": "2.0.0"})

# --- Tasks Routes ---
@api_bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks_store)

@api_bp.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    new_id = f"TSK-{random.randint(200, 999)}"
    
    data_size_mb = float(data.get('data_size_mb', 100))
    cpu_cycles_m = float(data.get('cpu_cycles_m', 500))
    io_ops = float(data.get('io_ops', 1000))
    priority = int(data.get('priority', 3))
    arrival_time = float(data.get('arrival_time', 0.0))
    actual_burst_time = float(data.get('actual_burst_time', data.get('burst_time', 10.0)))

    predicted_burst = predictor.predict_burst_time(data_size_mb, cpu_cycles_m, io_ops, priority)

    new_task = {
        "id": data.get('id', new_id),
        "name": data.get('name', f"Task {new_id}"),
        "arrival_time": arrival_time,
        "actual_burst_time": actual_burst_time,
        "predicted_burst_time": predicted_burst,
        "data_size_mb": data_size_mb,
        "cpu_cycles_m": cpu_cycles_m,
        "io_ops": io_ops,
        "priority": priority
    }
    tasks_store.append(new_task)
    return jsonify({"message": "Task created", "task": new_task}), 201

@api_bp.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks_store
    tasks_store = [t for t in tasks_store if t['id'] != task_id]
    return jsonify({"message": f"Task {task_id} deleted"})

@api_bp.route('/api/tasks/reset', methods=['POST'])
def reset_tasks():
    global tasks_store
    tasks_store = [dict(t) for t in INITIAL_TASKS]
    for t in tasks_store:
        t['predicted_burst_time'] = predictor.predict_burst_time(
            t['data_size_mb'], t['cpu_cycles_m'], t['io_ops'], t['priority']
        )
    return jsonify({"message": "Workload reset to default", "tasks": tasks_store})

@api_bp.route('/api/tasks/batch-import', methods=['POST'])
def batch_import_tasks():
    global tasks_store
    data = request.get_json() or {}
    new_tasks = data.get('tasks', [])
    if not isinstance(new_tasks, list):
        return jsonify({"error": "Invalid tasks payload format"}), 400

    imported = []
    for item in new_tasks:
        data_size_mb = float(item.get('data_size_mb', 100))
        cpu_cycles_m = float(item.get('cpu_cycles_m', 500))
        io_ops = float(item.get('io_ops', 1000))
        priority = int(item.get('priority', 3))
        arrival_time = float(item.get('arrival_time', 0.0))
        actual_burst = float(item.get('actual_burst_time', item.get('burst_time', 10.0)))
        task_id = item.get('id', f"TSK-{random.randint(200, 999)}")
        name = item.get('name', f"Task {task_id}")

        predicted = predictor.predict_burst_time(data_size_mb, cpu_cycles_m, io_ops, priority)
        t_obj = {
            "id": task_id,
            "name": name,
            "arrival_time": arrival_time,
            "actual_burst_time": actual_burst,
            "predicted_burst_time": predicted,
            "data_size_mb": data_size_mb,
            "cpu_cycles_m": cpu_cycles_m,
            "io_ops": io_ops,
            "priority": priority
        }
        imported.append(t_obj)

    tasks_store = imported
    return jsonify({"message": f"Successfully imported {len(imported)} tasks", "tasks": tasks_store})

# --- Servers / VM Routes ---
@api_bp.route('/api/servers', methods=['GET'])
def get_servers():
    return jsonify(servers_store)

@api_bp.route('/api/servers', methods=['POST'])
def add_server():
    global servers_store
    data = request.get_json() or {}
    new_id = f"VM-{len(servers_store) + 1}"
    new_vm = {
        "id": data.get("id", new_id),
        "name": data.get("name", f"Cloud Node ({new_id})"),
        "cpus": int(data.get("cpus", 4)),
        "ram_gb": int(data.get("ram_gb", 16)),
        "status": "active"
    }
    servers_store.append(new_vm)
    return jsonify({"message": "Server node added", "server": new_vm}), 201

@api_bp.route('/api/servers/<server_id>', methods=['DELETE'])
def remove_server(server_id):
    global servers_store
    if len(servers_store) <= 1:
        return jsonify({"error": "Cannot remove the last active server node."}), 400
    servers_store = [s for s in servers_store if s['id'] != server_id]
    return jsonify({"message": f"Server {server_id} removed", "servers": servers_store})

# --- Predictor Routes ---
@api_bp.route('/api/predict', methods=['POST'])
def predict_burst():
    data = request.get_json() or {}
    data_size_mb = float(data.get('data_size_mb', 100))
    cpu_cycles_m = float(data.get('cpu_cycles_m', 500))
    io_ops = float(data.get('io_ops', 1000))
    priority = int(data.get('priority', 3))

    predicted_val = predictor.predict_burst_time(data_size_mb, cpu_cycles_m, io_ops, priority)
    return jsonify({
        "input": {
            "data_size_mb": data_size_mb,
            "cpu_cycles_m": cpu_cycles_m,
            "io_ops": io_ops,
            "priority": priority
        },
        "predicted_burst_time": predicted_val
    })

@api_bp.route('/api/predict/metrics', methods=['GET'])
def get_predictor_metrics():
    return jsonify(predictor.get_metrics())

@api_bp.route('/api/predict/curve', methods=['GET', 'POST'])
def get_predict_curves():
    inputs = None
    if request.method == 'POST':
        inputs = request.get_json()
    return jsonify(predictor.generate_sensitivity_curves(inputs))

@api_bp.route('/api/predict/comparison', methods=['GET'])
def get_predict_comparison():
    samples = int(request.args.get('samples', 25))
    return jsonify(predictor.get_comparison_dataset(samples))

@api_bp.route('/api/predict/residuals', methods=['GET'])
def get_predict_residuals():
    return jsonify(predictor.get_residual_distribution())

@api_bp.route('/api/predict/uncertainty', methods=['POST'])
def predict_burst_uncertainty():
    """Predicts burst time with multi-quantile uncertainty bounds (P50, P90, P95) and concept drift."""
    data = request.get_json() or {}
    data_size_mb = float(data.get('data_size_mb', 100))
    cpu_cycles_m = float(data.get('cpu_cycles_m', 500))
    io_ops = float(data.get('io_ops', 1000))
    priority = int(data.get('priority', 3))
    predict_type = data.get('predict_type')
    num_inference_steps = data.get('num_inference_steps')
    prompt_length = data.get('prompt_length')
    num_lora = int(data.get('num_lora', 0))
    workload_source = data.get('workload_source', 'custom')

    prediction = uncertainty_predictor.predict_quantiles(
        data_size_mb=data_size_mb,
        cpu_cycles_m=cpu_cycles_m,
        io_ops=io_ops,
        priority=priority,
        predict_type=predict_type,
        num_inference_steps=num_inference_steps,
        prompt_length=prompt_length,
        num_lora=num_lora,
        workload_source=workload_source
    )
    return jsonify(prediction)

# --- Cloud Simulation & Benchmark Routes ---
@api_bp.route('/api/simulation/run', methods=['POST'])
def run_simulation():
    data = request.get_json() or {}
    raw_algo = str(data.get('algorithm', 'dp_fcfs')).lower().strip()
    algo = raw_algo.replace('-', '_').replace(' ', '_')
    num_vms = int(data.get('num_vms', len(servers_store)))
    time_quantum = float(data.get('time_quantum', 4.0))
    input_tasks = data.get('tasks', tasks_store)

    reserve_light = int(data.get('reserve_light', 1))
    guard_wait = float(data.get('guard_wait', 40.0))
    calibrate = bool(data.get('calibrate', True))
    overrun_aware = bool(data.get('overrun_aware', True))
    heavy_thr = float(data.get('heavy_thr', 15.0))
    lam = float(data.get('lam', 0.2))

    if algo in ['fcfs', 'standard_fcfs', 'fcfs_static']:
        result = scheduler_engine.run_fcfs(input_tasks, num_vms)
    elif algo in ['fcfs_jsq', 'jsq']:
        result = scheduler_engine.run_fcfs_jsq(input_tasks, num_vms)
    elif algo in ['sjf', 'sjf_non_preemptive', 'sjf_oracle']:
        result = scheduler_engine.run_sjf_non_preemptive(input_tasks, num_vms)
    elif algo in ['rr', 'round_robin']:
        result = scheduler_engine.run_round_robin(input_tasks, num_vms, time_quantum=time_quantum)
    elif algo in ['priority', 'priority_aging']:
        result = scheduler_engine.run_priority_aging(input_tasks, num_vms)
    elif algo in ['dp_fcfs_shield', 'shield', 'dp_shield', 'dp_fcfs+shield', 'dpfcfs_shield']:
        result = scheduler_engine.run_dp_fcfs_shield(
            input_tasks, num_vms,
            reserve_light=reserve_light,
            guard_wait=guard_wait,
            calibrate=calibrate,
            overrun_aware=overrun_aware,
            heavy_thr=heavy_thr,
            lam=lam
        )
    else:
        result = scheduler_engine.run_dp_fcfs(input_tasks, num_vms)

    return jsonify(result)

@api_bp.route('/api/simulation/compare', methods=['POST'])
@api_bp.route('/api/benchmark', methods=['GET', 'POST'])
def compare_algorithms():
    """Runs Standard FCFS, Non-Preemptive SJF, RR, Priority Aging, and DP-FCFS on the exact same task set."""
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
    else:
        data = {}

    num_vms = int(request.args.get('nodes', data.get('num_vms', len(servers_store))))
    time_quantum = float(request.args.get('time_quantum', data.get('time_quantum', 4.0)))
    input_tasks = data.get('tasks', tasks_store)

    result = scheduler_engine.compare_all(input_tasks, num_vms, time_quantum=time_quantum)
    return jsonify(result)

@api_bp.route('/api/simulation/compare-plus', methods=['POST'])
def compare_algorithms_plus():
    """Runs DP-FCFS 2.0 / DP-FCFS+ benchmark on heterogeneous cloud cluster with 7-algorithm suite."""
    data = request.get_json(silent=True) or {}
    num_nodes = int(data.get('num_nodes', data.get('num_vms', 4)))
    mode = data.get('mode', 'balanced')
    reserve_shield = bool(data.get('reserve_shield', True))
    raw_tasks = data.get('tasks', tasks_store)

    tasks_to_run = []
    for t in raw_tasks:
        if isinstance(t, UniversalTask):
            tasks_to_run.append(t)
        elif isinstance(t, dict):
            ut = UniversalTask(
                task_id=t.get('task_id', t.get('id', 'TSK-0')),
                name=t.get('name', 'Task'),
                arrival_time=float(t.get('arrival_time', 0.0)),
                actual_burst_time=float(t.get('actual_burst_time', t.get('burst_time', 10.0))),
                requested_cpu=float(t.get('requested_cpu', 1.0)),
                requested_memory_mb=float(t.get('requested_memory_mb', 2048.0)),
                gpu_requirement=float(t.get('gpu_requirement', 0.0)),
                priority=int(t.get('priority', 3)),
                deadline=t.get('deadline'),
                data_size_mb=float(t.get('data_size_mb', 100.0)),
                cpu_cycles_m=float(t.get('cpu_cycles_m', 500.0)),
                io_ops=float(t.get('io_ops', 1000.0)),
                workload_source=t.get('workload_source', 'custom'),
                workload_class=t.get('workload_class', 'Standard Cloud'),
                predict_type=t.get('predict_type'),
                prompt_length=t.get('prompt_length'),
                num_inference_steps=t.get('num_inference_steps'),
                num_lora=int(t.get('num_lora', 0)),
                predicted_p50=t.get('predicted_p50', t.get('predicted_burst_time')),
                predicted_p90=t.get('predicted_p90'),
                predicted_p95=t.get('predicted_p95'),
                uncertainty=t.get('uncertainty'),
                confidence=float(t.get('confidence', 0.95))
            )
            tasks_to_run.append(ut)

    result = dp_fcfs_plus_engine.compare_all(
        raw_tasks=tasks_to_run,
        num_vms=num_nodes,
        optimization_mode=mode
    )
    return jsonify(result)

# --- Real-World Cloud Production Traces (DP-FCFS 2.0) ---
@api_bp.route('/api/traces', methods=['GET'])
def get_production_traces():
    """Returns catalog of real-world cloud traces (Alibaba 2026 LoRA, Alibaba 2017, Borg 2019, Azure)."""
    catalog = []
    for t_id, t_info in PRODUCTION_TRACES.items():
        catalog.append({
            "id": t_info["id"],
            "name": t_info["name"],
            "category": t_info["category"],
            "icon": t_info.get("icon", "Layers"),
            "difficulty": t_info.get("difficulty", "Production Trace"),
            "description": t_info["description"],
            "task_count": len(t_info["tasks"])
        })
    return jsonify(catalog)

@api_bp.route('/api/traces/load/<trace_id>', methods=['POST'])
def load_production_trace(trace_id):
    """Loads a production trace into active memory and returns UniversalTasks with P50/P90/P95 quantiles."""
    global tasks_store
    if trace_id not in PRODUCTION_TRACES:
        return jsonify({"error": f"Production trace '{trace_id}' not found"}), 404

    trace_info = PRODUCTION_TRACES[trace_id]
    universal_tasks = load_trace_as_universal_tasks(trace_id)
    
    loaded = []
    for ut in universal_tasks:
        d = ut.to_dict()
        pred = uncertainty_predictor.predict_quantiles(
            data_size_mb=d.get('data_size_mb', 100),
            cpu_cycles_m=d.get('cpu_cycles_m', 500),
            io_ops=d.get('io_ops', 1000),
            priority=d.get('priority', 3),
            predict_type=d.get('predict_type'),
            num_inference_steps=d.get('num_inference_steps'),
            prompt_length=d.get('prompt_length'),
            num_lora=d.get('num_lora', 0),
            workload_source=trace_id
        )
        d['predicted_p50'] = pred['p50']
        d['predicted_p90'] = pred['p90']
        d['predicted_p95'] = pred['p95']
        d['predicted_burst_time'] = pred['p50']
        d['uncertainty'] = pred['uncertainty']
        d['confidence'] = pred['confidence']
        loaded.append(d)

    tasks_store = loaded
    return jsonify({
        "message": f"Successfully loaded production trace: {trace_info['name']}",
        "trace": {
            "id": trace_info["id"],
            "name": trace_info["name"],
            "category": trace_info["category"],
            "description": trace_info["description"]
        },
        "tasks": tasks_store
    })

# --- Leak-Free Causal History Predictor & Central Queue Benchmark Routes ---
@api_bp.route('/api/leak-free/benchmark', methods=['POST', 'GET'])
def leak_free_benchmark_api():
    """Runs causal leak-free simulation comparing FCFS-RR, JSQ, DP-FCFS (Causal), and FCFS-Central."""
    data = {}
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
    
    target_load = float(request.args.get('target_load', data.get('target_load', 0.75)))
    beta = float(request.args.get('beta', data.get('beta', 1.0)))
    window = int(request.args.get('window', data.get('window', 30)))
    tasks_input = data.get('tasks', None)
    
    speeds = data.get('speeds', [1.0, 1.2, 1.5, 2.0])
    result = leak_free_engine.benchmark_all_policies(
        raw_tasks=tasks_input,
        speeds=speeds,
        target_load=target_load,
        beta=beta,
        window=window
    )
    return jsonify(result)

@api_bp.route('/api/leak-free/load-sweep', methods=['GET'])
def leak_free_load_sweep_api():
    """Returns load sweep curve data comparing all 4 policies from 40% to 95% utilization."""
    beta = float(request.args.get('beta', 1.0))
    sweep_data = leak_free_engine.sweep_load(beta=beta)
    return jsonify({"beta": beta, "sweep": sweep_data})

@api_bp.route('/api/leak-free/beta-sweep', methods=['GET'])
def leak_free_beta_sweep_api():
    """Returns beta sensitivity sweep curve showing uncertainty variance hedging."""
    target_load = float(request.args.get('target_load', 0.80))
    sweep_data = leak_free_engine.sweep_beta(target_load=target_load)
    return jsonify({"target_load": target_load, "sweep": sweep_data})

# --- Real-World Cloud Workload Scenarios ---
@api_bp.route('/api/scenarios', methods=['GET'])
def get_scenarios():
    """Returns metadata for all available pre-configured real-world workload scenarios."""
    scenarios_meta = []
    for s_id, s_data in REAL_WORLD_SCENARIOS.items():
        scenarios_meta.append({
            "id": s_data["id"],
            "name": s_data["name"],
            "category": s_data["category"],
            "icon": s_data.get("icon", "Layers"),
            "description": s_data["description"],
            "difficulty": s_data.get("difficulty", "Standard"),
            "recommended_algo": s_data.get("recommended_algo", "DP-FCFS"),
            "task_count": len(s_data["tasks"])
        })
    return jsonify(scenarios_meta)

@api_bp.route('/api/scenarios/load/<scenario_id>', methods=['POST'])
def load_scenario(scenario_id):
    """Loads a specific real-world workload scenario into active tasks with computed ML predictions."""
    global tasks_store
    if scenario_id not in REAL_WORLD_SCENARIOS:
        return jsonify({"error": f"Scenario '{scenario_id}' not found"}), 404

    scenario_info = REAL_WORLD_SCENARIOS[scenario_id]
    loaded_tasks = []
    for raw in scenario_info["tasks"]:
        data_size_mb = float(raw.get('data_size_mb', 100))
        cpu_cycles_m = float(raw.get('cpu_cycles_m', 500))
        io_ops = float(raw.get('io_ops', 1000))
        priority = int(raw.get('priority', 3))
        arrival_time = float(raw.get('arrival_time', 0.0))
        actual_burst = float(raw.get('actual_burst_time', 10.0))

        predicted = predictor.predict_burst_time(data_size_mb, cpu_cycles_m, io_ops, priority)
        task_item = {
            "id": raw["id"],
            "name": raw["name"],
            "arrival_time": arrival_time,
            "actual_burst_time": actual_burst,
            "predicted_burst_time": predicted,
            "data_size_mb": data_size_mb,
            "cpu_cycles_m": cpu_cycles_m,
            "io_ops": io_ops,
            "priority": priority
        }
        loaded_tasks.append(task_item)

    tasks_store = loaded_tasks
    return jsonify({
        "message": f"Loaded scenario: {scenario_info['name']}",
        "scenario": {
            "id": scenario_info["id"],
            "name": scenario_info["name"],
            "category": scenario_info["category"],
            "description": scenario_info["description"]
        },
        "tasks": tasks_store
    })

@api_bp.route('/api/scenarios/generate', methods=['POST'])
def generate_scenario_api():
    """Generates a dynamic custom workload scenario."""
    global tasks_store
    data = request.get_json() or {}
    count = int(data.get('count', 10))
    distribution = data.get('distribution', 'mixed')
    name = data.get('name', 'Custom Generated Workload')

    scenario = generate_custom_workload(count=count, distribution=distribution, name=name)
    loaded_tasks = []
    for raw in scenario["tasks"]:
        data_size_mb = float(raw.get('data_size_mb', 100))
        cpu_cycles_m = float(raw.get('cpu_cycles_m', 500))
        io_ops = float(raw.get('io_ops', 1000))
        priority = int(raw.get('priority', 3))
        arrival_time = float(raw.get('arrival_time', 0.0))
        actual_burst = float(raw.get('actual_burst_time', 10.0))

        predicted = predictor.predict_burst_time(data_size_mb, cpu_cycles_m, io_ops, priority)
        task_item = {
            "id": raw["id"],
            "name": raw["name"],
            "arrival_time": arrival_time,
            "actual_burst_time": actual_burst,
            "predicted_burst_time": predicted,
            "data_size_mb": data_size_mb,
            "cpu_cycles_m": cpu_cycles_m,
            "io_ops": io_ops,
            "priority": priority
        }
        loaded_tasks.append(task_item)

    tasks_store = loaded_tasks
    return jsonify({
        "message": f"Generated custom scenario: {name}",
        "scenario": scenario,
        "tasks": tasks_store
    })

# --- Research & Publication Figures Catalog ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FIGS_DIR = os.path.join(BASE_DIR, 'figs')
RESULTS_FILE = os.path.join(BASE_DIR, 'results.json')
SENS_FILE = os.path.join(BASE_DIR, 'sens.json')

RESEARCH_FIGURES = [
    {
        "id": "fig_architecture",
        "title": "Three-Tier System Architecture",
        "category": "Architecture & Pipeline",
        "filename": "fig_architecture.png",
        "url": "/figs/fig_architecture.png",
        "description": "Presentation Layer (React 18 + Vite), Business Logic Layer (Python Flask REST API + Scheduler Engine with N1-N3), and Data Layer (in-memory simulation models).",
        "badge": "System Design",
        "key_metric": "Modular Decoupled Stack"
    },
    {
        "id": "fig_workflow",
        "title": "6-Phase Scheduling Pipeline & Feedback Loops",
        "category": "Architecture & Pipeline",
        "filename": "fig_workflow.png",
        "url": "/figs/fig_workflow.png",
        "description": "Task Ingestion -> Burst Time Prediction -> Arrival Ordering -> Predictive Placement with N3 Convoy Shield -> Discrete-Event Execution -> Metric Aggregation. Integrates N1 online EWMA calibration and N2 overrun backlog feedback.",
        "badge": "Pipeline",
        "key_metric": "Strict FCFS Arrival Order Preserved"
    },
    {
        "id": "fig_gantt_ecom",
        "title": "E-Commerce Flash Sale Gantt Execution Trace",
        "category": "Gantt & Convoy Mitigation",
        "filename": "fig_gantt_ecom.png",
        "url": "/figs/fig_gantt_ecom.png",
        "description": "Visual timeline of core allocation during a 65s inventory sync surge followed by 11 micro checkout tasks (1-5s). FCFS-Static stalls checkout queues behind the heavy task; DP-FCFS isolates the heavy task on VM-0 and routes checkouts to VM-1 and VM-2.",
        "badge": "Convoy Critical",
        "key_metric": "AWT -81.7% (17.75s -> 3.24s)"
    },
    {
        "id": "fig_gantt_other",
        "title": "FinTech HFT & AI/ML Pipeline Timelines",
        "category": "Gantt & Convoy Mitigation",
        "filename": "fig_gantt_other.png",
        "url": "/figs/fig_gantt_other.png",
        "description": "Gantt traces for FinTech HFT + VaR risk models and AI/ML model fine-tuning pipelines. Demonstrates multi-node parallel dispersion and dynamic core isolation.",
        "badge": "Production Traces",
        "key_metric": "AWT -81.2% in FinTech, -75.7% in AI/ML"
    },
    {
        "id": "fig_queue",
        "title": "Queue Backlog Dynamics & Load Tracking",
        "category": "Gantt & Convoy Mitigation",
        "filename": "fig_queue.png",
        "url": "/figs/fig_queue.png",
        "description": "Instantaneous queue depth and active task backlogs over simulation time. Confirms rapid convoy drainage without lingering queue accumulation.",
        "badge": "Queue Dynamics",
        "key_metric": "Zero Queue Bloat"
    },
    {
        "id": "fig_named_awt",
        "title": "Average Waiting Time Across Real-World Traces",
        "category": "Empirical Benchmarks",
        "filename": "fig_named_awt.png",
        "url": "/figs/fig_named_awt.png",
        "description": "Direct comparison of Average Waiting Time (AWT) between FCFS-Static, FCFS-JSQ, Oracle SJF, and DP-FCFS across E-Commerce, FinTech, and AI/ML traces.",
        "badge": "Benchmark",
        "key_metric": ">75% AWT Reduction vs FCFS"
    },
    {
        "id": "fig_synthetic",
        "title": "Synthetic Poisson Workload Benchmark (95% CI)",
        "category": "Empirical Benchmarks",
        "filename": "fig_synthetic.png",
        "url": "/figs/fig_synthetic.png",
        "description": "Rigorous 200-task bimodal workload (85% light, 15% heavy) across 40 independent seeds with 95% confidence intervals, evaluating ATT, AWT, MaxWait, and Fairness.",
        "badge": "Statistical Rigor",
        "key_metric": "AWT: 7.81s (DP-FCFS+Shield) vs 34.56s (Static FCFS)"
    },
    {
        "id": "fig_radar",
        "title": "Multi-Dimensional Trade-off Radar",
        "category": "Empirical Benchmarks",
        "filename": "fig_radar.png",
        "url": "/figs/fig_radar.png",
        "description": "Radar plot benchmarking ATT, AWT, Makespan, CPU Utilization, and Jain's Fairness Index across all scheduling strategies.",
        "badge": "Pareto Evaluation",
        "key_metric": "JFI 0.72 vs 0.32 in static FCFS"
    },
    {
        "id": "fig_summary_bars",
        "title": "Aggregate Performance Metrics Comparison",
        "category": "Empirical Benchmarks",
        "filename": "fig_summary_bars.png",
        "url": "/figs/fig_summary_bars.png",
        "description": "Summary comparison showing Turnaround Time, Waiting Time, Makespan, and System Throughput.",
        "badge": "Performance",
        "key_metric": "Throughput +7.3% higher"
    },
    {
        "id": "fig_improvement",
        "title": "Relative Performance Improvements (%)",
        "category": "Empirical Benchmarks",
        "filename": "fig_improvement.png",
        "url": "/figs/fig_improvement.png",
        "description": "Percentage gain of DP-FCFS and DP-FCFS+Shield over traditional FCFS and reactive JSQ baselines.",
        "badge": "Gain Analysis",
        "key_metric": "+77.4% AWT Gain on Poisson Workload"
    },
    {
        "id": "fig_util_sweep",
        "title": "Cluster Utilization Sweep (50% to 90%)",
        "category": "Empirical Benchmarks",
        "filename": "fig_util_sweep.png",
        "url": "/figs/fig_util_sweep.png",
        "description": "Evaluating scheduling stability as cluster utilization scales from 50% to 90%. While static FCFS experiences exponential convoy blowups at high load, DP-FCFS retains bounded latency.",
        "badge": "Scalability",
        "key_metric": "Bounded latency at 90% utilization"
    },
    {
        "id": "fig_frontier",
        "title": "Convoy-Shield Pareto Frontier (Novelty N3)",
        "category": "Sensitivity & Robustness",
        "filename": "fig_frontier.png",
        "url": "/figs/fig_frontier.png",
        "description": "Sweeping reserve_light (0 vs 1 dedicated core) and starvation guard_wait (10s to 80s). Demonstrates optimal light task acceleration while preventing heavy task starvation.",
        "badge": "Novelty N3",
        "key_metric": "Optimal sweet spot: reserve=1, guard=40s"
    },
    {
        "id": "fig_noise",
        "title": "Predictor Noise Robustness Sweep (0% to 50%)",
        "category": "Sensitivity & Robustness",
        "filename": "fig_noise.png",
        "url": "/figs/fig_noise.png",
        "description": "Simulating prediction inaccuracies by injecting lognormal noise up to 50%. Confirms that predictive placement retains strong advantages even with noisy models.",
        "badge": "ML Robustness",
        "key_metric": "Retains >60% AWT gain at 50% noise"
    },
    {
        "id": "fig_progress",
        "title": "Concept Drift Online Adaptation (Novelty N1)",
        "category": "Sensitivity & Robustness",
        "filename": "fig_progress.png",
        "url": "/figs/fig_progress.png",
        "description": "Tracking EWMA residual correction factor rho over task completions when heavy tasks drift to 2.0x forecast burst time.",
        "badge": "Novelty N1",
        "key_metric": "Adapts within 12 completions"
    },
    {
        "id": "fig_importance",
        "title": "Predictive Feature Importance Breakdown",
        "category": "Sensitivity & Robustness",
        "filename": "fig_importance.png",
        "url": "/figs/fig_importance.png",
        "description": "Relative feature influence on burst time prediction: CPU Cycles (52%), Data Size (28%), I/O Operations (15%), Priority (5%).",
        "badge": "Model Explainability",
        "key_metric": "CPU Cycles & Data Size Dominate"
    },
    {
        "id": "fig_sensitivity",
        "title": "Workload Feature Sensitivity Response",
        "category": "Sensitivity & Robustness",
        "filename": "fig_sensitivity.png",
        "url": "/figs/fig_sensitivity.png",
        "description": "Partial dependence curves demonstrating predictable monotonic response across Data Size, CPU Cycles, and I/O Operations.",
        "badge": "Explainability",
        "key_metric": "Predictable physical bounds"
    }
]

@api_bp.route('/api/figs/<path:filename>', methods=['GET'])
def get_fig_file(filename):
    """Serves generated publication figures directly from backend/figs/."""
    return send_from_directory(FIGS_DIR, filename)

@api_bp.route('/api/research/figures', methods=['GET'])
def get_research_figures():
    """Returns the metadata catalog of all 16 publication figures."""
    return jsonify(RESEARCH_FIGURES)

@api_bp.route('/api/research/regenerate-figures', methods=['POST', 'GET'])
def regenerate_research_figures():
    """Dynamically re-runs publication figure generation from live simulation models."""
    try:
        import time
        from plot_figures import generate_all_figures
        data = request.get_json(silent=True) or {}
        custom_tasks = data.get('tasks', None)
        workload_name = data.get('workload_name', None)
        global RESEARCH_FIGURES
        res = generate_all_figures(active_tasks=custom_tasks, workload_name=workload_name)
        if 'figures' in res and res['figures']:
            RESEARCH_FIGURES = res['figures']

        return jsonify({
            "success": True,
            "message": f"Successfully regenerated {res.get('figures_generated', 16)} publication figures directly into figs/ and frontend assets.",
            "timestamp": time.time(),
            "workload_plotted": workload_name or "Standard Suite",
            "figures": RESEARCH_FIGURES,
            "metrics": res.get('metrics', {})
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@api_bp.route('/api/research/results', methods=['GET'])
def get_research_results():
    """Returns experiment results and sensitivity analysis data."""
    results = {}
    sens = {}
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, 'r') as f:
                results = json.load(f)
        except Exception as e:
            results = {"error": f"Failed to load results.json: {str(e)}"}
    if os.path.exists(SENS_FILE):
        try:
            with open(SENS_FILE, 'r') as f:
                sens = json.load(f)
        except Exception as e:
            sens = {"error": f"Failed to load sens.json: {str(e)}"}

    return jsonify({
        "results": results,
        "sensitivity": sens,
        "novelties": {
            "N1": {
                "name": "Self-Calibrating Predictor (EWMA Residual Feedback)",
                "parameter": "calibrate",
                "default": True,
                "description": "Online EWMA residual feedback correction factor rho per size-class (light/heavy). Corrects concept drift and systematic prediction error on-the-fly."
            },
            "N2": {
                "name": "Overrun-Aware Backlog Estimation",
                "parameter": "overrun_aware",
                "default": True,
                "description": "When a task exceeds its predicted duration, remaining burst is estimated as 0.3 * elapsed rather than assuming instantaneous completion."
            },
            "N3": {
                "name": "Convoy-Shield Lane with Starvation Guard",
                "parameters": ["reserve_light", "guard_wait"],
                "default_reserve": 1,
                "default_guard": 40.0,
                "description": "Reserves core 0 exclusively for light tasks (predicted burst < 15s). If heavy tasks wait longer than guard_wait (40s), the shield is temporarily opened to prevent starvation."
            }
        }
    })


# --- Settings Endpoints ---
SETTINGS_FILE = os.path.join(BASE_DIR, 'settings.json')

DEFAULT_SETTINGS = {
    "cluster": {
        "default_algorithm": "dp_fcfs_shield",
        "num_nodes": 3,
        "time_quantum": 4.0,
        "reserve_light": 1,
        "guard_wait": 40.0,
        "calibrate": True,
        "overrun_aware": True,
        "beta_uncertainty": 1.0,
        "heavy_threshold_sec": 15.0
    },
    "profile": {
        "full_name": "Admin User",
        "email": "admin@dp-fcfs.cloud",
        "role": "Cloud Scheduler Architect",
        "organization": "Distributed Systems Research Lab"
    },
    "appearance": {
        "theme": "dark",
        "gantt_animation": "smooth",
        "refresh_interval_sec": 5,
        "dense_mode": False
    },
    "notifications": {
        "email_alerts": True,
        "convoy_spike_warning": True,
        "sla_violation_threshold_sec": 15.0,
        "slack_webhook": ""
    },
    "security": {
        "api_key_auth": False,
        "session_timeout_min": 60,
        "audit_logging": True
    }
}

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return copy.deepcopy(DEFAULT_SETTINGS)

def save_settings_to_disk(data):
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

@api_bp.route('/api/settings', methods=['GET'])
def get_settings():
    """Returns current system and cluster configuration settings."""
    return jsonify(load_settings())

@api_bp.route('/api/settings', methods=['POST', 'PUT'])
def update_settings():
    """Updates and saves system and cluster configuration settings to disk."""
    try:
        new_data = request.get_json(silent=True) or {}
        current = load_settings()
        
        # Deep merge updates
        for section, values in new_data.items():
            if isinstance(values, dict) and section in current and isinstance(current[section], dict):
                current[section].update(values)
            else:
                current[section] = values
                
        save_settings_to_disk(current)
        return jsonify({
            "success": True,
            "message": "Settings updated and saved successfully to backend.",
            "settings": current
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api_bp.route('/api/settings/reset', methods=['POST'])
def reset_settings():
    """Resets all settings to default configuration."""
    try:
        defaults = copy.deepcopy(DEFAULT_SETTINGS)
        save_settings_to_disk(defaults)
        return jsonify({
            "success": True,
            "message": "Settings successfully reset to default configuration.",
            "settings": defaults
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.app_errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@api_bp.app_errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal server error"}), 500


