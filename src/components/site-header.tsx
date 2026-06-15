import Link from "next/link";
import { Languages, LogOut, Search, ShieldCheck, Store, UserRound } from "lucide-react";

import { logoutAction } from "@/lib/actions";
import { copy } from "@/lib/i18n";
import type { Locale, SessionUser } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  locale: Locale;
  session: SessionUser | null;
};

export function SiteHeader({ locale, session }: SiteHeaderProps) {
  const t = copy[locale];
  const logout = logoutAction.bind(null, locale);
  const otherLocale = locale === "kk" ? "ru" : "kk";
  const mobileSearch = locale === "kk" ? "Іздеу" : "Поиск";
  const mobileSell = locale === "kk" ? "Сату" : "Продать";
  const mobileAdmin = locale === "kk" ? "Админ" : "Админ";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl">
      <div className="ornament-band h-1 bg-primary/10" />
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-none">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground gold-thread sm:size-10">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-heading text-lg font-semibold leading-6 text-primary sm:text-xl">
              {t.brand}
            </span>
            <span className="block truncate text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.18em]">
              {t.brandLatin}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/search`}>{t.search}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/sell`}>{t.sell}</Link>
          </Button>
          {session?.role === "ADMIN" ? (
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/admin/moderation`}>
                <ShieldCheck className="size-4" aria-hidden="true" />
                {t.moderation}
              </Link>
            </Button>
          ) : null}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0 md:gap-2">
          <Button variant="outline" size="sm" className="px-2 sm:px-2.5" asChild>
            <Link href={`/${otherLocale}`}>
              <Languages className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{otherLocale.toUpperCase()}</span>
            </Link>
          </Button>

          {session ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={
                    session.role === "ADMIN"
                      ? `/${locale}/admin/moderation`
                      : `/${locale}/profile`
                  }
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.profile}</span>
                </Link>
              </Button>
              <form action={logout}>
                <Button variant="ghost" size="icon" type="submit" aria-label={t.logout}>
                  <LogOut className="size-4" aria-hidden="true" />
                </Button>
              </form>
            </>
          ) : (
            <Button size="sm" className="px-2 sm:px-2.5" asChild>
              <Link href={`/${locale}/auth`}>
                <UserRound className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t.login}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
      <nav
        className={`mx-auto grid max-w-7xl gap-2 px-3 pb-3 sm:px-6 md:hidden ${
          session?.role === "ADMIN" ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <Button variant="outline" size="sm" className="min-w-0 overflow-hidden" asChild>
          <Link href={`/${locale}/search`}>
            <Search className="size-4" aria-hidden="true" />
            <span className="truncate">{mobileSearch}</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="min-w-0 overflow-hidden" asChild>
          <Link href={`/${locale}/sell`}>
            <Store className="size-4" aria-hidden="true" />
            <span className="truncate">{mobileSell}</span>
          </Link>
        </Button>
        {session?.role === "ADMIN" ? (
          <Button variant="outline" size="sm" className="min-w-0 overflow-hidden" asChild>
            <Link href={`/${locale}/admin/moderation`}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span className="truncate">{mobileAdmin}</span>
            </Link>
          </Button>
        ) : null}
      </nav>
      {session?.role === "ADMIN" ? (
        <div className="border-t bg-primary px-4 py-1 text-center text-xs font-medium text-primary-foreground">
          <Badge variant="secondary" className="mr-2 rounded-sm">
            ADMIN
          </Badge>
          {locale === "kk" ? "Модератор режимі қосулы" : "Режим модератора активен"}
        </div>
      ) : null}
    </header>
  );
}
