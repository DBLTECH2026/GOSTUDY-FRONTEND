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
  dni: string;
  telefono: string | null;
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
  id: number;
  nombre: string;
  codigo: string;
  horas_semana: number;
  docente_nombres: string | null;
  docente_apellidos: string | null;
};
