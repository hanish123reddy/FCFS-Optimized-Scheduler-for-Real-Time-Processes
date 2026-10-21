import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

const QueueCard = ({ task, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 p-3 glass-panel rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/5 group border border-white/5 hover:border-accent-blue/30"
    >
      <div className="text-text-muted group-hover:text-text-secondary transition-colors">
        <GripVertical size={16} />
      </div>
      
      <div className="flex-1 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-text-primary block">{task.name}</span>
          <span className="text-xs text-text-muted font-mono">{task.id}</span>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end">
            <span className="text-xs text-text-muted">Burst Time</span>
            <span className="text-sm font-medium text-accent-cyan">{task.burstTime}ms</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-text-muted">Arrival</span>
            <span className="text-sm font-medium text-text-secondary">{task.arrivalTime}ms</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QueueCard;
