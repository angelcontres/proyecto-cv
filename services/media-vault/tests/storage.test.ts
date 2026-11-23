import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "../src/index";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true }))
  );
  tempDirs.length = 0;
});

describe("Microservicio media-vault :: LocalStorageProvider", () => {
  it("almacena, lee, verifica existencia y elimina un archivo de forma segura", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-storage-"));
    tempDirs.push(dir);
    const provider = new LocalStorageProvider(dir);

    const content = Buffer.from("%PDF-1.7\ncontenido", "ascii");
    await provider.put("certifications/test-1.pdf", content);

    expect(await provider.exists("certifications/test-1.pdf")).toBe(true);
    const readBack = await provider.read("certifications/test-1.pdf");
    expect(readBack.equals(content)).toBe(true);

    await provider.remove("certifications/test-1.pdf");
    expect(await provider.exists("certifications/test-1.pdf")).toBe(false);
  });

  it("bloquea intentos de path traversal", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-storage-"));
    tempDirs.push(dir);
    const provider = new LocalStorageProvider(dir);

    await expect(provider.read("../secreto.txt")).rejects.toThrow();
    await expect(provider.put("C:/Windows/win.ini", Buffer.from("x"))).rejects.toThrow();
  });
});
