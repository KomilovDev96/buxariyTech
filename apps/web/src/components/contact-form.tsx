'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { requestSchema, serviceOptions, type LeadInput } from '@buhariy/contracts';
import { formCopy } from '@/lib/editorial';
import type { Locale } from '@/lib/i18n';
type Registry = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => Promise<unknown>;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function ContactForm({
  version,
  locale,
  initialDescription = '',
  selectedTitle = '',
}: {
  version: string;
  locale: Locale;
  initialDescription?: string;
  selectedTitle?: string;
}) {
  const t = formCopy[locale];
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const submit = useCallback(
    async (input: unknown) => {
      const parsed = requestSchema.safeParse(input);
      if (!parsed.success) {
        const message = parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join(' · ');
        setError(message);
        throw new Error(message);
      }
      setError('');
      setStatus('sending');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || t.error);
        setStatus('success');
        return { success: true };
      } catch (e) {
        const message = e instanceof Error ? e.message : t.error;
        setError(message);
        setStatus('idle');
        throw e;
      }
    },
    [t.error],
  );
  useEffect(() => {
    const registry = (document as Document & { modelContext?: Registry }).modelContext;
    if (!registry) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      registry.registerTool(
        {
          name: 'submit_project_request',
          description:
            'Submit a BUHARIY TECH project request. Requires explicit privacy consent after reading the current privacy policy. This sends contact details to the company.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              phone: { type: 'string' },
              telegram: { type: 'string' },
              company: { type: 'string' },
              service: { type: 'string', enum: [...serviceOptions] },
              budget: { type: 'string' },
              description: { type: 'string', minLength: 20 },
              consentGiven: { const: true },
              privacyPolicyVersion: { const: version },
            },
            required: [
              'name',
              'phone',
              'service',
              'description',
              'consentGiven',
              'privacyPolicyVersion',
            ],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: submit,
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [submit, version]);
  if (status === 'success')
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={45} />
        <h2>{t.success}</h2>
        <p>{t.successText}</p>
        <button className="button outline" onClick={() => setStatus('idle')}>
          {t.again}
        </button>
      </div>
    );
  return (
    <form
      className="contact-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const f = new FormData(event.currentTarget);
        const input = {
          ...Object.fromEntries(f),
          consentGiven: f.get('consentGiven') === 'on',
          privacyPolicyVersion: version,
        };
        try {
          await submit(input);
        } catch {}
      }}
    >
      {selectedTitle && <p className="selected-solution">{selectedTitle}</p>}
      <div className="form-grid">
        <label>
          {t.name}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Ism Familiya"
          />
        </label>
        <label>
          {t.phone}
          <input name="phone" type="tel" autoComplete="tel" required placeholder="+998" />
        </label>
        <label>
          {t.telegram}
          <span className="optional">{t.optional}</span>
          <input name="telegram" maxLength={33} placeholder="@username" />
        </label>
        <label>
          {t.company}
          <span className="optional">{t.optional}</span>
          <input name="company" autoComplete="organization" maxLength={200} />
        </label>
        <label>
          {t.service}
          <select name="service" required defaultValue={selectedTitle ? 'Business Automation' : ''}>
            <option value="" disabled>
              —
            </option>
            {serviceOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          {t.budget}
          <span className="optional">{t.optional}</span>
          <input name="budget" maxLength={100} placeholder="USD / UZS" />
        </label>
      </div>
      <label>
        {t.description}
        <textarea
          defaultValue={initialDescription}
          name="description"
          required
          minLength={20}
          maxLength={8000}
          rows={5}
          placeholder={t.hint}
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" autoComplete="off" tabIndex={-1} />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consentGiven" required />
        <span>
          {t.consent}{' '}
          <Link href="/privacy" target="_blank" aria-label="Maxfiylik siyosati">
            ↗
          </Link>
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-bottom">
        <button className="button" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t.sending : t.submit}
          <ArrowUpRight size={20} />
        </button>
        <span>{t.note}</span>
      </div>
    </form>
  );
}
