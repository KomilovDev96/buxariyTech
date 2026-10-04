import { z } from 'zod';
export const roles = ['ADMIN', 'EDITOR'] as const;
export const statuses = [
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'DISCUSSION',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'REJECTED',
] as const;
export const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export const serviceOptions = [
  'Website',
  'Telegram Bot',
  'Business Automation',
  'AI Solutions',
  'CRM / Business System',
  'E-commerce',
  'Custom Software',
  'API Integration',
  'Other',
] as const;
export const MAX_PROJECT_IMAGES = 5;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const text = (max = 200) => z.string().trim().max(max);
const slug = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');
const optionalUrl = z.union([
  z.literal(''),
  z
    .url()
    .refine(
      (v) => v.startsWith('https://') || v.startsWith('http://localhost:'),
      'HTTPS URL required',
    ),
]);
export const loginSchema = z
  .object({ email: z.email().toLowerCase(), password: z.string().min(1).max(128) })
  .strict();
export const projectSchema = z
  .object({
    title: text().min(2),
    slug,
    shortDescription: text(500).min(10),
    description: text(20000).min(10),
    goal: text(6000).default(''),
    businessContext: text(6000).default(''),
    aiContribution: text(6000).default(''),
    challenge: text(6000).default(''),
    solution: text(6000).default(''),
    result: text(6000).default(''),
    categoryId: z.string().nullable().default(null),
    technologyIds: z.array(z.string()).max(30).default([]),
    client: text().default(''),
    year: z.number().int().min(1990).max(2100),
    concept: z.boolean().default(true),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
  })
  .strict();
// Zod defaults also run inside optional fields. A PATCH must preserve omitted values.
export const projectPatchSchema = projectSchema.partial().extend({
  goal: projectSchema.shape.goal.removeDefault().optional(),
  businessContext: projectSchema.shape.businessContext.removeDefault().optional(),
  aiContribution: projectSchema.shape.aiContribution.removeDefault().optional(),
  challenge: projectSchema.shape.challenge.removeDefault().optional(),
  solution: projectSchema.shape.solution.removeDefault().optional(),
  result: projectSchema.shape.result.removeDefault().optional(),
  categoryId: projectSchema.shape.categoryId.removeDefault().optional(),
  technologyIds: projectSchema.shape.technologyIds.removeDefault().optional(),
  client: projectSchema.shape.client.removeDefault().optional(),
  concept: projectSchema.shape.concept.removeDefault().optional(),
  featured: projectSchema.shape.featured.removeDefault().optional(),
  published: projectSchema.shape.published.removeDefault().optional(),
});
export const taxonomySchema = z.object({ name: text(80).min(1), slug }).strict();
export const serviceSchema = z
  .object({
    title: text().min(2),
    slug,
    description: text(1000).min(10),
    body: text(20000).min(10),
    icon: z.enum(['code', 'bot', 'workflow', 'brain', 'database', 'plug']).default('code'),
    order: z.number().int().min(0).max(1000).default(0),
    published: z.boolean().default(false),
  })
  .strict();
export const teamSchema = z
  .object({
    name: text().min(2),
    position: text().min(2),
    photo: optionalUrl.default(''),
    bio: text(3000).default(''),
    skills: z.array(text(80)).max(20).default([]),
    linkedin: z
      .union([
        z.literal(''),
        z
          .url()
          .refine(
            (v) =>
              new URL(v).hostname === 'www.linkedin.com' || new URL(v).hostname === 'linkedin.com',
            'LinkedIn URL required',
          ),
      ])
      .default(''),
    telegram: z
      .union([z.literal(''), z.string().regex(/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,32}$/)])
      .default(''),
    order: z.number().int().min(0).max(1000).default(0),
    published: z.boolean().default(false),
  })
  .strict();
export const requestSchema = z
  .object({
    name: text(120).min(2),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{7,24}$/, 'Telefon raqamini tekshiring'),
    telegram: text(33)
      .regex(/^@?[a-zA-Z0-9_]{5,32}$|^$/)
      .default(''),
    company: text().default(''),
    service: z.enum(serviceOptions),
    budget: text(100).default(''),
    description: text(8000).min(20),
    consentGiven: z.literal(true),
    privacyPolicyVersion: text(80).min(1),
    website: z.string().max(0).default(''),
  })
  .strict();
export const requestPatchSchema = z
  .object({
    status: z.enum(statuses).optional(),
    priority: z.enum(priorities).optional(),
    assignedToId: z.string().nullable().optional(),
  })
  .strict();
export const noteSchema = z.object({ body: text(5000).min(1) }).strict();
export const userSchema = z
  .object({
    email: z.email().toLowerCase(),
    name: text(120).min(2),
    password: z.string().min(12).max(128),
    role: z.enum(roles),
  })
  .strict();
export const userPatchSchema = z
  .object({
    name: text(120).min(2).optional(),
    role: z.enum(roles).optional(),
    active: z.boolean().optional(),
    password: z.string().min(12).max(128).optional(),
  })
  .strict();
export const imagePatchSchema = z
  .object({ alt: text(300).optional(), isCover: z.literal(true).optional() })
  .strict();
export const imageOrderSchema = z
  .object({
    ids: z
      .array(z.string())
      .min(1)
      .max(5)
      .refine((v) => new Set(v).size === v.length, 'Duplicate image IDs'),
  })
  .strict();
export const settingSchema = z
  .object({
    key: text(80).regex(/^[a-z][a-zA-Z0-9_]*$/),
    value: text(5000),
    public: z.boolean().default(false),
  })
  .strict();
export const policySchema = z
  .object({
    version: slug,
    title: text().min(3),
    content: text(30000).min(100),
    active: z.boolean().default(false),
  })
  .strict();
export type ProjectInput = z.infer<typeof projectSchema>;
export type LeadInput = z.infer<typeof requestSchema>;
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: (typeof roles)[number];
  active: boolean;
};
export type Taxonomy = { id: string; name: string; slug: string };
export type ProjectImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
};
export type Project = Omit<ProjectInput, 'technologyIds'> & {
  id: string;
  category: Taxonomy | null;
  technologies: Taxonomy[];
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
};
export type Service = z.infer<typeof serviceSchema> & { id: string };
export type TeamMember = z.infer<typeof teamSchema> & { id: string };
export type PrivacyPolicy = z.infer<typeof policySchema> & { createdAt: string };
export type Lead = Omit<LeadInput, 'website'> & {
  id: string;
  status: (typeof statuses)[number];
  priority: (typeof priorities)[number];
  assignedToId: string | null;
  assignedTo: SafeUser | null;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
  notes: { id: string; body: string; createdAt: string; author: Pick<SafeUser, 'name' | 'id'> }[];
};
export type Page<T> = { items: T[]; total: number; page: number; pages: number };
export type Dashboard = {
  projects: number;
  published: number;
  drafts: number;
  newRequests: number;
  inProgress: number;
  team: number;
  activity: {
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user: { name: string } | null;
  }[];
};
export type Setting = z.infer<typeof settingSchema>;
export type ApiError = { success: false; message: string; code: string };

export const siteBlockKeys = ['hero', 'story', 'cta', 'solutions'] as const;
export const contentLocales = ['uz', 'ru', 'en'] as const;
export const siteBlockSchema = z
  .object({
    title: text(240).min(2),
    body: text(6000).default(''),
    label: text(120).default(''),
    imageAlt: text(300).default(''),
  })
  .strict();
export type SiteBlock = z.infer<typeof siteBlockSchema> & {
  key: (typeof siteBlockKeys)[number];
  locale: (typeof contentLocales)[number];
  imageUrl: string;
};

export const siteBlockDefaults: SiteBlock[] = [
  {
    key: 'solutions',
    locale: 'uz',
    title: 'Biznesingizga mos yechim.',
    body: 'Mahsulotni tanlang. Kerakli modullar va moslashtirish hajmini birga belgilaymiz — hisob-kitobdan moliyaviy hisobotgacha.',
    label: 'MAHSULOTLAR / AVTOMATLASHTIRISH',
    imageAlt: '',
    imageUrl: '',
  },
  {
    key: 'solutions',
    locale: 'ru',
    title: 'Решения под вашу сферу бизнеса.',
    body: 'Выберите продукт и нужные модули. Вместе определим объём адаптации — от расчёта заказа до финансовых отчётов.',
    label: 'ПРОДУКТЫ / АВТОМАТИЗАЦИЯ',
    imageAlt: '',
    imageUrl: '',
  },
  {
    key: 'solutions',
    locale: 'en',
    title: 'Solutions that fit your business.',
    body: 'Choose a product and the modules you need. We will define the adaptation scope together, from order estimates to financial reporting.',
    label: 'PRODUCTS / AUTOMATION',
    imageAlt: '',
    imageUrl: '',
  },
  {
    key: 'hero',
    locale: 'uz',
    title: 'Biznesingiz uchun\nzamonaviy\nraqamli yechimlar.',
    body: 'Biznes jarayonlaringizni avtomatlashtiramiz, raqamlashtiramiz va rivojlanishingiz uchun kuchli texnologik tizimlar yaratamiz.',
    label: 'BUXORO, O‘ZBEKISTON',
    imageAlt: 'Buxoro — Kalon minorasi',
    imageUrl: '/images/bukhara.webp',
  },
  {
    key: 'story',
    locale: 'uz',
    title: 'Buxorodan — kelajakka',
    body: 'Buxoro asrlar davomida ilm, savdo, hunarmandchilik va qadriyatlar chorrahasi bo‘lib kelgan. BUHARIY TECH ana shu merosni zamonaviy texnologiyalar bilan davom ettiradi.',
    label: '08 / ILDIZLARIMIZ',
    imageAlt: 'Buxoro — Kalon minorasi',
    imageUrl: '/images/bukhara.webp',
  },
  {
    key: 'cta',
    locale: 'uz',
    title: 'Biznesingizni keyingi bosqichga olib chiqishga tayyormisiz?',
    body: 'G‘oyangiz bo‘lsa, biz uni ishlaydigan raqamli yechimga aylantiramiz.',
    label: 'KELAJAKNI BIRGA QURAMIZ',
    imageAlt: '',
    imageUrl: '',
  },
  {
    key: 'hero',
    locale: 'ru',
    title: 'Современные\nцифровые решения\nдля вашего бизнеса.',
    body: 'Автоматизируем бизнес-процессы и создаём технологические системы для развития вашей компании.',
    label: 'БУХАРА, УЗБЕКИСТАН',
    imageAlt: 'Buxoro — Kalon minorasi',
    imageUrl: '/images/bukhara.webp',
  },
  {
    key: 'story',
    locale: 'ru',
    title: 'Из Бухары — в будущее',
    body: 'Buxoro asrlar davomida ilm, savdo, hunarmandchilik va qadriyatlar chorrahasi bo‘lib kelgan. BUHARIY TECH ana shu merosni zamonaviy texnologiyalar bilan davom ettiradi.',
    label: '08 / ILDIZLARIMIZ',
    imageAlt: 'Buxoro — Kalon minorasi',
    imageUrl: '/images/bukhara.webp',
  },
  {
    key: 'cta',
    locale: 'ru',
    title: 'Biznesingizni keyingi bosqichga olib chiqishga tayyormisiz?',
    body: 'G‘oyangiz bo‘lsa, biz uni ishlaydigan raqamli yechimga aylantiramiz.',
    label: 'KELAJAKNI BIRGA QURAMIZ',
    imageAlt: '',
    imageUrl: '',
  },
  {
    key: 'hero',
    locale: 'en',
    title: 'Modern digital\nsolutions for\nyour business.',
    body: 'We automate business processes and build reliable technology systems to help your company grow.',
    label: 'BUKHARA, UZBEKISTAN',
    imageAlt: 'Buxoro — Kalon minorasi',
    imageUrl: '/images/bukhara.webp',
  },
  {
    key: 'story',
    locale: 'en',
    title: 'From Bukhara to the future',
    body: 'Buxoro asrlar davomida ilm, savdo, hunarmandchilik va qadriyatlar chorrahasi bo‘lib kelgan. BUHARIY TECH ana shu merosni zamonaviy texnologiyalar bilan davom ettiradi.',
    label: '08 / ILDIZLARIMIZ',
    imageAlt: 'Buxoro — Kalon minorasi',
    imageUrl: '/images/bukhara.webp',
  },
  {
    key: 'cta',
    locale: 'en',
    title: 'Biznesingizni keyingi bosqichga olib chiqishga tayyormisiz?',
    body: 'G‘oyangiz bo‘lsa, biz uni ishlaydigan raqamli yechimga aylantiramiz.',
    label: 'KELAJAKNI BIRGA QURAMIZ',
    imageAlt: '',
    imageUrl: '',
  },
];

export const solutionSectors = ['FINANCE', 'MANUFACTURING', 'TRADE', 'SERVICES'] as const;
export const solutionSchema = z
  .object({
    title: text(160).min(2),
    slug,
    locale: z.enum(contentLocales),
    sector: z.enum(solutionSectors),
    description: text(1200).min(10),
    audience: text(400).min(3),
    features: z.array(text(180).min(2)).min(1).max(10),
    workflow: z.array(text(100).min(2)).max(8).default([]),
    outcome: text(2000).default(''),
    priceLabel: text(200).default(''),
    readiness: z.enum(['CONCEPT', 'AVAILABLE']).default('CONCEPT'),
    featured: z.boolean().default(false),
    order: z.number().int().min(0).max(1000).default(0),
    published: z.boolean().default(false),
  })
  .strict();
export type BusinessSolution = z.infer<typeof solutionSchema> & { id: string };
