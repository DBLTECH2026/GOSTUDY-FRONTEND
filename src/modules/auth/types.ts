export type Rol = 'admin' | 'docente' | 'estudiante';
export type TipoUsuario = 'admin' | 'estudiante';

export type AuthUser = {
  id: number;
  tipo: TipoUsuario;
  rol: Rol;
  nombres: string;
  apellidos: string;
  nombre: string;
  email?: string | null;
  dni?: string | null;
  telefono?: string | null;
  foto_url?: string | null;
  estado: string;
  // Específicos del estudiante
  codigo_estudiante?: string;
  fecha_nacimiento?: string | null;
  sexo?: 'M' | 'F';
  direccion?: string;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  ie_procedencia?: string | null;
  anio_procedencia?: number | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
