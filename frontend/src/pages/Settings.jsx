import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, Shield, Paintbrush, HardDrive, ChevronRight, 
  Save, RotateCcw, CheckCircle2, AlertCircle, Cpu, Sliders,
  SlidersHorizontal, Sparkles, Key, Lock, Clock, Activity, Zap
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { cn } from '../utils/cn';
import { getSettings, updateSettings, resetSettings } from '../services/api';

const navItems = [
  { id: 'profile', name: 'Profile', icon: User, desc: 'User identity & team' },
  { id: 'cluster', name: 'Cluster & Engine', icon: HardDrive, desc: 'DP-FCFS algorithmic parameters' },
  { id: 'appearance', name: 'Appearance', icon: Paintbrush, desc: 'Theme & Gantt styles' },
  { id: 'notifications', name: 'Notifications', icon: Bell, desc: 'Alerts & latency spikes' },
  { id: 'security', name: 'Security & Access', icon: Shield, desc: 'Authentication & auditing' },
];

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }

  const [settings, setSettings] = useState({
    profile: {
      full_name: 'Admin User',
      email: 'admin@dp-fcfs.cloud',
      role: 'Cloud Scheduler Architect',
      organization: 'Distributed Systems Research Lab'
    },
    cluster: {
      default_algorithm: 'dp_fcfs_shield',
      num_nodes: 3,
      time_quantum: 4.0,
      reserve_light: 1,
      guard_wait: 40.0,
      calibrate: true,
      overrun_aware: true,
      beta_uncertainty: 1.0,
      heavy_threshold_sec: 15.0
    },
    appearance: {
      theme: 'dark',
      gantt_animation: 'smooth',
      refresh_interval_sec: 5,
      dense_mode: false
    },
    notifications: {
      email_alerts: true,
      convoy_spike_warning: true,
      sla_violation_threshold_sec: 15.0,
      slack_webhook: ''
    },
    security: {
      api_key_auth: false,
      session_timeout_min: 60,
      audit_logging: true
    }
  });

  // Load settings from backend on mount
  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      if (data && typeof data === 'object') {
        setSettings(prev => ({
          ...prev,
          ...data,
          profile: { ...prev.profile, ...(data.profile || {}) },
          cluster: { ...prev.cluster, ...(data.cluster || {}) },
          appearance: { ...prev.appearance, ...(data.appearance || {}) },
          notifications: { ...prev.notifications, ...(data.notifications || {}) },
          security: { ...prev.security, ...(data.security || {}) },
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      showMessage('error', 'Failed to retrieve settings from backend.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const handleProfileChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleClusterChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      cluster: { ...prev.cluster, [field]: value }
    }));
  };

  const handleAppearanceChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateSettings(settings);
      if (res && res.status === 'success') {
        showMessage('success', 'Settings successfully saved to backend (settings.json)!');
      } else {
        showMessage('error', res?.message || 'Error occurred while saving settings.');
      }
    } catch (err) {
      showMessage('error', 'Network error while updating settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all scheduler and profile settings to factory defaults?')) {
      return;
    }
    setResetting(true);
    setStatusMessage(null);
    try {
      const res = await resetSettings();
      if (res && res.status === 'success') {
        await loadSettingsData();
        showMessage('success', 'Settings successfully restored to initial defaults.');
      } else {
        showMessage('error', 'Failed to reset settings.');
      }
    } catch (err) {
      showMessage('error', 'Error calling reset endpoint.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <motion.div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6" initial="initial" animate="animate">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sliders size={26} className="text-primary" /> System & Engine Settings
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Configure DP-FCFS scheduler algorithmic parameters, cluster node defaults, and account preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={resetting || saving || loading}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={15} className={resetting ? "animate-spin" : ""} />
            {resetting ? 'Resetting...' : 'Reset Defaults'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saving || resetting || loading}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold shadow-md"
          >
            <Save size={15} className={saving ? "animate-pulse" : ""} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Feedback Toast/Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-xl flex items-center gap-3 border shadow-sm",
              statusMessage.type === 'success'
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
            )}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-500" />
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <Card className="p-2 bg-card/60 border-border/60 backdrop-blur-sm shadow-sm">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg text-left w-full px-3.5 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className={cn("text-[10px] line-clamp-1", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    {isActive && <ChevronRight size={15} />}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Quick Info Box */}
          <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Zap size={13} className="text-primary" /> Live Persistence
            </div>
            <p>
              Settings are stored directly in <code className="text-primary font-mono text-[11px]">backend/settings.json</code> and apply immediately to simulations and scheduler pipelines.
            </p>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 w-full space-y-6">
          {loading ? (
            <Card className="p-12 text-center text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p>Loading system configuration from backend...</p>
            </Card>
          ) : (
            <>
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <motion.div variants={fadeUp} className="space-y-6">
                  <Card className="p-6 md:p-8 bg-card border-border/60 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <User size={20} className="text-primary" /> User Profile & Identity
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Personal identification details for research logs, experiments, and benchmark reports.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                        <Input
                          type="text"
                          value={settings.profile?.full_name || ''}
                          onChange={(e) => handleProfileChange('full_name', e.target.value)}
                          placeholder="Admin User"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                        <Input
                          type="email"
                          value={settings.profile?.email || ''}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          placeholder="admin@dp-fcfs.cloud"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Research Role / Title</label>
                        <Input
                          type="text"
                          value={settings.profile?.role || ''}
                          onChange={(e) => handleProfileChange('role', e.target.value)}
                          placeholder="Cloud Scheduler Architect"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization / Institution</label>
                        <Input
                          type="text"
                          value={settings.profile?.organization || ''}
                          onChange={(e) => handleProfileChange('organization', e.target.value)}
                          placeholder="Distributed Systems Research Lab"
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 2: CLUSTER & ENGINE */}
              {activeTab === 'cluster' && (
                <motion.div variants={fadeUp} className="space-y-6">
                  <Card className="p-6 md:p-8 bg-card border-border/60 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Cpu size={20} className="text-primary" /> DP-FCFS Algorithmic Engine Parameters
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Core parameters controlling Novelties N1 (Online Calibration), N2 (Overrun-Aware Placement), and N3 (Convoy-Shield Lane).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Default Scheduling Algorithm
                        </label>
                        <select
                          value={settings.cluster?.default_algorithm || 'dp_fcfs_shield'}
                          onChange={(e) => handleClusterChange('default_algorithm', e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="dp_fcfs_shield">DP-FCFS + Convoy Shield (Novelty N3, Recommended)</option>
                          <option value="dp_fcfs">DP-FCFS Standard (Predictive FCFS)</option>
                          <option value="sjf">Shortest Job First (SJF Non-Preemptive)</option>
                          <option value="fcfs_jsq">FCFS + Join-Shortest-Queue (JSQ)</option>
                          <option value="fcfs">Standard Static FCFS (Baseline)</option>
                          <option value="round_robin">Round Robin (Preemptive)</option>
                        </select>
                        <p className="text-[11px] text-muted-foreground">Used by default when running simulations from Dashboard or Queue.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Default Number of VM Worker Nodes
                        </label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="16"
                            value={settings.cluster?.num_nodes || 3}
                            onChange={(e) => handleClusterChange('num_nodes', parseInt(e.target.value) || 3)}
                            className="bg-background"
                          />
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {settings.cluster?.num_nodes || 3} VM Cores
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Target cluster capacity for simulation benchmarks.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Round-Robin Time Quantum (sec)
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="20.0"
                          value={settings.cluster?.time_quantum || 4.0}
                          onChange={(e) => handleClusterChange('time_quantum', parseFloat(e.target.value) || 4.0)}
                          className="bg-background"
                        />
                        <p className="text-[11px] text-muted-foreground">Preemption slice time for comparative Round-Robin baseline.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Convoy-Shield Reserved Light Cores (N3)
                        </label>
                        <select
                          value={settings.cluster?.reserve_light !== undefined ? settings.cluster.reserve_light : 1}
                          onChange={(e) => handleClusterChange('reserve_light', parseInt(e.target.value))}
                          className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value={1}>1 Core Reserved (Shield Lane Active - Recommended)</option>
                          <option value={0}>0 Cores Reserved (Disabled - All Cores Shared)</option>
                        </select>
                        <p className="text-[11px] text-muted-foreground">Guarantees that short tasks never get stuck behind massive convoy queries.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Starvation Guard Wait Threshold (sec)
                        </label>
                        <Input
                          type="number"
                          step="5"
                          min="10"
                          max="180"
                          value={settings.cluster?.guard_wait || 40.0}
                          onChange={(e) => handleClusterChange('guard_wait', parseFloat(e.target.value) || 40.0)}
                          className="bg-background"
                        />
                        <p className="text-[11px] text-muted-foreground">Emergency ceiling: if a heavy task waits longer than this, it accesses the reserved core.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Heavy Task Cutoff Threshold (sec)
                        </label>
                        <Input
                          type="number"
                          step="1"
                          min="5"
                          max="120"
                          value={settings.cluster?.heavy_threshold_sec || 15.0}
                          onChange={(e) => handleClusterChange('heavy_threshold_sec', parseFloat(e.target.value) || 15.0)}
                          className="bg-background"
                        />
                        <p className="text-[11px] text-muted-foreground">Tasks with predicted burst exceeding this threshold are categorized as Heavy/Convoy.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Beta Uncertainty Sensitivity (β)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="3.0"
                          value={settings.cluster?.beta_uncertainty || 1.0}
                          onChange={(e) => handleClusterChange('beta_uncertainty', parseFloat(e.target.value) || 1.0)}
                          className="bg-background"
                        />
                        <p className="text-[11px] text-muted-foreground">Scale parameter weighting prediction standard deviation in placement decisions.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 space-y-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles size={16} className="text-primary" /> Algorithmic Novelty Feature Flags
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.cluster?.calibrate)}
                            onChange={(e) => handleClusterChange('calibrate', e.target.checked)}
                            className="mt-0.5 rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Novelty N1: Online EWMA Calibration</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Continuously updates prediction bias weights in real-time as tasks complete, adapting to runtime drift.
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.cluster?.overrun_aware)}
                            onChange={(e) => handleClusterChange('overrun_aware', e.target.checked)}
                            className="mt-0.5 rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Novelty N2: Overrun-Aware Queue Penalties</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Detects tasks exceeding predicted completion times and dynamically inflates queue wait estimates.
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 3: APPEARANCE */}
              {activeTab === 'appearance' && (
                <motion.div variants={fadeUp} className="space-y-6">
                  <Card className="p-6 md:p-8 bg-card border-border/60 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Paintbrush size={20} className="text-primary" /> Visual Presentation & Gantt Chart
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Personalize the look, feel, timeline animations, and data refresh cycles.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color Theme</label>
                        <select
                          value={settings.appearance?.theme || 'dark'}
                          onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="dark">Dark Mode (Deep Slate & Cyan)</option>
                          <option value="light">Light Mode</option>
                          <option value="system">Follow System Preferences</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gantt Animation Style</label>
                        <select
                          value={settings.appearance?.gantt_animation || 'smooth'}
                          onChange={(e) => handleAppearanceChange('gantt_animation', e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="smooth">Smooth Continuous Interpolation</option>
                          <option value="instant">Instant Render (Low Resource)</option>
                          <option value="staggered">Staggered Core Entrance</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Auto-Refresh Interval (sec)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={settings.appearance?.refresh_interval_sec || 5}
                          onChange={(e) => handleAppearanceChange('refresh_interval_sec', parseInt(e.target.value) || 0)}
                          className="bg-background"
                        />
                        <p className="text-[11px] text-muted-foreground">Set to 0 to disable automatic cluster polling.</p>
                      </div>

                      <div className="space-y-2 flex flex-col justify-end">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.appearance?.dense_mode)}
                            onChange={(e) => handleAppearanceChange('dense_mode', e.target.checked)}
                            className="rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <span className="text-sm font-semibold text-foreground">Compact Data Density</span>
                            <p className="text-[11px] text-muted-foreground">Reduces padding on metric cards and task tables for dense monitors.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <motion.div variants={fadeUp} className="space-y-6">
                  <Card className="p-6 md:p-8 bg-card border-border/60 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Bell size={20} className="text-primary" /> Automated Alerts & SLA Warnings
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure dispatch criteria when queue latency spikes or SLA deadlines are jeopardized.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.notifications?.email_alerts)}
                            onChange={(e) => handleNotificationChange('email_alerts', e.target.checked)}
                            className="mt-0.5 rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Email Alert Notifications</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Sends summary digests of benchmark executions and anomaly detections.
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.notifications?.convoy_spike_warning)}
                            onChange={(e) => handleNotificationChange('convoy_spike_warning', e.target.checked)}
                            className="mt-0.5 rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Convoy Effect Anomaly Interceptor</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Alerts immediately if queue waiting time exceeds standard deviation baseline by 3x.
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            SLA Violation Threshold (sec)
                          </label>
                          <Input
                            type="number"
                            step="1.0"
                            min="1.0"
                            max="120.0"
                            value={settings.notifications?.sla_violation_threshold_sec || 15.0}
                            onChange={(e) => handleNotificationChange('sla_violation_threshold_sec', parseFloat(e.target.value) || 15.0)}
                            className="bg-background"
                          />
                          <p className="text-[11px] text-muted-foreground">Maximum allowable waiting time before raising an SLA breach flag.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Slack / Webhook Notification URL
                          </label>
                          <Input
                            type="text"
                            placeholder="https://hooks.slack.com/services/..."
                            value={settings.notifications?.slack_webhook || ''}
                            onChange={(e) => handleNotificationChange('slack_webhook', e.target.value)}
                            className="bg-background"
                          />
                          <p className="text-[11px] text-muted-foreground">Incoming webhook for automated incident reporting.</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 5: SECURITY */}
              {activeTab === 'security' && (
                <motion.div variants={fadeUp} className="space-y-6">
                  <Card className="p-6 md:p-8 bg-card border-border/60 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Shield size={20} className="text-primary" /> API Security & Access Control
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage authentication credentials, audit trails, and session lifecycle.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.security?.api_key_auth)}
                            onChange={(e) => handleSecurityChange('api_key_auth', e.target.checked)}
                            className="mt-0.5 rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <Key size={14} className="text-primary" /> Require API Key Header
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Enforces Bearer token verification on all POST /api/simulation endpoints.
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.security?.audit_logging)}
                            onChange={(e) => handleSecurityChange('audit_logging', e.target.checked)}
                            className="mt-0.5 rounded border-primary text-primary focus:ring-primary w-4 h-4"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <Activity size={14} className="text-primary" /> Immutable Audit Logging
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Maintains append-only logging of all scheduler parameter updates and batch runs.
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="max-w-xs space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock size={14} /> Session Inactivity Timeout (minutes)
                        </label>
                        <Input
                          type="number"
                          min="5"
                          max="480"
                          value={settings.security?.session_timeout_min || 60}
                          onChange={(e) => handleSecurityChange('session_timeout_min', parseInt(e.target.value) || 60)}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="p-6 md:p-8 bg-card border-red-500/20 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                      <AlertCircle size={18} /> Danger Zone: Factory Reset
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Reset all settings, algorithmic parameters, and profile data to original pristine repository defaults.
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleReset}
                      disabled={resetting}
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-none text-xs"
                    >
                      {resetting ? 'Resetting...' : 'Restore Factory Configuration'}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
