"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clearSession, getSession, requireAdmin, requireSeller, setSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import {
  authenticate,
  createListing,
  deleteListing,
  getListing,
  moderateListing,
  registerSeller,
  setSellerVerified,
  updateSellerProfile,
} from "@/lib/repository";
import type { Locale, SellerType, Sex, Species } from "@/lib/types";
import {
  isUploadedFile,
  saveDocumentFile,
  saveImageFiles,
  saveOptionalImage,
  uploadedFiles,
} from "@/lib/uploads";

const speciesValues = ["CATTLE", "HORSE", "SHEEP", "GOAT", "CAMEL"] as const;
const sexValues = ["MALE", "FEMALE", "MIXED"] as const;
const sellerTypeValues = ["FARM", "INDIVIDUAL"] as const;

function localePath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

function asLocale(locale: string): Locale {
  return isLocale(locale) ? locale : "ru";
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || undefined;
}

const authSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6),
});

const registerSchema = authSchema.extend({
  type: z.enum(sellerTypeValues),
  farmName: z.string().min(2),
  displayName: z.string().min(2),
  region: z.string().min(2),
  district: z.string().min(2),
  village: z.string().optional(),
  whatsapp: z.string().optional(),
});

const profileSchema = z.object({
  type: z.enum(sellerTypeValues),
  farmName: z.string().min(2),
  displayName: z.string().min(2),
  region: z.string().min(2),
  district: z.string().min(2),
  village: z.string().optional(),
  bio: z.string().max(600).optional(),
  publicPhone: z.string().min(6),
  whatsapp: z.string().optional(),
});

const listingSchema = z.object({
  title: z.string().min(1),
  species: z.enum(speciesValues),
  breed: z.string().min(1),
  sex: z.enum(sexValues),
  ageMonths: z.coerce.number().int().positive(),
  weightKg: z.coerce.number().int().positive().optional(),
  priceKzt: z.coerce.number().int().positive(),
  negotiable: z.boolean(),
  description: z.string().min(1),
  region: z.string().min(1),
  district: z.string().min(1),
  village: z.string().optional(),
  hasDocuments: z.enum(["yes", "no"]),
  vaccinationNotes: z.string().optional(),
});

export async function loginAction(locale: string, formData: FormData) {
  const targetLocale = asLocale(locale);
  const parsed = authSchema.safeParse({
    phone: text(formData, "phone"),
    password: text(formData, "password"),
  });

  if (!parsed.success) {
    redirect(localePath(targetLocale, "/auth?mode=login&error=invalid"));
  }

  const session = await authenticate(parsed.data.phone, parsed.data.password);

  if (!session) {
    redirect(localePath(targetLocale, "/auth?mode=login&error=bad_credentials"));
  }

  await setSession(session);
  redirect(localePath(targetLocale, session.role === "ADMIN" ? "/admin/moderation" : "/profile"));
}

export async function registerAction(locale: string, formData: FormData) {
  const targetLocale = asLocale(locale);
  const parsed = registerSchema.safeParse({
    phone: text(formData, "phone"),
    password: text(formData, "password"),
    type: text(formData, "type") as SellerType,
    farmName: text(formData, "farmName"),
    displayName: text(formData, "displayName"),
    region: text(formData, "region"),
    district: text(formData, "district"),
    village: optionalText(formData, "village"),
    whatsapp: optionalText(formData, "whatsapp"),
  });

  if (!parsed.success) {
    redirect(localePath(targetLocale, "/auth?mode=register&error=invalid"));
  }

  try {
    const session = await registerSeller(parsed.data);
    await setSession(session);
  } catch {
    redirect(localePath(targetLocale, "/auth?mode=register&error=exists"));
  }

  redirect(localePath(targetLocale, "/profile?created=1"));
}

export async function logoutAction(locale: string) {
  const targetLocale = asLocale(locale);
  await clearSession();
  redirect(localePath(targetLocale));
}

export async function updateProfileAction(locale: string, formData: FormData) {
  const targetLocale = asLocale(locale);
  const sellerId = requireSeller(await getSession());
  const parsed = profileSchema.safeParse({
    type: text(formData, "type") as SellerType,
    farmName: text(formData, "farmName"),
    displayName: text(formData, "displayName"),
    region: text(formData, "region"),
    district: text(formData, "district"),
    village: optionalText(formData, "village"),
    bio: optionalText(formData, "bio"),
    publicPhone: text(formData, "publicPhone"),
    whatsapp: optionalText(formData, "whatsapp"),
  });

  if (!parsed.success) {
    redirect(localePath(targetLocale, "/profile?error=invalid"));
  }

  let avatarUrl: string | null;
  let coverUrl: string | null;

  try {
    avatarUrl = await saveOptionalImage(
      formData.get("avatarFile"),
      "avatars",
      optionalText(formData, "currentAvatarUrl") ?? null,
    );
    coverUrl = await saveOptionalImage(
      formData.get("coverFile"),
      "covers",
      optionalText(formData, "currentCoverUrl") ?? null,
    );
  } catch {
    redirect(localePath(targetLocale, "/profile?error=image"));
  }

  await updateSellerProfile(sellerId, {
    ...parsed.data,
    avatarUrl,
    coverUrl,
  });
  revalidatePath(localePath(targetLocale, "/profile"));
  redirect(localePath(targetLocale, "/profile?saved=1"));
}

export async function createListingAction(locale: string, formData: FormData) {
  const targetLocale = asLocale(locale);
  const sellerId = requireSeller(await getSession());
  const rawWeight = optionalText(formData, "weightKg");
  const hasDocuments = text(formData, "hasDocuments") === "yes" ? "yes" : "no";
  const documentFile = formData.get("documentFile");

  if (hasDocuments === "yes" && !isUploadedFile(documentFile)) {
    redirect(localePath(targetLocale, "/sell?error=document_required"));
  }

  // File writes happen after scalar validation succeeds, so failed form
  // validation does not leave orphaned private uploads.
  const parsed = listingSchema.safeParse({
    title: text(formData, "title"),
    species: text(formData, "species") as Species,
    breed: text(formData, "breed"),
    sex: text(formData, "sex") as Sex,
    ageMonths: text(formData, "ageMonths"),
    weightKg: rawWeight ? Number(rawWeight) : undefined,
    priceKzt: text(formData, "priceKzt"),
    negotiable: formData.get("negotiable") === "on",
    description: text(formData, "description"),
    region: text(formData, "region"),
    district: text(formData, "district"),
    village: optionalText(formData, "village"),
    hasDocuments,
    vaccinationNotes: optionalText(formData, "vaccinationNotes"),
  });

  if (!parsed.success) {
    redirect(localePath(targetLocale, "/sell?error=invalid"));
  }

  let photos: string[];
  let documentRef: string | null = null;

  try {
    photos = await saveImageFiles(uploadedFiles(formData, "photos"), "listings");
  } catch {
    redirect(localePath(targetLocale, "/sell?error=image"));
  }

  if (parsed.data.hasDocuments === "yes" && isUploadedFile(documentFile)) {
    try {
      documentRef = await saveDocumentFile(documentFile);
    } catch {
      redirect(localePath(targetLocale, "/sell?error=document"));
    }
  }

  try {
    await createListing(sellerId, {
      ...parsed.data,
      weightKg: parsed.data.weightKg ?? null,
      village: parsed.data.village ?? null,
      documents: parsed.data.hasDocuments === "yes" ? documentRef : null,
      vaccinationNotes: parsed.data.vaccinationNotes ?? null,
      photos,
    });
  } catch {
    redirect(localePath(targetLocale, "/sell?error=create"));
  }

  revalidatePath(localePath(targetLocale, "/profile"));
  revalidatePath(localePath(targetLocale, "/admin/moderation"));
  redirect(localePath(targetLocale, "/profile?submitted=1"));
}

export async function moderateListingAction(
  locale: string,
  listingId: string,
  decision: "APPROVED" | "REJECTED" | "ARCHIVED",
  formData: FormData,
) {
  const targetLocale = asLocale(locale);
  const admin = requireAdmin(await getSession());
  const reason = optionalText(formData, "reason");

  await moderateListing(listingId, admin.userId, decision, reason);
  revalidatePath(localePath(targetLocale));
  revalidatePath(localePath(targetLocale, "/admin/moderation"));
  redirect(localePath(targetLocale, "/admin/moderation?reviewed=1"));
}

export async function returnListingToModerationAction(
  locale: string,
  listingId: string,
  formData: FormData,
) {
  const targetLocale = asLocale(locale);
  const admin = requireAdmin(await getSession());
  const reason =
    optionalText(formData, "reason") ||
    "Published listing returned to moderation by administrator.";

  await moderateListing(listingId, admin.userId, "PENDING", reason);
  revalidatePath(localePath(targetLocale));
  revalidatePath(localePath(targetLocale, `/lots/${listingId}`));
  revalidatePath(localePath(targetLocale, "/admin/moderation"));
  redirect(localePath(targetLocale, "/admin/moderation?returned=1"));
}

export async function deleteListingAction(
  locale: string,
  listingId: string,
  destination: "profile" | "admin",
) {
  const targetLocale = asLocale(locale);
  const session = await getSession();
  const listing = await getListing(listingId);

  if (!listing || !session) {
    redirect(localePath(targetLocale, "/auth"));
  }

  const canDelete = session.role === "ADMIN" || session.sellerId === listing.sellerId;

  if (!canDelete) {
    redirect(localePath(targetLocale));
  }

  await deleteListing(listingId);
  revalidatePath(localePath(targetLocale));
  revalidatePath(localePath(targetLocale, "/profile"));
  revalidatePath(localePath(targetLocale, "/admin/moderation"));

  redirect(
    localePath(targetLocale, destination === "admin" ? "/admin/moderation?deleted=1" : "/profile?deleted=1"),
  );
}

export async function setSellerVerifiedAction(
  locale: string,
  sellerId: string,
  verified: boolean,
) {
  const targetLocale = asLocale(locale);
  requireAdmin(await getSession());
  await setSellerVerified(sellerId, verified);
  revalidatePath(localePath(targetLocale, `/sellers/${sellerId}`));
  revalidatePath(localePath(targetLocale, "/admin/moderation"));
  redirect(localePath(targetLocale, "/admin/moderation?verified=1"));
}
