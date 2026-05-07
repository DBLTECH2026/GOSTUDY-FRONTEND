// Persona C — types del módulo Reportes.

export type ReporteInscripciones = {
  totales_por_estado: Record<'pendiente' | 'aprobada' | 'rechazada', number>;
  por_mes: { mes: string; total: number }[];
  por_nivel: { nivel: string; total: number }[];
};

export type SeccionRow = {
  seccion_id: number;
  nivel: string;
  grado: string;
  seccion: string;
  capacidad: number;
  matriculados: number;
  ocupacion_porcentaje: number;
};

export type ReporteMatriculasPorSeccion = SeccionRow[];

export type ReportePagos = {
  totales: {
    facturado: number;
    pagado: number;
    pendiente: number;
    vencido: number;
  };
  recaudacion_por_mes: { mes: string; total: number }[];
  por_concepto: { concepto: string; total: number; cantidad: number }[];
};
