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

export const generateMarkSheet = async (students, exam, subjectSchedules, institute) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  
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
  doc.text('CONSOLIDATED CLASS MARK SHEET', logoImg ? 45 : 15, 30);
  
  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 282, 38);
  
  let currentY = 48;

  // --- EXAM & CLASS DETAILS ---
  const examName = exam.name || 'Exam';
  
  let className = 'Class';
  if (students.length > 0) {
    const studentInfo = students[0].student || students[0];
    if (studentInfo.details?.studentDetails) {
      className = studentInfo.details.studentDetails.class_name || 'Class';
    } else if (studentInfo.academicSessions && studentInfo.academicSessions.length > 0) {
      className = studentInfo.academicSessions[0].class_name || 'Class';
    }
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Examination:', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(examName.toUpperCase(), 42, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Class/Section:', 120, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(className.toUpperCase(), 148, currentY);
  
  currentY += 12;
  
  // --- TABLE DATA ---
  const tableHeaders = ['S.No', 'Roll No', 'Student Name'];
  
  let totalExamMarks = 0;
  subjectSchedules.forEach(subject => {
    tableHeaders.push(`${subject.subject_name.toUpperCase()}\n(${subject.total_marks || 0})`);
    totalExamMarks += (subject.total_marks || 0);
  });
  
  tableHeaders.push('Total\nObtained', 'Percentage', 'Result');
  
  const tableBody = students.map((student, index) => {
    const studentInfo = student.student || student;
    const fullName = `${studentInfo.first_name || ''} ${studentInfo.last_name || ''}`.trim().toUpperCase();
    const rollNo = studentInfo.roll_number || studentInfo.registration_no || 'N/A';
    
    const row = [index + 1, rollNo, fullName];
    
    let totalObtained = 0;
    let hasFailed = false;
    const isAbsent = !student.is_present && student.absent_reason;
    
    subjectSchedules.forEach(subject => {
      let marks = 0;
      
      if (isAbsent) {
        row.push('ABS');
        hasFailed = true;
      } else {
        if (student.subject_marks && Array.isArray(student.subject_marks)) {
          const subjectMark = student.subject_marks.find(sm => sm.subject_id === subject.subject_id);
          marks = subjectMark ? subjectMark.marks_obtained : 0;
        } 
        
        row.push(marks);
        totalObtained += marks;
        
        const passMarks = subject.pass_marks || Math.round((subject.total_marks || 100) * 0.4);
        if (marks < passMarks) {
          hasFailed = true;
        }
      }
    });
    
    if (isAbsent) {
      row.push(0, '0%', 'ABSENT');
    } else {
      const percentage = totalExamMarks > 0 ? (totalObtained / totalExamMarks) * 100 : 0;
      row.push(
        totalObtained,
        `${percentage.toFixed(1)}%`,
        hasFailed ? 'FAIL' : 'PASS'
      );
    }
    
    return row;
  });
  
  // Render Table
  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid',
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      textColor: [30, 41, 59]
    },
    columnStyles: {
      2: { halign: 'left', fontStyle: 'bold', cellPadding: { left: 4 } }
    },
    styles: { cellPadding: 4 },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === tableHeaders.length - 1) {
        if (data.cell.raw === 'FAIL' || data.cell.raw === 'ABSENT') {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  // --- FOOTER & SIGNATURES ---
  let signatureY = doc.lastAutoTable?.finalY + 25 || currentY + 25;
  if (signatureY > 180) { // Since A4 Landscape height is 210mm
    doc.addPage();
    signatureY = 30;
  }
  
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  
  doc.line(15, signatureY, 75, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text('Prepared By / Class Teacher', 45, signatureY + 5, { align: 'center' });
  
  doc.line(222, signatureY, 282, signatureY);
  doc.text('Principal Signature / Stamp', 252, signatureY + 5, { align: 'center' });

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 282, 195, { align: 'right' });
    doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')} by The Clouds Academy`, 148, 195, { align: 'center' });
  }
  
  doc.save(`Mark_Sheet_${exam.name.replace(/\s+/g, '_')}.pdf`);
};
