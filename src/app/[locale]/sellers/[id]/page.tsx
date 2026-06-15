import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import { ListingCard } from "@/components/listing-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copy, isLocale } from "@/lib/i18n";
import { getSeller, getSellerListings } from "@/lib/repository";
import type { Locale } from "@/lib/types";

type SellerPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function SellerPage({ params }: SellerPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const [seller, listings] = await Promise.all([getSeller(id), getSellerListings(id)]);

  if (!seller) {
    notFound();
  }

  const t = copy[locale];
  const whatsapp = seller.whatsapp?.replace(/[^\d]/g, "");

  return (
    <main>
      <section className="relative border-b bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-35">
          {seller.coverUrl ? (
            <Image src={seller.coverUrl} alt={seller.farmName} fill sizes="100vw" className="object-cover" />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-primary/78" />
        <div className="relative mx-auto grid max-w-7xl gap-5 px-3 py-7 sm:gap-6 sm:px-6 sm:py-10 lg:grid-cols-[1fr_auto] lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <Avatar className="size-20 border-4 border-accent bg-background sm:size-24">
              <AvatarImage src={seller.avatarUrl ?? undefined} alt={seller.displayName} />
              <AvatarFallback className="text-2xl text-primary">{seller.displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {seller.verified ? (
                  <Badge className="rounded-sm bg-accent text-accent-foreground">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    {t.verified}
                  </Badge>
                ) : null}
                <Badge variant="secondary" className="rounded-sm">
                  {seller.type === "FARM"
                    ? locale === "kk"
                      ? "Шаруа қожалығы"
                      : "Фермерское хозяйство"
                    : locale === "kk"
                      ? "Жеке сатушы"
                      : "Индивидуальный продавец"}
                </Badge>
              </div>
              <h1 className="break-words font-heading text-3xl font-semibold leading-tight sm:text-5xl">{seller.displayName}</h1>
              <p className="text-primary-foreground/80">{seller.farmName}</p>
              <p className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="size-4" aria-hidden="true" />
                {seller.region}, {seller.district}
                {seller.village ? `, ${seller.village}` : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-end lg:justify-end">
            {whatsapp ? (
              <Button variant="secondary" className="w-full sm:w-auto" asChild>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t.whatsapp}
                </a>
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="w-full border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto"
              asChild
            >
              <a href={`tel:${seller.publicPhone}`}>
                <Phone className="size-4" aria-hidden="true" />
                {seller.publicPhone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-3 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <aside className="border bg-card/95 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "kk" ? "Шаруашылық туралы" : "О продавце"}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {seller.bio || (locale === "kk" ? "Сатушы сипаттамасы әлі толтырылмаған." : "Описание продавца пока не заполнено.")}
          </p>
        </aside>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {locale === "kk" ? "Жарияланған лоттар" : "Опубликованные лоты"}
            </p>
            <h2 className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
              {locale === "kk" ? "Сатушы витринасы" : "Витрина продавца"}
            </h2>
          </div>
          {listings.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed bg-card/90 px-6 py-12 text-center text-muted-foreground">
              {locale === "kk" ? "Жарияланған лот жоқ." : "Опубликованных лотов нет."}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
