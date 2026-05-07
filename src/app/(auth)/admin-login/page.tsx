// Persona A — login para admin/docente con email + password.
// POST /api/v1/auth/admin/login → guarda token y redirige a /dashboard.

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Acceso Staff</h1>
        <p className="text-slate-600">Implementar login admin (Persona A).</p>
      </div>
    </main>
  );
}
