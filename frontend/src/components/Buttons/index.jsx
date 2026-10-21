import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-slate-900/50",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 hover:shadow-rose-500/40",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 shadow-none hover:text-white"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
