// 'use client';

// import { useMemo, useState, useEffect, use } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { 
//   ArrowLeft, Users, GraduationCap, BookOpen, TrendingUp, 
//   CheckCircle, XCircle, AlertCircle, RefreshCw, Zap, 
//   Loader2, ChevronRight, Filter, Mail, Phone, Shield,
//   UserCheck, UserX, Flag, Award
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { cn } from '@/lib/utils';

// import useInstituteConfig from '@/hooks/useInstituteConfig';
// import useAuthStore from '@/store/authStore';
// import useInstituteStore from '@/store/instituteStore';
// import { studentService, academicYearService, classService } from '@/services';
// import DataTable from '@/components/common/DataTable';
// import PageHeader from '@/components/common/PageHeader';
// import ConfirmDialog from '@/components/common/ConfirmDialog';
// import SelectField from '@/components/common/SelectField';
// import StatsCard from '@/components/common/StatsCard';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Button } from '@/components/ui/button';
// import { SimpleTooltip } from '@/components/ui/SimpleTooltip';

// // Terminology mapper (same as StudentsPage)
// const getTerminology = (type) => {
//   const base = {
//     school: {
//       student: 'Student', students: 'Students',
//       primaryUnit: 'Class', primaryUnitPlural: 'Classes',
//       groupingUnit: 'Section', groupingUnitPlural: 'Sections',
//       rollNumber: 'Roll Number',
//     },
//     coaching: {
//       student: 'Candidate', students: 'Candidates',
//       primaryUnit: 'Course', primaryUnitPlural: 'Courses',
//       groupingUnit: 'Batch', groupingUnitPlural: 'Batches',
//       rollNumber: 'Candidate ID',
//     },
//     academy: {
//       student: 'Trainee', students: 'Trainees',
//       primaryUnit: 'Program', primaryUnitPlural: 'Programs',
//       groupingUnit: 'Batch', groupingUnitPlural: 'Batches',
//       rollNumber: 'Trainee ID',
//     },
//     college: {
//       student: 'Student', students: 'Students',
//       primaryUnit: 'Department', primaryUnitPlural: 'Departments',
//       groupingUnit: 'Semester', groupingUnitPlural: 'Semesters',
//       rollNumber: 'Registration No',
//     },
//     university: {
//       student: 'Student', students: 'Students',
//       primaryUnit: 'Department', primaryUnitPlural: 'Departments',
//       groupingUnit: 'Semester', groupingUnitPlural: 'Semesters',
//       rollNumber: 'Registration No',
//     },
//   };
//   return base[type] || base.school;
// };

// // Helper to flatten student
// const flattenStudent = (s) => {
//   if (!s) return s;
//   const details = s.details?.studentDetails || {};
//   return { ...s, ...details, id: s.id };
// };

// export default function StudentPromotePage({ params }) {
// //   const { type } = params;
//   const { type } = use(params);

//   const router = useRouter();
//   const qc = useQueryClient();
//   const canDo = useAuthStore((s) => s.canDo);
//   const { currentInstitute } = useInstituteStore();
//   const terms = getTerminology(type);

//   // State
//   const [academicYearId, setAcademicYearId] = useState('');
//   const [classId, setClassId] = useState('');
//   const [sectionId, setSectionId] = useState('');
//   const [targetClassId, setTargetClassId] = useState('');
//   const [targetSectionId, setTargetSectionId] = useState('');
//   const [targetAcademicYearId, setTargetAcademicYearId] = useState('');
//   const [forcePromotion, setForcePromotion] = useState(false);
//   const [selectedStudentIds, setSelectedStudentIds] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState(null);

//   // Fetch academic years
//   const { data: academicYearsData } = useQuery({
//     queryKey: ['academic-years', currentInstitute?.id],
//     queryFn: () => academicYearService.getAll({
//       institute_id: currentInstitute?.id,
//       is_active: true
//     }),
//     enabled: !!currentInstitute?.id,
//   });

//   // Set current academic year as default for source
//   useEffect(() => {
//     if (academicYearsData?.data?.length && !academicYearId) {
//       const current = academicYearsData.data.find(y => y.is_current);
//       setAcademicYearId(current?.id || academicYearsData.data[0]?.id);
//     }
//   }, [academicYearsData]);

//   // Set target academic year as next year (or same if not found)
//   useEffect(() => {
//     if (academicYearsData?.data?.length && !targetAcademicYearId && academicYearId) {
//       const currentIndex = academicYearsData.data.findIndex(y => y.id === academicYearId);
//       const nextYear = academicYearsData.data[currentIndex + 1];
//       setTargetAcademicYearId(nextYear?.id || academicYearId);
//     }
//   }, [academicYearsData, academicYearId]);

//   // Fetch classes for source
//   const { data: classesData } = useQuery({
//     queryKey: ['classes', academicYearId, type],
//     queryFn: () => classService.getAll({
//       academic_year_id: academicYearId,
//       is_active: true,
//       institute_type: type
//     }),
//     enabled: !!academicYearId,
//   });

//   // Fetch classes for target (same academic year or next)
//   const { data: targetClassesData } = useQuery({
//     queryKey: ['classes', targetAcademicYearId, type],
//     queryFn: () => classService.getAll({
//       academic_year_id: targetAcademicYearId,
//       is_active: true,
//       institute_type: type
//     }),
//     enabled: !!targetAcademicYearId,
//   });

//   // Sections for source class
//   const sourceSections = useMemo(() => {
//     if (!classId || !classesData?.data) return [];
//     const cls = classesData.data.find(c => String(c.id) === String(classId));
//     return cls?.sections || [];
//   }, [classId, classesData]);

//   // Sections for target class
//   const targetSections = useMemo(() => {
//     if (!targetClassId || !targetClassesData?.data) return [];
//     const cls = targetClassesData.data.find(c => String(c.id) === String(targetClassId));
//     return cls?.sections || [];
//   }, [targetClassId, targetClassesData]);

//   // Reset selections when source class changes
//   useEffect(() => {
//     setSectionId('');
//     setSelectedStudentIds([]);
//   }, [classId]);

//   useEffect(() => {
//     setTargetSectionId('');
//   }, [targetClassId]);

//   // Fetch promotion eligibility for the selected class
//   const { data: eligibilityData, isLoading, refetch } = useQuery({
//     queryKey: ['promotion-eligibility', classId, academicYearId],
//     queryFn: () => studentService.getClassPromotionEligibility(classId, academicYearId),
//     enabled: !!classId && !!academicYearId,
//   });

//   const students = useMemo(() => {
//     if (!eligibilityData?.data?.details) return [];
//     return eligibilityData.data.details.map(s => ({
//       ...s,
//       student: flattenStudent(s.student || { id: s.studentId, first_name: s.name?.split(' ')[0], last_name: s.name?.split(' ').slice(1).join(' ') })
//     }));
//   }, [eligibilityData]);

//   const eligibleCount = eligibilityData?.data?.eligibleCount || 0;
//   const ineligibleCount = eligibilityData?.data?.ineligibleCount || 0;
//   const totalCount = eligibilityData?.data?.total || 0;

//   // Bulk promote mutation
//   const bulkPromote = useMutation({
//     mutationFn: async () => {
//       const payload = {
//         fromClassId: classId,
//         toClassId: targetClassId,
//         toSectionId: targetSectionId,
//         targetAcademicYearId,
//         force: forcePromotion,
//       };
//       // If specific students selected, filter? Backend bulk promote by class promotes all active in that class.
//       // We'll handle selection by calling individual promote for selected ones.
//       if (selectedStudentIds.length > 0 && selectedStudentIds.length !== totalCount) {
//         // Promote only selected
//         const results = [];
//         for (const studentId of selectedStudentIds) {
//           try {
//             const res = await studentService.promoteStudent(studentId, {
//               targetClassId,
//               targetSectionId,
//               targetAcademicYearId,
//               force: forcePromotion,
//             });
//             results.push({ studentId, success: true, ...res });
//           } catch (err) {
//             results.push({ studentId, success: false, error: err.message });
//           }
//         }
//         return { type: 'selected', results };
//       } else {
//         // Bulk promote whole class
//         const res = await studentService.bulkPromoteStudents(payload);
//         return { type: 'bulk', ...res };
//       }
//     },
//     onSuccess: (result) => {
//       let successCount = 0;
//       let failCount = 0;
//       if (result.type === 'selected') {
//         successCount = result.results.filter(r => r.success).length;
//         failCount = result.results.filter(r => !r.success).length;
//       } else {
//         successCount = result.promoted?.length || 0;
//         failCount = result.failed?.length || 0;
//       }
      
//       if (failCount === 0) {
//         toast.success(`✅ ${successCount} ${terms.students} promoted successfully!`);
//       } else {
//         toast.warning(`⚠️ ${successCount} promoted, ${failCount} failed. Check console for details.`);
//       }
      
//       setSelectedStudentIds([]);
//       refetch();
//       qc.invalidateQueries({ queryKey: ['students', type] });
//       setConfirmDialog(null);
//     },
//     onError: (error) => {
//       toast.error(error.message || 'Bulk promotion failed');
//       setConfirmDialog(null);
//     },
//   });

//   // Single promote mutation
//   const singlePromote = useMutation({
//     mutationFn: ({ studentId, studentName }) => 
//       studentService.promoteStudent(studentId, {
//         targetClassId,
//         targetSectionId,
//         targetAcademicYearId,
//         force: forcePromotion,
//       }),
//     onSuccess: (_, { studentName }) => {
//       toast.success(`${studentName} promoted successfully`);
//       refetch();
//       qc.invalidateQueries({ queryKey: ['students', type] });
//     },
//     onError: (error, { studentName }) => {
//       toast.error(`${studentName}: ${error.message}`);
//     },
//   });

//   // Handle promote action (opens confirmation)
//   const handlePromoteClick = () => {
//     if (!targetClassId || !targetSectionId || !targetAcademicYearId) {
//       toast.error('Please select target class, section and academic year');
//       return;
//     }
//     if (selectedStudentIds.length === 0 && totalCount === 0) {
//       toast.error('No students to promote');
//       return;
//     }
    
//     const count = selectedStudentIds.length > 0 ? selectedStudentIds.length : totalCount;
//     setConfirmDialog({
//       title: `Promote ${count} ${terms.students}`,
//       description: forcePromotion 
//         ? `⚠️ Force promotion enabled. Students will be promoted even if they failed exams.`
//         : `Only eligible students (passed all exams) will be promoted. ${ineligibleCount} ineligible will be skipped.`,
//       confirmLabel: 'Promote',
//       variant: forcePromotion ? 'warning' : 'default',
//       onConfirm: () => bulkPromote.mutate(),
//     });
//   };

//   // Columns for DataTable
//   const columns = useMemo(() => [
//     {
//       id: 'select',
//       header: ({ table }) => (
//         <Checkbox
//           checked={selectedStudentIds.length === totalCount && totalCount > 0}
//           onCheckedChange={(checked) => {
//             if (checked) {
//               const allIds = students.map(s => s.studentId);
//               setSelectedStudentIds(allIds);
//             } else {
//               setSelectedStudentIds([]);
//             }
//           }}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={selectedStudentIds.includes(row.original.studentId)}
//           onCheckedChange={(checked) => {
//             if (checked) {
//               setSelectedStudentIds(prev => [...prev, row.original.studentId]);
//             } else {
//               setSelectedStudentIds(prev => prev.filter(id => id !== row.original.studentId));
//             }
//           }}
//           aria-label="Select row"
//         />
//       ),
//       enableSorting: false,
//       size: 40,
//     },
//     {
//       accessorKey: 'name',
//       header: terms.student,
//       cell: ({ row }) => {
//         const s = row.original;
//         return (
//           <div className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
//               {s.name?.charAt(0) || '?'}
//             </div>
//             <div>
//               <p className="font-medium">{s.name || '—'}</p>
//               <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                 <Mail className="h-3 w-3" />
//                 <span>{s.student?.email || '—'}</span>
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: 'rollNo',
//       header: terms.rollNumber,
//       cell: ({ row }) => (
//         <span className="font-mono text-xs">
//           {row.original.student?.details?.studentDetails?.roll_no || row.original.student?.registration_no || '—'}
//         </span>
//       ),
//     },
//     {
//       accessorKey: 'phone',
//       header: 'Phone',
//       cell: ({ row }) => (
//         <div className="flex items-center gap-1">
//           <Phone className="h-3 w-3 text-muted-foreground" />
//           <span className="text-xs">{row.original.student?.phone || '—'}</span>
//         </div>
//       ),
//     },
//     {
//       accessorKey: 'eligible',
//       header: 'Eligibility',
//       cell: ({ row }) => {
//         const eligible = row.original.eligible;
//         const reason = row.original.reason;
//         return (
//           <SimpleTooltip content={reason || (eligible ? 'Passed all exams' : 'Failed in one or more subjects')} side="top">
//             <div className="flex items-center gap-1.5">
//               {eligible ? (
//                 <Badge variant="success" className="gap-1">
//                   <CheckCircle size={10} /> Eligible
//                 </Badge>
//               ) : (
//                 <Badge variant="destructive" className="gap-1">
//                   <XCircle size={10} /> Not Eligible
//                 </Badge>
//               )}
//               {reason && (
//                 <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
//                   {reason}
//                 </span>
//               )}
//             </div>
//           </SimpleTooltip>
//         );
//       },
//     },
//     {
//       id: 'actions',
//       header: '',
//       cell: ({ row }) => {
//         const eligible = row.original.eligible;
//         return (
//           <div className="flex justify-end">
//             <SimpleTooltip content={eligible ? 'Promote this student' : (forcePromotion ? 'Force promote' : 'Not eligible (enable force promotion)')}>
//               <button
//                 onClick={() => {
//                   if (!targetClassId || !targetSectionId || !targetAcademicYearId) {
//                     toast.error('Please select target class, section and academic year first');
//                     return;
//                   }
//                   if (!eligible && !forcePromotion) {
//                     toast.error('Student not eligible. Enable Force Promotion to override.');
//                     return;
//                   }
//                   singlePromote.mutate({
//                     studentId: row.original.studentId,
//                     studentName: row.original.name,
//                   });
//                 }}
//                 disabled={singlePromote.isPending}
//                 className={cn(
//                   'rounded-md px-2 py-1 text-xs transition-colors',
//                   (eligible || forcePromotion) 
//                     ? 'text-primary hover:bg-primary/10' 
//                     : 'text-muted-foreground cursor-not-allowed'
//                 )}
//               >
//                 {singlePromote.isPending ? (
//                   <Loader2 size={14} className="animate-spin" />
//                 ) : (
//                   <Zap size={14} />
//                 )}
//               </button>
//             </SimpleTooltip>
//           </div>
//         );
//       },
//     },
//   ], [selectedStudentIds, totalCount, students, targetClassId, targetSectionId, targetAcademicYearId, forcePromotion, singlePromote, terms]);

//   // Options for selects
//   const academicYearOptions = useMemo(() => 
//     academicYearsData?.data?.map(y => ({ value: y.id, label: y.name })) || [],
//     [academicYearsData]
//   );
//   const classOptions = useMemo(() => 
//     classesData?.data?.map(c => ({ value: c.id, label: c.name })) || [],
//     [classesData]
//   );
//   const targetClassOptions = useMemo(() => 
//     targetClassesData?.data?.map(c => ({ value: c.id, label: c.name })) || [],
//     [targetClassesData]
//   );
//   const sourceSectionOptions = useMemo(() => 
//     sourceSections.map(s => ({ value: s.id, label: s.name })) || [],
//     [sourceSections]
//   );
//   const targetSectionOptions = useMemo(() => 
//     targetSections.map(s => ({ value: s.id, label: s.name })) || [],
//     [targetSections]
//   );

//   if (!canDo('students.update')) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
//           <p className="mt-2 text-muted-foreground">You don't have permission to promote students.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Breadcrumb */}
//       <nav className="flex items-center gap-1 text-xs text-muted-foreground">
//         <button onClick={() => router.push(`/${type}/students`)} className="hover:text-foreground transition-colors capitalize">
//           {terms.students}
//         </button>
//         <ChevronRight size={12} />
//         <span className="text-foreground font-medium">Promote {terms.students}</span>
//       </nav>

//       <PageHeader
//         title={`Promote ${terms.students}`}
//         description={`Move ${terms.students.toLowerCase()} to the next class/level based on exam results`}
//         actions={
//           <button
//             onClick={() => router.push(`/${type}/students`)}
//             className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
//           >
//             <ArrowLeft size={14} /> Back to {terms.students}
//           </button>
//         }
//       />

//       {/* Configuration Cards */}
//       <div className="grid gap-6 md:grid-cols-2">
//         {/* Source Configuration */}
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium flex items-center gap-2">
//               <GraduationCap className="h-4 w-4 text-primary" />
//               Current {terms.primaryUnit}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <SelectField
//               label="Academic Year"
//               value={academicYearId}
//               onChange={setAcademicYearId}
//               options={academicYearOptions}
//               placeholder="Select Academic Year"
//             />
//             <SelectField
//               label={terms.primaryUnit}
//               value={classId}
//               onChange={setClassId}
//               options={classOptions}
//               placeholder={`Select ${terms.primaryUnit}`}
//               disabled={!academicYearId}
//             />
//             <SelectField
//               label={terms.groupingUnit}
//               value={sectionId}
//               onChange={setSectionId}
//               options={sourceSectionOptions}
//               placeholder={`Select ${terms.groupingUnit} (Optional)`}
//               disabled={!classId}
//             />
//           </CardContent>
//         </Card>

//         {/* Target Configuration */}
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium flex items-center gap-2">
//               <TrendingUp className="h-4 w-4 text-primary" />
//               Promote To
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <SelectField
//               label="Target Academic Year"
//               value={targetAcademicYearId}
//               onChange={setTargetAcademicYearId}
//               options={academicYearOptions}
//               placeholder="Select Target Year"
//             />
//             <SelectField
//               label={`Target ${terms.primaryUnit}`}
//               value={targetClassId}
//               onChange={setTargetClassId}
//               options={targetClassOptions}
//               placeholder={`Select ${terms.primaryUnit}`}
//               disabled={!targetAcademicYearId}
//             />
//             <SelectField
//               label={`Target ${terms.groupingUnit}`}
//               value={targetSectionId}
//               onChange={setTargetSectionId}
//               options={targetSectionOptions}
//               placeholder={`Select ${terms.groupingUnit}`}
//               disabled={!targetClassId}
//             />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Force Promotion Toggle */}
//       <Card className="border-amber-200 bg-amber-50/30">
//         <CardContent className="py-3 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Flag className="h-5 w-5 text-amber-600" />
//             <div>
//               <p className="text-sm font-medium">Force Promotion</p>
//               <p className="text-xs text-muted-foreground">
//                 When enabled, students will be promoted regardless of exam results.
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setForcePromotion(!forcePromotion)}
//             className={cn(
//               "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
//               forcePromotion ? "bg-amber-500" : "bg-gray-300"
//             )}
//           >
//             <span className={cn(
//               "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
//               forcePromotion ? "translate-x-6" : "translate-x-1"
//             )} />
//           </button>
//         </CardContent>
//       </Card>

//       {/* Stats Cards */}
//       {classId && (
//         <div className="grid gap-4 sm:grid-cols-3">
//           <StatsCard
//             label={`Total ${terms.students}`}
//             value={totalCount}
//             icon={<Users size={18} />}
//             loading={isLoading}
//           />
//           <StatsCard
//             label="Eligible for Promotion"
//             value={eligibleCount}
//             icon={<CheckCircle size={18} className="text-emerald-600" />}
//             description="Passed all exams"
//             loading={isLoading}
//           />
//           <StatsCard
//             label="Not Eligible"
//             value={ineligibleCount}
//             icon={<XCircle size={18} className="text-red-500" />}
//             description="Failed in one or more subjects"
//             loading={isLoading}
//           />
//         </div>
//       )}

//       {/* Students Table */}
//       <DataTable
//         columns={columns}
//         data={students}
//         loading={isLoading}
//         emptyMessage={!classId ? `Select a ${terms.primaryUnit.toLowerCase()} to view ${terms.students.toLowerCase()}` : `No ${terms.students.toLowerCase()} found in this class`}
//         enableRowSelection={false} // we have custom selection column
//         enableColumnVisibility
//         action={
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => refetch()}
//               disabled={isLoading}
//               className="gap-1.5"
//             >
//               <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
//               Refresh
//             </Button>
//             <Button
//               onClick={handlePromoteClick}
//               disabled={!targetClassId || !targetSectionId || !targetAcademicYearId || totalCount === 0 || bulkPromote.isPending}
//               className="gap-1.5"
//             >
//               {bulkPromote.isPending ? (
//                 <Loader2 size={14} className="animate-spin" />
//               ) : (
//                 <Zap size={14} />
//               )}
//               Promote {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : `All (${totalCount})`}
//             </Button>
//           </div>
//         }
//         pagination={null}
//       />

//       {/* Confirm Dialog */}
//       {confirmDialog && (
//         <ConfirmDialog
//           open={!!confirmDialog}
//           onClose={() => setConfirmDialog(null)}
//           onConfirm={confirmDialog.onConfirm}
//           loading={bulkPromote.isPending}
//           title={confirmDialog.title}
//           description={confirmDialog.description}
//           confirmLabel={confirmDialog.confirmLabel}
//           variant={confirmDialog.variant}
//         />
//       )}
//     </div>
//   );
// }







'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, GraduationCap, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, Zap, 
  Loader2, ChevronRight, Mail, Phone, Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { studentService, academicYearService, classService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';

// ─────────────────────────────────────────────────────────────
// Terminology mapper (school / coaching / academy etc.)
// ─────────────────────────────────────────────────────────────
const getTerminology = (type) => {
  const base = {
    school: {
      student: 'Student', students: 'Students',
      primaryUnit: 'Class', groupingUnit: 'Section',
      rollNumber: 'Roll Number',
    },
    coaching: {
      student: 'Candidate', students: 'Candidates',
      primaryUnit: 'Course', groupingUnit: 'Batch',
      rollNumber: 'Candidate ID',
    },
    academy: {
      student: 'Trainee', students: 'Trainees',
      primaryUnit: 'Program', groupingUnit: 'Batch',
      rollNumber: 'Trainee ID',
    },
    college: {
      student: 'Student', students: 'Students',
      primaryUnit: 'Department', groupingUnit: 'Semester',
      rollNumber: 'Registration No',
    },
    university: {
      student: 'Student', students: 'Students',
      primaryUnit: 'Department', groupingUnit: 'Semester',
      rollNumber: 'Registration No',
    },
  };
  return base[type] || base.school;
};

// Flatten student object for display
const flattenStudent = (s) => {
  if (!s) return s;
  const details = s.details?.studentDetails || {};
  return { ...s, ...details, id: s.id };
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function StudentPromotePage({ type }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { currentInstitute } = useInstituteStore();
  const terms = getTerminology(type);

  // State
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetSectionId, setTargetSectionId] = useState('');
  const [targetAcademicYearId, setTargetAcademicYearId] = useState('');
  const [forcePromotion, setForcePromotion] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // ── 1. Academic Years ─────────────────────────────────────
  const { data: academicYearsData } = useQuery({
    queryKey: ['academic-years', currentInstitute?.id],
    queryFn: () => academicYearService.getAll({
      institute_id: currentInstitute?.id,
      is_active: true
    }),
    enabled: !!currentInstitute?.id,
  });

  // Set default source academic year (current year)
  useEffect(() => {
    if (academicYearsData?.data?.length && !academicYearId) {
      const current = academicYearsData.data.find(y => y.is_current);
      setAcademicYearId(current?.id || academicYearsData.data[0]?.id);
    }
  }, [academicYearsData]);

  // Set default target academic year (next year, fallback to same)
  useEffect(() => {
    if (academicYearsData?.data?.length && !targetAcademicYearId && academicYearId) {
      const currentIndex = academicYearsData.data.findIndex(y => y.id === academicYearId);
      const nextYear = academicYearsData.data[currentIndex + 1];
      setTargetAcademicYearId(nextYear?.id || academicYearId);
    }
  }, [academicYearsData, academicYearId]);

  // ── 2. Classes for source ─────────────────────────────────
  const { data: classesData } = useQuery({
    queryKey: ['classes', academicYearId, type],
    queryFn: () => classService.getAll({
      academic_year_id: academicYearId,
      is_active: true,
      institute_type: type
    }),
    enabled: !!academicYearId,
  });

  // ── 3. Classes for target ─────────────────────────────────
  const { data: targetClassesData } = useQuery({
    queryKey: ['classes', targetAcademicYearId, type],
    queryFn: () => classService.getAll({
      academic_year_id: targetAcademicYearId,
      is_active: true,
      institute_type: type
    }),
    enabled: !!targetAcademicYearId,
  });

  // Sections for source class
  const sourceSections = useMemo(() => {
    if (!classId || !classesData?.data) return [];
    const cls = classesData.data.find(c => String(c.id) === String(classId));
    return cls?.sections || [];
  }, [classId, classesData]);

  // Sections for target class
  const targetSections = useMemo(() => {
    if (!targetClassId || !targetClassesData?.data) return [];
    const cls = targetClassesData.data.find(c => String(c.id) === String(targetClassId));
    return cls?.sections || [];
  }, [targetClassId, targetClassesData]);

  // Reset selections when source class changes
  useEffect(() => {
    setSectionId('');
    setSelectedStudentIds([]);
  }, [classId]);

  useEffect(() => {
    setTargetSectionId('');
  }, [targetClassId]);

  // ── 4. Fetch promotion eligibility for the selected class ──
  const { data: eligibilityData, isLoading, refetch } = useQuery({
    queryKey: ['promotion-eligibility', classId, academicYearId],
    queryFn: () => studentService.getClassPromotionEligibility(classId, academicYearId),
    enabled: !!classId && !!academicYearId,
  });

  const students = useMemo(() => {
    if (!eligibilityData?.data?.details) return [];
    return eligibilityData.data.details.map(s => ({
      studentId: s.studentId,
      name: s.name,
      eligible: s.eligible,
      reason: s.reason,
      student: flattenStudent(s.student || { 
        id: s.studentId, 
        first_name: s.name?.split(' ')[0], 
        last_name: s.name?.split(' ').slice(1).join(' '),
        email: s.email,
        phone: s.phone
      })
    }));
  }, [eligibilityData]);

  const eligibleCount = eligibilityData?.data?.eligibleCount || 0;
  const ineligibleCount = eligibilityData?.data?.ineligibleCount || 0;
  const totalCount = eligibilityData?.data?.total || 0;

  // ── 5. Bulk promotion mutation ────────────────────────────
  const bulkPromote = useMutation({
    mutationFn: async () => {
      // If specific students selected (but not all), promote them individually
      if (selectedStudentIds.length > 0 && selectedStudentIds.length !== totalCount) {
        const results = [];
        for (const studentId of selectedStudentIds) {
          try {
            const res = await studentService.promoteStudent(studentId, {
              targetClassId,
              targetSectionId,
              targetAcademicYearId,
              force: forcePromotion,
            });
            results.push({ studentId, success: true, ...res });
          } catch (err) {
            results.push({ studentId, success: false, error: err.message });
          }
        }
        return { type: 'selected', results };
      } else {
        // Bulk promote whole class
        const res = await studentService.bulkPromoteStudents({
          fromClassId: classId,
          toClassId: targetClassId,
          toSectionId: targetSectionId,
          targetAcademicYearId,
          force: forcePromotion,
        });
        return { type: 'bulk', ...res };
      }
    },
    onSuccess: (result) => {
      let successCount = 0, failCount = 0;
      if (result.type === 'selected') {
        successCount = result.results.filter(r => r.success).length;
        failCount = result.results.filter(r => !r.success).length;
      } else {
        successCount = result.promoted?.length || 0;
        failCount = result.failed?.length || 0;
      }
      if (failCount === 0) {
        toast.success(`✅ ${successCount} ${terms.students} promoted successfully!`);
      } else {
        toast.warning(`⚠️ ${successCount} promoted, ${failCount} failed.`);
      }
      setSelectedStudentIds([]);
      refetch();
      qc.invalidateQueries({ queryKey: ['students', type] });
      setConfirmDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Bulk promotion failed');
      setConfirmDialog(null);
    },
  });

  // ── 6. Single student promotion ───────────────────────────
  const singlePromote = useMutation({
    mutationFn: ({ studentId }) => 
      studentService.promoteStudent(studentId, {
        targetClassId,
        targetSectionId,
        targetAcademicYearId,
        force: forcePromotion,
      }),
    onSuccess: (_, { studentId }) => {
      const student = students.find(s => s.studentId === studentId);
      toast.success(`${student?.name || 'Student'} promoted successfully`);
      refetch();
      qc.invalidateQueries({ queryKey: ['students', type] });
    },
    onError: (error, { studentId }) => {
      const student = students.find(s => s.studentId === studentId);
      toast.error(`${student?.name || 'Student'}: ${error.message}`);
    },
  });

  // ── 7. Confirm promotion dialog ───────────────────────────
  const handlePromoteClick = () => {
    if (!targetClassId || !targetSectionId || !targetAcademicYearId) {
      toast.error('Please select target class, section and academic year');
      return;
    }
    const count = selectedStudentIds.length || totalCount;
    if (count === 0) {
      toast.error('No students to promote');
      return;
    }
    setConfirmDialog({
      title: `Promote ${count} ${terms.students}`,
      description: forcePromotion 
        ? `⚠️ Force promotion enabled. Students will be promoted even if they failed exams.`
        : `Only eligible students (passed all exams) will be promoted. ${ineligibleCount} ineligible will be skipped.`,
      confirmLabel: 'Promote',
      variant: forcePromotion ? 'warning' : 'default',
      onConfirm: () => bulkPromote.mutate(),
    });
  };

  // ── 8. DataTable columns ──────────────────────────────────
  const columns = useMemo(() => {
    const cols = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={selectedStudentIds.length === totalCount && totalCount > 0}
            onCheckedChange={(checked) => {
              if (checked) setSelectedStudentIds(students.map(s => s.studentId));
              else setSelectedStudentIds([]);
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedStudentIds.includes(row.original.studentId)}
            onCheckedChange={(checked) => {
              if (checked) setSelectedStudentIds(prev => [...prev, row.original.studentId]);
              else setSelectedStudentIds(prev => prev.filter(id => id !== row.original.studentId));
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'name',
        header: terms.student,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {s.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium">{s.name || '—'}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{s.student?.email || '—'}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rollNo',
        header: terms.rollNumber,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.student?.details?.studentDetails?.roll_no || 
             row.original.student?.registration_no || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">{row.original.student?.phone || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'eligible',
        header: 'Eligibility',
        cell: ({ row }) => {
          const eligible = row.original.eligible;
          const reason = row.original.reason;
          return (
            <SimpleTooltip content={reason || (eligible ? 'Passed all exams' : 'Failed in at least one subject')} side="top">
              <div className="flex items-center gap-1.5">
                {eligible ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle size={10} /> Eligible
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle size={10} /> Not Eligible
                  </Badge>
                )}
                {reason && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                    {reason}
                  </span>
                )}
              </div>
            </SimpleTooltip>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const eligible = row.original.eligible;
          return (
            <div className="flex justify-end">
              <SimpleTooltip
                content={
                  eligible ? 'Promote this student' : 
                  (forcePromotion ? 'Force promote' : 'Not eligible (enable force promotion)')
                }
              >
                <button
                  onClick={() => {
                    if (!targetClassId || !targetSectionId || !targetAcademicYearId) {
                      toast.error('Please select target class, section and academic year first');
                      return;
                    }
                    if (!eligible && !forcePromotion) {
                      toast.error('Student not eligible. Enable Force Promotion to override.');
                      return;
                    }
                    singlePromote.mutate({ studentId: row.original.studentId });
                  }}
                  disabled={singlePromote.isPending}
                  className={cn(
                    'rounded-md px-2 py-1 text-xs transition-colors',
                    (eligible || forcePromotion) 
                      ? 'text-primary hover:bg-primary/10' 
                      : 'text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {singlePromote.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ];
    return cols;
  }, [selectedStudentIds, totalCount, students, targetClassId, targetSectionId, 
      targetAcademicYearId, forcePromotion, singlePromote, terms]);

  // Options for dropdowns
  const academicYearOptions = useMemo(() => 
    academicYearsData?.data?.map(y => ({ value: y.id, label: y.name })) || [],
    [academicYearsData]
  );
  const classOptions = useMemo(() => 
    classesData?.data?.map(c => ({ value: c.id, label: c.name })) || [],
    [classesData]
  );
  const targetClassOptions = useMemo(() => 
    targetClassesData?.data?.map(c => ({ value: c.id, label: c.name })) || [],
    [targetClassesData]
  );
  const sourceSectionOptions = useMemo(() => 
    sourceSections.map(s => ({ value: s.id, label: s.name })) || [],
    [sourceSections]
  );
  const targetSectionOptions = useMemo(() => 
    targetSections.map(s => ({ value: s.id, label: s.name })) || [],
    [targetSections]
  );

  // Permission check
  if (!canDo('students.update')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">You don't have permission to promote students.</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => router.push(`/${type}/students`)} className="hover:text-foreground transition-colors capitalize">
          {terms.students}
        </button>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium">Promote {terms.students}</span>
      </nav>

      <PageHeader
        title={`Promote ${terms.students}`}
        description={`Move ${terms.students.toLowerCase()} to the next class/level based on exam results`}
        actions={
          <button
            onClick={() => router.push(`/${type}/students`)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft size={14} /> Back to {terms.students}
          </button>
        }
      />

      {/* Configuration Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Source Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Current {terms.primaryUnit}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              label="Academic Year"
              value={academicYearId}
              onChange={setAcademicYearId}
              options={academicYearOptions}
              placeholder="Select Academic Year"
            />
            <SelectField
              label={terms.primaryUnit}
              value={classId}
              onChange={setClassId}
              options={classOptions}
              placeholder={`Select ${terms.primaryUnit}`}
              disabled={!academicYearId}
            />
            <SelectField
              label={terms.groupingUnit}
              value={sectionId}
              onChange={setSectionId}
              options={sourceSectionOptions}
              placeholder={`Select ${terms.groupingUnit} (Optional)`}
              disabled={!classId}
            />
          </CardContent>
        </Card>

        {/* Target Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Promote To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              label="Target Academic Year"
              value={targetAcademicYearId}
              onChange={setTargetAcademicYearId}
              options={academicYearOptions}
              placeholder="Select Target Year"
            />
            <SelectField
              label={`Target ${terms.primaryUnit}`}
              value={targetClassId}
              onChange={setTargetClassId}
              options={targetClassOptions}
              placeholder={`Select ${terms.primaryUnit}`}
              disabled={!targetAcademicYearId}
            />
            <SelectField
              label={`Target ${terms.groupingUnit}`}
              value={targetSectionId}
              onChange={setTargetSectionId}
              options={targetSectionOptions}
              placeholder={`Select ${terms.groupingUnit}`}
              disabled={!targetClassId}
            />
          </CardContent>
        </Card>
      </div>

      {/* Force Promotion Toggle */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Force Promotion</p>
              <p className="text-xs text-muted-foreground">
                When enabled, students will be promoted regardless of exam results.
              </p>
            </div>
          </div>
          <button
            onClick={() => setForcePromotion(!forcePromotion)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              forcePromotion ? "bg-amber-500" : "bg-gray-300"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              forcePromotion ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {classId && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard
            label={`Total ${terms.students}`}
            value={totalCount}
            icon={<Users size={18} />}
            loading={isLoading}
          />
          <StatsCard
            label="Eligible for Promotion"
            value={eligibleCount}
            icon={<CheckCircle size={18} className="text-emerald-600" />}
            description="Passed all exams"
            loading={isLoading}
          />
          <StatsCard
            label="Not Eligible"
            value={ineligibleCount}
            icon={<XCircle size={18} className="text-red-500" />}
            description="Failed in one or more subjects"
            loading={isLoading}
          />
        </div>
      )}

      {/* Students Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage={!classId ? `Select a ${terms.primaryUnit.toLowerCase()} to view ${terms.students.toLowerCase()}` : `No ${terms.students.toLowerCase()} found in this class`}
        enableRowSelection={false}
        enableColumnVisibility
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              onClick={handlePromoteClick}
              disabled={!targetClassId || !targetSectionId || !targetAcademicYearId || totalCount === 0 || bulkPromote.isPending}
              className="gap-1.5"
            >
              {bulkPromote.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              Promote {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : `All (${totalCount})`}
            </Button>
          </div>
        }
        pagination={null}
      />

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          loading={bulkPromote.isPending}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
        />
      )}
    </div>
  );
}