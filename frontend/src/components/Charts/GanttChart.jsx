import React from 'react';
import { motion } from 'framer-motion';

const VM_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

const GanttChart = ({ timeline = [], totalTime = 60, algorithmName = 'Simulation Timeline' }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-border">
        No simulation timeline data available. Run a simulation to generate Gantt chart.
      </div>
    );
  }

  // Extract unique VMs
  const vms = Array.from(new Set(timeline.map(t => t.vm_id))).sort();
  const maxTime = Math.max(totalTime, ...timeline.map(t => t.finish_time), 10);

  return (
    <div className="space-y-4 bg-card/60 border border-border/60 backdrop-blur-md rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            {algorithmName} — Gantt Chart
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Task execution slots across Virtual Machine nodes over time (0s – {maxTime.toFixed(1)}s)
          </p>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
          Total Duration: <span className="text-primary font-bold">{maxTime.toFixed(1)}s</span>
        </div>
      </div>

      {/* Gantt Chart Grid */}
      <div className="space-y-4 pt-4 overflow-x-auto">
        {/* Time ticks header */}
        <div className="flex items-center pl-24 pr-4 text-[11px] font-mono text-muted-foreground justify-between border-b border-border/40 pb-2">
          <span>0s</span>
          <span>{(maxTime * 0.25).toFixed(1)}s</span>
          <span>{(maxTime * 0.50).toFixed(1)}s</span>
          <span>{(maxTime * 0.75).toFixed(1)}s</span>
          <span>{maxTime.toFixed(1)}s</span>
        </div>

        {/* Rows per VM */}
        {vms.map((vmId, idx) => {
          const vmTasks = timeline.filter(t => t.vm_id === vmId);
          const color = VM_COLORS[idx % VM_COLORS.length];

          return (
            <div key={vmId} className="flex items-center gap-4">
              {/* VM Label */}
              <div className="w-20 shrink-0 flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {vmId}
              </div>

              {/* Timeline Track */}
              <div className="relative flex-1 h-10 bg-muted/30 rounded-xl border border-border/30 overflow-hidden min-w-[500px]">
                {vmTasks.map((t, taskIdx) => {
                  const leftPct = (t.start_time / maxTime) * 100;
                  const widthPct = Math.max(1.5, (t.duration / maxTime) * 100);

                  return (
                    <motion.div
                      key={`${t.task_id}-${taskIdx}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.4, delay: taskIdx * 0.05 }}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: `${color}DD`,
                      }}
                      className="absolute top-1 bottom-1 rounded-lg px-2 flex items-center justify-between text-[11px] font-medium text-white shadow-md hover:brightness-125 transition-all cursor-pointer group"
                      title={`${t.task_name} (${t.task_id}): Start ${t.start_time}s -> Finish ${t.finish_time}s (Duration: ${t.duration}s)`}
                    >
                      <span className="truncate font-mono">{t.task_id}</span>
                      <span className="text-[10px] opacity-80 hidden group-hover:inline ml-1 font-mono">
                        {t.duration}s
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;
