import React from 'react';
import { motion } from 'framer-motion';

const TECH_STACK = [
  "Three.js / WebGL", "React / Next.js", "Tailwind CSS", 
  "Node.js", "TypeScript", "GSAP Animation"
];

const STATS = [
  { value: "50+", label: "完成项目" },
  { value: "12", label: "设计奖项" }
];

export const About: React.FC = () => {
  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        
        {/* Left Card */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 rounded-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">关于我</h2>
          <p className="text-white/70 leading-relaxed mb-8 text-lg">
            你好！我是一名热衷于探索技术边界的前端开发人员。在过去的五年里，我一直致力于结合图形学与 Web 技术，为全球用户创造独特的视觉体验。我不只写代码，我构建数字世界。
          </p>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/5">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Skills */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="space-y-8"
        >
          <div>
             <h3 className="text-xl font-semibold uppercase tracking-widest text-white/40 mb-6">核心能力</h3>
             <h4 className="text-4xl font-bold text-white mb-4">设计与开发的完美融合</h4>
             <p className="text-white/60 mb-8">
               我不满足于传统的网页布局。通过掌握 WebGL 底层技术，我能够打破浏览器的二维限制，创造出具有空间感和物理反馈的交互界面。
             </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">技术栈</h3>
            <div className="flex flex-wrap gap-3">
              {TECH_STACK.map((tech, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-cyan-100 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};