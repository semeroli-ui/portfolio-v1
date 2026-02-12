import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 border-t border-white/10 relative z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center">
      
      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="mb-8 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 transition-all duration-300 group"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </button>

      <div className="text-white/30 text-xs tracking-widest uppercase mb-2">
        &copy; {new Date().getFullYear()} Designed & Built by Qianmo Qingyan. 
      </div>
      <div className="text-white/20 text-[10px] uppercase tracking-widest">
        Powered by React & Three.js
      </div>
    </footer>
  );
};