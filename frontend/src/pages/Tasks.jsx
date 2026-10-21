import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  RotateCcw, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Cpu,
  HardDrive,
  Zap,
  Award,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  getTasks, 
  createTask, 
  deleteTask, 
  resetTasks, 
  FALLBACK_TASKS,
  calculateLocalBurstTime 
} from '../services/api';
import { useTaskContext } from '../context/TaskContext';

const PRIORITY_LABELS = {
  1: { label: 'Batch (P1)', color: 'text-zinc-400', badgeClass: 'border-zinc-500/30 text-zinc-400' },
  2: { label: 'Low (P2)', color: 'text-blue-400', badgeClass: 'border-blue-500/30 text-blue-400' },
  3: { label: 'Medium (P3)', color: 'text-emerald-400', badgeClass: 'border-emerald-500/30 text-emerald-400' },
  4: { label: 'High (P4)', color: 'text-amber-400', badgeClass: 'border-amber-500/30 text-amber-400' },
  5: { label: 'Critical (P5)', color: 'text-rose-500', badgeClass: 'border-rose-500/30 text-rose-500' }
};

const fadeUp = { 
  initial: { opacity: 0, y: 20 }, 
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } 
};

const Tasks = () => {
  const { setTasks: setGlobalTasks } = useTaskContext();
  const [tasksList, setTasksList] = useState(FALLBACK_TASKS);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New Task Form
  const [newTaskForm, setNewTaskForm] = useState({
    name: '',
    arrival_time: 0.0,
    data_size_mb: 200,
    cpu_cycles_m: 1000,
    io_ops: 2500,
    priority: 3,
    status: 'waiting'
  });

  // Calculate live predicted burst for new task
  const livePredictedBurst = useMemo(() => {
    return calculateLocalBurstTime(
      newTaskForm.data_size_mb,
      newTaskForm.cpu_cycles_m,
      newTaskForm.io_ops,
      newTaskForm.priority
    );
  }, [newTaskForm]);

  // Load tasks on mount
  useEffect(() => {
    setLoading(true);
    getTasks()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setTasksList(res);
          setGlobalTasks(res);
        }
      })
      .catch(() => {
        setTasksList(FALLBACK_TASKS);
      })
      .finally(() => setLoading(false));
  }, [setGlobalTasks]);

  // Toast / notification auto-dismiss
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasksList.filter(task => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || 
        task.id?.toLowerCase().includes(query) ||
        task.name?.toLowerCase().includes(query) ||
        task.status?.toLowerCase().includes(query) ||
        `p${task.priority}`.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || Number(task.priority) === Number(priorityFilter);

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasksList, search, statusFilter, priorityFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter]);

  // Handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.name.trim()) return;

    try {
      const created = await createTask({
        ...newTaskForm,
        actual_burst_time: livePredictedBurst
      });

      const taskObj = created.task || {
        ...newTaskForm,
        id: `TSK-${Math.floor(Math.random() * 800 + 200)}`,
        actual_burst_time: livePredictedBurst,
        predicted_burst_time: livePredictedBurst
      };

      const updated = [taskObj, ...tasksList];
      setTasksList(updated);
      setGlobalTasks(updated);
      setIsCreateOpen(false);
      setNewTaskForm({
        name: '',
        arrival_time: 0.0,
        data_size_mb: 200,
        cpu_cycles_m: 1000,
        io_ops: 2500,
        priority: 3,
        status: 'waiting'
      });
      setActionMessage(`Task "${taskObj.name}" created successfully with estimated burst ${livePredictedBurst}s.`);
    } catch (err) {
      console.error(err);
      setActionMessage('Failed to create task.');
    }
  };

  const handleDeleteTask = async (taskId, taskName) => {
    try {
      await deleteTask(taskId);
      const updated = tasksList.filter(t => t.id !== taskId);
      setTasksList(updated);
      setGlobalTasks(updated);
      if (selectedTask?.id === taskId) setSelectedTask(null);
      setActionMessage(`Task ${taskId} ("${taskName}") deleted.`);
    } catch (err) {
      console.error(err);
      setActionMessage(`Error deleting task ${taskId}`);
    }
  };

  const handleResetWorkload = async () => {
    try {
      setLoading(true);
      const res = await resetTasks();
      const updated = res.tasks || FALLBACK_TASKS;
      setTasksList(updated);
      setGlobalTasks(updated);
      setActionMessage('Workload reset to default benchmark dataset.');
    } catch (err) {
      console.error(err);
      setTasksList(FALLBACK_TASKS);
      setGlobalTasks(FALLBACK_TASKS);
      setActionMessage('Workload reset locally.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="capitalize">Completed</Badge>;
      case 'running':
        return <Badge className="bg-primary/20 text-primary border-primary/30 capitalize animate-pulse">Running</Badge>;
      case 'waiting':
        return <Badge variant="warning" className="capitalize">Waiting</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="capitalize">Failed</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status || 'Ready'}</Badge>;
    }
  };

  return (
    <motion.div className="space-y-8" initial="initial" animate="animate">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-card border border-border shadow-2xl flex items-center gap-3 text-sm text-foreground max-w-md"
          >
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <span className="flex-1">{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Live Workload Manager
            </Badge>
            <span className="text-xs text-muted-foreground">({tasksList.length} total tasks)</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">Task Scheduler Registry</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Search, filter, inspect, and submit cloud computing workloads for DP-FCFS dispatch.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleResetWorkload} 
            disabled={loading}
            className="gap-2"
          >
            <RotateCcw size={15} className={loading ? 'animate-spin' : ''} /> Reset Workload
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="premium" 
              onClick={() => setIsCreateOpen(true)} 
              className="gap-2 px-5 shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> New Cloud Task
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter and Search Bar Card */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden bg-card border-border/50">
          <div className="flex flex-col lg:flex-row gap-4 justify-between p-6 border-b border-border bg-muted/10">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search tasks by ID, name, status, or priority..." 
                className="pl-10 pr-9 bg-background border-border" 
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="running">Running</option>
                  <option value="waiting">Waiting</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Priority:</span>
                <select 
                  value={priorityFilter} 
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="5">P5 - Critical</option>
                  <option value="4">P4 - High</option>
                  <option value="3">P3 - Medium</option>
                  <option value="2">P2 - Low</option>
                  <option value="1">P1 - Batch</option>
                </select>
              </div>

              {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Search & Count Summary */}
          <div className="px-6 py-2 bg-muted/20 border-b border-border/50 flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Showing {filteredTasks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
              {filteredTasks.length < tasksList.length && ` (filtered from ${tasksList.length} total)`}
            </span>
            {search && <span className="italic">Filtering by: &quot;{search}&quot;</span>}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold px-6 py-4">Task ID</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Task Name</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Priority</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Actual Burst</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Predicted &tau;</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Arrival Time</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle size={32} className="mb-2 opacity-50" />
                        <p className="font-medium">No tasks found matching your criteria</p>
                        <p className="text-xs mt-1">Try clearing your search query or reset the workload.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }} 
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTasks.map((t) => {
                    const priorityInfo = PRIORITY_LABELS[t.priority] || { label: `P${t.priority || 3}`, color: 'text-foreground', badgeClass: '' };
                    const actualBurst = t.actual_burst_time ?? t.burst ?? 10;
                    const predictedBurst = t.predicted_burst_time ?? calculateLocalBurstTime(t.data_size_mb || 200, t.cpu_cycles_m || 1000, t.io_ops || 2000, t.priority || 3);
                    const arrival = t.arrival_time ?? t.arrival ?? 0;

                    return (
                      <TableRow key={t.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground px-6 py-4 font-bold">
                          {t.id}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground px-6 py-4">
                          <button 
                            onClick={() => setSelectedTask(t)}
                            className="text-left hover:text-primary hover:underline transition-colors"
                          >
                            {t.name}
                          </button>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${priorityInfo.badgeClass}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {priorityInfo.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground font-mono text-sm px-6 py-4">
                          {actualBurst}s
                        </TableCell>
                        <TableCell className="text-purple-400 font-mono text-sm font-semibold px-6 py-4">
                          {predictedBurst}s
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-4 text-xs font-mono">
                          {arrival}s
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {getStatusBadge(t.status)}
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setSelectedTask(t)} className="gap-2 cursor-pointer">
                                <Eye size={14} /> View Task Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(t.id, t.name)} 
                                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                              >
                                <Trash2 size={14} /> Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
            <span className="text-xs text-muted-foreground ml-2">
              Page {currentPage} of {totalPages} ({filteredTasks.length} matching tasks)
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <div className="text-xs font-medium px-2 text-foreground">
                {currentPage} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="gap-1 text-xs"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* CREATE NEW TASK MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="text-primary" size={20} />
                    Register New Cloud Task
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define task workload parameters; ML will compute predicted burst duration automatically.
                  </p>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Task Name / Purpose
                  </label>
                  <Input 
                    value={newTaskForm.name}
                    onChange={e => setNewTaskForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Distributed MapReduce Worker"
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Arrival Time (seconds)
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      value={newTaskForm.arrival_time}
                      onChange={e => setNewTaskForm(prev => ({ ...prev, arrival_time: parseFloat(e.target.value) || 0 }))}
                      className="bg-background border-border font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Task Priority
                    </label>
                    <select
                      value={newTaskForm.priority}
                      onChange={e => setNewTaskForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 3 }))}
                      className="w-full h-10 px-3 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="5">P5 - Critical Service</option>
                      <option value="4">P4 - High Priority</option>
                      <option value="3">P3 - Medium (Default)</option>
                      <option value="2">P2 - Low Priority</option>
                      <option value="1">P1 - Background Batch</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
                    Hardware Profiling Parameters
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1"><HardDrive size={13} className="text-blue-500" /> Data Payload Size</span>
                      <span className="font-mono text-blue-400 font-bold">{newTaskForm.data_size_mb} MB</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={newTaskForm.data_size_mb}
                      onChange={e => setNewTaskForm(prev => ({ ...prev, data_size_mb: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1"><Cpu size={13} className="text-purple-500" /> CPU Cycles</span>
                      <span className="font-mono text-purple-400 font-bold">{newTaskForm.cpu_cycles_m} Million</span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={newTaskForm.cpu_cycles_m}
                      onChange={e => setNewTaskForm(prev => ({ ...prev, cpu_cycles_m: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1"><Zap size={13} className="text-amber-500" /> Disk / Network I/O</span>
                      <span className="font-mono text-amber-400 font-bold">{newTaskForm.io_ops} IOPS</span>
                    </div>
                    <input 
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={newTaskForm.io_ops}
                      onChange={e => setNewTaskForm(prev => ({ ...prev, io_ops: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

                {/* Live Burst Estimation Badge */}
                <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-foreground font-semibold block">Predicted Execution Duration (&tau;)</span>
                    <span className="text-muted-foreground text-[11px]">Real-time Random Forest inference</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-primary">{livePredictedBurst}s</span>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="premium" className="px-6">
                    Create & Register Task
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW TASK DETAILS MODAL */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="font-mono text-xs mb-1">
                    {selectedTask.id}
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedTask.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-muted/20 border border-border rounded-xl">
                    <span className="text-xs text-muted-foreground block">Current Status</span>
                    <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                  </div>
                  <div className="p-3.5 bg-muted/20 border border-border rounded-xl">
                    <span className="text-xs text-muted-foreground block">Task Priority</span>
                    <span className="text-sm font-bold text-foreground mt-1 block">
                      {PRIORITY_LABELS[selectedTask.priority]?.label || `Priority ${selectedTask.priority}`}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                  <div className="flex justify-between text-xs pb-2 border-b border-border">
                    <span className="text-muted-foreground">Arrival Timestamp:</span>
                    <span className="font-mono font-bold text-foreground">{selectedTask.arrival_time ?? selectedTask.arrival ?? 0}s</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-border">
                    <span className="text-muted-foreground">Actual Burst Duration:</span>
                    <span className="font-mono font-bold text-foreground">{selectedTask.actual_burst_time ?? selectedTask.burst ?? 10}s</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-border">
                    <span className="text-muted-foreground">Predicted Burst Duration (&tau;):</span>
                    <span className="font-mono font-bold text-purple-400">
                      {selectedTask.predicted_burst_time ?? calculateLocalBurstTime(selectedTask.data_size_mb || 200, selectedTask.cpu_cycles_m || 1000, selectedTask.io_ops || 2000, selectedTask.priority || 3)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-border">
                    <span className="text-muted-foreground">Data Size:</span>
                    <span className="font-mono text-foreground">{selectedTask.data_size_mb || 100} MB</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-border">
                    <span className="text-muted-foreground">CPU Cycles:</span>
                    <span className="font-mono text-foreground">{selectedTask.cpu_cycles_m || 500} Million</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">I/O Operations:</span>
                    <span className="font-mono text-foreground">{selectedTask.io_ops || 1000} IOPS</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button 
                    variant="outline" 
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => handleDeleteTask(selectedTask.id, selectedTask.name)}
                  >
                    Delete Task
                  </Button>
                  <Button variant="default" onClick={() => setSelectedTask(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;

