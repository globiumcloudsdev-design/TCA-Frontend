/**
 * ParentDetailPage — Premium profile view for a parent/guardian
 * Route: /[type]/parents/[id]
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Pencil, User, Phone, Mail, MapPin, 
  Users, Briefcase, Hash, ShieldCheck, 
  FileText, Download, UserCheck, Power, RefreshCw, IdCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import { parentService } from '@/services/parentService';
import PageLoader from '@/components/common/PageLoader';
import ErrorAlert from '@/components/common/ErrorAlert';
import useUIStore from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Helpers ─────────────────────────────────────────────
function initials(p) {
  if (!p) return '?';
  return `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase() || '?';
}

function InfoRow({ icon: Icon, label, value, color }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0 border-muted/50">
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground", color)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export default function ParentDetailPage() {
  const { id, type } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { terms } = useInstituteConfig();
  const { canDo } = useAuthStore();
  const { setBreadcrumbLabel } = useUIStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: parent, isLoading, error, refetch } = useQuery({
    queryKey: ['parent', id],
    queryFn: async () => {
      const response = await parentService.getById(id);
      return response.data; // Unwrap the .data from { success, data, message }
    },
    enabled: !!id
  });

  const toggleStatus = useMutation({
    mutationFn: (status) => parentService.update(id, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['parent', id] });
    }
  });

  // Set breadcrumb label
  useEffect(() => {
    if (parent) {
      const name = `${parent.first_name || ''} ${parent.last_name || ''}`.trim() || 'Parent Profile';
      setBreadcrumbLabel(name);
    }
    return () => setBreadcrumbLabel(null);
  }, [parent, setBreadcrumbLabel]);

  if (!mounted) return null;
  if (isLoading) return <PageLoader message="Loading parent profile..." />;
  if (error) return <ErrorAlert message={error.message} onRetry={refetch} />;
  if (!parent) return <ErrorAlert message="Parent not found" />;

  const firstName = parent.first_name || '';
  const lastName = parent.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Parent Profile';
  const isActive = parent.status === 'active';

  return (
    <div className="space-y-6 pb-10">
      {/* Header / Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-background shadow-sm border"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                {parent.registration_no}
              </Badge>
              • Parent / Guardian
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canDo('parents.update') && (
            <Button 
              variant={isActive ? "outline" : "default"}
              size="sm"
              className="gap-1.5"
              onClick={() => toggleStatus.mutate(isActive ? 'inactive' : 'active')}
            >
              <Power size={14} />
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-b from-primary/5 to-background">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 border-4 border-background shadow-2xl mb-4">
                <AvatarFallback className="text-3xl font-black bg-primary text-primary-foreground">
                  {initials(parent)}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold">{fullName}</h2>
              <p className="text-sm text-muted-foreground mb-4 capitalize">{parent.relation}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant={isActive ? "success" : "destructive"} className="px-3 py-1">
                  {isActive ? 'Active Account' : 'Inactive'}
                </Badge>
              </div>

              {/* {parent.qr_code_url && (
                <div className="p-3 bg-white rounded-2xl shadow-inner border mb-2">
                  <img src={parent.qr_code_url} alt="QR Code" className="h-32 w-32" />
                  <p className="text-[10px] font-mono mt-2 text-muted-foreground">Scan for Verification</p>
                </div>
              )} */}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-muted/40">
            <CardContent className="p-5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Contact & Identity</h3>
              <div className="space-y-1">
                <InfoRow icon={Phone} label="Primary Phone" value={parent.phone} color="text-blue-500 bg-blue-500/10" />
                <InfoRow icon={Mail} label="Email Address" value={parent.email || 'No email provided'} color="text-purple-500 bg-purple-500/10" />
                <InfoRow icon={ShieldCheck} label="CNIC / Identity" value={parent.cnic} color="text-emerald-500 bg-emerald-500/10" />
                <InfoRow icon={Briefcase} label="Occupation" value={parent.occupation} color="text-amber-500 bg-amber-500/10" />
                <InfoRow icon={MapPin} label="Home Address" value={parent.address} color="text-red-500 bg-red-500/10" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs & Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="children" className="w-full">
            <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="children" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Children ({parent.students?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="children" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parent.students && parent.students.length > 0 ? (
                  parent.students.map((student) => (
                    <Card 
                      key={student.id} 
                      className="group hover:shadow-md transition-all cursor-pointer border-muted/40 overflow-hidden"
                      onClick={() => router.push(`/${type}/students/${student.id}`)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {student.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                            {student.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {student.registration_no}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {student.class_name}
                            </Badge>
                            {student.section_name && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {student.section_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowLeft className="rotate-180" size={14} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                    <Users size={48} className="text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-lg">No Linked Students</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      This parent does not have any students linked to their profile.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
