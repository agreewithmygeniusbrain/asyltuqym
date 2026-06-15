import { redirect } from "next/navigation";

import { ModerationQueue, PublishedListingsAdmin } from "@/components/moderation-queue";
import { getSession } from "@/lib/auth";
import { copy, isLocale } from "@/lib/i18n";
import { listModerationQueue, listPublicListings } from "@/lib/repository";
import type { Locale } from "@/lib/types";

type ModerationPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ModerationPage({ params, searchParams }: ModerationPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const query = searchParams ? await searchParams : {};
  const session = await getSession();

  if (session?.role !== "ADMIN") {
    redirect(`/${locale}/auth?next=admin`);
  }

  const [listings, publishedListings] = await Promise.all([
    listModerationQueue(),
    listPublicListings({ sort: "newest" }),
  ]);
  const notice = adminNotice(locale, query);

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          {copy[locale].adminPanel}
        </p>
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">
          {copy[locale].moderation}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {locale === "kk"
            ? "Лоттарды қарап, мақұлдаңыз, қайтарыңыз немесе қауіпті жарияланымдарды архивке жіберіңіз. Продавец верификациясы да осы жерден басқарылады."
            : "Проверяйте лоты, одобряйте, отклоняйте или архивируйте небезопасные публикации. Верификация продавцов управляется здесь же."}
        </p>
      </div>
      {notice ? (
        <div
          role="status"
          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium text-primary"
        >
          {notice}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <ModerationMetric
          label={locale === "kk" ? "Модерацияда" : "На модерации"}
          value={listings.length}
        />
        <ModerationMetric
          label={locale === "kk" ? "Жарияланған" : "Опубликовано"}
          value={publishedListings.length}
        />
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "kk" ? "Тексеру кезегі" : "Очередь проверки"}
          </p>
          <h2 className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
            {locale === "kk" ? "Модерациядағы лоттар" : "Лоты на модерации"}
          </h2>
        </div>
        <ModerationQueue locale={locale} listings={listings} />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "kk" ? "Ашық витрина" : "Открытая витрина"}
          </p>
          <h2 className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
            {locale === "kk" ? "Жарияланған лоттар" : "Опубликованные лоты"}
          </h2>
        </div>
        <PublishedListingsAdmin locale={locale} listings={publishedListings} />
      </section>
    </main>
  );
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function adminNotice(
  locale: Locale,
  query: Record<string, string | string[] | undefined>,
) {
  const isKk = locale === "kk";

  if (first(query.reviewed) === "1") {
    return isKk ? "Модерация шешімі сақталды." : "Решение модерации сохранено.";
  }

  if (first(query.returned) === "1") {
    return isKk
      ? "Лот жарияланғандардан модерацияға қайтарылды."
      : "Лот возвращен из опубликованных в модерацию.";
  }

  if (first(query.deleted) === "1") {
    return isKk ? "Лот жойылды." : "Лот удален.";
  }

  if (first(query.verified) === "1") {
    return isKk ? "Сатушы мәртебесі жаңартылды." : "Статус продавца обновлен.";
  }

  return null;
}

function ModerationMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card/95 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="font-heading text-3xl font-semibold text-primary">{value}</p>
    </div>
  );
}
