'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

import { authService } from '@/services';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo]   = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.forgotPassword(data.email);
      setSentTo(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to
          </p>
          <p className="text-sm font-medium text-foreground">{sentTo}</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
          ⚠️ The link expires in <strong>30 minutes</strong>. Check your spam folder if you don&apos;t see it.
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm max-w-md mx-auto">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Forgot your password?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your account email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Sending…</>
          ) : (
            'Send reset link'
          )}
        </button>

        <p className="text-center text-xs">
          <Link href="/login" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={12} /> Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
