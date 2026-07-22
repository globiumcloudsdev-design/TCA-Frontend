'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Settings, Power, Zap, Search, 
  ExternalLink, Ban, Activity, Building2, Layout,
  ShieldAlert, RefreshCw, MousePointer2, Info,
  Users, Lock, Unlock, Database,
  Clock, Server
} from 'lucide-react';
import { 
  AppModal, InputField, DataTable, ConfirmDialog 
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { masterAdminService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NAV as INSTITUTE_NAV } from '@/config/instituteConfig';
import { cn } from '@/lib/utils';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function GlobalControlPage() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [pingHistory, setPingHistory] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Global Settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => masterAdminService.getGlobalSettings(),
    enabled: mounted
  });

  const backupMutation = useMutation({
    mutationFn: () => masterAdminService.triggerBackup(),
    onSuccess: (data) => {
      toast.success(data?.message || 'Database backup completed successfully!');
      // Assuming data returns the URL in data.url
      if (data?.data?.url) {
        window.open(data.data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to trigger backup');
    }
  });

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => masterAdminService.getSystemHealth(),
    refetchInterval: 5000,
    enabled: mounted
  });

  // Track ping history for fake latency simulation tied to refresh
  useEffect(() => {
    if (health) {
      setPingHistory(prev => {
        const newPing = { time: new Date().toLocaleTimeString(), ping: Math.floor(Math.random() * 40) + 20 };
        const updated = [...prev, newPing];
        return updated.length > 20 ? updated.slice(1) : updated;
      });
    }
  }, [health]);

  const maintenanceMode = settings?.data?.maintenance_mode || { enabled: false, message: '' };
  const featureOverrides = settings?.data?.feature_overrides || {};

  // 2. Mutations
  const updateSetting = useMutation({
    mutationFn: (data) => masterAdminService.updateGlobalSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['global-settings']);
      toast.success('Global configuration updated successfully');
    },
    onError: () => toast.error('Failed to update configuration')
  });

  // 3. Extract features from config
  const featureToggles = useMemo(() => {
    const schoolModules = INSTITUTE_NAV.school || [];
    const allowedGroups = ['Academic', 'Finance', 'Operations', 'People', 'Comms'];
    
    const modules = schoolModules
      .filter(m => allowedGroups.includes(m.group))
      .map(m => {
        const id = m.label.toLowerCase().replace(/\s+/g, '_');
        return {
          id,
          label: m.label,
          group: m.group,
          status: featureOverrides[id]?.enabled ?? true
        };
      });
    
    return Array.from(new Map(modules.map(m => [m.label, m])).values())
      .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
  }, [featureOverrides]);

  const handleMaintenanceToggle = (enabled) => {
    // Optimistic UI could be added, but for now let's just mutate
    updateSetting.mutate({
      key: 'maintenance_mode',
      value: { ...maintenanceMode, enabled }
    });
  };

  const handleFeatureToggle = (featureId, enabled) => {
    updateSetting.mutate({
      key: 'feature_overrides',
      value: {
        ...featureOverrides,
        [featureId]: { enabled }
      }
    });
  };

  // 4. Loading States
  const isUpdating = updateSetting.isPending;

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
               <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            Global System Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">Platform-wide overrides, maintenance management and health metrics.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={() => queryClient.invalidateQueries(['global-settings'])} className="rounded-xl gap-2 h-11 px-5 border-slate-200">
             <RefreshCw className={cn("w-4 h-4", settingsLoading && "animate-spin")} /> Refresh
           </Button>
           <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px]">
             v1.0.0 Stable
           </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overrides" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 border border-slate-200/50">
          <TabsTrigger value="overrides" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/5 transition-all">
            <Zap className="w-4 h-4 mr-2" /> System Overrides
          </TabsTrigger>
          <TabsTrigger value="health" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/5 transition-all">
            <Activity className="w-4 h-4 mr-2" /> System Health
          </TabsTrigger>
          <TabsTrigger value="backup" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/5 transition-all">
            <Database className="w-4 h-4 mr-2" /> Data Backup
          </TabsTrigger>
        </TabsList>

        {/* --- SYSTEM OVERRIDES TAB --- */}
        <TabsContent value="overrides" className="space-y-8 animate-in fade-in duration-500">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left: Maintenance & Critical Switches */}
            <div className="xl:col-span-1 space-y-6">
               <div className={cn(
                 "p-8 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden",
                 maintenanceMode.enabled 
                   ? "bg-rose-50/50 border-rose-200 shadow-2xl shadow-rose-500/10" 
                   : "bg-white border-slate-100 shadow-sm"
               )}>
                  <div className="flex items-start justify-between">
                     <div className={cn(
                       "p-4 rounded-2xl transition-colors duration-500",
                       maintenanceMode.enabled ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-400"
                     )}>
                        {maintenanceMode.enabled ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
                     </div>
                     <Switch 
                       checked={maintenanceMode.enabled} 
                       onCheckedChange={handleMaintenanceToggle}
                       disabled={isUpdating || settingsLoading}
                       className="scale-125 data-[state=checked]:bg-rose-500" 
                     />
                  </div>
                  
                  <div className="mt-8 space-y-4">
                     <h3 className="text-xl font-black text-slate-900">Maintenance Mode</h3>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        When enabled, dashboard access will be restricted. Login and Website remain accessible.
                     </p>
                     
                      {/* Maintenance Message Input */}
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance Message (Reason)</label>
                            <textarea 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                              placeholder="e.g. System update in progress..."
                              rows={2}
                              value={maintenanceMode.message}
                              onChange={(e) => {
                                updateSetting.mutate({
                                  key: 'maintenance_mode',
                                  value: { ...maintenanceMode, message: e.target.value }
                                });
                              }}
                            />
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Duration</label>
                            <div className="relative">
                               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                               <input 
                                 type="text"
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                 placeholder="e.g. 2 Hours, 30 Mins..."
                                 value={maintenanceMode.duration || ''}
                                 onChange={(e) => {
                                   updateSetting.mutate({
                                     key: 'maintenance_mode',
                                     value: { ...maintenanceMode, duration: e.target.value }
                                   });
                                 }}
                               />
                            </div>
                         </div>
                      </div>
                  </div>

                  {maintenanceMode.enabled && (
                    <div className="mt-6 p-4 bg-rose-500/5 border border-rose-200 rounded-2xl animate-pulse">
                       <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                          <ShieldAlert className="w-4 h-4" /> System Locked
                       </div>
                    </div>
                  )}
               </div>

               <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-6 relative overflow-hidden">
                  <Database className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12" />
                  <div className="relative">
                    <h4 className="text-lg font-black">Quick Actions</h4>
                    <div className="mt-6 space-y-3">
                       <Button variant="secondary" className="w-full justify-start gap-3 rounded-xl h-12 bg-white/10 hover:bg-white/20 border-none text-white font-bold">
                         <Database className="w-4 h-4" /> Trigger Backup
                       </Button>
                       <Button variant="secondary" className="w-full justify-start gap-3 rounded-xl h-12 bg-white/10 hover:bg-white/20 border-none text-white font-bold">
                         <Activity className="w-4 h-4" /> Clear System Cache
                       </Button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Granular Feature Toggles */}
            <div className="xl:col-span-2">
               <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                           <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                           <h3 className="font-black text-xl text-slate-900">Feature Overrides</h3>
                           <p className="text-sm text-slate-500 font-medium">Toggle specific modules globally across all institutes.</p>
                        </div>
                     </div>
                     <Badge className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {featureToggles.length} Modules
                     </Badge>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                     {featureToggles.map(f => (
                       <div key={f.id} className="flex justify-between items-center p-4 hover:bg-slate-50/80 rounded-[1.25rem] transition-all border border-transparent hover:border-slate-100 group">
                          <div className="flex items-center gap-4">
                             <div className="hidden sm:block">
                                <Badge variant="outline" className="text-[9px] uppercase font-black border-slate-200 text-slate-400 py-1 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                                   {f.group}
                                </Badge>
                             </div>
                             <span className="text-sm font-bold text-slate-700 tracking-tight">{f.label}</span>
                          </div>
                          <Switch 
                            checked={f.status} 
                            onCheckedChange={(val) => handleFeatureToggle(f.id, val)} 
                            disabled={isUpdating || settingsLoading}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- SYSTEM HEALTH TAB --- */}
        <TabsContent value="health" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'CPU Load', value: healthLoading ? '...' : `${health?.server?.cpuLoad}%`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'RAM Usage', value: healthLoading ? '...' : `${health?.server?.memory?.percent}%`, icon: Layout, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Active DB Conn.', value: healthLoading ? '...' : health?.database?.activeConnections, icon: Database, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Uptime', value: healthLoading ? '...' : health?.server?.uptime, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((metric, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                 <div className={cn(metric.bg, metric.color, "p-4 rounded-2xl group-hover:scale-110 transition-transform")}>
                   <metric.icon className="w-8 h-8" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{metric.label}</p>
                    <h4 className="text-3xl font-black text-slate-900 mt-2">{metric.value}</h4>
                 </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ping Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
               <div className="mb-6 flex items-center gap-3">
                 <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Server className="w-5 h-5" /></div>
                 <div>
                   <h3 className="text-lg font-black text-slate-900">API Latency</h3>
                   <p className="text-xs text-slate-500 font-medium">Real-time simulated ping to main API gateway</p>
                 </div>
               </div>
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={pingHistory}>
                     <defs>
                       <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="time" hide />
                     <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                     <RechartsTooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                       formatter={(value) => [`${value} ms`, 'Latency']}
                     />
                     <Area type="monotone" dataKey="ping" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPing)" isAnimationActive={false} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Server Details */}
            <div className="bg-slate-900 p-8 rounded-[2rem] flex flex-col space-y-6 shadow-xl relative overflow-hidden">
               <div className="absolute -right-8 -top-8 opacity-10">
                 <Server className="w-48 h-48 text-white" />
               </div>
               <div>
                 <h4 className="text-white font-black text-xl">Infrastructure</h4>
                 <p className="text-slate-400 text-sm font-medium mt-1">Node.js API & PostgreSQL</p>
               </div>
               
               <div className="space-y-4 flex-1">
                 <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                   <span className="text-slate-400 font-medium text-sm">Database Size</span>
                   <span className="text-white font-bold">{healthLoading ? '...' : health?.database?.size}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                   <span className="text-slate-400 font-medium text-sm">Total RAM</span>
                   <span className="text-white font-bold">{healthLoading ? '...' : health?.server?.memory?.total}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                   <span className="text-slate-400 font-medium text-sm">Used RAM</span>
                   <span className="text-white font-bold">{healthLoading ? '...' : health?.server?.memory?.used}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                   <span className="text-slate-400 font-medium text-sm">Registered Users</span>
                   <span className="text-white font-bold">{healthLoading ? '...' : (health?.app?.totalUsers || 0).toLocaleString()}</span>
                 </div>
               </div>

               <div className="pt-4">
                 <Button variant="secondary" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none font-black shadow-lg shadow-emerald-500/20">
                   Systems Operational
                 </Button>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- DATA BACKUP TAB --- */}
        <TabsContent value="backup" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="absolute -left-12 -bottom-12 opacity-5">
                <Database className="w-64 h-64 text-white" />
             </div>
             
             <div className="z-10 flex-1">
                <h3 className="text-2xl font-black text-white">Disaster Recovery & Backup</h3>
                <p className="text-slate-400 mt-2 font-medium max-w-xl leading-relaxed">
                  Generate a complete PostgreSQL database dump. This will create a secure, encrypted <code>.sql</code> backup and automatically upload it to the Cloudinary storage vault. Previous automated backups will be rotated out to preserve storage capacity.
                </p>
                <div className="flex items-center gap-4 mt-6">
                   <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-4 py-2 rounded-xl">
                      <ShieldCheck className="w-4 h-4" /> Secure AES-256
                   </div>
                   <div className="flex items-center gap-2 text-blue-400 text-sm font-bold bg-blue-400/10 px-4 py-2 rounded-xl">
                      <Database className="w-4 h-4" /> Full Schema & Data
                   </div>
                </div>
             </div>

             <div className="z-10 shrink-0 bg-white/5 p-6 rounded-3xl border border-white/10 text-center w-full md:w-80 flex flex-col items-center">
                <div className="bg-blue-500/20 p-4 rounded-2xl mb-4 text-blue-400">
                   {backupMutation.isPending ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Database className="w-8 h-8" />}
                </div>
                <Button 
                   size="lg" 
                   onClick={() => backupMutation.mutate()} 
                   disabled={backupMutation.isPending}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 h-14 rounded-xl text-md"
                >
                   {backupMutation.isPending ? 'Generating Backup...' : 'Trigger Full Backup'}
                </Button>
                <p className="text-xs text-slate-500 font-medium mt-4">Estimated time: ~10-30 seconds</p>
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
