import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Star, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import {
  MAX_PROJECT_IMAGES,
  MAX_UPLOAD_BYTES,
  projectSchema,
  type Project,
  type Taxonomy,
} from '@buhariy/contracts';
import { api, save } from '../lib/api';
import { Button, ErrorBox, Loading, Modal, Badge } from '../components/ui';
import { Fields, type Field } from '../components/fields';
function PendingImage({ file }: { file: File }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const value = URL.createObjectURL(file);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  return url ? <img src={url} alt={file.name} /> : null;
}
export default function ProjectEditor() {
  const { id } = useParams(),
    navigate = useNavigate(),
    isNew = id === 'new';
  const [project, setProject] = useState<Project | null>(null),
    [values, setValues] = useState<Record<string, unknown>>({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      goal: '',
      businessContext: '',
      aiContribution: '',
      challenge: '',
      solution: '',
      result: '',
      categoryId: '',
      technologyIds: [],
      client: '',
      year: new Date().getFullYear(),
      concept: true,
      featured: false,
      published: false,
    }),
    [categories, setCategories] = useState<Taxonomy[]>([]),
    [technologies, setTechnologies] = useState<Taxonomy[]>([]),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [confirm, setConfirm] = useState(false),
    [pending, setPending] = useState<File[]>([]),
    [uploadStatus, setUploadStatus] = useState('');
  const reload = async (sync = true) => {
    if (isNew) return;
    const p = await api<Project>(`/admin/projects/${id}`);
    setProject(p);
    const { id: _, images, category, technologies, createdAt, updatedAt, ...v } = p;
    if (sync)
      setValues({
        ...v,
        categoryId: p.categoryId || '',
        technologyIds: technologies.map((t) => t.id),
      });
  };
  useEffect(() => {
    setReady(false);
    Promise.all([
      api<Taxonomy[]>('/admin/categories').then(setCategories),
      api<Taxonomy[]>('/admin/technologies').then(setTechnologies),
      reload(),
    ])
      .then(() => setReady(true))
      .catch((e) => setError(e.message));
  }, [id]);
  const run = async (fn: () => Promise<unknown>, refresh = true) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await fn();
      if (refresh) await reload(false);
      setMessage('Saqlandi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik');
    } finally {
      setBusy(false);
    }
  };
  const chooseFiles = (files: File[]) => {
    if (busy || !files.length) return;
    if ((project?.images.length || 0) + pending.length + files.length > MAX_PROJECT_IMAGES) {
      setError('Bir loyihaga ko‘pi bilan 5 ta rasm tanlang.');
      return;
    }
    if (
      files.some(
        (file) =>
          file.size > MAX_UPLOAD_BYTES ||
          !['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      )
    ) {
      setError('JPG, PNG yoki WebP tanlang. Har bir fayl 8 MB dan oshmasin.');
      return;
    }
    setError('');
    setPending((previous) => [...previous, ...files]);
  };
  const uploadPending = async (projectId: string) => {
    try {
      for (let i = 0; i < pending.length; i++) {
        const file = pending[i];
        setUploadStatus(`${i + 1} / ${pending.length} — ${file.name}`);
        const form = new FormData();
        form.set('file', file);
        try {
          await api(`/admin/projects/${projectId}/images`, { method: 'POST', body: form });
        } catch (e) {
          throw new Error(
            `${file.name}: ${e instanceof Error ? e.message : 'Xatolik'}. Yuklanmagan rasmlar tanlangan holda qoldi; qayta urinib ko‘ring.`,
          );
        }
        setPending((previous) => previous.filter((item) => item !== file));
      }
    } finally {
      setUploadStatus('');
      setProject(await api<Project>(`/admin/projects/${projectId}`));
    }
  };
  const fields: Field[] = [
    { key: 'title', label: 'Loyiha nomi', required: true },
    { key: 'slug', label: 'URL slug', required: true, hint: 'Masalan: savdo-platforma' },
    { key: 'shortDescription', label: 'Qisqa tavsif', type: 'textarea', required: true },
    { key: 'description', label: 'To‘liq tavsif', type: 'textarea', required: true },
    {
      key: 'categoryId',
      label: 'Toifa',
      type: 'select',
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    { key: 'year', label: 'Yil', type: 'number', required: true },
    { key: 'client', label: 'Mijoz / soha' },
    {
      key: 'goal',
      label: 'Loyiha maqsadi',
      type: 'textarea',
      hint: 'Biznes qaysi maqsadga erishmoqchi edi?',
    },
    {
      key: 'businessContext',
      label: 'Biznes konteksti',
      type: 'textarea',
      hint: 'Soha, mijozlar, asosiy jarayonlar va biznes obyektlari.',
    },
    { key: 'challenge', label: 'Muammolar', type: 'textarea' },
    {
      key: 'aiContribution',
      label: 'AI roli',
      type: 'textarea',
      hint: 'Qaysi AI imkoniyati qo‘shildi? Nima qiladi va inson nazorati qayerda kerak? AI ishlatilmasa bo‘sh qoldiring.',
    },
    { key: 'solution', label: 'Yechim', type: 'textarea' },
    { key: 'result', label: 'Natija', type: 'textarea' },
    { key: 'concept', label: 'Concept Project (haqiqiy mijoz emas)', type: 'checkbox' },
    { key: 'published', label: 'Nashr qilish', type: 'checkbox' },
    { key: 'featured', label: 'Tanlangan loyiha', type: 'checkbox' },
  ];
  if (!ready && !error) return <Loading />;
  return (
    <>
      <Link className="back-link" to="/projects">
        <ArrowLeft size={16} />
        Loyihalarga qaytish
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PORTFOLIO / TAHRIRLASH</p>
          <h1>{isNew ? 'Yangi loyiha' : project?.title}</h1>
        </div>
        {!isNew && (
          <Button variant="destructive" onClick={() => setConfirm(true)}>
            <Trash2 size={16} />
            O‘chirish
          </Button>
        )}
      </div>
      <ErrorBox message={error} />
      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}
      <div className="editor-layout">
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              const parsed = projectSchema.parse({
                ...values,
                categoryId: values.categoryId || null,
              });
              const p = await save<Project>(
                isNew ? '/admin/projects' : `/admin/projects/${id}`,
                parsed,
                isNew ? 'POST' : 'PATCH',
              );
              try {
                await uploadPending(p.id);
              } finally {
                if (isNew) navigate(`/projects/${p.id}`, { replace: true });
              }
            }, !isNew);
          }}
        >
          <fieldset disabled={busy} className="editor-fields">
            <Fields fields={fields} values={values} setValues={setValues} />
          </fieldset>
          <fieldset className="technology-field">
            <legend>Texnologiyalar</legend>
            {technologies.map((t) => (
              <label className="check-label" key={t.id}>
                <input
                  type="checkbox"
                  checked={(values.technologyIds as string[]).includes(t.id)}
                  onChange={(event) => {
                    const ids = values.technologyIds as string[];
                    setValues({
                      ...values,
                      technologyIds: event.target.checked
                        ? [...ids, t.id]
                        : ids.filter((i) => i !== t.id),
                    });
                  }}
                />
                {t.name}
              </label>
            ))}
          </fieldset>
          <div className="form-actions">
            <Button disabled={busy}>{busy ? 'Saqlanmoqda…' : 'Loyihani saqlash'}</Button>
          </div>
        </form>
        <aside className="panel images-panel">
          <div className="flex-between">
            <h2>Rasmlar</h2>
            <Badge>{(project?.images.length || 0) + pending.length} / 5</Badge>
          </div>
          <p className="muted">JPG, PNG, WebP · 8 MB gacha. 64–8000 px.</p>
          <label
            className={`upload-zone ${busy ? 'disabled' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <Upload size={25} />
            <span>
              {(project?.images.length || 0) + pending.length >= 5
                ? '5 / 5 — limitga yetdingiz'
                : 'Rasmlarni tanlang yoki shu yerga tashlang'}
            </span>
            <small>Bir vaqtning o‘zida 5 tagacha fayl</small>
            <input
              aria-label="Rasm yuklash"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              disabled={busy || (project?.images.length || 0) + pending.length >= 5}
              onChange={(event) => {
                chooseFiles(Array.from(event.target.files || []));
                event.target.value = '';
              }}
            />
          </label>
          {pending.length > 0 && (
            <p className="muted">
              Tanlangan rasmlar loyiha bilan birga saqlanadi. Birinchi rasm muqova bo‘ladi.
            </p>
          )}
          {uploadStatus && <p role="status">Yuklanmoqda: {uploadStatus}</p>}
          {pending.map((file, index) => (
            <div
              className="image-item pending-image"
              key={`${file.name}-${file.lastModified}-${index}`}
            >
              <PendingImage file={file} />
              <div className="flex-between">
                <span>{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  aria-label={`${file.name} — tanlovdan olib tashlash`}
                  onClick={() => setPending((previous) => previous.filter((item) => item !== file))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <small className="gold">Saqlash kutilmoqda</small>
            </div>
          ))}
          {!isNew && pending.length > 0 && (
            <Button
              type="button"
              disabled={busy}
              onClick={() => void run(() => uploadPending(id!))}
            >
              Tanlangan rasmlarni yuklash
            </Button>
          )}
          {project?.images.map((image, index) => (
            <div className="image-item" key={image.id}>
              <img src={image.url} alt={image.alt || 'Portfolio rasmi'} />
              <div className="image-controls">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  title="Muqova qilish"
                  aria-label="Muqova qilish"
                  onClick={() =>
                    void run(() =>
                      save(`/admin/projects/${id}/images/${image.id}`, { isCover: true }, 'PATCH'),
                    )
                  }
                >
                  <Star size={17} fill={image.isCover ? 'currentColor' : 'none'} />
                </Button>
                {[
                  [-1, ArrowUp],
                  [1, ArrowDown],
                ].map(([direction, Icon]) => {
                  const d = direction as number,
                    C = Icon as typeof ArrowUp;
                  return (
                    <Button
                      type="button"
                      variant="ghost"
                      key={d}
                      aria-label={d === -1 ? 'Yuqoriga' : 'Pastga'}
                      disabled={busy || index + d < 0 || index + d >= project.images.length}
                      onClick={() =>
                        void run(() => {
                          const ids = project.images.map((i) => i.id);
                          [ids[index], ids[index + d]] = [ids[index + d], ids[index]];
                          return save(`/admin/projects/${id}/images/reorder`, { ids }, 'PATCH');
                        })
                      }
                    >
                      <C size={16} />
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  aria-label="Rasmni o‘chirish"
                  onClick={() =>
                    void run(() =>
                      api(`/admin/projects/${id}/images/${image.id}`, { method: 'DELETE' }),
                    )
                  }
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <label>
                Alt matn
                <input
                  aria-label="Alt matn"
                  defaultValue={image.alt}
                  maxLength={300}
                  key={`${image.id}-${image.alt}`}
                  onBlur={(e) => {
                    if (e.target.value !== image.alt)
                      void run(() =>
                        save(
                          `/admin/projects/${id}/images/${image.id}`,
                          { alt: e.target.value },
                          'PATCH',
                        ),
                      );
                  }}
                />
              </label>
              <label className="replace-label">
                Rasmni almashtirish
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const form = new FormData();
                    form.set('file', file);
                    void run(() =>
                      api(`/admin/projects/${id}/images/${image.id}`, {
                        method: 'PUT',
                        body: form,
                      }),
                    );
                    event.target.value = '';
                  }}
                />
              </label>
            </div>
          ))}
        </aside>
      </div>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Loyiha o‘chirilsinmi?"
        description="Loyiha va unga biriktirilgan rasmlar o‘chiriladi. Bu amalni bekor qilib bo‘lmaydi."
      >
        <div className="form-actions">
          <Button variant="outline" onClick={() => setConfirm(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await api(`/admin/projects/${id}`, { method: 'DELETE' });
                navigate('/projects');
              }, false)
            }
          >
            Loyihani o‘chirish
          </Button>
        </div>
      </Modal>
    </>
  );
}
