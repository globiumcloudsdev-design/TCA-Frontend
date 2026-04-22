export const sanitizeFileName = (name = 'download') =>
  String(name)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const downloadBlob = (blob, fileName) => {
  if (!blob) {
    throw new Error('No file data available for download');
  }

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = sanitizeFileName(fileName || 'download');
  link.click();

  URL.revokeObjectURL(url);
};
