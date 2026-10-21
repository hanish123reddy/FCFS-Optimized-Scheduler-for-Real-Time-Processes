import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Zap, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@dp-fcfs.cloud');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const userObj = {
        email: email || 'admin@dp-fcfs.cloud',
        name: (email.split('@')[0] || 'admin').replace('.', ' '),
        role: 'Cloud Scheduler Admin',
        loginTime: new Date().toLocaleTimeString()
      };
      localStorage.setItem('dp_user', JSON.stringify(userObj));
      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 700);
    }, 500);
  };

  const handleQuickDemoLogin = (demoRole, demoEmail) => {
    setEmail(demoEmail);
    const userObj = {
      email: demoEmail,
      name: demoRole,
      role: demoRole,
      loginTime: new Date().toLocaleTimeString()
    };
    localStorage.setItem('dp_user', JSON.stringify(userObj));
    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 sm:p-10 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto mb-5 text-white">
              <Zap size={28} />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">DP-FCFS Cloud Access</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Sign in to manage scheduling and predictive models</p>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400 font-semibold"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Authenticated successfully! Redirecting to Cloud Dashboard...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-muted-foreground" />
                </div>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-border text-sm"
                  placeholder="admin@dp-fcfs.cloud"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-muted-foreground" />
                </div>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-border text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-muted-foreground cursor-pointer">
                  Remember session
                </label>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Demo Pass: </span>
                <code className="text-primary font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">password123</code>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="premium" 
              disabled={loading || success}
              className="w-full py-5 text-sm font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying Credentials...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} />
                  Signed In
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          {/* Quick Demo Access & Return Links */}
          <div className="mt-6 pt-5 border-t border-border/60 space-y-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block text-center">
              Quick 1-Click Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemoLogin('Cloud Architect', 'architect@dp-fcfs.cloud')}
                className="text-xs h-8.5 gap-1.5"
              >
                <ShieldCheck size={13} className="text-primary" /> Admin Mode
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemoLogin('Research Scientist', 'researcher@dp-fcfs.cloud')}
                className="text-xs h-8.5 gap-1.5"
              >
                <Zap size={13} className="text-amber-400" /> Researcher
              </Button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={13} /> Return to Dashboard without login
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
