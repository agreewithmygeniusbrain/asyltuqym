import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, Check, Download, ExternalLink, FileText, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";

import {
  deleteListingAction,
  moderateListingAction,
  returnListingToModerationAction,
  setSellerVerifiedAction,
} from "@/lib/actions";
import {
  documentDownloadPath,
  documentPresenceLabel,
  parseDocumentRef,
} from "@/lib/documents";
import { formatPrice, speciesLabels } from "@/lib/i18n";
import type { Listing, Locale } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const fallbackImage =
  "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80";

type ModerationQueueProps = {
  locale: Locale;
  listings: Listing[];
};

export function ModerationQueue({ locale, listings }: ModerationQueueProps) {
  const isKk = locale === "kk";

  if (!listings.length) {
    return (
      <div className="border border-dashed bg-card/90 px-6 py-12 text-center">
        <p className="font-medium text-muted-foreground">
          {isKk ? "Модерация кезегінде лот жоқ." : "В очереди модерации нет лотов."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <article key={listing.id} className="gold-thread grid gap-4 border bg-card/95 p-3 sm:p-4 lg:grid-cols-[220px_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
            <Image
              src={listing.photos[0]?.url || fallbackImage}
              alt={listing.photos[0]?.alt || listing.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge className="rounded-sm bg-primary text-primary-foreground">
                    {speciesLabels[locale][listing.species]}
                  </Badge>
                  <Badge variant="outline" className="rounded-sm">
                    {listing.region}
                  </Badge>
                  {listing.seller.verified ? (
                    <Badge variant="secondary" className="rounded-sm bg-accent text-accent-foreground">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      {isKk ? "Тексерілген" : "Проверен"}
                    </Badge>
                  ) : null}
                </div>
                <h2 className="break-words font-heading text-xl font-semibold text-primary sm:text-2xl">{listing.title}</h2>
                <p className="break-words text-sm text-muted-foreground">
                  {listing.seller.displayName} · {listing.district}
                </p>
              </div>
              <p className="text-xl font-bold">{formatPrice(listing.priceKzt, locale)}</p>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{listing.description}</p>

            <div className="grid gap-3 text-sm md:grid-cols-[1fr_1fr_auto]">
              <span>
                <strong>{isKk ? "Тұқым:" : "Порода:"}</strong> {listing.breed}
              </span>
              <span>
                <strong>{isKk ? "Құжат:" : "Документы:"}</strong>{" "}
                {documentPresenceLabel(listing.documents, locale)}
              </span>
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={`/${locale}/lots/${listing.id}`}>
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {isKk ? "Лотты ашу" : "Открыть лот"}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={`/${locale}/sellers/${listing.sellerId}`}>
                    {isKk ? "Сатушы" : "Продавец"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 rounded-md border bg-background/70 p-3 text-sm md:grid-cols-2">
              <DocumentValue
                icon={<FileText className="size-4" aria-hidden="true" />}
                label={isKk ? "Құжаттар" : "Документы"}
                value={listing.documents}
                locale={locale}
                listingId={listing.id}
              />
              <DocumentValue
                icon={<ShieldCheck className="size-4" aria-hidden="true" />}
                label={isKk ? "Ветеринарлық мәлімет" : "Ветеринарные данные"}
                value={listing.vaccinationNotes}
              />
            </div>

            <div className="grid gap-3 border-t pt-4 sm:flex sm:flex-wrap sm:items-start">
              <form
                action={moderateListingAction.bind(null, locale, listing.id, "REJECTED")}
                className="grid w-full gap-2 sm:min-w-72 sm:flex sm:flex-1"
              >
                <Textarea
                  name="reason"
                  rows={2}
                  placeholder={isKk ? "Қайтару себебі" : "Причина отклонения"}
                  className="min-h-10"
                />
                <Button type="submit" variant="outline" className="w-full sm:w-auto">
                  <X className="size-4" aria-hidden="true" />
                  {isKk ? "Қайтару" : "Отклонить"}
                </Button>
              </form>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href={`/${locale}/lots/${listing.id}`}>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {isKk ? "Толық көру" : "Подробнее"}
                </Link>
              </Button>
              <form action={moderateListingAction.bind(null, locale, listing.id, "APPROVED")}>
                <Button type="submit" className="w-full sm:w-auto">
                  <Check className="size-4" aria-hidden="true" />
                  {isKk ? "Мақұлдау" : "Одобрить"}
                </Button>
              </form>
              <form action={moderateListingAction.bind(null, locale, listing.id, "ARCHIVED")}>
                <Button type="submit" variant="outline" className="w-full sm:w-auto">
                  <Archive className="size-4" aria-hidden="true" />
                  {isKk ? "Архив" : "Архив"}
                </Button>
              </form>
              <form action={deleteListingAction.bind(null, locale, listing.id, "admin")}>
                <Button type="submit" variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="size-4" aria-hidden="true" />
                  {isKk ? "Жою" : "Удалить"}
                </Button>
              </form>
              <form action={setSellerVerifiedAction.bind(null, locale, listing.sellerId, !listing.seller.verified)}>
                <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  {listing.seller.verified
                    ? isKk
                      ? "Белгіні алу"
                      : "Снять знак"
                    : isKk
                      ? "Тексеру"
                      : "Верифицировать"}
                </Button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PublishedListingsAdmin({ locale, listings }: ModerationQueueProps) {
  const isKk = locale === "kk";

  if (!listings.length) {
    return (
      <div className="border border-dashed bg-card/90 px-6 py-10 text-center">
        <p className="font-medium text-muted-foreground">
          {isKk ? "Жарияланған лот жоқ." : "Опубликованных лотов нет."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {listings.map((listing) => (
        <article key={listing.id} className="gold-thread grid gap-4 border bg-card/95 p-3 sm:grid-cols-[140px_1fr] sm:p-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
            <Image
              src={listing.photos[0]?.url || fallbackImage}
              alt={listing.photos[0]?.alt || listing.title}
              fill
              sizes="140px"
              className="object-cover"
            />
          </div>
          <div className="space-y-3">
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Badge className="mb-2 rounded-sm bg-accent text-accent-foreground">
                  {isKk ? "Жарияланды" : "Опубликовано"}
                </Badge>
                <h3 className="break-words font-heading text-lg font-semibold text-primary sm:text-xl">{listing.title}</h3>
                <p className="break-words text-sm text-muted-foreground">
                  {listing.seller.displayName} · {listing.region}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(listing.priceKzt, locale)}</p>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <DocumentValue
                icon={<FileText className="size-4" aria-hidden="true" />}
                label={isKk ? "Құжаттар" : "Документы"}
                value={listing.documents}
                locale={locale}
                listingId={listing.id}
              />
              <DocumentValue
                icon={<ShieldCheck className="size-4" aria-hidden="true" />}
                label={isKk ? "Вет. мәлімет" : "Вет. данные"}
                value={listing.vaccinationNotes}
              />
            </div>

            <div className="grid gap-2 border-t pt-3 sm:flex sm:flex-wrap">
              <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                <Link href={`/${locale}/lots/${listing.id}`}>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {isKk ? "Ашу" : "Открыть"}
                </Link>
              </Button>
              <form action={returnListingToModerationAction.bind(null, locale, listing.id)}>
                <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-auto">
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {isKk ? "Модерацияға" : "В модерацию"}
                </Button>
              </form>
              <form action={deleteListingAction.bind(null, locale, listing.id, "admin")}>
                <Button type="submit" variant="destructive" size="sm" className="w-full sm:w-auto">
                  <Trash2 className="size-4" aria-hidden="true" />
                  {isKk ? "Жою" : "Удалить"}
                </Button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function DocumentValue({
  icon,
  label,
  value,
  locale,
  listingId,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
  locale?: Locale;
  listingId?: string;
}) {
  const document = parseDocumentRef(value);
  const downloadHref =
    locale && listingId && document ? documentDownloadPath(locale, listingId) : null;

  return (
    <div className="space-y-1">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        {icon}
        {label}
      </p>
      <p className="break-words text-muted-foreground">
        {locale ? documentPresenceLabel(value, locale) : value || "—"}
      </p>
      {downloadHref && locale ? (
        <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
          <a href={downloadHref} target="_blank" rel="noreferrer">
            <Download className="size-4" aria-hidden="true" />
            {locale === "kk" ? "Құжатты ашу" : "Открыть документ"}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
