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
  const feeType = formatFeeType(voucher?.fee_type || voucher?.feeType);
  const netAmount = Number(voucher?.net_amount || voucher?.netAmount || voucher?.amount || 0);
  const safeAmount = isNaN(netAmount) ? 0 : netAmount;

  // Return strictly the main fee type and amount as requested
  return [[feeType, safeAmount.toFixed(2)]];
};

/**
 * Render 3 copies (Bank, School, Parent) on a single page
 */
const renderVoucherPage = (doc, { voucher, student, instituteName, logoImg }) => {
  const sectionWidth = 190;
  const sectionX = 10;
  const sectionHeight = 90; 
  const sectionGap = 4;
  
  const { className, sectionName } = extractStudentMeta(voucher, student);
  const studentName = voucher?.studentName || student?.name || 'Student';
  const registrationNo = voucher?.registrationNo || voucher?.registration_no || student?.registrationNo || 'N/A';
  const voucherNo = voucher?.voucherNumber || voucher?.voucher_number || 'N/A';
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

// --------------------------------------------------------------------------------
// EXPORTS
// --------------------------------------------------------------------------------

export const generateFeeVoucherPdfBlob = async ({ voucher, student, instituteName, logoUrl }) => {
  const doc = new jsPDF();
  const logoImg = await loadLogo(logoUrl);
  renderVoucherPage(doc, { voucher, student, instituteName, logoImg });
  return doc.output('blob');
};

export const generateBulkFeeVouchersPdfBlob = async ({ vouchers, instituteName, logoUrl }) => {
  const doc = new jsPDF();
  const logoImg = await loadLogo(logoUrl);

  for (let i = 0; i < vouchers.length; i++) {
    if (i > 0) doc.addPage();
    const v = vouchers[i];
    const s = v.student || v;
    renderVoucherPage(doc, { voucher: v, student: s, instituteName, logoImg });
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