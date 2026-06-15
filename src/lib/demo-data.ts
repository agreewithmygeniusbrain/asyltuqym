import "server-only";

import { hashSync } from "bcryptjs";

import type { Listing, SellerProfile } from "@/lib/types";

export type DemoUser = {
  id: string;
  phone: string;
  passwordHash: string;
  role: "SELLER" | "ADMIN";
  sellerId?: string;
};

const now = Date.now();

export const demoSellers: SellerProfile[] = [
  {
    id: "seller-saryarka",
    userId: "user-seller-1",
    type: "FARM",
    farmName: "Сарыарқа Береке КХ",
    displayName: "Сарыарқа Береке",
    region: "Қарағанды облысы",
    district: "Нұра ауданы",
    village: "Кертінді",
    avatarUrl:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80",
    bio: "Тұқымды ірі қара мен жылқы өсіретін отбасылық шаруашылық. Ветеринарлық бақылау тұрақты жүргізіледі.",
    publicPhone: "+7 700 111 22 33",
    whatsapp: "+77001112233",
    verified: true,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 220),
    updatedAt: new Date(now - 1000 * 60 * 60 * 6),
  },
  {
    id: "seller-altai",
    userId: "user-seller-2",
    type: "FARM",
    farmName: "Алтай Құт",
    displayName: "Алтай Құт",
    region: "Шығыс Қазақстан облысы",
    district: "Катонқарағай ауданы",
    village: "Өрел",
    avatarUrl:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1520595467950-2aee3d8cf8c3?auto=format&fit=crop&w=1400&q=80",
    bio: "Таулы жайылымда өсірілген қой, ешкі және жылқы. Жеткізу шарттары келісім бойынша.",
    publicPhone: "+7 701 444 55 66",
    whatsapp: "+77014445566",
    verified: true,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 180),
    updatedAt: new Date(now - 1000 * 60 * 60 * 10),
  },
  {
    id: "seller-turkistan",
    userId: "user-seller-3",
    type: "INDIVIDUAL",
    farmName: "Жеке сатушы Мұрат",
    displayName: "Мұрат Омаров",
    region: "Түркістан облысы",
    district: "Отырар ауданы",
    village: "Шәуілдір",
    avatarUrl:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1400&q=80",
    bio: "Ауыл ішінен бордақыланған түйе, қой және ешкі лоттарын ұсынамын.",
    publicPhone: "+7 705 777 88 99",
    whatsapp: "+77057778899",
    verified: false,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 90),
    updatedAt: new Date(now - 1000 * 60 * 60 * 24),
  },
];

export const demoUsers: DemoUser[] = [
  {
    id: "user-seller-1",
    phone: "+77001112233",
    passwordHash: hashSync("demo123", 10),
    role: "SELLER",
    sellerId: "seller-saryarka",
  },
  {
    id: "user-seller-2",
    phone: "+77014445566",
    passwordHash: hashSync("demo123", 10),
    role: "SELLER",
    sellerId: "seller-altai",
  },
  {
    id: "user-admin-1",
    phone: "+77009998877",
    passwordHash: hashSync("admin123", 10),
    role: "ADMIN",
  },
];

export const demoListings: Listing[] = [
  {
    id: "lot-angus-bulls",
    sellerId: "seller-saryarka",
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
    createdAt: new Date(now - 1000 * 60 * 60 * 4),
    updatedAt: new Date(now - 1000 * 60 * 60 * 4),
    approvedAt: new Date(now - 1000 * 60 * 60 * 3),
    seller: demoSellers[0],
    photos: [
      {
        id: "photo-angus-1",
        url: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80",
        alt: "Ангус бұқалары",
        position: 0,
      },
    ],
  },
  {
    id: "lot-kostanay-horse",
    sellerId: "seller-altai",
    title: "Қостанай тұқымды құлын",
    species: "HORSE",
    breed: "Қостанай",
    sex: "FEMALE",
    ageMonths: 20,
    weightKg: 360,
    priceKzt: 1250000,
    negotiable: false,
    description:
      "Жуас мінезді, жүрісі жеңіл құлын. Таулы жайылымда өскен, ата-анасы шаруашылықта көрінеді.",
    region: "Шығыс Қазақстан облысы",
    district: "Катонқарағай ауданы",
    village: "Өрел",
    documents: "Ветпаспорт",
    vaccinationNotes: "Жоспарлы вакцина толық",
    status: "APPROVED",
    createdAt: new Date(now - 1000 * 60 * 60 * 7),
    updatedAt: new Date(now - 1000 * 60 * 60 * 7),
    approvedAt: new Date(now - 1000 * 60 * 60 * 6),
    seller: demoSellers[1],
    photos: [
      {
        id: "photo-horse-1",
        url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
        alt: "Қостанай құлыны",
        position: 0,
      },
    ],
  },
  {
    id: "lot-edilbay-sheep",
    sellerId: "seller-altai",
    title: "Еділбай қойлары, 45 бас",
    species: "SHEEP",
    breed: "Еділбай",
    sex: "MIXED",
    ageMonths: 16,
    weightKg: 58,
    priceKzt: 78000,
    negotiable: true,
    description:
      "Қоңды отар, қошқар мен саулық аралас. Көтерме сатып алушыға жеке баға қарастырылады.",
    region: "Шығыс Қазақстан облысы",
    district: "Катонқарағай ауданы",
    village: "Өрел",
    documents: "Ветеринарлық анықтама",
    vaccinationNotes: "Соңғы тексеріс осы айда",
    status: "APPROVED",
    createdAt: new Date(now - 1000 * 60 * 60 * 12),
    updatedAt: new Date(now - 1000 * 60 * 60 * 12),
    approvedAt: new Date(now - 1000 * 60 * 60 * 10),
    seller: demoSellers[1],
    photos: [
      {
        id: "photo-sheep-1",
        url: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1200&q=80",
        alt: "Еділбай қойлары",
        position: 0,
      },
    ],
  },
  {
    id: "lot-camel-turkistan",
    sellerId: "seller-turkistan",
    title: "Інген, ботасымен бірге",
    species: "CAMEL",
    breed: "Қазақтың аруанасы",
    sex: "FEMALE",
    ageMonths: 60,
    weightKg: 520,
    priceKzt: 1680000,
    negotiable: true,
    description:
      "Сүтті інген, ботасы жанында. Денсаулығы жақсы, ауыл ішінен көруге болады.",
    region: "Түркістан облысы",
    district: "Отырар ауданы",
    village: "Шәуілдір",
    documents: null,
    vaccinationNotes: "Жергілікті ветеринар қараған",
    status: "APPROVED",
    createdAt: new Date(now - 1000 * 60 * 60 * 16),
    updatedAt: new Date(now - 1000 * 60 * 60 * 15),
    approvedAt: new Date(now - 1000 * 60 * 60 * 14),
    seller: demoSellers[2],
    photos: [
      {
        id: "photo-camel-1",
        url: "https://images.unsplash.com/photo-1489161587020-79aa193f04ff?auto=format&fit=crop&w=1200&q=80",
        alt: "Інген ботасымен",
        position: 0,
      },
    ],
  },
  {
    id: "lot-goats-pending",
    sellerId: "seller-turkistan",
    title: "Сүтті ешкілер, 8 бас",
    species: "GOAT",
    breed: "Заанен аралас",
    sex: "FEMALE",
    ageMonths: 28,
    weightKg: 48,
    priceKzt: 135000,
    negotiable: true,
    description:
      "Сүт бағытына қолайлы ешкілер. Қорада ұсталған, қолға үйренген.",
    region: "Түркістан облысы",
    district: "Отырар ауданы",
    village: "Шәуілдір",
    documents: "Ветеринарлық анықтама дайындалуда",
    vaccinationNotes: null,
    status: "PENDING",
    createdAt: new Date(now - 1000 * 60 * 45),
    updatedAt: new Date(now - 1000 * 60 * 30),
    approvedAt: null,
    seller: demoSellers[2],
    photos: [
      {
        id: "photo-goat-1",
        url: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80",
        alt: "Сүтті ешкілер",
        position: 0,
      },
    ],
  },
  {
    id: "lot-auliekol-pending",
    sellerId: "seller-saryarka",
    title: "Әулиекөл тайыншалары",
    species: "CATTLE",
    breed: "Әулиекөл",
    sex: "FEMALE",
    ageMonths: 15,
    weightKg: 310,
    priceKzt: 640000,
    negotiable: false,
    description:
      "Тұқым жаңартуға арналған тайыншалар. Бір шаруашылықтан, күйі жақсы.",
    region: "Қарағанды облысы",
    district: "Нұра ауданы",
    village: "Кертінді",
    documents: "Тұқымдық куәлік",
    vaccinationNotes: "Толық тексерістен өткен",
    status: "PENDING",
    createdAt: new Date(now - 1000 * 60 * 70),
    updatedAt: new Date(now - 1000 * 60 * 60),
    approvedAt: null,
    seller: demoSellers[0],
    photos: [
      {
        id: "photo-auliekol-1",
        url: "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80",
        alt: "Әулиекөл тайыншалары",
        position: 0,
      },
    ],
  },
];
