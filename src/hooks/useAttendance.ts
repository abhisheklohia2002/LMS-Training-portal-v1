import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export type Attendance = {
  attendance_id: number;
  session_id: number;
  user_id: number;
  status: "present" | "absent" | "late" | "excused";
  check_in_time?: string;
  check_out_time?: string;
  duration_minutes?: number;
  attendance_source?: "manual" | "qr" | "geo" | "auto";
  remarks?: string;
};

export type AttendanceSummary = {
  course_id: number;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
  sessions: {
    session_id: number;
    session_title: string;
    start_time: string;
    attendance_status: "present" | "absent" | "late" | "excused" | "pending";
  }[];
};
export type MarkAttendancePayload = {
  user_id: number;
  marked_by_user_id?: number;
  status: "present" | "absent" | "late" | "excused";
  check_in_time?: string;
  check_out_time?: string;
  attendance_source?: "manual" | "qr" | "geo" | "auto";
  remarks?: string;
};
export function useAttendanceByUser(userId?: number) {
  return useQuery({
    queryKey: ["attendance", "user", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      return api.attendance.byUser(userId!);
    },
  });
}

export function useAttendanceSummary(userId?: number, courseId?: number) {
  return useQuery({
    queryKey: ["attendance-summary", userId, courseId],
    enabled: Boolean(userId && courseId),
    queryFn: async () => {
      return api.attendance.summaryByCourse(userId!, courseId!);
    },
  });
}
export function useMark() {
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: MarkAttendancePayload;
    }) => api.attendance.mark(sessionId, payload),

    onSuccess: (_data, variables) => {
      // queryClient.invalidateQueries({
      //   queryKey: ["attendance", "user", variables.payload.user_id],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["attendance-summary"],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["attendance", "session", variables.sessionId],
      // });
    },
  });
}
