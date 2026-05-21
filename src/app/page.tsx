import Link from 'next/link';
import { Icon, IconName } from '@/shared/components/Icon';
import { Reveal } from './_landing/Reveal';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-page text-text-primary">
      <Nav />
      <Hero />
      <TrustBar />
      <Beneficios />
      <Proceso />
      <Testimonios />
      <CTAFinal />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-bg-page/80 backdrop-blur-md border-b border-border/70">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-md bg-trilce-primary flex items-center justify-center text-white font-bold font-display text-lg shadow-sm transition-shadow duration-200 group-hover:shadow-md">
            T
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            GOSTUDY <span className="text-text-muted font-medium">·</span> Trilce
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-text-secondary">
          <a href="#beneficios" className="hover:text-text-primary transition-colors duration-200 cursor-pointer">
            Beneficios
          </a>
          <a href="#proceso" className="hover:text-text-primary transition-colors duration-200 cursor-pointer">
            Proceso
          </a>
          <a href="#testimonios" className="hover:text-text-primary transition-colors duration-200 cursor-pointer">
            Testimonios
          </a>
          <Link
            href="/admin-login"
            className="hover:text-text-primary transition-colors duration-200 cursor-pointer"
          >
            Admin
          </Link>
          <Link
            href="/inscripcion"
            className="bg-trilce-primary hover:bg-trilce-primary-dark text-white px-4 py-2 rounded-sm text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
          >
            Inscribir
          </Link>
        </nav>
        <Link
          href="/inscripcion"
          className="md:hidden bg-trilce-primary text-white px-3.5 py-2 rounded-sm text-sm font-semibold cursor-pointer"
        >
          Inscribir
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-trilce pointer-events-none" aria-hidden />
      <div
        className="absolute -top-24 -right-32 w-[480px] h-[480px] rounded-full bg-trilce-primary/15 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-40 -left-32 w-[360px] h-[360px] rounded-full bg-trilce-accent/10 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-7">
          <span className="animate-fade-up inline-flex items-center gap-2 bg-trilce-primary-soft text-trilce-primary-dark text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.12em]">
            <Icon name="Sparkles" size={14} />
            Matrícula 2026 abierta
          </span>

          <h1 className="animate-fade-up delay-1 font-display text-[44px] sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight mt-5">
            Estudiar en Trilce<br />
            <span className="text-trilce-primary italic">se nota.</span>
          </h1>

          <p className="animate-fade-up delay-2 max-w-xl text-text-secondary text-lg leading-relaxed mt-5">
            Plataforma oficial de matrícula online del Colegio Trilce. Inscribe a tu hijo
            en línea y accede a su información académica desde cualquier lugar.
          </p>

          <div className="animate-fade-up delay-3 flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/inscripcion"
              className="inline-flex items-center justify-center gap-2 bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-6 py-3.5 rounded-sm transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
            >
              Empezar inscripción
              <Icon name="ArrowRight" size={18} />
            </Link>
            <Link
              href="/portal-login"
              className="inline-flex items-center justify-center gap-2 bg-bg-card hover:bg-bg-muted text-text-primary font-semibold px-6 py-3.5 rounded-sm border border-border transition-colors duration-200 cursor-pointer"
            >
              <Icon name="GraduationCap" size={18} />
              Portal del estudiante
            </Link>
          </div>

          <dl className="animate-fade-up delay-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mt-10 pt-8 border-t border-border/70">
            <Kpi value="4,500+" label="Estudiantes" />
            <Kpi value="45+" label="Años de experiencia" />
            <Kpi value="3" label="Niveles educativos" />
            <Kpi value="100%" label="Sello Trilce" />
          </dl>
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-col gap-3.5">
            <FloatingAction
              animationDelay="0s"
              badge="Nuevo"
              icon="Plus"
              title="Inscripción de estudiante"
              text="Inscribe a tu hijo de manera digital. Recibirás su PIN al terminar el proceso."
              cta="Empezar inscripción"
              href="/inscripcion"
              tone="primary"
            />
            <FloatingAction
              animationDelay="1.2s"
              badge="Inicia sesión"
              icon="GraduationCap"
              title="Portal del estudiante"
              text="Ingresa con tu DNI y PIN. Consulta tu matrícula, pagos y cursos asignados."
              cta="Iniciar sesión"
              href="/portal-login"
              tone="accent"
            />
            <FloatingAction
              animationDelay="2.4s"
              badge="Staff"
              icon="KeyRound"
              title="Panel administrativo"
              text="Acceso del personal del colegio. Gestiona inscripciones, matrículas y pagos."
              cta="Acceder"
              href="/admin-login"
              tone="ghost"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-border bg-bg-card/60">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center sm:justify-between gap-x-8 gap-y-3 text-sm text-text-secondary">
        <span className="inline-flex items-center gap-2">
          <Icon name="ShieldCheck" size={16} className="text-trilce-primary" />
          Datos protegidos
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="CircleCheck" size={16} className="text-trilce-primary" />
          Proceso 100% en línea
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="Hourglass" size={16} className="text-trilce-primary" />
          Inscripción en 5 minutos
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="Mail" size={16} className="text-trilce-primary" />
          Soporte por correo y WhatsApp
        </span>
      </div>
    </section>
  );
}

function Beneficios() {
  const items: Array<{ icon: IconName; title: string; text: string }> = [
    { icon: 'Users', title: 'Profesores expertos', text: 'Plana docente comprometida con la formación integral del estudiante.' },
    { icon: 'BookOpen', title: 'Libros incluidos', text: 'Todos los textos del año académico están incluidos en la matrícula.' },
    { icon: 'Building2', title: 'Hogar escolar', text: 'Ambientes seguros, modernos y bien equipados para el aprendizaje.' },
    { icon: 'User', title: 'Tutoría personal', text: 'Acompañamiento personalizado para cada estudiante y su familia.' },
  ];

  return (
    <section id="beneficios" className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="text-trilce-primary-dark text-xs font-bold uppercase tracking-[0.12em]">
          Por qué Trilce
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.05] mt-3">
          Una propuesta educativa <span className="italic text-trilce-primary">moderna</span>,
          basada en décadas de experiencia.
        </h2>
        <p className="text-text-secondary mt-4 leading-relaxed">
          Combinamos rigor académico, tecnología y cercanía. Esa es la diferencia que se
          siente desde el primer día.
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={((i + 1) as 1 | 2 | 3 | 4)} className="h-full">
            <div className="group h-full bg-bg-card border border-border rounded-md p-6 transition-colors duration-200 hover:border-trilce-primary/40">
              <div className="w-11 h-11 rounded-md bg-trilce-primary-soft text-trilce-primary flex items-center justify-center transition-colors duration-200 group-hover:bg-trilce-primary group-hover:text-white">
                <Icon name={it.icon} size={22} />
              </div>
              <h3 className="font-bold text-lg mt-4">{it.title}</h3>
              <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Proceso() {
  const steps = [
    { n: '01', title: 'Crea la inscripción', text: 'Completa los datos del estudiante y del apoderado en el formulario online.' },
    { n: '02', title: 'Adjunta documentos', text: 'Sube DNI, foto y partida de nacimiento. Todo de forma segura.' },
    { n: '03', title: 'Confirmación', text: 'Recibes tu número de PIN por correo para acceder al portal.' },
    { n: '04', title: 'Matrícula y pago', text: 'Coordinas la matrícula con el colegio y registras los pagos del año.' },
  ];

  return (
    <section id="proceso" className="bg-bg-card border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <Reveal className="max-w-2xl">
          <span className="text-trilce-primary-dark text-xs font-bold uppercase tracking-[0.12em]">
            Proceso
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.05] mt-3">
            Cuatro pasos.<br />
            <span className="italic text-trilce-primary">Cinco minutos.</span>
          </h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            Solo necesitas el DNI del apoderado y del estudiante para empezar.
          </p>
        </Reveal>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 mt-12">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={((i + 1) as 1 | 2 | 3 | 4)}>
              <div className="font-display text-trilce-primary/30 text-5xl font-semibold leading-none">
                {s.n}
              </div>
              <h3 className="font-bold text-lg mt-3">{s.title}</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonios() {
  const data = [
    {
      initials: 'CR',
      name: 'Carolina Rivera',
      role: 'Madre de Diego — 5° Primaria',
      quote:
        'La inscripción en línea fue clara y rápida. Lo más importante es que mi hijo se siente acompañado: los tutores conocen sus avances y sus retos.',
    },
    {
      initials: 'JM',
      name: 'Jorge Mendoza',
      role: 'Padre de Luciana — 2° Secundaria',
      quote:
        'Vemos resultados reales en lectura y matemáticas. El portal nos permite seguir las notas y los pagos sin tener que ir al colegio.',
    },
    {
      initials: 'AS',
      name: 'Andrea Salinas',
      role: 'Madre de Mateo — Inicial 5 años',
      quote:
        'Lo que más valoramos es la calidez. Aquí no es un trámite, es una decisión sobre la educación de nuestro hijo, y eso se nota.',
    },
  ];

  return (
    <section id="testimonios" className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="text-trilce-primary-dark text-xs font-bold uppercase tracking-[0.12em]">
          Testimonios
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.05] mt-3">
          Lo que dicen las <span className="italic text-trilce-primary">familias Trilce</span>
        </h2>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-5 mt-12">
        {data.map((t, i) => (
          <Reveal key={t.name} delay={((i + 1) as 1 | 2 | 3)}>
            <figure className="h-full bg-bg-card border border-border rounded-md p-6 flex flex-col transition-colors duration-200 hover:border-trilce-primary/40">
              <Icon name="Quote" size={24} className="text-trilce-primary/50" />
              <blockquote className="text-text-primary leading-relaxed mt-3 flex-1">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
                <div
                  className="w-11 h-11 rounded-full bg-trilce-primary-soft text-trilce-primary-dark font-bold flex items-center justify-center text-sm"
                  aria-hidden
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-text-secondary">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-lg bg-trilce-accent text-white p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div
            className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-trilce-primary/30 blur-3xl pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-xl">
            <h3 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              ¿Listo para inscribir <span className="italic text-trilce-primary">a tu hijo?</span>
            </h3>
            <p className="text-white/80 mt-3 leading-relaxed">
              El proceso toma alrededor de 5 minutos. Solo necesitas el DNI del apoderado y
              del estudiante. Recibirás el PIN al terminar.
            </p>
          </div>
          <Link
            href="/inscripcion"
            className="relative inline-flex items-center justify-center gap-2 bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-6 py-3.5 rounded-sm transition-colors duration-200 cursor-pointer shadow-sm hover:shadow shrink-0"
          >
            Comenzar inscripción
            <Icon name="ArrowRight" size={18} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
      © {new Date().getFullYear()} Colegio Trilce. GOSTUDY — Sistema de Matrícula Digital.
    </footer>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl font-semibold text-trilce-primary tracking-tight leading-none">
        {value}
      </dt>
      <dd className="text-xs text-text-secondary mt-1.5 leading-tight">{label}</dd>
    </div>
  );
}

function FloatingAction({
  badge,
  icon,
  title,
  text,
  cta,
  href,
  tone,
  animationDelay,
}: {
  badge: string;
  icon: IconName;
  title: string;
  text: string;
  cta: string;
  href: string;
  tone: 'primary' | 'accent' | 'ghost';
  animationDelay: string;
}) {
  const btnClass =
    tone === 'primary'
      ? 'bg-trilce-primary hover:bg-trilce-primary-dark text-white'
      : tone === 'accent'
      ? 'bg-trilce-accent hover:bg-trilce-accent/90 text-white'
      : 'bg-bg-page hover:bg-bg-muted border border-border text-text-primary';

  const iconBgClass =
    tone === 'accent'
      ? 'bg-trilce-accent/10 text-trilce-accent'
      : 'bg-trilce-primary-soft text-trilce-primary';

  return (
    <div
      className="animate-float bg-bg-card border border-border rounded-md p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{ animationDelay }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${iconBgClass}`}>
          <Icon name={icon} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block bg-trilce-primary-soft text-trilce-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">
            {badge}
          </span>
          <h3 className="font-bold text-base mt-1.5">{title}</h3>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{text}</p>
          <Link
            href={href}
            className={`inline-flex items-center justify-center gap-1.5 w-full text-sm font-semibold rounded-sm py-2.5 mt-4 transition-colors duration-200 cursor-pointer ${btnClass}`}
          >
            {cta}
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
