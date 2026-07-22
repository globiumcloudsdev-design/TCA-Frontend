'use client';
/**
 * GlobalFileUploader — Universal drag-and-drop uploader with optional client-side image resizing
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Props:
 *   label          string              Field label
 *   accept         string              File accept string (default: "image/*")
 *   maxSizeMB      number              Max file size in MB before resize/reject (default: 10)
 *   resize         boolean             Whether to resize the image before upload (default: false)
 *   resizeWidth    number              Target width in px when resize=true (default: 1200)
 *   resizeHeight   number | null       Target height in px (null = auto aspect ratio) (default: null)
 *   resizeQuality  number              JPEG quality 0-1 when resize=true (default: 0.85)
 *   value          string | null       Currently uploaded file URL (for preview)
 *   onFile         (File) => void      Called with the processed (possibly resized) File
 *   onClear        () => void          Called when user removes the file
 *   aspectRatio    string              Tailwind aspect class for the drop zone (default: "aspect-video")
 *   hint           string              Optional hint text below drop zone
 *   disabled       boolean
 */
import { useState, useRef, useCallback } from 'react';
import {
  Upload, X, CheckCircle2, Loader2, RefreshCw,
  Image as ImageIcon, FileText, AlertCircle, ZoomIn
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Canvas resize utility ───────────────────────────────────────────────────
async function resizeImageFile(file, targetWidth, targetHeight, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const originalW = img.naturalWidth;
      const originalH = img.naturalHeight;

      // Compute final dimensions
      let finalW = targetWidth;
      let finalH;
      if (targetHeight) {
        finalH = targetHeight;
      } else {
        // Keep aspect ratio
        finalH = Math.round((originalH / originalW) * finalW);
      }

      // Don't upscale tiny images
      if (originalW <= finalW && originalH <= (targetHeight || 99999)) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, finalW, finalH);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas resize failed')); return; }
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(resizedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlobalFileUploader({
  label,
  accept = 'image/*',
  maxSizeMB = 10,
  resize = false,
  resizeWidth = 1200,
  resizeHeight = null,
  resizeQuality = 0.85,
  value = null,
  onFile,
  onClear,
  aspectRatio = 'aspect-video',
  hint,
  disabled = false,
  compact = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resizeInfo, setResizeInfo] = useState(null); // e.g. "1200×675px"
  const inputRef = useRef(null);

  const processFile = useCallback(async (rawFile) => {
    if (!rawFile) return;

    // File type guard
    if (accept !== '*' && !rawFile.type.match(accept.replace('*', '.*'))) {
      toast.error(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    // Size guard (before resize)
    const sizeMB = rawFile.size / (1024 * 1024);
    if (!resize && sizeMB > maxSizeMB) {
      toast.error(`File is ${sizeMB.toFixed(1)}MB. Maximum allowed: ${maxSizeMB}MB`);
      return;
    }

    try {
      setProcessing(true);
      setResizeInfo(null);

      let finalFile = rawFile;

      if (resize && rawFile.type.startsWith('image/')) {
        toast.info(`Resizing image to ${resizeWidth}${resizeHeight ? `×${resizeHeight}` : 'px wide'}...`);
        finalFile = await resizeImageFile(rawFile, resizeWidth, resizeHeight, resizeQuality);

        // Show resize feedback
        const img = new Image();
        const url = URL.createObjectURL(finalFile);
        img.onload = () => {
          setResizeInfo(`${img.naturalWidth}×${img.naturalHeight}px · ${(finalFile.size / 1024).toFixed(0)}KB`);
          URL.revokeObjectURL(url);
        };
        img.src = url;

        toast.success(`Image resized successfully!`);
      }

      onFile(finalFile);
    } catch (err) {
      console.error('GlobalFileUploader error:', err);
      toast.error('Failed to process file. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [accept, maxSizeMB, resize, resizeWidth, resizeHeight, resizeQuality, onFile]);

  const handleInputChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) processFile(e.dataTransfer.files?.[0]);
  };
  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const isImage = value && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">{label}</label>
          {resize && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-full">
              <ZoomIn className="w-2.5 h-2.5" />
              Auto-Resize: {resizeWidth}{resizeHeight ? `×${resizeHeight}` : 'px wide'}
            </span>
          )}
        </div>
      )}

      {!value ? (
        /* ── Drop Zone ── */
        <div
          onClick={() => !disabled && !processing && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative w-full ${compact ? 'h-24' : aspectRatio} border-2 border-dashed rounded-2xl
            flex ${compact ? 'flex-row items-center px-4 py-3 gap-4' : 'flex-col items-center justify-center gap-3'} transition-all duration-200 group
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-primary/10'
              : 'border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-primary/[0.02]'
            }
            ${processing ? 'pointer-events-none' : ''}
          `}
        >
          {processing ? (
            <div className={`flex ${compact ? 'flex-row w-full justify-center' : 'flex-col'} items-center gap-3`}>
              <div className="relative">
                <div className={`${compact ? 'w-8 h-8' : 'w-14 h-14'} rounded-full border-4 border-primary/20 border-t-primary animate-spin`} />
                <Loader2 className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-primary absolute inset-0 m-auto animate-pulse`} />
              </div>
              <p className="text-xs font-bold text-primary animate-pulse">
                {resize ? 'Processing...' : 'Uploading...'}
              </p>
            </div>
          ) : (
            <>
              <div className={`
                ${compact ? 'w-11 h-11 rounded-xl shrink-0' : 'w-16 h-16 rounded-2xl'} 
                flex items-center justify-center transition-all
                group-hover:scale-110 group-hover:rotate-3
                ${isDragging ? 'bg-primary/10 scale-110 rotate-3' : 'bg-white border border-slate-200 shadow-sm'}
              `}>
                {isDragging
                  ? <CheckCircle2 className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-primary`} />
                  : <Upload className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-slate-400 group-hover:text-primary transition-colors`} />
                }
              </div>
              <div className={`text-left flex-1 min-w-0 ${compact ? 'space-y-0.5' : 'space-y-1.5'}`}>
                <p className="text-sm font-black text-slate-700 truncate">
                  {isDragging ? '✨ Drop it here!' : 'Click or Drag & Drop'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {accept === 'image/*' ? 'PNG, JPG, WebP, SVG' : accept} · max {maxSizeMB}MB
                </p>
                {resize && (
                  <p className="text-[9px] font-bold text-violet-500 truncate">
                    🔄 Auto-resize: {resizeWidth}{resizeHeight ? `×${resizeHeight}` : 'px'}
                  </p>
                )}
              </div>
              {hint && !compact && <p className="text-[9px] text-slate-400 italic px-6 text-center">{hint}</p>}
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled || processing}
          />
        </div>
      ) : (
        /* ── Preview Mode ── */
        <div className={`relative w-full ${compact ? 'h-24' : aspectRatio} rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm group`}>
          {isImage ? (
            <img src={value} alt="Uploaded file" className="w-full h-full object-contain p-4 bg-slate-50/50" />
          ) : (
            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2">
              <FileText className="w-10 h-10 text-slate-400" />
              <p className="text-xs font-bold text-slate-600 truncate px-4">{value.split('/').pop()}</p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => !disabled && !processing && inputRef.current?.click()}
              className="flex items-center gap-1 bg-white text-slate-800 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl hover:bg-slate-100 transition-colors"
            >
              {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {processing ? 'Processing...' : 'Replace'}
            </button>
            {onClear && !processing && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 bg-red-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
              <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
            </span>
            {resizeInfo && (
              <span className="flex items-center gap-1 bg-violet-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                <ZoomIn className="w-2.5 h-2.5" /> {resizeInfo}
              </span>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled || processing}
          />
        </div>
      )}
      
      {hint && compact && (
        <p className="text-[9px] text-slate-400 italic mt-1 px-1">{hint}</p>
      )}
    </div>
  );
}
