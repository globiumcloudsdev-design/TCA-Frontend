import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --------------------------------------------------------------------------------
// UTILS
// --------------------------------------------------------------------------------

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
  if (!type) return 'MONTHLY';
  return String(type).toUpperCase();
};

/**
 * Robust extraction of class and section names with multiple fallbacks
 */
const extractStudentMeta = (voucher, student) => {
  // Try to find class name
  let className = 
    voucher?.class_name ||
    voucher?.className ||
    student?.class_name ||
    student?.className ||
    student?.details?.studentDetails?.class_name ||
    student?.details?.class_name ||
    student?.class ||
    voucher?.student?.class_name ||
    voucher?.student?.className ||
    voucher?.student?.Class?.name ||
    student?.Class?.name ||
    'N/A';

  // Try to find section name
  let sectionName =
    voucher?.section_name ||
    voucher?.sectionName ||
    student?.section_name ||
    student?.sectionName ||
    student?.details?.studentDetails?.section_name ||
    student?.details?.section_name ||
    student?.section ||
    voucher?.student?.section_name ||
    voucher?.student?.sectionName ||
    voucher?.student?.Section?.name ||
    student?.Section?.name ||
    'N/A';

  // Clean N/A and undefined strings
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
  const feeType = formatFeeType(voucher?.fee_type || voucher?.feeType);
  const netAmount = Number(voucher?.net_amount || voucher?.netAmount || voucher?.amount || 0);
  const rows = [];

  // User requested ONLY the Fee Type in the description and the Net Amount
  // No breakdown for Admission, Lab, etc. in the description list
  rows.push([feeType, netAmount.toFixed(2)]);

  return rows;
};

const renderVoucherPage = (doc, { voucher, student, instituteName, logoImg }) => {
  const sectionWidth = 190;
  const sectionX = 10;
  const sectionHeight = 90; 
  const sectionGap = 3;
  const copyLabels = ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'];

  const { className, sectionName } = extractStudentMeta(voucher, student);
  const studentName = voucher?.studentName || student?.name || student?.full_name || (student?.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Student');
  const registrationNo = voucher?.registration_no || voucher?.registrationNo || student?.registration_no || 'N/A';
  const dueDate = formatDate(voucher?.due_date || voucher?.dueDate);
  const monthName = formatMonth(voucher);
  const voucherNo = voucher?.voucherNumber || voucher?.voucher_number || 'N/A';

  copyLabels.forEach((copyLabel, index) => {
    const sectionY = 8 + index * (sectionHeight + sectionGap);
    
    // Border Box
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(sectionX, sectionY, sectionWidth, sectionHeight);

    // Vertical Divider for Logo section
    doc.line(sectionX + 45, sectionY, sectionX + 45, sectionY + 18);

    // Header Area
    if (logoImg) {
      try { doc.addImage(logoImg, 'PNG', sectionX + 2, sectionY + 2, 12, 12); } catch (e) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(instituteName, sectionX + 16, sectionY + 8);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(copyLabel, sectionX + 16, sectionY + 12);

    // Voucher Stats Row (Inside Header Area)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Voucher #:', sectionX + 48, sectionY + 6);
    doc.text('Month:', sectionX + 48, sectionY + 11);
    doc.text('Due Date:', sectionX + 48, sectionY + 16);

    doc.setFont('helvetica', 'normal');
    doc.text(String(voucherNo), sectionX + 65, sectionY + 6);
    doc.text(String(monthName), sectionX + 65, sectionY + 11);
    doc.setTextColor(200, 0, 0);
    doc.text(String(dueDate), sectionX + 65, sectionY + 16);
    doc.setTextColor(0);

    // Horizontal Divider
    doc.line(sectionX, sectionY + 18, sectionX + sectionWidth, sectionY + 18);

    // Student Info Grid
    doc.setFillColor(252);
    doc.rect(sectionX + 0.1, sectionY + 18.1, sectionWidth - 0.2, 12, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', sectionX + 5, sectionY + 24);
    doc.text('Registration #:', sectionX + 5, sectionY + 28);
    doc.text('Class / Section:', sectionX + 100, sectionY + 24);

    doc.setFont('helvetica', 'normal');
    doc.text(String(studentName), sectionX + 30, sectionY + 24);
    doc.text(String(registrationNo), sectionX + 30, sectionY + 28);
    doc.text(`${className} - ${sectionName}`, sectionX + 125, sectionY + 24);

    // Fee Table
    const feeRows = buildFeeRows(voucher);
    autoTable(doc, {
      startY: sectionY + 31,
      margin: { left: sectionX + 2, right: sectionX + 2 },
      tableWidth: 120,
      head: [['Description', 'Amount (PKR)']],
      body: feeRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [60, 60, 60], textColor: 255 },
      columnStyles: { 1: { halign: 'right' } }
    });

    // Total and Signature area on the right
    const rightSideX = sectionX + 128;
    const rightSideY = sectionY + 40;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAYABLE', rightSideX, rightSideY);
    
    doc.setFontSize(12);
    const netAmount = Number(voucher?.netAmount || voucher?.amount || 0);
    doc.text(`${netAmount.toFixed(2)}`, rightSideX, rightSideY + 7);
    
    doc.setDrawColor(180);
    doc.line(rightSideX, rightSideY + 9, rightSideX + 55, rightSideY + 9);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Bank Stamp / Auth. Signature', rightSideX, sectionY + sectionHeight - 6);

    // Footer Note
    doc.setFontSize(6);
    doc.text('* Late fee may apply after due date.', sectionX + 5, sectionY + sectionHeight - 3);

    // Divider for cutting
    if (index < 2) {
      doc.setDrawColor(150);
      doc.setLineDash([1, 1], 0);
      doc.line(0, sectionY + sectionHeight + (sectionGap / 2), 210, sectionY + sectionHeight + (sectionGap / 2));
      doc.setLineDash([], 0);
    }
  });
};

// --------------------------------------------------------------------------------
// EXPORTS
// --------------------------------------------------------------------------------

export const generateBulkFeeVouchersPdfBlob = async ({ vouchers = [], instituteName = 'School System', logoUrl = null }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const logoImg = await loadLogo(logoUrl);

  for (let i = 0; i < vouchers.length; i++) {
    if (i > 0) doc.addPage();
    renderVoucherPage(doc, { 
      voucher: vouchers[i], 
      student: vouchers[i].student || {}, 
      instituteName,
      logoImg
    });
  }

  return doc.output('blob');
};

export const generateFeeVoucherPdfBlob = async ({ voucher, student, instituteName = 'School System', logoUrl = null }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const logoImg = await loadLogo(logoUrl);
  
  renderVoucherPage(doc, { voucher, student, instituteName, logoImg });
  return doc.output('blob');
};

export const generateFeeReceiptPdfBlob = async ({ payment = {}, voucher = {}, student = {}, instituteName = 'School System', logoUrl = null }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const logoImg = await loadLogo(logoUrl);
  
  const { className, sectionName } = extractStudentMeta(voucher, student);
  const studentName = voucher?.studentName || student?.name || student?.full_name || (student?.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Student');
  const registrationNo = voucher?.registrationNo || student?.registration_no || 'N/A';

  // Header Box
  doc.setFillColor(60, 60, 60);
  doc.rect(0, 0, 210, 40, 'F');
  
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 7, 25, 25);
  }

  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(instituteName, logoImg ? 45 : 15, 22);
  doc.setFontSize(12);
  doc.text('FEE PAYMENT RECEIPT', logoImg ? 45 : 15, 32);

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Receipt Details Info
  let currentY = 55;
  
  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.receipt_number || payment.id || 'N/A', 45, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 15, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(payment.payment_date || new Date()), 45, currentY + 8);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.text('Voucher No:', 130, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.voucherNumber || voucher.voucher_no || 'N/A', 160, currentY);

  currentY += 25;

  // Student Section
  doc.setFillColor(245);
  doc.rect(15, currentY - 5, 180, 25, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Student:', 20, currentY + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(studentName, 45, currentY + 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Reg No:', 20, currentY + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(registrationNo, 45, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Class:', 120, currentY + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(className, 140, currentY + 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Section:', 120, currentY + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(sectionName, 140, currentY + 10);

  currentY += 35;

  // Payment Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: 15, right: 15 },
    head: [['Description', 'Payment Method', 'Amount Paid']],
    body: [
      [
        `Fee Payment for ${formatMonth(voucher)}`,
        payment.payment_method?.toUpperCase() || 'CASH',
        `PKR ${Number(payment.amount_paid || 0).toFixed(2)}`
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [60, 60, 60], textColor: 255 },
    columnStyles: { 2: { halign: 'right' } }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Totals Summary
  const netAmount = Number(voucher.net_amount || voucher.netAmount || voucher.amount || 0);
  const currentPaid = Number(payment.amount_paid || 0);
  const totalPaidSoFar = Number(voucher.paid_amount || 0);
  const remainingBalance = Number(voucher.pending_amount || 0);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary:', 130, currentY);
  doc.line(130, currentY + 2, 195, currentY + 2);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Voucher Total:', 130, currentY + 10);
  doc.text(`PKR ${netAmount.toFixed(2)}`, 195, currentY + 10, { align: 'right' });
  
  doc.text('Current Payment:', 130, currentY + 18);
  doc.text(`PKR ${currentPaid.toFixed(2)}`, 195, currentY + 18, { align: 'right' });
  
  doc.text('Total Paid:', 130, currentY + 26);
  doc.text(`PKR ${totalPaidSoFar.toFixed(2)}`, 195, currentY + 26, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  if (remainingBalance > 0) {
    doc.setTextColor(200, 0, 0);
  } else {
    doc.setTextColor(0, 150, 0);
  }
  doc.text('Balance Due:', 130, currentY + 34);
  doc.text(`PKR ${remainingBalance.toFixed(2)}`, 195, currentY + 34, { align: 'right' });
  doc.setTextColor(0);

  // Signatures
  currentY += 60;
  doc.setFont('helvetica', 'normal');
  doc.line(15, currentY, 75, currentY);
  doc.text('Student/Parent Signature', 15, currentY + 5);

  doc.line(135, currentY, 195, currentY);
  doc.text('Authorized Signature', 135, currentY + 5);

  return doc.output('blob');
};