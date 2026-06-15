import type { Locale } from "@/lib/types";

const documentPrefix = "asyl-doc:";

export type StoredDocument = {
  storageName: string;
  originalName: string;
  contentType: string;
  provider?: "local" | "blob";
  url?: string;
};

export function encodeDocumentRef(document: StoredDocument) {
  return [
    documentPrefix,
    encodeURIComponent(document.provider ?? "local"),
    encodeURIComponent(document.storageName),
    encodeURIComponent(document.originalName),
    encodeURIComponent(document.contentType),
    encodeURIComponent(document.url ?? ""),
  ].join("|");
}

export function parseDocumentRef(value?: string | null): StoredDocument | null {
  if (!value?.startsWith(documentPrefix)) {
    return null;
  }

  const [, first, second, third, fourth, fifth] = value.split("|");

  if (first !== "local" && first !== "blob") {
    if (!first || !second || !third) {
      return null;
    }

    return {
      provider: "local",
      storageName: decodeURIComponent(first),
      originalName: decodeURIComponent(second),
      contentType: decodeURIComponent(third),
    };
  }

  if (!second || !third || !fourth) {
    return null;
  }

  return {
    provider: decodeURIComponent(first) as "local" | "blob",
    storageName: decodeURIComponent(second),
    originalName: decodeURIComponent(third),
    contentType: decodeURIComponent(fourth),
    url: fifth ? decodeURIComponent(fifth) : undefined,
  };
}

export function hasListingDocument(value?: string | null) {
  return Boolean(value?.trim());
}

export function documentPresenceLabel(value: string | null | undefined, locale: Locale) {
  if (!hasListingDocument(value)) {
    return locale === "kk" ? "Құжат жоқ" : "Документа нет";
  }

  return locale === "kk" ? "Құжат бар" : "Документ есть";
}

export function documentAccessNote(locale: Locale) {
  return locale === "kk"
    ? "Құжат файлын тек модератор қарай алады."
    : "Файл документа доступен только администратору.";
}

export function documentDownloadPath(locale: Locale, listingId: string) {
  return `/${locale}/documents/${listingId}`;
}
