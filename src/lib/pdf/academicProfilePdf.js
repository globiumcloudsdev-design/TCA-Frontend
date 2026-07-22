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

export const generateAcademicProfile = async ({ student, session, institute }) => {
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
  doc.text('ACADEMIC SESSION FULL REPORT', logoImg ? 45 : 15, 30);
  
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);
  
  let currentY = 48;
  
  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
  const rollNo = session.roll_no || student.registration_no || 'N/A';
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, currentY, 180, 25, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('Student Name:', 20, currentY + 9);
  doc.text('Class & Section:', 20, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(fullName.toUpperCase(), 55, currentY + 9);
  doc.text(`${session.class_name || 'N/A'} / ${session.section_name || 'N/A'}`, 55, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('Roll / Reg No:', 120, currentY + 9);
  doc.text('Academic Year:', 120, currentY + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(rollNo, 150, currentY + 9);
  doc.text(session.academic_year_name || 'N/A', 150, currentY + 18);

  currentY += 35;

  // Find exams for this academic session
  const exams = (student.examResults || []).filter(e => e.academic_year_id === session.academic_year_id || !e.academic_year_id);
  
  doc.setFontSize(14);
  doc.text('Term Examinations', 15, currentY);
  currentY += 5;

  if (exams.length > 0) {
    const tableData = exams.map(e => [
      e.exam_name || e.exam?.name || 'Term Exam',
      `${e.total_marks_obtained || 0} / ${e.total_marks || 0}`,
      `${parseFloat(e.percentage || 0).toFixed(1)}%`,
      e.grade || '-',
      (e.status || '').toUpperCase()
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Exam Name', 'Marks Obtained', 'Percentage', 'Grade', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
    });
    currentY = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...secondaryColor);
    doc.text('No exam records found for this academic session.', 15, currentY + 5);
    currentY += 15;
  }

  // Find assignments for this academic session
  const assignmentSubmissions = (student.assignmentSubmissions || []).filter(sub => 
    sub.assignment && (sub.assignment.academic_year_id === session.academic_year_id || !sub.assignment.academic_year_id)
  );

  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Assignments & Projects', 15, currentY);
  currentY += 5;

  if (assignmentSubmissions.length > 0) {
    const assignmentData = assignmentSubmissions.map(sub => {
      const a = sub.assignment || {};
      const statusStr = (sub.status || 'Submitted').toUpperCase();
      const score = sub.marks !== null && sub.marks !== undefined 
        ? `${sub.marks} / ${a.total_marks || 0}`
        : 'Pending';

      return [
        a.title || 'Untitled',
        a.subject || '-',
        a.due_date ? format(new Date(a.due_date), 'dd MMM yyyy') : '-',
        statusStr,
        score
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Assignment Title', 'Subject', 'Due Date', 'Status', 'Score']],
      body: assignmentData,
      theme: 'grid',
      headStyles: { fillColor: [45, 106, 159], textColor: 255 }, // Dark blue distinct from primary
      styles: { fontSize: 9 }
    });
    currentY = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...secondaryColor);
    doc.text('No assignments found for this academic session.', 15, currentY + 5);
    currentY += 15;
  }

  // Attendance or other info can be added here if available
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Summary', 15, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Status: ${(session.status || '').toUpperCase()}`, 15, currentY);
  doc.text(`Start Date: ${session.start_date ? format(new Date(session.start_date), 'dd MMM yyyy') : 'N/A'}`, 15, currentY + 6);
  doc.text(`End Date: ${session.end_date ? format(new Date(session.end_date), 'dd MMM yyyy') : 'N/A'}`, 15, currentY + 12);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')} by The Clouds Academy Management System`, 105, 285, { align: 'center' });
  
  doc.save(`${fullName.replace(/\s+/g, '_')}_Academic_Profile_${session.academic_year_name || 'Session'}.pdf`);
};
