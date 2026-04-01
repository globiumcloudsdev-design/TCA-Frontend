'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { toast } from 'sonner';
import { attendanceService } from '@/services/attendanceService';
import { Loader2, CheckCircle2, XCircle, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { studentAttendanceService } from '@/services';

/**
 * QRScanner Component 
 * Uses html5-qrcode via CDN to avoid NPM installation issues in restricted environments.
 */
export default function QRScanner() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleScanSuccess = async (decodedText) => {
    // Prevent multiple simultaneous scans or scans during cooldown
    if (decodedText && !loading && ready && !result) {
      setReady(false);
      setLoading(true);
      setResult(null);
      setError(null);

      try {
        console.log('🔍 QR Scanned:', decodedText);
        const response = await studentAttendanceService.scanQR({
          student_id: decodedText,
          type: "regular"
        });

        const studentName = response.data?.student_name || 'Student';
        setResult({
          success: true,
          message: `✅ Attendance marked: ${studentName}`
        });
        toast.success(response.message || `Attendance marked for ${studentName}`);

      } catch (err) {
        console.error('❌ API Error:', err);
        const errorMessage = err.response?.data?.message || "❌ Already marked present today";
        setResult({
          success: false,
          message: errorMessage
        });
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        // Cooldown for 2 seconds before allowing next scan
        setTimeout(() => {
          setResult(null);
          setReady(true);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    // Only run on client after script is loaded
    if (scriptLoaded && typeof window !== 'undefined' && window.Html5Qrcode) {
        let html5QrCode;
        
        const startScanner = async () => {
            try {
                // Ensure container exists
                if (!document.getElementById("reader")) return;

                html5QrCode = new window.Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const config = { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    // Fix for small screens
                    videoConstraints: {
                        facingMode: "environment"
                    }
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => handleScanSuccess(decodedText),
                    (errorMessage) => {
                        // Ignore frequent scan failures (common in this lib)
                    }
                );
                setReady(true);
                setError(null);
            } catch (err) {
                console.error('📷 Camera error:', err);
                setError('Camera access failed. Check permissions.');
            }
        };

        startScanner();

        return () => {
            if (html5QrCode) {
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().then(() => html5QrCode.clear()).catch(e => console.warn(e));
                } else {
                    try { html5QrCode.clear(); } catch (e) {}
                }
            }
        };
    }
  }, [scriptLoaded]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-lg mx-auto">
      {/* Load library via CDN directly to bypass build errors from missing node_modules */}
      <Script 
        src="https://unpkg.com/html5-qrcode" 
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      
      <div className="relative w-full aspect-square overflow-hidden rounded-[2.5rem] bg-[#020617] border-[12px] border-white/5 shadow-2xl transition-all duration-500 hover:border-white/10">
        {/* The actual camera feed container */}
        <div id="reader" className="w-full h-full object-cover"></div>

        {/* Global UI Overlays */}
        {(loading || !ready || error || result) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl z-20 transition-all duration-300">
            {loading ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-t-4 border-emerald-500 animate-spin" />
                  <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-white text-lg font-bold tracking-tight">Processing...</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest">Marking attendance</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center space-y-6 p-10 text-center animate-in zoom-in duration-300">
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-bold">Hardware Error</h3>
                  <p className="text-white/50 text-sm">{error}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full bg-white/5 text-white border-white/10 hover:bg-white/10">
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            ) : result?.success ? (
              <div className="flex flex-col items-center space-y-6 p-10 text-center animate-in zoom-in duration-300">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                  <div className="absolute -inset-2 bg-emerald-500/20 rounded-full animate-ping" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-2xl font-bold tracking-tight">Success!</h3>
                  <p className="text-emerald-400 font-medium px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10 whitespace-pre-wrap">
                    {result.message}
                  </p>
                </div>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">AUTO-READY IN 2S</p>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center space-y-6 p-10 text-center animate-in zoom-in duration-300">
                <div className="h-24 w-24 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <XCircle className="h-12 w-12 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-2xl font-bold tracking-tight">Notice</h3>
                  <p className="text-amber-400 font-medium px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                    {result.message}
                  </p>
                </div>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">AUTO-READY IN 2S</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <Loader2 className="h-10 w-10 text-white/20 animate-spin" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Waiting for camera...</p>
              </div>
            )}
          </div>
        )}

        {/* Viewfinder (Active when scanning) */}
        {ready && !loading && !error && !result && (
          <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500">
            {/* Viewport Frame */}
            <div className="absolute inset-[15%] border-2 border-white/5 rounded-[2rem] overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5" />
                
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-14 h-14 border-t-[6px] border-l-[6px] border-emerald-500 rounded-tl-3xl shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="absolute -top-1 -right-1 w-14 h-14 border-t-[6px] border-r-[6px] border-emerald-500 rounded-tr-3xl shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="absolute -bottom-1 -left-1 w-14 h-14 border-b-[6px] border-l-[6px] border-emerald-500 rounded-bl-3xl shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="absolute -bottom-1 -right-1 w-14 h-14 border-b-[6px] border-r-[6px] border-emerald-500 rounded-br-3xl shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            </div>
            
            {/* Moving Scan Line */}
            <div className="absolute top-[15%] left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan-line opacity-80" />
            
            {/* UI Hints */}
            <div className="absolute bottom-12 left-0 right-0 text-center animate-bounce">
              <span className="text-[10px] font-black tracking-[0.2em] text-white bg-emerald-600 px-4 py-2 rounded-full shadow-lg">
                SCANNING ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 w-full text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
            <Camera className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-black text-slate-700 dark:text-white/50 uppercase tracking-widest">Smart Vision</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
            <RefreshCw className="h-4 w-4 text-sky-500" />
            <span className="text-[11px] font-black text-slate-700 dark:text-white/50 uppercase tracking-widest">Continuous</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
          Point the student's ID card QR directly into the viewfinder. Ensure good lighting for best results.
        </p>
      </div>
    </div>
  );
}
