import { ShieldCheck } from "lucide-react";

import { updateProfileAction } from "@/lib/actions";
import type { Locale, SellerProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormProps = {
  locale: Locale;
  seller: SellerProfile;
};

export function ProfileForm({ locale, seller }: ProfileFormProps) {
  const action = updateProfileAction.bind(null, locale);
  const isKk = locale === "kk";

  return (
    <Card className="bg-card/95">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="font-heading text-xl text-primary sm:text-2xl">
            {isKk ? "Профиль баптауы" : "Настройка профиля"}
          </CardTitle>
          {seller.verified ? (
            <Badge className="rounded-sm bg-accent text-accent-foreground">
              <ShieldCheck className="size-3" aria-hidden="true" />
              {isKk ? "Тексерілген сатушы" : "Проверенный продавец"}
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-sm">
              {isKk ? "Верификация күтілуде" : "Без верификации"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isKk
            ? "Бұл ақпарат сатушы бетінде және лот карточкаларында көрсетіледі."
            : "Эта информация показывается на странице продавца и в карточках лотов."}
        </p>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="currentAvatarUrl" value={seller.avatarUrl ?? ""} />
          <input type="hidden" name="currentCoverUrl" value={seller.coverUrl ?? ""} />
          <div className="space-y-2">
            <Label htmlFor="type">{isKk ? "Сатушы түрі" : "Тип продавца"}</Label>
            <select
              id="type"
              name="type"
              defaultValue={seller.type}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="FARM">{isKk ? "Шаруа қожалығы" : "КХ / фермерское хозяйство"}</option>
              <option value="INDIVIDUAL">{isKk ? "Жеке сатушы" : "Индивидуальный продавец"}</option>
            </select>
          </div>
          <Field label={isKk ? "КХ / сатушы атауы" : "Название КХ / продавца"} name="farmName" defaultValue={seller.farmName} />
          <Field label={isKk ? "Публичное имя" : "Публичное имя"} name="displayName" defaultValue={seller.displayName} />
          <Field label={isKk ? "Өңір" : "Регион"} name="region" defaultValue={seller.region} />
          <Field label={isKk ? "Аудан" : "Район"} name="district" defaultValue={seller.district} />
          <Field label={isKk ? "Ауыл" : "Село"} name="village" defaultValue={seller.village ?? ""} required={false} />
          <Field label={isKk ? "Ашық телефон" : "Публичный телефон"} name="publicPhone" defaultValue={seller.publicPhone} />
          <Field label="WhatsApp" name="whatsapp" defaultValue={seller.whatsapp ?? ""} required={false} />
          <FileField
            label={isKk ? "Аватар фотосы" : "Фото аватара"}
            name="avatarFile"
            current={seller.avatarUrl}
            hint={isKk ? "JPG, PNG немесе WebP, 8 МБ дейін" : "JPG, PNG или WebP, до 8 МБ"}
          />
          <FileField
            label={isKk ? "Мұқаба фотосы" : "Фото обложки"}
            name="coverFile"
            current={seller.coverUrl}
            hint={isKk ? "Профильдің кең фон суреті" : "Широкое фоновое фото профиля"}
          />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">{isKk ? "Шаруашылық туралы" : "О хозяйстве"}</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={seller.bio ?? ""}
              rows={5}
              placeholder={
                isKk
                  ? "Тұқым, жайылым, ветеринарлық бақылау және сату шарттары..."
                  : "Породы, пастбища, ветеринарный контроль и условия продажи..."
              }
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">{isKk ? "Сақтау" : "Сохранить"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function FileField({
  label,
  name,
  current,
  hint,
}: {
  label: string;
  name: string;
  current?: string | null;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
      <div className="space-y-1 text-xs text-muted-foreground">
        {hint ? <p>{hint}</p> : null}
        {current ? (
          <a href={current} target="_blank" rel="noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
            Текущее фото
          </a>
        ) : null}
      </div>
    </div>
  );
}
