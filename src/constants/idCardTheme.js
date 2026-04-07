export const ID_CARD_THEME = {
  card: {
    width: 54,
    height: 86,
    radius: 3,
    borderColor: [220, 226, 234],
    textColor: [17, 24, 39],
    mutedTextColor: [75, 85, 99],
  },
  front: {
    topBandHeight: 16,
    topBandColor: [17, 38, 95],
    accentColor: [247, 123, 0],
    backgroundColor: [255, 255, 255],
    profileCircleSize: 23,
    qrSize: 14,
  },
  back: {
    topBandHeight: 13,
    topBandColor: [17, 38, 95],
    accentColor: [247, 123, 0],
    backgroundColor: [255, 255, 255],
    validityText: 'This card is property of institute and must be returned on request.',
  },
};

export const ID_CARD_ROLE_THEME = {
  student: {
    label: 'STUDENT ID CARD',
    accentColor: [247, 123, 0],
  },
  teacher: {
    label: 'TEACHER ID CARD',
    accentColor: [21, 128, 61],
  },
  staff: {
    label: 'STAFF ID CARD',
    accentColor: [37, 99, 235],
  },
  admin: {
    label: 'ADMIN ID CARD',
    accentColor: [126, 34, 206],
  },
};

export const getRoleTheme = (role = 'student') => {
  const key = String(role || 'student').toLowerCase();
  return ID_CARD_ROLE_THEME[key] || ID_CARD_ROLE_THEME.student;
};
