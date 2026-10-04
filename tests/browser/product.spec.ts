import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const db = new PrismaClient();
const sharp = createRequire(resolve('apps/api/package.json'))('sharp');
const tag = Date.now().toString(36),
  name = `Browser Test ${tag}`,
  slug = `browser-${tag}`;
let projectId = '';
const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => errors.push(error.message));
});
test.afterAll(async () => {
  await db.requestNote.deleteMany({ where: { request: { name } } });
  await db.clientRequest.deleteMany({ where: { name } });
  if (projectId) {
    const images = await db.projectImage.findMany({ where: { projectId } });
    if (images.length) {
      const { S3Client, DeleteObjectCommand } = createRequire(resolve('apps/api/package.json'))(
        '@aws-sdk/client-s3',
      );
      const client = new S3Client({
        endpoint: process.env.STORAGE_ENDPOINT,
        region: 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.STORAGE_ACCESS_KEY,
          secretAccessKey: process.env.STORAGE_SECRET_KEY,
        },
      });
      for (const image of images)
        await client.send(
          new DeleteObjectCommand({ Bucket: process.env.STORAGE_BUCKET, Key: image.key }),
        );
    }
    await db.project.deleteMany({ where: { id: projectId } });
    await db.auditLog.deleteMany({ where: { entityId: projectId } });
  }
  await db.$disconnect();
});
test('public routes, language switching and responsive layouts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Biznesingiz uchun');
  await expect(page.locator('.arch-photo img')).toBeVisible();
  for (const width of [375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `overflow at ${width}`,
    ).toBe(true);
  }
  mkdirSync('.local/previews', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: '.local/previews/home-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.local/previews/home-mobile.png' });
  await page.getByRole('button', { name: 'Menyuni ochish' }).click();
  await page.locator('#main-nav').getByRole('link', { name: 'Xizmatlar' }).click();
  await expect(page).toHaveURL(/\/services$/);
  for (const route of [
    '/services/automation',
    '/services/web-development',
    '/services/telegram-bots',
    '/services/ai-solutions',
    '/services/business-systems',
    '/portfolio',
    '/portfolio/savdo-os',
    '/about',
    '/privacy',
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(
      page
        .getByRole('heading', { level: 1 })
        .or(page.getByRole('heading', { level: 2 }).first())
        .first(),
    ).toBeVisible();
  }
  await page.goto('/');
  await page.getByLabel('Til / Язык / Language').selectOption('ru');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Современные');
});
test('admin login, real project creation, upload and publishing', async ({ page }) => {
  await page.goto('http://localhost:3101');
  await expect(page.getByRole('heading', { name: 'Xush kelibsiz.' })).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Parol', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Tizimga kirish' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Xush kelibsiz,');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '.local/previews/admin-dashboard.png' });
  await page.getByRole('link', { name: 'Loyiha qo‘shish' }).click();
  await page.getByLabel('Loyiha nomi').fill(name);
  await page.getByLabel('URL slug').fill(slug);
  await page.getByLabel('Qisqa tavsif').fill('Browser testing concept project.');
  await page
    .getByLabel('To‘liq tavsif')
    .fill('This is a synthetic browser integration test project.');
  await page.getByLabel('Loyiha maqsadi').fill('Make order processing clear and consistent.');
  await page
    .getByLabel('Biznes konteksti')
    .fill('Customers, orders, payments and stock are the main business entities.');
  await page
    .getByLabel('Muammolar', { exact: true })
    .fill('Manual copying creates duplicate orders.');
  await page
    .getByLabel('Yechim', { exact: true })
    .fill('A shared workspace coordinates order status.');
  await page.getByLabel('AI roli').fill('AI drafts replies; an operator approves each reply.');
  await page
    .getByLabel('Natija', { exact: true })
    .fill('Expected outcome for a concept; no measured client results.');
  const png = await sharp({
    create: { width: 900, height: 600, channels: 3, background: '#D4AF7C' },
  })
    .png()
    .toBuffer();
  const files = Array.from({ length: 5 }, (_, i) => ({
    name: `test-${i + 1}.png`,
    mimeType: 'image/png',
    buffer: png,
  }));
  await page
    .getByLabel('Rasm yuklash', { exact: true })
    .setInputFiles([...files, { ...files[0], name: 'sixth.png' }]);
  await expect(page.getByRole('alert')).toContainText('5 ta rasm');
  await expect(page.locator('.pending-image')).toHaveCount(0);
  await page.getByLabel('Rasm yuklash', { exact: true }).setInputFiles(files);
  await expect(page.locator('.pending-image')).toHaveCount(5);
  let attempts = 0;
  const uploads = '**/admin/projects/*/images';
  await page.route(uploads, async (route) => {
    if (route.request().method() === 'POST' && ++attempts === 2)
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'TEST_FAILURE',
          message: 'Synthetic upload interruption',
        }),
      });
    else await route.continue();
  });

  await page.getByRole('button', { name: 'Loyihani saqlash' }).click();
  await expect(page).not.toHaveURL(/\/new$/);
  projectId = new URL(page.url()).pathname.split('/').pop()!;
  await expect(page.locator('.pending-image')).toHaveCount(4);
  await expect(page.locator('.image-item:not(.pending-image)')).toHaveCount(1);
  await expect(page.getByRole('alert')).toContainText('Synthetic upload interruption');
  await page.unroute(uploads);
  await page
    .getByLabel('Loyiha maqsadi')
    .fill('Make order processing clear and consistent. Preserve this unsaved edit.');
  await page.getByRole('button', { name: 'Tanlangan rasmlarni yuklash', exact: true }).click();
  await expect(page.locator('.pending-image')).toHaveCount(0);
  await expect(page.getByLabel('Loyiha maqsadi')).toHaveValue(
    'Make order processing clear and consistent. Preserve this unsaved edit.',
  );

  await expect(page.locator('.image-item')).toHaveCount(5);
  await expect(page.locator('.pending-image')).toHaveCount(0);
  await expect(page.getByLabel('Rasm yuklash', { exact: true })).toBeDisabled();
  await page.getByLabel('Nashr qilish', { exact: true }).check();
  await page.getByRole('button', { name: 'Loyihani saqlash' }).click();
  await expect(page.getByRole('status')).toContainText('Saqlandi');
  await page.goto(`http://localhost:3100/portfolio/${slug}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
  await expect(page.getByText('Concept Project', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.case-gallery-main img')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Loyiha maqsadi', exact: true })).toBeVisible();
  await expect(page.locator('#business')).toContainText('main business entities');
  await expect(page.locator('#ai')).toContainText('operator approves');
  await page.getByRole('button', { name: 'Kattalashtirish', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keyingi rasm', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('2 / 5');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Kattalashtirish', exact: true })).toBeFocused();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.locator('#result').scrollIntoViewIfNeeded();
  await page.locator('h1').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.local/previews/case-study.png', fullPage: true });
});
test('public contact form requires consent and admin can manage the lead', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Ismingiz').fill(name);
  await page.getByLabel('Telefon raqamingiz').fill('+998900000002');
  await page.getByLabel('Qaysi xizmat kerak?').selectOption('Website');
  await page
    .getByLabel('Loyihangiz haqida')
    .fill('This is a browser test request with synthetic contact information.');
  await page.getByRole('button', { name: 'Ariza yuborish' }).click();
  await expect(page.locator('input[name=consentGiven]')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Arizangiz qabul qilindi.' })).toHaveCount(0);
  await page.getByLabel('Men maxfiylik siyosatiga roziman.').check();
  await page.getByRole('button', { name: 'Ariza yuborish' }).click();
  await expect(page.getByRole('heading', { name: 'Arizangiz qabul qilindi.' })).toBeVisible();
  await page.goto('http://localhost:3101/login');
  await page.getByLabel('Email', { exact: true }).fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Parol', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Tizimga kirish' }).click();
  await page.getByRole('link', { name: 'Arizalar', exact: true }).click();
  await page.getByRole('button', { name, exact: true }).click();
  await page.getByLabel('Holat', { exact: true }).selectOption('NEGOTIATION');
  await page.getByRole('button', { name: 'O‘zgarishlarni saqlash' }).click();
  await expect(page.getByLabel('Holat', { exact: true })).toHaveValue('NEGOTIATION');
  await page.getByLabel('Ichki qayd', { exact: true }).fill('Private browser test note');
  await page.getByRole('button', { name: 'Qayd qo‘shish' }).click();
  await expect(page.getByText('Private browser test note', { exact: true })).toBeVisible();
  await page.screenshot({ path: '.local/previews/admin-request.png' });
  await page.getByRole('button', { name: 'Yopish', exact: true }).click();
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: 'Chiqish' }).click();
  await expect(page.getByRole('heading', { name: 'Xush kelibsiz.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('admin edits homepage text and uploads an image for the selected language', async ({
  page,
}) => {
  const where = { key: 'hero', locale: 'en' };
  test.skip(
    Boolean(await db.siteBlock.findUnique({ where: { key_locale: where } })),
    'Preserve existing user-authored content',
  );
  await page.goto('http://localhost:3101/login');
  await page.getByLabel('Email', { exact: true }).fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Parol', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Tizimga kirish' }).click();
  await page.getByRole('link', { name: 'Sayt bloklari', exact: true }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  const form = page.locator('form.block-editor:visible').first();
  try {
    await form.getByLabel('Sarlavha', { exact: true }).fill('A clearer business\nwith technology');
    const png = await sharp({
      create: { width: 900, height: 1000, channels: 3, background: '#304451' },
    })
      .png()
      .toBuffer();
    await form
      .getByLabel('Birinchi ekran — rasm yuklash', { exact: true })
      .setInputFiles({ name: 'hero.png', mimeType: 'image/png', buffer: png });
    await form.getByRole('button', { name: 'Blokni saqlash' }).click();
    await expect(form.getByRole('status')).toContainText('Saqlandi');
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: '.local/previews/admin-site-blocks.png' });
    const row = await db.siteBlock.findUniqueOrThrow({ where: { key_locale: where } });
    expect(row.imageKey).toMatch(/^site\/hero\/en\//);
    await page.goto('http://localhost:3100');
    await page.getByLabel('Til / Язык / Language').selectOption('en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A clearer business');
    await expect(page.locator('.arch-photo img')).toHaveAttribute(
      'src',
      new RegExp(encodeURIComponent(row.imageKey)),
    );
    await page.getByLabel('Til / Язык / Language').selectOption('uz');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Biznesingiz uchun');
  } finally {
    await page.request.delete('http://localhost:4100/admin/site-blocks/hero/en/image', {
      headers: { Origin: 'http://localhost:3101' },
    });
    await db.siteBlock.deleteMany({ where });
  }
});

test('solution filters, workflows and product-specific enquiry retain the chosen product', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.locator('#solutions');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { name: 'FixFlow', exact: true })).toBeVisible();
  await section.getByRole('button', { name: 'Ishlab chiqarish', exact: true }).click();
  await expect(section.locator('.solution-card')).toHaveCount(1);
  await expect(
    section.getByRole('heading', { name: 'Ishlab chiqarishni boshqarish', exact: true }),
  ).toBeVisible();
  await section.locator('summary').click();
  await expect(section.locator('.solution-workflow')).toContainText('Moliya');
  await section.getByRole('button', { name: 'Moliya va filiallar', exact: true }).click();
  await expect(section.locator('.solution-card')).toHaveCount(1);
  await expect(section.locator('.solution-card')).toContainText('material xarajatlari');
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await section.getByRole('link', { name: 'Joriy etishni muhokama qilish' }).click();
  await expect(page.locator('.selected-solution')).toContainText('FixFlow');
  await expect(page).toHaveURL(/solution=fixflow/);
  await page.getByLabel('Til / Язык / Language').selectOption('ru');
  await expect(page.locator('.selected-solution')).toContainText('FixFlow');
  await expect(page.locator('textarea[name=description]')).toContainText('Хочу обсудить');
  await page.getByLabel('Til / Язык / Language').selectOption('uz');

  await expect(page.locator('select[name=service]')).toHaveValue('Business Automation');
  await expect(page.locator('textarea[name=description]')).toContainText('FixFlow');
  await page.getByLabel('Ismingiz').fill(name);
  await page.getByLabel('Telefon raqamingiz').fill('+998900000003');
  await page.getByLabel('Men maxfiylik siyosatiga roziman.').check();
  await page.getByRole('button', { name: 'Ariza yuborish' }).click();
  await expect(page.getByRole('heading', { name: 'Arizangiz qabul qilindi.' })).toBeVisible();
  const lead = await db.clientRequest.findFirstOrThrow({
    where: { name, description: { contains: 'FixFlow' } },
  });
  expect(lead.service).toBe('Business Automation');
  await page.goto('/contact?solution=unpublished-or-missing');
  await expect(page.locator('.selected-solution')).toHaveCount(0);
  await expect(page.locator('select[name=service]')).toHaveValue('');
});

test('administrator can create, edit and remove a solution from the catalog', async ({ page }) => {
  let id = '';
  await page.goto('http://localhost:3101/login');
  await page.getByLabel('Email', { exact: true }).fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Parol', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Tizimga kirish' }).click();
  await page.getByRole('link', { name: 'Tayyor yechimlar', exact: true }).click();
  await page.getByRole('button', { name: 'Qo‘shish', exact: true }).click();
  const modal = page.getByRole('dialog');
  const title = 'Product ' + tag;
  try {
    await modal.getByLabel('Mahsulot / yechim nomi').fill(title);
    await modal.getByLabel('Slug', { exact: false }).fill('product-' + tag);
    await modal.getByLabel('Kimlar uchun').fill('Synthetic test businesses');
    await modal
      .getByLabel('Tavsif', { exact: false })
      .fill('A synthetic test product description.');
    await modal.getByLabel('Imkoniyatlar').fill('Cost estimates\nMaterial usage\n');
    await modal.getByLabel('Jarayon bosqichlari').fill('Order\nCalculation\nReport\n');
    await modal.getByRole('button', { name: 'Saqlash', exact: true }).click();
    await expect(modal).not.toBeVisible();
    const created = await db.businessSolution.findUniqueOrThrow({
      where: { slug_locale: { slug: 'product-' + tag, locale: 'uz' } },
    });
    id = created.id;
    expect(created.features).toEqual(['Cost estimates', 'Material usage']);
    const row = page.getByRole('row').filter({ hasText: title });
    await row.getByRole('button', { name: 'Tahrirlash' }).click();
    await modal.getByLabel('Narx va shartlar').fill('Test-only price label');
    await modal.getByLabel('Nashr qilish', { exact: true }).check();
    await modal.getByRole('button', { name: 'Saqlash', exact: true }).click();
    await expect(modal).not.toBeVisible();
    await expect(row).toContainText('Nashr qilingan');
    expect((await db.businessSolution.findUniqueOrThrow({ where: { id } })).priceLabel).toBe(
      'Test-only price label',
    );
    await row.getByRole('button', { name: 'O‘chirish', exact: true }).click();
    await modal.getByRole('button', { name: 'O‘chirish', exact: true }).click();
    await expect(row).toHaveCount(0);
  } finally {
    if (id) {
      await db.businessSolution.deleteMany({ where: { id } });
      await db.auditLog.deleteMany({ where: { entityId: id } });
    }
  }
});
