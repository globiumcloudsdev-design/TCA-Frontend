// // src/app/teacher/assignments/page.jsx
// 'use client';

// import { useMemo, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { 
//   ClipboardList, PlusCircle, CheckCircle2, Clock, Award, 
//   CalendarIcon, Pencil, Trash2, Paperclip, ExternalLink, 
//   FileText, PlayCircle, Image as ImageIcon, X, ChevronRight 
// } from 'lucide-react';
// import { getPortalTerms } from '@/constants/portalInstituteConfig';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import AppModal from '@/components/common/AppModal';
// import ConfirmDialog from '@/components/common/ConfirmDialog';
// import InputField from '@/components/common/InputField';
// import SelectField from '@/components/common/SelectField';
// import SwitchField from '@/components/common/SwitchField';
// import TextareaField from '@/components/common/TextareaField';
// import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
// import { teacherPortalService } from '@/services/teacherPortalService';
// import { format, parseISO } from 'date-fns';
// import useAuthStore from '@/store/authStore';

// const STATUS_MAP = {
//   active: { label: 'Active', icon: Clock, classes: 'bg-blue-100 text-blue-700' },
//   submitted: { label: 'In Progress', icon: CheckCircle2, classes: 'bg-amber-100 text-amber-700' },
//   graded: { label: 'Graded', icon: Award, classes: 'bg-emerald-100 text-emerald-700' },
//   draft: { label: 'Draft', icon: Pencil, classes: 'bg-slate-100 text-slate-600' },
// };

// const SUBJECT_COLORS = [
//   'bg-blue-50/50 border-blue-100', 'bg-violet-50/50 border-violet-100',
//   'bg-emerald-50/50 border-emerald-100', 'bg-amber-50/50 border-amber-100',
// ];

// const EMPTY_FORM = {
//   title: '', subject: '', class_id: '', section_id: '',
//   description: '', due_date: '', total_marks: ''
// };

// const asText = (value) => String(value ?? '').trim();

// const getFileType = (url) => {
//   if (!url) return 'file';
//   const ext = url.split('.').pop().toLowerCase();
//   if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
//   if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
//   if (ext === 'pdf' || url.includes('/raw/upload')) return 'pdf';
//   return 'file';
// };

// export default function TeacherAssignmentsPage() {
//   const user = useAuthStore((state) => state.user);
//   const t = getPortalTerms(user?.institute_type || 'school');
//   const { classes } = useTeacherClasses();
//   const { assignments, loading, createAssignment, updateAssignment, deleteAssignment } = useTeacherAssignments({ type: 'assignment' });

//   const [modalOpen, setModalOpen] = useState(false);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [files, setFiles] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [publishNow, setPublishNow] = useState(true);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [activeAttachmentView, setActiveAttachmentView] = useState(null);
//   const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);
//   const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

//   const existingAttachments = useMemo(() => {
//     if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
//     return editingItem.attachments.map((file, idx) => ({
//       id: file?.id || `${idx}`,
//       name: file?.name || file?.filename || `File ${idx + 1}`,
//       url: file?.url || file?.file_url || null,
//       type: getFileType(file?.url || file?.file_url)
//     }));
//   }, [editingItem]);

//   const normalizedClasses = useMemo(() => classes.map(cls => ({
//     ...cls,
//     class_id: asText(cls.class_id || cls.id),
//     class_name: cls.class_name || cls.name,
//     sections: Array.isArray(cls.sections) ? cls.sections : [],
//     subjects: Array.isArray(cls.subjects) ? cls.subjects : []
//   })), [classes]);

//   const selectedClass = normalizedClasses.find(c => c.class_id === form.class_id);
//   const sectionOptions = selectedClass?.sections || [];
//   const subjectOptions = selectedClass?.subjects || [];

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title || !form.subject || !form.class_id || !form.due_date) {
//       toast.error('Please fill required fields'); return;
//     }
//     setSaving(true);
//     try {
//       const payload = {
//         ...form,
//         type: 'assignment',
//         status: publishNow ? 'published' : 'draft',
//         is_published: publishNow,
//         remove_attachments: JSON.stringify(removedAttachmentIds)
//       };
//       const formData = teacherPortalService.prepareAssignmentFormData(payload, files);
//       if (editingItem?.id) await updateAssignment(editingItem.id, formData);
//       else await createAssignment(formData);
      
//       toast.success(editingItem ? 'Assignment updated' : 'Assignment created');
//       setModalOpen(false);
//       setForm(EMPTY_FORM);
//       setRemovedAttachmentIds([]);
//       setFiles([]);
//     } catch (err) {
//       toast.error('Operation failed');
//     } finally { setSaving(false); }
//   };

//   const formatSafeDate = (v) => v ? format(parseISO(v.split('T')[0]), 'dd MMM yyyy') : 'N/A';

//   return (
//     <div className="space-y-6 max-w-4xl mx-auto">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900">
//             <ClipboardList className="w-7 h-7 text-blue-600" /> {t.assignmentsLabel}
//           </h1>
//           <p className="text-sm text-slate-500 mt-1 tracking-tight">Track and manage student submissions efficiently.</p>
//         </div>
//         <Button className="bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setPublishNow(true); setFiles([]); setRemovedAttachmentIds([]); setModalOpen(true); }}>
//           <PlusCircle className="w-4 h-4 mr-2" /> New Assignment
//         </Button>
//       </div>

//       {/* ── View Modal (Multi-media) ── */}
//       <AppModal open={isAttachmentViewOpen} onClose={() => setIsAttachmentViewOpen(false)} title={activeAttachmentView?.title} size="xl">
//         {activeAttachmentView && (
//           <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
//             <div className="w-full md:w-[200px] border-r pr-2 overflow-y-auto flex-shrink-0">
//               <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-1">Attachments</p>
//               <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
//                 {activeAttachmentView.materials.map((m) => (
//                   <button key={m.id} onClick={() => setActiveAttachmentView(p => ({ ...p, activeUrl: m.url, activeType: m.type }))}
//                     className={`flex-shrink-0 md:w-full p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${activeAttachmentView.activeUrl === m.url ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'bg-white hover:bg-slate-50'}`}>
//                     {m.type === 'image' ? <ImageIcon className="w-4 h-4 text-pink-500" /> : m.type === 'video' ? <PlayCircle className="w-4 h-4 text-orange-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
//                     <span className="text-[11px] font-bold truncate">{m.name}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative border shadow-inner">
//               {activeAttachmentView.activeUrl ? (
//                 <>
//                   {activeAttachmentView.activeType === 'image' ? <img src={activeAttachmentView.activeUrl} className="max-w-full max-h-full object-contain" alt="Preview" /> :
//                    activeAttachmentView.activeType === 'video' ? <video src={activeAttachmentView.activeUrl} controls className="w-full h-full" /> :
//                    <iframe src={`${activeAttachmentView.activeUrl}#toolbar=1&view=FitH`} className="w-full h-full border-none" title="PDF" />}
//                   <a href={activeAttachmentView.activeUrl} target="_blank" className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white text-[10px] font-bold backdrop-blur-md border border-white/20">FULL SCREEN</a>
//                 </>
//               ) : <p className="text-white/40 text-xs italic font-medium">Select a file to preview</p>}
//             </div>
//           </div>
//         )}
//       </AppModal>

//       {/* ── Edit/Create Modal ── */}
//       <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Update Assignment' : 'Create Assignment'} size="md">
//         <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
//           <InputField label="Assignment Title" required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          
//           <div className="grid grid-cols-2 gap-3">
//             <SelectField label="Class" value={form.class_id} onChange={(v) => setForm(p => ({ ...p, class_id: v, section_id: '', subject: '' }))} options={normalizedClasses.map(c => ({ value: c.class_id, label: c.class_name }))} />
//             <SelectField label="Subject" value={form.subject} onChange={(v) => setForm(p => ({ ...p, subject: v }))} options={subjectOptions.map(s => ({ value: s, label: s }))} />
//           </div>

//           <TextareaField label="Instructions" rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />

//           {editingItem && existingAttachments.length > removedAttachmentIds.length && (
//             <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
//               <p className="text-[10px] font-bold text-slate-400 uppercase">Manage Existing Files</p>
//               {existingAttachments.filter(f => !removedAttachmentIds.includes(f.id)).map(f => (
//                 <div key={f.id} className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
//                   <div className="flex items-center gap-2 min-w-0">
//                     <Paperclip className="w-3.5 h-3.5 text-slate-400" />
//                     <span className="text-xs font-bold truncate">{f.name}</span>
//                   </div>
//                   <button type="button" onClick={() => setRemovedAttachmentIds(p => [...p, f.id])} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="space-y-1.5">
//             <Label>New Attachments</Label>
//             <label className="flex items-center gap-2 h-10 border-2 border-dashed rounded-xl px-3 cursor-pointer hover:bg-slate-50 transition-all border-slate-200">
//               <PlusCircle className="w-4 h-4 text-slate-400" />
//               <span className="text-xs text-slate-500 font-medium">{files.length ? `${files.length} files selected` : 'Drop files here or click to upload'}</span>
//               <input type="file" className="hidden" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
//             </label>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//              <div className="space-y-1.5">
//                <Label>Due Date</Label>
//                <input type="date" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 ring-blue-100 outline-none transition-all" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} />
//              </div>
//              <InputField label="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm(p => ({ ...p, total_marks: e.target.value }))} />
//           </div>

//           <SwitchField label="Publish Instantly" value={publishNow} onChange={setPublishNow} hint="Disable to save as draft (not visible to students)" />

//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
//             <Button className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Assignment'}</Button>
//           </div>
//         </form>
//       </AppModal>

//       {/* ── Assignment Cards ── */}
//       <div className="space-y-4">
//         {assignments.map((asgn, i) => {
//           const submitted = asgn.stats?.submitted || 0;
//           const total = asgn.stats?.total_students || 1;
//           const pct = Math.round((submitted / total) * 100);
//           const status = asgn.is_published ? (submitted > 0 ? 'submitted' : 'active') : 'draft';
//           const sm = STATUS_MAP[status];
//           const Icon = sm.icon;

//           return (
//             <div key={asgn.id} className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
//               <div className="flex justify-between items-start">
//                  <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 uppercase tracking-wider">{asgn.subject}</span>
//                       <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${sm.classes}`}><Icon className="w-2.5 h-2.5" /> {sm.label}</span>
//                     </div>
//                     <h3 className="font-extrabold text-slate-800 text-base truncate">{asgn.title}</h3>
//                     <p className="text-xs text-slate-500 mt-1 line-clamp-1">{asgn.description || 'No instructions provided'}</p>
//                  </div>
//                  <div className="flex items-center gap-2 ml-4">
//                     <Button variant="outline" size="sm" className="h-8 rounded-lg bg-white" onClick={() => {
//                         const mats = (asgn.attachments || []).map((f, idx) => ({ id: f.id || idx, name: f.name || 'File', url: f.url || f.file_url, type: getFileType(f.url || f.file_url) }));
//                         setActiveAttachmentView({ title: asgn.title, materials: mats, activeUrl: mats[0]?.url, activeType: mats[0]?.type });
//                         setIsAttachmentViewOpen(true);
//                     }} disabled={!asgn.attachments?.length}>
//                       <Paperclip className="w-3 h-3 mr-1.5" /> {asgn.attachments?.length || 0}
//                     </Button>
//                     <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg bg-white" onClick={() => {
//                         setEditingItem(asgn);
//                         setRemovedAttachmentIds([]);
//                         setPublishNow(asgn.is_published);
//                         setForm({ title: asgn.title, subject: asgn.subject, class_id: asgn.class_id, section_id: asgn.section_id || '', description: asgn.description || '', due_date: asgn.due_date?.split('T')[0], total_marks: asgn.total_marks });
//                         setModalOpen(true);
//                     }}><Pencil className="w-3 h-3" /></Button>
//                     <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setDeleteTarget(asgn)}><Trash2 className="w-3 h-3" /></Button>
//                  </div>
//               </div>

//               {/* Progress Bar Section */}
//               <div className="mt-5 space-y-2">
//                 <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-400">
//                   <span>Submission Progress</span>
//                   <span className="text-slate-700">{submitted} / {total} Students</span>
//                 </div>
//                 <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden">
//                   <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
//                 </div>
//               </div>

//               <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-3">
//                  <div className="flex gap-4">
//                     <span>DUE: <span className="text-red-500">{formatSafeDate(asgn.due_date)}</span></span>
//                     <span>MARKS: <span className="text-slate-800">{asgn.total_marks || 'N/A'}</span></span>
//                  </div>
//                  <div className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">View Submissions <ChevronRight className="w-3 h-3" /></div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { await deleteAssignment(deleteTarget.id); setDeleteTarget(null); }} title="Delete Assignment?" description="This action cannot be undone." />
//     </div>
//   );
// }




// src/app/teacher/assignments/page.jsx

'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  ClipboardList, PlusCircle, CheckCircle2, Clock, Award, 
  CalendarIcon, Pencil, Trash2, Paperclip, ExternalLink, 
  FileText, PlayCircle, Image as ImageIcon, X, ChevronRight,
  Upload, Download, Eye, MessageSquare, Settings, Users,
  BookOpen, GraduationCap, Building2, School, Library,
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { getPortalTerms, getInstituteTypeConfig } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import SwitchField from '@/components/common/SwitchField';
import TextareaField from '@/components/common/TextareaField';
import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
import { teacherPortalService } from '@/services/teacherPortalService';
import { format, parseISO } from 'date-fns';
import useAuthStore from '@/store/authStore';

const STATUS_MAP = {
  active: { label: 'Active', icon: Clock, classes: 'bg-blue-100 text-blue-700' },
  submitted: { label: 'In Progress', icon: CheckCircle2, classes: 'bg-amber-100 text-amber-700' },
  graded: { label: 'Graded', icon: Award, classes: 'bg-emerald-100 text-emerald-700' },
  draft: { label: 'Draft', icon: Pencil, classes: 'bg-slate-100 text-slate-600' },
};

const SUBJECT_COLORS = [
  'bg-blue-50/50 border-blue-100', 'bg-violet-50/50 border-violet-100',
  'bg-emerald-50/50 border-emerald-100', 'bg-amber-50/50 border-amber-100',
];

const EMPTY_FORM = {
  title: '', subject: '', class_id: '', section_id: '', batch_id: '', program_id: '',
  description: '', instructions: '', due_date: '', due_time: '', total_marks: '', passing_marks: '',
  difficulty_level: 'intermediate', estimated_time: '', allow_late_submission: false,
  late_submission_penalty: 0, max_files: 10, max_file_size: 50, grading_type: 'marks'
};

const asText = (value) => String(value ?? '').trim();

const getFileType = (url) => {
  if (!url) return 'file';
  const ext = url.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  if (ext === 'pdf' || url.includes('/raw/upload')) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  return 'file';
};

export default function TeacherAssignmentsPage() {
  const user = useAuthStore((state) => state.user);
  const instituteType = user?.institute_type || 'school';
  const config = getInstituteTypeConfig(instituteType);
  const t = getPortalTerms(instituteType);
  
  const { classes, batches, programs, loading: classesLoading } = useTeacherClasses();
  const { assignments, loading, createAssignment, updateAssignment, deleteAssignment } = useTeacherAssignments({ type: 'assignment' });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [publishNow, setPublishNow] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeAttachmentView, setActiveAttachmentView] = useState(null);
  const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const existingAttachments = useMemo(() => {
    if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
    return editingItem.attachments.map((file, idx) => ({
      id: file?.id || `${idx}`,
      name: file?.name || file?.filename || `File ${idx + 1}`,
      url: file?.url || file?.file_url || null,
      type: getFileType(file?.url || file?.file_url)
    }));
  }, [editingItem]);

  const normalizedClasses = useMemo(() => {
    if (!classes) return [];
    return classes.map(cls => ({
      ...cls,
      class_id: asText(cls.class_id || cls.id),
      class_name: cls.class_name || cls.name,
      sections: Array.isArray(cls.sections) ? cls.sections : [],
      subjects: Array.isArray(cls.subjects) ? cls.subjects : []
    }));
  }, [classes]);

  const normalizedBatches = useMemo(() => {
    if (!batches) return [];
    return batches.map(batch => ({
      ...batch,
      batch_id: asText(batch.batch_id || batch.id),
      batch_name: batch.batch_name || batch.name
    }));
  }, [batches]);

  const normalizedPrograms = useMemo(() => {
    if (!programs) return [];
    return programs.map(program => ({
      ...program,
      program_id: asText(program.program_id || program.id),
      program_name: program.program_name || program.name
    }));
  }, [programs]);

  const selectedClass = normalizedClasses.find(c => c.class_id === form.class_id);
  const sectionOptions = selectedClass?.sections || [];
  const subjectOptions = selectedClass?.subjects || [];
  
  const selectedBatch = normalizedBatches.find(b => b.batch_id === form.batch_id);
  const selectedProgram = normalizedPrograms.find(p => p.program_id === form.program_id);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation based on institute type
    if (!form.title) {
      toast.error('Please enter assignment title');
      return;
    }
    
    if (config.hasSubjects && !form.subject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (config.hasClasses && !form.class_id && !form.batch_id && !form.program_id) {
      toast.error(`Please select a ${config.classLabel.toLowerCase()}`);
      return;
    }
    
    if (!form.due_date) {
      toast.error('Please select due date');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        ...form,
        type: 'assignment',
        status: publishNow ? 'published' : 'draft',
        is_published: publishNow,
        remove_attachments: JSON.stringify(removedAttachmentIds),
        institute_type: instituteType
      };
      
      const formData = teacherPortalService.prepareAssignmentFormData(payload, files);
      
      if (editingItem?.id) {
        await updateAssignment(editingItem.id, formData);
        toast.success('Assignment updated successfully');
      } else {
        await createAssignment(formData);
        toast.success('Assignment created successfully');
      }
      
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setRemovedAttachmentIds([]);
      setFiles([]);
      setEditingItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { 
      setSaving(false); 
    }
  };

  const formatSafeDate = (v) => v ? format(parseISO(v.split('T')[0]), 'dd MMM yyyy') : 'N/A';
  
  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionsModalOpen(true);
  };
  
  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900">
            <ClipboardList className="w-7 h-7 text-blue-600" /> 
            {t.assignmentsLabel || 'Assignments'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 tracking-tight">
            {config.assignmentDescription || 'Track and manage student submissions efficiently.'}
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 shadow-md" 
          onClick={() => { 
            setEditingItem(null); 
            setForm(EMPTY_FORM); 
            setPublishNow(true); 
            setFiles([]); 
            setRemovedAttachmentIds([]); 
            setModalOpen(true); 
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> 
          New {config.assignmentLabel || 'Assignment'}
        </Button>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No assignments created yet</p>
            <Button variant="link" onClick={() => setModalOpen(true)} className="mt-2">
              Create your first assignment
            </Button>
          </div>
        ) : (
          assignments.map((asgn, i) => {
            const submitted = asgn.stats?.submitted || 0;
            const total = asgn.stats?.total_students || 1;
            const pct = Math.round((submitted / total) * 100);
            const status = asgn.is_published ? (submitted > 0 ? 'submitted' : 'active') : 'draft';
            const sm = STATUS_MAP[status];
            const Icon = sm.icon;

            return (
              <AssignmentCard
                key={asgn.id}
                assignment={asgn}
                status={status}
                sm={sm}
                Icon={Icon}
                submitted={submitted}
                total={total}
                pct={pct}
                config={config}
                onViewAttachments={() => {
                  const mats = (asgn.attachments || []).map((f, idx) => ({ 
                    id: f.id || idx, 
                    name: f.name || 'File', 
                    url: f.url || f.file_url, 
                    type: getFileType(f.url || f.file_url) 
                  }));
                  setActiveAttachmentView({ 
                    title: asgn.title, 
                    materials: mats, 
                    activeUrl: mats[0]?.url, 
                    activeType: mats[0]?.type 
                  });
                  setIsAttachmentViewOpen(true);
                }}
                onEdit={() => {
                  setEditingItem(asgn);
                  setRemovedAttachmentIds([]);
                  setPublishNow(asgn.is_published);
                  setForm({ 
                    title: asgn.title, 
                    subject: asgn.subject, 
                    class_id: asgn.class_id, 
                    section_id: asgn.section_id || '',
                    batch_id: asgn.batch_id || '',
                    program_id: asgn.program_id || '',
                    description: asgn.description || '',
                    instructions: asgn.instructions || '',
                    due_date: asgn.due_date?.split('T')[0], 
                    due_time: asgn.due_time || '',
                    total_marks: asgn.total_marks,
                    passing_marks: asgn.passing_marks,
                    difficulty_level: asgn.difficulty_level || 'intermediate',
                    estimated_time: asgn.estimated_time || '',
                    allow_late_submission: asgn.allow_late_submission || false,
                    late_submission_penalty: asgn.late_submission_penalty || 0,
                    max_files: asgn.max_files || 10,
                    max_file_size: asgn.max_file_size || 50,
                    grading_type: asgn.grading_type || 'marks'
                  });
                  setModalOpen(true);
                }}
                onDelete={() => setDeleteTarget(asgn)}
                onViewSubmissions={() => handleViewSubmissions(asgn)}
              />
            );
          })
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        setForm={setForm}
        files={files}
        setFiles={setFiles}
        saving={saving}
        publishNow={publishNow}
        setPublishNow={setPublishNow}
        editingItem={editingItem}
        existingAttachments={existingAttachments}
        removedAttachmentIds={removedAttachmentIds}
        setRemovedAttachmentIds={setRemovedAttachmentIds}
        onSubmit={handleFormSubmit}
        config={config}
        t={t}
        classes={normalizedClasses}
        batches={normalizedBatches}
        programs={normalizedPrograms}
        sectionOptions={sectionOptions}
        subjectOptions={subjectOptions}
        selectedClass={selectedClass}
        selectedBatch={selectedBatch}
        selectedProgram={selectedProgram}
      />

      {/* Submissions Modal */}
      <SubmissionsModal
        open={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        assignment={selectedAssignment}
        onGradeSubmission={handleGradeSubmission}
        config={config}
      />

      {/* Grading Modal */}
      <GradingModal
        open={gradingModalOpen}
        onClose={() => setGradingModalOpen(false)}
        submission={selectedSubmission}
        assignment={selectedAssignment}
        config={config}
      />

      {/* Attachment Viewer Modal */}
      <AttachmentViewerModal
        open={isAttachmentViewOpen}
        onClose={() => setIsAttachmentViewOpen(false)}
        activeAttachmentView={activeAttachmentView}
        setActiveAttachmentView={setActiveAttachmentView}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={async () => { 
          await deleteAssignment(deleteTarget.id); 
          setDeleteTarget(null); 
        }} 
        title="Delete Assignment?" 
        description="This action cannot be undone. All submissions will also be deleted." 
      />
    </div>
  );
}

// Assignment Card Component
function AssignmentCard({ 
  assignment, status, sm, Icon, submitted, total, pct, config,
  onViewAttachments, onEdit, onDelete, onViewSubmissions
}) {
  const hasAttachments = assignment.attachments?.length > 0;
  
  return (
    <div className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all ${
      SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]
    }`}>
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 uppercase tracking-wider">
              {assignment.subject || config.defaultSubject || 'Subject'}
            </span>
            <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${sm.classes}`}>
              <Icon className="w-2.5 h-2.5" /> {sm.label}
            </span>
            {assignment.difficulty_level && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                assignment.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                assignment.difficulty_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                assignment.difficulty_level === 'advanced' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {assignment.difficulty_level}
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-slate-800 text-base truncate">{assignment.title}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{assignment.description || 'No description provided'}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm" className="h-8 rounded-lg bg-white" onClick={onViewAttachments} disabled={!hasAttachments}>
            <Paperclip className="w-3 h-3 mr-1.5" /> {assignment.attachments?.length || 0}
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg bg-white" onClick={onEdit}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 space-y-2">
        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Submission Progress</span>
          <span className="text-slate-700">{submitted} / {total} Students</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-3 flex-wrap gap-2">
        <div className="flex gap-4 flex-wrap">
          <span>DUE: <span className="text-red-500">{format(parseISO(assignment.due_date), 'dd MMM yyyy')}</span></span>
          <span>MARKS: <span className="text-slate-800">{assignment.total_marks || 'N/A'}</span></span>
          {assignment.estimated_time && (
            <span>⏱️ {assignment.estimated_time} min</span>
          )}
        </div>
        <button 
          onClick={onViewSubmissions}
          className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
        >
          View Submissions <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Assignment Modal Component (Simplified version)
function AssignmentModal({
  open, onClose, form, setForm, files, setFiles, saving, publishNow, setPublishNow,
  editingItem, existingAttachments, removedAttachmentIds, setRemovedAttachmentIds,
  onSubmit, config, t, classes, batches, programs, sectionOptions, subjectOptions
}) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('basic');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getTargetOptions = () => {
    if (config.structure === 'classes-sections') return classes;
    if (config.structure === 'batches') return batches;
    if (config.structure === 'programs') return programs;
    return [];
  };

  const getTargetLabel = () => {
    if (config.structure === 'classes-sections') return config.classLabel;
    if (config.structure === 'batches') return 'Batch';
    if (config.structure === 'programs') return 'Program';
    return 'Target';
  };

  const getTargetValue = () => {
    if (config.structure === 'classes-sections') return form.class_id;
    if (config.structure === 'batches') return form.batch_id;
    if (config.structure === 'programs') return form.program_id;
    return '';
  };

  const setTargetValue = (value) => {
    if (config.structure === 'classes-sections') setForm({ ...form, class_id: value });
    if (config.structure === 'batches') setForm({ ...form, batch_id: value });
    if (config.structure === 'programs') setForm({ ...form, program_id: value });
  };

  return (
    <AppModal open={open} onClose={onClose} title={editingItem ? 'Update Assignment' : 'Create Assignment'} size="lg">
      <form onSubmit={onSubmit} className="space-y-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="grading">Grading</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <InputField 
              label="Assignment Title" 
              required 
              value={form.title} 
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} 
              placeholder="Enter assignment title"
            />
            
            {config.hasSubjects && subjectOptions.length > 0 && (
              <SelectField 
                label="Subject" 
                required 
                value={form.subject} 
                onChange={(v) => setForm(p => ({ ...p, subject: v }))} 
                options={subjectOptions.map(s => ({ value: s, label: s }))}
                placeholder="Select subject"
              />
            )}
            
            {getTargetOptions().length > 0 && (
              <SelectField 
                label={getTargetLabel()} 
                required 
                value={getTargetValue()} 
                onChange={setTargetValue} 
                options={getTargetOptions().map(item => ({ 
                  value: item.class_id || item.batch_id || item.program_id, 
                  label: item.class_name || item.batch_name || item.program_name 
                }))}
                placeholder={`Select ${getTargetLabel().toLowerCase()}`}
              />
            )}
            
            {config.hasSections && sectionOptions.length > 0 && (
              <SelectField 
                label="Section" 
                value={form.section_id} 
                onChange={(v) => setForm(p => ({ ...p, section_id: v }))} 
                options={sectionOptions.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select section (optional)"
              />
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Due Date *</Label>
                <input 
                  type="date" 
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 ring-blue-100 outline-none transition-all" 
                  value={form.due_date} 
                  onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} 
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Time (Optional)</Label>
                <input 
                  type="time" 
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 ring-blue-100 outline-none transition-all" 
                  value={form.due_time} 
                  onChange={(e) => setForm(p => ({ ...p, due_time: e.target.value }))} 
                />
              </div>
            </div>
            
            <SelectField 
              label="Difficulty Level" 
              value={form.difficulty_level} 
              onChange={(v) => setForm(p => ({ ...p, difficulty_level: v }))} 
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
                { value: 'expert', label: 'Expert' }
              ]}
            />
            
            <InputField 
              label="Estimated Time (minutes)" 
              type="number" 
              value={form.estimated_time} 
              onChange={(e) => setForm(p => ({ ...p, estimated_time: e.target.value }))} 
              placeholder="e.g., 30"
            />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4 pt-4">
            <TextareaField 
              label="Description" 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} 
              placeholder="Describe what students need to do..."
            />
            
            <TextareaField 
              label="Instructions" 
              rows={4} 
              value={form.instructions} 
              onChange={(e) => setForm(p => ({ ...p, instructions: e.target.value }))} 
              placeholder="Provide detailed instructions, formatting requirements, submission guidelines..."
            />
            
            {/* Existing Attachments */}
            {editingItem && existingAttachments.length > removedAttachmentIds.length && (
              <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Current Attachments</p>
                {existingAttachments.filter(f => !removedAttachmentIds.includes(f.id)).map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {f.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-pink-500" /> :
                       f.type === 'pdf' ? <FileText className="w-3.5 h-3.5 text-red-500" /> :
                       <Paperclip className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-xs font-medium truncate">{f.name}</span>
                    </div>
                    <button type="button" onClick={() => setRemovedAttachmentIds(p => [...p, f.id])} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* New Attachments */}
            <div className="space-y-1.5">
              <Label>New Attachments</Label>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileSelect} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to upload files</p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, Images, Documents, Videos (Max {form.max_file_size}MB each, up to {form.max_files} files)
                </p>
              </button>
              
              {/* File List */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Grading Tab */}
          <TabsContent value="grading" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField 
                label="Total Marks" 
                type="number" 
                value={form.total_marks} 
                onChange={(e) => setForm(p => ({ ...p, total_marks: e.target.value }))} 
                placeholder="e.g., 100"
              />
              <InputField 
                label="Passing Marks" 
                type="number" 
                value={form.passing_marks} 
                onChange={(e) => setForm(p => ({ ...p, passing_marks: e.target.value }))} 
                placeholder="e.g., 40"
              />
            </div>
            
            <SelectField 
              label="Grading Type" 
              value={form.grading_type} 
              onChange={(v) => setForm(p => ({ ...p, grading_type: v }))} 
              options={[
                { value: 'marks', label: 'Marks Only' },
                { value: 'grades', label: 'Grades (A-F)' },
                { value: 'pass_fail', label: 'Pass/Fail' }
              ]}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 pt-4">
            <SwitchField 
              label="Allow Late Submissions" 
              value={form.allow_late_submission} 
              onChange={(v) => setForm(p => ({ ...p, allow_late_submission: v }))} 
              hint="Students can submit after due date"
            />
            
            {form.allow_late_submission && (
              <InputField 
                label="Late Submission Penalty (%)" 
                type="number" 
                value={form.late_submission_penalty} 
                onChange={(e) => setForm(p => ({ ...p, late_submission_penalty: e.target.value }))} 
                placeholder="e.g., 10 for 10% deduction"
                hint="Percentage of marks to deduct for late submissions"
              />
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <InputField 
                label="Max Files per Submission" 
                type="number" 
                value={form.max_files} 
                onChange={(e) => setForm(p => ({ ...p, max_files: e.target.value }))} 
              />
              <InputField 
                label="Max File Size (MB)" 
                type="number" 
                value={form.max_file_size} 
                onChange={(e) => setForm(p => ({ ...p, max_file_size: e.target.value }))} 
              />
            </div>
            
            <SwitchField 
              label="Publish Instantly" 
              value={publishNow} 
              onChange={setPublishNow} 
              hint="Disable to save as draft (not visible to students)"
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}

// Submissions Modal Component (Simplified)
function SubmissionsModal({ open, onClose, assignment, onGradeSubmission, config }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const extractSubmissionsList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.submissions)) return payload.submissions;
    if (Array.isArray(payload?.data?.submissions)) return payload.data.submissions;
    return [];
  };

  const normalizeSubmission = (item, index) => {
    const through =
      item?.AssignmentSubmission
      || item?.assignment_submission
      || item?.assignment_submissions
      || item?.AssignmentSubmissions
      || {};
    const status = String(item?.status || through?.status || 'submitted').toLowerCase();
    const files = Array.isArray(item?.files)
      ? item.files
      : Array.isArray(through?.files)
        ? through.files
        : [];
    const studentName =
      item?.student_name
      || [item?.first_name, item?.last_name].filter(Boolean).join(' ').trim()
      || item?.name
      || 'Student';

    return {
      ...item,
      id: through?.id || item?.submission_id || item?.id || `submission-${index}`,
      submission_id: through?.id || item?.submission_id || item?.id,
      student_id: item?.student_id || item?.user_id || item?.id || null,
      student_name: studentName,
      roll_number: item?.roll_number || item?.registration_no || item?.roll_no || 'N/A',
      submitted_at: item?.submitted_at || through?.submitted_at || null,
      marks: item?.marks ?? through?.marks ?? null,
      feedback: item?.feedback ?? through?.feedback ?? '',
      submission_text: item?.submission_text || through?.submission_text || '',
      status,
      files
    };
  };

  useEffect(() => {
    if (open && assignment) {
      fetchSubmissions();
    }
  }, [open, assignment]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await teacherPortalService.getAssignmentSubmissions(assignment.id);
      const normalized = extractSubmissionsList(data).map(normalizeSubmission);
      setSubmissions(normalized);
    } catch (error) {
      toast.error('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'graded') return sub.status === 'graded';
    if (filter === 'pending') return ['submitted', 'late'].includes(sub.status);
    return true;
  });

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => ['submitted', 'late', 'graded'].includes(s.status)).length,
    graded: submissions.filter(s => s.status === 'graded').length,
    pending: submissions.filter(s => ['submitted', 'late'].includes(s.status)).length
  };

  return (
    <AppModal open={open} onClose={onClose} title={`Submissions: ${assignment?.title}`} size="xl">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-blue-600">Total Students</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.submitted}</p>
            <p className="text-xs text-amber-600">Submitted</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
            <p className="text-xs text-green-600">Graded</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
            <p className="text-xs text-red-600">Pending</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          {['all', 'pending', 'graded'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                filter === filterType
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No submissions found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredSubmissions.map(submission => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                assignment={assignment}
                onGrade={() => onGradeSubmission(submission)}
                config={config}
              />
            ))}
          </div>
        )}
      </div>
    </AppModal>
  );
}

// Submission Card Component
function SubmissionCard({ submission, assignment, onGrade, config }) {
  const hasFiles = submission.files?.length > 0;
  const isGraded = submission.status === 'graded';
  const isLate = submission.status === 'late';
  
  return (
    <div className={`p-4 border rounded-xl bg-white hover:shadow-md transition-all ${
      isLate ? 'border-orange-200 bg-orange-50/30' : ''
    }`}>
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-slate-800">{submission.student_name}</h4>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              isGraded ? 'bg-green-100 text-green-700' :
              isLate ? 'bg-orange-100 text-orange-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {isGraded ? 'Graded' : isLate ? 'Late' : 'Pending'}
            </span>
            {isLate && (
              <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Late Submission
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Roll No: {submission.roll_number || 'N/A'}</p>
          <p className="text-xs text-slate-500">Submitted: {submission.submitted_at && format(parseISO(submission.submitted_at), 'dd MMM yyyy, hh:mm a')}</p>
          
          {submission.submission_text && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-1">Submission Notes:</p>
              <p className="text-xs text-slate-500">{submission.submission_text}</p>
            </div>
          )}
          
          {hasFiles && (
            <div className="mt-2 flex flex-wrap gap-2">
              {submission.files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg"
                >
                  <Paperclip className="w-3 h-3" />
                  {file.name}
                </a>
              ))}
            </div>
          )}
          
          {isGraded && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-green-600">Marks Obtained</p>
                  <p className="font-bold text-green-700">{submission.marks}/{assignment?.total_marks}</p>
                </div>
                {submission.grade && (
                  <div>
                    <p className="text-xs text-green-600">Grade</p>
                    <p className="font-bold text-green-700">{submission.grade}</p>
                  </div>
                )}
              </div>
              {submission.feedback && (
                <p className="text-xs text-green-600 mt-1">Feedback: {submission.feedback}</p>
              )}
            </div>
          )}
        </div>
        
        {!isGraded && (
          <Button size="sm" onClick={onGrade} className="bg-blue-600 hover:bg-blue-700">
            <Award className="w-4 h-4 mr-1" /> Grade
          </Button>
        )}
      </div>
    </div>
  );
}

// Grading Modal Component
function GradingModal({ open, onClose, submission, assignment, config }) {
  const [marks, setMarks] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (submission) {
      setMarks(submission.marks || '');
      setGrade(submission.grade || '');
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  const handleSubmit = async () => {
    if (!marks && assignment?.grading_type !== 'pass_fail') {
      toast.error('Please enter marks');
      return;
    }
    
    setSubmitting(true);
    try {
      const submissionId = submission?.submission_id || submission?.id;
      if (!submissionId) {
        throw new Error('Submission id is missing');
      }
      await teacherPortalService.gradeSubmission(submissionId, {
        marks: parseFloat(marks),
        grade,
        feedback,
        assignment_id: assignment?.id,
        student_id: submission?.student_id
      });
      toast.success('Submission graded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to grade submission');
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeOptions = () => {
    if (config.gradingSystem === 'letter') {
      return ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
    } else if (config.gradingSystem === 'percentage') {
      return ['90-100%', '80-89%', '70-79%', '60-69%', '50-59%', 'Below 50%'];
    }
    return [];
  };

  return (
    <AppModal open={open} onClose={onClose} title="Grade Submission" size="md">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-sm font-semibold">Student: {submission?.student_name}</p>
          <p className="text-xs text-slate-500">Assignment: {assignment?.title}</p>
          <p className="text-xs text-slate-500">Submitted: {submission?.submitted_at && format(parseISO(submission.submitted_at), 'dd MMM yyyy, hh:mm a')}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Marks Obtained"
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder={`Max: ${assignment?.total_marks || 'N/A'}`}
            required={assignment?.grading_type !== 'pass_fail'}
          />
          
          {config.gradingSystem !== 'none' && (
            <SelectField
              label="Grade"
              value={grade}
              onChange={setGrade}
              options={getGradeOptions().map(g => ({ value: g, label: g }))}
              placeholder="Select grade"
            />
          )}
        </div>
        
        <TextareaField
          label="Feedback"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide feedback to the student..."
        />
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Grade
          </Button>
        </div>
      </div>
    </AppModal>
  );
}

// Attachment Viewer Modal Component
function AttachmentViewerModal({ open, onClose, activeAttachmentView, setActiveAttachmentView }) {
  if (!activeAttachmentView) return null;

  return (
    <AppModal open={open} onClose={onClose} title={activeAttachmentView.title} size="xl">
      <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
        <div className="w-full md:w-[250px] border-r pr-2 overflow-y-auto flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-1">Attachments ({activeAttachmentView.materials?.length || 0})</p>
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {activeAttachmentView.materials?.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveAttachmentView(p => ({ ...p, activeUrl: m.url, activeType: m.type }))}
                className={`flex-shrink-0 md:w-full p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  activeAttachmentView.activeUrl === m.url 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                {m.type === 'image' ? <ImageIcon className="w-4 h-4 text-pink-500" /> : 
                 m.type === 'video' ? <PlayCircle className="w-4 h-4 text-orange-500" /> : 
                 <FileText className="w-4 h-4 text-blue-500" />}
                <span className="text-[11px] font-medium truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative border shadow-inner">
          {activeAttachmentView.activeUrl ? (
            <>
              {activeAttachmentView.activeType === 'image' ? (
                <img src={activeAttachmentView.activeUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
              ) : activeAttachmentView.activeType === 'video' ? (
                <video src={activeAttachmentView.activeUrl} controls className="w-full h-full" />
              ) : (
                <iframe 
                  src={`${activeAttachmentView.activeUrl}#toolbar=1&view=FitH`} 
                  className="w-full h-full border-none" 
                  title="Document Preview" 
                />
              )}
              <a 
                href={activeAttachmentView.activeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white text-[10px] font-bold backdrop-blur-md border border-white/20"
              >
                <ExternalLink className="w-3 h-3 inline mr-1" /> Full Screen
              </a>
            </>
          ) : (
            <p className="text-white/40 text-xs italic font-medium">Select a file to preview</p>
          )}
        </div>
      </div>
    </AppModal>
  );
}