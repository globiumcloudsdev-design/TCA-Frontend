// import { format } from 'date-fns';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const CURRENCY = 'PKR';
// const PRIMARY_GREEN = [22, 101, 52];

// const toNumber = (value) => {
//   if (typeof value === 'number') return value;
//   if (typeof value === 'string') {
//     const normalized = Number(value.replace(/,/g, ''));
//     return Number.isFinite(normalized) ? normalized : 0;
//   }
//   return 0;
// };

// const hasNonZeroAmount = (value) => {
//   if (value === null || value === undefined || value === '') return false;
//   if (typeof value === 'string' && value.includes('%')) {
//     const parsed = Number(value.replace('%', '').trim());
//     return Number.isFinite(parsed) && parsed !== 0;
//   }
//   return toNumber(value) !== 0;
// };

// const formatAmount = (value) => `${CURRENCY} ${toNumber(value).toLocaleString('en-PK')}`;

// const formatDate = (value) => {
//   if (!value) return '-';
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return '-';
//   return format(date, 'dd/MM/yyyy');
// };

// const formatMonth = (voucher) => {
//   if (voucher?.month_name) return voucher.month_name;
//   if (voucher?.month && voucher?.year) {
//     const date = new Date(voucher.year, Math.max(voucher.month - 1, 0), 1);
//     if (!Number.isNaN(date.getTime())) {
//       return format(date, 'MMMM');
//     }
//   }
//   if (voucher?.due_date) {
//     const date = new Date(voucher.due_date);
//     if (!Number.isNaN(date.getTime())) {
//       return format(date, 'MMMM');
//     }
//   }
//   return '-';
// };

// const formatFeeType = (value) => {
//   const normalized = String(value || '').trim().toLowerCase();
//   if (!normalized) return 'Fee';
//   if (normalized === 'fee_template') return 'Fee Template';
//   return normalized
//     .replace(/_/g, ' ')
//     .replace(/\b\w/g, (char) => char.toUpperCase());
// };

// const renderVoucherPage = (doc, voucher = {}, student = {}, instituteName = 'ABC School', pageIndex = 0) => {
//   const sectionX = 28;
//   const sectionWidth = 540;
//   const sectionHeight = 247;
//   const sectionGap = 16;
//   const tableStartX = sectionX + 8;
//   const copyLabels = ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'];

//   const generatedOn = formatDate(new Date());
//   const studentName =
//     student?.name ||
//     voucher?.studentName ||
//     voucher?.student?.name ||
//     voucher?.student_name ||
//     '-';
//   const registrationNo =
//     student?.registration_no ||
//     student?.registrationNo ||
//     voucher?.registrationNo ||
//     voucher?.student?.registration_no ||
//     voucher?.registration_no ||
//     '-';
//   const dueDate = formatDate(voucher?.due_date || voucher?.dueDate);
//   const monthName = formatMonth(voucher);
//   const normalizedStatus = String(voucher?.status || '').toLowerCase() === 'paid' ? 'Paid' : 'Pending';
//   const feeTypeLabel = formatFeeType(voucher?.fee_type || voucher?.feeType);
//   const className =
//     student?.class ||
//     student?.className ||
//     voucher?.className ||
//     voucher?.class_name ||
//     voucher?.student?.class_name ||
//     '-';
//   const sectionName =
//     student?.section ||
//     student?.sectionName ||
//     voucher?.sectionName ||
//     voucher?.section_name ||
//     voucher?.student?.section_name ||
//     '-';
//   const feeRows = buildFeeRows(voucher);

//   copyLabels.forEach((copyLabel, index) => {
//     const sectionY = 24 + index * (sectionHeight + sectionGap);

//     if (index > 0 || pageIndex > 0) {
//       doc.setDrawColor(90, 90, 90);
//       doc.setLineDashPattern([4, 3], 0);
//       doc.line(sectionX, sectionY - 8, sectionX + sectionWidth, sectionY - 8);
//       doc.setLineDashPattern([], 0);
//     }

//     doc.setDrawColor(160, 160, 160);
//     doc.rect(sectionX, sectionY, sectionWidth, sectionHeight);

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(9);
//     doc.text(copyLabel, sectionX + 10, sectionY + 14);

//     doc.setFontSize(11);
//     doc.text(instituteName, sectionX + sectionWidth / 2, sectionY + 14, { align: 'center' });

//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(9);
//     doc.text(`Generate Date: ${generatedOn}`, sectionX + sectionWidth - 10, sectionY + 14, { align: 'right' });

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(10);
//     doc.text('Fee Voucher', sectionX + sectionWidth / 2, sectionY + 28, { align: 'center' });

//     autoTable(doc, {
//       startY: sectionY + 34,
//       margin: { left: tableStartX, right: 28 },
//       theme: 'grid',
// body: [
//         ['Voucher #', voucher?.voucher_number || voucher?.voucherNumber || '-', 'Due Date', dueDate],
//         ['Student Name', studentName, 'Reg #', registrationNo],
//         ['Class / Section', `${className} / ${sectionName}`, 'Issue Date', generatedOn],
//         ['Month', `${monthName}`, 'Status', normalizedStatus]
//       ],
//       styles: {
//         fontSize: 8,
//         cellPadding: 2.2,
//         textColor: [20, 20, 20],
//         lineColor: [190, 190, 190],
//         lineWidth: 0.5
//       },
//       columnStyles: {
//         0: { cellWidth: 68, fontStyle: 'bold' },
//         1: { cellWidth: 192 },
//         2: { cellWidth: 60, fontStyle: 'bold' },
//         3: { cellWidth: 180 }
//       }
//     });

//     autoTable(doc, {
//       startY: doc.lastAutoTable.finalY + 4,
//       margin: { left: tableStartX, right: 28 },
//       styles: {
//         fontSize: 8,
//         cellPadding: 2.2,
//         textColor: [20, 20, 20],
//         lineColor: [190, 190, 190],
//         lineWidth: 0.5
//       },
//       headStyles: {
//         fillColor: PRIMARY_GREEN,
//         textColor: [255, 255, 255],
//         fontStyle: 'bold'
//       },
//       columnStyles: {
//         0: { cellWidth: 340 },
//         1: { cellWidth: 160, halign: 'right' }
//       },
//       head: [['Fee Type', 'Amount']],
//       body: feeRows
//     });

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(7);
//     doc.text('Late fee policy applies after due date.', tableStartX, sectionY + sectionHeight - 8);
//     doc.text('Authorized Signature: ____________________', sectionX + sectionWidth - 10, sectionY + sectionHeight - 8, { align: 'right' });
//   });
// };

// const buildFeeRows = (voucher = {}) => {
//   const breakdownSource = voucher?.fee_breakdown ?? voucher?.feeBreakdown;

//   const objectBreakdown = breakdownSource && !Array.isArray(breakdownSource)
//     ? Object.entries(breakdownSource).map(([label, amount]) => ({
//       label: String(label)
//         .replace(/_/g, ' ')
//         .replace(/\b\w/g, (char) => char.toUpperCase()),
//       amount
//     }))
//     : [];

//   const arrayBreakdown = Array.isArray(breakdownSource)
//     ? breakdownSource.map((item) => ({
//       label: item?.feeType || item?.label || item?.title || item?.type || 'Fee Item',
//       amount: item?.amount ?? item?.value ?? 0
//     }))
//     : [];

//   const primaryFeeLabel = formatFeeType(voucher?.fee_type || voucher?.feeType);

//   const knownRows = [
//     { label: primaryFeeLabel, amount: voucher.net_amount ?? voucher.netAmount ?? voucher.amount },
//     { label: 'Concession Percentage', amount: voucher.concession_percentage ? `${voucher.concession_percentage}%` : null },
//     { label: 'Discount', amount: voucher.discount },
//     { label: 'Total Amount', amount: voucher.amount ?? voucher.total_amount },
//     { label: 'Remaining Amount', amount: voucher.remaining_amount ?? voucher.balance_due ?? voucher.net_amount }
//   ].filter((row) => hasNonZeroAmount(row.amount));

//   const merged = [...arrayBreakdown, ...objectBreakdown, ...knownRows].filter((row) => hasNonZeroAmount(row.amount));

//   if (!merged.length && hasNonZeroAmount(voucher.net_amount ?? voucher.netAmount ?? voucher.amount)) {
//     merged.push({ label: primaryFeeLabel, amount: voucher.net_amount ?? voucher.netAmount ?? voucher.amount });
//   }

//   const rows = merged.map((row) => [
//     row.label,
//     typeof row.amount === 'string' && row.amount.includes('%') ? row.amount : formatAmount(row.amount)
//   ]);

//   return rows.length ? rows : [['No fee lines', '-']];
// };

// export const generateFeeVoucherPdfBlob = ({ voucher = {}, student = {}, instituteName = 'ABC School' }) => {
//   const doc = new jsPDF('p', 'pt', 'a4');

//   renderVoucherPage(doc, voucher, student, instituteName, 0);

//   return doc.output('blob');
// };

// export const generateBulkFeeVouchersPdfBlob = ({ vouchers = [], studentsByVoucherId = {}, instituteName = 'ABC School' }) => {
//   const doc = new jsPDF('p', 'pt', 'a4');

//   vouchers.forEach((voucher, index) => {
//     if (index > 0) {
//       doc.addPage();
//     }

//     renderVoucherPage(
//       doc,
//       voucher,
//       studentsByVoucherId[voucher?.id] || studentsByVoucherId[voucher?.voucherNumber] || studentsByVoucherId[voucher?.voucher_number] || {},
//       instituteName,
//       index
//     );
//   });

//   return doc.output('blob');
// };




import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CURRENCY = 'PKR';
const PRIMARY_GREEN = [22, 101, 52];

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(/,/g, ''));
    return Number.isFinite(normalized) ? normalized : 0;
  }
  return 0;
};

const hasNonZeroAmount = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'string' && value.includes('%')) {
    const parsed = Number(value.replace('%', '').trim());
    return Number.isFinite(parsed) && parsed !== 0;
  }
  return toNumber(value) !== 0;
};

const formatAmount = (value) => `${CURRENCY} ${toNumber(value).toLocaleString('en-PK')}`;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'dd/MM/yyyy');
};

const formatMonth = (voucher) => {
  if (voucher?.month_name) return voucher.month_name;
  if (voucher?.month && voucher?.year) {
    const date = new Date(voucher.year, Math.max(voucher.month - 1, 0), 1);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'MMMM');
    }
  }
  if (voucher?.due_date) {
    const date = new Date(voucher.due_date);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'MMMM');
    }
  }
  return '-';
};

const formatFeeType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Fee';
  if (normalized === 'fee_template') return 'Fee Template';
  return normalized
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildFeeRows = (voucher = {}) => {
  const breakdownSource = voucher?.fee_breakdown ?? voucher?.feeBreakdown;

  const objectBreakdown = breakdownSource && !Array.isArray(breakdownSource)
    ? Object.entries(breakdownSource)
        .filter(([_, amount]) => hasNonZeroAmount(amount))
        .map(([label, amount]) => ({
          label: String(label)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          amount
        }))
    : [];

  const arrayBreakdown = Array.isArray(breakdownSource)
    ? breakdownSource
        .filter((item) => hasNonZeroAmount(item?.amount ?? item?.value ?? 0))
        .map((item) => ({
          label: item?.feeType || item?.label || item?.title || item?.type || 'Fee Item',
          amount: item?.amount ?? item?.value ?? 0
        }))
    : [];

  const primaryFeeLabel = formatFeeType(voucher?.fee_type || voucher?.feeType);
  
  // Get net amount from various possible fields
  const netAmount = voucher.net_amount ?? voucher.netAmount ?? voucher.amount ?? 0;
  
  const knownRows = [
    { label: primaryFeeLabel, amount: netAmount },
    { label: 'Discount', amount: voucher.discount },
    { label: 'Total Amount', amount: voucher.amount ?? voucher.total_amount },
    { label: 'Remaining Amount', amount: voucher.remaining_amount ?? voucher.balance_due }
  ].filter((row) => hasNonZeroAmount(row.amount));

  // Merge all fee rows, removing duplicates by label
  const mergedMap = new Map();
  
  [...arrayBreakdown, ...objectBreakdown, ...knownRows].forEach((row) => {
    const key = row.label.toLowerCase().trim();
    if (!mergedMap.has(key) && hasNonZeroAmount(row.amount)) {
      mergedMap.set(key, row);
    }
  });
  
  const merged = Array.from(mergedMap.values());

  if (!merged.length && hasNonZeroAmount(netAmount)) {
    merged.push({ label: primaryFeeLabel, amount: netAmount });
  }

  const rows = merged.map((row) => [
    row.label,
    typeof row.amount === 'string' && row.amount.includes('%') ? row.amount : formatAmount(row.amount)
  ]);

  return rows.length ? rows : [['No fee lines', '-']];
};

const renderVoucherPage = (doc, voucher = {}, student = {}, instituteName = 'ABC School', pageIndex = 0) => {
  const sectionX = 28;
  const sectionWidth = 540;
  const sectionHeight = 247;
  const sectionGap = 16;
  const tableStartX = sectionX + 8;
  const copyLabels = ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'];

  const generatedOn = formatDate(new Date());
  
  // Enhanced student name extraction with multiple fallbacks
  const studentName = 
    student?.name ||
    student?.full_name ||
    voucher?.studentName ||
    voucher?.student?.name ||
    voucher?.student_name ||
    voucher?.student?.full_name ||
    'Student Name Not Found';
    
  // Enhanced registration number extraction
  const registrationNo =
    student?.registration_no ||
    student?.registrationNo ||
    voucher?.registrationNo ||
    voucher?.student?.registration_no ||
    voucher?.registration_no ||
    'N/A';
    
  const dueDate = formatDate(voucher?.due_date || voucher?.dueDate);
  const monthName = formatMonth(voucher);
  const normalizedStatus = String(voucher?.status || '').toLowerCase() === 'paid' ? 'Paid' : 'Pending';
  const feeTypeLabel = formatFeeType(voucher?.fee_type || voucher?.feeType);
  
// ENHANCED: Better class/section extraction with enrollment context
  let className = 
    voucher?.class_name ||
    voucher?.className ||
    student?.class ||
    student?.className ||
    student?.class_name ||
    voucher?.student?.class_name ||
    voucher?.student?.className ||
    'N/A';
    
  let sectionName =
    voucher?.section_name ||
    voucher?.sectionName ||
    student?.section ||
    student?.sectionName ||
    student?.section_name ||
    voucher?.student?.section_name ||
    voucher?.student?.sectionName ||
    'N/A';
    
  // PDF-specific fallback: Clean N/A-like values
  className = className && className.toLowerCase() !== 'n/a' && className.trim() !== '' ? className.trim() : 'N/A';
  sectionName = sectionName && sectionName.toLowerCase() !== 'n/a' && sectionName.trim() !== '' ? sectionName.trim() : 'N/A';
    
  // Clean up the values
  className = String(className).replace(/^Class\s+Class\s+/i, 'Class ').trim();
  sectionName = String(sectionName).trim();
  
  // Ensure we don't have empty strings
  if (!className || className === '' || className === 'undefined') className = 'N/A';
  if (!sectionName || sectionName === '' || sectionName === 'undefined') sectionName = 'N/A';

  const feeRows = buildFeeRows(voucher);

  copyLabels.forEach((copyLabel, index) => {
    const sectionY = 24 + index * (sectionHeight + sectionGap);

    if (index > 0 || pageIndex > 0) {
      doc.setDrawColor(90, 90, 90);
      doc.setLineDashPattern([4, 3], 0);
      doc.line(sectionX, sectionY - 8, sectionX + sectionWidth, sectionY - 8);
      doc.setLineDashPattern([], 0);
    }

    doc.setDrawColor(160, 160, 160);
    doc.rect(sectionX, sectionY, sectionWidth, sectionHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(copyLabel, sectionX + 10, sectionY + 14);

    doc.setFontSize(11);
    doc.text(instituteName, sectionX + sectionWidth / 2, sectionY + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generate Date: ${generatedOn}`, sectionX + sectionWidth - 10, sectionY + 14, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Fee Voucher', sectionX + sectionWidth / 2, sectionY + 28, { align: 'center' });

    autoTable(doc, {
      startY: sectionY + 34,
      margin: { left: tableStartX, right: 28 },
      theme: 'grid',
      body: [
        ['Voucher #', voucher?.voucher_number || voucher?.voucherNumber || '-', 'Due Date', dueDate],
        ['Student Name', studentName, 'Reg #', registrationNo],
        ['Class / Section', `${className} / ${sectionName}`, 'Issue Date', generatedOn],
        ['Month', `${monthName}`, 'Status', normalizedStatus]
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        textColor: [20, 20, 20],
        lineColor: [190, 190, 190],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 68, fontStyle: 'bold' },
        1: { cellWidth: 192 },
        2: { cellWidth: 60, fontStyle: 'bold' },
        3: { cellWidth: 180 }
      }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 4,
      margin: { left: tableStartX, right: 28 },
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        textColor: [20, 20, 20],
        lineColor: [190, 190, 190],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: PRIMARY_GREEN,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 340 },
        1: { cellWidth: 160, halign: 'right' }
      },
      head: [['Fee Type', 'Amount']],
      body: feeRows
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Late fee policy applies after due date.', tableStartX, sectionY + sectionHeight - 8);
    doc.text('Authorized Signature: ____________________', sectionX + sectionWidth - 10, sectionY + sectionHeight - 8, { align: 'right' });
  });
};

export const generateFeeVoucherPdfBlob = ({ voucher = {}, student = {}, instituteName = 'ABC School' }) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  renderVoucherPage(doc, voucher, student, instituteName, 0);

  return doc.output('blob');
};

export const generateBulkFeeVouchersPdfBlob = ({ vouchers = [], studentsByVoucherId = {}, instituteName = 'ABC School' }) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  vouchers.forEach((voucher, index) => {
    if (index > 0) {
      doc.addPage();
    }

    renderVoucherPage(
      doc,
      voucher,
      studentsByVoucherId[voucher?.id] || studentsByVoucherId[voucher?.voucherNumber] || studentsByVoucherId[voucher?.voucher_number] || {},
      instituteName,
      index
    );
  });

  return doc.output('blob');
};