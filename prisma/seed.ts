import { seedSolutions } from './solution-seed';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
const db = new PrismaClient();
async function main() {
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD.length < 12
  )
    throw new Error('Set strong ADMIN_EMAIL/ADMIN_PASSWORD');
  await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      name: 'Administrator',
      role: 'ADMIN',
      passwordHash: await argon2.hash(process.env.ADMIN_PASSWORD, { type: argon2.argon2id }),
    },
  });
  const categories = [
    ['Web', 'web'],
    ['Telegram', 'telegram'],
    ['Automation', 'automation'],
    ['AI', 'ai'],
    ['Business Systems', 'business-systems'],
  ];
  for (const [name, slug] of categories)
    await db.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
  for (const name of ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL', 'Python', 'React']) {
    const slug = name.toLowerCase().replace('.', '-');
    await db.technology.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  const services = [
    [
      'Biznes avtomatlashtirish',
      'automation',
      'Qo‘lda bajariladigan jarayonlarni avtomatlashtirib, vaqt va resurslarni tejaymiz.',
      'workflow',
    ],
    [
      'Web dasturlash',
      'web-development',
      'Korporativ saytlardan e-commerce va murakkab web-platformalargacha.',
      'code',
    ],
    [
      'Telegram botlar',
      'telegram-bots',
      'Buyurtma, mijozlar bilan aloqa va xizmatlarni Telegram orqali avtomatlashtiramiz.',
      'bot',
    ],
    [
      'AI yechimlar',
      'ai-solutions',
      'Sun’iy intellektni biznes jarayonlariga integratsiya qilamiz.',
      'brain',
    ],
    [
      'Biznes tizimlari',
      'business-systems',
      'CRM, ERP va kompaniyangizga mos maxsus boshqaruv tizimlarini yaratamiz.',
      'database',
    ],
    [
      'API va integratsiyalar',
      'integrations',
      'Turli xizmatlar va platformalarni yagona, ishonchli tizimga birlashtiramiz.',
      'plug',
    ],
  ];
  for (let order = 0; order < services.length; order++) {
    const [title, slug, description, icon] = services[order];
    await db.service.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        description,
        icon,
        order,
        published: true,
        body:
          description +
          '\n\nAvval biznesingizdagi jarayonlarni o‘rganamiz. Maqsadlar, foydalanuvchilar va mavjud tizimlarni tahlil qilib, sizga mos arxitekturani taklif qilamiz.\n\nTahlil va rejalashtirish → Dizayn va ishlab chiqish → Sinov va ishga tushirish → Qo‘llab-quvvatlash.\n\nHar bir loyiha individual baholanadi. Vazifa, murakkablik va maqsadga qarab eng maqbul yechimni birgalikda belgilaymiz.',
      },
    });
  }
  const concepts = [
    [
      'Savdo OS',
      'savdo-os',
      'business-systems',
      'Savdo, ombor va mijozlar — bitta boshqaruv markazida.',
      'Tarqoq ma’lumotlar o‘rniga yagona ish muhiti.',
    ],
    [
      'Buyurtma Bot',
      'buyurtma-bot',
      'telegram',
      'Telegram orqali buyurtma qabul qilish uchun konsept.',
      'Mijoz buyurtmasini sodda va izchil jarayonga aylantirish.',
    ],
    [
      'Insight AI',
      'insight-ai',
      'ai',
      'Biznes ma’lumotlari bilan ishlaydigan AI yordamchi konsepti.',
      'Ichki bilimlardan kerakli javobni tez topish.',
    ],
  ];
  const caseDetails: Record<
    string,
    { goal: string; businessContext: string; aiContribution: string }
  > = {
    'savdo-os': {
      goal: 'Konseptning maqsadi — savdo, ombor va mijozlar bilan ishlashni yagona tizimga birlashtirish. Rahbar buyurtma holatini, operator mijoz tarixini, omborchi esa mahsulot qoldig‘ini bir xil ma’lumot manbasidan ko‘radi.',
      businessContext:
        'Savdo kompaniyasi uchun taklif etilgan model: mijoz, mahsulot, buyurtma, to‘lov va ombor harakati. Har bir buyurtma mijozga va mahsulotlarga bog‘lanadi; status o‘zgarishlari mas’ul xodim tomonidan boshqariladi.\nTurli rollarga turli vakolatlar berilishi rejalashtiriladi. Bu yondashuv takroriy yozuvlar va bir-biriga mos kelmaydigan hisobotlarni kamaytirishga qaratilgan.',
      aiContribution: '',
    },
    'buyurtma-bot': {
      goal: 'Konseptning maqsadi — mijoz Telegram ichida mahsulot tanlashi, buyurtma yuborishi va uning holatini bilishi uchun izchil yo‘l yaratish. Operatorga esa buyurtmalarni bir joyda ko‘rib chiqish imkonini berish.',
      businessContext:
        'Asosiy obyektlar: Telegram foydalanuvchisi, katalog, savat, buyurtma, yetkazish manzili va buyurtma statusi. Mijoz katalogdan boshlaydi, operator buyurtmani tekshiradi va bajarish holatini yangilaydi.\nTaklif etilgan integratsiya orqali bot va boshqaruv paneli bitta ma’lumot manbasi bilan ishlashi ko‘zda tutiladi.',
      aiContribution: '',
    },
    'insight-ai': {
      goal: 'Konseptning maqsadi — xodimlar tasdiqlangan ichki hujjatlardan kerakli ma’lumotni tabiiy tilda topa oladigan yordamchini loyihalash. Javobning manbasini ko‘rish va tekshirish jarayonning bir qismi bo‘ladi.',
      businessContext:
        'Taklif etilgan biznes obyektlari: hujjat, hujjat versiyasi, bilim bo‘lagi, foydalanuvchi roli, savol va javob manbasi. Hujjat egasi materialni yangilaydi; foydalanuvchi faqat o‘z vakolatiga mos bilimlar bilan ishlaydi.',
      aiContribution:
        'Taklif etilgan AI yondashuvi — RAG: savolga mos hujjat bo‘laklari topiladi va model shu manbalarga tayangan holda javob loyihasini tuzadi. Javob yonida foydalanilgan manbalar ko‘rsatilishi rejalashtiriladi.\nManba yetarli bo‘lmasa, yordamchi bu haqda ochiq aytishi kerak. Muhim qarorlar inson tomonidan tekshiriladi; model mustaqil ravishda biznes yozuvlarini o‘zgartirmaydi. Bu konsept: model aniqligi yoki biznes samarasi bo‘yicha o‘lchangan natijalar hali yo‘q.',
    },
  };
  for (const [title, slug, cat, shortDescription, challenge] of concepts) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: cat } });
    const tech = await db.technology.findMany({ take: 3, orderBy: { name: 'asc' } });
    await db.project.upsert({
      where: { slug },
      update: {},
      create: {
        ...caseDetails[slug],
        title,
        slug,
        shortDescription,
        description:
          shortDescription +
          ' Bu namoyish uchun ishlab chiqilgan konsept. Haqiqiy mijoz loyihasi yoki o‘lchangan biznes natijasi sifatida taqdim etilmaydi.',
        challenge,
        solution:
          'Biznes vazifasiga mos interfeys, aniq ma’lumotlar modeli va integratsiya arxitekturasi.',
        result:
          'Concept Project — mahsulot yondashuvini ko‘rsatish uchun. Amaliy natijalar hali o‘lchanmagan.',
        year: 2026,
        concept: true,
        published: true,
        featured: true,
        categoryId: category.id,
        technologies: { connect: tech.map((t) => ({ id: t.id })) },
      },
    });
  }
  // Only populate newly introduced empty fields on known concept records.
  // Existing editorial content and real client projects remain untouched.
  for (const [slug, detail] of Object.entries(caseDetails)) {
    for (const field of ['goal', 'businessContext', 'aiContribution'] as const) {
      if (detail[field])
        await db.project.updateMany({
          where: { slug, concept: true, [field]: '' },
          data: { [field]: detail[field] },
        });
    }
  }
  await db.privacyPolicy.upsert({
    where: { version: 'local-preview-v1' },
    update: {},
    create: {
      version: 'local-preview-v1',
      title: 'Maxfiylik siyosati — mahalliy sinov nusxasi',
      active: true,
      content:
        'Bu mahalliy sinov uchun tayyorlangan matn. Ommaviy ishga tushirishdan oldin kompaniya tomonidan tasdiqlangan maxfiylik siyosati bilan almashtirilishi kerak.\n\nAriza yuborilganda ism, telefon, ixtiyoriy Telegram va kompaniya nomi, tanlangan xizmat, budjet va loyiha tavsifi saqlanadi. Ushbu ma’lumotlar murojaatni ko‘rib chiqish va loyiha bo‘yicha bog‘lanish uchun ishlatiladi. Rozilik berilgan vaqt va siyosat versiyasi ham saqlanadi.\n\nMa’lumotlarni faqat vakolatli administratorlar ko‘radi. Administratorlarning ichki qaydlari ommaga ko‘rsatilmaydi.\n\nKompaniyaning yuridik nomi, aloqa manzili, saqlash muddatlari va ma’lumotlarga oid murojaat tartibi tasdiqlangan siyosatda ko‘rsatilishi lozim. Sinov muhitiga haqiqiy shaxsiy ma’lumotlarni kiritmang.',
    },
  });
  await db.setting.upsert({
    where: { key: 'tagline' },
    update: {},
    create: { key: 'tagline', value: 'Qadriyatlardan kelajakka', public: true },
  });
  await seedSolutions(db);
  console.log('Seed complete. Existing records and administrator passwords were preserved.');
}
main().finally(() => db.$disconnect());
