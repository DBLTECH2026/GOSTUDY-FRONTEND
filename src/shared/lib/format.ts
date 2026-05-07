/**
 * Helpers de formato compartidos.
 *
 * Importante: parsear fechas YYYY-MM-DD manualmente en lugar de
 * `new Date(iso)` para evitar el bug clásico de timezone (UTC vs local).
 */

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  return [y, m, d];
}

/** "2026-05-05" → "05 may 2026" */
export function fmtFecha(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${String(d).padStart(2, '0')} ${MESES_CORTOS[m - 1]} ${y}`;
}

/** "2026-05-05" → "5 de mayo de 2026" */
export function fmtFechaLarga(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} de ${MESES_LARGOS[m - 1].toLowerCase()} de ${y}`;
}

/** "2026-03" → "Mar" */
export function shortMes(iso: string): string {
  const [, m] = iso.split('-');
  const cap = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return cap[Number(m) - 1] ?? iso;
}

/** Cuántos días faltan entre HOY y la fecha ISO (negativo si ya pasó). */
export function diasHasta(iso: string): number {
  const [y, m, d] = parts(iso);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date();
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.ceil((target - todayMs) / 86400000);
}

/** 1234.5 → "S/ 1,234.50" */
export function fmtSoles(n: number): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
