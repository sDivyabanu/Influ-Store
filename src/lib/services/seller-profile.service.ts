import { SellerProfile } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { UpsertStoreInput } from "@/lib/validations/store.schema";
import { MyStoreItem, PublicStoreItem } from "@/types/store";
import { assertStoreMediaKeyOwnedByUser } from "./store-media-upload.service";

function serializeMyStore(store: SellerProfile): MyStoreItem {
  return {
    id: store.id,
    storeName: store.storeName,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    website: store.website,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
}

export async function getMyStore(userId: string): Promise<MyStoreItem | null> {
  const store = await prisma.sellerProfile.findUnique({ where: { userId } });
  return store ? serializeMyStore(store) : null;
}

/** Creates the storefront on first save, or updates it thereafter. Slug uniqueness is enforced at the DB level; a friendly ConflictError is surfaced on collision. */
export async function upsertStore(userId: string, input: UpsertStoreInput): Promise<MyStoreItem> {
  const storage = getStorageService();

  // Never trust the browser's claim that an uploaded key belongs to it.
  if (input.logoKey) assertStoreMediaKeyOwnedByUser(input.logoKey, userId);
  if (input.bannerKey) assertStoreMediaKeyOwnedByUser(input.bannerKey, userId);

  const existingBySlug = await prisma.sellerProfile.findUnique({
    where: { slug: input.slug },
    select: { userId: true },
  });
  if (existingBySlug && existingBySlug.userId !== userId) {
    throw new ConflictError("This store URL is already taken. Please choose another.");
  }

  const data = {
    storeName: input.storeName,
    slug: input.slug,
    description: input.description ?? null,
    website: input.website ?? null,
    ...(input.logoKey !== undefined
      ? { logoKey: input.logoKey, logoUrl: input.logoKey ? storage.getPublicUrl(input.logoKey) : null }
      : {}),
    ...(input.bannerKey !== undefined
      ? { bannerKey: input.bannerKey, bannerUrl: input.bannerKey ? storage.getPublicUrl(input.bannerKey) : null }
      : {}),
  };

  const store = await prisma.sellerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return serializeMyStore(store);
}

export async function getStoreBySlug(slug: string): Promise<PublicStoreItem | null> {
  const store = await prisma.sellerProfile.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      user: {
        select: {
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
  if (!store) return null;

  return {
    id: store.id,
    storeName: store.storeName,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    website: store.website,
    createdAt: store.createdAt,
    seller: {
      username: store.user.username,
      displayName: store.user.profile?.displayName || store.user.username,
      avatarUrl: store.user.profile?.avatarUrl ?? null,
    },
    productCount: store._count.products,
  };
}

/** Looks up a seller's own store, throwing if they haven't set one up yet — used by product management flows that require an existing storefront. */
export async function requireMyStoreId(userId: string): Promise<string> {
  const store = await prisma.sellerProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!store) {
    throw new NotFoundError("Set up your storefront before managing products.");
  }
  return store.id;
}

/**
 * Minimal lookup for deciding whether to show a "Store" tab on someone's
 * profile and where it should link — used by the profile page, which
 * only knows the viewed user's id, not their own. Returns nothing
 * beyond the slug: no verification/admin data ever flows through here.
 */
export async function getStoreSlugByUserId(userId: string): Promise<string | null> {
  const store = await prisma.sellerProfile.findUnique({ where: { userId }, select: { slug: true } });
  return store?.slug ?? null;
}
