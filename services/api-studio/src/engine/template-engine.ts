export interface CvTemplateContext {
  profile: {
    fullName: string;
    headline: string;
    bio: string;
    location: string;
    email: string;
    availability: string;
    social: {
      linkedin?: string;
      github?: string;
      website?: string;
      x?: string;
    };
  };
  stats: {
    experiencesCount: number;
    projectsCount: number;
    skillsCount: number;
    certificationsCount: number;
  };
  experiences: Array<{
    company: string;
    role: string;
    period: string;
    summary: string;
  }>;
  projects: Array<{
    title: string;
    summary: string;
    tags: string;
    demoUrl?: string;
    repoUrl?: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
    level: number;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    category: string;
    issueDate: string;
    credentialId?: string;
    pdfUrl?: string;
  }>;
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function escapeHtml(value: unknown): string {
  const str = value == null ? "" : String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeCustomHtml(rawHtml: string): string {
  return String(rawHtml || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<(iframe|object|embed|base|meta)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|base|meta)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");
}

function resolvePath(root: unknown, rawPath: string): unknown {
  const parts = rawPath.trim().split(".");
  let current: unknown = root;

  for (const part of parts) {
    if (!part || FORBIDDEN_KEYS.has(part)) return undefined;
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function renderCvTemplate(rawHtml: string, context: CvTemplateContext): string {
  const sanitized = sanitizeCustomHtml(rawHtml);
  const scope = { cv: context };

  const withLoops = sanitized.replace(
    /\{\{#each\s+([a-zA-Z0-9_.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_match, collectionPath: string, innerTemplate: string) => {
      const target = resolvePath(scope, collectionPath);
      if (!Array.isArray(target)) return "";

      return target
        .map((item) =>
          innerTemplate.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_m, varPath: string) => {
            if (varPath === "this") return escapeHtml(item);
            if (varPath.startsWith("cv.")) return escapeHtml(resolvePath(scope, varPath));
            return escapeHtml(resolvePath(item, varPath));
          })
        )
        .join("");
    }
  );

  return withLoops.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_match, varPath: string) => {
    const val = resolvePath(scope, varPath);
    if (val === undefined || val === null || typeof val === "object") return "";
    return escapeHtml(val);
  });
}
