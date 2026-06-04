export type ID = number;
export type RoleName = "admin" | "manager" | "employee";
export type UserStatus = "active" | "inactive";
export type AssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "overdue"
  | "cancelled";
export type AttemptResult = "passed" | "failed";
export type CertificateStatus = "issued" | "expired" | "revoked" | "pending";

export interface Role {
  role_id: ID;
  role_name: RoleName | string;
  role_type: string;
  description: string;
}
export interface User {
  user_id: ID;
  full_name: string;
  email: string;
  employee_code: string;
  joining_date: string;
  status: UserStatus;
  manager_id?: ID | null;
  role_id: ID;
   department_id?: number;
  department?: any;
}

export interface Course {
  course_id: ID;
  course_title: string;
  course_description: string;
  course_type: string;
  created_by_user_id: ID;
  is_active: boolean;
  created_at: string;
}
export interface Module {
  module_id: ID;
  course_id: ID;
  module_title: string;
  module_description: string;
  sequence_no: number;
  due_days: number;
  is_active: boolean;
}
export interface TrainingMapping {
  mapping_id: ID;
  role_id: ID;
  course_id: ID;
  is_mandatory: boolean;
  assignment_trigger: "manual" | "on_joining" | "role_change" | string;
  active_flag: boolean;
}
export interface TrainingAssignment {
  assignment_id: ID;
  user_id: ID;
  course_id: ID;
  assigned_by_user_id: ID;
  assignment_source: "manual" | "role_mapping" | "rule_based" | string;
  is_mandatory: boolean;
  assigned_date: string;
  due_date?: string | null;
  completion_date?: string | null;
  status: AssignmentStatus;
  improvement_status?: string;
}
export interface ModuleProgress {
  id: ID;
  assignment_id: ID;
  module_id: ID;
  user_id: ID;
  status: "pending" | "in_progress" | "completed";
  started_at?: string | null;
  completed_at?: string | null;
}
export interface Assessment {
  assessment_id: ID;
  course_id: ID;
  module_id?: ID | null;
  assessment_title: string;
  assessment_type: string;
  max_score: number;
  passing_score: number;
  rule_id?: ID | null;
  is_active: boolean;
}
export interface AssessmentAttempt {
  attempt_id: ID;
  assessment_id: ID;
  user_id: ID;
  attempt_no: number;
  score_obtained: number;
  result_status: AttemptResult;
  attempted_at: string;
  answers?: AssessmentAttemptAnswer[];
}

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "text";
export interface AssessmentQuestionOption {
  option_id: ID;
  question_id: ID;
  option_text: string;
  is_correct?: boolean;
}
export interface AssessmentQuestion {
  question_id: ID;
  assessment_id: ID;
  question_text: string;
  question_type: QuestionType | string;
  marks: number;
  sequence_no: number;
  is_active: boolean;
  options: AssessmentQuestionOption[];
}
export interface AssessmentAttemptAnswer {
  answer_id: ID;
  attempt_id: ID;
  question_id: ID;
  selected_option_ids: string;
  text_answer?: string;
  is_correct: boolean;
  marks_awarded: number;
}
export interface SubmitAssessmentAnswer {
  question_id: ID;
  selected_option_ids?: ID[];
  text_answer?: string;
}
export interface SubmitAssessmentPayload {
  assessment_id: ID;
  user_id: ID;
  answers: SubmitAssessmentAnswer[];
}

export interface AssignmentRule {
  assignment_rule_id: ID;
  rule_name: string;
  trigger_event: string;
  role_id: ID;
  is_active: boolean;
}
export interface AssessmentRule {
  assessment_rule_id: ID;
  max_attempts: number;
  passing_score: number;
  retake_allowed: boolean;
  evaluation_method: string;
}
export interface CertificationRule {
  certification_rule_id: ID;
  issue_on_course_completion: boolean;
  minimum_score_required: number;
  validity_days: number;
  renewal_required: boolean;
}
export interface Certification {
  certification_id: ID;
  course_id: ID;
  certification_name: string;
  validity_days: number;
  rule_id?: ID | null;
  is_active: boolean;
}
export interface CertificateIssue {
  certificate_issue_id: ID;
  certification_id: ID;
  user_id: ID;
  issued_on: string;
  expiry_date: string;
  certificate_number: string;
  issue_status: CertificateStatus;
  pdf_path?: string;
}
export interface Notification {
  notification_id: ID;
  user_id: ID;
  assignment_id?: ID | null;
  certificate_issue_id?: ID | null;
  notification_type: string;
  message: string;
  target_audience: string;
  sent_at: string;
  read_status: boolean;
}
export interface ReportSummary {
  label: string;
  value: number;
  trend?: string;
}
export interface DashboardMetrics {
  totalUsers: number;
  activeCourses: number;
  pendingAssignments: number;
  expiringCertificates: number;
  passRate: number;
}

export type Department = {
  id: number;
  department_name: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreateDepartmentPayload = {
  department_name: string;
  description?: string;
  is_active: boolean;
};

export type UpdateDepartmentPayload = {
  department_name?: string;
  description?: string;
  is_active?: boolean;
};