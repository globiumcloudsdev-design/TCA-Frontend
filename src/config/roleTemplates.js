// config/roleTemplates.js
import { NAV } from './instituteConfig';
import { PERM } from '@/constants/permissions';

/**
 * Institute type ke hisaab se permissions generate karo
 * Har NAV item ke permission ko map karo actual permissions ke saath
 */
export function getInstituteRoleTemplate(instituteType) {
  const navItems = NAV[instituteType] || NAV.school;
  
  // Base permissions jo har role mein honi chahiye
  const basePermissions = [
    PERM.DASHBOARD_VIEW,
  ];

  // NAV items se permissions extract karo
  const navPermissions = navItems
    .filter(item => item.permission) // Sirf jinme permission hai
    .map(item => item.permission)
    .filter(perm => perm !== null); // Null permissions hatao

  // Institute-specific additional permissions
  const instituteSpecificPerms = {
    school: [
      PERM.CLASSES_READ,
      PERM.SECTIONS_READ,
      PERM.STUDENTS_READ,
      PERM.TEACHERS_READ,
      PERM.ATTENDANCE_VIEW,
      PERM.EXAMS_READ,
      PERM.FEES_READ,
      PERM.REPORTS_STUDENT,
    ],
    coaching: [
      PERM.COURSES_READ,
      PERM.BATCHES_READ,
      PERM.STUDENTS_READ,
      PERM.TEACHERS_READ,
      PERM.ATTENDANCE_VIEW,
      PERM.EXAMS_READ,
      PERM.FEES_READ,
    ],
    academy: [
      PERM.PROGRAMS_READ,
      PERM.BATCHES_READ,
      PERM.STUDENTS_READ,
      PERM.TEACHERS_READ,
      PERM.ATTENDANCE_VIEW,
      PERM.ASSESSMENTS_READ,
      PERM.FEES_READ,
    ],
    college: [
      PERM.DEPARTMENTS_READ,
      PERM.PROGRAMS_READ,
      PERM.SEMESTERS_READ,
      PERM.STUDENTS_READ,
      PERM.TEACHERS_READ,
      PERM.ATTENDANCE_VIEW,
      PERM.EXAMS_READ,
      PERM.FEES_READ,
    ],
    university: [
      PERM.FACULTIES_READ,
      PERM.DEPARTMENTS_READ,
      PERM.PROGRAMS_READ,
      PERM.SEMESTERS_READ,
      PERM.STUDENTS_READ,
      PERM.FACULTY_READ,
      PERM.ATTENDANCE_VIEW,
      PERM.EXAMS_READ,
      PERM.FEES_READ,
      PERM.RESEARCH_READ,
    ],
  };

  // Sab permissions ko merge karo
  const allPermissions = [
    ...basePermissions,
    ...navPermissions,
    ...(instituteSpecificPerms[instituteType] || [])
  ];

  // Duplicates hatao
  const uniquePermissions = [...new Set(allPermissions)];

  return {
    name: `${instituteType.charAt(0).toUpperCase() + instituteType.slice(1)} Admin`,
    description: `Default admin role for ${instituteType} institute`,
    permissions: {
      instituteAdmin: uniquePermissions,
      teacher: getDefaultTeacherPermissions(instituteType),
      student: getDefaultStudentPermissions(instituteType),
      parent: getDefaultParentPermissions(instituteType),
    }
  };
}

// Teacher ke default permissions
function getDefaultTeacherPermissions(instituteType) {
  const base = [
    PERM.DASHBOARD_VIEW,
    PERM.STUDENTS_READ,
    PERM.ATTENDANCE_MARK,
    PERM.ATTENDANCE_VIEW,
    PERM.EXAMS_READ,
    PERM.EXAM_RESULTS_ENTER,
    PERM.NOTICES_READ,
  ];

  if (instituteType === 'school') {
    base.push(PERM.CLASSES_READ, PERM.SECTIONS_READ, PERM.SUBJECTS_READ);
  } else if (instituteType === 'coaching') {
    base.push(PERM.COURSES_READ, PERM.BATCHES_READ);
  } else if (instituteType === 'college') {
    base.push(PERM.DEPARTMENTS_READ, PERM.SEMESTERS_READ);
  }

  return [...new Set(base)];
}

// Student ke default permissions
function getDefaultStudentPermissions(instituteType) {
  return [
    PERM.DASHBOARD_VIEW,
    PERM.ATTENDANCE_VIEW,
    PERM.EXAM_RESULTS_VIEW,
    PERM.FEES_READ,
    PERM.TIMETABLE_READ,
    PERM.NOTICES_READ,
  ];
}

// Parent ke default permissions
function getDefaultParentPermissions(instituteType) {
  return [
    PERM.DASHBOARD_VIEW,
    PERM.ATTENDANCE_VIEW,
    PERM.EXAM_RESULTS_VIEW,
    PERM.FEES_READ,
    PERM.NOTICES_READ,
    PERM.REPORTS_STUDENT,
  ];
}

/**
 * Institute type ke hisaab se role templates
 */
export const INSTITUTE_ROLE_TEMPLATES = {
  school: getInstituteRoleTemplate('school'),
  coaching: getInstituteRoleTemplate('coaching'),
  academy: getInstituteRoleTemplate('academy'),
  college: getInstituteRoleTemplate('college'),
  university: getInstituteRoleTemplate('university'),
  
  // Legacy / generic names
  tuition_center: getInstituteRoleTemplate('coaching'),
  institute: getInstituteRoleTemplate('coaching'),
};