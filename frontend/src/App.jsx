import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { TaskProvider } from './context/TaskContext';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Queue from './pages/Queue';
import Servers from './pages/Servers';
import Prediction from './pages/Prediction';
import Flowcharts from './pages/Flowcharts';
import Analytics from './pages/Analytics';
import Research from './pages/Research';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';

function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/flowcharts" element={<Flowcharts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/research" element={<Research />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  );
}

export default App;
