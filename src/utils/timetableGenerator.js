export function generateSmartTimetable({
  subjects,
  teachers,
  days,
  periods
}) {

  const timetable = [];

  const teacherSchedule = {};

  teachers.forEach(t => {
    teacherSchedule[t] = {};
  });

  days.forEach(day => {

    periods.forEach(period => {

      const subject = subjects[Math.floor(Math.random() * subjects.length)];

      let teacher = teachers[Math.floor(Math.random() * teachers.length)];

      let attempts = 0;

      while (
        teacherSchedule[teacher]?.[`${day}-${period}`] &&
        attempts < 10
      ) {
        teacher = teachers[Math.floor(Math.random() * teachers.length)];
        attempts++;
      }

      if (!teacherSchedule[teacher]) teacherSchedule[teacher] = {};

      teacherSchedule[teacher][`${day}-${period}`] = true;

      timetable.push({
        day,
        period,
        subject,
        teacher
      });

    });

  });

  return timetable;

}