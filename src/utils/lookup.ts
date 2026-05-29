import type { Course, Role, User } from '../types';
export const findRole = (roles: Role[] | undefined, id: number) => roles?.find(r => r.role_id === id);
export const findUser = (users: User[] | undefined, id: number) => users?.find(u => u.user_id === id);
export const findCourse = (courses: Course[] | undefined, id: number) => courses?.find(c => c.course_id === id);
