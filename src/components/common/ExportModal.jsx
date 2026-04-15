
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
  
  // Professional PDF Generation
  // Professional PDF Generation (Tabular)
  async function generateProfessionalPDF(data, headers, orderedCols) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const orientation = pdfSettings.orientation;
    const doc = new jsPDF({ 
      orientation, 
      unit: 'mm',
      format: pdfSettings.paperSize,
      compress: true
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    let yPos = margin;
    
    // ============ HEADER SECTION ============
    
    // Logo and Institute Header
    const logoWidth = 25;
    const logoHeight = 18;
    let headerYPos = yPos;
    let headerHeight = 0;
    
    // Try to load and display logo
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = instituteInfo.logo;
        
        await Promise.race([
          new Promise((resolve) => {
            img.onload = () => {
              try {
                doc.addImage(img, 'PNG', margin, headerYPos + 3, logoWidth, logoHeight);
                headerHeight = Math.max(headerHeight, logoHeight + 6);
              } catch (e) {
                console.error('Error adding image:', e);
              }
              resolve();
            };
            img.onerror = resolve;
          }),
          new Promise((resolve) => setTimeout(resolve, 2000)) // Timeout after 2 seconds
        ]);
      } catch (err) {
        console.error('Logo loading error:', err);
      }
    }
    
    // Institute Info - Always display prominently
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    const logoOffsetX = pdfSettings.showLogo ? (logoWidth + 12) : 0;
    const instituteNameText = instituteInfo.name || 'The Clouds Academy';
    doc.text(instituteNameText, margin + logoOffsetX, headerYPos + 5);
    headerHeight = Math.max(headerHeight, 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    
    let infoYPos = headerYPos + 12;
    if (instituteInfo.address) {
      const addressText = instituteInfo.address + (instituteInfo.city ? ', ' + instituteInfo.city : '');
      doc.text(addressText, margin + logoOffsetX, infoYPos);
      infoYPos += 4;
      headerHeight = Math.max(headerHeight, 18);
    }
    if (instituteInfo.phone && instituteInfo.email) {
      doc.text(`${instituteInfo.phone} | ${instituteInfo.email}`, margin + logoOffsetX, infoYPos);
      headerHeight = Math.max(headerHeight, 22);
    } else if (instituteInfo.phone) {
      doc.text(`Phone: ${instituteInfo.phone}`, margin + logoOffsetX, infoYPos);
      headerHeight = Math.max(headerHeight, 22);
    } else if (instituteInfo.email) {
      doc.text(`Email: ${instituteInfo.email}`, margin + logoOffsetX, infoYPos);
      headerHeight = Math.max(headerHeight, 22);
    }
    
    yPos = headerYPos + headerHeight + 8;
    
    // Solid Divider Line
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(1.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    // ============ REPORT TITLE & INFO ============
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(fileName, margin, yPos);
    yPos += 5;
    
    // Report metadata - Two columns
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    // Left column
    let leftInfo = [];
    if (dateRange.from || dateRange.to) {
      let dateText = 'Period: ';
      if (dateRange.from) dateText += dateRange.from;
      if (dateRange.to) dateText += ` to ${dateRange.to}`;
      leftInfo.push(dateText);
    }
    leftInfo.forEach((text, i) => {
      doc.text(text, margin, yPos + (i * 3.5));
    });
    
    // Right column - Total Records
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    const recordsText = `Total Records: ${data.length}`;
    const recordsWidth = doc.getTextWidth(recordsText);
    doc.text(recordsText, pageWidth - margin - recordsWidth, yPos);
    
    // Generated timestamp
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 175);
    const generatedDate = new Date().toLocaleDateString('en-PK', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated: ${generatedDate}`, margin, yPos + 8);
    
    yPos += 12;
    
    // ============ DATA TABLE ============
    
    const tableHeaders = orderedCols.map(key => {
      const col = colDefs.find(c => c.key === key);
      const label = col?.label || key;
      return label.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });
    
    const tableBody = data.map(row => 
      orderedCols.map(key => {
        const val = row[key];
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (typeof val === 'object' && val !== null) return JSON.stringify(val).substring(0, 20) + '...';
        return String(val ?? '').substring(0, 50);
      })
    );
    
    // Calculate available width for table
    const availableWidth = pageWidth - (margin * 2);
    const numColumns = orderedCols.length;
    
    // Smart column width distribution
    const columnWidths = orderedCols.map(key => {
      // Smaller width for IDs, status, dates
      if (key.includes('id') || key === 'status' || key.includes('date')) {
        return 12;
      }
      // Medium width for amounts
      if (key.includes('amount') || key.includes('total') || key.includes('sum') || key.includes('fine')) {
        return 16;
      }
      // Larger width for names and descriptions
      if (key.includes('name') || key.includes('desc') || key.includes('title')) {
        return 28;
      }
      // Default width for other columns
      return 15;
    });
    
    // Adjust column widths to fit page if needed
    const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
    const scaleFactor = availableWidth / totalWidth;
    const scaledWidths = columnWidths.map(w => w * scaleFactor);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: yPos,
      margin: { top: margin, left: margin, right: margin, bottom: margin + 8 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: pdfSettings.fontSize,
        cellPadding: 2.5,
        valign: 'middle',
        halign: 'left',
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [51, 65, 85],
        overflow: 'linebreak',
      },
      columnStyles: Object.fromEntries(
        orderedCols.map((key, index) => {
          let halign = 'left';
          
          if (key.includes('amount') || key.includes('total') || key.includes('sum')) {
            halign = 'right';
          }
          if (key === 'status' || key.includes('status')) {
            halign = 'center';
          }
          if (key.includes('voucher') || key.includes('number') || key.includes('id')) {
            halign = 'center';
          }
          if (key.includes('date')) {
            halign = 'center';
          }
          
          return [index, { halign, cellWidth: scaledWidths[index] }];
        })
      ),
      headStyles: {
        fontStyle: 'bold',
        fontSize: pdfSettings.fontSize + 0.5,
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        halign: 'center',
        valign: 'middle',
        cellPadding: 4,
        lineColor: [51, 65, 85],
        lineWidth: 0.3,
      },
      alternateRowStyles: pdfSettings.tableStriped ? {
        fillColor: [248, 250, 252],
      } : {},
      bodyStyles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageWidth = pageSize.getWidth();
        
        // Footer divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8);
        
        // Page numbers
        if (pdfSettings.showPageNumbers) {
          const pageCount = doc.internal.getNumberOfPages();
          const pageNum = doc.internal.getPageInfo(doc.internal.getCurrentPageInfo().pageNumber).pageNumber;
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 175);
          doc.text(`Page ${pageNum} of ${pageCount}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
        }
        
        // Website footer
        if (pdfSettings.showFooter) {
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 175);
          doc.text(instituteInfo.website || 'www.thecloudsacademy.com', pageWidth / 2, pageHeight - margin - 1, { align: 'center' });
        }
      },
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

    // A4 Border
    doc.setDrawColor(30, 41, 59); // Slate-800
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

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
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59);
    doc.text(instituteInfo.name, 42, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${instituteInfo.address}, ${instituteInfo.city}`, 42, yPos + 16);
    doc.text(`Phone: ${instituteInfo.phone} | Email: ${instituteInfo.email}`, 42, yPos + 21);

    // Student Photo Box (Top Right)
    const photoX = pageWidth - margin - 35;
    const photoY = yPos;
    doc.setDrawColor(203, 213, 225); // Slate-200
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(photoX, photoY, 35, 40, 'FD');
    
    // Attempt to load student image
    const studentImageUrl = student.image || student.profile_image || student.profile_photo;
    if (studentImageUrl) {
      try {
        const simg = new Image();
        simg.crossOrigin = "Anonymous";
        simg.src = studentImageUrl;
        await new Promise((resolve) => {
          simg.onload = () => {
            doc.addImage(simg, 'JPEG', photoX + 1, photoY + 1, 33, 38);
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
      if (yPos > pageHeight - 40) {
        doc.addPage();
        doc.setDrawColor(30, 41, 59);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        yPos = 20;
      }

      // Section Header
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // Slate-700
      doc.text(title.toUpperCase(), margin + 3, yPos + 5.5);
      yPos += 8;

      // Draw Grid
      const rowHeight = 10;
      const colWidth = (pageWidth - (margin * 2)) / 3;
      
      doc.setFontSize(8);
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
        doc.text(item.label, x + 2, y + 4);
        
        // Value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(String(item.value || '—'), x + 2, y + 8);

        if (idx === items.length - 1) {
          yPos = y + rowHeight + 5;
        }
      });
    };

    const getVal = (id) => {
      const col = colDefs.find(c => c.key === id);
      const val = student[id] ?? (student.details?.[id]) ?? '—';
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
    doc.rect(margin, yPos, pageWidth - (margin * 2), 25);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text("Declaration: I hereby certify that the information provided above is correct to the best of my knowledge and system records.", margin + 5, yPos + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.text("System Administrator Signature:", margin + 5, yPos + 20);
    doc.line(margin + 58, yPos + 20, margin + 110, yPos + 20);
    
    doc.text("Date:", pageWidth - margin - 40, yPos + 20);
    doc.line(pageWidth - margin - 30, yPos + 20, pageWidth - margin - 5, yPos + 20);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Officially Document ID: STU-${student?.id || 'N/A'}-${Date.now()}`, margin, pageHeight - 12);
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

    // A4 Border
    doc.setDrawColor(26, 41, 66); // Dark Navy
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // ─── Background Status Watermark (Ghost Light) ───
    doc.saveGraphicsState();
    doc.setFontSize(100);
    doc.setFont('helvetica', 'bold');
    // Ultra light colors (barely visible to prevent obscuring text)
    if (status === 'PASS') {
      doc.setTextColor(250, 253, 251); 
    } else {
      doc.setTextColor(253, 250, 250); 
    }
    doc.text(status, pageWidth / 2, pageHeight / 2 + 20, {
      align: 'center',
      angle: 45,
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
    doc.text(instituteInfo.name, 42, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${instituteInfo.address}, ${instituteInfo.city}`, 42, yPos + 16);
    doc.text(`Website: ${instituteInfo.website} | Email: ${instituteInfo.email}`, 42, yPos + 21);

    doc.setFillColor(isPass ? 230 : 253, isPass ? 247 : 236, isPass ? 238 : 234);
    // Use standard rect if roundedRect is not available
    if (typeof doc.roundedRect === 'function') {
      doc.roundedRect(pageWidth - margin - 30, yPos + 5, 30, 8, 2, 2, 'F');
    } else {
      doc.rect(pageWidth - margin - 30, yPos + 5, 30, 8, 'F');
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPass ? 26 : 179, isPass ? 122 : 43, isPass ? 74 : 26);
    doc.text(status, pageWidth - margin - 15, yPos + 10.5, { align: 'center' });

    yPos += 35;

    // 2. Report Title
    doc.setFillColor(26, 41, 66);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("EXAMINATION RESULT CARD / GRADE SHEET", pageWidth / 2, yPos + 7, { align: 'center' });
    
    yPos += 18;

    // 3. Info Grid
    const drawGrid = (items) => {
      const colWidth = (pageWidth - (margin * 2)) / 2;
      const rowHeight = 10;
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
        doc.text(item.label, x + 3, y + 4);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 41, 66);
        doc.text(String(item.value || '—'), x + 3, y + 8);

        if (idx === items.length - 1) yPos = y + rowHeight + 10;
      });
    };

    const info = [
      { label: "STUDENT NAME", value: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || student?.name || '—' },
      { label: "ROLL NUMBER", value: student?.roll_number || student?.roll_no || '—' },
      { label: "REGISTRATION ID", value: student?.registration_no || '—' },
      { label: "CLASS / SECTION", value: `${exam?.class_name || '—'} (${exam?.section_name || '—'})` },
      { label: "EXAMINATION", value: exam?.name || exam?.title || '—' },
      { label: "DATE GENERATED", value: new Date().toLocaleDateString() },
    ];
    drawGrid(info);

    // 5. Stats Summary Cards
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;
    const cards = [
      { label: "TOTAL MARKS", value: exam?.total_marks || result?.total_marks || '0', color: [45, 106, 159] },
      { label: "MARKS OBTAINED", value: result?.total_marks_obtained || '0', color: [26, 122, 74] },
      { label: "PERCENTAGE", value: `${parseFloat(result?.percentage || 0).toFixed(1)}%`, color: [179, 106, 0] },
    ];

    cards.forEach((card, i) => {
      const x = margin + (i * (cardWidth + 5));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      if (typeof doc.roundedRect === 'function') {
        doc.roundedRect(x, yPos, cardWidth, 18, 2, 2, 'FD');
      } else {
        doc.rect(x, yPos, cardWidth, 18, 'FD');
      }
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184);
      doc.text(card.label, x + (cardWidth / 2), yPos + 6, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(card.color?.[0] || 0, card.color?.[1] || 0, card.color?.[2] || 0);
      doc.text(String(card.value ?? '0'), x + (cardWidth / 2), yPos + 14, { align: 'center' });
    });

    yPos += 28;

    // 5. Subject Table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 41, 66);
    doc.text("SUBJECT-WISE PERFORMANCE", margin, yPos);
    yPos += 4;

    const subjectMarks = Array.isArray(result?.subject_marks) ? result.subject_marks : [];
    let examSubjects = Array.isArray(exam?.subject_schedules) ? exam.subject_schedules : [];

    // Fallback: If exam schedule is not found, use subjects directly from the results
    if (examSubjects.length === 0 && subjectMarks.length > 0) {
      examSubjects = subjectMarks.map(m => ({
        subject_id: m.subject_id || m.id,
        subject_name: m.subject_name || m.subject?.name || "Subject",
        total_marks: m.total_marks || 100
      }));
    }

    const tableRows = examSubjects.map((subj, idx) => {
      const mark = subjectMarks.find(m => m.subject_id === subj.subject_id) || {};
      const total = subj?.total_marks || 0;
      const obtained = mark?.marks_obtained || 0;
      const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : '0.0';
      return [
        subj?.subject_name || '—',
        total,
        obtained,
        `${pct}%`,
        mark?.grade || '—'
      ];
    });

    try {
      autoTable(doc, {
        head: [['SUBJECT', 'TOTAL', 'OBTAINED', 'PERCENTAGE', 'GRADE']],
        body: tableRows,
        startY: yPos,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [26, 41, 66], halign: 'center' },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } catch (err) {
      console.warn("AutoTable failed", err);
      yPos += 20;
    }

    // 6. Summary Strip
    doc.setFillColor(26, 41, 66);
    if (typeof doc.roundedRect === 'function') {
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 15, 2, 2, 'F');
    } else {
      doc.rect(margin, yPos, pageWidth - (margin * 2), 15, 'F');
    }
    
    const sumWidth = (pageWidth - (margin * 2)) / 3;
    const summary = [
      { label: "GRADE", value: result?.grade || '—' },
      { label: "OVERALL SCORE", value: `${parseFloat(result?.percentage || 0).toFixed(1)}%` },
      { label: "OUTCOME", value: status }
    ];

    summary.forEach((s, i) => {
      const x = margin + (i * sumWidth);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(s.label, x + (sumWidth / 2), yPos + 5, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(s.value, x + (sumWidth / 2), yPos + 11, { align: 'center' });
    });

    yPos += 30;

    // 7. Signatures
    const sigWidth = (pageWidth - (margin * 2) - 40) / 2;
    doc.setDrawColor(148, 163, 184);
    if (typeof doc.setLineDashPattern === 'function') {
      doc.setLineDashPattern([1, 1], 0);
    }
    doc.line(margin + 10, yPos + 10, margin + 10 + sigWidth, yPos + 10);
    doc.line(pageWidth - margin - 10 - sigWidth, yPos + 10, pageWidth - margin - 10, yPos + 10);
    
    if (typeof doc.setLineDashPattern === 'function') {
      doc.setLineDashPattern([], 0);
    }
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("CLASS TEACHER", margin + 10 + (sigWidth / 2), yPos + 15, { align: 'center' });
    doc.text("HEAD OF INSTITUTE", pageWidth - margin - 10 - (sigWidth / 2), yPos + 15, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Officially issued document by ${instituteInfo.name} Management System`, pageWidth / 2, pageHeight - 12, { align: 'center' });
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
        // Detect Individual Export Mode OR Multi-Profile Mode
        if (fileName.includes('Profile')) {
          // IMPORTANT: Profiles need ALL data fields, not just the selected columns
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
        } else if (fileName.includes('GradeSheet')) {
          for (let i = 0; i < rows.length; i++) {
            if (i === 0) {
              doc = await generateGradeSheetPDF(rows[i]);
            } else {
              doc.addPage();
              await appendGradeSheetToDoc(doc, rows[i]);
            }
            setExportProgress(70 + Math.floor((i / rows.length) * 25));
          }
        } else {
          doc = await generateProfessionalPDF(filtered, headers, orderedCols);
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