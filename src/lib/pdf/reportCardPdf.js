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

/**
 * Calculates grade based on percentage
 */
const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', remarks: 'Excellent', color: [16, 185, 129] }; // emerald-500
  if (percentage >= 80) return { grade: 'A', remarks: 'Very Good', color: [59, 130, 246] }; // blue-500
  if (percentage >= 70) return { grade: 'B', remarks: 'Good', color: [168, 85, 247] }; // purple-500
  if (percentage >= 60) return { grade: 'C', remarks: 'Satisfactory', color: [234, 179, 8] }; // yellow-500
  if (percentage >= 50) return { grade: 'D', remarks: 'Needs Improvement', color: [249, 115, 22] }; // orange-500
  return { grade: 'F', remarks: 'Fail', color: [239, 68, 68] }; // red-500
};

export const generateReportCard = async (student, exam, subjectSchedules, studentMarks, institute, isAbsent = false) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const logoImg = await loadLogo(institute?.logo_url || institute?.logo);
  
  const primaryColor = [15, 23, 42]; // slate-900
  const secondaryColor = [100, 116, 139]; // slate-500
  const borderColor = [226, 232, 240]; // slate-200
  
  // --- HEADER ---
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
  doc.text('ACADEMIC REPORT CARD', logoImg ? 45 : 15, 30);
  
  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);
  
  let currentY = 48;
  
  // --- STUDENT PROFILE ---
  const studentInfo = student.student || student;
  const fullName = `${studentInfo.first_name || ''} ${studentInfo.last_name || ''}`.trim();
  const rollNo = studentInfo.roll_number || studentInfo.registration_no || 'N/A';
  
  let className = 'N/A';
  let sectionName = 'N/A';
  if (studentInfo.details?.studentDetails) {
    className = studentInfo.details.studentDetails.class_name || 'N/A';
    sectionName = studentInfo.details.studentDetails.section_name || 'N/A';
  } else if (studentInfo.academicSessions && studentInfo.academicSessions.length > 0) {
    className = studentInfo.academicSessions[0].class_name || 'N/A';
    sectionName = studentInfo.academicSessions[0].section_name || 'N/A';
  }

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, currentY, 180, 25, 3, 3, 'FD');
  
  doc.setFontSize(10);
  
  // Left side
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('Student Name:', 20, currentY + 9);
  doc.text('Class & Section:', 20, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(fullName.toUpperCase(), 55, currentY + 9);
  doc.text(`${className} / ${sectionName}`, 55, currentY + 18);
  
  // Right side
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('Roll / Reg No:', 120, currentY + 9);
  doc.text('Examination:', 120, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(rollNo, 150, currentY + 9);
  doc.text(exam.name.toUpperCase(), 150, currentY + 18);

  currentY += 35;

  // --- MARKS TABLE ---
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;
  let hasFailedSubject = false;

  const tableBody = subjectSchedules.map(subject => {
    const maxMarks = subject.total_marks || 0;
    const passMarks = subject.pass_marks || Math.round(maxMarks * 0.4);
    totalMaxMarks += maxMarks;
    
    if (isAbsent) {
      return [subject.subject_name.toUpperCase(), maxMarks, passMarks, 'ABSENT', '-', 'Absent'];
    }
    
    const obtained = studentMarks[subject.subject_id] !== undefined ? studentMarks[subject.subject_id] : 0;
    totalObtainedMarks += obtained;
    
    const percentage = maxMarks > 0 ? (obtained / maxMarks) * 100 : 0;
    const gradeInfo = getGrade(percentage);
    
    if (obtained < passMarks) hasFailedSubject = true;
    
    return [
      subject.subject_name.toUpperCase(),
      maxMarks.toString(),
      passMarks.toString(),
      obtained.toString(),
      gradeInfo.grade,
      gradeInfo.remarks
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Subject', 'Total Marks', 'Passing Marks', 'Obtained Marks', 'Grade', 'Remarks']],
    body: tableBody,
    theme: 'grid',
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center',
      valign: 'middle',
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' }
    },
    styles: { cellPadding: 4 }
  });

  // --- PERFORMANCE SUMMARY ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const overallPercentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
  const overallGrade = isAbsent ? getGrade(0) : getGrade(overallPercentage);
  
  let finalResult = 'PASS';
  if (isAbsent) finalResult = 'ABSENT';
  else if (hasFailedSubject || overallPercentage < 40) finalResult = 'FAIL';
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(15, finalY, 180, 25, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text('TOTAL MARKS', 25, finalY + 10);
  doc.text('PERCENTAGE', 70, finalY + 10);
  doc.text('OVERALL GRADE', 115, finalY + 10);
  doc.text('FINAL RESULT', 160, finalY + 10);
  
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`${totalObtainedMarks} / ${totalMaxMarks}`, 25, finalY + 18);
  doc.text(`${isAbsent ? '0' : overallPercentage.toFixed(2)}%`, 70, finalY + 18);
  
  doc.setTextColor(...overallGrade.color);
  doc.text(`${overallGrade.grade}`, 115, finalY + 18);
  
  doc.setTextColor(...(finalResult === 'PASS' ? [16, 185, 129] : [239, 68, 68]));
  doc.text(`${finalResult}`, 160, finalY + 18);

  // --- FOOTER & SIGNATURES ---
  let signatureY = finalY + 55;
  if (signatureY > 260) {
    doc.addPage();
    signatureY = 40;
  }
  
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  
  doc.line(15, signatureY, 75, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text('Class Teacher Signature', 45, signatureY + 5, { align: 'center' });
  
  doc.line(135, signatureY, 195, signatureY);
  doc.text('Principal Signature / Stamp', 165, signatureY + 5, { align: 'center' });
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')} by The Clouds Academy`, 105, 285, { align: 'center' });
  
  doc.save(`${fullName.replace(/\s+/g, '_')}_Report_Card.pdf`);
};
