import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryLog {
    date: string;
    type: 'PROMOTION' | 'TEACHER_CHANGE' | 'NOTE';
    fromTeacherId: string | null;
    toTeacherId: string | null;
    comment: string;
}

export interface Student {
    id: string;
    name: string;
    parentPhone: string;
    parentName?: string;
    grade: string;
    currentTeacherId: string | null;
    birthDate?: string;
    gender?: '남' | '여';
    salvationDate?: string;
    address?: string;
    profileImage?: string;
    history: HistoryLog[];
}

export interface Teacher {
    id: string;
    name: string;
    phoneNumber?: string;
    assignedGrade?: string;
    assignedClass?: string;
    profileImage?: string;
}

interface StoreState {
    students: Student[];
    teachers: Teacher[];

    addStudent: (student: Omit<Student, 'id' | 'history'>) => void;
    updateStudent: (id: string, data: Partial<Student>) => void;
    addHistoryLog: (studentId: string, log: HistoryLog) => void;

    addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
    updateTeacher: (id: string, data: Partial<Teacher>) => void;
    deleteTeacher: (id: string) => void;
    deleteStudent: (id: string) => void;
    setAllData: (students: Student[], teachers: Teacher[]) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            students: [],
            teachers: [],

            setAllData: (students, teachers) =>
                set({
                    students,
                    teachers
                }),

            addStudent: (studentData) =>
                set((state) => ({
                    students: [
                        ...state.students,
                        {
                            ...studentData,
                            id: crypto.randomUUID(),
                            history: [],
                        },
                    ],
                })),

            updateStudent: (id, data) =>
                set((state) => ({
                    students: state.students.map((s) =>
                        s.id === id ? { ...s, ...data } : s
                    ),
                })),

            deleteStudent: (id) =>
                set((state) => ({
                    students: state.students.filter((s) => s.id !== id),
                })),

            addHistoryLog: (studentId, log) =>
                set((state) => ({
                    students: state.students.map((s) =>
                        s.id === studentId
                            ? { ...s, history: [log, ...s.history] }
                            : s
                    ),
                })),

            addTeacher: (teacherData) =>
                set((state) => ({
                    teachers: [
                        ...state.teachers,
                        {
                            ...teacherData,
                            id: crypto.randomUUID(),
                        },
                    ],
                })),

            updateTeacher: (id, data) =>
                set((state) => ({
                    teachers: state.teachers.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                })),

            deleteTeacher: (id) =>
                set((state) => ({
                    teachers: state.teachers.filter((t) => t.id !== id),
                })),
        }),
        {
            name: 'sms-storage',
        }
    )
);
