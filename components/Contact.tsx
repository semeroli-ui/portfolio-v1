import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 py-24 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold mb-8 text-white">准备好启动你的项目了吗？</h2>
        <p className="text-white/60 mb-8 italic text-lg">"如果你能想象它，我们就能用代码实现它。"</p>
        
        {/* Email Display */}
        <div className="mb-12 flex justify-center">
            <a 
                href="mailto:soralabe@foxmail.com" 
                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group backdrop-blur-sm hover:border-cyan-400/30"
            >
                <Mail className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium tracking-wide group-hover:text-cyan-100 transition-colors">
                    soralabe@foxmail.com
                </span>
            </a>
        </div>
        
        <div className="glass-card p-10 rounded-2xl">
          <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">姓名</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-white/20"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">邮箱</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-white/20"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">您的消息</label>
              <textarea 
                rows={4} 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-white/20"
                placeholder="告诉我您的想法..."
              ></textarea>
            </div>
            <button className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300">
              发送消息
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};