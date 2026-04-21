// src/components/common/IDCard.jsx
'use client';

import { useState, useRef, forwardRef } from 'react';
import { Download, Printer, RotateCcw, FileDown } from 'lucide-react';
import useAuthStore from '@/store/authStore';

// QR Code Component
const QRCodeDisplay = ({ size = 52, value = '' }) => (
  <div style={{ 
    width: size, height: size, background: '#fff', padding: 4, borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <svg viewBox="0 0 25 25" width="100%" height="100%">
      <rect width="25" height="25" fill="white" />
      {[0,1,2,3,4,5,6,7].map(r => [0,1,2,3,4,5,6,7].map(c => {
        const inTL = r < 7 && c < 7;
        const inTR = r < 7 && c > 17;
        const inBL = r > 17 && c < 7;
        const border = (r === 0 || r === 6 || c === 0 || c === 6) && inTL ||
                       (r === 0 || r === 6 || c === 18 || c === 24) && inTR ||
                       (r === 18 || r === 24 || c === 0 || c === 6) && inBL;
        const center = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                       (r >= 2 && r <= 4 && c >= 20 && c <= 22) ||
                       (r >= 20 && r <= 22 && c >= 2 && c <= 4);
        const data = (r * c) % 3 === 0 && !inTL && !inTR && !inBL;
        const fill = border || center || data ? '#000' : '#fff';
        return <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fill} />;
      }))}
    </svg>
  </div>
);

// ==================== STAFF CARD VERTICAL FRONT ====================
const StaffCardFrontVertical = ({ institute, design, watermark, staffData }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const textColor = design?.text_color || '#ffffff';
  const logoUrl = institute?.logo_url;
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  
  const fullName = staffData?.full_name || 'John Doe';
  const designation = staffData?.designation || 'Senior Teacher';
  const employeeId = staffData?.employee_id || 'EMP-2024-001';
  const department = staffData?.department || 'Science Department';
  const bloodGroup = staffData?.blood_group || 'O+';
  const validUpto = staffData?.valid_upto || '31 Dec 2025';
  const photoUrl = staffData?.photo_url;

  return (
    <div style={{
      width: 280, height: 400,
      background: bgColor,
      borderRadius: design?.border_radius || 16,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'Segoe UI', sans-serif",
      boxShadow: design?.card_shadow ? '0 20px 60px rgba(0,0,0,0.4)' : 'none',
      border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none',
    }}>
      {watermark && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          fontSize: 40, fontWeight: 'bold', color: `${textColor}08`,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, letterSpacing: 8
        }}>{institute?.name?.split(' ')[0] || 'STAFF'}</div>
      )}

      <svg style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }} width="130" height="170" viewBox="0 0 130 170">
        <path d="M130 0 Q75 40 100 170 L130 170 Z" fill={accentColor} opacity="0.9" />
      </svg>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: `0 0 0 2px ${accentColor}` }}>
          {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 20 }}>🏫</span>}
        </div>
        <div style={{ color: textColor, fontWeight: 800, fontSize: 13, textAlign: 'center', textTransform: 'uppercase' }}>{name}</div>
        <div style={{ color: `${textColor}99`, fontSize: 7, textAlign: 'center', fontStyle: 'italic' }}>{tagline}</div>
        <div style={{ background: accentColor, color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 12px', borderRadius: 20, textTransform: 'uppercase' }}>STAFF ID CARD</div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${accentColor}`, background: '#1e3a5f', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photoUrl ? <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👨‍🏫</span>}
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', background: '#fff', border: `2px solid ${accentColor}`, borderRadius: 6, padding: '2px 8px' }}>
          <span style={{ fontSize: 5, fontWeight: 700, color: bgColor }}>ID</span>
          <div style={{ fontSize: 9, fontWeight: 900, color: bgColor }}>{employeeId.slice(-6)}</div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 16px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Full Name</div><div style={{ color: textColor, fontSize: 12, fontWeight: 700 }}>{fullName}</div></div>
        <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Designation</div><div style={{ color: textColor, fontSize: 11, fontWeight: 600 }}>{designation}</div></div>
        <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Department</div><div style={{ color: textColor, fontSize: 11, fontWeight: 600 }}>{department}</div></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{bloodGroup}</div></div>
          <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Valid Upto</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600 }}>{validUpto}</div></div>
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF CARD HORIZONTAL FRONT ====================
const StaffCardFrontHorizontal = ({ institute, design, watermark, staffData }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const textColor = design?.text_color || '#ffffff';
  const logoUrl = institute?.logo_url;
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  
  const fullName = staffData?.full_name || 'John Doe';
  const designation = staffData?.designation || 'Senior Teacher';
  const employeeId = staffData?.employee_id || 'EMP-2024-001';
  const department = staffData?.department || 'Science Department';
  const bloodGroup = staffData?.blood_group || 'O+';
  const photoUrl = staffData?.photo_url;

  return (
    <div style={{
      width: 340, height: 215, background: bgColor, borderRadius: design?.border_radius || 16,
      overflow: 'hidden', position: 'relative', fontFamily: "'Segoe UI', sans-serif",
      boxShadow: design?.card_shadow ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
      border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none',
      display: 'flex',
    }}>
      {watermark && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-25deg)', fontSize: 30, fontWeight: 'bold', color: `${textColor}08`, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>{institute?.name?.split(' ')[0] || 'STAFF'}</div>}

      <div style={{ width: 110, background: `linear-gradient(135deg, ${accentColor} 0%, ${bgColor} 100%)`, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 22 }}>🏫</span>}
        </div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 9, textAlign: 'center', textTransform: 'uppercase' }}>{name.split(' ').slice(0, 2).join(' ')}</div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: 6, fontWeight: 600, color: '#fff' }}>STAFF ID</div>
        <div style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid #fff`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a5f' }}>
          {photoUrl ? <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 26 }}>👨‍🏫</span>}
        </div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 5, color: 'rgba(255,255,255,0.6)' }}>EMP ID</div><div style={{ fontSize: 9, fontWeight: 900, color: '#fff' }}>{employeeId.slice(-6)}</div></div>
      </div>

      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Full Name</div><div style={{ color: textColor, fontSize: 12, fontWeight: 800 }}>{fullName}</div></div>
        <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Designation</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{designation}</div></div>
        <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Department</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{department}</div></div>
        <div style={{ display: 'flex', gap: 12 }}><div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Blood</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600 }}>{bloodGroup}</div></div></div>
      </div>
    </div>
  );
};

// ==================== STAFF CARD BACK ====================
const StaffCardBackVertical = ({ institute, design, staffData, termsList, showQr }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const logoUrl = institute?.logo_url;
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  const address = institute?.address || '123 Street, City';
  const phone = institute?.phone || '(123) 456-7890';
  const email = institute?.email || 'info@school.com';

  return (
    <div style={{ width: 280, height: 400, background: '#f8fafc', borderRadius: design?.border_radius || 16, overflow: 'hidden', position: 'relative', fontFamily: "'Segoe UI', sans-serif", boxShadow: design?.card_shadow ? '0 20px 60px rgba(0,0,0,0.4)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
      <div style={{ background: bgColor, padding: '10px 16px', position: 'relative' }}>
        <svg style={{ position: 'absolute', right: 0, top: 0 }} width="70" height="70" viewBox="0 0 70 70"><path d="M70 0 Q35 20 50 70 L70 70 Z" fill={accentColor} opacity="0.6" /></svg>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 6 }}>STAFF ID CARD</div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>Valid ID Card</div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: bgColor, marginBottom: 8 }}>📜 Terms & Conditions</div>
        <div style={{ maxHeight: 130, overflowY: 'auto' }}>
          {termsList?.map((term, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, marginTop: 3 }} /><span style={{ fontSize: 8, color: '#374151' }}>{term}</span></div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: bgColor }}>Signature Authority</div>
        <div style={{ fontSize: 7, color: '#6b7280' }}>Principal</div>
        <svg width="80" height="18" viewBox="0 0 80 18"><path d="M5 14 Q15 3 25 11 Q35 20 45 8 Q55 0 65 10 Q75 20 85 7" stroke={bgColor} strokeWidth="1.2" fill="none" /></svg>
      </div>
      {showQr && <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'center' }}><QRCodeDisplay size={55} value={staffData?.employee_id} /></div>}
      <div style={{ padding: '6px 16px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 7, color: '#4b5563' }}>📍 {address.slice(0, 30)}</div>
        <div style={{ fontSize: 7, color: '#4b5563' }}>✉️ {email}</div>
        <div style={{ fontSize: 7, color: '#4b5563' }}>📞 {phone}</div>
      </div>
      <div style={{ background: bgColor, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} /> : <span style={{ fontSize: 14 }}>🏫</span>}
        </div>
        <div><div style={{ color: '#fff', fontWeight: 800, fontSize: 8 }}>{name}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 5 }}>{tagline}</div></div>
      </div>
    </div>
  );
};

const StaffCardBackHorizontal = ({ institute, design, staffData, termsList, showQr }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  const address = institute?.address || '123 Street, City';
  const phone = institute?.phone || '(123) 456-7890';
  const email = institute?.email || 'info@school.com';

  return (
    <div style={{ width: 340, height: 215, background: '#f8fafc', borderRadius: design?.border_radius || 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: design?.card_shadow ? '0 10px 30px rgba(0,0,0,0.3)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
      <div style={{ background: bgColor, padding: '6px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 6 }}>STAFF ID</div><div style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>Valid Card</div></div>
        <div style={{ fontSize: 7, color: '#fff', background: accentColor, padding: '2px 8px', borderRadius: 20 }}>BACK</div>
      </div>
      <div style={{ flex: 1, padding: '8px 16px', display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 800, color: bgColor, marginBottom: 6 }}>📜 Terms</div>
          <div style={{ maxHeight: 85, overflowY: 'auto' }}>{termsList?.slice(0, 3).map((term, i) => (<div key={i} style={{ display: 'flex', gap: 4, marginBottom: 3 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: accentColor, marginTop: 4 }} /><span style={{ fontSize: 6.5, color: '#374151' }}>{term}</span></div>))}</div>
          <div style={{ marginTop: 6 }}><div style={{ fontSize: 8, fontWeight: 700, color: bgColor }}>Signature</div><svg width="60" height="14" viewBox="0 0 60 14"><path d="M5 10 Q15 3 25 8 Q35 15 45 6 Q55 0 65 7" stroke={bgColor} strokeWidth="1" fill="none" /></svg></div>
        </div>
        <div style={{ width: 1, background: '#e2e8f0' }} />
        <div style={{ flex: 0.8 }}><div style={{ fontSize: 8, fontWeight: 700, color: bgColor }}>Contact</div>
          <div style={{ fontSize: 6.5, color: '#4b5563' }}>📍 {address.slice(0, 25)}</div><div style={{ fontSize: 6.5, color: '#4b5563' }}>✉️ {email}</div><div style={{ fontSize: 6.5, color: '#4b5563' }}>📞 {phone}</div>
          {showQr && <div style={{ marginTop: 4 }}><QRCodeDisplay size={40} value={staffData?.employee_id} /></div>}
        </div>
      </div>
      <div style={{ background: bgColor, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ fontSize: 9 }}>🏫</div><div><div style={{ color: '#fff', fontWeight: 800, fontSize: 8 }}>{name}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 5 }}>{tagline}</div></div></div>
    </div>
  );
};

// // ==================== STUDENT CARD VERTICAL FRONT ====================
// const StudentCardFrontVertical = ({ institute, design, watermark, studentData }) => {
//   const bgColor = design?.background_color || '#0f172a';
//   const accentColor = design?.accent_color || '#f97316';
//   const textColor = design?.text_color || '#ffffff';
//   const logoUrl = institute?.logo_url;
//   const name = institute?.name || 'ABC School';
//   const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  
//   const fullName = studentData?.full_name || 'Marsha Williams';
//   const className = studentData?.class || '2';
//   const section = studentData?.section || 'A';
//   const rollNumber = studentData?.roll_number || 'SCH-1234-567';
//   const bloodGroup = studentData?.blood_group || 'O+';
//   const parentName = studentData?.parent_name || 'James Williams';
//   const photoUrl = studentData?.photo_url;

//   return (
//     <div style={{ width: 280, height: 400, background: bgColor, borderRadius: design?.border_radius || 16, overflow: 'hidden', position: 'relative', fontFamily: "'Segoe UI', sans-serif", boxShadow: design?.card_shadow ? '0 20px 60px rgba(0,0,0,0.4)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
//       {watermark && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-25deg)', fontSize: 40, fontWeight: 'bold', color: `${textColor}08`, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, letterSpacing: 8 }}>{institute?.name?.split(' ')[0] || 'STUDENT'}</div>}
//       <svg style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }} width="130" height="170" viewBox="0 0 130 170"><path d="M130 0 Q75 40 100 170 L130 170 Z" fill={accentColor} opacity="0.9" /></svg>

//       <div style={{ position: 'relative', zIndex: 2, padding: '16px 14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
//         <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: `0 0 0 2px ${accentColor}` }}>
//           {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 20 }}>🏫</span>}
//         </div>
//         <div style={{ color: textColor, fontWeight: 800, fontSize: 13, textAlign: 'center', textTransform: 'uppercase' }}>{name}</div>
//         <div style={{ color: `${textColor}99`, fontSize: 7, textAlign: 'center', fontStyle: 'italic' }}>{tagline}</div>
//         <div style={{ background: accentColor, color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 12px', borderRadius: 20, textTransform: 'uppercase' }}>STUDENT ID CARD</div>
//       </div>

//       <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', marginTop: 8 }}>
//         <div style={{ width: 75, height: 75, borderRadius: '50%', border: `3px solid ${accentColor}`, background: '#1e3a5f', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           {photoUrl ? <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👩‍🎓</span>}
//         </div>
//         <div style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', background: '#fff', border: `2px solid ${accentColor}`, borderRadius: 6, padding: '2px 8px', display: 'flex', gap: 8 }}>
//           <div style={{ textAlign: 'center' }}><span style={{ fontSize: 5, fontWeight: 700, color: bgColor }}>CLASS</span><div style={{ fontSize: 10, fontWeight: 900, color: bgColor }}>{className}</div></div>
//           <div style={{ width: 1, background: bgColor, opacity: 0.3 }} />
//           <div style={{ textAlign: 'center' }}><span style={{ fontSize: 5, fontWeight: 700, color: bgColor }}>SECTION</span><div style={{ fontSize: 10, fontWeight: 900, color: bgColor }}>{section}</div></div>
//         </div>
//       </div>

//       <div style={{ position: 'relative', zIndex: 2, padding: '16px 16px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
//         <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Student Name</div><div style={{ color: textColor, fontSize: 12, fontWeight: 700 }}>{fullName}</div></div>
//         <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Parent's Name</div><div style={{ color: textColor, fontSize: 11, fontWeight: 600 }}>{parentName}</div></div>
//         <div style={{ display: 'flex', gap: 12 }}>
//           <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Roll Number</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}>{rollNumber}</div></div>
//           <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{bloodGroup}</div></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// Inside IDCard.jsx, replace the StudentCardFrontVertical component
const StudentCardFrontVertical = ({ institute, design, watermark, studentData }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const textColor = design?.text_color || '#ffffff';
  const logoUrl = institute?.logo_url;
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  
  const fullName = studentData?.full_name || 'Marsha Williams';
  const className = studentData?.class || '2';
  const section = studentData?.section || 'A';
  const rollNumber = studentData?.roll_number || 'SCH-1234-567';
  const bloodGroup = studentData?.blood_group || 'O+';
  const parentName = studentData?.parent_name || 'James Williams';
  const photoUrl = studentData?.photo_url;

  return (
    <div style={{
      width: 280, height: 400,
      background: bgColor,
      borderRadius: design?.border_radius || 16,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'Segoe UI', sans-serif",
      boxShadow: design?.card_shadow ? '0 20px 60px rgba(0,0,0,0.4)' : 'none',
      border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none',
    }}>
      {watermark && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          fontSize: 40, fontWeight: 'bold', color: `${textColor}08`,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, letterSpacing: 8
        }}>{institute?.name?.split(' ')[0] || 'STUDENT'}</div>
      )}

      <svg style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }} width="130" height="170" viewBox="0 0 130 170">
        <path d="M130 0 Q75 40 100 170 L130 170 Z" fill={accentColor} opacity="0.9" />
      </svg>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: `0 0 0 2px ${accentColor}` }}>
          {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 20 }}>🏫</span>}
        </div>
        <div style={{ color: textColor, fontWeight: 800, fontSize: 13, textAlign: 'center', textTransform: 'uppercase' }}>{name}</div>
        <div style={{ color: `${textColor}99`, fontSize: 7, textAlign: 'center', fontStyle: 'italic' }}>{tagline}</div>
        <div style={{ background: accentColor, color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 12px', borderRadius: 20, textTransform: 'uppercase' }}>STUDENT ID CARD</div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${accentColor}`, background: '#1e3a5f', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photoUrl ? <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👩‍🎓</span>}
        </div>
        {/* Removed the badge that displayed class/section over the photo */}
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 16px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Student Name</div><div style={{ color: textColor, fontSize: 12, fontWeight: 700 }}>{fullName}</div></div>
        <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Parent's Name</div><div style={{ color: textColor, fontSize: 11, fontWeight: 600 }}>{parentName}</div></div>
        {/* Class & Section now appear here */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Class</div><div style={{ color: textColor, fontSize: 11, fontWeight: 600 }}>{className}</div></div>
          <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Section</div><div style={{ color: textColor, fontSize: 11, fontWeight: 600 }}>{section}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Roll Number</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}>{rollNumber}</div></div>
          <div><div style={{ color: `${textColor}99`, fontSize: 7, fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{bloodGroup}</div></div>
        </div>
      </div>
    </div>
  );
};

// // ==================== STUDENT CARD HORIZONTAL FRONT ====================
// const StudentCardFrontHorizontal = ({ institute, design, watermark, studentData }) => {
//   const bgColor = design?.background_color || '#0f172a';
//   const accentColor = design?.accent_color || '#f97316';
//   const textColor = design?.text_color || '#ffffff';
//   const logoUrl = institute?.logo_url;
//   const name = institute?.name || 'ABC School';
//   const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  
//   const fullName = studentData?.full_name || 'Marsha Williams';
//   const className = studentData?.class || '2';
//   const section = studentData?.section || 'A';
//   const rollNumber = studentData?.roll_number || 'SCH-1234-567';
//   const bloodGroup = studentData?.blood_group || 'O+';
//   const parentName = studentData?.parent_name || 'James Williams';
//   const photoUrl = studentData?.photo_url;

//   return (
//     <div style={{ width: 340, height: 215, background: bgColor, borderRadius: design?.border_radius || 16, overflow: 'hidden', display: 'flex', position: 'relative', boxShadow: design?.card_shadow ? '0 10px 30px rgba(0,0,0,0.3)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
//       {watermark && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-25deg)', fontSize: 30, fontWeight: 'bold', color: `${textColor}08`, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>{institute?.name?.split(' ')[0] || 'STUDENT'}</div>}

//       <div style={{ width: 110, background: `linear-gradient(135deg, ${accentColor} 0%, ${bgColor} 100%)`, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
//         <div style={{ width: 50, height: 50, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
//           {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 22 }}>🏫</span>}
//         </div>
//         <div style={{ color: '#fff', fontWeight: 800, fontSize: 9, textAlign: 'center', textTransform: 'uppercase' }}>{name.split(' ').slice(0, 2).join(' ')}</div>
//         <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: 6, fontWeight: 600, color: '#fff' }}>STUDENT ID</div>
//         <div style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid #fff`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a5f' }}>
//           {photoUrl ? <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 26 }}>👩‍🎓</span>}
//         </div>
//         <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
//           <div style={{ textAlign: 'center' }}><div style={{ fontSize: 5, color: 'rgba(255,255,255,0.6)' }}>CLASS</div><div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{className}</div></div>
//           <div style={{ textAlign: 'center' }}><div style={{ fontSize: 5, color: 'rgba(255,255,255,0.6)' }}>SEC</div><div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{section}</div></div>
//         </div>
//       </div>

//       <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
//         <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Student Name</div><div style={{ color: textColor, fontSize: 12, fontWeight: 800 }}>{fullName}</div></div>
//         <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Parent's Name</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{parentName}</div></div>
//         <div style={{ display: 'flex', gap: 12 }}>
//           <div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Roll No</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600, fontFamily: 'monospace' }}>{rollNumber}</div></div>
//           <div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Blood</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600 }}>{bloodGroup}</div></div>
//         </div>
//       </div>
//     </div>
//   );
// };

const StudentCardFrontHorizontal = ({ institute, design, watermark, studentData }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const textColor = design?.text_color || '#ffffff';
  const logoUrl = institute?.logo_url;
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  
  const fullName = studentData?.full_name || 'Marsha Williams';
  const className = studentData?.class || '2';
  const section = studentData?.section || 'A';
  const rollNumber = studentData?.roll_number || 'SCH-1234-567';
  const bloodGroup = studentData?.blood_group || 'O+';
  const parentName = studentData?.parent_name || 'James Williams';
  const photoUrl = studentData?.photo_url;

  return (
    <div style={{ width: 340, height: 215, background: bgColor, borderRadius: design?.border_radius || 16, overflow: 'hidden', display: 'flex', position: 'relative', boxShadow: design?.card_shadow ? '0 10px 30px rgba(0,0,0,0.3)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
      {watermark && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-25deg)', fontSize: 30, fontWeight: 'bold', color: `${textColor}08`, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>{institute?.name?.split(' ')[0] || 'STUDENT'}</div>}

      <div style={{ width: 110, background: `linear-gradient(135deg, ${accentColor} 0%, ${bgColor} 100%)`, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 22 }}>🏫</span>}
        </div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 9, textAlign: 'center', textTransform: 'uppercase' }}>{name.split(' ').slice(0, 2).join(' ')}</div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: 6, fontWeight: 600, color: '#fff' }}>STUDENT ID</div>
        <div style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid #fff`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a5f' }}>
          {photoUrl ? <img src={photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 26 }}>👩‍🎓</span>}
        </div>
        {/* Removed class/section from here */}
      </div>

      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
        <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Student Name</div><div style={{ color: textColor, fontSize: 12, fontWeight: 800 }}>{fullName}</div></div>
        <div><div style={{ color: `${textColor}99`, fontSize: 6, fontWeight: 600, textTransform: 'uppercase' }}>Parent's Name</div><div style={{ color: textColor, fontSize: 10, fontWeight: 600 }}>{parentName}</div></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Class</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600 }}>{className}</div></div>
          <div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Section</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600 }}>{section}</div></div>
          <div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Roll No</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600, fontFamily: 'monospace' }}>{rollNumber}</div></div>
          <div><div style={{ color: `${textColor}99`, fontSize: 5, fontWeight: 600, textTransform: 'uppercase' }}>Blood</div><div style={{ color: textColor, fontSize: 9, fontWeight: 600 }}>{bloodGroup}</div></div>
        </div>
      </div>
    </div>
  );
};

// ==================== STUDENT CARD BACK ====================
const StudentCardBackVertical = ({ institute, design, studentData, termsList, showQr }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const logoUrl = institute?.logo_url;
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  const address = institute?.address || '123 Street, City';
  const phone = institute?.phone || '(123) 456-7890';
  const email = institute?.email || 'info@school.com';
  const validUpto = studentData?.valid_upto || '31 Dec 2025';

  return (
    <div style={{ width: 280, height: 400, background: '#f8fafc', borderRadius: design?.border_radius || 16, overflow: 'hidden', position: 'relative', fontFamily: "'Segoe UI', sans-serif", boxShadow: design?.card_shadow ? '0 20px 60px rgba(0,0,0,0.4)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
      <div style={{ background: bgColor, padding: '10px 16px' }}>
        <svg style={{ position: 'absolute', right: 0, top: 0 }} width="70" height="70" viewBox="0 0 70 70"><path d="M70 0 Q35 20 50 70 L70 70 Z" fill={accentColor} opacity="0.6" /></svg>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 6 }}>VALID UNTIL</div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{validUpto}</div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: bgColor, marginBottom: 8 }}>📜 Terms & Conditions</div>
        <div style={{ maxHeight: 130, overflowY: 'auto' }}>{termsList?.map((term, i) => (<div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, marginTop: 3 }} /><span style={{ fontSize: 8, color: '#374151' }}>{term}</span></div>))}</div>
      </div>
      <div style={{ padding: '0 16px 8px' }}><div style={{ fontSize: 10, fontWeight: 700, color: bgColor }}>Signature Authority</div><div style={{ fontSize: 7, color: '#6b7280' }}>Principal</div><svg width="80" height="18" viewBox="0 0 80 18"><path d="M5 14 Q15 3 25 11 Q35 20 45 8 Q55 0 65 10 Q75 20 85 7" stroke={bgColor} strokeWidth="1.2" fill="none" /></svg></div>
      {showQr && <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'center' }}><QRCodeDisplay size={55} value={studentData?.roll_number} /></div>}
      <div style={{ padding: '6px 16px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}><div style={{ fontSize: 7, color: '#4b5563' }}>📍 {address.slice(0, 30)}</div><div style={{ fontSize: 7, color: '#4b5563' }}>✉️ {email}</div><div style={{ fontSize: 7, color: '#4b5563' }}>📞 {phone}</div></div>
      <div style={{ background: bgColor, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} /> : <span style={{ fontSize: 14 }}>🏫</span>}</div><div><div style={{ color: '#fff', fontWeight: 800, fontSize: 8 }}>{name}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 5 }}>{tagline}</div></div></div>
    </div>
  );
};

const StudentCardBackHorizontal = ({ institute, design, studentData, termsList, showQr }) => {
  const bgColor = design?.background_color || '#0f172a';
  const accentColor = design?.accent_color || '#f97316';
  const name = institute?.name || 'ABC School';
  const tagline = institute?.settings?.academic?.school_tagline || 'Excellence in Education';
  const address = institute?.address || '123 Street, City';
  const phone = institute?.phone || '(123) 456-7890';
  const email = institute?.email || 'info@school.com';
  const validUpto = studentData?.valid_upto || '31 Dec 2025';

  return (
    <div style={{ width: 340, height: 215, background: '#f8fafc', borderRadius: design?.border_radius || 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: design?.card_shadow ? '0 10px 30px rgba(0,0,0,0.3)' : 'none', border: design?.show_border ? `1px solid ${design?.border_color || '#e2e8f0'}` : 'none' }}>
      <div style={{ background: bgColor, padding: '6px 16px', display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 6 }}>VALID UNTIL</div>
      <div style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{validUpto}</div></div>
      {/* <div style={{ fontSize: 7, color: '#fff', background: accentColor, padding: '2px 8px', borderRadius: 20 }}>BACK</div> */}
      </div>
      <div style={{ flex: 1, padding: '8px 16px', display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 800, color: bgColor, marginBottom: 6 }}>📜 Terms</div><div style={{ maxHeight: 85, overflowY: 'auto' }}>{termsList?.slice(0, 3).map((term, i) => (<div key={i} style={{ display: 'flex', gap: 4, marginBottom: 3 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: accentColor, marginTop: 4 }} /><span style={{ fontSize: 6.5, color: '#374151' }}>{term}</span></div>))}</div><div style={{ marginTop: 6 }}><div style={{ fontSize: 8, fontWeight: 700, color: bgColor }}>Signature</div><svg width="60" height="14" viewBox="0 0 60 14"><path d="M5 10 Q15 3 25 8 Q35 15 45 6 Q55 0 65 7" stroke={bgColor} strokeWidth="1" fill="none" /></svg></div></div>
        <div style={{ width: 1, background: '#e2e8f0' }} />
        <div style={{ flex: 0.8 }}><div style={{ fontSize: 8, fontWeight: 700, color: bgColor }}>Contact</div><div style={{ fontSize: 6.5, color: '#4b5563' }}>📍 {address.slice(0, 25)}</div><div style={{ fontSize: 6.5, color: '#4b5563' }}>✉️ {email}</div><div style={{ fontSize: 6.5, color: '#4b5563' }}>📞 {phone}</div>{showQr && <div style={{ marginTop: 4 }}><QRCodeDisplay size={40} value={studentData?.roll_number} /></div>}</div>
      </div>
      <div style={{ background: bgColor, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ fontSize: 9 }}>🏫</div><div><div style={{ color: '#fff', fontWeight: 800, fontSize: 8 }}>{name}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 5 }}>{tagline}</div></div></div>
    </div>
  );
};

// ==================== MAIN ID CARD COMPONENT ====================
const IDCardViewer = ({ studentData = {}, staffData = {}, policyOverride = null, hideControls = false }) => {
  const [isBack, setIsBack] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const cardRef = useRef(null);

  const getInstitute = useAuthStore(s => s.getInstitute);
  const getLatestPolicy = useAuthStore(s => s.getLatestPolicy);

  const institute = getInstitute();
  const policy = policyOverride || getLatestPolicy('id_card');

  const cardType = policy?.config?.card_type || 'student';
  const layout = policy?.config?.layout || 'vertical';
  const design = policy?.config?.design || {};
  const watermark = policy?.config?.show_watermark !== false;
  const showQr = policy?.config?.qr_enabled || false;
  const termsList = policy?.config?.terms_list || [];

  const staff = {
    full_name: 'John Doe',
    designation: 'Senior Teacher',
    employee_id: 'EMP-2024-001',
    department: 'Science Department',
    blood_group: 'O+',
    valid_upto: '31 Dec 2025',
    phone: '+92-123-456-7890',
    email: 'teacher@school.com',
    ...staffData
  };

  const student = {
    full_name: 'Marsha Williams',
    parent_name: 'James Williams',
    roll_number: 'SCH-1234-567',
    class: '2',
    section: 'A',
    blood_group: 'O+',
    valid_upto: '31 Dec 2025',
    photo_url: null,
    ...studentData
  };

  const handleFlip = () => { if (flipping) return; setFlipping(true); setTimeout(() => { setIsBack(p => !p); setFlipping(false); }, 300); };
  const handleDownloadPDF = () => { const printWindow = window.open('', '_blank'); const cardHTML = cardRef.current?.innerHTML || ''; const pageSize = layout === 'vertical' ? '3.15in 4.5in' : '3.8in 2.4in'; printWindow.document.write(`<!DOCTYPE html><html><head><title>ID Card</title><style>@page { size: ${pageSize}; margin: 0; } body { margin: 0; padding: 20px; background: #1e293b; display: flex; justify-content: center; align-items: center; min-height: 100vh; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }</style></head><body>${cardHTML}</body></html>`); printWindow.document.close(); printWindow.focus(); setTimeout(() => { printWindow.print(); printWindow.close(); }, 500); };
  const handlePrint = () => { window.print(); };

  const renderCard = () => {
    if (cardType === 'staff') {
      if (!isBack) {
        return layout === 'vertical'
          ? <StaffCardFrontVertical institute={institute} design={design} watermark={watermark} staffData={staff} />
          : <StaffCardFrontHorizontal institute={institute} design={design} watermark={watermark} staffData={staff} />;
      } else {
        return layout === 'vertical'
          ? <StaffCardBackVertical institute={institute} design={design} staffData={staff} termsList={termsList} showQr={showQr} />
          : <StaffCardBackHorizontal institute={institute} design={design} staffData={staff} termsList={termsList} showQr={showQr} />;
      }
    } else {
      if (!isBack) {
        return layout === 'vertical'
          ? <StudentCardFrontVertical institute={institute} design={design} watermark={watermark} studentData={student} />
          : <StudentCardFrontHorizontal institute={institute} design={design} watermark={watermark} studentData={student} />;
      } else {
        return layout === 'vertical'
          ? <StudentCardBackVertical institute={institute} design={design} studentData={student} termsList={termsList} showQr={showQr} />
          : <StudentCardBackHorizontal institute={institute} design={design} studentData={student} termsList={termsList} showQr={showQr} />;
      }
    }
  };

  if (hideControls) return renderCard();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={cardRef} style={{ transition: 'transform 0.3s ease, opacity 0.3s ease', transform: flipping ? 'rotateY(90deg) scale(0.95)' : 'rotateY(0deg) scale(1)', opacity: flipping ? 0 : 1 }}>{renderCard()}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}><div style={{ width: isBack ? 6 : 20, height: 6, borderRadius: 3, background: isBack ? 'rgba(0,0,0,0.2)' : (design?.accent_color || '#f97316') }} /><div style={{ width: isBack ? 20 : 6, height: 6, borderRadius: 3, background: isBack ? (design?.accent_color || '#f97316') : 'rgba(0,0,0,0.2)' }} /></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1px solid ${design?.accent_color || '#f97316'}`, background: 'transparent', color: design?.accent_color || '#f97316', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><FileDown size={14} /> Download PDF</button>
        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1px solid ${design?.accent_color || '#f97316'}`, background: 'transparent', color: design?.accent_color || '#f97316', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Printer size={14} /> Print</button>
        <button onClick={handleFlip} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: design?.accent_color || '#f97316', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' }}><RotateCcw size={14} /> {isBack ? 'Front' : 'Back'}</button>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: '#6b7280' }}>Card Type: {cardType === 'staff' ? 'Staff' : 'Student'} • Layout: {layout === 'vertical' ? 'Vertical' : 'Horizontal'}</div>
    </div>
  );
};

export default IDCardViewer;

