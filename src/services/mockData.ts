import dayjs from "dayjs";
import type {
  Assessment,
  AssessmentAttempt,
  AssessmentRule,
  AssignmentRule,
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

export const roles: Role[] = [
  {
    role_id: 1,
    role_name: "admin",
    role_type: "internal",
    description: "Full platform administrator",
  },
  {
    role_id: 2,
    role_name: "manager",
    role_type: "internal",
    description: "Assigns and tracks team trainings",
  },
  {
    role_id: 3,
    role_name: "employee",
    role_type: "learner",
    description: "Completes assigned courses",
  },
];
export const users: User[] = [
  {
    user_id: 1,
    full_name: "Ananya Admin",
    email: "admin@test.com",
    employee_code: "ADM001",
    joining_date: "2026-01-05",
    status: "active",
    manager_id: null,
    role_id: 1,
  },
  {
    user_id: 2,
    full_name: "Maya Manager",
    email: "manager@test.com",
    employee_code: "MGR001",
    joining_date: "2026-02-10",
    status: "active",
    manager_id: 1,
    role_id: 2,
  },
  {
    user_id: 3,
    full_name: "David Learner",
    email: "david@test.com",
    employee_code: "EMP002",
    joining_date: "2026-03-01",
    status: "active",
    manager_id: 2,
    role_id: 3,
  },
  {
    user_id: 4,
    full_name: "Riya Learner",
    email: "riya@test.com",
    employee_code: "EMP003",
    joining_date: "2026-03-15",
    status: "active",
    manager_id: 2,
    role_id: 3,
  },
];
export const courses: Course[] = [
  {
    course_id: 1,
    course_title: "Data Security Basics",
    course_description: "Privacy, password and security awareness training.",
    course_type: "mandatory",
    created_by_user_id: 1,
    is_active: true,
    created_at: "2026-05-28",
  },
  {
    course_id: 2,
    course_title: "Customer Handling Essentials",
    course_description:
      "Service, escalation and customer communication skills.",
    course_type: "role_based",
    created_by_user_id: 2,
    is_active: true,
    created_at: "2026-05-20",
  },
];
export const modules: Module[] = [
  {
    module_id: 1,
    course_id: 1,
    module_title: "Password Security",
    module_description: "Password and MFA basics.",
    sequence_no: 1,
    due_days: 2,
    is_active: true,
  },
  {
    module_id: 2,
    course_id: 1,
    module_title: "Phishing Awareness",
    module_description: "Identify suspicious emails and links.",
    sequence_no: 2,
    due_days: 3,
    is_active: true,
  },
  {
    module_id: 3,
    course_id: 1,
    module_title: "Data Privacy Basics",
    module_description: "Handling sensitive customer data safely.",
    sequence_no: 3,
    due_days: 5,
    is_active: true,
  },
  {
    module_id: 4,
    course_id: 2,
    module_title: "Empathy in Support",
    module_description: "Responding with clarity and empathy.",
    sequence_no: 1,
    due_days: 2,
    is_active: true,
  },
];
export const trainingMappings: TrainingMapping[] = [
  {
    mapping_id: 1,
    role_id: 3,
    course_id: 1,
    is_mandatory: true,
    assignment_trigger: "on_joining",
    active_flag: true,
  },
  {
    mapping_id: 2,
    role_id: 2,
    course_id: 2,
    is_mandatory: false,
    assignment_trigger: "role_change",
    active_flag: true,
  },
];
export const trainingAssignments: TrainingAssignment[] = [
  {
    assignment_id: 1,
    user_id: 3,
    course_id: 1,
    assigned_by_user_id: 2,
    assignment_source: "manual",
    is_mandatory: true,
    assigned_date: "2026-05-28",
    due_date: "2026-06-15",
    completion_date: null,
    status: "in_progress",
    improvement_status: "",
  },
  {
    assignment_id: 2,
    user_id: 4,
    course_id: 1,
    assigned_by_user_id: 2,
    assignment_source: "role_mapping",
    is_mandatory: true,
    assigned_date: "2026-05-28",
    due_date: "2026-06-12",
    completion_date: null,
    status: "assigned",
    improvement_status: "",
  },
];
export const moduleProgresses: ModuleProgress[] = [
  {
    id: 1,
    assignment_id: 1,
    module_id: 1,
    user_id: 3,
    status: "completed",
    started_at: "2026-05-29",
    completed_at: "2026-05-29",
  },
  {
    id: 2,
    assignment_id: 1,
    module_id: 2,
    user_id: 3,
    status: "in_progress",
    started_at: "2026-05-30",
    completed_at: null,
  },
  {
    id: 3,
    assignment_id: 1,
    module_id: 3,
    user_id: 3,
    status: "pending",
    started_at: null,
    completed_at: null,
  },
];
export const assignmentRules: AssignmentRule[] = [
  {
    assignment_rule_id: 1,
    rule_name: "Assign on joining",
    trigger_event: "on_joining",
    role_id: 3,
    is_active: true,
  },
];
export const assessmentRules: AssessmentRule[] = [
  {
    assessment_rule_id: 1,
    max_attempts: 3,
    passing_score: 70,
    retake_allowed: true,
    evaluation_method: "score",
  },
];
export const assessments: Assessment[] = [
  {
    assessment_id: 1,
    course_id: 1,
    module_id: 1,
    assessment_title: "Password Security Quiz",
    assessment_type: "quiz",
    max_score: 100,
    passing_score: 70,
    rule_id: 1,
    is_active: true,
  },
  {
    assessment_id: 2,
    course_id: 1,
    module_id: 2,
    assessment_title: "Phishing Awareness Quiz",
    assessment_type: "quiz",
    max_score: 100,
    passing_score: 70,
    rule_id: 1,
    is_active: true,
  },
];
export const assessmentAttempts: AssessmentAttempt[] = [
  {
    attempt_id: 1,
    assessment_id: 1,
    user_id: 3,
    attempt_no: 1,
    score_obtained: 82,
    result_status: "passed",
    attempted_at: "2026-05-30T10:00:00Z",
  },
];
export const certificationRules: CertificationRule[] = [
  {
    certification_rule_id: 1,
    issue_on_course_completion: true,
    minimum_score_required: 70,
    validity_days: 365,
    renewal_required: true,
  },
];
export const certifications: Certification[] = [
  {
    certification_id: 1,
    course_id: 1,
    certification_name: "Data Security Basics Certificate",
    validity_days: 365,
    rule_id: 1,
    is_active: true,
  },
];
export const certificateIssues: CertificateIssue[] = [
  {
    certificate_issue_id: 1,
    certification_id: 1,
    user_id: 3,
    issued_on: "2026-05-30",
    expiry_date: "2027-05-30",
    certificate_number: "CERT-3-1-001",
    issue_status: "issued",
    pdf_path: "/mock/certificate.pdf",
  },
];
export const notifications: Notification[] = [
  {
    notification_id: 1,
    user_id: 3,
    assignment_id: 1,
    certificate_issue_id: null,
    notification_type: "new_assignment",
    message: "Data Security Basics has been assigned to you.",
    target_audience: "employee",
    sent_at: dayjs().subtract(2, "day").toISOString(),
    read_status: false,
  },
  {
    notification_id: 2,
    user_id: 3,
    assignment_id: null,
    certificate_issue_id: 1,
    notification_type: "certificate_issued",
    message: "Your certificate has been issued.",
    target_audience: "employee",
    sent_at: dayjs().subtract(1, "day").toISOString(),
    read_status: false,
  },
];
