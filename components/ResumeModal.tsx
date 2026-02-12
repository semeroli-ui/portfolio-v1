import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Palette, Zap } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-cyan-400 transition-colors bg-white/5 rounded-full z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Resume Content Adapted to Dark Theme */}
            <div className="p-8 md:p-12">
              
              {/* Header / Hero of Resume */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-8 mb-12 border-b border-white/10 pb-12">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-3 py-1 mb-4 bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-bold tracking-widest uppercase">
                    Open to Work
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                    浅墨青言
                  </h1>
                  <h2 className="text-xl text-cyan-400 font-medium mb-6 uppercase tracking-widest">
                    资深艺术总监 | AI 创意专家
                  </h2>
                  <p className="text-white/70 leading-relaxed text-lg">
                    致力于探索 AI 与美学的边界。擅长利用前沿生成式技术重塑品牌叙事，将数据转化为触动人心的视觉语言。从概念构思到最终交付，提供全链路的智能化创意解决方案。
                  </p>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Portrait" 
                    className="relative w-40 h-40 md:w-56 md:h-56 object-cover rounded-full border-4 border-white/10 shadow-2xl"
                  />
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="grid md:grid-cols-2 gap-12">
                
                {/* Experience */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    专业经历
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold text-lg">创意总监</h4>
                        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">2023 - 至今</span>
                      </div>
                      <p className="text-cyan-400 text-sm mb-3">FutureVision Studio</p>
                      <p className="text-white/60 text-sm leading-relaxed">
                        领导跨学科团队，整合 Midjourney 与 Stable Diffusion 到传统设计工作流，提升了 300% 的概念迭代速度。
                      </p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold text-lg">高级 UI 设计师</h4>
                        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">2020 - 2023</span>
                      </div>
                      <p className="text-cyan-400 text-sm mb-3">TechFlow Inc.</p>
                      <p className="text-white/60 text-sm leading-relaxed">
                        负责企业级 SaaS 产品的设计系统构建，主导了品牌 3.0 的视觉升级。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stack */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    技术栈
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {['Midjourney', 'Stable Diffusion', 'ComfyUI', 'Three.js', 'React', 'Figma', 'Blender', 'Unreal Engine 5'].map((skill) => (
                       <div key={skill} className="flex items-center gap-2 text-white/70 text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                         {skill}
                       </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-cyan-400" />
                    核心能力
                  </h3>
                   <p className="text-white/60 text-sm leading-relaxed">
                     将人工智能技术融入视觉设计、品牌体验与创意生产。精通从 Prompt Engineering 到最终视觉输出的全流程控制。
                   </p>
                </div>

              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-white/40 text-sm">
                  联系邮箱: soralabe@foxmail.com
                </p>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};