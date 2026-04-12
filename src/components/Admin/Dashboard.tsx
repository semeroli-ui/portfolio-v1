import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project } from '../../types';
import { Plus, Trash2, Edit2, LogOut, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await api.getProjects();
    setProjects(data);
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  const handleEdit = (project: Project) => {
    setIsEditing(project.id);
    setEditForm(project);
  };

  const handleSave = async () => {
    if (isEditing) {
      await api.updateProject(isEditing, editForm);
    } else {
      await api.addProject({ ...editForm, gradient: 'from-cyan-900 to-blue-900' });
    }
    setIsEditing(null);
    setIsAdding(false);
    setEditForm({});
    loadProjects();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      await api.deleteProject(id);
      loadProjects();
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-glow">项目管理后台</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" /> 退出登录
        </button>
      </div>

      <div className="mb-8">
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <Plus className="w-5 h-5" /> 添加新项目
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="glass-card p-8 rounded-2xl mb-12 border-cyan-500/30">
          <h2 className="text-2xl font-bold mb-6">{isAdding ? '添加项目' : '编辑项目'}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="项目标题"
              value={editForm.title || ''}
              onChange={e => setEditForm({...editForm, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="分类"
              value={editForm.category || ''}
              onChange={e => setEditForm({...editForm, category: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="图片链接 (GIF/JPG)"
              value={editForm.image || ''}
              onChange={e => setEditForm({...editForm, image: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="查看详情链接"
              value={editForm.link || ''}
              onChange={e => setEditForm({...editForm, link: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              placeholder="项目简介"
              value={editForm.description || ''}
              onChange={e => setEditForm({...editForm, description: e.target.value})}
              className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3 h-32 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              <Save className="w-4 h-4" /> 保存
            </button>
            <button 
              onClick={() => { setIsAdding(false); setIsEditing(null); setEditForm({}); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              <X className="w-4 h-4" /> 取消
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {projects.map(project => (
          <div key={project.id} className="glass-card p-6 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <img src={project.image} alt="" className="w-20 h-20 object-cover rounded-lg bg-black/50" />
              <div>
                <h3 className="text-xl font-bold">{project.title}</h3>
                <p className="text-white/50 text-sm">{project.category}</p>
              </div>
            </div>
            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(project)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cyan-400"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(project.id)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
