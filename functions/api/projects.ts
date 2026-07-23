import { parse } from 'cookie';
import { verifyAccessToken } from '../utils/refreshToken';

interface Env {
  DB: KVNamespace;
  JWT_SECRET: string;
}

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
    description: "告别"深夜备课"！语枢 AI：让每一堂语文课都充满智慧与灵感。一款专为中国语文教育者打造的生产力工具——语枢 AI (Yushu AI)。",
    gradient: "from-emerald-900 to-teal-900",
    link: "https://aiyushu.de5.net",
    image: "https://img.qianmo.de5.net/PicGo/QQ20260212-151210.gif"
  },
  {
    id: 5,
    title: "Project E - 语之笔写作辅导",
    category: "AI Education",
    description: "以科技研墨，让每一篇习作都意蕴悠长。首款专为中小学语文设计的"过程性写作"智能辅导系统。",
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

async function getProjects(db: KVNamespace) {
  const data = await db.get('projects');
  if (!data) {
    await db.put('projects', JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  return JSON.parse(data);
}

/** Verify access token using the shared utility */
async function verifyAuth(request: Request, secret: string): Promise<boolean> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.token;
  if (!token) return false;
  return (await verifyAccessToken(token, secret)) !== null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const projects = await getProjects(context.env.DB);
  return new Response(JSON.stringify(projects), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!await verifyAuth(request, env.JWT_SECRET)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const projects = await getProjects(env.DB);
  const newProject = await request.json() as Record<string, unknown>;
  newProject.id = Date.now();
  projects.push(newProject);
  await env.DB.put('projects', JSON.stringify(projects));

  return new Response(JSON.stringify(newProject), {
    headers: { 'Content-Type': 'application/json' }
  });
};
