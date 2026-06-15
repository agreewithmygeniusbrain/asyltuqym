import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { compare, hash } from "bcryptjs";

import { demoListings, demoSellers, demoUsers, type DemoUser } from "@/lib/demo-data";
import type {
  Listing,
  ListingFilters,
  ListingPhoto,
  ListingStatus,
  SellerProfile,
  SellerType,
  SessionUser,
  Sex,
  Species,
} from "@/lib/types";

type Store = {
  users: DemoUser[];
  sellers: SellerProfile[];
  listings: Listing[];
  sequence: number;
};

type PrismaLike = import("@/generated/prisma/client").PrismaClient;

const globalForAsyl = globalThis as typeof globalThis & {
  __asylStore?: Store;
  __asylPrisma?: PrismaLike;
};

const demoStorePath = path.join(process.cwd(), "storage", "demo-store.json");

const defaultImages: Record<Species, string> = {
  CATTLE:
    "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80",
  HORSE:
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
  SHEEP:
    "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1200&q=80",
  GOAT:
    "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80",
  CAMEL:
    "https://images.unsplash.com/photo-1489161587020-79aa193f04ff?auto=format&fit=crop&w=1200&q=80",
};

function databaseEnabled() {
  return process.env.ASYL_USE_DATABASE === "true";
}

function canPersistDemoStore() {
  return process.env.VERCEL !== "1";
}

async function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when ASYL_USE_DATABASE=true");
  }

  if (!globalForAsyl.__asylPrisma) {
    const [{ PrismaClient }, { PrismaPg }] = await Promise.all([
      import("@/generated/prisma/client"),
      import("@prisma/adapter-pg"),
    ]);

    globalForAsyl.__asylPrisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  return globalForAsyl.__asylPrisma;
}

async function withDatabase<T>(callback: (prisma: PrismaLike) => Promise<T>, fallback: () => T | Promise<T>) {
  if (!databaseEnabled()) {
    return fallback();
  }

  try {
    return await callback(await getPrisma());
  } catch (error) {
    console.error("Database unavailable while ASYL_USE_DATABASE=true.", error);
    throw error;
  }
}

function createSeedStore(): Store {
  const sellers = demoSellers.map((seller) => ({ ...seller }));
  const byId = new Map(sellers.map((seller) => [seller.id, seller]));

  return {
    users: demoUsers.map((user) => ({ ...user })),
    sellers,
    listings: demoListings.map((listing) => ({
      ...listing,
      seller: byId.get(listing.sellerId) ?? listing.seller,
      photos: listing.photos.map((photo) => ({ ...photo })),
    })),
    sequence: 100,
  };
}

function reviveSeller(seller: SellerProfile): SellerProfile {
  return {
    ...seller,
    createdAt: new Date(seller.createdAt),
    updatedAt: new Date(seller.updatedAt),
  };
}

function reviveStore(value: Store): Store {
  const sellers = value.sellers.map(reviveSeller);
  const byId = new Map(sellers.map((seller) => [seller.id, seller]));

  return {
    users: value.users,
    sellers,
    listings: value.listings.map((listing) => ({
      ...listing,
      createdAt: new Date(listing.createdAt),
      updatedAt: new Date(listing.updatedAt),
      approvedAt: listing.approvedAt ? new Date(listing.approvedAt) : null,
      seller: byId.get(listing.sellerId) ?? reviveSeller(listing.seller),
      photos: listing.photos.map((photo) => ({ ...photo })),
    })),
    sequence: value.sequence,
  };
}

function readStoreFromDisk() {
  if (!canPersistDemoStore()) {
    return null;
  }

  if (!existsSync(demoStorePath)) {
    return null;
  }

  try {
    return reviveStore(JSON.parse(readFileSync(demoStorePath, "utf8")) as Store);
  } catch (error) {
    console.error("Failed to read demo store, using seed data instead.", error);
    return null;
  }
}

function persistStore(data: Store) {
  if (!canPersistDemoStore()) {
    return;
  }

  mkdirSync(path.dirname(demoStorePath), { recursive: true });
  writeFileSync(demoStorePath, JSON.stringify(data, null, 2), "utf8");
}

function createStore(): Store {
  const persisted = readStoreFromDisk();

  if (persisted) {
    return persisted;
  }

  const seeded = createSeedStore();
  persistStore(seeded);
  return seeded;
}

function store() {
  noStore();

  const persisted = readStoreFromDisk();

  if (persisted) {
    globalForAsyl.__asylStore = persisted;
    return persisted;
  }

  if (!globalForAsyl.__asylStore) {
    globalForAsyl.__asylStore = createStore();
  }

  persistStore(globalForAsyl.__asylStore);
  return globalForAsyl.__asylStore;
}

function normalizePhone(phone: string) {
  const trimmed = phone.replace(/[^\d+]/g, "");

  if (trimmed.startsWith("8") && trimmed.length === 11) {
    return `+7${trimmed.slice(1)}`;
  }

  if (trimmed.startsWith("7") && trimmed.length === 11) {
    return `+${trimmed}`;
  }

  return trimmed;
}

function mapListing(row: unknown): Listing {
  const listing = row as Listing & {
    approvedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    photos?: ListingPhoto[];
  };

  return {
    ...listing,
    createdAt: new Date(listing.createdAt),
    updatedAt: new Date(listing.updatedAt),
    approvedAt: listing.approvedAt ? new Date(listing.approvedAt) : null,
    seller: listing.seller,
    photos: [...(listing.photos ?? [])].sort((a, b) => a.position - b.position),
  };
}

function attachSeller(listing: Listing, sellers: SellerProfile[]) {
  return {
    ...listing,
    seller: sellers.find((seller) => seller.id === listing.sellerId) ?? listing.seller,
  };
}

function applyFilters(listings: Listing[], filters: ListingFilters) {
  const query = filters.q?.trim().toLowerCase();

  return listings.filter((listing) => {
    const hasDocuments = Boolean(listing.documents?.trim());
    const haystack = [
      listing.title,
      listing.breed,
      listing.description,
      listing.region,
      listing.district,
      listing.village,
      listing.seller.displayName,
      listing.seller.farmName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (!filters.species || listing.species === filters.species) &&
      (!filters.sex || listing.sex === filters.sex) &&
      (!filters.region || listing.region === filters.region) &&
      (!filters.district || listing.district.toLowerCase().includes(filters.district.toLowerCase())) &&
      (!filters.minPrice || listing.priceKzt >= filters.minPrice) &&
      (!filters.maxPrice || listing.priceKzt <= filters.maxPrice) &&
      (!filters.minAge || listing.ageMonths >= filters.minAge) &&
      (!filters.maxAge || listing.ageMonths <= filters.maxAge) &&
      (!filters.verified || listing.seller.verified) &&
      (!filters.documents || hasDocuments)
    );
  });
}

function diversifyBySeller(listings: Listing[]) {
  const groups = new Map<string, Listing[]>();

  for (const listing of listings) {
    const bucket = groups.get(listing.sellerId) ?? [];
    bucket.push(listing);
    groups.set(listing.sellerId, bucket);
  }

  const diversified: Listing[] = [];

  while ([...groups.values()].some((bucket) => bucket.length > 0)) {
    for (const bucket of groups.values()) {
      const next = bucket.shift();

      if (next) {
        diversified.push(next);
      }
    }
  }

  return diversified;
}

function sortListings(listings: Listing[], sort: ListingFilters["sort"]) {
  const sorted = [...listings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (sort === "price-asc") {
    return sorted.sort((a, b) => a.priceKzt - b.priceKzt);
  }

  if (sort === "price-desc") {
    return sorted.sort((a, b) => b.priceKzt - a.priceKzt);
  }

  if (sort === "newest") {
    return sorted;
  }

  return diversifyBySeller(sorted);
}

export async function listPublicListings(filters: ListingFilters = {}) {
  return withDatabase(
    async (prisma) => {
      const where: Record<string, unknown> = {
        status: "APPROVED",
      };

      if (filters.species) where.species = filters.species;
      if (filters.sex) where.sex = filters.sex;
      if (filters.region) where.region = filters.region;

      const rows = await prisma.listing.findMany({
        where,
        include: {
          seller: true,
          photos: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return sortListings(applyFilters(rows.map(mapListing), filters), filters.sort);
    },
    () => {
      const data = store();
      const approved = data.listings
        .map((listing) => attachSeller(listing, data.sellers))
        .filter((listing) => listing.status === "APPROVED");

      return sortListings(applyFilters(approved, filters), filters.sort);
    },
  );
}

export async function listModerationQueue() {
  return withDatabase(
    async (prisma) => {
      const rows = await prisma.listing.findMany({
        where: {
          status: "PENDING",
        },
        include: {
          seller: true,
          photos: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return rows.map(mapListing);
    },
    () => {
      const data = store();

      return data.listings
        .map((listing) => attachSeller(listing, data.sellers))
        .filter((listing) => listing.status === "PENDING")
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
  );
}

export async function listRegions() {
  return withDatabase(
    async (prisma) => {
      const rows = await prisma.listing.findMany({
        select: {
          region: true,
        },
        distinct: ["region"],
        orderBy: {
          region: "asc",
        },
      });

      return rows.map((row) => row.region);
    },
    () => [...new Set(store().listings.map((listing) => listing.region))].sort(),
  );
}

export async function getListing(id: string) {
  return withDatabase(
    async (prisma) => {
      const row = await prisma.listing.findUnique({
        where: {
          id,
        },
        include: {
          seller: true,
          photos: true,
        },
      });

      return row ? mapListing(row) : null;
    },
    () => {
      const data = store();
      const listing = data.listings.find((item) => item.id === id);

      return listing ? attachSeller(listing, data.sellers) : null;
    },
  );
}

export async function getSeller(id: string) {
  return withDatabase(
    async (prisma) => prisma.sellerProfile.findUnique({ where: { id } }),
    () => store().sellers.find((seller) => seller.id === id) ?? null,
  );
}

export async function getSellerListings(sellerId: string, includePrivate = false) {
  return withDatabase(
    async (prisma) => {
      const rows = await prisma.listing.findMany({
        where: {
          sellerId,
          ...(includePrivate ? {} : { status: "APPROVED" }),
        },
        include: {
          seller: true,
          photos: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return rows.map(mapListing);
    },
    () => {
      const data = store();

      return data.listings
        .map((listing) => attachSeller(listing, data.sellers))
        .filter((listing) => listing.sellerId === sellerId)
        .filter((listing) => includePrivate || listing.status === "APPROVED")
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
  );
}

export async function authenticate(phone: string, password: string): Promise<SessionUser | null> {
  const normalized = normalizePhone(phone);

  return withDatabase(
    async (prisma) => {
      const user = await prisma.user.findUnique({
        where: {
          phone: normalized,
        },
        include: {
          seller: true,
        },
      });

      if (!user || !(await compare(password, user.passwordHash))) {
        return null;
      }

      return {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        sellerId: user.seller?.id,
      };
    },
    async () => {
      const user = store().users.find((item) => item.phone === normalized);

      if (!user || !(await compare(password, user.passwordHash))) {
        return null;
      }

      return {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        sellerId: user.sellerId,
      };
    },
  );
}

export async function registerSeller(input: {
  phone: string;
  password: string;
  type: SellerType;
  farmName: string;
  displayName: string;
  region: string;
  district: string;
  village?: string;
  whatsapp?: string;
}) {
  const normalized = normalizePhone(input.phone);
  const passwordHash = await hash(input.password, 10);

  return withDatabase(
    async (prisma) => {
      const user = await prisma.user.create({
        data: {
          phone: normalized,
          passwordHash,
          role: "SELLER",
          seller: {
            create: {
              type: input.type,
              farmName: input.farmName,
              displayName: input.displayName,
              region: input.region,
              district: input.district,
              village: input.village || null,
              publicPhone: normalized,
              whatsapp: input.whatsapp || normalized,
            },
          },
        },
        include: {
          seller: true,
        },
      });

      return {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        sellerId: user.seller?.id,
      } satisfies SessionUser;
    },
    () => {
      const data = store();

      if (data.users.some((user) => user.phone === normalized)) {
        throw new Error("PHONE_EXISTS");
      }

      data.sequence += 1;

      const userId = `user-demo-${data.sequence}`;
      const sellerId = `seller-demo-${data.sequence}`;
      const seller: SellerProfile = {
        id: sellerId,
        userId,
        type: input.type,
        farmName: input.farmName,
        displayName: input.displayName,
        region: input.region,
        district: input.district,
        village: input.village || null,
        avatarUrl: null,
        coverUrl: null,
        bio: null,
        publicPhone: normalized,
        whatsapp: input.whatsapp || normalized,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      data.users.push({
        id: userId,
        phone: normalized,
        passwordHash,
        role: "SELLER",
        sellerId,
      });
      data.sellers.push(seller);
      persistStore(data);

      return {
        userId,
        phone: normalized,
        role: "SELLER",
        sellerId,
      } satisfies SessionUser;
    },
  );
}

export async function updateSellerProfile(
  sellerId: string,
  input: Partial<
    Pick<
      SellerProfile,
      | "type"
      | "farmName"
      | "displayName"
      | "region"
      | "district"
      | "village"
      | "avatarUrl"
      | "coverUrl"
      | "bio"
      | "publicPhone"
      | "whatsapp"
    >
  >,
) {
  return withDatabase(
    async (prisma) =>
      prisma.sellerProfile.update({
        where: {
          id: sellerId,
        },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      }),
    () => {
      const data = store();
      const index = data.sellers.findIndex((seller) => seller.id === sellerId);

      if (index === -1) {
        throw new Error("SELLER_NOT_FOUND");
      }

      data.sellers[index] = {
        ...data.sellers[index],
        ...input,
        updatedAt: new Date(),
      };

      data.listings = data.listings.map((listing) =>
        listing.sellerId === sellerId
          ? {
              ...listing,
              seller: data.sellers[index],
            }
          : listing,
      );
      persistStore(data);

      return data.sellers[index];
    },
  );
}

export async function createListing(
  sellerId: string,
  input: {
    title: string;
    species: Species;
    breed: string;
    sex: Sex;
    ageMonths: number;
    weightKg?: number | null;
    priceKzt: number;
    negotiable: boolean;
    description: string;
    region: string;
    district: string;
    village?: string | null;
    documents?: string | null;
    vaccinationNotes?: string | null;
    photos: string[];
  },
) {
  const photos = input.photos.length ? input.photos : [defaultImages[input.species]];

  return withDatabase(
    async (prisma) =>
      prisma.listing.create({
        data: {
          sellerId,
          title: input.title,
          species: input.species,
          breed: input.breed,
          sex: input.sex,
          ageMonths: input.ageMonths,
          weightKg: input.weightKg,
          priceKzt: input.priceKzt,
          negotiable: input.negotiable,
          description: input.description,
          region: input.region,
          district: input.district,
          village: input.village,
          documents: input.documents,
          vaccinationNotes: input.vaccinationNotes,
          status: "PENDING",
          photos: {
            create: photos.map((url, position) => ({
              url,
              position,
              alt: input.title,
            })),
          },
        },
        include: {
          seller: true,
          photos: true,
        },
      }),
    () => {
      const data = store();
      const seller = data.sellers.find((item) => item.id === sellerId);

      if (!seller) {
        throw new Error("SELLER_NOT_FOUND");
      }

      data.sequence += 1;

      const listingPhotos: ListingPhoto[] = photos.map((url, position) => ({
        id: `photo-demo-${data.sequence}-${position}`,
        url,
        alt: input.title,
        position,
      }));

      const listing: Listing = {
        id: `lot-demo-${data.sequence}`,
        sellerId,
        title: input.title,
        species: input.species,
        breed: input.breed,
        sex: input.sex,
        ageMonths: input.ageMonths,
        weightKg: input.weightKg,
        priceKzt: input.priceKzt,
        negotiable: input.negotiable,
        description: input.description,
        region: input.region,
        district: input.district,
        village: input.village,
        documents: input.documents,
        vaccinationNotes: input.vaccinationNotes,
        status: "PENDING",
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: null,
        seller,
        photos: listingPhotos,
      };

      data.listings.unshift(listing);
      persistStore(data);
      return listing;
    },
  );
}

export async function moderateListing(
  listingId: string,
  moderatorId: string,
  status: Extract<ListingStatus, "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED">,
  reason?: string,
) {
  return withDatabase(
    async (prisma) =>
      mapListing(
        await prisma.listing.update({
          where: {
            id: listingId,
          },
          data: {
            status,
            rejectionReason: status === "REJECTED" ? reason : null,
            approvedAt: status === "APPROVED" ? new Date() : null,
            moderationLogs: {
              create: {
                moderatorId,
                status,
                reason,
              },
            },
          },
          include: {
            seller: true,
            photos: true,
          },
        }),
      ),
    () => {
      const data = store();
      const listing = data.listings.find((item) => item.id === listingId);

      if (!listing) {
        throw new Error("LISTING_NOT_FOUND");
      }

      listing.status = status;
      listing.rejectionReason = status === "REJECTED" ? reason : null;
      listing.approvedAt = status === "APPROVED" ? new Date() : null;
      listing.updatedAt = new Date();
      persistStore(data);

      return listing;
    },
  );
}

export async function deleteListing(listingId: string) {
  return withDatabase(
    async (prisma) => {
      await prisma.listing.delete({
        where: {
          id: listingId,
        },
      });

      return true;
    },
    () => {
      const data = store();
      const before = data.listings.length;
      data.listings = data.listings.filter((listing) => listing.id !== listingId);

      if (data.listings.length === before) {
        throw new Error("LISTING_NOT_FOUND");
      }

      persistStore(data);
      return true;
    },
  );
}

export async function setSellerVerified(sellerId: string, verified: boolean) {
  return withDatabase(
    async (prisma) =>
      prisma.sellerProfile.update({
        where: {
          id: sellerId,
        },
        data: {
          verified,
        },
      }),
    () => {
      const data = store();
      const seller = data.sellers.find((item) => item.id === sellerId);

      if (!seller) {
        throw new Error("SELLER_NOT_FOUND");
      }

      seller.verified = verified;
      seller.updatedAt = new Date();

      data.listings = data.listings.map((listing) =>
        listing.sellerId === sellerId
          ? {
              ...listing,
              seller,
            }
          : listing,
      );
      persistStore(data);

      return seller;
    },
  );
}
