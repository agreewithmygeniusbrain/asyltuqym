import { loginAction, registerAction } from "@/lib/actions";
import type { Locale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormsProps = {
  locale: Locale;
  error?: string;
};

export function AuthForms({ locale, error }: AuthFormsProps) {
  const login = loginAction.bind(null, locale);
  const register = registerAction.bind(null, locale);
  const isKk = locale === "kk";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-primary sm:text-2xl">
            {isKk ? "Сатушы ретінде кіру" : "Вход продавца"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isKk
              ? "Демо сатушы: +77001112233 / demo123"
              : "Демо продавец: +77001112233 / demo123"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isKk ? "Админ: +77009998877 / admin123" : "Админ: +77009998877 / admin123"}
          </p>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <Field label={isKk ? "Телефон" : "Телефон"} name="phone" placeholder="+77001112233" />
            <Field
              label={isKk ? "Құпиясөз" : "Пароль"}
              name="password"
              type="password"
              placeholder="demo123"
            />
            {error ? <ErrorText locale={locale} error={error} /> : null}
            <Button type="submit" className="w-full">
              {isKk ? "Кіру" : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-primary sm:text-2xl">
            {isKk ? "Жаңа сатушы профилі" : "Новый профиль продавца"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isKk
              ? "Профиль ашылған соң лотты модерацияға жіберуге болады."
              : "После создания профиля можно отправлять лоты на модерацию."}
          </p>
        </CardHeader>
        <CardContent>
          <form action={register} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">{isKk ? "Сатушы түрі" : "Тип продавца"}</Label>
              <select
                id="type"
                name="type"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="FARM">{isKk ? "Шаруа қожалығы" : "КХ / фермерское хозяйство"}</option>
                <option value="INDIVIDUAL">{isKk ? "Жеке сатушы" : "Индивидуальный продавец"}</option>
              </select>
            </div>
            <Field label={isKk ? "Телефон" : "Телефон"} name="phone" placeholder="+7700..." />
            <Field
              label={isKk ? "Құпиясөз" : "Пароль"}
              name="password"
              type="password"
              placeholder={isKk ? "кемі 6 белгі" : "минимум 6 символов"}
            />
            <Field label={isKk ? "КХ атауы" : "Название КХ"} name="farmName" />
            <Field label={isKk ? "Ашық атау" : "Публичное имя"} name="displayName" />
            <Field label={isKk ? "Өңір" : "Регион"} name="region" />
            <Field label={isKk ? "Аудан" : "Район"} name="district" />
            <Field label={isKk ? "Ауыл" : "Село"} name="village" required={false} />
            <Field label="WhatsApp" name="whatsapp" required={false} placeholder="+7700..." />
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full">
                {isKk ? "Профиль ашу" : "Создать профиль"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}

function ErrorText({ locale, error }: { locale: Locale; error: string }) {
  const text =
    error === "session"
      ? locale === "kk"
        ? "Сессия ескірді. Қайта кіріңіз."
        : "Сессия устарела. Войдите заново."
      : error === "bad_credentials"
      ? locale === "kk"
        ? "Телефон немесе құпиясөз қате."
        : "Телефон или пароль неверны."
      : error === "exists"
        ? locale === "kk"
          ? "Бұл телефон тіркелген."
          : "Этот телефон уже зарегистрирован."
        : locale === "kk"
          ? "Өрістерді тексеріңіз."
          : "Проверьте заполнение полей.";

  return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">{text}</p>;
}
