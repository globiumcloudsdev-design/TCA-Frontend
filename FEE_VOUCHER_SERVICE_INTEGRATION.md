# Frontend Fee Voucher Service Integration Guide

## Complete Setup

### 1. **feeVoucherService.js** ✅ Created
Location: `Frontend/src/services/feeVoucherService.js`

**Key Features:**
- Error handling with try-catch
- Request timeout (5-60 seconds based on operation)
- Response transformation for consistent structure
- Pagination normalization
- Statistics calculation
- CSV export capability

**Methods:**
```javascript
feeVoucherService.generateSingle(studentId, month, year)
feeVoucherService.generateClass(classId, month, year)
feeVoucherService.generateInstitute(month, year)
feeVoucherService.getAll(filters, pagination)
feeVoucherService.getById(voucherId)
feeVoucherService.delete(voucherId)
feeVoucherService.getByMonthYear(month, year)
feeVoucherService.getByStudent(studentId, pagination)
feeVoucherService.getByClass(classId, pagination)
feeVoucherService.exists(studentId, month, year)
feeVoucherService.exportToCSV(vouchers)
```

### 2. **Service Export** ✅ Updated
Location: `Frontend/src/services/index.js`

Added export:
```javascript
export { feeVoucherService } from './feeVoucherService';
```

### 3. **BulkVoucherGenerator Component** 📝 Ready to Update

**Key Enhancements Needed:**
- Import `useInstituteStore` from `@/store/instituteStore`
- Use `feeVoucherService` instead of fetch
- Add proper error handling
- Add result display card
- Add confirmation dialog

**Import Updates:**
```javascript
import { feeVoucherService } from '@/services';
import useInstituteStore from '@/store/instituteStore';
import { useToast } from '@/hooks/useToast';
```

**Usage in Component:**
```javascript
const { instituteId } = useInstituteStore((s) => ({
  instituteId: s.instituteId()
}));

const handleConfirmGenerate = async () => {
  if (mode === 'single') {
    const response = await feeVoucherService.generateSingle(studentId, month, year);
  }
  // ... etc
};
```

## Integration Points with Existing Services

### With useInstituteStore
```javascript
const { 
  instituteId,      // Current institute UUID
  instituteName,    // Institute name for display
  instituteCode,    // Institute code (used for voucher numbering)
  feeSettings       // Fee settings (currency, etc.)
} = useInstituteStore((s) => ({
  instituteId: s.instituteId(),
  instituteName: s.instituteName(),
  instituteCode: s.instituteCode(),
  feeSettings: s.feeSettings()
}));
```

### With classService
```javascript
// Fetch classes for dropdown
const response = await classService.getAll({ 
  institute_id: instituteId 
});
// Returns classes with students array embedded
```

### With studentService
```javascript
// Get students by class (derived from classService)
const classStudents = classes
  .find(c => c.id === classId)
  ?.students || [];
```

## Data Flow

### Generate Single Student Voucher
```
BulkVoucherGenerator
  ↓
handleConfirmGenerate()
  ↓
feeVoucherService.generateSingle(studentId, month, year)
  ↓
API POST /fee-vouchers/generate-single
  ↓
Backend calculates voucher with concession
  ↓
Response includes: voucherNumber, amount, discount, netAmount, notes
  ↓
Display result card with success message
```

### Generate Class Vouchers
```
BulkVoucherGenerator
  ↓
handleConfirmGenerate()
  ↓
feeVoucherService.generateClass(classId, month, year)
  ↓
API POST /fee-vouchers/generate-class (timeout: 30s)
  ↓
Backend loops through all students in class
  ↓
Response: { total, generated, failed, vouchers, failedDetails }
  ↓
Display stats card: total, generated count, failure count, success rate
```

### Generate Institute Vouchers
```
BulkVoucherGenerator
  ↓
handleConfirmGenerate()
  ↓
feeVoucherService.generateInstitute(month, year)
  ↓
API POST /fee-vouchers/generate-institute (timeout: 60s)
  ↓
Backend loops through ALL students
  ↓
Response: { total, generated, failed, failedDetails, successRate }
  ↓
Display complete stats with failure reasons
```

## Error Handling

### Validation Errors
```javascript
// Input validation
if (!studentId) throw new Error('Student ID is required');
if (!month || month < 1 || month > 12) throw new Error('Valid month required');
if (!year || year < 2000) throw new Error('Valid year required');
```

### API Errors
```javascript
catch (error) {
  // Catches: 400 Bad Request, 404 Not Found, 500 Server Error, etc.
  console.error('Error:', error);
  throw {
    message: error.response?.data?.message || error.message,
    status: error.response?.status,
    error
  };
}
```

### Special Cases
```javascript
// Cannot delete paid vouchers
if (error.response?.status === 400) {
  throw new Error('Cannot delete paid voucher. Archive only applies to pending vouchers.');
}
```

## Response Transformation

### Raw API Response
```json
{
  "voucher_number": "TCA-202604-0012",
  "month": 4,
  "year": 2026,
  "amount": "5000.00",
  "discount": "500.00",
  "net_amount": "4500.00",
  "status": "pending",
  "Student": {
    "first_name": "John",
    "last_name": "Doe",
    "registration_no": "STU001"
  }
}
```

### Transformed Response
```javascript
{
  voucherNumber: "TCA-202604-0012",
  month: 4,
  year: 2026,
  amount: 5000,
  discount: 500,
  netAmount: 4500,
  status: "pending",
  studentName: "John Doe",
  registrationNo: "STU001"
}
```

## Performance Optimizations

### Query Caching
```javascript
staleTime: 5 * 60 * 1000  // 5 minutes - classes don't change often
```

### Request Timeouts
```javascript
Single voucher: 10 seconds
Class vouchers: 30 seconds (bulk operation)
Institute vouchers: 60 seconds (large bulk operation)
```

### Pagination
```javascript
// Normalized pagination
const { page, limit } = normalizePagination(pagination.page, pagination.limit);
// Caps limit at 100, defaults to 20
```

## Usage Examples

### In FeesPage Component
```javascript
import { feeVoucherService } from '@/services';

// Get vouchers for current month/year
const { data, isLoading } = useQuery({
  queryKey: ['vouchers', month, year],
  queryFn: () => feeVoucherService.getByMonthYear(month, year)
});
```

### In Student Details Page
```javascript
// Show student's voucher history
const studentVouchers = await feeVoucherService.getByStudent(studentId, {
  page: 1,
  limit: 10
});
```

### Export Functionality
```javascript
// Export vouchers to CSV
const csv = feeVoucherService.exportToCSV(vouchers);
const blob = new Blob([csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
// ... download logic
```

## Integration Checklist

- [x] feeVoucherService.js created with all methods
- [x] Service added to index.js exports
- [x] Error handling with detailed messages
- [x] Response transformation for consistency
- [x] Pagination normalization
- [x] Request timeouts per operation
- [ ] BulkVoucherGenerator updated to use service + useInstituteStore
- [ ] Result display card implementation
- [ ] Confirmation dialog enhancement
- [ ] CSV export button in FeesPage
- [ ] Student voucher history in student details
- [ ] Integration tests for all service methods

## Notes

- All methods are async and need await
- feeVoucherService automatically handles multipart form data (if needed)
- useInstituteStore provides institute context automatically
- All errors include status code for client-side handling
- Service logs errors to console for debugging

