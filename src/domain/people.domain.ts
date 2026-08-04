export type UserRole = 'TEACHER' | 'PRINCIPAL' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: 'STUDENT';
  classroomId: string;
  parentContact?: string;
}

export interface Teacher extends User {
  role: 'TEACHER' | 'PRINCIPAL';
  assignedClassroomIds: string[];
}