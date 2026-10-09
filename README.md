# 青春时光 · 北京时间

一个纯静态的北京时间 / 倒计时 / 每日金句网页。原站部署在 `bj-time.netlify.app`，因原 GitHub 账号被封、Netlify 后台无法登录，现迁移到 GitHub Pages 重新部署。

**在线访问：** https://purpleethereality.github.io/bj-time/

---

## 功能

- **实时时钟** — 时/分/秒，可选毫秒显示
- **高考倒计时** — 距 2027 年高考天数（顶部 + 右侧卡片）
- **每日金句** — 通过 hitokoto 接口获取，失败自动回退到内置金句
- **拓展金句** — 本地 `functions/jinju.json` 提供 81 条精选金句
- **背景轮换** — 多图源随机切换，带过渡动画
- **5 套视觉套装** — 纸上时光（默认）、甜梦巴黎、萌力全开、霓虹都市、纸墨宣言、旧日终端
- **个性化设置面板** — 主题、字体、显示项、套装切换等

---

## 目录结构

```
index.html                    页面结构
favicon.png                   站点图标
css/
  variables.css                CSS 变量
  base.css                     基础重置
  layout.css                   布局
  components.css               组件样式
  themes.css                   主题（明/暗）
  settings.css                 设置面板
  responsive.css               响应式
  outfits/                     5 套独立风格包
    macaron.css                甜梦巴黎
    kawaii.css                 萌力全开
    cyberpunk.css              霓虹都市
    editorial.css              纸墨宣言
    vintage.css                旧日终端
js/
  globals.js                   DOM 引用 + 内置金句数据
  utils.js                     工具函数
  time.js                      时间同步与显示
  quote.js                     金句获取与轮换
  background.js                背景图轮换
  countdown.js                 倒计时计算
  theme.js                     主题切换
  drawer.js                    设置抽屉
  settings.js                  设置项逻辑
  main.js                      入口
functions/
  jinju.json                   拓展金句数据（81 条）
  bj-time.json                 校时接口的静态替身
vendor/font-awesome/           Font Awesome 6.4.0（本地化，含字体文件）
```

---

## 从 Netlify 迁移时做的改动

原站依赖两个 Netlify Functions（服务端），GitHub Pages 是纯静态托管，没有服务端。改动共 3 处：

| 文件 | 原来 | 现在 | 原因 |
|---|---|---|---|
| `js/time.js:5` | `fetch('/.netlify/functions/bj-time')` | `fetch('functions/bj-time.json')` | 绝对路径在 Pages 子路径下会 404 |
| `js/quote.js:113` | `fetch('/.netlify/functions/jinju')` | `fetch('functions/jinju.json')` | 同上 |
| `functions/*.json` | 无扩展名的函数路由 | 带 `.json` 后缀的静态文件 | Pages 对无扩展名文件不返回 `application/json`，`res.json()` 会失败 |

另外新增 `.nojekyll`，避免 Jekyll 处理 `vendor/` 等目录。

### 关于校时

原站的 `bj-time` 函数本身**早就坏了**（上游 `api.xiaole.work` 连不上，线上返回 HTTP 500）。所以 `functions/bj-time.json` 如实返回 `{"success":false}`，`js/time.js:13-16` 的 `catch` 分支会让时钟回退到**访问者本机时间**。这是原站一直以来的实际行为，并非迁移导致。

如果你想恢复真正的服务端校时，需要部署一个 Serverless 函数（Cloudflare Workers / Vercel Functions 均可），然后改回 `js/time.js:5` 的地址。

---

## 本地预览

```bash
python -m http.server 8899
```

然后打开 http://127.0.0.1:8899/

> 注意：必须用 HTTP 服务方式打开，直接双击 `index.html`（`file://` 协议）会导致 `fetch` 失败。

---

## 仍需外部网络的功能

| 地址 | 用途 | 状态 |
|---|---|---|
| `https://v1.hitokoto.cn` | 每日金句（主） | 正常 |
| `https://international.v1.hitokoto.cn` | 每日金句（备） | 正常 |
| `https://t.alcy.cc/fj` | 随机背景图 | 正常 |
| `https://api.suyanw.cn/api/ys` | 随机背景图（备用） | 正常 |
| `https://imgapi.xl0408.top/index.php` | 随机背景图（备用） | 未验证 |
| `https://www.kanostar.top/holidays/img` | 放假倒计时图片 | **404，原站已失效** |

最后一项是 `index.html` 里引用的第三方图床，在原站上就已经打不开了。想修复的话替换该地址即可。

---

## 部署

推送到 `main` 分支后，在仓库 **Settings → Pages** 中选择 `Deploy from a branch` → `main` / `root` 即可。
