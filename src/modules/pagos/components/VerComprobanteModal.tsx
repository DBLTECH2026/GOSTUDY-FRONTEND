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
  return (
    <Modal
      open={pago !== null}
      onClose={onClose}
      title="Comprobante de pago"
      subtitle={pago ? `${pago.descripcion} — ${fmtSoles(pago.monto)}` : undefined}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary">
            <Icon name="Download" size={16} /> Descargar PDF
          </Button>
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

          <div className="border-2 border-dashed border-border rounded-sm p-10 flex flex-col items-center justify-center gap-2 bg-bg-muted">
            <Icon name="FileText" size={36} className="text-text-muted" />
            <span className="text-xs text-text-muted">Vista previa del comprobante</span>
            <span className="text-[11px] text-text-muted">
              {pago.comprobante_url
                ? 'Cargando archivo…'
                : '(simulado mientras integramos auth)'}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
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
