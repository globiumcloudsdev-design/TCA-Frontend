// frontend/src/app/portal-login/page.jsx (COMPLETE FIXED VERSION)

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  GraduationCap, Users, BookOpen, Eye, EyeOff,
  ArrowLeft, CheckCircle, Mail, Lock, Briefcase, Users2, Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import usePortalStore from '@/store/portalStore';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services';
import AccountSelectionModal from '@/components/auth/AccountSelectionModal';

// Role icons mapping for modal
const ROLE_ICONS = {
  MASTER_ADMIN: { color: 'bg-purple-100 text-purple-600', label: 'Master Admin' },
  INSTITUTE_ADMIN: { color: 'bg-blue-100 text-blue-600', label: 'Institute Admin' },
  BRANCH_ADMIN: { color: 'bg-cyan-100 text-cyan-600', label: 'Branch Admin' },
  TEACHER: { color: 'bg-blue-100 text-blue-600', label: 'Teacher' },
  STUDENT: { color: 'bg-emerald-100 text-emerald-600', label: 'Student' },
  PARENT: { color: 'bg-indigo-100 text-indigo-600', label: 'Parent' },
  STAFF: { color: 'bg-slate-100 text-slate-600', label: 'Staff' },
};

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().optional(),
});

const PORTAL_TYPES = [
  {
    type: 'PARENT',
    icon: Users,
    label: 'Parent Portal',
    tagline: 'Track your child\'s progress',
    gradient: 'from-indigo-600 to-violet-600',
    redirectTo: '/parent',
    features: ['Child attendance', 'Fee status', 'Exam results', 'Announcements'],
  },
  {
    type: 'STUDENT',
    icon: BookOpen,
    label: 'Student Portal',
    tagline: 'View your own academic data',
    gradient: 'from-emerald-600 to-teal-600',
    redirectTo: '/student',
    features: ['My attendance', 'My fee record', 'My exam results', 'Class timetable'],
  },
  {
    type: 'TEACHER',
    icon: Briefcase,
    label: 'Teacher Portal',
    tagline: 'Manage your classes & students',
    gradient: 'from-blue-600 to-sky-600',
    redirectTo: '/teacher',
    features: ['My classes & subjects', 'Upload notes', 'Assign homework', 'Mark attendance'],
  },
];

// Demo accounts
const DEMO_ACCOUNTS = [
  { role: 'STUDENT', email: 'sajood483@gmail.com', password: 'The123456', name: 'Hassan Raza', institute_type: 'school' },
  { role: 'PARENT', email: 'father.ali@parent.tca', password: 'parent123', name: 'Mr. Khan', institute_type: 'school' },
  { role: 'TEACHER', email: 'shoaibrazamemon160@gmail.com', password: '123456', name: 'Shoaib Raza', institute_type: 'school' },
  // { role: 'TEACHER', email: 'hafizshoaibraza180@gmail.com', password: 'Shoaib0320', name: 'Shoaib Raza', institute_type: 'school' },
  { role: 'STUDENT', email: 'hafizshoaibraza180@gmail.com', password: '', name: 'Shoaib (Dual)', institute_type: 'school' },
];

const INSTITUTE_TABS = [
  { value: 'school', label: 'School' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'academy', label: 'Academy' },
  { value: 'college', label: 'College' },
  { value: 'university', label: 'University' },
];

const ROLE_STYLES = {
  PARENT: { icon: Users, bg: 'bg-indigo-100', ic: 'text-indigo-600' },
  STUDENT: { icon: BookOpen, bg: 'bg-emerald-100', ic: 'text-emerald-600' },
  TEACHER: { icon: Briefcase, bg: 'bg-blue-100', ic: 'text-blue-600' },
};

export default function PortalLoginPage() {
  // const router = useRouter();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get portal type from URL parameter
  const urlType = searchParams?.get('type');

  // Set active type based on URL parameter
  useEffect(() => {
    if (urlType && ['STUDENT', 'TEACHER', 'PARENT'].includes(urlType)) {
      setActiveType(urlType);
    }
  }, [urlType]);

  const setPortalUser = usePortalStore((s) => s.setPortalUser);
  const setAuthUser = useAuthStore((s) => s.setUser);

  const [activeType, setActiveType] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [demoInstitute, setDemoInstitute] = useState('school');
  const [loginMode, setLoginMode] = useState('single'); // 'single' or 'dual'

  // Dual account state
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [showAccountPass, setShowAccountPass] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const activePt = PORTAL_TYPES.find((p) => p.type === activeType);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  // Fill demo account
  const fillDemoAccount = (account) => {
    setActiveType(account.role);
    setValue('email', account.email);
    setValue('password', account.password || '');

    if (!account.password) {
      // No password means dual account
      setLoginMode('dual');
    } else {
      setLoginMode('single');
    }

    toast.info(`${account.role} credentials filled!`);
  };

  const completeLogin = async (user, accessToken) => {
    if (!user || !user.id) {
      toast.error('Invalid user data');
      return false;
    }

    // Verify user type matches selected portal
    if (user.user_type !== activeType) {
      toast.error(`This account is not a ${activeType.toLowerCase()} account. Please select correct portal.`);
      return false;
    }

    // ✅ IMPORTANT: Clear ALL existing cookies first
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName);
    });

    // Set portal specific cookies
    Cookies.set('portal_token', accessToken, { expires: 7, path: '/' });
    Cookies.set('portal_type', user.user_type, { expires: 7, path: '/' });
    Cookies.set('user_type', user.user_type, { expires: 7, path: '/' });

    // Also set institute info if available
    const instType = user.institute?.institute_type || user.institute_type || 'school';
    Cookies.set('institute_type', instType, { expires: 7, path: '/' });

    // Set auth store
    setAuthUser(user, accessToken);

    // Set in portal store
    setPortalUser(
      user,
      user.user_type,
      instType
    );

    toast.success(`Welcome, ${user.first_name}!`);

    // Redirect based on user type
    const redirectPaths = {
      STUDENT: '/student/dashboard',
      PARENT: '/parent/dashboard',
      TEACHER: '/teacher/dashboard'
    };

    const redirectPath = redirectPaths[user.user_type] || '/portal';
    console.log('✅ Portal login successful, redirecting to:', redirectPath);
    router.replace(redirectPath);
    return true;
  };

  // Single Account Login
  const onSingleLogin = async (data) => {
    try {
      setLoading(true);

      const response = await authService.login({
        email: data.email,
        password: data.password
      });

      if (response?.user) {
        await completeLogin(response.user, response.accessToken);
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Dual Account Login
  const onDualLogin = async (data) => {
    try {
      setLoading(true);
      setTempEmail(data.email);

      const response = await authService.login({ email: data.email });

      console.log('🔍 Dual response:', response);

      // Check both property names
      const requiresSelection = response?.requiresSelection || response?.requiresAccountSelection;
      const accountsList = response?.accounts || [];

      if (requiresSelection && accountsList.length > 0) {
        // Filter accounts by selected portal type
        const filteredAccounts = accountsList.filter(acc => acc.user_type === activeType);

        if (filteredAccounts.length === 0) {
          toast.error(`No ${activeType.toLowerCase()} account found with this email`);
          setLoading(false);
          return;
        }

        if (filteredAccounts.length === 1) {
          // Single account of this type
          setSelectedAccount(filteredAccounts[0]);
          setShowPasswordDialog(true);
          setLoading(false);
          return;
        }

        // Multiple accounts of this type (rare but possible)
        setAccounts(filteredAccounts);
        setShowAccountSelector(true);
        setLoading(false);
        return;
      }

      // Handle single account that needs password
      if (response?.requiresPassword && response?.account) {
        if (response.account.user_type === activeType) {
          setSelectedAccount(response.account);
          setShowPasswordDialog(true);
        } else {
          toast.error(`This is a ${response.account.user_type.toLowerCase()} account. Please select ${activeType.toLowerCase()} portal.`);
        }
        setLoading(false);
        return;
      }

      toast.error(response?.message || 'No account found');
    } catch (err) {
      console.error('Dual login error:', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  // Handle account selection
  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setShowAccountSelector(false);
    setShowPasswordDialog(true);
  };

  // Handle password submission
  const handlePasswordSubmit = async () => {
    if (!accountPassword) {
      toast.error('Please enter password');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.loginWithAccount({
        accountId: selectedAccount.id,
        password: accountPassword
      });

      if (response?.user) {
        setShowPasswordDialog(false);
        setAccountPassword('');
        await completeLogin(response.user, response.accessToken);
      } else {
        toast.error('Invalid password');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    if (loginMode === 'dual') {
      await onDualLogin(data);
    } else {
      await onSingleLogin(data);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: activeType === 'PARENT'
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)'
          : activeType === 'TEACHER'
            ? 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 50%, #1d4ed8 100%)'
            : 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)',
        transition: 'background 0.5s ease',
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-5 gap-8 items-center">
          {/* LEFT Panel */}
          <div className="lg:col-span-2 text-white hidden lg:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">The Clouds Academy</p>
                <p className="text-white/60 text-xs">Student Information System</p>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold mb-3 leading-tight">
              {activePt.label}
            </h1>
            <p className="text-white/70 text-sm mb-7">{activePt.tagline}</p>

            <ul className="space-y-3">
              {activePt.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT Login Card */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Portal type switcher */}
            <div className="grid grid-cols-3">
              {PORTAL_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isActive = pt.type === activeType;
                return (
                  <button
                    key={pt.type}
                    onClick={() => setActiveType(pt.type)}
                    className={`flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all duration-200 ${isActive
                        ? `bg-gradient-to-r ${pt.gradient} text-white`
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    {pt.label}
                  </button>
                );
              })}
            </div>

            {/* Login Mode Tabs */}
            <div className="border-b px-6 pt-4">
              <Tabs defaultValue="single" onValueChange={setLoginMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <Users2 className="w-4 h-4" />
                    Single Account
                  </TabsTrigger>
                  <TabsTrigger value="dual" className="flex items-center gap-2">
                    <Users2 className="w-4 h-4" />
                    Multiple Accounts
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Sign in to {activePt.label}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {loginMode === 'dual'
                    ? 'Enter your email to see available accounts'
                    : 'Enter your credentials to login'}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      {...register('email')}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                {loginMode === 'single' && (
                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...register('password')}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                  </div>
                )}

                {loginMode === 'dual' && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                    <Users2 className="w-4 h-4 inline mr-2" />
                    For multiple accounts: Leave password blank. You'll select which account to use.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold py-5 bg-gradient-to-r ${activePt.gradient} text-white hover:opacity-90`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {loginMode === 'dual' ? 'Checking...' : 'Signing in...'}
                    </>
                  ) : (
                    loginMode === 'dual' ? 'Continue' : `Sign in to ${activePt.label}`
                  )}
                </Button>
              </form>

              {/* Quick Demo Login */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Quick Demo Login</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {INSTITUTE_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setDemoInstitute(tab.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${demoInstitute === tab.value
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS
                    .filter((a) => a.institute_type === demoInstitute)
                    .map((acc) => {
                      const rs = ROLE_STYLES[acc.role];
                      const Icon = rs.icon;
                      return (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => fillDemoAccount(acc)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white hover:shadow-sm transition-all text-center group"
                        >
                          <div className={`w-8 h-8 rounded-lg ${rs.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${rs.ic}`} />
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">{acc.name.split(' ')[0]}</p>
                          <p className="text-[10px] text-slate-400 capitalize leading-none">{acc.role.toLowerCase()}</p>
                          {acc.password ? (
                            <p className="text-[9px] text-slate-300 leading-none font-mono">{acc.password}</p>
                          ) : (
                            <p className="text-[9px] text-amber-500 leading-none">Dual Account</p>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Staff login link */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Are you a school staff member?{' '}
                  <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                    Staff Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Selection Modal */}
      <AccountSelectionModal
        open={showAccountSelector}
        onOpenChange={setShowAccountSelector}
        accounts={accounts}
        email={tempEmail}
        onSelectAccount={handleSelectAccount}
      />

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              Enter password for {selectedAccount?.display_role} account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`w-10 h-10 rounded-lg ${ROLE_ICONS[selectedAccount?.user_type]?.color || 'bg-slate-100'} flex items-center justify-center`}>
                {selectedAccount?.user_type === 'STUDENT' && <BookOpen size={20} />}
                {selectedAccount?.user_type === 'TEACHER' && <Briefcase size={20} />}
                {selectedAccount?.user_type === 'PARENT' && <Users size={20} />}
                {!selectedAccount?.user_type && <Users2 size={20} />}
              </div>
              <div>
                <p className="font-medium">{selectedAccount?.display_name}</p>
                <p className="text-xs text-slate-500">{selectedAccount?.display_role}</p>
                <p className="text-xs text-slate-400 font-mono">{selectedAccount?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showAccountPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-9 pr-10"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAccountPass(!showAccountPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showAccountPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button onClick={handlePasswordSubmit} disabled={!accountPassword} className="w-full">
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}