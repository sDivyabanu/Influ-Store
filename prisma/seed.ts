import { PrismaClient, Role, AccountType, ProductCategory, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Influ-Store Phase 1, 2, 3, and 4...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // 1. Seed demo user: Maya (Influencer)
  const maya = await prisma.user.upsert({
    where: { username: "mayacarter" },
    update: {},
    create: {
      email: "maya@influstore.com",
      username: "mayacarter",
      passwordHash,
      role: Role.USER,
      profile: {
        create: {
          displayName: "Maya Carter",
          bio: "Fashion, lifestyle & minimal aesthetics. Inspiring your daily style. ✨",
          website: "https://mayacarter.style",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          accountType: AccountType.INFLUENCER,
        },
      },
    },
  });

  // 2. Seed demo user: Priya (Influencer)
  const priya = await prisma.user.upsert({
    where: { username: "priya" },
    update: {},
    create: {
      email: "priya@influstore.com",
      username: "priya",
      passwordHash,
      role: Role.USER,
      profile: {
        create: {
          displayName: "Priya Sharma",
          bio: "Discovering new trends and sharing curated fashion & lifestyle favorites. 🛍️",
          website: "https://priyasharma.me",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
          accountType: AccountType.INFLUENCER,
        },
      },
    },
  });

  // 3. Seed demo user: Alex (Customer)
  const alex = await prisma.user.upsert({
    where: { username: "alexm" },
    update: {},
    create: {
      email: "alex@influstore.com",
      username: "alexm",
      passwordHash,
      role: Role.USER,
      profile: {
        create: {
          displayName: "Alex Morgan",
          bio: "Design enthusiast, tech lover, and modern explorer.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
          accountType: AccountType.CUSTOMER,
        },
      },
    },
  });

  // 4. Seed Phase 3 Follow Relationships
  console.log("Seeding Phase 3 follow graph...");
  await prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: { in: [maya.id, priya.id, alex.id] } },
        { followingId: { in: [maya.id, priya.id, alex.id] } },
      ],
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: maya.id, followingId: priya.id },
      { followerId: maya.id, followingId: alex.id },
      { followerId: priya.id, followingId: maya.id },
      { followerId: alex.id, followingId: maya.id },
      { followerId: alex.id, followingId: priya.id },
    ],
  });

  // 5. Seed Phase 2 & 3 social content (posts, comments, replies, likes, saves, hashtags).
  console.log("Seeding Phase 2 & 3 social content...");
  await prisma.post.deleteMany({ where: { authorId: { in: [maya.id, priya.id, alex.id] } } });

  const mayaPost1 = await prisma.post.create({
    data: {
      authorId: maya.id,
      caption:
        "Found the perfect pieces for a minimal weekend look. What do you think? ✨ #fashion #minimal",
      media: {
        create: [
          {
            mediaKey: "seed/mayacarter/post1-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
          {
            mediaKey: "seed/mayacarter/post1-2.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
            order: 1,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  const mayaPost2 = await prisma.post.create({
    data: {
      authorId: maya.id,
      caption: "Neutral tones, clean silhouettes and a little sunshine. My current mood. 🤎 #lifestyle",
      media: {
        create: [
          {
            mediaKey: "seed/mayacarter/post2-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  const priyaPost1 = await prisma.post.create({
    data: {
      authorId: priya.id,
      caption: "Simple things, better spaces. Refreshing the corner of my apartment this week. #home",
      media: {
        create: [
          {
            mediaKey: "seed/priya/post1-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  const priyaPost2 = await prisma.post.create({
    data: {
      authorId: priya.id,
      caption: "Three ways to style one blazer. Swipe through for the full look. #style #ootd",
      media: {
        create: [
          {
            mediaKey: "seed/priya/post2-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
          {
            mediaKey: "seed/priya/post2-2.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85",
            order: 1,
            width: 1000,
            height: 1250,
          },
          {
            mediaKey: "seed/priya/post2-3.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85",
            order: 2,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  const alexPost1 = await prisma.post.create({
    data: {
      authorId: alex.id,
      caption: "The everyday setup. Keeping my desk clean and distraction-free. #tech #minimal",
      media: {
        create: [
          {
            mediaKey: "seed/alexm/post1-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  const alexPost2 = await prisma.post.create({
    data: {
      authorId: alex.id,
      caption: "New week. New goals. #fitness",
      media: {
        create: [
          {
            mediaKey: "seed/alexm/post2-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  const mayaPost3 = await prisma.post.create({
    data: {
      authorId: maya.id,
      caption: "A little self-care goes a long way. #beauty #selfcare",
      media: {
        create: [
          {
            mediaKey: "seed/mayacarter/post3-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85",
            order: 0,
            width: 1000,
            height: 1250,
          },
        ],
      },
    },
  });

  // 6. Seed Hashtags & PostHashtag relations
  console.log("Seeding Phase 3 hashtags...");
  const hashtagNames = [
    "fashion",
    "minimal",
    "lifestyle",
    "home",
    "style",
    "ootd",
    "tech",
    "fitness",
    "beauty",
    "selfcare",
  ];

  const tagMap = new Map<string, string>();
  for (const name of hashtagNames) {
    const h = await prisma.hashtag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    tagMap.set(name, h.id);
  }

  const postHashtagPairs: { postId: string; tags: string[] }[] = [
    { postId: mayaPost1.id, tags: ["fashion", "minimal"] },
    { postId: mayaPost2.id, tags: ["lifestyle"] },
    { postId: priyaPost1.id, tags: ["home"] },
    { postId: priyaPost2.id, tags: ["style", "ootd"] },
    { postId: alexPost1.id, tags: ["tech", "minimal"] },
    { postId: alexPost2.id, tags: ["fitness"] },
    { postId: mayaPost3.id, tags: ["beauty", "selfcare"] },
  ];

  for (const pair of postHashtagPairs) {
    for (const tag of pair.tags) {
      const hashtagId = tagMap.get(tag);
      if (hashtagId) {
        await prisma.postHashtag.upsert({
          where: { postId_hashtagId: { postId: pair.postId, hashtagId } },
          create: { postId: pair.postId, hashtagId },
          update: {},
        });
      }
    }
  }

  // 7. Likes
  await prisma.like.createMany({
    data: [
      { postId: mayaPost1.id, userId: priya.id },
      { postId: mayaPost1.id, userId: alex.id },
      { postId: mayaPost2.id, userId: alex.id },
      { postId: priyaPost1.id, userId: maya.id },
      { postId: priyaPost2.id, userId: maya.id },
      { postId: priyaPost2.id, userId: alex.id },
      { postId: alexPost1.id, userId: maya.id },
      { postId: alexPost1.id, userId: priya.id },
      { postId: alexPost2.id, userId: priya.id },
      { postId: mayaPost3.id, userId: priya.id },
    ],
  });

  // 8. Comments + one-level replies
  const priyaCommentOnMaya1 = await prisma.comment.create({
    data: { postId: mayaPost1.id, authorId: priya.id, content: "Love this! 😍" },
  });
  const alexCommentOnMaya1 = await prisma.comment.create({
    data: { postId: mayaPost1.id, authorId: alex.id, content: "Where's this from?" },
  });
  await prisma.comment.create({
    data: {
      postId: mayaPost1.id,
      authorId: maya.id,
      parentId: alexCommentOnMaya1.id,
      content: "Thank you! It's from our new collection 💕",
    },
  });
  await prisma.comment.create({
    data: {
      postId: mayaPost1.id,
      authorId: priya.id,
      parentId: alexCommentOnMaya1.id,
      content: "Same, need to know too!",
    },
  });

  const mayaCommentOnPriya2 = await prisma.comment.create({
    data: { postId: priyaPost2.id, authorId: maya.id, content: "The third look is my favorite 🔥" },
  });
  await prisma.comment.create({
    data: {
      postId: priyaPost2.id,
      authorId: priya.id,
      parentId: mayaCommentOnPriya2.id,
      content: "Mine too honestly!",
    },
  });

  await prisma.comment.create({
    data: { postId: alexPost1.id, authorId: priya.id, content: "So clean, love a minimal desk setup." },
  });

  // 9. Comment likes
  await prisma.commentLike.createMany({
    data: [
      { commentId: priyaCommentOnMaya1.id, userId: maya.id },
      { commentId: alexCommentOnMaya1.id, userId: maya.id },
      { commentId: mayaCommentOnPriya2.id, userId: priya.id },
    ],
  });

  // 10. Saved posts (private per-user bookmarks)
  await prisma.savedPost.createMany({
    data: [
      { userId: alex.id, postId: mayaPost1.id },
      { userId: priya.id, postId: alexPost1.id },
      { userId: maya.id, postId: priyaPost2.id },
    ],
  });

  // 11. Seed Phase 4 reels (short-form video). CC0 sample clips from MDN's
  // interactive-examples media bucket — free to use, reliably hosted.
  console.log("Seeding Phase 4 reels...");
  await prisma.reel.deleteMany({ where: { authorId: { in: [maya.id, priya.id, alex.id] } } });

  const mayaReel1 = await prisma.reel.create({
    data: {
      authorId: maya.id,
      caption: "Behind the scenes of today's shoot 🎬 #fashion",
      mediaKey: "seed/mayacarter/reel1.mp4",
      mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: 10,
      width: 640,
      height: 360,
    },
  });

  const priyaReel1 = await prisma.reel.create({
    data: {
      authorId: priya.id,
      caption: "A little #ootd inspo to start your week ✨",
      mediaKey: "seed/priya/reel1.mp4",
      mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
      duration: 12,
      width: 640,
      height: 360,
    },
  });

  const alexReel1 = await prisma.reel.create({
    data: {
      authorId: alex.id,
      caption: "Quick tour of my minimal desk setup #tech #minimal",
      mediaKey: "seed/alexm/reel1.mp4",
      mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/bumblebee.mp4",
      duration: 8,
      width: 640,
      height: 360,
    },
  });

  const mayaReel2 = await prisma.reel.create({
    data: {
      authorId: maya.id,
      caption: "Morning routine essentials #lifestyle",
      mediaKey: "seed/mayacarter/reel2.mp4",
      mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/small.mp4",
      duration: 15,
      width: 560,
      height: 320,
    },
  });

  // Reel hashtags (reusing the same tagMap from post hashtag seeding above)
  const reelHashtagPairs: { reelId: string; tags: string[] }[] = [
    { reelId: mayaReel1.id, tags: ["fashion"] },
    { reelId: priyaReel1.id, tags: ["ootd"] },
    { reelId: alexReel1.id, tags: ["tech", "minimal"] },
    { reelId: mayaReel2.id, tags: ["lifestyle"] },
  ];

  for (const pair of reelHashtagPairs) {
    for (const tag of pair.tags) {
      const hashtagId = tagMap.get(tag);
      if (hashtagId) {
        await prisma.reelHashtag.upsert({
          where: { reelId_hashtagId: { reelId: pair.reelId, hashtagId } },
          create: { reelId: pair.reelId, hashtagId },
          update: {},
        });
      }
    }
  }

  // Reel likes
  await prisma.reelLike.createMany({
    data: [
      { reelId: mayaReel1.id, userId: priya.id },
      { reelId: mayaReel1.id, userId: alex.id },
      { reelId: priyaReel1.id, userId: maya.id },
      { reelId: alexReel1.id, userId: maya.id },
      { reelId: alexReel1.id, userId: priya.id },
      { reelId: mayaReel2.id, userId: alex.id },
    ],
  });

  // Reel comments + one reply
  const priyaCommentOnMayaReel1 = await prisma.reelComment.create({
    data: { reelId: mayaReel1.id, authorId: priya.id, content: "This came out so good! 🔥" },
  });
  await prisma.reelComment.create({
    data: {
      reelId: mayaReel1.id,
      authorId: maya.id,
      parentId: priyaCommentOnMayaReel1.id,
      content: "Thank you!! 🥹",
    },
  });
  await prisma.reelComment.create({
    data: { reelId: alexReel1.id, authorId: maya.id, content: "Need this desk setup in my life." },
  });

  // Reel comment likes
  await prisma.reelCommentLike.createMany({
    data: [{ reelCommentId: priyaCommentOnMayaReel1.id, userId: alex.id }],
  });

  // Saved reels (private per-user bookmarks)
  await prisma.savedReel.createMany({
    data: [
      { userId: alex.id, reelId: mayaReel1.id },
      { userId: maya.id, reelId: priyaReel1.id },
    ],
  });

  // 12. Seed Phase 6 marketplace data: upgrade Maya to a seller with a
  // storefront, a mix of simple and variant products, and product tags
  // on her existing post/reel — demonstrates the full catalog + tagging
  // system end to end.
  console.log("Seeding Phase 6 marketplace data...");

  await prisma.user.update({ where: { id: maya.id }, data: { role: Role.SELLER } });

  const mayaStore = await prisma.sellerProfile.upsert({
    where: { userId: maya.id },
    update: {},
    create: {
      userId: maya.id,
      storeName: "Maya's Style Studio",
      slug: "mayas-style-studio",
      description: "Curated fashion, accessories, and beauty essentials — handpicked by Maya.",
      logoKey: "seed/mayacarter/store-logo.jpg",
      logoUrl:
        "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=400&q=85",
      bannerKey: "seed/mayacarter/store-banner.jpg",
      bannerUrl:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=85",
      website: "https://mayacarter.style",
    },
  });

  // Simple product (no options) — a single default variant.
  const mayaTote = await prisma.product.upsert({
    where: { slug: "maya-everyday-tote" },
    update: {},
    create: {
      sellerProfileId: mayaStore.id,
      name: "Everyday Tote",
      slug: "maya-everyday-tote",
      description: "A roomy, durable tote for daily essentials. Neutral tone, works with everything.",
      category: ProductCategory.ACCESSORIES,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
      currency: "INR",
      basePrice: 1499,
      totalStock: 40,
      media: {
        create: [
          {
            storageKey: "seed/mayacarter/product-tote-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85",
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sellerProfileId: mayaStore.id,
            sku: "MAYA-TOTE-001",
            price: 1499,
            stock: 40,
            isActive: true,
            isDefault: true,
          },
        ],
      },
    },
  });

  // Variant product — a "Size" option with three variants sharing one price.
  const mayaHoodie = await prisma.product.upsert({
    where: { slug: "maya-essential-hoodie" },
    update: {},
    create: {
      sellerProfileId: mayaStore.id,
      name: "Essential Hoodie",
      slug: "maya-essential-hoodie",
      description: "Soft fleece hoodie in a relaxed fit. A wardrobe staple for cooler days.",
      category: ProductCategory.FASHION,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
      currency: "INR",
      basePrice: 2199,
      totalStock: 37,
      media: {
        create: [
          {
            storageKey: "seed/mayacarter/product-hoodie-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85",
            order: 0,
          },
          {
            storageKey: "seed/mayacarter/product-hoodie-2.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85",
            order: 1,
          },
        ],
      },
      options: {
        create: [
          {
            name: "Size",
            order: 0,
            values: {
              create: [
                { value: "S", order: 0 },
                { value: "M", order: 1 },
                { value: "L", order: 2 },
              ],
            },
          },
        ],
      },
    },
    include: { options: { include: { values: true } } },
  });

  const sizeOption = mayaHoodie.options.find((o) => o.name === "Size");
  const sizeValueIdByLabel = new Map(sizeOption?.values.map((v) => [v.value, v.id]) ?? []);
  const hoodieVariantDefs = [
    { sku: "MAYA-HOODIE-S", size: "S", stock: 15 },
    { sku: "MAYA-HOODIE-M", size: "M", stock: 12 },
    { sku: "MAYA-HOODIE-L", size: "L", stock: 10 },
  ];
  for (const def of hoodieVariantDefs) {
    const optionValueId = sizeValueIdByLabel.get(def.size);
    if (!optionValueId) continue;
    const variant = await prisma.productVariant.upsert({
      where: { sellerProfileId_sku: { sellerProfileId: mayaStore.id, sku: def.sku } },
      update: {},
      create: {
        productId: mayaHoodie.id,
        sellerProfileId: mayaStore.id,
        sku: def.sku,
        price: 2199,
        stock: def.stock,
        isActive: true,
        isDefault: false,
      },
    });
    await prisma.variantOptionValue.upsert({
      where: { variantId_optionValueId: { variantId: variant.id, optionValueId } },
      update: {},
      create: { variantId: variant.id, optionValueId },
    });
  }

  // Simple product again, in a different category.
  await prisma.product.upsert({
    where: { slug: "maya-daily-glow-set" },
    update: {},
    create: {
      sellerProfileId: mayaStore.id,
      name: "Daily Glow Set",
      slug: "maya-daily-glow-set",
      description: "A three-step routine for a natural, everyday glow.",
      category: ProductCategory.BEAUTY,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
      currency: "INR",
      basePrice: 1899,
      totalStock: 25,
      media: {
        create: [
          {
            storageKey: "seed/mayacarter/product-glow-1.jpg",
            mediaUrl:
              "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=85",
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sellerProfileId: mayaStore.id,
            sku: "MAYA-GLOW-001",
            price: 1899,
            stock: 25,
            isActive: true,
            isDefault: true,
          },
        ],
      },
    },
  });

  // A DRAFT product — never shown in the marketplace, exercises the
  // seller dashboard's status filter and the draft-hides-from-tagging rule.
  await prisma.product.upsert({
    where: { slug: "maya-studio-headphones" },
    update: {},
    create: {
      sellerProfileId: mayaStore.id,
      name: "Studio Headphones",
      slug: "maya-studio-headphones",
      description: "Still finalizing packaging photos before this one goes live.",
      category: ProductCategory.ELECTRONICS,
      status: ProductStatus.DRAFT,
      currency: "INR",
      basePrice: 4999,
      totalStock: 5,
      variants: {
        create: [
          {
            sellerProfileId: mayaStore.id,
            sku: "MAYA-HEADPHONES-001",
            price: 4999,
            stock: 5,
            isActive: true,
            isDefault: true,
          },
        ],
      },
    },
  });

  // Tag Maya's own products into her own existing post/reel — only ever
  // valid because she's both the author and the products' seller.
  await prisma.postProductTag.upsert({
    where: { postId_productId: { postId: mayaPost1.id, productId: mayaHoodie.id } },
    update: {},
    create: { postId: mayaPost1.id, productId: mayaHoodie.id },
  });
  await prisma.postProductTag.upsert({
    where: { postId_productId: { postId: mayaPost1.id, productId: mayaTote.id } },
    update: {},
    create: { postId: mayaPost1.id, productId: mayaTote.id },
  });
  await prisma.reelProductTag.upsert({
    where: { reelId_productId: { reelId: mayaReel1.id, productId: mayaHoodie.id } },
    update: {},
    create: { reelId: mayaReel1.id, productId: mayaHoodie.id },
  });

  console.log("Seeding finished successfully!");
  console.log(`Created/Verified users: @${maya.username}, @${priya.username}, @${alex.username}`);
  console.log("Seeded 7 posts, 4 reels, 5 follow relationships, and indexed hashtags.");
  console.log(
    `Seeded Maya's storefront (@${maya.username} -> SELLER) with 4 products (1 with size variants) and product tags on her post/reel.`
  );
  console.log("Default password for all seeded accounts: Password123!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
