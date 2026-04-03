/**
 * Exam and Marks Utilities
 * Provides validation and formatting utilities for exam-related operations
 */

/**
 * Validate a single mark value against maximum marks
 * @param {number|string} value - The mark value to validate
 * @param {number} maxMarks - Maximum marks allowed
 * @returns {{isValid: boolean, error: string|null, normalizedValue: number|string}}
 */
export const validateMarkValue = (value, maxMarks) => {
  // Empty values are valid (student hasn't entered marks yet)
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, error: null, normalizedValue: '' };
  }

  const numValue = parseFloat(value);

  // Check for NaN
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Invalid number', normalizedValue: value };
  }

  // Check for negative values
  if (numValue < 0) {
    return { isValid: false, error: 'Cannot be negative', normalizedValue: value };
  }

  // Check for exceeding max marks
  if (numValue > maxMarks) {
    return {
      isValid: false,
      error: `Cannot exceed ${maxMarks}`,
      normalizedValue: numValue
    };
  }

  return { isValid: true, error: null, normalizedValue: numValue };
};

/**
 * Validate all marks for an exam submission
 * @param {Object} marks - Object mapping studentId -> subjectId -> mark value
 * @param {Array} subjects - Array of subject schedule objects with subject_id and total_marks
 * @returns {{isValid: boolean, errors: Object<string, string>}}
 */
export const validateAllMarks = (marks, subjects) => {
  const errors = {};
  let isValid = true;

  if (!marks || Object.keys(marks).length === 0) {
    return { isValid: false, errors: { _form: 'No marks data provided' } };
  }

  if (!subjects || subjects.length === 0) {
    return { isValid: false, errors: { _form: 'No subjects configured for this exam' } };
  }

  Object.entries(marks).forEach(([studentId, subjectMarks]) => {
    if (!studentId || typeof studentId !== 'string') {
      isValid = false;
      return;
    }

    Object.entries(subjectMarks).forEach(([subjectId, markValue]) => {
      const subject = subjects.find((s) => s.subject_id === subjectId);

      if (!subject) {
        errors[`${studentId}_${subjectId}`] = 'Subject not found';
        isValid = false;
        return;
      }

      const validation = validateMarkValue(markValue, subject.total_marks);
      if (!validation.isValid) {
        errors[`${studentId}_${subjectId}`] = validation.error;
        isValid = false;
      }
    });
  });

  return { isValid, errors };
};

/**
 * Normalize marks data for API submission
 * Converts marks object to array format expected by backend
 * @param {Object} marks - Object mapping studentId -> subjectId -> mark value
 * @returns {Array} Array of result objects in API format
 */
export const normalizeMarksForSubmission = (marks) => {
  return Object.entries(marks)
    .map(([studentId, subjectMarks]) => ({
      student_id: studentId,
      subject_marks: Object.entries(subjectMarks)
        .map(([subjectId, markValue]) => ({
          subject_id: subjectId,
          marks_obtained: markValue || 0
        }))
        .filter((sm) => sm.subject_id && sm.marks_obtained !== '')
    }))
    .filter((r) => r.student_id && r.subject_marks.length > 0);
};

/**
 * Format marks data from API response to internal state format
 * @param {Array} results - Array of result objects from API
 * @returns {Object} Object mapping studentId -> subjectId -> mark value
 */
export const normalizeMarksFromAPI = (results) => {
  const marks = {};

  if (!Array.isArray(results)) {
    return marks;
  }

  results.forEach((result) => {
    if (!result.student_id) return;

    marks[result.student_id] = {};

    // Handle both array and object formats
    if (Array.isArray(result.subject_marks)) {
      result.subject_marks.forEach((sm) => {
        marks[result.student_id][sm.subject_id] = sm.marks_obtained || '';
      });
    } else if (typeof result.subject_marks === 'object') {
      Object.entries(result.subject_marks).forEach(([subjectId, value]) => {
        marks[result.student_id][subjectId] = value || '';
      });
    }
  });

  return marks;
};

/**
 * Get total marks and subjects count for an exam
 * @param {Array} subjects - Array of subject schedules
 * @returns {{totalMarks: number, totalSubjects: number}}
 */
export const getExamMarksSummary = (subjects) => {
  if (!Array.isArray(subjects)) {
    return { totalMarks: 0, totalSubjects: 0 };
  }

  const totalMarks = subjects.reduce((sum, subject) => sum + (subject.total_marks || 0), 0);
  return {
    totalMarks,
    totalSubjects: subjects.length
  };
};

/**
 * Calculate student total marks across all subjects
 * @param {Object} studentMarks - Object mapping subjectId -> mark value
 * @param {Array} subjects - Array of subject schedules
 * @returns {Object} {total: number, outOf: number, percentage: number}
 */
export const calculateStudentTotal = (studentMarks, subjects) => {
  let total = 0;
  let outOf = 0;

  if (!subjects || !studentMarks) {
    return { total: 0, outOf: 0, percentage: 0 };
  }

  subjects.forEach((subject) => {
    const mark = studentMarks[subject.subject_id] || 0;
    total += parseFloat(mark) || 0;
    outOf += subject.total_marks || 0;
  });

  const percentage = outOf > 0 ? ((total / outOf) * 100).toFixed(2) : 0;

  return { total: parseFloat(total.toFixed(2)), outOf, percentage };
};

/**
 * Grade a student based on marks percentage
 * Uses standard grading scale (adjust as needed for institution)
 * @param {number} percentage - Student percentage
 * @returns {string} Letter grade
 */
export const getGrade = (percentage) => {
  const p = parseFloat(percentage);

  if (isNaN(p)) return 'N/A';
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C+';
  if (p >= 40) return 'C';
  return 'F';
};

/**
 * Check if a student passed based on marks and passing percentage
 * @param {number} total - Total marks obtained
 * @param {number} outOf - Maximum marks
 * @param {number} passingPercentage - Passing threshold percentage (default: 40)
 * @returns {boolean} Whether student passed
 */
export const isStudentPassed = (total, outOf, passingPercentage = 40) => {
  if (outOf === 0) return false;
  const percentage = (total / outOf) * 100;
  return percentage >= passingPercentage;
};

/**
 * Validate exam schedule before marking
 * @param {Object} exam - Exam object
 * @returns {{isValid: boolean, errors: Array<string>}}
 */
export const validateExamSchedule = (exam) => {
  const errors = [];

  if (!exam) {
    errors.push('Exam not found');
    return { isValid: false, errors };
  }

  if (!exam.subject_schedules || exam.subject_schedules.length === 0) {
    errors.push('No subjects scheduled for this exam');
  }

  if (!exam.exam_date) {
    errors.push('Exam date is not set');
  }

  if (!exam.class || !exam.class.id) {
    errors.push('Class information is missing');
  }

  return { isValid: errors.length === 0, errors };
};
