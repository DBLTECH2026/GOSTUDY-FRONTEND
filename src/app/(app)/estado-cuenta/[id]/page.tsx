'use client';

import { use } from 'react';
import { useEstadoCuenta } from '@/modules/pagos/api';
import { Icon } from '@/shared/components/Icon';

export default function EstadoCuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useEstadoCuenta(Number(id));

  if (isLoading) return <p className="text-text-secondary">Cargando estado de cuenta…</p>;

  if (!data) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-4">
          <Icon name="List" size={28} className="text-text-muted" />
        </div>
        <h2 className="text-lg font-bold mb-1">Estado de cuenta</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          No hay datos de estado de cuenta para el estudiante <b>#{id}</b>. Cuando se generen
          pagos para su matrícula, aparecerán aquí.
        </p>
      </div>
    );
  }

  return null;
}
