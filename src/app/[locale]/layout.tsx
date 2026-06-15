import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return [{ locale: "kk" }, { locale: "ru" }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const session = await getSession();

  return (
    <div className="min-h-screen">
      <SiteHeader locale={locale as Locale} session={session} />
      {children}
    </div>
  );
}
