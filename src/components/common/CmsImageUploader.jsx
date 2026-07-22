'use client';
/**
 * CmsImageUploader — Premium Cloudinary drag-and-drop image uploader
 * ─────────────────────────────────────────────────────────────────────
 * Props:
 *   label        string              Field label shown above the drop zone
 *   folder       string              Cloudinary subfolder (e.g. 'about', 'banners')
 *   oldPublicId  string | undefined  Existing image public_id to replace on upload
 *   value        string | undefined  Currently uploaded image URL (for preview)
 *   onUpload     ({ url, publicId }) => void   Called after successful upload
 *   onClear      () => void          Called when user removes the image
 *   aspectRatio  string              Tailwind aspect ratio class (default: 'aspect-video')
 *   hint         string              Optional help text below the drop zone
 */
import { useState, useRef } from 'react';
import { Upload, ImageIcon, X, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { masterAdminService } from '@/services';
import { toast } from 'sonner';

export default function CmsImageUploader({
  label = 'Upload Image',
  folder = 'website-cms',
  oldPublicId,
  value,
  onUpload,
  onClear,
  aspectRatio = 'aspect-video',
  hint
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      setUploading(true);
      toast.info(`Uploading to Cloudinary → the-clouds-academy/${folder}...`);
      const res = await masterAdminService.uploadCmsImage(file, folder, oldPublicId);
      onUpload({ url: res.url, publicId: res.publicId });
      toast.success('Image uploaded and saved to Cloudinary!');
    } catch (err) {
      console.error('CmsImageUploader error:', err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-slate-700 block">{label}</label>}

      {/* Drop Zone */}
      {!value ? (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative w-full ${aspectRatio} border-2 border-dashed rounded-2xl 
            flex flex-col items-center justify-center gap-3 cursor-pointer
            transition-all duration-200 group overflow-hidden
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10' 
              : 'border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-primary/[0.02]'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-xs font-bold text-primary animate-pulse">Uploading to Cloudinary...</p>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${isDragging ? 'bg-primary/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                {isDragging
                  ? <CheckCircle2 className="w-7 h-7 text-primary" />
                  : <Upload className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                }
              </div>
              <div className="text-center space-y-1 px-4">
                <p className="text-sm font-bold text-slate-700">
                  {isDragging ? 'Drop image here' : 'Click or drag & drop'}
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WebP, SVG — max 5MB</p>
              </div>
              {hint && <p className="text-[9px] text-slate-400 italic px-6 text-center">{hint}</p>}
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        /* Preview Mode — when image is already uploaded */
        <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden border border-slate-200 shadow-sm group`}>
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />

          {/* Overlay hover controls */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => !uploading && inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-slate-800 font-bold text-xs px-3 py-2 rounded-xl shadow-lg hover:bg-slate-50 transition-colors"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            {onClear && !uploading && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1.5 bg-red-500 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          {/* Uploaded badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}
    </div>
  );
}
