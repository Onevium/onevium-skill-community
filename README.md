# Onevium Skill Community

Onevium 的插件与技能分发目录。客户端将选定版本下载到本地，并按个人或项目范围启用。此仓库不收集会话、项目文件或客户数据。

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
