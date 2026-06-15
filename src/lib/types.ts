export const locales = ["kk", "ru"] as const;

export type Locale = (typeof locales)[number];
export type Role = "SELLER" | "ADMIN";
export type SellerType = "FARM" | "INDIVIDUAL";
export type Species = "CATTLE" | "HORSE" | "SHEEP" | "GOAT" | "CAMEL";
export type Sex = "MALE" | "FEMALE" | "MIXED";
export type ListingStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SOLD"
  | "ARCHIVED";

export type SessionUser = {
  userId: string;
  role: Role;
  sellerId?: string;
  phone: string;
};

export type SellerProfile = {
  id: string;
  userId: string;
  type: SellerType;
  farmName: string;
  displayName: string;
  region: string;
  district: string;
  village?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  publicPhone: string;
  whatsapp?: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ListingPhoto = {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
};

export type Listing = {
  id: string;
  sellerId: string;
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
  status: ListingStatus;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  seller: SellerProfile;
  photos: ListingPhoto[];
};

export type ListingFilters = {
  q?: string;
  species?: Species;
  region?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  sex?: Sex;
  verified?: boolean;
  documents?: boolean;
  sort?: "recommended" | "newest" | "price-asc" | "price-desc";
};

export type ModerationItem = Listing & {
  moderationNote?: string | null;
};
