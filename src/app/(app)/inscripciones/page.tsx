'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { inscripcionApi, type Inscripcion } from '@/modules/inscripcion/api';
import { ApiError } from '@/shared/lib/api';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';

type Tab = 'pendiente' | 'aprobada' | 'rechazada';

const TABS: { key: Tab; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada', label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
];

export default function InscripcionesPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('pendiente');
  const [items, setItems] = useState<Inscripcion[]>([]);
  const [selected, setSelected] = useState<Inscripcion | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const cargar = useCallback(
    async (estado: Tab) => {
      if (!token) return;
      setLoading(true);
      setActionError(null);
      setActionMsg(null);
      try {
        const res = await inscripcionApi.listar(token, estado);
        setItems(res.data);
        setSelected(res.data[0] ?? null);
      } catch (err) {
        if (err instanceof ApiError) setActionError(err.message);
        else setActionError('Error de red al cargar inscripciones.');
        setItems([]);
        setSelected(null);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    cargar(tab);
  }, [tab, cargar]);

  const filtradas = items.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.nombre_completo.toLowerCase().includes(q) ||
      r.dni.includes(search) ||
      r.codigo.toLowerCase().includes(q)
    );
  });

  async function aprobar(id: number) {
    if (!token) return;
    setActionError(null);
    try {
      const res = await inscripcionApi.aprobar(token, id);
      setActionMsg(res.message);
      await cargar(tab);
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Error de red.');
    }
  }

  async function rechazar(id: number) {
    if (!token) return;
    const motivo = window.prompt('Motivo del rechazo (opcional):') ?? undefined;
    setActionError(null);
    try {
      const res = await inscripcionApi.rechazar(token, id, motivo);
      setActionMsg(res.message);
      await cargar(tab);
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Error de red.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inscripciones</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Gestión de solicitudes de inscripción
          </p>
        </div>
      </header>

      {actionMsg && (
        <div className="bg-success/10 border border-success/30 text-success text-sm rounded-sm p-3">
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm p-3">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5">
        {/* Lista */}
        <div className="bg-bg-card border border-border rounded-md flex flex-col">
          <div className="p-4 border-b border-border flex flex-col gap-3">
            <div className="flex gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-sm ${
                    tab === t.key
                      ? 'bg-trilce-primary text-white'
                      : 'bg-bg-muted text-text-secondary hover:bg-trilce-primary-soft'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, DNI o código…"
                className="w-full pl-9 pr-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
              />
            </div>
          </div>
          <ul className="overflow-y-auto max-h-[600px]">
            {loading ? (
              <li className="p-6 text-center text-sm text-text-muted">Cargando…</li>
            ) : filtradas.length === 0 ? (
              <li className="p-6 text-center text-sm text-text-muted">
                No hay inscripciones {tab === 'pendiente' ? 'pendientes' : tab + 's'}.
              </li>
            ) : (
              filtradas.map((r) => (
                <li
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`p-4 cursor-pointer border-b border-border last:border-0 hover:bg-bg-muted ${
                    selected?.id === r.id ? 'bg-trilce-primary-soft' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-trilce-primary-soft text-trilce-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {r.nombres.charAt(0)}{r.apellidos.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {r.nombre_completo}
                        </div>
                        <div className="text-xs text-text-muted">
                          {r.codigo} · DNI {r.dni}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Detalle */}
        <div className="bg-bg-card border border-border rounded-md p-6">
          {!selected ? (
            <p className="text-text-secondary text-sm">Selecciona una inscripción.</p>
          ) : (
            <>
              <div className="flex items-start justify-between mb-5 gap-3">
                <div className="min-w-0">
                  <Badge
                    variant={
                      selected.estado === 'aprobada'
                        ? 'success'
                        : selected.estado === 'rechazada'
                        ? 'danger'
                        : 'warning'
                    }
                    className="mb-2"
                  >
                    {selected.estado.toUpperCase()}
                  </Badge>
                  <h2 className="text-xl font-bold truncate">{selected.nombre_completo}</h2>
                  <p className="text-xs text-text-muted">
                    {selected.codigo} · DNI {selected.dni}
                  </p>
                </div>
              </div>

              <Section title="Datos del alumno">
                <Field label="Fecha de nacimiento" value={selected.fecha_nacimiento ?? '—'} />
                <Field label="Sexo" value={selected.sexo === 'M' ? 'Masculino' : 'Femenino'} />
                <Field label="Dirección" value={selected.direccion} />
                <Field label="Distrito" value={selected.distrito ?? '—'} />
                <Field
                  label="IE procedencia"
                  value={selected.ie_procedencia ?? '—'}
                />
                <Field
                  label="Año procedencia"
                  value={selected.anio_procedencia ? String(selected.anio_procedencia) : '—'}
                />
              </Section>

              <Section title="Postula a">
                <Field label="Nivel" value={selected.nivel ?? '—'} />
                <Field label="Grado" value={selected.grado ?? '—'} />
                <Field label="Periodo" value={selected.periodo ?? '—'} />
              </Section>

              {selected.apoderado && (
                <Section title="Apoderado">
                  <Field
                    label="Tipo"
                    value={(selected.apoderado.tipo ?? '').toString()}
                  />
                  <Field
                    label="Nombre"
                    value={`${selected.apoderado.nombres} ${selected.apoderado.apellidos}`}
                  />
                  <Field label="DNI" value={selected.apoderado.dni} />
                  <Field label="Teléfono" value={selected.apoderado.telefono ?? '—'} />
                  <Field label="Email" value={selected.apoderado.email ?? '—'} />
                </Section>
              )}

              <Section title="Documentos adjuntos">
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <DocLink
                    label="Comprobante de pago de matrícula"
                    url={selected.comprobante_pago_url}
                    icon="CreditCard"
                  />
                  <DocLink
                    label="Certificado de estudios"
                    url={selected.certificado_estudios_url}
                    icon="FileText"
                  />
                </div>
              </Section>

              {selected.motivo_rechazo && (
                <div className="bg-red-50 border border-red-200 rounded-sm p-3 mb-4">
                  <p className="text-[11px] font-bold text-red-700 mb-1">MOTIVO DE RECHAZO</p>
                  <p className="text-sm text-red-700">{selected.motivo_rechazo}</p>
                </div>
              )}

              {selected.estado === 'pendiente' && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => rechazar(selected.id)}
                    className="flex-1 border border-danger text-danger font-semibold py-2.5 rounded-sm hover:bg-red-50"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => aprobar(selected.id)}
                    className="flex-1 bg-success hover:opacity-90 text-white font-semibold py-2.5 rounded-sm flex items-center justify-center gap-2"
                  >
                    <Icon name="CircleCheck" size={16} /> Aprobar inscripción
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-bold tracking-widest text-text-muted mb-2">
        {title.toUpperCase()}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
      <div className="text-sm font-semibold break-words">{value}</div>
    </div>
  );
}

function DocLink({
  label,
  url,
  icon,
}: {
  label: string;
  url: string | null;
  icon: 'CreditCard' | 'FileText';
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 p-3 bg-bg-muted rounded-sm opacity-60">
        <Icon name={icon} size={18} className="text-text-muted" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-text-secondary">{label}</div>
          <div className="text-[11px] text-text-muted">No adjuntado</div>
        </div>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-trilce-primary-soft border border-trilce-primary-light rounded-sm hover:border-trilce-primary transition-colors"
    >
      <Icon name={icon} size={18} className="text-trilce-primary" />
      <div className="flex-1">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="text-[11px] text-text-secondary">Click para abrir en nueva pestaña</div>
      </div>
      <Icon name="Download" size={16} className="text-trilce-primary" />
    </a>
  );
}
