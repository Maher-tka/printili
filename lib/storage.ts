import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type StoredObject = {
  key: string;
  url: string;
  absolutePath: string;
};

export type StorageProvider = {
  saveOriginalPhoto(input: {
    projectCode: string;
    fileName: string;
    contentType: string;
    buffer: Buffer;
  }): Promise<StoredObject>;
};

class LocalFileStorage implements StorageProvider {
  private readonly root = path.join(process.cwd(), ".local-storage", "uploads");

  async saveOriginalPhoto({
    projectCode,
    fileName,
    buffer
  }: {
    projectCode: string;
    fileName: string;
    contentType: string;
    buffer: Buffer;
  }) {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "photo";
    const objectName = `${randomUUID()}-${safeFileName}`;
    const key = path.join("projects", projectCode, objectName).replaceAll("\\", "/");
    const absolutePath = path.join(this.root, key);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);

    return {
      key,
      url: `local://${key}`,
      absolutePath
    };
  }
}

export function getStorageProvider(): StorageProvider {
  return new LocalFileStorage();
}
