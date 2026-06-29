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

type AttendanceByUserResponse =
  | Attendance[]
  | {
      data?: Attendance[];
      attendances?: Attendance[];
    };

export function useAttendanceByUser(userId?: number) {
  return useQuery<Attendance[]>({
    queryKey: ["attendance", "user", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = (await api.attendance.byUser(
        userId!,
      )) as AttendanceByUserResponse;

      if (Array.isArray(response)) {
        return response;
      }

      return response.data ?? response.attendances ?? [];
    },
  });
}



type AttendanceSummaryResponse =
  | AttendanceSummary
  | {
      data?: AttendanceSummary;
      summary?: AttendanceSummary;
    };

export function useAttendanceSummary(userId?: number, courseId?: number) {
  return useQuery<AttendanceSummary>({
    queryKey: ["attendance-summary", userId, courseId],
    enabled: Boolean(userId && courseId),
    queryFn: async () => {
      const response = (await api.attendance.summaryByCourse(
        userId!,
        courseId!,
      )) as AttendanceSummaryResponse;

      if ("course_id" in response) {
        return response;
      }

      return response.data ?? response.summary ?? {
        course_id: courseId!,
        total_sessions: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendance_percentage: 0,
        sessions: [],
      };
    },
  });
}

export function useMark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: MarkAttendancePayload;
    }) => api.attendance.mark(sessionId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", "user", variables.payload.user_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance-summary", variables.payload.user_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendances"],
      });
    },
  });
}


