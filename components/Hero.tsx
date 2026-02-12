import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative z-10 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10 rounded-full text-cyan-400 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
          <Sparkles className="w-3 h-3" />
          <span>可视化工程师 & 创意开发者</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-extrabold mb-6 tracking-tighter text-white">
          打造
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mx-2">
            沉浸式
          </span>
          <br className="hidden md:block" />
          数字体验
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-white/60 mb-10 leading-relaxed">
            擅长使用 WebGL、Three.js 和 React 构建高性能交互式网页，将复杂的数据转化为精美的视觉艺术。
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#projects" 
              className="w-full sm:w-auto px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all text-center transform hover:-translate-y-1"
            >
                查看我的作品
            </a>
            <a 
              href="#contact" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md font-bold rounded-lg transition-all text-center"
            >
                开始聊聊
            </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 text-white/30"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
};