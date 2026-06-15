import "dotenv/config";

import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: requiredEnv("DATABASE_URL"),
  }),
});

async function main() {
  const adminPhone = requiredEnv("ASYL_ADMIN_PHONE");
  const adminPlainPassword = requiredEnv("ASYL_ADMIN_PASSWORD");
  const sellerPassword = await hash("demo123", 10);
  const adminPassword = await hash(adminPlainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { passwordHash: adminPassword, role: "ADMIN" },
    create: {
      phone: adminPhone,
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.upsert({
    where: { phone: "+77001112233" },
    update: { passwordHash: sellerPassword, role: "SELLER" },
    create: {
      phone: "+77001112233",
      passwordHash: sellerPassword,
      role: "SELLER",
    },
  });

  const profile = await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    update: {
      verified: true,
      farmName: "Сарыарқа Береке КХ",
      displayName: "Сарыарқа Береке",
      region: "Қарағанды облысы",
      district: "Нұра ауданы",
      village: "Кертінді",
      publicPhone: "+7 700 111 22 33",
      whatsapp: "+77001112233",
      avatarUrl:
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=300&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80",
      bio: "Тұқымды ірі қара мен жылқы өсіретін отбасылық шаруашылық.",
    },
    create: {
      userId: seller.id,
      type: "FARM",
      verified: true,
      farmName: "Сарыарқа Береке КХ",
      displayName: "Сарыарқа Береке",
      region: "Қарағанды облысы",
      district: "Нұра ауданы",
      village: "Кертінді",
      publicPhone: "+7 700 111 22 33",
      whatsapp: "+77001112233",
      avatarUrl:
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=300&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80",
      bio: "Тұқымды ірі қара мен жылқы өсіретін отбасылық шаруашылық.",
    },
  });

  const existing = await prisma.listing.findFirst({
    where: { sellerId: profile.id, title: "Ангус бұқалары, 14 бас" },
  });

  if (!existing) {
    await prisma.listing.create({
      data: {
        sellerId: profile.id,
        title: "Ангус бұқалары, 14 бас",
        species: "CATTLE",
        breed: "Абердин-ангус",
        sex: "MALE",
        ageMonths: 18,
        weightKg: 430,
        priceKzt: 890000,
        negotiable: true,
        description:
          "Жайылымда өскен, салмағы тұрақты қосылып келе жатқан ангус бұқалары. Ветеринарлық паспорттары бар.",
        region: "Қарағанды облысы",
        district: "Нұра ауданы",
        village: "Кертінді",
        documents: "Ветпаспорт, шығу тегі туралы анықтама",
        vaccinationNotes: "Бруцеллез және аусылға тексерілген",
        status: "APPROVED",
        approvedAt: new Date(),
        photos: {
          create: {
            url: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80",
            alt: "Ангус бұқалары",
            position: 0,
          },
        },
      },
    });
  }

  console.log(`Seeded Asyl Tuqym. Admin: ${admin.phone}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
