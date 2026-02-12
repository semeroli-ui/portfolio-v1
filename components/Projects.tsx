import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { ArrowRight } from 'lucide-react';

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Project A - 数据可视化大屏",
    category: "Data Viz",
    description: "基于实时 API 的 3D 地理空间数据展示系统，支持百万级数据点流畅渲染。",
    gradient: "from-cyan-900 to-blue-900",
    link: "#"
  },
  {
    id: 2,
    title: "Project B - 3D 线上展厅",
    category: "Interactive",
    description: "使用模型加载与实时光影技术的数字展览体验，还原真实画廊光照效果。",
    gradient: "from-purple-900 to-indigo-900",
    link: "#"
  },
  {
    id: 3,
    title: "Project C - 数字孪生系统",
    category: "Enterprise",
    description: "智慧城市级建筑群高度还原交互平台，集成 IoT 设备状态监控。",
    gradient: "from-pink-900 to-red-900",
    link: "#"
  }
];

export const Projects: React.FC = () => {
  return (
    <section id="projects" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">精选作品</h2>
        <div className="w-24 h-1 bg-cyan-500 mx-auto rounded-full" />
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {PROJECTS.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl overflow-hidden group hover:border-cyan-400/50 transition-colors duration-300"
          >
            {/* Visual Placeholder */}
            <div className={`h-56 bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <span className="text-white/20 font-bold italic text-3xl group-hover:scale-110 transition-transform duration-500">
                {project.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                {project.description}
              </p>
              <a href={project.link} className="inline-flex items-center text-cyan-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors group/link">
                查看详情 <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};