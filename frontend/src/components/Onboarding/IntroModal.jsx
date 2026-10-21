import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldAlert, 
  Layers, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Play, 
  Database, 
  Cpu, 
  Sliders, 
  BarChart3, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    id: 'welcome',
    badge: 'Welcome to DP-FCFS 2.0',
    title: 'Solving the Cloud Convoy Effect with Predictive Scheduling',
    subtitle: 'Dynamic Predictive First-Come, First-Served for Modern Heterogeneous Clouds',
    icon: Sparkles,
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          In standard cloud schedulers (like Kubernetes, Hadoop, or FIFO queues), when a massive long-running job arrives, all subsequent lightweight tasks are trapped behind it in the queue. This is known as the <strong className="text-foreground font-semibold">Convoy Effect</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-1.5">
            <div className="text-xs font-bold text-destructive flex items-center gap-1.5">
              <ShieldAlert size={14} /> The Problem: Standard FCFS
            </div>
            <p className="text-xs text-muted-foreground">
              A 65-second database export arrives at t=0. Ten 2-second user checkout tasks arrive right after. Standard FCFS makes every checkout wait up to 65 seconds! AWT explodes to 28.5s.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
            <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> The DP-FCFS Solution
            </div>
            <p className="text-xs text-muted-foreground">
              ML estimates burst duration before placement. The heavy task is isolated to a dedicated node, while Core VM-0 shields the 10 micro-tasks. AWT plummets by <span className="text-emerald-500 font-bold">&gt;80%</span> while preserving arrival fairness!
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'datasets',
    badge: 'Trace-Driven Empirical Grounding',
    title: 'Validated on Authentic Production Datasets',
    subtitle: 'Moving beyond toy synthetic assumptions to hyperscale industrial workloads',
    icon: Database,
    gradient: 'from-indigo-600 via-cyan-600 to-teal-600',
    content: (
      <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs md:text-sm">
          DP-FCFS 2.0 is benchmarked on genuine production traces spanning hyperscale cloud, serverless functions, and GenAI GPU clusters:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-400" /> Alibaba 2026 GenAI / LoRA Trace
            </div>
            <p className="text-[11px] text-muted-foreground">
              Multi-adapter Stable Diffusion and LLM LoRA inference requests on GPU nodes with varying context tokens and diffusion steps.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Cpu size={13} className="text-blue-400" /> Microsoft Azure Functions 2019
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real serverless micro-invocations featuring extreme burstiness, cold-starts, and sub-second execution churn.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Layers size={13} className="text-amber-400" /> Google Borg Cluster Trace 2019
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hyperscale data center telemetry with mixed batch processing, user-facing RPCs, and heavy CPU memory aggregations.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-400" /> Alibaba 2017 Cluster Trace
            </div>
            <p className="text-[11px] text-muted-foreground">
              Containerized batch workloads mixing high-volume ETL pipelines with e-commerce query spikes.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'novelties',
    badge: 'Scientific Novelties N1–N3',
    title: 'The Three Pillars of DP-FCFS Architecture',
    subtitle: 'Adaptive self-calibration, overrun awareness, and starvation-guarded convoy shielding',
    icon: Sliders,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-start gap-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">N1</Badge>
            <div>
              <div className="text-xs font-bold text-foreground">EWMA Online Residual Calibration</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tracks prediction residuals (&rho;) in real time per task class. If workload concept drift doubles runtime, the predictor self-calibrates within 12 task completions.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-start gap-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">N2</Badge>
            <div>
              <div className="text-xs font-bold text-foreground">Overrun-Aware Backlog Estimation</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                When a task outlives its forecast burst time, DP-FCFS assigns an overrun backlog penalty of (0.3 &times; elapsed time) to prevent underestimating congested nodes.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-start gap-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">N3</Badge>
            <div>
              <div className="text-xs font-bold text-foreground">Convoy-Shield Lane with Starvation Guard</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reserves Core 0 exclusively for short tasks (burst &lt; 15s). A starvation guard timer opens the shield if any heavy task waits longer than 40s.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'demonstration',
    badge: 'Interactive Demonstration Guide',
    title: 'How to Showcase the Simulation to Anyone',
    subtitle: 'Elaborated test cases, customizable inputs, and side-by-side Gantt charts',
    icon: Play,
    gradient: 'from-purple-600 via-pink-600 to-red-600',
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          You can immediately demonstrate that this simulation works and mitigates the convoy effect using live test cases:
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground font-medium">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span><strong>Select a Pre-configured Test Case:</strong> Choose the &quot;Convoy Catastrophe&quot; scenario in Queue Simulation to see an 81.7% drop in Average Waiting Time.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground font-medium">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span><strong>Insert Custom Tasks:</strong> Add your own burst times, CPU cycles, and priorities, or import tasks via JSON/CSV.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground font-medium">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span><strong>Compare Gantt Timelines:</strong> Toggle between DP-FCFS and Standard FCFS Gantt schedules to see visual core isolation in action.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground font-medium">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span><strong>Regenerate Publication Figures:</strong> Head to the Research Lab to re-plot all 16 figures directly from live simulation models!</span>
          </div>
        </div>
      </div>
    )
  }
];

export default function IntroModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if dismissed previously
    const dismissed = localStorage.getItem('dp_fcfs_intro_dismissed');
    if (!dismissed) {
      setIsOpen(true);
    }

    // Global listener so any component or button can trigger the tour
    const handleOpenTour = () => {
      setCurrentSlideIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('open-intro-tour', handleOpenTour);
    return () => window.removeEventListener('open-intro-tour', handleOpenTour);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('dp_fcfs_intro_dismissed', 'true');
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleQuickLaunch = (targetPath) => {
    handleClose();
    navigate(targetPath);
  };

  const currentSlide = SLIDES[currentSlideIndex];
  const IconComponent = currentSlide.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md">
          {/* Backdrop click */}
          <div className="fixed inset-0" onClick={handleClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header Accent Bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${currentSlide.gradient}`} />

            {/* Header */}
            <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-border/60">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
                  <IconComponent size={13} className="mr-1.5" />
                  {currentSlide.badge}
                </Badge>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentSlide.subtitle}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Slide Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentSlide.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 pt-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                {/* Step Indicators */}
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentSlideIndex 
                          ? 'w-6 bg-primary' 
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Don't show again checkbox */}
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none ml-2">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>Don&apos;t show on startup</span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {currentSlideIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    className="gap-1.5 text-xs font-medium"
                  >
                    <ArrowLeft size={14} /> Back
                  </Button>
                )}

                {currentSlideIndex === SLIDES.length - 1 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickLaunch('/queue')}
                      className="gap-1.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                    >
                      <Play size={14} /> Open Test Cases Studio
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    Next <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
