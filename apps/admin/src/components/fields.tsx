export type Field = {
  key: string;
  label: string;
  type?:
    | 'text'
    | 'textarea'
    | 'number'
    | 'checkbox'
    | 'password'
    | 'email'
    | 'lines'
    | 'list'
    | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
};
export function Fields({
  fields,
  values,
  setValues,
}: {
  fields: Field[];
  values: Record<string, unknown>;
  setValues: (values: Record<string, unknown>) => void;
}) {
  return (
    <div className="fields-grid">
      {fields.map((f) => (
        <label
          className={
            f.type === 'textarea' || f.type === 'lines'
              ? 'full'
              : f.type === 'checkbox'
                ? 'check-label'
                : ''
          }
          key={f.key}
        >
          {f.type !== 'checkbox' && (
            <span>
              {f.label}
              {f.required ? ' *' : ''}
            </span>
          )}
          {f.type === 'textarea' || f.type === 'lines' ? (
            <textarea
              rows={5}
              value={
                f.type === 'lines'
                  ? ((values[f.key] as string[]) || []).join('\n')
                  : String(values[f.key] ?? '')
              }
              onChange={(e) =>
                setValues({
                  ...values,
                  [f.key]: f.type === 'lines' ? e.target.value.split('\n') : e.target.value,
                })
              }
              required={f.required}
            />
          ) : f.type === 'select' ? (
            <select
              value={String(values[f.key] ?? '')}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              required={f.required}
            >
              <option value="">—</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'checkbox' ? (
            <>
              <input
                type="checkbox"
                checked={Boolean(values[f.key])}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
              />
              {f.label}
            </>
          ) : (
            <input
              type={
                f.type === 'number'
                  ? 'number'
                  : f.type === 'password'
                    ? 'password'
                    : f.type === 'email'
                      ? 'email'
                      : 'text'
              }
              value={
                f.type === 'list'
                  ? Array.isArray(values[f.key])
                    ? (values[f.key] as string[]).join(', ')
                    : ''
                  : String(values[f.key] ?? '')
              }
              autoComplete={f.type === 'password' ? 'new-password' : undefined}
              onChange={(e) =>
                setValues({
                  ...values,
                  [f.key]:
                    f.type === 'number'
                      ? Number(e.target.value)
                      : f.type === 'list'
                        ? e.target.value.split(',').map((s) => s.trim())
                        : e.target.value,
                })
              }
              required={f.required}
            />
          )}{' '}
          {f.hint && <small>{f.hint}</small>}
        </label>
      ))}
    </div>
  );
}
