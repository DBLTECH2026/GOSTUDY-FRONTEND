import { redirect } from 'next/navigation';

// El registro directo de estudiantes fue deshabilitado.
// Todos los nuevos alumnos deben pasar por el flujo de inscripción
// pública (/inscripcion) y ser aprobados por administración.
export default function PortalRegisterRedirect() {
  redirect('/inscripcion');
}
