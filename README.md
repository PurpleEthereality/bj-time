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

本仓库**同一份代码同时适配 GitHub Pages 与 Netlify**，无需维护两份文件。

### GitHub Pages（当前已上线）

推送到 `main` 分支后，在仓库 **Settings → Pages** 中选择 `Deploy from a branch` → `main` / `root` 即可。

线上地址：**https://purpleethereality.github.io/bj-time/**

### Netlify

**方式 A：连 GitHub 仓库（推荐）**

1. Netlify → `Add new site` → `Import an existing project` → 选仓库 `bj-time`
2. 构建设置留空，`netlify.toml` 已声明：
   ```toml
   [build]
     publish = "."
     functions = "netlify/functions"
   ```
3. Deploy。之后每次 push 到 `main` 自动重新部署。

**方式 B：手动拖拽目录**

拖仓库根目录到 Netlify Drop。拖拽方式不启用 `netlify/functions`，
前端会自动回退到静态替身，站点其余功能完全正常。

### 两种托管为什么能共用一份代码

`index.html` 里所有资源引用都是相对路径（`css/…`、`js/…`、`vendor/…`），
在 Pages 的 `/bj-time/` 子路径与 Netlify 的根路径 `/` 下都能正确解析，HTML 无需改动。

差异只在两处 `fetch()`，由 `js/time.js` 与 `js/quote.js` 里的
`timeSourceCandidates()` **自动探测 hostname**：

| 运行环境 | 时间源 | 名句源 |
|---|---|---|
| `*.netlify.app`、`localhost`、`127.0.0.1` | `/.netlify/functions/bj-time`（**真服务端校时**） | `/.netlify/functions/jinju` |
| 其他（Pages 等纯静态托管） | `functions/bj-time.json` | `functions/jinju.json` |

顺序是「函数优先，静态兜底」：即使在 Netlify 上函数异常也会自动落到静态文件，不会白屏。

### Netlify 上的真服务端校时

`netlify/functions/bj-time.js` 依次尝试多个时间源，任一成功即返回：

1. `f.m.suning.com/api/ct.do`（国内源，优先）
2. `timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai`

返回结构刻意与原站保持一致（`js/time.js` 读 `data.originalData.code` 与 `data.originalData.time`）：

```json
{"success":true,"source":"suning","originalData":{"code":200,"time":"2026-10-09T03:57:00.313Z"}}
```

函数带**偏差保护**：返回值与本地时间相差超过 24 小时即视为异常源，换下一个，
避免把访客时钟带跑偏。

`netlify/functions/jinju.js` 直接读取仓库里已发布的 `functions/jinju.json` 作为数据源，
保证函数与静态两条路径**数据同源、不可能漂移**。

### 上线前已验证

- 两个函数 handler 直接调用：18 项断言全部通过
- 时间源实测偏差 **0 秒**，确认**无 8 小时时区错位**（最高风险项）
- hostname 分支逻辑：5 种场景全部正确，Netlify 环境函数优先于静态回退
- 浏览器实测：Netlify 环境下确实命中 `/.netlify/functions/*` 服务端函数
- 浏览器实测：纯静态环境下 `/.netlify/*` 返回 404 后自动回退到 `functions/*.json`
- 4 个改动文件 `node --check` 全部通过
