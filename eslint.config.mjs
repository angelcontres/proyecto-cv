import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "apps/web/.next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "**/node_modules/**",
      "next-env.d.ts",
      "apps/web/next-env.d.ts",
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      next: {
        rootDir: "apps/web/",
      },
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@cv/database", "@prisma/client", "**/services/**", "**/packages/**"],
              message:
                "El frontend y gateway en apps/web no deben acceder directo a base de datos ni rutas internas de servicios; usa únicamente las fachadas @cv/*.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@web/*", "**/apps/**", "**/services/*/src/**"],
              message:
                "Un microservicio lógico no puede importar internals de apps/web ni de otro servicio; comunica mediante paquetes @cv/*.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/*/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@cv/api-*", "@cv/media-vault", "@web/*", "**/services/**", "**/apps/**"],
              message:
                "Los paquetes compartidos en packages/* solo pueden depender hacia abajo, nunca hacia servicios o UI.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
