'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const captureVoucherCanvas = async (sourceNode, isCompact = false, pageSize = null, orientation = 'portrait') => {
  const exportHost = document.createElement('div');
  exportHost.style.position = 'fixed';
  exportHost.style.left = '-100000px';
  exportHost.style.top = '0';
  exportHost.style.background = '#ffffff';
  exportHost.style.padding = '0';
  exportHost.style.zIndex = '-1';

  const exportNode = sourceNode.cloneNode(true);
  exportNode.style.transform = 'none';

  const rawSize = String(pageSize || '').toUpperCase();
  const isLandscape = String(orientation || '').toLowerCase() === 'landscape' || String(orientation || '').toLowerCase() === 'l';

  if (isCompact) {
    if (rawSize === 'A6') {
      exportNode.style.width = isLandscape ? '148mm' : '105mm';
      exportNode.style.minHeight = isLandscape ? '105mm' : '148mm';
    } else if (rawSize === 'A5') {
      exportNode.style.width = isLandscape ? '210mm' : '148mm';
      exportNode.style.minHeight = isLandscape ? '148mm' : '210mm';
    } else {
      exportNode.style.width = isLandscape ? '148mm' : '105mm';
      exportNode.style.minHeight = 'auto';
    }
  } else {
    exportNode.style.width = isLandscape ? '297mm' : '210mm';
    exportNode.style.minHeight = isLandscape ? '210mm' : '297mm';
  }
  exportNode.style.margin = '0';

  exportHost.appendChild(exportNode);
  document.body.appendChild(exportHost);

  try {
    return await html2canvas(exportNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
    });
  } finally {
    document.body.removeChild(exportHost);
  }
};

export const saveCanvasAsPdf = (canvas, fileName, isCompact = false, pageSize = null, orientation = 'portrait') => {
  const imageData = canvas.toDataURL('image/png');
  const rawSize = String(pageSize || '').toUpperCase();
  const isLandscape = String(orientation || '').toLowerCase() === 'landscape' || String(orientation || '').toLowerCase() === 'l';
  const pdfOrientation = isLandscape ? 'landscape' : 'portrait';

  const pdfFormat = rawSize === 'A6' ? 'a6' : (rawSize === 'A5' || isCompact ? 'a5' : 'a4');
  const pdf = new jsPDF({ orientation: pdfOrientation, unit: 'mm', format: pdfFormat });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (isCompact) {
    const maxWidth = pageWidth - 6;
    const maxHeight = pageHeight - 6;
    let targetWidth = maxWidth;
    let targetHeight = (canvas.height * targetWidth) / canvas.width;

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = (canvas.width * targetHeight) / canvas.height;
    }

    const xOffset = Math.max(0, (pageWidth - targetWidth) / 2);
    const yOffset = Math.max(0, (pageHeight - targetHeight) / 2);

    pdf.addImage(imageData, 'PNG', xOffset, yOffset, targetWidth, targetHeight, undefined, 'FAST');
    pdf.save(fileName);
    return;
  }

  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};

export const saveCanvasAsA4Pdf = (canvas, fileName) => saveCanvasAsPdf(canvas, fileName, false, 'A4', 'portrait');

export const downloadVoucherFromNode = async (node, fileName, isCompact = false, pageSize = null, orientation = 'portrait') => {
  if (!node) return;
  const compactCheck = isCompact || node.querySelector?.('.compact-fee-receipt') !== null || node.classList?.contains('compact-fee-receipt');
  const canvas = await captureVoucherCanvas(node, compactCheck, pageSize, orientation);
  saveCanvasAsPdf(canvas, fileName, compactCheck, pageSize, orientation);
};
