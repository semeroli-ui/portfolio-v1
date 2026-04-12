import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_FILE = path.join(__dirname, 'projects.json');

// Initial projects data
const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "Project A - 数据可视化大屏",
    category: "Data Viz",
    description: "基于实时 API 的 3D 地理空间数据展示系统，支持百万级数据点流畅渲染。",
    gradient: "from-cyan-900 to-blue-900",
    link: "https://global.qianmoai.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260212-155757.gif"
  },
  {
    id: 2,
    title: "Project B - 3D 线上展厅",
    category: "Interactive",
    description: "使用模型加载与实时光影技术的数字展览体验，还原真实画廊光照效果。",
    gradient: "from-purple-900 to-indigo-900",
    link: "https://lumina0.qianmoai.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260212-170635.gif"
  },
  {
    id: 3,
    title: "Project C - 数字孪生系统",
    category: "Enterprise",
    description: "智慧城市级建筑群高度还原交互平台，集成 IoT 设备状态监控。",
    gradient: "from-pink-900 to-red-900",
    link: "https://szlsxt.qianmoai.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260212-164103.gif"
  },
  {
    id: 4,
    title: "Project D - 语枢 AI 备课助手",
    category: "EdTech",
    description: "告别“深夜备课”！语枢 AI：让每一堂语文课都充满智慧与灵感。一款专为中国语文教育者打造的生产力工具——语枢 AI (Yushu AI)。",
    gradient: "from-emerald-900 to-teal-900",
    link: "https://aiyushu.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260212-151210.gif"
  },
  {
    id: 5,
    title: "Project E - 语之笔写作辅导",
    category: "AI Education",
    description: "以科技研墨，让每一篇习作都意蕴悠长。首款专为中小学语文设计的“过程性写作”智能辅导系统。",
    gradient: "from-amber-900 to-orange-900",
    link: "https://yuzhibi.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260211-093033.gif"
  },
  {
    id: 6,
    title: "Project F - 墨染诗心",
    category: "Immersive Art",
    description: "在这个快节奏的时代，我做了一个慢下来的作品 —— 「墨染诗心」。这不是一个简单的古诗词阅读器，而是一场跨越千年的AI沉浸式艺术实验。",
    gradient: "from-slate-900 to-stone-900",
    link: "https://qianmo.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260213-092023.gif"
  },
  {
    id: 7,
    title: "Project G - 3D 交互视觉",
    category: "WebGL / Creative",
    description: "擅长使用 WebGL、Three.js 和 React 构建高性能交互式网页，将复杂的数据转化为精美的视觉艺术。",
    gradient: "from-blue-900 to-indigo-900",
    link: "https://aichuzao.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260213-093704.gif"
  }
];

// Initialize projects file if it doesn't exist
if (!fs.existsSync(PROJECTS_FILE)) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(INITIAL_PROJECTS, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const JWT_SECRET = process.env.JWT_SECRET;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || !ADMIN_PASSWORD_HASH)) {
    console.error('CRITICAL: JWT_SECRET and ADMIN_PASSWORD_HASH must be set in production!');
    process.exit(1);
  }

  const effectiveSecret = JWT_SECRET || 'dev-secret-do-not-use-in-prod';

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      jwt.verify(token, effectiveSecret);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // API Routes
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // In dev mode, if hash isn't set, allow 'admin' as default
    const isDevDefault = process.env.NODE_ENV !== 'production' && !ADMIN_PASSWORD_HASH && password === 'admin';
    
    const isValidPassword = ADMIN_PASSWORD_HASH 
      ? await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      : isDevDefault;

    if (username === ADMIN_USERNAME && isValidPassword) {
      const token = jwt.sign({ username }, effectiveSecret, { expiresIn: '24h' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, // Always secure for modern browsers/CF
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 
      });
      return res.json({ success: true });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/projects', (req, res) => {
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.post('/api/projects', authenticate, (req, res) => {
    const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    const newProject = { ...req.body, id: Date.now() };
    projects.push(newProject);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.json(newProject);
  });

  app.put('/api/projects/:id', authenticate, (req, res) => {
    const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    const index = projects.findIndex((p: any) => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Project not found' });
    projects[index] = { ...projects[index], ...req.body };
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.json(projects[index]);
  });

  app.delete('/api/projects/:id', authenticate, (req, res) => {
    let projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    projects = projects.filter((p: any) => p.id !== parseInt(req.params.id));
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.json({ success: true });
  });

  app.get('/api/auth/check', authenticate, (req, res) => {
    res.json({ authenticated: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
