// src/lib/extensions/types.ts
var ExtensionError = class extends Error {
  constructor(code, httpStatus = 400) {
    super(code);
    this.code = code;
    this.httpStatus = httpStatus;
  }
};

// src/lib/extensions/validate.ts
var slug = /^[a-z][a-z0-9-]{0,63}$/;
function string(value, max) {
  if (typeof value !== "string" || !value.trim() || value.length > max || value.includes("\0"))
    throw new ExtensionError("Invalid package");
  return value;
}
function parseManifest(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new ExtensionError("Invalid package");
  const v = raw;
  const allowed = /* @__PURE__ */ new Set([
    "schemaVersion",
    "id",
    "name",
    "version",
    "title",
    "description",
    "publisher",
    "category",
    "skills",
    ...v.schemaVersion === 2 ? ["icon", "license", "source", "assets", "agents", "mcpServers", "hooks", "configuration", "dependencies"] : []
  ]);
  if (Object.keys(v).some((k) => !allowed.has(k)) || v.schemaVersion !== 1 && v.schemaVersion !== 2)
    throw new ExtensionError("Unsupported package format");
  const id = string(v.id, 130);
  const name = string(v.name, 64);
  if (id.split("/").length !== 2 || !id.split("/").every((p) => slug.test(p)) || !slug.test(name))
    throw new ExtensionError("Invalid package identity");
  const version = string(v.version, 64);
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version))
    throw new ExtensionError("Invalid package version");
  if (!["development", "data", "productivity"].includes(String(v.category)))
    throw new ExtensionError("Invalid package");
  if (!Array.isArray(v.skills) || v.schemaVersion === 1 && !v.skills.length || v.skills.length > 30)
    throw new ExtensionError("Invalid skills");
  const names = /* @__PURE__ */ new Set();
  const skills = v.skills.map((s) => {
    if (!s || typeof s !== "object" || Array.isArray(s))
      throw new ExtensionError("Invalid skills");
    const skill = s;
    if (Object.keys(skill).some(
      (k) => !["name", "description", "content"].includes(k)
    ))
      throw new ExtensionError("Unsupported package format");
    const skillName = string(skill.name, 64);
    if (!slug.test(skillName) || names.has(skillName))
      throw new ExtensionError("Invalid skills");
    names.add(skillName);
    const content = string(skill.content, 64e3);
    if (/^---\s*\r?\n/.test(content))
      throw new ExtensionError("Skill content must not contain frontmatter");
    return {
      name: skillName,
      description: string(skill.description, 1024),
      content
    };
  });
  return {
    schemaVersion: v.schemaVersion,
    id,
    name,
    version,
    title: string(v.title, 120),
    description: string(v.description, 2e3),
    publisher: string(v.publisher, 120),
    category: v.category,
    skills,
    ...v.schemaVersion === 2 ? parseComponents(v, name) : {}
  };
}
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ExtensionError("Invalid component");
  return value;
}
function list(value, max) {
  if (!Array.isArray(value) || value.length > max) throw new ExtensionError("Invalid component");
  return value;
}
function fields(value, keys) {
  if (Object.keys(value).some((k) => !keys.includes(k))) throw new ExtensionError("Unsupported component field");
}
function safeAssetPath(value) {
  const p = string(value, 240);
  if (!/^(skills\/[a-z][a-z0-9-]*\/(?:references|assets|scripts)\/|resources\/|templates\/|scripts\/)/.test(p) || p.includes("\\") || p.split("/").some((s) => !s || s === "." || s === ".." || /[<>:\"|?*\x00-\x1f]/.test(s) || /[ .]$/.test(s) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(s))) throw new ExtensionError("Invalid asset path");
  return p;
}
function parseComponents(v, pluginName) {
  const result = {};
  if (v.icon !== void 0) {
    const i = record(v.icon);
    fields(i, ["symbol", "color"]);
    if (!["code", "feedback", "data", "document", "skill"].includes(String(i.symbol)) || ![1, 2, 3, 4, 5].includes(i.color)) throw new ExtensionError("Invalid icon");
    result.icon = { symbol: i.symbol, color: i.color };
  }
  if (v.license !== void 0) result.license = string(v.license, 120);
  if (v.source !== void 0) {
    const u = new URL(string(v.source, 1e3));
    if (u.protocol !== "https:" || u.username || u.password) throw new ExtensionError("Invalid source");
    result.source = u.href;
  }
  if (v.assets !== void 0) {
    const seen = /* @__PURE__ */ new Set();
    let total = 0;
    result.assets = list(v.assets, 200).map((raw) => {
      const a = record(raw);
      fields(a, ["path", "content"]);
      const file = safeAssetPath(a.path), key = file.toLowerCase();
      if ([...seen].some((p) => p === key || p.startsWith(key + "/") || key.startsWith(p + "/"))) throw new ExtensionError("Duplicate asset path");
      seen.add(key);
      const content = string(a.content, 256e3);
      total += content.length;
      if (total > 15e5) throw new ExtensionError("Package is too large");
      return { path: file, content };
    });
  }
  if (v.agents !== void 0) {
    const seen = /* @__PURE__ */ new Set();
    result.agents = list(v.agents, 20).map((raw) => {
      const a = record(raw);
      fields(a, ["name", "description", "content"]);
      const name = string(a.name, 64);
      if (!slug.test(name) || seen.has(name)) throw new ExtensionError("Invalid agent");
      seen.add(name);
      return { name, description: string(a.description, 1024), content: string(a.content, 64e3) };
    });
  }
  if (v.configuration !== void 0) {
    const seen = /* @__PURE__ */ new Set();
    const prefix = "ONEVIUM_PLUGIN_" + pluginName.toUpperCase().replaceAll("-", "_") + "_";
    result.configuration = list(v.configuration, 20).map((raw) => {
      const c = record(raw);
      fields(c, ["key", "title", "secret", "required"]);
      const key = string(c.key, 160);
      if (!key.startsWith(prefix) || !/^[A-Z][A-Z0-9_]+$/.test(key) || seen.has(key) || typeof c.secret !== "boolean" || typeof c.required !== "boolean") throw new ExtensionError("Invalid configuration field");
      seen.add(key);
      return { key, title: string(c.title, 120), secret: c.secret, required: c.required };
    });
  }
  if (v.mcpServers !== void 0) {
    const servers = record(v.mcpServers);
    if (Object.keys(servers).length > 10) throw new ExtensionError("Too many MCP servers");
    result.mcpServers = {};
    for (const [name, raw] of Object.entries(servers)) {
      if (!slug.test(name)) throw new ExtensionError("Invalid MCP name");
      const m = record(raw);
      const strings = (value) => Object.fromEntries(Object.entries(record(value)).map(([k, v2]) => [string(k, 160), string(v2, 2e3)]));
      if (m.type === "http" || m.type === "sse") {
        fields(m, ["type", "url", "headers"]);
        const url = string(m.url, 2e3);
        const parsed = new URL(url);
        if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new ExtensionError("Invalid MCP URL");
        result.mcpServers[name] = { type: m.type, url, ...m.headers ? { headers: strings(m.headers) } : {} };
      } else {
        fields(m, ["command", "args", "env"]);
        result.mcpServers[name] = { command: string(m.command, 1e3), args: list(m.args, 100).map((a) => string(a, 2e3)), ...m.env ? { env: strings(m.env) } : {} };
      }
    }
  }
  if (v.hooks !== void 0) result.hooks = list(v.hooks, 20).map((raw) => {
    const h = record(raw);
    fields(h, ["event", "matcher", "command", "timeout"]);
    if (!["SessionStart", "PreToolUse", "PostToolUse", "Stop"].includes(String(h.event)) || !Number.isInteger(h.timeout) || Number(h.timeout) < 1 || Number(h.timeout) > 60) throw new ExtensionError("Invalid hook");
    return { event: h.event, command: string(h.command, 2e3), timeout: Number(h.timeout), ...h.matcher ? { matcher: string(h.matcher, 100) } : {} };
  });
  if (v.dependencies !== void 0) result.dependencies = list(v.dependencies, 20).map((raw) => {
    const d = record(raw);
    fields(d, ["id", "version"]);
    const id = string(d.id, 130), version = string(d.version, 64);
    if (!id.split("/").every((p) => slug.test(p)) || id.split("/").length !== 2 || !/^\d+\.\d+\.\d+$/.test(version)) throw new ExtensionError("Invalid dependency");
    return { id, version };
  });
  if (!(v.skills.length || result.agents?.length || result.assets?.length || Object.keys(result.mcpServers || {}).length || result.hooks?.length)) throw new ExtensionError("Empty plugin");
  if (result.dependencies?.some((d) => d.id === v.id) || new Set(result.dependencies?.map((d) => d.id)).size !== (result.dependencies?.length || 0)) throw new ExtensionError("Invalid dependency");
  return result;
}
function pluginExecutesCode(m) {
  return !!(m.hooks?.length || Object.keys(m.mcpServers || {}).length || m.assets?.some((a) => a.path.startsWith("scripts/") || a.path.includes("/scripts/")));
}
export {
  parseManifest,
  pluginExecutesCode,
  safeAssetPath
};
