import { motion } from 'framer-motion';

const AnimatedButton = ({ children, variant = 'primary', icon: Icon, onClick, className = '' }) => {
  const baseClasses = "relative flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-all duration-200 overflow-hidden";
  
  const variants = {
    primary: "bg-accent-blue text-white hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]",
    secondary: "bg-white/5 border border-white/10 text-text-primary hover:bg-white/10",
    danger: "bg-danger-red/10 border border-danger-red/20 text-danger-red hover:bg-danger-red/20",
    success: "bg-success-green/10 border border-success-green/20 text-success-green hover:bg-success-green/20",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] hover:animate-[shimmer_1.5s_infinite]" />
      )}
    </motion.button>
  );
};

export default AnimatedButton;
