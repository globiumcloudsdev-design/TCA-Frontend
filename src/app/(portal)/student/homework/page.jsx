// // src/app/student/homework/page.jsx
// 'use client';

// import { useMemo, useState } from 'react';
// import { NotebookPen, Paperclip, ExternalLink, FileText, ImageIcon, Video, FileQuestion, Download, ChevronRight } from 'lucide-react';
// import { useStudentAssignments } from '@/hooks/useStudentPortal';
// import AppModal from '@/components/common/AppModal';
// import { Button } from '@/components/ui/button';

// export default function StudentHomeworkPage() {
//   const [subjectFilter, setSubjectFilter] = useState('');
//   const [viewerOpen, setViewerOpen] = useState(false);
//   const [selectedEntry, setSelectedEntry] = useState(null);
//   const [activeFile, setActiveFile] = useState(null);

//   const { data: assignmentsRes, isLoading } = useStudentAssignments({ type: 'homework' }, 1, 100);

//   const assignments = assignmentsRes?.data || [];

//   const subjects = useMemo(
//     () => Array.from(new Set(assignments.map((item) => item.subject).filter(Boolean))),
//     [assignments]
//   );

//   const filtered = assignments.filter((item) => !subjectFilter || item.subject === subjectFilter);

//   const openViewer = (item) => {
//     setSelectedEntry(item);
//     if (item.attachments && item.attachments.length > 0) {
//       setActiveFile(item.attachments[0]);
//     } else {
//       setActiveFile(null);
//     }
//     setViewerOpen(true);
//   };

//   const getFileType = (url) => {
//     if (!url) return 'unknown';
//     const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
//     if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
//     if (['pdf'].includes(ext)) return 'pdf';
//     if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
//     return 'other';
//   };

//   if (isLoading) {
//     return <div className="max-w-4xl mx-auto text-sm text-slate-500 p-10 text-center font-medium">Loading your homework...</div>;
//   }

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 bg-slate-50/50 min-h-screen">
//       {/* Header Section */}
//       <div className="flex flex-col gap-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-emerald-100 rounded-xl">
//             <NotebookPen className="w-6 h-6 text-emerald-600" />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Homework Diary</h1>
//         </div>
        
//         {/* Responsive Filter Chips */}
//         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
//           <button
//             onClick={() => setSubjectFilter('')}
//             className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
//               subjectFilter === '' 
//               ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' 
//               : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
//             }`}
//           >
//             All Subjects
//           </button>
//           {subjects.map((subject) => (
//             <button
//               key={subject}
//               onClick={() => setSubjectFilter(subject)}
//               className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
//                 subjectFilter === subject 
//                 ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' 
//                 : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
//               }`}
//             >
//               {subject}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Grid Layout for Cards */}
//       {filtered.length === 0 ? (
//         <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
//           <p className="text-slate-400 font-medium">No homework assigned for this subject.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {filtered.map((item) => (
//             <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group relative overflow-hidden">
//                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
//                 <NotebookPen className="w-12 h-12" />
//               </div>
              
//               <div className="relative z-10">
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mb-3">
//                   {item.subject || 'General'}
//                 </span>
//                 <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2">{item.title}</h3>
                
//                 <div className="space-y-1.5 mb-5">
//                   <div className="flex items-center text-xs text-slate-500">
//                     <span className="w-20 font-medium text-slate-400">Due Date:</span>
//                     <span className="text-slate-700">{item.due_date ? new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}</span>
//                   </div>
//                   <div className="flex items-center text-xs text-slate-500">
//                     <span className="w-20 font-medium text-slate-400">Status:</span>
//                     <span className={`font-bold capitalize ${item.status === 'completed' ? 'text-emerald-600' : 'text-amber-500'}`}>{item.status || 'pending'}</span>
//                   </div>
//                 </div>

//                 <Button 
//                   onClick={() => openViewer(item)}
//                   className="w-full bg-slate-900 hover:bg-emerald-700 text-white rounded-xl h-11 transition-colors"
//                 >
//                   <Paperclip className="w-4 h-4 mr-2" /> View Resources
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* --- RESPONSIVE PREVIEW MODAL --- */}
//       <AppModal
//         open={viewerOpen}
//         onClose={() => setViewerOpen(false)}
//         title={selectedEntry?.title}
//         size="xl"
//       >
//         <div className="flex flex-col lg:flex-row h-[85vh] lg:h-[75vh] bg-white overflow-hidden -m-6">
          
//           {/* File Selector - Mobile: Top Horizontal, Desktop: Left Sidebar */}
//           <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0">
//             <div className="p-4 bg-white hidden lg:block border-b">
//               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resource Files</h4>
//             </div>
            
//             <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 lg:p-3 gap-2 no-scrollbar">
//               {selectedEntry?.attachments?.map((file, idx) => {
//                 const isActive = activeFile?.id === file.id;
//                 const type = getFileType(file.file_url || file.url);
                
//                 return (
//                   <button
//                     key={file.id || idx}
//                     onClick={() => setActiveFile(file)}
//                     className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all min-w-[200px] lg:min-w-0 shrink-0 ${
//                       isActive 
//                       ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
//                       : 'bg-white border border-slate-200 lg:border-none hover:bg-slate-100 text-slate-600'
//                     }`}
//                   >
//                     <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
//                       {type === 'pdf' && <FileText className="w-4 h-4" />}
//                       {type === 'image' && <ImageIcon className="w-4 h-4" />}
//                       {type === 'video' && <Video className="w-4 h-4" />}
//                       {type === 'other' && <FileQuestion className="w-4 h-4" />}
//                     </div>
                    
//                     <div className="min-w-0 flex-1">
//                       <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
//                         {file.name || `File ${idx + 1}`}
//                       </p>
//                       <p className={`text-[10px] uppercase font-medium opacity-70`}>{type}</p>
//                     </div>
//                     {isActive && <ChevronRight className="w-4 h-4 hidden lg:block" />}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Main Preview Area */}
//           <div className="flex-1 bg-slate-100 relative flex flex-col min-h-0">
//             {activeFile ? (
//               <>
//                 {/* Floating Actions */}
//                 <div className="absolute top-4 right-4 z-20 flex gap-2">
//                    <a 
//                     href={activeFile.file_url || activeFile.url} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full shadow-xl text-slate-700 text-xs font-bold transition-all border border-slate-200 hover:scale-105"
//                    >
//                     Full Screen <ExternalLink className="w-3 h-3" />
//                    </a>
//                 </div>

//                 <div className="flex-1 overflow-hidden flex items-center justify-center p-2 lg:p-6">
//                   {getFileType(activeFile.file_url || activeFile.url) === 'image' && (
//                     <div className="relative w-full h-full flex items-center justify-center">
//                         <img 
//                         src={activeFile.file_url || activeFile.url} 
//                         alt="Preview" 
//                         className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 border-white"
//                         />
//                     </div>
//                   )}

//                   {getFileType(activeFile.file_url || activeFile.url) === 'pdf' && (
//                     <div className="w-full h-full bg-slate-300 rounded-lg overflow-hidden shadow-2xl relative">
//                         {/* Note: We use #toolbar=0 to hide the default browser controls 
//                             which often look messy on mobile.
//                         */}
//                         <iframe 
//                         src={`${activeFile.file_url || activeFile.url}#toolbar=1&view=FitH`}
//                         className="w-full h-full border-none shadow-inner"
//                         title="PDF Viewer"
//                         style={{ background: 'white' }}
//                         />
//                     </div>
//                   )}

//                   {getFileType(activeFile.file_url || activeFile.url) === 'video' && (
//                     <video controls className="max-w-full max-h-full rounded-lg shadow-2xl bg-black outline-none">
//                       <source src={activeFile.file_url || activeFile.url} />
//                     </video>
//                   )}

//                   {getFileType(activeFile.file_url || activeFile.url) === 'other' && (
//                     <div className="text-center bg-white p-8 lg:p-12 rounded-3xl shadow-xl max-w-sm mx-auto">
//                       <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//                         <Download className="w-10 h-10 text-slate-300" />
//                       </div>
//                       <h4 className="text-lg font-bold text-slate-800 mb-2">No Preview Available</h4>
//                       <p className="text-sm text-slate-500 mb-6">This file type needs to be downloaded to view its content.</p>
//                       <Button asChild className="bg-emerald-600 hover:bg-emerald-700 w-full rounded-xl">
//                         <a href={activeFile.file_url || activeFile.url} download>Download File</a>
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
//                 <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center animate-pulse">
//                   <Paperclip className="w-8 h-8 opacity-30" />
//                 </div>
//                 <p className="font-medium">Please select a file to view</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </AppModal>

//       {/* Custom Styles for hidden scrollbar */}
//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// }









// src/app/student/homework/page.jsx

'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { 
  NotebookPen, Paperclip, ExternalLink, FileText, ImageIcon, 
  Video, FileQuestion, Download, ChevronRight, Clock, 
  Calendar, User, Award, MessageSquare, CheckCircle, 
  AlertCircle, Send, Loader2, X, Upload, Eye, Edit3,
  Save, Trash2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useStudentAssignments, useSubmitStudentAssignment } from '@/hooks/useStudentPortal';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, isPast, differenceInDays } from 'date-fns';

export default function StudentHomeworkPage() {
  const [subjectFilter, setSubjectFilter] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const fileInputRef = useRef(null);

  const { data: assignmentsRes, isLoading, refetch } = useStudentAssignments({ type: 'homework' }, 1, 100);
  const submitMutation = useSubmitStudentAssignment();

  const assignments = assignmentsRes?.data || [];

  const subjects = useMemo(
    () => Array.from(new Set(assignments.map((item) => item.subject).filter(Boolean))),
    [assignments]
  );

  const filtered = assignments.filter((item) => !subjectFilter || item.subject === subjectFilter);

  const openViewer = (item) => {
    setSelectedEntry(item);
    const firstFile = item.attachments?.[0];
    setActiveFile(firstFile || null);
    setViewerOpen(true);
  };

  const openSubmissionModal = (homework, isEdit = false) => {
    setSelectedEntry(homework);
    setEditMode(isEdit);
    
    if (isEdit && homework.submission) {
      setSubmissionText(homework.submission.submission_text || '');
      setExistingFiles(homework.submission.files || []);
    } else {
      setSubmissionText('');
      setExistingFiles([]);
    }
    setSelectedFiles([]);
    setSubmissionModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = (fileId, fileName) => {
    setDeleteFileId(fileId);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!deleteFileId || !selectedEntry) return;
    
    try {
      const formData = new FormData();
      formData.append('assignment_id', selectedEntry.id);
      formData.append('delete_file_id', deleteFileId);
      
      await submitMutation.mutateAsync({ 
        assignmentId: selectedEntry.id, 
        formData,
        isDelete: true
      });
      
      setExistingFiles(prev => prev.filter(f => f.id !== deleteFileId));
      toast.success('File removed successfully');
      setConfirmDeleteOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to remove file');
    }
  };

  const handleSubmitHomework = async () => {
    if (!selectedEntry) return;
    
    if (selectedFiles.length === 0 && !submissionText.trim() && existingFiles.length === 0) {
      toast.error("Please add a submission text or upload files");
      return;
    }

    const formData = new FormData();
    formData.append('assignment_id', selectedEntry.id);
    formData.append('submission_text', submissionText);
    if (editMode) {
      formData.append('is_edit', 'true');
    }
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setIsSubmitting(true);
      await submitMutation.mutateAsync({ 
        assignmentId: selectedEntry.id, 
        formData 
      });
      toast.success(editMode ? "Homework updated successfully!" : "Homework submitted successfully!");
      setSubmissionModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return { days: Math.abs(days), label: 'Overdue', color: 'text-red-600', icon: AlertCircle };
    if (days === 0) return { days: 0, label: 'Due Today', color: 'text-orange-600', icon: Clock };
    if (days === 1) return { days: 1, label: '1 Day Left', color: 'text-amber-600', icon: Clock };
    return { days, label: `${days} Days Left`, color: 'text-emerald-600', icon: Clock };
  };

  const isOverdue = (homework) => {
    if (!homework?.due_date) return false;
    const dueDate = new Date(homework.due_date);
    const isPastDue = isPast(dueDate);
    const isSubmitted = homework.status === 'submitted' || homework.status === 'graded';
    return isPastDue && !isSubmitted;
  };

  const canSubmit = (homework) => {
    const isSubmitted = homework.status === 'submitted' || homework.status === 'graded';
    const overdue = isOverdue(homework);
    return !isSubmitted && (!overdue || homework.allow_late_submission);
  };

  const canEdit = (homework) => {
    return homework.status === 'submitted' && homework.submission && !homework.is_graded;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Loading your homework...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <NotebookPen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Homework Diary</h1>
              <p className="text-sm text-slate-500 mt-1">Track and submit your homework assignments</p>
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard 
            label="Pending" 
            value={filtered.filter(h => h.status === 'pending' && !isOverdue(h)).length}
            color="amber"
            icon={Clock}
          />
          <StatCard 
            label="Submitted" 
            value={filtered.filter(h => h.status === 'submitted').length}
            color="emerald"
            icon={CheckCircle}
          />
          <StatCard 
            label="Overdue" 
            value={filtered.filter(h => isOverdue(h)).length}
            color="red"
            icon={AlertCircle}
          />
        </div>
        
        {/* Responsive Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSubjectFilter('')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
              subjectFilter === '' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSubjectFilter(subject)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
                subjectFilter === subject 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout for Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <NotebookPen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No homework assigned for this subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <HomeworkCard 
              key={item.id}
              homework={item}
              onView={() => openViewer(item)}
              onSubmit={() => openSubmissionModal(item, false)}
              onEdit={() => openSubmissionModal(item, true)}
              getDaysRemaining={getDaysRemaining}
              isOverdue={isOverdue(item)}
              canSubmit={canSubmit(item)}
              canEdit={canEdit(item)}
            />
          ))}
        </div>
      )}

      {/* Homework Viewer Modal */}
      <HomeworkViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        homework={selectedEntry}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        onOpenSubmission={() => {
          setViewerOpen(false);
          openSubmissionModal(selectedEntry, false);
        }}
        onOpenEdit={() => {
          setViewerOpen(false);
          openSubmissionModal(selectedEntry, true);
        }}
        getFileType={getFileType}
        canSubmit={selectedEntry ? canSubmit(selectedEntry) : false}
        canEdit={selectedEntry ? canEdit(selectedEntry) : false}
      />

      {/* Submission/Edit Modal */}
      <SubmissionModal
        open={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        homework={selectedEntry}
        submissionText={submissionText}
        setSubmissionText={setSubmissionText}
        selectedFiles={selectedFiles}
        existingFiles={existingFiles}
        editMode={editMode}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        onDeleteFile={handleDeleteExistingFile}
        onSubmit={handleSubmitHomework}
        isSubmitting={isSubmitting}
        fileInputRef={fileInputRef}
        formatFileSize={formatFileSize}
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

// Homework Card Component
function HomeworkCard({ homework, onView, onSubmit, onEdit, getDaysRemaining, isOverdue, canSubmit, canEdit }) {
  const daysInfo = getDaysRemaining(homework.due_date);
  const hasSubmission = homework.submission !== null;
  const status = homework.status;
  const hasGrading = homework.status === 'graded';
  
  const getStatusColor = () => {
    if (status === 'submitted') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'graded') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (isOverdue) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };
  
  const getStatusIcon = () => {
    if (status === 'submitted') return <CheckCircle className="w-3 h-3" />;
    if (status === 'graded') return <Award className="w-3 h-3" />;
    if (isOverdue) return <AlertCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };
  
  const getStatusText = () => {
    if (status === 'submitted') return 'Submitted';
    if (status === 'graded') return 'Graded';
    if (isOverdue) return 'Overdue';
    return 'Pending';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
        <NotebookPen className="w-12 h-12" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
            {homework.subject || 'General'}
          </span>
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
          {homework.title}
        </h3>
        
        {/* Description Preview */}
        {homework.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {homework.description}
          </p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-slate-500">
            <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="text-slate-400 mr-2">Due:</span>
            <span className="text-slate-700">
              {homework.due_date ? format(new Date(homework.due_date), 'dd MMM yyyy') : 'Not set'}
            </span>
          </div>
          
          {!hasSubmission && daysInfo && (
            <div className={`flex items-center text-xs font-semibold ${daysInfo.color}`}>
              {<daysInfo.icon className="w-3 h-3 mr-2" />}
              <span>{daysInfo.label}</span>
            </div>
          )}
          
          {hasGrading && homework.submission?.marks !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Marks:</span>
                <span className="text-sm font-bold text-blue-600">{homework.submission.marks}</span>
                <span className="text-xs text-slate-400">/ {homework.total_marks}</span>
              </div>
              {homework.submission.grade && (
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Grade: {homework.submission.grade}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Attachments Preview */}
        {homework.attachments?.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
            <Paperclip className="w-3 h-3" />
            <span>{homework.attachments.length} attachment(s)</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={onView}
            variant="outline"
            className="flex-1 rounded-xl border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
          >
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
          
          {canSubmit && !hasSubmission && (
            <Button 
              onClick={onSubmit}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="w-4 h-4 mr-1" /> Submit
            </Button>
          )}
          
          {canEdit && (
            <Button 
              onClick={onEdit}
              variant="outline"
              className="flex-1 rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
        </div>
        
        {hasSubmission && homework.status === 'submitted' && (
          <p className="text-[10px] text-slate-400 text-center mt-3">
            Submitted on {format(new Date(homework.submission.submitted_at), 'dd MMM yyyy, hh:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color, icon: Icon }) {
  const colorClasses = {
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    blue: 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="border rounded-2xl p-4 text-center shadow-sm bg-white hover:shadow-md transition-all">
      <div className={`inline-flex p-2 rounded-xl ${colorClasses[color]} mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className={`text-2xl font-black mb-0.5 text-${color}-600`}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

// Homework Viewer Modal Component (with Edit button)
function HomeworkViewerModal({ 
  open, onClose, homework, activeFile, setActiveFile, 
  onOpenSubmission, onOpenEdit, getFileType, canSubmit, canEdit 
}) {
  if (!homework) return null;

  const getFileTypeIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileQuestion className="w-4 h-4" />;
    }
  };

  const hasSubmission = homework.submission !== null;
  const isSubmitted = homework.status === 'submitted' || homework.status === 'graded';

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={homework.title}
      size="xl"
    >
      <div className="flex flex-col lg:flex-row h-[85vh] lg:h-[80vh] bg-white overflow-hidden -m-6">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Homework Details */}
          <div className="p-4 border-b bg-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Homework Details
            </h4>
            
            <div className="space-y-3 text-sm">
              {homework.subject && (
                <div>
                  <p className="text-xs font-semibold text-slate-500">Subject</p>
                  <p className="text-sm font-medium text-slate-800">{homework.subject}</p>
                </div>
              )}
              
              {homework.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{homework.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Due Date</p>
                  <p className="text-sm text-slate-800">
                    {homework.due_date ? format(new Date(homework.due_date), 'dd MMM yyyy') : '-'}
                  </p>
                </div>
                {homework.total_marks && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Marks</p>
                    <p className="text-sm text-slate-800">{homework.total_marks}</p>
                  </div>
                )}
              </div>
              
              {homework.instructions && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Instructions:</p>
                  <p className="text-xs text-amber-600 leading-relaxed">{homework.instructions}</p>
                </div>
              )}
              
              {hasSubmission && homework.submission && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Your Submission:</p>
                  <p className="text-xs text-emerald-600 mb-2">{homework.submission.submission_text || 'No text provided'}</p>
                  <p className="text-[10px] text-emerald-500">
                    Submitted: {format(new Date(homework.submission.submitted_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                  {homework.submission.attempt_number > 1 && (
                    <p className="text-[10px] text-emerald-500 mt-1">Attempt #{homework.submission.attempt_number}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Resources ({homework.attachments?.length || 0})
            </h4>
            
            {!isSubmitted && canSubmit && (
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
                  onOpenEdit();
                }}
              >
                <Edit3 className="w-3 h-3 mr-1" /> EDIT
              </Button>
            )}
          </div>
          
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 lg:p-3 gap-2 no-scrollbar">
            {homework.attachments?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">No attachments available</div>
            ) : (
              homework.attachments.map((file, idx) => {
                const isActive = activeFile?.id === file.id || activeFile?.url === file.url;
                const type = getFileType(file.file_url || file.url);
                
                return (
                  <button
                    key={file.id || idx}
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
                      <p className={`text-[9px] uppercase font-bold opacity-60`}>{type}</p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 hidden lg:block opacity-50" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Preview Area */}
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
                  <img 
                    src={activeFile.file_url || activeFile.url} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 border-white"
                  />
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
              <p className="text-sm font-medium">Select a file to preview</p>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}

// Submission Modal Component (with existing files display)
function SubmissionModal({ 
  open, onClose, homework, submissionText, setSubmissionText,
  selectedFiles, existingFiles, editMode, onFileSelect, onRemoveFile, 
  onDeleteFile, onSubmit, isSubmitting, fileInputRef, formatFileSize 
}) {
  if (!homework) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={editMode ? `Edit Submission: ${homework.title}` : `Submit: ${homework.title}`}
      size="lg"
    >
      <div className="space-y-6 p-2">
        {/* Homework Info Banner */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <h4 className="font-semibold text-emerald-800 mb-2">Homework Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-emerald-600">Subject</p>
              <p className="font-medium text-emerald-900">{homework.subject || 'General'}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600">Due Date</p>
              <p className="font-medium text-emerald-900">
                {homework.due_date ? format(new Date(homework.due_date), 'dd MMM yyyy') : '-'}
              </p>
            </div>
            {homework.total_marks && (
              <div>
                <p className="text-xs text-emerald-600">Total Marks</p>
                <p className="font-medium text-emerald-900">{homework.total_marks}</p>
              </div>
            )}
          </div>
          {homework.description && (
            <div className="mt-3">
              <p className="text-xs text-emerald-600">Description</p>
              <p className="text-sm text-emerald-800 mt-1">{homework.description}</p>
            </div>
          )}
        </div>

        {/* Existing Files (for edit mode) */}
        {editMode && existingFiles.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Submitted Files
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
            {editMode ? 'Add New Files' : 'Attach Files'} 
            <span className="text-slate-400 text-xs ml-1">(Optional)</span>
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
            <p className="text-xs text-slate-400 mt-1">PDF, Images, Documents, Videos (Max 50MB each)</p>
          </button>

          {/* New Files List */}
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
            disabled={isSubmitting || (selectedFiles.length === 0 && !submissionText.trim() && existingFiles.length === 0)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {editMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {editMode ? 'Update Homework' : 'Submit Homework'}
              </>
            )}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}