// Persona C — types del módulo Portal Estudiante.

export type EstudianteSelf = {
  id: number;
  codigo_estudiante: string;
  dni: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  direccion: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  ie_procedencia: string | null;
  foto_url: string | null;
};

export type ApoderadoTipo = 'padre' | 'madre' | 'apoderado';

export type Apoderado = {
  id: number;
  estudiante_id: number;
  tipo: ApoderadoTipo;
  nombres: string;
  apellidos: string | null;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  ocupacion?: string | null;
  parentesco?: string | null;
  vive_con: boolean;
  es_titular: boolean;
};

export type MiPerfilResponse = {
  estudiante: EstudianteSelf;
  apoderados: Apoderado[];
};

export type MiMatriculaResponse = {
  id: number;
  fecha_matricula: string;
  estado: 'activa' | 'retirada' | 'egresada';
  periodo_anio: number;
  periodo_descripcion: string;
  nivel: string;
  grado: string;
  seccion: string;
  tutor_nombres: string | null;
  tutor_apellidos: string | null;
};

export type CursoEnPortal = {
  seccion_curso_id: number;
  id: number;
  nombre: string;
  codigo: string;
  horas_semana: number;
  docente_nombres: string | null;
  docente_apellidos: string | null;
};

/* ─── Horario semanal ─── */

export type SlotHorario = {
  id: number;
  dia_semana: number;       // 1=Lun ... 7=Dom
  hora_inicio: string;      // 'HH:MM'
  hora_fin: string;
  aula: string | null;
  seccion_curso_id: number;
  curso_id: number;
  curso: string;
  curso_codigo: string;
  docente: string | null;
};

export type MiHorarioResponse = {
  seccion: {
    id: number;
    nombre: string;
    capacidad: number;
    grado: string;
    nivel: string;
  } | null;
  slots: SlotHorario[];
};

/* ─── Detalle de curso ─── */

export type CursoDetalleHorario = {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
};

export type ContenidoSemana = {
  titulo: string | null;
  descripcion: string | null;
  recursos_url: string | null;
  tarea: string | null;
} | null;

export type MaterialEnPortal = {
  id: number;
  nombre: string;
  url: string | null;
  tipo: string | null;
  tamano: number;
  tamano_legible: string;
};

export type SemanaDetalle = {
  id: number;
  numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  es_actual: boolean;
  contenido: ContenidoSemana;
  materiales: MaterialEnPortal[];
};

export type BimestreDetalle = {
  id: number;
  nombre: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  es_actual: boolean;
  semanas: SemanaDetalle[];
};

export type CursoDetalleResponse = {
  curso: {
    seccion_curso_id: number;
    curso_id: number;
    nombre: string;
    codigo: string;
    horas_semana: number;
    descripcion: string | null;
    docente: string | null;
  };
  horarios: CursoDetalleHorario[];
  bimestres: BimestreDetalle[];
};
