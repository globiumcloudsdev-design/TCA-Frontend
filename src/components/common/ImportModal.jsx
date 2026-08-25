'use client';

/**
 * ImportModal — Advanced Multi-Format Import with Column Auto-Mapping & Preview
 * Features:
 * - Multi-Format File Reader (.xlsx, .xls, .csv) via arrayBuffer()
 * - Unicode & control character stripping ([\u200B-\u200D\uFEFF\u200E\u200F\u00A0])
 * - Intelligent fuzzy auto-mapping with comprehensive field synonyms
 * - Robust data sanitization pipeline (ISO dates, placeholder stripping '---', booleans)
 * - Large dataset handling with preview virtualization and smooth progress tracking
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Edit2,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZATION & NORMALIZATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip non-printable / Unicode zero-width / direction control characters and trim whitespace.
 * Also cleans placeholder strings ('---', 'null', 'N/A', etc.) into empty string ''.
 */
export function sanitizeStr(val) {
  if (val === null || val === undefined) return '';
  const str = String(val)
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u00A0]/g, '')
    .trim();

  const lower = str.toLowerCase();
  if (
    str === '---' ||
    str === '--' ||
    str === '-' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'n/a' ||
    lower === 'none'
  ) {
    return '';
  }
  return str;
}

/**
 * Standardize varied date values (Excel serial numbers, DD-MM-YY, MM/DD/YYYY, ISO) into YYYY-MM-DD.
 */
export function parseToIsoDate(val) {
  if (val === null || val === undefined) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof val === 'number') {
    // Excel date serial number (e.g. 44561)
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  const str = sanitizeStr(val);
  if (!str) return '';

  // 1. YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 2. DD-MM-YY or DD-MM-YYYY or MM/DD/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (dmyMatch) {
    let d = parseInt(dmyMatch[1], 10);
    let m = parseInt(dmyMatch[2], 10);
    let y = dmyMatch[3];
    if (y.length === 2) {
      const numY = parseInt(y, 10);
      y = String(numY > 50 ? 1900 + numY : 2000 + numY);
    }
    // Swap if month was in the first slot (>12)
    if (m > 12 && d <= 12) {
      const temp = d;
      d = m;
      m = temp;
    }
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // 3. Fallback native parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

/**
 * Normalizes headers by removing control characters, spaces, and punctuation.
 */
function normalizeHeader(str) {
  return String(str || '')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u00A0]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Comprehensive synonym dictionary for fuzzy auto-mapping file columns to target schema fields.
 */
const FIELD_SYNONYMS = {
  first_name: ['firstname', 'first', 'studentname', 'studentfirstname', 'fullname', 'name', 'fname'],
  last_name: ['lastname', 'last', 'surname', 'familyname', 'lname'],
  email: ['email', 'emailaddress', 'studentemail'],
  phone: ['phone', 'mobile', 'contact', 'contactno', 'phonenumber', 'mobilenumber', 'cell', 'cellno', 'studentphone'],
  registration_no: ['registrationno', 'registrationnumber', 'regno', 'regnumber', 'registration', 'reg', 'grno', 'grnumber', 'gr', 'studentcode', 'studentid', 'admissionno'],
  cnic: ['cnic', 'bform', 'cnicbform', 'bformno', 'cnicno', 'nationalid', 'idcard', 'identity', 'formb'],
  dob: ['dob', 'dateofbirth', 'birthdate', 'birthofdate', 'dateofbirthdob'],
  gender: ['gender', 'sex'],
  blood_group: ['bloodgroup', 'bloodtype', 'blood'],
  religion: ['religion'],
  nationality: ['nationality', 'country'],
  class_name: ['class', 'classname', 'grade', 'gradename', 'currentclass', 'standard', 'primaryunit', 'course', 'coursename'],
  section_name: ['section', 'sectionname', 'group', 'batch', 'batchname', 'division', 'stream', 'groupingunit'],
  roll_no: ['rollnumber', 'rollno', 'roll', 'candidateno', 'candidateid', 'traineeid', 'seatno'],
  academic_year_name: ['academicyear', 'academicyearname', 'academicperiod', 'session', 'academicsession', 'schoolyear', 'batchyear', 'year'],
  admission_date: ['admissiondate', 'dateofadmission', 'enrollmentdate', 'joiningdate', 'dateofjoining', 'doj'],
  father_name: ['fathername', 'fathersname', 'father'],
  father_phone: ['fatherphone', 'fathermobile', 'fathersphone', 'fathersmobile'],
  father_cnic: ['fathercnic', 'fatherscnic', 'fathercnicno'],
  father_occupation: ['fatheroccupation', 'fathersoccupation', 'occupation'],
  mother_name: ['mothername', 'mothersname', 'mother'],
  mother_phone: ['motherphone', 'mothermobile'],
  mother_cnic: ['mothercnic', 'motherscnic'],
  guardian_name: ['guardianname', 'guardian', 'parentname', 'parentsname'],
  guardian_phone: ['guardianphone', 'guardianmobile', 'parentphone'],
  guardian_cnic: ['guardiancnic', 'guardiancnicno', 'parentcnic'],
  guardian_email: ['guardianemail', 'parentemail'],
  guardian_relation: ['guardianrelation', 'relation', 'relationship'],
  guardian_type: ['guardiantype'],
  present_address: ['presentaddress', 'currentaddress', 'address', 'residentialaddress'],
  permanent_address: ['permanentaddress'],
  city: ['city', 'town'],
  emergency_contact_name: ['emergencycontactperson', 'emergencycontactname', 'emergencycontact', 'emergencyperson'],
  emergency_contact_relation: ['emergencycontactrelation', 'emergencyrelation'],
  emergency_contact_phone: ['emergencycontactphone', 'emergencyphone', 'emergencymobile'],
  monthly_fee: ['monthlyfee', 'tuitionfee', 'fee', 'basefee', 'schoolfee'],
  admission_fee: ['admissionfee', 'registrationfee'],
  concession_type: ['concessiontype', 'discounttype', 'concession'],
  concession_percentage: ['concessionpercentage', 'discountpercentage', 'concession', 'discount'],
  concession_reason: ['concessionreason', 'discountreason'],
  medical_conditions: ['medicalconditions', 'medicalcondition', 'medicalhistory', 'medical'],
  allergies: ['allergies', 'allergy'],
  previous_school: ['previousschool', 'previousschoolcollege', 'lastschool'],
  previous_class: ['previousclass', 'previousclassgrade', 'lastclass', 'previousgrade'],
  is_active: ['activestatus', 'isactive', 'active', 'statusactive'],
  status: ['status'],
};

/**
 * Match a raw file header to an available schema column.
 */
function matchHeaderToColumn(fileCol, availableCols) {
  const normFileCol = normalizeHeader(fileCol);
  if (!normFileCol) return null;

  // 1. Direct key match or exact label match
  const direct = availableCols.find(
    (c) => normalizeHeader(c.key) === normFileCol || normalizeHeader(c.label) === normFileCol
  );
  if (direct) return direct;

  // 2. Synonyms dictionary lookup
  for (const [key, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    if (synonyms.includes(normFileCol)) {
      const col = availableCols.find((c) => c.key === key);
      if (col) return col;
    }
  }

  // 3. Substring / partial match
  const partial = availableCols.find((c) => {
    const k = normalizeHeader(c.key);
    const l = normalizeHeader(c.label);
    return (
      (k.length > 3 && (normFileCol.includes(k) || k.includes(normFileCol))) ||
      (l.length > 3 && (normFileCol.includes(l) || l.includes(normFileCol)))
    );
  });
  if (partial) return partial;

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function FileUploadArea({ onFileSelect, accept, isProcessing, fileName }) {
  const [dragActive, setDragActive] = useState(false);

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
      onFileSelect(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-card',
        dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
        isProcessing && 'opacity-50 pointer-events-none'
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload-input')?.click()}
    >
      <input
        id="file-upload-input"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        onClick={(e) => {
          e.stopPropagation();
          e.target.value = null;
        }}
        disabled={isProcessing}
      />
      <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm font-semibold text-foreground">
        {fileName || 'Click or drag file to upload'}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Supported formats: Excel (.xlsx, .xls) and CSV (.csv)
      </p>
      {fileName && (
        <Badge variant="secondary" className="mt-3 font-mono text-xs px-2.5 py-1">
          {fileName}
        </Badge>
      )}
    </div>
  );
}

function ColumnMappingRow({ fileCol, dbCol, availableColumns, onMap }) {
  return (
    <div className="flex items-center gap-3 p-2.5 border-b last:border-b-0 hover:bg-muted/20 transition-colors">
      <div className="w-1/3 min-w-0">
        <Badge variant="outline" className="font-mono text-xs max-w-full truncate">
          {fileCol}
        </Badge>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1">
        <Select value={dbCol || 'skip'} onValueChange={onMap}>
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue placeholder="Map to field..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="skip">
              <span className="text-muted-foreground italic">— Skip this column —</span>
            </SelectItem>
            {availableColumns.map((col) => (
              <SelectItem key={col.key} value={col.key} className="text-xs">
                <div className="flex items-center gap-2">
                  <span>{col.label}</span>
                  {col.required && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                      required
                    </Badge>
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
      <div className="flex items-center gap-1 min-w-[120px]">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-2 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1',
            isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-primary'
          )}
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1 hover:bg-accent rounded text-primary"
          title="Save"
        >
          <Save className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group gap-2 min-w-[80px]">
      <span className={cn('text-xs truncate max-w-[200px]', isInvalid && 'text-red-500 font-semibold')}>
        {value !== null && value !== undefined && value !== '' ? String(value) : '—'}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity shrink-0"
        title="Edit cell"
      >
        <Edit2 className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN IMPORT MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ImportModal({
  open,
  onClose,
  columns = [],
  onImport,
  fileName = 'import',
  accept = '.csv,.xlsx,.xls',
  sampleData = null,
}) {
  const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: preview
  const [file, setFile] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle');

  // Filter columns available for mapping
  const availableColumns = useMemo(() => {
    return columns.filter((col) => col.key !== 'select' && col.key !== 'actions');
  }, [columns]);

  // Required column keys
  const requiredColumns = useMemo(() => {
    return availableColumns.filter((col) => col.required).map((col) => col.key);
  }, [availableColumns]);

  // Transform a raw data row into a sanitized mapped row
  const sanitizeMappedRow = useCallback((row, currentMapping) => {
    const mapped = {};
    Object.entries(currentMapping).forEach(([fileCol, dbCol]) => {
      if (dbCol && dbCol !== 'skip') {
        const rawVal = row[fileCol];

        // 1. Date fields
        if (dbCol === 'dob' || dbCol === 'admission_date' || dbCol === 'date_of_birth') {
          mapped[dbCol] = parseToIsoDate(rawVal);
          return;
        }

        // 2. Boolean is_active
        if (dbCol === 'is_active') {
          if (rawVal === undefined || rawVal === null || rawVal === '') {
            mapped[dbCol] = true;
          } else {
            const act = sanitizeStr(rawVal).toLowerCase();
            mapped[dbCol] = !(act === 'false' || act === '0' || act === 'inactive' || act === 'no');
          }
          return;
        }

        // 3. General string sanitization
        mapped[dbCol] = sanitizeStr(rawVal);
      }
    });

    // Default is_active to true if not mapped
    if (mapped.is_active === undefined) {
      mapped.is_active = true;
    }

    return mapped;
  }, []);

  // Generate preview dataset (first 50 rows for fast DOM rendering)
  const generatePreview = useCallback(
    (data, currentMapping) => {
      const previewSlice = data.slice(0, 50);
      const preview = previewSlice.map((row) => sanitizeMappedRow(row, currentMapping));
      setPreviewData(preview);
    },
    [sanitizeMappedRow]
  );

  // Multi-Format File Reader & Parser (.xlsx, .xls, .csv)
  const parseFile = useCallback(
    async (uploadedFile, targetSheetName = null) => {
      try {
        setErrors([]);
        const buffer = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, dense: true });

        const names = workbook.SheetNames || [];
        setSheetNames(names);

        const sheetToRead = targetSheetName || names[0] || 'Sheet1';
        setSelectedSheet(sheetToRead);

        const sheet = workbook.Sheets[sheetToRead];
        if (!sheet) {
          throw new Error(`Sheet "${sheetToRead}" not found in file.`);
        }

        // 1. Extract raw header strings from Row 1 of sheet
        const headerMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const rawRow0 = headerMatrix[0] || [];
        const cleanedHeaders = rawRow0
          .map((h) => String(h || '').replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u00A0]/g, '').trim())
          .filter(Boolean);

        // 2. Parse data rows to JSON array
        const rawJson = XLSX.utils.sheet_to_json(sheet, {
          raw: false,
          defval: '',
          blankrows: false,
        });

        // 3. Filter out completely blank rows
        const validRows = rawJson.filter((r) =>
          Object.values(r).some((v) => sanitizeStr(v) !== '')
        );

        if (validRows.length === 0 || cleanedHeaders.length === 0) {
          setErrors([
            {
              type: 'empty',
              message: 'No data records or headers found in the selected sheet.',
            },
          ]);
          setRawRows([]);
          setFileHeaders([]);
          setMapping({});
          return;
        }

        // 4. Normalize rows to have cleaned header keys
        const rawHeaderKeys = Object.keys(validRows[0] || {});
        const cleanedRows = validRows.map((row) => {
          const cleanRow = {};
          cleanedHeaders.forEach((h, idx) => {
            const originalKey = rawHeaderKeys[idx] || h;
            cleanRow[h] = row[originalKey] !== undefined ? row[originalKey] : row[h];
          });
          return cleanRow;
        });

        setRawRows(cleanedRows);
        setFileHeaders(cleanedHeaders);

        // 5. Intelligent Fuzzy Auto-Mapping
        const autoMapping = {};
        cleanedHeaders.forEach((fileCol) => {
          const matched = matchHeaderToColumn(fileCol, availableColumns);
          autoMapping[fileCol] = matched ? matched.key : 'skip';
        });

        setMapping(autoMapping);
        generatePreview(cleanedRows, autoMapping);
        setStep(2);
      } catch (err) {
        console.error('File parsing error:', err);
        setErrors([
          {
            type: 'parse',
            message: err.message || 'Failed to parse file. Please verify format and contents.',
          },
        ]);
      }
    },
    [availableColumns, generatePreview]
  );

  // Update a single column mapping
  const updateMapping = (fileCol, dbCol) => {
    const newMapping = { ...mapping, [fileCol]: dbCol };
    setMapping(newMapping);
    generatePreview(rawRows, newMapping);

    const mappedCols = Object.values(newMapping).filter((v) => v !== 'skip');
    const missing = requiredColumns.filter((req) => !mappedCols.includes(req));
    if (missing.length > 0) {
      setErrors([
        {
          type: 'required',
          message: `Missing required columns: ${missing.join(', ')}`,
        },
      ]);
    } else {
      setErrors([]);
    }
  };

  // Update cell in preview table
  const updatePreviewCell = (rowIndex, colKey, value) => {
    const nextPreview = [...previewData];
    nextPreview[rowIndex] = { ...nextPreview[rowIndex], [colKey]: value };
    setPreviewData(nextPreview);
  };

  // Prepare full sanitized dataset for import
  const prepareImportData = () => {
    const mappedCols = Object.values(mapping).filter((v) => v !== 'skip');
    const missing = requiredColumns.filter((req) => !mappedCols.includes(req));
    if (missing.length > 0) {
      setErrors([
        {
          type: 'required',
          message: `Missing required columns: ${missing.join(', ')}`,
        },
      ]);
      return null;
    }

    return rawRows.map((row, idx) => {
      const sanitized = sanitizeMappedRow(row, mapping);
      const previewOverride = previewData[idx];
      if (previewOverride) {
        return { ...sanitized, ...previewOverride };
      }
      return sanitized;
    });
  };

  // Execute import process
  const handleImport = async () => {
    const importData = prepareImportData();
    if (!importData || importData.length === 0) return;

    setImporting(true);
    setImportProgress(0);
    setImportStatus('processing');

    try {
      // Execute import handler
      await onImport(importData);
      setImportProgress(100);
      setImportStatus('success');

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      console.error('Import execution error:', err);
      setImportStatus('error');
      setErrors([
        {
          type: 'import',
          message: err.message || 'Import failed. Please review errors and try again.',
        },
      ]);
      setTimeout(() => setImportStatus('idle'), 4000);
    } finally {
      setImporting(false);
    }
  };

  // Reset modal state
  const resetState = () => {
    setStep(1);
    setFile(null);
    setSheetNames([]);
    setSelectedSheet('');
    setRawRows([]);
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

  const totalRecords = rawRows.length;
  const mappedCount = Object.values(mapping).filter((v) => v !== 'skip').length;
  const mappedKeys = Object.values(mapping);
  const missingRequired = requiredColumns.filter((req) => !mappedKeys.includes(req));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] h-[90vh] flex flex-col p-0">
        {/* Modal Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-primary" />
            Import Data
            {totalRecords > 0 && (
              <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {totalRecords.toLocaleString()} records
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload Excel (.xlsx, .xls) or CSV (.csv) file to import records in bulk.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 px-6 py-3 border-b bg-muted/20 shrink-0">
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Map Columns' },
            { num: 3, label: 'Preview & Import' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step >= s.num
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {s.num}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
              {idx < 2 && <div className="w-8 h-0.5 bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden px-6">
          {/* STEP 1: File Upload */}
          {step === 1 && (
            <div className="h-full overflow-y-auto py-6 space-y-4">
              <FileUploadArea
                onFileSelect={(selectedFile) => {
                  setFile(selectedFile);
                  parseFile(selectedFile);
                }}
                accept={accept}
                isProcessing={false}
                fileName={file?.name}
              />

              {sheetNames.length > 1 && (
                <div className="p-4 border rounded-xl bg-primary/5 border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Multiple Sheets Detected</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the worksheet containing the student data:
                  </p>
                  <Select
                    value={selectedSheet}
                    onValueChange={(val) => {
                      setSelectedSheet(val);
                      if (file) parseFile(file, val);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background text-xs h-9">
                      <SelectValue placeholder="Select sheet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetNames.map((name) => (
                        <SelectItem key={name} value={name} className="text-xs">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {errors.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors[0].message}</span>
                </div>
              )}

              {sampleData && (
                <div className="rounded-xl border p-3.5 bg-muted/20 mt-4">
                  <p className="text-xs font-semibold mb-2 text-foreground">Sample Structure</p>
                  <pre className="text-[11px] text-muted-foreground overflow-x-auto font-mono">
                    {JSON.stringify(sampleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 2 && (
            <div className="h-full overflow-y-auto py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Column Mapping</p>
                  <p className="text-xs text-muted-foreground">
                    Confirm how file headers correspond to database fields
                  </p>
                </div>
                <Badge
                  variant={missingRequired.length === 0 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {mappedCount} columns mapped
                </Badge>
              </div>

              {missingRequired.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-700 dark:text-amber-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Missing required fields:{' '}
                    <strong>
                      {missingRequired
                        .map((k) => availableColumns.find((c) => c.key === k)?.label || k)
                        .join(', ')}
                    </strong>
                  </span>
                </div>
              )}

              <div className="rounded-xl border overflow-hidden">
                <div className="p-3 bg-muted/40 border-b">
                  <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground">
                    <div>File Header</div>
                    <div />
                    <div>Target Schema Field</div>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y">
                  {fileHeaders.map((header) => (
                    <ColumnMappingRow
                      key={header}
                      fileCol={header}
                      dbCol={mapping[header]}
                      availableColumns={availableColumns}
                      onMap={(value) => updateMapping(header, value)}
                    />
                  ))}
                </div>
              </div>

              {requiredColumns.length > 0 && (
                <div className="rounded-xl border p-3 bg-muted/20">
                  <p className="text-xs font-semibold mb-2 text-foreground">Required Fields Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {requiredColumns.map((colKey) => {
                      const isMapped = mappedKeys.includes(colKey);
                      const colDef = availableColumns.find((c) => c.key === colKey);
                      return (
                        <Badge
                          key={colKey}
                          variant={isMapped ? 'default' : 'destructive'}
                          className="text-[11px] font-medium"
                        >
                          {colDef?.label || colKey}
                          {isMapped ? ' (mapped)' : ' (missing)'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preview & Import */}
          {step === 3 && (
            <div className="h-full flex flex-col py-4 gap-3">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">Preview Sanitized Data</p>
                  <p className="text-xs text-muted-foreground">
                    Review and double-click any cell to make live edits before importing
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Showing first {previewData.length} of {totalRecords.toLocaleString()} rows
                  </Badge>
                </div>
              </div>

              <div className="flex-1 min-h-0 border rounded-xl overflow-auto bg-card">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 sticky top-0">
                        {Object.keys(previewData[0] || {}).map((colKey) => {
                          const col = availableColumns.find((c) => c.key === colKey);
                          return (
                            <TableHead key={colKey} className="whitespace-nowrap text-xs py-2">
                              {col?.label || colKey}
                              {col?.required && <span className="ml-1 text-red-500">*</span>}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, rowIdx) => (
                        <TableRow key={rowIdx} className="hover:bg-muted/30">
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

              {/* Import Progress & Status */}
              {importing && (
                <div className="space-y-1.5 shrink-0 pt-2">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Importing... {Math.round(importProgress)}%
                  </p>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs shrink-0">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Import completed successfully!</span>
                </div>
              )}

              {importStatus === 'error' && errors.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs shrink-0">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors[errors.length - 1]?.message || 'Import failed'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="gap-2 px-6 py-4 border-t mt-auto shrink-0 bg-muted/10">
          {step > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={importing}
            >
              Back
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>

          {step === 1 && (
            <Button
              size="sm"
              onClick={() => setStep(2)}
              disabled={!file || rawRows.length === 0}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === 2 && (
            <Button
              size="sm"
              onClick={() => setStep(3)}
              disabled={missingRequired.length > 0}
            >
              Preview & Edit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === 3 && (
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing || missingRequired.length > 0}
              className="min-w-[140px]"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {totalRecords.toLocaleString()} Records
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
