"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { copy } from "@/lib/i18n";
import type { Listing, Locale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";

type InfiniteFeedProps = {
  listings: Listing[];
  locale: Locale;
};

const pageSize = 4;

export function InfiniteFeed({ listings, locale }: InfiniteFeedProps) {
  const [visible, setVisible] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const t = copy[locale];

  const visibleListings = useMemo(() => listings.slice(0, visible), [listings, visible]);
  const hasMore = visible < listings.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible((current) => Math.min(current + pageSize, listings.length));
        }
      },
      {
        rootMargin: "320px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, listings.length]);

  if (!listings.length) {
    return (
      <div className="border border-dashed bg-card/80 px-6 py-12 text-center">
        <p className="font-medium text-muted-foreground">{t.noResults}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} locale={locale} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-2">
        {hasMore ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisible((current) => Math.min(current + pageSize, listings.length))}
          >
            {locale === "kk" ? "Тағы көрсету" : "Показать ещё"}
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {locale === "kk" ? "Лентаның соңы" : "Конец ленты"}
          </span>
        )}
      </div>
    </div>
  );
}
