import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { parseDocumentRef } from "@/lib/documents";
import { getListing } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ listingId: string }> },
) {
  const session = await getSession();

  if (session?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { listingId } = await context.params;
  const listing = await getListing(listingId);
  const document = parseDocumentRef(listing?.documents);

  if (!listing || !document) {
    return new NextResponse("Document not found", { status: 404 });
  }

  const file =
    document.provider === "blob" && document.url
      ? await fetch(document.url).then(async (response) => {
          if (!response.ok) {
            throw new Error("BLOB_DOCUMENT_NOT_FOUND");
          }

          return Buffer.from(await response.arrayBuffer());
        })
      : await readFile(path.join(process.cwd(), "storage", "uploads", "documents", document.storageName));

  return new NextResponse(file, {
    headers: {
      "Content-Type": document.contentType,
      "Content-Disposition": `inline; filename="${document.originalName.replaceAll('"', "")}"`,
    },
  });
}
