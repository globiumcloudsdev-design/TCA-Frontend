export const teacherConflict = (slots, teacher, day, period) => {

  return slots.some(
    (slot) =>
      slot.teacher === teacher &&
      slot.day === day &&
      Number(slot.period) === Number(period)
  );

};