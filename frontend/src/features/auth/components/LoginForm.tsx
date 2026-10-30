import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import { ApiClientError } from '@/lib/api/errors'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending, error } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormValues) => {
    login(data)
  }

  const errorMessage = error instanceof ApiClientError ? error.message : error ? 'Terjadi kesalahan autentikasi' : null

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <div
          className="rounded-[10px] p-3 text-xs font-semibold"
          style={{
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block font-bold uppercase tracking-wider"
          style={{ fontSize: '10px', color: 'var(--muted)' }}
        >
          Email Perusahaan
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@peoplecore.local"
          className="w-full rounded-[10px] px-3.5 py-2.5 text-xs focus:outline-none transition-all"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--dark)',
          }}
          disabled={isPending}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] font-semibold" style={{ color: 'var(--danger)' }}>
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block font-bold uppercase tracking-wider"
          style={{ fontSize: '10px', color: 'var(--muted)' }}
        >
          Kata Sandi
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-[10px] px-3.5 py-2.5 pr-10 text-xs focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--dark)',
            }}
            disabled={isPending}
            {...form.register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 transition-colors"
            style={{ color: 'var(--muted)' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-[10px] font-semibold" style={{ color: 'var(--danger)' }}>
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] font-bold text-white transition-all hover:opacity-95 cursor-pointer disabled:opacity-50 mt-2"
        style={{
          backgroundColor: 'var(--primary)',
          padding: '11px 16px',
          fontSize: '12px',
        }}
      >
        {isPending ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
            Memproses...
          </>
        ) : (
          'Masuk ke Sistem'
        )}
      </button>
    </form>
  )
}
