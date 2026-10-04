import 'dotenv/config';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
const sharp = createRequire(resolve('apps/api/package.json'))('sharp');
const db = new PrismaClient(),
  base = 'http://localhost:4102',
  origin = 'http://localhost:3101',
  tag = randomUUID().slice(0, 8);
let server: ChildProcess,
  cookies = '',
  editorCookies = '',
  userId = '',
  projectId = '',
  raceId = '',
  requestId = '',
  png: Buffer;
const title = `Integration ${tag}`,
  slug = `integration-${tag}`;
async function call(
  path: string,
  method = 'GET',
  body?: unknown,
  jar = cookies,
  requestOrigin = origin,
) {
  return fetch(base + path, {
    method,
    headers: {
      Origin: requestOrigin,
      ...(jar ? { Cookie: jar } : {}),
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
}
function jar(response: Response) {
  return response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
}
function upload() {
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(png)], { type: 'image/png' }), 'test.png');
  return form;
}
beforeAll(async () => {
  server = spawn(process.execPath, ['apps/api/dist/main.js'], {
    cwd: process.cwd(),
    env: { ...process.env, API_PORT: '4102' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/health')).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  expect((await fetch(base + '/health')).ok).toBe(true);
  png = await sharp({ create: { width: 120, height: 100, channels: 3, background: '#D4AF7C' } })
    .png()
    .toBuffer();
});
afterAll(async () => {
  for (const id of [projectId, raceId]) if (id) await call(`/admin/projects/${id}`, 'DELETE');
  if (requestId) {
    await db.requestNote.deleteMany({ where: { requestId } });
    await db.clientRequest.deleteMany({ where: { id: requestId } });
  }
  if (userId) {
    await db.auditLog.deleteMany({ where: { userId } });
    await db.user.deleteMany({ where: { id: userId } });
  }
  await db.auditLog.deleteMany({
    where: { entityId: { in: [projectId, raceId, requestId, userId].filter(Boolean) } },
  });
  server?.kill('SIGTERM');
  await db.$disconnect();
});
describe.sequential('Full API flow against PostgreSQL and S3', () => {
  it('denies anonymous admin access', async () =>
    expect((await call('/admin/projects', 'GET', undefined, '')).status).toBe(401));
  it('admin logs in with HttpOnly cookies and no hash in response', async () => {
    const r = await call(
      '/auth/login',
      'POST',
      { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
      '',
    );
    expect(r.status).toBe(201);
    expect(r.headers.getSetCookie().join()).toContain('HttpOnly');
    cookies = jar(r);
    const user = await r.json();
    expect(user.role).toBe('ADMIN');
    expect(user.passwordHash).toBeUndefined();
    expect(cookies).toContain('bt_access=');
  });
  it('blocks cross-origin authenticated writes', async () =>
    expect(
      (
        await call(
          '/admin/settings',
          'PATCH',
          { key: 'test', value: 'x', public: false },
          cookies,
          'https://evil.example',
        )
      ).status,
    ).toBe(403));
  it('creates a draft project', async () => {
    const r = await call('/admin/projects', 'POST', {
      title,
      slug,
      shortDescription: 'An integration test project',
      description: 'A meaningful test-only project description',
      goal: 'Reduce duplicate entry',
      businessContext: 'Orders, customers and stock',
      aiContribution: 'Suggest a draft response with human review',
      year: 2026,
    });
    expect(r.status).toBe(201);
    const p = await r.json();
    projectId = p.id;
    expect(p.published).toBe(false);
    expect((await call(`/projects/${slug}`)).status).toBe(404);
  });
  it('validates real bytes rather than the claimed MIME type', async () => {
    const f = new FormData();
    f.set('file', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'fake.png');
    expect((await call(`/admin/projects/${projectId}/images`, 'POST', f)).status).toBe(400);
  });
  it('rejects oversized files', async () => {
    const f = new FormData();
    f.set(
      'file',
      new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: 'image/png' }),
      'large.png',
    );
    expect((await call(`/admin/projects/${projectId}/images`, 'POST', f)).status).toBe(413);
  });
  it('uploads five optimized images and refuses the sixth', async () => {
    for (let i = 0; i < 5; i++) {
      const r = await call(`/admin/projects/${projectId}/images`, 'POST', upload());
      expect(r.status).toBe(201);
      const image = await r.json();
      expect(image.url).toMatch(/\.webp$/);
      expect(image.isCover).toBe(i === 0);
      if (i === 0)
        expect((await fetch(image.url)).headers.get('content-type')).toContain('image/webp');
    }
    expect((await call(`/admin/projects/${projectId}/images`, 'POST', upload())).status).toBe(400);
    expect(await db.projectImage.count({ where: { projectId } })).toBe(5);
  });
  it('enforces five images under concurrent uploads', async () => {
    const p = await (
      await call('/admin/projects', 'POST', {
        title: 'Race ' + tag,
        slug: 'race-' + tag,
        shortDescription: 'Concurrent limit test project',
        description: 'Concurrent test-only project description',
        year: 2026,
      })
    ).json();
    raceId = p.id;
    const results = await Promise.all(
      Array.from({ length: 6 }, () => call(`/admin/projects/${raceId}/images`, 'POST', upload())),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(5);
    expect(results.filter((r) => r.status === 400)).toHaveLength(1);
    expect(await db.projectImage.count({ where: { projectId: raceId } })).toBe(5);
  });
  it('reorders, edits alt, changes cover and replaces an image', async () => {
    let p = await (await call(`/admin/projects/${projectId}`)).json();
    const ids = p.images.map((i: { id: string }) => i.id).reverse();
    expect(
      (await call(`/admin/projects/${projectId}/images/reorder`, 'PATCH', { ids })).status,
    ).toBe(200);
    expect(
      (
        await call(`/admin/projects/${projectId}/images/${ids[0]}`, 'PATCH', {
          alt: 'Test image',
          isCover: true,
        })
      ).status,
    ).toBe(200);
    expect(
      (await call(`/admin/projects/${projectId}/images/${ids[0]}`, 'PUT', upload())).status,
    ).toBe(200);
    p = await (await call(`/admin/projects/${projectId}`)).json();
    expect(p.images[0].id).toBe(ids[0]);
    expect(p.images[0].alt).toBe('Test image');
    expect(p.images.filter((i: { isCover: boolean }) => i.isCover)).toHaveLength(1);
  });
  it('publishes project and exposes a bounded gallery', async () => {
    expect((await call(`/admin/projects/${projectId}`, 'PATCH', { published: true })).status).toBe(
      200,
    );
    const r = await call(`/projects/${slug}`);
    expect(r.status).toBe(200);
    const p = await r.json();
    expect(p.goal).toBe('Reduce duplicate entry');
    expect(p.businessContext).toBe('Orders, customers and stock');
    expect(p.aiContribution).toContain('human review');
    expect(p.images).toHaveLength(5);
    expect(p.images[0].key).toBeUndefined();
  });
  it('removes a cover and selects a replacement', async () => {
    const p = await (await call(`/admin/projects/${projectId}`)).json();
    const cover = p.images.find((i: { isCover: boolean }) => i.isCover);
    expect((await call(`/admin/projects/${projectId}/images/${cover.id}`, 'DELETE')).status).toBe(
      200,
    );
    const images = await db.projectImage.findMany({ where: { projectId } });
    expect(images).toHaveLength(4);
    expect(images.filter((i) => i.isCover)).toHaveLength(1);
  });
  it('rejects missing privacy consent', async () => {
    const policy = await (await call('/privacy')).json();
    const r = await call(
      '/requests',
      'POST',
      {
        name: title,
        phone: '+998900000001',
        service: 'Website',
        description: 'A valid integration test description.',
        privacyPolicyVersion: policy.version,
        consentGiven: false,
      },
      '',
      'http://localhost:3100',
    );
    expect(r.status).toBe(400);
  });
  it('rejects obsolete policy versions', async () => {
    expect(
      (
        await call(
          '/requests',
          'POST',
          {
            name: title,
            phone: '+998900000001',
            service: 'Website',
            description: 'A valid integration test description.',
            privacyPolicyVersion: 'obsolete',
            consentGiven: true,
          },
          '',
          'http://localhost:3100',
        )
      ).status,
    ).toBe(400);
  });
  it('submits a lead, preserving consent metadata and protecting notes', async () => {
    const policy = await (await call('/privacy')).json();
    const r = await call(
      '/requests',
      'POST',
      {
        name: title,
        phone: '+998900000001',
        service: 'Website',
        description: 'A valid integration test description.',
        privacyPolicyVersion: policy.version,
        consentGiven: true,
      },
      '',
      'http://localhost:3100',
    );
    expect(r.status).toBe(201);
    expect((await r.json()).success).toBe(true);
    const request = await db.clientRequest.findFirstOrThrow({ where: { name: title } });
    requestId = request.id;
    expect(request.consentGiven).toBe(true);
    expect(request.consentAt).toBeInstanceOf(Date);
    const lead = await (await call(`/admin/requests/${requestId}`)).json();
    expect(lead.name).toBe(title);
    expect((await call(`/requests/${requestId}`, 'GET', undefined, '')).status).not.toBe(200);
  });
  it('rate limits the public form', async () =>
    expect((await call('/requests', 'POST', {}, '', 'http://localhost:3100')).status).toBe(429));
  it('changes lead status, assigns administrator and adds an internal note', async () => {
    const me = await (await call('/auth/me')).json();
    const r = await call(`/admin/requests/${requestId}`, 'PATCH', {
      status: 'NEGOTIATION',
      priority: 'HIGH',
      assignedToId: me.id,
    });
    expect(r.status).toBe(200);
    expect((await r.json()).status).toBe('NEGOTIATION');
    expect(
      (
        await call(`/admin/requests/${requestId}/notes`, 'POST', {
          body: 'Internal integration note',
        })
      ).status,
    ).toBe(201);
    expect((await (await call(`/admin/requests/${requestId}`)).json()).notes).toHaveLength(1);
  });
  it('editor can edit content but cannot access leads, settings or users', async () => {
    const r = await call('/admin/users', 'POST', {
      name: 'Test Editor',
      email: `test-${tag}@example.invalid`,
      password: 'Test-only-password-123456',
      role: 'EDITOR',
    });
    expect(r.status).toBe(201);
    userId = (await r.json()).id;
    const login = await call(
      '/auth/login',
      'POST',
      { email: `test-${tag}@example.invalid`, password: 'Test-only-password-123456' },
      '',
    );
    editorCookies = jar(login);
    expect((await call('/admin/projects', 'GET', undefined, editorCookies)).status).toBe(200);
    for (const path of ['/admin/requests', '/admin/settings', '/admin/users'])
      expect((await call(path, 'GET', undefined, editorCookies)).status).toBe(403);
    expect(
      (
        await call(
          '/admin/settings',
          'PATCH',
          { key: 'test', value: 'bad', public: true },
          editorCookies,
        )
      ).status,
    ).toBe(403);
  });
  it('edits localized site blocks with uploaded images and protects storage fields', async () => {
    const p = { key: 'cta', locale: 'en' };
    // Never replace an existing user-authored block or its image during tests.
    if (await db.siteBlock.findUnique({ where: { key_locale: p } })) return;
    const path = '/admin/site-blocks/cta/en';
    try {
      expect(
        (
          await call(
            path,
            'PATCH',
            {
              title: 'Test collaboration',
              body: 'Synthetic CMS test content',
              label: 'TEST',
              imageAlt: 'Test image',
            },
            '',
          )
        ).status,
      ).toBe(401);
      expect((await call('/admin/site-blocks/unknown/en', 'PATCH', {})).status).toBe(400);
      expect(
        (await call(path, 'PATCH', { imageUrl: 'https://example.com/image.jpg' })).status,
      ).toBe(400);
      expect(
        (
          await call(
            path,
            'PATCH',
            {
              title: 'Test collaboration',
              body: 'Synthetic CMS test content',
              label: 'TEST',
              imageAlt: 'Test image',
            },
            editorCookies,
          )
        ).status,
      ).toBe(200);
      const fake = new FormData();
      fake.set('file', new Blob(['not an image'], { type: 'image/png' }), 'bad.png');
      expect((await call(path + '/image', 'POST', fake, editorCookies)).status).toBe(400);
      expect((await call(path + '/image', 'POST', new FormData(), editorCookies)).status).toBe(400);
      let r = await call(path + '/image', 'POST', upload(), editorCookies);
      expect(r.status).toBe(201);
      const first = await r.json();
      expect(first.imageKey).toBeUndefined();
      expect((await fetch(first.imageUrl)).status).toBe(200);
      r = await call(path + '/image', 'POST', upload(), editorCookies);
      expect(r.status).toBe(201);
      const second = await r.json();
      expect(second.imageUrl).not.toBe(first.imageUrl);
      expect((await fetch(first.imageUrl)).status).toBe(404);
      const blocks = await (await call('/site-blocks', 'GET', undefined, '')).json();
      expect(
        blocks.find((b: { key: string; locale: string }) => b.key === 'cta' && b.locale === 'en'),
      ).toMatchObject({
        title: 'Test collaboration',
        imageAlt: 'Test image',
        imageUrl: second.imageUrl,
      });
      expect(blocks.some((b: { imageKey?: string }) => b.imageKey !== undefined)).toBe(false);
      expect((await call(path + '/image', 'DELETE', undefined, editorCookies)).status).toBe(200);
      expect((await fetch(second.imageUrl)).status).toBe(404);
    } finally {
      await call(path + '/image', 'DELETE');
      await db.siteBlock.deleteMany({ where: p });
    }
  });
  it('manages localized business products with editor rights and keeps drafts private', async () => {
    let id = '';
    const input = {
      title: 'Test solution ' + tag,
      slug: 'solution-' + tag,
      locale: 'ru',
      sector: 'MANUFACTURING',
      description: 'A synthetic configurable production solution.',
      audience: 'Test manufacturers',
      features: ['Order costing', 'Materials'],
      workflow: ['Order', 'Delivery'],
      outcome: 'Expected test outcome',
      priceLabel: '',
      readiness: 'CONCEPT',
      featured: false,
      order: 1000,
      published: false,
    };
    try {
      expect((await call('/admin/solutions', 'POST', input, '')).status).toBe(401);
      const created = await call('/admin/solutions', 'POST', input, editorCookies);
      expect(created.status).toBe(201);
      id = (await created.json()).id;
      expect(
        (await (await call('/solutions?locale=ru', 'GET', undefined, '')).json()).some(
          (r: { id: string }) => r.id === id,
        ),
      ).toBe(false);
      expect((await call('/admin/solutions', 'POST', input, editorCookies)).status).toBe(409);
      expect(
        (await call('/admin/solutions/' + id, 'PATCH', { ...input, features: [] }, editorCookies))
          .status,
      ).toBe(400);
      expect(
        (
          await call(
            '/admin/solutions/' + id,
            'PATCH',
            { ...input, imageKey: 'unexpected' },
            editorCookies,
          )
        ).status,
      ).toBe(400);
      expect(
        (
          await call(
            '/admin/solutions/' + id,
            'PATCH',
            { ...input, readiness: 'AVAILABLE', published: true },
            editorCookies,
          )
        ).status,
      ).toBe(200);
      const ru = await (await call('/solutions?locale=ru', 'GET', undefined, '')).json();
      expect(ru.find((r: { id: string }) => r.id === id)).toMatchObject({
        title: input.title,
        readiness: 'AVAILABLE',
        features: input.features,
        workflow: input.workflow,
      });
      expect(
        (await (await call('/solutions?locale=en', 'GET', undefined, '')).json()).some(
          (r: { id: string }) => r.id === id,
        ),
      ).toBe(false);
      expect((await call('/solutions?locale=invalid', 'GET', undefined, '')).status).toBe(400);
    } finally {
      if (id) {
        await call('/admin/solutions/' + id, 'DELETE');
        await db.auditLog.deleteMany({ where: { entityId: id } });
      }
    }
  });
  it('rotates refresh tokens and rejects replay', async () => {
    const r = await call('/auth/refresh', 'POST', {}, editorCookies);
    expect(r.status).toBe(201);
    const old = editorCookies;
    editorCookies = jar(r);
    expect((await call('/auth/refresh', 'POST', {}, old)).status).toBe(401);
  });
  it('logout revokes access tokens immediately', async () => {
    expect((await call('/auth/logout', 'POST', {}, editorCookies)).status).toBe(201);
    expect((await call('/auth/me', 'GET', undefined, editorCookies)).status).toBe(401);
  });
});
