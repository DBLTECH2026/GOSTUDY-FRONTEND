// Persona A — login del portal estudiante con DNI + PIN.
// POST /api/v1/auth/portal/login → guarda token y redirige a /inicio.

export default function PortalLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-indigo-50 p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Portal Estudiante</h1>
        <p className="text-slate-600">Ingresa con tu DNI y PIN — implementar (Persona A).</p>
      </div>
    </main>
  );
}
