// // Frontend/src/app/teacher/homework/page.jsx
// // Teacher Homework / Diary Page
// 'use client';

// import { useMemo, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import {
//   NotebookPen,
//   PlusCircle,
//   CalendarDays,
//   BookOpen,
//   Pencil,
//   Trash2,
//   Paperclip,
//   ExternalLink,
//   FileText,
//   ChevronRight,
// } from 'lucide-react';
// import { getPortalTerms } from '@/constants/portalInstituteConfig';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { format, parseISO } from 'date-fns';
// import { toast } from 'sonner';
// import AppModal from '@/components/common/AppModal';
// import ConfirmDialog from '@/components/common/ConfirmDialog';
// import InputField from '@/components/common/InputField';
// import SelectField from '@/components/common/SelectField';
// import SwitchField from '@/components/common/SwitchField';
// import TextareaField from '@/components/common/TextareaField';
// import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
// import { teacherPortalService } from '@/services/teacherPortalService';
// import TimePickerField from '@/components/common/TimePickerField';
// import DatePickerField from '@/components/common/DatePickerField';
// import useAuthStore from '@/store/authStore';

// const SUBJECT_COLORS = {
//   Mathematics: 'bg-blue-100 text-blue-700 border-blue-200',
//   English: 'bg-violet-100 text-violet-700 border-violet-200',
//   Science: 'bg-teal-100 text-teal-700 border-teal-200',
//   Urdu: 'bg-emerald-100 text-emerald-700 border-emerald-200',
//   'Art & Craft': 'bg-pink-100 text-pink-700 border-pink-200',
// };

// const today = () => new Date().toISOString().split('T')[0];

// const asText = (value) => String(value ?? '').trim();

// const EMPTY_HW = {
//   title: '',
//   subject: '',
//   class_id: '',
//   section_id: '',
//   description: '',
//   date: today(),
//   due_date: '',
//   due_time: '',
// };

// export default function TeacherHomeworkPage() {
//   const user = useAuthStore((state) => state.user);
//   const t = getPortalTerms(user?.institute_type || 'school');

//   const { classes } = useTeacherClasses();
//   const {
//     assignments: homework,
//     loading,
//     createAssignment,
//     updateAssignment,
//     deleteAssignment,
//   } = useTeacherAssignments({ type: 'homework' });

//   const {
//     control,
//     watch,
//     setValue,
//     reset,
//     handleSubmit: rhfHandleSubmit,
//   } = useForm({
//     defaultValues: EMPTY_HW,
//   });

//   const form = watch();

//   const [filterSubject, setFilter] = useState('All');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [files, setFiles] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [publishNow, setPublishNow] = useState(true);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [activeAttachmentView, setActiveAttachmentView] = useState(null);
//   const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);
//   const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

//   const existingAttachments = useMemo(() => {
//     if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
//     return editingItem.attachments.map((file, idx) => ({
//       id: file?.id || `${idx}`,
//       name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
//       url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null,
//       type: file?.type || null,
//     }));
//   }, [editingItem]);

//   const existingPdf = existingAttachments.find(
//     (file) =>
//       String(file?.type || '').toLowerCase().includes('pdf') ||
//       String(file?.url || '').toLowerCase().endsWith('.pdf')
//   );

//   const normalizedClasses = useMemo(
//     () =>
//       classes.map((cls) => {
//         const classId = asText(cls.class_id || cls.id);
//         const sections = Array.isArray(cls.sections) && cls.sections.length
//           ? cls.sections
//             .map((section) => ({
//               id: asText(section?.id || section?.section_id),
//               name: section?.name || section?.section_name || 'Section',
//             }))
//             .filter((section) => section.id)
//           : cls.section_id
//             ? [{ id: asText(cls.section_id), name: cls.section_name || 'Section' }]
//             : [];

//         return {
//           ...cls,
//           class_id: classId,
//           class_name: cls.class_name || cls.name,
//           sections,
//           subjects: Array.isArray(cls.subjects) ? cls.subjects : [],
//         };
//       }),
//     [classes]
//   );

//   const classMap = useMemo(
//     () =>
//       normalizedClasses.reduce((acc, cls) => {
//         acc[cls.class_id] = cls;
//         return acc;
//       }, {}),
//     [normalizedClasses]
//   );

//   const resolveClassForItem = (item) => {
//     const itemClassId = asText(item.class_id);
//     const byId = normalizedClasses.find((c) => asText(c.class_id) === itemClassId);
//     if (byId) return byId;

//     const itemClassName = asText(item.class_name || item.class);
//     if (!itemClassName) return null;
//     const normalizedItemClass = itemClassName.toLowerCase().split(' - ')[0].trim();

//     const byName = normalizedClasses.find((c) => {
//       const clsName = asText(c.class_name || c.name).toLowerCase();
//       return (
//         clsName === itemClassName.toLowerCase() ||
//         clsName === normalizedItemClass ||
//         normalizedItemClass.includes(clsName)
//       );
//     });
//     if (byName) return byName;

//     const itemSectionName = asText(item.section_name).toLowerCase();
//     if (!itemSectionName) return null;

//     const bySection = normalizedClasses.find((c) =>
//       (c.sections || []).some((section) => asText(section.name).toLowerCase() === itemSectionName)
//     );
//     return bySection || null;
//   };

//   const resolveSectionIdForItem = (item) => {
//     const cls = resolveClassForItem(item);
//     const options = cls?.sections || [];
//     if (!options.length) return '';

//     const itemSectionId = asText(item.section_id);
//     if (itemSectionId && options.some((section) => asText(section.id) === itemSectionId)) {
//       return itemSectionId;
//     }

//     const byName = options.find(
//       (section) => asText(section.name).toLowerCase() === asText(item.section_name).toLowerCase()
//     );
//     if (byName?.id) return byName.id;

//     return options.length === 1 ? options[0].id : '';
//   };

//   const selectedClass = normalizedClasses.find((cls) => asText(cls.class_id) === asText(form.class_id));
//   const sectionOptions = selectedClass?.sections || [];
//   const subjectOptions = selectedClass?.subjects || [];

//   const fallbackEditSectionOptions = useMemo(() => {
//     if (!editingItem) return sectionOptions;

//     const originalClassId = asText(editingItem.class_id);
//     const currentClassId = asText(form.class_id);

//     if (currentClassId && currentClassId !== originalClassId) return sectionOptions;
//     if (sectionOptions.length > 0) return sectionOptions;

//     const fallbackId = asText(form.section_id || editingItem.section_id || editingItem.section_name);
//     const fallbackName = asText(editingItem.section_name || editingItem.section_id || 'Section');
//     return fallbackId ? [{ id: fallbackId, name: fallbackName }] : [];
//   }, [editingItem, form.class_id, form.section_id, sectionOptions]);

//   const effectiveSectionOptions = fallbackEditSectionOptions;
//   const requiresSection = effectiveSectionOptions.length > 0;

//   const subjects = ['All', ...new Set(homework.map((h) => h.subject).filter(Boolean))];
//   const filtered = filterSubject === 'All' ? homework : homework.filter((h) => h.subject === filterSubject);

//   const grouped = filtered.reduce((acc, hw) => {
//     const key = (hw.assigned_on || hw.created_at || hw.date || '').split('T')[0];
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(hw);
//     return acc;
//   }, {});
//   const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name in EMPTY_HW) {
//       setValue(name, value, { shouldDirty: true, shouldTouch: true });
//     }
//   };

//   const handleFile = (e) => {
//     const picked = Array.from(e.target.files || []);
//     setFiles(picked);
//   };

//   const closeFormModal = () => {
//     setModalOpen(false);
//     setEditingItem(null);
//     setFiles([]);
//     setPublishNow(true);
//     reset(EMPTY_HW);
//   };

//   const openCreateModal = () => {
//     setEditingItem(null);
//     setPublishNow(true);
//     setFiles([]);
//     reset(EMPTY_HW);
//     setModalOpen(true);
//   };

//   const openEditModal = (item) => {
//     const matchedClass = resolveClassForItem(item);
//     const resolvedSectionId = resolveSectionIdForItem(item) || asText(item.section_id || item.section_name);

//     setEditingItem(item);
//     setPublishNow(item.is_published ?? item.status === 'published');
//     reset({
//       title: item.title || '',
//       subject: item.subject || '',
//       class_id: asText(matchedClass?.class_id || item.class_id),
//       section_id: resolvedSectionId,
//       description: item.description || item.instructions || '',
//       date: item.assigned_on ? String(item.assigned_on).split('T')[0] : today(),
//       due_date: item.due_date ? String(item.due_date).split('T')[0] : '',
//       due_time: item.due_time || '',
//     });
//     setFiles([]);
//     setModalOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget?.id) return;
//     setDeleting(true);
//     try {
//       await deleteAssignment(deleteTarget.id);
//       setDeleteTarget(null);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Existing attachments ko delete karne ka function
//   const handleRemoveExistingFile = (id) => {
//     setRemovedAttachmentIds(prev => [...prev, id]);
//   };

//   const onClassChange = (classId) => {
//     const nextClassId = asText(classId);
//     setValue('class_id', nextClassId, { shouldDirty: true, shouldTouch: true });
//     setValue('section_id', '', { shouldDirty: true, shouldTouch: true });
//     setValue('subject', '', { shouldDirty: true, shouldTouch: true });
//   };

//   const formatSafeDate = (value) => {
//     if (!value) return 'N/A';
//     const parsed = new Date(value);
//     if (Number.isNaN(parsed.getTime())) return String(value);
//     return format(parsed, 'dd MMM yyyy');
//   };

//   const openAttachmentView = (item) => {
//     const materials = (Array.isArray(item?.attachments) ? item.attachments : []).map((file, idx) => ({
//       id: file?.id || `${idx}`,
//       name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
//       type: file?.type || null,
//       url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null,
//     }));

//     const pdf = materials.find(
//       (m) =>
//         String(m?.type || '').toLowerCase().includes('pdf') ||
//         String(m?.url || '').toLowerCase().endsWith('.pdf')
//     );

//     setActiveAttachmentView({
//       title: item?.title || 'Homework',
//       className: item?.class_name || classMap[item?.class_id]?.class_name || '-',
//       materials,
//       pdfUrl: pdf?.url || null,
//     });
//     setIsAttachmentViewOpen(true);
//   };

//   const handleFormSubmit = async (values) => {
//     // 1. Basic Validation
//     if (!values.title || !values.subject || !values.class_id || !values.due_date) {
//       toast.error('Please fill all required fields (Title, Class, Subject, Due Date).');
//       return;
//     }

//     // 2. Section Validation (Agar class mein sections hain to select karna lazmi hai)
//     if (requiresSection && !values.section_id) {
//       toast.error('Please select a section for this class.');
//       return;
//     }

//     setSaving(true);
//     try {
//       // 3. Payload Preparation
//       // Note: 'remove_attachments' ko stringify karke bhej rahe hain taake backend ise JSON parse kar sake
//       const payload = {
//         title: values.title,
//         subject: values.subject,
//         class_id: values.class_id,
//         section_id: values.section_id || null,
//         description: values.description || '',
//         assigned_on: values.date || today(),
//         due_date: values.due_date,
//         due_time: values.due_time || null,
//         type: 'homework',
//         status: publishNow ? 'published' : 'draft',
//         is_published: publishNow,
//         // Yeh IDs backend ko batayengi ke kaunsi purani files Cloudinary se delete karni hain
//         remove_attachments: JSON.stringify(removedAttachmentIds),
//       };

//       // 4. Convert to FormData (Files aur Text data ko merge karne ke liye)
//       const formData = teacherPortalService.prepareAssignmentFormData(payload, files);

//       // 5. API Call (Update vs Create)
//       if (editingItem?.id) {
//         // Update existing homework
//         await updateAssignment(editingItem.id, formData);
//         toast.success('Homework updated successfully.');
//       } else {
//         // Create new homework
//         await createAssignment(formData);
//         toast.success('Homework added to diary successfully.');
//       }

//       // 6. Cleanup & Reset
//       setRemovedAttachmentIds([]); // Deletion tracking reset karein
//       setFiles([]); // Newly selected files reset karein
//       closeFormModal(); // Modal close aur form reset karein

//     } catch (error) {
//       console.error('Homework submit error:', error);
//       // Backend se aane wala specific error message ya default generic message
//       const errorMsg = error.response?.data?.message || 'Something went wrong while saving homework.';
//       toast.error(errorMsg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <div className="max-w-3xl mx-auto text-sm text-slate-500">Loading homework...</div>;
//   }

//   return (
//     <div className="space-y-6 max-w-3xl mx-auto">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
//             <NotebookPen className="w-6 h-6 text-blue-600" /> {t.homeworkLabel}
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">
//             Daily {t.homeworkLabel.toLowerCase()} given to your {t.classesLabel.toLowerCase()}
//           </p>
//         </div>

//         <Button
//           className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
//           onClick={openCreateModal}
//         >
//           <PlusCircle className="w-4 h-4" /> Add Homework
//         </Button>
//       </div>

//       {/* Add / Edit Homework Modal */}
//       <AppModal
//         open={modalOpen}
//         onClose={closeFormModal}
//         title={editingItem ? 'Edit Homework / Diary Entry' : 'Add Homework / Diary Entry'}
//         description="This homework will be instantly visible to students in their portal."
//         size="xl"
//         footer={
//           <>
//             <Button variant="outline" onClick={closeFormModal}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               form="homework-form"
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//               disabled={saving}
//             >
//               {saving ? (editingItem ? 'Updating...' : 'Saving...') : (editingItem ? 'Update Homework' : 'Add to Diary')}
//             </Button>
//           </>
//         }
//       >
//         <form id="homework-form" onSubmit={rhfHandleSubmit(handleFormSubmit)} className="space-y-4">
//           <InputField
//             label="Homework Title"
//             name="title"
//             required
//             placeholder="e.g. Read Chapter 4 & answer questions"
//             value={form.title || ''}
//             onChange={handleChange}
//           />

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1.5">
//               <SelectField
//                 label="Class"
//                 name="class_id"
//                 required
//                 value={form.class_id || ''}
//                 onChange={onClassChange}
//                 placeholder="Select Class"
//                 options={normalizedClasses.map((c) => ({
//                   value: c.class_id,
//                   label: c.class_name || c.name,
//                 }))}
//               />
//             </div>

//             <div className="space-y-1.5">
//               <SelectField
//                 label="Subject"
//                 name="subject"
//                 required
//                 value={form.subject || ''}
//                 onChange={(v) => setValue('subject', v, { shouldDirty: true, shouldTouch: true })}
//                 placeholder="Select Subject"
//                 options={subjectOptions.map((s) => ({ value: s, label: s }))}
//               />
//             </div>
//           </div>

//           {effectiveSectionOptions.length > 0 && (
//             <div className="space-y-1.5">
//               <SelectField
//                 label={`Section${requiresSection ? ' *' : ''}`}
//                 name="section_id"
//                 value={form.section_id || ''}
//                 onChange={(v) => setValue('section_id', v, { shouldDirty: true, shouldTouch: true })}
//                 placeholder="Select Section"
//                 options={effectiveSectionOptions.map((section) => ({
//                   value: asText(section.id),
//                   label: section.name,
//                 }))}
//               />
//             </div>
//           )}

//           <TextareaField
//             label="Description / Instructions"
//             name="description"
//             rows={3}
//             placeholder="What exactly do students need to do?"
//             value={form.description || ''}
//             onChange={handleChange}
//             className="resize-none"
//           />

//           <div className="grid grid-cols-3 gap-3">
//             <DatePickerField
//               label="Assigned Date"
//               name="date"
//               control={control}
//               placeholder="Pick a date"
//               fromYear={2020}
//               toYear={2030}
//             />

//             <DatePickerField
//               label="Due Date"
//               name="due_date"
//               control={control}
//               required
//               placeholder="Pick a date"
//               fromYear={2020}
//               toYear={2030}
//             />

//             <div className="space-y-1.5">
//               <Label>Due Time</Label>
//               <TimePickerField
//                 value={form.due_time || ''}
//                 onChange={(value) => setValue('due_time', value, { shouldDirty: true, shouldTouch: true })}
//                 mode="simple"
//                 interval={15}
//                 placeholder="Select Time"
//               />
//             </div>
//           </div>

//           <SwitchField
//             label="Publish Now"
//             name="is_published"
//             value={publishNow}
//             onChange={setPublishNow}
//             hint="Turn off to save as draft"
//           />

//           <div className="space-y-1.5">
//             <Label htmlFor="homework-file">Attach File(s)</Label>
//             <label
//               htmlFor="homework-file"
//               className="flex items-center gap-2 h-9 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
//             >
//               <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
//               <span className="truncate">
//                 {files.length ? `${files.length} file(s) selected` : 'Choose file(s)...'}
//               </span>
//             </label>
//             <input id="homework-file" type="file" className="hidden" onChange={handleFile} multiple />
//           </div>

//           {/* Edit Modal - Inside your form, replace existing attachments section */}
//           {editingItem && existingAttachments.length > 0 && (
//             <div className="space-y-3">
//               <Label className="text-xs font-bold text-slate-500 uppercase">Manage Existing Files</Label>
//               <div className="grid grid-cols-1 gap-2">
//                 {existingAttachments
//                   .filter(file => !removedAttachmentIds.includes(file.id))
//                   .map((file) => (
//                     <div key={file.id} className="group relative flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-all">
//                       <div className="flex items-center gap-2 min-w-0">
//                         <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
//                           <FileText className="w-4 h-4 text-slate-500" />
//                         </div>
//                         <div className="flex flex-col min-w-0">
//                           <span className="text-xs font-bold truncate">{file.name}</span>
//                           <button
//                             type="button"
//                             onClick={() => setEditingItem(prev => ({ ...prev, currentPreview: file.url }))}
//                             className="text-[10px] text-blue-600 font-bold text-left hover:underline"
//                           >
//                             Quick View
//                           </button>
//                         </div>
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() => handleRemoveExistingFile(file.id)}
//                         className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//               </div>

//               {/* Quick Preview Area in Edit Modal */}
//               {editingItem?.currentPreview && (
//                 <div className="mt-4 rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50">
//                   <div className="flex justify-between items-center px-3 py-2 bg-white border-b">
//                     <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Preview</span>
//                     <button
//                       type="button"
//                       onClick={() => setEditingItem(prev => ({ ...prev, currentPreview: null }))}
//                       className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded"
//                     >
//                       CLOSE
//                     </button>
//                   </div>

//                   <div className="p-2 flex items-center justify-center bg-slate-200/50 min-h-[200px]">
//                     {editingItem.currentPreview.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
//                       <img
//                         src={editingItem.currentPreview}
//                         className="max-w-full max-h-[400px] object-contain shadow-md rounded"
//                         alt="Edit Preview"
//                       />
//                     ) : (
//                       <iframe src={editingItem.currentPreview} className="w-full h-96 border-none rounded shadow-md" />
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </form>
//       </AppModal>

//       {/* Subject filters */}
//       <div className="flex flex-wrap gap-2">
//         {subjects.map((s) => (
//           <button
//             key={s}
//             onClick={() => setFilter(s)}
//             className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSubject === s
//               ? 'bg-blue-600 text-white'
//               : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
//               }`}
//           >
//             {s}
//           </button>
//         ))}
//       </div>

//       {/* Grouped diary entries */}
//       {sortedDates.length === 0 ? (
//         <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
//           <NotebookPen className="w-10 h-10 mx-auto mb-2 opacity-30" />
//           <p className="text-sm">No homework entries found.</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {sortedDates.map((date) => (
//             <div key={date}>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
//                   <CalendarDays className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-extrabold text-slate-800">{formatSafeDate(date)}</p>
//                   <p className="text-xs text-slate-400">
//                     {grouped[date].length} homework entr{grouped[date].length !== 1 ? 'ies' : 'y'}
//                   </p>
//                 </div>
//               </div>

//               <div className="ml-3 pl-10 border-l-2 border-blue-100 space-y-3">
//                 {grouped[date].map((hw) => (
//                   <div key={hw.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex-1">
//                         <div className="flex flex-wrap items-center gap-2 mb-1.5">
//                           <span
//                             className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${SUBJECT_COLORS[hw.subject] || 'bg-slate-100 text-slate-600 border-slate-200'
//                               }`}
//                           >
//                             {hw.subject}
//                           </span>
//                           <span className="text-[10px] text-slate-400">
//                             {hw.class_name || classMap[hw.class_id]?.class_name || '-'}
//                           </span>
//                         </div>
//                         <h3 className="text-sm font-extrabold text-slate-800">{hw.title}</h3>
//                         <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
//                           {hw.description || hw.instructions || 'No description provided'}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="mt-3 flex items-center justify-between">
//                       <span className="text-[10px] text-slate-400">
//                         Due: <span className="font-semibold text-red-600">{formatSafeDate(hw.due_date)}</span>
//                       </span>

//                       <div className="flex items-center gap-2">
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           className="h-7 text-xs"
//                           disabled={(Array.isArray(hw.attachments) ? hw.attachments.length : 0) === 0}
//                           onClick={() => openAttachmentView(hw)}
//                         >
//                           <Paperclip className="w-3.5 h-3.5 mr-1" />
//                           Files ({Array.isArray(hw.attachments) ? hw.attachments.length : 0})
//                         </Button>

//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           className="h-7 text-xs"
//                           onClick={() => openEditModal(hw)}
//                         >
//                           <Pencil className="w-3.5 h-3.5 mr-1" />
//                           Edit
//                         </Button>

//                         <Button
//                           type="button"
//                           variant="destructive"
//                           size="sm"
//                           className="h-7 text-xs"
//                           onClick={() => setDeleteTarget(hw)}
//                         >
//                           <Trash2 className="w-3.5 h-3.5 mr-1" />
//                           Delete
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Info banner */}
//       <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex gap-3">
//         <BookOpen className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
//         <div>
//           <p className="text-sm font-bold text-cyan-900">Student Portal Integration</p>
//           <p className="text-xs text-cyan-700 mt-0.5">
//             All homework you add here is visible to students in their portal. Keep it updated daily!
//           </p>
//         </div>
//       </div>

//       <ConfirmDialog
//         open={!!deleteTarget}
//         onClose={() => setDeleteTarget(null)}
//         onConfirm={confirmDelete}
//         loading={deleting}
//         title="Delete Homework"
//         description={`This will permanently delete "${deleteTarget?.title || 'this homework'}".`}
//         confirmLabel="Delete"
//         variant="destructive"
//       />

//       {/* Attachments / PDF & Image Preview Modal */}
//       <AppModal
//         open={isAttachmentViewOpen}
//         onClose={() => {
//           setIsAttachmentViewOpen(false);
//           setActiveAttachmentView(null);
//         }}
//         title={activeAttachmentView ? `${activeAttachmentView.title} Materials` : 'Materials'}
//         size="xl"
//         footer={<Button variant="outline" onClick={() => setIsAttachmentViewOpen(false)}>Close</Button>}
//       >
//         {!activeAttachmentView ? null : (
//           <div className="flex flex-col md:flex-row gap-4 h-[75vh]">
//             {/* Left Side: Files List (Width kam kar di hai: w-full or md:w-[250px]) */}
//             <div className="w-full md:w-[250px] md:border-r md:pr-4 overflow-y-auto space-y-2 flex-shrink-0">
//               <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Select File</p>
//               <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
//                 {activeAttachmentView.materials.map((m) => {
//                   const isSelected = activeAttachmentView.pdfUrl === m.url;
//                   return (
//                     <button
//                       key={m.id}
//                       onClick={() => setActiveAttachmentView(prev => ({ ...prev, pdfUrl: m.url }))}
//                       className={`flex-shrink-0 md:w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
//                         }`}
//                     >
//                       <div className="flex items-center gap-2 min-w-0">
//                         <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
//                         <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
//                           {m.name}
//                         </span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Right Side: Preview Engine */}
//             <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-inner">
//               {activeAttachmentView.pdfUrl ? (
//                 <>
//                   <div className="px-4 py-2 bg-white border-b flex justify-between items-center">
//                     <span className="text-[10px] font-bold text-slate-400">
//                       {activeAttachmentView.pdfUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? 'IMAGE PREVIEW' : 'PDF PREVIEW'}
//                     </span>
//                     <a href={activeAttachmentView.pdfUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-extrabold hover:underline">
//                       OPEN FULL FILE
//                     </a>
//                   </div>

//                   <div className="flex-1 overflow-auto flex items-center justify-center p-2">
//                     {/* Image vs PDF check logic */}
//                     {activeAttachmentView.pdfUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
//                       <img
//                         src={activeAttachmentView.pdfUrl}
//                         alt="Preview"
//                         className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
//                       />
//                     ) : (
//                       <iframe
//                         src={`${activeAttachmentView.pdfUrl}#toolbar=1&view=FitH`}
//                         className="w-full h-full border-none rounded-lg"
//                         title="Preview"
//                       />
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
//                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3">
//                     <FileText className="w-8 h-8 opacity-20" />
//                   </div>
//                   <p className="text-xs font-bold">Select a file to start preview</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </AppModal>
//     </div>
//   );
// }


// src/app/teacher/homework/page.jsx
'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  NotebookPen,
  PlusCircle,
  CalendarDays,
  BookOpen,
  Pencil,
  Trash2,
  Paperclip,
  ExternalLink,
  FileText,
  ChevronRight,
  Users,
  Award,
  MessageSquare,
  Send as SendIcon,
  Check,
  X as XIcon,
  FileCheck,
  FileX,
  Clock,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  ImageIcon,
  Video,
  FileQuestion
} from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import SwitchField from '@/components/common/SwitchField';
import TextareaField from '@/components/common/TextareaField';
import DatePickerField from '@/components/common/DatePickerField';
import TimePickerField from '@/components/common/TimePickerField';
import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
import { teacherPortalService } from '@/services/teacherPortalService';
import useAuthStore from '@/store/authStore';

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-100 text-blue-700 border-blue-200',
  English: 'bg-violet-100 text-violet-700 border-violet-200',
  Science: 'bg-teal-100 text-teal-700 border-teal-200',
  Urdu: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Art & Craft': 'bg-pink-100 text-pink-700 border-pink-200',
};

const today = () => new Date().toISOString().split('T')[0];

const asText = (value) => String(value ?? '').trim();

const EMPTY_HW = {
  title: '',
  subject: '',
  class_id: '',
  section_id: '',
  description: '',
  instructions: '',
  date: today(),
  due_date: '',
  due_time: '',
  total_marks: '',
  passing_marks: '',
  allow_late_submission: false,
  late_submission_penalty: 0,
};

export default function TeacherHomeworkPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');

  const { classes } = useTeacherClasses();
  const {
    assignments: homework,
    loading,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useTeacherAssignments({ type: 'homework' });

  const [filterSubject, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [publishNow, setPublishNow] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeAttachmentView, setActiveAttachmentView] = useState(null);
  const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

  // Submission Management States
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeStatus, setGradeStatus] = useState('graded');
  const [resubmissionDeadline, setResubmissionDeadline] = useState('');
  const [viewSubmissionOpen, setViewSubmissionOpen] = useState(false);
  const [viewFile, setViewFile] = useState(null);

  const {
    control,
    watch,
    setValue,
    reset,
    handleSubmit: rhfHandleSubmit,
  } = useForm({
    defaultValues: EMPTY_HW,
  });

  const form = watch();

  const existingAttachments = useMemo(() => {
    if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
    return editingItem.attachments.map((file, idx) => ({
      id: file?.id || `${idx}`,
      name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
      url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null,
      type: file?.type || null,
    }));
  }, [editingItem]);

  const normalizedClasses = useMemo(
    () =>
      classes.map((cls) => {
        const classId = asText(cls.class_id || cls.id);
        const sections = Array.isArray(cls.sections) && cls.sections.length
          ? cls.sections
            .map((section) => ({
              id: asText(section?.id || section?.section_id),
              name: section?.name || section?.section_name || 'Section',
            }))
            .filter((section) => section.id)
          : cls.section_id
            ? [{ id: asText(cls.section_id), name: cls.section_name || 'Section' }]
            : [];

        return {
          ...cls,
          class_id: classId,
          class_name: cls.class_name || cls.name,
          sections,
          subjects: Array.isArray(cls.subjects) ? cls.subjects : [],
        };
      }),
    [classes]
  );

  const classMap = useMemo(
    () =>
      normalizedClasses.reduce((acc, cls) => {
        acc[cls.class_id] = cls;
        return acc;
      }, {}),
    [normalizedClasses]
  );

  const resolveClassForItem = (item) => {
    const itemClassId = asText(item.class_id);
    const byId = normalizedClasses.find((c) => asText(c.class_id) === itemClassId);
    if (byId) return byId;

    const itemClassName = asText(item.class_name || item.class);
    if (!itemClassName) return null;
    const normalizedItemClass = itemClassName.toLowerCase().split(' - ')[0].trim();

    const byName = normalizedClasses.find((c) => {
      const clsName = asText(c.class_name || c.name).toLowerCase();
      return (
        clsName === itemClassName.toLowerCase() ||
        clsName === normalizedItemClass ||
        normalizedItemClass.includes(clsName)
      );
    });
    if (byName) return byName;

    const itemSectionName = asText(item.section_name).toLowerCase();
    if (!itemSectionName) return null;

    const bySection = normalizedClasses.find((c) =>
      (c.sections || []).some((section) => asText(section.name).toLowerCase() === itemSectionName)
    );
    return bySection || null;
  };

  const resolveSectionIdForItem = (item) => {
    const cls = resolveClassForItem(item);
    const options = cls?.sections || [];
    if (!options.length) return '';

    const itemSectionId = asText(item.section_id);
    if (itemSectionId && options.some((section) => asText(section.id) === itemSectionId)) {
      return itemSectionId;
    }

    const byName = options.find(
      (section) => asText(section.name).toLowerCase() === asText(item.section_name).toLowerCase()
    );
    if (byName?.id) return byName.id;

    return options.length === 1 ? options[0].id : '';
  };

  const selectedClass = normalizedClasses.find((cls) => asText(cls.class_id) === asText(form.class_id));
  const sectionOptions = selectedClass?.sections || [];
  const subjectOptions = selectedClass?.subjects || [];

  const fallbackEditSectionOptions = useMemo(() => {
    if (!editingItem) return sectionOptions;

    const originalClassId = asText(editingItem.class_id);
    const currentClassId = asText(form.class_id);

    if (currentClassId && currentClassId !== originalClassId) return sectionOptions;
    if (sectionOptions.length > 0) return sectionOptions;

    const fallbackId = asText(form.section_id || editingItem.section_id || editingItem.section_name);
    const fallbackName = asText(editingItem.section_name || editingItem.section_id || 'Section');
    return fallbackId ? [{ id: fallbackId, name: fallbackName }] : [];
  }, [editingItem, form.class_id, form.section_id, sectionOptions]);

  const effectiveSectionOptions = fallbackEditSectionOptions;
  const requiresSection = effectiveSectionOptions.length > 0;

  const subjects = ['All', ...new Set(homework.map((h) => h.subject).filter(Boolean))];
  const filtered = filterSubject === 'All' ? homework : homework.filter((h) => h.subject === filterSubject);

  const grouped = filtered.reduce((acc, hw) => {
    const key = (hw.assigned_on || hw.created_at || hw.date || '').split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(hw);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in EMPTY_HW) {
      setValue(name, value, { shouldDirty: true, shouldTouch: true });
    }
  };

  const handleFile = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFiles([]);
    setPublishNow(true);
    setRemovedAttachmentIds([]);
    reset(EMPTY_HW);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setPublishNow(true);
    setFiles([]);
    setRemovedAttachmentIds([]);
    reset(EMPTY_HW);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    const matchedClass = resolveClassForItem(item);
    const resolvedSectionId = resolveSectionIdForItem(item) || asText(item.section_id || item.section_name);

    setEditingItem(item);
    setPublishNow(item.is_published ?? item.status === 'published');
    reset({
      title: item.title || '',
      subject: item.subject || '',
      class_id: asText(matchedClass?.class_id || item.class_id),
      section_id: resolvedSectionId,
      description: item.description || '',
      instructions: item.instructions || '',
      date: item.assigned_on ? String(item.assigned_on).split('T')[0] : today(),
      due_date: item.due_date ? String(item.due_date).split('T')[0] : '',
      due_time: item.due_time || '',
      total_marks: item.total_marks || '',
      passing_marks: item.passing_marks || '',
      allow_late_submission: item.allow_late_submission || false,
      late_submission_penalty: item.late_submission_penalty || 0,
    });
    setFiles([]);
    setRemovedAttachmentIds([]);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deleteAssignment(deleteTarget.id);
      toast.success('Homework deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Failed to delete homework');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveExistingFile = (id) => {
    setRemovedAttachmentIds(prev => [...prev, id]);
  };

  const onClassChange = (classId) => {
    const nextClassId = asText(classId);
    setValue('class_id', nextClassId, { shouldDirty: true, shouldTouch: true });
    setValue('section_id', '', { shouldDirty: true, shouldTouch: true });
    setValue('subject', '', { shouldDirty: true, shouldTouch: true });
  };

  const formatSafeDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return format(parsed, 'dd MMM yyyy');
  };

  const openAttachmentView = (item) => {
    const materials = (Array.isArray(item?.attachments) ? item.attachments : []).map((file, idx) => ({
      id: file?.id || `${idx}`,
      name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
      type: file?.type || null,
      url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null,
    }));

    const firstFile = materials[0];
    setActiveAttachmentView({
      title: item?.title || 'Homework',
      className: item?.class_name || classMap[item?.class_id]?.class_name || '-',
      materials,
      activeUrl: firstFile?.url || null,
      activeType: getFileTypeForView(firstFile?.url),
    });
    setIsAttachmentViewOpen(true);
  };

  const getFileTypeForView = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    return 'other';
  };

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
    const studentName =
      item?.student_name
      || [item?.first_name, item?.last_name].filter(Boolean).join(' ').trim()
      || item?.name
      || 'Student';
    const files = Array.isArray(item?.files)
      ? item.files
      : Array.isArray(through?.files)
        ? through.files
        : [];

    return {
      ...item,
      id: through?.id || item?.submission_id || item?.id || `submission-${index}`,
      submission_id: through?.id || item?.submission_id || item?.id,
      student_id: item?.student_id || item?.user_id || item?.id || null,
      student_name: studentName,
      roll_number: item?.roll_number || item?.registration_no || item?.roll_no || 'N/A',
      submitted_at: item?.submitted_at || through?.submitted_at || null,
      submission_text: item?.submission_text || through?.submission_text || '',
      marks: item?.marks ?? through?.marks ?? null,
      feedback: item?.feedback ?? through?.feedback ?? '',
      status,
      files,
    };
  };

  // Submission Management Functions
  const fetchSubmissions = async (homeworkId) => {
    setLoadingSubmissions(true);
    try {
      const data = await teacherPortalService.getAssignmentSubmissions(homeworkId);
      const normalized = extractSubmissionsList(data).map(normalizeSubmission);
      setSubmissions(normalized);
    } catch (error) {
      toast.error('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const openSubmissionsModal = async (homework) => {
    setSelectedHomework(homework);
    await fetchSubmissions(homework.id);
    setSubmissionsModalOpen(true);
  };

  const openViewSubmission = (student) => {
    setSelectedStudent(student);
    setViewSubmissionOpen(true);
  };

  // Update the handleGradeSubmit and handleResubmissionRequest functions
  const handleGradeSubmit = async () => {
    if (!selectedStudent || !selectedHomework) return;

    try {
      await teacherPortalService.gradeSubmission(selectedStudent.submission_id, {
        marks: parseFloat(gradeMarks),
        feedback: gradeFeedback,
        status: 'graded', // Explicitly set status to graded
        resubmission_deadline: null
      });
      toast.success('Submission graded successfully');
      await fetchSubmissions(selectedHomework.id);
      setGradingModalOpen(false);
      // Reset form
      setGradeMarks('');
      setGradeFeedback('');
      setGradeStatus('graded');
      setResubmissionDeadline('');
    } catch (error) {
      toast.error('Failed to grade submission');
    }
  };

  const handleResubmissionRequest = async () => {
    if (!selectedStudent || !selectedHomework) return;

    if (!gradeFeedback.trim()) {
      toast.error('Please provide feedback for resubmission');
      return;
    }

    if (!resubmissionDeadline) {
      toast.error('Please select a resubmission deadline');
      return;
    }

    try {
      await teacherPortalService.requestResubmission(selectedStudent.submission_id, {
        deadline: resubmissionDeadline,
        feedback: gradeFeedback,
        status: 'resubmission_requested' // Keep as resubmission, NOT graded
      });
      toast.success('Resubmission requested successfully');
      await fetchSubmissions(selectedHomework.id);
      setGradingModalOpen(false);
      // Reset form
      setGradeMarks('');
      setGradeFeedback('');
      setGradeStatus('graded');
      setResubmissionDeadline('');
    } catch (error) {
      toast.error('Failed to request resubmission');
    }
  };

  // Update the openGradingModal function
  const openGradingModal = (student) => {
    setSelectedStudent(student);
    setGradeMarks(student.marks || '');
    setGradeFeedback(student.feedback || '');
    // If already graded, set status to graded, otherwise default to graded for new grading
    setGradeStatus(student.status === 'graded' ? 'graded' : 'graded');
    setResubmissionDeadline(student.resubmission_deadline || '');
    setGradingModalOpen(true);
  };

  // Add edit grade function
  const openEditGradeModal = (student) => {
    setSelectedStudent(student);
    setGradeMarks(student.marks || '');
    setGradeFeedback(student.feedback || '');
    setGradeStatus('graded'); // Always graded for editing
    setResubmissionDeadline('');
    setGradingModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    if (!values.title || !values.subject || !values.class_id || !values.due_date) {
      toast.error('Please fill all required fields (Title, Class, Subject, Due Date).');
      return;
    }

    if (requiresSection && !values.section_id) {
      toast.error('Please select a section for this class.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: values.title,
        subject: values.subject,
        class_id: values.class_id,
        section_id: values.section_id || null,
        description: values.description || '',
        instructions: values.instructions || '',
        assigned_on: values.date || today(),
        due_date: values.due_date,
        due_time: values.due_time || null,
        total_marks: values.total_marks ? parseInt(values.total_marks) : null,
        passing_marks: values.passing_marks ? parseInt(values.passing_marks) : null,
        allow_late_submission: values.allow_late_submission || false,
        late_submission_penalty: values.late_submission_penalty || 0,
        type: 'homework',
        status: publishNow ? 'published' : 'draft',
        is_published: publishNow,
        remove_attachments: JSON.stringify(removedAttachmentIds),
      };

      const formData = teacherPortalService.prepareAssignmentFormData(payload, files);

      if (editingItem?.id) {
        await updateAssignment(editingItem.id, formData);
        toast.success('Homework updated successfully.');
      } else {
        await createAssignment(formData);
        toast.success('Homework added to diary successfully.');
      }

      setRemovedAttachmentIds([]);
      setFiles([]);
      closeFormModal();
    } catch (error) {
      console.error('Homework submit error:', error);
      const errorMsg = error.response?.data?.message || 'Something went wrong while saving homework.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <NotebookPen className="w-6 h-6 text-blue-600" /> {t.homeworkLabel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daily {t.homeworkLabel.toLowerCase()} given to your {t.classesLabel.toLowerCase()}
          </p>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={openCreateModal}
        >
          <PlusCircle className="w-4 h-4" /> Add Homework
        </Button>
      </div>

      {/* Add / Edit Homework Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeFormModal}
        title={editingItem ? 'Edit Homework / Diary Entry' : 'Add Homework / Diary Entry'}
        description="This homework will be instantly visible to students in their portal."
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="homework-form"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving}
            >
              {saving ? (editingItem ? 'Updating...' : 'Saving...') : (editingItem ? 'Update Homework' : 'Add to Diary')}
            </Button>
          </>
        }
      >
        <form id="homework-form" onSubmit={rhfHandleSubmit(handleFormSubmit)} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="grading">Grading & Settings</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <InputField
                label="Homework Title"
                name="title"
                required
                placeholder="e.g. Read Chapter 4 & answer questions"
                value={form.title || ''}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Class"
                  name="class_id"
                  required
                  value={form.class_id || ''}
                  onChange={onClassChange}
                  placeholder="Select Class"
                  options={normalizedClasses.map((c) => ({
                    value: c.class_id,
                    label: c.class_name || c.name,
                  }))}
                />

                <SelectField
                  label="Subject"
                  name="subject"
                  required
                  value={form.subject || ''}
                  onChange={(v) => setValue('subject', v, { shouldDirty: true, shouldTouch: true })}
                  placeholder="Select Subject"
                  options={subjectOptions.map((s) => ({ value: s, label: s }))}
                />
              </div>

              {effectiveSectionOptions.length > 0 && (
                <SelectField
                  label={`Section${requiresSection ? ' *' : ''}`}
                  name="section_id"
                  value={form.section_id || ''}
                  onChange={(v) => setValue('section_id', v, { shouldDirty: true, shouldTouch: true })}
                  placeholder="Select Section"
                  options={effectiveSectionOptions.map((section) => ({
                    value: asText(section.id),
                    label: section.name,
                  }))}
                />
              )}

              <div className="grid grid-cols-3 gap-3">
                <DatePickerField
                  label="Assigned Date"
                  name="date"
                  control={control}
                  placeholder="Pick a date"
                  fromYear={2020}
                  toYear={2030}
                />

                <DatePickerField
                  label="Due Date"
                  name="due_date"
                  control={control}
                  required
                  placeholder="Pick a date"
                  fromYear={2020}
                  toYear={2030}
                />

                <div className="space-y-1.5">
                  <Label>Due Time</Label>
                  <TimePickerField
                    value={form.due_time || ''}
                    onChange={(value) => setValue('due_time', value, { shouldDirty: true, shouldTouch: true })}
                    mode="simple"
                    interval={15}
                    placeholder="Select Time"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 pt-4">
              <TextareaField
                label="Description"
                name="description"
                rows={3}
                placeholder="What exactly do students need to do?"
                value={form.description || ''}
                onChange={handleChange}
              />

              <TextareaField
                label="Instructions / Guidelines"
                name="instructions"
                rows={4}
                placeholder="Provide detailed instructions, formatting requirements, submission guidelines..."
                value={form.instructions || ''}
                onChange={handleChange}
              />

              {/* Existing Attachments */}
              {editingItem && existingAttachments.length > removedAttachmentIds.length && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Current Attachments</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {existingAttachments
                      .filter(file => !removedAttachmentIds.includes(file.id))
                      .map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingFile(file.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* New Attachments */}
              <div className="space-y-1.5">
                <Label htmlFor="homework-file">Attach New File(s)</Label>
                <label
                  htmlFor="homework-file"
                  className="flex items-center gap-2 h-10 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {files.length ? `${files.length} file(s) selected` : 'Choose file(s)...'}
                  </span>
                </label>
                <input id="homework-file" type="file" className="hidden" onChange={handleFile} multiple />

                {files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span className="text-xs truncate">{file.name}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700 p-1">
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Grading & Settings Tab */}
            <TabsContent value="grading" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Total Marks"
                  name="total_marks"
                  type="number"
                  placeholder="e.g., 100"
                  value={form.total_marks || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Passing Marks"
                  name="passing_marks"
                  type="number"
                  placeholder="e.g., 40"
                  value={form.passing_marks || ''}
                  onChange={handleChange}
                />
              </div>

              <SwitchField
                label="Allow Late Submissions"
                name="allow_late_submission"
                value={form.allow_late_submission || false}
                onChange={(v) => setValue('allow_late_submission', v, { shouldDirty: true })}
                hint="Students can submit after due date with penalty"
              />

              {form.allow_late_submission && (
                <InputField
                  label="Late Submission Penalty (%)"
                  name="late_submission_penalty"
                  type="number"
                  placeholder="e.g., 10 for 10% deduction"
                  value={form.late_submission_penalty || ''}
                  onChange={handleChange}
                  hint="Percentage of marks to deduct for late submissions"
                />
              )}

              <SwitchField
                label="Publish Now"
                name="is_published"
                value={publishNow}
                onChange={setPublishNow}
                hint="Turn off to save as draft (not visible to students)"
              />
            </TabsContent>
          </Tabs>
        </form>
      </AppModal>

      {/* Subject filters */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSubject === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grouped diary entries */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <NotebookPen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No homework entries found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{formatSafeDate(date)}</p>
                  <p className="text-xs text-slate-400">
                    {grouped[date].length} homework entr{grouped[date].length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>

              <div className="ml-3 pl-10 border-l-2 border-blue-100 space-y-3">
                {grouped[date].map((hw) => (
                  <HomeworkCard
                    key={hw.id}
                    homework={hw}
                    classMap={classMap}
                    onViewAttachments={() => openAttachmentView(hw)}
                    onEdit={() => openEditModal(hw)}
                    onDelete={() => setDeleteTarget(hw)}
                    onViewSubmissions={() => openSubmissionsModal(hw)}
                    formatSafeDate={formatSafeDate}
                    SUBJECT_COLORS={SUBJECT_COLORS}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex gap-3">
        <BookOpen className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-cyan-900">Student Portal Integration</p>
          <p className="text-xs text-cyan-700 mt-0.5">
            All homework you add here is visible to students in their portal. Keep it updated daily!
          </p>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Homework"
        description={`This will permanently delete "${deleteTarget?.title || 'this homework'}".`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Attachments Viewer Modal */}
      <AttachmentViewerModal
        open={isAttachmentViewOpen}
        onClose={() => setIsAttachmentViewOpen(false)}
        activeAttachmentView={activeAttachmentView}
        setActiveAttachmentView={setActiveAttachmentView}
      />

      <SubmissionsModal
        open={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        selectedHomework={selectedHomework}
        submissions={submissions}
        loadingSubmissions={loadingSubmissions}
        onGrade={openGradingModal}
        onEditGrade={openEditGradeModal}  // Pass edit grade function
        onViewSubmission={openViewSubmission}
        formatSafeDate={formatSafeDate}
      />


      {/* Grading Modal */}
      <GradingModal
        open={gradingModalOpen}
        onClose={() => setGradingModalOpen(false)}
        selectedStudent={selectedStudent}
        selectedHomework={selectedHomework}
        gradeMarks={gradeMarks}
        setGradeMarks={setGradeMarks}
        gradeFeedback={gradeFeedback}
        setGradeFeedback={setGradeFeedback}
        gradeStatus={gradeStatus}
        setGradeStatus={setGradeStatus}
        resubmissionDeadline={resubmissionDeadline}
        setResubmissionDeadline={setResubmissionDeadline}
        onGradeSubmit={handleGradeSubmit}
        formatSafeDate={formatSafeDate}
      />

      {/* View Submission Modal */}
      <ViewSubmissionModal
        open={viewSubmissionOpen}
        onClose={() => setViewSubmissionOpen(false)}
        student={selectedStudent}
        homework={selectedHomework}
        formatSafeDate={formatSafeDate}
      />
    </div>
  );
}

// Homework Card Component
function HomeworkCard({ homework, classMap, onViewAttachments, onEdit, onDelete, onViewSubmissions, formatSafeDate, SUBJECT_COLORS }) {
  const submitted = homework.stats?.submitted || 0;
  const total = homework.stats?.total_students || 1;
  const pct = Math.round((submitted / total) * 100);
  const isOverdue = homework.due_date ? isPast(new Date(homework.due_date)) : false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${SUBJECT_COLORS[homework.subject] || 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
            >
              {homework.subject}
            </span>
            <span className="text-[10px] text-slate-400">
              {homework.class_name || classMap[homework.class_id]?.class_name || '-'}
              {homework.section_name ? ` - ${homework.section_name}` : ''}
            </span>
            {isOverdue && !homework.is_published && (
              <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Overdue
              </span>
            )}
          </div>
          <h3 className="text-sm font-extrabold text-slate-800">{homework.title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
            {homework.description || homework.instructions || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Submission Progress</span>
          <span className="text-slate-700">{submitted} / {total} Students</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">
            Due: <span className="font-semibold text-red-600">{formatSafeDate(homework.due_date)}</span>
          </span>
          {homework.total_marks && (
            <span className="text-[10px] text-slate-400">
              Marks: <span className="font-semibold text-slate-700">{homework.total_marks}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={(Array.isArray(homework.attachments) ? homework.attachments.length : 0) === 0}
            onClick={onViewAttachments}
          >
            <Paperclip className="w-3.5 h-3.5 mr-1" />
            Files ({Array.isArray(homework.attachments) ? homework.attachments.length : 0})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onViewSubmissions}
          >
            <Users className="w-3.5 h-3.5 mr-1" />
            Submissions
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// Attachment Viewer Modal Component
function AttachmentViewerModal({ open, onClose, activeAttachmentView, setActiveAttachmentView }) {
  if (!activeAttachmentView) return null;

  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileQuestion className="w-4 h-4" />;
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={activeAttachmentView.title}
      size="xl"
    >
      <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
        {/* Left Sidebar */}
        <div className="w-full md:w-[280px] border-r pr-2 overflow-y-auto flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-1">Files ({activeAttachmentView.materials?.length || 0})</p>
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {activeAttachmentView.materials?.map((m) => {
              const isSelected = activeAttachmentView.activeUrl === m.url;
              const type = getFileTypeForView(m.url);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveAttachmentView(prev => ({ ...prev, activeUrl: m.url, activeType: type }))}
                  className={`flex-shrink-0 md:w-full p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${isSelected
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                >
                  {getFileTypeIcon(type)}
                  <span className="text-[11px] font-medium truncate">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
          {activeAttachmentView.activeUrl ? (
            <>
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                <a
                  href={activeAttachmentView.activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-slate-700 text-[10px] font-bold hover:scale-105 transition-transform"
                >
                  <ExternalLink className="w-3 h-3" /> Full View
                </a>
                <a
                  href={activeAttachmentView.activeUrl}
                  download
                  className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-slate-700 text-[10px] font-bold hover:scale-105 transition-transform"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>

              <div className="w-full h-full flex items-center justify-center p-4">
                {activeAttachmentView.activeType === 'image' && (
                  <img src={activeAttachmentView.activeUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                )}
                {activeAttachmentView.activeType === 'pdf' && (
                  <iframe src={`${activeAttachmentView.activeUrl}#toolbar=1&view=FitH`} className="w-full h-full border-none rounded-lg bg-white" title="PDF Preview" />
                )}
                {activeAttachmentView.activeType === 'video' && (
                  <video controls className="max-w-full max-h-full rounded-lg shadow-lg">
                    <source src={activeAttachmentView.activeUrl} />
                  </video>
                )}
                {activeAttachmentView.activeType === 'other' && (
                  <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Preview not available for this file type</p>
                    <Button asChild variant="outline" className="mt-4">
                      <a href={activeAttachmentView.activeUrl} download>Download File</a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400">
              <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a file to preview</p>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}

// Update SubmissionsModal to include onEditGrade
function SubmissionsModal({ open, onClose, selectedHomework, submissions, loadingSubmissions, onGrade, onEditGrade, onViewSubmission, formatSafeDate }) {
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const submitted = safeSubmissions.filter((s) => ['submitted', 'late'].includes(s.status)).length;
  const graded = safeSubmissions.filter((s) => s.status === 'graded').length;
  const pending = Math.max(0, safeSubmissions.length - submitted - graded);
  const progressDenominator = safeSubmissions.length || 1;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Submissions: ${selectedHomework?.title}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{safeSubmissions.length}</p>
            <p className="text-xs text-blue-600">Total Students</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{submitted}</p>
            <p className="text-xs text-green-600">Submitted</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{pending}</p>
            <p className="text-xs text-amber-600">Pending</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{graded}</p>
            <p className="text-xs text-purple-600">Graded</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Overall Progress</span>
            <span>{submitted + graded}/{safeSubmissions.length}</span>
          </div>
          <Progress value={((submitted + graded) / progressDenominator) * 100} className="h-2" />
        </div>

        {/* Submissions List */}
        {loadingSubmissions ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : safeSubmissions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {safeSubmissions.map((student) => (
              <StudentSubmissionCard
                key={student.id}
                student={student}
                homework={selectedHomework}
                onGrade={() => onGrade(student)}
                onEdit={() => onEditGrade(student)}  // Pass edit function
                onView={() => onViewSubmission(student)}
                formatSafeDate={formatSafeDate}
              />
            ))}
          </div>
        )}
      </div>
    </AppModal>
  );
}

// Fix the Grading Modal Component - Separate Grade and Resubmission
function GradingModal({
  open, onClose, selectedStudent, selectedHomework,
  gradeMarks, setGradeMarks, gradeFeedback, setGradeFeedback,
  gradeStatus, setGradeStatus, resubmissionDeadline, setResubmissionDeadline,
  onGradeSubmit, onResubmissionRequest, formatSafeDate
}) {
  const isResubmission = gradeStatus === 'resubmission';

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isResubmission ? "Request Resubmission" : "Grade Submission"}
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-sm font-semibold">Student: {selectedStudent?.student_name}</p>
          <p className="text-xs text-slate-500">
            Submitted: {selectedStudent?.submitted_at && formatSafeDate(selectedStudent.submitted_at)}
          </p>
        </div>

        {selectedStudent?.submission_text && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 mb-1">Student's Notes:</p>
            <p className="text-xs text-amber-600 max-h-32 overflow-y-auto">{selectedStudent.submission_text}</p>
          </div>
        )}

        {selectedStudent?.files?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Attached Files:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedStudent.files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <Paperclip className="w-3 h-3" />
                  {file.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* For Resubmission: Only show feedback and deadline */}
        {isResubmission ? (
          <>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-700 mb-2">Resubmission Request</p>
              <p className="text-xs text-purple-600">Request the student to resubmit with corrections</p>
            </div>

            <TextareaField
              label="Feedback / Reason for Resubmission"
              rows={4}
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              placeholder="Explain what needs to be corrected or improved..."
              required
            />

            <InputField
              label="Resubmission Deadline"
              type="date"
              value={resubmissionDeadline}
              onChange={(e) => setResubmissionDeadline(e.target.value)}
              placeholder="Select deadline"
              required
            />
          </>
        ) : (
          // For Grading: Show marks and feedback
          <>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Marks Obtained"
                type="number"
                value={gradeMarks}
                onChange={(e) => setGradeMarks(e.target.value)}
                placeholder={`Max: ${selectedHomework?.total_marks || 'N/A'}`}
                required
              />

              {selectedHomework?.total_marks && (
                <div className="flex items-end pb-2">
                  <span className="text-sm text-slate-500">/ {selectedHomework.total_marks}</span>
                </div>
              )}
            </div>

            <TextareaField
              label="Feedback / Comments"
              rows={4}
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              placeholder="Provide constructive feedback to the student..."
            />
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={isResubmission ? onResubmissionRequest : onGradeSubmit}
            className={isResubmission ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
          >
            {isResubmission ? 'Send Resubmission Request' : 'Submit Grade'}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}

// Fix the Student Submission Card - Add Edit option for graded submissions
function StudentSubmissionCard({ student, homework, onGrade, onEdit, onView, formatSafeDate }) {
  const hasFiles = student.files?.length > 0;
  const isGraded = student.status === 'graded';
  const isLate = student.status === 'late';
  const isResubmission = student.status === 'resubmission';

  return (
    <div className={`p-4 border rounded-xl bg-white hover:shadow-md transition-all ${isLate ? 'border-orange-200 bg-orange-50/30' :
        isResubmission ? 'border-purple-200 bg-purple-50/30' : ''
      }`}>
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-slate-800">{student.student_name}</h4>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isGraded ? 'bg-green-100 text-green-700' :
                isLate ? 'bg-orange-100 text-orange-700' :
                  isResubmission ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
              }`}>
              {isGraded ? 'Graded' : isLate ? 'Late' : isResubmission ? 'Resubmission Requested' : 'Submitted'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Roll No: {student.roll_number || 'N/A'}</p>
          <p className="text-xs text-slate-500">
            Submitted: {student.submitted_at && formatSafeDate(student.submitted_at)}
          </p>

          {student.submission_text && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100" onClick={onView}>
              <p className="text-xs font-semibold text-slate-600 mb-1">Submission Notes:</p>
              <p className="text-xs text-slate-500 line-clamp-2">{student.submission_text}</p>
              <p className="text-[10px] text-blue-500 mt-1">Click to view full details →</p>
            </div>
          )}

          {hasFiles && (
            <div className="mt-2 flex flex-wrap gap-2">
              {student.files.slice(0, 3).map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg"
                >
                  <Paperclip className="w-3 h-3" />
                  {file.name.length > 25 ? file.name.substring(0, 25) + '...' : file.name}
                </a>
              ))}
              {student.files.length > 3 && (
                <span className="text-xs text-slate-400">+{student.files.length - 3} more</span>
              )}
            </div>
          )}

          {isGraded && student.marks !== undefined && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-green-600">Marks Obtained</p>
                  <p className="font-bold text-green-700">{student.marks}/{homework?.total_marks}</p>
                </div>
                {student.grade && (
                  <div>
                    <p className="text-xs text-green-600">Grade</p>
                    <p className="font-bold text-green-700">{student.grade}</p>
                  </div>
                )}
              </div>
              {student.feedback && (
                <p className="text-xs text-green-600 mt-1">Feedback: {student.feedback}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Always show Edit button for graded submissions to allow correction */}
          {isGraded && (
            <Button size="sm" variant="outline" onClick={onEdit} className="border-amber-200 text-amber-600 hover:bg-amber-50">
              <Pencil className="w-4 h-4 mr-1" /> Edit Grade
            </Button>
          )}

          {/* Show Grade button for non-graded submissions */}
          {!isGraded && (
            <Button size="sm" onClick={onGrade} className="bg-blue-600 hover:bg-blue-700">
              <Award className="w-4 h-4 mr-1" /> Grade
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// View Submission Modal Component
function ViewSubmissionModal({ open, onClose, student, homework, formatSafeDate }) {
  if (!student) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Submission: ${student?.student_name}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Student Name</p>
              <p className="font-medium text-slate-800">{student.student_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Roll Number</p>
              <p className="font-medium text-slate-800">{student.roll_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Submitted On</p>
              <p className="font-medium text-slate-800">{formatSafeDate(student.submitted_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${student.status === 'graded' ? 'bg-green-100 text-green-700' :
                  student.status === 'late' ? 'bg-orange-100 text-orange-700' :
                    'bg-amber-100 text-amber-700'
                }`}>
                {student.status === 'graded' ? 'Graded' : student.status === 'late' ? 'Late' : 'Submitted'}
              </span>
            </div>
          </div>
        </div>

        {student.submission_text && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Submission Notes:</p>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{student.submission_text}</p>
            </div>
          </div>
        )}

        {student.files?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Attached Files:</p>
            <div className="grid grid-cols-1 gap-2">
              {student.files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <FileText className="w-4 h-4" />
                  {file.name}
                  <span className="text-xs text-slate-400 ml-auto">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {student.status === 'graded' && student.marks !== undefined && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-green-600">Marks Obtained</p>
                <p className="text-2xl font-bold text-green-700">{student.marks}</p>
                <p className="text-xs text-slate-500">out of {homework?.total_marks}</p>
              </div>
              {student.grade && (
                <div>
                  <p className="text-xs text-green-600">Grade</p>
                  <p className="text-2xl font-bold text-green-700">{student.grade}</p>
                </div>
              )}
            </div>
            {student.feedback && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Teacher Feedback:</p>
                <p className="text-sm text-green-800">{student.feedback}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </AppModal>
  );
}

// Helper function
function getFileTypeForView(url) {
  if (!url) return 'unknown';
  const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  return 'other';
}