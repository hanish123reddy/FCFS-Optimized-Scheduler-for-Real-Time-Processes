import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Activity, CheckCircle2, Clock, ArrowRight, Server, ChevronDown, Play, BrainCircuit, BarChart3, Microscope, Sparkles } from 'lucide-react';
import axios from 'axios';
import StatCard from '../components/Charts/StatCard';
import { PremiumLineChart, PremiumBarChart } from '../components/Charts/AnimatedCharts';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const cpuRangeData = {
  '24 Hours': { labels: ['00:00','04:00','08:00','12:00','16:00','20:00','24:00'], values: [22,38,28,72,94,56,41], label: 'CPU %' },
  '7 Days': { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], values: [45,62,58,81,75,48,52], label: 'CPU %' },
  '30 Days': { labels: ['Week 1','Week 2','Week 3','Week 4'], values: [54,68,74,61], label: 'CPU %' }
};
const throughputData = { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], values: [120,190,300,250,280,150,210], label: 'Tasks' };

const recentActivity = [
  { id: 'TSK-892', name: 'Data Pipeline Sync', status: 'running', time: '12s ago' },
  { id: 'TSK-891', name: 'Model Training v4', status: 'completed', time: '2m ago' },
  { id: 'TSK-890', name: 'Database Snapshot', status: 'failed', time: '15m ago' },
  { id: 'TSK-889', name: 'Image Processing', status: 'waiting', time: '1h ago' },
  { id: 'TSK-888', name: 'Cache Rebuild', status: 'completed', time: '2h ago' },
];

const dot = { 
  running: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]', 
  completed: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]', 
  failed: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', 
  waiting: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' 
};

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };

const Dashboard = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [timeRange, setTimeRange] = useState('24 Hours');
  
  useEffect(() => {
    axios.get('http://localhost:5001/api/health')
      .then(r => setStatus(r.data.status === 'healthy' ? 'online' : 'offline'))
      .catch(() => setStatus('offline'));
  }, []);


  return (
    <motion.div className="space-y-10" variants={stagger} initial="initial" animate="animate">
      {/* ── Hero Header ── */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={status === 'online' ? 'success' : status === 'offline' ? 'destructive' : 'warning'} className="gap-2 px-3 py-1 text-[11px] uppercase tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
            {status === 'online' ? 'All Systems Operational' : status === 'offline' ? 'Connection Lost' : 'Connecting...'}
          </Badge>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Cloud Operations
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Real-time monitoring and intelligent FCFS task orchestration across your cloud infrastructure.
        </p>

        {/* ── Operations & Simulation Quick Action Hub ── */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/queue')}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 text-xs h-9 px-4 rounded-xl"
          >
            <Play size={14} className="fill-white" />
            <span>Launch Cloud Simulator</span>
          </Button>

          <Button
            onClick={() => navigate('/tasks')}
            variant="outline"
            className="gap-2 text-xs h-9 px-4 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 text-foreground"
          >
            <Layers size={14} className="text-blue-400" />
            <span>Task Management & Runner</span>
          </Button>

          <Button
            onClick={() => navigate('/prediction')}
            variant="outline"
            className="gap-2 text-xs h-9 px-4 rounded-xl hover:border-purple-500/40 hover:bg-purple-500/5 text-foreground"
          >
            <BrainCircuit size={14} className="text-purple-400" />
            <span>Burst Predictor Workbench</span>
          </Button>

          <Button
            onClick={() => navigate('/analytics')}
            variant="outline"
            className="gap-2 text-xs h-9 px-4 rounded-xl hover:border-amber-500/40 hover:bg-amber-500/5 text-foreground"
          >
            <BarChart3 size={14} className="text-amber-400" />
            <span>Algorithm Benchmarks</span>
          </Button>

          <Button
            onClick={() => navigate('/research')}
            variant="outline"
            className="gap-2 text-xs h-9 px-4 rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/5 text-foreground"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>DP-FCFS+ Research Lab</span>
          </Button>
        </div>
      </motion.div>

      {/* ── KPIs Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value="1,248" icon={Layers} trend={12} color="blue" delay={0.1} />
        <StatCard title="Active Now" value="42" icon={Activity} trend={-5} color="cyan" delay={0.15} />
        <StatCard title="Completed" value="1,105" icon={CheckCircle2} trend={18} color="green" delay={0.2} />
        <StatCard title="In Queue" value="101" icon={Clock} trend={-2} color="orange" delay={0.25} />
      </div>

      {/* ── Resource Chart & Activity Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Resource Chart — 3 cols */}
        <motion.div variants={fadeUp} className="xl:col-span-3">
          <Card className="p-6 md:p-8 h-full bg-card">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">Resource Utilization</h3>
                <p className="text-sm mt-1 text-muted-foreground">CPU usage across all nodes — last 24 hours</p>
              </div>
              <div className="relative group">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-muted text-sm font-medium pl-4 pr-10 py-2 rounded-lg border-none outline-none text-foreground cursor-pointer focus:ring-2 focus:ring-ring"
                >
                  <option value="24 Hours">24 Hours</option>
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              <PremiumLineChart data={cpuRangeData[timeRange]} color="#4F46E5" />
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity — 2 cols */}
        <motion.div variants={fadeUp} className="xl:col-span-2">
          <Card className="p-6 md:p-8 h-full flex flex-col bg-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Recent Activity</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/tasks')}
                className="h-8 gap-1 text-primary hover:text-primary/80"
              >
                View all <ArrowRight size={14} />
              </Button>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {recentActivity.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/tasks')}
                  className="group flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${dot[t.status]}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs mt-0.5 text-muted-foreground">{t.id}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{t.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div variants={fadeUp}>
          <Card className="p-6 md:p-8 h-full bg-card">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Weekly Throughput</h3>
              <p className="text-sm mt-1 text-muted-foreground">Tasks processed per day across all nodes</p>
            </div>
            <div className="h-[280px] w-full">
              <PremiumBarChart data={throughputData} color="#8B5CF6" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-8 h-full relative overflow-hidden flex flex-col items-center justify-center text-center bg-card border-border/50">
            {/* Orbital rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-primary/10 animate-[spin_25s_linear_infinite]" />
              <div className="absolute w-44 h-44 rounded-full border border-primary/20 animate-[spin_18s_linear_infinite_reverse]" />
            </div>

            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5">
                <Server size={28} />
              </div>
            </motion.div>

            <h3 className="text-xl font-semibold mb-2 text-foreground tracking-tight">Cluster Healthy</h3>
            <p className="text-sm mb-8 max-w-xs text-muted-foreground leading-relaxed">
              All 3 compute nodes are operating within normal parameters.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {[{ name: 'Node 1', cpu: '42%' }, { name: 'Node 2', cpu: '67%' }, { name: 'Node 3', cpu: '31%' }].map(n => (
                <div key={n.name} className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 bg-green-500/10 border border-green-500/20">
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">{n.name}</span>
                  <span className="text-[11px] text-green-600/70 dark:text-green-400/70">CPU {n.cpu}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
