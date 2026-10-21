export const dummyTasks = [
  { id: 'TSK-001', arrivalTime: '10:00:00', burstTime: 120, status: 'Completed', server: 'Server-A' },
  { id: 'TSK-002', arrivalTime: '10:01:30', burstTime: 45, status: 'Completed', server: 'Server-B' },
  { id: 'TSK-003', arrivalTime: '10:02:15', burstTime: 300, status: 'Running', server: 'Server-A' },
  { id: 'TSK-004', arrivalTime: '10:03:00', burstTime: 80, status: 'Waiting', server: 'Pending' },
  { id: 'TSK-005', arrivalTime: '10:03:45', burstTime: 150, status: 'Waiting', server: 'Pending' },
  { id: 'TSK-006', arrivalTime: '10:04:10', burstTime: 60, status: 'Waiting', server: 'Pending' },
  { id: 'TSK-007', arrivalTime: '10:05:00', burstTime: 95, status: 'Waiting', server: 'Pending' }
];

export const dummyStats = {
  totalTasks: 145,
  runningTasks: 3,
  completedTasks: 132,
  waitingTasks: 10,
  cpuUtilization: 78, // percentage
  serverLoad: 65, // percentage
  avgWaitingTime: 12.5, // seconds
  throughput: 4.2 // tasks per second
};

export const dummyPredictions = {
  waitingTime: [12, 15, 18, 14, 20, 25, 22],
  completionTime: [132, 177, 477, 557, 707, 767, 862],
  cpuUtilizationTrend: [40, 55, 70, 78, 82, 75, 80],
  estimatedFinishTime: '10:15:30'
};
