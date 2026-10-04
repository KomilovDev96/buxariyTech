import type { PrismaClient } from '@prisma/client';
import type { BusinessSolution } from '@buhariy/contracts';
type Content = Pick<
  BusinessSolution,
  'title' | 'description' | 'audience' | 'features' | 'workflow' | 'outcome'
>;
const concepts: {
  slug: string;
  sector: BusinessSolution['sector'];
  content: Record<'uz' | 'ru' | 'en', Content>;
}[] = [
  {
    slug: 'production-management',
    sector: 'MANUFACTURING',
    content: {
      uz: {
        title: 'Ishlab chiqarishni boshqarish',
        description:
          'Buyurtma, tannarx, xomashyo va tayyor mahsulotni yagona jarayonda bog‘lash uchun yechim konsepsiyasi.',
        audience: 'Sexlar, kichik zavodlar va buyurtma asosida ishlab chiqaradigan korxonalar.',
        features: [
          'Buyurtma va tannarx hisob-kitobi',
          'Xomashyo sarfi va ombor qoldig‘i',
          'Ishlab chiqarish bosqichlari',
          'To‘lovlar va boshqaruv hisoboti',
        ],
        workflow: [
          'Buyurtma',
          'Hisob-kitob',
          'Xomashyo',
          'Ishlab chiqarish',
          'Topshirish',
          'Moliya',
        ],
        outcome:
          'Taklif etilgan tarkib buyurtma tannarxi, material sarfi va to‘lov holatini birga ko‘rishga qaratilgan. Modullar korxona jarayonlari o‘rganilgach belgilanadi.',
      },
      ru: {
        title: 'Управление производством',
        description:
          'Концепция системы, которая связывает заказы, себестоимость, сырьё и выпуск продукции в один процесс.',
        audience: 'Цеха, небольшие заводы и предприятия с производством под заказ.',
        features: [
          'Расчёт заказа и себестоимости',
          'Расход сырья и остатки склада',
          'Этапы производства',
          'Оплаты и управленческие отчёты',
        ],
        workflow: ['Заказ', 'Расчёт', 'Сырьё', 'Производство', 'Отгрузка', 'Финансы'],
        outcome:
          'Предлагаемый состав помогает связать себестоимость заказа, расход материалов и состояние оплат. Нужные модули определяются после изучения процессов предприятия.',
      },
      en: {
        title: 'Production management',
        description:
          'A system concept connecting orders, production costs, raw materials and finished goods in one workflow.',
        audience: 'Workshops, small factories and businesses manufacturing to order.',
        features: [
          'Order estimates and production costs',
          'Material consumption and stock',
          'Production stages',
          'Payments and management reports',
        ],
        workflow: ['Order', 'Estimate', 'Materials', 'Production', 'Delivery', 'Finance'],
        outcome:
          'The proposed scope connects order costs, material consumption and payment status. Modules are selected after reviewing the actual production process.',
      },
    },
  },
  {
    slug: 'trade-management',
    sector: 'TRADE',
    content: {
      uz: {
        title: 'Savdo va ombor',
        description:
          'Sotuv, mahsulot qoldig‘i va pul oqimini bir-biriga bog‘laydigan tizim konsepsiyasi.',
        audience: 'Chakana savdo, ulgurji yetkazib beruvchilar va onlayn do‘konlar.',
        features: [
          'Mahsulotlar va narxlar katalogi',
          'Sotuv va mijoz buyurtmalari',
          'Ombor kirimi va chiqimi',
          'To‘lovlar va qarzdorlik nazorati',
        ],
        workflow: ['Katalog', 'Buyurtma', 'Ombor', 'Yetkazish', 'To‘lov', 'Hisobot'],
        outcome:
          'Taklif etilgan modullar sotuvdan to to‘lovgacha bo‘lgan jarayonni kuzatishga qaratilgan. Amaldagi hisob tizimlari bilan bog‘lash alohida baholanadi.',
      },
      ru: {
        title: 'Торговля и склад',
        description: 'Концепция системы, объединяющей продажи, остатки товаров и движение денег.',
        audience: 'Розничные магазины, оптовые поставщики и интернет-магазины.',
        features: [
          'Каталог товаров и цен',
          'Продажи и заказы клиентов',
          'Приход и расход склада',
          'Контроль оплат и задолженности',
        ],
        workflow: ['Каталог', 'Заказ', 'Склад', 'Доставка', 'Оплата', 'Отчёт'],
        outcome:
          'Предлагаемые модули позволяют выстроить учёт от продажи до оплаты. Интеграции с действующими учётными системами оцениваются отдельно.',
      },
      en: {
        title: 'Sales and inventory',
        description: 'A system concept bringing sales, stock levels and money movement together.',
        audience: 'Retail shops, wholesalers and online stores.',
        features: [
          'Product and price catalog',
          'Sales and customer orders',
          'Stock receipts and issues',
          'Payments and outstanding balances',
        ],
        workflow: ['Catalog', 'Order', 'Stock', 'Delivery', 'Payment', 'Report'],
        outcome:
          'The proposed modules follow the process from sale to payment. Integration with existing accounting software is scoped separately.',
      },
    },
  },
  {
    slug: 'service-management',
    sector: 'SERVICES',
    content: {
      uz: {
        title: 'Xizmat ko‘rsatish biznesi',
        description:
          'Murojaatdan ish bajarilishi va to‘lovgacha bo‘lgan yo‘l uchun yechim konsepsiyasi.',
        audience: 'Servis markazlari, ustaxonalar va buyurtma bilan ishlaydigan xizmat bizneslari.',
        features: [
          'Mijozlar va murojaatlar',
          'Vazifalar va mas’ul xodimlar',
          'Ish holati va bajarish muddati',
          'Xizmat qiymati va to‘lovlar',
        ],
        workflow: ['Murojaat', 'Baholash', 'Ijrochi', 'Bajarish', 'To‘lov', 'Hisobot'],
        outcome:
          'Taklif etilgan tarkib buyurtma uchun kim mas’ul, ish qaysi bosqichda va to‘lov holati qandayligini ko‘rishga yordam berishga qaratilgan.',
      },
      ru: {
        title: 'Бизнес в сфере услуг',
        description:
          'Концепция решения для работы от первого обращения до выполнения заказа и оплаты.',
        audience: 'Сервисные центры, мастерские и компании, оказывающие услуги по заказам.',
        features: [
          'Клиенты и обращения',
          'Задачи и ответственные сотрудники',
          'Статус работ и сроки',
          'Стоимость услуг и оплаты',
        ],
        workflow: ['Обращение', 'Оценка', 'Исполнитель', 'Работа', 'Оплата', 'Отчёт'],
        outcome:
          'Предлагаемый состав помогает видеть ответственного за заказ, этап выполнения и состояние оплаты. Конкретный процесс настраивается под компанию.',
      },
      en: {
        title: 'Service business operations',
        description:
          'A solution concept covering the journey from the first enquiry to completed work and payment.',
        audience: 'Service centers, workshops and businesses delivering services to order.',
        features: [
          'Customers and enquiries',
          'Tasks and responsible staff',
          'Work status and deadlines',
          'Service prices and payments',
        ],
        workflow: ['Enquiry', 'Estimate', 'Assignee', 'Work', 'Payment', 'Report'],
        outcome:
          'The proposed scope connects responsibility, job progress and payment status. The specific workflow is adapted to the company.',
      },
    },
  },
];
export const fixflow: Record<'uz' | 'ru' | 'en', Content> = {
  uz: {
    title: 'FixFlow',
    description:
      'Filiallar uchun servis-desk: murojaatlarni qabul qilish, ijrochilarni tayinlash, ishni tekshirish va xizmat xarajatlarini kuzatish — yagona tizimda.',
    audience: 'Bir nechta filial, savdo nuqtasi yoki xizmat ko‘rsatish obyektiga ega bizneslar.',
    features: [
      'Filiallar va obyektlar bo‘yicha arizalar',
      'Ijrochilar, ustuvorliklar va muddatlar',
      'Foto, video va chek bilan bajarilgan ish hisoboti',
      'Ish qiymati va material xarajatlari',
      'Telegram bildirishnomalari va Mini App',
      'Ijrochilar tahlili va Excel hisobotlari',
    ],
    workflow: ['Murojaat', 'Tasdiqlash', 'Ijrochi', 'Bajarish', 'Tekshirish', 'Hisobot'],
    outcome:
      'Rahbar qaysi filialda muammo borligini, kim uni bajarayotganini va ishga qancha xarajat ketganini kuzatishi mumkin. Yakuniy hisobotda ish qiymati, material xarajatlari va tasdiqlovchi fayllar saqlanadi.\nMoslashtirish, foydalanuvchilarni o‘rgatish va qo‘llab-quvvatlash hajmi alohida kelishiladi.',
  },
  ru: {
    title: 'FixFlow',
    description:
      'Сервис-деск для филиалов: обращения, назначение исполнителей, проверка выполненных работ и учёт расходов на обслуживание в одной системе.',
    audience: 'Бизнес с несколькими филиалами, торговыми точками или обслуживаемыми объектами.',
    features: [
      'Заявки по филиалам и объектам',
      'Исполнители, приоритеты и сроки',
      'Отчёты с фото, видео и чеками',
      'Стоимость работ и расходы на материалы',
      'Уведомления Telegram и Mini App',
      'Аналитика исполнителей и отчёты Excel',
    ],
    workflow: ['Обращение', 'Согласование', 'Исполнитель', 'Выполнение', 'Проверка', 'Отчёт'],
    outcome:
      'Руководитель видит, где возникла проблема, кто за неё отвечает и какие расходы связаны с выполненной работой. В отчёте сохраняются стоимость работ, затраты на материалы и подтверждающие файлы.\nОбъём адаптации, обучения сотрудников и поддержки согласуется отдельно.',
  },
  en: {
    title: 'FixFlow',
    description:
      'A service desk for branch operations: requests, task assignment, work review and maintenance cost tracking in one system.',
    audience: 'Businesses with multiple branches, retail locations or service sites.',
    features: [
      'Requests linked to branches and sites',
      'Assignees, priorities and deadlines',
      'Completion reports with photos, video and receipts',
      'Work charges and material expenses',
      'Telegram notifications and Mini App',
      'Executor analytics and Excel reports',
    ],
    workflow: ['Request', 'Approval', 'Assignment', 'Work', 'Review', 'Report'],
    outcome:
      'Managers can see where an issue occurred, who is responsible and the costs recorded for completed work. Reports retain work charges, material expenses and supporting files.\nAdaptation, staff training and support scope are agreed separately.',
  },
};
export async function seedSolutions(db: PrismaClient) {
  for (const locale of ['uz', 'ru', 'en'] as const) {
    await db.businessSolution.upsert({
      where: { slug_locale: { slug: 'fixflow', locale } },
      update: {},
      create: {
        ...fixflow[locale],
        slug: 'fixflow',
        locale,
        sector: 'FINANCE',
        readiness: 'AVAILABLE',
        featured: true,
        published: true,
        order: 0,
      },
    });
    for (const [i, item] of concepts.entries())
      await db.businessSolution.upsert({
        where: { slug_locale: { slug: item.slug, locale } },
        update: {},
        create: {
          ...item.content[locale],
          slug: item.slug,
          locale,
          sector: item.sector,
          readiness: 'CONCEPT',
          published: true,
          order: i + 1,
        },
      });
  }
}
