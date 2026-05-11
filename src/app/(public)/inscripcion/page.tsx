'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/shared/lib/api';
import { inscripcionApi, type NivelCatalogo } from '@/modules/inscripcion/api';
import { Icon } from '@/shared/components/Icon';

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; title: string; subtitle: string }[] = [
  { id: 1, title: 'Datos del alumno',         subtitle: 'DNI, nombres, grado…' },
  { id: 2, title: 'Padre / Madre / Apoderado', subtitle: 'Datos del responsable' },
  { id: 3, title: 'Documentos',                subtitle: 'Comprobante + certificado' },
  { id: 4, title: 'Acceso al portal',          subtitle: 'PIN de 6 dígitos' },
];

export default function InscripcionPage() {
  const [step, setStep] = useState<Step>(1);
  const [niveles, setNiveles] = useState<NivelCatalogo[]>([]);
  const [form, setForm] = useState({
    dni_estudiante: '',
    nombres_estudiante: '',
    apellidos_estudiante: '',
    fecha_nacimiento: '',
    sexo: 'M' as 'M' | 'F',
    direccion: '',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: '',
    ie_procedencia: '',
    anio_procedencia: '',
    nivel_id: '',
    grado_id: '',
    apoderado_nombres: '',
    apoderado_apellidos: '',
    apoderado_dni: '',
    apoderado_telefono: '',
    apoderado_email: '',
    apoderado_tipo: 'padre' as 'padre' | 'madre' | 'apoderado',
    pin: '',
    pin_confirmation: '',
  });
  const [comprobantePago, setComprobantePago] = useState<File | null>(null);
  const [certificadoEstudios, setCertificadoEstudios] = useState<File | null>(null);
  const compRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<{ codigo: string } | null>(null);
  const [enviandoFactura, setEnviandoFactura] = useState(false);
  const [facturaMsg, setFacturaMsg] = useState<string | null>(null);

  useEffect(() => {
    inscripcionApi.catalogoNivelesGrados()
      .then((r) => setNiveles(r.data))
      .catch(() => setNiveles([]));
  }, []);

  const gradosDisponibles = useMemo(() => {
    if (!form.nivel_id) return [];
    const n = niveles.find((nv) => nv.id === Number(form.nivel_id));
    return n?.grados ?? [];
  }, [niveles, form.nivel_id]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    setError(null);
    if (step === 1) {
      if (!/^\d{8}$/.test(form.dni_estudiante)) return setError('DNI del alumno debe tener 8 dígitos.');
      if (!form.nombres_estudiante || !form.apellidos_estudiante) return setError('Completa nombres y apellidos.');
      if (!form.fecha_nacimiento) return setError('Selecciona la fecha de nacimiento.');
      if (!form.direccion) return setError('Ingresa la dirección.');
      if (!form.nivel_id || !form.grado_id) return setError('Selecciona nivel y grado al que postula.');
    }
    if (step === 2) {
      if (!form.apoderado_nombres || !form.apoderado_apellidos) return setError('Completa los datos del apoderado.');
      if (!/^\d{8}$/.test(form.apoderado_dni)) return setError('DNI del apoderado debe tener 8 dígitos.');
    }
    if (step === 3) {
      if (!comprobantePago) return setError('Adjunta el comprobante de pago de la matrícula.');
      if (!certificadoEstudios) return setError('Adjunta el certificado de estudios del alumno.');
    }
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  function back() {
    setError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function handleEnviarFactura() {
    setFacturaMsg(null);
    setError(null);
    if (!form.apoderado_email || !form.apoderado_email.includes('@')) {
      return setError('Ingresa un email válido antes de enviar la facturación.');
    }
    const nombre = `${form.nombres_estudiante} ${form.apellidos_estudiante}`.trim() || 'Alumno por inscribir';
    setEnviandoFactura(true);
    try {
      const r = await inscripcionApi.enviarFacturacion(form.apoderado_email, nombre);
      setFacturaMsg(r.message);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('No se pudo enviar la facturación.');
    } finally {
      setEnviandoFactura(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setFieldErrors({});
    if (!/^\d{6}$/.test(form.pin)) return setError('PIN debe ser de 6 dígitos.');
    if (form.pin !== form.pin_confirmation) return setError('Los PIN no coinciden.');

    setLoading(true);
    try {
      const res = await inscripcionApi.store({
        dni_estudiante: form.dni_estudiante,
        nombres_estudiante: form.nombres_estudiante,
        apellidos_estudiante: form.apellidos_estudiante,
        fecha_nacimiento: form.fecha_nacimiento,
        sexo: form.sexo,
        direccion: form.direccion,
        departamento: form.departamento || undefined,
        provincia: form.provincia || undefined,
        distrito: form.distrito || undefined,
        ie_procedencia: form.ie_procedencia || undefined,
        anio_procedencia: form.anio_procedencia ? Number(form.anio_procedencia) : undefined,
        nivel_id: Number(form.nivel_id),
        grado_id: Number(form.grado_id),
        pin: form.pin,
        pin_confirmation: form.pin_confirmation,
        apoderado_nombres: form.apoderado_nombres,
        apoderado_apellidos: form.apoderado_apellidos,
        apoderado_dni: form.apoderado_dni,
        apoderado_telefono: form.apoderado_telefono || undefined,
        apoderado_email: form.apoderado_email || undefined,
        apoderado_tipo: form.apoderado_tipo,
        comprobante_pago: comprobantePago,
        certificado_estudios: certificadoEstudios,
      });
      setSuccess({ codigo: res.data.codigo });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setError('Error de red. Verifica que el backend esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-page p-6">
        <div className="max-w-md w-full bg-bg-card border border-border rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-4">
            <Icon name="CircleCheck" size={32} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-1">¡Inscripción enviada!</h1>
          <p className="text-sm text-text-secondary mb-4">
            Tu solicitud quedó <b>pendiente de revisión</b> por el área administrativa.
            El comprobante de pago y certificado fueron recibidos.
          </p>
          <div className="bg-bg-muted rounded-sm py-3 mb-5">
            <p className="text-[11px] text-text-muted tracking-widest font-bold mb-1">CÓDIGO DE INSCRIPCIÓN</p>
            <p className="font-mono font-bold text-trilce-primary">{success.codigo}</p>
          </div>
          <Link href="/portal-login" className="block w-full bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold py-3 rounded-sm">
            Ir al login del portal
          </Link>
          <Link href="/" className="block w-full mt-2 text-sm text-text-secondary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-page">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-trilce-primary flex items-center justify-center text-white font-bold">T</div>
            <span className="font-bold">Inscripción 2026</span>
          </Link>
          <a href="tel:016124081" className="text-sm text-text-secondary hover:text-trilce-primary">
            ¿Necesitas ayuda? · 01 612 4081
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Steps sidebar */}
        <aside className="bg-bg-card border border-border rounded-md p-5 h-fit">
          <h3 className="text-xs font-bold tracking-widest text-text-muted mb-4">PASOS</h3>
          <ul className="flex flex-col gap-2">
            {STEPS.map((s) => {
              const active = s.id === step;
              const done = s.id < step;
              return (
                <li key={s.id} className={`flex items-start gap-3 p-3 rounded-sm ${active ? 'bg-trilce-primary-soft' : done ? 'opacity-60' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    active ? 'bg-trilce-primary text-white'
                    : done ? 'bg-success text-white'
                    : 'bg-bg-muted text-text-secondary'
                  }`}>
                    {done ? '✓' : s.id}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${active ? 'text-trilce-primary-dark' : ''}`}>{s.title}</div>
                    <div className="text-[11px] text-text-muted">{s.subtitle}</div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 p-3 bg-bg-muted rounded-sm text-xs text-text-secondary">
            <Icon name="TriangleAlert" size={14} className="inline mr-1 text-warning" />
            Esta solicitud quedará pendiente de aprobación por administración.
          </div>
        </aside>

        {/* Form */}
        <section className="bg-bg-card border border-border rounded-md p-6 sm:p-8">
          <span className="text-xs font-bold tracking-widest text-trilce-primary">PASO {step} DE 4</span>
          <h1 className="text-2xl font-bold mb-1">{STEPS[step - 1].title}</h1>
          <p className="text-sm text-text-secondary mb-6">
            Completa la información para continuar. Todos los campos con * son obligatorios.
          </p>

          {step === 1 && <Paso1 form={form} update={update} niveles={niveles} gradosDisponibles={gradosDisponibles} fieldErrors={fieldErrors} />}

          {step === 2 && (
            <Paso2
              form={form}
              update={update}
              fieldErrors={fieldErrors}
              onEnviarFactura={handleEnviarFactura}
              enviandoFactura={enviandoFactura}
              facturaMsg={facturaMsg}
            />
          )}

          {step === 3 && (
            <Paso3
              comprobantePago={comprobantePago}
              certificadoEstudios={certificadoEstudios}
              onComprobante={setComprobantePago}
              onCertificado={setCertificadoEstudios}
              compRef={compRef}
              certRef={certRef}
            />
          )}

          {step === 4 && <Paso4 form={form} update={update} fieldErrors={fieldErrors} />}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm p-3">{error}</div>
          )}

          <div className="flex justify-between mt-6 pt-6 border-t border-border">
            {step > 1 ? (
              <button onClick={back} className="text-text-secondary hover:text-text-primary font-semibold px-4 py-2.5">
                ← Atrás
              </button>
            ) : (
              <Link href="/" className="text-text-secondary hover:text-text-primary font-semibold px-4 py-2.5">
                Cancelar
              </Link>
            )}

            {step < 4 ? (
              <button onClick={next} className="bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-6 py-2.5 rounded-sm flex items-center gap-2">
                Siguiente paso <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="bg-trilce-primary hover:bg-trilce-primary-dark disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-sm flex items-center gap-2">
                {loading ? 'Enviando…' : 'Enviar inscripción'}
                {!loading && <Icon name="CircleCheck" size={16} />}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ─── Subcomponentes por paso ─── */

type FormShape = ReturnType<typeof initialFormShape>;
function initialFormShape() { return {} as Record<string, never>; } // solo para tipos

function Paso1({
  form, update, niveles, gradosDisponibles, fieldErrors,
}: {
  form: any;
  update: any;
  niveles: NivelCatalogo[];
  gradosDisponibles: { id: number; nombre: string }[];
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="DNI del estudiante *" err={fieldErrors.dni_estudiante?.[0]}>
        <input type="text" inputMode="numeric" maxLength={8} value={form.dni_estudiante}
          onChange={(e) => update('dni_estudiante', e.target.value.replace(/\D/g, ''))}
          className="input" />
      </Field>
      <Field label="Fecha de nacimiento *" err={fieldErrors.fecha_nacimiento?.[0]}>
        <input type="date" value={form.fecha_nacimiento}
          onChange={(e) => update('fecha_nacimiento', e.target.value)} className="input" />
      </Field>
      <Field label="Nombres *" err={fieldErrors.nombres_estudiante?.[0]}>
        <input type="text" value={form.nombres_estudiante}
          onChange={(e) => update('nombres_estudiante', e.target.value)} className="input" />
      </Field>
      <Field label="Apellidos *" err={fieldErrors.apellidos_estudiante?.[0]}>
        <input type="text" value={form.apellidos_estudiante}
          onChange={(e) => update('apellidos_estudiante', e.target.value)} className="input" />
      </Field>
      <Field label="Nivel al que postula *" err={fieldErrors.nivel_id?.[0]}>
        <select value={form.nivel_id}
          onChange={(e) => { update('nivel_id', e.target.value); update('grado_id', ''); }}
          className="input bg-bg-card">
          <option value="">Selecciona…</option>
          {niveles.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
        </select>
      </Field>
      <Field label="Grado *" err={fieldErrors.grado_id?.[0]}>
        <select value={form.grado_id} onChange={(e) => update('grado_id', e.target.value)}
          disabled={!form.nivel_id} className="input bg-bg-card disabled:opacity-50">
          <option value="">Selecciona…</option>
          {gradosDisponibles.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <span className="block text-sm font-semibold mb-1.5">Sexo *</span>
        <div className="flex gap-2 max-w-xs">
          {(['M', 'F'] as const).map((s) => (
            <button key={s} type="button" onClick={() => update('sexo', s)}
              className={`flex-1 py-2.5 rounded-sm font-semibold border ${
                form.sexo === s ? 'bg-trilce-primary text-white border-trilce-primary'
                : 'bg-bg-card border-border text-text-secondary'
              }`}>
              {s === 'M' ? 'Masculino' : 'Femenino'}
            </button>
          ))}
        </div>
      </div>
      <Field label="IE de procedencia" err={fieldErrors.ie_procedencia?.[0]}>
        <input type="text" value={form.ie_procedencia}
          onChange={(e) => update('ie_procedencia', e.target.value)} className="input" />
      </Field>
      <Field label="Año de procedencia" err={fieldErrors.anio_procedencia?.[0]}>
        <input type="number" min={1990} max={2100} value={form.anio_procedencia}
          onChange={(e) => update('anio_procedencia', e.target.value)} className="input" />
      </Field>
      <Field label="Dirección *" err={fieldErrors.direccion?.[0]}>
        <input type="text" value={form.direccion}
          onChange={(e) => update('direccion', e.target.value)} className="input" />
      </Field>
      <Field label="Distrito" err={fieldErrors.distrito?.[0]}>
        <input type="text" value={form.distrito}
          onChange={(e) => update('distrito', e.target.value)} className="input" />
      </Field>
    </div>
  );
}

function Paso2({
  form, update, fieldErrors, onEnviarFactura, enviandoFactura, facturaMsg,
}: {
  form: any;
  update: any;
  fieldErrors: Record<string, string[]>;
  onEnviarFactura: () => void;
  enviandoFactura: boolean;
  facturaMsg: string | null;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Tipo">
        <select value={form.apoderado_tipo} onChange={(e) => update('apoderado_tipo', e.target.value)} className="input bg-bg-card">
          <option value="padre">Padre</option>
          <option value="madre">Madre</option>
          <option value="apoderado">Apoderado</option>
        </select>
      </Field>
      <div />
      <Field label="Nombres del apoderado *" err={fieldErrors.apoderado_nombres?.[0]}>
        <input type="text" value={form.apoderado_nombres} onChange={(e) => update('apoderado_nombres', e.target.value)} className="input" />
      </Field>
      <Field label="Apellidos del apoderado *" err={fieldErrors.apoderado_apellidos?.[0]}>
        <input type="text" value={form.apoderado_apellidos} onChange={(e) => update('apoderado_apellidos', e.target.value)} className="input" />
      </Field>
      <Field label="DNI del apoderado *" err={fieldErrors.apoderado_dni?.[0]}>
        <input type="text" inputMode="numeric" maxLength={8} value={form.apoderado_dni}
          onChange={(e) => update('apoderado_dni', e.target.value.replace(/\D/g, ''))} className="input" />
      </Field>
      <Field label="Teléfono" err={fieldErrors.apoderado_telefono?.[0]}>
        <input type="tel" value={form.apoderado_telefono} onChange={(e) => update('apoderado_telefono', e.target.value)} className="input" />
      </Field>

      <div className="sm:col-span-2 flex flex-col gap-2">
        <Field label="Email" err={fieldErrors.apoderado_email?.[0]}>
          <div className="flex gap-2">
            <input type="email" value={form.apoderado_email}
              onChange={(e) => update('apoderado_email', e.target.value)}
              placeholder="padre@gmail.com"
              className="input flex-1" />
            <button type="button" onClick={onEnviarFactura} disabled={enviandoFactura || !form.apoderado_email}
              className="bg-trilce-primary-soft border border-trilce-primary text-trilce-primary-dark font-semibold px-4 py-2.5 rounded-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 hover:bg-trilce-primary hover:text-white transition-colors">
              <Icon name="Mail" size={16} />
              {enviandoFactura ? 'Enviando…' : 'Enviar facturación'}
            </button>
          </div>
        </Field>
        {facturaMsg && (
          <div className="bg-success/10 border border-success/30 text-success text-xs rounded-sm p-2 flex items-center gap-2">
            <Icon name="CircleCheck" size={14} /> {facturaMsg}
          </div>
        )}
        <p className="text-[11px] text-text-muted">
          Al enviar la facturación, te llegará el monto a pagar de la matrícula y los datos bancarios.
        </p>
      </div>
    </div>
  );
}

function Paso3({
  comprobantePago, certificadoEstudios, onComprobante, onCertificado, compRef, certRef,
}: {
  comprobantePago: File | null;
  certificadoEstudios: File | null;
  onComprobante: (f: File | null) => void;
  onCertificado: (f: File | null) => void;
  compRef: React.RefObject<HTMLInputElement | null>;
  certRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-trilce-primary-soft border border-trilce-primary-light rounded-sm p-3 text-xs flex items-start gap-2">
        <Icon name="TriangleAlert" size={14} className="text-trilce-primary mt-0.5" />
        <span className="text-text-secondary">
          Antes de continuar, asegúrate de haber realizado el pago de matrícula con los datos
          que recibiste por email. Adjunta el voucher y el certificado de estudios del alumno.
        </span>
      </div>

      <FileBlock
        label="Comprobante de pago de matrícula *"
        hint="Voucher de Yape / Plin / transferencia. PDF, JPG o PNG (máx 5MB)."
        file={comprobantePago}
        onPick={onComprobante}
        inputRef={compRef}
        icon="CreditCard"
      />

      <FileBlock
        label="Certificado de estudios del alumno *"
        hint="Documento del año anterior. PDF, JPG o PNG (máx 5MB)."
        file={certificadoEstudios}
        onPick={onCertificado}
        inputRef={certRef}
        icon="FileText"
      />
    </div>
  );
}

function FileBlock({
  label, hint, file, onPick, inputRef, icon,
}: {
  label: string;
  hint: string;
  file: File | null;
  onPick: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  icon: 'CreditCard' | 'FileText';
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="block text-sm font-semibold">{label}</span>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)} className="hidden" />
      <button type="button" onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-sm transition-colors text-left ${
          file ? 'bg-success/5 border-success' : 'bg-bg-muted border-border hover:border-trilce-primary'
        }`}>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${file ? 'bg-success/15 text-success' : 'bg-bg-card text-text-muted'}`}>
          <Icon name={file ? 'CircleCheck' : icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <div className="text-sm font-semibold text-success truncate">{file.name}</div>
              <div className="text-[11px] text-text-muted">{(file.size / 1024).toFixed(0)} KB · Haz clic para cambiar</div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-text-primary">Haz clic para seleccionar archivo</div>
              <div className="text-[11px] text-text-muted">{hint}</div>
            </>
          )}
        </div>
      </button>
    </div>
  );
}

function Paso4({ form, update, fieldErrors }: { form: any; update: any; fieldErrors: Record<string, string[]> }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-trilce-primary-soft border border-trilce-primary-light rounded-sm p-4 mb-5 flex items-start gap-3">
        <Icon name="KeyRound" size={20} className="text-trilce-primary mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-trilce-primary-dark">Elige tu PIN de acceso</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Cuando administración apruebe la inscripción, podrás ingresar al portal del estudiante con el DNI del alumno y este PIN.
          </p>
        </div>
      </div>
      <Field label="PIN (6 dígitos) *" err={fieldErrors.pin?.[0]}>
        <input type="password" inputMode="numeric" maxLength={6} value={form.pin}
          onChange={(e) => update('pin', e.target.value.replace(/\D/g, ''))}
          className="input tracking-[0.5em] text-center text-lg" />
      </Field>
      <div className="h-3" />
      <Field label="Confirmar PIN *" err={fieldErrors.pin_confirmation?.[0]}>
        <input type="password" inputMode="numeric" maxLength={6} value={form.pin_confirmation}
          onChange={(e) => update('pin_confirmation', e.target.value.replace(/\D/g, ''))}
          className="input tracking-[0.5em] text-center text-lg" />
      </Field>
    </div>
  );
}

function Field({
  label, err, children, className,
}: {
  label: string;
  err?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
      {err && <span className="block text-xs text-red-600 mt-1">{err}</span>}
    </label>
  );
}
