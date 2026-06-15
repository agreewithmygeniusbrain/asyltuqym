import { redirect } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type SellPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function SellPage({ params, searchParams }: SellPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const query = searchParams ? await searchParams : {};
  const error = first(query.error);
  const session = await getSession();

  if (!session?.sellerId) {
    redirect(`/${locale}/auth?next=sell`);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          {locale === "kk" ? "Жаңа лот" : "Новый лот"}
        </p>
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">
          {locale === "kk" ? "Мал сату" : "Выставить скот на продажу"}
        </h1>
      </div>
      {error ? <SellErrorNotice locale={locale} error={error} /> : null}
      <ListingForm locale={locale} />
    </main>
  );
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function SellErrorNotice({ locale, error }: { locale: Locale; error: string }) {
  const isKk = locale === "kk";
  const messages: Record<string, string> = {
    invalid: isKk
      ? "Міндетті өрістерді тексеріңіз: атауы, тұқымы, жасы, бағасы, өңірі, ауданы және сипаттамасы."
      : "Проверьте обязательные поля: название, порода, возраст, цена, регион, район и описание.",
    image: isKk
      ? "Фото JPG, PNG, WebP немесе GIF болуы керек, әр файл 8 МБ дейін."
      : "Фото должно быть JPG, PNG, WebP или GIF, каждый файл до 8 МБ.",
    document_required: isKk
      ? "Құжат бар деп белгіледіңіз. Құжат файлын тіркеңіз."
      : "Вы указали, что документы есть. Приложите файл документа.",
    document: isKk
      ? "Құжат PDF, JPG, PNG немесе WebP болуы керек, 12 МБ дейін."
      : "Документ должен быть PDF, JPG, PNG или WebP, до 12 МБ.",
    create: isKk
      ? "Лотты құру мүмкін болмады. Қайта кіріп, тағы бір рет көріңіз."
      : "Не удалось создать лот. Перезайдите в профиль и попробуйте еще раз.",
  };

  return (
    <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {messages[error] ?? messages.invalid}
    </div>
  );
}
