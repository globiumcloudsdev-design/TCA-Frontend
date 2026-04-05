
// //src/app/(institute)/layout.js
/**
 * (institute) route group — shared layout for all institute types
 * Handles: /school/*, /coaching/*, /academy/*, /college/*, /university/*
 *
 * This layout:
 *  1. Verifies access_token (redirect to /login if missing)
*  2. Checks user type from cookies
/**
 * (institute) route group — shared layout for all institute types
 * Handles: /school/*, /coaching/*, /academy/*, /college/*, /university/*
 *
 * This layout:
 *  1. Verifies access_token (redirect to /login if missing)
 *  2. Checks user type from cookies
 *  3. Redirects to correct portal if mismatch
 */
// ✅ FINAL CLEAN VERSION
import InstituteLayoutWrapper from '@/components/layout/InstituteLayoutWrapper';

export default function InstituteGroupLayout({ children }) {
  return <InstituteLayoutWrapper>{children}</InstituteLayoutWrapper>;
}