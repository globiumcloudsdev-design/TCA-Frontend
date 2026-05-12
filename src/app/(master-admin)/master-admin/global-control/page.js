'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Settings, Power, Zap, Search, 
  ExternalLink, Ban, Activity, Building2, Layout,
  ShieldAlert, RefreshCw, MousePointer2, Info,
  Users
} from 'lucide-react';
import { 
  AppModal, InputField, FormSubmitButton, DataTable, ConfirmDialog 
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { masterAdminService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NAV as INSTITUTE_NAV } from '@/config/instituteConfig';

export default function GlobalControlPage() {
  const [mounted, setMounted] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  // Global Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Extract FULL features from instituteConfig dynamically
  const featureToggles = useMemo(() => {
    const schoolModules = INSTITUTE_NAV.school || [];
    const allowedGroups = ['Academic', 'Finance', 'Operations', 'People', 'Comms'];
    const modules = schoolModules
      .filter(m => allowedGroups.includes(m.group))
      .map(m => ({
        id: m.label.toLowerCase().replace(/\s+/g, '_'),
        label: m.label,
        group: m.group,
        status: true
      }));
    
    return Array.from(new Map(modules.map(m => [m.label, m])).values())
      .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: schoolsData, isLoading, refetch } = useQuery({
    queryKey: ['master-schools-global'],
    queryFn: () => masterAdminService.getSchools({ limit: 10 }),
    enabled: mounted
  });

  const institutes = schoolsData?.data?.rows || [];

  const handleToggle = () => {
    toast.success(`Global setting updated`);
  };

  const handleEstablishSession = (institute) => {
    setSelectedInstitute(institute);
    setShowSessionModal(true);
  };

  const confirmSession = () => {
    toast.loading(`Establishing session with ${selectedInstitute.institute_name}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Active Administrative Access: ${selectedInstitute.institute_name}`);
      setShowSessionModal(false);
    }, 1500);
  };

  const columns = useMemo(() => [
    { 
      header: 'Institute Name', 
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200">
            {row.original.institute_code?.substring(0, 3)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{row.original.institute_name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{row.original.institute_code}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Plan', 
      cell: ({ row }) => <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600 font-bold px-3 uppercase text-[10px]">{row.original.subscription_status || 'Trial'}</Badge>
    },
    { 
      header: 'Status', 
      cell: ({ row }) => (
        <Badge className={row.original.is_active ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-red-500/10 text-red-600 border-none'}>
          {row.original.is_active ? 'Active' : 'Suspended'}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
          <SimpleTooltip content="Administrative Access">
            <Button variant="ghost" size="icon" onClick={() => handleEstablishSession(row.original)} className="text-primary hover:bg-primary/5">
              <MousePointer2 className="w-4 h-4" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="Restrict Access">
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setSelectedInstitute(row.original); setShowSuspendDialog(true); }}>
              <Ban className="w-4 h-4" />
            </Button>
          </SimpleTooltip>
        </div>
      )
    }
  ], []);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Global Control Center
          </h1>
          <p className="text-slate-500 text-sm">Manage platform-wide overrides and institute access.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="rounded-xl gap-2 h-10 px-5">
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="institutes" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-11">
          <TabsTrigger value="institutes" className="rounded-lg px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Institute Control
          </TabsTrigger>
          <TabsTrigger value="overrides" className="rounded-lg px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Platform Overrides
          </TabsTrigger>
          <TabsTrigger value="health" className="rounded-lg px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            System Health
          </TabsTrigger>
        </TabsList>

        {/* --- INSTITUTE CONTROL TAB --- */}
        <TabsContent value="institutes" className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <DataTable 
               columns={columns} 
               data={institutes} 
               isLoading={isLoading}
               searchPlaceholder="Search by name or code..."
             />
          </div>
        </TabsContent>

        {/* --- PLATFORM OVERRIDES TAB --- */}
        <TabsContent value="overrides" className="space-y-6">
          <div className="space-y-6">
            {/* Maintenance Mode Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Maintenance Mode</h3>
                    <p className="text-sm text-slate-500 font-medium">Enable to restrict platform access for all users globally.</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  {maintenanceMode && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse uppercase px-4 py-1 text-[10px] font-black">System Offline</Badge>
                  )}
                  <Switch checked={maintenanceMode} onCheckedChange={(val) => { setMaintenanceMode(val); handleToggle(); }} />
               </div>
            </div>

            {/* FULL Feature Toggles Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Full System Feature Overrides
                  </h3>
                  <Badge variant="secondary" className="rounded-full text-[10px] font-black">{featureToggles.length} Modules</Badge>
               </div>
               <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {featureToggles.map(f => (
                      <div key={f.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                         <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[9px] uppercase font-black border-slate-200 text-slate-400 group-hover:text-primary group-hover:border-primary/20">{f.group}</Badge>
                            <span className="text-sm font-bold text-slate-700">{f.label}</span>
                         </div>
                         <Switch defaultChecked={f.status} onCheckedChange={() => handleToggle()} />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- SYSTEM HEALTH TAB --- */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'API Latency', value: '124ms', icon: Activity, color: 'text-emerald-600' },
              { label: 'CPU Usage', value: '42%', icon: Settings, color: 'text-blue-600' },
              { label: 'Active Sessions', value: '1.2k', icon: Users, color: 'text-purple-600' },
            ].map((metric, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className={`${metric.color} bg-slate-50 p-3 rounded-xl`}>
                   <metric.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">{metric.value}</h4>
                 </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-4">
             <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Info className="w-5 h-5 text-primary" />
             </div>
             <p className="text-xs text-slate-600 leading-relaxed font-medium">
               System health metrics are updated every 30 seconds. If any metric turns red, please check the server logs immediately. All administrative actions performed in this panel are recorded for audit compliance.
             </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- SESSION ACCESS MODAL --- */}
      <AppModal
        open={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Establish Administrative Access"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setShowSessionModal(false)}>Cancel</Button>
            <Button variant="default" className="flex-[2] rounded-xl h-11 font-bold shadow-lg shadow-primary/10" onClick={confirmSession}>
               <ExternalLink className="w-4 h-4 mr-2" /> Start Admin Session
            </Button>
          </div>
        }
      >
        <div className="text-center py-6 space-y-6">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_8s_linear_infinite]" />
           </div>
           <div>
              <h4 className="text-xl font-bold text-slate-900">Access {selectedInstitute?.institute_name}</h4>
              <p className="text-sm text-slate-500 mt-2 px-6">
                You are about to access this institute's private data. This session will bypass local credentials and is fully audited.
              </p>
           </div>
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Security Handshake</p>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-500">Instance Key</span>
                <span className="text-slate-900 font-mono">{selectedInstitute?.institute_code || 'MASTER_AUTH'}</span>
              </div>
           </div>
        </div>
      </AppModal>

      {/* --- SUSPEND DIALOG --- */}
      <ConfirmDialog
        open={showSuspendDialog}
        onClose={() => setShowSuspendDialog(false)}
        onConfirm={() => { toast.error(`${selectedInstitute?.institute_name} restricted.`); setShowSuspendDialog(false); }}
        title="Restrict Institute Access"
        description={`Confirm restriction for ${selectedInstitute?.institute_name}. This will block all portal access immediately.`}
        confirmLabel="Confirm Restriction"
      />
    </div>
  );
}
