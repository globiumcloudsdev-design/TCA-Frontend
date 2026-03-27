
// // src/app/student/assignments/page.jsx

// 'use client';

// import { useMemo, useState, useRef } from 'react';
// import { 
//   ClipboardList, Upload, Paperclip, ExternalLink, FileText, 
//   ImageIcon, Video, FileQuestion, ChevronRight, X, Loader2,
//   Clock, Calendar, User, BookOpen, Award, MessageSquare,
//   CheckCircle, AlertCircle, Download, Eye, Send
// } from 'lucide-react';
// import { useStudentAssignments, useSubmitStudentAssignment } from '@/hooks/useStudentPortal';
// import { Button } from '@/components/ui/button';
// import AppModal from '@/components/common/AppModal';
// import { toast } from 'sonner';
// import { format } from 'date-fns';

// const FILTERS = [
//   { value: '', label: 'All' },
//   { value: 'pending', label: 'Pending' },
//   { value: 'submitted', label: 'Submitted' },
//   { value: 'graded', label: 'Graded' },
//   { value: 'overdue', label: 'Overdue' }
// ];

// export default function StudentAssignmentsPage() {
//   const [status, setStatus] = useState('');
//   const [viewerOpen, setViewerOpen] = useState(false);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const [activeFile, setActiveFile] = useState(null);
//   const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
//   const [submissionText, setSubmissionText] = useState('');
//   const [selectedFiles, setSelectedFiles] = useState([]);
  
//   // Submission States
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const fileInputRef = useRef(null);

//   const assignmentFilters = status ? { status, type: 'assignment' } : { type: 'assignment' };
//   const { data: assignmentsRes, isLoading, refetch } = useStudentAssignments(assignmentFilters, 1, 50);
//   const submitMutation = useSubmitStudentAssignment();

//   const assignments = assignmentsRes?.data || [];

//   const counts = useMemo(() => ({
//     pending: assignments.filter((item) => ['pending', 'late'].includes(item.status)).length,
//     submitted: assignments.filter((item) => item.status === 'submitted').length,
//     graded: assignments.filter((item) => item.status === 'graded').length
//   }), [assignments]);

//   // Combined List for Preview (Attachments + Submission Files)
//   const allFiles = useMemo(() => {
//     if (!selectedAssignment) return [];
//     const attachments = (selectedAssignment.attachments || []).map(f => ({ ...f, origin: 'Teacher Attachment' }));
//     const submissionFiles = (selectedAssignment.submission?.files || []).map(f => ({ ...f, origin: 'Your Submission' }));
//     return [...attachments, ...submissionFiles];
//   }, [selectedAssignment]);

//   const openViewer = (item) => {
//     setSelectedAssignment(item);
//     const firstFile = item.attachments?.[0] || item.submission?.files?.[0];
//     setActiveFile(firstFile || null);
//     setViewerOpen(true);
//   };

//   const openSubmissionModal = (assignment) => {
//     setSelectedAssignment(assignment);
//     setSubmissionText('');
//     setSelectedFiles([]);
//     setSubmissionModalOpen(true);
//   };

//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);
//     setSelectedFiles(prev => [...prev, ...files]);
//   };

//   const removeFile = (index) => {
//     setSelectedFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmitAssignment = async () => {
//     if (!selectedAssignment) return;
    
//     if (selectedFiles.length === 0 && !submissionText.trim()) {
//       toast.error("Please add a submission text or upload files");
//       return;
//     }

//     const formData = new FormData();
//     formData.append('assignment_id', selectedAssignment.id);
//     if (submissionText.trim()) {
//       formData.append('submission_text', submissionText);
//     }
//     selectedFiles.forEach((file) => {
//       formData.append('files', file);
//     });

//     try {
//       setIsSubmitting(true);
//       await submitMutation.mutateAsync({ 
//         assignmentId: selectedAssignment.id, 
//         formData 
//       });
//       toast.success("Assignment submitted successfully!");
//       setSubmissionModalOpen(false);
//       refetch();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to submit. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const getFileType = (url) => {
//     if (!url) return 'unknown';
//     const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
//     if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
//     if (['pdf'].includes(ext)) return 'pdf';
//     if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
//     if (['doc', 'docx'].includes(ext)) return 'word';
//     if (['xls', 'xlsx'].includes(ext)) return 'excel';
//     if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
//     if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
//     return 'other';
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes) return '';
//     const sizes = ['B', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(1024));
//     return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
//   };

//   if (isLoading) {
//     return (
//       <div className="max-w-5xl mx-auto p-10 text-center">
//         <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
//         <p className="text-slate-500 font-medium">Loading assignments...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 bg-slate-50/30 min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col gap-4">
//         <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
//           <div className="p-2 bg-emerald-100 rounded-xl">
//             <ClipboardList className="w-6 h-6 text-emerald-600" />
//           </div>
//           Assignments
//         </h1>

//         {/* Stats Section */}
//         <div className="grid grid-cols-3 gap-3 md:gap-4">
//           <CountCard label="Pending" value={counts.pending} color="amber" />
//           <CountCard label="Submitted" value={counts.submitted} color="emerald" />
//           <CountCard label="Graded" value={counts.graded} color="blue" />
//         </div>

//         {/* Filter Chips */}
//         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
//           {FILTERS.map((item) => (
//             <button
//               key={item.value}
//               onClick={() => setStatus(item.value)}
//               className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
//                 status === item.value 
//                 ? 'bg-emerald-600 text-white border-emerald-600' 
//                 : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Main List */}
//       {assignments.length === 0 ? (
//         <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400">
//           No assignments found in this category.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {assignments.map((item) => (
//             <AssignmentCard 
//               key={item.id} 
//               assignment={item} 
//               onView={() => openViewer(item)}
//               onSubmit={() => openSubmissionModal(item)}
//             />
//           ))}
//         </div>
//       )}

//       {/* File Viewer Modal */}
//       <FileViewerModal
//         open={viewerOpen}
//         onClose={() => setViewerOpen(false)}
//         assignment={selectedAssignment}
//         activeFile={activeFile}
//         setActiveFile={setActiveFile}
//         allFiles={allFiles}
//         onOpenSubmission={() => {
//           setViewerOpen(false);
//           openSubmissionModal(selectedAssignment);
//         }}
//       />

//       {/* Submission Modal */}
//       <SubmissionModal
//         open={submissionModalOpen}
//         onClose={() => setSubmissionModalOpen(false)}
//         assignment={selectedAssignment}
//         submissionText={submissionText}
//         setSubmissionText={setSubmissionText}
//         selectedFiles={selectedFiles}
//         onFileSelect={handleFileSelect}
//         onRemoveFile={removeFile}
//         onSubmit={handleSubmitAssignment}
//         isSubmitting={isSubmitting}
//         fileInputRef={fileInputRef}
//       />

//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// }

// // Assignment Card Component
// function AssignmentCard({ assignment, onView, onSubmit }) {
//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'submitted': return 'bg-emerald-100 text-emerald-700';
//       case 'graded': return 'bg-blue-100 text-blue-700';
//       case 'overdue': return 'bg-red-100 text-red-700';
//       case 'late': return 'bg-orange-100 text-orange-700';
//       default: return 'bg-amber-100 text-amber-700';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'submitted': return <CheckCircle className="w-3 h-3" />;
//       case 'graded': return <Award className="w-3 h-3" />;
//       case 'overdue': return <AlertCircle className="w-3 h-3" />;
//       default: return <Clock className="w-3 h-3" />;
//     }
//   };

//   const isOverdue = assignment.status === 'overdue' || assignment.status === 'late';
//   const canSubmit = assignment.status === 'pending' || (assignment.allow_late_submission && isOverdue);

//   return (
//     <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
//       <div className="flex justify-between items-start mb-4">
//         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-slate-100 text-slate-600">
//           {assignment.subject || 'General'}
//         </span>
//         <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${getStatusColor(assignment.status)}`}>
//           {getStatusIcon(assignment.status)}
//           <span>{assignment.status || 'Pending'}</span>
//         </div>
//       </div>

//       <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">
//         {assignment.title}
//       </h3>
      
//       {/* Description Preview */}
//       {assignment.description && (
//         <p className="text-sm text-slate-500 mb-3 line-clamp-2">
//           {assignment.description}
//         </p>
//       )}

//       <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
//         <div className="flex items-center gap-1">
//           <User className="w-3 h-3" />
//           <span>{assignment.teacher || 'School System'}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <Calendar className="w-3 h-3" />
//           <span>{assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : '-'}</span>
//         </div>
//         {assignment.total_marks && (
//           <div className="flex items-center gap-1">
//             <Award className="w-3 h-3" />
//             <span>{assignment.total_marks} marks</span>
//           </div>
//         )}
//       </div>

//       {/* Attachments Preview */}
//       {assignment.attachments?.length > 0 && (
//         <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
//           <Paperclip className="w-3 h-3" />
//           <span>{assignment.attachments.length} attachment(s)</span>
//         </div>
//       )}

//       <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
//         <Button 
//           size="sm" 
//           variant="outline" 
//           className="rounded-xl border-slate-200 hover:bg-slate-50"
//           onClick={onView}
//         >
//           <Eye className="w-4 h-4 mr-1" /> View Details
//         </Button>
        
//         {canSubmit && (
//           <Button 
//             size="sm" 
//             className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
//             onClick={onSubmit}
//           >
//             <Upload className="w-4 h-4 mr-1" /> Submit
//           </Button>
//         )}

//         {assignment.status === 'graded' && assignment.submission?.marks !== undefined && (
//           <div className="text-right">
//             <span className="text-xs text-slate-500">Marks: </span>
//             <span className="font-bold text-emerald-600">
//               {assignment.submission.marks}/{assignment.total_marks}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // File Viewer Modal Component
// function FileViewerModal({ open, onClose, assignment, activeFile, setActiveFile, allFiles, onOpenSubmission }) {
//   if (!assignment) return null;

//   const getFileTypeIcon = (type) => {
//     switch(type) {
//       case 'pdf': return <FileText className="w-4 h-4" />;
//       case 'image': return <ImageIcon className="w-4 h-4" />;
//       case 'video': return <Video className="w-4 h-4" />;
//       case 'word': return <FileText className="w-4 h-4" />;
//       case 'excel': return <FileText className="w-4 h-4" />;
//       default: return <FileQuestion className="w-4 h-4" />;
//     }
//   };

//   const getFileType = (url) => {
//     if (!url) return 'unknown';
//     const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
//     if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
//     if (['pdf'].includes(ext)) return 'pdf';
//     if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
//     if (['doc', 'docx'].includes(ext)) return 'word';
//     if (['xls', 'xlsx'].includes(ext)) return 'excel';
//     return 'other';
//   };

//   return (
//     <AppModal
//       open={open}
//       onClose={onClose}
//       title={assignment.title}
//       size="xl"
//     >
//       <div className="flex flex-col lg:flex-row h-[85vh] lg:h-[80vh] bg-white overflow-hidden -m-6">
//         {/* Left Sidebar */}
//         <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0">
//           <div className="p-4 border-b bg-white">
//             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
//               Assignment Details
//             </h4>
            
//             {/* Assignment Info */}
//             <div className="space-y-2 text-sm">
//               {assignment.description && (
//                 <div className="text-slate-600">
//                   <p className="font-semibold text-slate-700 mb-1">Description:</p>
//                   <p className="text-xs">{assignment.description}</p>
//                 </div>
//               )}
              
//               <div className="flex items-center gap-2 text-xs">
//                 <Clock className="w-3 h-3 text-slate-400" />
//                 <span>Due: {assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : '-'}</span>
//               </div>
              
//               {assignment.total_marks && (
//                 <div className="flex items-center gap-2 text-xs">
//                   <Award className="w-3 h-3 text-slate-400" />
//                   <span>Total Marks: {assignment.total_marks}</span>
//                 </div>
//               )}
              
//               {assignment.instructions && (
//                 <div className="mt-2 p-2 bg-amber-50 rounded-lg">
//                   <p className="text-xs font-semibold text-amber-700">Instructions:</p>
//                   <p className="text-xs text-amber-600">{assignment.instructions}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="p-4 border-b bg-white flex items-center justify-between">
//             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//               Files ({allFiles.length})
//             </h4>
            
//             {assignment.status === 'pending' && (
//               <Button 
//                 size="sm" 
//                 className="h-8 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold"
//                 onClick={() => {
//                   onClose();
//                   onOpenSubmission();
//                 }}
//               >
//                 <Upload className="w-3 h-3 mr-1" /> SUBMIT WORK
//               </Button>
//             )}
//           </div>
          
//           <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 lg:p-3 gap-2 no-scrollbar">
//             {allFiles.length === 0 ? (
//               <div className="p-8 text-center text-slate-400 text-sm italic">No files available</div>
//             ) : (
//               allFiles.map((file, idx) => {
//                 const isActive = activeFile?.url === file.url || activeFile?.file_url === file.file_url;
//                 const type = getFileType(file.file_url || file.url);
                
//                 return (
//                   <button
//                     key={idx}
//                     onClick={() => setActiveFile(file)}
//                     className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all min-w-[200px] lg:min-w-0 shrink-0 border ${
//                       isActive 
//                       ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
//                       : 'bg-white border-slate-100 hover:bg-slate-100 text-slate-600'
//                     }`}
//                   >
//                     <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
//                       {getFileTypeIcon(type)}
//                     </div>
                    
//                     <div className="min-w-0 flex-1">
//                       <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
//                         {file.name || `File ${idx + 1}`}
//                       </p>
//                       <p className={`text-[9px] uppercase font-bold opacity-60`}>{file.origin}</p>
//                     </div>
//                     {isActive && <ChevronRight className="w-4 h-4 hidden lg:block opacity-50" />}
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* Right Content: Preview */}
//         <div className="flex-1 bg-slate-200/50 relative flex flex-col min-h-0">
//           {activeFile ? (
//             <>
//               <div className="absolute top-4 right-4 z-20 flex gap-2">
//                 <a 
//                   href={activeFile.file_url || activeFile.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg text-slate-700 text-xs font-bold hover:scale-105 transition-transform"
//                 >
//                   Full View <ExternalLink className="w-3 h-3" />
//                 </a>
//                 <a 
//                   href={activeFile.file_url || activeFile.url} 
//                   download
//                   className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg text-slate-700 text-xs font-bold hover:scale-105 transition-transform"
//                 >
//                   <Download className="w-3 h-3" /> Download
//                 </a>
//               </div>

//               <div className="flex-1 overflow-hidden flex items-center justify-center p-2 lg:p-6">
//                 {getFileType(activeFile.file_url || activeFile.url) === 'image' && (
//                   <img src={activeFile.file_url || activeFile.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 border-white" />
//                 )}

//                 {getFileType(activeFile.file_url || activeFile.url) === 'pdf' && (
//                   <iframe 
//                     src={`${activeFile.file_url || activeFile.url}#toolbar=1&view=FitH`}
//                     className="w-full h-full rounded-lg bg-white shadow-2xl border-none"
//                     title="PDF Preview"
//                   />
//                 )}

//                 {getFileType(activeFile.file_url || activeFile.url) === 'video' && (
//                   <video controls className="max-w-full max-h-full rounded-lg shadow-2xl bg-black">
//                     <source src={activeFile.file_url || activeFile.url} />
//                   </video>
//                 )}

//                 {getFileType(activeFile.file_url || activeFile.url) === 'other' && (
//                   <div className="text-center bg-white p-10 rounded-3xl shadow-xl">
//                     <FileQuestion className="w-16 h-16 text-slate-200 mx-auto mb-4" />
//                     <h4 className="font-bold text-slate-800">Preview Unavailable</h4>
//                     <p className="text-xs text-slate-500 mb-6">Download to view this file type.</p>
//                     <Button asChild variant="outline" className="rounded-xl">
//                       <a href={activeFile.file_url || activeFile.url} download>Download Now</a>
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
//               <Paperclip className="w-12 h-12 opacity-10" />
//               <p className="text-sm font-medium">Select a file from the list to preview</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </AppModal>
//   );
// }

// // Submission Modal Component
// function SubmissionModal({ 
//   open, onClose, assignment, submissionText, setSubmissionText,
//   selectedFiles, onFileSelect, onRemoveFile, onSubmit, isSubmitting, fileInputRef
// }) {
//   if (!assignment) return null;

//   const formatFileSize = (bytes) => {
//     if (!bytes) return '';
//     const sizes = ['B', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(1024));
//     return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
//   };

//   return (
//     <AppModal
//       open={open}
//       onClose={onClose}
//       title={`Submit: ${assignment.title}`}
//       size="lg"
//     >
//       <div className="space-y-6 p-2">
//         {/* Assignment Info Banner */}
//         <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
//           <h4 className="font-semibold text-emerald-800 mb-2">Assignment Details</h4>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div>
//               <p className="text-xs text-emerald-600">Subject</p>
//               <p className="font-medium text-emerald-900">{assignment.subject || 'General'}</p>
//             </div>
//             <div>
//               <p className="text-xs text-emerald-600">Due Date</p>
//               <p className="font-medium text-emerald-900">
//                 {assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : '-'}
//               </p>
//             </div>
//             {assignment.total_marks && (
//               <div>
//                 <p className="text-xs text-emerald-600">Total Marks</p>
//                 <p className="font-medium text-emerald-900">{assignment.total_marks}</p>
//               </div>
//             )}
//           </div>
//           {assignment.description && (
//             <div className="mt-3">
//               <p className="text-xs text-emerald-600">Description</p>
//               <p className="text-sm text-emerald-800 mt-1">{assignment.description}</p>
//             </div>
//           )}
//         </div>

//         {/* Submission Text Area */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">
//             Submission Text <span className="text-slate-400 text-xs">(Optional)</span>
//           </label>
//           <textarea
//             value={submissionText}
//             onChange={(e) => setSubmissionText(e.target.value)}
//             placeholder="Add any notes, comments, or explanation with your submission..."
//             className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
//             rows={4}
//           />
//         </div>

//         {/* File Upload Section */}
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">
//             Attach Files <span className="text-slate-400 text-xs">(Optional)</span>
//           </label>
          
//           <input
//             type="file"
//             ref={fileInputRef}
//             className="hidden"
//             multiple
//             onChange={onFileSelect}
//           />
          
//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 hover:bg-emerald-50 transition-all"
//           >
//             <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
//             <p className="text-sm text-slate-500">Click to upload files</p>
//             <p className="text-xs text-slate-400 mt-1">PDF, Images, Documents, Videos (Max 50MB each)</p>
//           </button>

//           {/* File List */}
//           {selectedFiles.length > 0 && (
//             <div className="mt-4 space-y-2">
//               {selectedFiles.map((file, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
//                   <div className="flex items-center gap-3">
//                     <FileText className="w-5 h-5 text-slate-500" />
//                     <div>
//                       <p className="text-sm font-medium text-slate-700">{file.name}</p>
//                       <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => onRemoveFile(index)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
//           <Button
//             variant="outline"
//             onClick={onClose}
//             className="rounded-xl"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={onSubmit}
//             disabled={isSubmitting || (selectedFiles.length === 0 && !submissionText.trim())}
//             className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                 Submitting...
//               </>
//             ) : (
//               <>
//                 <Send className="w-4 h-4 mr-2" />
//                 Submit Assignment
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </AppModal>
//   );
// }

// // Count Card Component
// function CountCard({ label, value, color }) {
//   const colorClasses = {
//     amber: 'text-amber-600',
//     emerald: 'text-emerald-600',
//     blue: 'text-blue-600',
//   };

//   return (
//     <div className="border rounded-2xl p-4 text-center shadow-sm bg-white">
//       <p className={`text-2xl font-black mb-0.5 ${colorClasses[color]}`}>{value}</p>
//       <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
//     </div>
//   );
// }









// src/app/student/assignments/page.jsx

'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { 
  ClipboardList, Upload, Paperclip, ExternalLink, FileText, 
  ImageIcon, Video, FileQuestion, ChevronRight, X, Loader2,
  Clock, Calendar, User, BookOpen, Award, MessageSquare,
  CheckCircle, AlertCircle, Download, Eye, Send, Edit3,
  Save, Trash2, Info, TrendingUp, TrendingDown, MinusCircle,
  CheckCircle2, XCircle, AlertTriangle, FileCheck, FileX
} from 'lucide-react';
import { useStudentAssignments, useSubmitStudentAssignment } from '@/hooks/useStudentPortal';
import { Button } from '@/components/ui/button';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { toast } from 'sonner';
import { format, isAfter, isBefore, differenceInDays, isToday, isPast } from 'date-fns';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'overdue', label: 'Overdue' }
];

export default function StudentAssignmentsPage() {
  const [status, setStatus] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editSubmissionModalOpen, setEditSubmissionModalOpen] = useState(false);
  const [editSubmissionText, setEditSubmissionText] = useState('');
  const [editFiles, setEditFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const assignmentFilters = status ? { status, type: 'assignment' } : { type: 'assignment' };
  const { data: assignmentsRes, isLoading, refetch } = useStudentAssignments(assignmentFilters, 1, 50);
  const submitMutation = useSubmitStudentAssignment();

  const assignments = assignmentsRes?.data || [];

  const counts = useMemo(() => ({
    pending: assignments.filter((item) => ['pending', 'late'].includes(item.status)).length,
    submitted: assignments.filter((item) => item.status === 'submitted').length,
    graded: assignments.filter((item) => item.status === 'graded').length,
    overdue: assignments.filter((item) => item.status === 'overdue').length
  }), [assignments]);

  // Combined List for Preview (Attachments + Submission Files)
  const allFiles = useMemo(() => {
    if (!selectedAssignment) return [];
    const attachments = (selectedAssignment.attachments || []).map(f => ({ 
      ...f, 
      origin: 'Teacher Attachment',
      canDelete: false 
    }));
    const submissionFiles = (selectedAssignment.submission?.files || []).map(f => ({ 
      ...f, 
      origin: 'Your Submission',
      canDelete: true,
      id: f.id || f._id 
    }));
    return [...attachments, ...submissionFiles];
  }, [selectedAssignment]);

  // Check if assignment can be edited (not submitted and not overdue)
  const canEditSubmission = (assignment) => {
    if (!assignment) return false;
    const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
    const isOverdue = assignment.status === 'overdue';
    const dueDatePassed = assignment.due_date ? isPast(new Date(assignment.due_date)) : false;
    
    // Can edit if: not submitted AND (not overdue OR allow late submission)
    return !isSubmitted && (!dueDatePassed || assignment.allow_late_submission);
  };

  // Check if assignment is overdue
  const isAssignmentOverdue = (assignment) => {
    if (!assignment?.due_date) return false;
    const dueDate = new Date(assignment.due_date);
    return isPast(dueDate) && assignment.status !== 'submitted' && assignment.status !== 'graded';
  };

  // Get days remaining
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return { days: Math.abs(days), label: 'Overdue', color: 'text-red-600' };
    if (days === 0) return { days: 0, label: 'Due Today', color: 'text-orange-600' };
    if (days === 1) return { days: 1, label: '1 Day Left', color: 'text-amber-600' };
    return { days, label: `${days} Days Left`, color: 'text-emerald-600' };
  };

  const openViewer = (item) => {
    setSelectedAssignment(item);
    const firstFile = item.attachments?.[0] || item.submission?.files?.[0];
    setActiveFile(firstFile || null);
    setViewerOpen(true);
  };

  const openSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setSelectedFiles([]);
    setSubmissionModalOpen(true);
  };

  const openEditSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setEditSubmissionText(assignment.submission?.submission_text || '');
    setExistingFiles(assignment.submission?.files || []);
    setEditFiles([]);
    setEditSubmissionModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleEditFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setEditFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditFile = (index) => {
    setEditFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = (fileId, fileName) => {
    setDeleteFileId(fileId);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!deleteFileId || !selectedAssignment) return;
    
    try {
      // Call API to delete file from submission
      const formData = new FormData();
      formData.append('assignment_id', selectedAssignment.id);
      formData.append('delete_file_id', deleteFileId);
      
      await submitMutation.mutateAsync({ 
        assignmentId: selectedAssignment.id, 
        formData,
        isDelete: true
      });
      
      // Update local state
      setExistingFiles(prev => prev.filter(f => f.id !== deleteFileId));
      toast.success('File removed successfully');
      setConfirmDeleteOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to remove file');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    if (selectedFiles.length === 0 && !submissionText.trim()) {
      toast.error("Please add a submission text or upload files");
      return;
    }

    const formData = new FormData();
    formData.append('assignment_id', selectedAssignment.id);
    if (submissionText.trim()) {
      formData.append('submission_text', submissionText);
    }
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setIsSubmitting(true);
      await submitMutation.mutateAsync({ 
        assignmentId: selectedAssignment.id, 
        formData 
      });
      toast.success("Assignment submitted successfully!");
      setSubmissionModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmission = async () => {
    if (!selectedAssignment) return;
    
    if (editFiles.length === 0 && !editSubmissionText.trim() && existingFiles.length === 0) {
      toast.error("Please add a submission text or upload files");
      return;
    }

    const formData = new FormData();
    formData.append('assignment_id', selectedAssignment.id);
    formData.append('submission_text', editSubmissionText);
    formData.append('is_edit', 'true');
    
    editFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setIsEditing(true);
      await submitMutation.mutateAsync({ 
        assignmentId: selectedAssignment.id, 
        formData 
      });
      toast.success("Submission updated successfully!");
      setEditSubmissionModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update submission. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
          </div>
          Assignments
        </h1>

        {/* Stats Section with Progress */}
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          <CountCard label="Pending" value={counts.pending} color="amber" icon={Clock} />
          <CountCard label="Submitted" value={counts.submitted} color="emerald" icon={CheckCircle} />
          <CountCard label="Graded" value={counts.graded} color="blue" icon={Award} />
          <CountCard label="Overdue" value={counts.overdue} color="red" icon={AlertCircle} />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setStatus(item.value)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
                status === item.value 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {assignments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No assignments found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((item) => (
            <AssignmentCard 
              key={item.id} 
              assignment={item} 
              onView={() => openViewer(item)}
              onSubmit={() => openSubmissionModal(item)}
              onEdit={() => openEditSubmissionModal(item)}
              getDaysRemaining={getDaysRemaining}
              isAssignmentOverdue={isAssignmentOverdue}
            />
          ))}
        </div>
      )}

      {/* File Viewer Modal */}
      <FileViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        assignment={selectedAssignment}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        allFiles={allFiles}
        canEdit={selectedAssignment ? canEditSubmission(selectedAssignment) : false}
        onOpenSubmission={() => {
          setViewerOpen(false);
          openSubmissionModal(selectedAssignment);
        }}
        onEditSubmission={() => {
          setViewerOpen(false);
          openEditSubmissionModal(selectedAssignment);
        }}
      />

      {/* Submission Modal */}
      <SubmissionModal
        open={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        assignment={selectedAssignment}
        submissionText={submissionText}
        setSubmissionText={setSubmissionText}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        onSubmit={handleSubmitAssignment}
        isSubmitting={isSubmitting}
        fileInputRef={fileInputRef}
      />

      {/* Edit Submission Modal */}
      <EditSubmissionModal
        open={editSubmissionModalOpen}
        onClose={() => setEditSubmissionModalOpen(false)}
        assignment={selectedAssignment}
        submissionText={editSubmissionText}
        setSubmissionText={setEditSubmissionText}
        existingFiles={existingFiles}
        editFiles={editFiles}
        onFileSelect={handleEditFileSelect}
        onRemoveFile={removeEditFile}
        onDeleteFile={handleDeleteExistingFile}
        onSubmit={handleEditSubmission}
        isSubmitting={isEditing}
        fileInputRef={editFileInputRef}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteFile}
        title="Delete File"
        description="Are you sure you want to remove this file from your submission? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

// Enhanced Assignment Card Component
function AssignmentCard({ assignment, onView, onSubmit, onEdit, getDaysRemaining, isAssignmentOverdue }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'submitted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'graded': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'late': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'submitted': return <CheckCircle2 className="w-3 h-3" />;
      case 'graded': return <Award className="w-3 h-3" />;
      case 'overdue': return <XCircle className="w-3 h-3" />;
      case 'late': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const isOverdue = isAssignmentOverdue(assignment);
  const canSubmit = assignment.status === 'pending' && !isOverdue;
  const canEdit = assignment.status === 'submitted' && !assignment.is_graded;
  const daysInfo = getDaysRemaining(assignment.due_date);
  const hasSubmission = assignment.submission !== null;
  const submissionMarks = assignment.submission?.marks;
  const totalMarks = assignment.total_marks;
  const percentage = submissionMarks && totalMarks ? (submissionMarks / totalMarks) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group relative overflow-hidden">
      {/* Progress Bar for Graded Assignments */}
      {assignment.status === 'graded' && (
        <div className="absolute top-0 left-0 right-0 h-1">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-slate-100 text-slate-600">
          {assignment.subject || 'General'}
        </span>
        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getStatusColor(assignment.status)}`}>
          {getStatusIcon(assignment.status)}
          <span>{assignment.status === 'submitted' ? 'Submitted' : 
                   assignment.status === 'graded' ? 'Graded' : 
                   isOverdue ? 'Overdue' : 
                   assignment.status === 'late' ? 'Late' : 'Pending'}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">
        {assignment.title}
      </h3>
      
      {/* Description Preview */}
      {assignment.description && (
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
          {assignment.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 flex-wrap">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{assignment.teacher || 'School System'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : '-'}</span>
        </div>
        {assignment.total_marks && (
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>{assignment.total_marks} marks</span>
          </div>
        )}
      </div>

      {/* Days Remaining / Status Badge */}
      {!hasSubmission && daysInfo && (
        <div className={`flex items-center gap-1 text-xs font-semibold mb-3 ${daysInfo.color}`}>
          {daysInfo.days < 0 ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          <span>{daysInfo.label}</span>
        </div>
      )}

      {/* Submission Info if submitted */}
      {hasSubmission && (
        <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <FileCheck className="w-3 h-3 text-emerald-500" />
              <span>Submitted: {format(new Date(assignment.submission.submitted_at), 'dd MMM yyyy, hh:mm a')}</span>
            </div>
            {assignment.submission.attempt_number > 1 && (
              <span className="text-[10px] text-slate-400">Attempt #{assignment.submission.attempt_number}</span>
            )}
          </div>
          {assignment.status === 'graded' && (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Marks:</span>
                <span className="text-sm font-bold text-emerald-600">{assignment.submission.marks}</span>
                <span className="text-xs text-slate-400">/ {assignment.total_marks}</span>
              </div>
              {percentage >= 70 && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {percentage >= 40 && percentage < 70 && <MinusCircle className="w-3 h-3 text-amber-500" />}
              {percentage < 40 && <TrendingDown className="w-3 h-3 text-red-500" />}
            </div>
          )}
        </div>
      )}

      {/* Attachments Preview */}
      {assignment.attachments?.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
          <Paperclip className="w-3 h-3" />
          <span>{assignment.attachments.length} attachment(s)</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
        <Button 
          size="sm" 
          variant="outline" 
          className="rounded-xl border-slate-200 hover:bg-slate-50"
          onClick={onView}
        >
          <Eye className="w-4 h-4 mr-1" /> View Details
        </Button>
        
        {canSubmit && (
          <Button 
            size="sm" 
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onSubmit}
          >
            <Upload className="w-4 h-4 mr-1" /> Submit
          </Button>
        )}

        {canEdit && (
          <Button 
            size="sm" 
            variant="outline"
            className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50"
            onClick={onEdit}
          >
            <Edit3 className="w-4 h-4 mr-1" /> Edit
          </Button>
        )}

        {assignment.status === 'graded' && assignment.submission?.marks !== undefined && (
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Score:</span>
              <span className="font-bold text-emerald-600">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// File Viewer Modal Component (Enhanced)
function FileViewerModal({ open, onClose, assignment, activeFile, setActiveFile, allFiles, canEdit, onOpenSubmission, onEditSubmission }) {
  if (!assignment) return null;

  const getFileTypeIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'word': return <FileText className="w-4 h-4" />;
      case 'excel': return <FileText className="w-4 h-4" />;
      default: return <FileQuestion className="w-4 h-4" />;
    }
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    return 'other';
  };

  const hasSubmission = assignment.submission !== null;
  const isOverdue = assignment.status === 'overdue';

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={assignment.title}
      size="xl"
    >
      <div className="flex flex-col lg:flex-row h-[85vh] lg:h-[80vh] bg-white overflow-hidden -m-6">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b bg-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Assignment Details
            </h4>
            
            {/* Assignment Info */}
            <div className="space-y-2 text-sm">
              {assignment.description && (
                <div className="text-slate-600">
                  <p className="font-semibold text-slate-700 mb-1">Description:</p>
                  <p className="text-xs leading-relaxed">{assignment.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Due: {assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : '-'}</span>
              </div>
              
              {assignment.total_marks && (
                <div className="flex items-center gap-2 text-xs">
                  <Award className="w-3 h-3 text-slate-400" />
                  <span>Total Marks: {assignment.total_marks}</span>
                </div>
              )}
              
              {assignment.instructions && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700">Instructions:</p>
                  <p className="text-xs text-amber-600 mt-1 leading-relaxed">{assignment.instructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-b bg-white flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Files ({allFiles.length})
            </h4>
            
            {!hasSubmission && !isOverdue && canEdit && (
              <Button 
                size="sm" 
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold"
                onClick={() => {
                  onClose();
                  onOpenSubmission();
                }}
              >
                <Upload className="w-3 h-3 mr-1" /> SUBMIT WORK
              </Button>
            )}
            
            {hasSubmission && canEdit && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 border-amber-200 text-amber-600 hover:bg-amber-50 text-[10px] font-bold"
                onClick={() => {
                  onClose();
                  onEditSubmission();
                }}
              >
                <Edit3 className="w-3 h-3 mr-1" /> EDIT
              </Button>
            )}
          </div>
          
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 lg:p-3 gap-2 no-scrollbar">
            {allFiles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">No files available</div>
            ) : (
              allFiles.map((file, idx) => {
                const isActive = activeFile?.url === file.url || activeFile?.file_url === file.file_url;
                const type = getFileType(file.file_url || file.url);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFile(file)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all min-w-[200px] lg:min-w-0 shrink-0 border ${
                      isActive 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                      : 'bg-white border-slate-100 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      {getFileTypeIcon(type)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
                        {file.name || `File ${idx + 1}`}
                      </p>
                      <p className={`text-[9px] uppercase font-bold opacity-60`}>{file.origin}</p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 hidden lg:block opacity-50" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content: Preview */}
        <div className="flex-1 bg-slate-200/50 relative flex flex-col min-h-0">
          {activeFile ? (
            <>
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <a 
                  href={activeFile.file_url || activeFile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg text-slate-700 text-xs font-bold hover:scale-105 transition-transform"
                >
                  Full View <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href={activeFile.file_url || activeFile.url} 
                  download
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg text-slate-700 text-xs font-bold hover:scale-105 transition-transform"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center p-2 lg:p-6">
                {getFileType(activeFile.file_url || activeFile.url) === 'image' && (
                  <img src={activeFile.file_url || activeFile.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 border-white" />
                )}

                {getFileType(activeFile.file_url || activeFile.url) === 'pdf' && (
                  <iframe 
                    src={`${activeFile.file_url || activeFile.url}#toolbar=1&view=FitH`}
                    className="w-full h-full rounded-lg bg-white shadow-2xl border-none"
                    title="PDF Preview"
                  />
                )}

                {getFileType(activeFile.file_url || activeFile.url) === 'video' && (
                  <video controls className="max-w-full max-h-full rounded-lg shadow-2xl bg-black">
                    <source src={activeFile.file_url || activeFile.url} />
                  </video>
                )}

                {getFileType(activeFile.file_url || activeFile.url) === 'other' && (
                  <div className="text-center bg-white p-10 rounded-3xl shadow-xl">
                    <FileQuestion className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h4 className="font-bold text-slate-800">Preview Unavailable</h4>
                    <p className="text-xs text-slate-500 mb-6">Download to view this file type.</p>
                    <Button asChild variant="outline" className="rounded-xl">
                      <a href={activeFile.file_url || activeFile.url} download>Download Now</a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Paperclip className="w-12 h-12 opacity-10" />
              <p className="text-sm font-medium">Select a file from the list to preview</p>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}

// Submission Modal Component
function SubmissionModal({ 
  open, onClose, assignment, submissionText, setSubmissionText,
  selectedFiles, onFileSelect, onRemoveFile, onSubmit, isSubmitting, fileInputRef
}) {
  if (!assignment) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Submit: ${assignment.title}`}
      size="lg"
    >
      <div className="space-y-6 p-2">
        {/* Assignment Info Banner */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <h4 className="font-semibold text-emerald-800 mb-2">Assignment Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-emerald-600">Subject</p>
              <p className="font-medium text-emerald-900">{assignment.subject || 'General'}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600">Due Date</p>
              <p className="font-medium text-emerald-900">
                {assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : '-'}
              </p>
            </div>
            {assignment.total_marks && (
              <div>
                <p className="text-xs text-emerald-600">Total Marks</p>
                <p className="font-medium text-emerald-900">{assignment.total_marks}</p>
              </div>
            )}
          </div>
          {assignment.description && (
            <div className="mt-3">
              <p className="text-xs text-emerald-600">Description</p>
              <p className="text-sm text-emerald-800 mt-1">{assignment.description}</p>
            </div>
          )}
        </div>

        {/* Submission Text Area */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Submission Text <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Add any notes, comments, or explanation with your submission..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Attach Files <span className="text-slate-400 text-xs">(Optional, Max {assignment.max_files || 10} files, {assignment.max_file_size || 50}MB each)</span>
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={onFileSelect}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 hover:bg-emerald-50 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Click to upload files</p>
            <p className="text-xs text-slate-400 mt-1">PDF, Images, Documents, Videos (Max {assignment.max_file_size || 50}MB each)</p>
          </button>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || (selectedFiles.length === 0 && !submissionText.trim())}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Assignment
              </>
            )}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}

// Edit Submission Modal Component
function EditSubmissionModal({ 
  open, onClose, assignment, submissionText, setSubmissionText,
  existingFiles, editFiles, onFileSelect, onRemoveFile, onDeleteFile,
  onSubmit, isSubmitting, fileInputRef
}) {
  if (!assignment) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Edit Submission: ${assignment.title}`}
      size="lg"
    >
      <div className="space-y-6 p-2">
        {/* Assignment Info Banner */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <h4 className="font-semibold text-amber-800 mb-2">Editing Your Submission</h4>
          <p className="text-xs text-amber-600">You can update your submission text and files. Previously submitted files will remain unless you delete them.</p>
        </div>

        {/* Submission Text Area */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Submission Text <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Add any notes, comments, or explanation with your submission..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Existing Files */}
        {existingFiles.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Existing Files
            </label>
            <div className="space-y-2">
              {existingFiles.map((file, index) => (
                <div key={file.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id, file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Files */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Add New Files <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={onFileSelect}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 hover:bg-amber-50 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Click to upload new files</p>
            <p className="text-xs text-slate-400 mt-1">PDF, Images, Documents, Videos (Max {assignment.max_file_size || 50}MB each)</p>
          </button>

          {/* New Files List */}
          {editFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {editFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Submission
              </>
            )}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}

// Enhanced Count Card Component
function CountCard({ label, value, color, icon: Icon }) {
  const colorClasses = {
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
  };

  const bgClasses = {
    amber: 'bg-amber-50',
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    red: 'bg-red-50',
  };

  return (
    <div className={`border rounded-2xl p-4 text-center shadow-sm bg-white hover:shadow-md transition-all`}>
      <div className={`inline-flex p-2 rounded-xl ${bgClasses[color]} mb-2`}>
        {Icon && <Icon className={`w-5 h-5 ${colorClasses[color]}`} />}
      </div>
      <p className={`text-2xl font-black mb-0.5 ${colorClasses[color]}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}