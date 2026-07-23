import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, LogOut, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Project } from '../types';

/** Access token TTL in ms (1 hour). Refresh at 50 min to avoid edge-case expiry. */
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;

export const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  // ── Auto token refresh ────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const tryRefresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!res.ok) {
          // Refresh token invalid or expired → force re-login
          navigate('/login');
        }
      } catch {
        // Network error – don't force logout; next request will catch it
      }
    };

    // Refresh on mount (tab becomes active after being hidden)
    tryRefresh();

    // Periodic proactive refresh before access token expires
    timer = setInterval(tryRefresh, TOKEN_REFRESH_INTERVAL);

    // Also refresh when tab regains focus
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tryRefresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [navigate]);

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (!res.ok) navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/login');
  };

  const handleSave = async (id?: number) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/projects/${id}` : '/api/projects';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        fetchProjects();
        setEditingId(null);
        setIsAdding(false);
        setEditForm({});
      }
    } catch (err) {
      console.error('Failed to save project');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error('Failed to delete project');
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditForm(project);
  };

  if (loading) return <div className="min-h-screen bg-[#020205] flex items-center justify-center text-white">加载中...</div>;

  return (
    <div className="min-h-screen bg-[#020205] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">作品管理后台</h1>
            <p className="text-white/50">在这里管理您的精选作品集</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdding(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" /> 新增项目
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/5 hover:bg-white/10 text-white/70 px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/10"
            >
              <LogOut className="w-5 h-5" /> 退出
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-8 rounded-3xl border border-cyan-500/30 overflow-hidden"
              >
                <ProjectForm
                  form={editForm}
                  onChange={setEditForm}
                  onSave={() => handleSave()}
                  onCancel={() => { setIsAdding(false); setEditForm({}); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {projects.map((project) => (
            <motion.div
              key={project.id}
              layout
              className="glass-card p-6 rounded-3xl border border-white/10 group hover:border-white/20 transition-all"
            >
              {editingId === project.id ? (
                <ProjectForm
                  form={editForm}
                  onChange={setEditForm}
                  onSave={() => handleSave(project.id)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-black/50 border border-white/5">
                    {project.image ? (
                      <img src={project.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase tracking-widest text-white/60">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 text-xs flex items-center gap-1 hover:underline"
                      >
                        预览链接 <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 w-full md:w-auto">
                    <button
                      onClick={() => startEditing(project)}
                      className="flex-1 md:flex-none p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/70"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 md:flex-none p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface FormProps {
  form: Partial<Project>;
  onChange: (form: Partial<Project>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<FormProps> = ({ form, onChange, onSave, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">项目名称</label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="项目标题"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">分类</label>
          <input
            type="text"
            value={form.category || ''}
            onChange={(e) => onChange({ ...form, category: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="例如: WebGL, AI Design"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">项目简介</label>
        <textarea
          value={form.description || ''}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 h-24 resize-none"
          placeholder="简短描述项目内容..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">图片链接 (GIF/JPG)</label>
          <input
            type="text"
            value={form.image || ''}
            onChange={(e) => onChange({ ...form, image: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">查看详情链接</label>
          <input
            type="text"
            value={form.link || ''}
            onChange={(e) => onChange({ ...form, link: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl text-white/50 hover:text-white transition-colors"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
        >
          <Save className="w-5 h-5" /> 保存项目
        </button>
      </div>
    </div>
  );
};
