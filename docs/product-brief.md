# BUHARIY TECH — FULL-STACK PRODUCT BUILD

Ты — senior full-stack engineer, software architect и product designer.

Твоя задача — спроектировать и реализовать production-ready веб-платформу для IT-компании **BUHARIY TECH**.

Это НЕ обычный landing page.

Нужно создать полноценную систему:

**Public Website + Portfolio CMS + Admin Panel + Lead Management + Backend API + Database + Media Storage + Authentication**

---

# 1. COMPANY

## Brand

**BUHARIY TECH**

## Tagline

**Qadriyatlardan kelajakka**

Перевод по смыслу:

**От ценностей — к будущему.**

## Company positioning

BUHARIY TECH — технологическая компания из Бухары, которая создаёт цифровые решения для бизнеса.

Мы не позиционируем себя просто как web-studio.

Основная идея:

> Мы превращаем бизнес-процессы в современные цифровые системы.

Компания может создавать решения любого уровня сложности:

* Telegram bots
* Websites
* Web applications
* Business automation
* CRM
* ERP
* AI solutions
* API integrations
* E-commerce
* High-load systems
* Custom software
* Internal business platforms
* SaaS products

Главная идея:

> **Oddiy Telegram botdan tortib, murakkab va yuqori yuklamali texnologik tizimlargacha.**

---

# 2. BRAND STORY

Компания связана с Бухарой.

Бухара исторически была местом:

* знаний;
* торговли;
* науки;
* ремесла;
* культуры;
* обмена идеями.

BUHARIY TECH переносит эту философию в цифровую эпоху.

Главная brand message:

> **Qadriyatlardan kelajakka**

Дополнительная идея:

> **Buxorodan — kelajakka.**

Не превращай сайт в туристический сайт Бухары.

Бухара должна быть частью identity, а не основным продуктом.

Соотношение:

**Technology 80% / Heritage 20%**

---

# 3. TARGET AUDIENCE

Основные пользователи:

1. Business owners
2. Entrepreneurs
3. Small and medium businesses
4. Growing companies
5. E-commerce businesses
6. Companies requiring automation
7. Companies requiring custom software
8. Companies looking for AI solutions

Главный пользователь сайта должен подумать:

> «Эти ребята могут решить мою задачу, даже если она сложная».

---

# 4. CORE VALUE PROPOSITION

Не использовать банальное:

> "We build websites and apps."

Использовать:

### Uzbek

**Biznesingiz uchun murakkab raqamli yechimlar**

Подзаголовок:

**Biznes jarayonlaringizni avtomatlashtiramiz, raqamlashtiramiz va rivojlanishingiz uchun kuchli texnologik tizimlar yaratamiz.**

Также использовать:

**Oddiy Telegram botdan tortib, yuqori yuklamali va murakkab tizimlargacha.**

---

# 5. LANGUAGE

Основной язык:

**Uzbek Latin**

Тексты должны звучать естественно для современного узбекского бизнеса.

Не использовать чрезмерно официальный язык.

Дополнительные языки:

* UZ
* RU
* EN

Архитектура должна позволять легко добавить полноценную локализацию.

Не хардкодить язык во всех компонентах.

Использовать translation dictionary / i18n architecture.

---

# 6. TECH STACK

Использовать:

## Public Frontend

**Next.js**
**TypeScript**
**Tailwind CSS**
**Framer Motion**

Использовать App Router.

Next.js должен использоваться с правильным разделением:

* Server Components
* Client Components только там, где необходимо
* SSR/SSG/ISR где это имеет смысл

---

# 7. ADMIN PANEL

Admin должен быть отдельным приложением.

Использовать:

**React + TypeScript + Vite**

UI:

**Tailwind CSS**

Компоненты:

**shadcn/ui**

Icons:

**Lucide React**

---

# 8. BACKEND

Использовать:

**NestJS + TypeScript**

Не использовать хаотичный Express-style architecture.

Создать модульную архитектуру NestJS.

Пример:

```text
src/
  auth/
  users/
  projects/
  project-images/
  services/
  requests/
  team/
  media/
  settings/
  notifications/
  common/
```

Каждый модуль должен иметь понятную структуру:

```text
module
controller
service
dto
entities / schemas
guards
interfaces
```

---

# 9. DATABASE

Использовать:

**PostgreSQL**

ORM:

**Prisma**

Database должна быть спроектирована заранее.

Основные entities:

```text
User
Role
Project
ProjectImage
Service
Category
Technology
ClientRequest
TeamMember
Setting
PrivacyPolicy
```

---

# 10. PROJECT / PORTFOLIO CMS

Portfolio является одной из самых важных частей системы.

Admin должен иметь:

### Projects

* Create
* Read
* Update
* Delete
* Publish
* Unpublish
* Featured
* Draft

Каждый project:

```text
id
title
slug
shortDescription
description
category
technologies
client
year
coverImage
featured
published
createdAt
updatedAt
```

---

# 11. PROJECT IMAGES

Каждый portfolio project должен поддерживать:

**максимум 5 изображений.**

Не создавать:

```text
image1
image2
image3
image4
image5
```

Вместо этого использовать отдельную relation:

```text
Project
   ↓
ProjectImage[]
```

ProjectImage:

```text
id
projectId
url
alt
sortOrder
isCover
createdAt
```

Admin должен позволять:

* upload image;
* delete;
* replace;
* reorder;
* select cover;
* edit alt text.

Frontend показывает максимум 5 изображений.

Backend должен также enforce limit = 5.

Не полагаться только на frontend validation.

---

# 12. MEDIA STORAGE

Не хранить изображения в PostgreSQL.

Использовать object storage:

предпочтительно:

**Cloudflare R2 / S3-compatible storage**

Создать abstraction:

```text
StorageService
```

чтобы storage provider можно было заменить без переписывания бизнес-логики.

---

# 13. ADMIN DASHBOARD

Dashboard должен показывать:

```text
Projects
Published Projects
Draft Projects
New Requests
Requests in Progress
Team Members
```

Также можно сделать простой activity overview.

Главная цель dashboard:

администратор сразу понимает состояние компании.

---

# 14. LEAD / CLIENT REQUEST SYSTEM

На public website пользователь должен иметь возможность оставить заявку.

Form:

```text
Name
Phone
Telegram username
Company
Service
Budget
Project description
```

Service options:

```text
Website
Telegram Bot
Business Automation
AI Solutions
CRM / Business System
E-commerce
Custom Software
API Integration
Other
```

---

# 15. PRIVACY CONSENT

Перед отправкой:

```text
☐ Men maxfiylik siyosatiga roziman.
```

Ссылка:

**Maxfiylik siyosati**

Backend сохраняет:

```text
consentGiven
consentAt
privacyPolicyVersion
```

Форма не должна отправляться без согласия.

---

# 16. LEAD MANAGEMENT

Это НЕ просто форма.

Admin должен иметь полноценное управление заявками.

Statuses:

```text
NEW
REVIEWING
CONTACTED
DISCUSSION
PROPOSAL
NEGOTIATION
WON
REJECTED
```

Admin может:

* открыть заявку;
* изменить статус;
* добавить internal note;
* назначить ответственного;
* изменить priority;
* посмотреть дату;
* посмотреть contact information.

---

# 17. NEGOTIATION / PRICING PHILOSOPHY

BUHARIY TECH не должен публиковать жёсткий прайс на основные услуги.

Причина:

Каждый проект индивидуальный.

Клиент должен понимать:

> **Har bir loyiha individual baholanadi.**

Использовать:

### **Moslashuvchan narxlash**

Текст:

**Har bir loyiha o‘z vazifasi, murakkabligi va maqsadiga ega. Shuning uchun narx ham individual belgilanadi.**

Также:

**Sifat, vazifa va loyiha murakkabligiga qarab eng maqbul yechimni birgalikda belgilaymiz.**

И CTA:

**Loyihani muhokama qilish**

Важно:

Не позиционировать компанию как «дешёвую».

Идея:

**High quality + individual approach + flexible negotiation.**

---

# 18. TEAM

Компания имеет:

**6+ specialists**

Не выдумывать конкретных сотрудников.

Admin должен позволять добавлять:

```text
Name
Position
Photo
Bio
Skills
LinkedIn
Telegram
Order
Published
```

Frontend:

### **Bizning jamoa**

Текст:

**Turli yo‘nalishdagi mutaxassislar. Bitta maqsad — kuchli raqamli mahsulot.**

Показывать:

**6+ mutaxassis**

только как company statistic, если это соответствует реальному количеству команды.

---

# 19. PUBLIC WEBSITE PAGES

Создать:

```text
/
 /services
 /services/automation
 /services/web-development
 /services/telegram-bots
 /services/ai-solutions
 /services/business-systems
 /portfolio
 /portfolio/[slug]
 /about
 /contact
 /privacy
```

---

# 20. HOME PAGE

Структура:

```text
Header

Hero

Trust / Value Bar

Services

Business Problems

Automation / Complexity section

Process

Portfolio

Results / Benefits

Why BUHARIY TECH

Bukhara Brand Story

Team

CTA

Contact

Footer
```

---

# 21. HERO

Главный заголовок:

### **Biznesingiz uchun zamonaviy raqamli yechimlar**

Подзаголовок:

**Biznes jarayonlaringizni avtomatlashtiramiz, raqamlashtiramiz va rivojlanishingiz uchun kuchli texnologik tizimlar yaratamiz.**

CTA:

**Loyihani boshlash**

Secondary:

**Portfolio ko‘rish**

Small brand line:

**Qadriyatlardan kelajakka**

---

# 22. COMPLEXITY SECTION

Это важнейшая часть позиционирования.

Заголовок:

### **Oddiy g‘oyadan murakkab tizimgacha.**

Покажи визуально:

```text
Telegram Bot
      ↓
Web Application
      ↓
CRM
      ↓
Business Automation
      ↓
AI Systems
      ↓
High-load Platforms
      ↓
Custom Software
```

Текст:

**Vazifa qanchalik murakkab bo‘lmasin, biz texnologik yechim topamiz.**

---

# 23. SERVICES

6–8 карточек.

Основные:

### Business Automation

**Qo‘lda bajariladigan jarayonlarni avtomatlashtirib, vaqt va resurslarni tejaymiz.**

### Telegram Bots

**Buyurtma, mijozlar bilan aloqa, to‘lov va xizmatlarni Telegram orqali avtomatlashtiramiz.**

### Web Development

**Landing page, corporate website, e-commerce va murakkab web-platformalar yaratamiz.**

### AI Solutions

**AI texnologiyalarini biznes jarayonlariga integratsiya qilamiz.**

### Business Systems

**CRM, ERP, dashboard va kompaniyaga mos maxsus tizimlar yaratamiz.**

### API & Integrations

**Turli xizmatlar va platformalarni yagona tizimga birlashtiramiz.**

---

# 24. BUSINESS PROBLEMS

Заголовок:

### **Biznesingiz hali ham qo‘lda boshqariladimi?**

Проблемы:

* Buyurtmalar qo‘lda qabul qilinadi
* Mijozlarga javob berish ko‘p vaqt oladi
* Ma’lumotlar turli joylarda saqlanadi
* Xodimlar bir xil ishlarni takrorlaydi
* Hisobotlar qo‘lda tayyorlanadi
* Mijozlarni nazorat qilish qiyin

Transition:

### **Biz bularni tizimga aylantiramiz.**

---

# 25. PROCESS

### **Qanday ishlaymiz?**

01 — **Tahlil**

02 — **Strategiya**

03 — **Development**

04 — **Launch & Support**

Каждый шаг имеет короткое Uzbek description.

---

# 26. PORTFOLIO

Главный заголовок:

### **Bizning ishlarimiz**

Subheading:

**Har bir loyiha — biznesning aniq muammosiga yechim.**

Filters:

```text
Barchasi
Web
Telegram
Automation
AI
Business Systems
```

Portfolio cards должны показывать:

* cover;
* title;
* category;
* short description;
* technologies;
* arrow.

Click:

`/portfolio/[slug]`

На project page:

```text
Project title
Category
Description
Technologies
Client / industry if available
Year
Gallery up to 5 images
Challenge
Solution
Result
CTA
```

Если реальных кейсов пока нет — использовать demo/concept проекты и визуально обозначить их как:

**Concept Project**

Не выдавать demo как реального клиента.

---

# 27. WHY BUHARIY TECH

### **Nega BUHARIY TECH?**

Cards:

**Biznesni tushunamiz**

**Individual yechim**

**Zamonaviy texnologiyalar**

**Skalalanadigan tizimlar**

**Yuqori darajadagi mutaxassislar**

**Uzoq muddatli qo‘llab-quvvatlash**

---

# 28. BUKHARA STORY

Заголовок:

### **Buxorodan — kelajakka**

Текст:

**Buxoro asrlar davomida ilm, savdo, hunarmandchilik va qadriyatlar chorrahasi bo‘lib kelgan.**

**BUHARIY TECH ana shu merosni zamonaviy texnologiyalar bilan davom ettiradi.**

Главный statement:

### **Qadriyatlardan kelajakka.**

Использовать subtle Bukhara architecture imagery.

Не делать секцию слишком длинной.

---

# 29. TEAM SECTION

Заголовок:

### **Bizning jamoa**

Подзаголовок:

**Turli yo‘nalishdagi mutaxassislar. Bitta maqsad — kuchli raqamli mahsulot.**

Показывать team members из API.

---

# 30. CTA

Заголовок:

### **Biznesingizni keyingi bosqichga olib chiqishga tayyormisiz?**

Text:

**G‘oyangiz bo‘lsa, biz uni ishlaydigan raqamli yechimga aylantiramiz.**

Button:

**Loyihani boshlash**

---

# 31. DESIGN SYSTEM

Brand:

**BUHARIY TECH**

Style:

**Premium / Corporate / Technology / Uzbek Heritage**

Основные цвета:

```text
Deep Black       #0D0D0D
Charcoal         #1F1F1F
Primary Gold     #D4AF7C
Bronze Gold      #8B6F47
Warm White       #F5EFE6
Deep Blue        #2E4A62
```

Основной gradient:

```text
#D4AF7C → #8B6F47
```

Использовать умеренно.

---

# 32. TYPOGRAPHY

Primary:

**Montserrat**

Использовать:

* headings;
* navigation;
* buttons;
* branding.

Secondary:

**Inter**

Использовать:

* body;
* descriptions;
* forms;
* technical information.

Не использовать больше 2 основных font families.

---

# 33. VISUAL LANGUAGE

Использовать:

* deep black backgrounds;
* gold accents;
* warm white;
* subtle blue;
* thin borders;
* editorial spacing;
* premium cards;
* geometric patterns;
* subtle Bukhara-inspired motifs.

Не использовать:

* purple AI gradients;
* neon;
* generic blobs;
* excessive glassmorphism;
* random 3D objects;
* excessive shadows;
* template-looking SaaS UI.

---

# 34. LOGO

Использовать существующий BUHARIY TECH logo.

Основной symbol:

**B monogram**

Логотип основан на:

* букве B;
* архитектурной арке;
* бухарском heritage;
* дороге / направлении;
* золотой геометрии.

Не перерисовывать логотип без необходимости.

---

# 35. ADMIN AUTHENTICATION

Admin должен быть защищён.

Минимально:

```text
Login
Password
Access Token
Refresh Token / secure session
Logout
```

Использовать secure cookies там, где это возможно.

Passwords:

**bcrypt / argon2**

Никогда не хранить plain text passwords.

---

# 36. ROLES

Создать RBAC architecture.

Минимум:

```text
ADMIN
EDITOR
```

ADMIN:

full access.

EDITOR:

может управлять:

* projects;
* portfolio images;
* team;
* services.

Но не должен иметь доступа к системным settings/auth management без permission.

---

# 37. API

REST API.

Пример:

```text
POST   /auth/login

GET    /projects
GET    /projects/:slug

POST   /admin/projects
PATCH  /admin/projects/:id
DELETE /admin/projects/:id

POST   /admin/projects/:id/images
DELETE /admin/projects/:id/images/:imageId

GET    /services

GET    /team

POST   /requests

GET    /admin/requests
PATCH  /admin/requests/:id

GET    /settings
PATCH  /admin/settings
```

Добавить DTO validation.

Использовать:

**class-validator**

или современный equivalent, если архитектура проекта требует другого решения.

---

# 38. SECURITY

Обязательно:

* input validation;
* rate limiting;
* CORS;
* secure headers;
* authentication guards;
* authorization guards;
* password hashing;
* SQL injection protection through Prisma;
* XSS prevention;
* CSRF protection where applicable;
* upload validation;
* MIME type validation;
* image size limits;
* maximum 5 project images;
* API rate limiting for public forms;
* spam protection for contact form.

Не доверять данным frontend.

Все критические ограничения должны проверяться backend.

---

# 39. IMAGE UPLOAD

При upload:

validate:

```text
file type
file size
image dimensions
```

Поддержка:

```text
jpg
jpeg
png
webp
```

Оптимизировать изображения.

Для public website использовать Next.js Image.

Lazy loading где уместно.

---

# 40. CONTACT FORM SECURITY

Public form должен иметь:

* validation;
* rate limit;
* spam protection;
* server-side validation;
* consent validation.

Не раскрывать email/phone администратора через frontend source.

---

# 41. SEO

Каждая public page должна иметь:

* title;
* description;
* canonical;
* Open Graph;
* Twitter/X card;
* semantic headings;
* structured metadata where useful.

Главный SEO title:

**BUHARIY TECH — Biznes uchun raqamli yechimlar**

Description:

**BUHARIY TECH — biznes avtomatlashtirish, Telegram botlar, web-saytlar, AI yechimlar va maxsus raqamli tizimlar yaratadi.**

Создать:

```text
sitemap.xml
robots.txt
```

Portfolio project pages должны иметь dynamic metadata.

---

# 42. PERFORMANCE

Цель:

Быстрый premium website.

Следить за:

* Core Web Vitals;
* image optimization;
* lazy loading;
* server rendering;
* caching;
* bundle size;
* unnecessary client components.

Не превращать весь сайт в Client Component.

---

# 43. RESPONSIVE

Поддержать:

```text
375px
390px
430px
768px
1024px
1280px
1440px+
```

Mobile-first.

Mobile navigation должна быть аккуратной.

CTA должна оставаться доступной.

Portfolio cards должны красиво переходить в vertical layout.

---

# 44. ADMIN UX

Admin должен быть простым.

Sidebar:

```text
Dashboard

Portfolio
  Projects
  Categories

Requests

Services

Team

Settings
```

Dashboard:

```text
Projects
Requests
Team
Published
Drafts
```

Создание проекта должно быть удобным:

```text
Title
Slug
Description
Category
Technologies
Client
Year
Cover
Images
Published
Featured
```

Показывать:

**5 / 5 images**

и запрещать шестую загрузку.

---

# 45. REQUEST DETAIL

Admin request page:

```text
Client name
Phone
Telegram
Company
Service
Budget
Description
Created date
Status
Priority
Assigned manager
Internal notes
Consent information
```

Internal notes никогда не показывать клиенту.

---

# 46. NOTIFICATIONS

Архитектуру подготовить так, чтобы позже можно было добавить:

* Telegram notifications;
* email notifications;
* Slack;
* WhatsApp.

На первом этапе достаточно abstraction:

```text
NotificationService
```

Не связывать бизнес-логику напрямую с конкретным Telegram/email provider.

---

# 47. FUTURE EXTENSIBILITY

Архитектура должна позволять в будущем добавить:

```text
CRM
Clients
Contracts
Invoices
Payments
Project Management
Team Management
Telegram integration
AI assistant
Analytics
Notifications
```

Но НЕ реализовывать всё это сейчас.

Создать правильную foundation.

---

# 48. ENVIRONMENT

Использовать:

```text
.env
.env.example
```

Никогда не коммитить secrets.

Пример:

```text
DATABASE_URL=

JWT_SECRET=

STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=

NEXT_PUBLIC_API_URL=
```

---

# 49. PROJECT STRUCTURE

Предпочтительно monorepo:

```text
buhariy-tech/
│
├── apps/
│   ├── web/
│   ├── admin/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   └── eslint-config/
│
├── prisma/
│
├── docker/
│
├── docs/
│
└── README.md
```

Используй Turborepo или аналогичный monorepo tool, если это действительно улучшает maintainability.

Если считаешь monorepo избыточным для текущего размера — объясни решение перед реализацией.

---

# 50. API TYPES

Не дублировать TypeScript interfaces вручную между frontend/admin/backend.

По возможности создать shared types или использовать OpenAPI generated types.

API contract должен быть централизован.

---

# 51. ERROR HANDLING

Backend должен иметь единый формат ошибок.

Например:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR"
}
```

Frontend должен красиво показывать ошибки пользователю.

Не показывать stack traces production users.

---

# 52. LOGGING

Добавить structured logging.

Логи должны позволять понять:

* request;
* error;
* auth events;
* important admin actions.

Не логировать:

* passwords;
* tokens;
* sensitive client information unnecessarily.

---

# 53. AUDIT LOG

Подготовить возможность audit logging.

В будущем сохранять:

```text
admin user
action
entity
entityId
timestamp
```

Например:

```text
ADMIN created project
ADMIN changed request status
EDITOR updated project
```

---

# 54. DESIGN DETAILS

Hero должен быть визуально сильным.

Использовать:

* logo;
* typography;
* gold accents;
* subtle Bukhara architectural texture;
* sophisticated motion.

Но сайт должен оставаться fast.

Animation duration примерно:

```text
200–600ms
```

Использовать Framer Motion только там, где это улучшает UX.

---

# 55. CONVERSION STRATEGY

Каждая основная секция должна вести к:

**Loyihani boshlash**

или:

**Portfolio ko‘rish**

Главный funnel:

```text
Visitor
 ↓
Understand value
 ↓
See services
 ↓
See portfolio
 ↓
Understand expertise
 ↓
Trust team
 ↓
Contact
 ↓
Lead
 ↓
Admin
 ↓
Discussion
 ↓
Proposal
 ↓
Negotiation
 ↓
Client
```

---

# 56. IMPORTANT BRAND MESSAGE

Сайт должен передавать:

> **Biz kod sotmaymiz. Biz biznes uchun natija yaratamiz.**

И:

> **Vazifa qanchalik murakkab bo‘lmasin, yechim topamiz.**

И:

> **Sifat, moslashuvchanlik va individual yondashuv.**

---

# 57. DO NOT FAKE

Если нет реальных:

* clients;
* projects;
* statistics;
* testimonials;
* awards;
* employees;

не придумывай их как настоящие.

Для demo content явно использовать:

**Concept**
или
**Demo Project**

Никаких фальшивых:

> 150+ clients

> 99% satisfaction

> 500+ projects

если таких данных нет.

---

# 58. DEVELOPMENT PROCESS

Очень важно:

НЕ начинай сразу писать весь код.

Сначала:

### STEP 1

Проанализируй requirements.

### STEP 2

Предложи architecture.

### STEP 3

Предложи database schema.

### STEP 4

Предложи folder structure.

### STEP 5

Предложи API contract.

### STEP 6

Предложи design system.

### STEP 7

Только после этого начинай implementation.

Если проект уже содержит код, сначала изучи существующий код и НЕ ломай работающие части.

---

# 59. IMPLEMENTATION ORDER

После approval/analysis:

### Phase 1

Repository structure

### Phase 2

Database + Prisma

### Phase 3

NestJS API

### Phase 4

Authentication

### Phase 5

Admin

### Phase 6

Public website

### Phase 7

Portfolio CMS

### Phase 8

Lead management

### Phase 9

Media storage

### Phase 10

SEO / performance

### Phase 11

Security

### Phase 12

Testing

### Phase 13

Documentation

---

# 60. TESTING

Добавить:

* unit tests;
* API tests;
* validation tests;
* auth tests;
* portfolio tests;
* upload tests;
* request form tests.

Критические сценарии:

1. Admin login
2. Create project
3. Upload image
4. Upload 6th image → must fail
5. Publish project
6. Public project page
7. Submit contact form
8. Missing privacy consent → must fail
9. Admin sees request
10. Change request status
11. Unauthorized admin endpoint → 401/403
12. Editor cannot perform admin-only actions

---

# 61. DOCUMENTATION

Создать хороший README:

```text
Project overview
Architecture
Tech stack
Installation
Environment variables
Database
Migrations
Development
Production
Deployment
Admin access
API
Storage
Testing
```

Также создать:

```text
docs/
  architecture.md
  database.md
  api.md
  deployment.md
```

---

# 62. FINAL QUALITY BAR

Не принимай решение:

> «Работает — значит готово».

Проверить:

### Product

* Is the site persuasive?
* Is the value proposition clear?
* Is CTA clear?

### Design

* Premium?
* Consistent?
* Uzbek identity?
* Not generic AI-generated?

### Engineering

* Clean architecture?
* Typed?
* Secure?
* Scalable?

### UX

* Mobile?
* Fast?
* Accessible?

### Admin

* Easy to manage?
* Portfolio upload works?
* Request workflow works?

### SEO

* Metadata?
* Sitemap?
* Structured content?

---

# FINAL OBJECTIVE

В результате должен получиться не просто красивый сайт.

Нужно создать **digital foundation BUHARIY TECH**.

Публичный сайт должен продавать компанию.

Админка должна позволять команде самостоятельно управлять контентом.

Backend должен быть фундаментом будущей CRM/internal platform.

Главное ощущение пользователя:

> **BUHARIY TECH — это команда сильных специалистов, которая может построить цифровое решение практически любой сложности.**

Финальный brand statement:

# BUHARIY TECH

## Qadriyatlardan kelajakka

**Biznes uchun zamonaviy raqamli yechimlar.**
