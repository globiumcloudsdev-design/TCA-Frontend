import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, getDaysInMonth, getDay } from 'date-fns';
import * as XLSX from 'xlsx';

/**
 * Helper to safely load institute logo
 */
const loadLogo = async (url) => {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

/**
 * Generate Blank Monthly Attendance Register PDF (Landscape A4)
 */
export const generateMonthlyAttendanceSheetPDF = async ({
  students = [],
  className = 'All Classes',
  sectionName = '',
  academicYearName = '',
  month = format(new Date(), 'yyyy-MM'),
  institute = {},
  action = 'download', // 'download' | 'blob' | 'print'
}) => {
  const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  const usableWidth = pageWidth - margin * 2; // 277mm

  const primaryColor = [15, 23, 42]; // slate-900
  const secondaryColor = [71, 85, 105]; // slate-600
  const lightBg = [248, 250, 252]; // slate-50
  const weekendBg = [241, 245, 249]; // slate-100
  const borderColor = [203, 213, 225]; // slate-300

  // Parse Month & Year
  const [yearStr, monthStr] = (month || format(new Date(), 'yyyy-MM')).split('-');
  const selectedDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const formattedMonthName = format(selectedDate, 'MMMM yyyy');
  const daysInMonth = getDaysInMonth(selectedDate);

  // Logo
  const logoImg = await loadLogo(institute?.logo_url || institute?.logo);
  const instituteName = institute?.name || 'THE CLOUDS ACADEMY';

  // ── HEADER ──
  let headerY = margin + 2;
  if (logoImg) {
    try {
      doc.addImage(logoImg, 'PNG', margin, headerY, 18, 18);
    } catch {
      // Fallback if image fails
    }
  }

  const textStartX = logoImg ? margin + 22 : margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(instituteName.toUpperCase(), textStartX, headerY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('BLANK STUDENT ATTENDANCE REGISTER', textStartX, headerY + 12);

  // Right Side Info Box in Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  const rightTextX = pageWidth - margin;
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, rightTextX, headerY + 5, { align: 'right' });
  doc.text(`Academic Year: ${academicYearName || 'Current'}`, rightTextX, headerY + 10, { align: 'right' });

  // Divider
  const dividerY = headerY + 19;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, dividerY, pageWidth - margin, dividerY);

  // ── METADATA BAR ──
  const metaY = dividerY + 2;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, metaY, usableWidth, 10, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, metaY, usableWidth, 10, 1.5, 1.5, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);

  const col1X = margin + 5;
  const col2X = margin + 75;
  const col3X = margin + 145;
  const col4X = margin + 215;

  doc.text('Class:', col1X, metaY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${className} ${sectionName ? `(${sectionName})` : ''}`, col1X + 12, metaY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Month:', col2X, metaY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formattedMonthName}`, col2X + 14, metaY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Year:', col3X, metaY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${academicYearName || 'Current'}`, col3X + 26, metaY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Students:', col4X, metaY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${students.length}`, col4X + 26, metaY + 6.5);

  // ── TABLE SETUP ──
  // Calculate day columns & day of week labels
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayHeadersRow1 = [];
  const dayHeadersRow2 = [];
  const dayColumnIndices = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDayDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, d);
    const dayOfWeek = getDay(currentDayDate);
    dayHeadersRow1.push(String(d));
    dayHeadersRow2.push(dayNames[dayOfWeek]);
    dayColumnIndices.push({
      day: d,
      isSunday: dayOfWeek === 0,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // AutoTable Column Definitions
  // Total usable width = 277mm
  // Fixed widths:
  const srWidth = 8;
  const grWidth = 24; // GR Number column right next to Name
  const rollWidth = 14;
  const nameWidth = 46;
  const summaryColWidth = 8; // P, A, L, % (4 cols = 32mm)
  const remainingForDays = usableWidth - (srWidth + grWidth + rollWidth + nameWidth + summaryColWidth * 4); // 277 - (92 + 32) = 153mm
  const dayColWidth = Number((remainingForDays / daysInMonth).toFixed(2));

  // Build Head Rows
  const headRow1 = [
    { content: 'Sr#', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'GR Number', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Roll No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Student Full Name', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } },
    ...dayHeadersRow1.map((d, i) => ({
      content: d,
      styles: {
        halign: 'center',
        valign: 'middle',
        fillColor: dayColumnIndices[i].isSunday ? [239, 68, 68] : primaryColor,
        textColor: [255, 255, 255],
      },
    })),
    { content: 'P', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'A', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'L', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: '%', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
  ];

  const headRow2 = dayHeadersRow2.map((dn, i) => ({
    content: dn,
    styles: {
      halign: 'center',
      valign: 'middle',
      fillColor: dayColumnIndices[i].isSunday ? [254, 226, 226] : [30, 41, 59],
      textColor: dayColumnIndices[i].isSunday ? [185, 28, 28] : [255, 255, 255],
      fontSize: 5.5,
    },
  }));

  // Build Body Rows
  const bodyRows = students.map((s, idx) => {
    const grNum = s.registration_no || s.gr_number || s.gr_no || '—';
    const rollNum = s.roll_no || s.roll || '—';
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unnamed Student';

    const dayCells = Array.from({ length: daysInMonth }, () => '');

    return [
      String(idx + 1),
      String(grNum),
      String(rollNum),
      fullName,
      ...dayCells,
      '', // Present count
      '', // Absent count
      '', // Leave count
      '', // Percentage
    ];
  });

  // If no students, add blank template rows
  if (bodyRows.length === 0) {
    for (let r = 1; r <= 15; r++) {
      bodyRows.push([
        String(r),
        '',
        '',
        '',
        ...Array.from({ length: daysInMonth }, () => ''),
        '',
        '',
        '',
        '',
      ]);
    }
  }

  // Column styles mapping
  const columnStyles = {
    0: { cellWidth: srWidth, halign: 'center' },
    1: { cellWidth: grWidth, halign: 'center', fontStyle: 'bold' },
    2: { cellWidth: rollWidth, halign: 'center' },
    3: { cellWidth: nameWidth, halign: 'left' },
  };

  // Day columns styling
  for (let i = 0; i < daysInMonth; i++) {
    const colIdx = 4 + i;
    columnStyles[colIdx] = {
      cellWidth: dayColWidth,
      halign: 'center',
    };
  }

  // Summary columns styling
  const summaryStartIndex = 4 + daysInMonth;
  for (let j = 0; j < 4; j++) {
    columnStyles[summaryStartIndex + j] = {
      cellWidth: summaryColWidth,
      halign: 'center',
    };
  }

  autoTable(doc, {
    startY: metaY + 13,
    head: [headRow1, headRow2],
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      cellPadding: 1,
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      lineColor: borderColor,
      lineWidth: 0.2,
      font: 'helvetica',
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: lightBg,
    },
    columnStyles,
    didDrawCell: function (data) {
      // Highlight Sunday columns with subtle shading in body rows
      if (data.section === 'body' && data.column.index >= 4 && data.column.index < 4 + daysInMonth) {
        const dayIdx = data.column.index - 4;
        if (dayColumnIndices[dayIdx]?.isSunday) {
          doc.setFillColor(...weekendBg);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setDrawColor(...borderColor);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
        }
      }
    },
    margin: { left: margin, right: margin, bottom: 20 },
  });

  // ── FOOTER & SOFTWARE MARKETING ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 9;

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    // Software Marketing
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('Powered by The Clouds Academy (TCA)', margin, footerY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.text(' — All-in-One Cloud Management Platform for Schools & Institutes  •  Contact: +92 3352778488', margin + 57, footerY + 2);

    // Page numbers
    doc.text(
      `Page ${p} of ${totalPages}  •  ${instituteName}`,
      pageWidth - margin,
      footerY + 2,
      { align: 'right' }
    );
  }

  const safeFileName = `Attendance_Register_${className.replace(/\s+/g, '_')}_${formattedMonthName.replace(/\s+/g, '_')}.pdf`;

  if (action === 'print') {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
    return blobUrl;
  }

  if (action === 'blob') {
    return doc.output('blob');
  }

  doc.save(safeFileName);
  return safeFileName;
};

/**
 * Generate Blank Daily Attendance Checklist PDF (Portrait A4)
 */
export const generateDailyAttendanceSheetPDF = async ({
  students = [],
  className = 'All Classes',
  sectionName = '',
  academicYearName = '',
  date = format(new Date(), 'yyyy-MM-dd'),
  institute = {},
  action = 'download',
}) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const usableWidth = pageWidth - margin * 2; // 186mm

  const primaryColor = [15, 23, 42];
  const secondaryColor = [71, 85, 105];
  const lightBg = [248, 250, 252];
  const borderColor = [203, 213, 225];

  const formattedDate = format(new Date(date), 'EEEE, dd MMMM yyyy');
  const logoImg = await loadLogo(institute?.logo_url || institute?.logo);
  const instituteName = institute?.name || 'THE CLOUDS ACADEMY';

  // ── HEADER ──
  let headerY = margin + 2;
  if (logoImg) {
    try {
      doc.addImage(logoImg, 'PNG', margin, headerY, 16, 16);
    } catch {
      // Fallback
    }
  }

  const textStartX = logoImg ? margin + 20 : margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...primaryColor);
  doc.text(instituteName.toUpperCase(), textStartX, headerY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('DAILY STUDENT ATTENDANCE SHEET', textStartX, headerY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...secondaryColor);
  doc.text(`Academic Year: ${academicYearName || 'Current'}`, pageWidth - margin, headerY + 5, { align: 'right' });
  doc.text(`Date: ${formattedDate}`, pageWidth - margin, headerY + 10, { align: 'right' });

  // Divider
  const dividerY = headerY + 17;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, dividerY, pageWidth - margin, dividerY);

  // ── METADATA BOX ──
  const metaY = dividerY + 3;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, metaY, usableWidth, 12, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, metaY, usableWidth, 12, 1.5, 1.5, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);

  doc.text('Class:', margin + 4, metaY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${className} ${sectionName ? `(${sectionName})` : ''}`, margin + 16, metaY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Year:', margin + 68, metaY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${academicYearName || 'Current'}`, margin + 94, metaY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Strength:', margin + 138, metaY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${students.length} Students`, margin + 163, metaY + 7.5);

  // ── TABLE SETUP ──
  // Usable width: 186mm
  // Columns:
  // Sr# (8mm), GR Number (28mm), Roll No (16mm), Student Name (54mm), Present (18mm), Absent (18mm), Late (18mm), Remarks (26mm)
  const headRow = [
    { content: 'Sr#', styles: { halign: 'center' } },
    { content: 'GR Number', styles: { halign: 'center' } },
    { content: 'Roll No', styles: { halign: 'center' } },
    { content: 'Student Full Name', styles: { halign: 'left' } },
    { content: 'Present [ ]', styles: { halign: 'center' } },
    { content: 'Absent [ ]', styles: { halign: 'center' } },
    { content: 'Late [ ]', styles: { halign: 'center' } },
    { content: 'Remarks', styles: { halign: 'left' } },
  ];

  const bodyRows = students.map((s, idx) => {
    const grNum = s.registration_no || s.gr_number || s.gr_no || '—';
    const rollNum = s.roll_no || s.roll || '—';
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unnamed Student';

    return [
      String(idx + 1),
      String(grNum),
      String(rollNum),
      fullName,
      '[   ]',
      '[   ]',
      '[   ]',
      '',
    ];
  });

  if (bodyRows.length === 0) {
    for (let r = 1; r <= 20; r++) {
      bodyRows.push([String(r), '', '', '', '[   ]', '[   ]', '[   ]', '']);
    }
  }

  autoTable(doc, {
    startY: metaY + 16,
    head: [headRow],
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: borderColor,
      lineWidth: 0.2,
      font: 'helvetica',
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: lightBg,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 54, halign: 'left' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 26, halign: 'left' },
    },
    margin: { left: margin, right: margin, bottom: 22 },
  });

  // ── FOOTER & SOFTWARE MARKETING ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 10;

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    // Marketing Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('Powered by The Clouds Academy (TCA)', margin, footerY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.text(' — Smart Education ERP • Contact: +92 3352778488', margin + 57, footerY + 2);

    doc.text(
      `Page ${p} of ${totalPages}  •  ${instituteName}`,
      pageWidth - margin,
      footerY + 2,
      { align: 'right' }
    );
  }

  const safeFileName = `Daily_Attendance_${className.replace(/\s+/g, '_')}_${date}.pdf`;

  if (action === 'print') {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
    return blobUrl;
  }

  if (action === 'blob') {
    return doc.output('blob');
  }

  doc.save(safeFileName);
  return safeFileName;
};

/**
 * Export Blank Attendance Register to Excel (.xlsx)
 */
export const exportAttendanceSheetExcel = ({
  students = [],
  className = 'Class',
  sectionName = '',
  academicYearName = '',
  month = format(new Date(), 'yyyy-MM'),
  sheetType = 'monthly', // 'monthly' | 'daily'
  institute = {},
}) => {
  const instituteName = institute?.name || 'The Clouds Academy';
  const [yearStr, monthStr] = (month || format(new Date(), 'yyyy-MM')).split('-');
  const selectedDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const formattedMonthName = format(selectedDate, 'MMMM yyyy');
  const daysInMonth = getDaysInMonth(selectedDate);

  const wb = XLSX.utils.book_new();

  // Header Rows
  const aoaData = [
    ['POWERED BY THE CLOUDS ACADEMY (TCA) - ALL-IN-ONE CLOUD ERP & LMS PLATFORM | CONTACT: +92 3352778488'],
    [instituteName.toUpperCase()],
    [`BLANK STUDENT ATTENDANCE REGISTER - ${sheetType === 'monthly' ? formattedMonthName.toUpperCase() : 'DAILY SHEET'}`],
    [
      `Class: ${className}`,
      `Section: ${sectionName || 'All Sections'}`,
      `Academic Year: ${academicYearName || 'Current'}`,
      `Total Students: ${students.length}`,
    ],
    [], // Blank line
  ];

  if (sheetType === 'monthly') {
    // Days Headers
    const dayCols = [];
    for (let d = 1; d <= daysInMonth; d++) {
      dayCols.push(`Day ${d}`);
    }

    const tableHeaders = [
      'Sr #',
      'GR Number',
      'Roll Number',
      'Student Name',
      'Gender',
      ...dayCols,
      'Total Present',
      'Total Absent',
      'Total Leave',
      'Attendance %',
    ];
    aoaData.push(tableHeaders);

    // Student Rows
    students.forEach((s, idx) => {
      const grNum = s.registration_no || s.gr_number || s.gr_no || '—';
      const rollNum = s.roll_no || s.roll || '—';
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unnamed Student';

      const blankDays = Array.from({ length: daysInMonth }, () => '');

      aoaData.push([
        idx + 1,
        grNum,
        rollNum,
        fullName,
        s.gender || '—',
        ...blankDays,
        '',
        '',
        '',
        '',
      ]);
    });
  } else {
    // Daily Table Headers
    const tableHeaders = [
      'Sr #',
      'GR Number',
      'Roll Number',
      'Student Name',
      'Gender',
      'Present (P)',
      'Absent (A)',
      'Late (L)',
      'Leave',
      'Remarks',
    ];
    aoaData.push(tableHeaders);

    students.forEach((s, idx) => {
      const grNum = s.registration_no || s.gr_number || s.gr_no || '—';
      const rollNum = s.roll_no || s.roll || '—';
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unnamed Student';

      aoaData.push([
        idx + 1,
        grNum,
        rollNum,
        fullName,
        s.gender || '—',
        '',
        '',
        '',
        '',
        '',
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(aoaData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // Sr
    { wch: 18 }, // GR Number
    { wch: 12 }, // Roll Number
    { wch: 28 }, // Student Name
    { wch: 10 }, // Gender
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Sheet');

  const fileName = `Attendance_Sheet_${className.replace(/\s+/g, '_')}_${month}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
