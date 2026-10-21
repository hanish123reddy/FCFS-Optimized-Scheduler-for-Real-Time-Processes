import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, Command, Sun, Moon, X, ArrowRight, Layers, BarChart3, BrainCircuit, Play, Server, FileText, Settings, LogOut, LogIn, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const SEARCHABLE_ITEMS = [
  { id: 'p1', title: 'Dashboard', category: 'Page', path: '/', icon: Layers, desc: 'Overview of system status and active nodes' },
  { id: 'p2', title: 'Task Management', category: 'Page', path: '/tasks', icon: Layers, desc: 'Manage, search, create, and monitor cloud tasks' },
  { id: 'p3', title: 'Queue Simulation', category: 'Page', path: '/queue', icon: Play, desc: 'Run step-by-step FCFS and SJF execution simulation' },
  { id: 'p4', title: 'Burst Time Prediction', category: 'Page', path: '/prediction', icon: BrainCircuit, desc: 'Test ML burst time estimator and parameter sweeps' },
  { id: 'p5', title: 'Multi-Algorithm Analytics', category: 'Page', path: '/analytics', icon: BarChart3, desc: 'Radar charts, 5-algorithm benchmarks, and energy models' },
  { id: 'p6', title: 'Cloud Servers', category: 'Page', path: '/servers', icon: Server, desc: 'Manage VM cluster instances and node health' },
  { id: 'p7', title: 'Audit Reports & CSV Export', category: 'Page', path: '/reports', icon: FileText, desc: 'Generate SLA reports and download CSV data' },
  { id: 'p8', title: 'Settings', category: 'Page', path: '/settings', icon: Settings, desc: 'Configure cloud cluster thresholds and preferences' },
  { id: 'a1', title: 'DP-FCFS Algorithm', category: 'Algorithm', path: '/analytics', icon: BrainCircuit, desc: 'Intelligent predictive First-Come-First-Serve scheduling' },
  { id: 'a2', title: 'Non-Preemptive SJF', category: 'Algorithm', path: '/analytics', icon: BarChart3, desc: 'Shortest Job First baseline comparison' },
  { id: 'a3', title: 'Round Robin (RR)', category: 'Algorithm', path: '/analytics', icon: BarChart3, desc: 'Time-sliced preemptive cloud scheduling' },
  { id: 'a4', title: 'Priority Scheduling (Aging)', category: 'Algorithm', path: '/analytics', icon: BarChart3, desc: 'Dynamic aging to avoid low-priority starvation' },
  { id: 's1', title: 'E-Commerce Flash Sale Surge', category: 'Scenario', path: '/analytics', icon: Play, desc: 'High convoy mitigation stress workload' },
  { id: 's2', title: 'Big Data Spark Analytics', category: 'Scenario', path: '/analytics', icon: Play, desc: 'Memory and I/O intensive batch jobs' },
  { id: 's3', title: 'AI Deep Learning Pipeline', category: 'Scenario', path: '/analytics', icon: Play, desc: 'GPU/CPU intensive LLM token generation' }
];

const Navbar = ({ toggleSidebar }) => {
  const [isDark, setIsDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dp_user');
      return saved ? JSON.parse(saved) : { name: 'Admin User', email: 'admin@dp-fcfs.cloud', role: 'Cloud Scheduler Admin' };
    } catch {
      return { name: 'Admin User', email: 'admin@dp-fcfs.cloud', role: 'Cloud Scheduler Admin' };
    }
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('dp_user');
    setCurrentUser(null);
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const handleLoginClick = () => {
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');

    // Global Ctrl+K / Cmd+K listener
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = SEARCHABLE_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full flex items-center justify-between shrink-0 h-16 px-4 md:px-8 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
        {/* Left Search Bar Trigger */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={toggleSidebar}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 cursor-pointer rounded-full bg-muted/50 border border-transparent hover:border-border transition-all duration-300 px-3.5 py-1.5 text-muted-foreground w-72 focus-within:border-primary group hover:bg-muted/70"
          >
            <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground select-none">Search pages, tasks, algorithms...</span>
            <div className="ml-auto flex items-center shrink-0">
              <kbd className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                <Command size={10} /> K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-intro-tour'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all shadow-sm"
            aria-label="System Tour"
            title="Open DP-FCFS System Tour & Demonstration Guide"
          >
            <BookOpen size={13} className="text-primary" />
            <span className="hidden sm:inline">Guide &amp; Tour</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
          </motion.button>

          <div className="w-px h-5 mx-2 bg-border hidden sm:block" />

          {/* User Profile / Login Button with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 pr-3 border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-200"
              aria-label="User Profile Menu"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
                <User size={15} />
              </div>
              <div className="flex-col items-start hidden sm:flex">
                <span className="text-[13px] font-medium leading-none text-foreground">
                  {currentUser?.name || 'Admin User'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {currentUser ? 'Active' : 'Guest'}
                </span>
              </div>
            </button>

            {/* Profile Menu Popover */}
            <AnimatePresence>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {currentUser?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-foreground truncate">{currentUser?.name || 'Admin User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'admin@dp-fcfs.cloud'}</p>
                      <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-500 font-mono mt-1">
                        {currentUser?.role || 'Cloud Operator'}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate('/queue'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <Play size={14} className="text-primary" />
                      <span>Launch Cloud Simulator</span>
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate('/tasks'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <Layers size={14} className="text-blue-400" />
                      <span>Task Management Hub</span>
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate('/prediction'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <BrainCircuit size={14} className="text-purple-400" />
                      <span>Burst Predictor Workbench</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    {currentUser ? (
                      <button
                        onClick={handleLogout}
                        className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors w-full justify-center"
                      >
                        <LogOut size={13} />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleLoginClick}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors w-full justify-center"
                      >
                        <LogIn size={13} />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Global Command / Search Palette Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Input Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/20">
                <Search size={18} className="text-primary shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search pages, tasks, algorithms, reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Results List */}
              <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/30">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No results found for "{searchQuery}".
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item.path)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <IconComp size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Navigate directly</span>
                <span className="flex items-center gap-1">
                  Press <kbd className="px-1 py-0.5 rounded bg-background border border-border">ESC</kbd> to close
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

