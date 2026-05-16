import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-600">
          Regístrate gratis y empieza a intercambiar.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
