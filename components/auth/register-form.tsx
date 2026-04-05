'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register as registerAction } from '@/lib/auth/actions'
import { registerSchema, type RegisterInput } from '@/lib/auth/schemas'

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('username', data.username)
      formData.set('email', data.email)
      formData.set('password', data.password)

      const result = await registerAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.redirectTo) {
        window.location.href = result.redirectTo
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Nom d&apos;utilisateur</Label>
        <Input
          id="username"
          placeholder="votre_pseudo"
          autoComplete="username"
          {...register('username')}
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          placeholder="8 car. min, 1 maj, 1 chiffre"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Création…' : 'Créer mon compte'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
