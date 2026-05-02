
'use client';

/**
 * ExportModal — Enhanced Export with Professional PDF Generation
 * Features:
 * - Professional PDF with institute branding (logo, name, address)
 * - Date range picker with DatePickerField component
 * - Multiple export formats with preview
 * - Column selection with drag-drop reordering
 * - Export progress indicator
 * - Responsive and user-friendly UI
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileJson, FileSpreadsheet, FileText, File, Download, Calendar, 
  Columns, Loader2, CheckCircle2, AlertCircle, Printer, Eye,
  Settings, Layout, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import DatePickerField from './DatePickerField';
import { useForm } from 'react-hook-form';

// Drag & Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

const FORMAT_OPTIONS = [
  { value: 'csv',   label: 'CSV',   icon: FileText,        color: 'text-emerald-500', description: 'Comma separated values' },
  { value: 'json',  label: 'JSON',  icon: FileJson,        color: 'text-yellow-500',  description: 'Raw JSON data' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'text-green-600',   description: 'Microsoft Excel format' },
  { value: 'pdf',   label: 'PDF',   icon: File,            color: 'text-red-500',     description: 'Professional document' },
];

// PDF Configuration Options
const PDF_PAPER_SIZES = [
  { value: 'a4', label: 'A4', width: 210, height: 297 },
  { value: 'letter', label: 'Letter', width: 216, height: 279 },
  { value: 'legal', label: 'Legal', width: 216, height: 356 },
];

const PDF_ORIENTATIONS = [
  { value: 'portrait', label: 'Portrait', icon: '📄' },
  { value: 'landscape', label: 'Landscape', icon: '📄↔️' },
];

const PDF_FONT_SIZES = [
  { value: 8, label: 'Small (8pt)' },
  { value: 9, label: 'Normal (9pt)' },
  { value: 10, label: 'Medium (10pt)' },
  { value: 11, label: 'Large (11pt)' },
];

// function buildCols(columns = []) {
//   return columns
//     .map((c, index) => ({
//       key:   c.accessorKey ?? c.id ?? '',
//       label: typeof c.header === 'string' ? c.header : (c.accessorKey ?? c.id ?? ''),
//       originalIndex: index,
//     }))
//     .filter((c) => c.key && c.key !== 'select' && c.key !== 'actions');
// }

// BAAD — id bhi filter karo, aur better label fallback:
function buildCols(columns = []) {
  return columns
    .map((c, index) => ({
      key: c.accessorKey ?? c.id ?? '',
      label:
        typeof c.header === 'string'
          ? c.header
          : c.meta?.exportLabel   // ← optional: column mein meta.exportLabel daal sakte ho
          ?? c.accessorKey?.split('.').pop()  // nested key ka last part: "student.name" → "name"
          ?? c.id
          ?? '',
      originalIndex: index,
    }))
    .filter(
      (c) =>
        c.key &&
        c.key !== 'select' &&
        c.key !== 'actions' &&
        c.key !== '__select__'  // DataTable ka selection column
    );
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper to format date
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-PK', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ExportModal({
  open, onClose, columns = [], rows = [], fileName = 'export', dateField = null,
}) {
  const { user, institute } = useAuthStore();
  const [activeTab, setActiveTab] = useState('format');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('idle'); // idle, processing, success, error
  
  // Column state
  const colDefs = useMemo(() => buildCols(columns), [columns]);
  const [selectedCols, setSelectedCols] = useState(() => colDefs.map((c) => c.key));
  const [columnOrder, setColumnOrder] = useState(() => colDefs.map((c) => c.key));
  
  // Format state
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // PDF specific settings
  const [pdfSettings, setPdfSettings] = useState({
    paperSize: 'a4',
    orientation: 'portrait',
    fontSize: 9,
    showLogo: true,
    showFooter: true,
    showPageNumbers: true,
    includeTimestamp: true,
    colorTheme: 'primary',
    tableStriped: true,
    headerBackground: true,
  });
  
  // Form for date picker
  const { control, watch, reset } = useForm({
    defaultValues: {
      fromDate: '',
      toDate: '',
    }
  });
  
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  
  // Update date range when form values change
  useMemo(() => {
    setDateRange({ from: fromDate, to: toDate });
  }, [fromDate, toDate]);
  
  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Get institute info for PDF branding
  const instituteInfo = useMemo(() => ({
    name: institute?.name || user?.institute?.name || user?.school?.name || 'The Clouds Academy',
    logo: institute?.logo_url || user?.institute?.logo_url || null,
    address: institute?.address || user?.institute?.address || '',
    city: institute?.city || user?.institute?.city || '',
    phone: institute?.phone || user?.institute?.phone || '',
    email: institute?.email || user?.institute?.email || '',
    website: institute?.website || 'www.thecloudsacademy.com',
  }), [user, institute]);
  
  // Re-sync selected columns when columns prop changes
  useMemo(() => { 
    setSelectedCols(colDefs.map((c) => c.key));
    setColumnOrder(colDefs.map((c) => c.key));
  }, [colDefs]);
  
  function toggleCol(key) {
    setSelectedCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }
  
  function toggleAll() {
    setSelectedCols((prev) => 
      prev.length === colDefs.length ? [] : colDefs.map((c) => c.key)
    );
  }
  
  function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);
    }
  }
  
  function getFilteredRows() {
    let data = rows;
    if (dateField && (dateRange.from || dateRange.to)) {
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to   = dateRange.to ? new Date(dateRange.to + 'T23:59:59') : null;
      data = data.filter((row) => {
        const val = row[dateField];
        if (!val) return true;
        const d = new Date(val);
        if (from && d < from) return false;
        if (to   && d > to)   return false;
        return true;
      });
    }
    
    // Order columns according to drag-drop order
    const orderedCols = columnOrder.filter(key => selectedCols.includes(key));
    
    return data.map((row) => {
      const out = {};
      orderedCols.forEach((k) => { 
        // Find the original column definition to check for accessorFn
        const colDef = columns.find(c => (c.accessorKey ?? c.id) === k);
        
        if (colDef?.accessorFn) {
          out[k] = colDef.accessorFn(row) ?? '';
        } else if (colDef?.accessorKey) {
          // Handle nested keys like "details.phone"
          const keys = colDef.accessorKey.split('.');
          let val = row;
          for (const key of keys) {
            val = val?.[key];
          }
          out[k] = val ?? '';
        } else {
          out[k] = row[k] ?? ''; 
        }
      });
      return out;
    });
  }
  
  // Professional PDF Generation (Tabular) — with smart orientation & auto-scaling
  async function generateProfessionalPDF(data, headers, orderedCols, orientationOverride) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    // Use override orientation if provided (smart landscape for many columns)
    const orientation = orientationOverride || (orderedCols.length >= 8 ? 'l' : 'p');
    const doc = new jsPDF({ 
      orientation, 
      unit: 'mm',
      format: pdfSettings.paperSize,
      compress: true
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = margin;

    // Auto-scale: reduce font size when there are many columns
    const colCount = orderedCols.length;
    let tableFontSize = pdfSettings.fontSize;
    let headerFontSize = pdfSettings.fontSize;
    let cellPad = { top: 3, right: 2, bottom: 3, left: 2 };
    
    if (colCount >= 12) {
      tableFontSize = 5.5;
      headerFontSize = 5.5;
      cellPad = { top: 1.5, right: 1, bottom: 1.5, left: 1 };
    } else if (colCount >= 10) {
      tableFontSize = 6.5;
      headerFontSize = 6.5;
      cellPad = { top: 2, right: 1.5, bottom: 2, left: 1.5 };
    } else if (colCount >= 7) {
      tableFontSize = 7.5;
      headerFontSize = 7.5;
      cellPad = { top: 2.5, right: 1.5, bottom: 2.5, left: 1.5 };
    }
    
    // ============ BRANDING & HEADER SECTION ============
    
    // Header background
    if (pdfSettings.headerBackground) {
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, 40, 'F');
    }

    const logoSize = orientation === 'l' ? 18 : 20;
    
    // 1. Logo
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = instituteInfo.logo;
        
        await new Promise((resolve) => {
          img.onload = () => {
            try {
              const ratio = img.width / img.height;
              const w = ratio >= 1 ? logoSize : logoSize * ratio;
              const h = ratio >= 1 ? logoSize / ratio : logoSize;
              doc.addImage(img, 'PNG', margin, yPos, w, h);
            } catch (e) {}
            resolve();
          };
          img.onerror = resolve;
          setTimeout(resolve, 1500);
        });
      } catch (err) {}
    }
    
    // 2. Institute Info
    const textStartX = pdfSettings.showLogo ? margin + logoSize + 5 : margin;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(orientation === 'l' ? 15 : 18);
    doc.setTextColor(30, 41, 59);
    doc.text(instituteInfo.name?.toUpperCase() || 'THE CLOUDS ACADEMY', textStartX, yPos + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(orientation === 'l' ? 8 : 9);
    doc.setTextColor(71, 85, 105);
    
    let infoY = yPos + 11;
    if (instituteInfo.address) {
      doc.text(instituteInfo.address, textStartX, infoY);
      infoY += 4;
    }
    if (instituteInfo.phone || instituteInfo.email) {
      const contactInfo = [instituteInfo.phone, instituteInfo.email].filter(Boolean).join('  |  ');
      doc.text(contactInfo, textStartX, infoY);
    }

    // 3. Right Side - Report Badge & Date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    const catText = 'OFFICIAL REPORT';
    const catWidth = doc.getTextWidth(catText);
    doc.text(catText, pageWidth - margin - catWidth, yPos + 6);
    
    // Removed Printed Date

    yPos = 40;
    
    // Accent Line
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 7;
    
    // ============ REPORT TITLE & COUNT ============
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(fileName.toUpperCase(), margin, yPos);
    
    // Total Count Badge
    const countText = `RECORDS: ${data.length}`;
    doc.setFontSize(7.5);
    const countW = doc.getTextWidth(countText) + 6;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(pageWidth - margin - countW, yPos - 4, countW, 6, 1, 1, 'F');
    doc.setTextColor(71, 85, 105);
    doc.text(countText, pageWidth - margin - countW + 3, yPos - 0.5);
    
    yPos += 6;
    
    // Date Range Info
    if (dateRange.from || dateRange.to) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date Range: ${dateRange.from || 'Beginning'} — ${dateRange.to || 'Today'}`, margin, yPos);
      yPos += 5;
    }
    
    yPos += 2;
    
    // ============ TABLE SECTION ============
    
    // Filter out "Archived" if colCount is very high to save space
    const finalHeaders = [];
    const finalCols = [];
    headers.forEach((h, i) => {
      if (colCount >= 12 && h.toUpperCase() === 'ARCHIVED') return;
      finalHeaders.push(h.toUpperCase());
      finalCols.push(orderedCols[i]);
    });

    const tableBody = data.map(row => 
      finalCols.map(key => {
        const val = row[key];
        if (typeof val === 'boolean') return val ? 'YES' : 'NO';
        return String(val ?? '').trim();
      })
    );

    // Smart column widths: give more space to name/text columns, less to numeric
    const columnStyles = {};
    finalCols.forEach((key, i) => {
      const k = key.toLowerCase();
      if (k.includes('amount') || k.includes('fee') || k.includes('fine') || k.includes('net') || k.includes('discount')) {
        columnStyles[i] = { halign: 'right', cellWidth: 'auto' };
      } else if (k === 'status' || k === 'archived' || k === 'year' || k === 'month') {
        columnStyles[i] = { halign: 'center', cellWidth: 'auto' };
      } else if (k.includes('date')) {
        columnStyles[i] = { halign: 'center', cellWidth: 'auto' };
      } else if (k.includes('name') || k.includes('student')) {
        columnStyles[i] = { halign: 'left', cellWidth: 'auto' };
      } else {
        columnStyles[i] = { cellWidth: 'auto' };
      }
    });
    
    autoTable(doc, {
      head: [finalHeaders],
      body: tableBody,
      startY: yPos,
      margin: { left: margin, right: margin, bottom: 15 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: tableFontSize,
        cellPadding: cellPad,
        valign: 'middle',
        halign: 'left',
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        textColor: [51, 65, 85],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: headerFontSize,
        halign: 'center',
        cellPadding: cellPad,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles,
      didDrawPage: (d) => {
        const pageCount = doc.internal.getNumberOfPages();
        const currPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        
        // Footer line
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
        
        doc.text(`Page ${currPage} of ${pageCount}`, margin, pageHeight - 7);
        
        const brandText = `${instituteInfo.website}  |  Generated by The Clouds Academy ERP`;
        const brandW = doc.getTextWidth(brandText);
        doc.text(brandText, pageWidth - margin - brandW, pageHeight - 7);
      }
    });
    
    return doc;
  }

  // Segmented Profile PDF for Individual Export
  async function generateProfilePDF(student, headers, orderedCols) {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm',
      format: 'a4' 
    });
    await appendProfileToDoc(doc, student, headers, orderedCols);
    return doc;
  }

  async function appendProfileToDoc(doc, student, headers, orderedCols) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;

    // A4 Border - Double line for premium feel
    doc.setDrawColor(30, 41, 59); // Slate-800
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    doc.setLineWidth(0.1);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

    // 1. Official Header
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image();
        img.src = instituteInfo.logo;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', margin, yPos, 22, 22);
            resolve();
          };
          img.onerror = resolve;
          if (img.complete) img.onload();
        });
      } catch (err) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(instituteInfo.name?.toUpperCase(), 42, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${instituteInfo.address}, ${instituteInfo.city}`, 42, yPos + 16);
    doc.text(`Phone: ${instituteInfo.phone} | Email: ${instituteInfo.email}`, 42, yPos + 21);

    // Student Photo Box (Top Right)
    const photoX = pageWidth - margin - 35;
    const photoY = yPos;
    doc.setDrawColor(71, 85, 105);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(photoX, photoY, 35, 40, 1, 1, 'FD');
    
    // Attempt to load student image
    const studentImageUrl = student.image || student.profile_image || student.profile_photo || student.details?.studentDetails?.image;
    if (studentImageUrl) {
      try {
        const simg = new Image();
        simg.crossOrigin = "Anonymous";
        simg.src = studentImageUrl;
        await new Promise((resolve) => {
          simg.onload = () => {
            doc.addImage(simg, 'JPEG', photoX + 1.5, photoY + 1.5, 32, 37);
            resolve();
          };
          simg.onerror = resolve;
          if (simg.complete) simg.onload();
        });
      } catch(e) {
        doc.setFontSize(8);
        doc.text("PHOTO", photoX + 17.5, photoY + 22, { align: 'center' });
      }
    } else {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("STUDENT", photoX + 17.5, photoY + 18, { align: 'center' });
      doc.text("PHOTO", photoX + 17.5, photoY + 23, { align: 'center' });
    }

    yPos += 30;

    // 2. Form Title
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, yPos, pageWidth - (margin * 2) - 40, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("STUDENT ADMISSION & RECORD FORM", margin + 5, yPos + 7);
    
    yPos += 18;

    // Helper to draw boxed entries
    const drawFormSection = (title, items) => {
      if (yPos > pageHeight - 45) {
        doc.addPage();
        doc.setDrawColor(30, 41, 59);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        yPos = 20;
      }

      // Section Header
      doc.setFillColor(79, 70, 229); // Indigo-600
      doc.rect(margin, yPos, pageWidth - (margin * 2), 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), margin + 3, yPos + 5);
      yPos += 7;

      // Draw Grid
      const rowHeight = 9;
      const colWidth = (pageWidth - (margin * 2)) / 3;
      
      doc.setFontSize(7.5);
      items.forEach((item, idx) => {
        const colIdx = idx % 3;
        const rowIdx = Math.floor(idx / 3);
        const x = margin + (colIdx * colWidth);
        const y = yPos + (rowIdx * rowHeight);

        // Box
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.rect(x, y, colWidth, rowHeight);
        
        // Label
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(String(item.label || '').toUpperCase(), x + 2, y + 3.5);
        
        // Value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(String(item.value || '—'), x + 2, y + 7.5);

        if (idx === items.length - 1) {
          yPos = y + rowHeight + 5;
        }
      });
    };

    const getVal = (id) => {
      const col = colDefs.find(c => c.key === id);
      const val = student[id] ?? (student.details?.[id]) ?? (student.details?.studentDetails?.[id]) ?? '—';
      return { label: col?.label || id, value: val };
    };

    // Data Segments
    const personal = ['name', 'roll_no', 'reg_no', 'gender', 'dob', 'cnic', 'admission_date', 'nationality', 'religion'].map(getVal);
    const academic = ['academic_year', 'class', 'section', 'previous_school', 'previous_class', 'status'].map(getVal);
    const contact = ['phone', 'email', 'city', 'country', 'address', 'permanent_address'].map(getVal);
    const family = ['primary_guardian', 'guardian_relation', 'guardian_phone', 'mother_name', 'guardian_cnic', 'guardian_occupation'].map(getVal);
    const finance = ['monthly_fee', 'admission_fee', 'concession_type', 'concession_p'].map(getVal);

    drawFormSection("I. Personal Identification", personal);
    drawFormSection("II. Enrollment & Academic Details", academic);
    drawFormSection("III. Contact & Residential Info", contact);
    drawFormSection("IV. Parental & Guardian Information", family);
    drawFormSection("V. Financial & Concession Summary", finance);

    // Certification Box
    if (yPos > pageHeight - 50) { doc.addPage(); doc.rect(5, 5, pageWidth - 10, pageHeight - 10); yPos = 20; }
    
    yPos += 5;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(252, 253, 255);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 1, 1, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Declaration: I hereby certify that the information provided above is correct and matches the official system records.", margin + 5, yPos + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text("System Administrator Signature:", margin + 5, yPos + 20);
    doc.line(margin + 58, yPos + 20, margin + 110, yPos + 20);
    
    doc.text("Date:", pageWidth - margin - 40, yPos + 20);
    doc.line(pageWidth - margin - 30, yPos + 20, pageWidth - margin - 5, yPos + 20);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Official Document ID: STU-${student?.id || 'N/A'}-${Date.now().toString().slice(-6)}`, margin, pageHeight - 12);
    doc.text(`Printed By: The Clouds Academy ERP System`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`www.thecloudsacademy.com`, pageWidth - margin, pageHeight - 12, { align: 'right' });
  }

  // Segmented Grade Sheet PDF for Examination results
  async function generateGradeSheetPDF(data) {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm',
      format: 'a4' 
    });
    await appendGradeSheetToDoc(doc, data);
    return doc;
  }

  async function appendGradeSheetToDoc(doc, data) {
    const { default: autoTable } = await import('jspdf-autotable');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;

    const student = data.student || {};
    const exam = data.exam || {};
    const result = data.result || {};
    const status = (result?.status || 'ABSENT').toUpperCase();
    const isPass = status === 'PASS';

    // A4 Border - Double line for premium feel
    doc.setDrawColor(26, 41, 66); // Dark Navy
    doc.setLineWidth(0.6);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    doc.setLineWidth(0.1);
    doc.rect(6.5, 6.5, pageWidth - 13, pageHeight - 13);

    // ─── Status Watermark ───
    doc.saveGraphicsState();
    doc.setFontSize(80);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPass ? 240 : 253, isPass ? 249 : 240, isPass ? 245 : 240); 
    doc.text(status, pageWidth / 2, pageHeight / 2 + 10, {
      align: 'center',
      angle: 35,
    });
    doc.restoreGraphicsState();

    // 1. Official Header
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image();
        img.src = instituteInfo.logo;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', margin, yPos, 22, 22);
            resolve();
          };
          img.onerror = resolve;
          if (img.complete) img.onload();
        });
      } catch (err) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(26, 41, 66);
    doc.text(instituteInfo.name?.toUpperCase(), 42, yPos + 10);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${instituteInfo.address}, ${instituteInfo.city}`, 42, yPos + 16);
    doc.text(`Phone: ${instituteInfo.phone} | Email: ${instituteInfo.email}`, 42, yPos + 21);

    // Outcome Badge
    doc.setFillColor(isPass ? 230 : 254, isPass ? 245 : 242, isPass ? 241 : 242);
    doc.roundedRect(pageWidth - margin - 35, yPos + 5, 35, 10, 1.5, 1.5, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPass ? 22 : 190, isPass ? 101 : 18, isPass ? 52 : 18);
    doc.text(status, pageWidth - margin - 17.5, yPos + 11.5, { align: 'center' });

    yPos += 35;

    // 2. Report Title
    doc.setFillColor(26, 41, 66);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL PERFORMANCE GRADE SHEET", pageWidth / 2, yPos + 7, { align: 'center' });
    
    yPos += 18;

    // 3. Info Grid
    const drawGrid = (items) => {
      const colWidth = (pageWidth - (margin * 2)) / 2;
      const rowHeight = 9;
      doc.setFontSize(8);
      items.forEach((item, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);
        const x = margin + (colIdx * colWidth);
        const y = yPos + (rowIdx * rowHeight);

        doc.setDrawColor(226, 232, 240);
        doc.rect(x, y, colWidth, rowHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, x + 3, y + 3.5);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 41, 66);
        doc.text(String(item.value || '—'), x + 3, y + 7.5);

        if (idx === items.length - 1) yPos = y + rowHeight + 10;
      });
    };

    const info = [
      { label: "CANDIDATE NAME", value: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || student?.name || '—' },
      { label: "ROLL NUMBER", value: student?.roll_number || student?.roll_no || student?.details?.studentDetails?.roll_no || '—' },
      { label: "REGISTRATION ID", value: student?.registration_no || student?.details?.studentDetails?.registration_no || '—' },
      { label: "ACADEMIC CLASS", value: `${exam?.class_name || '—'} (${exam?.section_name || '—'})` },
      { label: "EXAM TITLE", value: exam?.name || exam?.title || '—' },
    ];
    drawGrid(info);

    // 4. Statistics
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;
    const cards = [
      { label: "TOTAL MARKS", value: exam?.total_marks || result?.total_marks || '0', color: [26, 41, 66] },
      { label: "OBTAINED", value: result?.total_marks_obtained || result?.marks_obtained || '0', color: [21, 128, 61] },
      { label: "PERCENTAGE", value: `${parseFloat(result?.percentage || 0).toFixed(1)}%`, color: [194, 65, 12] },
    ];

    cards.forEach((card, i) => {
      const x = margin + (i * (cardWidth + 5));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, yPos, cardWidth, 18, 1, 1, 'FD');
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184);
      doc.text(card.label, x + (cardWidth / 2), yPos + 6, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(card.color?.[0], card.color?.[1], card.color?.[2]);
      doc.text(String(card.value ?? '0'), x + (cardWidth / 2), yPos + 14, { align: 'center' });
    });

    yPos += 28;

    // 5. Subject Table
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 41, 66);
    doc.text("DETAILED SUBJECT ANALYSIS", margin, yPos);
    yPos += 4;

    const subjectMarks = Array.isArray(result?.subject_marks) ? result.subject_marks : [];
    let examSubjects = Array.isArray(exam?.subject_schedules) ? exam.subject_schedules : [];

    if (examSubjects.length === 0 && subjectMarks.length > 0) {
      examSubjects = subjectMarks.map(m => ({
        subject_id: m.subject_id || m.id,
        subject_name: m.subject_name || m.subject?.name || "Subject",
        total_marks: m.total_marks || 100
      }));
    }

    const tableRows = examSubjects.map((subj) => {
      const mark = subjectMarks.find(m => m.subject_id === subj.subject_id) || {};
      const total = subj?.total_marks || 0;
      const obtained = mark?.marks_obtained || 0;
      const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : '0.0';
      return [
        (subj?.subject_name || '—').toUpperCase(),
        total,
        obtained,
        `${pct}%`,
        mark?.grade || '—'
      ];
    });

    autoTable(doc, {
      head: [['SUBJECT TITLE', 'MAX', 'OBT', 'PERC', 'GRADE']],
      body: tableRows,
      startY: yPos,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center' },
      headStyles: { fillColor: [26, 41, 66], halign: 'center', fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 70 } },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });
    
    yPos = doc.lastAutoTable.finalY + 12;

    // 6. Signature Area
    const footerY = pageHeight - 35;
    if (yPos > footerY - 10) { 
      doc.addPage(); 
      yPos = 30; 
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // Standard border if new page
    }

    const sigLineY = pageHeight - 25;
    const sigLineW = (pageWidth - (margin * 2) - 40) / 2;
    
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    
    // Left Line
    doc.line(margin + 10, sigLineY, margin + 10 + sigLineW, sigLineY);
    // Right Line
    doc.line(pageWidth - margin - 10 - sigLineW, sigLineY, pageWidth - margin - 10, sigLineY);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    
    // Centered labels under lines
    doc.text("CLASS TEACHER", margin + 10 + (sigLineW / 2), sigLineY + 5, { align: 'center' });
    doc.text("CONTROLLER OF EXAMINATIONS", pageWidth - margin - 10 - (sigLineW / 2), sigLineY + 5, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`This is a computer generated grade sheet and does not require a physical signature for system validation.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`${instituteInfo.website}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }
  

  // --- FEE HISTORY PDF ---
  async function generateFeeHistoryPDF(data) {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    await appendFeeHistoryToDoc(doc, data);
    return doc;
  }

  async function appendFeeHistoryToDoc(doc, data) {
    const { default: autoTable } = await import('jspdf-autotable');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;

    // Branding
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image(); img.src = instituteInfo.logo;
        await new Promise(r => { img.onload = () => { doc.addImage(img, 'PNG', margin, yPos, 20, 20); r(); }; img.onerror = r; if(img.complete) img.onload(); });
      } catch(e) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(instituteInfo.name?.toUpperCase(), 40, yPos + 8);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`STUDENT FEE STATEMENT & HISTORY`, 40, yPos + 14);

    yPos += 30;

    // Student Box
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name || 'Student Name', margin + 5, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Reg No: ${data.registration_no || '—'}`, margin + 5, yPos + 13);
    doc.text(`Class: ${data.class_name || '—'} (${data.section_name || '—'})`, margin + 5, yPos + 18);

    // Right side of student box
    doc.text(`Roll No: ${data.roll_no || '—'}`, pageWidth - margin - 5, yPos + 7, { align: 'right' });
    doc.text(`Father: ${data.father_name || '—'}`, pageWidth - margin - 5, yPos + 13, { align: 'right' });
    doc.text(`Phone: ${data.phone || '—'}`, pageWidth - margin - 5, yPos + 18, { align: 'right' });

    yPos += 30;

    // Summary Cards
    const summary = data.fee_summary || {};
    const cardW = (pageWidth - (margin * 2)) / 3;
    const cards = [
      { label: "TOTAL PAYABLE", value: summary.total_net_amount || '0.00', color: [30, 41, 59] },
      { label: "TOTAL PAID", value: (summary.status_breakdown_formatted?.paid?.split('(')[1]?.replace(')', '') || '0.00'), color: [16, 185, 129] },
      { label: "BALANCE DUE", value: (parseFloat(summary.total_net_amount_raw || 0) - parseFloat(summary.paid_amount_raw || 0)).toFixed(2), color: [239, 68, 68] }
    ];

    cards.forEach((c, i) => {
      const x = margin + (i * cardW);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x + 1, yPos, cardW - 2, 18, 1, 1, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, x + (cardW / 2), yPos + 6, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(String(c.value), x + (cardW / 2), yPos + 13, { align: 'center' });
    });

    yPos += 28;

    // Table
    const records = data.fee_records || [];
    autoTable(doc, {
      startY: yPos,
      head: [['VOUCHER', 'MONTH/YEAR', 'AMOUNT', 'DISCOUNT', 'NET', 'STATUS', 'DUE DATE']],
      body: records.map(r => [
        r.voucher_number || '—',
        `${r.month}/${r.year}`,
        r.amount || '—',
        r.discount || '—',
        r.net_amount || '—',
        (r.status || '—').toUpperCase(),
        r.due_date || '—'
      ]),
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' }
      }
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Statement generated by The Clouds Academy ERP. For any queries, contact administration.`, margin, pageHeight - 12);
  }

  async function handleExport() {
    if (!selectedCols.length) return;
    
    setExporting(true);
    setExportProgress(0);
    setExportStatus('processing');
    
    try {
      const filtered = getFilteredRows();
      const orderedCols = columnOrder.filter(key => selectedCols.includes(key));
      const headers = orderedCols.map(key => {
        const col = colDefs.find(c => c.key === key);
        return col?.label || key;
      });
      
      setExportProgress(30);
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${fileName}.json`);
      }
      else if (format === 'csv') {
        const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows2d = filtered.map((row) => orderedCols.map((k) => escape(row[k])).join(','));
        const csv = [headers.map((h) => escape(h)).join(','), ...rows2d].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${fileName}.csv`);
      }
      else if (format === 'excel') {
        setExportProgress(50);
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(filtered);
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }
      else if (format === 'pdf') {
        setExportProgress(70);
        let doc;

        // 1. Individual Student Profile (flag-based detection)
        if (rows[0]?._isProfile) {
          const fullHydratedData = rows.map(row => {
            const out = {};
            columns.forEach(col => {
              const k = col.accessorKey ?? col.id;
              if (col.accessorFn) out[k] = col.accessorFn(row) ?? '';
              else if (col.accessorKey) {
                const keys = col.accessorKey.split('.');
                let v = row;
                for (const key of keys) v = v?.[key];
                out[k] = v ?? '';
              } else out[k] = row[k] ?? '';
            });
            return out;
          });

          for (let i = 0; i < fullHydratedData.length; i++) {
            if (i === 0) {
              doc = await generateProfilePDF(fullHydratedData[i], headers, orderedCols);
            } else {
              doc.addPage();
              await appendProfileToDoc(doc, fullHydratedData[i], headers, orderedCols);
            }
            setExportProgress(70 + Math.floor((i / fullHydratedData.length) * 25));
          }

        // 2. Grade Sheet
        } else if (rows[0]?._isGradeSheet) {
          for (let i = 0; i < rows.length; i++) {
            if (i === 0) {
              doc = await generateGradeSheetPDF(rows[i]);
            } else {
              doc.addPage();
              await appendGradeSheetToDoc(doc, rows[i]);
            }
            setExportProgress(70 + Math.floor((i / rows.length) * 25));
          }

        // 3. Fee History Statement
        } else if (rows[0]?._isFeeHistory) {
          for (let i = 0; i < rows.length; i++) {
            if (i === 0) {
              doc = await generateFeeHistoryPDF(rows[i]);
            } else {
              doc.addPage();
              await appendFeeHistoryToDoc(doc, rows[i]);
            }
            setExportProgress(70 + Math.floor((i / rows.length) * 25));
          }

        // 4. Tabular report — auto landscape for many columns
        } else {
          // Smart orientation: force landscape when 7+ columns
          const smartOrientation = orderedCols.length >= 7 ? 'landscape' : pdfSettings.orientation;
          doc = await generateProfessionalPDF(filtered, headers, orderedCols, smartOrientation);
        }
        doc.save(`${fileName}.pdf`);
      }
      
      setExportProgress(100);
      setExportStatus('success');
      
      setTimeout(() => {
        onClose();
        reset();
      }, 1000);
      
    } catch (err) {
      console.error('Export error', err);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  }
  
  const totalRows = getFilteredRows().length;
  
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
            <Badge variant="secondary" className="ml-2">
              {rows.length} records
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format" className="flex items-center gap-2">
              <File className="h-4 w-4" /> Format
            </TabsTrigger>
            <TabsTrigger value="columns" className="flex items-center gap-2">
              <Columns className="h-4 w-4" /> Columns
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[1000px] pr-4">
            {/* Format Tab */}
            <TabsContent value="format" className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FORMAT_OPTIONS.map(({ value, label, icon: Icon, color, description }) => (
                    <button
                      key={value}
                      onClick={() => setFormat(value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                        format === value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("h-8 w-8", format === value ? "text-primary" : color)} />
                      <span className="font-medium text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* PDF Settings (only shown when PDF is selected) */}
              {format === 'pdf' && (
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium">PDF Document Settings</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Paper Size</Label>
                      <Select
                        value={pdfSettings.paperSize}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, paperSize: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PDF_PAPER_SIZES.map(size => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Orientation</Label>
                      <Select
                        value={pdfSettings.orientation}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, orientation: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PDF_ORIENTATIONS.map(orient => (
                            <SelectItem key={orient.value} value={orient.value}>
                              {orient.icon} {orient.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Font Size</Label>
                      <Select
                        value={String(pdfSettings.fontSize)}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, fontSize: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PDF_FONT_SIZES.map(size => (
                            <SelectItem key={size.value} value={String(size.value)}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Color Theme</Label>
                      <Select
                        value={pdfSettings.colorTheme}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, colorTheme: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary (Indigo)</SelectItem>
                          <SelectItem value="secondary">Secondary (Green)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.showLogo}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, showLogo: v })}
                      />
                      Show Institute Logo
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.showFooter}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, showFooter: v })}
                      />
                      Show Footer
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.showPageNumbers}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, showPageNumbers: v })}
                      />
                      Show Page Numbers
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.tableStriped}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, tableStriped: v })}
                      />
                      Striped Rows
                    </label>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Columns Tab with Drag & Drop */}
            <TabsContent value="columns" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Columns className="h-4 w-4" /> Select & Order Columns
                </Label>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedCols.length === colDefs.length ? 'Deselect all' : 'Select all'}
                </Button>
              </div>
              
              <div className="rounded-lg border bg-muted/20 p-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={columnOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {columnOrder.map((key) => {
                        const col = colDefs.find(c => c.key === key);
                        if (!col) return null;
                        return (
                          <SortableItem key={key} id={key}>
                            <div className="flex items-center gap-2 p-2 bg-background rounded border">
                              <Checkbox
                                id={`col-${key}`}
                                checked={selectedCols.includes(key)}
                                onCheckedChange={() => toggleCol(key)}
                              />
                              <Label 
                                htmlFor={`col-${key}`} 
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {col.label}
                              </Label>
                              <div className="cursor-move text-muted-foreground">⋮⋮</div>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {selectedCols.length} of {colDefs.length} columns selected • Drag to reorder
              </p>
            </TabsContent>
            
            {/* Settings Tab with Date Picker */}
            <TabsContent value="settings" className="space-y-5 mt-4">
              {dateField && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Date Range Filter
                    <Badge variant="outline" className="text-xs">optional</Badge>
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <DatePickerField
                      label="From Date"
                      name="fromDate"
                      control={control}
                      placeholder="Select start date"
                    />
                    <DatePickerField
                      label="To Date"
                      name="toDate"
                      control={control}
                      placeholder="Select end date"
                    />
                  </div>
                  
                  {(dateRange.from || dateRange.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        reset({ fromDate: '', toDate: '' });
                        setDateRange({ from: '', to: '' });
                      }}
                      className="text-xs"
                    >
                      Clear date range
                    </Button>
                  )}
                </div>
              )}
              
              {/* Preview Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Preview</Label>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Records to export:</span>
                    <Badge variant="secondary">{totalRows} rows</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected columns:</span>
                    <Badge variant="secondary">{selectedCols.length} columns</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">File format:</span>
                    <Badge variant="outline">{format.toUpperCase()}</Badge>
                  </div>
                  {format === 'pdf' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">PDF Settings:</span>
                      <Badge variant="outline">
                        {pdfSettings.paperSize.toUpperCase()} • {pdfSettings.orientation}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Progress Bar */}
        {exporting && exportStatus === 'processing' && (
          <div className="space-y-2 mt-4">
            <Progress value={exportProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Exporting... {exportProgress}%
            </p>
          </div>
        )}
        
        {/* Success/Error Message */}
        {exportStatus === 'success' && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Export completed successfully!</span>
          </div>
        )}
        
        {exportStatus === 'error' && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Export failed. Please try again.</span>
          </div>
        )}
        
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exporting || !selectedCols.length}
            className="min-w-[100px]"
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}