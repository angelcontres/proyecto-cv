import { describe, expect, it } from "vitest";
import {
  canvasSchemaV1,
  createEmptyCanvasSchema,
  createStarterCanvasSchema,
  renderCvTemplate,
  type CvTemplateContext,
} from "../src/index";

const SAMPLE_CONTEXT: CvTemplateContext = {
  profile: {
    fullName: "Alex Rivera <Senior>",
    headline: "Full-Stack Engineer",
    bio: "Construyendo software robusto.",
    location: "CDMX",
    email: "alex@example.com",
    availability: "Disponible",
    social: { github: "https://github.com/alex" },
  },
  stats: {
    experiencesCount: 2,
    projectsCount: 2,
    skillsCount: 5,
    certificationsCount: 1,
  },
  experiences: [
    { company: "TechLab", role: "Lead Dev", period: "2024 - Actual", summary: "Next.js & PG" },
  ],
  projects: [
    { title: "CV Studio", summary: "Lienzo visual", tags: "Next.js, TS" },
    { title: "PDF Vault", summary: "Certificados", tags: "Docker, Postgres" },
  ],
  skills: [{ name: "TypeScript", category: "Frontend", level: 95 }],
  certifications: [
    { title: "AWS SAA", issuer: "AWS", category: "Cloud", issueDate: "2026-03-15" },
  ],
};

describe("Microservicio api-studio :: Motor de plantillas y CanvasSchemaV1", () => {
  it("interpola variables simples y loops #each escapando HTML", () => {
    const html = `
      <h1>{{cv.profile.fullName}}</h1>
      <span>{{cv.stats.projectsCount}} proyectos</span>
      <ul>{{#each cv.projects}}<li>{{title}} ({{tags}})</li>{{/each}}</ul>
    `;
    const rendered = renderCvTemplate(html, SAMPLE_CONTEXT);

    expect(rendered).toContain("Alex Rivera &lt;Senior&gt;");
    expect(rendered).toContain("2 proyectos");
    expect(rendered).toContain("<li>CV Studio (Next.js, TS)</li>");
    expect(rendered).toContain("<li>PDF Vault (Docker, Postgres)</li>");
  });

  it("elimina scripts, event handlers y bloquea prototype pollution", () => {
    const unsafe = `<div onclick="alert(1)">{{cv.profile.__proto__}}</div><script>steal()</script><a href="javascript:alert(1)">x</a>`;
    const rendered = renderCvTemplate(unsafe, SAMPLE_CONTEXT);

    expect(rendered).not.toContain("<script");
    expect(rendered).not.toContain("onclick");
    expect(rendered).not.toContain("javascript:");
  });

  it("valida esquemas de lienzo vacío, starter y nodos custom_code / widget_cert_spotlight", () => {
    expect(canvasSchemaV1.safeParse(createEmptyCanvasSchema()).success).toBe(true);
    const starter = createStarterCanvasSchema();
    expect(canvasSchemaV1.safeParse(starter).success).toBe(true);

    const withCode = {
      ...starter,
      nodes: [
        ...starter.nodes,
        {
          id: "code-1",
          type: "custom_code" as const,
          label: "Bloque Terminal",
          desktop: { x: 40, y: 40, w: 420, h: 160, zIndex: 5 },
          mobile: { order: 7, visible: true },
          style: {},
          props: { codeHtml: "<div>Hola</div>", codeCss: "div { color: var(--sun); }" },
        },
        {
          id: "spot-1",
          type: "widget_cert_spotlight" as const,
          label: "Certificado Destacado",
          desktop: { x: 40, y: 220, w: 360, h: 150, zIndex: 5 },
          mobile: { order: 8, visible: true },
          style: {},
          props: { certificationId: "cert-uuid-1" },
        },
      ],
    };
    expect(canvasSchemaV1.safeParse(withCode).success).toBe(true);
  });
});
