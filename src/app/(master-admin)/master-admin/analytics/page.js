'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Globe2, Building2, Database, CreditCard, RefreshCw, HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

import { useForm } from 'react-hook-form';
import { masterAdminService } from '@/services';
import { PageHeader, StatsCard, DatePickerField, InputField, SelectField } from '@/components/common';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  
  const { control, watch, reset } = useForm({
    defaultValues: {
      date_from: '',
      date_to: '',
      city: '',
      plan_id: 'all'
    }
  });

  const filters = watch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: plans } = useQuery({
    queryKey: ['master-admin-subscription-plans'],
    queryFn: () => masterAdminService.getSubscriptionPlans()
  });

  const planOptions = [
    { label: 'All Plans', value: 'all' },
    ...(plans?.data || []).map(p => ({ label: p.name, value: p.id }))
  ];

  const queryParams = {
    ...(filters.date_from && { date_from: filters.date_from }),
    ...(filters.date_to && { date_to: filters.date_to }),
    ...(filters.city && { city: filters.city }),
    ...(filters.plan_id !== 'all' && { plan_id: filters.plan_id }),
  };

  const { data: reports, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['master-admin-analytics', queryParams],
    queryFn: () => masterAdminService.getReports(queryParams)
  });

  if (!mounted) return null;

  const revenueGrowthData = reports?.revenueGrowth || [];
  const regionalData = reports?.regionalDistribution || [];
  const topConsumers = reports?.topConsumers || [];

  const handleRefresh = () => {
    refetch();
    toast.success('Analytics data refreshed successfully');
  };

  const handleClearFilters = () => {
    reset();
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <PageHeader
        title="📊 Analytics"
        description="Global analytics for revenue, regions, and resource usage."
        action={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching} className="gap-1.5">
            <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
            Refresh Data
          </Button>
        }
      />

      {/* ── Filter Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
         <div className="w-full md:w-48">
           <DatePickerField 
             control={control}
             name="date_from"
             label="Date From"
             maxDate={filters.date_to ? new Date(filters.date_to) : undefined}
           />
         </div>
         <div className="w-full md:w-48">
           <DatePickerField 
             control={control}
             name="date_to"
             label="Date To"
             minDate={filters.date_from ? new Date(filters.date_from) : undefined}
           />
         </div>
         <div className="w-full md:w-48">
           <InputField 
             control={control}
             name="city"
             label="City"
             placeholder="Search by city..." 
           />
         </div>
         <div className="w-full md:w-56">
           <SelectField 
             control={control}
             name="plan_id"
             label="Subscription Plan"
             options={planOptions}
           />
         </div>
         <div className="w-full md:w-auto pb-1">
           <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 text-slate-500 hover:text-slate-800 w-full md:w-auto">
             Clear Filters
           </Button>
         </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard
          label="This Month Revenue"
          value={isLoading ? '…' : `PKR ${(reports?.thisMonthRevenue || 0).toLocaleString()}`}
          icon={<TrendingUp size={16} />}
          valueClassName="text-blue-600"
        />
        <StatsCard
          label="Monthly Recurring (MRR)"
          value={isLoading ? '…' : `PKR ${(reports?.mrr || 0).toLocaleString()}`}
          icon={<CreditCard size={16} />}
          valueClassName="text-emerald-600"
        />
        <StatsCard
          label="Active Institutes"
          value={isLoading ? '…' : (reports?.activeInstitutes || 0)}
          icon={<Building2 size={16} />}
          valueClassName="text-purple-600"
        />
        <StatsCard
          label="Overdue Invoices"
          value={isLoading ? '…' : (reports?.overduePayments || 0)}
          icon={<Database size={16} />}
          valueClassName="text-amber-600"
        />
      </div>

      {/* Analytics Content Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-white border shadow-sm rounded-lg w-full justify-start h-auto p-1">
          <TabsTrigger value="revenue" className="rounded-md px-4 py-2 text-sm">Revenue & Growth</TabsTrigger>
          <TabsTrigger value="regions" className="rounded-md px-4 py-2 text-sm">Regional Distribution</TabsTrigger>
          <TabsTrigger value="resources" className="rounded-md px-4 py-2 text-sm">Resource Usage</TabsTrigger>
        </TabsList>

        {/* --- REVENUE TAB --- */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
               <div className="mb-4">
                 <h3 className="text-base font-semibold text-slate-800">Revenue Growth (6 Months)</h3>
                 <p className="text-xs text-slate-500">Monthly collected revenue trend across all institutes.</p>
               </div>
               <div className="flex-1 h-[250px]">
                 {isLoading ? (
                   <div className="flex h-full items-center justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `PKR ${(value/1000)}k`} />
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <RechartsTooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Revenue']} />
                       <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 )}
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
               <div className="mb-4">
                 <h3 className="text-base font-semibold text-slate-800">Plan Breakdown</h3>
                 <p className="text-xs text-slate-500">Revenue distributed by subscription plan.</p>
               </div>
               <div className="flex-1 h-[250px]">
                 {isLoading ? (
                   <div className="flex h-full items-center justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={reports?.planBreakdown || []}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={2}
                         dataKey="total"
                         nameKey="plan_name"
                       >
                         {(reports?.planBreakdown || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <RechartsTooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 )}
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- REGIONS TAB --- */}
        <TabsContent value="regions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-h-[350px] flex flex-col">
               <div className="mb-4">
                 <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                   <Globe2 className="w-4 h-4 text-slate-500" /> Institutes by City
                 </h3>
               </div>
               <div className="h-[250px] flex-1">
                 {isLoading ? (
                   <div className="flex h-full items-center justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={regionalData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                       <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                       <YAxis dataKey="city" type="category" stroke="#94a3b8" fontSize={11} width={100} tickLine={false} axisLine={false} />
                       <RechartsTooltip />
                       <Bar dataKey="count" name="Institutes" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                     </BarChart>
                   </ResponsiveContainer>
                 )}
               </div>
            </div>

            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
               <h3 className="text-base font-semibold text-slate-800 mb-4">Top Regions</h3>
               <div className="space-y-2 flex-1">
                  {isLoading ? <RefreshCw className="animate-spin mx-auto text-slate-400 mt-10" /> : regionalData.slice(0, 6).map((region, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-1 border-b last:border-0 border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="text-xs font-medium text-slate-500 w-4">{i+1}.</div>
                          <p className="text-sm font-medium text-slate-700">{region.city}</p>
                       </div>
                       <Badge variant="outline" className="text-xs font-normal">
                         {region.count} Institutes
                       </Badge>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </TabsContent>

        {/* --- RESOURCES TAB --- */}
        <TabsContent value="resources" className="space-y-4">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                   <HardDrive className="w-4 h-4 text-slate-500" /> Top Consumers
                </h3>
                <p className="text-xs text-slate-500 mt-1">Institutes ranked by total user base (Students, Teachers, Staff).</p>
              </div>
              
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3 px-4 font-medium text-slate-600 border-b">Institute Name</th>
                      <th className="py-3 px-4 font-medium text-slate-600 border-b">City</th>
                      <th className="py-3 px-4 font-medium text-slate-600 border-b text-right">Total Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="3" className="text-center py-10"><RefreshCw className="animate-spin mx-auto text-slate-400" /></td></tr>
                    ) : topConsumers.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-10 text-slate-500">No data available</td></tr>
                    ) : topConsumers.map((inst, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-800 font-medium">{inst.institute_name}</td>
                        <td className="py-3 px-4 text-slate-600">{inst.city}</td>
                        <td className="py-3 px-4 text-right">
                           <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                             {inst.total_users.toLocaleString()}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
