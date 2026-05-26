"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "./actions"
import type { UserRole } from "@/lib/session"

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

interface LoginFormProps {
  role: UserRole
}

export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await signIn(values.email, values.password, role)
    if (!result.success) {
      setServerError(result.error)
      return
    }
    router.push(result.redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-label font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-label text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-label font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-label text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 px-3.5 py-3">
          <WarningCircle size={15} className="mt-px shrink-0 text-destructive" weight="fill" />
          <p className="text-label text-destructive">{serverError}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-label text-subtle">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full gap-2">
        Continue with SSO
        <span className="text-label text-subtle font-normal">· for enterprise accounts</span>
      </Button>
    </form>
  )
}
