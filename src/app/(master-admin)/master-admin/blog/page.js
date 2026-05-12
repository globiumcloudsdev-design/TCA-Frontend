'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  Newspaper, Plus, 
  Eye, Edit, Trash2, Calendar, User, Share2,
  Image as ImageIcon, FileText, CheckCircle, Clock
} from 'lucide-react';
import { 
  AppModal, InputField, TextareaField, FormSubmitButton, DataTable, SelectField, MultiSelectField, ConfirmDialog
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { toast } from 'sonner';

export default function BlogManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [posts, setPosts] = useState([
    { 
      id: 1, 
      title: 'Digital Transformation in Schools', 
      author: 'Admin', 
      status: 'Published', 
      date: '2026-05-10',
      category: 'Education',
      views: '1.2k',
      tags: ['digital', 'education']
    },
    { 
      id: 2, 
      title: 'Top 5 Benefits of LMS', 
      author: 'Support', 
      status: 'Draft', 
      date: '2026-05-08',
      category: 'Technology',
      views: '0',
      tags: ['lms', 'tech']
    },
  ]);

  const handleOpenModal = (post = null) => {
    setEditingPost(post);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success(editingPost ? 'Blog Post Updated' : 'Blog Post Published');
    setShowModal(false);
    setEditingPost(null);
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    toast.error('Blog Post Deleted (Dummy)');
    setShowDeleteDialog(false);
    setDeletingId(null);
  };

  const columns = useMemo(() => [
    { 
      header: 'Title', 
      accessorKey: 'title',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="max-w-xs py-2">
            <p className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors cursor-pointer">{r.title}</p>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {r.date}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {r.author}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-slate-400" /> {r.views}</span>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Category', 
      accessorKey: 'category',
      cell: ({ row }) => <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600 border-none px-3">{row.original.category}</Badge>
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-slate-200 text-slate-600 border-none'}>
            {status}
          </Badge>
        );
      }
    },
    { 
      header: 'Actions', 
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
          <SimpleTooltip content="Preview Post">
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Eye className="w-4 h-4" /></Button>
          </SimpleTooltip>
          <SimpleTooltip content="Edit Post">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModal(row.original); }}><Edit className="w-4 h-4" /></Button>
          </SimpleTooltip>
          <SimpleTooltip content="Delete Post">
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); confirmDelete(row.original.id); }}><Trash2 className="w-4 h-4" /></Button>
          </SimpleTooltip>
        </div>
      )
    }
  ], []);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            Blog Management
          </h1>
          <p className="text-slate-500">Create and publish articles for your audience.</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: '12', color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
          { label: 'Published', value: '8', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
          { label: 'Drafts', value: '4', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
          { label: 'Total Views', value: '2.5k', color: 'text-purple-600', bg: 'bg-purple-50', icon: Eye },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <h4 className="text-xl font-bold">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Table */}
      <div className="bg-white">
        <DataTable
          columns={columns}
          data={posts}
          searchPlaceholder="Search articles..."
          pagination={{ page: 1, totalPages: 1, onPageChange: () => {} }}
          action={
            <Button variant="default" onClick={() => handleOpenModal()} className="shadow-md shadow-primary/10">
              <Plus className="w-4 h-4 mr-2" /> New Blog Post
            </Button>
          }
        />
      </div>

      {/* --- BLOG POST MODAL --- */}
      <AppModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingPost ? 'Edit Blog Post' : 'Compose New Article'}
        size="xl"
        footer={
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <FormSubmitButton 
              form="blog-form" 
              label={editingPost ? 'Update Post' : 'Publish Article'} 
              className="flex-[2] shadow-lg shadow-primary/10" 
            />
          </div>
        }
      >
        <form id="blog-form" onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <InputField label="Article Title" required defaultValue={editingPost?.title} placeholder="e.g. The Future of E-Learning" />
            
            <div className="grid grid-cols-2 gap-4">
              <SelectField 
                label="Category" 
                defaultValue={editingPost?.category?.toLowerCase() || 'edu'}
                options={[
                  { label: 'Education', value: 'edu' },
                  { label: 'Technology', value: 'tech' },
                  { label: 'Management', value: 'mgmt' },
                  { label: 'Updates', value: 'updates' }
                ]} 
                required
              />
              <SelectField 
                label="Status" 
                defaultValue={editingPost?.status?.toLowerCase() || 'draft'}
                options={[
                  { label: 'Draft', value: 'draft' },
                  { label: 'Published', value: 'published' },
                  { label: 'Private', value: 'private' }
                ]} 
              />
            </div>

            <MultiSelectField 
              label="Tags" 
              options={[
                { label: 'Digital', value: 'digital' },
                { label: 'Education', value: 'education' },
                { label: 'LMS', value: 'lms' },
                { label: 'Tech', value: 'tech' },
                { label: 'Future', value: 'future' }
              ]}
              defaultValue={editingPost?.tags || []}
              placeholder="Select article tags..."
            />

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                 <ImageIcon className="w-5 h-5 text-primary" />
               </div>
               <p className="text-xs font-bold text-slate-600">Featured Image</p>
               <p className="text-[10px] text-slate-400">Click to upload or drag & drop</p>
            </div>

            <TextareaField label="Post Content" required defaultValue={editingPost ? 'Dummy content for ' + editingPost.title : ''} placeholder="Write your content here..." rows={12} />
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              SEO & Social Sharing
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Meta Title" placeholder="Enter SEO meta title..." />
              <InputField label="URL Slug" placeholder="e.g. future-of-elearning" />
            </div>
            <TextareaField label="Meta Description" placeholder="Short summary for Google (150-160 chars)..." rows={2} />
          </div>
        </form>
      </AppModal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone and will remove the article from the website."
        confirmLabel="Yes, Delete Post"
      />
    </div>
  );
}
