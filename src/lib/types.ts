export type SlotType = 'Theory' | 'Lab';

export interface TimeSlot {
  day: string; // e.g., "Monday"
  period: number; // 1-indexed period number
}

// Simple string identifier for days to keep it easy
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: SlotType;
  credits: number; // or hours per week
  requiredBatches: string[]; // Batches that take this subject
}

export interface Teacher {
  id: string;
  name: string;
  department: string;
  qualifiedSubjects: string[]; // Subject IDs
  maxLoadPerDay: number;
  maxLoadPerWeek: number;
  preferredSlots?: TimeSlot[];
  unavailableSlots?: TimeSlot[];
  isAbsent?: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: SlotType; // Lab or Regular Classroom
}

export interface Batch {
  id: string;
  name: string; // e.g., "CSE-A-2025"
  size: number;
  department: string;
}

export interface ScheduleEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  batchIds: string[];
  day: string;
  period: number;
}

export interface SchedulerConfig {
  slotsPerDay: number;
  daysPerWeek: string[];
}
