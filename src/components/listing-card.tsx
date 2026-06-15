import Image from "next/image";
import Link from "next/link";
import { FileCheck, FileX, MapPin, MessageCircle, Phone, Scale, ShieldCheck } from "lucide-react";

import { documentPresenceLabel, hasListingDocument } from "@/lib/documents";
import { copy, formatAge, formatPrice, sexLabels, speciesLabels } from "@/lib/i18n";
import type { Listing, Locale } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ListingCardProps = {
  listing: Listing;
  locale: Locale;
  compact?: boolean;
};

export function ListingCard({ listing, locale, compact = false }: ListingCardProps) {
  const t = copy[locale];
  const image = listing.photos[0]?.url;
  const whatsapp = listing.seller.whatsapp?.replace(/[^\d]/g, "");
  const hasDocument = hasListingDocument(listing.documents);

  return (
    <Card className="group h-full overflow-hidden border-primary/10 bg-card/95 p-0 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg">
      <Link href={`/${locale}/lots/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={listing.photos[0]?.alt || listing.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="rounded-sm bg-primary text-primary-foreground">
              {speciesLabels[locale][listing.species]}
            </Badge>
            {listing.seller.verified ? (
              <Badge variant="secondary" className="rounded-sm bg-accent text-accent-foreground">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {t.verified}
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>

      <CardContent className="space-y-4 p-3 sm:p-4">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <Link href={`/${locale}/lots/${listing.id}`} className="min-w-0">
              <h3 className="line-clamp-2 break-words font-heading text-lg font-semibold leading-6 text-primary sm:text-xl sm:leading-7">
                {listing.title}
              </h3>
            </Link>
            <p className="text-lg font-bold text-foreground sm:shrink-0 sm:text-right">
              {formatPrice(listing.priceKzt, locale)}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {listing.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span>{listing.breed}</span>
          <span>{sexLabels[locale][listing.sex]}</span>
          <span>{formatAge(listing.ageMonths, locale)}</span>
          <span className="inline-flex items-center gap-1">
            <Scale className="size-3.5" aria-hidden="true" />
            {listing.weightKg ? `${listing.weightKg} кг` : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate">
            {listing.region}, {listing.district}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasDocument ? (
            <FileCheck className="size-4 shrink-0 text-accent" aria-hidden="true" />
          ) : (
            <FileX className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{documentPresenceLabel(listing.documents, locale)}</span>
        </div>

        {!compact ? (
          <div className="flex items-center gap-2 border-t pt-3">
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/${locale}/lots/${listing.id}`}>{t.details}</Link>
            </Button>
            {whatsapp ? (
              <Button size="icon" variant="outline" asChild aria-label={t.whatsapp}>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
            <Button size="icon" variant="outline" asChild aria-label={t.phone}>
              <a href={`tel:${listing.seller.publicPhone}`}>
                <Phone className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
