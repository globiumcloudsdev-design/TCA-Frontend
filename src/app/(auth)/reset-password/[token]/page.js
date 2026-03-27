'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '@/services';

const schema = z
  .object({
    new_password:     z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/,   'Must contain a number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export default function ResetPasswordPage() {
  const router      = useRouter();
  const { token }   = useParams();
  const [loading,   setLoading]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const pwd = watch('new_password', '');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, data.new_password);
      toast.success('Password reset successfully! Please sign in.');
      router.replace('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Link expired or invalid. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-3 max-w-md mx-auto">
        <p className="text-destructive font-medium">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">Request a new link</Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm max-w-md mx-auto">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Set new password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">New Password</label>
          <div className="relative">
            <input
              {...register('new_password')}
              type={showNew ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.new_password && (
            <p className="mt-1 text-xs text-destructive">{errors.new_password.message}</p>
          )}
          {/* Strength hints */}
          {pwd.length > 0 && (
            <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
              {[
                { ok: pwd.length >= 8,      label: '8+ characters' },
                { ok: /[A-Z]/.test(pwd),    label: 'Uppercase letter' },
                { ok: /[a-z]/.test(pwd),    label: 'Lowercase letter' },
                { ok: /\d/.test(pwd),       label: 'Number' },
              ].map(({ ok, label }) => (
                <li key={label} className={`text-[11px] ${ok ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {ok ? '✓' : '○'} {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <input
              {...register('confirm_password')}
              type={showConf ? 'text' : 'password'}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConf((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Saving…</>
          ) : (
            'Reset password'
          )}
        </button>

        <p className="text-center text-xs">
          <Link href="/forgot-password" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={12} /> Request a new link
          </Link>
        </p>
      </form>
    </div>
  );
}
