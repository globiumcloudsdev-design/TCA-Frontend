// 'use client';

// import { useMemo, useState } from 'react';
// import { FileText, Upload, Download, PlusCircle, Paperclip, CalendarIcon, Pencil, Trash2, ExternalLink } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { getPortalTerms } from '@/constants/portalInstituteConfig';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { toast } from 'sonner';
// import AppModal from '@/components/common/AppModal';
// import ConfirmDialog from '@/components/common/ConfirmDialog';
// import InputField from '@/components/common/InputField';
// import SelectField from '@/components/common/SelectField';
// import SwitchField from '@/components/common/SwitchField';
// import TextareaField from '@/components/common/TextareaField';
// import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
// import { teacherPortalService } from '@/services/teacherPortalService';
// import useAuthStore from '@/store/authStore';

// const SUBJECT_COLORS = {
//     Mathematics: 'bg-blue-100 text-blue-700 border-blue-200',
//     Science: 'bg-teal-100 text-teal-700 border-teal-200',
//     English: 'bg-violet-100 text-violet-700 border-violet-200',
//     Urdu: 'bg-emerald-100 text-emerald-700 border-emerald-200'
// };

// const EMPTY_NOTE = {
//     title: '',
//     subject: '',
//     class_id: '',
//     section_id: '',
//     description: '',
//     assigned_on: new Date().toISOString().slice(0, 10),
//     due_date: ''
// };

// const getFileExt = (name = '') => {
//     const ext = String(name).split('.').pop();
//     return ext ? ext.toUpperCase() : 'FILE';
// };

// const formatSafeDate = (value) => {
//     if (!value) return 'N/A';
//     const parsed = new Date(value);
//     if (Number.isNaN(parsed.getTime())) return String(value);
//     return format(parsed, 'dd MMM yyyy');
// };

// const asText = (value) => String(value ?? '').trim();

// export default function TeacherNotesPage() {
//     const user = useAuthStore((state) => state.user);
//     const t = getPortalTerms(user?.institute_type || 'school');
//     const { classes } = useTeacherClasses();
//     const {
//         assignments: notes,
//         loading,
//         createAssignment,
//         updateAssignment,
//         deleteAssignment
//     } = useTeacherAssignments({ type: 'project' });

//     const [filterSubject, setFilter] = useState('All');
//     const [modalOpen, setModalOpen] = useState(false);
//     const [form, setForm] = useState(EMPTY_NOTE);
//     const [files, setFiles] = useState([]);
//     const [saving, setSaving] = useState(false);
//     const [editingItem, setEditingItem] = useState(null);
//     const [publishNow, setPublishNow] = useState(true);
//     const [deleteTarget, setDeleteTarget] = useState(null);
//     const [deleting, setDeleting] = useState(false);
//     const [activeAttachmentView, setActiveAttachmentView] = useState(null);
//     const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);

//     console.log('Notes:', notes);

//     const existingAttachments = useMemo(() => {
//         if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
//         return editingItem.attachments.map((file, idx) => ({
//             id: file?.id || `${idx}`,
//             name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
//             url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null,
//             type: file?.type || null
//         }));
//     }, [editingItem]);

//     const existingPdf = existingAttachments.find(
//         (file) => String(file?.type || '').toLowerCase().includes('pdf') || String(file?.url || '').toLowerCase().endsWith('.pdf')
//     );

//     const normalizedClasses = useMemo(
//         () => classes.map((cls) => {
//             const classId = asText(cls.class_id || cls.id);
//             const sections = Array.isArray(cls.sections) && cls.sections.length
//                 ? cls.sections
//                     .map((section) => ({
//                         id: asText(section?.id || section?.section_id),
//                         name: section?.name || section?.section_name || 'Section'
//                     }))
//                     .filter((section) => section.id)
//                 : (cls.section_id
//                     ? [{ id: asText(cls.section_id), name: cls.section_name || 'Section' }]
//                     : []);

//             return {
//                 ...cls,
//                 class_id: classId,
//                 class_name: cls.class_name || cls.name,
//                 sections,
//                 subjects: Array.isArray(cls.subjects) ? cls.subjects : []
//             };
//         }),
//         [classes]
//     );

//     const selectedClass = normalizedClasses.find((cls) => asText(cls.class_id) === asText(form.class_id));
//     const sectionOptions = selectedClass?.sections || [];
//     const subjectOptions = selectedClass?.subjects || [];
//     const fallbackEditSectionOptions = useMemo(() => {
//         if (!editingItem) return sectionOptions;
//         const originalClassId = asText(editingItem.class_id);
//         const currentClassId = asText(form.class_id);
//         if (currentClassId && currentClassId !== originalClassId) return sectionOptions;
//         if (sectionOptions.length > 0) return sectionOptions;

//         const fallbackId = asText(form.section_id || editingItem.section_id || editingItem.section_name);
//         const fallbackName = asText(editingItem.section_name || editingItem.section_id || 'Section');
//         return fallbackId ? [{ id: fallbackId, name: fallbackName }] : [];
//     }, [editingItem, form.class_id, form.section_id, sectionOptions]);
//     const effectiveSectionOptions = fallbackEditSectionOptions;
//     const requiresSection = effectiveSectionOptions.length > 0;

//     const classMap = useMemo(() => normalizedClasses.reduce((acc, cls) => {
//         acc[cls.class_id] = cls;
//         return acc;
//     }, {}), [normalizedClasses]);

//     const subjects = useMemo(() => {
//         const source = notes.map((n) => n.subject).filter(Boolean);
//         return ['All', ...new Set(source)];
//     }, [notes]);

//     const filtered = filterSubject === 'All'
//         ? notes
//         : notes.filter((n) => n.subject === filterSubject);

//     const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

//     const onClassChange = (classId) => {
//         const nextClassId = asText(classId);
//         const cls = normalizedClasses.find((c) => asText(c.class_id) === nextClassId);
//         const nextSections = cls?.sections || [];
//         setForm((prev) => ({
//             ...prev,
//             class_id: nextClassId,
//             section_id: '',
//             subject: ''
//         }));
//     };

//     const resolveClassForItem = (item) => {
//         const itemClassId = asText(item.class_id);
//         const byId = normalizedClasses.find((c) => asText(c.class_id) === itemClassId);
//         if (byId) return byId;

//         const itemClassName = asText(item.class_name || item.class);
//         if (!itemClassName) return null;
//         const normalizedItemClass = itemClassName.toLowerCase().split(' - ')[0].trim();

//         const byName = normalizedClasses.find((c) => {
//             const clsName = asText(c.class_name || c.name).toLowerCase();
//             return clsName === itemClassName.toLowerCase() || clsName === normalizedItemClass || normalizedItemClass.includes(clsName);
//         });
//         if (byName) return byName;

//         const itemSectionName = asText(item.section_name).toLowerCase();
//         if (!itemSectionName) return null;
//         const bySection = normalizedClasses.find((c) =>
//             (c.sections || []).some((section) => asText(section.name).toLowerCase() === itemSectionName)
//         );
//         return bySection || null;
//     };

//     const resolveSectionIdForItem = (item) => {
//         const cls = resolveClassForItem(item);
//         const options = cls?.sections || [];

//         if (!options.length) return '';
//         const itemSectionId = asText(item.section_id);
//         if (itemSectionId && options.some((section) => asText(section.id) === itemSectionId)) {
//             return itemSectionId;
//         }

//         const byName = options.find(
//             (section) => asText(section.name).toLowerCase() === asText(item.section_name).toLowerCase()
//         );
//         if (byName?.id) return byName.id;

//         return options.length === 1 ? options[0].id : '';
//     };

//     const openAttachmentView = (item) => {
//         const materials = (Array.isArray(item?.attachments) ? item.attachments : []).map((file, idx) => ({
//             id: file?.id || `${idx}`,
//             name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
//             type: file?.type || null,
//             url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null
//         }));

//         const pdf = materials.find(
//             (m) => String(m?.type || '').toLowerCase().includes('pdf') || String(m?.url || '').toLowerCase().endsWith('.pdf')
//         );

//         setActiveAttachmentView({
//             title: item?.title || 'Note',
//             className: item?.class_name || classMap[item?.class_id]?.class_name || '-',
//             materials,
//             pdfUrl: pdf?.url || null
//         });
//         setIsAttachmentViewOpen(true);
//     };

//     const handleFile = (e) => {
//         const picked = Array.from(e.target.files || []);
//         setFiles(picked);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!form.title || !form.subject || !form.class_id) {
//             toast.error('Please fill all required fields.');
//             return;
//         }
//         if (requiresSection && !form.section_id) {
//             toast.error('Please select a section for this class.');
//             return;
//         }

//         setSaving(true);
//         try {
//             const payload = {
//                 title: form.title,
//                 subject: form.subject,
//                 class_id: form.class_id,
//                 section_id: form.section_id || null,
//                 description: form.description,
//                 assigned_on: form.assigned_on,
//                 due_date: form.due_date || null,
//                 type: 'project',
//                 status: publishNow ? 'published' : 'draft',
//                 is_published: publishNow
//             };

//             const formData = teacherPortalService.prepareAssignmentFormData(payload, files);
//             if (editingItem?.id) {
//                 await updateAssignment(editingItem.id, formData);
//             } else {
//                 await createAssignment(formData);
//             }
//             setModalOpen(false);
//             setForm(EMPTY_NOTE);
//             setFiles([]);
//             setEditingItem(null);
//             setPublishNow(true);
//         } catch {
//             // Toast handled by hook
//         } finally {
//             setSaving(false);
//         }
//     };

//     const openCreateModal = () => {
//         setEditingItem(null);
//         setPublishNow(true);
//         setForm(EMPTY_NOTE);
//         setFiles([]);
//         setModalOpen(true);
//     };

//     const openEditModal = (item) => {
//         const matchedClass = resolveClassForItem(item);
//         const resolvedSectionId = resolveSectionIdForItem(item) || asText(item.section_id || item.section_name);
//         setEditingItem(item);
//         setPublishNow(item.is_published ?? item.status === 'published');
//         setForm({
//             title: item.title || '',
//             subject: item.subject || '',
//             class_id: asText(matchedClass?.class_id || item.class_id),
//             section_id: resolvedSectionId,
//             description: item.description || item.instructions || '',
//             assigned_on: item.assigned_on ? String(item.assigned_on).split('T')[0] : EMPTY_NOTE.assigned_on,
//             due_date: item.due_date ? String(item.due_date).split('T')[0] : ''
//         });
//         setFiles([]);
//         setModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (!deleteTarget?.id) return;
//         setDeleting(true);
//         try {
//             await deleteAssignment(deleteTarget.id);
//             setDeleteTarget(null);
//         } finally {
//             setDeleting(false);
//         }
//     };

//     if (loading) {
//         return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading notes...</div>;
//     }

//     return (
//         <div className="space-y-6 max-w-4xl mx-auto">
//             <div className="flex items-start justify-between gap-4">
//                 <div>
//                     <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
//                         <FileText className="w-6 h-6 text-blue-600" /> {t.notesLabel} & Study Material
//                     </h1>
//                     <p className="text-sm text-slate-500 mt-1">{notes.length} {t.notesLabel.toLowerCase()} uploaded for your {t.classesLabel.toLowerCase()}</p>
//                 </div>
//                 <Button
//                     className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
//                     onClick={openCreateModal}
//                 >
//                     <Upload className="w-4 h-4" /> Upload Note
//                 </Button>
//             </div>

//             <AppModal
//                 open={modalOpen}
//                 onClose={() => {
//                     setModalOpen(false);
//                     setForm(EMPTY_NOTE);
//                     setFiles([]);
//                     setEditingItem(null);
//                     setPublishNow(true);
//                 }}
//                 title={editingItem ? 'Edit Note / Study Material' : 'Upload Note / Study Material'}
//                 description="Students will be able to download this from their portal."
//                 size="md"
//                 footer={
//                     <>
//                         <Button variant="outline" onClick={() => {
//                             setModalOpen(false);
//                             setForm(EMPTY_NOTE);
//                             setFiles([]);
//                             setEditingItem(null);
//                             setPublishNow(true);
//                         }}>Cancel</Button>
//                         <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
//                             {saving ? (editingItem ? 'Updating...' : 'Uploading...') : (editingItem ? 'Update Note' : 'Upload Note')}
//                         </Button>
//                     </>
//                 }
//             >
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <InputField
//                         label="Note Title"
//                         name="title"
//                         required
//                         placeholder="e.g. Chapter 5 - Fractions Notes"
//                         value={form.title}
//                         onChange={handleChange}
//                     />

//                     <div className="grid grid-cols-2 gap-3">
//                         <div className="space-y-1.5">
//                             <SelectField
//                                 label="Class"
//                                 name="class_id"
//                                 required
//                                 value={asText(form.class_id)}
//                                 onChange={onClassChange}
//                                 placeholder="Select Class"
//                                 options={normalizedClasses.map((c) => ({ value: asText(c.class_id), label: c.class_name || c.name }))}
//                             />
//                         </div>
//                         <div className="space-y-1.5">
//                             <SelectField
//                                 label="Subject"
//                                 name="subject"
//                                 required
//                                 value={form.subject}
//                                 onChange={(v) => setForm((p) => ({ ...p, subject: v }))}
//                                 placeholder="Select Subject"
//                                 options={subjectOptions.map((s) => ({ value: s, label: s }))}
//                             />
//                         </div>
//                     </div>

//                     {effectiveSectionOptions.length > 0 && (
//                         <div className="space-y-1.5">
//                             <SelectField
//                                 label={`Section${requiresSection ? ' *' : ''}`}
//                                 name="section_id"
//                                 value={asText(form.section_id)}
//                                 onChange={(v) => setForm((p) => ({ ...p, section_id: v }))}
//                                 placeholder="Select Section"
//                                 options={effectiveSectionOptions.map((section) => ({ value: asText(section.id), label: section.name }))}
//                             />
//                         </div>
//                     )}

//                     <TextareaField
//                         label="Description"
//                         name="description"
//                         rows={2}
//                         placeholder="Brief description of this note..."
//                         value={form.description}
//                         onChange={handleChange}
//                         className="resize-none"
//                     />

//                     <div className="grid grid-cols-2 gap-3">
//                         <div className="space-y-1.5">
//                             <Label>Assigned Date</Label>
//                             <Popover>
//                                 <PopoverTrigger asChild>
//                                     <Button variant="outline" className="w-full justify-start text-left font-normal">
//                                         <CalendarIcon className="mr-2 h-4 w-4" />
//                                         {form.assigned_on
//                                             ? format(parseISO(form.assigned_on), 'dd MMM yyyy')
//                                             : <span className="text-muted-foreground">Pick a date</span>}
//                                     </Button>
//                                 </PopoverTrigger>
//                                 <PopoverContent className="w-auto p-0" align="start">
//                                     <Calendar
//                                         mode="single"
//                                         selected={form.assigned_on ? parseISO(form.assigned_on) : undefined}
//                                         onSelect={(d) => setForm((p) => ({ ...p, assigned_on: d ? format(d, 'yyyy-MM-dd') : '' }))}
//                                         captionLayout="dropdown"
//                                         fromYear={2020}
//                                         toYear={2030}
//                                         initialFocus
//                                     />
//                                 </PopoverContent>
//                             </Popover>
//                         </div>
//                         <div className="space-y-1.5">
//                             <Label htmlFor="note-file">Attach File(s)</Label>
//                             <label
//                                 htmlFor="note-file"
//                                 className="flex items-center gap-2 h-9 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
//                             >
//                                 <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
//                                 <span className="truncate">
//                                     {files.length ? `${files.length} file(s) selected` : 'Choose file(s)...'}
//                                 </span>
//                             </label>
//                             <input id="note-file" type="file" className="hidden" onChange={handleFile} multiple />
//                         </div>
//                     </div>

//                     <SwitchField
//                         label="Publish Now"
//                         name="is_published"
//                         value={publishNow}
//                         onChange={setPublishNow}
//                         hint="Turn off to save as draft"
//                     />

//                     {editingItem && existingAttachments.length > 0 && (
//                         <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
//                             <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Existing Attachments</p>
//                             {existingAttachments.map((file) => (
//                                 <div key={file.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 border border-slate-200">
//                                     <div className="min-w-0 flex items-center gap-2">
//                                         <Paperclip className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
//                                         <span className="text-xs text-slate-700 truncate">{file.name}</span>
//                                     </div>
//                                     {file.url ? (
//                                         <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">
//                                             Open <ExternalLink className="w-3.5 h-3.5" />
//                                         </a>
//                                     ) : (
//                                         <span className="text-xs text-slate-400">No URL</span>
//                                     )}
//                                 </div>
//                             ))}

//                             {existingPdf?.url && (
//                                 <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
//                                     <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 border-b">PDF Preview</div>
//                                     <iframe title="Note Attachment PDF" src={existingPdf.url} className="w-full h-64" />
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </form>
//             </AppModal>

//             <div className="flex flex-wrap gap-2">
//                 {subjects.map((s) => (
//                     <button
//                         key={s}
//                         onClick={() => setFilter(s)}
//                         className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSubject === s ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
//                     >
//                         {s}
//                     </button>
//                 ))}
//             </div>

//             {filtered.length === 0 ? (
//                 <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
//                     <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
//                     <p className="text-sm font-semibold">No notes uploaded yet.</p>
//                     <p className="text-xs mt-1">Click "Upload Note" to add your first note.</p>
//                 </div>
//             ) : (
//                 <div className="grid sm:grid-cols-2 gap-4">
//                     {filtered.map((note) => {
//                         const classInfo = classMap[note.class_id] || {};
//                         const sectionName = note.section_name || classInfo.section_name || classInfo.sections?.[1]?.name || '-';
//                         const filesCount = Array.isArray(note.attachments) ? note.attachments.length : 0;
//                         const firstFile = filesCount > 0 ? note.attachments[0]?.original_name || note.attachments[0]?.filename || '' : '';

//                         return (
//                             <div key={note.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
//                                 <div className="flex items-start justify-between mb-3">
//                                     <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
//                                         {note.subject || 'General'}
//                                     </span>
//                                     <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
//                                         {firstFile ? getFileExt(firstFile) : 'NOTE'}
//                                     </span>
//                                 </div>

//                                 <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{note.title}</h3>
//                                 <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{note.description || 'No description provided.'}</p>

//                                 <div className="flex items-center justify-between mt-4">
//                                     <div>
//                                         <p className="text-[10px] text-slate-400">
//                                             {note.class_name || classInfo.class_name || '-'}{sectionName && sectionName !== '-' ? ` - ${sectionName}` : ''}
//                                         </p>
//                                         <p className="text-[10px] text-slate-400 mt-0.5">Uploaded {formatSafeDate(note.assigned_on || note.created_at)}</p>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-[10px] text-slate-400 flex items-center gap-1">
//                                             <Download className="w-3 h-3" /> {filesCount}
//                                         </span>
//                                         <button
//                                             onClick={() => openEditModal(note)}
//                                             className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
//                                             title="Edit"
//                                         >
//                                             <Pencil className="w-3.5 h-3.5" />
//                                         </button>
//                                         <button
//                                             onClick={() => setDeleteTarget(note)}
//                                             className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
//                                             title="Delete"
//                                         >
//                                             <Trash2 className="w-3.5 h-3.5" />
//                                         </button>
//                                         <button
//                                             onClick={() => openAttachmentView(note)}
//                                             disabled={filesCount === 0}
//                                             className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
//                                         >
//                                             <Download className="w-3.5 h-3.5" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
//                 <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
//                     <PlusCircle className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <div>
//                     <p className="text-sm font-bold text-blue-900">Share Knowledge with Your Students</p>
//                     <p className="text-xs text-blue-700 mt-1">Upload notes, worksheets, or documents and publish them directly to the student portal.</p>
//                 </div>
//             </div>

//             <ConfirmDialog
//                 open={!!deleteTarget}
//                 onClose={() => setDeleteTarget(null)}
//                 onConfirm={confirmDelete}
//                 loading={deleting}
//                 title="Delete Note"
//                 description={`This will permanently delete "${deleteTarget?.title || 'this note'}".`}
//                 confirmLabel="Delete"
//                 variant="destructive"
//             />

//             <AppModal
//                 open={isAttachmentViewOpen}
//                 onClose={() => {
//                     setIsAttachmentViewOpen(false);
//                     setActiveAttachmentView(null);
//                 }}
//                 title={activeAttachmentView ? `${activeAttachmentView.title} Attachments` : 'Attachments'}
//                 description={activeAttachmentView ? `${activeAttachmentView.className} - Uploaded Materials` : 'Attachment details'}
//                 size="xl"
//                 footer={
//                     <Button
//                         variant="outline"
//                         onClick={() => {
//                             setIsAttachmentViewOpen(false);
//                             setActiveAttachmentView(null);
//                         }}
//                     >
//                         Close
//                     </Button>
//                 }
//             >
//                 {!activeAttachmentView ? null : (
//                     <div className="space-y-4">
//                         <div className="rounded-xl border border-slate-200 p-4">
//                             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Materials</p>
//                             {activeAttachmentView.materials.length === 0 ? (
//                                 <p className="text-sm text-slate-500">No material uploaded for this note.</p>
//                             ) : (
//                                 <div className="space-y-2">
//                                     {activeAttachmentView.materials.map((material) => (
//                                         <div key={material.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
//                                             <div className="min-w-0 flex items-center gap-2">
//                                                 <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
//                                                 <p className="text-sm text-slate-700 truncate">{material.name}</p>
//                                             </div>
//                                             {material.url ? (
//                                                 <a
//                                                     href={material.url}
//                                                     target="_blank"
//                                                     rel="noreferrer"
//                                                     className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
//                                                 >
//                                                     Open <ExternalLink className="w-3.5 h-3.5" />
//                                                 </a>
//                                             ) : (
//                                                 <span className="text-xs text-slate-400">No file URL</span>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {activeAttachmentView.pdfUrl && (
//                             <div className="rounded-xl border border-slate-200 overflow-hidden">
//                                 <div className="px-4 py-2 bg-slate-50 border-b text-xs font-semibold text-slate-600">
//                                     PDF Preview
//                                 </div>
//                                 <iframe
//                                     title="Note Attachment PDF Preview"
//                                     src={activeAttachmentView.pdfUrl}
//                                     className="w-full h-[60vh]"
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </AppModal>
//         </div>
//     );
// }




'use client';

import { useMemo, useState } from 'react';
import {
    FileText, Upload, Download, PlusCircle, Paperclip,
    CalendarIcon, Pencil, Trash2, ExternalLink, PlayCircle,
    Image as ImageIcon, X, BookOpen
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import SwitchField from '@/components/common/SwitchField';
import TextareaField from '@/components/common/TextareaField';
import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
import { teacherPortalService } from '@/services/teacherPortalService';
import useAuthStore from '@/store/authStore';

const SUBJECT_COLORS = {
    Mathematics: 'bg-blue-50 border-blue-100 text-blue-700',
    Science: 'bg-teal-50 border-teal-100 text-teal-700',
    English: 'bg-violet-50 border-violet-100 text-violet-700',
    Urdu: 'bg-emerald-50 border-emerald-100 text-emerald-700'
};

const EMPTY_NOTE = {
    title: '',
    subject: '',
    class_id: '',
    section_id: '',
    description: '',
    assigned_on: new Date().toISOString().slice(0, 10),
};

const asText = (value) => String(value ?? '').trim();

// File Type Helper
const getFileType = (url) => {
    if (!url) return 'file';
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (ext === 'pdf' || url.includes('/raw/upload')) return 'pdf';
    return 'file';
};

const formatSafeDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return format(parsed, 'dd MMM yyyy');
};

export default function TeacherNotesPage() {
    const user = useAuthStore((state) => state.user);
    const t = getPortalTerms(user?.institute_type || 'school');
    const { classes } = useTeacherClasses();
    const { assignments: notes, loading, createAssignment, updateAssignment, deleteAssignment } = useTeacherAssignments({ type: 'project' });

    const [filterSubject, setFilter] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_NOTE);
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [publishNow, setPublishNow] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [activeAttachmentView, setActiveAttachmentView] = useState(null);
    const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

    const normalizedClasses = useMemo(() => classes.map(cls => ({
        ...cls,
        class_id: asText(cls.class_id || cls.id),
        class_name: cls.class_name || cls.name,
        sections: Array.isArray(cls.sections) ? cls.sections : [],
        subjects: Array.isArray(cls.subjects) ? cls.subjects : []
    })), [classes]);

    const existingAttachments = useMemo(() => {
        if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
        return editingItem.attachments.map((file, idx) => ({
            id: file?.id || `${idx}`,
            name: file?.name || file?.original_name || file?.filename || `Note ${idx + 1}`,
            url: file?.url || file?.file_url || null,
            type: getFileType(file?.url || file?.file_url)
        }));
    }, [editingItem]);

    const selectedClass = normalizedClasses.find(c => c.class_id === form.class_id);
    const subjectOptions = selectedClass?.subjects || [];
    const sectionOptions = selectedClass?.sections || [];

    const subjectsList = ['All', ...new Set(notes.map(n => n.subject).filter(Boolean))];
    const filteredNotes = filterSubject === 'All' ? notes : notes.filter(n => n.subject === filterSubject);

    const onClassChange = (classId) => {
        const nextClassId = asText(classId);
        const cls = normalizedClasses.find((c) => asText(c.class_id) === nextClassId);
        const nextSections = cls?.sections || [];
        setForm((prev) => ({
            ...prev,
            class_id: nextClassId,
            section_id: '',
            subject: ''
        }));
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.subject || !form.class_id) {
            toast.error('Required fields missing'); return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                type: 'project',
                status: publishNow ? 'published' : 'draft',
                is_published: publishNow,
                remove_attachments: JSON.stringify(removedAttachmentIds)
            };
            const formData = teacherPortalService.prepareAssignmentFormData(payload, files);
            if (editingItem?.id) await updateAssignment(editingItem.id, formData);
            else await createAssignment(formData);

            toast.success(editingItem ? 'Note updated' : 'Note uploaded');
            setModalOpen(false);
            setForm(EMPTY_NOTE);
            setRemovedAttachmentIds([]);
            setFiles([]);
        } catch (err) {
            toast.error('Failed to save note');
        } finally { setSaving(false); }
    };

    const openAttachmentView = (item) => {
        const materials = (item.attachments || []).map((f, idx) => ({
            id: f.id || idx,
            name: f.name || f.filename || 'Material',
            url: f.url || f.file_url,
            type: getFileType(f.url || f.file_url)
        }));
        setActiveAttachmentView({
            title: item.title,
            materials,
            activeUrl: materials[0]?.url,
            activeType: materials[0]?.type
        });
        setIsAttachmentViewOpen(true);
    };

    // Existing attachments ko delete list mein daalne ka function
    const handleRemoveExistingFile = (id) => {
        setRemovedAttachmentIds((prev) => [...prev, id]);
    };

    if (loading) return <div className="max-w-4xl mx-auto p-10 text-center text-slate-500">Loading notes...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Area */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900">
                        <FileText className="w-7 h-7 text-blue-600" /> {t.notesLabel} & Study Material
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 tracking-tight">Share study guides, PDFs and resources with your students.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                    onClick={() => { setEditingItem(null); setForm(EMPTY_NOTE); setPublishNow(true); setFiles([]); setRemovedAttachmentIds([]); setModalOpen(true); }}>
                    <Upload className="w-4 h-4 mr-2" /> Upload Note
                </Button>
            </div>

            {/* Subject Filters */}
            <div className="flex flex-wrap gap-2">
                {subjectsList.map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterSubject === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20 text-blue-600" />
                    <p className="text-slate-500 font-bold">No notes found</p>
                    <p className="text-xs text-slate-400 mt-1">Start by uploading some study material for your class.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {filteredNotes.map((note, i) => {
                        const count = note.attachments?.length || 0;
                        const colorClass = SUBJECT_COLORS[note.subject] || 'bg-slate-50 border-slate-100 text-slate-600';
                        return (
                            <div key={note.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:border-blue-200 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border ${colorClass}`}>
                                        {note.subject || 'General'}
                                    </span>
                                    <div className="flex gap-1">
                                        <button onClick={() => {
                                            setEditingItem(note);
                                            setRemovedAttachmentIds([]);
                                            setForm({ ...note, assigned_on: note.assigned_on?.split('T')[0] });
                                            setModalOpen(true);
                                        }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => setDeleteTarget(note)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h3 className="font-extrabold text-slate-800 line-clamp-1">{note.title}</h3>
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{note.description || 'No description provided.'}</p>

                                <div className="mt-6 flex items-center justify-between border-t pt-4 border-slate-50">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {note.class_name} <span className="mx-1">•</span> {formatSafeDate(note.assigned_on)}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => openAttachmentView(note)} disabled={count === 0}
                                        className="h-8 text-[11px] font-extrabold text-blue-600 hover:bg-blue-50 rounded-xl gap-2">
                                        <Paperclip className="w-3.5 h-3.5" /> {count} Files
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── View Modal (Google Drive Style) ── */}
            <AppModal open={isAttachmentViewOpen} onClose={() => setIsAttachmentViewOpen(false)} title={activeAttachmentView?.title} size="xl">
                {activeAttachmentView && (
                    <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
                        {/* Sidebar */}
                        <div className="w-full md:w-[220px] border-r pr-2 overflow-y-auto flex-shrink-0">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-3 tracking-widest px-1">Resources</p>
                            <div className="flex md:flex-col gap-2 overflow-x-auto">
                                {activeAttachmentView.materials.map((m) => (
                                    <button key={m.id} onClick={() => setActiveAttachmentView(p => ({ ...p, activeUrl: m.url, activeType: m.type }))}
                                        className={`flex-shrink-0 md:w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${activeAttachmentView.activeUrl === m.url ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10' : 'bg-white hover:bg-slate-50'}`}>
                                        {m.type === 'image' ? <ImageIcon className="w-4 h-4 text-pink-500" /> : m.type === 'video' ? <PlayCircle className="w-4 h-4 text-orange-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                                        <span className="text-[11px] font-bold truncate text-slate-700">{m.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center relative border-4 border-slate-100 shadow-2xl">
                            {activeAttachmentView.activeUrl ? (
                                <>
                                    {activeAttachmentView.activeType === 'image' ? (
                                        <img src={activeAttachmentView.activeUrl} className="max-w-full max-h-full object-contain" alt="Note Preview" />
                                    ) : activeAttachmentView.activeType === 'video' ? (
                                        <video src={activeAttachmentView.activeUrl} controls className="w-full h-full" />
                                    ) : (
                                        <iframe src={`${activeAttachmentView.activeUrl}#toolbar=1&view=FitH`} className="w-full h-full border-none" title="PDF Note" />
                                    )}
                                    <a href={activeAttachmentView.activeUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl text-white text-[10px] font-bold backdrop-blur-xl border border-white/30 transition-all">OPEN FULLSCREEN</a>
                                </>
                            ) : <p className="text-white/40 text-xs italic">Select a file to view</p>}
                        </div>
                    </div>
                )}
            </AppModal>

            {/* ── Edit/Upload Modal ── */}
            <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Update Note' : 'Upload New Note'} size="md">
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                    <InputField label="Note Title" required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Geometry Lecture Notes" />

                    <div className="grid grid-cols-2 gap-3">
                        <SelectField label="Class" value={form.class_id} onChange={onClassChange} options={normalizedClasses.map(c => ({ value: c.class_id, label: c.class_name }))} placeholder="Select Class" />
                        <SelectField label="Subject" value={form.subject} onChange={(v) => setForm(p => ({ ...p, subject: v }))} options={subjectOptions.map(s => ({ value: s, label: s }))} placeholder="Select Subject" />
                    </div>

                    <TextareaField label="Description (Optional)" rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Explain what these notes cover..." />

                    {/* Manage Existing Attachments */}
                    {editingItem && existingAttachments.length > removedAttachmentIds.length && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Attached Files</p>
                            {existingAttachments.filter(f => !removedAttachmentIds.includes(f.id)).map(f => (
                                <div key={f.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                            {f.type === 'image' ? <ImageIcon className="w-4 h-4 text-pink-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <span className="text-xs font-bold truncate text-slate-700">{f.name}</span>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveExistingFile(f.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 ml-1">Upload New Files</Label>
                        <label className="flex items-center justify-center flex-col gap-2 py-8 border-2 border-dashed rounded-2xl px-3 cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all border-slate-200 bg-slate-50/50 group">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">{files.length ? `${files.length} files ready` : 'Click to browse or drop files'}</span>
                            <input type="file" className="hidden" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1.5">
                            <Label>Publish Date</Label>
                            <input type="date" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 ring-blue-50 outline-none transition-all" value={form.assigned_on} onChange={(e) => setForm(p => ({ ...p, assigned_on: e.target.value }))} />
                        </div>
                    </div>

                    <SwitchField label="Publish Immediately" value={publishNow} onChange={setPublishNow} hint="Visible to students as soon as you upload." />

                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                        <Button variant="outline" type="button" className="rounded-xl px-6" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 min-w-[140px] shadow-lg shadow-blue-100" type="submit" disabled={saving}>
                            {saving ? 'Processing...' : editingItem ? 'Save Changes' : 'Upload Now'}
                        </Button>
                    </div>
                </form>
            </AppModal>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white flex items-center gap-6 shadow-xl shadow-blue-100">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-lg leading-tight">Study Material Portal</h4>
                    <p className="text-blue-100 text-xs mt-1 leading-relaxed opacity-90">All documents uploaded here are instantly available to your students. You can upload PDFs, Images, and even short instructional videos.</p>
                </div>
            </div>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={async () => { await deleteAssignment(deleteTarget.id); setDeleteTarget(null); }}
                title="Delete Note?" description="This document will be removed from the student portal permanently." />
        </div>
    );
}