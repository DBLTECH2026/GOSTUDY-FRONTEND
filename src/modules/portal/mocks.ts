import type { Apoderado, CursoEnPortal, EstudianteSelf, MiMatriculaResponse, MiPerfilResponse } from './types';

const ESTUDIANTE: EstudianteSelf = {
  id: 1,
  codigo_estudiante: 'EST-001234',
  dni: '70123456',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez Quiroz',
  fecha_nacimiento: '2015-03-22',
  sexo: 'M',
  direccion: 'Av. Trilce 123',
  departamento: 'Lima',
  provincia: 'Lima',
  distrito: 'San Juan de Lurigancho',
  ie_procedencia: 'I.E. 1234 Los Próceres',
  foto_url: null,
};

const APODERADOS: Apoderado[] = [
  {
    id: 1, estudiante_id: 1, tipo: 'padre',
    nombres: 'Roberto', apellidos: 'Pérez Mendoza',
    dni: '45125187', telefono: '+51 999 444 777',
    email: null,
    vive_con: true, es_titular: true,
  },
  {
    id: 2, estudiante_id: 1, tipo: 'madre',
    nombres: 'Lucía', apellidos: 'Quiroz Rojas',
    dni: '44210987', telefono: '+51 988 333 222',
    email: null,
    vive_con: true, es_titular: false,
  },
  {
    id: 3, estudiante_id: 1, tipo: 'apoderado',
    nombres: 'María Quiroz', apellidos: null,
    dni: '41887654', telefono: '+51 977 222 111',
    parentesco: 'Tía',
    email: null,
    vive_con: false, es_titular: false,
  },
];

export const MI_PERFIL_MOCK: MiPerfilResponse = {
  estudiante: ESTUDIANTE,
  apoderados: APODERADOS,
};

export const MI_MATRICULA_MOCK: MiMatriculaResponse = {
  id: 100,
  fecha_matricula: '2026-02-15',
  estado: 'activa',
  periodo_anio: 2026,
  periodo_descripcion: 'Periodo 2026-I',
  nivel: 'Primaria',
  grado: '3ro',
  seccion: 'A',
  tutor_nombres: 'Carla',
  tutor_apellidos: 'Vega',
};

export const MIS_CURSOS_MOCK: CursoEnPortal[] = [
  { id: 1, nombre: 'Matemática',     codigo: 'MAT-3', horas_semana: 6, docente_nombres: 'R.', docente_apellidos: 'Núñez' },
  { id: 2, nombre: 'Comunicación',   codigo: 'COM-3', horas_semana: 5, docente_nombres: 'M.', docente_apellidos: 'Salas' },
  { id: 3, nombre: 'Ciencia y Amb.', codigo: 'CYA-3', horas_semana: 4, docente_nombres: 'L.', docente_apellidos: 'Díaz' },
  { id: 4, nombre: 'Personal Social',codigo: 'PSC-3', horas_semana: 3, docente_nombres: 'C.', docente_apellidos: 'Mejía' },
  { id: 5, nombre: 'Inglés',         codigo: 'ING-3', horas_semana: 3, docente_nombres: 'K.', docente_apellidos: 'Ramos' },
  { id: 6, nombre: 'Religión',       codigo: 'REL-3', horas_semana: 2, docente_nombres: 'J.', docente_apellidos: 'Ruiz' },
  { id: 7, nombre: 'Educ. Física',   codigo: 'EDF-3', horas_semana: 4, docente_nombres: 'T.', docente_apellidos: 'Cabrera' },
  { id: 8, nombre: 'Arte',           codigo: 'ART-3', horas_semana: 3, docente_nombres: 'S.', docente_apellidos: 'Vargas' },
];
