import { PrismaClient, Role, AccountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Influ-Store Phase 1, 2, and 3...");

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

  console.log("Seeding finished successfully!");
  console.log(`Created/Verified users: @${maya.username}, @${priya.username}, @${alex.username}`);
  console.log("Seeded 7 posts, 5 follow relationships, and 10 indexed hashtags.");
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
