// Persona C — types del módulo Pagos
// Sigue el contrato de respuesta del backend (Laravel API Resource).

export type PagoConcepto = 'matricula' | 'pension' | 'otros';
export type PagoEstado = 'pendiente' | 'pagado' | 'vencido' | 'anulado';
export type PagoMetodo = 'efectivo' | 'transferencia' | 'yape' | 'plin' | 'otro';

export type Pago = {
  id: number;
  matricula_id: number;
  concepto: PagoConcepto;
  descripcion: string;
  monto: number;
  mes: number | null;
  fecha_vencimiento: string; // ISO date YYYY-MM-DD
  fecha_pago: string | null;
  metodo: PagoMetodo | null;
  estado: PagoEstado;
  comprobante_url: string | null;
  observaciones: string | null;
  registrado_por: number | null;
  created_at: string;
};

export type PagoListItem = Pago & {
  alumno?: {
    id: number;
    nombres: string;
    apellidos: string;
    grado: string;
    seccion: string;
  };
};

export type EstadoCuenta = {
  estudiante: {
    id: number;
    codigo_estudiante: string;
    nombres: string;
    apellidos: string;
    dni: string;
  };
  totales: {
    facturado: number;
    pagado: number;
    pendiente: number;
    vencido: number;
    cobranza_porcentaje: number;
  };
  pagos: Pago[];
};

export type RegistrarPagoInput = {
  metodo: PagoMetodo;
  monto: number;
  observaciones?: string;
  comprobante?: File | null;
};
