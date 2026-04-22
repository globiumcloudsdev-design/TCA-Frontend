import { useState, useMemo } from "react";
import { format } from "date-fns";
import { History } from "lucide-react";
import DataTable from "@/components/common/DataTable";
import SelectField from "@/components/common/SelectField";
import { MonthPicker } from "@/components/common/MonthPicker";

export function AttendanceHistoryTable({ 
  historyData, 
  loading, 
  filters, 
  setFilters 
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7); // "Week-wise" default

  // Standard elegant columns setup
  const columns = useMemo(() => [
    {
      accessorKey: "date",
      header: "Date & Day",
      cell: ({ row }) => {
        if (!row.original.date) return null;
        const d = new Date(row.original.date);
        return (
          <div className="font-semibold text-xs py-1">
            <span className="text-slate-900">{format(d, "MMM dd, yyyy")}</span>
            <span className="text-slate-400 ml-2 font-medium">{format(d, "EEE")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = (row.original.status || "UNKNOWN").toLowerCase();
        return (
          <div className="text-center">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
              status === 'present' ? 'bg-emerald-100 text-emerald-700' : 
              status === 'late' ? 'bg-amber-100 text-amber-700' : 
              status === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "check_in",
      header: () => <div className="text-center">Check IN</div>,
      cell: ({ row }) => (
        <div className="text-center font-mono opacity-80 text-xs">
          {row.original.check_in ? format(new Date(row.original.check_in), "hh:mm a") : "—"}
        </div>
      ),
    },
    {
      accessorKey: "check_out",
      header: () => <div className="text-center">Check OUT</div>,
      cell: ({ row }) => (
        <div className="text-center font-mono opacity-80 text-xs">
          {row.original.check_out ? format(new Date(row.original.check_out), "hh:mm a") : "—"}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: () => <div className="text-center">Duration</div>,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-600 tracking-tight text-xs">{row.original.duration_display || "—"}</div>
      ),
    },
    {
      accessorKey: "late_minutes",
      header: () => <div className="text-center">Late Mins</div>,
      cell: ({ row }) => {
        const mins = row.original.late_minutes;
        return <div className={`text-center font-bold text-xs ${mins > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{mins || "0"}</div>;
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="text-xs text-slate-500 truncate max-w-[150px]" title={row.original.remarks || ''}>
          {row.original.remarks || "—"}
        </div>
      ),
    },
  ], []);

  // Filter local logic for statuses (since the backend dumps the whole month based on `month` api, frontend can filter status and paginate properly)
  const filteredData = useMemo(() => {
    if (!filters.status) return historyData || [];
    return (historyData || []).filter(item => item.status === filters.status);
  }, [historyData, filters.status]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  // Sliced Data based on Page (Fix client-side manual pagination)
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/50 gap-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" /> Attendance History
        </h2>
        <div className="flex items-center flex-wrap gap-2">
          <SelectField
            placeholder="All Statuses"
            value={filters.status}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, status: val }));
              setPage(1); // Reset page on filter
            }}
            options={[
              { value: "PRESENT", label: "Present" },
              { value: "LATE", label: "Late" },
              { value: "ABSENT", label: "Absent" },
              { value: "LEAVE", label: "Leave" },
              { value: "NOT_MARKED", label: "Not Marked" },
            ]}
            className="w-32"
          />
          <MonthPicker 
            value={filters.month} 
            onChange={(val) => {
              setFilters(prev => ({ ...prev, month: val }));
              setPage(1);
            }} 
          />
        </div>
      </div>
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-1 py-1">
          <DataTable 
            columns={columns} 
            data={paginatedData} 
            emptyMessage="No historical records found for the selected filters."
            pagination={{
              page,
              totalPages,
              pageSize,
              total: filteredData.length,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
