import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";

/**
 * Generates an ultra-premium, aesthetically pleasing Monthly Attendance PDF Report.
 * Uses strict alignment, brand headers, distinct typography, and modern autoTable styling.
 */
export const generateSelfAttendanceReportPDF = ({
  user,
  schoolName,
  reportMonth,
  reportStats,
  historyData,
}) => {
  // Initialize standard A4 PDF in portrait format
  const doc = new jsPDF("p", "pt", "a4");

  // Modern Brand Theme Colors
  const PRIMARY_COLOR = [15, 23, 42]; // Slate-900 (Deep Navy Base)
  const ACCENT_COLOR = [37, 99, 235]; // Blue-600
  const TEXT_MUTED = [100, 116, 139]; // Slate-500
  const BG_LIGHT = [248, 250, 252]; // Slate-50
  
  // -- 1. DRAW HEADER BANNER --
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 595.28, 100, "F"); // Full width height 100 pt banner

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(schoolName, 40, 45);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240); // Slate-200
  doc.text("Self-Attendance Monthly Report", 40, 70);

  // -- 2. DOCUMENT METADATA INFO BLOCK --
  let yPos = 135;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("STAFF INFORMATION", 40, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  
  const staffName = user?.name || user?.username || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || "Teacher Staff";
  const staffRole = "Teacher";
  
  doc.text(`Name: ${staffName}`, 40, yPos + 18);
  doc.text(`Role: ${staffRole}`, 40, yPos + 32);
  
  // Right aligned reporting date block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("REPORTING PERIOD", 400, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  const formattedMonth = format(parseISO(reportMonth + "-01"), "MMMM yyyy");
  doc.text(`Month: ${formattedMonth}`, 400, yPos + 18);
  doc.text(`Generated: ${format(new Date(), "dd MMM, yyyy")}`, 400, yPos + 32);

  yPos += 60;
  
  // Draw Subtle Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(40, yPos, 555, yPos);
  yPos += 30;

  // -- 3. CONDENSED PERFORMANCE HIGHLIGHTS --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT_COLOR);
  doc.text("Performance & Analytics Overview", 40, yPos);
  yPos += 12;

  // Let's create an intuitive layout using autoTable for the highlights grid
  const statsOverview = [
    [
      "Attendance Score", `${reportStats?.attendance_percentage ?? "--"}%`,
      "Avg Check-In", `${reportStats?.avg_check_in || "--:--"}`
    ],
    [
      "Total Active Days", `${reportStats?.total_days ?? "--"} Days`,
      "Avg Check-Out", `${reportStats?.avg_check_out || "--:--"}`
    ],
    [
      "Present / Absent", `${reportStats?.present ?? "0"} / ${reportStats?.absent ?? "0"}`,
      "Avg Work Hrs", `${reportStats?.avg_working_hours || "--"}`
    ],
    [
      "Late Comings", `${reportStats?.late ?? "0"} Times (${reportStats?.total_late_minutes || "0"} min)`,
      "Overtime Log", `${reportStats?.total_overtime_minutes || "0"} minutes`
    ],
    [
      "Leave Recorded", `${reportStats?.on_leave ?? "0"} Days`,
      "", ""
    ]
  ];

  autoTable(doc, {
    startY: yPos,
    body: statsOverview,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 8, font: "helvetica" },
    columnStyles: {
      0: { fontStyle: "bold", textColor: TEXT_MUTED, cellWidth: 120 },
      1: { fontStyle: "bold", textColor: PRIMARY_COLOR, cellWidth: 100 },
      2: { fontStyle: "bold", textColor: TEXT_MUTED, cellWidth: 120 },
      3: { fontStyle: "bold", textColor: PRIMARY_COLOR, cellWidth: 100 },
    },
    didDrawCell: function(data) {
       // Draw subtle border around rows for visual depth
       if (data.column.index === 1 || data.column.index === 3) {
          doc.setDrawColor(241, 245, 249); // slate-100
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "S");
       }
    },
    margin: { left: 40, right: 40 }
  });

  yPos = doc.lastAutoTable.finalY + 40;

  // -- 4. MAIN ATTENDANCE LOG TABLE --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT_COLOR);
  doc.text("Daily Logbook Records", 40, yPos);
  yPos += 15;

  const tableRows = historyData.map((log) => [
    format(new Date(log.date), "dd MMM yyyy"),
    log.status?.replace(/_/g, " ") || "N/A",
    log.check_in ? format(new Date(log.check_in), "hh:mm a") : "--:--",
    log.check_out ? format(new Date(log.check_out), "hh:mm a") : "--:--",
    log.duration_display || "--",
    log.late_minutes ? `${log.late_minutes}m` : "-",
    log.remarks || log.leave?.remarks || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Status", "Check-In", "Check-Out", "Duration", "Late", "Remarks"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: 255,
      fontStyle: "bold",
      halign: "center"
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 6, 
      font: "helvetica",
      textColor: [51, 65, 85], // slate-700
      halign: "center"
    },
    alternateRowStyles: { fillColor: BG_LIGHT },
    columnStyles: {
      1: { fontStyle: "bold" },
      6: { halign: "left" } // Remarks should be left aligned
    },
    margin: { left: 40, right: 40 }
  });

  // -- 5. FOOTER & PAGINATION --
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    
    // Bottom border
    doc.setDrawColor(226, 232, 240);
    doc.line(40, 800, 555, 800);
    
    doc.text(
      `Private & Confidential. Auto-generated by © ${schoolName}`,
      40,
      815
    );
    doc.text(`Page ${i} of ${pageCount}`, 515, 815);
  }

  // Finally download the beautiful report
  doc.save(`Attendance_Report_${reportMonth.replace("-", "_")}.pdf`);
};
