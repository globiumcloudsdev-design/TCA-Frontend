import jsPDF from 'jspdf';
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

export const generateAndDownloadSLC = async ({ student, institute }) => {
  // Use A4 Portrait for certificates
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const logoImg = await loadLogo(institute?.logo_url || institute?.logo);
  
  const primaryColor = [15, 23, 42]; // slate-900
  const secondaryColor = [100, 116, 139]; // slate-500
  const borderColor = [226, 232, 240]; // slate-200
  
  // Outer Border
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 186, 273);

  let currentY = 30;

  // --- HEADER ---
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 20, 20, 25, 25);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...primaryColor);
  const instituteName = institute?.name || 'THE CLOUDS ACADEMY';
  doc.text(instituteName.toUpperCase(), 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(institute?.address || 'A Premium Educational Institution', 105, 38, { align: 'center' });
  if (institute?.phone) {
    doc.text(`Contact: ${institute.phone}`, 105, 43, { align: 'center' });
  }

  currentY = 60;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('SCHOOL LEAVING CERTIFICATE', 105, currentY, { align: 'center' });

  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(1);
  doc.line(30, currentY + 5, 180, currentY + 5);

  currentY += 25;

  // --- STUDENT DETAILS ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryColor);

  const studentDetails = student.details?.studentDetails || {};
  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
  const fatherName = studentDetails.father_name || studentDetails.guardians?.[0]?.name || student.guardians?.[0]?.name || 'N/A';
  const regNo = student.registration_no || studentDetails.roll_no || 'N/A';
  const admissionDate = studentDetails.admission_date ? format(new Date(studentDetails.admission_date), 'dd MMMM yyyy') : 'N/A';
  const dob = student.date_of_birth || studentDetails.date_of_birth ? format(new Date(student.date_of_birth || studentDetails.date_of_birth), 'dd MMMM yyyy') : 'N/A';
  
  const lineHeight = 12;

  const fields = [
    { label: 'Registration Number:', value: regNo },
    { label: 'Name of Pupil:', value: fullName.toUpperCase() },
    { label: "Father's / Guardian's Name:", value: fatherName.toUpperCase() },
    { label: 'Date of Birth:', value: dob },
    { label: 'Date of Admission:', value: admissionDate },
    { label: 'Class/Section Admitted In:', value: `${studentDetails.class_name || 'N/A'} ${studentDetails.section_name ? `(${studentDetails.section_name})` : ''}` },
    { label: 'Date of Leaving:', value: format(new Date(), 'dd MMMM yyyy') },
    { label: 'Reason for Leaving:', value: 'Completed Academic Tenure / Upon Parents Request' },
    { label: 'Character & Conduct:', value: 'Good / Satisfactory' },
  ];

  fields.forEach(field => {
    doc.setFont('helvetica', 'bold');
    doc.text(field.label, 25, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(field.value, 90, currentY);
    
    // Dotted line
    doc.setDrawColor(...borderColor);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(90, currentY + 1, 185, currentY + 1);
    doc.setLineDashPattern([], 0);

    currentY += lineHeight;
  });

  currentY += 15;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  
  const statement = `This is to certify that ${fullName} son/daughter of ${fatherName} was a bonafide student of this institution. All dues towards the institution have been cleared. We wish the student success in all future endeavors.`;
  
  const splitStatement = doc.splitTextToSize(statement, 160);
  doc.text(splitStatement, 25, currentY);

  // --- FOOTER & SIGNATURES ---
  const signatureY = 240;
  
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  
  doc.line(25, signatureY, 80, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Prepared By / Clerk', 52.5, signatureY + 6, { align: 'center' });
  
  doc.line(130, signatureY, 185, signatureY);
  doc.text('Principal / Headmaster', 157.5, signatureY + 6, { align: 'center' });

  // Watermark/Generated Stamp
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')} by The Clouds Academy Management System`, 105, 270, { align: 'center' });
  
  doc.save(`SLC_${regNo}_${fullName.replace(/\s+/g, '_')}.pdf`);
};
