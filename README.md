# Onevium Skill Community

Onevium 的插件与技能分发目录。客户端将选定版本下载到本地，并按个人或项目范围启用。此仓库不收集会话、项目文件或客户数据。

## 每日复盘 / Daily review

官方包 [`onevium/daily-review`](packages/onevium--daily-review.json) 先从少量近期会话和明确反馈了解你的写作偏好，再整理简短日报、保留来源并把经验沉淀到资料空间。需要 Onevium 1.3.3 的资料空间工具，在扩展中心安装并按个人或项目范围启用。

可以这样开始：“创建一个工作复盘资料空间。先看看我近期在这个项目中的沟通习惯，再把今天的工作整理成适合我的简短日报，保存到资料空间，并记录有依据的经验教训。”

需要自动执行时再提出：“每天上午 9 点帮我复盘昨天的工作，保存到这个资料空间。”首次设置会核对范围、运行项目、模型和权限。安装本包不会自动创建定时任务；定时执行依赖运行 Onevium 的设备。日报、偏好和经验保存在使用者自己的资料空间。

The official **Daily review** package adapts to your language and writing preferences from a small sample of relevant conversations, then saves concise work recaps and sourced lessons in Onevium Space. Start with: “Create a Work Review Space collection. Learn my communication preferences from recent conversations in this project, then save today's concise review and supported lessons to Onevium Space.” Ask for a daily schedule separately. Requires Onevium 1.3.3 Space tools; scheduled runs depend on the app running. This package's original content is MIT licensed; other packages retain their own licensing terms.

## 发布新技能

1. 在 `packages/<publisher>--<name>.json` 添加提交文件，包含 `manifest`、`releaseNotes`、`publishedAt`。
2. `manifest.skills` 中填写技能名称、描述和完整指令；schemaVersion 2 可附带文本资源、子代理、MCP、hooks 与配置声明。
3. 执行 `npm run build`，把提交文件与生成的 `catalog/` 一起提交 PR。
4. 维护者审查内容、来源、权限、测试和版本；合并后客户端的更新检查会读取新的目录。
5. 修改已发布内容必须提升版本号。更新会显示提示，由用户手动执行；不会替换正在运行任务的文件。

仅在 GitHub 修改 `packages/` 也可以：合并到主分支后，发布工作流会生成并提交最新目录。发布成功以工作流通过且 `catalog/index.json` 已更新为准。

目录地址：`https://raw.githubusercontent.com/Onevium/onevium-skill-community/main/catalog/index.json`

## 社区提交

通过 Pull Request 提交；自动校验不等于内容审核。`onevium/` 是官方发布命名空间，社区作者请使用自己的稳定发布者名称。不要提交密码、访问令牌、个人数据或无权分发的第三方内容。连接凭证应声明为客户端本地配置，不能写入包文件。

首批内容为 Onevium 自行编写的工作流。仓库尚未指定通用开源许可证；第三方提交须明确内容来源及分发授权。这里的公开可读不代表授予未注明的商用或再分发权利。

## 版本与兼容性

目录结构 schemaVersion 1；单个包支持 schemaVersion 1 和 2。每个版本具有 SHA-256 内容摘要，用于验证下载和保持版本不可变；摘要本身不证明作者身份。HTTPS GitHub 仓库、维护者审核和固定源构成当前信任边界。

客户端无需登录 GitHub 即可读取公开目录。离线继续使用已安装版本。客户端自动检查有缓存，手动刷新可立即检查；GitHub CDN 可能有短暂缓存延迟。
