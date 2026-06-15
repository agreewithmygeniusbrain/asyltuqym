import { Search, SlidersHorizontal } from "lucide-react";

import { copy, sexLabels, speciesLabels } from "@/lib/i18n";
import type { ListingFilters, Locale, Sex, Species } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchFiltersProps = {
  locale: Locale;
  filters: ListingFilters;
  regions: string[];
};

const species: Species[] = ["CATTLE", "HORSE", "SHEEP", "GOAT", "CAMEL"];
const sexes: Sex[] = ["MALE", "FEMALE", "MIXED"];

export function SearchFilters({ locale, filters, regions }: SearchFiltersProps) {
  const t = copy[locale];

  return (
    <form
      action={`/${locale}/search`}
      className="gold-thread grid gap-3 border bg-card/95 p-3 shadow-sm sm:gap-4 sm:p-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
    >
      <div className="space-y-2">
        <Label htmlFor="q">{t.search}</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="q" name="q" defaultValue={filters.q} className="pl-9" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="species">{locale === "kk" ? "Мал түрі" : "Вид скота"}</Label>
        <select
          id="species"
          name="species"
          defaultValue={filters.species ?? ""}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">{t.allSpecies}</option>
          {species.map((item) => (
            <option key={item} value={item}>
              {speciesLabels[locale][item]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">{t.location}</Label>
        <select
          id="region"
          name="region"
          defaultValue={filters.region ?? ""}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">{t.allRegions}</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">{locale === "kk" ? "Сұрыптау" : "Сортировка"}</Label>
        <select
          id="sort"
          name="sort"
          defaultValue={filters.sort ?? "recommended"}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="recommended">{t.recommended}</option>
          <option value="newest">{t.newest}</option>
          <option value="price-asc">{t.priceAsc}</option>
          <option value="price-desc">{t.priceDesc}</option>
        </select>
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t.filters}
        </Button>
      </div>

      <details className="group lg:contents">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-t pt-3 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden lg:hidden">
          <span>{locale === "kk" ? "Қосымша сүзгілер" : "Дополнительные фильтры"}</span>
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </summary>
        <div className="hidden gap-3 border-t pt-3 group-open:grid sm:grid-cols-2 lg:col-span-5 lg:grid lg:grid-cols-6 lg:gap-4 lg:pt-4">
        <div className="space-y-2">
          <Label htmlFor="district">{locale === "kk" ? "Аудан" : "Район"}</Label>
          <Input id="district" name="district" defaultValue={filters.district} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPrice">{locale === "kk" ? "Мин. баға" : "Мин. цена"}</Label>
          <Input id="minPrice" name="minPrice" type="number" defaultValue={filters.minPrice} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice">{locale === "kk" ? "Макс. баға" : "Макс. цена"}</Label>
          <Input id="maxPrice" name="maxPrice" type="number" defaultValue={filters.maxPrice} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sex">{locale === "kk" ? "Жынысы" : "Пол"}</Label>
          <select
            id="sex"
            name="sex"
            defaultValue={filters.sex ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">{locale === "kk" ? "Барлығы" : "Любой"}</option>
            {sexes.map((item) => (
              <option key={item} value={item}>
                {sexLabels[locale][item]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pt-7 text-sm font-medium">
          <input
            type="checkbox"
            name="verified"
            defaultChecked={filters.verified}
            className="size-4 accent-primary"
          />
          {t.verified}
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm font-medium">
          <input
            type="checkbox"
            name="documents"
            defaultChecked={filters.documents}
            className="size-4 accent-primary"
          />
          {t.documents}
        </label>
        </div>
      </details>
    </form>
  );
}
