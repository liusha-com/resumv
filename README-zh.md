# Resumv

[English](README.md) | **简体中文**

**免注册、免登录，简历数据保存在你的浏览器中。**

Resumv 是基于 [Reactive Resume](https://github.com/reactive-resume/reactive-resume) 的简历模板与渲染能力进行适配和优化的免费开源简历制作工具。项目采用 Astro + React 构建，去掉注册登录模块和云端账户依赖，让用户直接在浏览器中编辑、预览、保存和导出简历。

它适合重视个人信息隐私、不希望把简历上传到在线简历平台，以及希望自行部署简历工具的用户。

[在线使用](https://resumv.com) · [开始制作简历](https://resumv.com/builder/) · [浏览模板](https://resumv.com/templates/) · [上游项目](https://github.com/reactive-resume/reactive-resume)

## 为什么选择 Resumv

- **无需账户**：打开页面即可使用，不需要注册、登录或提供账户信息。
- **本地保存**：简历内容通过浏览器 `localStorage` 自动保存，不上传到项目的服务器或数据库。
- **本地处理**：简历编辑、PDF 生成与预览、Word 和 Markdown 导出均在浏览器中完成。
- **免费使用**：没有付费模板、订阅或导出付费门槛。
- **支持自行部署**：静态站点，无需配置用户数据库、登录服务或 AI API Key。
- **模板来源透明**：15 个简历模板来自 Reactive Resume，保留上游版权和许可证声明。

## 功能

### 简历编辑与模板

- 内容、预览、设计三栏编辑器，支持移动端切换面板。
- 编辑个人信息、头像、简介、经历、教育、技能、项目及自定义栏目。
- 富文本编辑、栏目排序、主栏与侧栏分配、内容隐藏、撤销和重做。
- 调整字体、字号、颜色、页边距、栏宽及 A4 / Letter 纸张尺寸。
- 实时 PDF 预览、自动分页、缩放和适应宽度。
- 本地管理多份文档，使用 JSON 备份和恢复。

模板包括 Onyx、Azurill、Bronzor、Chikorita、Ditgar、Ditto、Gengar、Glalie、Kakuna、Lapras、Leafish、Meowth、Pikachu、Rhyhorn 和 Scizor。部分模板经过本地布局优化，例如 Onyx、Kakuna、Meowth 调整为右侧栏双栏布局。

> 当前点击编辑器右侧的模板卡片，会加载缩略图对应的完整示例，包括文字、头像和设计。可通过撤销恢复切换前的内容；编辑个人简历前也可以先导出 JSON 备份。

### 下载与备份

| 格式 | 用途 |
| --- | --- |
| PDF（默认） | 保留编辑器 PDF 预览中的排版，便于投递与打印 |
| Word（`.docx`） | 可继续编辑的文档，支持双栏模板的主栏与侧栏内容；装饰细节和分页可能与 PDF 不同 |
| Markdown（`.md`） | 保留标题、列表、强调和链接的文本内容 |
| JSON（`.json`） | 保存简历内容和设计设置，用于备份、迁移和重新导入 |

JSON 导入支持 Resumv 导出格式和 Reactive Resume v5 简历数据。导入时会清理不安全的 HTML、远程图片和自定义样式规则，并为不支持的字体使用本地替代字体。

项目还提供求职信编辑器、简历检查工具、职业建议和基于用户所填事实的简介草稿工具。简历检查支持读取 PDF、DOCX 和 TXT，在浏览器内提取文字；它不会将文件自动转换成 Builder 中可编辑的简历。求职信使用独立的打印与导出流程。

## 隐私与数据保存

生产构建包含 Google Analytics 4（`G-K9BQT3MPCN`），用于网站访问与使用情况统计；开发服务器不会加载。Google 可能接收页面地址、来源页面、设备与浏览器信息、交互事件，并使用统计 Cookie。本项目没有新增携带简历内容或表单值的自定义统计事件。自行部署时，请先移除或替换 `src/components/seo/Head.astro` 中的 Google 标签。

Resumv 不设置简历上传接口，不提供云端简历同步，也不接入外部 AI 服务处理简历内容。字体在项目中本地打包，不依赖运行时字体 CDN。

本地保存意味着你可以掌握数据，但也需要了解它的边界：

- 数据绑定当前浏览器、设备和站点地址，不会自动同步到其他设备或域名。
- 清除网站数据、重置浏览器或结束隐私浏览会话，可能导致简历丢失。请定期导出 JSON 备份。
- 浏览器本地存储不是加密保险箱。同一浏览器配置的使用者，以及拥有相应权限的扩展，可能访问这些数据。
- 在线访问仍会向网站托管服务请求网页和静态资源，托管服务可能记录 IP 等常规访问日志；这不等于上传简历内容。

页头和页脚通过 GitHub 公开接口获取 Star 数量和 `main` 分支最新提交，不携带凭据或来源页面地址，并在当前标签页缓存 15 分钟。页脚 hash 表示上游最新提交，不一定是当前部署版本。GitHub 会收到 IP 等常规连接信息，但不会收到简历内容。提交到 GitHub Issues 的反馈是公开的。

如果希望进一步掌控运行环境，可以在自己的电脑或可信的服务器上部署本项目。

## 本地运行

需要 **Node.js 22.12.0 或更高版本**及 **Bun**。获取本仓库代码后，在项目根目录执行：

```bash
bun install --frozen-lockfile
bun run dev -- --background
```

默认访问 [http://localhost:4321](http://localhost:4321)。

管理后台开发服务：

```bash
bun run astro dev status
bun run astro dev logs
bun run astro dev stop
```

运行检查和构建：

```bash
bun run typecheck
bun run test
bun run build
node tests/check-built-seo.mjs
```

构建产物位于 `dist/`，可使用 `bun run preview` 本地预览生产构建。

## 部署

可以将 `dist/` 部署到支持静态网站的托管服务，无需部署账户系统或数据库。

仓库包含 Cloudflare Workers 静态资源配置和 GitHub Actions 部署工作流：

1. 修改 `wrangler.jsonc` 中的 Worker 名称，使用自己的 Cloudflare 资源。
2. 在 GitHub Actions Secrets 中配置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`，不要把真实凭据写入仓库。
3. 面向 `main` 的 PR 会自动运行类型检查、测试、生产构建和静态页面检查。PR 检查不使用 Cloudflare 凭据，也不发布站点。
4. PR 合并到 `main` 后，会重新执行检查，并将通过验证的构建产物部署到 Cloudflare Workers。直接推送到 `main` 也会触发该流程，无需在提交信息中包含 `prod`。
5. 如果希望所有修改都经过审核，请在 GitHub 的 `main` 分支保护或规则集中，启用必须通过 PR 合并，并将 `Validate and build` 设为必需状态检查。Fork 后可按需要修改或删除部署工作流。

使用自己的域名时，还应更新 `astro.config.mjs` 的 `site`，以及源码中的 `https://resumv.com` 地址、站点地图、结构化数据和 GitHub 项目及反馈链接（包括 `src/components/GitHubLink.tsx` 中的 Star 数量接口地址）。

## 技术与目录

主要技术：Astro、React、TypeScript、React PDF、PDF.js、docx、DOMPurify。

```text
src/components/builder/      简历编辑器与 PDF 预览
src/lib/                     数据校验、本地存储、导入和导出
src/data/                    模板目录、职位模板数据与文章内容
src/pages/                   网站页面和静态路由
src/vendor/reactive-resume/  上游模板、数据结构和 PDF 渲染代码
public/templates/            模板预览图
public/licenses/             第三方许可声明
scripts/                     模板预览生成等辅助脚本
tests/                       数据、导出和静态页面检查
```

当前界面和默认字体主要面向英文及拉丁字母简历，尚未包含上游的多语言字体 CDN 回退能力。Reactive Resume v4 JSON 迁移也暂未支持。

## 许可证

Resumv 采用 [MIT License](LICENSE)，版权归 2026 liusha-com 和 Resumv 贡献者所有。第三方代码及素材保留各自的许可证和版权声明。

## 致谢与第三方许可

感谢 [Reactive Resume](https://github.com/reactive-resume/reactive-resume) 及其作者 **Amruth Pillai** 和所有贡献者。Resumv 的简历模板、PDF 渲染支持、数据结构及上游示例简历来自该项目，并在此基础上进行了本地适配和优化。本项目是独立适配项目，并非 Reactive Resume 官方版本。

- Reactive Resume 代码采用 **MIT License**，原版权声明保留于 [上游许可证](src/vendor/reactive-resume/LICENSE)。
- 所引用的上游版本记录在 [UPSTREAM_COMMIT](src/vendor/reactive-resume/UPSTREAM_COMMIT)。
- TikTok Sans 和 Lato 字体使用 **SIL Open Font License**，许可文件位于 [public/licenses](public/licenses/)。

分发本项目所包含的第三方代码或字体时，请保留对应的版权与许可声明。

## 参与贡献

欢迎通过 [GitHub Issues](https://github.com/liusha-com/resumv/issues) 提交问题反馈和 Pull Request，改进模板、编辑体验、导出质量、无障碍支持或文档。

反馈问题时请使用虚构简历或脱敏示例，不要在公开 Issue 中附上真实身份证件、联系方式、私人简历或 API 密钥。

安全漏洞请通过私密渠道报告，详见 [SECURITY.md](SECURITY.md)。
