import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import dayjs from "dayjs";
import type {
  Assessment,
  AssessmentAttempt,
  AssessmentQuestion,
  AssessmentQuestionOption,
  AssessmentRule,
  SubmitAssessmentPayload,
  CertificateIssue,
  Certification,
  CertificationRule,
  Course,
  Module,
  ModuleProgress,
  Notification,
  Role,
  TrainingAssignment,
  TrainingMapping,
  User,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";
const DEFAULT_PASSWORD =
  import.meta.env.VITE_DEFAULT_USER_PASSWORD || "12345678";

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type ApiEnvelope<T> =
  | T
  | { data?: T; user?: T; message?: string; count?: number };

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => {
  const body = response.data as any;
  if (body && typeof body === "object" && "data" in body) return body.data as T;
  if (body && typeof body === "object" && "user" in body) return body.user as T;
  return body as T;
};

const listify = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const isNotFound = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

const requestFirst = async <T>(configs: AxiosRequestConfig[]): Promise<T> => {
  let lastError: unknown;
  for (const config of configs) {
    try {
      const response = await http.request<ApiEnvelope<T>>(config);
      return unwrap<T>(response);
    } catch (error) {
      lastError = error;
      if (!isNotFound(error)) break;
    }
  }
  throw lastError;
};

const toIsoDateTime = (value?: string | null) => {
  if (!value) return value;
  if (value.includes("T")) return value;
  return `${value}T00:00:00Z`;
};

const normalizeRole = (role: any): Role => ({
  role_id: Number(role?.role_id ?? role?.id ?? 0),
  role_name: role?.role_name ?? role?.roleName ?? "",
  role_type: role?.role_type ?? role?.roleType ?? "",
  description: role?.description ?? "",
});

const normalizeUser = (user: any): User => ({
  user_id: Number(user?.user_id ?? user?.id ?? 0),
  full_name: user?.full_name ?? user?.name ?? user?.FullName ?? "",
  email: user?.email ?? "",
  employee_code: user?.employee_code ?? user?.employeeCode ?? "",
  joining_date: user?.joining_date ?? user?.joiningDate ?? "",
  status: user?.status ?? "active",
  manager_id: user?.manager_id ?? user?.managerID ?? null,
  role_id: Number(
    user?.role_id ?? user?.roleID ?? user?.role?.role_id ?? user?.role?.id ?? 0,
  ),
});

const normalizeCourse = (course: any): Course => ({
  course_id: Number(course?.course_id ?? course?.id ?? 0),
  course_title: course?.course_title ?? course?.courseTitle ?? "",
  course_description:
    course?.course_description ?? course?.courseDescription ?? "",
  course_type: course?.course_type ?? course?.courseType ?? "",
  created_by_user_id: Number(
    course?.created_by_user_id ?? course?.createdByUserID ?? 0,
  ),
  is_active: Boolean(course?.is_active ?? course?.isActive ?? true),
  created_at: course?.created_at ?? course?.createdAt ?? "",
});

const normalizeModule = (mod: any): Module => ({
  module_id: Number(mod?.module_id ?? mod?.id ?? 0),
  course_id: Number(mod?.course_id ?? mod?.courseID ?? 0),
  module_title: mod?.module_title ?? mod?.moduleTitle ?? "",
  module_description: mod?.module_description ?? mod?.moduleDescription ?? "",
  sequence_no: Number(mod?.sequence_no ?? mod?.sequenceNo ?? 0),
  due_days: Number(mod?.due_days ?? mod?.dueDays ?? 0),
  is_active: Boolean(mod?.is_active ?? mod?.isActive ?? true),
});

const normalizeMapping = (row: any): TrainingMapping => ({
  mapping_id: Number(row?.mapping_id ?? row?.id ?? 0),
  role_id: Number(row?.role_id ?? row?.roleID ?? 0),
  course_id: Number(row?.course_id ?? row?.courseID ?? 0),
  is_mandatory: Boolean(row?.is_mandatory ?? row?.isMandatory ?? false),
  assignment_trigger:
    row?.assignment_trigger ?? row?.assignmentTrigger ?? "manual",
  active_flag: Boolean(row?.active_flag ?? row?.activeFlag ?? true),
});

const normalizeAssignment = (row: any): TrainingAssignment => ({
  assignment_id: Number(row?.assignment_id ?? row?.id ?? 0),
  user_id: Number(row?.user_id ?? row?.userID ?? 0),
  course_id: Number(row?.course_id ?? row?.courseID ?? 0),
  assigned_by_user_id: Number(
    row?.assigned_by_user_id ?? row?.assignedByUserID ?? 0,
  ),
  assignment_source:
    row?.assignment_source ?? row?.assignmentSource ?? "manual",
  is_mandatory: Boolean(row?.is_mandatory ?? row?.isMandatory ?? false),
  assigned_date: row?.assigned_date ?? row?.assignedDate ?? "",
  due_date: row?.due_date ?? row?.dueDate ?? null,
  completion_date: row?.completion_date ?? row?.completionDate ?? null,
  status: row?.status ?? "assigned",
  improvement_status: row?.improvement_status ?? row?.improvementStatus ?? "",
});

const normalizeProgress = (row: any): ModuleProgress => ({
  id: Number(row?.id ?? row?.module_progress_id ?? 0),
  assignment_id: Number(row?.assignment_id ?? row?.assignmentID ?? 0),
  module_id: Number(row?.module_id ?? row?.moduleID ?? 0),
  user_id: Number(row?.user_id ?? row?.userID ?? 0),
  status: row?.status ?? "pending",
  started_at: row?.started_at ?? row?.startedAt ?? null,
  completed_at: row?.completed_at ?? row?.completedAt ?? null,
});

const normalizeAssessmentRule = (row: any): AssessmentRule => ({
  assessment_rule_id: Number(row?.assessment_rule_id ?? row?.id ?? 0),
  max_attempts: Number(row?.max_attempts ?? row?.maxAttempts ?? 1),
  passing_score: Number(row?.passing_score ?? row?.passingScore ?? 0),
  retake_allowed: Boolean(row?.retake_allowed ?? row?.retakeAllowed ?? false),
  evaluation_method: row?.evaluation_method ?? row?.evaluationMethod ?? "score",
});

const normalizeAssessment = (row: any): Assessment => ({
  assessment_id: Number(row?.assessment_id ?? row?.id ?? 0),
  course_id: Number(row?.course_id ?? row?.courseID ?? 0),
  module_id: row?.module_id ?? row?.moduleID ?? null,
  assessment_title: row?.assessment_title ?? row?.assessmentTitle ?? "",
  assessment_type: row?.assessment_type ?? row?.assessmentType ?? "",
  max_score: Number(row?.max_score ?? row?.maxScore ?? 0),
  passing_score: Number(
    row?.passing_score ?? row?.passingScore ?? row?.rule?.passing_score ?? 0,
  ),
  rule_id: row?.rule_id ?? row?.ruleID ?? null,
  is_active: Boolean(row?.is_active ?? row?.isActive ?? true),
});

const normalizeQuestionOption = (row: any): AssessmentQuestionOption => ({
  option_id: Number(row?.option_id ?? row?.id ?? 0),
  question_id: Number(row?.question_id ?? row?.questionID ?? 0),
  option_text: row?.option_text ?? row?.optionText ?? "",
  is_correct: Boolean(row?.is_correct ?? row?.isCorrect ?? false),
});

const normalizeQuestion = (row: any): AssessmentQuestion => ({
  question_id: Number(row?.question_id ?? row?.id ?? 0),
  assessment_id: Number(row?.assessment_id ?? row?.assessmentID ?? 0),
  question_text: row?.question_text ?? row?.questionText ?? "",
  question_type: row?.question_type ?? row?.questionType ?? "single_choice",
  marks: Number(row?.marks ?? 1),
  sequence_no: Number(row?.sequence_no ?? row?.sequenceNo ?? 0),
  is_active: Boolean(row?.is_active ?? row?.isActive ?? true),
  options: listify<any>(row?.options ?? row?.Options ?? []).map(
    normalizeQuestionOption,
  ),
});

const normalizeAttempt = (row: any): AssessmentAttempt => ({
  attempt_id: Number(row?.attempt_id ?? row?.id ?? 0),
  assessment_id: Number(row?.assessment_id ?? row?.assessmentID ?? 0),
  user_id: Number(row?.user_id ?? row?.userID ?? 0),
  attempt_no: Number(row?.attempt_no ?? row?.attemptNo ?? 1),
  score_obtained: Number(row?.score_obtained ?? row?.scoreObtained ?? 0),
  result_status: row?.result_status ?? row?.resultStatus ?? "failed",
  attempted_at: row?.attempted_at ?? row?.attemptedAt ?? "",
});

const normalizeCertificationRule = (row: any): CertificationRule => ({
  certification_rule_id: Number(row?.certification_rule_id ?? row?.id ?? 0),
  issue_on_course_completion: Boolean(
    row?.issue_on_course_completion ?? row?.issueOnCourseCompletion ?? true,
  ),
  minimum_score_required: Number(
    row?.minimum_score_required ?? row?.minimumScoreRequired ?? 0,
  ),
  validity_days: Number(row?.validity_days ?? row?.validityDays ?? 0),
  renewal_required: Boolean(
    row?.renewal_required ?? row?.renewalRequired ?? false,
  ),
});

const normalizeCertification = (row: any): Certification => ({
  certification_id: Number(row?.certification_id ?? row?.id ?? 0),
  course_id: Number(row?.course_id ?? row?.courseID ?? 0),
  certification_name: row?.certification_name ?? row?.certificationName ?? "",
  validity_days: Number(
    row?.validity_days ?? row?.validityDays ?? row?.rule?.validity_days ?? 0,
  ),
  rule_id: row?.rule_id ?? row?.ruleID ?? null,
  is_active: Boolean(row?.is_active ?? row?.isActive ?? true),
});

const normalizeCertificateIssue = (row: any): CertificateIssue => ({
  certificate_issue_id: Number(row?.certificate_issue_id ?? row?.id ?? 0),
  certification_id: Number(row?.certification_id ?? row?.certificationID ?? 0),
  user_id: Number(row?.user_id ?? row?.userID ?? 0),
  issued_on: row?.issued_on ?? row?.issuedOn ?? "",
  expiry_date: row?.expiry_date ?? row?.expiryDate ?? "",
  certificate_number: row?.certificate_number ?? row?.certificateNumber ?? "",
  issue_status: row?.issue_status ?? row?.issueStatus ?? "issued",
  pdf_path: row?.pdf_path ?? row?.PDFPath ?? "",
});

const normalizeNotification = (row: any): Notification => ({
  notification_id: Number(row?.notification_id ?? row?.id ?? 0),
  user_id: Number(row?.user_id ?? row?.userID ?? 0),
  assignment_id: row?.assignment_id ?? row?.assignmentID ?? null,
  certificate_issue_id:
    row?.certificate_issue_id ?? row?.certificateIssueID ?? null,
  notification_type: row?.notification_type ?? row?.notificationType ?? "",
  message: row?.message ?? "",
  target_audience: row?.target_audience ?? row?.targetAudience ?? "",
  sent_at: row?.sent_at ?? row?.sentAt ?? "",
  read_status: Boolean(row?.read_status ?? row?.readStatus ?? false),
});

const currentUserRole = async () => {
  try {
    const self = await api.auth.me();
    return self.role.role_name;
  } catch {
    return "employee";
  }
};

export const api = {
  auth: {
    login: async (payload: string | { email: string; password: string }) => {
      const credentials =
        typeof payload === "string"
          ? {
              email:
                payload === "admin"
                  ? "admin@test.com"
                  : payload === "manager"
                    ? "manager@test.com"
                    : "david@test.com",
              password: DEFAULT_PASSWORD,
            }
          : payload;

      const raw = await requestFirst<any>([
        { method: "POST", url: "/api/auth/login", data: credentials },
      ]);

      const userRaw = raw?.user ?? raw;
      const user = normalizeUser(userRaw);
      if (user.user_id)
        localStorage.setItem("lms_user_id", String(user.user_id));
      let role = normalizeRole(
        userRaw?.role ?? raw?.role ?? { role_name: userRaw?.role_name ?? "" },
      );
      if (!role.role_name) {
        try {
          const selfRaw = await requestFirst<any>([
            { method: "GET", url: "/api/auth/self" },
          ]);
          const selfUserRaw = selfRaw?.user ?? selfRaw;
          role = normalizeRole(
            selfUserRaw?.role && typeof selfUserRaw.role === "object"
              ? selfUserRaw.role
              : { role_name: selfUserRaw?.role },
          );
        } catch {
          /* keep empty role if backend self is unavailable */
        }
      }
      if (role.role_name)
        localStorage.setItem("lms_role", String(role.role_name));
      return { user, role };
    },
    me: async () => {
      const raw = await requestFirst<any>([
        { method: "GET", url: "/api/auth/self" },
      ]);
      const userRaw = raw?.user ?? raw;
      const user = normalizeUser(userRaw);
      if (user.user_id)
        localStorage.setItem("lms_user_id", String(user.user_id));
      const role = normalizeRole(
        userRaw?.role && typeof userRaw.role === "object"
          ? userRaw.role
          : { role_name: userRaw?.role },
      );
      if (role.role_name)
        localStorage.setItem("lms_role", String(role.role_name));
      return { user, role };
    },
    logout: async () => {
      try {
        await http.post("/api/auth/logout");
      } catch {
        /* backend logout route is optional */
      }
      localStorage.removeItem("lms_user_id");
      localStorage.removeItem("lms_role");
      return true;
    },
  },

  roles: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([{ method: "GET", url: "/api/roles" }]),
      ).map(normalizeRole),
    create: async (payload: Partial<Role>) =>
      normalizeRole(
        await requestFirst<any>([
          { method: "POST", url: "/api/roles", data: payload },
        ]),
      ),
    update: async (id: number, payload: Partial<Role>) =>
      normalizeRole(
        await requestFirst<any>([
          { method: "PUT", url: `/api/roles/${id}`, data: payload },
        ]),
      ),
  },

  users: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/auth/users" },
          { method: "GET", url: "/api/users" },
        ]),
      ).map(normalizeUser),
    get: async (id: number) =>
      normalizeUser(
        await requestFirst<any>([
          { method: "GET", url: `/api/auth/users/${id}` },
          { method: "GET", url: `/api/users/${id}` },
        ]),
      ),
    create: async (payload: Partial<User> & { password?: string }) => {
      const body = {
        name: payload.full_name,
        email: payload.email,
        password: payload.password || DEFAULT_PASSWORD,
        employee_code: payload.employee_code,
        role_id: payload.role_id,
        manager_id: payload.manager_id ?? null,
        status: payload.status ?? "active",
      };
      const raw = await requestFirst<any>([
        { method: "POST", url: "/api/auth/create", data: body },
        { method: "POST", url: "/api/auth/register", data: body },
        { method: "POST", url: "/api/users", data: body },
      ]);
      return normalizeUser(raw?.user ?? raw);
    },
    update: async (id: number, payload: Partial<User>) => {
      const body = { ...payload, name: payload.full_name };
      const raw = await requestFirst<any>([
        { method: "PUT", url: `/api/auth/users/${id}`, data: body },
        { method: "PUT", url: `/api/users/${id}`, data: body },
      ]);
      return normalizeUser(raw?.user ?? raw);
    },
  },

  courses: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([{ method: "GET", url: "/api/courses" }]),
      ).map(normalizeCourse),
    get: async (id: number) =>
      normalizeCourse(
        await requestFirst<any>([{ method: "GET", url: `/api/courses/${id}` }]),
      ),
    create: async (payload: Partial<Course>) =>
      normalizeCourse(
        await requestFirst<any>([
          { method: "POST", url: "/api/courses", data: payload },
        ]),
      ),
    update: async (id: number, payload: Partial<Course>) =>
      normalizeCourse(
        await requestFirst<any>([
          { method: "PUT", url: `/api/courses/${id}`, data: payload },
        ]),
      ),
  },

  modules: {
    list: async (courseId?: number) => {
      const raw = await requestFirst<any[]>(
        courseId
          ? [
              { method: "GET", url: `/api/modules/course/${courseId}` },
              {
                method: "GET",
                url: "/api/modules",
                params: { course_id: courseId },
              },
            ]
          : [{ method: "GET", url: "/api/modules" }],
      );
      return listify<any>(raw).map(normalizeModule);
    },
    create: async (payload: Partial<Module>) =>
      normalizeModule(
        await requestFirst<any>([
          {
            method: "POST",
            url: "/api/modules",
            data: {
              ...payload,
              course_id: Number(payload.course_id),
              sequence_no: Number(payload.sequence_no),
              due_days: Number(payload.due_days),
              is_active: Boolean(payload.is_active),
            },
          },
        ]),
      ),
  },

  mappings: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/training-mappings" },
        ]),
      ).map(normalizeMapping),
    create: async (payload: Partial<TrainingMapping>) =>
      normalizeMapping(
        await requestFirst<any>([
          { method: "POST", url: "/api/training-mappings", data: payload },
        ]),
      ),
  },

  assignments: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/training-assignments" },
        ]),
      ).map(normalizeAssignment),
    listByUser: async (userId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: `/api/training-assignments/user/${userId}` },
        ]),
      ).map(normalizeAssignment),
    get: async (id: number) =>
      normalizeAssignment(
        await requestFirst<any>([
          { method: "GET", url: `/api/training-assignments/${id}` },
        ]),
      ),
    create: async (payload: Partial<TrainingAssignment>) => {
      const body = { ...payload, due_date: toIsoDateTime(payload.due_date) };
      return normalizeAssignment(
        await requestFirst<any>([
          {
            method: "POST",
            url: "/api/training-assignments/manual",
            data: body,
          },
        ]),
      );
    },
    autoAssign: async (payload: {
      user_id: number;
      assigned_by_user_id: number;
    }) =>
      listify<any>(
        await requestFirst<any[]>([
          {
            method: "POST",
            url: "/api/training-assignments/auto",
            data: payload,
          },
        ]),
      ).map(normalizeAssignment),
    updateStatus: async (id: number, status: TrainingAssignment["status"]) =>
      normalizeAssignment(
        await requestFirst<any>([
          {
            method: "PATCH",
            url: `/api/training-assignments/${id}/status`,
            data: { status },
          },
        ]),
      ),
  },

  moduleProgress: {
    byAssignment: async (assignmentId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          {
            method: "GET",
            url: `/api/module-progress/assignment/${assignmentId}`,
          },
        ]),
      ).map(normalizeProgress),
    complete: async (id: number) =>
      normalizeProgress(
        await requestFirst<any>([
          {
            method: "PATCH",
            url: `/api/module-progress/${id}/status`,
            data: { status: "completed" },
          },
        ]),
      ),
  },

  assessments: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([{ method: "GET", url: "/api/assessments" }]),
      ).map(normalizeAssessment),
    byCourse: async (courseId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: `/api/assessments/course/${courseId}` },
        ]),
      ).map(normalizeAssessment),
    byModule: async (moduleId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: `/api/assessments/module/${moduleId}` },
        ]),
      ).map(normalizeAssessment),
    create: async (payload: Partial<Assessment>) =>
      normalizeAssessment(
        await requestFirst<any>([
          { method: "POST", url: "/api/assessments", data: payload },
        ]),
      ),
  },

  assessmentQuestions: {
    byAssessment: async (assessmentId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          {
            method: "GET",
            url: `/api/assessment-questions/assessment/${assessmentId}`,
          },
        ]),
      ).map(normalizeQuestion),
    learnerByAssessment: async (assessmentId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          {
            method: "GET",
            url: `/api/assessment-questions/assessment/${assessmentId}/learner`,
          },
        ]),
      ).map(normalizeQuestion),
    create: async (
      payload: Omit<Partial<AssessmentQuestion>, "options"> & {
        options?: Partial<AssessmentQuestionOption>[];
      },
    ) =>
      normalizeQuestion(
        await requestFirst<any>([
          { method: "POST", url: "/api/assessment-questions", data: payload },
        ]),
      ),
    delete: async (id: number) =>
      requestFirst<any>([
        { method: "DELETE", url: `/api/assessment-questions/${id}` },
      ]),
  },

  assessmentAttempts: {
    list: async () => {
      try {
        return listify<any>(
          await requestFirst<any[]>([
            { method: "GET", url: "/api/assessment-attempts" },
          ]),
        ).map(normalizeAttempt);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 403 || error.response?.status === 404)
        ) {
          const me = await api.auth.me();
          return api.assessmentAttempts.byUser(me.user.user_id);
        }
        throw error;
      }
    },
    byUser: async (userId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: `/api/assessment-attempts/user/${userId}` },
        ]),
      ).map(normalizeAttempt),
    byAssessment: async (assessmentId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          {
            method: "GET",
            url: `/api/assessment-attempts/assessment/${assessmentId}`,
          },
        ]),
      ).map(normalizeAttempt),
    byUserAndAssessment: async (userId: number, assessmentId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          {
            method: "GET",
            url: `/api/assessment-attempts/user/${userId}/assessment/${assessmentId}`,
          },
        ]),
      ).map(normalizeAttempt),
    submit: async (
      payload:
        | SubmitAssessmentPayload
        | { assessment_id: number; user_id: number; score_obtained?: number },
    ) => {
      if ("answers" in payload) {
        return normalizeAttempt(
          await requestFirst<any>([
            {
              method: "POST",
              url: "/api/assessment-attempts/submit",
              data: payload,
            },
          ]),
        );
      }
      const score =
        payload.score_obtained ?? Math.floor(65 + Math.random() * 30);
      return normalizeAttempt(
        await requestFirst<any>([
          {
            method: "POST",
            url: "/api/assessment-attempts",
            data: { ...payload, score_obtained: score },
          },
        ]),
      );
    },
  },

  rules: {
    assignment: async () => {
      try {
        return await requestFirst<any[]>([
          { method: "GET", url: "/api/assignment-rules" },
        ]);
      } catch (error) {
        if (isNotFound(error)) return [];
        throw error;
      }
    },
    assessment: async () => api.assessmentRules.list(),
    certification: async () => api.certificationRules.list(),
  },

  certificationRules: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/certification-rules" },
        ]),
      ),

    create: async (payload: any) =>
      unwrap(
        await http.post("/api/certification-rules", {
          ...payload,
          minimum_score_required: Number(payload.minimum_score_required),
          validity_days: Number(payload.validity_days),
        }),
      ),

    update: async (id: number, payload: any) =>
      unwrap(
        await http.put(`/api/certification-rules/${id}`, {
          ...payload,
          minimum_score_required:
            payload.minimum_score_required !== undefined
              ? Number(payload.minimum_score_required)
              : undefined,
          validity_days:
            payload.validity_days !== undefined
              ? Number(payload.validity_days)
              : undefined,
        }),
      ),

    delete: async (id: number) =>
      unwrap(await http.delete(`/api/certification-rules/${id}`)),
  },

  certifications: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/certifications" },
        ]),
      ).map(normalizeCertification),
    byCourse: async (courseId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: `/api/certifications/course/${courseId}` },
        ]),
      ).map(normalizeCertification),
    create: async (payload: Partial<Certification>) =>
      normalizeCertification(
        await requestFirst<any>([
          { method: "POST", url: "/api/certifications", data: payload },
        ]),
      ),
  },

  certificateIssues: {
    list: async () => {
      try {
        return listify<any>(
          await requestFirst<any[]>([
            { method: "GET", url: "/api/certificate-issues" },
          ]),
        ).map(normalizeCertificateIssue);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 403 || error.response?.status === 404)
        ) {
          const me = await api.auth.me();
          return api.certificateIssues.byUser(me.user.user_id);
        }
        throw error;
      }
    },
    byUser: async (userId: number) =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: `/api/certificate-issues/user/${userId}` },
        ]),
      ).map(normalizeCertificateIssue),
    issue: async (payload: {
      user_id: number;
      certification_id: number;
      training_assignment_id?: number;
    }) => {
      let trainingAssignmentId = payload.training_assignment_id;
      if (!trainingAssignmentId) {
        const cert = normalizeCertification(
          await requestFirst<any>([
            {
              method: "GET",
              url: `/api/certifications/${payload.certification_id}`,
            },
          ]),
        );
        let assignments: TrainingAssignment[] = [];
        try {
          assignments = await api.assignments.list();
        } catch {
          assignments = await api.assignments.listByUser(payload.user_id);
        }
        trainingAssignmentId = assignments.find(
          (a) =>
            a.user_id === payload.user_id &&
            a.course_id === cert.course_id &&
            a.status === "completed",
        )?.assignment_id;
      }
      const raw = await requestFirst<any>([
        {
          method: "POST",
          url: "/api/certificate-issues/issue",
          data: { ...payload, training_assignment_id: trainingAssignmentId },
        },
      ]);
      return normalizeCertificateIssue(raw);
    },
    downloadUrl: (id: number) =>
      `${API_BASE_URL}/api/certificate-issues/${id}/download`,
    verify: async (certificateNumber: string) =>
      requestFirst<any>([
        { method: "GET", url: `/api/certificates/verify/${certificateNumber}` },
      ]),
  },

  notifications: {
    list: async () => {
      try {
        return listify<any>(
          await requestFirst<any[]>([
            { method: "GET", url: "/api/notifications" },
          ]),
        ).map(normalizeNotification);
      } catch (error) {
        if (isNotFound(error)) return [];
        throw error;
      }
    },
    markRead: async (id: number) =>
      normalizeNotification(
        await requestFirst<any>([
          { method: "PATCH", url: `/api/notifications/${id}/read` },
          {
            method: "PATCH",
            url: `/api/notifications/${id}`,
            data: { read_status: true },
          },
        ]),
      ),
  },

  reports: {
    summary: async () => {
      try {
        return await requestFirst<any>([
          { method: "GET", url: "/api/reports/summary" },
        ]);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const [assignments, attempts, certificates] = await Promise.all([
            api.assignments.list(),
            api.assessmentAttempts.list().catch(() => []),
            api.certificateIssues.list().catch(() => []),
          ]);
          return { completion: assignments, attempts, certificates };
        }
        throw error;
      }
    },
  },

  assignmentRules: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/assignment-rules" },
        ]),
      ),

    create: async (payload: any) =>
      unwrap(await http.post("/api/assignment-rules", payload)),

    update: async (id: number, payload: any) =>
      unwrap(await http.put(`/api/assignment-rules/${id}`, payload)),

    delete: async (id: number) =>
      unwrap(await http.delete(`/api/assignment-rules/${id}`)),
  },

  assessmentRules: {
    list: async () =>
      listify<any>(
        await requestFirst<any[]>([
          { method: "GET", url: "/api/assessment-rules" },
        ]),
      ),

    create: async (payload: any) =>
      unwrap(
        await http.post("/api/assessment-rules", {
          ...payload,
          max_attempts: Number(payload.max_attempts),
          passing_score: Number(payload.passing_score),
        }),
      ),

    update: async (id: number, payload: any) =>
      unwrap(
        await http.put(`/api/assessment-rules/${id}`, {
          ...payload,
          max_attempts:
            payload.max_attempts !== undefined
              ? Number(payload.max_attempts)
              : undefined,
          passing_score:
            payload.passing_score !== undefined
              ? Number(payload.passing_score)
              : undefined,
        }),
      ),

    delete: async (id: number) =>
      unwrap(await http.delete(`/api/assessment-rules/${id}`)),
  },

  meta: { API_BASE_URL, currentUserRole },
};

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as any;
    return (
      data?.error || data?.message || error.message || "API request failed"
    );
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
