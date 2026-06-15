import "server-only";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { encodeDocumentRef } from "@/lib/documents";

const maxImageSize = 8 * 1024 * 1024;
const maxDocumentSize = 12 * 1024 * 1024;

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const documentExtensions: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function saveBlobFile(file: File, key: string, contentType: string) {
  const { put } = await import("@vercel/blob");
  const buffer = Buffer.from(await file.arrayBuffer());

  return put(key, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
}

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function uploadedFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter(isUploadedFile);
}

export async function saveImageFile(file: File, folder: "avatars" | "covers" | "listings") {
  const extension = imageExtensions[file.type];

  if (!extension) {
    throw new Error("UNSUPPORTED_IMAGE_TYPE");
  }

  if (file.size > maxImageSize) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const filename = `${Date.now()}-${randomUUID()}.${extension}`;

  if (blobEnabled()) {
    const blob = await saveBlobFile(file, `${folder}/${filename}`, file.type);
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const destination = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(destination, buffer);

  return `/uploads/${folder}/${filename}`;
}

export async function saveOptionalImage(
  file: FormDataEntryValue | null,
  folder: "avatars" | "covers" | "listings",
  fallback?: string | null,
) {
  if (!isUploadedFile(file)) {
    return fallback ?? null;
  }

  return saveImageFile(file, folder);
}

export async function saveImageFiles(files: File[], folder: "avatars" | "covers" | "listings") {
  return Promise.all(files.map((file) => saveImageFile(file, folder)));
}

export async function saveDocumentFile(file: File) {
  const extension = documentExtensions[file.type];

  if (!extension) {
    throw new Error("UNSUPPORTED_DOCUMENT_TYPE");
  }

  if (file.size > maxDocumentSize) {
    throw new Error("DOCUMENT_TOO_LARGE");
  }

  const storageName = `${Date.now()}-${randomUUID()}.${extension}`;

  if (blobEnabled()) {
    const blob = await saveBlobFile(file, `documents/${storageName}`, file.type);

    return encodeDocumentRef({
      provider: "blob",
      storageName,
      originalName: file.name || `document.${extension}`,
      contentType: file.type,
      url: blob.url,
    });
  }

  const uploadDir = path.join(process.cwd(), "storage", "uploads", "documents");
  await mkdir(uploadDir, { recursive: true });

  const destination = path.join(uploadDir, storageName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(destination, buffer);

  return encodeDocumentRef({
    provider: "local",
    storageName,
    originalName: file.name || `document.${extension}`,
    contentType: file.type,
  });
}
