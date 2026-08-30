import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --------------------------------------------------------------------------------
// UTILS
// --------------------------------------------------------------------------------

export const getInstituteVoucherFormat = (institute, voucher) => {
  const explicitFormat = voucher?.voucher_format || voucher?.voucherFormat || voucher?.format;
  if (explicitFormat === 'compact' || explicitFormat === 'compact_receipt') return 'compact';
  if (explicitFormat === 'three_part' || explicitFormat === 'three_part_slip' || explicitFormat === 'classic') return 'three_part';

  const inst = institute || {};
  const settings = inst.settings || {};
  const printSettings = settings.print_settings || {};
  const feeSettings = settings.fee || settings.fee_settings || {};

  const raw =
    printSettings.voucher_format ||
    printSettings.voucher_print_format ||
    settings.voucher_format ||
    settings.voucher_print_format ||
    feeSettings.voucher_format ||
    feeSettings.voucher_print_format ||
    inst.voucher_format ||
    inst.voucher_print_format;

  if (raw === 'compact' || raw === 'compact_receipt') {
    return 'compact';
  }
  return 'three_part';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch (err) {
    return 'N/A';
  }
};

const formatMonth = (voucher) => {
  if (!voucher) return 'N/A';
  const month = voucher.month;
  const year = voucher.year;
  if (!month) return 'N/A';
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[month - 1]} ${year || ''}`.trim();
};

const formatFeeType = (type) => {
  if (!type) return 'MONTHLY FEE';
  const s = String(type).toUpperCase();
  if (s.includes('MONTHLY')) return 'MONTHLY FEE';
  return s;
};

/**
 * Robust extraction of class and section names
 */
const extractStudentMeta = (voucher, student) => {
  let className = voucher?.className || voucher?.class_name || student?.className || student?.class_name || 'N/A';
  let sectionName = voucher?.sectionName || voucher?.section_name || student?.sectionName || student?.section_name || 'N/A';

  const clean = (val) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s.toLowerCase() === 'n/a' || s.toLowerCase() === 'undefined' || s === '') return 'N/A';
    return s;
  };

  return {
    className: clean(className),
    sectionName: clean(sectionName)
  };
};

// --------------------------------------------------------------------------------
// IMAGE LOADING
// --------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------
// RENDERERS
// --------------------------------------------------------------------------------

const buildFeeRows = (voucher) => {
  const rows = [];
  const baseAmount = Number(
    voucher?.base_amount ??
    voucher?.baseAmount ??
    voucher?.student?.monthly_fee ??
    voucher?.student?.monthlyFee ??
    voucher?.monthly_fee ??
    voucher?.monthlyFee ??
    0
  );
  const discount = Number(
    voucher?.discount ??
    voucher?.concession_amount ??
    voucher?.concessionAmount ??
    0
  );
  const arrears = Number(
    voucher?.arrears ??
    voucher?.previous_arrears ??
    voucher?.previousArrears ??
    0
  );
  const rawNet = Number(voucher?.net_amount ?? voucher?.netAmount ?? voucher?.amount ?? 0);
  const calculatedNet = baseAmount > 0 ? (baseAmount - discount + arrears) : rawNet;
  const netAmount = rawNet > 0 ? rawNet : calculatedNet;

  const feeTypeLabel = formatFeeType(voucher?.fee_type || voucher?.feeType);

  // 1. Base Fee row (Monthly Fee / Tuition Fee)
  if (baseAmount > 0) {
    rows.push([feeTypeLabel, baseAmount.toFixed(2)]);
  } else if (netAmount > 0 && arrears > 0) {
    rows.push([feeTypeLabel, Math.max(0, netAmount - arrears + discount).toFixed(2)]);
  } else {
    rows.push([feeTypeLabel, netAmount.toFixed(2)]);
  }

  // 2. Concession / Discount row (if any)
  if (discount > 0) {
    rows.push(['CONCESSION / DISCOUNT', `-${discount.toFixed(2)}`]);
  }

  // 3. Previous Charges / Arrears row (if any)
  if (arrears > 0) {
    rows.push(['PREVIOUS CHARGES / ARREARS', arrears.toFixed(2)]);
  }

  // Fallback if empty
  if (rows.length === 0) {
    rows.push([feeTypeLabel, '0.00']);
  }

  return rows;
};

/**
 * Render 3 copies (Bank, School, Parent) on a single A4 page
 */
const renderVoucherPage = (doc, { voucher, student, instituteName, logoImg }) => {
  const sectionWidth = 190;
  const sectionX = 10;
  const sectionHeight = 90; 
  const sectionGap = 4;
  
  const { className, sectionName } = extractStudentMeta(voucher, student);
  const studentName = voucher?.studentName || student?.name || 'Student';
  const registrationNo = voucher?.registrationNo || voucher?.registration_no || student?.registrationNo || 'N/A';
  const voucherNo = voucher?.voucherNumber || voucher?.voucher_number || voucher?.voucher_no || voucher?.id || 'N/A';
  const dueDate = formatDate(voucher?.dueDate || voucher?.due_date);
  const monthName = formatMonth(voucher);
  const netAmount = Number(voucher?.net_amount || voucher?.netAmount || voucher?.amount || 0);
  const safeAmount = isNaN(netAmount) ? 0 : netAmount;

  const copies = ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'];

  copies.forEach((copyTitle, index) => {
    const sectionY = 8 + index * (sectionHeight + sectionGap);

    // 1. Border
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(sectionX, sectionY, sectionWidth, sectionHeight);

    // 2. Header
    if (logoImg) {
      try {
        doc.addImage(logoImg, 'PNG', sectionX + 4, sectionY + 4, 12, 12);
      } catch (e) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(instituteName.toUpperCase(), sectionX + 20, sectionY + 10);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('FEE VOUCHER', sectionX + 20, sectionY + 14);

    // Copy Badge
    doc.setFillColor(241, 245, 249);
    doc.rect(sectionX + 155, sectionY + 5, 30, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(copyTitle, sectionX + 170, sectionY + 9, { align: 'center' });

    // 3. Info Grid
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    
    // Row 1
    doc.setFont('helvetica', 'bold');
    doc.text('Voucher No:', sectionX + 5, sectionY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(String(voucherNo), sectionX + 25, sectionY + 22);

    doc.setFont('helvetica', 'bold');
    doc.text('Student:', sectionX + 70, sectionY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(String(studentName), sectionX + 85, sectionY + 22);

    doc.setFont('helvetica', 'bold');
    doc.text('Class:', sectionX + 135, sectionY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(String(className), sectionX + 148, sectionY + 22);

    // Row 2
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', sectionX + 5, sectionY + 27);
    doc.setFont('helvetica', 'normal');
    doc.text(String(dueDate), sectionX + 25, sectionY + 27);

    doc.setFont('helvetica', 'bold');
    doc.text('Reg No:', sectionX + 70, sectionY + 27);
    doc.setFont('helvetica', 'normal');
    doc.text(String(registrationNo), sectionX + 85, sectionY + 27);

    doc.setFont('helvetica', 'bold');
    doc.text('Month:', sectionX + 135, sectionY + 27);
    doc.setFont('helvetica', 'normal');
    doc.text(String(monthName), sectionX + 148, sectionY + 27);

    // 4. Table
    const feeRows = buildFeeRows(voucher);
    autoTable(doc, {
      startY: sectionY + 32,
      margin: { left: sectionX + 5, right: sectionX + 5 },
      tableWidth: 120,
      head: [['Description', 'Amount (PKR)']],
      body: feeRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    // 5. Total
    const rightX = sectionX + 135;
    const rightY = sectionY + 35;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PAYABLE AMOUNT', rightX, rightY);
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(`PKR ${safeAmount.toFixed(2)}`, rightX, rightY + 7);
    
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Please pay by due date.', rightX, rightY + 12);

    // 6. Signatures
    const sigY = sectionY + sectionHeight - 12;
    doc.setDrawColor(200);
    doc.line(sectionX + 10, sigY, sectionX + 50, sigY);
    doc.text('Bank Stamp', sectionX + 30, sigY + 4, { align: 'center' });

    doc.line(sectionX + 140, sigY, sectionX + 180, sigY);
    doc.text('Authorized Sign', sectionX + 160, sigY + 4, { align: 'center' });

    // 7. Cut Line
    if (index < 2) {
      doc.setLineDash([2, 2]);
      doc.line(0, sectionY + sectionHeight + (sectionGap / 2), 210, sectionY + sectionHeight + (sectionGap / 2));
      doc.setLineDash([]);
    }
  });
};

/**
 * Render New Compact Receipt layout on A5 or thermal-size page
 */
const renderCompactReceiptPage = (doc, { voucher, student, instituteName, logoImg }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  let y = 14;

  const { className, sectionName } = extractStudentMeta(voucher, student);
  const studentName = voucher?.studentName || student?.name || (student?.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Student');
  const registrationNo = voucher?.registrationNo || voucher?.registration_no || student?.registrationNo || student?.registration_no || null;
  const voucherNo = voucher?.voucherNumber || voucher?.voucher_number || voucher?.voucher_no || voucher?.id || 'N/A';
  const paymentDate = formatDate(voucher?.paymentDate || voucher?.payment_date || voucher?.issuedDate || voucher?.issue_date || voucher?.dueDate || voucher?.due_date || new Date());
  const monthName = formatMonth(voucher);
  
  const baseAmount = Number(voucher?.base_amount ?? voucher?.baseAmount ?? voucher?.student?.monthly_fee ?? voucher?.monthly_fee ?? 0);
  const discount = Number(voucher?.discount ?? voucher?.concession_amount ?? voucher?.concessionAmount ?? 0);
  const arrears = Number(voucher?.arrears ?? voucher?.previous_arrears ?? voucher?.previousArrears ?? 0);
  const netAmount = Number(voucher?.net_amount ?? voucher?.netAmount ?? voucher?.amount ?? 0);
  const safeTotal = netAmount > 0 ? netAmount : Math.max(0, baseAmount - discount + arrears);
  
  const paidAmount = Number(voucher?.paid_amount ?? voucher?.paidAmount ?? voucher?.amount_paid ?? (String(voucher?.status).toLowerCase() === 'paid' ? safeTotal : 0));
  const remainingBalance = Number(voucher?.pending_amount ?? voucher?.remaining_amount ?? Math.max(0, safeTotal - paidAmount));

  // Outer border / frame for receipt
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin - 4, 8, contentWidth + 8, pageHeight - 16, 2, 2);

  // 1. Header: School's actual name at the top
  if (logoImg) {
    try {
      doc.addImage(logoImg, 'PNG', (pageWidth / 2) - 6, y, 12, 12);
      y += 15;
    } catch (e) {
      y += 2;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(instituteName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FEE VOUCHER / RECEIPT', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Dotted divider
  doc.setLineDash([1, 1]);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDash([]);
  y += 5;

  // 2. Transaction Details (Date and explicitly "Voucher No")
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(paymentDate), margin + 12, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Voucher No:', pageWidth - margin - 50, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(voucherNo), pageWidth - margin, y, { align: 'right' });
  y += 6;

  // Dotted divider
  doc.setLineDash([1, 1]);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDash([]);
  y += 5;

  // 3. Student Information (Full name, class and section)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Student:', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(studentName), margin + 18, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Class & Section:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${className} - ${sectionName}`, margin + 28, y);

  if (registrationNo && registrationNo !== 'N/A') {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Reg #:', pageWidth - margin - 35, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(registrationNo), pageWidth - margin, y, { align: 'right' });
  }
  y += 6;

  // Dotted divider
  doc.setLineDash([1, 1]);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineDash([]);
  y += 5;

  // 4. Paid Details Section (Month covered, total fee amount, exact amount paid today)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fee Month:', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(monthName), margin + 20, y);
  y += 5;

  // Small breakdown table
  const feeRows = buildFeeRows(voucher);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Amount (PKR)']],
    body: feeRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.65 },
      1: { cellWidth: contentWidth * 0.35, halign: 'right', fontStyle: 'bold' }
    }
  });

  y = (doc.lastAutoTable?.finalY || y + 25) + 3;

  // Solid line for totals
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Total Fee Amount
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Total Fee Amount:', margin, y);
  doc.text(`PKR ${safeTotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += 5.5;

  // Amount Paid Today
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, y - 4, contentWidth, 6, 'F');
  doc.setTextColor(21, 128, 61);
  doc.text('Amount Paid:', margin + 2, y);
  doc.text(`PKR ${paidAmount.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 8;

  // 5. Unpaid Balance Section (Small, separate area showing remaining unpaid balance)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(remainingBalance > 0 ? 252 : 203, remainingBalance > 0 ? 165 : 213, remainingBalance > 0 ? 165 : 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Unpaid Balance:', margin + 4, y + 7);

  if (remainingBalance > 0) {
    doc.setTextColor(225, 29, 72);
    doc.text(`PKR ${remainingBalance.toFixed(2)}`, pageWidth - margin - 4, y + 7, { align: 'right' });
  } else {
    doc.setTextColor(22, 101, 52);
    doc.text('PKR 0.00 (Fully Settled)', pageWidth - margin - 4, y + 7, { align: 'right' });
  }
  y += 18;

  // 6. Footer (Exact text: Powered by TCA The Clouds Academy | 03352778488)
  const footerY = pageHeight - 12;
  doc.setLineDash([1, 1]);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  doc.setLineDash([]);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Powered by TCA The Clouds Academy | 03352778488', pageWidth / 2, footerY, { align: 'center' });
};

// --------------------------------------------------------------------------------
// EXPORTS
// --------------------------------------------------------------------------------

export const generateFeeVoucherPdfBlob = async ({ voucher, student, instituteName, logoUrl, voucherFormat, institute }) => {
  const formatType = voucherFormat || getInstituteVoucherFormat(institute || { name: instituteName }, voucher);
  const logoImg = await loadLogo(logoUrl);

  if (formatType === 'compact' || formatType === 'compact_receipt') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    renderCompactReceiptPage(doc, { voucher, student, instituteName, logoImg });
    return doc.output('blob');
  }

  const doc = new jsPDF();
  renderVoucherPage(doc, { voucher, student, instituteName, logoImg });
  return doc.output('blob');
};

export const generateAndDownloadFeeVoucherPdf = async ({ voucher, student, instituteName, logoUrl, voucherFormat, institute }) => {
  try {
    const formatType = voucherFormat || getInstituteVoucherFormat(institute || { name: instituteName }, voucher);
    const blob = await generateFeeVoucherPdfBlob({ voucher, student, instituteName, logoUrl, voucherFormat: formatType, institute });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const prefix = formatType === 'compact' ? 'compact-receipt' : 'fee-voucher';
    a.download = `${prefix}-${voucher?.voucher_number || voucher?.voucherNumber || 'voucher'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating and downloading fee voucher PDF:', err);
  }
};

export const generateBulkFeeVouchersPdfBlob = async ({ vouchers, instituteName, logoUrl, voucherFormat, institute }) => {
  const formatType = voucherFormat || (vouchers?.length > 0 ? getInstituteVoucherFormat(institute || { name: instituteName }, vouchers[0]) : 'three_part');
  const logoImg = await loadLogo(logoUrl);

  const isCompact = formatType === 'compact' || formatType === 'compact_receipt';
  const doc = isCompact
    ? new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
    : new jsPDF();

  for (let i = 0; i < vouchers.length; i++) {
    if (i > 0) doc.addPage();
    const v = vouchers[i];
    const s = v.student || v;
    if (isCompact) {
      renderCompactReceiptPage(doc, { voucher: v, student: s, instituteName, logoImg });
    } else {
      renderVoucherPage(doc, { voucher: v, student: s, instituteName, logoImg });
    }
  }

  return doc.output('blob');
};

export const generateFeeReceiptPdfBlob = async ({ payment, voucher, instituteName, logoUrl }) => {
  const doc = new jsPDF();
  const logoImg = await loadLogo(logoUrl);

  const { className, sectionName } = extractStudentMeta(voucher, null);
  const studentName = voucher?.studentName || 'N/A';
  const registrationNo = voucher?.registrationNo || 'N/A';

  // Header
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 10, 20, 20);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(instituteName.toUpperCase(), logoImg ? 40 : 15, 20);
  
  doc.setFontSize(10);
  doc.text('OFFICIAL PAYMENT RECEIPT', logoImg ? 40 : 15, 27);
  
  doc.setDrawColor(200);
  doc.line(15, 35, 195, 35);

  let currentY = 45;

  // Receipt Details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(String(payment.receipt_number || payment.id), 40, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 135, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(payment.payment_date || new Date()), 155, currentY);

  currentY += 10;

  // Student Info Box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 20, 'F');
  
  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Student:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(studentName, 45, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Reg No:', 110, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(registrationNo, 135, currentY);

  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Class:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${className} - ${sectionName}`, 45, currentY);

  currentY += 15;

  // Table
  const currentPaid = Number(payment.amount_paid || 0);
  autoTable(doc, {
    startY: currentY,
    margin: { left: 15, right: 15 },
    head: [['Description', 'Method', 'Amount Paid']],
    body: [
      [
        `Fee Payment for ${formatMonth(voucher)}`,
        payment.payment_method?.toUpperCase() || 'CASH',
        `PKR ${currentPaid.toFixed(2)}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85] }
  });

  const finalY = doc.lastAutoTable?.finalY || (currentY + 20);
  currentY = finalY + 15;

  // Totals
  const netAmount = Number(voucher.net_amount || voucher.netAmount || voucher.amount || 0);
  const totalPaid = Number(voucher.paid_amount || 0);
  const remaining = Number(voucher.pending_amount || 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Voucher Amount:', 120, currentY);
  doc.text(`PKR ${netAmount.toFixed(2)}`, 195, currentY, { align: 'right' });

  doc.text('Paid Amount:', 120, currentY + 8);
  doc.text(`PKR ${totalPaid.toFixed(2)}`, 195, currentY + 8, { align: 'right' });

  doc.line(120, currentY + 12, 195, currentY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('Balance Remaining:', 120, currentY + 18);
  doc.text(`PKR ${remaining.toFixed(2)}`, 195, currentY + 18, { align: 'right' });

  // Footer
  currentY += 40;
  doc.setTextColor(30, 41, 59);
  doc.line(15, currentY, 75, currentY);
  doc.text('Authorized Sign', 45, currentY + 5, { align: 'center' });

  doc.line(135, currentY, 195, currentY);
  doc.text('Office Stamp', 165, currentY + 5, { align: 'center' });

  return doc.output('blob');
};

export const generateStudentAccountStatementPdfBlob = async ({ student, vouchers = [], payments = [], instituteName, logoUrl }) => {
  const doc = new jsPDF();
  const logoImg = await loadLogo(logoUrl);

  // 1. Header
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 10, 20, 20);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text(instituteName.toUpperCase(), logoImg ? 40 : 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL STUDENT ACCOUNT STATEMENT', logoImg ? 40 : 15, 27);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 35, 195, 35);

  let currentY = 45;

  // 2. Student & Statement Info Box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 26, 'F');
  
  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Student Details', 20, currentY);
  doc.text('Statement Summary', 110, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${student.first_name || student.name || 'N/A'} ${student.last_name || ''}`, 20, currentY);
  
  // Calculate summary values
  const totalInvoiced = vouchers.reduce((sum, v) => sum + Number(v.net_amount || v.netAmount || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || p.amountPaid || 0), 0);
  const outstanding = Math.max(totalInvoiced - totalPaid, 0);

  doc.text(`Total Invoiced: PKR ${totalInvoiced.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`, 110, currentY);

  currentY += 5;
  doc.text(`Reg No: ${student.registration_no || student.registrationNo || 'N/A'}`, 20, currentY);
  doc.text(`Total Paid: PKR ${totalPaid.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`, 110, currentY);

  currentY += 5;
  const studentDetails = student.details?.studentDetails || student;
  const className = studentDetails.class_name || student.className || 'N/A';
  const sectionName = studentDetails.section_name || student.sectionName || 'N/A';
  doc.text(`Class: ${className} - ${sectionName}`, 20, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`Outstanding Balance: PKR ${outstanding.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`, 110, currentY);

  currentY += 12;

  // 3. Compile Ledger Entries (Sorted by Date)
  const entries = [];

  // Vouchers as debits
  vouchers.forEach(v => {
    entries.push({
      date: new Date(v.issued_date || v.issuedDate || v.createdAt),
      type: 'Voucher',
      reference: `Voucher #${v.voucher_number || v.voucherNumber} (${formatMonth(v)})`,
      debit: Number(v.net_amount || v.netAmount || 0),
      credit: 0
    });
  });

  // Payments as credits
  payments.forEach(p => {
    entries.push({
      date: new Date(p.payment_date || p.paymentDate || p.createdAt),
      type: 'Receipt',
      reference: `Receipt #${p.receipt_number || p.receiptNo || p.id} for Voucher #${p.voucher_number || p.voucherNumber || ''}`,
      debit: 0,
      credit: Number(p.amount_paid || p.amountPaid || 0)
    });
  });

  // Sort entries ascending by date
  entries.sort((a, b) => a.date - b.date);

  // Compute rolling balance
  let runningBalance = 0;
  const tableRows = entries.map(entry => {
    runningBalance += (entry.debit - entry.credit);
    return [
      formatDate(entry.date),
      entry.type,
      entry.reference,
      entry.debit > 0 ? `PKR ${entry.debit.toLocaleString('en-PK', { minimumFractionDigits: 2 })}` : '—',
      entry.credit > 0 ? `PKR ${entry.credit.toLocaleString('en-PK', { minimumFractionDigits: 2 })}` : '—',
      `PKR ${runningBalance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`
    ];
  });

  // 4. Render Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: 15, right: 15 },
    head: [['Date', 'Type', 'Reference / Details', 'Debit', 'Credit', 'Balance']],
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable?.finalY || (currentY + 20);
  currentY = finalY + 15;

  // 5. Signature Footer
  if (currentY > 260) {
    doc.addPage();
    currentY = 30;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Statement generated on ${formatDate(new Date())} from system logs.`, 15, currentY);

  currentY += 25;
  doc.setDrawColor(200);
  doc.line(15, currentY, 75, currentY);
  doc.text('Prepared By', 45, currentY + 5, { align: 'center' });

  doc.line(135, currentY, 195, currentY);
  doc.text('Authorized Official Stamp', 165, currentY + 5, { align: 'center' });

  return doc.output('blob');
};