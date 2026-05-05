import { create } from 'zustand';

export const useCourseStore = create((set) => ({
  courses: [],
  enrollments: [],
  loading: false,

  setCourses: (courses) => set({ courses: Array.isArray(courses) ? courses : [] }),
  setEnrollments: (enrollments) => set({ enrollments: Array.isArray(enrollments) ? enrollments : [] }),
  setLoading: (loading) => set({ loading }),
}));
