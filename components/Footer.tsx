import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-white/10 text-center relative z-10 bg-black/40 backdrop-blur-sm">
      <div className="text-white/30 text-xs tracking-widest uppercase mb-2">
        &copy; 2026 Designed & Built by YOURNAME. 
      </div>
      <div className="text-white/20 text-[10px] uppercase tracking-widest">
        Powered by React & Three.js
      </div>
    </footer>
  );
};