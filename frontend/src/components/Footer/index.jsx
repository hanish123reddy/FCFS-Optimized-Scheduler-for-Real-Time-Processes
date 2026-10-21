const Footer = () => {
  return (
    <footer className="glass py-6 px-6 text-center border-t border-slate-700/50 mt-auto w-full">
      <p className="text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Dynamic Predictive FCFS. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
