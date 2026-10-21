import { motion } from 'framer-motion';
import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, index }) => {
  const statusColors = {
    waiting: 'text-warning-orange bg-warning-orange/10 border-warning-orange/20',
    running: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
    completed: 'text-success-green bg-success-green/10 border-success-green/20',
    failed: 'text-danger-red bg-danger-red/10 border-danger-red/20',
  };

  const StatusIcon = {
    waiting: Clock,
    running: Play,
    completed: CheckCircle2,
    failed: AlertCircle,
  }[task.status] || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="glass-panel p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg border ${statusColors[task.status] || statusColors.waiting}`}>
            <StatusIcon size={18} />
          </div>
          <div>
            <h4 className="font-medium text-text-primary group-hover:text-accent-blue transition-colors">{task.name}</h4>
            <p className="text-xs text-text-muted mt-0.5">ID: {task.id}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColors[task.status] || statusColors.waiting}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <span className="text-xs text-text-muted mt-1">{task.time}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
