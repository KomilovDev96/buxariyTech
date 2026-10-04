import { useEffect, useState } from 'react';
import { Upload, ArrowUpRight, Trash2 } from 'lucide-react';
import {
  contentLocales,
  siteBlockKeys,
  siteBlockDefaults,
  siteBlockSchema,
  MAX_UPLOAD_BYTES,
  type SiteBlock,
} from '@buhariy/contracts';
import { api, save } from '../lib/api';
import { Button, ErrorBox, Loading } from '../components/ui';
const names = {
  solutions: 'Tayyor yechimlar — sarlavha',
  hero: 'Birinchi ekran',
  story: 'Kompaniya tarixi',
  cta: 'Hamkorlikka taklif',
};
function BlockEditor({ block }: { block: SiteBlock }) {
  const [values, setValues] = useState(block),
    [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const [remove, setRemove] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const fallback = siteBlockDefaults.find((b) => b.key === block.key && b.locale === block.locale)!;
  const shown = preview || (remove ? fallback.imageUrl : values.imageUrl);
  const src = shown.startsWith('/')
    ? `${import.meta.env.VITE_WEB_URL || 'http://localhost:3100'}${shown}`
    : shown;
  function choose(candidate?: File) {
    if (busy || !candidate) return;
    if (
      candidate.size > MAX_UPLOAD_BYTES ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(candidate.type)
    ) {
      setError('JPG, PNG yoki WebP tanlang, 8 MB gacha.');
      return;
    }
    setFile(candidate);
    setRemove(false);
    setError('');
    setMessage('');
  }
  return (
    <form
      className="panel block-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        setMessage('');
        const path = `/admin/site-blocks/${block.key}/${block.locale}`;
        try {
          const { title, body, label, imageAlt } = values;
          await save(path, siteBlockSchema.parse({ title, body, label, imageAlt }), 'PATCH');
          if (file) {
            const form = new FormData();
            form.set('file', file);
            const updated = await api<SiteBlock>(`${path}/image`, { method: 'POST', body: form });
            setValues((v) => ({ ...v, imageUrl: updated.imageUrl }));
            setFile(null);
          } else if (remove) {
            await api(`${path}/image`, { method: 'DELETE' });
            setValues((v) => ({ ...v, imageUrl: fallback.imageUrl }));
            setRemove(false);
          }
          setMessage('Saqlandi. Natijani ko‘rish uchun saytni yangilang.');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Xatolik');
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex-between">
        <h2>{names[block.key]}</h2>
        <span className="eyebrow">
          {block.key.toUpperCase()} / {block.locale.toUpperCase()}
        </span>
      </div>
      <ErrorBox message={error} />
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
      <fieldset disabled={busy} className="editor-fields block-grid">
        <div className="block-text-fields">
          <label>
            Kichik sarlavha
            <input
              maxLength={120}
              value={values.label}
              onChange={(e) => setValues({ ...values, label: e.target.value })}
            />
          </label>
          <label>
            Sarlavha
            <textarea
              aria-label="Sarlavha"
              rows={3}
              maxLength={240}
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
            />
            {block.key === 'hero' && (
              <small>
                Har bir qatorni yangi satrga yozing. Ikkinchi qator oltin rangda ko‘rinadi.
              </small>
            )}
          </label>
          <label>
            Matn
            <textarea
              rows={6}
              maxLength={6000}
              value={values.body}
              onChange={(e) => setValues({ ...values, body: e.target.value })}
            />
          </label>
        </div>
        <div>
          {src && (
            <img
              className="block-image-preview"
              src={src}
              alt={values.imageAlt || names[block.key]}
            />
          )}
          <label
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length > 1) {
                setError('Bitta rasm tanlang.');
                return;
              }
              choose(e.dataTransfer.files[0]);
            }}
          >
            <Upload size={24} />
            <span>{file ? file.name : 'Kompyuterdan rasm tanlash'}</span>
            <small>JPG, PNG, WebP · 8 MB · 64–8000 px</small>
            <input
              type="file"
              aria-label={`${names[block.key]} — rasm yuklash`}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                choose(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          <label>
            Rasm tavsifi (alt)
            <input
              maxLength={300}
              value={values.imageAlt}
              onChange={(e) => setValues({ ...values, imageAlt: e.target.value })}
            />
          </label>
          {(file || (values.imageUrl && values.imageUrl !== fallback.imageUrl)) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFile(null);
                setRemove(true);
              }}
            >
              <Trash2 size={16} />
              {!fallback.imageUrl ? 'Rasmni olib tashlash' : 'Standart rasmga qaytish'}
            </Button>
          )}
          {remove && <p className="muted">Rasm o‘zgarishi saqlangandan so‘ng qo‘llanadi.</p>}
        </div>
      </fieldset>
      <div className="form-actions">
        <Button disabled={busy}>{busy ? 'Saqlanmoqda…' : 'Blokni saqlash'}</Button>
      </div>
    </form>
  );
}
export default function SiteBlocksPage() {
  const [blocks, setBlocks] = useState<SiteBlock[] | null>(null),
    [locale, setLocale] = useState<SiteBlock['locale']>('uz'),
    [error, setError] = useState('');
  useEffect(() => {
    api<SiteBlock[]>('/admin/site-blocks')
      .then(setBlocks)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SAYT / KONTENT</p>
          <h1>Sayt bloklari</h1>
          <p className="muted">Bosh sahifa matnlari va rasmlari. Har bir til alohida saqlanadi.</p>
        </div>
        <a
          className="back-link"
          href={import.meta.env.VITE_WEB_URL || 'http://localhost:3100'}
          target="_blank"
          rel="noreferrer"
        >
          Saytni ko‘rish <ArrowUpRight size={18} />
        </a>
      </div>
      <ErrorBox message={error} />
      {!blocks ? (
        <Loading />
      ) : (
        <>
          {/* Keep each locale mounted so switching does not discard unsaved work. */}
          <div className="content-languages" role="group" aria-label="Kontent tili">
            {contentLocales.map((l) => (
              <Button
                key={l}
                type="button"
                variant={locale === l ? 'default' : 'outline'}
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </div>
          {contentLocales.map((l) => (
            <div key={l} hidden={locale !== l}>
              {siteBlockKeys.map((key) => (
                <BlockEditor
                  key={`${key}-${l}`}
                  block={blocks.find((b) => b.key === key && b.locale === l)!}
                />
              ))}
            </div>
          ))}
        </>
      )}
    </>
  );
}
