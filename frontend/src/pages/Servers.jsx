import { motion } from 'framer-motion';
import { Server } from 'lucide-react';
import { Card } from '../components/ui/card';

const servers = [
  { name: 'Node 1', region: 'US-East-1', cpu: 42, ram: 68, disk: 34, status: 'healthy', uptime: '99.98%' },
  { name: 'Node 2', region: 'EU-West-1', cpu: 67, ram: 52, disk: 71, status: 'healthy', uptime: '99.99%' },
  { name: 'Node 3', region: 'AP-South-1', cpu: 31, ram: 81, disk: 45, status: 'healthy', uptime: '99.95%' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

const ProgressRing = ({ value, color, size = 80 }) => {
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" className="stroke-muted" strokeWidth={strokeWidth} />
      <motion.circle 
        cx={size/2} 
        cy={size/2} 
        r={r} 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round"
        initial={{ strokeDasharray: c, strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (value / 100) * c }}
        transition={{ duration: 1.5, ease: [0.16,1,0.3,1] }}
      />
    </svg>
  );
};

const Servers = () => (
  <motion.div className="space-y-10" variants={stagger} initial="initial" animate="animate">
    <motion.div variants={fadeUp}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Servers</h1>
      <p className="text-sm mt-1 text-muted-foreground">Monitor and manage your cloud compute infrastructure</p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {servers.map((s) => (
        <motion.div key={s.name} variants={fadeUp}>
          <Card className="p-8 bg-card hover:bg-card/80 transition-colors duration-300">
            <div className="flex items-start justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                  <h3 className="text-lg font-semibold text-foreground">{s.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{s.region}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
                <Server size={22} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 xl:gap-8 mb-10">
              <div className="relative flex flex-col items-center">
                <ProgressRing value={s.cpu} color="hsl(var(--primary))" />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-sm font-bold text-foreground">{s.cpu}%</span>
                </div>
                <span className="text-xs font-semibold mt-4 text-muted-foreground uppercase tracking-wider">CPU</span>
              </div>
              <div className="relative flex flex-col items-center">
                <ProgressRing value={s.ram} color="#8B5CF6" />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-sm font-bold text-foreground">{s.ram}%</span>
                </div>
                <span className="text-xs font-semibold mt-4 text-muted-foreground uppercase tracking-wider">RAM</span>
              </div>
              <div className="relative flex flex-col items-center">
                <ProgressRing value={s.disk} color="#06B6D4" />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-sm font-bold text-foreground">{s.disk}%</span>
                </div>
                <span className="text-xs font-semibold mt-4 text-muted-foreground uppercase tracking-wider">Disk</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              <span className="text-sm text-muted-foreground">System Uptime</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{s.uptime}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default Servers;
