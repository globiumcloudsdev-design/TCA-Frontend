// 'use client';

// /**
//  * ImportModal — Advanced Import with Column Mapping & Preview
//  * Features:
//  * - CSV/Excel file upload with drag-drop support
//  * - Automatic column detection and mapping
//  * - Preview table with editable data
//  * - Column validation and error handling
//  * - Progress indicator for large files
//  */

// import { useState, useCallback, useMemo } from 'react';
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Upload, FileSpreadsheet, FileJson, Loader2, CheckCircle2, 
//   AlertCircle, X, ArrowRight, MapPin, Edit2, Save, RefreshCw
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import * as XLSX from 'xlsx';
// import Papa from 'papaparse';

// // File upload area component
// function FileUploadArea({ onFileSelect, accept, isProcessing }) {
//   const [dragActive, setDragActive] = useState(false);
//   const [fileName, setFileName] = useState(null);

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       setFileName(files[0].name);
//       onFileSelect(files[0]);
//     }
//   };

//   const handleChange = (e) => {
//     const files = e.target.files;
//     if (files && files[0]) {
//       setFileName(files[0].name);
//       onFileSelect(files[0]);
//     }
//   };

//   return (
//     <div
//       className={cn(
//         "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
//         dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
//         isProcessing && "opacity-50 pointer-events-none"
//       )}
//       onDragEnter={handleDrag}
//       onDragLeave={handleDrag}
//       onDragOver={handleDrag}
//       onDrop={handleDrop}
//       onClick={() => document.getElementById('file-input')?.click()}
//     >
//       <input
//         id="file-input"
//         type="file"
//         className="hidden"
//         accept={accept}
//         onChange={handleChange}
//         disabled={isProcessing}
//       />
//       <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
//       <p className="text-sm font-medium">
//         {fileName || "Click or drag file to upload"}
//       </p>
//       <p className="text-xs text-muted-foreground mt-1">
//         Supported formats: CSV, Excel (.xlsx, .xls)
//       </p>
//       {fileName && (
//         <Badge variant="secondary" className="mt-2">
//           {fileName}
//         </Badge>
//       )}
//     </div>
//   );
// }

// // Column mapping row component
// function ColumnMappingRow({ fileCol, dbCol, availableColumns, onMap, onSkip }) {
//   return (
//     <div className="flex items-center gap-3 p-2 border-b last:border-b-0">
//       <div className="w-1/3">
//         <Badge variant="outline" className="font-mono text-xs">
//           {fileCol}
//         </Badge>
//       </div>
//       <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
//       <div className="flex-1">
//         <Select value={dbCol || 'skip'} onValueChange={onMap}>
//           <SelectTrigger className="h-8 text-sm">
//             <SelectValue placeholder="Map to column..." />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="skip">
//               <span className="text-muted-foreground">— Skip this column —</span>
//             </SelectItem>
//             {availableColumns.map((col) => (
//               <SelectItem key={col.key} value={col.key}>
//                 <div className="flex items-center gap-2">
//                   <span>{col.label}</span>
//                   {col.required && (
//                     <Badge variant="destructive" className="text-[8px] px-1">required</Badge>
//                   )}
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     </div>
//   );
// }

// // Editable cell component for preview
// function EditableCell({ value, onChange, isInvalid }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(String(value ?? ''));

//   const handleSave = () => {
//     onChange(editValue);
//     setIsEditing(false);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') handleSave();
//     if (e.key === 'Escape') {
//       setEditValue(String(value ?? ''));
//       setIsEditing(false);
//     }
//   };

//   if (isEditing) {
//     return (
//       <div className="flex items-center gap-1">
//         <input
//           type="text"
//           value={editValue}
//           onChange={(e) => setEditValue(e.target.value)}
//           onKeyDown={handleKeyDown}
//           className={cn(
//             "w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1",
//             isInvalid ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
//           )}
//           autoFocus
//         />
//         <button
//           onClick={handleSave}
//           className="p-1 hover:bg-accent rounded"
//           title="Save"
//         >
//           <Save className="h-3 w-3" />
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-between group">
//       <span className={cn("text-sm", isInvalid && "text-red-500")}>
//         {value !== null && value !== undefined ? String(value) : '—'}
//       </span>
//       <button
//         onClick={() => setIsEditing(true)}
//         className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
//         title="Edit"
//       >
//         <Edit2 className="h-3 w-3 text-muted-foreground" />
//       </button>
//     </div>
//   );
// }

// export default function ImportModal({
//   open,
//   onClose,
//   columns = [],           // Available columns for mapping: [{ key, label, required, validation }]
//   onImport,               // (data: any[]) => Promise<void>
//   fileName = 'import',
//   accept = '.csv,.xlsx,.xls',
//   sampleData = null,      // Optional sample data for preview
// }) {
//   const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: preview
//   const [file, setFile] = useState(null);
//   const [parsedData, setParsedData] = useState([]);
//   const [fileHeaders, setFileHeaders] = useState([]);
//   const [mapping, setMapping] = useState({});
//   const [previewData, setPreviewData] = useState([]);
//   const [errors, setErrors] = useState([]);
//   const [importing, setImporting] = useState(false);
//   const [importProgress, setImportProgress] = useState(0);
//   const [importStatus, setImportStatus] = useState('idle');

//   // Prepare available columns for mapping
//   const availableColumns = useMemo(() => {
//     return columns.filter(col => col.key !== 'select' && col.key !== 'actions');
//   }, [columns]);

//   // Required columns
//   const requiredColumns = useMemo(() => {
//     return availableColumns.filter(col => col.required).map(col => col.key);
//   }, [availableColumns]);

//   // Parse file based on extension
//   const parseFile = useCallback(async (uploadedFile) => {
//     const extension = uploadedFile.name.split('.').pop().toLowerCase();
//     let headers = [];
//     let rows = [];

//     try {
//       if (extension === 'csv') {
//         const text = await uploadedFile.text();
//         const result = Papa.parse(text, { header: true, skipEmptyLines: true });
//         headers = result.meta.fields || [];
//         rows = result.data;
//       } else if (['xlsx', 'xls'].includes(extension)) {
//         const buffer = await uploadedFile.arrayBuffer();
//         const workbook = XLSX.read(buffer);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const data = XLSX.utils.sheet_to_json(sheet);
//         headers = Object.keys(data[0] || {});
//         rows = data;
//       }

//       setFileHeaders(headers);
//       setParsedData(rows);
      
//       // Auto-map columns based on similarity
//       const autoMapping = {};
//       headers.forEach(fileCol => {
//         const matchedCol = availableColumns.find(dbCol => 
//           dbCol.label.toLowerCase() === fileCol.toLowerCase() ||
//           dbCol.key.toLowerCase() === fileCol.toLowerCase() ||
//           dbCol.label.toLowerCase().includes(fileCol.toLowerCase()) ||
//           fileCol.toLowerCase().includes(dbCol.label.toLowerCase())
//         );
//         if (matchedCol) {
//           autoMapping[fileCol] = matchedCol.key;
//         } else {
//           autoMapping[fileCol] = 'skip';
//         }
//       });
//       setMapping(autoMapping);
      
//       // Generate preview data
//       generatePreview(rows, autoMapping);
      
//       setStep(2);
//     } catch (err) {
//       console.error('Parse error:', err);
//       setErrors([{ type: 'parse', message: 'Failed to parse file. Please check the format.' }]);
//     }
//   }, [availableColumns]);

//   // Generate preview data based on mapping
//   const generatePreview = (data, currentMapping) => {
//     const preview = data.slice(0, 10).map(row => {
//       const mappedRow = {};
//       Object.entries(currentMapping).forEach(([fileCol, dbCol]) => {
//         if (dbCol !== 'skip') {
//           mappedRow[dbCol] = row[fileCol] ?? '';
//         }
//       });
//       return mappedRow;
//     });
//     setPreviewData(preview);
//   };

//   // Update mapping for a column
//   const updateMapping = (fileCol, dbCol) => {
//     const newMapping = { ...mapping, [fileCol]: dbCol };
//     setMapping(newMapping);
//     generatePreview(parsedData, newMapping);
    
//     // Validate required columns
//     const mappedRequired = Object.values(newMapping).filter(v => v !== 'skip');
//     const missingRequired = requiredColumns.filter(req => !mappedRequired.includes(req));
//     if (missingRequired.length > 0) {
//       setErrors([{ type: 'required', message: `Missing required columns: ${missingRequired.join(', ')}` }]);
//     } else {
//       setErrors([]);
//     }
//   };

//   // Update a cell in preview data
//   const updatePreviewCell = (rowIndex, colKey, value) => {
//     const newPreview = [...previewData];
//     newPreview[rowIndex] = { ...newPreview[rowIndex], [colKey]: value };
//     setPreviewData(newPreview);
//   };

//   // Prepare all data for import (with edits)
//   const prepareImportData = () => {
//     const mappedRequired = Object.values(mapping).filter(v => v !== 'skip');
//     const missingRequired = requiredColumns.filter(req => !mappedRequired.includes(req));
//     if (missingRequired.length > 0) {
//       setErrors([{ type: 'required', message: `Missing required columns: ${missingRequired.join(', ')}` }]);
//       return null;
//     }

//     // Apply edits from preview to full dataset
//     const fullData = parsedData.map((row, idx) => {
//       const mappedRow = {};
//       Object.entries(mapping).forEach(([fileCol, dbCol]) => {
//         if (dbCol !== 'skip') {
//           // Check if this row was edited in preview
//           const previewRow = previewData[idx];
//           if (previewRow && previewRow[dbCol] !== undefined) {
//             mappedRow[dbCol] = previewRow[dbCol];
//           } else {
//             mappedRow[dbCol] = row[fileCol] ?? '';
//           }
//         }
//       });
//       return mappedRow;
//     });

//     return fullData;
//   };

//   // Handle import execution
//   const handleImport = async () => {
//     const importData = prepareImportData();
//     if (!importData) return;

//     setImporting(true);
//     setImportProgress(0);
//     setImportStatus('processing');

//     try {
//       // Simulate progress for better UX
//       const total = importData.length;
//       const batchSize = 10;
      
//       for (let i = 0; i < total; i += batchSize) {
//         const batch = importData.slice(i, i + batchSize);
//         await onImport(batch);
//         setImportProgress(Math.min(((i + batchSize) / total) * 100, 100));
//       }
      
//       setImportStatus('success');
//       setTimeout(() => {
//         onClose();
//         resetState();
//       }, 1500);
//     } catch (err) {
//       console.error('Import error:', err);
//       setImportStatus('error');
//       setErrors([{ type: 'import', message: err.message || 'Import failed. Please try again.' }]);
//       setTimeout(() => setImportStatus('idle'), 3000);
//     } finally {
//       setTimeout(() => setImporting(false), 500);
//     }
//   };

//   // Reset all state
//   const resetState = () => {
//     setStep(1);
//     setFile(null);
//     setParsedData([]);
//     setFileHeaders([]);
//     setMapping({});
//     setPreviewData([]);
//     setErrors([]);
//     setImportProgress(0);
//     setImportStatus('idle');
//   };

//   const handleClose = () => {
//     resetState();
//     onClose();
//   };

//   const totalRecords = parsedData.length;
//   const mappedCount = Object.values(mapping).filter(v => v !== 'skip').length;
//   const missingRequired = requiredColumns.filter(req => 
//     !Object.values(mapping).includes(req)
//   );

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
//       <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Upload className="h-5 w-5" />
//             Import Data
//             {step > 1 && (
//               <Badge variant="secondary" className="ml-2">
//                 {totalRecords} records
//               </Badge>
//             )}
//           </DialogTitle>
//         </DialogHeader>

//         {/* Step indicator */}
//         <div className="flex items-center justify-between px-8">
//           {[1, 2, 3].map((s) => (
//             <div key={s} className="flex items-center">
//               <div className={cn(
//                 "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
//                 step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
//               )}>
//                 {s}
//               </div>
//               {s < 3 && (
//                 <div className={cn(
//                   "w-16 h-0.5 mx-2",
//                   step > s ? "bg-primary" : "bg-muted"
//                 )} />
//               )}
//             </div>
//           ))}
//         </div>

//         <ScrollArea className="h-[400px] pr-4">
//           {/* Step 1: File Upload */}
//           {step === 1 && (
//             <div className="space-y-4 py-4">
//               <FileUploadArea
//                 onFileSelect={(selectedFile) => {
//                   setFile(selectedFile);
//                   parseFile(selectedFile);
//                 }}
//                 accept={accept}
//                 isProcessing={false}
//               />
              
//               {sampleData && (
//                 <div className="rounded-lg border p-3 bg-muted/20">
//                   <p className="text-xs font-medium mb-2">Sample Format</p>
//                   <pre className="text-xs text-muted-foreground overflow-x-auto">
//                     {JSON.stringify(sampleData, null, 2)}
//                   </pre>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 2: Column Mapping */}
//           {step === 2 && (
//             <div className="space-y-4 py-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium">Map Columns</p>
//                   <p className="text-xs text-muted-foreground">
//                     Map file columns to database fields
//                   </p>
//                 </div>
//                 <Badge variant={missingRequired.length === 0 ? "default" : "destructive"}>
//                   {mappedCount} columns mapped
//                 </Badge>
//               </div>

//               {errors.length > 0 && errors[0].type === 'required' && (
//                 <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-yellow-700 dark:text-yellow-300">
//                   <AlertCircle className="h-4 w-4" />
//                   <span className="text-sm">{errors[0].message}</span>
//                 </div>
//               )}

//               <div className="rounded-lg border">
//                 <div className="p-3 bg-muted/30 border-b">
//                   <div className="grid grid-cols-3 gap-3 text-xs font-medium text-muted-foreground">
//                     <div>File Column</div>
//                     <div></div>
//                     <div>Map to Field</div>
//                   </div>
//                 </div>
//                 <div className="max-h-[400px] overflow-y-auto">
//                   {fileHeaders.map((header) => (
//                     <ColumnMappingRow
//                       key={header}
//                       fileCol={header}
//                       dbCol={mapping[header]}
//                       availableColumns={availableColumns}
//                       onMap={(value) => updateMapping(header, value)}
//                       onSkip={() => updateMapping(header, 'skip')}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {requiredColumns.length > 0 && (
//                 <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950/20">
//                   <p className="text-xs font-medium mb-2">Required Fields</p>
//                   <div className="flex flex-wrap gap-2">
//                     {requiredColumns.map(col => {
//                       const isMapped = Object.values(mapping).includes(col);
//                       return (
//                         <Badge key={col} variant={isMapped ? "default" : "outline"}>
//                           {availableColumns.find(c => c.key === col)?.label || col}
//                           {!isMapped && " (missing)"}
//                         </Badge>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 3: Preview & Edit */}
//           {step === 3 && (
//             <div className="space-y-4 py-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium">Preview Data</p>
//                   <p className="text-xs text-muted-foreground">
//                     Showing first 10 rows • Click on any cell to edit
//                   </p>
//                 </div>
//                 <Badge variant="outline">
//                   {previewData.length} rows preview
//                 </Badge>
//               </div>

//               <div className="rounded-lg border overflow-x-auto">
//                 <Table className="min-w-[600px]">
//                   <TableHeader>
//                     <TableRow className="bg-muted/40">
//                       {Object.keys(previewData[0] || {}).map((colKey) => {
//                         const col = availableColumns.find(c => c.key === colKey);
//                         return (
//                           <TableHead key={colKey} className="whitespace-nowrap text-xs">
//                             {col?.label || colKey}
//                             {col?.required && (
//                               <span className="ml-1 text-red-500">*</span>
//                             )}
//                           </TableHead>
//                         );
//                       })}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {previewData.map((row, rowIdx) => (
//                       <TableRow key={rowIdx}>
//                         {Object.entries(row).map(([colKey, value], colIdx) => (
//                           <TableCell key={colIdx} className="p-2">
//                             <EditableCell
//                               value={value}
//                               onChange={(newValue) => updatePreviewCell(rowIdx, colKey, newValue)}
//                             />
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               {totalRecords > 10 && (
//                 <p className="text-xs text-muted-foreground text-center">
//                   + {totalRecords - 10} more records will be imported
//                 </p>
//               )}

//               {/* Progress during import */}
//               {importing && importStatus === 'processing' && (
//                 <div className="space-y-2">
//                   <Progress value={importProgress} className="h-2" />
//                   <p className="text-xs text-muted-foreground text-center">
//                     Importing... {Math.round(importProgress)}%
//                   </p>
//                 </div>
//               )}

//               {/* Success/Error messages */}
//               {importStatus === 'success' && (
//                 <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg text-green-700 dark:text-green-300">
//                   <CheckCircle2 className="h-4 w-4" />
//                   <span className="text-sm">Import completed successfully!</span>
//                 </div>
//               )}

//               {importStatus === 'error' && errors.length > 0 && (
//                 <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg text-red-700 dark:text-red-300">
//                   <AlertCircle className="h-4 w-4" />
//                   <span className="text-sm">{errors[errors.length - 1]?.message || 'Import failed'}</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </ScrollArea>

//         <DialogFooter className="gap-2 mt-4">
//           {step > 1 && step < 3 && (
//             <Button variant="outline" onClick={() => setStep(step - 1)} disabled={importing}>
//               Back
//             </Button>
//           )}
          
//           <Button variant="outline" onClick={handleClose} disabled={importing}>
//             Cancel
//           </Button>
          
//           {step === 1 && file && (
//             <Button onClick={() => setStep(2)}>
//               Continue
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           )}
          
//           {step === 2 && (
//             <Button 
//               onClick={() => setStep(3)} 
//               disabled={missingRequired.length > 0}
//             >
//               Preview & Edit
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           )}
          
//           {step === 3 && (
//             <Button 
//               onClick={handleImport} 
//               disabled={importing || missingRequired.length > 0}
//               className="min-w-[100px]"
//             >
//               {importing ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Importing...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="mr-2 h-4 w-4" />
//                   Import {totalRecords} Records
//                 </>
//               )}
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }







'use client';

/**
 * ImportModal — Advanced Import with Column Mapping & Preview
 * Features:
 * - CSV/Excel file upload with drag-drop support
 * - Automatic column detection and mapping
 * - Preview table with editable data
 * - Column validation and error handling
 * - Progress indicator for large files
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload, FileSpreadsheet, FileJson, Loader2, CheckCircle2, 
  AlertCircle, X, ArrowRight, MapPin, Edit2, Save, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

// File upload area component
function FileUploadArea({ onFileSelect, accept, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFileName(files[0].name);
      onFileSelect(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFileName(files[0].name);
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
        dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
        isProcessing && "opacity-50 pointer-events-none"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        disabled={isProcessing}
      />
      <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">
        {fileName || "Click or drag file to upload"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Supported formats: CSV, Excel (.xlsx, .xls)
      </p>
      {fileName && (
        <Badge variant="secondary" className="mt-2">
          {fileName}
        </Badge>
      )}
    </div>
  );
}

// Column mapping row component
function ColumnMappingRow({ fileCol, dbCol, availableColumns, onMap, onSkip }) {
  return (
    <div className="flex items-center gap-3 p-2 border-b last:border-b-0">
      <div className="w-1/3">
        <Badge variant="outline" className="font-mono text-xs">
          {fileCol}
        </Badge>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1">
        <Select value={dbCol || 'skip'} onValueChange={onMap}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Map to column..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skip">
              <span className="text-muted-foreground">— Skip this column —</span>
            </SelectItem>
            {availableColumns.map((col) => (
              <SelectItem key={col.key} value={col.key}>
                <div className="flex items-center gap-2">
                  <span>{col.label}</span>
                  {col.required && (
                    <Badge variant="destructive" className="text-[8px] px-1">required</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Editable cell component for preview
function EditableCell({ value, onChange, isInvalid }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(String(value ?? ''));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1",
            isInvalid ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-primary"
          )}
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1 hover:bg-accent rounded"
          title="Save"
        >
          <Save className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <span className={cn("text-sm", isInvalid && "text-red-500")}>
        {value !== null && value !== undefined ? String(value) : '—'}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
        title="Edit"
      >
        <Edit2 className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export default function ImportModal({
  open,
  onClose,
  columns = [],           // Available columns for mapping: [{ key, label, required, validation }]
  onImport,               // (data: any[]) => Promise<void>
  fileName = 'import',
  accept = '.csv,.xlsx,.xls',
  sampleData = null,      // Optional sample data for preview
}) {
  const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: preview
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle');

  // Prepare available columns for mapping
  const availableColumns = useMemo(() => {
    return columns.filter(col => col.key !== 'select' && col.key !== 'actions');
  }, [columns]);

  // Required columns
  const requiredColumns = useMemo(() => {
    return availableColumns.filter(col => col.required).map(col => col.key);
  }, [availableColumns]);

  // Parse file based on extension
  const parseFile = useCallback(async (uploadedFile) => {
    const extension = uploadedFile.name.split('.').pop().toLowerCase();
    let headers = [];
    let rows = [];

    try {
      if (['csv', 'xlsx', 'xls'].includes(extension)) {
        const buffer = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        headers = Object.keys(data[0] || {});
        rows = data;
      }

      setFileHeaders(headers);
      setParsedData(rows);
      
      // Auto-map columns based on similarity
      const autoMapping = {};
      headers.forEach(fileCol => {
        const matchedCol = availableColumns.find(dbCol => 
          dbCol.label.toLowerCase() === fileCol.toLowerCase() ||
          dbCol.key.toLowerCase() === fileCol.toLowerCase() ||
          dbCol.label.toLowerCase().includes(fileCol.toLowerCase()) ||
          fileCol.toLowerCase().includes(dbCol.label.toLowerCase())
        );
        if (matchedCol) {
          autoMapping[fileCol] = matchedCol.key;
        } else {
          autoMapping[fileCol] = 'skip';
        }
      });
      setMapping(autoMapping);
      
      // Generate preview data
      generatePreview(rows, autoMapping);
      
      setStep(2);
    } catch (err) {
      console.error('Parse error:', err);
      setErrors([{ type: 'parse', message: 'Failed to parse file. Please check the format.' }]);
    }
  }, [availableColumns]);

  // Generate preview data based on mapping
  const generatePreview = (data, currentMapping) => {
    const preview = data.slice(0, 10).map(row => {
      const mappedRow = {};
      Object.entries(currentMapping).forEach(([fileCol, dbCol]) => {
        if (dbCol !== 'skip') {
          mappedRow[dbCol] = row[fileCol] ?? '';
        }
      });
      return mappedRow;
    });
    setPreviewData(preview);
  };

  // Update mapping for a column
  const updateMapping = (fileCol, dbCol) => {
    const newMapping = { ...mapping, [fileCol]: dbCol };
    setMapping(newMapping);
    generatePreview(parsedData, newMapping);
    
    // Validate required columns
    const mappedRequired = Object.values(newMapping).filter(v => v !== 'skip');
    const missingRequired = requiredColumns.filter(req => !mappedRequired.includes(req));
    if (missingRequired.length > 0) {
      setErrors([{ type: 'required', message: `Missing required columns: ${missingRequired.join(', ')}` }]);
    } else {
      setErrors([]);
    }
  };

  // Update a cell in preview data
  const updatePreviewCell = (rowIndex, colKey, value) => {
    const newPreview = [...previewData];
    newPreview[rowIndex] = { ...newPreview[rowIndex], [colKey]: value };
    setPreviewData(newPreview);
  };

  // Prepare all data for import (with edits)
  const prepareImportData = () => {
    const mappedRequired = Object.values(mapping).filter(v => v !== 'skip');
    const missingRequired = requiredColumns.filter(req => !mappedRequired.includes(req));
    if (missingRequired.length > 0) {
      setErrors([{ type: 'required', message: `Missing required columns: ${missingRequired.join(', ')}` }]);
      return null;
    }

    // Apply edits from preview to full dataset
    const fullData = parsedData.map((row, idx) => {
      const mappedRow = {};
      Object.entries(mapping).forEach(([fileCol, dbCol]) => {
        if (dbCol !== 'skip') {
          // Check if this row was edited in preview
          const previewRow = previewData[idx];
          if (previewRow && previewRow[dbCol] !== undefined) {
            mappedRow[dbCol] = previewRow[dbCol];
          } else {
            mappedRow[dbCol] = row[fileCol] ?? '';
          }
        }
      });
      return mappedRow;
    });

    return fullData;
  };

  // Handle import execution
  const handleImport = async () => {
    const importData = prepareImportData();
    if (!importData) return;

    setImporting(true);
    setImportProgress(0);
    setImportStatus('processing');

    try {
      // Simulate progress for better UX
      const total = importData.length;
      const batchSize = 10;
      
      for (let i = 0; i < total; i += batchSize) {
        const batch = importData.slice(i, i + batchSize);
        await onImport(batch);
        setImportProgress(Math.min(((i + batchSize) / total) * 100, 100));
      }
      
      setImportStatus('success');
      setTimeout(() => {
        onClose();
        resetState();
      }, 1500);
    } catch (err) {
      console.error('Import error:', err);
      setImportStatus('error');
      setErrors([{ type: 'import', message: err.message || 'Import failed. Please try again.' }]);
      setTimeout(() => setImportStatus('idle'), 3000);
    } finally {
      setTimeout(() => setImporting(false), 500);
    }
  };

  // Reset all state
  const resetState = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setFileHeaders([]);
    setMapping({});
    setPreviewData([]);
    setErrors([]);
    setImportProgress(0);
    setImportStatus('idle');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const totalRecords = parsedData.length;
  const mappedCount = Object.values(mapping).filter(v => v !== 'skip').length;
  const missingRequired = requiredColumns.filter(req => 
    !Object.values(mapping).includes(req)
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-5xl w-full max-h-[100vh] h-[105vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
            {step > 1 && (
              <Badge variant="secondary" className="ml-2">
                {totalRecords} records
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-between px-8 py-4 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-16 h-0.5 mx-2",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Content area with both scrolls */}
        <div className="flex-1 min-h-0 overflow-hidden px-6">
          
          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="h-full overflow-y-auto py-4">
              <FileUploadArea
                onFileSelect={(selectedFile) => {
                  setFile(selectedFile);
                  parseFile(selectedFile);
                }}
                accept={accept}
                isProcessing={false}
              />
              
              {sampleData && (
                <div className="rounded-lg border p-3 bg-muted/20 mt-4">
                  <p className="text-xs font-medium mb-2">Sample Format</p>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(sampleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && (
            <div className="h-full overflow-y-auto py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Map Columns</p>
                  <p className="text-xs text-muted-foreground">
                    Map file columns to database fields
                  </p>
                </div>
                <Badge variant={missingRequired.length === 0 ? "default" : "destructive"}>
                  {mappedCount} columns mapped
                </Badge>
              </div>

              {errors.length > 0 && errors[0].type === 'required' && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errors[0].message}</span>
                </div>
              )}

              <div className="rounded-lg border">
                <div className="p-3 bg-muted/30 border-b">
                  <div className="grid grid-cols-3 gap-3 text-xs font-medium text-muted-foreground">
                    <div>File Column</div>
                    <div></div>
                    <div>Map to Field</div>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {fileHeaders.map((header) => (
                    <ColumnMappingRow
                      key={header}
                      fileCol={header}
                      dbCol={mapping[header]}
                      availableColumns={availableColumns}
                      onMap={(value) => updateMapping(header, value)}
                      onSkip={() => updateMapping(header, 'skip')}
                    />
                  ))}
                </div>
              </div>

              {requiredColumns.length > 0 && (
                <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-xs font-medium mb-2">Required Fields</p>
                  <div className="flex flex-wrap gap-2">
                    {requiredColumns.map(col => {
                      const isMapped = Object.values(mapping).includes(col);
                      return (
                        <Badge key={col} variant={isMapped ? "default" : "outline"}>
                          {availableColumns.find(c => c.key === col)?.label || col}
                          {!isMapped && " (missing)"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & Edit - BOTH SCROLLS WORKING */}
          {step === 3 && (
            <div className="h-full flex flex-col py-4 gap-4">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <p className="text-sm font-medium">Preview Data</p>
                  <p className="text-xs text-muted-foreground">
                    Showing first 10 rows • Click on any cell to edit
                  </p>
                </div>
                <Badge variant="outline">
                  {previewData.length} rows preview
                </Badge>
              </div>

              {/* Table wrapper with BOTH horizontal AND vertical scroll */}
              <div className="flex-1 min-h-0 border rounded-lg overflow-auto">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 sticky top-0">
                        {Object.keys(previewData[0] || {}).map((colKey) => {
                          const col = availableColumns.find(c => c.key === colKey);
                          return (
                            <TableHead key={colKey} className="whitespace-nowrap text-xs">
                              {col?.label || colKey}
                              {col?.required && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          {Object.entries(row).map(([colKey, value], colIdx) => (
                            <TableCell key={colIdx} className="p-2 whitespace-nowrap">
                              <EditableCell
                                value={value}
                                onChange={(newValue) => updatePreviewCell(rowIdx, colKey, newValue)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {totalRecords > 10 && (
                <p className="text-xs text-muted-foreground text-center shrink-0">
                  + {totalRecords - 10} more records will be imported
                </p>
              )}

              {/* Progress during import */}
              {importing && importStatus === 'processing' && (
                <div className="space-y-2 shrink-0">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Importing... {Math.round(importProgress)}%
                  </p>
                </div>
              )}

              {/* Success/Error messages */}
              {importStatus === 'success' && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg text-green-700 dark:text-green-300 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Import completed successfully!</span>
                </div>
              )}

              {importStatus === 'error' && errors.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg text-red-700 dark:text-red-300 shrink-0">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errors[errors.length - 1]?.message || 'Import failed'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 px-6 py-4 border-t mt-auto shrink-0">
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={importing}>
              Back
            </Button>
          )}
          
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          
          {step === 1 && file && (
            <Button onClick={() => setStep(2)}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          {step === 2 && (
            <Button 
              onClick={() => setStep(3)} 
              disabled={missingRequired.length > 0}
            >
              Preview & Edit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          {step === 3 && (
            <Button 
              onClick={handleImport} 
              disabled={importing || missingRequired.length > 0}
              className="min-w-[100px]"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {totalRecords} Records
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}