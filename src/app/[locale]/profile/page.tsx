import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

import { ListingCard } from "@/components/listing-card";
import { ProfileForm } from "@/components/profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteListingAction } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { copy, isLocale } from "@/lib/i18n";
import { getSeller, getSellerListings } from "@/lib/repository";
import type { ListingStatus, Locale } from "@/lib/types";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const query = searchParams ? await searchParams : {};
  const session = await getSession();

  if (!session?.sellerId) {
    redirect(`/${locale}/auth`);
  }

  const [seller, listings] = await Promise.all([
    getSeller(session.sellerId),
    getSellerListings(session.sellerId, true),
  ]);

  if (!seller) {
    redirect(`/${locale}/auth/reset-session`);
  }

  const pendingCount = listings.filter((listing) => listing.status === "PENDING").length;
  const approvedCount = listings.filter((listing) => listing.status === "APPROVED").length;
  const notice = profileNotice(locale, query);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {copy[locale].sellerCabinet}
          </p>
          <h1 className="break-words font-heading text-3xl font-semibold text-primary sm:text-4xl">
            {seller.displayName}
          </h1>
        </div>
        <Button className="w-full sm:w-auto" asChild>
          <Link href={`/${locale}/sell`}>
            <Plus className="size-4" aria-hidden="true" />
            {copy[locale].sell}
          </Link>
        </Button>
      </div>

      {notice ? (
        <div
          role="status"
          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium text-primary"
        >
          {notice}
        </div>
      ) : null}

      <ProfileForm locale={locale} seller={seller} />

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "kk" ? "Лоттар" : "Лоты"}
          </p>
          <h2 className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
            {locale === "kk" ? "Менің жарияланымдарым" : "Мои публикации"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "kk"
              ? `Барлығы: ${listings.length}. Модерацияда: ${pendingCount}. Жарияланған: ${approvedCount}.`
              : `Всего: ${listings.length}. На модерации: ${pendingCount}. Опубликовано: ${approvedCount}.`}
          </p>
        </div>

        {listings.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.id} className="space-y-2">
                <StatusBadge locale={locale} status={listing.status} />
                <ListingCard listing={listing} locale={locale} compact />
                <div className="grid gap-2 sm:flex sm:flex-wrap">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                    <Link href={`/${locale}/lots/${listing.id}`}>
                      <ExternalLink className="size-4" aria-hidden="true" />
                      {locale === "kk" ? "Ашу" : "Открыть"}
                    </Link>
                  </Button>
                  <form action={deleteListingAction.bind(null, locale, listing.id, "profile")}>
                    <Button type="submit" variant="destructive" size="sm" className="w-full sm:w-auto">
                      <Trash2 className="size-4" aria-hidden="true" />
                      {locale === "kk" ? "Жою" : "Удалить"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed bg-card/90 px-6 py-12 text-center text-muted-foreground">
            {locale === "kk" ? "Әзірге лот жоқ." : "Пока нет лотов."}
          </div>
        )}
      </section>
    </main>
  );
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function profileNotice(
  locale: Locale,
  query: Record<string, string | string[] | undefined>,
) {
  const isKk = locale === "kk";

  if (first(query.submitted) === "1") {
    return isKk
      ? "Лот модерацияға жіберілді. Ол админ кезегінде бірден көрінуі керек."
      : "Лот отправлен на модерацию. В админской очереди он должен появиться сразу.";
  }

  if (first(query.deleted) === "1") {
    return isKk ? "Лот жойылды." : "Лот удален.";
  }

  if (first(query.saved) === "1") {
    return isKk ? "Профиль сақталды." : "Профиль сохранен.";
  }

  if (first(query.created) === "1") {
    return isKk ? "Профиль құрылды." : "Профиль создан.";
  }

  return null;
}

function StatusBadge({ locale, status }: { locale: Locale; status: ListingStatus }) {
  const t = copy[locale];
  const label =
    status === "PENDING"
      ? t.pending
      : status === "APPROVED"
        ? t.approved
        : status === "REJECTED"
          ? t.rejected
          : status === "SOLD"
            ? t.sold
            : status === "ARCHIVED"
              ? t.archived
              : "Draft";

  return (
    <Badge variant={status === "APPROVED" ? "default" : "outline"} className="rounded-sm">
      {label}
    </Badge>
  );
}
