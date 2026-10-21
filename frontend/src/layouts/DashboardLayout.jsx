import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import IntroModal from '../components/Onboarding/IntroModal';
import { cn } from '../utils/cn';

const pageTransition = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling on the main content area
    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: scrollRef.current?.firstElementChild,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Technological Grid & Ambient Aurora Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Fine-pitch engineering dot grid */}
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]" 
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Top-Left Cyan/Indigo Glow */}
        <div
          className="absolute rounded-full pointer-events-none mix-blend-screen opacity-40 dark:opacity-20"
          style={{
            width: '65vw', height: '65vw', top: '-25%', left: '-15%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            filter: 'blur(90px)',
            animation: 'float 24s ease-in-out infinite',
          }}
        />

        {/* Ambient Bottom-Right Violet/Teal Glow */}
        <div
          className="absolute rounded-full pointer-events-none mix-blend-screen opacity-35 dark:opacity-20"
          style={{
            width: '55vw', height: '55vw', bottom: '-20%', right: '-10%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(20, 184, 166, 0.08) 45%, transparent 70%)',
            filter: 'blur(95px)',
            animation: 'float 28s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Onboarding & System Tour Modal */}
      <IntroModal />

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
        >
          <div className="max-w-[1400px] w-full mx-auto px-6 py-8 md:px-12 md:py-12 pb-32 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} {...pageTransition}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
