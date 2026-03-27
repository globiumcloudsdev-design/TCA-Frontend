//src/components/forms/FileUpload.jsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileUpload({
  accept = '*/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  value = [],
  onChange,
  onUpload,
  onError,
  disabled = false,
  className = ""
}) {
  const [files, setFiles] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    const type = file.type || file.name?.split('.').pop();
    if (type?.startsWith('image/')) return Image;
    if (type === 'pdf') return FileText;
    if (type?.includes('spreadsheet') || type === 'xlsx' || type === 'csv') return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      onError?.(`File ${file.name} exceeds ${formatFileSize(maxSize)}`);
      return false;
    }

    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type || `application/${file.name.split('.').pop()}`;
      if (!acceptedTypes.some(t => fileType.match(t.replace('*', '.*')))) {
        onError?.(`File type ${fileType} not accepted`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = async (newFiles) => {
    const validFiles = Array.from(newFiles).filter(validateFile);
    
    if (multiple) {
      if (files.length + validFiles.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }
      setFiles([...files, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }

    // Start upload
    if (onUpload) {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      validFiles.forEach(file => formData.append('files', file));

      try {
        const result = await onUpload(formData, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        });
        onChange?.(result);
      } catch (error) {
        onError?.(error.message);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    } else {
      onChange?.(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const clearAll = () => {
    setFiles([]);
    onChange?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center',
          'transition-colors cursor-pointer',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        
        <p className="font-medium">
          {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
        </p>
        
        <p className="text-sm text-muted-foreground mt-1">
          Max file size: {formatFileSize(maxSize)}
          {multiple && ` | Max files: ${maxFiles}`}
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const isImage = file.type?.startsWith('image/');

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                    
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}