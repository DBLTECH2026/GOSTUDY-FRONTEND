'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/shared/lib/api';
import { inscripcionApi, type NivelCatalogo } from '@/modules/inscripcion/api';
import { Icon, IconName } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; title: string; subtitle: string; icon: IconName }[] = [
  { id: 1, title: 'Datos del alumno',          subtitle: 'DNI, nombres, grado',     icon: 'User' },
  { id: 2, title: 'Padre / Madre / Apoderado', subtitle: 'Datos del responsable',   icon: 'Users' },
  { id: 3, title: 'Documentos',                subtitle: 'Comprobante + certificado', icon: 'FileText' },
  { id: 4, title: 'Acceso al portal',          subtitle: 'PIN de 6 dígitos',        icon: 'KeyRound' },
];

type DniState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function InscripcionPage() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
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

  const [dniState, setDniState] = useState<DniState>('idle');
  const [dniMsg, setDniMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<{ codigo: string } | null>(null);
  const [enviandoFactura, setEnviandoFactura] = useState(false);

  useEffect(() => {
    inscripcionApi.catalogoNivelesGrados()
      .then((r) => setNiveles(r.data))
      .catch(() => setNiveles([]));
  }, []);

  useEffect(() => {
    const dni = form.dni_estudiante;
    if (dni.length === 0) {
      setDniState('idle');
      setDniMsg(null);
      return;
    }
    if (!/^\d{8}$/.test(dni)) {
      setDniState('invalid');
      setDniMsg(dni.length < 8 ? `Faltan ${8 - dni.length} dígitos` : null);
      return;
    }
    setDniState('checking');
    setDniMsg(null);
    const t = setTimeout(() => {
      inscripcionApi.verificarDni(dni)
        .then((r) => {
          if (r.disponible) {
            setDniState('available');
            // Autocompletar nombres/apellidos desde RENIEC sin pisar lo ya escrito
            if (r.identidad && (r.identidad.nombres || r.identidad.apellidos)) {
              setDniMsg('DNI disponible · datos cargados desde RENIEC');
              setForm((f) => ({
                ...f,
                nombres_estudiante: f.nombres_estudiante || r.identidad!.nombres,
                apellidos_estudiante: f.apellidos_estudiante || r.identidad!.apellidos,
              }));
            } else {
              setDniMsg('DNI disponible · no se hallaron datos en RENIEC, complétalos manualmente');
            }
          } else {
            setDniState('taken');
            setDniMsg(r.motivo ?? 'Este DNI ya está registrado');
          }
        })
        .catch(() => {
          setDniState('idle');
          setDniMsg(null);
        });
    }, 500);
    return () => clearTimeout(t);
  }, [form.dni_estudiante]);

  const gradosDisponibles = useMemo(() => {
    if (!form.nivel_id) return [];
    const n = niveles.find((nv) => nv.id === Number(form.nivel_id));
    return n?.grados ?? [];
  }, [niveles, form.nivel_id]);

  const progressPct = useMemo(() => ((step - 1) / 3) * 100, [step]);

  const paso1Completo = useMemo(() => {
    return (
      /^\d{8}$/.test(form.dni_estudiante) &&
      dniState === 'available' &&
      !!form.nombres_estudiante &&
      !!form.apellidos_estudiante &&
      !!form.fecha_nacimiento &&
      !!form.direccion &&
      !!form.nivel_id &&
      !!form.grado_id
    );
  }, [form, dniState]);

  const paso2Completo = useMemo(() => {
    return (
      !!form.apoderado_nombres &&
      !!form.apoderado_apellidos &&
      /^\d{8}$/.test(form.apoderado_dni)
    );
  }, [form]);

  const paso3Completo = !!comprobantePago && !!certificadoEstudios;

  const paso4Completo =
    /^\d{6}$/.test(form.pin) && form.pin === form.pin_confirmation;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    if (step === 1) {
      if (!/^\d{8}$/.test(form.dni_estudiante)) return notify.warning('El DNI del alumno debe tener 8 dígitos.');
      if (dniState === 'taken') return notify.warning(dniMsg ?? 'Este DNI ya está registrado.');
      if (dniState === 'checking') return notify.info('Verificando disponibilidad del DNI…');
      if (!form.nombres_estudiante || !form.apellidos_estudiante) return notify.warning('Completa nombres y apellidos.');
      if (!form.fecha_nacimiento) return notify.warning('Selecciona la fecha de nacimiento.');
      if (!form.direccion) return notify.warning('Ingresa la dirección.');
      if (!form.nivel_id || !form.grado_id) return notify.warning('Selecciona nivel y grado al que postula.');
    }
    if (step === 2) {
      if (!form.apoderado_nombres || !form.apoderado_apellidos) return notify.warning('Completa los datos del apoderado.');
      if (!/^\d{8}$/.test(form.apoderado_dni)) return notify.warning('El DNI del apoderado debe tener 8 dígitos.');
    }
    if (step === 3) {
      if (!comprobantePago) return notify.warning('Adjunta el comprobante de pago de la matrícula.');
      if (!certificadoEstudios) return notify.warning('Adjunta el certificado de estudios del alumno.');
    }
    setDirection('forward');
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  function back() {
    setDirection('backward');
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function goTo(target: Step) {
    if (target === step) return;
    if (target > step) {
      if (target >= 2 && !paso1Completo) return;
      if (target >= 3 && !paso2Completo) return;
      if (target >= 4 && !paso3Completo) return;
    }
    setDirection(target > step ? 'forward' : 'backward');
    setStep(target);
  }

  async function handleEnviarFactura() {
    if (!form.apoderado_email || !form.apoderado_email.includes('@')) {
      return notify.warning('Ingresa un email válido antes de enviar la facturación.');
    }
    const nombre = `${form.nombres_estudiante} ${form.apellidos_estudiante}`.trim() || 'Alumno por inscribir';
    setEnviandoFactura(true);
    const tid = notify.loading('Enviando facturación al email…');
    try {
      const r = await inscripcionApi.enviarFacturacion(form.apoderado_email, nombre);
      notify.dismiss(tid);
      notify.success({ title: 'Facturación enviada', description: r.message });
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo enviar la facturación.');
    } finally {
      setEnviandoFactura(false);
    }
  }

  async function handleSubmit() {
    setFieldErrors({});
    if (!/^\d{6}$/.test(form.pin)) return notify.warning('El PIN debe ser de 6 dígitos.');
    if (form.pin !== form.pin_confirmation) return notify.warning('Los PIN no coinciden.');

    setLoading(true);
    const tid = notify.loading('Enviando inscripción…');
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
      notify.dismiss(tid);
      notify.success({
        title: '¡Inscripción enviada!',
        description: `Código ${res.data.codigo}. Quedará pendiente de revisión.`,
      });
      setSuccess({ codigo: res.data.codigo });
    } catch (err) {
      notify.dismiss(tid);
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      notify.apiError(err, 'No se pudo enviar la inscripción.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-page p-6">
        <div className="max-w-md w-full bg-bg-card border border-border rounded-lg p-8 text-center animate-fade-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-4 animate-pulse-ring">
            <Icon name="CircleCheck" size={32} className="text-success" />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">¡Inscripción enviada!</h1>
          <p className="text-sm text-text-secondary mb-5 leading-relaxed">
            Tu solicitud quedó <b>pendiente de revisión</b> por el área administrativa.
            El comprobante y certificado fueron recibidos.
          </p>
          <div className="bg-bg-muted rounded-sm py-4 mb-5">
            <p className="text-[11px] text-text-muted tracking-[0.18em] font-bold mb-1.5">
              CÓDIGO DE INSCRIPCIÓN
            </p>
            <p className="font-mono font-bold text-trilce-primary text-lg tracking-wider">{success.codigo}</p>
          </div>
          <Link
            href="/portal-login"
            className="block w-full bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold py-3 rounded-sm transition-colors duration-200 cursor-pointer"
          >
            Ir al login del portal
          </Link>
          <Link
            href="/"
            className="block w-full mt-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-page">
      <header className="sticky top-0 z-30 bg-bg-page/80 backdrop-blur-md border-b border-border/70">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 rounded-md bg-trilce-primary flex items-center justify-center text-white font-bold font-display text-lg shadow-sm transition-shadow duration-200 group-hover:shadow-md">
              T
            </div>
            <span className="font-bold text-[15px] tracking-tight">
              Inscripción <span className="text-text-muted font-medium">·</span> 2026
            </span>
          </Link>
          <a
            href="tel:016124081"
            className="text-xs sm:text-sm text-text-secondary hover:text-trilce-primary transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Icon name="Smartphone" size={14} />
            <span className="hidden sm:inline">¿Necesitas ayuda?</span>
            <span className="font-semibold text-text-primary">01 612 4081</span>
          </a>
        </div>
        <div className="h-1 bg-bg-muted">
          <div
            className="h-full bg-trilce-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 lg:self-start bg-bg-card border border-border rounded-md p-5 h-fit">
          <h3 className="text-[11px] font-bold tracking-[0.18em] text-text-muted mb-4">PASOS</h3>
          <ul className="flex flex-col gap-1.5">
            {STEPS.map((s) => {
              const active = s.id === step;
              const done = s.id < step;
              const reachable =
                s.id === 1 ||
                (s.id === 2 && paso1Completo) ||
                (s.id === 3 && paso1Completo && paso2Completo) ||
                (s.id === 4 && paso1Completo && paso2Completo && paso3Completo) ||
                done ||
                active;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => reachable && goTo(s.id)}
                    disabled={!reachable}
                    className={`w-full flex items-start gap-3 p-3 rounded-sm text-left transition-colors duration-200 ${
                      active
                        ? 'bg-trilce-primary-soft'
                        : done
                        ? 'hover:bg-bg-muted cursor-pointer'
                        : reachable
                        ? 'hover:bg-bg-muted cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors duration-200 ${
                        active
                          ? 'bg-trilce-primary text-white'
                          : done
                          ? 'bg-success text-white'
                          : 'bg-bg-muted text-text-secondary'
                      }`}
                    >
                      {done ? <Icon name="CircleCheck" size={16} /> : s.id}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold leading-tight ${
                          active ? 'text-trilce-primary-dark' : 'text-text-primary'
                        }`}
                      >
                        {s.title}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">{s.subtitle}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 p-3 bg-trilce-primary-soft rounded-sm text-xs text-trilce-primary-dark flex items-start gap-2">
            <Icon name="ShieldCheck" size={14} className="text-trilce-primary mt-0.5 shrink-0" />
            <span className="leading-relaxed">
              Tu solicitud quedará pendiente de aprobación por administración.
            </span>
          </div>
        </aside>

        <section className="bg-bg-card border border-border rounded-md p-6 sm:p-8 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-[0.18em] text-trilce-primary">
              PASO {step} DE 4
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-[11px] text-text-muted">{STEPS[step - 1].subtitle}</span>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight">
            {STEPS[step - 1].title}
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 mb-6 leading-relaxed">
            Completa la información para continuar. Los campos con <span className="text-trilce-primary font-semibold">*</span> son obligatorios.
          </p>

          <div
            key={step}
            className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
          >
            {step === 1 && (
              <Paso1
                form={form}
                update={update}
                niveles={niveles}
                gradosDisponibles={gradosDisponibles}
                fieldErrors={fieldErrors}
                dniState={dniState}
                dniMsg={dniMsg}
              />
            )}

            {step === 2 && (
              <Paso2
                form={form}
                update={update}
                fieldErrors={fieldErrors}
                onEnviarFactura={handleEnviarFactura}
                enviandoFactura={enviandoFactura}
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
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
            {step > 1 ? (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary font-semibold px-4 py-2.5 transition-colors duration-200 cursor-pointer"
              >
                <span aria-hidden>←</span> Atrás
              </button>
            ) : (
              <Link
                href="/"
                className="text-text-secondary hover:text-text-primary font-semibold px-4 py-2.5 transition-colors duration-200 cursor-pointer"
              >
                Cancelar
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={next}
                disabled={step === 1 && dniState === 'checking'}
                className="bg-trilce-primary hover:bg-trilce-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-sm flex items-center gap-2 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
              >
                Siguiente paso <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !paso4Completo}
                className="bg-trilce-primary hover:bg-trilce-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-sm flex items-center gap-2 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-soft" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Enviar inscripción <Icon name="CircleCheck" size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ─── Paso 1 ─── */

function Paso1({
  form, update, niveles, gradosDisponibles, fieldErrors, dniState, dniMsg,
}: {
  form: any;
  update: any;
  niveles: NivelCatalogo[];
  gradosDisponibles: { id: number; nombre: string }[];
  fieldErrors: Record<string, string[]>;
  dniState: DniState;
  dniMsg: string | null;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field
        label="DNI del estudiante"
        required
        err={fieldErrors.dni_estudiante?.[0]}
        hint={
          dniState === 'available' ? (
            <span className="text-success inline-flex items-center gap-1">
              <Icon name="CircleCheck" size={12} /> {dniMsg}
            </span>
          ) : dniState === 'taken' ? (
            <span className="text-red-600 inline-flex items-center gap-1">
              <Icon name="TriangleAlert" size={12} /> {dniMsg}
            </span>
          ) : dniState === 'checking' ? (
            <span className="text-text-muted inline-flex items-center gap-1">
              <span className="w-3 h-3 border border-text-muted/40 border-t-trilce-primary rounded-full animate-spin-soft" />
              Verificando disponibilidad…
            </span>
          ) : dniMsg ? (
            <span className="text-text-muted">{dniMsg}</span>
          ) : null
        }
      >
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={form.dni_estudiante}
            onChange={(e) => update('dni_estudiante', e.target.value.replace(/\D/g, ''))}
            className={`input pr-9 ${
              dniState === 'available'
                ? 'border-success focus:border-success'
                : dniState === 'taken'
                ? 'border-red-400 focus:border-red-500'
                : ''
            }`}
            aria-invalid={dniState === 'taken'}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {dniState === 'checking' && (
              <span className="w-4 h-4 border-2 border-bg-muted border-t-trilce-primary rounded-full block animate-spin-soft" />
            )}
            {dniState === 'available' && (
              <Icon name="CircleCheck" size={18} className="text-success" />
            )}
            {dniState === 'taken' && (
              <Icon name="TriangleAlert" size={18} className="text-red-500" />
            )}
          </span>
        </div>
      </Field>

      <Field label="Fecha de nacimiento" required err={fieldErrors.fecha_nacimiento?.[0]}>
        <input
          type="date"
          value={form.fecha_nacimiento}
          onChange={(e) => update('fecha_nacimiento', e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Nombres" required err={fieldErrors.nombres_estudiante?.[0]}>
        <input
          type="text"
          value={form.nombres_estudiante}
          onChange={(e) => update('nombres_estudiante', e.target.value)}
          className="input"
          placeholder="Diego Andrés"
        />
      </Field>

      <Field label="Apellidos" required err={fieldErrors.apellidos_estudiante?.[0]}>
        <input
          type="text"
          value={form.apellidos_estudiante}
          onChange={(e) => update('apellidos_estudiante', e.target.value)}
          className="input"
          placeholder="Rivera Soto"
        />
      </Field>

      <Field label="Nivel al que postula" required err={fieldErrors.nivel_id?.[0]}>
        <select
          value={form.nivel_id}
          onChange={(e) => {
            update('nivel_id', e.target.value);
            update('grado_id', '');
          }}
          className="input bg-bg-card cursor-pointer"
        >
          <option value="">Selecciona…</option>
          {niveles.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nombre}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Grado" required err={fieldErrors.grado_id?.[0]}>
        <select
          value={form.grado_id}
          onChange={(e) => update('grado_id', e.target.value)}
          disabled={!form.nivel_id}
          className="input bg-bg-card disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <option value="">Selecciona…</option>
          {gradosDisponibles.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>
      </Field>

      <div className="sm:col-span-2">
        <span className="block text-sm font-semibold mb-2">
          Sexo <span className="text-trilce-primary">*</span>
        </span>
        <div className="flex gap-2 max-w-md">
          {(['M', 'F'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update('sexo', s)}
              className={`flex-1 py-2.5 rounded-sm font-semibold border transition-colors duration-200 cursor-pointer ${
                form.sexo === s
                  ? 'bg-trilce-primary text-white border-trilce-primary shadow-sm'
                  : 'bg-bg-card border-border text-text-secondary hover:border-trilce-primary/50 hover:text-text-primary'
              }`}
            >
              {s === 'M' ? 'Masculino' : 'Femenino'}
            </button>
          ))}
        </div>
      </div>

      <Field label="IE de procedencia" err={fieldErrors.ie_procedencia?.[0]}>
        <input
          type="text"
          value={form.ie_procedencia}
          onChange={(e) => update('ie_procedencia', e.target.value)}
          className="input"
          placeholder="Colegio anterior"
        />
      </Field>

      <Field label="Año de procedencia" err={fieldErrors.anio_procedencia?.[0]}>
        <input
          type="number"
          min={1990}
          max={2100}
          value={form.anio_procedencia}
          onChange={(e) => update('anio_procedencia', e.target.value)}
          className="input"
          placeholder="2025"
        />
      </Field>

      <Field label="Dirección" required err={fieldErrors.direccion?.[0]}>
        <input
          type="text"
          value={form.direccion}
          onChange={(e) => update('direccion', e.target.value)}
          className="input"
          placeholder="Av. Principal 123"
        />
      </Field>

      <Field label="Distrito" err={fieldErrors.distrito?.[0]}>
        <input
          type="text"
          value={form.distrito}
          onChange={(e) => update('distrito', e.target.value)}
          className="input"
          placeholder="San Isidro"
        />
      </Field>
    </div>
  );
}

/* ─── Paso 2 ─── */

function Paso2({
  form, update, fieldErrors, onEnviarFactura, enviandoFactura,
}: {
  form: any;
  update: any;
  fieldErrors: Record<string, string[]>;
  onEnviarFactura: () => void;
  enviandoFactura: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <span className="block text-sm font-semibold mb-2">Tipo de responsable</span>
        <div className="flex gap-2">
          {(['padre', 'madre', 'apoderado'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update('apoderado_tipo', t)}
              className={`flex-1 py-2.5 rounded-sm font-semibold border text-sm capitalize transition-colors duration-200 cursor-pointer ${
                form.apoderado_tipo === t
                  ? 'bg-trilce-primary text-white border-trilce-primary shadow-sm'
                  : 'bg-bg-card border-border text-text-secondary hover:border-trilce-primary/50 hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Field label="Nombres del apoderado" required err={fieldErrors.apoderado_nombres?.[0]}>
        <input
          type="text"
          value={form.apoderado_nombres}
          onChange={(e) => update('apoderado_nombres', e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Apellidos del apoderado" required err={fieldErrors.apoderado_apellidos?.[0]}>
        <input
          type="text"
          value={form.apoderado_apellidos}
          onChange={(e) => update('apoderado_apellidos', e.target.value)}
          className="input"
        />
      </Field>

      <Field label="DNI del apoderado" required err={fieldErrors.apoderado_dni?.[0]}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={form.apoderado_dni}
          onChange={(e) => update('apoderado_dni', e.target.value.replace(/\D/g, ''))}
          className="input"
        />
      </Field>

      <Field label="Teléfono" err={fieldErrors.apoderado_telefono?.[0]}>
        <input
          type="tel"
          value={form.apoderado_telefono}
          onChange={(e) => update('apoderado_telefono', e.target.value)}
          className="input"
          placeholder="9XXXXXXXX"
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Email" err={fieldErrors.apoderado_email?.[0]}>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={form.apoderado_email}
              onChange={(e) => update('apoderado_email', e.target.value)}
              placeholder="padre@gmail.com"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={onEnviarFactura}
              disabled={enviandoFactura || !form.apoderado_email}
              className="bg-trilce-primary-soft border border-trilce-primary text-trilce-primary-dark font-semibold px-4 py-2.5 rounded-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-trilce-primary hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {enviandoFactura ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin-soft" />
                  Enviando…
                </>
              ) : (
                <>
                  <Icon name="Mail" size={16} /> Enviar facturación
                </>
              )}
            </button>
          </div>
        </Field>
        <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
          Al enviar la facturación, te llegará el monto a pagar de la matrícula y los datos bancarios.
        </p>
      </div>
    </div>
  );
}

/* ─── Paso 3 ─── */

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
      <div className="bg-trilce-primary-soft border border-trilce-primary-light rounded-sm p-3.5 text-xs flex items-start gap-2.5">
        <Icon name="TriangleAlert" size={16} className="text-trilce-primary mt-0.5 shrink-0" />
        <span className="text-text-secondary leading-relaxed">
          Antes de continuar, asegúrate de haber realizado el pago de matrícula con los datos
          que recibiste por email. Adjunta el voucher y el certificado de estudios del alumno.
        </span>
      </div>

      <FileBlock
        label="Comprobante de pago de matrícula"
        required
        hint="Voucher de Yape / Plin / transferencia. PDF, JPG o PNG (máx 5MB)."
        file={comprobantePago}
        onPick={onComprobante}
        inputRef={compRef}
        icon="CreditCard"
      />

      <FileBlock
        label="Certificado de estudios del alumno"
        required
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
  label, hint, required, file, onPick, inputRef, icon,
}: {
  label: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onPick: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  icon: 'CreditCard' | 'FileText';
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="block text-sm font-semibold">
        {label} {required && <span className="text-trilce-primary">*</span>}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-md transition-colors duration-200 text-left cursor-pointer ${
          file
            ? 'bg-success/5 border-success'
            : 'bg-bg-muted border-border hover:border-trilce-primary hover:bg-trilce-primary-soft/30'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            file ? 'bg-success/15 text-success' : 'bg-bg-card text-text-muted'
          }`}
        >
          <Icon name={file ? 'CircleCheck' : icon} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <div className="text-sm font-semibold text-success truncate">{file.name}</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {(file.size / 1024).toFixed(0)} KB · Haz clic para cambiar
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-text-primary">
                Haz clic para seleccionar archivo
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">{hint}</div>
            </>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPick(null);
            }}
            className="text-text-muted hover:text-red-600 transition-colors duration-200 cursor-pointer p-1"
            aria-label="Quitar archivo"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </button>
    </div>
  );
}

/* ─── Paso 4 ─── */

function Paso4({ form, update, fieldErrors }: { form: any; update: any; fieldErrors: Record<string, string[]> }) {
  const match = form.pin.length === 6 && form.pin === form.pin_confirmation;
  const mismatch =
    form.pin_confirmation.length === 6 && form.pin !== form.pin_confirmation;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-trilce-primary-soft border border-trilce-primary-light rounded-md p-4 mb-6 flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-trilce-primary/10 text-trilce-primary-dark flex items-center justify-center shrink-0">
          <Icon name="KeyRound" size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-trilce-primary-dark">Elige tu PIN de acceso</p>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Cuando administración apruebe la inscripción, ingresarás al portal con el DNI del
            alumno y este PIN.
          </p>
        </div>
      </div>

      <Field label="PIN (6 dígitos)" required err={fieldErrors.pin?.[0]}>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={form.pin}
          onChange={(e) => update('pin', e.target.value.replace(/\D/g, ''))}
          className="input tracking-[0.5em] text-center text-lg font-display"
          placeholder="······"
        />
      </Field>

      <div className="h-3" />

      <Field
        label="Confirmar PIN"
        required
        err={fieldErrors.pin_confirmation?.[0]}
        hint={
          match ? (
            <span className="text-success inline-flex items-center gap-1">
              <Icon name="CircleCheck" size={12} /> Los PIN coinciden
            </span>
          ) : mismatch ? (
            <span className="text-red-600 inline-flex items-center gap-1">
              <Icon name="TriangleAlert" size={12} /> Los PIN no coinciden
            </span>
          ) : null
        }
      >
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={form.pin_confirmation}
          onChange={(e) => update('pin_confirmation', e.target.value.replace(/\D/g, ''))}
          className={`input tracking-[0.5em] text-center text-lg font-display ${
            match ? 'border-success' : mismatch ? 'border-red-400' : ''
          }`}
          placeholder="······"
        />
      </Field>
    </div>
  );
}

/* ─── Field ─── */

function Field({
  label, required, err, hint, children, className,
}: {
  label: string;
  required?: boolean;
  err?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-sm font-semibold mb-1.5">
        {label} {required && <span className="text-trilce-primary">*</span>}
      </span>
      {children}
      {err ? (
        <span className="block text-xs text-red-600 mt-1.5">{err}</span>
      ) : hint ? (
        <span className="block text-xs mt-1.5">{hint}</span>
      ) : null}
    </label>
  );
}
