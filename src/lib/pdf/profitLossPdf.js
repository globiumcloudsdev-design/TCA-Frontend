import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-PK', { minimumFractionDigits: 2 });
};

export const generateProfitLossPdfBlob = async ({ summary, monthlyTrends, filters, instituteName, logoUrl }) => {
  const doc = new jsPDF();
  const logoImg = await loadLogo(logoUrl);

  const primaryColor = [15, 23, 42]; // slate-900
  const secondaryColor = [100, 116, 139]; // slate-500
  const accentColor = [16, 185, 129]; // emerald-500
  const dangerColor = [239, 68, 68]; // red-500

  // --- HEADER ---
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 12, 22, 22);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text(instituteName.toUpperCase(), logoImg ? 45 : 15, 22);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text('FINANCIAL PROFIT & LOSS REPORT', logoImg ? 45 : 15, 30);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);

  let currentY = 48;

  // --- REPORT METADATA ---
  const monthText = filters?.month && filters.month !== 'all' 
    ? format(new Date(2000, parseInt(filters.month) - 1, 1), 'MMMM') 
    : 'All Months';
  const yearText = filters?.year && filters.year !== 'all' ? filters.year : 'All Time';

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Reporting Period:', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${monthText} ${yearText}`, 50, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Generated On:', 120, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'dd MMM yyyy, hh:mm a'), 150, currentY);

  currentY += 12;

  // --- FINANCIAL SUMMARY BOX ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.roundedRect(15, currentY, 180, 45, 3, 3, 'FD'); // Filled and Stroked with rounded corners

  currentY += 10;
  
  // Summary Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  
  doc.text('TOTAL INCOME', 25, currentY);
  doc.text('TOTAL EXPENSES', 65, currentY);
  doc.text('TOTAL PAYROLL', 110, currentY);
  doc.text('NET PROFIT / LOSS', 155, currentY);

  currentY += 8;

  // Summary Values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  
  doc.text(`PKR ${formatCurrency(summary?.total_income_raw)}`, 25, currentY);
  doc.text(`PKR ${formatCurrency(summary?.total_expense_raw)}`, 65, currentY);
  doc.text(`PKR ${formatCurrency(summary?.total_payroll_raw)}`, 110, currentY);

  const isProfitable = summary?.is_profitable;
  doc.setTextColor(...(isProfitable ? accentColor : dangerColor));
  doc.text(`PKR ${formatCurrency(summary?.net_profit_raw)}`, 155, currentY);

  currentY += 25;

  // --- MONTHLY BREAKDOWN TABLE ---
  if (monthlyTrends && monthlyTrends.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Monthly Breakdown', 15, currentY);
    
    currentY += 6;

    const tableRows = monthlyTrends.map(trend => {
      const profit = Number(trend.income) - (Number(trend.expense) + Number(trend.payroll));
      return [
        trend.month,
        `PKR ${formatCurrency(trend.income)}`,
        `PKR ${formatCurrency(trend.expense)}`,
        `PKR ${formatCurrency(trend.payroll)}`,
        `PKR ${formatCurrency(profit)}`
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: 15, right: 15 },
      head: [['Month', 'Income (Fees)', 'Operating Expenses', 'Payroll', 'Net Profit']],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4) {
          const rawValue = data.cell.raw.toString().replace(/[^0-9.-]+/g,"");
          if (Number(rawValue) >= 0) {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald
          } else {
            data.cell.styles.textColor = [239, 68, 68]; // Red
          }
        }
      }
    });

    currentY = doc.lastAutoTable?.finalY + 15 || currentY + 15;
  }

  // --- FOOTER & SIGNATURES ---
  if (currentY > 250) {
    doc.addPage();
    currentY = 30;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text(`This is a system-generated financial report. No physical signature is required.`, 15, currentY);

  currentY += 25;
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  
  doc.line(15, currentY, 75, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('Accountant / Finance Officer', 45, currentY + 5, { align: 'center' });

  doc.line(135, currentY, 195, currentY);
  doc.text('Authorized Director Stamp', 165, currentY + 5, { align: 'center' });

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    doc.text(`The Clouds Academy - Financial Systems`, 15, 285);
  }

  return doc.output('blob');
};
