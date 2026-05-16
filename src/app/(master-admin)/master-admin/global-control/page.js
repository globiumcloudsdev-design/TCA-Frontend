'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Settings, Power, Zap, Search, 
  ExternalLink, Ban, Activity, Building2, Layout,
  ShieldAlert, RefreshCw, MousePointer2, Info,
  Users, Lock, Unlock, Database,
  Clock
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

export default function GlobalControlPage() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Global Settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => masterAdminService.getGlobalSettings(),
    enabled: mounted
  });

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
              { label: 'API Latency', value: '124ms', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'CPU Usage', value: '42%', icon: Settings, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Active Sessions', value: '1,248', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Memory', value: '2.4 GB', icon: Layout, color: 'text-amber-500', bg: 'bg-amber-50' },
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
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-slate-900/20">
             <div className="p-4 bg-white/10 rounded-2xl border border-white/5 shadow-inner">
                <Info className="w-8 h-8 text-white/50" />
             </div>
             <div className="flex-1 space-y-2">
                <h5 className="text-white font-bold text-lg">Platform Compliance & Monitoring</h5>
                <p className="text-sm text-white/50 leading-relaxed font-medium">
                  System health metrics are updated in real-time. All administrative actions performed in this panel are recorded for audit compliance. 
                  In case of critical failures, maintenance mode will auto-trigger based on pre-defined safety thresholds.
                </p>
             </div>
             <Button variant="secondary" className="rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest bg-white text-slate-900 hover:bg-slate-100 border-none shrink-0">
               Check System Logs
             </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
