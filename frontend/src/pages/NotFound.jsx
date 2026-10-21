import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[30rem] h-[30rem] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-9xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl font-bold mb-3 text-foreground tracking-tight">
          Page not found
        </h2>
        
        <p className="text-base mb-10 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved to another coordinate.
        </p>
        
        <Button asChild variant="premium" className="gap-2 px-8 py-6 rounded-xl">
          <Link to="/">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
