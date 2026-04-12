import { Project } from '../types';

export const api = {
  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async checkAuth(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/check');
      return res.ok;
    } catch {
      return false;
    }
  }
};
