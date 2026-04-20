// // // import { toast } from 'sonner';
// // // import { ID_CARD_THEME, getRoleTheme } from '@/constants/idCardTheme';

// // // const toText = (v, fallback = 'N/A') => (v === null || v === undefined || v === '' ? fallback : String(v));

// // // const normalizeInstitute = (institute = {}) => ({
// // //   name: institute?.name || institute?.school_name || 'School Name',
// // //   logo: institute?.logo_url || institute?.logo || '',
// // //   address: institute?.address || institute?.location?.address || '',
// // //   phone: institute?.phone || institute?.contact_no || institute?.contact || '',
// // //   email: institute?.email || '',
// // // });

// // // const normalizePerson = (person = {}, role = 'student') => {
// // //   const details = person?.details || person?.studentDetails || person?.teacherDetails || person?.staffDetails || {};
// // //   const firstName = person?.first_name || person?.firstName || person?.name?.split(' ')?.[0] || '';
// // //   const lastName = person?.last_name || person?.lastName || person?.name?.split(' ')?.slice(1)?.join(' ') || '';
// // //   const fullName = toText(`${firstName} ${lastName}`.trim() || person?.name, 'N/A');
// // //   const idByRole = {
// // //     student: person?.roll_no || person?.roll_number || person?.registration_no || details?.roll_no || details?.registration_no,
// // //     teacher: person?.registration_no || details?.employee_id || details?.teacher_id,
// // //     staff: details?.employee_id || person?.registration_no || person?.staff_id,
// // //     admin: person?.employee_id || person?.registration_no || person?.id,
// // //   };
// // //   return {
// // //     fullName,
// // //     fatherName: person?.father_name || details?.father_name || 'N/A',
// // //     idNo: toText(idByRole[role] || person?.id || person?.user_id),
// // //     designation: toText(
// // //       details?.designation || details?.department || person?.staff_type || person?.class_name || person?.class?.name || role,
// // //       role
// // //     ),
// // //     phone: toText(person?.phone || details?.phone, ''),
// // //     email: toText(person?.email || details?.email, ''),
// // //     avatar: person?.avatar_url || person?.photo || person?.image || '',
// // //     qrCode: person?.qr_code_url || person?.qr_code || details?.qr_code || '',
// // //   };
// // // };

// // // const drawRoundedCard = (doc, x, y, w, h, r) => {
// // //   doc.setDrawColor(...ID_CARD_THEME.card.borderColor);
// // //   doc.roundedRect(x, y, w, h, r, r, 'S');
// // // };

// // // const addImageSafe = (doc, data, x, y, w, h) => {
// // //   if (!data) return false;
// // //   try {
// // //     doc.addImage(data, 'PNG', x, y, w, h);
// // //     return true;
// // //   } catch {
// // //     return false;
// // //   }
// // // };

// // // const loadImageData = async (url) => {
// // //   if (!url) return null;
// // //   return new Promise((resolve) => {
// // //     const img = new Image();
// // //     img.crossOrigin = 'anonymous';
// // //     img.onload = () => {
// // //       try {
// // //         const canvas = document.createElement('canvas');
// // //         canvas.width = img.width;
// // //         canvas.height = img.height;
// // //         const ctx = canvas.getContext('2d');
// // //         ctx?.drawImage(img, 0, 0);
// // //         resolve(canvas.toDataURL('image/png'));
// // //       } catch {
// // //         resolve(null);
// // //       }
// // //     };
// // //     img.onerror = () => resolve(null);
// // //     img.src = url;
// // //   });
// // // };

// // // const drawFront = (doc, x, y, w, h, institute, person, roleTheme, logoData, avatarData, roleKey) => {
// // //   const front = ID_CARD_THEME.front;
// // //   const radius = ID_CARD_THEME.card.radius;

// // //   doc.setFillColor(...front.backgroundColor);
// // //   doc.roundedRect(x, y, w, h, radius, radius, 'F');
// // //   drawRoundedCard(doc, x, y, w, h, radius);

// // //   doc.setFillColor(...front.topBandColor);
// // //   doc.roundedRect(x, y, w, front.topBandHeight, radius, radius, 'F');

// // //   doc.setFillColor(...roleTheme.accentColor);
// // //   doc.rect(x, y + front.topBandHeight - 2.5, w, 2.5, 'F');

// // //   addImageSafe(doc, logoData, x + 3, y + 2.2, 8, 8);

// // //   doc.setTextColor(255, 255, 255);
// // //   doc.setFont('helvetica', 'bold');
// // //   doc.setFontSize(7.8);
// // //   doc.text(toText(institute.name, 'INSTITUTE'), x + 13, y + 6.5);
// // //   doc.setFontSize(6.1);
// // //   doc.setFont('helvetica', 'normal');
// // //   doc.text(roleTheme.label, x + 13, y + 10.2);

// // //   const cx = x + w / 2;
// // //   const cy = y + 31;
// // //   doc.setDrawColor(...roleTheme.accentColor);
// // //   doc.setLineWidth(1.2);
// // //   doc.circle(cx, cy, front.profileCircleSize / 2, 'S');

// // //   if (addImageSafe(doc, avatarData, cx - 9.5, cy - 9.5, 19, 19)) {
// // //     // avatar rendered
// // //   } else {
// // //     doc.setFillColor(232, 238, 248);
// // //     doc.circle(cx, cy, 9.2, 'F');
// // //     doc.setTextColor(31, 41, 55);
// // //     doc.setFont('helvetica', 'bold');
// // //     doc.setFontSize(10);
// // //     const initials = person.fullName
// // //       .split(' ')
// // //       .filter(Boolean)
// // //       .slice(0, 2)
// // //       .map((p) => p[0])
// // //       .join('')
// // //       .toUpperCase() || 'ID';
// // //     doc.text(initials, cx, cy + 1.4, { align: 'center' });
// // //   }

// // //   doc.setTextColor(...ID_CARD_THEME.card.textColor);
// // //   doc.setFont('helvetica', 'bold');
// // //   doc.setFontSize(6.2);
// // //   if (String(roleKey).toLowerCase() === 'student') {
// // //     doc.text('Name:', x + 4, y + 50.2);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.fullName, x + 14, y + 50.2, { maxWidth: 35 });

// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text('Father:', x + 4, y + 55.5);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.fatherName, x + 14, y + 55.5, { maxWidth: 35 });

// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text('Class:', x + 4, y + 60.8);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.designation, x + 14, y + 60.8, { maxWidth: 35 });

// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text('Roll:', x + 4, y + 66.1);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.idNo, x + 14, y + 66.1, { maxWidth: 35 });
// // //   } else {
// // //     doc.text('Name:', x + 4, y + 50.8);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.fullName, x + 14, y + 50.8, { maxWidth: 35 });

// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text('Detail:', x + 4, y + 56.2);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.designation, x + 14, y + 56.2, { maxWidth: 35 });

// // //     doc.setFont('helvetica', 'bold');
// // //     doc.text('ID No:', x + 4, y + 61.6);
// // //     doc.setFont('helvetica', 'normal');
// // //     doc.text(person.idNo, x + 14, y + 61.6, { maxWidth: 35 });
// // //   }
// // // };

// // // const drawBack = (doc, x, y, w, h, institute, person, roleTheme, qrData, roleKey) => {
// // //   const back = ID_CARD_THEME.back;
// // //   const radius = ID_CARD_THEME.card.radius;

// // //   doc.setFillColor(...back.backgroundColor);
// // //   doc.roundedRect(x, y, w, h, radius, radius, 'F');
// // //   drawRoundedCard(doc, x, y, w, h, radius);

// // //   doc.setFillColor(...back.topBandColor);
// // //   doc.roundedRect(x, y, w, back.topBandHeight, radius, radius, 'F');

// // //   doc.setTextColor(255, 255, 255);
// // //   doc.setFont('helvetica', 'bold');
// // //   doc.setFontSize(6.4);
// // //   doc.text('Terms & Conditions', x + 4, y + 6.4);
// // //   doc.setFont('helvetica', 'normal');
// // //   doc.setFontSize(5.2);
// // //   doc.text('Valid for current academic session', x + 4, y + 10.1);

// // //   doc.setTextColor(...ID_CARD_THEME.card.textColor);
// // //   doc.setFont('helvetica', 'normal');
// // //   doc.setFontSize(5.5);
// // //   const terms = [
// // //     '- Carry this card in campus',
// // //     '- Lost card must be reported',
// // //     '- Card is non-transferable',
// // //   ];
// // //   doc.text(terms, x + 4, y + 18.2);

// // //   doc.setFont('helvetica', 'bold');
// // //   doc.setFontSize(6.2);
// // //   doc.text('Contact', x + 4, y + 33.5);
// // //   doc.setFont('helvetica', 'normal');
// // //   doc.setFontSize(5.2);
// // //   const contact = [
// // //     toText(institute.address, ''),
// // //     [institute.phone, institute.email].filter(Boolean).join(' | '),
// // //   ].filter(Boolean);
// // //   doc.text(contact.length ? contact : ['N/A'], x + 4, y + 37.2, { maxWidth: w - 25 });

// // //   if (String(roleKey).toLowerCase() !== 'staff') {
// // //     const qrSize = ID_CARD_THEME.front.qrSize;
// // //     const qrX = x + (w - qrSize) / 2;
// // //     const qrY = y + (h - qrSize) / 2 + 7;
// // //     if (!addImageSafe(doc, qrData, qrX, qrY, qrSize, qrSize)) {
// // //       doc.setFillColor(245, 245, 245);
// // //       doc.rect(qrX, qrY, qrSize, qrSize, 'F');
// // //       doc.setDrawColor(207, 216, 228);
// // //       doc.rect(qrX, qrY, qrSize, qrSize);
// // //       doc.setFont('helvetica', 'bold');
// // //       doc.setTextColor(...ID_CARD_THEME.card.mutedTextColor);
// // //       doc.setFontSize(5.3);
// // //       doc.text('QR', qrX + qrSize / 2, qrY + qrSize / 2 + 1.2, { align: 'center' });
// // //     }
// // //   }

// // //   doc.setDrawColor(...roleTheme.accentColor);
// // //   doc.line(x + 4, y + h - 10, x + w - 24, y + h - 10);
// // //   doc.setFont('helvetica', 'normal');
// // //   doc.setFontSize(5);
// // //   doc.text('Authorized Signature', x + 4, y + h - 7.5);

// // //   // Bottom-right badge intentionally removed for all roles.
// // // };

// // // export async function generateAndDownloadIdCard({ role = 'student', person = {}, institute = {} }) {
// // //   try {
// // //     const { default: jsPDF } = await import('jspdf');

// // //     const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
// // //     const roleTheme = getRoleTheme(role);
// // //     const normalizedInstitute = normalizeInstitute(institute);
// // //     const normalizedPerson = normalizePerson(person, role);

// // //     const logoData = await loadImageData(normalizedInstitute.logo);
// // //     const avatarData = await loadImageData(normalizedPerson.avatar);
// // //     const qrData = await loadImageData(normalizedPerson.qrCode);

// // //     const w = ID_CARD_THEME.card.width;
// // //     const h = ID_CARD_THEME.card.height;
// // //     const gap = 12;
// // //     const pageWidth = doc.internal.pageSize.getWidth();
// // //     const pageHeight = doc.internal.pageSize.getHeight();
// // //     const startX = (pageWidth - (w * 2 + gap)) / 2;
// // //     const startY = (pageHeight - h) / 2;

// // //     drawFront(doc, startX, startY, w, h, normalizedInstitute, normalizedPerson, roleTheme, logoData, avatarData, role);
// // //     drawBack(doc, startX + w + gap, startY, w, h, normalizedInstitute, normalizedPerson, roleTheme, qrData, role);

// // //     const fileRole = role.toLowerCase();
// // //     const safeName = normalizedPerson.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// // //     doc.save(`${fileRole}-id-card-${safeName || 'user'}.pdf`);
// // //     toast.success('ID card downloaded');
// // //   } catch (error) {
// // //     console.error('ID card generation failed', error);
// // //     toast.error('Failed to generate ID card');
// // //   }
// // // }









// src/lib/idCardGenerator.js

// Default policy config (fallback)
const DEFAULT_POLICY_CONFIG = {
  layout: 'vertical',
  card_type: 'student',
  show_photo: true,
  show_watermark: true,
  qr_enabled: false,
  design: {
    background_color: '#0f172a',
    accent_color: '#f97316',
    text_color: '#ffffff',
    border_radius: '16px',
    show_border: true,
    border_color: '#e2e8f0',
    card_shadow: true,
    photo_border_radius: '50%'
  },
  terms_list: [
    "This card is the property of the institution.",
    "Loss of card must be reported immediately.",
    "This card is non-transferable.",
    "Misuse may result in disciplinary action."
  ]
};

// // Helper to flatten student data
// const flattenStudentData = (student) => {
//   const details = student?.details?.studentDetails || {};
//   const academicSession = student?.details?.academicSessions?.find(s => s.status === 'active') || {};
  
//   return {
//     full_name: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || details?.first_name || 'Student Name',
//     parent_name: details?.guardian_name || student?.details?.guardians?.[0]?.name || 'Parent Name',
//     roll_number: academicSession?.roll_no || details?.roll_no || student?.registration_no || student?.roll_number || 'ROLL-001',
//     class: academicSession?.class_name || details?.class_name || 'Class',
//     section: academicSession?.section_name || details?.section_name || 'A',
//     blood_group: details?.blood_group || 'O+',
//     dob: details?.dob || student?.details?.date_of_birth || '01 Jan 2000',
//     valid_upto: '31 Dec 2025',
//     photo_url: student?.avatar_url || null,
//     phone: details?.phone || student?.phone || '',
//     email: details?.email || student?.email || '',
//     address: details?.present_address || details?.permanent_address || '',
//     qr_value: student?.qr_code_url || student?.roll_number || student?.registration_no || `STD-${student?.id?.slice(-6) || '001'}`
//   };
// };

const flattenStudentData = (student) => {
  const details = student?.details?.studentDetails || {};
  const academicSession =
    student?.academicSessions?.find((s) => s.status === "active") || {};

  return {
    full_name: `${student?.first_name || ""} ${student?.last_name || ""}`.trim(),
    parent_name:
      details?.guardian_name ||
      student?.guardians?.[0]?.name ||
      "Parent Name",

    roll_number:
      academicSession?.roll_no ||
      student?.roll_no ||
      student?.registration_no,

    class:
      academicSession?.class_name ||
      student?.class_name ||
      "Class",

    section:
      academicSession?.section_name ||
      student?.section_name ||
      "A",

    blood_group: student?.blood_group || details?.blood_group || "O+",

    dob: student?.date_of_birth || details?.dob || "",

    valid_upto: "31 Dec 2026",

    photo_url: student?.avatar_url || "",

    phone: student?.phone || "",
    email: student?.email || "",

    address:
      student?.present_address ||
      student?.permanent_address ||
      "",

    // ✅ Correct QR
    qr_code_url: student?.qr_code_url || "",
    qr_value:
      student?.registration_no ||
      student?.roll_no ||
      student?.id,
  };
};

// Generate QR Code SVG from value
const generateQRCodeSVG = (value) => {
  if (!value) return '';
  
  // Create a simple QR-like SVG based on the value
  // This creates a deterministic pattern based on the input string
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 100;
  
  return `
    <svg width="55" height="55" viewBox="0 0 25 25" style="background:white; padding:4px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <rect width="25" height="25" fill="white"/>
      ${[0,1,2,3,4,5,6,7].map(r => [0,1,2,3,4,5,6,7].map(c => {
        const inTL = r < 7 && c < 7;
        const inTR = r < 7 && c > 17;
        const inBL = r > 17 && c < 7;
        const border = (r === 0 || r === 6 || c === 0 || c === 6) && inTL ||
                       (r === 0 || r === 6 || c === 18 || c === 24) && inTR ||
                       (r === 18 || r === 24 || c === 0 || c === 6) && inBL;
        const center = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                       (r >= 2 && r <= 4 && c >= 20 && c <= 22) ||
                       (r >= 20 && r <= 22 && c >= 2 && c <= 4);
        const data = ((r * c + seed) % 3 === 0) && !inTL && !inTR && !inBL;
        const fill = border || center || data ? '#000' : '#fff';
        return `<rect x="${c}" y="${r}" width="1" height="1" fill="${fill}"/>`;
      }).join('')).join('')}
      <text x="12" y="24" font-size="3" fill="#000" font-family="monospace">${value.slice(0, 8)}</text>
    </svg>
  `;
};

// Create complete HTML with Front and Back on ONE PAGE
const createCompleteCardHTML = (student, institute, policyConfig) => {
  const design = policyConfig?.design || DEFAULT_POLICY_CONFIG.design;
  const layout = policyConfig?.layout || 'vertical';
  const watermark = policyConfig?.show_watermark !== false;
  const showQr = policyConfig?.qr_enabled || false;
  const termsList = policyConfig?.terms_list || DEFAULT_POLICY_CONFIG.terms_list;
  const bgColor = design.background_color || '#0f172a';
  const accentColor = design.accent_color || '#f97316';
  const textColor = design.text_color || '#ffffff';
  const logoUrl = institute?.logo_url || '';
  const instituteName = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  const address = institute?.address || '123 Street, City';
  const phone = institute?.phone || '(123) 456-7890';
  const email = institute?.email || 'info@school.com';
  const validUpto = student.valid_upto || '31 Dec 2025';
  const studentName = student.full_name || 'Student Name';
  const parentName = student.parent_name || 'Parent Name';
  const rollNumber = student.roll_number || 'ROLL-001';
  const className = student.class || 'Class';
  const section = student.section || 'A';
  const bloodGroup = student.blood_group || 'O+';
  const photoUrl = student.photo_url || '';
  const qrValue = student.qr_code_url || rollNumber;
  
  // Generate QR code based on student's actual data
  // const qrCodeSVG = showQr ? generateQRCodeSVG(qrValue) : '';
  const qrCodeSVG = showQr
  ? student.qr_code_url
    ? `<img src="${student.qr_code_url}" 
         style="width:60px;height:60px;border-radius:8px;
         background:#fff;padding:4px;" />`
    : generateQRCodeSVG(student.qr_value || rollNumber)
  : "";

  if (layout === 'horizontal') {
    // Horizontal Card - Front on left, Back on right on SAME PAGE
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Student ID Card - ${studentName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { 
            background: #e2e8f0; 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
            padding: 20px;
          }
          .id-card-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }
          .card-row {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .card {
            width: 340px;
            height: 215px;
            border-radius: ${design.border_radius || '16px'};
            overflow: hidden;
            position: relative;
            box-shadow: ${design.card_shadow ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'};
            border: ${design.show_border ? `1px solid ${design.border_color || '#e2e8f0'}` : 'none'};
          }
          .label {
            text-align: center;
            font-size: 10px;
            font-weight: 600;
            margin-top: 5px;
            color: #64748b;
          }
          @media print {
            body { background: white; padding: 0; margin: 0; }
            .label { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="id-card-container">
          <div class="card-row">
            <!-- FRONT CARD -->
            <div>
              <div class="card" style="background: ${bgColor}; display: flex;">
                ${watermark ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); font-size: 30px; font-weight: bold; color: ${textColor}08; white-space: nowrap; pointer-events: none; z-index: 0; letter-spacing: 6px;">${instituteName.split(' ')[0] || 'SCHOOL'}</div>` : ''}
                <div style="width: 110px; background: linear-gradient(135deg, ${accentColor} 0%, ${bgColor} 100%); padding: 12px 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; z-index: 1;">
                  <div style="width: 50px; height: 50px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;">${logoUrl ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;padding:4px" />` : '<span style="font-size:22px">🏫</span>'}</div>
                  <div style="color: #fff; font-weight: 800; font-size: 9px; text-align: center; text-transform: uppercase;">${instituteName.split(' ').slice(0,2).join(' ')}</div>
                  <div style="background: rgba(255,255,255,0.2); border-radius: 20px; padding: 2px 8px; font-size: 6px; font-weight: 600; color: #fff;">STUDENT ID</div>
                  <div style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #1e3a5f; margin-top: 4px;">${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover" />` : '<span style="font-size:26px">👩‍🎓</span>'}</div>
                  <div style="display: flex; gap: 10px; margin-top: 4px; text-align: center;"><div><div style="font-size:5px;color:rgba(255,255,255,0.6)">CLASS</div><div style="font-size:11px;font-weight:900;color:#fff">${className}</div></div><div><div style="font-size:5px;color:rgba(255,255,255,0.6)">SEC</div><div style="font-size:11px;font-weight:900;color:#fff">${section}</div></div></div>
                </div>
                <div style="flex: 1; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 1;">
                  <div><div style="color: ${textColor}99; font-size: 6px; font-weight: 600; text-transform: uppercase;">Student Name</div><div style="color: ${textColor}; font-size: 12px; font-weight: 800;">${studentName}</div></div>
                  <div><div style="color: ${textColor}99; font-size: 6px; font-weight: 600; text-transform: uppercase;">Parent's Name</div><div style="color: ${textColor}; font-size: 10px; font-weight: 600;">${parentName}</div></div>
                  <div style="display: flex; gap: 12px;"><div><div style="color: ${textColor}99; font-size: 5px; font-weight: 600; text-transform: uppercase;">Roll No</div><div style="color: ${textColor}; font-size: 9px; font-weight: 600; font-family: monospace;">${rollNumber}</div></div><div><div style="color: ${textColor}99; font-size: 5px; font-weight: 600; text-transform: uppercase;">Blood</div><div style="color: ${textColor}; font-size: 9px; font-weight: 600;">${bloodGroup}</div></div></div>
                </div>
              </div>
              <div class="label">FRONT SIDE</div>
            </div>
            
            <!-- BACK CARD -->
            <div>
              <div class="card" style="background: #f8fafc; display: flex; flex-direction: column;">
                <div style="background: ${bgColor}; padding: 6px 16px; display: flex; justify-content: space-between; align-items: center;">
                  <div><div style="color: rgba(255,255,255,0.5); font-size: 6px;">VALID UNTIL</div><div style="color: #fff; font-size: 11px; font-weight: 800;">${validUpto}</div></div>
                  <div style="font-size: 7px; color: #fff; background: ${accentColor}; padding: 2px 8px; border-radius: 20px;">BACK SIDE</div>
                </div>
                <div style="flex: 1; padding: 8px 16px; display: flex; gap: 16px;">
                  <div style="flex: 1;"><div style="font-size: 10px; font-weight: 800; color: ${bgColor}; margin-bottom: 6px;">📜 Terms & Conditions</div><div style="max-height: 85px; overflow-y: auto;">${termsList.slice(0,3).map(term => `<div style="display:flex; gap:4px; margin-bottom:3px;"><div style="width:3px; height:3px; border-radius:50%; background:${accentColor}; margin-top:4px;"></div><span style="font-size:6.5px; color:#374151;">${term}</span></div>`).join('')}</div><div style="margin-top: 6px;"><div style="font-size: 8px; font-weight: 700; color: ${bgColor};">Signature Authority</div><svg width="60" height="14" viewBox="0 0 60 14"><path d="M5 10 Q15 3 25 8 Q35 15 45 6 Q55 0 65 7" stroke="${bgColor}" stroke-width="1" fill="none" /></svg></div></div>
                  <div style="width: 1px; background: #e2e8f0;"></div>
                  <div style="flex: 0.8;"><div style="font-size: 8px; font-weight: 700; color: ${bgColor}; margin-bottom: 4px;">Contact Info</div><div style="font-size: 6.5px; color: #4b5563; margin-bottom: 2px;">📍 ${address.slice(0,30)}</div><div style="font-size: 6.5px; color: #4b5563; margin-bottom: 2px;">✉️ ${email}</div><div style="font-size: 6.5px; color: #4b5563;">📞 ${phone}</div>${qrCodeSVG ? `<div style="margin-top: 4px; display: flex; justify-content: center;">${qrCodeSVG}</div>` : ''}</div>
                </div>
                <div style="background: ${bgColor}; padding: 5px 16px; display: flex; align-items: center; gap: 6px;"><div style="width: 22px; height: 22px; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;">${logoUrl ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;padding:2px" />` : '<span style="font-size:12px">🏫</span>'}</div><div><div style="color: #fff; font-weight: 800; font-size: 8px;">${instituteName}</div><div style="color: rgba(255,255,255,0.5); font-size: 5px; font-style: italic;">${tagline}</div></div></div>
              </div>
              <div class="label">BACK SIDE</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Vertical Card - Front on top, Back on bottom on SAME PAGE
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Student ID Card - ${studentName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { 
          background: #e2e8f0; 
          font-family: 'Segoe UI', system-ui, sans-serif; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh;
          padding: 20px;
        }
        .id-card-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        .card {
          width: 280px;
          height: 400px;
          border-radius: ${design.border_radius || '16px'};
          overflow: hidden;
          position: relative;
          box-shadow: ${design.card_shadow ? '0 20px 60px rgba(0,0,0,0.4)' : 'none'};
          border: ${design.show_border ? `1px solid ${design.border_color || '#e2e8f0'}` : 'none'};
        }
        .label {
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          margin-top: 5px;
          color: #64748b;
        }
        @media print {
          body { background: white; padding: 0; margin: 0; }
          .label { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="id-card-container">
        <!-- FRONT CARD -->
        <div>
          <div class="card" style="background: ${bgColor};">
            ${watermark ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); font-size: 40px; font-weight: bold; color: ${textColor}08; white-space: nowrap; pointer-events: none; z-index: 0; letter-spacing: 8px;">${instituteName.split(' ')[0] || 'SCHOOL'}</div>` : ''}
            <svg style="position: absolute; top: 0; right: 0; z-index: 1; width: 130px; height: 170px;" viewBox="0 0 130 170"><path d="M130 0 Q75 40 100 170 L130 170 Z" fill="${accentColor}" opacity="0.9" /></svg>
            <div style="position: relative; z-index: 2; padding: 16px 14px 0; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 0 0 2px ${accentColor};">${logoUrl ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;padding:4px" />` : '<span style="font-size:20px">🏫</span>'}</div>
              <div style="color: ${textColor}; font-weight: 800; font-size: 13px; text-align: center; text-transform: uppercase;">${instituteName}</div>
              <div style="color: ${textColor}99; font-size: 7px; text-align: center; font-style: italic;">${tagline}</div>
              <div style="background: ${accentColor}; color: #fff; font-size: 8px; font-weight: 700; padding: 2px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 4px;">STUDENT ID CARD</div>
            </div>
            <div style="position: relative; z-index: 2; display: flex; justify-content: center; margin-top: 8px;">
              <div style="width: 75px; height: 75px; border-radius: 50%; border: 3px solid ${accentColor}; background: #1e3a5f; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px rgba(255,255,255,0.15);">${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover" />` : '<span style="font-size:32px">👩‍🎓</span>'}</div>
              <div style="position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%); background: #fff; border: 2px solid ${accentColor}; border-radius: 6px; padding: 2px 8px; display: flex; gap: 8px;"><div style="text-align:center;"><div style="font-size:5px;font-weight:700;color:${bgColor};text-transform:uppercase;">CLASS</div><div style="font-size:10px;font-weight:900;color:${bgColor};">${className}</div></div><div style="width:1px;background:${bgColor};opacity:0.3;"></div><div style="text-align:center;"><div style="font-size:5px;font-weight:700;color:${bgColor};text-transform:uppercase;">SECTION</div><div style="font-size:10px;font-weight:900;color:${bgColor};">${section}</div></div></div>
            </div>
            <div style="position: relative; z-index: 2; padding: 16px 16px 6px; display: flex; flex-direction: column; gap: 5px;">
              <div><div style="color: ${textColor}99; font-size: 7px; font-weight: 600; text-transform: uppercase;">Student Name</div><div style="color: ${textColor}; font-size: 12px; font-weight: 700;">${studentName}</div></div>
              <div><div style="color: ${textColor}99; font-size: 7px; font-weight: 600; text-transform: uppercase;">Parent's Name</div><div style="color: ${textColor}; font-size: 11px; font-weight: 600;">${parentName}</div></div>
              <div style="display: flex; gap: 12px;"><div><div style="color: ${textColor}99; font-size: 7px; font-weight: 600; text-transform: uppercase;">Roll Number</div><div style="color: ${textColor}; font-size: 10px; font-weight: 600; font-family: monospace;">${rollNumber}</div></div><div><div style="color: ${textColor}99; font-size: 7px; font-weight: 600; text-transform: uppercase;">Blood Group</div><div style="color: ${textColor}; font-size: 10px; font-weight: 600;">${bloodGroup}</div></div></div>
            </div>
          </div>
          <div class="label">FRONT SIDE</div>
        </div>
        
        <!-- BACK CARD -->
        <div>
          <div class="card" style="background: #f8fafc;">
            <div style="background: ${bgColor}; padding: 10px 16px; position: relative; overflow: hidden;"><svg style="position: absolute; right: 0; top: 0; width: 70px; height: 70px;" viewBox="0 0 70 70"><path d="M70 0 Q35 20 50 70 L70 70 Z" fill="${accentColor}" opacity="0.6" /></svg><div style="color: rgba(255,255,255,0.5); font-size: 6px; font-weight: 600; letter-spacing: 1px;">VALID UNTIL</div><div style="color: #fff; font-size: 14px; font-weight: 800; margin-top: 2px;">${validUpto}</div></div>
            <div style="position: absolute; top: 70px; right: -10px; opacity: 0.05; z-index: 0; font-size: 80px;">${logoUrl ? `<img src="${logoUrl}" style="width:120px;height:120px;object-fit:contain" />` : '🏫'}</div>
            <div style="padding: 12px 16px; position: relative; z-index: 1;"><div style="font-size: 12px; font-weight: 800; color: ${bgColor}; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><span>📜</span> Terms & Conditions</div><div style="max-height: 130px; overflow-y: auto;">${termsList.map(term => `<div style="display:flex; gap:5px; margin-bottom:5px; align-items:flex-start;"><div style="width:4px; height:4px; border-radius:50%; background:${accentColor}; margin-top:3px; flex-shrink:0;"></div><span style="font-size:8px; color:#374151; line-height:1.4;">${term}</span></div>`).join('')}</div></div>
            <div style="padding: 0 16px 8px; position: relative; z-index: 1;"><div style="font-size: 10px; font-weight: 700; color: ${bgColor};">Signature Authority</div><div style="font-size: 7px; color: #6b7280; margin-bottom: 3px;">Principal</div><svg width="80" height="18" viewBox="0 0 80 18"><path d="M5 14 Q15 3 25 11 Q35 20 45 8 Q55 0 65 10 Q75 20 85 7" stroke="${bgColor}" stroke-width="1.2" fill="none" /></svg><div style="border-top: 1px solid ${bgColor}; width: 80px; margin-top: 2px;"></div></div>
            ${qrCodeSVG ? `<div style="padding: 8px 16px; display: flex; justify-content: center; position: relative; z-index: 1;">${qrCodeSVG}</div>` : ''}
            <div style="padding: 6px 16px; background: #f1f5f9; border-top: 1px solid #e2e8f0; position: relative; z-index: 1;"><div style="display:flex; gap:5px; align-items:center; margin-bottom:2px;"><span style="font-size:8px;">📍</span><span style="font-size:7px; color:#4b5563;">${address.slice(0,30)}</span></div><div style="display:flex; gap:5px; align-items:center; margin-bottom:2px;"><span style="font-size:8px;">✉️</span><span style="font-size:7px; color:#4b5563;">${email}</span></div><div style="display:flex; gap:5px; align-items:center;"><span style="font-size:8px;">📞</span><span style="font-size:7px; color:#4b5563;">${phone}</span></div></div>
            <div style="background: ${bgColor}; padding: 6px 16px; display: flex; align-items: center; gap: 8px; position: relative; overflow: hidden;"><svg style="position: absolute; left: 0; bottom: 0; width: 50px; height: 40px;" viewBox="0 0 50 40"><ellipse cx="0" cy="40" rx="45" ry="35" fill="${accentColor}" opacity="0.2" /></svg><div style="width: 28px; height: 28px; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;">${logoUrl ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;padding:2px" />` : '<span style="font-size:14px">🏫</span>'}</div><div><div style="color: #fff; font-weight: 800; font-size: 8px;">${instituteName}</div><div style="color: rgba(255,255,255,0.5); font-size: 5px; font-style: italic;">${tagline}</div></div></div>
          </div>
          <div class="label">BACK SIDE</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Main function to generate and download ID card
export const generateAndDownloadIdCard = async ({ role, person, institute, policyConfig }) => {
  try {
    // Flatten student data
    const student = flattenStudentData(person);
    
    // Merge policy config with defaults
    const finalPolicyConfig = { ...DEFAULT_POLICY_CONFIG, ...policyConfig };
    
    // Create complete HTML with both sides on same page
    const completeHTML = createCompleteCardHTML(student, institute, finalPolicyConfig);
    
    // Open print window
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    }
    
    const layout = finalPolicyConfig.layout || 'vertical';
    const pageSize = layout === 'vertical' ? '3.15in 9.5in' : '8.5in 5.5in';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID Card - ${student.full_name}</title>
          <style>
            @page { 
              size: ${pageSize}; 
              margin: 0.2in;
            }
            body { 
              margin: 0; 
              padding: 0;
              background: #e2e8f0;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${completeHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    return { success: true, message: 'ID Card generated successfully' };
    
  } catch (error) {
    console.error('Error generating ID card:', error);
    throw new Error('Failed to generate ID card: ' + error.message);
  }
};

export default generateAndDownloadIdCard;



