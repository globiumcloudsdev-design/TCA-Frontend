// // // frontend/src/app/login/page.jsx (UPDATED WITH 3 PORTAL BUTTONS)

// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { useForm } from 'react-hook-form';
// // import { z } from 'zod';
// // import { zodResolver } from '@hookform/resolvers/zod';
// // import { toast } from 'sonner';
// // import Cookies from 'js-cookie';
// // import Link from 'next/link';
// // import {
// //   Eye, EyeOff, GraduationCap, Zap, User, Building2,
// //   Users, BookOpen, Briefcase, UserCircle, Loader2, Lock,
// //   Mail, KeyRound, UserCheck, Users2, School, UserCog, UserPlus
// // } from 'lucide-react';
// // import { authService } from '@/services';
// // import useAuthStore from '@/store/authStore';
// // import AccountSelectionModal from '@/components/auth/AccountSelectionModal';

// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import { Label } from '@/components/ui/label';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// // import { Card, CardContent } from '@/components/ui/card';

// // const ROLE_ICONS = {
// //   MASTER_ADMIN: { icon: UserCircle, color: 'bg-purple-100 text-purple-600', label: 'Master Admin' },
// //   INSTITUTE_ADMIN: { icon: Building2, color: 'bg-blue-100 text-blue-600', label: 'Institute Admin' },
// //   BRANCH_ADMIN: { icon: Building2, color: 'bg-cyan-100 text-cyan-600', label: 'Branch Admin' },
// //   TEACHER: { icon: Briefcase, color: 'bg-blue-100 text-blue-600', label: 'Teacher' },
// //   STUDENT: { icon: BookOpen, color: 'bg-emerald-100 text-emerald-600', label: 'Student' },
// //   PARENT: { icon: Users, color: 'bg-indigo-100 text-indigo-600', label: 'Parent' },
// //   STAFF: { icon: User, color: 'bg-slate-100 text-slate-600', label: 'Staff' },
// // };

// // // Portal buttons configuration
// // const PORTAL_BUTTONS = [
// //   {
// //     type: 'STUDENT',
// //     label: 'Student Portal',
// //     icon: BookOpen,
// //     color: 'from-emerald-600 to-teal-600',
// //     bg: 'bg-emerald-50',
// //     text: 'text-emerald-600',
// //     border: 'border-emerald-200',
// //     hover: 'hover:border-emerald-400',
// //     description: 'View attendance, fees, results & timetable'
// //   },
// //   {
// //     type: 'TEACHER',
// //     label: 'Teacher Portal',
// //     icon: Briefcase,
// //     color: 'from-blue-600 to-sky-600',
// //     bg: 'bg-blue-50',
// //     text: 'text-blue-600',
// //     border: 'border-blue-200',
// //     hover: 'hover:border-blue-400',
// //     description: 'Manage classes, attendance & assignments'
// //   },
// //   {
// //     type: 'PARENT',
// //     label: 'Parent Portal',
// //     icon: Users,
// //     color: 'from-indigo-600 to-violet-600',
// //     bg: 'bg-indigo-50',
// //     text: 'text-indigo-600',
// //     border: 'border-indigo-200',
// //     hover: 'hover:border-indigo-400',
// //     description: 'Track child progress & fee status'
// //   },
// // ];

// // const QUICK_LOGINS = [
// //   { label: 'School Admin', email: 'hafizshoaibraza180@gmail.com', password: 'Shoaib0320', type: 'INSTITUTE_ADMIN' },
// //   { label: 'Master Admin', email: 'admin@thecloudsacademy.com', password: 'Admin@TCA2026!', type: 'MASTER_ADMIN' },
// // ];

// // export default function LoginPage() {
// //   const router = useRouter();
// //   const setUser = useAuthStore((s) => s.setUser);
// //   const [loading, setLoading] = useState(false);
// //   const [showPass, setShowPass] = useState(false);
// //   const [loginMode, setLoginMode] = useState('single');

// //   const [showAccountSelector, setShowAccountSelector] = useState(false);
// //   const [accounts, setAccounts] = useState([]);
// //   const [selectedAccount, setSelectedAccount] = useState(null);
// //   const [showPasswordDialog, setShowPasswordDialog] = useState(false);
// //   const [accountPassword, setAccountPassword] = useState('');
// //   const [showAccountPass, setShowAccountPass] = useState(false);
// //   const [tempEmail, setTempEmail] = useState('');

// //   const { register: registerSingle, handleSubmit: handleSubmitSingle, setValue: setValueSingle, formState: { errors: errorsSingle } } = useForm({
// //     defaultValues: { email: '', password: '' }
// //   });

// //   const { register: registerDual, handleSubmit: handleSubmitDual, setValue: setValueDual, formState: { errors: errorsDual } } = useForm({
// //     defaultValues: { email: '' }
// //   });

// //   // Navigate to portal login with preselected type
// //   const navigateToPortal = (portalType) => {
// //     router.push(`/portal-login?type=${portalType}`);
// //   };

// //   const fillCredentials = (cred) => {
// //     if (loginMode === 'single') {
// //       setValueSingle('email', cred.email);
// //       setValueSingle('password', cred.password);
// //     } else {
// //       setValueDual('email', cred.email);
// //     }
// //     toast.info(`Filled ${cred.label} credentials`);
// //   };

// //   const completeLogin = async (user, accessToken) => {
// //     if (!user || !user.id) {
// //       toast.error('Invalid user data');
// //       return;
// //     }

// //     // ✅ Clear ALL existing cookies first
// //     Cookies.remove('access_token');
// //     Cookies.remove('role_code');
// //     Cookies.remove('institute_type');
// //     Cookies.remove('user_type');
// //     Cookies.remove('portal_token');
// //     Cookies.remove('portal_type');
// //     Cookies.remove('selected_account_id');

// //     // ✅ Set auth store
// //     setUser(user, accessToken);

// //     // ✅ Set correct cookies based on user type
// //     Cookies.set('access_token', accessToken, { expires: 7 });
// //     Cookies.set('role_code', user.user_type, { expires: 7 });  // ← Use user_type, not role_code
// //     Cookies.set('user_type', user.user_type, { expires: 7 });

// //     // Set institute type only if user has institute
// //     const instType = user.institute?.institute_type || user.institute_type || null;
// //     if (instType) {
// //       Cookies.set('institute_type', instType, { expires: 7 });
// //     } else {
// //       Cookies.remove('institute_type');
// //     }

// //     // For portal users, also set portal_token and portal_type
// //     if (user.user_type === 'STUDENT' || user.user_type === 'PARENT' || user.user_type === 'TEACHER') {
// //       Cookies.set('portal_token', accessToken, { expires: 7 });
// //       Cookies.set('portal_type', user.user_type, { expires: 7 });
// //     } else {
// //       Cookies.remove('portal_token');
// //       Cookies.remove('portal_type');
// //     }

// //     toast.success(`Welcome, ${user.first_name}!`);

// //     // Redirect based on user type
// //     const role = user.user_type;
// //     if (role === 'MASTER_ADMIN') {
// //       router.replace('/master-admin');
// //     } else if (role === 'INSTITUTE_ADMIN') {
// //       router.replace(`/${instType}/dashboard`);
// //     } else if (role === 'TEACHER') {
// //       router.replace('/teacher/dashboard');
// //     } else if (role === 'STUDENT') {
// //       router.replace('/student/dashboard');
// //     } else if (role === 'PARENT') {
// //       router.replace('/parent/dashboard');
// //     } else if (role === 'STAFF') {
// //       router.replace(`/${instType}/dashboard`);
// //     } else {
// //       router.replace('/dashboard');
// //     }
// //   };


// //   const onSingleLogin = async (data) => {
// //     try {
// //       setLoading(true);

// //       const response = await authService.login({
// //         email: data.email,
// //         password: data.password
// //       });

// //       if (response?.user) {
// //         await completeLogin(response.user, response.accessToken);
// //       } else {
// //         toast.error('Invalid email or password');
// //       }
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || 'Login failed');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const onDualLogin = async (data) => {
// //     try {
// //       setLoading(true);
// //       setTempEmail(data.email);

// //       const response = await authService.login({ email: data.email });

// //       const requiresSelection = response?.requiresSelection || response?.requiresAccountSelection;
// //       const accountsList = response?.accounts || [];

// //       if (requiresSelection && accountsList.length > 0) {
// //         setAccounts(accountsList);
// //         setShowAccountSelector(true);
// //         setLoading(false);
// //         return;
// //       }

// //       if (response?.requiresPassword && response?.account) {
// //         setSelectedAccount(response.account);
// //         setShowPasswordDialog(true);
// //         setLoading(false);
// //         return;
// //       }

// //       if (response?.user) {
// //         await completeLogin(response.user, response.accessToken);
// //         return;
// //       }

// //       toast.error(response?.message || 'No account found');
// //     } catch (err) {
// //       console.error('❌ Dual login error:', err);
// //       toast.error(err?.response?.data?.message || 'Failed to fetch accounts');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSelectAccount = (account) => {
// //     setSelectedAccount(account);
// //     setShowAccountSelector(false);
// //     setShowPasswordDialog(true);
// //   };

// //   const handlePasswordSubmit = async () => {
// //     if (!accountPassword) {
// //       toast.error('Please enter password');
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const response = await authService.loginWithAccount({
// //         accountId: selectedAccount.id,
// //         password: accountPassword
// //       });

// //       if (response?.user) {
// //         setShowPasswordDialog(false);
// //         setAccountPassword('');
// //         await completeLogin(response.user, response.accessToken);
// //       } else {
// //         toast.error('Invalid password');
// //       }
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || 'Invalid password');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <>
// //       <div className="flex min-h-screen items-center justify-center py-8 bg-gradient-to-br from-slate-50 to-slate-100">
// //         <div className="w-full max-w-md">
// //           {/* Logo */}
// //           <div className="mb-8 flex flex-col items-center gap-2 text-center">
// //             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
// //               <GraduationCap size={32} className="text-primary" />
// //             </div>
// //             <h1 className="text-3xl font-bold tracking-tight">The Clouds Academy</h1>
// //             <p className="text-sm text-muted-foreground">Student Information System</p>
// //           </div>

// //           {/* 3 Portal Buttons */}
// //           <div className="grid grid-cols-3 gap-3 mb-6">
// //             {PORTAL_BUTTONS.map((portal) => {
// //               const Icon = portal.icon;
// //               return (
// //                 <button
// //                   key={portal.type}
// //                   onClick={() => navigateToPortal(portal.type)}
// //                   className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 ${portal.border} ${portal.bg} ${portal.hover} transition-all hover:shadow-lg group`}
// //                 >
// //                   <div className={`w-12 h-12 rounded-xl ${portal.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
// //                     <Icon className={`w-6 h-6 ${portal.text}`} />
// //                   </div>
// //                   <span className={`text-xs font-semibold ${portal.text}`}>{portal.label}</span>
// //                   <span className="text-[10px] text-slate-400 text-center hidden sm:block">{portal.description.split(' ').slice(0, 3).join(' ')}...</span>
// //                 </button>
// //               );
// //             })}
// //           </div>

// //           <div className="rounded-xl border bg-card shadow-sm">
// //             <Tabs defaultValue="single" onValueChange={setLoginMode} className="w-full">
// //               <TabsList className="grid w-full grid-cols-2 rounded-t-xl rounded-b-none border-b">
// //                 <TabsTrigger value="single" className="flex items-center gap-2 py-3">
// //                   <UserCheck className="w-4 h-4" />
// //                   Single Account
// //                 </TabsTrigger>
// //                 <TabsTrigger value="dual" className="flex items-center gap-2 py-3">
// //                   <Users2 className="w-4 h-4" />
// //                   Multiple Accounts
// //                 </TabsTrigger>
// //               </TabsList>

// //               <TabsContent value="single" className="p-6">
// //                 <form onSubmit={handleSubmitSingle(onSingleLogin)} className="space-y-4">
// //                   <div>
// //                     <Label className="text-sm font-medium mb-1.5 block">
// //                       <Mail className="w-4 h-4 inline mr-2" />
// //                       Email Address
// //                     </Label>
// //                     <Input
// //                       {...registerSingle('email', { required: 'Email is required' })}
// //                       type="email"
// //                       placeholder="you@example.com"
// //                       disabled={loading}
// //                     />
// //                     {errorsSingle.email && <p className="text-xs text-destructive mt-1">{errorsSingle.email.message}</p>}
// //                   </div>

// //                   <div>
// //                     <div className="flex items-center justify-between mb-1.5">
// //                       <Label className="text-sm font-medium">
// //                         <KeyRound className="w-4 h-4 inline mr-2" />
// //                         Password
// //                       </Label>
// //                       <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
// //                         Forgot password?
// //                       </a>
// //                     </div>
// //                     <div className="relative">
// //                       <input
// //                         {...registerSingle('password', { required: 'Password is required' })}
// //                         type={showPass ? 'text' : 'password'}
// //                         placeholder="••••••••"
// //                         className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
// //                         disabled={loading}
// //                       />
// //                       <button
// //                         type="button"
// //                         onClick={() => setShowPass(!showPass)}
// //                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
// //                       >
// //                         {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
// //                       </button>
// //                     </div>
// //                     {errorsSingle.password && <p className="text-xs text-destructive mt-1">{errorsSingle.password.message}</p>}
// //                   </div>

// //                   <Button type="submit" disabled={loading} className="w-full">
// //                     {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
// //                     Sign In
// //                   </Button>
// //                 </form>
// //               </TabsContent>

// //               <TabsContent value="dual" className="p-6">
// //                 <form onSubmit={handleSubmitDual(onDualLogin)} className="space-y-4">
// //                   <div>
// //                     <Label className="text-sm font-medium mb-1.5 block">
// //                       <Mail className="w-4 h-4 inline mr-2" />
// //                       Email Address
// //                     </Label>
// //                     <Input
// //                       {...registerDual('email', { required: 'Email is required' })}
// //                       type="email"
// //                       placeholder="you@example.com"
// //                       disabled={loading}
// //                     />
// //                     {errorsDual.email && <p className="text-xs text-destructive mt-1">{errorsDual.email.message}</p>}
// //                   </div>

// //                   <div className="bg-muted/30 rounded-lg p-3 text-sm">
// //                     <p className="text-muted-foreground">
// //                       <Users2 className="w-4 h-4 inline mr-1" />
// //                       <strong>For multiple accounts:</strong> Leave password blank. You'll select which account to use.
// //                     </p>
// //                   </div>

// //                   <Button type="submit" disabled={loading} className="w-full">
// //                     {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
// //                     Continue
// //                   </Button>
// //                 </form>
// //               </TabsContent>
// //             </Tabs>
// //           </div>

// //           {/* Quick Login */}
// //           <div className="mt-5 rounded-xl border border-dashed bg-muted/40 p-4">
// //             <div className="mb-3 flex items-center gap-1.5">
// //               <Zap size={13} className="text-amber-500" />
// //               <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
// //                 Quick Login (Demo)
// //               </span>
// //             </div>
// //             <div className="flex flex-wrap gap-2">
// //               {QUICK_LOGINS.map((cred) => {
// //                 const roleInfo = ROLE_ICONS[cred.type];
// //                 const IconComp = roleInfo?.icon || User;
// //                 return (
// //                   <button
// //                     key={cred.email}
// //                     type="button"
// //                     onClick={() => fillCredentials(cred)}
// //                     className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${roleInfo?.color || 'bg-slate-100 text-slate-700'} border-current/20 hover:shadow-sm`}
// //                     disabled={loading}
// //                   >
// //                     <IconComp size={14} />
// //                     <span>{cred.label}</span>
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <AccountSelectionModal
// //         open={showAccountSelector}
// //         onOpenChange={setShowAccountSelector}
// //         accounts={accounts}
// //         email={tempEmail}
// //         onSelectAccount={handleSelectAccount}
// //       />

// //       <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
// //         <DialogContent className="sm:max-w-sm">
// //           <DialogHeader>
// //             <DialogTitle>Enter Password</DialogTitle>
// //             <DialogDescription>
// //               Enter password for {selectedAccount?.display_role} account
// //             </DialogDescription>
// //           </DialogHeader>

// //           <div className="space-y-4 py-4">
// //             <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
// //               <div className={`w-10 h-10 rounded-lg ${ROLE_ICONS[selectedAccount?.user_type]?.color || 'bg-slate-100'} flex items-center justify-center`}>
// //                 {(() => {
// //                   const IconComp = ROLE_ICONS[selectedAccount?.user_type]?.icon || UserCircle;
// //                   return <IconComp size={20} />;
// //                 })()}
// //               </div>
// //               <div>
// //                 <p className="font-medium">{selectedAccount?.display_name}</p>
// //                 <p className="text-xs text-muted-foreground">{selectedAccount?.display_role}</p>
// //                 <p className="text-xs text-muted-foreground font-mono">{selectedAccount?.email}</p>
// //               </div>
// //             </div>

// //             <div className="space-y-2">
// //               <Label>Password</Label>
// //               <div className="relative">
// //                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
// //                 <Input
// //                   type={showAccountPass ? 'text' : 'password'}
// //                   placeholder="Enter your password"
// //                   className="pl-9 pr-10"
// //                   value={accountPassword}
// //                   onChange={(e) => setAccountPassword(e.target.value)}
// //                   onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
// //                   autoFocus
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowAccountPass(!showAccountPass)}
// //                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
// //                 >
// //                   {showAccountPass ? <EyeOff size={15} /> : <Eye size={15} />}
// //                 </button>
// //               </div>
// //             </div>

// //             <Button onClick={handlePasswordSubmit} disabled={!accountPassword} className="w-full">
// //               Sign In
// //             </Button>
// //           </div>
// //         </DialogContent>
// //       </Dialog>
// //     </>
// //   );
// // }



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
  { label: 'School Admin', email: 'hafizshoaibraza180@gmail.com', password: 'Shoaib0320', type: 'INSTITUTE_ADMIN' },
  { label: 'Master Admin', email: 'admin@thecloudsacademy.com', password: 'Admin@TCA2026!', type: 'MASTER_ADMIN' },
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
    if (role === 'MASTER_ADMIN') router.replace('/master-admin');
    else if (role === 'INSTITUTE_ADMIN' || role === 'STAFF') router.replace(`/${instType}/dashboard`);
    else if (role === 'TEACHER') router.replace('/teacher/dashboard');
    else if (role === 'STUDENT') router.replace('/student/dashboard');
    else if (role === 'PARENT') router.replace('/parent/dashboard');
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

        {/* Demo Quick Login */}
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