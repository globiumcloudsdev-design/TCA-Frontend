// src/utils/assignmentUtils.js

import { getAssignmentTerms } from '@/constants/portalInstituteConfig';

export const getAssignmentStatusInfo = (status, instituteType) => {
  const terms = getAssignmentTerms(instituteType);
  
  const statusMap = {
    draft: { label: terms.statusDraft, color: 'gray', icon: 'Pencil' },
    published: { label: terms.statusPublished, color: 'green', icon: 'CheckCircle' },
    pending: { label: terms.statusPending, color: 'yellow', icon: 'Clock' },
    submitted: { label: terms.statusSubmitted, color: 'blue', icon: 'CheckCircle' },
    graded: { label: terms.statusGraded, color: 'emerald', icon: 'Award' },
    late: { label: terms.statusLate, color: 'orange', icon: 'AlertTriangle' },
    overdue: { label: terms.statusOverdue, color: 'red', icon: 'AlertCircle' },
    archived: { label: terms.statusArchived, color: 'gray', icon: 'Archive' }
  };
  
  return statusMap[status] || statusMap.pending;
};

export const getGradingTypeOptions = (instituteType) => {
  const terms = getAssignmentTerms(instituteType);
  
  return [
    { value: 'marks', label: terms.marksOnly },
    { value: 'grades', label: terms.grades },
    { value: 'pass_fail', label: terms.passFail }
  ];
};

export const getDifficultyOptions = (instituteType) => {
  const terms = getAssignmentTerms(instituteType);
  
  return [
    { value: 'beginner', label: terms.beginner, color: 'green' },
    { value: 'intermediate', label: terms.intermediate, color: 'blue' },
    { value: 'advanced', label: terms.advanced, color: 'orange' },
    { value: 'expert', label: terms.expert, color: 'red' }
  ];
};

export const validateAssignmentForm = (form, instituteType) => {
  const terms = getAssignmentTerms(instituteType);
  const errors = {};
  
  if (!form.title?.trim()) {
    errors.title = `Title is required`;
  }
  
  if (!form.due_date) {
    errors.due_date = `${terms.dueDateLabel} is required`;
  }
  
  if (form.total_marks && form.passing_marks) {
    if (parseFloat(form.passing_marks) > parseFloat(form.total_marks)) {
      errors.passing_marks = `${terms.passingMarks} cannot exceed ${terms.totalMarks}`;
    }
  }
  
  if (form.max_files && (form.max_files < 1 || form.max_files > 50)) {
    errors.max_files = `${terms.maxFiles} must be between 1 and 50`;
  }
  
  if (form.max_file_size && (form.max_file_size < 1 || form.max_file_size > 500)) {
    errors.max_file_size = `${terms.maxFileSize} must be between 1 and 500 MB`;
  }
  
  if (form.late_submission_penalty && (form.late_submission_penalty < 0 || form.late_submission_penalty > 100)) {
    errors.late_submission_penalty = `${terms.latePenalty} must be between 0 and 100%`;
  }
  
  return errors;
};

export const formatAssignmentMessage = (messageKey, instituteType, params = {}) => {
  const terms = getAssignmentTerms(instituteType);
  const message = terms.messages[messageKey] || messageKey;
  
  return message.replace(/{(\w+)}/g, (_, key) => params[key] || '');
};