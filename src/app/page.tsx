import Link from 'next/link';
import { Icon } from '@/shared/components/Icon';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-page">
      {/* Header */}
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-trilce-primary flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-bold text-lg">GOSTUDY · Trilce</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#beneficios" className="hover:text-text-primary">Beneficios</a>
            <a href="#proceso" className="hover:text-text-primary">Proceso</a>
            <Link href="/admin-login" className="hover:text-text-primary">Admin</Link>
            <Link
              href="/inscripcion"
              className="bg-trilce-primary hover:bg-trilce-primary-dark text-white px-4 py-2 rounded-sm font-semibold"
            >
              Inscribir
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-14 text-center">
        <span className="inline-block bg-trilce-primary-soft text-trilce-primary-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
          Inicial · Primaria · Secundaria
        </span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
          Estudiar en Trilce <span className="text-trilce-primary">SE NOTA</span>
        </h1>
        <p className="max-w-2xl mx-auto text-text-secondary mb-8">
          Plataforma oficial de matrícula online del Colegio Trilce. Inscribe a tu hijo
          en línea o accede a la información académica desde cualquier lugar.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-8 text-left">
          <Card
            badge="Nuevo"
            icon="Plus"
            title="Inscripción de estudiante"
            text="Inscribe a tu hijo de manera digital. Recibirás su PIN al terminar el proceso."
            cta="Empezar inscripción"
            href="/inscripcion"
            variant="primary"
          />
          <Card
            badge="Inicia sesión"
            icon="GraduationCap"
            title="Portal del estudiante"
            text="Ingresa con tu DNI y PIN. Consulta tu matrícula, pagos y cursos asignados."
            cta="Iniciar sesión"
            href="/portal-login"
            variant="accent"
          />
          <Card
            badge="Staff"
            icon="KeyRound"
            title="Panel administrativo"
            text="Acceso del personal del colegio: admin y docentes. Gestiona inscripciones y pagos."
            cta="Acceder"
            href="/admin-login"
            variant="ghost"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat value="4,500+" label="Estudiantes" />
          <Stat value="45+" label="Años de experiencia" />
          <Stat value="3" label="Niveles educativos" />
          <Stat value="100%" label="Sello Trilce" />
        </div>
      </section>

      {/* Por qué Trilce */}
      <section id="beneficios" className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-center text-3xl font-bold mb-2">Por qué Trilce</h2>
        <p className="text-center text-text-secondary mb-10">
          Una propuesta educativa moderna basada en décadas de experiencia.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Benefit icon="Users" title="Profesores expertos" text="Plana docente comprometida con la formación integral." />
          <Benefit icon="BookOpen" title="Libros gratuitos" text="Todos los textos del año académico incluidos." />
          <Benefit icon="Building2" title="Hogar escolar" text="Ambientes seguros, modernos y bien equipados." />
          <Benefit icon="User" title="Tutoría personal" text="Acompañamiento personalizado para cada estudiante." />
        </div>
      </section>

      {/* CTA final */}
      <section id="proceso" className="max-w-6xl mx-auto px-6 pb-14">
        <div className="bg-trilce-primary text-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">¿Listo para inscribir a tu hijo?</h3>
            <p className="text-white/90">
              El proceso toma 5 minutos. Solo necesitas DNI del apoderado y del estudiante.
            </p>
          </div>
          <Link
            href="/inscripcion"
            className="bg-bg-card text-trilce-primary font-bold px-6 py-3 rounded-sm hover:bg-trilce-primary-soft flex items-center gap-2"
          >
            Comenzar inscripción <Icon name="ArrowRight" size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-text-muted">
        © {new Date().getFullYear()} Colegio Trilce. GOSTUDY — Sistema de Matrícula Digital.
      </footer>
    </main>
  );
}

function Card({
  badge,
  icon,
  title,
  text,
  cta,
  href,
  variant,
}: {
  badge: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  text: string;
  cta: string;
  href: string;
  variant: 'primary' | 'accent' | 'ghost';
}) {
  const btn =
    variant === 'primary'
      ? 'bg-trilce-primary text-white hover:bg-trilce-primary-dark'
      : variant === 'accent'
      ? 'bg-trilce-accent text-white hover:bg-trilce-accent/90'
      : 'bg-bg-card border border-border text-text-primary hover:bg-bg-muted';

  return (
    <div className="bg-bg-card border border-border rounded-md p-6 flex flex-col">
      <span className="self-start bg-trilce-primary-soft text-trilce-primary-dark text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
        {badge}
      </span>
      <div className="w-11 h-11 rounded-md bg-trilce-primary-soft flex items-center justify-center mb-3 text-trilce-primary">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-5 flex-1">{text}</p>
      <Link
        href={href}
        className={`${btn} text-sm font-semibold rounded-sm py-2.5 text-center transition-colors`}
      >
        {cta} →
      </Link>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-trilce-primary">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  text: string;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-md p-5">
      <div className="w-10 h-10 rounded-md bg-trilce-primary-soft text-trilce-primary flex items-center justify-center mb-3">
        <Icon name={icon} size={20} />
      </div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}
