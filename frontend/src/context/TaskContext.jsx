import { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

const INITIAL_CUSTOM_TASKS = [
  { id: 'TSK-1', name: 'ETL Pipeline Job', arrival_time: 0.0, actual_burst_time: 45.0, data_size_mb: 450, cpu_cycles_m: 2200, io_ops: 3500, priority: 1 },
  { id: 'TSK-2', name: 'Image Resizer', arrival_time: 0.5, actual_burst_time: 3.0, data_size_mb: 25, cpu_cycles_m: 120, io_ops: 400, priority: 3 },
  { id: 'TSK-3', name: 'User Auth Check', arrival_time: 1.0, actual_burst_time: 1.5, data_size_mb: 10, cpu_cycles_m: 60, io_ops: 200, priority: 5 },
  { id: 'TSK-4', name: 'Database Indexer', arrival_time: 1.5, actual_burst_time: 38.0, data_size_mb: 380, cpu_cycles_m: 1900, io_ops: 4800, priority: 2 },
  { id: 'TSK-5', name: 'Email Dispatcher', arrival_time: 2.0, actual_burst_time: 4.0, data_size_mb: 30, cpu_cycles_m: 150, io_ops: 600, priority: 4 }
];

export const TaskProvider = ({ children }) => {
  const [numNodes, setNumNodes] = useState(3);
  const [tasks, setTasks] = useState(INITIAL_CUSTOM_TASKS);
  const [simResultDP, setSimResultDP] = useState(null);
  const [simResultFCFS, setSimResultFCFS] = useState(null);
  const [simResultSJF, setSimResultSJF] = useState(null);

  return (
    <TaskContext.Provider value={{
      numNodes, setNumNodes,
      tasks, setTasks,
      simResultDP, setSimResultDP,
      simResultFCFS, setSimResultFCFS,
      simResultSJF, setSimResultSJF
    }}>
      {children}
    </TaskContext.Provider>
  );
};
