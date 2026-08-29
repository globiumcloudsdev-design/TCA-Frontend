import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class TeacherPortalPage extends BasePage {
  constructor(page) {
    super(page);
    this.classesLink = page.locator('a[href="/teacher/classes"]');
    this.studentsLink = page.locator('a[href="/teacher/students"]');
    this.attendanceLink = page.locator('a[href="/teacher/attendance"]');
    this.homeworkLink = page.locator('a[href="/teacher/homework"]');
    this.assignmentsLink = page.locator('a[href="/teacher/assignments"]');
    this.notesLink = page.locator('a[href="/teacher/notes"]');
    this.examsLink = page.locator('a[href="/teacher/exams"]');
    this.createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
  }

  async navigateDashboard() {
    await this.goto('/teacher');
  }

  async navigateClasses() {
    await this.goto('/teacher/classes');
  }

  async navigateStudents() {
    await this.goto('/teacher/students');
  }

  async navigateAttendance() {
    await this.goto('/teacher/attendance');
  }

  async navigateHomework() {
    await this.goto('/teacher/homework');
  }

  async navigateAssignments() {
    await this.goto('/teacher/assignments');
  }

  async navigateNotes() {
    await this.goto('/teacher/notes');
  }

  async navigateExams() {
    await this.goto('/teacher/exams');
  }
}

export class StudentPortalPage extends BasePage {
  constructor(page) {
    super(page);
    this.attendanceLink = page.locator('a[href="/student/attendance"]');
    this.feesLink = page.locator('a[href="/student/fees"]');
    this.examsLink = page.locator('a[href="/student/exams"]');
    this.timetableLink = page.locator('a[href="/student/timetable"]');
    this.homeworkLink = page.locator('a[href="/student/homework"]');
    this.assignmentsLink = page.locator('a[href="/student/assignments"]');
    this.notesLink = page.locator('a[href="/student/notes"]');
    this.announcementsLink = page.locator('a[href="/student/announcements"]');
  }

  async navigateDashboard() {
    await this.goto('/student');
  }

  async navigateAttendance() {
    await this.goto('/student/attendance');
  }

  async navigateFees() {
    await this.goto('/student/fees');
  }

  async navigateExams() {
    await this.goto('/student/exams');
  }

  async navigateTimetable() {
    await this.goto('/student/timetable');
  }

  async navigateHomework() {
    await this.goto('/student/homework');
  }

  async navigateAssignments() {
    await this.goto('/student/assignments');
  }

  async navigateNotes() {
    await this.goto('/student/notes');
  }
}

export class ParentPortalPage extends BasePage {
  constructor(page) {
    super(page);
    this.childAttendanceLink = page.locator('a[href="/parent/attendance"]');
    this.childFeesLink = page.locator('a[href="/parent/fees"]');
    this.childResultsLink = page.locator('a[href="/parent/results"]');
    this.announcementsLink = page.locator('a[href="/parent/announcements"]');
  }

  async navigateDashboard() {
    await this.goto('/parent');
  }

  async navigateAttendance() {
    await this.goto('/parent/attendance');
  }

  async navigateFees() {
    await this.goto('/parent/fees');
  }

  async navigateResults() {
    await this.goto('/parent/results');
  }

  async navigateAnnouncements() {
    await this.goto('/parent/announcements');
  }
}
