export const api = {
  async getProjects() {
    const res = await fetch('/api/projects');
    return res.json();
  },
  async login(username: string, password: string) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },
  async logout() {
    const res = await fetch('/api/logout', { method: 'POST' });
    return res.json();
  },
  async checkAuth() {
    const res = await fetch('/api/auth/check');
    return res.ok;
  },
  async addProject(project: any) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return res.json();
  },
  async updateProject(id: number, project: any) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return res.json();
  },
  async deleteProject(id: number) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  }
};
