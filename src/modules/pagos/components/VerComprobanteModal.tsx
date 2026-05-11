'use client';

import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { fmtFecha, fmtSoles } from '@/shared/lib/format';
import type { Pago, PagoListItem } from '@/modules/pagos/types';

type Props = {
  pago: (Pago | PagoListItem) | null;
  onClose: () => void;
  /** Si se pasa, muestra header del alumno (uso en admin). */
  showAlumno?: boolean;
};

export function VerComprobanteModal({ pago, onClose, showAlumno = false }: Props) {
  const tipoArchivo = pago?.comprobante_url ? detectarTipo(pago.comprobante_url) : null;

  return (
    <Modal
      open={pago !== null}
      onClose={onClose}
      title="Comprobante de pago"
      subtitle={pago ? `${pago.descripcion} — ${fmtSoles(pago.monto)}` : undefined}
      width={620}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          {pago?.comprobante_url && (
            <a
              href={pago.comprobante_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-trilce-primary text-text-on-primary hover:bg-trilce-primary-dark transition-colors"
            >
              <Icon name="Download" size={16} />
              Descargar archivo
            </a>
          )}
        </>
      }
    >
      {pago && (
        <div className="flex flex-col gap-4">
          {showAlumno && 'alumno' in pago && pago.alumno && (
            <div className="flex items-center gap-3 p-3 bg-bg-muted rounded-sm">
              <div className="w-9 h-9 rounded-full bg-trilce-primary flex items-center justify-center text-text-on-primary text-xs font-bold">
                {pago.alumno.nombres[0]}{pago.alumno.apellidos[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">
                  {pago.alumno.nombres} {pago.alumno.apellidos}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {pago.alumno.grado} — {pago.alumno.seccion}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <DataField label="Concepto" value={pago.descripcion} />
            <DataField label="Monto" value={fmtSoles(pago.monto)} />
            <DataField label="Fecha de pago" value={pago.fecha_pago ? fmtFecha(pago.fecha_pago) : '—'} />
            <DataField label="Método" value={pago.metodo ? capitalize(pago.metodo) : '—'} />
            <DataField label="Vencimiento" value={fmtFecha(pago.fecha_vencimiento)} />
            <DataField
              label="N° de comprobante"
              value={`COMP-${String(pago.id).padStart(6, '0')}`}
            />
          </div>

          {pago.observaciones && (
            <div className="px-4 py-3 bg-bg-muted rounded-sm">
              <span className="text-[11px] font-bold tracking-wide text-text-muted">OBSERVACIONES</span>
              <p className="text-sm text-text-primary mt-1">{pago.observaciones}</p>
            </div>
          )}

          {/* Vista previa del archivo */}
          {pago.comprobante_url ? (
            <ArchivoPreview url={pago.comprobante_url} tipo={tipoArchivo} />
          ) : (
            <div className="border-2 border-dashed border-border rounded-sm p-10 flex flex-col items-center justify-center gap-2 bg-bg-muted">
              <Icon name="FileText" size={36} className="text-text-muted" />
              <span className="text-xs text-text-muted">No hay archivo adjunto</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ArchivoPreview({ url, tipo }: { url: string; tipo: 'imagen' | 'pdf' | 'otro' | null }) {
  if (tipo === 'imagen') {
    return (
      <div className="border border-border rounded-sm overflow-hidden bg-bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Comprobante de pago"
          className="w-full max-h-[400px] object-contain bg-white"
        />
      </div>
    );
  }
  if (tipo === 'pdf') {
    return (
      <div className="border border-border rounded-sm overflow-hidden bg-bg-muted">
        <iframe
          src={url}
          title="Comprobante PDF"
          className="w-full h-[400px] bg-white"
        />
      </div>
    );
  }
  return (
    <div className="border-2 border-dashed border-border rounded-sm p-10 flex flex-col items-center justify-center gap-2 bg-bg-muted">
      <Icon name="FileText" size={36} className="text-text-muted" />
      <span className="text-xs text-text-muted">
        Formato no compatible para vista previa. Usa el botón Descargar.
      </span>
    </div>
  );
}

function detectarTipo(url: string): 'imagen' | 'pdf' | 'otro' {
  const lower = url.toLowerCase().split('?')[0];
  if (/\.(jpe?g|png|gif|webp|bmp|avif)$/.test(lower)) return 'imagen';
  if (/\.pdf$/.test(lower)) return 'pdf';
  return 'otro';
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold tracking-wide text-text-muted">{label.toUpperCase()}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
