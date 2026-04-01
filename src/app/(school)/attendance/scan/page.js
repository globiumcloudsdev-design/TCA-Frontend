'use client';

import React from 'react';
import QRScanner from '@/components/attendance/QRScanner';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function AttendanceScanPage() {
  const { type } = useParams();
  const backHref = type ? `/${type}/attendance` : '/attendance';

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Attendance
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Smart QR Attendance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Scan student QR codes for instant attendance tracking.
          </p>
        </div>
        
        {/* Help / Info Card */}
        <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Quick Scan Mode</p>
            <p className="text-[10px] text-muted-foreground">Multiple scans enabled with 2s interval</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Scanner Component */}
        <Card className="md:col-span-3 border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <QRScanner />
          </CardContent>
        </Card>

        {/* Instructions / Recent Scans (Optional Placeholder) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-primary/5 shadow-lg overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">A</div>
                <p className="text-sm text-muted-foreground">Ensure student card is straight and at a 15-20cm distance.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">B</div>
                <p className="text-sm text-muted-foreground">Keep the QR code within the highlighted focus area.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">C</div>
                <p className="text-sm text-muted-foreground">Wait for the green confirmation before scanning the next student.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/5 shadow-lg overflow-hidden border-2 border-dashed bg-muted/20">
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-semibold mb-1">Session Summary</h4>
              <p className="text-xs text-muted-foreground">Total scanned students will appear here in the next update.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
