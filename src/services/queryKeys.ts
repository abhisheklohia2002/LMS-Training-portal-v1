export const queryKeys = {
  roles: ["roles"] as const,
  users: ["users"] as const,
  user: (id: string | number) => ["users", String(id)] as const,
  courses: ["courses"] as const,
  course: (id: string | number) => ["courses", String(id)] as const,
  modules: (courseId?: string | number) =>
    ["modules", courseId ? String(courseId) : "all"] as const,
  mappings: ["training-mappings"] as const,
  assignments: ["assignments"] as const,
  assignmentsByUser: (userId: string | number) =>
    ["assignments", "user", String(userId)] as const,
  assignment: (id: string | number) => ["assignments", String(id)] as const,
  assessments: ["assessments"] as const,
  assessmentsByCourse: (courseId: string | number) =>
    ["assessments", "course", String(courseId)] as const,
  assessmentQuestions: (assessmentId: string | number) =>
    ["assessment-questions", String(assessmentId)] as const,
  learnerAssessmentQuestions: (assessmentId: string | number) =>
    ["assessment-questions", "learner", String(assessmentId)] as const,
  assessmentAttempts: ["assessment-attempts"] as const,
  assessmentAttemptsByUser: (userId: string | number) =>
    ["assessment-attempts", "user", String(userId)] as const,
  certifications: ["certifications"] as const,
  certificationsByCourse: (courseId: string | number) =>
    ["certifications", "course", String(courseId)] as const,
  certificateIssues: ["certificate-issues"] as const,
  certificateIssuesByUser: (userId: string | number) =>
    ["certificate-issues", "user", String(userId)] as const,
  notifications: ["notifications"] as const,
  reports: ["reports"] as const,
  rules: ["rules"] as const,
  assignmentRules: ["assignment-rules"] as const,
  assessmentRules: ["assessment-rules"] as const,
  certificationRules: ["certification-rules"] as const,
  departmentTrainingMappings: ["department-training-mappings"] as const,
departmentTrainingMappingsByDepartment: (departmentId: number) =>
  ["department-training-mappings", departmentId] as const,
trainingAssignments: ["training-assignments"] as const,
departmentAssignments: ["department-assignments"] as const,
};
