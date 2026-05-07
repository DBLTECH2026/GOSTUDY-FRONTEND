import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">GOSTUDY</h1>
        <p className="text-slate-600 mb-8">Sistema de Matrícula Digital — Colegio Trilce</p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/inscripcion"
            className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-6 hover:bg-emerald-100 transition"
          >
            <h2 className="font-semibold text-emerald-900 mb-1">Inscripción</h2>
            <p className="text-sm text-emerald-800">Inscribe a tu hijo (público).</p>
          </Link>

          <Link
            href="/portal-login"
            className="rounded-xl border-2 border-indigo-500 bg-indigo-50 p-6 hover:bg-indigo-100 transition"
          >
            <h2 className="font-semibold text-indigo-900 mb-1">Portal Estudiante</h2>
            <p className="text-sm text-indigo-800">Ingresa con DNI + PIN.</p>
          </Link>

          <Link
            href="/admin-login"
            className="rounded-xl border-2 border-slate-500 bg-slate-50 p-6 hover:bg-slate-100 transition"
          >
            <h2 className="font-semibold text-slate-900 mb-1">Panel Admin</h2>
            <p className="text-sm text-slate-700">Acceso staff (email + contraseña).</p>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8 text-center">
          Esqueleto base — implementar contenido en cada módulo.
        </p>
      </div>
    </main>
  );
}
