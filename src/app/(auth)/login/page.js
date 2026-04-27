//src/app/(auth)/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  Eye, EyeOff, GraduationCap, Zap, User, Building2,
  Users, BookOpen, Briefcase, UserCircle, Loader2, Lock,
  Mail, KeyRound, UserCheck, Users2, Sparkles, ArrowRight
} from 'lucide-react';
import { authService } from '@/services';
import useAuthStore from '@/store/authStore';
import AccountSelectionModal from '@/components/auth/AccountSelectionModal';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ROLE_ICONS = {
  MASTER_ADMIN: { icon: UserCircle, color: 'bg-purple-500/10 text-purple-400', label: 'Master Admin' },
  INSTITUTE_ADMIN: { icon: Building2, color: 'bg-blue-500/10 text-blue-400', label: 'Institute Admin' },
  BRANCH_ADMIN: { icon: Building2, color: 'bg-cyan-500/10 text-cyan-400', label: 'Branch Admin' },
  TEACHER: { icon: Briefcase, color: 'bg-indigo-500/10 text-indigo-400', label: 'Teacher' },
  STUDENT: { icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-400', label: 'Student' },
  PARENT: { icon: Users, color: 'bg-rose-500/10 text-rose-400', label: 'Parent' },
  STAFF: { icon: User, color: 'bg-slate-500/10 text-slate-400', label: 'Staff' },
};

const PORTAL_BUTTONS = [
  { type: 'STUDENT', label: 'Student Portal', icon: BookOpen, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', description: 'View attendance, fees...' },
  { type: 'TEACHER', label: 'Teacher Portal', icon: Briefcase, bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', description: 'Manage classes...' },
  { type: 'PARENT', label: 'Parent Portal', icon: Users, bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', description: 'Track child progress...' },
];

const QUICK_LOGINS = [
  { label: 'School Admin', email: 'hafizshoaibraza190@gmail.com', password: '123456', type: 'INSTITUTE_ADMIN' },
  { label: 'Master Admin', email: 'admin@thecloudsacademy.com', password: 'Admin@TCA2026!', type: 'MASTER_ADMIN' },
    { label: 'Accountant', email: 'hafizshoaibraza140@gmail.com', password: '123456', type: 'STAFF' },
];

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginMode, setLoginMode] = useState('single');

  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [showAccountPass, setShowAccountPass] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const { register: registerSingle, handleSubmit: handleSubmitSingle, setValue: setValueSingle, formState: { errors: errorsSingle } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const { register: registerDual, handleSubmit: handleSubmitDual, setValue: setValueDual, formState: { errors: errorsDual } } = useForm({
    defaultValues: { email: '' }
  });

  const navigateToPortal = (portalType) => {
    router.push(`/portal-login?type=${portalType}`);
  };

  const fillCredentials = (cred) => {
    if (loginMode === 'single') {
      setValueSingle('email', cred.email);
      setValueSingle('password', cred.password);
    } else {
      setValueDual('email', cred.email);
    }
    toast.info(`Filled ${cred.label} credentials`);
  };

  const completeLogin = async (user, accessToken) => {
    if (!user || !user.id) {
      toast.error('Invalid user data');
      return;
    }
    Cookies.remove('access_token');
    Cookies.remove('role_code');
    Cookies.remove('institute_type');
    Cookies.remove('user_type');
    Cookies.remove('portal_token');
    Cookies.remove('portal_type');
    Cookies.remove('selected_account_id');

    setUser(user, accessToken);
    Cookies.set('access_token', accessToken, { expires: 7 });
    Cookies.set('role_code', user.user_type, { expires: 7 });
    Cookies.set('user_type', user.user_type, { expires: 7 });

    const instType = user.institute?.institute_type || user.institute_type || null;
    if (instType) Cookies.set('institute_type', instType, { expires: 7 });

    if (['STUDENT', 'PARENT', 'TEACHER'].includes(user.user_type)) {
      Cookies.set('portal_token', accessToken, { expires: 7 });
      Cookies.set('portal_type', user.user_type, { expires: 7 });
    }

    toast.success(`Welcome, ${user.first_name}!`);
    const role = user.user_type;
    if (['MASTER_ADMIN', 'SYSTEM_ADMIN', 'SUPPORT_STAFF'].includes(role)) router.replace('/master-admin');
    else if (role === 'INSTITUTE_ADMIN' || role === 'STAFF') router.replace(`/${instType}/dashboard`);
    else if (role === 'TEACHER') router.replace('/teacher');
    else if (role === 'STUDENT') router.replace('/student');
    else if (role === 'PARENT') router.replace('/parent');
    else router.replace('/dashboard');
  };

  const onSingleLogin = async (data) => {
    try {
      setLoading(true);
      const response = await authService.login({ email: data.email, password: data.password });
      if (response?.user) await completeLogin(response.user, response.accessToken);
      else toast.error('Invalid email or password');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onDualLogin = async (data) => {
    try {
      setLoading(true);
      setTempEmail(data.email);
      const response = await authService.login({ email: data.email });
      const requiresSelection = response?.requiresSelection || response?.requiresAccountSelection;
      const accountsList = response?.accounts || [];
      if (requiresSelection && accountsList.length > 0) {
        setAccounts(accountsList);
        setShowAccountSelector(true);
        setLoading(false);
        return;
      }
      if (response?.requiresPassword && response?.account) {
        setSelectedAccount(response.account);
        setShowPasswordDialog(true);
        setLoading(false);
        return;
      }
      if (response?.user) {
        await completeLogin(response.user, response.accessToken);
        return;
      }
      toast.error(response?.message || 'No account found');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setShowAccountSelector(false);
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!accountPassword) { toast.error('Please enter password'); return; }
    setLoading(true);
    try {
      const response = await authService.loginWithAccount({ accountId: selectedAccount.id, password: accountPassword });
      if (response?.user) {
        setShowPasswordDialog(false);
        setAccountPassword('');
        await completeLogin(response.user, response.accessToken);
      } else toast.error('Invalid password');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Portal Shortcuts */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {PORTAL_BUTTONS.map((portal) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.type}
                onClick={() => navigateToPortal(portal.type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 group backdrop-blur-sm`}
              >
                <div className={`w-10 h-10 rounded-xl ${portal.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${portal.text}`} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${portal.text}`}>{portal.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <Tabs defaultValue="single" onValueChange={setLoginMode} className="w-full">
            <TabsList className="w-full h-14 bg-white/5 p-1 rounded-none border-b border-white/5">
              <TabsTrigger value="single" className="flex-1 rounded-2xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 font-bold transition-all">
                <UserCheck className="w-4 h-4 mr-2" /> Single Account
              </TabsTrigger>
              <TabsTrigger value="dual" className="flex-1 rounded-2xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 font-bold transition-all">
                <Users2 className="w-4 h-4 mr-2" /> Multiple Accounts
              </TabsTrigger>
            </TabsList>

            <div className="p-8">
              <TabsContent value="single" className="mt-0">
                <form onSubmit={handleSubmitSingle(onSingleLogin)} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input 
                        {...registerSingle('email', { required: 'Email is required' })}
                        type="email" placeholder="name@institute.com"
                        className="h-13 bg-white/5 border-white/10 text-white pl-11 focus:ring-indigo-500 rounded-2xl"
                        disabled={loading}
                      />
                    </div>
                    {errorsSingle.email && <p className="text-[10px] text-rose-400 font-bold ml-1 uppercase">{errorsSingle.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">Password</Label>
                      <Link href="/forgot-password" size="sm" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input 
                        {...registerSingle('password', { required: 'Password is required' })}
                        type={showPass ? 'text' : 'password'} placeholder="••••••••"
                        className="h-13 bg-white/5 border-white/10 text-white pl-11 pr-11 focus:ring-indigo-500 rounded-2xl"
                        disabled={loading}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errorsSingle.password && <p className="text-[10px] text-rose-400 font-bold ml-1 uppercase">{errorsSingle.password.message}</p>}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-base">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="dual" className="mt-0 text-white">
                <form onSubmit={handleSubmitDual(onDualLogin)} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">Registered Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input 
                        {...registerDual('email', { required: 'Email is required' })}
                        type="email" placeholder="your-email@example.com"
                        className="h-13 bg-white/5 border-white/10 text-white pl-11 rounded-2xl"
                        disabled={loading}
                      />
                    </div>
                    {errorsDual.email && <p className="text-[10px] text-rose-400 font-bold ml-1 uppercase">{errorsDual.email.message}</p>}
                  </div>
                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      <Users2 className="w-4 h-4 inline mr-1" />
                      <strong>For multiple accounts:</strong> Leave password blank. You'll select which account to use.
                    </p>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Account Selection"}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Demo Quick Login - Only in Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {QUICK_LOGINS.map((cred) => (
              <button
                key={cred.email} type="button" onClick={() => fillCredentials(cred)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                disabled={loading}
              >
                Demo: {cred.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Account Selector Modal */}
      <AccountSelectionModal 
        open={showAccountSelector} 
        onOpenChange={setShowAccountSelector} 
        accounts={accounts} 
        email={tempEmail} 
        onSelectAccount={handleSelectAccount} 
      />

      {/* Password Dialog for Selection */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-sm bg-slate-900 border-white/10 text-white rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Verify Identity</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Enter password for your {selectedAccount?.display_role} profile</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className={`w-12 h-12 rounded-xl ${ROLE_ICONS[selectedAccount?.user_type]?.color || 'bg-slate-800'} flex items-center justify-center shrink-0 shadow-lg`}>
                {(() => { const IconComp = ROLE_ICONS[selectedAccount?.user_type]?.icon || UserCircle; return <IconComp size={24} />; })()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">{selectedAccount?.display_name}</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{selectedAccount?.display_role}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</Label>
              <div className="relative">
                <Input 
                  type={showAccountPass ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className="h-12 bg-white/5 border-white/10 text-white pr-10 focus:border-indigo-500 rounded-xl"
                  value={accountPassword} 
                  onChange={(e) => setAccountPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  autoFocus
                />
                <button type="button" onClick={() => setShowAccountPass(!showAccountPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showAccountPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button onClick={handlePasswordSubmit} disabled={!accountPassword || loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}