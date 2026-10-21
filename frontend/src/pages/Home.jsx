import { motion } from 'framer-motion';
import { ArrowRight, Activity, Zap, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Buttons';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Activity, title: 'Real-time Queue Dynamics', desc: 'Visualize FCFS algorithm execution in real-time.' },
    { icon: Zap, title: 'Predictive Analysis', desc: 'Forecast completion times and server loads instantly.' },
    { icon: BarChart2, title: 'Comprehensive Analytics', desc: 'Detailed reports and metrics for process evaluation.' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-16 space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm mb-4"
        >
          v1.0 is now live
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100"
        >
          Dynamic <span className="text-gradient">Predictive FCFS</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          An intelligent cloud task scheduling and visualization system. Experience first-come-first-serve execution enhanced with predictive modeling.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 flex justify-center gap-4"
        >
          <Button onClick={() => navigate('/login')} className="px-8 py-3 text-lg rounded-xl">
            Start Simulation <ArrowRight size={20} />
          </Button>
          <Button variant="secondary" className="px-8 py-3 text-lg rounded-xl">
            View Documentation
          </Button>
        </motion.div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-slate-700/50 mt-12">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Icon size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
