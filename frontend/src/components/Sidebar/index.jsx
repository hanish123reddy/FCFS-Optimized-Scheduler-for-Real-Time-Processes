import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ListTodo, Layers, BrainCircuit, Server,
  Activity, FileText, Settings, ChevronLeft, ChevronRight, Zap, Workflow, GitFork, FlaskConical
} from 'lucide-react';
import { cn } from '../../utils/cn';

const sections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Flowcharts', path: '/flowcharts', icon: Workflow },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Tasks', path: '/tasks', icon: ListTodo },
      { name: 'Queue', path: '/queue', icon: Layers },
      { name: 'Servers', path: '/servers', icon: Server },
    ],
  },
  {
    label: 'Intelligence & Research',
    items: [
      { name: 'Prediction', path: '/prediction', icon: BrainCircuit },
      { name: 'Research Lab', path: '/research', icon: FlaskConical },
      { name: 'Analytics', path: '/analytics', icon: Activity },
      { name: 'Reports', path: '/reports', icon: FileText },
    ],
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 72 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen sticky top-0 flex flex-col z-40 shrink-0 bg-card border-r border-border shadow-sm relative"
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex absolute -right-3 top-5 z-50 items-center justify-center w-6 h-6 rounded-full bg-border hover:bg-muted text-muted-foreground transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-background"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center shrink-0 h-16 px-4 border-b border-border bg-card/50 backdrop-blur-md",
        isOpen ? "justify-start gap-3" : "justify-center"
      )}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary text-primary-foreground shadow-sm">
          <Zap size={18} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }} 
              transition={{ duration: 0.2 }} 
              className="flex flex-col leading-none overflow-hidden"
            >
              <span className="text-[15px] font-bold tracking-tight text-foreground whitespace-nowrap">DP-FCFS</span>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">Cloud Scheduler</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 flex flex-col gap-6 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {isOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-3 text-muted-foreground"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={!isOpen ? item.name : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isOpen ? "px-3 py-2.5 justify-start" : "p-2.5 justify-center w-full",
                      active ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute left-0 w-1 rounded-r-full bg-primary"
                        style={{ height: '50%', top: '25%' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    <Icon size={18} className="shrink-0" />
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Status */}
      <div className="p-3 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg overflow-hidden transition-all duration-300",
            isOpen ? "p-3 justify-start" : "p-3 justify-center",
            "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
          )}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-medium whitespace-nowrap">
                Systems Online
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
