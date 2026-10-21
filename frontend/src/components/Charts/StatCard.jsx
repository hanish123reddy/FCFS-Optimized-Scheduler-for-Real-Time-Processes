import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/card';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', delay = 0 }) => {
  // Map color names to semantic tailwind classes for the icon background and text
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  
  const iconClass = colorMap[color] || colorMap.blue;
  const isUp = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden group p-6 border-border/50 bg-card hover:bg-card/80 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 border ${iconClass}`}>
              <Icon size={18} />
            </div>
          )}
        </div>

        <div className="mb-2">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && <p className="text-sm mt-1 text-muted-foreground">{subtitle}</p>}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
            <span className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StatCard;
