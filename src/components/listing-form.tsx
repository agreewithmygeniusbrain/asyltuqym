import { UploadCloud } from "lucide-react";

import { createListingAction } from "@/lib/actions";
import { speciesLabels, sexLabels } from "@/lib/i18n";
import type { Locale, Sex, Species } from "@/lib/types";
import { DocumentFields } from "@/components/document-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ListingFormProps = {
  locale: Locale;
};

const species: Species[] = ["CATTLE", "HORSE", "SHEEP", "GOAT", "CAMEL"];
const sexes: Sex[] = ["MALE", "FEMALE", "MIXED"];

export function ListingForm({ locale }: ListingFormProps) {
  const action = createListingAction.bind(null, locale);
  const isKk = locale === "kk";

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle className="font-heading text-xl text-primary sm:text-2xl">
          {isKk ? "Лотты модерацияға жіберу" : "Отправить лот на модерацию"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isKk
            ? "Лот тек админ мақұлдағаннан кейін жалпы лентада пайда болады."
            : "Лот появится в общей ленте только после одобрения администратором."}
        </p>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <Field label={isKk ? "Лот атауы" : "Название лота"} name="title" placeholder={isKk ? "Әулиекөл тайыншалары" : "Аулиекольские телки"} />
          <Field label={isKk ? "Тұқым" : "Порода"} name="breed" placeholder={isKk ? "Абердин-ангус" : "Абердин-ангус"} />

          <div className="space-y-2">
            <Label htmlFor="species">{isKk ? "Мал түрі" : "Вид скота"}</Label>
            <select
              id="species"
              name="species"
              required
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {species.map((item) => (
                <option key={item} value={item}>
                  {speciesLabels[locale][item]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">{isKk ? "Жынысы" : "Пол"}</Label>
            <select
              id="sex"
              name="sex"
              required
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {sexes.map((item) => (
                <option key={item} value={item}>
                  {sexLabels[locale][item]}
                </option>
              ))}
            </select>
          </div>

          <Field label={isKk ? "Жасы, ай" : "Возраст, мес."} name="ageMonths" type="number" min="1" />
          <Field label={isKk ? "Салмағы, кг" : "Вес, кг"} name="weightKg" type="number" min="1" required={false} />
          <Field label={isKk ? "Баға, ₸" : "Цена, ₸"} name="priceKzt" type="number" min="1" />

          <label className="flex items-center gap-2 pt-8 text-sm font-medium">
            <input type="checkbox" name="negotiable" className="size-4 accent-primary" />
            {isKk ? "Саудаласуға болады" : "Возможен торг"}
          </label>

          <Field label={isKk ? "Өңір" : "Регион"} name="region" />
          <Field label={isKk ? "Аудан" : "Район"} name="district" />
          <Field label={isKk ? "Ауыл" : "Село"} name="village" required={false} />
          <DocumentFields locale={locale} />

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vaccinationNotes">{isKk ? "Вакцинация / ветеринарлық ескертпе" : "Вакцинация / ветеринарные заметки"}</Label>
            <Textarea id="vaccinationNotes" name="vaccinationNotes" rows={3} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">{isKk ? "Сипаттама" : "Описание"}</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder={
                isKk
                  ? "Қайда өсті, денсаулығы, мінезі, қарау және алып кету шарттары..."
                  : "Где выращен, здоровье, характер, условия осмотра и вывоза..."
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="photos">{isKk ? "Мал фотосуреттері" : "Фотографии скота"}</Label>
            <Input
              id="photos"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
            />
            <p className="text-xs text-muted-foreground">
              {isKk
                ? "Бірнеше фото таңдауға болады. JPG, PNG немесе WebP, әр файл 8 МБ дейін."
                : "Можно выбрать несколько фото. JPG, PNG или WebP, каждый файл до 8 МБ."}
            </p>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">
              <UploadCloud className="size-4" aria-hidden="true" />
              {isKk ? "Модерацияға жіберу" : "Отправить на модерацию"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  min,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        min={min}
        required={required}
      />
    </div>
  );
}
