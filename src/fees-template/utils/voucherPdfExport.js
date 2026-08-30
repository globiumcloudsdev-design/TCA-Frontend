'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const captureVoucherCanvas = async (sourceNode, isCompact = false) => {
  const exportHost = document.createElement('div');
  exportHost.style.position = 'fixed';
  exportHost.style.left = '-100000px';
  exportHost.style.top = '0';
  exportHost.style.background = '#ffffff';
  exportHost.style.padding = '0';
  exportHost.style.zIndex = '-1';

  const exportNode = sourceNode.cloneNode(true);
  exportNode.style.transform = 'none';
  if (isCompact) {
    exportNode.style.width = '105mm';
    exportNode.style.minHeight = 'auto';
  } else {
    exportNode.style.width = '210mm';
    exportNode.style.minHeight = '297mm';
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

export const saveCanvasAsPdf = (canvas, fileName, isCompact = false) => {
  const imageData = canvas.toDataURL('image/png');
  
  if (isCompact) {
    // Standard A5 portrait (148mm x 210mm) or custom compact receipt dimensions
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Center receipt horizontally if smaller than page width
    const targetWidth = Math.min(pageWidth - 20, 105);
    const targetHeight = (canvas.height * targetWidth) / canvas.width;
    const xOffset = (pageWidth - targetWidth) / 2;
    const yOffset = 10;

    pdf.addImage(imageData, 'PNG', xOffset, yOffset, targetWidth, targetHeight, undefined, 'FAST');
    pdf.save(fileName);
    return;
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
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

export const saveCanvasAsA4Pdf = (canvas, fileName) => saveCanvasAsPdf(canvas, fileName, false);

export const downloadVoucherFromNode = async (node, fileName, isCompact = false) => {
  if (!node) return;
  const compactCheck = isCompact || node.querySelector?.('.compact-fee-receipt') !== null || node.classList?.contains('compact-fee-receipt');
  const canvas = await captureVoucherCanvas(node, compactCheck);
  saveCanvasAsPdf(canvas, fileName, compactCheck);
};
