'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import {
  eliminarMaterialSemana,
  guardarContenidoSemana,
  subirMaterialSemana,
  type MaterialSemana,
  type SemanaDocente,
} from '@/modules/academico/api';
import { Button } from '@/shared/components/Button';
import { useConfirm } from '@/shared/components/ConfirmProvider';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { notify } from '@/shared/lib/notify';

type Props = {
  open: boolean;
  semana: SemanaDocente | null;
  seccionCursoId: number;
  onClose: () => void;
  onSaved?: () => void;
};

export function EditarSemanaModal({ open, semana, seccionCursoId, onClose, onSaved }: Props) {
  const { token } = useAuth();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    recursos_url: '',
    tarea: '',
  });
  const [busy, setBusy] = useState(false);
  // Materiales en estado local para que la UI refleje subidas/eliminaciones
  // sin esperar al refetch del padre.
  const [materiales, setMateriales] = useState<MaterialSemana[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  useEffect(() => {
    if (semana) {
      setForm({
        titulo:       semana.contenido?.titulo       ?? '',
        descripcion:  semana.contenido?.descripcion  ?? '',
        recursos_url: semana.contenido?.recursos_url ?? '',
        tarea:        semana.contenido?.tarea        ?? '',
      });
      setMateriales(semana.materiales ?? []);
    }
  }, [semana]);

  async function handleSubmit() {
    if (!token || !semana) return;

    setBusy(true);
    const tid = notify.loading('Guardando contenido…');
    try {
      const res = await guardarContenidoSemana(token, seccionCursoId, semana.id, {
        titulo:       form.titulo.trim()       || null,
        descripcion:  form.descripcion.trim()  || null,
        recursos_url: form.recursos_url.trim() || null,
        tarea:        form.tarea.trim()        || null,
      });
      notify.dismiss(tid);
      notify.success({
        title: res.data ? 'Contenido guardado' : 'Contenido eliminado',
        description: `Semana ${semana.numero}`,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo guardar el contenido.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !semana) return;
    // Reset del input para permitir re-subir el mismo archivo
    e.target.value = '';

    if (file.size > 10 * 1024 * 1024) {
      notify.warning('El archivo no debe pesar más de 10 MB.');
      return;
    }

    setSubiendo(true);
    const tid = notify.loading(`Subiendo ${file.name}…`);
    try {
      const res = await subirMaterialSemana(token, seccionCursoId, semana.id, file);
      notify.dismiss(tid);
      notify.success({ title: 'Archivo subido', description: res.data.nombre });
      setMateriales((prev) => [...prev, res.data]);
      onSaved?.(); // refresca el padre para que el contador "x archivos" se actualice
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  async function handleEliminarArchivo(material: MaterialSemana) {
    if (!token || !semana) return;
    const ok = await confirm({
      title: '¿Eliminar este archivo?',
      description: `${material.nombre} se eliminará permanentemente.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'Trash2',
    });
    if (!ok) return;

    setEliminandoId(material.id);
    const tid = notify.loading('Eliminando archivo…');
    try {
      await eliminarMaterialSemana(token, seccionCursoId, semana.id, material.id);
      notify.dismiss(tid);
      notify.success({ title: 'Archivo eliminado', description: material.nombre });
      setMateriales((prev) => prev.filter((m) => m.id !== material.id));
      onSaved?.();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo eliminar el archivo.');
    } finally {
      setEliminandoId(null);
    }
  }

  if (!semana) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar Semana ${semana.numero}`}
      subtitle={fmtRango(semana.fecha_inicio, semana.fecha_fin)}
      width={620}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar contenido'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Título del tema">
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ej: Ecuaciones de primer grado"
            maxLength={150}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>

        <Field label="Descripción / Contenido">
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Explica brevemente qué se cubrirá esta semana: objetivos, conceptos, ejercicios…"
            rows={5}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary resize-none"
          />
        </Field>

        <Field label="Recursos (un link por línea)">
          <textarea
            value={form.recursos_url}
            onChange={(e) => setForm({ ...form, recursos_url: e.target.value })}
            placeholder={`https://drive.google.com/...\nhttps://youtu.be/...`}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-trilce-primary resize-none"
          />
          <p className="text-[10px] text-text-muted mt-1">
            Cada línea se mostrará como un link clickeable a los estudiantes.
          </p>
        </Field>

        <Field label="Tarea o actividad">
          <textarea
            value={form.tarea}
            onChange={(e) => setForm({ ...form, tarea: e.target.value })}
            placeholder="Ej: Resolver ejercicios 1–10 de la página 45. Entregar el viernes."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary resize-none"
          />
        </Field>

        {/* ─── Archivos adjuntos ─── */}
        <div className="flex flex-col gap-2 pt-1 border-t border-border">
          <div className="flex items-center justify-between mt-2">
            <label className="text-xs font-semibold text-text-secondary">
              Archivos ({materiales.length})
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              className="text-xs text-trilce-primary font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <Icon name="Upload" size={12} />
              {subiendo ? 'Subiendo…' : 'Subir archivo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleSubirArchivo}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
              className="hidden"
            />
          </div>

          {materiales.length === 0 ? (
            <p className="text-[11px] text-text-muted text-center py-3 bg-bg-muted/40 rounded-sm">
              No has subido archivos en esta semana todavía.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {materiales.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 p-2 bg-bg-muted/40 border border-border rounded-sm"
                >
                  <Icon
                    name={iconForFile(m.tipo)}
                    size={18}
                    className="text-trilce-primary flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {m.url ? (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-text-primary hover:text-trilce-primary truncate block"
                        title={m.nombre}
                      >
                        {m.nombre}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-text-primary truncate block">
                        {m.nombre}
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted">{m.tamano_legible}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarArchivo(m)}
                    disabled={eliminandoId === m.id}
                    className="p-1.5 rounded-sm text-text-muted hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                    title="Eliminar archivo"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-text-muted">
            Acepta: PDF, imágenes, Word, Excel, PowerPoint, ZIP, TXT · Máx 10 MB
          </p>
        </div>

        <div className="bg-bg-muted border border-border rounded-sm p-3 text-[11px] text-text-muted flex items-start gap-2">
          <Icon name="Lightbulb" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            Si dejas todos los campos vacíos y guardas, el contenido se eliminará y la semana
            volverá a aparecer como &quot;Sin contenido aún&quot;. Los archivos se gestionan
            por separado.
          </span>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function fmtRango(inicio: string, fin: string): string {
  const fmt = (d: string) => {
    const [, m, day] = d.split('-');
    return `${day}/${m}`;
  };
  return `${fmt(inicio)} – ${fmt(fin)}`;
}

function iconForFile(mime: string | null) {
  if (!mime) return 'FileText' as const;
  if (mime.startsWith('image/')) return 'Palette' as const;
  if (mime.includes('pdf')) return 'FileText' as const;
  return 'FileText' as const;
}
