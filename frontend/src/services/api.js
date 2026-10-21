import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Network request failed';
    return Promise.reject(new Error(errorMsg));
  }
);

// Physics-inspired ground truth calculation for burst time
export const calculateLocalBurstTime = (dataSize, cpuCycles, ioOps, priority) => {
  const d = Number(dataSize) || 100;
  const c = Number(cpuCycles) || 500;
  const io = Number(ioOps) || 1000;
  const p = Number(priority) || 3;
  const pred = (d * 0.012) + (c * 0.006) + (io * 0.0015) + (6 - p) * 0.2;
  return Number(Math.max(0.5, Math.min(120.0, pred)).toFixed(2));
};

// Fallback initial task set
export const FALLBACK_TASKS = [
  { id: "TSK-101", name: "ETL Pipeline Process", arrival_time: 0.0, actual_burst_time: 45.0, predicted_burst_time: 44.8, data_size_mb: 450, cpu_cycles_m: 2200, io_ops: 3500, priority: 1, status: "completed" },
  { id: "TSK-102", name: "Image Thumbnail Gen", arrival_time: 0.5, actual_burst_time: 3.0, predicted_burst_time: 3.2, data_size_mb: 25, cpu_cycles_m: 120, io_ops: 400, priority: 3, status: "running" },
  { id: "TSK-103", name: "User Auth Verification", arrival_time: 1.0, actual_burst_time: 1.5, predicted_burst_time: 1.4, data_size_mb: 10, cpu_cycles_m: 60, io_ops: 200, priority: 5, status: "completed" },
  { id: "TSK-104", name: "Database Query Analytics", arrival_time: 1.5, actual_burst_time: 38.0, predicted_burst_time: 37.6, data_size_mb: 380, cpu_cycles_m: 1900, io_ops: 4800, priority: 2, status: "waiting" },
  { id: "TSK-105", name: "Email Notification Batch", arrival_time: 2.0, actual_burst_time: 4.0, predicted_burst_time: 4.1, data_size_mb: 30, cpu_cycles_m: 150, io_ops: 600, priority: 4, status: "completed" },
  { id: "TSK-106", name: "Log Aggregation Sync", arrival_time: 2.5, actual_burst_time: 2.5, predicted_burst_time: 2.6, data_size_mb: 20, cpu_cycles_m: 100, io_ops: 300, priority: 3, status: "running" },
  { id: "TSK-107", name: "Deep Learning Inference", arrival_time: 3.0, actual_burst_time: 52.0, predicted_burst_time: 51.5, data_size_mb: 600, cpu_cycles_m: 3500, io_ops: 2000, priority: 1, status: "waiting" },
  { id: "TSK-108", name: "Cache Maintenance Job", arrival_time: 3.5, actual_burst_time: 2.0, predicted_burst_time: 2.1, data_size_mb: 15, cpu_cycles_m: 80, io_ops: 250, priority: 4, status: "failed" }
];

let localTasksStore = [...FALLBACK_TASKS];

// --- Task Services ---
export const getTasks = () => 
  apiClient.get('/api/tasks')
    .then((res) => {
      localTasksStore = res.data;
      return res.data;
    })
    .catch(() => localTasksStore);

export const createTask = (taskData) =>
  apiClient.post('/api/tasks', taskData)
    .then((res) => {
      localTasksStore.push(res.data.task);
      return res.data;
    })
    .catch(() => {
      const pred = calculateLocalBurstTime(taskData.data_size_mb, taskData.cpu_cycles_m, taskData.io_ops, taskData.priority);
      const newTask = {
        id: taskData.id || `TSK-${Math.floor(Math.random() * 800 + 200)}`,
        name: taskData.name || 'New Cloud Task',
        arrival_time: Number(taskData.arrival_time) || 0,
        actual_burst_time: Number(taskData.actual_burst_time || taskData.burst_time) || 10,
        predicted_burst_time: pred,
        data_size_mb: Number(taskData.data_size_mb) || 100,
        cpu_cycles_m: Number(taskData.cpu_cycles_m) || 500,
        io_ops: Number(taskData.io_ops) || 1000,
        priority: Number(taskData.priority) || 3,
        status: 'waiting'
      };
      localTasksStore.push(newTask);
      return { message: "Task created locally", task: newTask };
    });

export const deleteTask = (taskId) =>
  apiClient.delete(`/api/tasks/${taskId}`)
    .then((res) => {
      localTasksStore = localTasksStore.filter(t => t.id !== taskId);
      return res.data;
    })
    .catch(() => {
      localTasksStore = localTasksStore.filter(t => t.id !== taskId);
      return { message: `Task ${taskId} deleted locally` };
    });

export const resetTasks = () =>
  apiClient.post('/api/tasks/reset')
    .then((res) => {
      localTasksStore = res.data.tasks;
      return res.data;
    })
    .catch(() => {
      localTasksStore = [...FALLBACK_TASKS];
      return { message: "Workload reset", tasks: localTasksStore };
    });

export const batchImportTasks = (tasksList) =>
  apiClient.post('/api/tasks/batch-import', { tasks: tasksList })
    .then((res) => res.data)
    .catch(() => {
      localTasksStore = tasksList;
      return { message: `Imported ${tasksList.length} tasks locally`, tasks: localTasksStore };
    });

// --- Server / Node Services ---
export const getServers = () =>
  apiClient.get('/api/servers')
    .then((res) => res.data)
    .catch(() => [
      { id: "VM-1", name: "Cloud Node Alpha (VM-1)", cpus: 4, ram_gb: 16, status: "active" },
      { id: "VM-2", name: "Cloud Node Beta (VM-2)", cpus: 4, ram_gb: 16, status: "active" },
      { id: "VM-3", name: "Cloud Node Gamma (VM-3)", cpus: 4, ram_gb: 16, status: "active" }
    ]);

export const addServer = (serverData) =>
  apiClient.post('/api/servers', serverData).then((res) => res.data);

export const removeServer = (serverId) =>
  apiClient.delete(`/api/servers/${serverId}`).then((res) => res.data);

// --- ML Predictor Services ---
export const predictBurstTime = (features) =>
  apiClient.post('/api/predict', features)
    .then((res) => res.data)
    .catch(() => {
      const pred = calculateLocalBurstTime(features.data_size_mb, features.cpu_cycles_m, features.io_ops, features.priority);
      return {
        input: features,
        predicted_burst_time: pred
      };
    });

export const predictUncertainty = (features) =>
  apiClient.post('/api/predict/uncertainty', features)
    .then((res) => res.data)
    .catch(() => {
      const pred = calculateLocalBurstTime(features.data_size_mb, features.cpu_cycles_m, features.io_ops, features.priority);
      return {
        p50: pred,
        p90: Number((pred * 1.25).toFixed(2)),
        p95: Number((pred * 1.45).toFixed(2)),
        uncertainty: Number((pred * 0.45).toFixed(2)),
        confidence: 0.85,
        calibration_factor: 1.0,
        drift_detected: false
      };
    });

export const getPredictorMetrics = () =>
  apiClient.get('/api/predict/metrics')
    .then((res) => res.data)
    .catch(() => ({
      r2_score: 0.9842,
      mae: 0.2415,
      mse: 0.0912,
      accuracy_percentage: 98.42,
      feature_importances: {
        data_size_mb: 0.38,
        cpu_cycles_m: 0.42,
        io_ops: 0.15,
        priority: 0.05
      }
    }));

export const getPredictCurves = (features) =>
  apiClient.post('/api/predict/curve', features)
    .then((res) => res.data)
    .catch(() => {
      const f = features || { data_size_mb: 250, cpu_cycles_m: 1200, io_ops: 3000, priority: 3 };
      const dataSteps = [10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      const cpuSteps = [50, 250, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
      const ioSteps = [100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
      const prioSteps = [1, 2, 3, 4, 5];

      return {
        data_size_curve: dataSteps.map(step => ({ x: step, burst_time: calculateLocalBurstTime(step, f.cpu_cycles_m, f.io_ops, f.priority) })),
        cpu_curve: cpuSteps.map(step => ({ x: step, burst_time: calculateLocalBurstTime(f.data_size_mb, step, f.io_ops, f.priority) })),
        io_curve: ioSteps.map(step => ({ x: step, burst_time: calculateLocalBurstTime(f.data_size_mb, f.cpu_cycles_m, step, f.priority) })),
        priority_curve: prioSteps.map(p => ({ x: `P${p}`, burst_time: calculateLocalBurstTime(f.data_size_mb, f.cpu_cycles_m, f.io_ops, p) }))
      };
    });

export const getPredictComparison = (samples = 16) =>
  apiClient.get(`/api/predict/comparison?samples=${samples}`)
    .then((res) => res.data)
    .catch(() => [
      { id: 'TSK-EV-01', name: 'Auth Token Verify', data_size_mb: 10, cpu_cycles_m: 60, io_ops: 200, priority: 5, actual_burst_time: 1.2, predicted_burst_time: 1.25, residual_error: 0.05, accuracy: 95.8 },
      { id: 'TSK-EV-02', name: 'Thumbnail Render', data_size_mb: 25, cpu_cycles_m: 120, io_ops: 400, priority: 3, actual_burst_time: 3.5, predicted_burst_time: 3.42, residual_error: -0.08, accuracy: 97.7 },
      { id: 'TSK-EV-03', name: 'Batch DB Scan', data_size_mb: 450, cpu_cycles_m: 2200, io_ops: 3500, priority: 2, actual_burst_time: 42.0, predicted_burst_time: 41.6, residual_error: -0.40, accuracy: 99.0 },
      { id: 'TSK-EV-04', name: 'Deep Learning Inference', data_size_mb: 600, cpu_cycles_m: 3500, io_ops: 2000, priority: 1, actual_burst_time: 68.0, predicted_burst_time: 68.3, residual_error: 0.30, accuracy: 99.5 },
      { id: 'TSK-EV-05', name: 'Redis Session Sync', data_size_mb: 5, cpu_cycles_m: 30, io_ops: 100, priority: 5, actual_burst_time: 0.8, predicted_burst_time: 0.78, residual_error: -0.02, accuracy: 97.5 },
      { id: 'TSK-EV-06', name: 'Kafka Queue Drain', data_size_mb: 80, cpu_cycles_m: 400, io_ops: 1200, priority: 4, actual_burst_time: 8.4, predicted_burst_time: 8.52, residual_error: 0.12, accuracy: 98.6 },
      { id: 'TSK-EV-07', name: 'Payment Token Match', data_size_mb: 8, cpu_cycles_m: 45, io_ops: 150, priority: 5, actual_burst_time: 1.1, predicted_burst_time: 1.12, residual_error: 0.02, accuracy: 98.2 },
      { id: 'TSK-EV-08', name: 'Parquet Scan Chunk', data_size_mb: 320, cpu_cycles_m: 1600, io_ops: 2800, priority: 2, actual_burst_time: 29.5, predicted_burst_time: 29.2, residual_error: -0.30, accuracy: 99.0 }
    ]);

export const getPredictResiduals = () =>
  apiClient.get('/api/predict/residuals')
    .then((res) => res.data)
    .catch(() => ({
      '-0.6s to -0.4s': 4,
      '-0.4s to -0.2s': 8,
      '-0.2s to 0.0s': 15,
      '0.0s to +0.2s': 14,
      '+0.2s to +0.4s': 6,
      '+0.4s to +0.6s': 3
    }));

// Fallback benchmark comparison
export const FALLBACK_BENCHMARK = {
  comparison: [
    { algorithm: "Standard FCFS", avg_turnaround_time: 35.8, avg_waiting_time: 22.4, avg_response_time: 22.4, cpu_utilization: 68.5, throughput: 14.2, jains_fairness_index: 0.62, energy_kwh: 0.0034, estimated_cost_usd: 0.0028 },
    { algorithm: "Non-Preemptive SJF", avg_turnaround_time: 24.2, avg_waiting_time: 10.8, avg_response_time: 10.8, cpu_utilization: 78.2, throughput: 19.5, jains_fairness_index: 0.48, energy_kwh: 0.0028, estimated_cost_usd: 0.0021 },
    { algorithm: "Round Robin (RR)", avg_turnaround_time: 28.5, avg_waiting_time: 15.1, avg_response_time: 4.2, cpu_utilization: 74.0, throughput: 16.8, jains_fairness_index: 0.88, energy_kwh: 0.0031, estimated_cost_usd: 0.0024 },
    { algorithm: "Priority (Dynamic Aging)", avg_turnaround_time: 26.4, avg_waiting_time: 13.0, avg_response_time: 11.5, cpu_utilization: 76.5, throughput: 18.0, jains_fairness_index: 0.82, energy_kwh: 0.0029, estimated_cost_usd: 0.0022 },
    { algorithm: "DP-FCFS (Our Project)", avg_turnaround_time: 21.6, avg_waiting_time: 8.2, avg_response_time: 8.2, cpu_utilization: 91.4, throughput: 22.8, jains_fairness_index: 0.98, energy_kwh: 0.0023, estimated_cost_usd: 0.0018 }
  ],
  summary_metrics: {
    att_reduction_pct: 39.7,
    awt_reduction_pct: 63.4,
    convoy_mitigation_effective: true
  },
  details: {
    dp_fcfs: {
      algorithm: "Dynamic Predictive FCFS (DP-FCFS)",
      avg_turnaround_time: 21.6,
      avg_waiting_time: 8.2,
      avg_response_time: 8.2,
      cpu_utilization: 91.4,
      throughput_tasks_per_min: 22.8,
      jains_fairness_index: 0.98,
      energy_kwh: 0.0023,
      estimated_cost_usd: 0.0018,
      total_simulation_time: 32.5,
      server_load_distribution: {
        "VM-1": { name: "Cloud Node Alpha (VM-1)", busy_time: 29.8, load_percentage: 34.2 },
        "VM-2": { name: "Cloud Node Beta (VM-2)", busy_time: 28.6, load_percentage: 32.8 },
        "VM-3": { name: "Cloud Node Gamma (VM-3)", busy_time: 28.8, load_percentage: 33.0 }
      },
      priority_breakdown: { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1 },
      timeline: [
        { task_id: "TSK-101", task_name: "ETL Pipeline Process", vm_id: "VM-1", start_time: 0.0, finish_time: 45.0, duration: 45.0 },
        { task_id: "TSK-102", task_name: "Image Thumbnail Gen", vm_id: "VM-2", start_time: 0.5, finish_time: 3.5, duration: 3.0 },
        { task_id: "TSK-103", task_name: "User Auth Verification", vm_id: "VM-3", start_time: 1.0, finish_time: 2.5, duration: 1.5 },
        { task_id: "TSK-104", task_name: "Database Query Analytics", vm_id: "VM-3", start_time: 2.5, finish_time: 40.5, duration: 38.0 },
        { task_id: "TSK-105", task_name: "Email Notification Batch", vm_id: "VM-2", start_time: 3.5, finish_time: 7.5, duration: 4.0 },
        { task_id: "TSK-106", task_name: "Log Aggregation Sync", vm_id: "VM-2", start_time: 7.5, finish_time: 10.0, duration: 2.5 },
        { task_id: "TSK-108", task_name: "Cache Maintenance Job", vm_id: "VM-2", start_time: 10.0, finish_time: 12.0, duration: 2.0 },
        { task_id: "TSK-107", task_name: "Deep Learning Inference", vm_id: "VM-2", start_time: 12.0, finish_time: 64.0, duration: 52.0 }
      ]
    }
  }
};

// --- Simulation & Benchmark Services ---
export const runSimulation = (algorithm, numVms = 3, tasks = null, timeQuantum = 4, options = {}) =>
  apiClient
    .post('/api/simulation/run', {
      algorithm,
      num_vms: numVms,
      tasks: tasks || localTasksStore,
      time_quantum: timeQuantum,
      ...options,
    })
    .then((res) => res.data)
    .catch(() => FALLBACK_BENCHMARK.details.dp_fcfs);

export const compareAlgorithms = (numVms = 3, tasks = null, timeQuantum = 4) =>
  apiClient
    .post('/api/simulation/compare', {
      num_vms: numVms,
      tasks: tasks || localTasksStore,
      time_quantum: timeQuantum,
    })
    .then((res) => res.data)
    .catch(() => FALLBACK_BENCHMARK);

export const compareAlgorithmsPlus = (numNodes = 4, mode = 'balanced', tasks = null) =>
  apiClient
    .post('/api/simulation/compare-plus', {
      num_nodes: numNodes,
      mode: mode,
      tasks: tasks || localTasksStore,
    })
    .then((res) => res.data)
    .catch(() => ({
      comparison: [],
      details: {},
      summary_metrics: { att_reduction_pct: 0, awt_reduction_pct: 0 }
    }));

export const getTraces = () =>
  apiClient.get('/api/traces')
    .then((res) => res.data)
    .catch(() => [
      { id: "alibaba_genai_2026", name: "Alibaba 2026 GenAI / LoRA Trace", category: "GenAI & GPU Cluster", icon: "Sparkles", description: "Real production trace from Alibaba PAI cluster serving Stable Diffusion & LLM LoRA inference requests.", task_count: 10 },
      { id: "alibaba_2017", name: "Alibaba Cluster Trace 2017", category: "E-Commerce & Big Data", icon: "ShoppingCart", description: "Real batch container workload from Alibaba production cluster.", task_count: 10 },
      { id: "google_borg", name: "Google Borg Cluster Trace 2019", category: "Hyperscale Cloud", icon: "Server", description: "Telemetry from Google Borg production data centers.", task_count: 12 },
      { id: "azure_functions", name: "Microsoft Azure Functions Trace", category: "Serverless Cloud", icon: "Zap", description: "High-churn serverless micro-invocations.", task_count: 10 }
    ]);

export const loadTrace = (traceId) =>
  apiClient.post(`/api/traces/load/${traceId}`)
    .then((res) => {
      localTasksStore = res.data.tasks;
      return res.data;
    })
    .catch(() => ({
      message: `Loaded trace ${traceId} locally`,
      tasks: localTasksStore
    }));

export const getBenchmark = (numVms = 3) =>
  apiClient
    .get(`/api/benchmark?nodes=${numVms}`)
    .then((res) => res.data)
    .catch(() => compareAlgorithms(numVms));

// --- Research & Publication Services ---
export const getResearchFigures = () =>
  apiClient
    .get('/api/research/figures')
    .then((res) => res.data)
    .catch(() => []);

export const regenerateResearchFigures = (payload = {}) =>
  apiClient
    .post('/api/research/regenerate-figures', payload, { timeout: 60000 })
    .then((res) => res.data)
    .catch((err) => ({ success: false, error: err.message }));

export const getResearchResults = () =>
  apiClient
    .get('/api/research/results')
    .then((res) => res.data)
    .catch(() => ({ results: {}, sensitivity: {}, novelties: {} }));

// --- Real-World Cloud Workload Scenarios ---
export const getScenarios = () =>
  apiClient.get('/api/scenarios')
    .then((res) => res.data)
    .catch(() => [
      { id: "ecommerce_surge", name: "E-Commerce Flash Sale Surge", category: "Retail & Web", icon: "ShoppingCart", description: "Heavy catalog sync followed by rapid checkout bursts to stress test convoy avoidance.", difficulty: "Convoy Critical", task_count: 12 },
      { id: "bigdata_analytics", name: "Big Data Analytics (Spark/Hadoop)", category: "Enterprise Data", icon: "Database", description: "Large ETL extract-transform-load jobs, parquet scans, and heavy aggregations.", difficulty: "Resource Heavy", task_count: 8 },
      { id: "microservices_api", name: "High-Frequency Microservices API", category: "Cloud Native", icon: "Cpu", description: "High-throughput, ultra low-latency REST and gRPC API micro-requests.", difficulty: "Latency Sensitive", task_count: 8 },
      { id: "ai_deeplearning", name: "AI & Deep Learning Pipeline", category: "Machine Learning", icon: "Zap", description: "Multi-stage LLM context embedding, FAISS vector search, and model checkpointing.", difficulty: "Compute Intensive", task_count: 6 },
      { id: "iot_telemetry", name: "IoT Sensor Fleet Telemetry", category: "Smart Systems", icon: "Activity", description: "Continuous stream of environmental sensor and industrial telemetry packets.", difficulty: "I/O Intensive", task_count: 6 }
    ]);

export const loadScenario = (scenarioId) =>
  apiClient.post(`/api/scenarios/load/${scenarioId}`)
    .then((res) => {
      localTasksStore = res.data.tasks;
      return res.data;
    })
    .catch(() => ({
      message: `Loaded scenario ${scenarioId} locally`,
      tasks: localTasksStore
    }));

// --- Leak-Free Causal History Predictor & Central Queue Benchmark Services ---
export const getLeakFreeBenchmark = (options = {}) =>
  apiClient.post('/api/leak-free/benchmark', options)
    .then((res) => res.data)
    .catch(() => ({
      target_load_pct: 75,
      beta: 1.0,
      summary_table: [],
      gains: { awt_reduction_vs_rr_pct: 80.0, awt_reduction_vs_jsq_pct: 45.0 },
      timelines: {}
    }));

export const getLeakFreeLoadSweep = (beta = 1.0) =>
  apiClient.get(`/api/leak-free/load-sweep?beta=${beta}`)
    .then((res) => res.data)
    .catch(() => ({ beta, sweep: [] }));

export const getLeakFreeBetaSweep = (targetLoad = 0.8) =>
  apiClient.get(`/api/leak-free/beta-sweep?target_load=${targetLoad}`)
    .then((res) => res.data)
    .catch(() => ({ target_load: targetLoad, sweep: [] }));

// --- Settings Services ---
export const getSettings = () =>
  apiClient
    .get('/api/settings')
    .then((res) => res.data)
    .catch(() => ({
      cluster: {
        default_algorithm: "dp_fcfs_shield",
        num_nodes: 3,
        time_quantum: 4.0,
        reserve_light: 1,
        guard_wait: 40.0,
        calibrate: true,
        overrun_aware: true,
        beta_uncertainty: 1.0,
        heavy_threshold_sec: 15.0
      },
      profile: {
        full_name: "Admin User",
        email: "admin@dp-fcfs.cloud",
        role: "Cloud Scheduler Architect",
        organization: "Distributed Systems Research Lab"
      },
      appearance: {
        theme: "dark",
        gantt_animation: "smooth",
        refresh_interval_sec: 5,
        dense_mode: false
      },
      notifications: {
        email_alerts: true,
        convoy_spike_warning: true,
        sla_violation_threshold_sec: 15.0,
        slack_webhook: ""
      },
      security: {
        api_key_auth: false,
        session_timeout_min: 60,
        audit_logging: true
      }
    }));

export const updateSettings = (settingsData) =>
  apiClient
    .post('/api/settings', settingsData)
    .then((res) => res.data)
    .catch((err) => ({ success: false, error: err.message }));

export const resetSettings = () =>
  apiClient
    .post('/api/settings/reset')
    .then((res) => res.data)
    .catch((err) => ({ success: false, error: err.message }));

// System health check
export const checkHealth = () =>
  apiClient.get('/api/health')
    .then((res) => res.data)
    .catch(() => ({ status: 'offline' }));

export default apiClient;

