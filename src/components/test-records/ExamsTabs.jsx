'use client';

import { ClipboardList, GraduationCap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Two-tab shell used by every Exams page: "Test Records" (default) and "Exams".
 * Both panels stay mounted-on-demand (Radix unmounts inactive content), so the existing Exams page is untouched.
 */
export default function ExamsTabs({ testRecords, exams, examsLabel = 'Exams' }) {
  return (
    <Tabs defaultValue="test-records" className="w-full">
      <TabsList className="mb-4 h-11 w-full justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:w-auto">
        <TabsTrigger
          value="test-records"
          className="gap-2 rounded-lg px-4 font-bold data-[state=active]:bg-tca-primary data-[state=active]:text-white"
        >
          <ClipboardList className="h-4 w-4" /> Test Records
        </TabsTrigger>
        <TabsTrigger
          value="exams"
          className="gap-2 rounded-lg px-4 font-bold data-[state=active]:bg-tca-primary data-[state=active]:text-white"
        >
          <GraduationCap className="h-4 w-4" /> {examsLabel}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="test-records" className="mt-0">
        {testRecords}
      </TabsContent>
      <TabsContent value="exams" className="mt-0">
        {exams}
      </TabsContent>
    </Tabs>
  );
}
