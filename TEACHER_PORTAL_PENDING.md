# Teacher Portal Realtime Integration - Pending Items

This file tracks what is still pending after realtime wiring for teacher portal pages.

## Completed in this pass

- Teacher dashboard page now uses realtime hook data.
- Teacher classes page now uses realtime hook data.
- Teacher students page now uses realtime students/classes APIs and server-side filters.
- Teacher assignments page now uses realtime assignment list + create API (`type=assignment`).
- Teacher homework page now uses realtime assignment list + create API (`type=homework`).
- Teacher attendance page now uses realtime class/student data and mark attendance API.
- Teacher announcements page now uses realtime notices API.
- Backend portal route mounting fixed (`/api/v1/portal` now mounted).
- Backend teacher assignment update/delete implemented.
- Backend teacher notices switched from dummy to DB notifications.

## Still pending

- Teacher notes page (`src/app/teacher/notes/page.jsx`) is still dummy-data/store based.
- No dedicated teacher notes backend API currently exists in teacher portal routes.
- Notes upload/download flow is not connected to persistent backend storage for teacher portal.

## Suggested next implementation

1. Add backend endpoints for teacher notes/resources:
   - `GET /portal/teacher/notes`
   - `POST /portal/teacher/notes`
   - `DELETE /portal/teacher/notes/:id`
   - Optional `GET /portal/teacher/notes/:id/download`
2. Add frontend service + hook methods in:
   - `src/services/teacherPortalService.js`
   - `src/hooks/useTeacherPortal.js`
3. Migrate `src/app/teacher/notes/page.jsx` to those realtime hooks while preserving current UI.
