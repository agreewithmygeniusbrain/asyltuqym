"use client";

import { useState } from "react";

import type { Locale } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DocumentFieldsProps = {
  locale: Locale;
};

export function DocumentFields({ locale }: DocumentFieldsProps) {
  const [hasDocuments, setHasDocuments] = useState("no");
  const isKk = locale === "kk";

  return (
    <div className="space-y-3 md:col-span-2">
      <Label>{isKk ? "Құжаттар" : "Документы"}</Label>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium">
          <input
            type="radio"
            name="hasDocuments"
            value="no"
            checked={hasDocuments === "no"}
            onChange={() => setHasDocuments("no")}
            className="size-4 accent-primary"
          />
          {isKk ? "Жоқ" : "Нет"}
        </label>
        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium">
          <input
            type="radio"
            name="hasDocuments"
            value="yes"
            checked={hasDocuments === "yes"}
            onChange={() => setHasDocuments("yes")}
            className="size-4 accent-primary"
          />
          {isKk ? "Бар" : "Есть"}
        </label>
      </div>

      {hasDocuments === "yes" ? (
        <div className="space-y-2">
          <Label htmlFor="documentFile">
            {isKk ? "Құжат файлы" : "Файл документа"}
          </Label>
          <Input
            id="documentFile"
            name="documentFile"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            required
          />
          <p className="text-xs text-muted-foreground">
            {isKk
              ? "PDF, JPG, PNG немесе WebP, 12 МБ дейін. Файлды тек админ көреді."
              : "PDF, JPG, PNG или WebP, до 12 МБ. Файл увидит только администратор."}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isKk
            ? "Лот карточкасында құжат жоқ деп көрсетіледі."
            : "В карточке лота будет указано, что документа нет."}
        </p>
      )}
    </div>
  );
}
