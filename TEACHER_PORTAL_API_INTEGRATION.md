# Teacher Portal API Integration (Complete)

Last updated: 2026-03-17

## 1) Overview
This document covers teacher-side APIs that are integrated in frontend pages, including:
- Endpoint used
- Request shape
- Response shape
- Feature behavior implemented for teacher portal

Source files used:
- Frontend service: `src/services/teacherPortalService.js`
- Frontend hooks: `src/hooks/useTeacherPortal.js`
- Backend routes: `backend/src/api/routes/v1/portal/teacher.portal.routes.js`
- Backend controller: `backend/src/api/controllers/portal/teacherPortal.controller.js`
- Backend service: `backend/src/services/portal/teacherPortal.service.js`

## 2) Common Backend Response Format
Teacher APIs follow these response wrappers:

### Success (single payload)
```json
{
  "success": true,
  "message": "...",
  "data": {},
  "timestamp": "2026-03-17T10:00:00.000Z"
}
```

### Paginated list
```json
{
  "success": true,
  "message": "...",
  "data": [],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  },
  "timestamp": "2026-03-17T10:00:00.000Z"
}
```

### Error
```json
{
  "success": false,
  "message": "...",
  "timestamp": "2026-03-17T10:00:00.000Z"
}
```

## 3) Frontend Teacher Pages and API Mapping

### `/teacher` (Dashboard)
- Hook: `useTeacherDashboard()`
- API: `GET /portal/teacher/dashboard`
- Response `data` includes:
  - `teacher`
  - `today_schedule`
  - `my_classes`
  - `my_students`
  - `recent_assignments`
  - `pending_work`
  - `recent_activity`
  - `statistics`
  - `quick_actions`

### `/teacher/classes`
- Hook: `useTeacherClasses()`
- API: `GET /portal/teacher/classes`
- Behavior implemented:
  - Class/section normalization
  - Section name fallback from Section table + Class JSONB sections
  - Subject details include `syllabus` and `materials`
  - Material URL fallback includes: `url`, `file_url`, `download_url`, `pdf_url`

### `/teacher/students`
- Hook: `useTeacherStudents()`
- APIs:
  - `GET /portal/teacher/students`
  - `GET /portal/teacher/students/:studentId`
- Supports pagination + filtering (`search`, `class_id`).

### `/teacher/assignments`
- Hooks: `useTeacherAssignments({ type: 'assignment' })`, `useTeacherClasses()`
- APIs:
  - `POST /portal/teacher/assignments` (multipart)
  - `GET /portal/teacher/assignments?type=assignment`
  - `PUT /portal/teacher/assignments/:assignmentId` (multipart)
  - `DELETE /portal/teacher/assignments/:assignmentId`
- Implemented behavior:
  - Create/Edit/Delete with confirm dialog
  - Optional attachment upload (file selected ho to upload, warna normal save)
  - Edit modal shows existing attachments + PDF preview

### `/teacher/homework`
- Hooks: `useTeacherAssignments({ type: 'homework' })`, `useTeacherClasses()`
- APIs: same assignment endpoints but payload `type: "homework"`
- Implemented behavior:
  - Create/Edit/Delete
  - Optional attachments upload
  - Edit modal now shows existing attachments + PDF preview

### `/teacher/notes`
- Hooks: `useTeacherAssignments({ type: 'project' })`, `useTeacherClasses()`
- APIs: same assignment endpoints but payload `type: "project"`
- Implemented behavior:
  - Notes/study-material CRUD
  - Existing attachments shown in edit modal

### `/teacher/attendance`
- Hooks: `useTeacherAttendance()`, `useTeacherClasses()`, `useTeacherStudents()`
- APIs:
  - `POST /portal/teacher/attendance/mark`
  - `GET /portal/teacher/attendance/class/:classId?date=YYYY-MM-DD`
  - `GET /portal/teacher/attendance/student/:studentId`
- Backend fix done:
  - Attendance include alias corrected to `Student` (case-sensitive Sequelize alias)

### `/teacher/timetable`
- Hook: `useTeacherTimetable()`
- API: `GET /portal/teacher/timetable?week=YYYY-MM-DD`
- Response returns day-wise schedule object (`monday` ... `saturday`).
- Section/class resolution includes DB fallback to avoid blank section names.

### `/teacher/announcements`
- Hook: `useTeacherNotices(50)`
- API: `GET /portal/teacher/notices?limit=50`
- Response item fields:
  - `id`, `title`, `content`, `category`, `priority`, `date`, `author`

## 4) Detailed Endpoint Contracts

## `GET /portal/teacher/dashboard`
### Response `data`
```json
{
  "teacher": {},
  "today_schedule": [],
  "my_classes": [],
  "my_students": [],
  "recent_assignments": [],
  "pending_work": [],
  "recent_activity": [],
  "statistics": {},
  "quick_actions": []
}
```

## `GET /portal/teacher/profile`
### Response `data`
```json
{
  "id": "uuid",
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "phone": "...",
  "registration_no": "...",
  "avatar": "https://...",
  "role": "...",
  "details": {},
  "documents": [],
  "created_at": "..."
}
```

## `PUT /portal/teacher/profile` (multipart/form-data)
### Request
- Basic profile fields
- `details` (JSON)
- Optional `avatar` file

### Response
- Updated profile in same shape as `GET /profile`

## `GET /portal/teacher/classes`
### Response `data[]` (important fields)
```json
{
  "id": "class_uuid",
  "class_id": "class_uuid",
  "class_name": "Grade 8",
  "subjects": ["Math", "English"],
  "subject_details": [
    {
      "id": "subject_uuid",
      "name": "Math",
      "code": "MTH-8",
      "syllabus": "...",
      "materials": [
        {
          "name": "Worksheet 1",
          "type": "application/pdf",
          "url": "https://..."
        }
      ]
    }
  ],
  "sections": [
    { "id": "section_uuid", "name": "A" }
  ],
  "student_count": 42,
  "schedule": []
}
```

## `GET /portal/teacher/students`
### Query params
- `search` (optional)
- `class_id` (optional)
- `page`, `limit`

### Response `data[]`
```json
{
  "id": "student_uuid",
  "name": "...",
  "registration_no": "...",
  "avatar": "https://...",
  "class": "...",
  "section": "...",
  "roll_number": "...",
  "attendance_percentage": 93,
  "last_attendance": "2026-03-16"
}
```

## `GET /portal/teacher/students/:studentId`
### Response `data`
```json
{
  "profile": {},
  "attendance": {},
  "assignments": [],
  "results": []
}
```

## `POST /portal/teacher/assignments` (multipart/form-data)
## `PUT /portal/teacher/assignments/:assignmentId` (multipart/form-data)
### Request fields (used by frontend)
- `title` (required)
- `subject` (required)
- `class_id` (required)
- `section_id` (when needed)
- `description`
- `assigned_on` (homework/date)
- `due_date` (required)
- `due_time`
- `total_marks` (assignment)
- `type` (`assignment` | `homework` | `project`)
- `status` (`published` | `draft`)
- `is_published` (`true`/`false`)
- `attachments` (0..10 files, optional)

### Attachment object stored in DB
```json
{
  "id": "uuid",
  "name": "file.pdf",
  "url": "https://res.cloudinary.com/...",
  "public_id": "the-clouds-academy/...",
  "size": 494093,
  "type": "application/pdf"
}
```

### Important behavior
- Attachments are optional.
- If new files are sent on update, backend merges them with existing attachments.
- If no files are sent, update still works normally.

## `GET /portal/teacher/assignments`
### Query params
- `type` (`assignment` / `homework` / `project`)
- `subject`
- `status` (`published`/`draft`)
- `search`
- `page`, `limit`

### Response `data[]`
Array of assignment rows with fields like:
- `id`, `title`, `description`, `subject`
- `class_id`, `section_id`
- `type`, `due_date`, `due_time`, `total_marks`
- `attachments[]`
- `is_published`, `status`
- `stats` (`total_students`, `submitted`, `pending`, `graded`, `average_score`)

## `GET /portal/teacher/assignments/:assignmentId`
### Response `data`
Single assignment with submissions relation (for grading/details screens).

## `GET /portal/teacher/assignments/:assignmentId/submissions`
### Response `data[]`
Submissions list for selected assignment.

## `POST /portal/teacher/submissions/:submissionId/grade`
### Request body
```json
{
  "marks": 18,
  "feedback": "Good work"
}
```

### Response
Updated submission object with graded status.

## `POST /portal/teacher/attendance/mark`
### Request body
```json
{
  "class_id": "class_uuid",
  "date": "2026-03-17",
  "attendance": [
    { "student_id": "student_uuid", "status": "present" }
  ]
}
```

### Response `data`
```json
{
  "message": "Attendance marked successfully",
  "count": 35
}
```

## `GET /portal/teacher/attendance/class/:classId?date=YYYY-MM-DD`
### Response `data[]`
```json
{
  "id": "attendance_uuid",
  "student_id": "student_uuid",
  "class_id": "class_uuid",
  "date": "2026-03-17",
  "status": "present",
  "Student": {
    "id": "student_uuid",
    "first_name": "...",
    "last_name": "...",
    "registration_no": "..."
  }
}
```

## `GET /portal/teacher/attendance/student/:studentId`
### Response `data`
Student attendance history/summary object.

## `GET /portal/teacher/timetable`
### Query params
- `week` (optional)

### Response `data`
```json
{
  "monday": [
    {
      "id": "slot_uuid",
      "period": 1,
      "start_time": "08:00",
      "end_time": "08:45",
      "subject": "Math",
      "class": "Grade 8 - A",
      "class_id": "class_uuid",
      "section_id": "section_uuid",
      "section_name": "A",
      "room": "101"
    }
  ],
  "tuesday": [],
  "wednesday": [],
  "thursday": [],
  "friday": [],
  "saturday": []
}
```

## `GET /portal/teacher/notices`
### Query params
- `limit` (default 10)

### Response `data[]`
```json
{
  "id": "notice_uuid",
  "title": "...",
  "content": "...",
  "category": "Exam",
  "priority": "high",
  "date": "2026-03-17T09:00:00.000Z",
  "author": "Administration"
}
```

## 5) Frontend Helper Notes
- `prepareAssignmentFormData(data, files)` appends all text fields + each file under `attachments`.
- File upload optional flow is active in:
  - Assignments create/edit modal
  - Homework create/edit modal
  - Notes create/edit modal
- Edit modal existing attachments rendering supports URL keys:
  - `url`
  - `file_url`
  - `download_url`
  - `pdf_url`

## 6) Recently Completed Teacher Portal Improvements
- Section name missing issue resolved in classes/timetable by DB + JSONB fallback.
- Subject syllabus/materials surfaced from class `courses` JSONB.
- Subject modal in classes page added with material list and PDF preview.
- Assignment/Notes/Homework pages enhanced with edit + delete + confirm dialog.
- Attendance alias mismatch fixed (`Student`).
- Homework/Assignment optional attachment upload implemented.
- Homework edit modal now shows already uploaded attachments with open link and PDF preview.

## 7) Quick Test Checklist
- Create homework without attachment -> should save successfully.
- Create homework with attachment -> file should upload and appear in list/edit modal.
- Edit homework without new file -> old attachment remains.
- Edit homework with new file -> new file should append to existing attachments.
- Open edit modal -> existing attachment(s) visible with open link.
- PDF file in existing attachments -> inline preview appears in modal.
