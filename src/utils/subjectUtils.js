// src/utils/subjectUtils.js

/**
 * Class se subjects extract karne ke liye helper
 */

/**
 * Class data se subjects extract karta hai
 * @param {Object} classData - Class object with courses
 * @returns {Array} - List of subjects
 */
export const extractSubjectsFromClass = (classData) => {
  const subjects = [];
  const subjectMap = new Map();

  if (!classData?.courses?.length) return [];

  classData.courses.forEach(course => {
    // Course itself can be a subject
    if (course.name && !subjectMap.has(course.id)) {
      subjectMap.set(course.id, {
        id: course.id,
        name: course.name,
        code: course.code || course.course_code || '',
        type: 'course'
      });
    }

    // Extract from materials
    if (course.materials?.length) {
      course.materials.forEach(material => {
        if (material.subject_name && !subjectMap.has(material.subject_id || material.subject_name)) {
          subjectMap.set(material.subject_id || material.subject_name, {
            id: material.subject_id || material.subject_name,
            name: material.subject_name,
            code: '',
            type: 'material'
          });
        }
      });
    }
  });

  return Array.from(subjectMap.values());
};

/**
 * Get subjects for a specific class and section
 */
export const getSubjectsForClass = async (classId, sectionId, academicYearId) => {
  try {
    const { classService } = await import('@/services/classService');
    const response = await classService.getById(classId);
    
    if (!response?.data) return [];
    
    return extractSubjectsFromClass(response.data);
  } catch (error) {
    console.error('Error getting subjects for class:', error);
    return [];
  }
};