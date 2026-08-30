import { PrismaClient, Role, AccountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Influ-Store Phase 1...");

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

  console.log("Seeding finished successfully!");
  console.log(`Created/Verified users: @${maya.username}, @${priya.username}, @${alex.username}`);
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
