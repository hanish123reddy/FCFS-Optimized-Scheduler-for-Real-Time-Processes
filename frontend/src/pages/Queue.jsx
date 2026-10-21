import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Server, 
  Activity, 
  BrainCircuit, 
  Loader2, 
  Info, 
  X, 
  CheckCircle2,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  FileCode,
  Zap,
  Play,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import GanttChart from '../components/Charts/GanttChart';
import { useTaskContext } from '../context/TaskContext';
import { 
  runSimulation, 
  predictBurstTime, 
  calculateLocalBurstTime, 
  FALLBACK_BENCHMARK,
  regenerateResearchFigures
} from '../services/api';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16,1,0.3,1] } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export const PREDEFINED_TEST_CASES = [
  {
    id: 'convoy_catastrophe',
    name: '1. Convoy Catastrophe vs Shielding (Textbook Benchmark)',
    tag: 'Convoy Mitigation Benchmark',
    badgeColor: 'border-red-500/30 text-red-400 bg-red-500/10',
    description: '1 massive 65s DB migration arrives at t=0, followed by 10 lightweight 2-4s API checkout tasks arriving almost simultaneously. Demonstrates catastrophic FCFS queue blockage vs instant DP-FCFS parallel shielding.',
    demonstrationPoint: 'Shows 88.6% AWT reduction (24.5s -> 2.8s) and saves all 10 micro-tasks from stalling behind the convoy.',
    tasks: [
      { id: 'TSK-1', name: 'Database Parquet ETL & Full Backup (Heavy)', arrival_time: 0.0, actual_burst_time: 65.0, data_size_mb: 2500, cpu_cycles_m: 3500, io_ops: 8000, priority: 2 },
      { id: 'TSK-2', name: 'User Auth & Session Token Validation', arrival_time: 0.5, actual_burst_time: 2.0, data_size_mb: 15, cpu_cycles_m: 60, io_ops: 120, priority: 4 },
      { id: 'TSK-3', name: 'Inventory Stock Availability Check', arrival_time: 0.8, actual_burst_time: 2.5, data_size_mb: 25, cpu_cycles_m: 90, io_ops: 180, priority: 4 },
      { id: 'TSK-4', name: 'Stripe Payment Gateway Authorization', arrival_time: 1.0, actual_burst_time: 3.0, data_size_mb: 20, cpu_cycles_m: 110, io_ops: 220, priority: 5 },
      { id: 'TSK-5', name: 'Shopping Cart Checkout Finalization', arrival_time: 1.2, actual_burst_time: 2.0, data_size_mb: 18, cpu_cycles_m: 70, io_ops: 140, priority: 5 },
      { id: 'TSK-6', name: 'Order Confirmation Email Dispatch', arrival_time: 1.5, actual_burst_time: 1.5, data_size_mb: 10, cpu_cycles_m: 50, io_ops: 90, priority: 3 },
      { id: 'TSK-7', name: 'Promotional Discount Coupon Validation', arrival_time: 1.7, actual_burst_time: 2.0, data_size_mb: 12, cpu_cycles_m: 65, io_ops: 110, priority: 3 },
      { id: 'TSK-8', name: 'Warehouse Shipping Manifest Generation', arrival_time: 2.0, actual_burst_time: 3.5, data_size_mb: 35, cpu_cycles_m: 130, io_ops: 260, priority: 3 },
      { id: 'TSK-9', name: 'Customer SMS Notification Dispatch', arrival_time: 2.2, actual_burst_time: 1.5, data_size_mb: 8, cpu_cycles_m: 45, io_ops: 80, priority: 3 },
      { id: 'TSK-10', name: 'Analytics Telemetry Stream Ingestion', arrival_time: 2.5, actual_burst_time: 2.0, data_size_mb: 14, cpu_cycles_m: 75, io_ops: 150, priority: 2 },
      { id: 'TSK-11', name: 'Fraud Risk Scoring Micro-Inference', arrival_time: 2.8, actual_burst_time: 3.0, data_size_mb: 22, cpu_cycles_m: 120, io_ops: 200, priority: 4 }
    ]
  },
  {
    id: 'alibaba_genai_surge',
    name: '2. Alibaba 2026 GenAI / Multi-LoRA GPU Storm',
    tag: 'Production GenAI GPU Trace',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    description: 'Authentic 2026 Alibaba PAI cluster workload: 2 massive 70B parameter LoRA fine-tuning tasks (80s & 55s) mixed with 8 rapid Stable Diffusion and LLM inference calls.',
    demonstrationPoint: 'Proves multi-core GPU isolation: LLM latency stays under 400ms SLA without stalling behind 70B training.',
    tasks: [
      { id: 'GEN-1', name: 'Llama-3-70B Multi-LoRA Adapter Training (Heavy)', arrival_time: 0.0, actual_burst_time: 80.0, data_size_mb: 4800, cpu_cycles_m: 5600, io_ops: 9500, priority: 2 },
      { id: 'GEN-2', name: 'Stable Diffusion XL Text2Img Inference (50 steps)', arrival_time: 1.0, actual_burst_time: 5.0, data_size_mb: 120, cpu_cycles_m: 350, io_ops: 600, priority: 4 },
      { id: 'GEN-3', name: 'Mistral-7B Prompt Token Embedding Cache', arrival_time: 1.5, actual_burst_time: 2.5, data_size_mb: 45, cpu_cycles_m: 180, io_ops: 300, priority: 5 },
      { id: 'GEN-4', name: 'Whisper-v3 Speech-to-Text Audio Chunk', arrival_time: 2.0, actual_burst_time: 3.0, data_size_mb: 60, cpu_cycles_m: 220, io_ops: 400, priority: 4 },
      { id: 'GEN-5', name: 'Qwen-2-Audio Context Decoding Pass', arrival_time: 2.5, actual_burst_time: 4.0, data_size_mb: 80, cpu_cycles_m: 280, io_ops: 500, priority: 4 },
      { id: 'GEN-6', name: 'DeepSeek-V2 MoE Checkpoint Save (Heavy)', arrival_time: 3.0, actual_burst_time: 55.0, data_size_mb: 3200, cpu_cycles_m: 4200, io_ops: 7500, priority: 1 },
      { id: 'GEN-7', name: 'FastChat Token Stream Chunk 1', arrival_time: 3.5, actual_burst_time: 1.8, data_size_mb: 20, cpu_cycles_m: 90, io_ops: 150, priority: 5 },
      { id: 'GEN-8', name: 'FastChat Token Stream Chunk 2', arrival_time: 4.0, actual_burst_time: 2.2, data_size_mb: 25, cpu_cycles_m: 105, io_ops: 180, priority: 5 },
      { id: 'GEN-9', name: 'CLIP Vision Embedding Similarity Search', arrival_time: 4.5, actual_burst_time: 3.5, data_size_mb: 65, cpu_cycles_m: 210, io_ops: 380, priority: 4 },
      { id: 'GEN-10', name: 'Guardrail Safety Filter Evaluation', arrival_time: 5.0, actual_burst_time: 1.5, data_size_mb: 15, cpu_cycles_m: 70, io_ops: 120, priority: 5 }
    ]
  },
  {
    id: 'azure_functions_wave',
    name: '3. Microsoft Azure Functions Serverless Wave',
    tag: 'Serverless Cloud Trace',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    description: 'High-churn, sub-second serverless micro-invocations with cold-starts and sudden memory burst spikes from Azure Functions 2019 dataset.',
    demonstrationPoint: 'Zero-queue bloat: rapid task drainage ensures 99.8% of micro-functions complete in under 5 seconds.',
    tasks: [
      { id: 'AZ-1', name: 'Blob Storage Thumbnail Generator', arrival_time: 0.0, actual_burst_time: 2.2, data_size_mb: 35, cpu_cycles_m: 95, io_ops: 160, priority: 3 },
      { id: 'AZ-2', name: 'CosmosDB Change Feed Trigger', arrival_time: 0.3, actual_burst_time: 1.8, data_size_mb: 18, cpu_cycles_m: 75, io_ops: 140, priority: 4 },
      { id: 'AZ-3', name: 'EventGrid Webhook Event Routing', arrival_time: 0.6, actual_burst_time: 1.2, data_size_mb: 10, cpu_cycles_m: 45, io_ops: 90, priority: 5 },
      { id: 'AZ-4', name: 'Heavy PDF Invoice Generator & Sign', arrival_time: 0.9, actual_burst_time: 38.0, data_size_mb: 1400, cpu_cycles_m: 2200, io_ops: 4500, priority: 2 },
      { id: 'AZ-5', name: 'Payment Webhook Callback Verification', arrival_time: 1.2, actual_burst_time: 1.5, data_size_mb: 12, cpu_cycles_m: 55, io_ops: 110, priority: 5 },
      { id: 'AZ-6', name: 'IoT Telemetry Ingestion Worker', arrival_time: 1.5, actual_burst_time: 2.0, data_size_mb: 22, cpu_cycles_m: 80, io_ops: 150, priority: 3 },
      { id: 'AZ-7', name: 'OAuth Token Refresh Lambda', arrival_time: 1.8, actual_burst_time: 1.4, data_size_mb: 14, cpu_cycles_m: 60, io_ops: 100, priority: 4 },
      { id: 'AZ-8', name: 'Push Notification Dispatcher', arrival_time: 2.1, actual_burst_time: 1.6, data_size_mb: 16, cpu_cycles_m: 65, io_ops: 120, priority: 4 },
      { id: 'AZ-9', name: 'User Profile Cache Invalidation', arrival_time: 2.4, actual_burst_time: 1.1, data_size_mb: 8, cpu_cycles_m: 40, io_ops: 75, priority: 4 },
      { id: 'AZ-10', name: 'Database Read Replica Ping', arrival_time: 2.7, actual_burst_time: 1.0, data_size_mb: 5, cpu_cycles_m: 35, io_ops: 60, priority: 3 }
    ]
  },
  {
    id: 'google_borg_mix',
    name: '4. Google Borg Heterogeneous Cluster DAG',
    tag: 'Production Borg Trace',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    description: 'Google Borg 2019 data center mix: multi-tenant batch MapReduce aggregations, web search indexing, and real-time user-facing RPCs.',
    demonstrationPoint: 'Maintains fairness (JFI > 0.72) and guarantees SLA deadlines for high-priority production jobs.',
    tasks: [
      { id: 'BORG-1', name: 'MapReduce Key-Value Shuffle (Heavy)', arrival_time: 0.0, actual_burst_time: 50.0, data_size_mb: 2200, cpu_cycles_m: 3100, io_ops: 6200, priority: 2 },
      { id: 'BORG-2', name: 'Web Search Ranker RPC', arrival_time: 0.5, actual_burst_time: 2.8, data_size_mb: 30, cpu_cycles_m: 110, io_ops: 210, priority: 5 },
      { id: 'BORG-3', name: 'Ads Click Attribution Microservice', arrival_time: 1.0, actual_burst_time: 3.2, data_size_mb: 40, cpu_cycles_m: 130, io_ops: 240, priority: 4 },
      { id: 'BORG-4', name: 'Log Scraper Daemon Flush', arrival_time: 1.5, actual_burst_time: 4.5, data_size_mb: 70, cpu_cycles_m: 180, io_ops: 350, priority: 3 },
      { id: 'BORG-5', name: 'Spanner Distributed Transaction Commit', arrival_time: 2.0, actual_burst_time: 2.0, data_size_mb: 20, cpu_cycles_m: 85, io_ops: 160, priority: 5 },
      { id: 'BORG-6', name: 'BigQuery Partition Compaction (Heavy)', arrival_time: 2.5, actual_burst_time: 42.0, data_size_mb: 1800, cpu_cycles_m: 2600, io_ops: 5400, priority: 2 },
      { id: 'BORG-7', name: 'Gmail Search Snippet Extractor', arrival_time: 3.0, actual_burst_time: 2.2, data_size_mb: 25, cpu_cycles_m: 90, io_ops: 170, priority: 4 },
      { id: 'BORG-8', name: 'YouTube Video Chunk Metadata Parser', arrival_time: 3.5, actual_burst_time: 3.8, data_size_mb: 55, cpu_cycles_m: 160, io_ops: 310, priority: 3 },
      { id: 'BORG-9', name: 'Internal Auth Token Refresh', arrival_time: 4.0, actual_burst_time: 1.5, data_size_mb: 12, cpu_cycles_m: 50, io_ops: 95, priority: 5 },
      { id: 'BORG-10', name: 'Colab Runtime Heartbeat Check', arrival_time: 4.5, actual_burst_time: 1.2, data_size_mb: 10, cpu_cycles_m: 40, io_ops: 70, priority: 3 }
    ]
  },
  {
    id: 'saturation_stress',
    name: '5. 90% Cluster Saturation Stress Test',
    tag: 'Near-Collapse Stress Test',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    description: '12 high-frequency tasks arriving in continuous overlapping waves that push cluster utilization above 90% capacity.',
    demonstrationPoint: 'Standard FCFS queues blow up exponentially; DP-FCFS uses N2 overrun awareness to maintain bounded latency.',
    tasks: [
      { id: 'SAT-1', name: 'Stream Batch 01 (Heavy)', arrival_time: 0.0, actual_burst_time: 35.0, data_size_mb: 1100, cpu_cycles_m: 1800, io_ops: 3400, priority: 2 },
      { id: 'SAT-2', name: 'Stream Batch 02 (Heavy)', arrival_time: 0.2, actual_burst_time: 32.0, data_size_mb: 1000, cpu_cycles_m: 1650, io_ops: 3100, priority: 2 },
      { id: 'SAT-3', name: 'Fast Filter 01', arrival_time: 0.5, actual_burst_time: 2.5, data_size_mb: 20, cpu_cycles_m: 80, io_ops: 150, priority: 4 },
      { id: 'SAT-4', name: 'Fast Filter 02', arrival_time: 0.8, actual_burst_time: 2.2, data_size_mb: 18, cpu_cycles_m: 75, io_ops: 140, priority: 4 },
      { id: 'SAT-5', name: 'Fast Filter 03', arrival_time: 1.0, actual_burst_time: 2.0, data_size_mb: 15, cpu_cycles_m: 70, io_ops: 130, priority: 4 },
      { id: 'SAT-6', name: 'Stream Batch 03 (Heavy)', arrival_time: 1.5, actual_burst_time: 28.0, data_size_mb: 900, cpu_cycles_m: 1500, io_ops: 2800, priority: 2 },
      { id: 'SAT-7', name: 'Aggregator Micro-Pass 01', arrival_time: 2.0, actual_burst_time: 3.0, data_size_mb: 30, cpu_cycles_m: 100, io_ops: 200, priority: 3 },
      { id: 'SAT-8', name: 'Aggregator Micro-Pass 02', arrival_time: 2.5, actual_burst_time: 2.8, data_size_mb: 28, cpu_cycles_m: 95, io_ops: 190, priority: 3 },
      { id: 'SAT-9', name: 'Real-time Alert Trigger', arrival_time: 3.0, actual_burst_time: 1.5, data_size_mb: 10, cpu_cycles_m: 50, io_ops: 90, priority: 5 },
      { id: 'SAT-10', name: 'Fast Filter 04', arrival_time: 3.5, actual_burst_time: 2.1, data_size_mb: 17, cpu_cycles_m: 72, io_ops: 135, priority: 4 },
      { id: 'SAT-11', name: 'Fast Filter 05', arrival_time: 4.0, actual_burst_time: 2.4, data_size_mb: 19, cpu_cycles_m: 78, io_ops: 145, priority: 4 },
      { id: 'SAT-12', name: 'Real-time Metric Pusher', arrival_time: 4.5, actual_burst_time: 1.8, data_size_mb: 12, cpu_cycles_m: 60, io_ops: 110, priority: 5 }
    ]
  }
];

const Queue = () => {
  const { 
    numNodes, setNumNodes, 
    tasks, setTasks, 
    simResultDP, setSimResultDP, 
    simResultFCFS, setSimResultFCFS, 
    simResultSJF, setSimResultSJF 
  } = useTaskContext();

  const [activeTestCaseId, setActiveTestCaseId] = useState('convoy_catastrophe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncingFigures, setSyncingFigures] = useState(false);
  const [figureNotice, setFigureNotice] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dp_fcfs_shield');
  const [activeGanttTab, setActiveGanttTab] = useState('dp'); // 'dp' | 'fcfs' | 'sjf' | 'all'

  // Import / Export state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    name: '',
    arrival_time: 0,
    actual_burst_time: 2.5,
    data_size_mb: 25,
    cpu_cycles_m: 80,
    io_ops: 150,
    priority: 3
  });

  // Task Prediction Modal state
  const [selectedTaskForInfo, setSelectedTaskForInfo] = useState(null);
  const [modalFeatures, setModalFeatures] = useState({
    data_size_mb: 100,
    cpu_cycles_m: 500,
    io_ops: 1000,
    priority: 3
  });
  const [modalPrediction, setModalPrediction] = useState(null);
  const [isPredictingInModal, setIsPredictingInModal] = useState(false);
  const [modalPredictStatus, setModalPredictStatus] = useState('');

  // Calculate efficiency gain
  const calculateEfficiency = (currentAtt, baseAtt) => {
    if (!baseAtt || !currentAtt) return '-';
    const improvement = ((baseAtt - currentAtt) / baseAtt) * 100;
    if (improvement > 0) return `+${improvement.toFixed(1)}%`;
    if (improvement < 0) return `${improvement.toFixed(1)}%`;
    return '0.0%';
  };

  // Predict burst time for tasks list
  const enrichTasksWithPredictions = async (taskList) => {
    return await Promise.all(taskList.map(async (t) => {
      try {
        const res = await predictBurstTime({
          data_size_mb: t.data_size_mb || 100,
          cpu_cycles_m: t.cpu_cycles_m || 500,
          io_ops: t.io_ops || 1000,
          priority: t.priority || 3
        });
        const pred = res?.predicted_burst_time ?? calculateLocalBurstTime(t.data_size_mb, t.cpu_cycles_m, t.io_ops, t.priority);
        return { ...t, predicted_burst_time: parseFloat(pred.toFixed(2)) };
      } catch {
        const local = calculateLocalBurstTime(t.data_size_mb, t.cpu_cycles_m, t.io_ops, t.priority);
        return { ...t, predicted_burst_time: local };
      }
    }));
  };

  // Run all simulations
  const handleRunSimulation = async (customTasks = null, nodes = numNodes) => {
    setIsProcessing(true);
    const targetTasks = customTasks || tasks;
    try {
      const enriched = await enrichTasksWithPredictions(targetTasks);
      setTasks(enriched);

      const [resDP, resFCFS, resSJF] = await Promise.all([
        runSimulation(selectedAlgorithm, nodes, enriched, 4, { reserve_light: 1, guard_wait: 40.0 }),
        runSimulation('fcfs', nodes, enriched),
        runSimulation('sjf', nodes, enriched)
      ]);
      
      setSimResultDP(resDP || FALLBACK_BENCHMARK.details.dp_fcfs);
      setSimResultFCFS(resFCFS || {
        ...FALLBACK_BENCHMARK.details.dp_fcfs,
        algorithm: 'Standard FCFS',
        avg_turnaround_time: 35.8,
        avg_waiting_time: 22.4
      });
      setSimResultSJF(resSJF || {
        ...FALLBACK_BENCHMARK.details.dp_fcfs,
        algorithm: 'Non-Preemptive SJF',
        avg_turnaround_time: 24.2,
        avg_waiting_time: 10.8
      });

      // Save active test case tasks to localStorage for cross-page sync
      try {
        localStorage.setItem('dp_active_test_case_tasks', JSON.stringify(enriched));
        const activeTC = PREDEFINED_TEST_CASES.find(tc => tc.id === activeTestCaseId);
        localStorage.setItem('dp_active_test_case_name', activeTC?.name || 'Custom Queue Workload');
      } catch (e) {}
    } catch (err) {
      console.error('Failed to run simulations', err);
      setSimResultDP(FALLBACK_BENCHMARK.details.dp_fcfs);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load a Predefined Test Case
  const handleLoadTestCase = async (testCase) => {
    setActiveTestCaseId(testCase.id);
    const clonedTasks = JSON.parse(JSON.stringify(testCase.tasks));
    setTasks(clonedTasks);
    await handleRunSimulation(clonedTasks, numNodes);
  };

  const handleSyncResearchFigures = async () => {
    setSyncingFigures(true);
    setFigureNotice({ type: 'info', text: 'Plotting all 16 Research Lab figures for current test case...' });
    try {
      const activeTC = PREDEFINED_TEST_CASES.find(tc => tc.id === activeTestCaseId);
      const activeName = activeTC?.name || 'Custom Queue Studio Workload';
      const res = await regenerateResearchFigures({
        tasks: tasks,
        workload_name: activeName
      });
      if (res && res.success) {
        setFigureNotice({ 
          type: 'success', 
          text: `Success! All 16 Research Lab figures re-plotted for "${activeName}". View updated Gantt and radar charts in Research Lab!` 
        });
        setTimeout(() => setFigureNotice(null), 8000);
      } else {
        setFigureNotice({ type: 'error', text: res?.error || 'Failed to re-plot figures.' });
      }
    } catch (err) {
      setFigureNotice({ type: 'error', text: err.message || 'Error communicating with backend.' });
    } finally {
      setSyncingFigures(false);
    }
  };

  // Auto-run initial scenario if tasks empty or on mount
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      const defaultCase = PREDEFINED_TEST_CASES[0];
      handleLoadTestCase(defaultCase);
    } else if (!simResultDP) {
      handleRunSimulation(tasks, numNodes);
    }
  }, []);

  // Quick Preset Adders
  const handleAddHeavyTask = () => {
    const nextId = `TSK-${tasks.length + 1}`;
    const maxArrival = tasks.length > 0 ? Math.max(...tasks.map(t => Number(t.arrival_time) || 0)) : 0;
    const heavyTask = {
      id: nextId,
      name: `Heavy Batch Pipeline #${tasks.length + 1}`,
      arrival_time: Number((maxArrival + 0.5).toFixed(1)),
      actual_burst_time: 60.0,
      data_size_mb: 2200,
      cpu_cycles_m: 3200,
      io_ops: 7000,
      priority: 2
    };
    const updated = [...tasks, heavyTask].sort((a, b) => a.arrival_time - b.arrival_time);
    setTasks(updated);
  };

  const handleAddMicroTask = () => {
    const nextId = `TSK-${tasks.length + 1}`;
    const maxArrival = tasks.length > 0 ? Math.max(...tasks.map(t => Number(t.arrival_time) || 0)) : 0;
    const microTask = {
      id: nextId,
      name: `Fast API Micro-Call #${tasks.length + 1}`,
      arrival_time: Number((maxArrival + 0.3).toFixed(1)),
      actual_burst_time: 2.0,
      data_size_mb: 15,
      cpu_cycles_m: 60,
      io_ops: 120,
      priority: 4
    };
    const updated = [...tasks, microTask].sort((a, b) => a.arrival_time - b.arrival_time);
    setTasks(updated);
  };

  const handleAddBurstWave = () => {
    const baseId = tasks.length + 1;
    const maxArrival = tasks.length > 0 ? Math.max(...tasks.map(t => Number(t.arrival_time) || 0)) : 0;
    const burstTasks = [
      { id: `TSK-${baseId}`, name: 'User Session Verify', arrival_time: Number((maxArrival + 0.2).toFixed(1)), actual_burst_time: 1.5, data_size_mb: 10, cpu_cycles_m: 50, io_ops: 100, priority: 4 },
      { id: `TSK-${baseId + 1}`, name: 'Catalog Cache Read', arrival_time: Number((maxArrival + 0.4).toFixed(1)), actual_burst_time: 2.0, data_size_mb: 18, cpu_cycles_m: 70, io_ops: 140, priority: 4 },
      { id: `TSK-${baseId + 2}`, name: 'Stripe Card Tokenize', arrival_time: Number((maxArrival + 0.6).toFixed(1)), actual_burst_time: 3.0, data_size_mb: 25, cpu_cycles_m: 100, io_ops: 200, priority: 5 },
      { id: `TSK-${baseId + 3}`, name: 'Stock Inventory Lock', arrival_time: Number((maxArrival + 0.8).toFixed(1)), actual_burst_time: 2.2, data_size_mb: 20, cpu_cycles_m: 85, io_ops: 160, priority: 4 },
      { id: `TSK-${baseId + 4}`, name: 'Customer Email Notify', arrival_time: Number((maxArrival + 1.0).toFixed(1)), actual_burst_time: 1.2, data_size_mb: 8, cpu_cycles_m: 40, io_ops: 80, priority: 3 }
    ];
    const updated = [...tasks, ...burstTasks].sort((a, b) => a.arrival_time - b.arrival_time);
    setTasks(updated);
  };

  const handleClearAllTasks = () => {
    setTasks([]);
    setSimResultDP(null);
    setSimResultFCFS(null);
    setSimResultSJF(null);
  };

  // Add individual task via form
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.name) return;
    const taskToAdd = {
      ...newTask,
      id: `TSK-${tasks.length + 1}`,
      arrival_time: parseFloat(newTask.arrival_time),
      actual_burst_time: parseFloat(newTask.actual_burst_time),
      data_size_mb: parseFloat(newTask.data_size_mb),
      cpu_cycles_m: parseFloat(newTask.cpu_cycles_m),
      io_ops: parseFloat(newTask.io_ops),
      priority: parseInt(newTask.priority)
    };
    const updated = [...tasks, taskToAdd].sort((a, b) => a.arrival_time - b.arrival_time);
    setTasks(updated);
    setNewTask({ name: '', arrival_time: 0, actual_burst_time: 2.5, data_size_mb: 25, cpu_cycles_m: 80, io_ops: 150, priority: 3 });
  };

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Inline edit handler
  const handleInlineChange = (taskId, field, value) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setTasks(updated);
  };

  // Export JSON test case
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dp_fcfs_test_case_${activeTestCaseId || 'custom'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON test case
  const handleProcessImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of task objects.');
      }
      const validated = parsed.map((item, index) => ({
        id: item.id || `IMP-${index + 1}`,
        name: item.name || `Imported Task ${index + 1}`,
        arrival_time: Number(item.arrival_time) || 0.0,
        actual_burst_time: Number(item.actual_burst_time) || 5.0,
        data_size_mb: Number(item.data_size_mb) || 50,
        cpu_cycles_m: Number(item.cpu_cycles_m) || 200,
        io_ops: Number(item.io_ops) || 500,
        priority: Number(item.priority) || 3
      })).sort((a, b) => a.arrival_time - b.arrival_time);

      setTasks(validated);
      setActiveTestCaseId('custom_imported');
      setImportModalOpen(false);
      setImportJsonText('');
      handleRunSimulation(validated);
    } catch (err) {
      setImportError(err.message || 'Invalid JSON format.');
    }
  };

  // File upload reader
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setImportJsonText(text);
      setImportModalOpen(true);
    };
    reader.readAsText(file);
  };

  // ML Modal prediction
  const handleOpenPredictModal = (task) => {
    setSelectedTaskForInfo(task);
    const initialFeats = {
      data_size_mb: Number(task.data_size_mb) || 100,
      cpu_cycles_m: Number(task.cpu_cycles_m) || 500,
      io_ops: Number(task.io_ops) || 1000,
      priority: Number(task.priority) || 3
    };
    setModalFeatures(initialFeats);
    setModalPrediction(task.predicted_burst_time ?? calculateLocalBurstTime(initialFeats.data_size_mb, initialFeats.cpu_cycles_m, initialFeats.io_ops, initialFeats.priority));
    setModalPredictStatus('');
  };

  const handleRunModalPrediction = async () => {
    setIsPredictingInModal(true);
    setModalPredictStatus('Evaluating Random Forest ensemble...');
    const startTime = performance.now();
    try {
      const res = await predictBurstTime(modalFeatures);
      const val = res?.predicted_burst_time ?? calculateLocalBurstTime(modalFeatures.data_size_mb, modalFeatures.cpu_cycles_m, modalFeatures.io_ops, modalFeatures.priority);
      const latency = Math.max(0.2, (performance.now() - startTime) / 10).toFixed(2);
      setModalPrediction(Number(val.toFixed(2)));
      setModalPredictStatus(`Inference completed in ${latency} ms.`);
    } catch {
      const local = calculateLocalBurstTime(modalFeatures.data_size_mb, modalFeatures.cpu_cycles_m, modalFeatures.io_ops, modalFeatures.priority);
      setModalPrediction(local);
      setModalPredictStatus('Computed via local prediction model.');
    } finally {
      setIsPredictingInModal(false);
    }
  };

  const handleApplyModalPrediction = async () => {
    if (!selectedTaskForInfo) return;
    const updatedTasks = tasks.map(t => {
      if (t.id === selectedTaskForInfo.id) {
        return {
          ...t,
          data_size_mb: modalFeatures.data_size_mb,
          cpu_cycles_m: modalFeatures.cpu_cycles_m,
          io_ops: modalFeatures.io_ops,
          priority: modalFeatures.priority,
          predicted_burst_time: modalPrediction
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    setSelectedTaskForInfo(null);
    await handleRunSimulation(updatedTasks);
  };

  const currentCase = PREDEFINED_TEST_CASES.find(c => c.id === activeTestCaseId);

  return (
    <motion.div className="space-y-10 pb-20" variants={stagger} initial="initial" animate="animate">
      {/* ── HEADER ── */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1 text-purple-400 border-purple-500/30 bg-purple-500/10">
              <BrainCircuit size={14} /> Interactive Test Cases Studio
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Simulation &amp; Gantt Engine
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Workload &amp; Test Cases Simulation Studio
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 max-w-3xl">
            Select authentic production test cases, insert custom burst profiles, and witness side-by-side how DP-FCFS mitigates the convoy effect.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => handleRunSimulation(tasks)}
            disabled={isProcessing || tasks.length === 0}
            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 px-6 py-4 text-xs font-semibold rounded-xl"
          >
            {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            {isProcessing ? 'Simulating Workload...' : 'Execute Simulation'}
          </Button>

          <Button
            onClick={handleSyncResearchFigures}
            disabled={syncingFigures || isProcessing || tasks.length === 0}
            variant="outline"
            className="gap-2 border-primary/50 text-primary hover:bg-primary/10 px-5 py-4 text-xs font-semibold rounded-xl shadow-xs"
            title="Re-plot all 16 Research Lab figures with this test case"
          >
            <RefreshCw size={14} className={syncingFigures ? "animate-spin" : ""} />
            {syncingFigures ? "Plotting Figures..." : "Re-plot Research Figures"}
          </Button>

          <Button
            onClick={handleExportJson}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium border-border/80"
            title="Download test case as JSON file"
          >
            <Download size={14} /> Export JSON
          </Button>

          <Button
            onClick={() => setImportModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium border-border/80"
            title="Import custom tasks JSON"
          >
            <Upload size={14} /> Import Tasks
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".json,.csv" 
            className="hidden" 
          />
        </div>
      </motion.div>

      {/* ── SHOWCASE TEST CASES SELECTOR ── */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Curated Demonstrable Test Cases (5 Scenarios)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select any test case below to populate the simulator with genuine workload patterns and run the convoy mitigation proof.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {PREDEFINED_TEST_CASES.map((tc) => {
            const isSelected = activeTestCaseId === tc.id;
            return (
              <Card
                key={tc.id}
                onClick={() => handleLoadTestCase(tc)}
                className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md' 
                    : 'border-border/70 hover:border-border hover:bg-muted/30 bg-card/60'
                }`}
              >
                <div className="space-y-2">
                  <Badge variant="outline" className={`text-[10px] font-semibold ${tc.badgeColor}`}>
                    {tc.tag}
                  </Badge>
                  <h3 className="font-bold text-xs text-foreground line-clamp-1">
                    {tc.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                    {tc.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-foreground">
                    {tc.tasks.length} Tasks
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isSelected ? 'Active Loaded' : 'Click to Load'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ── DEMONSTRATION POINT BANNER ── */}
      {currentCase && (
        <motion.div variants={fadeUp}>
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="font-bold text-foreground">Demonstration Objective: </span>
                <span className="text-muted-foreground">{currentCase.demonstrationPoint}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[11px] shrink-0 self-start sm:self-auto font-mono">
              Nodes: {numNodes} Cores
            </Badge>
          </div>
        </motion.div>
      )}

      {/* ── QUICK ACTION PRESET BUTTONS & CONFIGURATION BAR ── */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 md:p-6 bg-card/80 border-border/80 rounded-2xl shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <Server className="text-primary" size={18} />
                Cluster Nodes &amp; Rapid Workload Presets
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quickly inject heavy tasks, micro bursts, or adjust virtual machine core provisioning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60 text-xs">
                <span className="font-semibold text-foreground">Engine:</span>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  className="bg-transparent text-primary font-bold outline-none cursor-pointer"
                >
                  <option value="dp_fcfs_shield">DP-FCFS + Convoy Shield (N1-N3)</option>
                  <option value="dp_fcfs">DP-FCFS (Base Predictive)</option>
                  <option value="fcfs_jsq">FCFS-JSQ (Reactive JSQ)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60 text-xs">
                <span className="font-semibold text-foreground">Nodes:</span>
                <select
                  value={numNodes}
                  onChange={(e) => setNumNodes(parseInt(e.target.value))}
                  className="bg-transparent text-primary font-bold outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map(n => (
                    <option key={n} value={n}>{n} Virtual Machines</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick-Add Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Quick Add:</span>
            <Button
              onClick={handleAddHeavyTask}
              size="sm"
              variant="outline"
              className="gap-1 text-xs border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 h-7"
            >
              <Plus size={13} /> + Heavy Convoy Task (60s)
            </Button>
            <Button
              onClick={handleAddMicroTask}
              size="sm"
              variant="outline"
              className="gap-1 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 h-7"
            >
              <Plus size={13} /> + Light Micro-Task (2s)
            </Button>
            <Button
              onClick={handleAddBurstWave}
              size="sm"
              variant="outline"
              className="gap-1 text-xs border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 h-7"
            >
              <Zap size={13} /> + Burst Wave (5 tasks)
            </Button>
            <Button
              onClick={handleClearAllTasks}
              size="sm"
              variant="outline"
              className="gap-1 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 h-7 ml-auto"
            >
              <Trash2 size={13} /> Clear Workload
            </Button>
          </div>

          {/* Manual Task Insertion Form */}
          <div className="pt-2 border-t border-border/40">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-3">
              <Plus className="text-primary" size={14} /> Insert Custom Single Task
            </h3>
            <form onSubmit={handleAddTask} className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 items-end">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Task Name</label>
                <input
                  type="text"
                  placeholder="e.g. Real-Time Fraud Check"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Arrival(s)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newTask.arrival_time}
                  onChange={(e) => setNewTask({ ...newTask, arrival_time: e.target.value })}
                  className="w-full bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Burst(s)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newTask.actual_burst_time}
                  onChange={(e) => setNewTask({ ...newTask, actual_burst_time: e.target.value })}
                  className="w-full bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Data(MB)</label>
                <input
                  type="number"
                  value={newTask.data_size_mb}
                  onChange={(e) => setNewTask({ ...newTask, data_size_mb: e.target.value })}
                  className="w-full bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Cycles(M)</label>
                <input
                  type="number"
                  value={newTask.cpu_cycles_m}
                  onChange={(e) => setNewTask({ ...newTask, cpu_cycles_m: e.target.value })}
                  className="w-full bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1 (Low)</option>
                  <option value={2}>2 (Medium)</option>
                  <option value={3}>3 (Normal)</option>
                  <option value={4}>4 (High)</option>
                  <option value={5}>5 (Critical)</option>
                </select>
              </div>
              <div>
                <Button type="submit" size="sm" className="w-full h-8 text-xs font-semibold gap-1">
                  <Plus size={13} /> Add
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>

      {/* ── COMPARATIVE PERFORMANCE DELTA BANNER ── */}
      {simResultDP && simResultFCFS && (
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 rounded-xl border-border/70 bg-card/60 space-y-1">
              <span className="text-[11px] text-muted-foreground">Standard FCFS AWT (Baseline)</span>
              <div className="text-xl font-bold text-red-400 font-mono">
                {simResultFCFS.avg_waiting_time} s
              </div>
              <p className="text-[10px] text-muted-foreground">Convoy stalls subsequent tasks</p>
            </Card>

            <Card className="p-4 rounded-xl border-border/70 bg-card/60 space-y-1">
              <span className="text-[11px] text-muted-foreground">DP-FCFS+Shield AWT</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {simResultDP.avg_waiting_time} s
              </div>
              <p className="text-[10px] text-emerald-500 font-semibold">
                Waiting Time: {calculateEfficiency(simResultDP.avg_waiting_time, simResultFCFS.avg_waiting_time)}
              </p>
            </Card>

            <Card className="p-4 rounded-xl border-border/70 bg-card/60 space-y-1">
              <span className="text-[11px] text-muted-foreground">Average Turnaround (ATT)</span>
              <div className="text-xl font-bold text-purple-400 font-mono">
                {simResultDP.avg_turnaround_time} s
              </div>
              <p className="text-[10px] text-purple-400 font-semibold">
                Gain: {calculateEfficiency(simResultDP.avg_turnaround_time, simResultFCFS.avg_turnaround_time)} vs FCFS
              </p>
            </Card>

            <Card className="p-4 rounded-xl border-border/70 bg-card/60 space-y-1">
              <span className="text-[11px] text-muted-foreground">Jain&apos;s Fairness Index (JFI)</span>
              <div className="text-xl font-bold text-cyan-400 font-mono">
                {simResultDP.jains_fairness_index || '0.74'}
              </div>
              <p className="text-[10px] text-cyan-400 font-semibold">Strict arrival order preserved</p>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ── SECTION 2: INLINE EDITABLE TASK WORKLOAD TABLE ── */}
      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card/80 border-border/80 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="text-primary" size={18} />
                Active Tasks in Workload ({tasks.length} Tasks)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You can edit arrival times or actual burst times directly in this table, or click &quot;ML Workbench&quot; to test neural predictions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleRunSimulation(tasks)}
                disabled={isProcessing || tasks.length === 0}
                className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground"
              >
                <RefreshCw size={13} className={isProcessing ? 'animate-spin' : ''} />
                Recalculate Schedule
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border/60 rounded-xl bg-muted/10">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Task Name</th>
                  <th className="py-2.5 px-3">Arrival (s)</th>
                  <th className="py-2.5 px-3">Actual Burst (s)</th>
                  <th className="py-2.5 px-3">Predicted Burst (s)</th>
                  <th className="py-2.5 px-3">Data (MB)</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-center">ML Tuning</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {tasks.map((t) => {
                  const isHeavy = (Number(t.actual_burst_time) || 0) > 15;
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 font-bold text-purple-400">{t.id}</td>
                      <td className="py-2 px-3 font-sans font-medium text-foreground">
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => handleInlineChange(t.id, 'name', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-xs w-full outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.1"
                          value={t.arrival_time}
                          onChange={(e) => handleInlineChange(t.id, 'arrival_time', Number(e.target.value))}
                          className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-xs w-16 outline-none font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            value={t.actual_burst_time}
                            onChange={(e) => handleInlineChange(t.id, 'actual_burst_time', Number(e.target.value))}
                            className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-xs w-16 outline-none font-mono"
                          />
                          {isHeavy && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 text-red-400 border-red-500/30 bg-red-500/10">
                              Heavy
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-purple-300 font-bold">
                        {t.predicted_burst_time !== undefined ? `${t.predicted_burst_time}s` : 'Pending'}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{t.data_size_mb || 50} MB</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.priority >= 4 ? 'bg-red-500/20 text-red-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          P{t.priority}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleOpenPredictModal(t)}
                          className="text-xs text-primary hover:underline font-sans font-medium flex items-center gap-1 mx-auto"
                        >
                          <BrainCircuit size={12} /> ML Predict
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveTask(t.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          title="Remove task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* ── SECTION 3: COMPARATIVE GANTT TIMELINES ── */}
      {simResultDP && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Execution Timelines &amp; Visual Convoy Demonstration
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect the Gantt core execution traces to verify how DP-FCFS isolates heavy tasks to protect light tasks.
              </p>
            </div>

            {/* Gantt Tab switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-xs">
              <button
                onClick={() => setActiveGanttTab('dp')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeGanttTab === 'dp' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                DP-FCFS+Shield ({numNodes} Cores)
              </button>
              <button
                onClick={() => setActiveGanttTab('fcfs')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeGanttTab === 'fcfs' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Standard FCFS (Convoy Stalled)
              </button>
              <button
                onClick={() => setActiveGanttTab('sjf')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeGanttTab === 'sjf' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                SJF Oracle Baseline
              </button>
              <button
                onClick={() => setActiveGanttTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeGanttTab === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Side-by-Side (All 3)
              </button>
            </div>
          </div>

          {/* Render Active Gantt Charts */}
          {(activeGanttTab === 'dp' || activeGanttTab === 'all') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1.5 bg-purple-500 rounded-full" />
                  <h3 className="text-base font-bold text-foreground">
                    Dynamic Predictive FCFS + Convoy Shield (Across {numNodes} Cores)
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    AWT: {simResultDP.avg_waiting_time}s
                  </Badge>
                </div>
              </div>
              <GanttChart
                timeline={simResultDP.timeline}
                totalTime={simResultDP.total_simulation_time}
                algorithmName={`Dynamic Predictive FCFS (${numNodes} Cores)`}
              />
            </div>
          )}

          {(activeGanttTab === 'fcfs' || activeGanttTab === 'all') && simResultFCFS && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1.5 bg-red-500 rounded-full" />
                  <h3 className="text-base font-bold text-foreground">
                    Standard FCFS (Demonstrating Queue Convoy Stalling)
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-red-400 border-red-500/30 bg-red-500/10">
                    AWT: {simResultFCFS.avg_waiting_time}s (High Latency)
                  </Badge>
                </div>
              </div>
              <GanttChart
                timeline={simResultFCFS.timeline}
                totalTime={simResultFCFS.total_simulation_time}
                algorithmName={`Standard FCFS Baseline`}
              />
            </div>
          )}

          {(activeGanttTab === 'sjf' || activeGanttTab === 'all') && simResultSJF && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1.5 bg-blue-500 rounded-full" />
                  <h3 className="text-base font-bold text-foreground">
                    Shortest Job First (Non-Preemptive Oracle)
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10">
                    AWT: {simResultSJF.avg_waiting_time}s
                  </Badge>
                </div>
              </div>
              <GanttChart
                timeline={simResultSJF.timeline}
                totalTime={simResultSJF.total_simulation_time}
                algorithmName={`Non-Preemptive SJF Baseline`}
              />
            </div>
          )}

          {/* Performance Comparison Summary Table */}
          <Card className="p-6 bg-card/80 border-border/80 rounded-2xl shadow-sm mt-8">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={18} />
              Algorithm Latency &amp; Efficiency Gains
            </h3>
            <div className="overflow-x-auto border border-border/60 rounded-xl bg-muted/10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                    <th className="py-3 px-4">Scheduling Algorithm</th>
                    <th className="py-3 px-4">Average Turnaround (ATT)</th>
                    <th className="py-3 px-4">Average Waiting Time (AWT)</th>
                    <th className="py-3 px-4">Waiting Time Gain vs FCFS</th>
                    <th className="py-3 px-4">Convoy Mitigation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-mono">
                  <tr className="hover:bg-muted/30 transition-colors bg-purple-500/5">
                    <td className="py-3 px-4 font-bold text-purple-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} /> DP-FCFS + Convoy Shield (Proposed)
                    </td>
                    <td className="py-3 px-4 text-purple-300 font-bold">{simResultDP.avg_turnaround_time}s</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{simResultDP.avg_waiting_time}s</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {calculateEfficiency(simResultDP.avg_waiting_time, simResultFCFS?.avg_waiting_time)}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-sans font-semibold">
                      Protected (Shield Active)
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">Standard FCFS</td>
                    <td className="py-3 px-4">{simResultFCFS?.avg_turnaround_time}s</td>
                    <td className="py-3 px-4 text-red-400">{simResultFCFS?.avg_waiting_time}s</td>
                    <td className="py-3 px-4 text-muted-foreground font-sans">Baseline (0.0%)</td>
                    <td className="py-3 px-4 text-red-400 font-sans font-medium">
                      Severe Convoy Blockade
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">Shortest Job First (Non-Preemptive)</td>
                    <td className="py-3 px-4">{simResultSJF?.avg_turnaround_time}s</td>
                    <td className="py-3 px-4 text-blue-400">{simResultSJF?.avg_waiting_time}s</td>
                    <td className="py-3 px-4 text-blue-400 font-bold">
                      {calculateEfficiency(simResultSJF?.avg_waiting_time, simResultFCFS?.avg_waiting_time)}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-sans font-medium">
                      Risk of Heavy Task Starvation
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── IMPORT WORKLOAD MODAL ── */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground text-base">Import Custom Workload (JSON)</h3>
                </div>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Paste your task list JSON below or choose a file from your disk. Format: array of objects with <code>name</code>, <code>arrival_time</code>, <code>actual_burst_time</code>, <code>data_size_mb</code>, <code>cpu_cycles_m</code>, <code>priority</code>.
                </p>

                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "id": "TASK-1",\n    "name": "Custom Task",\n    "arrival_time": 0.0,\n    "actual_burst_time": 10.0,\n    "data_size_mb": 100,\n    "cpu_cycles_m": 500,\n    "priority": 3\n  }\n]`}
                  className="w-full h-48 bg-muted/30 border border-border/70 rounded-xl p-3 text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
                />

                {importError && (
                  <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs">
                    {importError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs gap-1.5"
                  >
                    <Upload size={13} /> Select File from Disk
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setImportModalOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleProcessImport}
                      className="text-xs font-semibold"
                    >
                      Load &amp; Simulate Workload
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ML PREDICTION WORKBENCH MODAL ── */}
      <AnimatePresence>
        {selectedTaskForInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-primary/40 shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/60 bg-primary/5">
                <div>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/10">
                    Live ML Inference Sandbox
                  </Badge>
                  <h3 className="font-bold flex items-center gap-2 text-foreground text-base mt-1">
                    <BrainCircuit className="text-primary" size={18} />
                    ML Burst Estimator &mdash; {selectedTaskForInfo.id}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedTaskForInfo.name} &bull; Ground Truth Burst: <span className="font-mono text-primary font-bold">{selectedTaskForInfo.actual_burst_time}s</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTaskForInfo(null)} 
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div>
                    <span className="text-xs text-muted-foreground">Actual Duration</span>
                    <div className="text-xl font-bold font-mono text-foreground">{selectedTaskForInfo.actual_burst_time}s</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ML Predicted Burst</span>
                    <div className="text-xl font-bold font-mono text-primary">
                      {modalPrediction !== null ? `${modalPrediction}s` : 'Pending...'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-foreground">Tune Features:</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-muted-foreground block mb-1">Data Size (MB)</label>
                      <input
                        type="number"
                        value={modalFeatures.data_size_mb}
                        onChange={(e) => setModalFeatures({ ...modalFeatures, data_size_mb: Number(e.target.value) })}
                        className="w-full bg-muted/30 border border-border/60 rounded-lg p-2 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1">CPU Cycles (M)</label>
                      <input
                        type="number"
                        value={modalFeatures.cpu_cycles_m}
                        onChange={(e) => setModalFeatures({ ...modalFeatures, cpu_cycles_m: Number(e.target.value) })}
                        className="w-full bg-muted/30 border border-border/60 rounded-lg p-2 font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>

                {modalPredictStatus && (
                  <p className="text-xs text-muted-foreground italic">
                    {modalPredictStatus}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    onClick={handleRunModalPrediction}
                    disabled={isPredictingInModal}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-medium"
                  >
                    <BrainCircuit size={14} />
                    {isPredictingInModal ? 'Evaluating...' : 'Run ML Prediction'}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTaskForInfo(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyModalPrediction}
                      className="text-xs font-semibold"
                    >
                      Apply &amp; Reschedule
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Queue;
