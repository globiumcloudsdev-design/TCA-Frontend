// frontend/src/components/auth/AccountSelectionModal.jsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  UserCircle,
  Building2,
  Users,
  BookOpen,
  Briefcase,
  User,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authService } from '@/services';
import useAuthStore from '@/store/authStore';
import { AppModal } from '../common';

// Role icons mapping
export const ROLE_ICONS = {
  MASTER_ADMIN: { icon: UserCircle, color: 'bg-purple-100 text-purple-600', label: 'Master Admin' },
  INSTITUTE_ADMIN: { icon: Building2, color: 'bg-blue-100 text-blue-600', label: 'Institute Admin' },
  BRANCH_ADMIN: { icon: Building2, color: 'bg-cyan-100 text-cyan-600', label: 'Branch Admin' },
  TEACHER: { icon: Briefcase, color: 'bg-blue-100 text-blue-600', label: 'Teacher' },
  STUDENT: { icon: BookOpen, color: 'bg-emerald-100 text-emerald-600', label: 'Student' },
  PARENT: { icon: Users, color: 'bg-indigo-100 text-indigo-600', label: 'Parent' },
  STAFF: { icon: User, color: 'bg-slate-100 text-slate-600', label: 'Staff' },
};

export default function AccountSelectionModal({
  open,
  onOpenChange,
  accounts = [],
  email = '',
  onSelectAccount,
  onSuccess,
  onError
}) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectAccount = (account) => {
    if (onSelectAccount) {
      onSelectAccount(account);
    } else {
      setSelectedAccount(account);
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!accountPassword) {
      toast.error('Please enter password');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authService.loginWithAccount({
        accountId: selectedAccount.id,
        password: accountPassword
      });

      const user = response.user;
      const accessToken = response.accessToken;

      await completeLogin(user, accessToken);
      
      setShowPasswordDialog(false);
      onOpenChange(false);
      
      if (onSuccess) onSuccess(user);
      
    } catch (err) {
      console.error('Password login error:', err);
      const errorMsg = err?.response?.data?.message || 'Invalid password for this account';
      toast.error(errorMsg);
      if (onError) onError(err);
    } finally {
      setLoading(false);
      setAccountPassword('');
    }
  };

  const completeLogin = async (user, accessToken) => {
    Cookies.remove('access_token');
    Cookies.remove('role_code');
    Cookies.remove('institute_type');
    Cookies.remove('selected_account_id');
    
    setUser(user, accessToken);
    
    Cookies.set('access_token', accessToken, { expires: 7 });
    Cookies.set('role_code', user.user_type, { expires: 7 });
    Cookies.set('selected_account_id', user.id, { expires: 7 });
    
    const instType = user.institute?.institute_type || user.institute_type || 'school';
    Cookies.set('institute_type', instType, { expires: 7 });
    
    toast.success(`Welcome, ${user.first_name}!`);
    
    // Redirect based on user type
    const role = user.user_type;
    if (role === 'MASTER_ADMIN') {
      router.replace('/master-admin');
    } else if (role === 'INSTITUTE_ADMIN') {
      router.replace(`/${instType}/dashboard`);
    } else if (role === 'TEACHER') {
      router.replace('/teacher');
    } else if (role === 'STUDENT') {
      router.replace('/student');
    } else if (role === 'PARENT') {
      router.replace('/parent');
    } else {
      router.replace('/dashboard');
    }
  };

  const getRoleDisplay = (userType, staffType = null) => {
    const role = ROLE_ICONS[userType];
    if (userType === 'STAFF' && staffType) return staffType;
    return role?.label || userType;
  };

  const handleBackToAccounts = () => {
    setSelectedAccount(null);
    setShowPasswordDialog(false);
    setAccountPassword('');
  };

  return (
    <>
      {/* Account Selector Modal */}
      <AppModal
        // open={open && !showPasswordDialog}
                open={open}  // 👈 REMOVED && !showPasswordDialog from here
        onClose={() => onOpenChange(false)}
        title="Select Account"
        description={`Multiple accounts found with ${email}. Please select which account you want to use.`}
        size="md"
      >
        <div className="space-y-3 py-2 max-h-[50vh] overflow-y-auto">
          {accounts.map((account) => {
            const roleInfo = ROLE_ICONS[account.user_type];
            const IconComp = roleInfo?.icon || UserCircle;
            const instituteName = account.institute?.name || 'No Institute';
            
            return (
              <Card
                key={account.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                onClick={() => handleSelectAccount(account)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${roleInfo?.color || 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}>
                    <IconComp size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base truncate">
                        {account.display_name || `${account.first_name} ${account.last_name}`}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleInfo?.color || 'bg-slate-100 text-slate-700'}`}>
                        {account.display_role || getRoleDisplay(account.user_type, account.staff_type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {instituteName}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    Select →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-4">
          <p>Each account has its own password. Select an account to enter its password.</p>
        </div>
      </AppModal>

      {/* Password Dialog */}
      <AppModal
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        title="Enter Password"
        description={`Enter password for ${selectedAccount?.display_role} account`}
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className={`w-10 h-10 rounded-lg ${ROLE_ICONS[selectedAccount?.user_type]?.color || 'bg-slate-100'} flex items-center justify-center`}>
              {(() => {
                const IconComp = ROLE_ICONS[selectedAccount?.user_type]?.icon || UserCircle;
                return <IconComp size={20} />;
              })()}
            </div>
            <div>
              <p className="font-medium">{selectedAccount?.display_name}</p>
              <p className="text-xs text-muted-foreground">{selectedAccount?.display_role}</p>
              <p className="text-xs text-muted-foreground font-mono">{selectedAccount?.email}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-9 pr-10"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline"
              onClick={handleBackToAccounts}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handlePasswordSubmit} 
              disabled={loading || !accountPassword}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>
          </div>
        </div>
      </AppModal>
    </>
  );
}