'use client';

import AppModal from '@/components/common/AppModal';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';

export default function PdfPreviewModal({
  open,
  onClose,
  title,
  description,
  materials = [],
  pdfUrl = null,
}) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title || 'Preview'}
      description={description || ''}
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">

        {/* Materials List */}
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Materials
          </p>

          {materials.length === 0 ? (
            <p className="text-sm text-slate-500">
              No material available.
            </p>
          ) : (
            <div className="space-y-2">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <p className="text-sm truncate">{m.name}</p>
                  </div>

                  {m.url ? (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-700 flex items-center gap-1"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No URL
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-600 border-b">
              PDF Preview
            </div>

            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-[70vh]"
            />
          </div>
        )}
      </div>
    </AppModal>
  );
}