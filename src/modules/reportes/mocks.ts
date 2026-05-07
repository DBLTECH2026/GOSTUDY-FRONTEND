import type { ReporteInscripciones, ReporteMatriculasPorSeccion, ReportePagos } from './types';

export const REPORTE_INSCRIPCIONES_MOCK: ReporteInscripciones = {
  totales_por_estado: { pendiente: 47, aprobada: 428, rechazada: 12 },
  por_mes: [
    { mes: '2026-02', total: 32 },
    { mes: '2026-03', total: 84 },
    { mes: '2026-04', total: 74 },
    { mes: '2026-05', total: 58 },
    { mes: '2026-06', total: 35 },
  ],
  por_nivel: [
    { nivel: 'Inicial',    total: 82 },
    { nivel: 'Primaria',   total: 245 },
    { nivel: 'Secundaria', total: 160 },
  ],
};

export const REPORTE_MATRICULAS_POR_SECCION_MOCK: ReporteMatriculasPorSeccion = [
  { seccion_id: 1, nivel: 'Primaria',   grado: '3ro', seccion: 'A', capacidad: 30, matriculados: 30, ocupacion_porcentaje: 100 },
  { seccion_id: 2, nivel: 'Primaria',   grado: '3ro', seccion: 'B', capacidad: 30, matriculados: 28, ocupacion_porcentaje: 93 },
  { seccion_id: 3, nivel: 'Secundaria', grado: '1ro', seccion: 'A', capacidad: 30, matriculados: 22, ocupacion_porcentaje: 73 },
  { seccion_id: 4, nivel: 'Primaria',   grado: '5to', seccion: 'B', capacidad: 30, matriculados: 12, ocupacion_porcentaje: 40 },
];

export const REPORTE_PAGOS_MOCK: ReportePagos = {
  totales: { facturado: 198300, pagado: 124500, pendiente: 73800, vencido: 12500 },
  recaudacion_por_mes: [
    { mes: '2026-03', total: 38000 },
    { mes: '2026-04', total: 32000 },
    { mes: '2026-05', total: 28000 },
    { mes: '2026-06', total: 14000 },
    { mes: '2026-07', total: 12000 },
  ],
  por_concepto: [
    { concepto: 'matricula', total: 42000, cantidad: 120 },
    { concepto: 'pension',   total: 156300, cantidad: 510 },
    { concepto: 'otros',     total: 0, cantidad: 0 },
  ],
};
