'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const captureVoucherCanvas = async (sourceNode) => {
  const exportHost = document.createElement('div');
  exportHost.style.position = 'fixed';
  exportHost.style.left = '-100000px';
  exportHost.style.top = '0';
  exportHost.style.background = '#ffffff';
  exportHost.style.padding = '0';
  exportHost.style.zIndex = '-1';

  const exportNode = sourceNode.cloneNode(true);
  exportNode.style.transform = 'none';
  exportNode.style.width = '210mm';
  exportNode.style.minHeight = '297mm';
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

export const saveCanvasAsA4Pdf = (canvas, fileName) => {
  const imageData = canvas.toDataURL('image/png');
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

export const downloadVoucherFromNode = async (node, fileName) => {
  if (!node) return;
  const canvas = await captureVoucherCanvas(node);
  saveCanvasAsA4Pdf(canvas, fileName);
};
