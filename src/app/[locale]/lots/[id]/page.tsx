import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileCheck, FileX, MessageCircle, Phone, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";

import { deleteListingAction, returnListingToModerationAction } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import {
  documentAccessNote,
  documentDownloadPath,
  documentPresenceLabel,
  hasListingDocument,
  parseDocumentRef,
} from "@/lib/documents";
import {
  copy,
  formatAge,
  formatPrice,
  isLocale,
  sexLabels,
  speciesLabels,
} from "@/lib/i18n";
import { getListing } from "@/lib/repository";
import type { Locale } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const fallbackImage =
  "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80";

type LotPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function LotPage({ params }: LotPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const [listing, session] = await Promise.all([getListing(id), getSession()]);

  if (!listing) {
    notFound();
  }

  const canSeePrivate =
    session?.role === "ADMIN" || (session?.sellerId && session.sellerId === listing.sellerId);

  if (listing.status !== "APPROVED" && !canSeePrivate) {
    notFound();
  }

  const t = copy[locale];
  const whatsapp = listing.seller.whatsapp?.replace(/[^\d]/g, "");
  const canManage = session?.role === "ADMIN" || session?.sellerId === listing.sellerId;

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-3 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
      <section className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden border bg-muted sm:aspect-[16/10]">
          <Image
            src={listing.photos[0]?.url || fallbackImage}
            alt={listing.photos[0]?.alt || listing.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority
            className="object-cover"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
            <Badge className="rounded-sm bg-primary text-primary-foreground">
              {speciesLabels[locale][listing.species]}
            </Badge>
            <Badge variant="secondary" className="rounded-sm bg-accent text-accent-foreground">
              {listing.status === "APPROVED" ? t.approved : t.pending}
            </Badge>
          </div>
        </div>

        {listing.photos.length > 1 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {listing.photos.slice(1).map((photo) => (
              <div key={photo.id} className="relative aspect-[4/3] overflow-hidden border bg-muted">
                <Image src={photo.url} alt={photo.alt || listing.title} fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="border bg-card/95 p-4 sm:p-5">
          <h1 className="break-words font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl">
            {listing.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{listing.description}</p>
          <Separator className="my-5" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Spec label={locale === "kk" ? "Тұқым" : "Порода"} value={listing.breed} />
            <Spec label={locale === "kk" ? "Жынысы" : "Пол"} value={sexLabels[locale][listing.sex]} />
            <Spec label={t.age} value={formatAge(listing.ageMonths, locale)} />
            <Spec label={t.weight} value={listing.weightKg ? `${listing.weightKg} кг` : "—"} />
            <Spec label={t.location} value={`${listing.region}, ${listing.district}`} />
            <DocumentSpec
              locale={locale}
              listingId={listing.id}
              documents={listing.documents}
              isAdmin={session?.role === "ADMIN"}
            />
          </div>
          {listing.vaccinationNotes ? (
            <div className="mt-5 border-l-4 border-accent bg-muted/60 p-4">
              <p className="text-sm font-semibold">{t.vaccination}</p>
              <p className="text-sm text-muted-foreground">{listing.vaccinationNotes}</p>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {canManage ? (
          <div className="border bg-card/95 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {session?.role === "ADMIN"
                ? locale === "kk"
                  ? "Админ әрекеттері"
                  : "Админ действия"
                : locale === "kk"
                  ? "Менің лотым"
                  : "Мой лот"}
            </p>
            <div className="mt-4 space-y-2">
              {session?.role === "ADMIN" && listing.status === "APPROVED" ? (
                <form action={returnListingToModerationAction.bind(null, locale, listing.id)}>
                  <Button type="submit" variant="secondary" className="w-full">
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {locale === "kk" ? "Модерацияға қайтару" : "Вернуть в модерацию"}
                  </Button>
                </form>
              ) : null}
              <form
                action={deleteListingAction.bind(
                  null,
                  locale,
                  listing.id,
                  session?.role === "ADMIN" ? "admin" : "profile",
                )}
              >
                <Button type="submit" variant="destructive" className="w-full">
                  <Trash2 className="size-4" aria-hidden="true" />
                  {locale === "kk" ? "Лотты жою" : "Удалить лот"}
                </Button>
              </form>
            </div>
          </div>
        ) : null}

        <div className="gold-thread border bg-card/95 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{t.price}</p>
          <p className="mt-2 break-words font-heading text-3xl font-semibold text-primary sm:text-4xl">
            {formatPrice(listing.priceKzt, locale)}
          </p>
          {listing.negotiable ? <p className="mt-1 text-sm text-muted-foreground">{t.negotiable}</p> : null}
          <Separator className="my-5" />
          <div className="space-y-3">
            {whatsapp ? (
              <Button className="w-full" asChild>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t.whatsapp}
                </a>
              </Button>
            ) : null}
            <Button variant="outline" className="w-full" asChild>
              <a href={`tel:${listing.seller.publicPhone}`}>
                <Phone className="size-4" aria-hidden="true" />
                {listing.seller.publicPhone}
              </a>
            </Button>
          </div>
        </div>

        <div className="border bg-card/95 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{t.seller}</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-primary">
            {listing.seller.displayName}
          </h2>
          <p className="text-sm text-muted-foreground">{listing.seller.farmName}</p>
          {listing.seller.verified ? (
            <Badge className="mt-3 rounded-sm bg-accent text-accent-foreground">
              <ShieldCheck className="size-3" aria-hidden="true" />
              {t.verified}
            </Badge>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{listing.seller.bio}</p>
          <Button variant="secondary" className="mt-4 w-full" asChild>
            <Link href={`/${locale}/sellers/${listing.sellerId}`}>
              {locale === "kk" ? "Сатушы беті" : "Страница продавца"}
            </Link>
          </Button>
        </div>
      </aside>
    </main>
  );
}

function DocumentSpec({
  locale,
  listingId,
  documents,
  isAdmin,
}: {
  locale: Locale;
  listingId: string;
  documents?: string | null;
  isAdmin: boolean;
}) {
  const document = parseDocumentRef(documents);
  const hasDocument = hasListingDocument(documents);

  return (
    <div className="border bg-background/70 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {hasDocument ? (
          <FileCheck className="size-4 text-accent" aria-hidden="true" />
        ) : (
          <FileX className="size-4" aria-hidden="true" />
        )}
        {locale === "kk" ? "Құжаттар" : "Документы"}
      </p>
      <p className="mt-1 font-medium">{documentPresenceLabel(documents, locale)}</p>
      {hasDocument ? (
        <p className="mt-1 text-xs text-muted-foreground">{documentAccessNote(locale)}</p>
      ) : null}
      {isAdmin && document ? (
        <Button variant="outline" size="sm" className="mt-3 w-full sm:w-auto" asChild>
          <a href={documentDownloadPath(locale, listingId)} target="_blank" rel="noreferrer">
            <Download className="size-4" aria-hidden="true" />
            {locale === "kk" ? "Құжатты ашу" : "Открыть документ"}
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-background/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
