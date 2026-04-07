import { toast } from 'sonner';
import { ID_CARD_THEME, getRoleTheme } from '@/constants/idCardTheme';

const toText = (v, fallback = 'N/A') => (v === null || v === undefined || v === '' ? fallback : String(v));

const normalizeInstitute = (institute = {}) => ({
  name: institute?.name || institute?.school_name || 'School Name',
  logo: institute?.logo_url || institute?.logo || '',
  address: institute?.address || institute?.location?.address || '',
  phone: institute?.phone || institute?.contact_no || institute?.contact || '',
  email: institute?.email || '',
});

const normalizePerson = (person = {}, role = 'student') => {
  const details = person?.details || person?.studentDetails || person?.teacherDetails || person?.staffDetails || {};
  const firstName = person?.first_name || person?.firstName || person?.name?.split(' ')?.[0] || '';
  const lastName = person?.last_name || person?.lastName || person?.name?.split(' ')?.slice(1)?.join(' ') || '';
  const fullName = toText(`${firstName} ${lastName}`.trim() || person?.name, 'N/A');
  const idByRole = {
    student: person?.roll_no || person?.roll_number || person?.registration_no || details?.roll_no || details?.registration_no,
    teacher: person?.registration_no || details?.employee_id || details?.teacher_id,
    staff: details?.employee_id || person?.registration_no || person?.staff_id,
    admin: person?.employee_id || person?.registration_no || person?.id,
  };
  return {
    fullName,
    fatherName: person?.father_name || details?.father_name || 'N/A',
    idNo: toText(idByRole[role] || person?.id || person?.user_id),
    designation: toText(
      details?.designation || details?.department || person?.staff_type || person?.class_name || person?.class?.name || role,
      role
    ),
    phone: toText(person?.phone || details?.phone, ''),
    email: toText(person?.email || details?.email, ''),
    avatar: person?.avatar_url || person?.photo || person?.image || '',
    qrCode: person?.qr_code_url || person?.qr_code || details?.qr_code || '',
  };
};

const drawRoundedCard = (doc, x, y, w, h, r) => {
  doc.setDrawColor(...ID_CARD_THEME.card.borderColor);
  doc.roundedRect(x, y, w, h, r, r, 'S');
};

const addImageSafe = (doc, data, x, y, w, h) => {
  if (!data) return false;
  try {
    doc.addImage(data, 'PNG', x, y, w, h);
    return true;
  } catch {
    return false;
  }
};

const loadImageData = async (url) => {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const drawFront = (doc, x, y, w, h, institute, person, roleTheme, logoData, avatarData, roleKey) => {
  const front = ID_CARD_THEME.front;
  const radius = ID_CARD_THEME.card.radius;

  doc.setFillColor(...front.backgroundColor);
  doc.roundedRect(x, y, w, h, radius, radius, 'F');
  drawRoundedCard(doc, x, y, w, h, radius);

  doc.setFillColor(...front.topBandColor);
  doc.roundedRect(x, y, w, front.topBandHeight, radius, radius, 'F');

  doc.setFillColor(...roleTheme.accentColor);
  doc.rect(x, y + front.topBandHeight - 2.5, w, 2.5, 'F');

  addImageSafe(doc, logoData, x + 3, y + 2.2, 8, 8);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text(toText(institute.name, 'INSTITUTE'), x + 13, y + 6.5);
  doc.setFontSize(6.1);
  doc.setFont('helvetica', 'normal');
  doc.text(roleTheme.label, x + 13, y + 10.2);

  const cx = x + w / 2;
  const cy = y + 31;
  doc.setDrawColor(...roleTheme.accentColor);
  doc.setLineWidth(1.2);
  doc.circle(cx, cy, front.profileCircleSize / 2, 'S');

  if (addImageSafe(doc, avatarData, cx - 9.5, cy - 9.5, 19, 19)) {
    // avatar rendered
  } else {
    doc.setFillColor(232, 238, 248);
    doc.circle(cx, cy, 9.2, 'F');
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const initials = person.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || 'ID';
    doc.text(initials, cx, cy + 1.4, { align: 'center' });
  }

  doc.setTextColor(...ID_CARD_THEME.card.textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  if (String(roleKey).toLowerCase() === 'student') {
    doc.text('Name:', x + 4, y + 50.2);
    doc.setFont('helvetica', 'normal');
    doc.text(person.fullName, x + 14, y + 50.2, { maxWidth: 35 });

    doc.setFont('helvetica', 'bold');
    doc.text('Father:', x + 4, y + 55.5);
    doc.setFont('helvetica', 'normal');
    doc.text(person.fatherName, x + 14, y + 55.5, { maxWidth: 35 });

    doc.setFont('helvetica', 'bold');
    doc.text('Class:', x + 4, y + 60.8);
    doc.setFont('helvetica', 'normal');
    doc.text(person.designation, x + 14, y + 60.8, { maxWidth: 35 });

    doc.setFont('helvetica', 'bold');
    doc.text('Roll:', x + 4, y + 66.1);
    doc.setFont('helvetica', 'normal');
    doc.text(person.idNo, x + 14, y + 66.1, { maxWidth: 35 });
  } else {
    doc.text('Name:', x + 4, y + 50.8);
    doc.setFont('helvetica', 'normal');
    doc.text(person.fullName, x + 14, y + 50.8, { maxWidth: 35 });

    doc.setFont('helvetica', 'bold');
    doc.text('Detail:', x + 4, y + 56.2);
    doc.setFont('helvetica', 'normal');
    doc.text(person.designation, x + 14, y + 56.2, { maxWidth: 35 });

    doc.setFont('helvetica', 'bold');
    doc.text('ID No:', x + 4, y + 61.6);
    doc.setFont('helvetica', 'normal');
    doc.text(person.idNo, x + 14, y + 61.6, { maxWidth: 35 });
  }
};

const drawBack = (doc, x, y, w, h, institute, person, roleTheme, qrData, roleKey) => {
  const back = ID_CARD_THEME.back;
  const radius = ID_CARD_THEME.card.radius;

  doc.setFillColor(...back.backgroundColor);
  doc.roundedRect(x, y, w, h, radius, radius, 'F');
  drawRoundedCard(doc, x, y, w, h, radius);

  doc.setFillColor(...back.topBandColor);
  doc.roundedRect(x, y, w, back.topBandHeight, radius, radius, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.text('Terms & Conditions', x + 4, y + 6.4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.text('Valid for current academic session', x + 4, y + 10.1);

  doc.setTextColor(...ID_CARD_THEME.card.textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  const terms = [
    '- Carry this card in campus',
    '- Lost card must be reported',
    '- Card is non-transferable',
  ];
  doc.text(terms, x + 4, y + 18.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text('Contact', x + 4, y + 33.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  const contact = [
    toText(institute.address, ''),
    [institute.phone, institute.email].filter(Boolean).join(' | '),
  ].filter(Boolean);
  doc.text(contact.length ? contact : ['N/A'], x + 4, y + 37.2, { maxWidth: w - 25 });

  if (String(roleKey).toLowerCase() !== 'staff') {
    const qrSize = ID_CARD_THEME.front.qrSize;
    const qrX = x + (w - qrSize) / 2;
    const qrY = y + (h - qrSize) / 2 + 7;
    if (!addImageSafe(doc, qrData, qrX, qrY, qrSize, qrSize)) {
      doc.setFillColor(245, 245, 245);
      doc.rect(qrX, qrY, qrSize, qrSize, 'F');
      doc.setDrawColor(207, 216, 228);
      doc.rect(qrX, qrY, qrSize, qrSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...ID_CARD_THEME.card.mutedTextColor);
      doc.setFontSize(5.3);
      doc.text('QR', qrX + qrSize / 2, qrY + qrSize / 2 + 1.2, { align: 'center' });
    }
  }

  doc.setDrawColor(...roleTheme.accentColor);
  doc.line(x + 4, y + h - 10, x + w - 24, y + h - 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('Authorized Signature', x + 4, y + h - 7.5);

  // Bottom-right badge intentionally removed for all roles.
};

export async function generateAndDownloadIdCard({ role = 'student', person = {}, institute = {} }) {
  try {
    const { default: jsPDF } = await import('jspdf');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const roleTheme = getRoleTheme(role);
    const normalizedInstitute = normalizeInstitute(institute);
    const normalizedPerson = normalizePerson(person, role);

    const logoData = await loadImageData(normalizedInstitute.logo);
    const avatarData = await loadImageData(normalizedPerson.avatar);
    const qrData = await loadImageData(normalizedPerson.qrCode);

    const w = ID_CARD_THEME.card.width;
    const h = ID_CARD_THEME.card.height;
    const gap = 12;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const startX = (pageWidth - (w * 2 + gap)) / 2;
    const startY = (pageHeight - h) / 2;

    drawFront(doc, startX, startY, w, h, normalizedInstitute, normalizedPerson, roleTheme, logoData, avatarData, role);
    drawBack(doc, startX + w + gap, startY, w, h, normalizedInstitute, normalizedPerson, roleTheme, qrData, role);

    const fileRole = role.toLowerCase();
    const safeName = normalizedPerson.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    doc.save(`${fileRole}-id-card-${safeName || 'user'}.pdf`);
    toast.success('ID card downloaded');
  } catch (error) {
    console.error('ID card generation failed', error);
    toast.error('Failed to generate ID card');
  }
}
