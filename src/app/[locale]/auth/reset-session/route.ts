import { NextRequest, NextResponse } from "next/server";

import { clearSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale: rawLocale } = await context.params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";

  await clearSession();

  const url = new URL(`/${locale}/auth`, request.url);
  url.searchParams.set("error", "session");

  return NextResponse.redirect(url);
}
