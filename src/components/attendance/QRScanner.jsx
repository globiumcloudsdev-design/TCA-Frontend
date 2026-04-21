// // // QRScanner.jsx - A robust QR code scanner component for marking student attendance with real-time feedback, error handling, and support for both instant and queue-based scanning modes.
// // //src/components/attendance/QRScanner.jsx
// // 'use client';

// // import React, { useEffect, useRef, useState } from 'react';
// // import QrScanner from 'qr-scanner';
// // import { Loader2, CheckCircle2, XCircle, User, Hash, GraduationCap, BookOpen } from 'lucide-react';
// // import { toast } from 'sonner';
// // import { studentAttendanceService, studentService } from '@/services';

// // export default function QRScanner({ onScan, bulkMode = false, onScanComplete, instituteId, type = 'school' }) {
// //   const videoRef = useRef(null);
// //   const scannerRef = useRef(null);
// //   const cooldownRef = useRef(false);
// //   const isProcessingRef = useRef(false);

// //   const [loading, setLoading] = useState(false);
// //   const [result, setResult] = useState(null);
// //   const [error, setError] = useState('');
// //   const [studentDetails, setStudentDetails] = useState(null);

// //   // =========================
// //   // 🔊 AUDIO + VOICE SYSTEM
// //   // =========================

// //   const playTone = (frequency = 500, duration = 200) => {
// //     const ctx = new (window.AudioContext || window.webkitAudioContext)();
// //     const oscillator = ctx.createOscillator();
// //     const gain = ctx.createGain();

// //     oscillator.type = 'sine';
// //     oscillator.frequency.value = frequency;

// //     oscillator.connect(gain);
// //     gain.connect(ctx.destination);

// //     oscillator.start();

// //     setTimeout(() => {
// //       oscillator.stop();
// //       ctx.close();
// //     }, duration);
// //   };

// //   const vibrate = (pattern = 200) => {
// //     if (navigator.vibrate) navigator.vibrate(pattern);
// //   };

// //   const speak = (text, type = 'normal') => {
// //     if (!window.speechSynthesis) return;
    
// //     window.speechSynthesis.cancel();
    
// //     const utter = new SpeechSynthesisUtterance(text);
// //     utter.rate = 1;
// //     utter.pitch = type === 'success' ? 1.2 : 0.9;

// //     const speakWithVoice = () => {
// //       const voices = window.speechSynthesis.getVoices();
// //       const voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female'));
// //       if (voice) utter.voice = voice;
// //       window.speechSynthesis.speak(utter);
// //     };

// //     if (window.speechSynthesis.getVoices().length) {
// //       speakWithVoice();
// //     } else {
// //       window.speechSynthesis.onvoiceschanged = speakWithVoice;
// //     }
// //   };

// //   const successSound = (name) => {
// //     playTone(800, 120);
// //     setTimeout(() => playTone(1000, 120), 120);
// //     speak(`${name} attendance marked`, 'success');
// //     vibrate(200);
// //   };

// //   const errorSound = (message = 'Already marked or invalid') => {
// //     playTone(300, 300);
// //     speak(message, 'error');
// //     vibrate([200, 100, 200]);
// //   };

// //   const lateSound = (name) => {
// //     playTone(600, 150);
// //     setTimeout(() => playTone(400, 150), 150);
// //     speak(`${name} marked late`);
// //     vibrate([100, 50, 100]);
// //   };

// //   // =========================
// //   // 🔍 FETCH STUDENT DETAILS
// //   // =========================

// //   const fetchStudentDetails = async (studentId) => {
// //     try {
// //       // Try to get student details from API
// //       const response = await studentService.getById(studentId, instituteId, type);
// //       const student = response?.data || response;
      
// //       if (student) {
// //         // Flatten student details
// //         const details = student.details?.studentDetails || student.studentDetails || {};
// //         const activeSession = details.academicSessions?.find(s => s.status === 'active') || {};
        
// //         return {
// //           id: student.id,
// //           name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
// //           roll_no: activeSession.roll_no || details.roll_no || student.roll_no || 'N/A',
// //           class_name: activeSession.class_name || details.class_name || student.class_name || 'N/A',
// //           section_name: activeSession.section_name || details.section_name || student.section_name || 'N/A',
// //           registration_no: student.registration_no || 'N/A',
// //           avatar: student.avatar_url
// //         };
// //       }
// //       return null;
// //     } catch (err) {
// //       console.error('Failed to fetch student details:', err);
// //       return null;
// //     }
// //   };

// //   // =========================
// //   // 🔥 SCAN HANDLER
// //   // =========================

// //   const handleScan = async (data) => {
// //     if (!data || loading || cooldownRef.current || isProcessingRef.current) {
// //       console.log('⏸️ Scan blocked');
// //       return;
// //     }

// //     isProcessingRef.current = true;
// //     cooldownRef.current = true;
// //     setLoading(true);
// //     setResult(null);
// //     setError('');
// //     setStudentDetails(null);

// //     try {
// //       const raw = data?.data || data;
// //       console.log('📱 Raw QR Data:', raw);

// //       let parsed;
// //       try {
// //         parsed = JSON.parse(raw);
// //       } catch {
// //         parsed = raw;
// //       }

// //       const studentId = parsed?.id || parsed;
// //       console.log('🎯 Student ID:', studentId);

// //       // Fetch student details first
// //       const studentInfo = await fetchStudentDetails(studentId);
// //       setStudentDetails(studentInfo);

// //       // 👉 CASE 1: External handler provided (for queue/bulk mode)
// //       if (onScan) {
// //         console.log('📞 Calling external onScan handler...');
// //         const ok = await onScan(studentId);

// //         if (ok) {
// //           setResult({ 
// //             success: true, 
// //             message: `Added to queue`,
// //             student: studentInfo 
// //           });
// //           successSound(studentInfo?.name || 'Student');
// //           if (onScanComplete) onScanComplete(true, studentId, studentInfo);
// //         } else {
// //           setResult({ 
// //             success: false, 
// //             message: 'Already in queue or invalid',
// //             student: studentInfo 
// //           });
// //           errorSound('Already in queue');
// //           if (onScanComplete) onScanComplete(false, studentId, studentInfo);
// //         }
// //         return;
// //       }

// //       // 👉 CASE 2: Direct API call (for instant scan mode)
// //       console.log('📡 Calling API directly...');
// //       const res = await studentAttendanceService.scanQR({
// //         student_id: studentId,
// //         type: bulkMode ? 'bulk' : 'regular',
// //       });

// //       console.log('✅ API Response:', res);

// //       const status = res?.data?.status || 'present';

// //       setResult({
// //         success: true,
// //         message: `Attendance marked`,
// //         student: studentInfo,
// //         status: status
// //       });

// //       toast.success(`Attendance marked for ${studentInfo?.name || 'Student'}`);

// //       if (status === 'late') {
// //         lateSound(studentInfo?.name || 'Student');
// //       } else {
// //         successSound(studentInfo?.name || 'Student');
// //       }

// //       if (onScanComplete) onScanComplete(true, studentId, studentInfo);

// //     } catch (err) {
// //       console.error('❌ Scan Error:', err);
      
// //       const errorMessage = err?.response?.data?.message || err?.message || 'Scan failed';
      
// //       setResult({
// //         success: false,
// //         message: errorMessage,
// //         student: studentDetails
// //       });

// //       setError(errorMessage);
// //       toast.error(errorMessage);
// //       errorSound(errorMessage);
      
// //       if (onScanComplete) onScanComplete(false, null, null, errorMessage);
// //     } finally {
// //       setLoading(false);
// //       isProcessingRef.current = false;

// //       setTimeout(() => {
// //         setResult(null);
// //         setError('');
// //         // Keep student details for a bit longer
// //         setTimeout(() => {
// //           setStudentDetails(null);
// //         }, 500);
// //       }, 2000);
      
// //       setTimeout(() => {
// //         cooldownRef.current = false;
// //       }, 800);
// //     }
// //   };

// //   // =========================
// //   // 🚀 START SCANNER
// //   // =========================

// //   useEffect(() => {
// //     if (!videoRef.current) return;

// //     let scanner = null;
    
// //     const initScanner = async () => {
// //       try {
// //         scanner = new QrScanner(videoRef.current, handleScan, {
// //           returnDetailedScanResult: true,
// //           highlightScanRegion: true,
// //           highlightCodeOutline: true,
// //           maxScansPerSecond: 5,
// //         });

// //         scannerRef.current = scanner;
// //         await scanner.start();
// //         console.log('✅ QR Scanner started successfully');
// //       } catch (err) {
// //         console.error('Camera error:', err);
// //         setError('Camera permission denied or not available');
// //         toast.error('Unable to access camera. Please check permissions.');
// //       }
// //     };

// //     initScanner();

// //     if (window.speechSynthesis) {
// //       window.speechSynthesis.getVoices();
// //     }

// //     return () => {
// //       if (scanner) {
// //         scanner.stop();
// //         scanner.destroy();
// //         console.log('🛑 QR Scanner stopped');
// //       }
// //     };
// //   }, []);

// //   // =========================
// //   // 🎨 UI
// //   // =========================

// //   return (
// //     <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">

// //       <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black border border-white/10">

// //         <video ref={videoRef} className="w-full h-full object-cover" />

// //         {/* Overlay with Student Details */}
// //         {(loading || result || error || studentDetails) && (
// //           <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10">
            
// //             {loading ? (
// //               <div className="text-center">
// //                 <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
// //                 <p className="text-white text-sm mt-3">Fetching student details...</p>
// //               </div>
// //             ) : error ? (
// //               <div className="text-center max-w-[90%]">
// //                 <XCircle className="h-10 w-10 text-red-500 mx-auto" />
// //                 <p className="text-red-400 mt-2 text-sm font-medium">{error}</p>
// //               </div>
// //             ) : (result?.success || studentDetails) ? (
// //               <div className="text-center w-full max-w-sm px-4 animate-in zoom-in-95 duration-200">
// //                 <CheckCircle2 className={`h-12 w-12 ${result?.status === 'late' ? 'text-amber-500' : 'text-emerald-500'} mx-auto animate-bounce`} />
                
// //                 {/* Student Details Card */}
// //                 {(studentDetails || result?.student) && (
// //                   <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
// //                     <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/20">
// //                       <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
// //                         <User className="w-6 h-6 text-emerald-400" />
// //                       </div>
// //                       <div className="text-left flex-1">
// //                         <p className="text-white font-bold text-lg">
// //                           {studentDetails?.name || result?.student?.name || 'Student'}
// //                         </p>
// //                         <p className="text-emerald-400 text-xs font-mono">
// //                           ID: {(studentDetails?.id || result?.student?.id)?.slice(0, 8)}...
// //                         </p>
// //                       </div>
// //                     </div>

// //                     <div className="grid grid-cols-2 gap-3 text-left">
// //                       <div className="flex items-center gap-2">
// //                         <Hash className="w-4 h-4 text-emerald-400" />
// //                         <div>
// //                           <p className="text-[10px] text-white/50 uppercase font-bold">Roll No</p>
// //                           <p className="text-white text-sm font-semibold">
// //                             {studentDetails?.roll_no || result?.student?.roll_no || 'N/A'}
// //                           </p>
// //                         </div>
// //                       </div>
                      
// //                       <div className="flex items-center gap-2">
// //                         <BookOpen className="w-4 h-4 text-emerald-400" />
// //                         <div>
// //                           <p className="text-[10px] text-white/50 uppercase font-bold">Registration</p>
// //                           <p className="text-white text-sm font-semibold truncate">
// //                             {studentDetails?.registration_no || result?.student?.registration_no || 'N/A'}
// //                           </p>
// //                         </div>
// //                       </div>

// //                       <div className="flex items-center gap-2">
// //                         <GraduationCap className="w-4 h-4 text-emerald-400" />
// //                         <div>
// //                           <p className="text-[10px] text-white/50 uppercase font-bold">Class</p>
// //                           <p className="text-white text-sm font-semibold">
// //                             {studentDetails?.class_name || result?.student?.class_name || 'N/A'}
// //                           </p>
// //                         </div>
// //                       </div>

// //                       <div className="flex items-center gap-2">
// //                         <GraduationCap className="w-4 h-4 text-emerald-400" />
// //                         <div>
// //                           <p className="text-[10px] text-white/50 uppercase font-bold">Section</p>
// //                           <p className="text-white text-sm font-semibold">
// //                             {studentDetails?.section_name || result?.student?.section_name || 'N/A'}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     </div>

// //                     {result?.message && (
// //                       <div className="mt-3 pt-3 border-t border-white/20">
// //                         <p className={`text-sm font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
// //                           {result.message}
// //                         </p>
// //                         {result?.status === 'late' && (
// //                           <p className="text-amber-400 text-xs mt-1">⚠️ Marked as Late</p>
// //                         )}
// //                       </div>
// //                     )}
// //                   </div>
// //                 )}

// //                 {!studentDetails && !result?.student && result?.success && (
// //                   <p className="text-emerald-400 mt-4 font-bold">{result.message}</p>
// //                 )}
// //               </div>
// //             ) : (
// //               <div className="text-center">
// //                 <XCircle className="h-12 w-12 text-yellow-500 mx-auto" />
// //                 <p className="text-yellow-400 mt-2">{result?.message}</p>
// //               </div>
// //             )}

// //           </div>
// //         )}

// //         {/* Scan Frame */}
// //         <div className="absolute inset-[20%] border-4 border-emerald-500 rounded-2xl pointer-events-none animate-pulse" />
        
// //         {/* Corner indicators */}
// //         <div className="absolute top-[18%] left-[18%] w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
// //         <div className="absolute top-[18%] right-[18%] w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
// //         <div className="absolute bottom-[18%] left-[18%] w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
// //         <div className="absolute bottom-[18%] right-[18%] w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />

// //       </div>

// //       <p className="text-xs text-muted-foreground text-center">
// //         📸 QR ko frame ke andar rakho — Student details automatically show honge ⚡
// //       </p>

// //     </div>
// //   );
// // }








// QRScanner.jsx - Optimized with caching, auto-detection, and mode-specific voice
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import QrScanner from 'qr-scanner';
import { Loader2, CheckCircle2, XCircle, User, Hash, GraduationCap, BookOpen, Camera, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { studentAttendanceService, studentService } from '@/services';

// Simple LRU cache for student details
const studentCache = new Map();
const CACHE_MAX_SIZE = 2000;

const getCachedStudent = (id) => studentCache.get(id);
const setCachedStudent = (id, data) => {
  if (studentCache.size >= CACHE_MAX_SIZE) {
    const firstKey = studentCache.keys().next().value;
    studentCache.delete(firstKey);
  }
  studentCache.set(id, data);
};

export default function QRScanner({ 
  onScan, 
  bulkMode = false, 
  onScanComplete, 
  instituteId, 
  type = 'school',
  preferredScanner = 'auto',     // 'auto', 'camera', 'external'
  showScannerToggle = true
}) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const cooldownRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Scanner mode state
  const [scannerMode, setScannerMode] = useState(preferredScanner === 'auto' ? 'camera' : preferredScanner);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [autoFallbackTimer, setAutoFallbackTimer] = useState(null);

  // External scanner keyboard buffer
  const keyboardBufferRef = useRef('');
  const keyboardTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);

  // =========================
  // 🔊 AUDIO + VOICE SYSTEM (enhanced for bulk mode)
  // =========================
  const playTone = (frequency = 500, duration = 200) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, duration);
  };

  const vibrate = (pattern = 200) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const speak = (text, type = 'normal') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = type === 'success' ? 1.2 : 0.9;
    const speakWithVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female'));
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length) {
      speakWithVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = speakWithVoice;
    }
  };

  const successSound = (name, isBulk = false) => {
    playTone(800, 120);
    setTimeout(() => playTone(1000, 120), 120);
    if (isBulk) {
      speak(`${name} added to queue`, 'success');
    } else {
      speak(`${name} attendance marked`, 'success');
    }
    vibrate(200);
  };

  const errorSound = (message = 'Already marked or invalid') => {
    playTone(300, 300);
    speak(message, 'error');
    vibrate([200, 100, 200]);
  };

  const lateSound = (name, isBulk = false) => {
    playTone(600, 150);
    setTimeout(() => playTone(400, 150), 150);
    if (isBulk) {
      speak(`${name} added late`, 'success');
    } else {
      speak(`${name} marked late`);
    }
    vibrate([100, 50, 100]);
  };

  // =========================
  // 🔍 FETCH STUDENT DETAILS (with caching)
  // =========================
  const fetchStudentDetails = useCallback(async (studentId) => {
    // Check cache first
    const cached = getCachedStudent(studentId);
    if (cached) {
      console.log('📦 Cache hit for student:', studentId);
      return cached;
    }

    try {
      const response = await studentService.getById(studentId, instituteId, type);
      const student = response?.data || response;
      if (student) {
        const details = student.details?.studentDetails || student.studentDetails || {};
        const activeSession = details.academicSessions?.find(s => s.status === 'active') || {};
        const studentInfo = {
          id: student.id,
          name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          roll_no: activeSession.roll_no || details.roll_no || student.roll_no || 'N/A',
          class_name: activeSession.class_name || details.class_name || student.class_name || 'N/A',
          section_name: activeSession.section_name || details.section_name || student.section_name || 'N/A',
          registration_no: student.registration_no || 'N/A',
          avatar: student.avatar_url
        };
        setCachedStudent(studentId, studentInfo);
        return studentInfo;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      return null;
    }
  }, [instituteId, type]);

  // =========================
  // 🔥 SCAN HANDLER (optimized)
  // =========================
  const handleScan = useCallback(async (data) => {
    if (!data || loading || cooldownRef.current || isProcessingRef.current) {
      console.log('⏸️ Scan blocked');
      return;
    }

    isProcessingRef.current = true;
    cooldownRef.current = true;
    setLoading(true);
    setResult(null);
    setError('');
    setStudentDetails(null);

    try {
      const raw = data?.data || data;
      console.log('📱 Raw QR Data:', raw);

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }

      const studentId = parsed?.id || parsed;
      console.log('🎯 Student ID:', studentId);

      // Fetch student details (cached)
      const studentInfo = await fetchStudentDetails(studentId);
      setStudentDetails(studentInfo);

      // Determine if we're in queue mode (external handler)
      if (onScan) {
        console.log('📞 Calling external onScan handler (queue mode)...');
        const ok = await onScan(studentId);
        if (ok) {
          setResult({ success: true, message: `Added to queue`, student: studentInfo });
          successSound(studentInfo?.name || 'Student', bulkMode);
          if (onScanComplete) onScanComplete(true, studentId, studentInfo);
        } else {
          setResult({ success: false, message: 'Already in queue or invalid', student: studentInfo });
          errorSound('Already in queue');
          if (onScanComplete) onScanComplete(false, studentId, studentInfo);
        }
        return;
      }

      // Direct API call (instant attendance)
      console.log('📡 Calling API directly (instant mode)...');
      const res = await studentAttendanceService.scanQR({
        student_id: studentId,
        type: bulkMode ? 'bulk' : 'regular',
      });

      const status = res?.data?.status || 'present';
      setResult({
        success: true,
        message: `Attendance marked`,
        student: studentInfo,
        status: status
      });
      toast.success(`Attendance marked for ${studentInfo?.name || 'Student'}`);

      if (status === 'late') {
        lateSound(studentInfo?.name || 'Student', bulkMode);
      } else {
        successSound(studentInfo?.name || 'Student', bulkMode);
      }
      if (onScanComplete) onScanComplete(true, studentId, studentInfo);

    } catch (err) {
      console.error('❌ Scan Error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Scan failed';
      setResult({ success: false, message: errorMessage, student: studentDetails });
      setError(errorMessage);
      toast.error(errorMessage);
      errorSound(errorMessage);
      if (onScanComplete) onScanComplete(false, null, null, errorMessage);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
      setTimeout(() => {
        setResult(null);
        setError('');
        setTimeout(() => setStudentDetails(null), 500);
      }, 2000);
      setTimeout(() => { cooldownRef.current = false; }, 800);
    }
  }, [loading, onScan, onScanComplete, fetchStudentDetails, bulkMode, studentDetails]);

  // =========================
  // 🎹 EXTERNAL SCANNER (keyboard input)
  // =========================
  const startExternalScannerListener = useCallback(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing into an input/textarea
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // If Enter is pressed, process buffer
      if (e.key === 'Enter') {
        e.preventDefault();
        if (keyboardBufferRef.current.trim().length > 0) {
          const qrData = keyboardBufferRef.current.trim();
          console.log('📠 External scanner input:', qrData);
          handleScan({ data: qrData });
          keyboardBufferRef.current = '';
        }
        if (keyboardTimeoutRef.current) {
          clearTimeout(keyboardTimeoutRef.current);
          keyboardTimeoutRef.current = null;
        }
        return;
      }

      // Accumulate characters (ignore modifiers)
      if (e.key.length === 1 || e.key === ' ') {
        e.preventDefault();
        keyboardBufferRef.current += e.key;

        // Reset buffer after 500ms of inactivity (prevents mixing scans)
        if (keyboardTimeoutRef.current) clearTimeout(keyboardTimeoutRef.current);
        keyboardTimeoutRef.current = setTimeout(() => {
          console.log('⌨️ Keyboard buffer timeout, cleared:', keyboardBufferRef.current);
          keyboardBufferRef.current = '';
          keyboardTimeoutRef.current = null;
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScan]);

  // =========================
  // 📷 CAMERA SCANNER
  // =========================
  const startCameraScanner = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const scanner = new QrScanner(videoRef.current, handleScan, {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      });
      scannerRef.current = scanner;
      await scanner.start();
      console.log('✅ Camera QR Scanner started');
      setCameraAvailable(true);
      setError('');
    } catch (err) {
      console.error('Camera error:', err);
      setCameraAvailable(false);
      setError('Camera permission denied or not available');
      toast.error('Unable to access camera. Please check permissions.');
      
      // Auto fallback to external scanner if in auto mode
      if (preferredScanner === 'auto' && scannerMode !== 'external') {
        console.log('🔄 Camera failed, auto-switching to external scanner mode');
        setScannerMode('external');
      }
    }
  }, [handleScan, preferredScanner, scannerMode]);

  const stopCameraScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      console.log('🛑 Camera QR Scanner stopped');
    }
  }, []);

  // =========================
  // AUTO-DETECTION LOGIC
  // =========================
  useEffect(() => {
    if (preferredScanner !== 'auto') return;

    // Try camera first; if fails, fallback to external after a delay
    const timer = setTimeout(() => {
      if (!cameraAvailable && scannerMode !== 'external') {
        console.log('⏰ Auto fallback: camera not available, switching to external');
        setScannerMode('external');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [cameraAvailable, preferredScanner, scannerMode]);

  // =========================
  // SWITCH SCANNER MODE
  // =========================
  useEffect(() => {
    let cleanupExternal = null;

    if (scannerMode === 'camera') {
      if (window.removeExternalScannerListener) {
        window.removeExternalScannerListener();
        window.removeExternalScannerListener = null;
      }
      stopCameraScanner();
      startCameraScanner();
    } else if (scannerMode === 'external') {
      stopCameraScanner();
      if (window.removeExternalScannerListener) {
        window.removeExternalScannerListener();
      }
      cleanupExternal = startExternalScannerListener();
      window.removeExternalScannerListener = cleanupExternal;
    }

    return () => {
      if (scannerMode === 'camera') stopCameraScanner();
      if (scannerMode === 'external' && window.removeExternalScannerListener) {
        window.removeExternalScannerListener();
        window.removeExternalScannerListener = null;
      }
    };
  }, [scannerMode, startCameraScanner, stopCameraScanner, startExternalScannerListener]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
      if (window.removeExternalScannerListener) {
        window.removeExternalScannerListener();
      }
    };
  }, [stopCameraScanner]);

  // =========================
  // UI TOGGLE
  // =========================
  const toggleScannerMode = () => {
    setScannerMode(prev => prev === 'camera' ? 'external' : 'camera');
    setResult(null);
    setError('');
    setStudentDetails(null);
  };

  // Voice message based on bulkMode
  const getModeInstruction = () => {
    if (bulkMode) {
      return scannerMode === 'camera' 
        ? '📸 QR scan karein — Student queue mein add hoga (attendance nahi mark hogi)'
        : '🔌 USB scanner se QR scan karein — Queue mein add hoga';
    } else {
      return scannerMode === 'camera'
        ? '📸 QR scan karein — Attendance turant mark hogi'
        : '🔌 USB scanner se QR scan karein — Attendance turant mark hogi';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Mode Toggle Button */}
      {showScannerToggle && (
        <div className="flex gap-3">
          <button
            onClick={toggleScannerMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              scannerMode === 'camera'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera Mode
          </button>
          <button
            onClick={toggleScannerMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              scannerMode === 'external'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            External Scanner
          </button>
        </div>
      )}

      {/* Scanner View */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black border border-white/10">
        {scannerMode === 'camera' ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />
            {!cameraAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-red-400 text-center px-4">Camera not available. Switch to External Scanner mode.</p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-6 text-center">
            <Keyboard className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
            <h3 className="text-white text-lg font-bold">External Scanner Mode Active</h3>
            <p className="text-gray-400 text-sm mt-2">
              Use your USB barcode scanner to scan QR codes.<br />
              Scanner input will be processed automatically.
            </p>
            <div className="mt-4 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono">
              Ready
            </div>
          </div>
        )}

        {/* Overlay with Student Details */}
        {(loading || result || error || studentDetails) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10">
            {loading ? (
              <div className="text-center">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
                <p className="text-white text-sm mt-3">Fetching student details...</p>
              </div>
            ) : error ? (
              <div className="text-center max-w-[90%]">
                <XCircle className="h-10 w-10 text-red-500 mx-auto" />
                <p className="text-red-400 mt-2 text-sm font-medium">{error}</p>
              </div>
            ) : (result?.success || studentDetails) ? (
              <div className="text-center w-full max-w-sm px-4 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className={`h-12 w-12 ${result?.status === 'late' ? 'text-amber-500' : 'text-emerald-500'} mx-auto animate-bounce`} />
                {(studentDetails || result?.student) && (
                  <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/20">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white font-bold text-lg">
                          {studentDetails?.name || result?.student?.name || 'Student'}
                        </p>
                        <p className="text-emerald-400 text-xs font-mono">
                          ID: {(studentDetails?.id || result?.student?.id)?.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-bold">Roll No</p>
                          <p className="text-white text-sm font-semibold">
                            {studentDetails?.roll_no || result?.student?.roll_no || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-bold">Registration</p>
                          <p className="text-white text-sm font-semibold truncate">
                            {studentDetails?.registration_no || result?.student?.registration_no || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-bold">Class</p>
                          <p className="text-white text-sm font-semibold">
                            {studentDetails?.class_name || result?.student?.class_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-bold">Section</p>
                          <p className="text-white text-sm font-semibold">
                            {studentDetails?.section_name || result?.student?.section_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {result?.message && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className={`text-sm font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                          {result.message}
                        </p>
                        {result?.status === 'late' && (
                          <p className="text-amber-400 text-xs mt-1">⚠️ Marked as Late</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <XCircle className="h-12 w-12 text-yellow-500 mx-auto" />
                <p className="text-yellow-400 mt-2">{result?.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Scan Frame (only for camera mode) */}
        {scannerMode === 'camera' && cameraAvailable && (
          <>
            <div className="absolute inset-[20%] border-4 border-emerald-500 rounded-2xl pointer-events-none animate-pulse" />
            <div className="absolute top-[18%] left-[18%] w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
            <div className="absolute top-[18%] right-[18%] w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
            <div className="absolute bottom-[18%] left-[18%] w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
            <div className="absolute bottom-[18%] right-[18%] w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {getModeInstruction()}
      </p>
    </div>
  );
}