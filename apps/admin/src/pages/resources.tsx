import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { taxonomySchema, serviceSchema, teamSchema, solutionSchema } from '@buhariy/contracts';
import { api, save } from '../lib/api';
import { Button, ErrorBox, Loading, Empty, Modal, Badge } from '../components/ui';
import { Fields, type Field } from '../components/fields';
const configs: Record<
  string,
  { title: string; schema: z.ZodType; fields: Field[]; defaults: Record<string, unknown> }
> = {
  solutions: {
    title: 'Tayyor yechimlar',
    schema: solutionSchema,
    defaults: {
      title: '',
      slug: '',
      locale: 'uz',
      sector: 'MANUFACTURING',
      description: '',
      audience: '',
      features: [],
      workflow: [],
      outcome: '',
      priceLabel: '',
      readiness: 'CONCEPT',
      featured: false,
      order: 0,
      published: false,
    },
    fields: [
      { key: 'title', label: 'Mahsulot / yechim nomi', required: true },
      { key: 'slug', label: 'Slug', required: true },
      {
        key: 'locale',
        label: 'Til',
        type: 'select',
        options: ['uz', 'ru', 'en'].map((value) => ({ value, label: value.toUpperCase() })),
        required: true,
      },
      {
        key: 'sector',
        label: 'Biznes sohasi',
        type: 'select',
        options: [
          { value: 'FINANCE', label: 'Moliya va filiallar' },
          { value: 'MANUFACTURING', label: 'Ishlab chiqarish' },
          { value: 'TRADE', label: 'Savdo' },
          { value: 'SERVICES', label: 'Xizmat ko‘rsatish' },
        ],
        required: true,
      },
      {
        key: 'readiness',
        label: 'Mahsulot holati',
        type: 'select',
        options: [
          { value: 'CONCEPT', label: 'Yechim konsepsiyasi' },
          { value: 'AVAILABLE', label: 'Mavjud mahsulot' },
        ],
        hint: 'Mavjud mahsulot holatini faqat haqiqiy mahsulot uchun tanlang.',
      },
      { key: 'audience', label: 'Kimlar uchun', type: 'textarea', required: true },
      { key: 'description', label: 'Tavsif', type: 'textarea', required: true },
      {
        key: 'features',
        label: 'Imkoniyatlar',
        type: 'lines',
        required: true,
        hint: 'Har bir imkoniyat alohida qatorda, 1–10 ta.',
      },
      {
        key: 'workflow',
        label: 'Jarayon bosqichlari',
        type: 'lines',
        hint: 'Har bir bosqich alohida qatorda, 8 tagacha. Ma’lum bo‘lmasa bo‘sh qoldiring.',
      },
      { key: 'outcome', label: 'Biznes uchun foyda / tafsilot', type: 'textarea' },
      {
        key: 'priceLabel',
        label: 'Narx va shartlar',
        hint: 'Tasdiqlangan narxni yozing yoki bo‘sh qoldiring — narx kelishiladi.',
      },
      { key: 'order', label: 'Tartib', type: 'number' },
      { key: 'featured', label: 'Ajratib ko‘rsatish', type: 'checkbox' },
      { key: 'published', label: 'Nashr qilish', type: 'checkbox' },
    ],
  },
  categories: {
    title: 'Toifalar',
    schema: taxonomySchema,
    defaults: { name: '', slug: '' },
    fields: [
      { key: 'name', label: 'Nomi', required: true },
      { key: 'slug', label: 'Slug', required: true },
    ],
  },
  technologies: {
    title: 'Texnologiyalar',
    schema: taxonomySchema,
    defaults: { name: '', slug: '' },
    fields: [
      { key: 'name', label: 'Nomi', required: true },
      { key: 'slug', label: 'Slug', required: true },
    ],
  },
  services: {
    title: 'Xizmatlar',
    schema: serviceSchema,
    defaults: {
      title: '',
      slug: '',
      description: '',
      body: '',
      icon: 'code',
      order: 0,
      published: false,
    },
    fields: [
      { key: 'title', label: 'Nomi', required: true },
      { key: 'slug', label: 'Slug', required: true },
      { key: 'description', label: 'Qisqa tavsif', type: 'textarea', required: true },
      { key: 'body', label: 'To‘liq tavsif', type: 'textarea', required: true },
      {
        key: 'icon',
        label: 'Belgi',
        type: 'select',
        options: ['code', 'bot', 'workflow', 'brain', 'database', 'plug'].map((value) => ({
          value,
          label: value,
        })),
      },
      { key: 'order', label: 'Tartib', type: 'number' },
      { key: 'published', label: 'Nashr qilish', type: 'checkbox' },
    ],
  },
  team: {
    title: 'Jamoa',
    schema: teamSchema,
    defaults: {
      name: '',
      position: '',
      photo: '',
      bio: '',
      skills: [],
      linkedin: '',
      telegram: '',
      order: 0,
      published: false,
    },
    fields: [
      { key: 'name', label: 'Ism Familiya', required: true },
      { key: 'position', label: 'Lavozim', required: true },
      { key: 'photo', label: 'Rasm URL (HTTPS)' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'skills', label: 'Ko‘nikmalar (vergul bilan)', type: 'list' },
      { key: 'linkedin', label: 'LinkedIn URL' },
      { key: 'telegram', label: 'Telegram URL' },
      { key: 'order', label: 'Tartib', type: 'number' },
      { key: 'published', label: 'Nashr qilish', type: 'checkbox' },
    ],
  },
};
export default function Resources({ resource }: { resource: string }) {
  const c = configs[resource];
  const [rows, setRows] = useState<Record<string, unknown>[]>([]),
    [loading, setLoading] = useState(true),
    [values, setValues] = useState<Record<string, unknown>>(c.defaults),
    [editId, setEditId] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [removeId, setRemoveId] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const load = () => api<Record<string, unknown>[]>(`/admin/${resource}`).then(setRows);
  useEffect(() => {
    setLoading(true);
    setError('');
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [resource]);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      setOpen(false);
      setRemoveId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KONTENT BOSHQARUVI</p>
          <h1>{c.title}</h1>
          <p>Saytda ko‘rinadigan ma’lumotlarni boshqaring.</p>
        </div>
        <Button
          onClick={() => {
            setEditId(null);
            setValues(c.defaults);
            setError('');
            setOpen(true);
          }}
        >
          <Plus size={17} />
          Qo‘shish
        </Button>
      </div>
      {!open && !removeId && <ErrorBox message={error} />}
      <section className="panel">
        {loading ? (
          <Loading />
        ) : rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Ma’lumot</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id)}>
                    <td>
                      <strong>{String(row.title || row.name)}</strong>
                    </td>
                    <td>
                      {String(row.slug || row.position || '—')}
                      {resource === 'solutions' && (
                        <p className="muted">
                          {String(row.locale).toUpperCase()} ·{' '}
                          {row.readiness === 'AVAILABLE' ? 'Mavjud mahsulot' : 'Konsepsiya'}
                        </p>
                      )}
                    </td>
                    <td>
                      {'published' in row ? (
                        <Badge tone={row.published ? 'green' : 'gold'}>
                          {row.published ? 'Nashr qilingan' : 'Qoralama'}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="ghost"
                          aria-label="Tahrirlash"
                          onClick={() => {
                            const { id, ...rest } = row;
                            setEditId(String(id));
                            setValues(rest);
                            setError('');
                            setOpen(true);
                          }}
                        >
                          <Pencil size={17} />
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label="O‘chirish"
                          onClick={() => {
                            setError('');
                            setRemoveId(String(row.id));
                          }}
                        >
                          <Trash2 size={17} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </section>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`${c.title} — ${editId ? 'tahrirlash' : 'qo‘shish'}`}
        wide
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run(() =>
              save(
                `/admin/${resource}${editId ? '/' + editId : ''}`,
                c.schema.parse(
                  resource === 'solutions'
                    ? {
                        ...values,
                        features: (values.features as string[])
                          .map((s) => s.trim())
                          .filter(Boolean),
                        workflow: (values.workflow as string[])
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }
                    : values,
                ),
                editId ? 'PATCH' : 'POST',
              ),
            );
          }}
        >
          <ErrorBox message={error} />
          <Fields fields={c.fields} values={values} setValues={setValues} />
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button disabled={busy}>{busy ? 'Saqlanmoqda…' : 'Saqlash'}</Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(removeId)}
        onOpenChange={() => setRemoveId(null)}
        title="Ma’lumot o‘chirilsinmi?"
        description="Bu amalni bekor qilib bo‘lmaydi."
      >
        <ErrorBox message={error} />
        <div className="form-actions">
          <Button variant="outline" onClick={() => setRemoveId(null)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() =>
              void run(() => api(`/admin/${resource}/${removeId}`, { method: 'DELETE' }))
            }
          >
            O‘chirish
          </Button>
        </div>
      </Modal>
    </>
  );
}
