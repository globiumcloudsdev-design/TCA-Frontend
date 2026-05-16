'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Ghost, Search, Building2, UserCircle, 
  ArrowRight, ShieldAlert,
  Loader2, Info, Users, GraduationCap, 
  Briefcase, HeartHandshake, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { masterAdminService } from '@/services';
import useAuthStore from '@/store/authStore';
import usePortalStore from '@/store/portalStore';
import { getDashboardPath } from '@/utils/authUtils';
import { 
  PageHeader, DataTable, AppModal, 
  ConfirmDialog, AvatarWithInitials 
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const USER_TYPE_CONFIG = {
  MASTER_ADMIN: { label: 'Master Admin', icon: ShieldCheck, color: 'bg-purple-100 text-purple-700' },
  INSTITUTE_ADMIN: { label: 'Admin', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  BRANCH_ADMIN: { label: 'Branch Admin', icon: Building2, color: 'bg-indigo-100 text-indigo-700' },
  TEACHER: { label: 'Teacher', icon: Briefcase, color: 'bg-amber-100 text-amber-700' },
  STUDENT: { label: 'Student', icon: GraduationCap, color: 'bg-emerald-100 text-emerald-700' },
  PARENT: { label: 'Parent', icon: HeartHandshake, color: 'bg-rose-100 text-rose-700' },
  STAFF: { label: 'Staff', icon: Users, color: 'bg-slate-100 text-slate-700' },
};

export default function GhostModePage() {
  const setUser = useAuthStore((s) => s.setUser);
  const setPortalUser = usePortalStore((s) => s.setPortalUser);

  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [impersonateTarget, setImpersonateTarget] = useState(null);

  // 1. Fetch Institutes
  const { data: institutesData, isLoading: loadingInstitutes } = useQuery({
    queryKey: ['ghost-institutes', search],
    queryFn: () => masterAdminService.getSchools({ search, limit: 10 }),
  });

  const institutes = institutesData?.data?.rows || [];

  // 2. Fetch ALL Users of selected institute
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['ghost-users', selectedInstitute?.id, userSearch],
    queryFn: () => masterAdminService.getInstituteUsers(selectedInstitute.id, userSearch),
    enabled: !!selectedInstitute,
  });

  const users = usersData?.data || [];

  // 3. Impersonation Mutation
  const impersonateMutation = useMutation({
    mutationFn: (userId) => masterAdminService.impersonateUser(userId),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;
      
      // Save original session
      const currentToken = localStorage.getItem('accessToken');
      const currentUser = localStorage.getItem('user');
      
      localStorage.setItem('originalAdminToken', currentToken);
      localStorage.setItem('originalAdminUser', currentUser);
      
      // Clear all existing cookies like in portal-login/page.jsx
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach(cookieName => {
        Cookies.remove(cookieName);
      });
      
      // Set common cookies
      Cookies.set('access_token', accessToken, { expires: 7 });
      Cookies.set('role_code', user.user_type, { expires: 7 });
      Cookies.set('user_type', user.user_type, { expires: 7 });
      
      const instType = user.institute?.institute_type || user.institute_type || 'school';
      Cookies.set('institute_type', instType, { expires: 7 });

      // Portal Specific Logic (Student, Teacher, Parent)
      if (['STUDENT', 'TEACHER', 'PARENT'].includes(user.user_type)) {
        Cookies.set('portal_token', accessToken, { expires: 7, path: '/' });
        Cookies.set('portal_type', user.user_type, { expires: 7, path: '/' });
        
        setPortalUser(user, user.user_type, instType);
      }
      
      // Set auth store
      setUser(user, accessToken);
      
      toast.success(`Entering Ghost Mode as ${user.first_name}...`);
      
      const redirectPath = getDashboardPath(user);
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Impersonation failed'),
  });

  const handleGhostLogin = (user) => {
    setImpersonateTarget(user);
  };

  // Columns for Institute Table
  const instituteColumns = [
    {
      header: 'Institute',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{row.original.institute_name}</p>
            <p className="text-[10px] text-slate-500 font-mono">{row.original.institute_code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'City',
      accessorKey: 'institute_city',
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={cn(
          "rounded-full px-2 py-0.5 text-[10px] border-none font-bold uppercase tracking-wider",
          row.original.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
        )}>
          {row.original.is_active ? 'Active' : 'Suspended'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button 
          variant={selectedInstitute?.id === row.original.id ? "default" : "outline"}
          size="sm"
          className="rounded-lg h-8 gap-2 font-bold"
          onClick={() => setSelectedInstitute(row.original)}
        >
          {selectedInstitute?.id === row.original.id ? 'Selected' : 'Select'}
          <ArrowRight className="w-3 h-3" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ghost Mode (Impersonation)" 
        description="Access any account (Admin, Teacher, Student, Parent) for troubleshooting."
        icon={Ghost}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Institute */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> 1. Select Institute
              </h3>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search school..."
                  className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <DataTable 
                  columns={instituteColumns}
                  data={institutes}
                  isLoading={loadingInstitutes}
                  hidePagination
                />
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Audit Alert</p>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                Ghost Mode actions are recorded. Use only for support.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Select User */}
        <div className="lg:col-span-8">
          {!selectedInstitute ? (
            <div className="h-full min-h-[500px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50/30">
               <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                 <Users className="w-8 h-8" />
               </div>
               <div className="text-center">
                 <h4 className="font-bold text-slate-600">No Institute Selected</h4>
                 <p className="text-sm">Select an institute to view all accounts.</p>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">2. Select Account</h3>
                      <p className="text-[11px] text-slate-500 font-medium italic">{selectedInstitute.institute_name}</p>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search name, email, GR..."
                      className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 transition-all"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
               </div>

               <div className="flex-1 p-4 overflow-y-auto max-h-[600px]">
                 {loadingUsers ? (
                   <div className="flex flex-col items-center justify-center h-64 space-y-3">
                     <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     <p className="text-sm text-slate-500 font-medium">Fetching all accounts...</p>
                   </div>
                 ) : users.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 space-y-3">
                     <Info className="w-10 h-10 text-slate-300" />
                     <p className="text-sm text-slate-500 font-medium">No accounts found.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                     {users.map(user => {
                       const config = USER_TYPE_CONFIG[user.user_type] || USER_TYPE_CONFIG.STAFF;
                       const TypeIcon = config.icon;
                       return (
                         <div key={user.id} className="group p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all flex flex-col justify-between">
                            <div className="flex items-start gap-2.5">
                              <AvatarWithInitials 
                                firstName={user.first_name}
                                lastName={user.last_name}
                                size="sm"
                              />
                              <div className="min-w-0 flex-1">
                                 <p className="font-bold text-slate-900 truncate text-xs">{user.first_name} {user.last_name}</p>
                                 <div className="flex items-center gap-1.5 mt-1">
                                    <Badge className={cn("text-[8px] px-1.5 h-4 border-none flex items-center gap-1", config.color)}>
                                      <TypeIcon className="w-2.5 h-2.5" />
                                      {config.label}
                                    </Badge>
                                    {!user.is_active && <Badge variant="destructive" className="text-[8px] px-1.5 h-4">Inactive</Badge>}
                                 </div>
                                 <p className="text-[9px] text-slate-400 font-medium truncate mt-1">
                                   {user.email || user.registration_no || 'No ID'}
                                 </p>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              className="w-full rounded-lg h-8 mt-3 gap-1.5 font-bold text-[10px] uppercase hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary/20"
                              onClick={() => handleGhostLogin(user)}
                              disabled={!user.is_active}
                            >
                               <Ghost className="w-3 h-3" /> Ghost Login
                            </Button>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        open={!!impersonateTarget}
        onClose={() => setImpersonateTarget(null)}
        onConfirm={() => impersonateMutation.mutate(impersonateTarget.id)}
        loading={impersonateMutation.isPending}
        title="Initialize Ghost Session"
        description={`Entering as ${impersonateTarget?.first_name} (${impersonateTarget?.user_type}). All actions will be audited.`}
        confirmLabel="Proceed"
      />
    </div>
  );
}
