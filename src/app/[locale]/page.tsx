import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, MapPinned, Plus, Search } from "lucide-react";

import { InfiniteFeed } from "@/components/infinite-feed";
import { SearchFilters } from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { copy, isLocale } from "@/lib/i18n";
import { listPublicListings, listRegions } from "@/lib/repository";
import type { Locale } from "@/lib/types";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FeedPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const [listings, regions] = await Promise.all([listPublicListings(), listRegions()]);
  const t = copy[locale];
  const verifiedCount = new Set(
    listings.filter((listing) => listing.seller.verified).map((listing) => listing.sellerId),
  ).size;

  return (
    <main>
      <section className="border-b bg-primary text-primary-foreground">
        <div className="ornament-band h-5 opacity-60" />
        <div className="mx-auto grid max-w-7xl gap-5 px-3 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="min-w-0 space-y-5">
            <Badge className="rounded-sm bg-accent text-accent-foreground">
              {t.publicFeed}
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-full font-heading text-2xl font-semibold leading-tight [overflow-wrap:anywhere] sm:max-w-3xl sm:text-5xl">
                {t.feedTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-primary-foreground/82 [overflow-wrap:anywhere]">{t.feedLead}</p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button variant="secondary" className="w-full sm:w-auto" asChild>
                <Link href={`/${locale}/search`}>
                  <Search className="size-4" aria-hidden="true" />
                  {t.search}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto"
                asChild
              >
                <Link href={`/${locale}/sell`}>
                  <Plus className="size-4" aria-hidden="true" />
                  {t.sell}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Metric icon={<ArrowRight className="size-4" />} label={locale === "kk" ? "Лентадағы лот" : "Лотов в ленте"} value={String(listings.length)} />
            <Metric icon={<BadgeCheck className="size-4" />} label={locale === "kk" ? "Тексерілген сатушы" : "Проверенных продавцов"} value={String(verifiedCount)} />
            <Metric icon={<MapPinned className="size-4" />} label={locale === "kk" ? "Өңірлер" : "Регионов"} value={String(regions.length)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
        <SearchFilters locale={locale} regions={regions} filters={{ sort: "recommended" }} />
        <div className="grid gap-3 sm:flex sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {t.recommended}
            </p>
            <h2 className="font-heading text-3xl font-semibold text-primary">
              {locale === "kk" ? "Жаңа лоттар" : "Свежие лоты"}
            </h2>
          </div>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href={`/${locale}/search`}>{locale === "kk" ? "Барлығын көру" : "Смотреть все"}</Link>
          </Button>
        </div>
        <InfiniteFeed listings={listings} locale={locale} />
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="gold-thread border border-primary-foreground/12 bg-primary-foreground/8 p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2 text-primary-foreground/70">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="font-heading text-3xl font-semibold">{value}</p>
    </div>
  );
}
