import type { Pago, PagoListItem, EstadoCuenta } from './types';

// Datos demo mientras Persona A (auth) y Persona B (matrícula) no estén integrados.
// Cuando lleguen, reemplazar las llamadas en api.ts por fetch real.

export const MIS_PAGOS_MOCK: Pago[] = [
  {
    id: 1, matricula_id: 100,
    concepto: 'matricula', descripcion: 'Matrícula 2026',
    monto: 350, mes: null,
    fecha_vencimiento: '2026-03-01', fecha_pago: '2026-02-28',
    metodo: 'efectivo', estado: 'pagado',
    comprobante_url: null, observaciones: null, registrado_por: 1,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 2, matricula_id: 100,
    concepto: 'pension', descripcion: 'Pensión Marzo 2026',
    monto: 250, mes: 3,
    fecha_vencimiento: '2026-03-05', fecha_pago: '2026-03-04',
    metodo: 'yape', estado: 'pagado',
    comprobante_url: null, observaciones: null, registrado_por: 1,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 3, matricula_id: 100,
    concepto: 'pension', descripcion: 'Pensión Abril 2026',
    monto: 250, mes: 4,
    fecha_vencimiento: '2026-04-05', fecha_pago: '2026-04-04',
    metodo: 'yape', estado: 'pagado',
    comprobante_url: null, observaciones: null, registrado_por: 1,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 4, matricula_id: 100,
    concepto: 'pension', descripcion: 'Pensión Mayo 2026',
    monto: 250, mes: 5,
    fecha_vencimiento: '2026-05-05', fecha_pago: null,
    metodo: null, estado: 'pendiente',
    comprobante_url: null, observaciones: null, registrado_por: null,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 5, matricula_id: 100,
    concepto: 'pension', descripcion: 'Pensión Junio 2026',
    monto: 250, mes: 6,
    fecha_vencimiento: '2026-06-05', fecha_pago: null,
    metodo: null, estado: 'pendiente',
    comprobante_url: null, observaciones: null, registrado_por: null,
    created_at: '2026-02-15T10:00:00Z',
  },
];

export const PAGOS_ADMIN_MOCK: PagoListItem[] = [
  {
    ...MIS_PAGOS_MOCK[0],
    alumno: { id: 1, nombres: 'Juan Carlos', apellidos: 'Pérez Quiroz', grado: '3ro Primaria', seccion: 'A' },
  },
  {
    ...MIS_PAGOS_MOCK[3],
    alumno: { id: 1, nombres: 'Juan Carlos', apellidos: 'Pérez Quiroz', grado: '3ro Primaria', seccion: 'A' },
  },
  {
    id: 21, matricula_id: 105,
    concepto: 'pension', descripcion: 'Pensión Mayo 2026',
    monto: 280, mes: 5,
    fecha_vencimiento: '2026-05-05', fecha_pago: null,
    metodo: null, estado: 'pendiente',
    comprobante_url: null, observaciones: null, registrado_por: null,
    created_at: '2026-02-15T10:00:00Z',
    alumno: { id: 5, nombres: 'María Sofía', apellidos: 'Soto Lima', grado: '1ro Secundaria', seccion: 'A' },
  },
  {
    id: 30, matricula_id: 110,
    concepto: 'pension', descripcion: 'Pensión Abril 2026 — vencida',
    monto: 250, mes: 4,
    fecha_vencimiento: '2026-04-05', fecha_pago: null,
    metodo: null, estado: 'vencido',
    comprobante_url: null, observaciones: null, registrado_por: null,
    created_at: '2026-02-15T10:00:00Z',
    alumno: { id: 8, nombres: 'Diego', apellidos: 'Castillo Vargas', grado: '4to Primaria', seccion: 'B' },
  },
];

export const ESTADO_CUENTA_MOCK: EstadoCuenta = {
  estudiante: {
    id: 1,
    codigo_estudiante: 'EST-001234',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez Quiroz',
    dni: '70123456',
  },
  totales: {
    facturado: 3000,
    pagado: 1750,
    pendiente: 1250,
    vencido: 0,
    cobranza_porcentaje: 58.3,
  },
  pagos: MIS_PAGOS_MOCK,
};
