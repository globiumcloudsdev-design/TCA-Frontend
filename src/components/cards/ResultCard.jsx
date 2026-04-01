'use client';

/**
 * ResultCard — Professional A4-printable exam result card
 * Redesigned with clean typography, structured layout, and perfect print output
 */

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .rc-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    max-width: 100%;
  }

  .rc-top-bar {
    height: 4px;
    background: linear-gradient(90deg, #1a2942 0%, #2d6a9f 50%, #1a7a6e 100%);
  }

  .rc-inner { 
    padding: 24px 32px 20px; 
  }

  /* ── Header ── */
  .rc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8edf2;
    margin-bottom: 20px;
  }
  .rc-header-left { display: flex; align-items: center; gap: 14px; }

  .rc-logo-circle {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: #1a2942;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .rc-logo-img { width: 52px; height: 52px; border-radius: 50%; object-fit: contain; }

  .rc-inst-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 700; color: #1a2942; line-height: 1.2;
  }
  .rc-inst-sub { font-size: 10px; color: #6b7a8d; margin-top: 2px; letter-spacing: 0.5px; }

  .rc-badge {
    display: inline-block;
    padding: 4px 14px; border-radius: 16px;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.8px; text-transform: uppercase;
  }
  .rc-badge-pass { background: #e6f7ee; color: #1a7a4a; border: 1px solid #a8e6c3; }
  .rc-badge-fail { background: #fdecea; color: #b32b1a; border: 1px solid #f5b5ae; }
  .rc-badge-absent { background: #f0f4f8; color: #4a5568; border: 1px solid #cbd5e0; }
  .rc-gen-date { font-size: 9px; color: #9aa5b4; margin-top: 6px; text-align: right; }

  /* ── Title ── */
  .rc-title { text-align: center; margin-bottom: 20px; }
  .rc-title h2 {
    font-family: 'Playfair Display', serif;
    font-size: 13px; font-weight: 600;
    color: #1a2942; letter-spacing: 2px; text-transform: uppercase;
  }
  .rc-divider {
    display: flex; align-items: center; gap: 8px;
    margin-top: 6px; justify-content: center;
  }
  .rc-divider-line { height: 1px; width: 50px; background: #dde3ea; }
  .rc-divider-dot { width: 4px; height: 4px; border-radius: 50%; background: #2d6a9f; }

  /* ── Info Grid ── */
  .rc-info-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    border: 1px solid #e8edf2; border-radius: 8px;
    overflow: hidden; margin-bottom: 20px;
  }
  .rc-info-cell {
    padding: 10px 14px;
    border-right: 1px solid #e8edf2;
    border-bottom: 1px solid #e8edf2;
  }
  .rc-info-cell:nth-child(2n) { border-right: none; }
  .rc-info-cell:nth-last-child(-n+2) { border-bottom: none; }
  .rc-info-label {
    font-size: 9px; font-weight: 600; color: #8a97a8;
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px;
  }
  .rc-info-value { font-size: 13px; font-weight: 600; color: #1a2942; }
  .rc-status-pass { color: #1a7a4a; }
  .rc-status-fail { color: #b32b1a; }
  .rc-status-absent { color: #4a5568; }

  /* ── Section Label ── */
  .rc-section-label {
    font-size: 9px; font-weight: 600; color: #8a97a8;
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;
  }

  .rc-exam-name {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 600; color: #1a2942; margin-bottom: 12px;
  }

  /* ── Stats Row ── */
  .rc-stats-row {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 10px; margin-bottom: 20px;
  }
  .rc-stat-card {
    background: #f5f8fc; border-radius: 8px;
    padding: 12px; text-align: center;
    border: 1px solid #e8edf2;
  }
  .rc-stat-label {
    font-size: 9px; font-weight: 600; color: #8a97a8;
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;
  }
  .rc-stat-value { font-size: 22px; font-weight: 600; color: #1a2942; line-height: 1; }
  .rc-stat-value.blue  { color: #2d6a9f; }
  .rc-stat-value.green { color: #1a7a4a; }
  .rc-stat-value.amber { color: #b36a00; }
  .rc-stat-value.red   { color: #b32b1a; }

  /* ── Marks Table ── */
  .rc-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
  .rc-table thead tr { background: #1a2942; }
  .rc-table thead th {
    padding: 8px 10px; text-align: left;
    font-size: 9px; font-weight: 600;
    color: #c8d4e3; text-transform: uppercase; letter-spacing: 0.8px;
  }
  .rc-table thead th:not(:first-child) { text-align: center; }
  .rc-table tbody tr { border-bottom: 1px solid #edf0f4; }
  .rc-table tbody tr:last-child { border-bottom: none; }
  .rc-table tbody tr:nth-child(even) { background: #f8fafd; }
  .rc-table td { padding: 8px 10px; color: #2c3e50; font-weight: 500; }
  .rc-table td:not(:first-child) { text-align: center; }

  .rc-pct-pill {
    display: inline-block; padding: 2px 8px;
    border-radius: 10px; font-size: 10px; font-weight: 600;
  }
  .rc-pct-high { background: #e6f7ee; color: #1a7a4a; }
  .rc-pct-mid  { background: #fff8e6; color: #b36a00; }
  .rc-pct-low  { background: #fdecea; color: #b32b1a; }

  /* ── Summary Strip ── */
  .rc-summary {
    background: #1a2942;
    border-radius: 8px;
    display: grid; grid-template-columns: repeat(3,1fr);
    overflow: hidden; margin-bottom: 20px;
  }
  .rc-sum-cell {
    padding: 12px; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.1);
  }
  .rc-sum-cell:last-child { border-right: none; }
  .rc-sum-label {
    font-size: 9px; font-weight: 500;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;
  }
  .rc-sum-value {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: #fff;
  }

  /* ── Signatures ── */
  .rc-signatures {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 30px; margin-top: 8px;
    padding-top: 16px; border-top: 1px solid #e8edf2;
  }
  .rc-sig-block { text-align: center; }
  .rc-sig-line { border-top: 1px dashed #b0bec5; width: 70%; margin: 32px auto 8px; }
  .rc-sig-name {
    font-size: 10px; font-weight: 600;
    color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* ── Footer ── */
  .rc-footer { text-align: center; margin-top: 12px; font-size: 9px; color: #9aa5b4; }

  /* ── Print Optimizations ── */
  @media print {
    @page { 
      size: A4; 
      margin: 0.5in;
    }
    .rc-no-print { display: none !important; }
    .rc-wrap { 
      box-shadow: none !important; 
      border-radius: 0 !important;
      margin: 0;
      padding: 0;
      page-break-after: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rc-inner {
      padding: 0.2in 0.3in 0.2in;
    }
    .rc-top-bar,
    .rc-summary,
    .rc-table thead tr,
    .rc-table tbody tr:nth-child(even),
    .rc-pct-pill,
    .rc-badge,
    .rc-stat-card,
    .rc-logo-circle {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
    }
    /* Ensure content fits on one page */
    .rc-stats-row,
    .rc-table,
    .rc-summary,
    .rc-signatures {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Compact spacing for print */
    .rc-inner {
      padding: 0.15in 0.25in;
    }
    .rc-header {
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .rc-title {
      margin-bottom: 12px;
    }
    .rc-info-grid {
      margin-bottom: 12px;
    }
    .rc-stats-row {
      margin-bottom: 12px;
    }
    .rc-table {
      margin-bottom: 12px;
    }
    .rc-summary {
      margin-bottom: 12px;
    }
    .rc-signatures {
      margin-top: 4px;
      padding-top: 12px;
    }
    .rc-sig-line {
      margin-top: 20px;
    }
  }
`;

function getPctClass(pct) {
  if (pct >= 70) return 'rc-pct-high';
  if (pct >= 50) return 'rc-pct-mid';
  return 'rc-pct-low';
}

function getStatColor(pct) {
  if (pct >= 70) return 'green';
  if (pct >= 50) return 'amber';
  return 'red';
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export default function ResultCard({ student, exam, result, institute }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Result Card — ${student?.first_name} ${student?.last_name}</title>
          <style>${STYLES}</style>
          <style>
            /* Additional print-specific styles */
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .rc-wrap {
                margin: 0 auto;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body style="background:#fff;padding:0;margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
          <div style="max-width: 100%; margin: 0 auto;">
            ${printRef.current?.innerHTML || ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  if (!student || !exam || !result) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#9aa5b4', fontSize: 14 }}>
        Loading result card…
        {!student && <div style={{ fontSize: 12, marginTop: 8 }}>Student data missing</div>}
        {!exam    && <div style={{ fontSize: 12, marginTop: 4 }}>Exam data missing</div>}
        {!result  && <div style={{ fontSize: 12, marginTop: 4 }}>Result data missing</div>}
      </div>
    );
  }

  const inst = institute || { name: 'Institute Name', code: 'INST-CODE', logo_url: null, institute_type: 'institution' };

  const subjectMarks       = result.subject_marks || [];
  const totalMarksObtained = result.total_marks_obtained || 0;
  const percentage         = parseFloat(result.percentage || 0);
  const grade              = result.grade || 'N/A';
  const status             = result.status || 'absent';
  const registrationNo     = student.registration_no || 'N/A';

  const badgeClass =
    status === 'pass'   ? 'rc-badge rc-badge-pass' :
    status === 'fail'   ? 'rc-badge rc-badge-fail'  :
                          'rc-badge rc-badge-absent';

  const statusClass =
    status === 'pass'  ? 'rc-info-value rc-status-pass' :
    status === 'fail'  ? 'rc-info-value rc-status-fail'  :
                         'rc-info-value rc-status-absent';

  const instInitials = getInitials(inst.name);
  const generatedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="rc-no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={handlePrint} variant="outline" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Printer style={{ width: 15, height: 15 }} />
          Print Result Card
        </Button>
      </div>

      {/* ── Card ── */}
      <div ref={printRef} className="rc-wrap" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '0.5px solid #e8edf2', maxWidth: '100%' }}>
        <style>{STYLES}</style>

        <div className="rc-top-bar"></div>
        <div className="rc-inner">

          {/* Header */}
          <div className="rc-header">
            <div className="rc-header-left">
              {inst.logo_url
                ? <img src={inst.logo_url} alt={inst.name} className="rc-logo-img" />
                : <div className="rc-logo-circle">{instInitials}</div>
              }
              <div>
                <div className="rc-inst-name">{inst.name}</div>
                <div className="rc-inst-sub">
                  {inst.code}
                  {inst.institute_type && ` · ${inst.institute_type.charAt(0).toUpperCase() + inst.institute_type.slice(1)}`}
                </div>
              </div>
            </div>
            <div>
              <div className={badgeClass}>{status.toUpperCase()}</div>
              <div className="rc-gen-date">Generated: {generatedDate}</div>
            </div>
          </div>

          {/* Title */}
          <div className="rc-title">
            <h2>Official Examination Result Card</h2>
            <div className="rc-divider">
              <div className="rc-divider-line"></div>
              <div className="rc-divider-dot"></div>
              <div className="rc-divider-line"></div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="rc-info-grid">
            <div className="rc-info-cell">
              <div className="rc-info-label">Student Name</div>
              <div className="rc-info-value">{student.first_name} {student.last_name}</div>
            </div>
            <div className="rc-info-cell">
              <div className="rc-info-label">Roll Number</div>
              <div className="rc-info-value">{student.roll_number || 'N/A'}</div>
            </div>
            <div className="rc-info-cell">
              <div className="rc-info-label">Registration No.</div>
              <div className="rc-info-value">{registrationNo}</div>
            </div>
            <div className="rc-info-cell">
              <div className="rc-info-label">Overall Status</div>
              <div className={statusClass}>{status.toUpperCase()}</div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="rc-section-label">Examination Details</div>
          <div className="rc-exam-name">{exam.name}</div>

          <div className="rc-stats-row">
            <div className="rc-stat-card">
              <div className="rc-stat-label">Total Marks</div>
              <div className="rc-stat-value blue">{exam.total_marks}</div>
            </div>
            <div className="rc-stat-card">
              <div className="rc-stat-label">Marks Obtained</div>
              <div className="rc-stat-value green">{totalMarksObtained}</div>
            </div>
            <div className="rc-stat-card">
              <div className="rc-stat-label">Percentage</div>
              <div className={`rc-stat-value ${getStatColor(percentage)}`}>{percentage.toFixed(1)}%</div>
            </div>
          </div>

          {/* Subject Table */}
          <div className="rc-section-label">Subject-wise Performance</div>
          <table className="rc-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total Marks</th>
                <th>Marks Obtained</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {(exam.subject_schedules || []).map((subject, idx) => {
                const subjectMark  = subjectMarks.find(s => s.subject_id === subject.subject_id);
                const obtained     = subjectMark?.marks_obtained || 0;
                const subjectPct   = subject.total_marks > 0
                  ? parseFloat(((obtained / subject.total_marks) * 100).toFixed(1))
                  : 0;

                return (
                  <tr key={subject.subject_id || idx}>
                    <td>{subject.subject_name}</td>
                    <td>{subject.total_marks}</td>
                    <td>{obtained}</td>
                    <td>
                      <span className={`rc-pct-pill ${getPctClass(subjectPct)}`}>
                        {subjectPct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Strip */}
          <div className="rc-summary">
            <div className="rc-sum-cell">
              <div className="rc-sum-label">Grade</div>
              <div className="rc-sum-value">{grade}</div>
            </div>
            <div className="rc-sum-cell">
              <div className="rc-sum-label">Overall Score</div>
              <div className="rc-sum-value">{percentage.toFixed(1)}%</div>
            </div>
            <div className="rc-sum-cell">
              <div className="rc-sum-label">Result</div>
              <div className="rc-sum-value">{status.toUpperCase()}</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="rc-signatures">
            <div className="rc-sig-block">
              <div className="rc-sig-line"></div>
              <div className="rc-sig-name">Class Teacher</div>
            </div>
            <div className="rc-sig-block">
              <div className="rc-sig-line"></div>
              <div className="rc-sig-name">Head of Institute</div>
            </div>
          </div>

          {/* Footer */}
          <div className="rc-footer">
            Officially issued result card &nbsp;·&nbsp; {inst.name}
          </div>

        </div>
      </div>
    </div>
  );
}