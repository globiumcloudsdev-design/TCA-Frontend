
// frontend/src/app/(portal)/parent/fees/page.js

'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, CheckCircle, AlertCircle, Clock, Download, 
  Eye, FileText, CreditCard, Calendar, ChevronDown, 
  Filter, X, Printer, Receipt, TrendingUp, Users,
  Search, ExternalLink, MessageCircle, Phone, Mail,
  Building, User, FileCheck, Wallet, ArrowRight
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useChildFees, usePayFee, useFeeSummary } from '@/hooks/useParentPortal';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  PageHeader, SelectField, StatusBadge, PageLoader, 
  AppModal, StatsCard
} from '@/components/common';

const STATUS_CONFIG = {
  paid: { 
    label: 'Paid', 
    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
    icon: CheckCircle, 
    ic: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  pending: { 
    label: 'Pending', 
    cls: 'bg-amber-100 text-amber-700 border-amber-200', 
    icon: Clock, 
    ic: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  overdue: { 
    label: 'Overdue', 
    cls: 'bg-red-100 text-red-700 border-red-200', 
    icon: AlertCircle, 
    ic: 'text-red-600',
    bg: 'bg-red-50'
  },
  partial: { 
    label: 'Partial', 
    cls: 'bg-blue-100 text-blue-700 border-blue-200', 
    icon: AlertCircle, 
    ic: 'text-blue-600',
    bg: 'bg-blue-50'
  },
};

// Voucher Details Modal
const VoucherDetailsModal = ({ voucher, isOpen, onClose, onPay }) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  if (!voucher) return null;

  const statusConfig = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title="Fee Voucher Details"
      description={voucher?.voucher_number}
      size="lg"
      footer={
        <button
          onClick={() => window.print()}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      }
    >
      <div className="space-y-5">
          {/* Status Banner */}
          <div className={`${statusConfig.bg} rounded-xl p-4 border ${statusConfig.cls}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusConfig.ic}`} />
              <div>
                <p className="font-semibold text-slate-800">Status: {statusConfig.label}</p>
                <p className="text-sm text-slate-600">
                  Due Date: {format(new Date(voucher.due_date), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          {voucher.student && (
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Student Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Name</p>
                  <p className="font-medium text-slate-800">{voucher.student.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Registration No</p>
                  <p className="font-medium text-slate-800">{voucher.student.registration_no}</p>
                </div>
                <div>
                  <p className="text-slate-500">Class</p>
                  <p className="font-medium text-slate-800">{voucher.student.class} - {voucher.student.section}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount</span>
                <span className="font-medium">PKR {voucher.amount?.toLocaleString() || 0}</span>
              </div>
              {voucher.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>- PKR {voucher.discount?.toLocaleString() || 0}</span>
                </div>
              )}
              {voucher.fine > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Fine</span>
                  <span>+ PKR {voucher.fine?.toLocaleString() || 0}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-800">Net Amount</span>
                <span className="font-bold text-slate-900 text-lg">
                  PKR {voucher.net_amount?.toLocaleString() || 0}
                </span>
              </div>
              {voucher.notes && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-slate-700">{voucher.notes}</p>
                </div>
              )}
            </div>
          </div>

      </div>
    </AppModal>
  );
};

// Payment Modal
const PaymentModal = ({ voucher, isOpen, onClose, onSubmit, isLoading }) => {
  const [paymentData, setPaymentData] = useState({
    payment_method: 'card',
    reference: ''
  });

  if (!voucher) return null;

  const remainingAmount = voucher.net_amount || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(voucher.id, paymentData);
  };

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title="Make Payment"
      size="sm"
      footer={
        <button
          type="submit"
          form="paymentForm"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Pay PKR ${remainingAmount.toLocaleString()}`}
        </button>
      }
    >
      <form id="paymentForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-500">Amount to Pay</p>
            <p className="text-2xl font-bold text-indigo-600">PKR {remainingAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Voucher: {voucher.voucher_number}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="card">Credit/Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Transaction ID</label>
            <input
              type="text"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter transaction reference"
            />
          </div>

      </form>
    </AppModal>
  );
};

// Voucher Card Component
const VoucherCard = ({ voucher, onView, onPay }) => {
  const statusConfig = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const isOverdue = voucher.status === 'overdue' || (voucher.status === 'pending' && new Date(voucher.due_date) < new Date());

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-500">{voucher.voucher_number}</span>
          </div>
          <h3 className="font-semibold text-slate-800">Fee Voucher</h3>
          <p className="text-xs text-slate-500 mt-1">
            {voucher.month && voucher.year ? `${voucher.month}/${voucher.year}` : format(new Date(voucher.issued_date), 'MMM yyyy')}
          </p>
        </div>
        <Badge className={statusConfig.cls}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Amount</span>
          <span className="font-semibold text-slate-800">PKR {voucher.net_amount?.toLocaleString() || 0}</span>
        </div>
        {voucher.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="text-slate-600">-PKR {voucher.discount?.toLocaleString() || 0}</span>
          </div>
        )}
        {voucher.fine > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Fine</span>
            <span className="text-slate-600">+PKR {voucher.fine?.toLocaleString() || 0}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Due Date</span>
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
            {format(new Date(voucher.due_date), 'dd MMM yyyy')}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(voucher)}
          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        {/* {voucher.status !== 'paid' && (
          <button
            onClick={() => onPay(voucher)}
            className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center gap-1"
          >
            <CreditCard className="w-3 h-3" />
            Pay
          </button>
        )} */}
      </div>
    </div>
  );
};

// Main Fees Page Component
export default function ParentFeesPage() {
  const { portalUser } = usePortalStore();
  const parent = portalUser;
  const t = getPortalTerms(parent?.institute_type);
  const children = parent?.children || [];

  const [selectedChild, setSelectedChild] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingVoucher, setPayingVoucher] = useState(null);

  const child = children[selectedChild];
  
  // Generate available years based on admission_date
  const getAvailableYears = (admissionDate) => {
    if (!admissionDate) {
      const currentYear = new Date().getFullYear();
      return [currentYear - 1, currentYear, currentYear + 1];
    }
    
    const admission = new Date(admissionDate);
    const today = new Date();
    const years = [];
    
    for (let year = admission.getFullYear(); year <= today.getFullYear(); year++) {
      years.push(year);
    }
    
    return years;
  };
  
  const availableYears = getAvailableYears(child?.admission_date);
  
  // Validate selected year is within valid range
  useEffect(() => {
    if (!availableYears.includes(yearFilter)) {
      setYearFilter(availableYears[availableYears.length - 1] || new Date().getFullYear());
    }
  }, [child?.id, availableYears]);
  
  const { data: feesData, isLoading, refetch } = useChildFees(child?.id, {
    status: statusFilter !== 'all' ? statusFilter : null,
    year: yearFilter
  });
  
  const payFeeMutation = usePayFee();
  const { data: summaryData } = useFeeSummary();

  const fees = feesData?.data;
  const vouchers = fees?.vouchers || [];  
  const summary = fees?.summary;
  const upcomingDues = fees?.upcoming_dues || [];
  const overdueDues = fees?.overdue_dues || [];

  const handleViewVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setShowVoucherModal(true);
  };

  const handlePayVoucher = (voucher) => {
    setPayingVoucher(voucher);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (voucherId, paymentData) => {
    try {
      await payFeeMutation.mutateAsync({ voucherId, paymentData });
      setShowPaymentModal(false);
      setPayingVoucher(null);
      refetch();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleExport = () => {
    if (!vouchers.length) return;
    
    const csvContent = [
      ['Voucher #', 'Month/Year', 'Amount', 'Discount', 'Fine', 'Net Amount', 'Due Date', 'Status'].join(','),
      ...vouchers.map(v => [
        v.voucher_number,
        `${v.month || ''}/${v.year || ''}`,
        v.amount || 0,
        v.discount || 0,
        v.fine || 0,
        v.net_amount || 0,
        format(new Date(v.due_date), 'yyyy-MM-dd'),
        v.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fees_${child?.name}_${yearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOverallSummary = () => {
    const overall = summaryData?.data?.overall;
    if (!overall) return null;
    
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white mb-6">
        <h3 className="text-sm font-medium opacity-90 mb-3">Overall Fee Summary (All Children)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs opacity-75">Total Invoiced</p>
            <p className="text-xl font-bold">PKR {overall.total_invoiced?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Total Paid</p>
            <p className="text-xl font-bold">PKR {overall.total_paid?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Total Due</p>
            <p className="text-xl font-bold">PKR {overall.total_due?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Overdue Vouchers</p>
            <p className="text-xl font-bold">{overall.total_overdue_vouchers || 0}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <PageHeader
        title="Fee Management"
        description="View vouchers, payment history, and manage fees"
        action={(
          <button
            onClick={handleExport}
            disabled={!vouchers.length}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      />

      {/* Overall Summary (if multiple children) */}
      {children.length > 1 && getOverallSummary()}

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedChild === i
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Child Info */}
      {child && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{child.name}</h2>
              <p className="text-sm text-slate-500">
                Reg: {child.registration_no} | Class: {child.class} | Section: {child.section}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            label="Total Paid"
            value={`PKR ${(summary.total_paid || 0).toLocaleString()}`}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          />
          <StatsCard
            label="Total Due"
            value={`PKR ${(summary.total_due || 0).toLocaleString()}`}
            icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          />
          <StatsCard
            label="Total Invoiced"
            value={`PKR ${(summary.total_invoiced || 0).toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-slate-600" />}
          />
          <StatsCard
            label="Compliance Rate"
            value={`${fees?.stats?.payment_compliance_rate || 0}%`}
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          />
        </div>
      )}

      {/* Alerts for Overdue/Upcoming */}
      {(overdueDues.length > 0 || upcomingDues.length > 0) && (
        <div className="space-y-3">
          {overdueDues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {overdueDues.length} Overdue Voucher{overdueDues.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-700 mt-0.5">
                    Total overdue amount: PKR {overdueDues.reduce((sum, v) => sum + v.net_amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          {upcomingDues.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {upcomingDues.length} Upcoming Due{upcomingDues.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Next due date: {format(new Date(upcomingDues[0]?.due_date), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <SelectField
                label="Status"
                name="status"
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'partial', label: 'Partial' }
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e)}
                placeholder="Select status"
              />
              
              <SelectField
                label="Year"
                name="year"
                options={availableYears.map(year => ({
                  value: String(year),
                  label: String(year)
                }))}
                value={String(yearFilter)}
                onChange={(e) => setYearFilter(parseInt(e))}
                placeholder="Select year"
              />
            </div>
          )}
        </div>
      </div>

      {/* Vouchers Grid */}
      {isLoading ? (
        <PageLoader message="Loading fee vouchers..." />
      ) : vouchers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No fee vouchers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onView={handleViewVoucher}
              onPay={handlePayVoucher}
            />
          ))}
        </div>
      )}

      {/* Payment History Section */}
      {fees?.payment_history?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Recent Payment History
          </h2>
          <div className="space-y-3">
            {fees.payment_history.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-800">{payment.voucher_title}</p>
                  <p className="text-xs text-slate-500">
                    {payment.method} • {format(new Date(payment.date), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">PKR {payment.amount?.toLocaleString() || 0}</p>
                  {payment.reference && (
                    <p className="text-[10px] text-slate-400">Ref: {payment.reference}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <VoucherDetailsModal
        voucher={selectedVoucher}
        isOpen={showVoucherModal}
        onClose={() => {
          setShowVoucherModal(false);
          setSelectedVoucher(null);
        }}
        onPay={(voucher) => {
          setShowVoucherModal(false);
          handlePayVoucher(voucher);
        }}
      />

      <PaymentModal
        voucher={payingVoucher}
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPayingVoucher(null);
        }}
        onSubmit={handlePaymentSubmit}
        isLoading={payFeeMutation.isPending}
      />
    </div>
  );
}