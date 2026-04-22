# Teacher Self-Attendance Leave Request Implementation

## Overview
Proper leave request functionality has been implemented in the Teacher Self-Attendance page with:
- Date range selection (start_date and end_date)
- Leave type selection with balance checking
- Automatic day calculation
- Comprehensive form validation
- Leave balance display

## Components

### 1. LeaveRequestForm Component
**File:** `Frontend/src/components/portal/teacher/LeaveRequestForm.jsx`

**Features:**
- Date range picker (start_date → end_date)
- Leave type dropdown showing available balances
- Real-time day counting
- Reason/remarks text area
- Automatic validation
- Balance sufficiency checking
- Error messages and visual feedback

**Props:**
- `leaveBalance` (object): Leave balance data from API
- `onSuccess` (function): Callback when request succeeds
- `onCancel` (function): Callback when cancelled

**Sample Leave Balance Data:**
```javascript
{
  "0c3e0a32-90e4-4511-9214-dc73ff6a20fc": {
    leave_type_name: "Emergency",
    max_days_per_year: 2,
    used_days: 0,
    remaining_days: 2,
    can_take_more: true
  },
  "4f0f6ec4-f7ce-40ff-8dc8-e055dc7e3775": {
    leave_type_name: "Paternity Leave",
    max_days_per_year: 10,
    used_days: 0,
    remaining_days: 10,
    can_take_more: true
  },
  // ... more leave types
}
```

### 2. TeacherSelfAttendancePage
**File:** `Frontend/src/app/(portal)/teacher/selfAttendance/page.jsx`

**Updates:**
- Imported `LeaveRequestForm` component
- Updated leave modal to show proper form instead of placeholder
- Integrated `fetchLeaveBalance()` calls
- Added success toast and refresh on submission

### 3. Backend Service
**File:** `Frontend/src/services/teacherPortalService.js`

**Methods:**
```javascript
// Create leave request
createLeaveRequest: (data) =>
  api.post("/portal/teacher/leave-requests", data).then(unwrap),

// Get leave balance
getLeaveBalance: () => 
  api.get("/portal/teacher/leave-balance").then(unwrap),

// Get leave statistics
getLeaveStatistics: () =>
  api.get("/portal/teacher/leave-requests/statistics").then(unwrap),

// Get my leave requests
getMyLeaveRequests: (filters = {}, page = 1, limit = 10) =>
  api.get("/portal/teacher/leave-requests", {
    params: { ...filters, page, limit },
  }).then(unwrap),

// Cancel leave request
cancelLeaveRequest: (id, data = {}) =>
  api.patch(`/portal/teacher/leave-requests/${id}/cancel`, data).then(unwrap),
```

## API Request/Response

### Create Leave Request
**Endpoint:** `POST /api/v1/portal/teacher/leave-requests`

**Request Payload:**
```javascript
{
  start_date: "2026-04-25",        // YYYY-MM-DD format
  end_date: "2026-04-27",          // YYYY-MM-DD format
  leave_type_id: "4f0f6ec4...",    // UUID of leave type
  reason: "Family emergency",       // Minimum 5 characters
  number_of_days: 3                 // Auto-calculated (end - start + 1)
}
```

**Response:**
```javascript
{
  success: true,
  message: "Leave request created successfully",
  data: {
    id: "leave-req-uuid",
    user_id: "teacher-uuid",
    leave_type_id: "leave-type-uuid",
    start_date: "2026-04-25",
    end_date: "2026-04-27",
    number_of_days: 3,
    reason: "Family emergency",
    status: "PENDING",
    created_at: "2026-04-21T...",
    // ...
  },
  timestamp: "2026-04-21T17:12:15.851Z"
}
```

### Get Leave Balance
**Endpoint:** `GET /api/v1/portal/teacher/leave-balance`

**Response:**
```javascript
{
  success: true,
  message: "Leave balance fetched successfully",
  data: {
    "leave-type-id-1": {
      leave_type_name: "Sick Leave",
      max_days_per_year: 12,
      used_days: 0,
      remaining_days: 12,
      can_take_more: true
    },
    "leave-type-id-2": {
      leave_type_name: "Casual Leave",
      max_days_per_year: 10,
      used_days: 0,
      remaining_days: 10,
      can_take_more: true
    },
    // ... more leave types
  },
  timestamp: "2026-04-21T17:12:15.851Z"
}
```

## Features & Validations

### Form Validations
1. **Start Date**
   - Required field
   - Cannot be in the past
   - Must be before or equal to end date

2. **End Date**
   - Required field
   - Must be on or after start date
   - Cannot be in the past

3. **Leave Type**
   - Required field
   - Only shows applicable leave types with remaining balance
   - Checks `can_take_more` flag

4. **Number of Days**
   - Auto-calculated: `(end_date - start_date) + 1`
   - Must not exceed remaining balance
   - Shows warning if insufficient balance

5. **Reason**
   - Required field
   - Minimum 5 characters
   - Shows character count (max 500)

### User Experience
- ✅ Real-time balance checking
- ✅ Visual balance sufficiency indicator (green/red)
- ✅ Disabled submit button if insufficient balance
- ✅ Loading state during submission
- ✅ Success/error toast notifications
- ✅ Error messages for validation failures
- ✅ Automatic date constraints (min/max)
- ✅ Leave type dropdown prevents over-booking

## Workflow

### Teacher Leave Application Flow

```
1. Teacher clicks "Apply Leave" button in Self-Attendance page
   ↓
2. Leave modal opens & fetches leave balance via getLeaveBalance()
   ↓
3. LeaveRequestForm component displays:
   - Available leave types with remaining days
   - Date range picker (start → end)
   - Reason text area
   - Real-time day calculation
   ↓
4. Teacher fills form:
   - Selects leave type
   - Picks start date (min: today)
   - Picks end date (min: start date)
   - Types reason (min 5 chars)
   ↓
5. Frontend validates:
   - All required fields filled
   - Dates are valid
   - Days ≤ remaining balance
   ↓
6. Submit button enabled → Teacher clicks "Submit Leave Request"
   ↓
7. API call: POST /portal/teacher/leave-requests
   ↓
8. Backend validates & creates LeaveRequest record
   ↓
9. Success response → Toast notification
   ↓
10. Modal closes & leave balance refreshed
```

## Backend Implementation

### Route Handler
**File:** `Backend/src/api/routes/v1/portal/teacher.portal.routes.js`
```javascript
router.post(
  "/leave-requests",
  validate(createLeaveRequestSchema),
  leaveRequestsPortal.createLeaveRequest,
);
```

### Controller
**File:** `Backend/src/api/controllers/portal/leaveRequests.portal.controller.js`
```javascript
export const createLeaveRequest = async (req, res) => {
  // 1. Validate institute ID
  // 2. Verify leave type exists for this institute
  // 3. Call service.createLeaveRequest()
  // 4. Return created leave request
}
```

### Service
**File:** `Backend/src/services/portal/leaveRequests.portal.service.js`
```javascript
export const createLeaveRequest = async (userId, userType, instituteId, branchId, leaveData) => {
  // 1. Handle parent requests (delegate to child)
  // 2. Calculate number_of_days if not provided
  // 3. Create LeaveRequest record
  // 4. Return created record
}
```

## Testing Checklist

- [ ] Leave modal opens when "Apply Leave" button clicked
- [ ] Leave balance displays correctly for all leave types
- [ ] Can select start date (today or future only)
- [ ] Can select end date (after start date)
- [ ] Days calculated correctly: `(end - start) + 1`
- [ ] Submit button disabled if insufficient balance
- [ ] Error message displays if not enough days
- [ ] Form validates required fields
- [ ] Reason requires minimum 5 characters
- [ ] Submit shows loading state
- [ ] Success toast appears on submission
- [ ] Modal closes after success
- [ ] Leave balance refreshes after submission
- [ ] Form resets after successful submission
- [ ] Can cancel and close modal

## Error Handling

**Expected Error Cases:**
1. Insufficient leave balance → User sees warning, submit disabled
2. Invalid date range → User sees error message
3. Missing required field → User sees field-specific error
4. Unauthorized → API returns 401
5. Leave type doesn't exist → 404 error
6. Network error → Catch with try-catch, toast error

## Future Enhancements

- [ ] Bulk leave requests (select multiple date ranges)
- [ ] Leave request templates (quick selections)
- [ ] Calendar view with blocked dates
- [ ] Approval workflow visualization
- [ ] Email notifications on submission
- [ ] Leave request history in tab
- [ ] Attachments for medical leave
