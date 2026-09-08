/** The current seller's own storefront — safe to return to them in full. */
export interface MyStoreItem {
  id: string;
  storeName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  website: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Public storefront view — never includes anything from SellerApplication/verification data. */
export interface PublicStoreItem {
  id: string;
  storeName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  website: string | null;
  createdAt: string | Date;
  seller: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  productCount: number;
}
