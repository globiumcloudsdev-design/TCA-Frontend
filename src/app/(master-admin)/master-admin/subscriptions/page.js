//src/app/(master-admin)/master-admin/subscriptions/page.js
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt, RefreshCw, CheckCircle2, AlertTriangle,
  TrendingUp, X, Loader2, Building2, FileText, CreditCard, Trash2,
  Printer, Download,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import { PageHeader, AppModal, StatsCard, DataTable, SelectField, ConfirmDialog, DatePickerField } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'PENDING',   label: 'Pending' },
  { value: 'PAID',      label: 'Paid' },
  { value: 'OVERDUE',   label: 'Overdue' },
  { value: 'DRAFT',     label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLE = {
  DRAFT:     { badge: 'bg-slate-100 text-slate-600 border border-slate-200', label: 'Draft' },
  PENDING:   { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Pending' },
  PAID:      { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Paid' },
  OVERDUE:   { badge: 'bg-red-100 text-red-700 border border-red-200',       label: 'Overdue' },
  CANCELLED: { badge: 'bg-slate-100 text-slate-500 border border-slate-200', label: 'Cancelled' },
};

const PAYMENT_METHODS = [
  { value: 'MANUAL',        label: 'Manual Entry' },
  { value: 'CASH',          label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE',        label: 'Cheque' },
  { value: 'ONLINE',        label: 'Online Payment' },
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtAmt = (a, c = 'PKR') =>
  a != null ? `${c} ${Number(a).toLocaleString()}` : '—';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MasterAdminInvoicesPage() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [page,         setPage]         = useState(1);
  const [payModal,     setPayModal]     = useState(null);
  const [payForm,      setPayForm]      = useState({
    payment_reference: '',
    notes: '',
  });
  const [manualInvoiceOpen, setManualInvoiceOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [printLayout, setPrintLayout] = useState('A4'); // 'A4' or 'THERMAL'

  // react-hook-form for SelectField
  const { control, watch, reset } = useForm({
    defaultValues: { payment_method: 'MANUAL' },
  });

  // ── Fetch all invoices ────────────────────────────────────────────────────
  const {
    data, isLoading, isFetching, refetch, isError, error,
  } = useQuery({
    queryKey: ['all-invoices', statusFilter, dateFrom, dateTo, page],
    queryFn: () =>
      masterAdminService.getAllInvoices({
        status:    statusFilter || undefined,
        date_from: dateFrom     || undefined,
        date_to:   dateTo       || undefined,
        page,
        limit: 15,
      }),
    staleTime: 0,
    // refetchOnWindowFocus: true,
  });

  const invoices   = data?.data?.rows       ?? data?.rows       ?? [];
  const total      = data?.data?.total      ?? data?.total      ?? 0;
  const totalPages = data?.data?.totalPages ?? data?.totalPages ?? 1;
  const summary    = data?.data?.summary    ?? data?.summary    ?? {};

  // ── Mark as Paid ─────────────────────────────────────────────────────────
  const markPaidMutation = useMutation({
    mutationFn: ({ id, formData }) => masterAdminService.markInvoicePaid(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
      toast.success('Invoice marked as paid ✅');
      setPayModal(null);
      setPayForm({ payment_reference: '', notes: '' });
      reset({ payment_method: 'MANUAL' });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  // ── Invoice Deletions ─────────────────────────────────────────────────────
  const deleteInvoiceMutation = useMutation({
    mutationFn: (id) => masterAdminService.deleteInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
      toast.success('Invoice deleted successfully 🗑️');
      setSelectedInvoices([]);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed to delete invoice'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => masterAdminService.bulkDeleteInvoices(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
      toast.success('Selected invoices deleted successfully 🗑️');
      setSelectedInvoices([]);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed to delete invoices'),
  });

  const handleDelete = (inv) => {
    setDeleteTarget(inv);
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) return;
    setBulkDeleteOpen(true);
  };

  const openPayModal = (inv) => {
    setPayModal(inv);
    setPayForm({ payment_reference: '', notes: '' });
    // ensure SelectField defaults to MANUAL on open
    reset({ payment_method: 'MANUAL' });
  };

  const handleStatusChange = (s) => { setStatusFilter(s); setPage(1); };
  const handleDateFrom = (v) => {
    setDateFrom(v);
    setPage(1);
    // If "To" date is before "From" date, clear it
    if (v && dateTo && new Date(dateTo) < new Date(v)) {
      setDateTo('');
    }
  };
  const handleDateTo = (v) => {
    setDateTo(v);
    setPage(1);
  };

  const handleConfirmPaid = () => {
    if (!payModal) return;
    const payload = {
      payment_method: watch('payment_method'),
      payment_reference: payForm.payment_reference,
      notes: payForm.notes,
    };
    markPaidMutation.mutate({ id: payModal.id, formData: payload });
  };

  const handlePrintInvoice = (inv, layout = 'A4') => {
    const isThermal = layout === 'THERMAL';
    const printWindow = window.open('', '_blank', isThermal ? 'width=450,height=800' : 'width=850,height=900');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print invoices.");
      return;
    }

    const logoUrl = window.location.origin + '/logos/TCA LOGO PNG light theme.png';

    const html = `
      <html>
        <head>
          <title>Invoice - ${inv.invoice_number || inv.id}</title>
          <style>
            ${isThermal ? `
              @page { size: 80mm auto; margin: 0; }
              body { 
                font-family: 'Courier New', Courier, monospace; 
                color: #000; 
                background: #fff; 
                padding: 15px; 
                margin: 0; 
                width: 74mm;
                font-size: 11px;
                line-height: 1.4;
              }
              .thermal-header { text-align: center; margin-bottom: 15px; }
              .thermal-logo { width: 55px; height: 55px; object-fit: contain; margin-bottom: 5px; }
              .thermal-title { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; }
              .thermal-sub { font-size: 9px; color: #333; margin: 2px 0 5px 0; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10px; }
              .meta-label { font-weight: bold; }
              
              .item-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              .item-table th { border-bottom: 1px dashed #000; text-align: left; padding: 4px 0; font-size: 10px; }
              .item-table td { padding: 6px 0; font-size: 10px; vertical-align: top; }
              .item-table .num { text-align: right; }
              
              .totals-box { display: flex; flex-direction: column; align-items: flex-end; margin-top: 10px; }
              .total-row { display: flex; justify-content: space-between; width: 100%; font-size: 11px; margin-bottom: 3px; }
              .total-row.grand { font-weight: bold; font-size: 13px; border-top: 1px dashed #000; padding-top: 5px; }
              
              .status-stamp { 
                text-align: center; 
                border: 2px solid #000; 
                padding: 5px; 
                margin: 15px auto; 
                width: 70%; 
                font-weight: bold; 
                font-size: 14px; 
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              
              .thermal-footer { text-align: center; font-size: 9px; margin-top: 25px; border-top: 1px dashed #000; padding-top: 10px; }
            ` : `
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 20px; margin: 0; background: #fff; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-container { display: flex; align-items: center; gap: 15px; }
              .logo-img { width: 60px; height: 60px; object-fit: contain; }
              .logo-title { font-size: 26px; font-weight: 900; color: #4f46e5; margin: 0; letter-spacing: -0.5px; }
              .logo-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; }
              .invoice-title { font-size: 32px; font-weight: 900; color: #0f172a; text-align: right; margin: 0; letter-spacing: -1px; }
              .invoice-num { font-family: monospace; font-size: 14px; color: #64748b; text-align: right; margin-top: 5px; }
              
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .meta-block h3 { font-size: 11px; text-transform: uppercase; color: #64748b; margin: 0 0 8px 0; letter-spacing: 1px; font-weight: 800; }
              .meta-block p { font-size: 15px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b; }
              .meta-block span { font-size: 12px; color: #64748b; line-height: 1.5; }
              
              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .table th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 14px 12px; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #475569; text-align: left; letter-spacing: 0.5px; }
              .table td { padding: 18px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; }
              .table td.num { font-family: monospace; font-weight: 700; text-align: right; }
              .table th.num { text-align: right; }
              
              .summary-container { display: flex; justify-content: flex-end; margin-bottom: 40px; }
              .summary-table { width: 320px; }
              .summary-table tr td { padding: 10px 12px; font-size: 14px; }
              .summary-table tr td.lbl { color: #64748b; }
              .summary-table tr td.val { font-family: monospace; font-weight: 700; text-align: right; color: #1e293b; }
              .summary-table tr.total { border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: 900; }
              .summary-table tr.total td { padding-top: 18px; }
              .summary-table tr.total td.val { color: #4f46e5; }
              
              .badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
              .badge-paid { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
              .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
              .badge-overdue { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
              
              .pay-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; font-size: 13px; margin-top: 30px; line-height: 1.6; }
              .pay-box strong { color: #0f172a; font-size: 14px; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
              
              .footer { border-top: 1px solid #e2e8f0; padding-top: 25px; font-size: 12px; color: #94a3b8; text-align: center; margin-top: 80px; line-height: 1.5; }
            `}
          </style>
        </head>
        <body>
          ${isThermal ? `
            <div class="thermal-header">
              <img class="thermal-logo" src="${logoUrl}" alt="TCA Logo" onerror="this.style.display='none'" />
              <h1 class="thermal-title">THE CLOUDS ACADEMY</h1>
              <div class="thermal-sub">ERP SUITE & PLATFORM BILLING</div>
              <div>support@thecloudsacademy.com</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="meta-row"><span class="meta-label">INVOICE:</span><span>${inv.invoice_number || inv.id}</span></div>
            <div class="meta-row"><span class="meta-label">DATE:</span><span>${new Date(inv.created_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div class="meta-row"><span class="meta-label">DUE DATE:</span><span>${new Date(inv.due_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div class="meta-row"><span class="meta-label">CLIENT:</span><span>${inv.institute?.institute_name || inv.institute_name || '—'}</span></div>
            
            <div class="divider"></div>
            
            <table class="item-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="num">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    ${inv.plan?.name || 'Standard Plan'} Subscription<br/>
                    <small>Period: ${new Date(inv.period_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })} - ${new Date(inv.period_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</small>
                  </td>
                  <td class="num">${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="totals-box">
              <div class="total-row"><span>Subtotal:</span><span>${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</span></div>
              <div class="total-row grand"><span>GRAND TOTAL:</span><span>${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</span></div>
            </div>
            
            <div class="status-stamp">
              ${inv.status}
            </div>

            ${inv.status === 'PAID' ? `
              <div class="divider"></div>
              <div style="font-size: 9px; line-height: 1.3;">
                <strong>PAYMENT RECEIPT:</strong><br/>
                METHOD: ${inv.payment_method || 'Manual'}<br/>
                REF ID: ${inv.payment_reference || 'N/A'}<br/>
                PAID AT: ${new Date(inv.paid_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            ` : ''}
            
            <div class="thermal-footer">
              Thank you for choosing<br/>The Clouds Academy!<br/>
              www.thecloudsacademy.com
            </div>
          ` : `
            <div class="header">
              <div class="logo-container">
                <img class="logo-img" src="${logoUrl}" alt="TCA Logo" />
                <div>
                  <h1 class="logo-title">The Clouds Academy</h1>
                  <div class="logo-sub">Cloud-based ERP Platform</div>
                </div>
              </div>
              <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-num">${inv.invoice_number || inv.id}</div>
              </div>
            </div>
            
            <div class="meta-grid">
              <div class="meta-block">
                <h3>Billed To:</h3>
                <p>${inv.institute?.institute_name || inv.institute_name || '—'}</p>
                <span>
                  ${inv.institute?.city || 'Pakistan'}<br/>
                  Support contact: ${inv.institute?.contact || '—'}
                </span>
              </div>
              <div class="meta-block" style="text-align: right;">
                <h3>Invoice Information:</h3>
                <div style="margin-bottom: 8px;">
                  <span class="badge badge-${String(inv.status).toLowerCase()}">${inv.status}</span>
                </div>
                <span>Issued Date: ${new Date(inv.created_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span><br/>
                <span>Due Date: ${new Date(inv.due_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Billing Period</th>
                  <th class="num">Unit Price</th>
                  <th class="num">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${inv.plan?.name || 'Standard Plan'} Subscription</strong><br/>
                    <small style="color: #64748b; font-size: 12px; margin-top: 4px; display: inline-block;">
                      Billing Cycle: ${inv.plan?.cycle || inv.billing_cycle || 'Monthly'} | Platform License Fee
                    </small>
                  </td>
                  <td>
                    ${new Date(inv.period_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })} - 
                    ${new Date(inv.period_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td class="num">${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</td>
                  <td class="num">${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="summary-container">
              <table class="summary-table">
                <tr>
                  <td class="lbl">Subtotal</td>
                  <td class="val">${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</td>
                </tr>
                <tr class="total">
                  <td>Grand Total</td>
                  <td class="val">${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            ${inv.status === 'PAID' ? `
            <div class="pay-box">
              <strong>Payment Status Verification Receipt</strong>
              <span>This subscription invoice has been successfully processed and verified.</span><br/>
              <span style="font-family: monospace; display: inline-block; margin-top: 8px;">
                Method: ${inv.payment_method || 'Manual Entry'} | 
                Reference Transaction: ${inv.payment_reference || 'N/A'} | 
                Paid Date: ${new Date(inv.paid_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Thank you for partnering with The Clouds Academy!</p>
              <p>For billing support or platform queries, please contact support@thecloudsacademy.com</p>
            </div>
          `}
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDownloadInvoicePdf = async (inv) => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    
    // 1. Fetch logo image URL asynchronously
    const logoUrl = window.location.origin + '/logos/TCA LOGO PNG light theme.png';
    const logoImg = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });

    // --- Top Header (Matching A4 Print Layout) ---
    const headerY = 15;
    
    // Left: Logo and branding
    if (logoImg) {
      try {
        doc.addImage(logoImg, 'PNG', 15, headerY, 14, 14);
      } catch (e) {
        console.error("Error drawing logo in PDF header: ", e);
      }
    }
    
    // Brand title
    doc.setTextColor(101, 93, 237); // TCA Primary (#655DED)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('The Clouds Academy', logoImg ? 32 : 15, headerY + 6);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Gray
    doc.text('Cloud-based ERP Platform', logoImg ? 32 : 15, headerY + 11);
    
    // Right: INVOICE title & number
    doc.setTextColor(15, 23, 42); // Dark Slate
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('INVOICE', 195, headerY + 6, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(String(inv.invoice_number || inv.id), 195, headerY + 11, { align: 'right' });
    
    // Divider line below header
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, headerY + 16, 195, headerY + 16);
    
    // --- Metadata Grid ---
    let currentY = headerY + 26;
    
    // Headers
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BILLED TO:', 15, currentY);
    doc.text('INVOICE DETAILS:', 195, currentY, { align: 'right' });
    
    currentY += 6;
    // Billed to details
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(String(inv.institute?.institute_name || inv.institute_name || '—'), 15, currentY);
    
    // Status Badge background
    const isPaid = inv.status === 'PAID';
    const isOverdue = inv.status === 'OVERDUE';
    if (isPaid) {
      doc.setFillColor(209, 250, 229); // Light green
      doc.setTextColor(6, 95, 70); // Dark green
    } else if (isOverdue) {
      doc.setFillColor(254, 226, 226); // Light red
      doc.setTextColor(153, 27, 27); // Dark red
    } else {
      doc.setFillColor(254, 243, 199); // Light yellow
      doc.setTextColor(146, 64, 14); // Dark yellow
    }
    doc.rect(171, currentY - 4, 24, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(inv.status), 183, currentY, { align: 'center' });
    
    currentY += 6;
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(String(inv.institute?.city || 'Pakistan'), 15, currentY);
    doc.text(`Issued Date: ${new Date(inv.created_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`, 195, currentY, { align: 'right' });
    
    currentY += 5;
    if (inv.institute?.contact) {
      doc.text(`Contact: ${inv.institute?.contact}`, 15, currentY);
    }
    doc.text(`Due Date: ${new Date(inv.due_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`, 195, currentY, { align: 'right' });
    
    currentY += 12;
    
    // --- Table ---
    autoTable(doc, {
      startY: currentY,
      margin: { left: 15, right: 15 },
      head: [['Subscription Description', 'Billing Period', 'Billing Cycle', 'Price']],
      body: [
        [
          `${inv.plan?.name || 'Standard Plan'} Subscription Fee`,
          `${new Date(inv.period_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })} - ${new Date(inv.period_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`,
          `${inv.plan?.cycle || inv.billing_cycle || 'Monthly'}`,
          `${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}`
        ]
      ],
      theme: 'plain',
      headStyles: { 
        fillColor: [248, 250, 252], // #f8fafc
        textColor: [71, 85, 105], // #475569
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: { 
        fontSize: 7.5, 
        cellPadding: 5,
        textColor: [51, 65, 85] // #334155
      },
      columnStyles: { 
        3: { halign: 'right', fontStyle: 'bold' } 
      },
      didDrawCell: (data) => {
        // Draw bottom border under all cells
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.3);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        
        // Draw slightly thicker border under headers matching print layout th border bottom
        if (data.section === 'head') {
          doc.setDrawColor(203, 213, 225); // #cbd5e1
          doc.setLineWidth(0.6);
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        }
      }
    });
    
    currentY = doc.lastAutoTable.finalY + 12;
    
    // --- Totals ---
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 125, currentY);
    doc.text(`${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}`, 195, currentY, { align: 'right' });
    
    currentY += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(125, currentY, 195, currentY);
    
    currentY += 8;
    doc.setTextColor(101, 93, 237); // TCA Primary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Grand Total:', 125, currentY);
    doc.text(`${inv.currency || 'PKR'} ${Number(inv.amount || inv.total_amount).toLocaleString()}`, 195, currentY, { align: 'right' });
    
    currentY += 15;
    
    // --- Payment Receipt Card ---
    if (inv.status === 'PAID') {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, currentY, 180, 22, 'FD');
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PAYMENT RECEIPT VERIFICATION', 20, currentY + 7);
      
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Method: ${inv.payment_method || 'Manual Entry'}  |  Reference ID: ${inv.payment_reference || 'N/A'}  |  Paid Date: ${new Date(inv.paid_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`, 20, currentY + 14);
    }
    
    // --- Footer at bottom of the page ---
    const footerY = 265;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, footerY - 5, 195, footerY - 5);
    
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Thank you for choosing The Clouds Academy!', 105, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is an officially processed and verified invoice. For billing support, email support@thecloudsacademy.com', 105, footerY + 5, { align: 'center' });
    
    doc.save(`Invoice_${inv.invoice_number || inv.id}.pdf`);
    toast.success("PDF Downloaded successfully!");
  };

  // ── Column Definitions ────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      id: 'institute',
      header: 'Institute',
      cell: ({ row: { original: inv } }) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 rounded-lg bg-slate-100 p-1.5">
            <Building2 size={14} className="text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate text-sm">
              {inv.institute?.institute_name ?? '—'}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {inv.invoice_number ?? inv.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'plan',
      header: 'Plan',
      accessorFn: (row) => row.plan?.name ?? '',
      cell: ({ row: { original: inv } }) => (
        <div className="flex items-center gap-1.5 text-xs">
          <FileText size={12} className="text-muted-foreground shrink-0" />
          <span className="truncate">{inv.plan?.name ?? '—'}</span>
          {inv.plan?.cycle && (
            <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-px text-[10px] text-blue-600 border border-blue-100">
              {inv.plan.cycle}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Amount',
      cell: ({ row: { original: inv } }) => (
        <span className="font-semibold text-slate-800 font-mono text-sm">
          {fmtAmt(inv.total_amount, inv.currency)}
        </span>
      ),
    },
    {
      id: 'period',
      header: 'Period',
      cell: ({ row: { original: inv } }) => (
        <div className="text-xs text-muted-foreground">
          <p>{fmtDate(inv.period_start)}</p>
          <p>{fmtDate(inv.period_end)}</p>
        </div>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row: { original: inv } }) => {
        const isOverdue = inv.status === 'OVERDUE';
        const isPaid    = inv.status === 'PAID';
        return (
          <div className={cn('text-xs font-medium', isOverdue ? 'text-red-600' : 'text-muted-foreground')}>
            {fmtDate(inv.due_date)}
            {isOverdue && <p className="text-[10px] font-semibold text-red-500">OVERDUE</p>}
            {isPaid && inv.paid_at && (
              <p className="text-[10px] text-emerald-600">Paid {fmtDate(inv.paid_at)}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original: inv } }) => {
        const s = STATUS_STYLE[inv.status] ?? STATUS_STYLE.PENDING;
        return (
          <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap', s.badge)}>
            {s.label}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row: { original: inv } }) => (
        <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center justify-center px-2"
            onClick={() => setPreviewInvoice(inv)}
            title="Print / PDF"
          >
            <Receipt size={11} className="shrink-0" />
            <span className="hidden sm:inline">Print / PDF</span>
          </Button>
          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center justify-center px-2"
              onClick={() => openPayModal(inv)}
              title="Mark Paid"
            >
              <CreditCard size={11} className="shrink-0" />
              <span className="hidden sm:inline">Mark Paid</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
            onClick={() => handleDelete(inv)}
            disabled={deleteInvoiceMutation.isPending}
            title="Delete"
          >
            <Trash2 size={12} className="shrink-0" />
          </Button>
        </div>
      ),
    },
  ], []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <PageHeader
        title="🧾 Invoices"
        description="View and manage all institute invoices — paid and unpaid"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
              <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setManualInvoiceOpen(true)} className="gap-1.5">
              <FileText size={15} /> Create Invoice
            </Button>
          </div>
        }
      />

      {/* ── Error banner ── */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <X size={15} />
          <span>{error?.response?.data?.message ?? error?.message ?? 'Cannot connect to backend'}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-red-600" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard
          label="Total Invoices"
          value={isLoading ? '…' : total}
          icon={<Receipt size={16} />}
        />
        <StatsCard
          label="Paid"
          value={isLoading ? '…' : (summary.PAID ?? 0)}
          icon={<CheckCircle2 size={16} />}
          valueClassName="text-emerald-600"
        />
        <StatsCard
          label="Pending / Overdue"
          value={isLoading ? '…' : ((summary.PENDING ?? 0) + (summary.OVERDUE ?? 0))}
          icon={<AlertTriangle size={16} />}
          valueClassName="text-amber-600"
        />
        <StatsCard
          label="Total Collected"
          value={isLoading ? '…' : `PKR ${((summary.total_paid_amount ?? 0) / 1000).toFixed(0)}K`}
          icon={<TrendingUp size={16} />}
          valueClassName="text-violet-600"
        />
      </div>

      {/* ── DataTable ── */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading || isFetching}
        enableRowSelection
        onRowSelectionChange={setSelectedInvoices}
        selectionActions={
          <Button
            size="sm"
            variant="destructive"
            className="h-9 gap-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm"
            onClick={() => handleBulkDelete()}
            disabled={bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete Selected
          </Button>
        }
        enableColumnVisibility
        // exportConfig={{ fileName: 'invoices', dateField: 'created_at' }}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
          },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
              <DatePickerField
                placeholder="From Date"
                value={dateFrom}
                onChange={handleDateFrom}
                className="w-36 [&_button]:h-9 [&_button]:text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
              <DatePickerField
                placeholder="To Date"
                value={dateTo}
                onChange={handleDateTo}
                minDate={dateFrom}
                className="w-36 [&_button]:h-9 [&_button]:text-xs"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground shrink-0"
                onClick={() => { handleDateFrom(''); handleDateTo(''); }}
              >
                <X size={13} />
              </Button>
            )}
          </div>
        }
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      {/* ── Mark as Paid Modal ── */}
      {payModal && (
        <AppModal
          open={!!payModal}
          onClose={() => {
            setPayModal(null);
            reset({ payment_method: 'MANUAL' });
          }}
          title="✅ Mark Invoice as Paid"
          description={`${payModal.invoice_number ?? 'Invoice'} — ${payModal.institute?.institute_name ?? ''}`}
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setPayModal(null);
                  reset({ payment_method: 'MANUAL' });
                }}
                disabled={markPaidMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPaid}
                disabled={markPaidMutation.isPending}
                className="gap-1.5 min-w-[130px]"
              >
                {markPaidMutation.isPending
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
                {markPaidMutation.isPending ? 'Saving…' : 'Confirm Paid'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            {/* Invoice summary */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <strong>{fmtAmt(payModal.total_amount, payModal.currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span>{fmtDate(payModal.period_start)} – {fmtDate(payModal.period_end)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className={payModal.status === 'OVERDUE' ? 'text-red-600 font-semibold' : ''}>
                  {fmtDate(payModal.due_date)}
                </span>
              </div>
            </div>

            {/* Payment method (SelectField controlled by react-hook-form) */}
            <div>
              <SelectField
                label="Payment Method"
                name="payment_method"
                control={control}
                options={PAYMENT_METHODS}
                required
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Reference / Transaction ID{' '}
                <span className="font-normal">(optional)</span>
              </label>
              <Input
                value={payForm.payment_reference}
                onChange={(e) => setPayForm((p) => ({ ...p, payment_reference: e.target.value }))}
                placeholder="e.g. TXN-20240101-001"
                className="h-9"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Notes <span className="font-normal">(optional)</span>
              </label>
              <textarea
                value={payForm.notes}
                onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                placeholder="Any additional notes…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </AppModal>
      )}

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteInvoiceMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteInvoiceMutation.isPending}
        title="🗑️ Delete Invoice"
        description={`Permanently delete invoice "${deleteTarget?.invoice_number ?? deleteTarget?.id}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* ── Bulk Delete Confirm ── */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          const ids = selectedInvoices.map((inv) => inv.id);
          bulkDeleteMutation.mutate(ids);
          setBulkDeleteOpen(false);
        }}
        loading={bulkDeleteMutation.isPending}
        title="🗑️ Delete Selected Invoices"
        description={`Permanently delete ${selectedInvoices.length} selected invoices? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="destructive"
      />

      {/* ── Invoice Print/PDF Center Modal ── */}
      {previewInvoice && (
        <AppModal
          open={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          title="🧾 Invoice Print & PDF Center"
          description="View, print or download standard A4 pages and Thermal receipts"
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => setPreviewInvoice(null)}
                className="text-xs"
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5 text-xs text-tca-primary border-tca-primary/20 hover:bg-tca-primary/5"
                  onClick={() => handleDownloadInvoicePdf(previewInvoice)}
                >
                  <Download size={13} />
                  Save as PDF
                </Button>
                <Button
                  className="gap-1.5 text-xs bg-tca-primary hover:bg-tca-primary/95 text-white shadow-md font-semibold"
                  onClick={() => handlePrintInvoice(previewInvoice, printLayout)}
                >
                  <Printer size={13} />
                  Print Now ({printLayout})
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Format Toggle Panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Print/PDF Format</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Toggle between standard document and mini receipt styles</p>
              </div>
              <div className="flex rounded-lg border bg-white p-1 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setPrintLayout('A4')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                    printLayout === 'A4'
                      ? "bg-tca-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <FileText size={13} />
                  📄 A4 Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLayout('THERMAL')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                    printLayout === 'THERMAL'
                      ? "bg-tca-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Receipt size={13} />
                  📟 POS Thermal
                </button>
              </div>
            </div>

            {/* Premium Preview Wrapper */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-100/50 p-6 flex justify-center max-h-[500px] overflow-y-auto">
              {printLayout === 'A4' ? (
                /* --- A4 Style Sheet Mockup --- */
                <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8 border border-slate-200 text-slate-800 text-left scale-95 sm:scale-100 origin-top">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b pb-5 mb-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/logos/TCA LOGO PNG light theme.png" 
                        alt="TCA Logo" 
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h2 className="text-xl font-black text-tca-primary leading-none">The Clouds Academy</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud-based ERP Platform</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">INVOICE</h1>
                      <span className="text-xs font-mono text-slate-400 mt-1 block">{previewInvoice.invoice_number || previewInvoice.id}</span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Billed To</span>
                      <p className="font-bold text-slate-800 text-sm leading-snug">{previewInvoice.institute?.institute_name || previewInvoice.institute_name || '—'}</p>
                      <span className="text-xs text-slate-500 block mt-1">{previewInvoice.institute?.city || 'Pakistan'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Invoice Information</span>
                      <div className="mb-2">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          previewInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          previewInvoice.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        )}>
                          {previewInvoice.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block">Issued: {new Date(previewInvoice.created_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-xs text-slate-500 block">Due: {new Date(previewInvoice.due_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full border-collapse text-xs mb-6">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-3 text-left font-bold text-slate-500 uppercase">Description</th>
                        <th className="p-3 text-left font-bold text-slate-500 uppercase">Billing Period</th>
                        <th className="p-3 text-right font-bold text-slate-500 uppercase">Unit Price</th>
                        <th className="p-3 text-right font-bold text-slate-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-semibold text-slate-700">
                          {previewInvoice.plan?.name || 'Standard Plan'} Subscription<br/>
                          <span className="text-[10px] font-normal text-slate-400">Cycle: {previewInvoice.plan?.cycle || previewInvoice.billing_cycle || 'Monthly'}</span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(previewInvoice.period_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })} - 
                          {new Date(previewInvoice.period_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Summary Block */}
                  <div className="flex justify-end mb-6">
                    <table className="w-48 text-xs">
                      <tbody>
                        <tr>
                          <td className="py-1 text-slate-400">Subtotal</td>
                          <td className="py-1 text-right font-mono font-semibold">{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</td>
                        </tr>
                        <tr className="border-t border-slate-200 font-bold text-sm text-tca-primary">
                          <td className="pt-2">Grand Total</td>
                          <td className="pt-2 text-right font-mono">{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Paid Stamp Receipt Box */}
                  {previewInvoice.status === 'PAID' && (
                    <div className="bg-emerald-50/50 border border-dashed border-emerald-200 rounded-lg p-4 text-xs text-emerald-800 mb-4">
                      <strong className="block mb-1 text-emerald-950 uppercase tracking-wide">Payment Confirmed</strong>
                      <span>Processed via {previewInvoice.payment_method || 'Manual Entry'} | Txn ID: {previewInvoice.payment_reference || 'N/A'}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* --- Thermal Mini POS Roll Mockup --- */
                <div className="w-[300px] bg-white border border-zinc-200 shadow-sm rounded-lg p-5 font-mono text-[10px] text-zinc-800 text-left relative overflow-hidden">
                  {/* Styled Receipt Cut Wave */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-[linear-gradient(45deg,transparent_33.333%,#f1f1f1_33.333%,#f1f1f1_66.666%,transparent_66.666%)] bg-[size:10px_10px]"></div>
                  
                  {/* Header */}
                  <div className="text-center mt-2 mb-4">
                    <img 
                      src="/logos/TCA LOGO PNG light theme.png" 
                      alt="TCA Logo" 
                      className="w-10 h-10 object-contain mx-auto mb-1 opacity-80"
                    />
                    <h3 className="font-bold text-xs uppercase tracking-tight">THE CLOUDS ACADEMY</h3>
                    <div className="text-[9px] text-zinc-500 uppercase mt-0.5">Suite Billing Receipt</div>
                  </div>

                  <div className="border-t border-dashed border-zinc-300 my-2"></div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <div><b>INV NO:</b> {previewInvoice.invoice_number || previewInvoice.id}</div>
                    <div><b>CLIENT:</b> {previewInvoice.institute?.institute_name || previewInvoice.institute_name || '—'}</div>
                    <div><b>DATE:</b> {new Date(previewInvoice.created_at || new Date()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}</div>
                    <div><b>DUE DATE:</b> {new Date(previewInvoice.due_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}</div>
                  </div>

                  <div className="border-t border-dashed border-zinc-300 my-2"></div>

                  {/* Items */}
                  <table className="w-full text-[9px] my-2">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="text-left py-1 font-bold">Item Description</th>
                        <th className="text-right py-1 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">
                          {previewInvoice.plan?.name || 'Standard'} Sub.<br/>
                          <span className="text-[8px] text-zinc-500">
                            {new Date(previewInvoice.period_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })} - {new Date(previewInvoice.period_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                          </span>
                        </td>
                        <td className="text-right font-bold py-2">{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="border-t border-dashed border-zinc-300 my-2"></div>

                  {/* Totals */}
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-zinc-200 pt-1 text-[11px]">
                      <span>GRAND TOTAL:</span>
                      <span>{previewInvoice.currency || 'PKR'} {Number(previewInvoice.amount || previewInvoice.total_amount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border border-zinc-400 rounded p-2 text-center font-bold text-xs uppercase my-4 tracking-wider">
                    {previewInvoice.status}
                  </div>

                  {previewInvoice.status === 'PAID' && (
                    <div className="text-[8px] text-zinc-500 space-y-0.5 border-t border-dashed border-zinc-200 pt-2">
                      <div><b>PAID VIA:</b> {previewInvoice.payment_method || 'Manual'}</div>
                      <div><b>TXN REF:</b> {previewInvoice.payment_reference || 'N/A'}</div>
                    </div>
                  )}

                  <div className="text-center text-[8px] text-zinc-400 mt-6 border-t border-zinc-200 pt-2">
                    Thank you for choosing TCA!<br/>
                    www.thecloudsacademy.com
                  </div>
                </div>
              )}
            </div>
          </div>
        </AppModal>
      )}

      {/* ── Manual Invoice Modal ── */}
      <ManualInvoiceModal 
        open={manualInvoiceOpen} 
        onClose={() => setManualInvoiceOpen(false)} 
        onSuccess={() => {
          setManualInvoiceOpen(false);
          qc.invalidateQueries({ queryKey: ['all-invoices'] });
        }}
      />
    </div>
  );
}

// ─── Manual Invoice Modal Component ───────────────────────────────────────────
function ManualInvoiceModal({ open, onClose, onSuccess }) {
  const { register, handleSubmit, reset, watch, setValue, control } = useForm({
    defaultValues: {
      institute_id: '',
      subscription_plan_id: '',
      amount: 0,
      tax_amount: 0,
      billing_cycle: 'MONTHLY',
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      notes: ''
    }
  });

  const amount = parseFloat(watch('amount') || 0);
  const tax = parseFloat(watch('tax_amount') || 0);
  const total = amount + tax;

  // Fetch Institutes for Dropdown
  const { data: instData } = useQuery({
    queryKey: ['master-institutes', 'all'],
    queryFn: () => masterAdminService.getSchools({ limit: 1000 }),
    enabled: open
  });
  const institutes = instData?.data?.rows ?? [];
  const instituteOptions = useMemo(() => institutes.map(inst => ({
    label: `${inst.institute_name} (${inst.institute_code})`,
    value: inst.id
  })), [institutes]);

  // Fetch Plans for Dropdown
  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans', 'all'],
    queryFn: () => masterAdminService.getSubscriptionTemplates({ limit: 100 }),
    enabled: open
  });
  const plans = plansData?.data ?? [];
  const planOptions = useMemo(() => plans.map(p => ({
    label: `${p.name} (${p.price} PKR / ${p.cycle})`,
    value: p.id
  })), [plans]);

  // Auto-fill Amount based on Plan Selection
  const selectedPlanId = watch('subscription_plan_id');
  useEffect(() => {
    if (selectedPlanId) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) {
        setValue('amount', plan.price || 0);
        setValue('billing_cycle', plan.cycle || 'MONTHLY');
      }
    }
  }, [selectedPlanId, plans, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => masterAdminService.createManualInvoice(data.institute_id, data),
    onSuccess: () => {
      toast.success('Manual invoice created successfully');
      reset();
      onSuccess();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create manual invoice')
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Create Manual Invoice"
      description="Generate a custom invoice for an institute."
      size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={mutation.isPending} className="min-w-[140px]">
            {mutation.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
            Create Invoice
          </Button>
        </div>
      }
    >
      <form id="manual-invoice-form" className="space-y-4 py-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          {/* Institute Selection */}
          <div className="col-span-2">
            <SelectField
              control={control}
              name="institute_id"
              label="Select Institute *"
              placeholder="-- Choose Institute --"
              options={instituteOptions}
              required
            />
          </div>

          {/* Subscription Plan */}
          <div>
            <SelectField
              control={control}
              name="subscription_plan_id"
              label="Subscription Plan (Optional)"
              placeholder="-- Custom Invoice --"
              options={planOptions}
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <SelectField
              control={control}
              name="billing_cycle"
              label="Billing Cycle"
              options={[
                { label: 'Monthly', value: 'MONTHLY' },
                { label: 'Yearly', value: 'YEARLY' },
                { label: 'Custom', value: 'CUSTOM' },
              ]}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Base Amount (PKR) *</label>
            <Input type="number" step="0.01" {...register('amount', { required: true, min: 0 })} />
          </div>

          {/* Tax */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Tax Amount (PKR)</label>
            <Input type="number" step="0.01" {...register('tax_amount', { min: 0 })} />
          </div>

          {/* Dates */}
          <div>
            <DatePickerField
              control={control}
              name="period_start"
              label="Period Start *"
              required
            />
          </div>
          <div>
            <DatePickerField
              control={control}
              name="period_end"
              label="Period End *"
              minDate={watch('period_start')}
              required
            />
          </div>
          <div>
            <DatePickerField
              control={control}
              name="due_date"
              label="Due Date *"
              disablePastDates={true}
              required
            />
          </div>
          
          <div className="col-span-1 pt-6 text-right">
             <div className="text-xs text-muted-foreground">Total Amount</div>
             <div className="text-xl font-bold text-emerald-700">PKR {total.toLocaleString()}</div>
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold">Notes</label>
            <Input placeholder="E.g. Custom service charges..." {...register('notes')} />
          </div>
        </div>
      </form>
    </AppModal>
  );
}
