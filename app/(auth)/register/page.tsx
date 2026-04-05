import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
          <p className="text-muted-foreground mt-2">
            Commence ton aventure commerciale
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
