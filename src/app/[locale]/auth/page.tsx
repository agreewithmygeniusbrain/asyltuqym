import { redirect } from "next/navigation";

import { AuthForms } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { getSeller } from "@/lib/repository";
import type { Locale } from "@/lib/types";

type AuthPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ params, searchParams }: AuthPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const [session, query] = await Promise.all([getSession(), searchParams]);

  if (session?.role === "ADMIN") {
    redirect(`/${locale}/admin/moderation`);
  }

  if (session?.sellerId) {
    const seller = await getSeller(session.sellerId);

    if (seller) {
      redirect(`/${locale}/profile`);
    }

    redirect(`/${locale}/auth/reset-session`);
  }

  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          {locale === "kk" ? "Сатушы кабинеті" : "Кабинет продавца"}
        </p>
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">
          {locale === "kk" ? "Кіру немесе тіркелу" : "Войти или зарегистрироваться"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "kk"
            ? "Сатып алушыларға тіркелу қажет емес. Аккаунт тек лот жариялайтын сатушыларға керек."
            : "Покупателям регистрация не нужна. Аккаунт требуется только продавцам, которые публикуют лоты."}
        </p>
      </div>
      <AuthForms locale={locale} error={error} />
    </main>
  );
}
