import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">SalesXP</h1>
          <p className="text-muted-foreground mt-2">
            Maîtrise la vente complexe en ESN
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
