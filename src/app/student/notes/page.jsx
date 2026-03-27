//src/app/student/notes/page.jsx
'use client';

import { useMemo, useState } from 'react';
import { FileText, Paperclip, ExternalLink, ImageIcon, Video, FileQuestion, ChevronRight, Download } from 'lucide-react';
import { useStudentAssignments } from '@/hooks/useStudentPortal';
import AppModal from '@/components/common/AppModal';
import { Button } from '@/components/ui/button';

export default function StudentNotesPage() {
  const [subjectFilter, setSubjectFilter] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  const { data: notesRes, isLoading } = useStudentAssignments({ type: 'notes' }, 1, 100);
  const notes = notesRes?.data || [];

  const subjects = useMemo(
    () => Array.from(new Set(notes.map((item) => item.subject).filter(Boolean))),
    [notes]
  );

  const filtered = notes.filter((item) => !subjectFilter || item.subject === subjectFilter);

  const openViewer = (note) => {
    setSelectedNote(note);
    if (note.attachments && note.attachments.length > 0) {
      setActiveFile(note.attachments[0]);
    } else {
      setActiveFile(null);
    }
    setViewerOpen(true);
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    return 'other';
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto p-10 text-center text-slate-500 font-medium italic">Loading study notes...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 min-h-screen bg-slate-50/20">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 rounded-2xl shadow-sm">
            <FileText className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Study Notes</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Academic Resources</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSubjectFilter('')}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${
              subjectFilter === '' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSubjectFilter(subject)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${
                subjectFilter === subject 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No notes available for the selected subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    {item.subject || 'General'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.attachments?.length || 0} Files
                  </span>
                </div>
                <h3 className="text-md font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors mb-4">
                  {item.title}
                </h3>
              </div>
              
              <Button 
                onClick={() => openViewer(item)}
                variant="outline"
                className="w-full rounded-xl border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all font-bold h-10 gap-2"
              >
                <Paperclip className="w-4 h-4" /> Open Notes
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* --- RESPONSIVE NOTES VIEWER MODAL --- */}
      <AppModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={selectedNote?.title}
        size="xl"
      >
        <div className="flex flex-col lg:flex-row h-[85vh] lg:h-[75vh] bg-white overflow-hidden -m-6">
          
          {/* Sidebar: File List */}
          <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-4 bg-white hidden lg:block border-b">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Table of Contents</h4>
            </div>
            
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 lg:p-3 gap-2 no-scrollbar">
              {(!selectedNote?.attachments || selectedNote.attachments.length === 0) ? (
                <div className="p-10 text-center text-slate-400 text-xs italic">No documents attached.</div>
              ) : (
                selectedNote.attachments.map((file, idx) => {
                  const isActive = activeFile?.id === file.id;
                  const type = getFileType(file.file_url || file.url);
                  
                  return (
                    <button
                      key={file.id || idx}
                      onClick={() => setActiveFile(file)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all min-w-[220px] lg:min-w-0 shrink-0 border ${
                        isActive 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                        : 'bg-white border-transparent lg:border-none hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-emerald-50 text-emerald-500'}`}>
                        {type === 'pdf' && <FileText className="w-4 h-4" />}
                        {type === 'image' && <ImageIcon className="w-4 h-4" />}
                        {type === 'video' && <Video className="w-4 h-4" />}
                        {type === 'other' && <FileQuestion className="w-4 h-4" />}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
                          {file.name || `Document ${idx + 1}`}
                        </p>
                        <p className={`text-[9px] uppercase font-bold opacity-60`}>{type}</p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 hidden lg:block opacity-40" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-slate-200/40 relative flex flex-col min-h-0">
            {activeFile ? (
              <>
                <div className="absolute top-4 right-4 z-20">
                   <a 
                    href={activeFile.file_url || activeFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-xl text-slate-700 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all border border-slate-100"
                   >
                    Pop-out View <ExternalLink className="w-3.5 h-3.5" />
                   </a>
                </div>

                <div className="flex-1 overflow-hidden flex items-center justify-center p-3 lg:p-8">
                  {getFileType(activeFile.file_url || activeFile.url) === 'image' && (
                    <img 
                      src={activeFile.file_url || activeFile.url} 
                      alt="Note Page" 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-8 border-white bg-white"
                    />
                  )}

                  {getFileType(activeFile.file_url || activeFile.url) === 'pdf' && (
                    <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden relative">
                        <iframe 
                          src={`${activeFile.file_url || activeFile.url}#toolbar=1&view=FitH`}
                          className="w-full h-full border-none"
                          title="Notes Viewer"
                        />
                    </div>
                  )}

                  {getFileType(activeFile.file_url || activeFile.url) === 'video' && (
                    <video controls className="max-w-full max-h-full rounded-xl shadow-2xl bg-black">
                      <source src={activeFile.file_url || activeFile.url} />
                    </video>
                  )}

                  {getFileType(activeFile.file_url || activeFile.url) === 'other' && (
                    <div className="text-center bg-white p-12 rounded-[2rem] shadow-xl max-w-sm mx-auto">
                      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Download className="w-10 h-10 text-indigo-300" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800 mb-2 tracking-tight">Binary Resource</h4>
                      <p className="text-xs text-slate-500 mb-8 font-medium">This resource can't be previewed in the browser. Please download to study.</p>
                      <Button asChild className="bg-indigo-600 hover:bg-indigo-700 w-full rounded-2xl h-12 shadow-lg shadow-indigo-100">
                        <a href={activeFile.file_url || activeFile.url} download>Download Resource</a>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-30">
                <FileText className="w-20 h-20" />
                <p className="font-bold text-sm uppercase tracking-widest">Select a document to read</p>
              </div>
            )}
          </div>
        </div>
      </AppModal>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}