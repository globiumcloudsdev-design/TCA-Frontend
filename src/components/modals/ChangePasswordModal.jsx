'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppModal from '@/components/common/AppModal';
import { dashboardService } from '@/services/dashboardService';

export default function ChangePasswordModal({ open, onClose, user }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const changePassword = useMutation({
    mutationFn: () => dashboardService.changeUserPassword(user.id, password),
    onSuccess: (data) => {
      toast.success(`Password updated for ${data.name}`);
      handleClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update password');
    },
  });

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    changePassword.mutate();
  };

  const handleGeneratePassword = () => {
    const generated = '12345678';
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    toast.info('Suggested password generated');
  };

  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User';

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Change Password"
      description={`Set a new password for ${userName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-primary hover:text-primary hover:bg-primary/5 gap-1.5 px-2"
            onClick={handleGeneratePassword}
          >
            <Sparkles size={12} />
            Generate 12345678
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-9 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={changePassword.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-9"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={changePassword.isPending}
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-destructive font-medium">Passwords do not match</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={changePassword.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={changePassword.isPending || !password || password !== confirmPassword}>
            {changePassword.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
