import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class ClassesPage extends BasePage {
  constructor(page) {
    super(page);
    this.addClassBtn = page.locator('button:has-text("Add Class"), button:has-text("New Class")');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/classes`);
  }

  async navigateSections(type = 'school') {
    await this.goto(`/${type}/sections`);
  }
}

export class ExamsPage extends BasePage {
  constructor(page) {
    super(page);
    this.createExamBtn = page.locator('button:has-text("Create Exam"), button:has-text("Add Exam")');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/exams`);
  }
}

export class TimetablePage extends BasePage {
  constructor(page) {
    super(page);
    this.addSlotBtn = page.locator('button:has-text("Add Slot"), button:has-text("New Slot")');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/timetable`);
  }
}

export class NoticesPage extends BasePage {
  constructor(page) {
    super(page);
    this.createNoticeBtn = page.locator('button:has-text("Create Notice"), button:has-text("New Notice"), button:has-text("Add Notice")');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/notices`);
  }

  async navigateEvents(type = 'school') {
    await this.goto(`/${type}/events`);
  }
}

export class AdmissionsPage extends BasePage {
  constructor(page) {
    super(page);
    this.newAdmissionBtn = page.locator('button:has-text("New Admission"), button:has-text("Add Admission")');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/admissions`);
  }
}
