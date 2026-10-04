import { describe, it, expect } from 'vitest';
import {
  requestSchema,
  projectSchema,
  projectPatchSchema,
  siteBlockSchema,
  teamSchema,
  imageOrderSchema,
  loginSchema,
  MAX_PROJECT_IMAGES,
} from '../../packages/contracts/src';
const lead = {
  name: 'Test Client',
  phone: '+998901234567',
  service: 'Website',
  description: 'A test project with a meaningful description.',
  consentGiven: true,
  privacyPolicyVersion: 'local-preview-v1',
};
describe('Contact validation', () => {
  it('accepts explicit consent with policy version', () =>
    expect(requestSchema.safeParse(lead).success).toBe(true));
  it.each([undefined, false, 'true'])('rejects missing or forged consent: %s', (consentGiven) =>
    expect(requestSchema.safeParse({ ...lead, consentGiven }).success).toBe(false),
  );
  it('rejects honeypot spam', () =>
    expect(requestSchema.safeParse({ ...lead, website: 'spam.example' }).success).toBe(false));
  it('rejects unknown internal fields', () =>
    expect(requestSchema.safeParse({ ...lead, status: 'WON', notes: 'injected' }).success).toBe(
      false,
    ));
  it('rejects invalid phone and short description', () => {
    expect(requestSchema.safeParse({ ...lead, phone: 'hello' }).success).toBe(false);
    expect(requestSchema.safeParse({ ...lead, description: 'short' }).success).toBe(false);
  });
  it('rejects obsolete service values', () =>
    expect(requestSchema.safeParse({ ...lead, service: 'Exploit' }).success).toBe(false));
});
describe('CMS boundaries', () => {
  it('preserves omitted project fields in partial updates', () => {
    expect(projectPatchSchema.parse({ published: true })).toEqual({ published: true });
    expect(projectPatchSchema.parse({ goal: '' })).toEqual({ goal: '' });
  });
  it('rejects client-supplied site image URLs and storage keys', () => {
    expect(
      siteBlockSchema.safeParse({ title: 'Hero', imageUrl: 'https://example.com/image.png' })
        .success,
    ).toBe(false);
    expect(siteBlockSchema.safeParse({ title: 'Hero', imageKey: 'site/other.webp' }).success).toBe(
      false,
    );
  });
  it('rejects duplicate images and a sixth image', () => {
    expect(imageOrderSchema.safeParse({ ids: ['a', 'a'] }).success).toBe(false);
    expect(
      imageOrderSchema.safeParse({ ids: Array.from({ length: 6 }, (_, i) => String(i)) }).success,
    ).toBe(false);
    expect(MAX_PROJECT_IMAGES).toBe(5);
  });
  it('rejects script URLs in team profiles', () =>
    expect(
      teamSchema.safeParse({
        name: 'Test User',
        position: 'Engineer',
        photo: 'javascript:alert(1)',
        skills: [],
      }).success,
    ).toBe(false));
  it('requires a safe slug', () =>
    expect(
      projectSchema.safeParse({
        title: 'Project',
        slug: '../admin',
        shortDescription: 'A longer description',
        description: 'A longer project description',
        year: 2026,
      }).success,
    ).toBe(false));
  it('normalizes login email but never truncates passwords', () => {
    const r = loginSchema.parse({ email: 'ADMIN@example.com', password: '  password  ' });
    expect(r.email).toBe('admin@example.com');
    expect(r.password).toBe('  password  ');
  });
});
