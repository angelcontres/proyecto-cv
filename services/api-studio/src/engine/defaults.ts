import type { CanvasSchemaV1 } from "../schemas/canvas.schema";

export function createEmptyCanvasSchema(): CanvasSchemaV1 {
  return {
    version: 1,
    canvasSettings: {
      desktopWidth: 1200,
      minHeight: 1400,
      gridSize: 8,
      snapToGrid: true,
    },
    nodes: [],
  };
}

export function createStarterCanvasSchema(): CanvasSchemaV1 {
  return {
    version: 1,
    canvasSettings: {
      desktopWidth: 1200,
      minHeight: 1600,
      gridSize: 8,
      snapToGrid: true,
    },
    nodes: [
      {
        id: "widget-controls-1",
        type: "widget_controls",
        label: "Controles (Idioma / Tema / PDF)",
        desktop: { x: 48, y: 24, w: 1104, h: 64, zIndex: 10 },
        mobile: { order: 0, visible: true },
        style: { borderRadius: 16, padding: 12, shadow: "sm", animation: "fade-in" },
        props: { showThemeToggle: true, showLocaleToggle: true, showExportPdf: true },
      },
      {
        id: "widget-hero-1",
        type: "widget_hero",
        label: "Hero Profesional",
        desktop: { x: 48, y: 108, w: 1104, h: 280, zIndex: 1 },
        mobile: { order: 1, visible: true },
        style: { borderRadius: 20, padding: 28, shadow: "md", animation: "fade-up" },
        props: { showAvailabilityBadge: true, showSocialLinks: true },
      },
      {
        id: "widget-timeline-1",
        type: "widget_timeline",
        label: "Línea de Tiempo (Experiencia y Educación)",
        desktop: { x: 48, y: 416, w: 720, h: 460, zIndex: 1 },
        mobile: { order: 2, visible: true },
        style: { borderRadius: 20, padding: 24, shadow: "sm", animation: "fade-up" },
        props: { includeExperience: true, includeEducation: true },
      },
      {
        id: "widget-skills-1",
        type: "widget_skills",
        label: "Matriz de Habilidades",
        desktop: { x: 792, y: 416, w: 360, h: 460, zIndex: 1 },
        mobile: { order: 3, visible: true },
        style: { borderRadius: 20, padding: 24, shadow: "sm", animation: "fade-up" },
        props: { enableCategoryFilter: true },
      },
      {
        id: "widget-projects-1",
        type: "widget_projects",
        label: "Portafolio de Proyectos",
        desktop: { x: 48, y: 904, w: 1104, h: 360, zIndex: 1 },
        mobile: { order: 4, visible: true },
        style: { borderRadius: 20, padding: 24, shadow: "sm", animation: "fade-up" },
        props: { enableTagFilter: true },
      },
      {
        id: "widget-certs-1",
        type: "widget_certifications",
        label: "Certificaciones (Visor PDF)",
        desktop: { x: 48, y: 1292, w: 1104, h: 320, zIndex: 1 },
        mobile: { order: 5, visible: true },
        style: { borderRadius: 20, padding: 24, shadow: "sm", animation: "fade-up" },
        props: { enableCategoryFilter: true },
      },
      {
        id: "widget-contact-1",
        type: "widget_contact",
        label: "Formulario de Contacto",
        desktop: { x: 48, y: 1640, w: 1104, h: 340, zIndex: 1 },
        mobile: { order: 6, visible: true },
        style: { borderRadius: 20, padding: 28, shadow: "md", animation: "fade-up" },
        props: {},
      },
    ],
  };
}
