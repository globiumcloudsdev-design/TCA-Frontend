'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { schoolService } from '@/services';

const schema = z.object({
  name:         z.string().min(2),
  has_branches: z.boolean(),
});

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['school-profile'],
    queryFn:  schoolService.getProfile,
  });

  const school = data?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    values: school ? { name: school.name, has_branches: school.has_branches } : undefined,
  });

  const mutation = useMutation({
    mutationFn: schoolService.updateSettings,
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['school-profile'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">School Settings</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">School Name</label>
          <input {...register('name')}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="has_branches"
            {...register('has_branches')}
            className="h-4 w-4 rounded border"
          />
          <label htmlFor="has_branches" className="text-sm font-medium">
            This school has multiple branches
          </label>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
