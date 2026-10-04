import { useEffect, useState } from 'react';
import { userSchema, userPatchSchema, type SafeUser } from '@buhariy/contracts';
import { api, save } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button, Modal, ErrorBox, Badge } from '../components/ui';
export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SafeUser[]>([]),
    [open, setOpen] = useState(false),
    [edit, setEdit] = useState<SafeUser | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const load = () => api<SafeUser[]>('/admin/users').then(setUsers);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">XAVFSIZLIK</p>
          <h1>Foydalanuvchilar</h1>
          <p>ADMIN — to‘liq ruxsat. EDITOR — kontent boshqaruvi.</p>
        </div>
        <Button
          onClick={() => {
            setEdit(null);
            setError('');
            setOpen(true);
          }}
        >
          Foydalanuvchi qo‘shish
        </Button>
      </div>
      {!open && <ErrorBox message={error} />}
      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ism</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Holat</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Badge>{u.role}</Badge>
                </td>
                <td>{u.active ? 'Faol' : 'Bloklangan'}</td>
                <td>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEdit(u);
                      setError('');
                      setOpen(true);
                    }}
                  >
                    Tahrirlash
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={edit ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            const f = new FormData(event.currentTarget);
            try {
              const b = {
                name: f.get('name'),
                role: f.get('role'),
                ...(edit ? { active: f.get('active') === 'on' } : { email: f.get('email') }),
                ...(f.get('password') ? { password: f.get('password') } : {}),
              };
              await save(
                `/admin/users${edit ? '/' + edit.id : ''}`,
                edit ? userPatchSchema.parse(b) : userSchema.parse(b),
                edit ? 'PATCH' : 'POST',
              );
              await load();
              setOpen(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Xatolik');
            } finally {
              setBusy(false);
            }
          }}
        >
          <ErrorBox message={error} />
          <label>
            Ism
            <input name="name" defaultValue={edit?.name || ''} required />
          </label>
          {!edit && (
            <label>
              Email
              <input name="email" type="email" required />
            </label>
          )}
          <label>
            Rol
            <select name="role" defaultValue={edit?.role || 'EDITOR'}>
              {['ADMIN', 'EDITOR'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            {edit ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required={!edit}
            />
          </label>
          {edit && (
            <label className="check-label">
              <input name="active" type="checkbox" defaultChecked={edit.active} />
              Faol
            </label>
          )}
          {edit?.id === user?.id && (
            <p className="muted">
              O‘zingizning administrator ruxsatingizni olib tashlab bo‘lmaydi.
            </p>
          )}
          <Button disabled={busy}>Saqlash</Button>
        </form>
      </Modal>
    </>
  );
}
