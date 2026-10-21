import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitFork, 
  Workflow, 
  Cpu, 
  BrainCircuit, 
  Layers, 
  Server, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Play, 
  Sparkles,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import StatCard from '../components/Charts/StatCard';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

// Pipeline Architecture Stages
const PIPELINE_NODES = [
  {
    id: 'ingest',
    number: '01',
    title: 'Cloud Task Ingestion',
    subtitle: 'REST / gRPC / Workload Stream',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    description: 'Incoming client cloud tasks arrive at random intervals with varying data sizes and execution demands.',
    details: [
      { label: 'Ingest Rate', value: '10 - 500 tasks/sec' },
      { label: 'Protocols', value: 'HTTP/2, gRPC, Kafka' },
      { label: 'Telemetry', value: 'Arrival Timestamp ($t_a$)' }
    ],
    formula: 'Task = { id, arrival_time, data_size, priority }'
  },
  {
    id: 'extract',
    number: '02',
    title: 'Feature Vector Extraction',
    subtitle: 'Metadata & Telemetry Parser',
    icon: Cpu,
    color: 'from-cyan-500 to-teal-500',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    description: 'Extracts 4 critical runtime workload dimensions: payload size (MB), required CPU cycles (M), I/O operations, and priority level.',
    details: [
      { label: 'Data Size (x1)', value: '10 - 1000 MB' },
      { label: 'CPU Cycles (x2)', value: '50 - 5000 M' },
      { label: 'I/O Ops (x3)', value: '100 - 10,000 ops' },
      { label: 'Priority (x4)', value: '1 (Low) to 5 (Critical)' }
    ],
    formula: 'x = [ DataSize, CPUCycles, IO_Ops, Priority ]'
  },
  {
    id: 'predict',
    number: '03',
    title: 'ML Burst Predictor',
    subtitle: 'Trained Regression Model',
    icon: BrainCircuit,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    description: 'Applies the trained predictive regression model to estimate precise CPU burst execution time in seconds before assigning resources.',
    details: [
      { label: 'Model Accuracy', value: '98.42% (R²)' },
      { label: 'Inference Latency', value: '< 0.5 ms' },
      { label: 'Output', value: 'Predicted Burst b (sec)' }
    ],
    formula: 'PredictedBurst = 0.012*(DataSize) + 0.006*(CPUCycles) + 0.0015*(IO_Ops) + 0.2*(6 - Priority)'
  },
  {
    id: 'convoy',
    number: '04',
    title: 'Convoy Risk Analysis',
    subtitle: 'Anti-Starvation & Queue Sorter',
    icon: ShieldAlert,
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    description: 'Detects if a heavy batch task (burst > 40s) will block rapid micro-burst tasks (burst < 3s), dynamically assigning virtual queues.',
    details: [
      { label: 'Convoy Threshold', value: 'Ratio Head/Tail > 10' },
      { label: 'Classification', value: 'Express vs Bulk Queues' },
      { label: 'Aging Factor', value: 'alpha = 0.05 per waiting cycle' }
    ],
    formula: 'PriorityScore = (Priority * 10) / (PredictedBurst + 1) + alpha * WaitTime'
  },
  {
    id: 'dispatch',
    number: '05',
    title: 'Dynamic Multi-Core Dispatcher',
    subtitle: 'VM Load Balancer',
    icon: Layers,
    color: 'from-emerald-500 to-green-500',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    description: 'Schedules tasks across available Cloud Node Virtual Machines (VM-1, VM-2, VM-3) minimizing idle time and max makespan.',
    details: [
      { label: 'Target Nodes', value: 'Cloud Cluster (VM 1..N)' },
      { label: 'Dispatch Policy', value: 'Least-Loaded Predictive Core' },
      { label: 'Lock Contention', value: 'Lock-Free Non-blocking' }
    ],
    formula: 'VM_target = argmin( ReadyTime(VM_k) )'
  },
  {
    id: 'execution',
    number: '06',
    title: 'Cloud Node Execution & Telemetry',
    subtitle: 'Metrics Feedback Loop',
    icon: Server,
    color: 'from-indigo-500 to-violet-500',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
    description: 'Tasks run on virtual cores. Actual execution time is captured and fed back to update regression weights and live analytics.',
    details: [
      { label: 'Turnaround Time', value: 'TAT = FinishTime - ArrivalTime' },
      { label: 'Waiting Time', value: 'WT = TAT - ActualBurst' },
      { label: 'Feedback Delta', value: 'error = |ActualBurst - PredictedBurst|' }
    ],
    formula: 'Telemetry -> Analytics Dashboard & Reports'
  }
];

// Sample Tracing Workloads
const TRACE_PRESETS = [
  {
    id: 'sample_ecommerce',
    name: 'E-Commerce Surge Task (Fast Checkout)',
    data_size: 15,
    cpu: 80,
    io: 220,
    priority: 5,
    expected_burst: '1.48s',
    risk: 'Low Convoy Risk (Express Route)'
  },
  {
    id: 'sample_dna',
    name: 'Genomic Alignment (Heavy Batch)',
    data_size: 950,
    cpu: 4500,
    io: 8000,
    priority: 1,
    expected_burst: '51.4s',
    risk: 'High Convoy Leader (Assigned Bulk Stream)'
  },
  {
    id: 'sample_hft',
    name: 'FinTech Arbitrage (Ultra Micro-Burst)',
    data_size: 6,
    cpu: 40,
    io: 90,
    priority: 5,
    expected_burst: '0.65s',
    risk: 'Ultra Express High Priority'
  }
];

export default function Flowcharts() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedNode, setSelectedNode] = useState(PIPELINE_NODES[0]);
  const [activeTrace, setActiveTrace] = useState(TRACE_PRESETS[0]);
  const [traceStep, setTraceStep] = useState(0);

  const handleNextStep = () => {
    setTraceStep((prev) => (prev + 1) % PIPELINE_NODES.length);
    setSelectedNode(PIPELINE_NODES[(traceStep + 1) % PIPELINE_NODES.length]);
  };

  const handleResetTrace = () => {
    setTraceStep(0);
    setSelectedNode(PIPELINE_NODES[0]);
  };

  return (
    <motion.div className="space-y-10" variants={stagger} initial="initial" animate="animate">
      {/* Header Banner */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 px-3 py-1 text-[11px] uppercase tracking-wider bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
            <GitFork size={14} /> System Architecture & Flowchart Suite
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Scheduling Flowcharts & Pipeline Logic
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
          Explore interactive flowchart models detailing how cloud tasks transition from raw ingestion through 
          machine-learning burst estimation, convoy prevention, and multi-core dispatching.
        </p>
      </motion.div>

      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pipeline Stages"
          value="6 Phases"
          icon={Workflow}
          color="blue"
          delay={0.05}
        />
        <StatCard
          title="Prediction Model"
          value="Random Forest / Physics"
          icon={BrainCircuit}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="Convoy Mitigation"
          value="Active (Dual-Stream)"
          icon={ShieldAlert}
          color="green"
          delay={0.15}
        />
        <StatCard
          title="Dispatch Latency"
          value="< 1.2 ms"
          icon={Zap}
          color="orange"
          delay={0.2}
        />
      </div>

      {/* Tab Navigation */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Button
          variant={activeTab === 'pipeline' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pipeline')}
          className="gap-2"
        >
          <Workflow size={16} />
          End-to-End Pipeline Flowchart
        </Button>
        <Button
          variant={activeTab === 'fcfs_vs_dp' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fcfs_vs_dp')}
          className="gap-2"
        >
          <GitFork size={16} />
          Standard FCFS vs. DP-FCFS Decision Tree
        </Button>
        <Button
          variant={activeTab === 'convoy' ? 'default' : 'outline'}
          onClick={() => setActiveTab('convoy')}
          className="gap-2"
        >
          <ShieldAlert size={16} />
          Convoy Effect Breakdown Flow
        </Button>
      </motion.div>

      {/* TAB 1: END-TO-END PIPELINE FLOWCHART */}
      {activeTab === 'pipeline' && (
        <motion.div variants={fadeUp} className="space-y-8">
          {/* Interactive Flowchart Visualizer */}
          <Card className="p-6 md:p-8 bg-card border-border shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Workflow className="text-blue-500" size={20} />
                  DP-FCFS System Architecture Pipeline
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on any node to inspect formulas, telemetry metrics, and algorithmic data transformations.
                </p>
              </div>

              {/* Step Trace Controls */}
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={handleResetTrace} className="gap-1.5">
                  <RefreshCw size={14} /> Reset
                </Button>
                <Button size="sm" onClick={handleNextStep} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <Play size={14} /> Next Node ({traceStep + 1}/6)
                </Button>
              </div>
            </div>

            {/* Pipeline Stage Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PIPELINE_NODES.map((node, index) => {
                const IconComponent = node.icon;
                const isSelected = selectedNode.id === node.id;
                const isCurrentTrace = traceStep === index;

                return (
                  <motion.div
                    key={node.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedNode(node);
                      setTraceStep(index);
                    }}
                    className={`cursor-pointer relative p-5 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? `bg-muted/80 ${node.borderColor} ring-2 ring-blue-500/40 shadow-lg`
                        : 'bg-muted/30 border-border hover:border-border/80'
                    }`}
                  >
                    {isCurrentTrace && (
                      <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 text-[10px] text-white items-center justify-center font-bold">
                          ✓
                        </span>
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-lg ${node.bgColor} ${node.textColor}`}>
                        <IconComponent size={20} />
                      </div>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        PHASE {node.number}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-foreground">{node.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{node.subtitle}</p>

                    <p className="text-xs text-muted-foreground/90 mt-3 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-blue-400">
                        {node.details[0].label}: {node.details[0].value}
                      </span>
                      <ArrowRight size={13} className="text-muted-foreground" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Selected Node Detailed Deep Dive */}
          <Card className="p-6 md:p-8 bg-card border-border">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Node Overview */}
              <div className="lg:w-1/2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${selectedNode.bgColor} ${selectedNode.textColor}`}>
                    <selectedNode.icon size={26} />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      Stage {selectedNode.number} Inspection
                    </span>
                    <h3 className="text-2xl font-bold text-foreground">{selectedNode.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedNode.description}
                </p>

                {/* Mathematical Model Card */}
                <div className="p-4 rounded-lg bg-muted/60 border border-border space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Info size={13} /> Mathematical Representation
                  </span>
                  <div className="p-3 bg-background rounded border border-border/50 font-mono text-xs text-blue-400 overflow-x-auto">
                    {selectedNode.formula}
                  </div>
                </div>
              </div>

              {/* Right: Telemetry & State Key-Values */}
              <div className="lg:w-1/2 space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Operational Parameters & Metrics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedNode.details.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <div className="text-base font-bold text-foreground font-mono">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Interactive Trace Playground */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={14} className="text-yellow-500" /> Live Task Trace Through Node
                    </span>
                    <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">
                      Preset: {activeTrace.name.split(' ')[0]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TRACE_PRESETS.map((p) => (
                      <Button
                        key={p.id}
                        size="sm"
                        variant={activeTrace.id === p.id ? 'default' : 'outline'}
                        onClick={() => setActiveTrace(p)}
                        className="text-xs h-7 px-2.5"
                      >
                        {p.name.split(' ')[0]}
                      </Button>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground font-mono pt-1">
                    Task Payload: {activeTrace.data_size}MB | {activeTrace.cpu}M Cycles | Predicted: <span className="text-emerald-400 font-bold">{activeTrace.expected_burst}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* TAB 2: STANDARD FCFS VS DP-FCFS DECISION TREE */}
      {activeTab === 'fcfs_vs_dp' && (
        <motion.div variants={fadeUp} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Standard FCFS Flow */}
            <Card className="p-6 md:p-8 bg-card border-red-500/20 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <Badge variant="outline" className="text-red-400 border-red-500/30 bg-red-500/10 text-xs mb-2">
                    Legacy Paradigm
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground">Standard First-Come-First-Served (FCFS)</h3>
                </div>
              </div>

              {/* Step Sequence */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/40 border border-border flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-muted text-xs font-mono font-bold text-muted-foreground">1</span>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">Task Ingestion</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Tasks enter single FIFO queue strictly ordered by Arrival Time.</p>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-muted-foreground"><ArrowRight size={18} className="rotate-90" /></div>

                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-xs font-mono font-bold text-red-400">2</span>
                  <div>
                    <h5 className="text-sm font-semibold text-red-400">Zero Execution Awareness (Blind Dispatch)</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Scheduler has NO knowledge of task burst lengths. A 60s batch job blocks subsequent 1s API requests.</p>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-muted-foreground"><ArrowRight size={18} className="rotate-90" /></div>

                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-xs font-mono font-bold text-red-400">3</span>
                  <div>
                    <h5 className="text-sm font-semibold text-red-400">Severe Convoy Effect Occurrence</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Average waiting time skyrockets (e.g., 28.5s). CPU idle times increase between uneven task bursts.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg Waiting Time: <strong className="text-red-400">High (~28.4s)</strong></span>
                <span>Fairness: <strong className="text-yellow-400">Strict FIFO only</strong></span>
              </div>
            </Card>

            {/* Dynamic Predictive FCFS Flow */}
            <Card className="p-6 md:p-8 bg-card border-emerald-500/20 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs mb-2">
                    Intelligent Cloud Scheduler
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground">Dynamic Predictive FCFS (DP-FCFS)</h3>
                </div>
              </div>

              {/* Step Sequence */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/40 border border-border flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-muted text-xs font-mono font-bold text-muted-foreground">1</span>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">Multi-Dimensional Feature Ingestion</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Extracts payload data size, CPU cycles, I/O frequency, and priority weight.</p>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-muted-foreground"><ArrowRight size={18} className="rotate-90" /></div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-xs font-mono font-bold text-emerald-400">2</span>
                  <div>
                    <h5 className="text-sm font-semibold text-emerald-400">Predictive Burst Estimation (ML Model)</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Computes predicted burst in sub-milliseconds with 98.4% accuracy, anticipating execution duration.</p>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-muted-foreground"><ArrowRight size={18} className="rotate-90" /></div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-xs font-mono font-bold text-emerald-400">3</span>
                  <div>
                    <h5 className="text-sm font-semibold text-emerald-400">Dual-Stream Predictive Load Balancing</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Micro-tasks execute without convoy blockage; heavy batches run on dedicated cores.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg Waiting Time: <strong className="text-emerald-400">Optimized (~9.2s)</strong></span>
                <span>Throughput: <strong className="text-emerald-400">+65% Higher</strong></span>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* TAB 3: CONVOY EFFECT BREAKDOWN FLOW */}
      {activeTab === 'convoy' && (
        <motion.div variants={fadeUp} className="space-y-8">
          <Card className="p-6 md:p-8 bg-card border-border">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={20} />
              The Convoy Effect: Problem vs. DP-FCFS Mitigation Strategy
            </h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              In classical operating systems and cloud clusters, the <em>Convoy Effect</em> occurs when one slow, 
              CPU-heavy process holds the processor while dozens of fast I/O or microservice processes wait behind it in a strict FIFO queue.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400">STEP 1: BATCH INGESTION</div>
                <h4 className="text-base font-bold text-foreground">Heavy Job Arrives at T=0</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A massive batch job (e.g. 950MB ETL process, burst = 65s) arrives first and is assigned to the active CPU node.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="text-xs font-mono font-bold text-red-400">STEP 2: QUEUE CONGESTION</div>
                <h4 className="text-base font-bold text-foreground">Rapid Micro-bursts Blocked</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  10 fast tasks (1.2s payment check, 0.8s token validation) arrive at T=0.2s but must wait 65+ seconds in standard FCFS.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-muted/40 border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400">STEP 3: DP-FCFS SOLUTION</div>
                <h4 className="text-base font-bold text-emerald-400">Predictive Core Re-allocation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  DP-FCFS predicts the 65s burst duration, routes short tasks to available VM cores, dropping waiting time by over 60%.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
