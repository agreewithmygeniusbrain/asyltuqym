import { InfiniteFeed } from "@/components/infinite-feed";
import { SearchFilters } from "@/components/search-filters";
import { copy, isLocale } from "@/lib/i18n";
import { listPublicListings, listRegions } from "@/lib/repository";
import type { ListingFilters, Locale, Sex, Species } from "@/lib/types";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const speciesValues: Species[] = ["CATTLE", "HORSE", "SHEEP", "GOAT", "CAMEL"];
const sexValues: Sex[] = ["MALE", "FEMALE", "MIXED"];
const sortValues = ["recommended", "newest", "price-asc", "price-desc"] as const;
type SortValue = (typeof sortValues)[number];

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const query = await searchParams;
  const filters = parseFilters(query);
  const [regions, listings] = await Promise.all([listRegions(), listPublicListings(filters)]);
  const t = copy[locale];

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{t.filters}</p>
        <h1 className="font-heading text-3xl font-semibold text-primary sm:text-4xl">{t.search}</h1>
      </div>
      <SearchFilters locale={locale} filters={filters} regions={regions} />
      <InfiniteFeed listings={listings} locale={locale} />
    </main>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | string[] | undefined) {
  const parsed = Number(first(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseFilters(query: Record<string, string | string[] | undefined>): ListingFilters {
  const species = first(query.species);
  const sex = first(query.sex);
  const sort = first(query.sort);

  return {
    q: first(query.q) || undefined,
    species: speciesValues.includes(species as Species) ? (species as Species) : undefined,
    region: first(query.region) || undefined,
    district: first(query.district) || undefined,
    minPrice: numberParam(query.minPrice),
    maxPrice: numberParam(query.maxPrice),
    minAge: numberParam(query.minAge),
    maxAge: numberParam(query.maxAge),
    sex: sexValues.includes(sex as Sex) ? (sex as Sex) : undefined,
    verified: first(query.verified) === "on",
    documents: first(query.documents) === "on",
    sort: sortValues.includes(sort as SortValue) ? (sort as SortValue) : "recommended",
  };
}
