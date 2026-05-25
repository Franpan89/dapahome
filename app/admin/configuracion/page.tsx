import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { saveSettingAction } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase.from('site_settings').select('*');
  const map = new Map((data ?? []).map((r: any) => [r.key, r.value]));
  const wa = map.get('whatsapp') ?? { number: '', greeting: '' };
  const tpl = map.get('checkout_template') ?? { intro: '', outro: '' };
  const hero = map.get('hero') ?? { eyebrow: '', title: '', subtitle: '' };

  return (
    <AdminShell email={user.email}>
      <div className="mb-6">
        <div className="label">Sitio</div>
        <h1 className="font-display text-3xl tracking-tight">Configuración</h1>
      </div>
      {ok && (
        <div className="mb-6 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Guardado correctamente.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingForm
          title="WhatsApp"
          k="whatsapp"
          fields={[
            { name: 'number', label: 'Número (formato internacional, sin +)', value: wa.number ?? '', hint: 'Ej: 593998001894' },
            { name: 'greeting', label: 'Saludo (opcional)', value: wa.greeting ?? '' },
          ]}
          current={wa}
        />
        <SettingForm
          title="Plantilla de pedido"
          k="checkout_template"
          fields={[
            { name: 'intro', label: 'Línea inicial', value: tpl.intro ?? '', textarea: true },
            { name: 'outro', label: 'Cierre del mensaje', value: tpl.outro ?? '', textarea: true },
          ]}
          current={tpl}
        />
        <SettingForm
          title="Hero del home"
          k="hero"
          fields={[
            { name: 'eyebrow', label: 'Eyebrow', value: hero.eyebrow ?? '' },
            { name: 'title', label: 'Título', value: hero.title ?? '', textarea: true },
            { name: 'subtitle', label: 'Subtítulo', value: hero.subtitle ?? '', textarea: true },
          ]}
          current={hero}
          className="lg:col-span-2"
        />
      </div>
    </AdminShell>
  );
}

function SettingForm({
  title, k, fields, current, className,
}: {
  title: string;
  k: string;
  fields: { name: string; label: string; value: string; hint?: string; textarea?: boolean }[];
  current: Record<string, unknown>;
  className?: string;
}) {
  return (
    <form action={saveSettingAction} className={`card p-6 space-y-3 ${className ?? ''}`}>
      <h2 className="font-display text-xl">{title}</h2>
      <input type="hidden" name="key" value={k} />
      <SettingPayload fields={fields} current={current} />
      {fields.map((f) => (
        <div key={f.name}>
          <label className="label" htmlFor={`${k}-${f.name}`}>{f.label}</label>
          {f.textarea ? (
            <textarea id={`${k}-${f.name}`} name={`__${f.name}`} defaultValue={f.value} className="input mt-1.5 min-h-[88px]" />
          ) : (
            <input id={`${k}-${f.name}`} name={`__${f.name}`} defaultValue={f.value} className="input mt-1.5" />
          )}
          {f.hint && <p className="mt-1 text-2xs text-ink-600">{f.hint}</p>}
        </div>
      ))}
      <button className="btn-primary w-full">Guardar</button>
    </form>
  );
}

// El server action acepta key + value (JSON). Como tenemos múltiples inputs, los serializamos
// con JS oculto. Para simplicidad, construimos un JSON con un input hidden actualizado por React.
// Para evitar hidratación cliente: usamos un truco — leemos los `__<name>` en el server action.
// Pero saveSettingAction espera `value` JSON. Reescribimos: aceptar tanto value JSON como __campos.

// Helper: input oculto con el JSON inicial. El server action lee `__<name>` si están presentes.
function SettingPayload({
  fields, current,
}: {
  fields: { name: string }[];
  current: Record<string, unknown>;
}) {
  const value = JSON.stringify(current);
  return <input type="hidden" name="value" defaultValue={value} />;
}
