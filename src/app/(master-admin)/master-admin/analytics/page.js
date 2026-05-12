'use client';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, MousePointerClick, Globe2, Users, 
  Clock, Map as MapIcon, BarChart3, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Globe, Info, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Platform Analytics
          </h1>
          <p className="text-slate-500 text-sm font-medium">Real-time website traffic and user engagement metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs border-slate-200">
            Export Report
          </Button>
          <Button variant="default" className="rounded-xl h-10 px-5 font-bold text-xs gap-2 shadow-lg shadow-primary/20" onClick={() => toast.success('Syncing with Google Analytics...')}>
            <RefreshCw className="w-3.5 h-3.5" /> Sync Data
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Page Views', value: '142,502', change: '+18.5%', icon: Globe2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unique Visitors', value: '38,291', change: '+12.3%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Session', value: '5m 12s', change: '-2.1%', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Bounce Rate', value: '22.8%', change: '-5.4%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
             <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'} border`}>
                  {stat.change} {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3 ml-1 inline" /> : <ArrowDownRight className="w-3 h-3 ml-1 inline" />}
                </Badge>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
             <h4 className="text-3xl font-black text-slate-900 mt-1 relative z-10">{stat.value}</h4>
             {/* Decorative background icon */}
             <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 opacity-50 group-hover:scale-110 transition-transform" />
          </div>
        ))}
      </div>

      {/* Analytics Content Tabs */}
      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-fit">
          <TabsTrigger value="traffic" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            Traffic Over Time
          </TabsTrigger>
          <TabsTrigger value="behavior" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            User Behavior
          </TabsTrigger>
          <TabsTrigger value="audience" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            Audience Location
          </TabsTrigger>
        </TabsList>

        {/* --- TRAFFIC TAB --- */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Traffic Volume</h3>
                    <p className="text-sm text-slate-500 font-medium">Daily sessions and page views for the last 30 days.</p>
                  </div>
                  <SelectPlaceholder label="Last 30 Days" />
               </div>
               <div className="flex-1 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">Google Analytics Chart Rendering...</p>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/20 animate-bounce" />
                    <div className="w-3 h-3 rounded-full bg-primary/20 animate-bounce delay-100" />
                    <div className="w-3 h-3 rounded-full bg-primary/20 animate-bounce delay-200" />
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Top Referral Sources</h3>
               <div className="space-y-6 flex-1">
                  {[
                    { label: 'Direct Traffic', value: '42%', color: 'bg-blue-500' },
                    { label: 'Google Search', value: '31%', color: 'bg-emerald-500' },
                    { label: 'Social Media', value: '18%', color: 'bg-purple-500' },
                    { label: 'Email Campaigns', value: '9%', color: 'bg-amber-500' },
                  ].map((source, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-tighter">
                          <span>{source.label}</span>
                          <span>{source.value}</span>
                       </div>
                       <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${source.color} rounded-full`} style={{ width: source.value }} />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Data syncs every 15 mins</p>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- BEHAVIOR TAB --- */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Heatmap Visualization */}
            <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <MousePointerClick className="w-6 h-6 text-primary" /> User Interaction Heatmap
                  </h3>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <Button variant="ghost" size="sm" className="bg-white shadow-sm rounded-lg text-[10px] font-black uppercase">Home</Button>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-slate-400">Dashboard</Button>
                  </div>
               </div>
               <div className="relative aspect-[16/9] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bbbda5366991?q=80&w=1000')] bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  
                  {/* Heatmap Points */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-amber-500/40 rounded-full blur-3xl animate-pulse delay-500" />
                  <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                     <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl scale-95 group-hover:scale-100 transition-all">
                        <MapIcon className="w-12 h-12 text-white mx-auto mb-4 drop-shadow-lg" />
                        <h4 className="text-2xl font-black text-white">Visual Intelligence</h4>
                        <p className="text-sm text-slate-300 mt-2 max-w-xs font-medium">Tracking 1.8M clicks per week across the Global TCA Network.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Popular Pages */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Hot Landing Pages</h3>
               <div className="space-y-4 flex-1">
                  {[
                    { path: '/school/dashboard', count: '18.4k', growth: '+22%' },
                    { path: '/auth/login', count: '14.2k', growth: '+15%' },
                    { path: '/school/fees', count: '9.8k', growth: '-5%' },
                    { path: '/coaching/students', count: '7.1k', growth: '+31%' },
                    { path: '/university/exam', count: '5.2k', growth: '+8%' },
                    { path: '/contact-us', count: '4.9k', growth: '-12%' },
                  ].map((page, i) => (
                    <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                       <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] group-hover:bg-white transition-colors">#{i+1}</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{page.path}</p>
                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-tighter">{page.count} hits</p>
                          </div>
                       </div>
                       <Badge className={`text-[9px] font-black border-none ${page.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         {page.growth}
                       </Badge>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- AUDIENCE TAB --- */}
        <TabsContent value="audience" className="space-y-6">
           <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center text-slate-300">
                 <Globe className="w-12 h-12 animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="max-w-md">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Global Audience Map</h3>
                 <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                   Integrate Google Maps API to visualize user distribution across different countries and cities in real-time. 
                   Currently tracking connections from <span className="text-primary font-bold">142 different regions</span>.
                 </p>
              </div>
              <Button variant="outline" className="rounded-xl h-11 px-8 font-bold border-slate-200 hover:bg-slate-50 transition-all">
                Setup Region Tracking
              </Button>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SelectPlaceholder({ label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all">
      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      <TrendingUp className="w-3 h-3 text-slate-400 rotate-90" />
    </div>
  );
}
