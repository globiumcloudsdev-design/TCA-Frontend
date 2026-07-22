import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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

export const generateSalarySlip = async ({ teacher, payslip, institute }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const logoImg = await loadLogo(institute?.logo_url || institute?.logo);
  const primaryColor = [15, 23, 42];
  const secondaryColor = [100, 116, 139];
  const borderColor = [226, 232, 240];
  
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 12, 22, 22);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  const instituteName = institute?.name || 'THE CLOUDS ACADEMY';
  doc.text(instituteName.toUpperCase(), logoImg ? 45 : 15, 22);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`SALARY SLIP - ${payslip.month || ''} ${payslip.year || ''}`.toUpperCase(), logoImg ? 45 : 15, 30);
  
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);
  
  let currentY = 45;
  
  const fullName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
  const employeeId = teacher.registration_no || teacher.details?.teacherDetails?.employee_id || 'N/A';
  const designation = teacher.details?.teacherDetails?.designation || 'Teacher';
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, currentY, 180, 25, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('Employee Name:', 20, currentY + 9);
  doc.text('Designation:', 20, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(fullName.toUpperCase(), 55, currentY + 9);
  doc.text(designation, 55, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('Employee ID:', 120, currentY + 9);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(employeeId, 150, currentY + 9);

  currentY += 35;
  
  // Earnings & Deductions Tables side-by-side
  const basicSalary = Number(payslip.basic_salary) || 0;
  const allowances = Number(payslip.total_allowances) || 0;
  const deductions = Number(payslip.total_deductions) || 0;
  const netSalary = Number(payslip.net_salary) || 0;

  const earningsData = [
    ['Basic Salary', `Rs. ${basicSalary.toLocaleString()}`],
    ['Allowances', `Rs. ${allowances.toLocaleString()}`]
  ];
  
  const deductionsData = [
    ['Total Deductions', `Rs. ${deductions.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 15, right: 110 },
    head: [['Earnings', 'Amount']],
    body: earningsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } }
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: 105, right: 15 },
    head: [['Deductions', 'Amount']],
    body: deductionsData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } }
  });

  currentY = Math.max(doc.lastAutoTable.finalY) + 10;

  // Net Salary Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...borderColor);
  doc.rect(15, currentY, 180, 15, 'FD');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Net Salary Payable:', 20, currentY + 10);
  doc.text(`Rs. ${netSalary.toLocaleString()}`, 180, currentY + 10, { align: 'right' });

  currentY += 30;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Status: ${(payslip.status || 'Paid').toUpperCase()}`, 15, currentY);
  if (payslip.paid_on) {
    doc.text(`Paid On: ${format(new Date(payslip.paid_on), 'dd MMM yyyy')}`, 15, currentY + 6);
  }

  // Footer Signatures
  currentY += 40;
  doc.setDrawColor(100);
  doc.line(20, currentY, 80, currentY);
  doc.line(130, currentY, 190, currentY);
  
  doc.setFontSize(10);
  doc.text('Employer Signature', 50, currentY + 6, { align: 'center' });
  doc.text('Employee Signature', 160, currentY + 6, { align: 'center' });

  // Timestamp
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 105, 285, { align: 'center' });
  
  doc.save(`${fullName.replace(/\s+/g, '_')}_Payslip_${payslip.month}_${payslip.year}.pdf`);
};
