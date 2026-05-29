# LMS Training Portal Frontend

React + TypeScript + Tailwind CSS + Ant Design + React Router + TanStack Query.

This version is integrated with the Gin/GORM/Postgres LMS API built in this conversation. It uses Axios with cookie authentication and a centralized API service layer.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```txt
http://localhost:5173
```

## API base URL

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5500
VITE_DEFAULT_USER_PASSWORD=12345678
```

Your backend must enable CORS credentials for the Vite origin:

```go
AllowOrigins: []string{"http://localhost:5173"},
AllowCredentials: true,
```

The frontend sends cookies with every request using `withCredentials: true`.

## Backend endpoints expected

Auth:

```txt
POST /api/auth/login
GET  /api/auth/self
POST /api/auth/create              # fallback: /api/auth/register
GET  /api/auth/users               # fallback: /api/users
PUT  /api/auth/users/:id           # fallback: /api/users/:id
```

Roles:

```txt
GET  /api/roles
POST /api/roles
PUT  /api/roles/:id
```

Courses and modules:

```txt
GET  /api/courses
GET  /api/courses/:id
POST /api/courses
PUT  /api/courses/:id
GET  /api/modules
GET  /api/modules/course/:courseId # fallback: /api/modules?course_id=:id
POST /api/modules
```

Training:

```txt
GET   /api/training-mappings
POST  /api/training-mappings
GET   /api/training-assignments
GET   /api/training-assignments/:id
POST  /api/training-assignments/manual
POST  /api/training-assignments/auto
PATCH /api/training-assignments/:id/status
GET   /api/module-progress/assignment/:assignmentId
PATCH /api/module-progress/:id/status
```

Assessments:

```txt
GET  /api/assessment-rules
POST /api/assessment-rules
GET  /api/assessments
POST /api/assessments
GET  /api/assessment-attempts                  # optional
GET  /api/assessment-attempts/user/:userId      # fallback
POST /api/assessment-attempts
```

Certifications:

```txt
GET  /api/certification-rules
POST /api/certification-rules
GET  /api/certifications
GET  /api/certifications/:id
POST /api/certifications
GET  /api/certificate-issues                   # optional
GET  /api/certificate-issues/user/:userId       # fallback
POST /api/certificate-issues/issue
GET  /api/certificate-issues/:id/download
GET  /api/certificates/verify/:certificateNumber
```

Notifications and reports:

```txt
GET   /api/notifications                        # optional; frontend returns [] if missing
PATCH /api/notifications/:id/read
GET   /api/reports/summary                      # optional; frontend derives report data if missing
```

## Important files

```txt
src/services/api.ts          # Axios API integration + response normalization
src/services/queryKeys.ts    # stable TanStack Query keys
src/hooks/                   # all query/mutation hooks
src/pages/                   # pages only call hooks, not raw API functions
```

## Login quick-fill users

The login screen has quick-fill roles:

```txt
Admin:    admin@test.com / 12345678
Manager:  manager@test.com / 12345678
Employee: david@test.com / 12345678
```

Edit these inside `src/pages/auth/LoginPage.tsx` if your seeded users differ.

## Notes

- The API normalizes backend `id/name` fields into frontend `*_id/full_name` fields.
- Mutations invalidate related query keys.
- Optimistic updates are included for notification read state, assignment status, and module completion.
- Some endpoints have fallbacks because your backend route names evolved during development.

## Role-based LMS UI flow added

This build includes the completed role flow:

- Admin / Manager can manage courses, modules, mappings, assignments, assessments, certifications, rules, users, reports.
- Employee can only access Dashboard, My Trainings, and Notifications.
- Employee My Trainings calls `/api/training-assignments/user/:userId`, not the admin-only `/api/training-assignments` endpoint.
- Employee sees only module progress rows attached to their own assignment.
- Employee sees quizzes inside each assigned module when an active assessment is linked to that module.
- Employee can submit/take quiz from My Trainings.
- Passing quiz invalidates module progress, attempts, and assignment queries.
- Employee can claim certificate once assignment is completed and an active certification exists for the course.
- Employee can download issued certificate PDF.


## Final quiz-question version

This build includes the real quiz format added for the backend tables:

- `assessment_questions`
- `assessment_question_options`
- `assessment_attempt_answers`

### Admin / Manager quiz setup

1. Login as admin or manager.
2. Go to **Assessments**.
3. Create an assessment linked to a course and module.
4. Expand the assessment row.
5. Open **Questions** tab.
6. Click **Add question**.
7. Add single choice, multiple choice, true/false, or text question.
8. Mark correct options.

### Employee quiz flow

1. Login as employee.
2. Go to **My Trainings**.
3. Open assigned course card.
4. Under each module, linked quizzes appear.
5. Click **Take quiz**.
6. Answer questions and submit.
7. Backend calculates score and pass/fail.
8. Passing quiz updates module progress and can unlock certificate flow.

### Backend endpoints expected

- `GET /api/assessment-questions/assessment/:assessmentId`
- `GET /api/assessment-questions/assessment/:assessmentId/learner`
- `POST /api/assessment-questions`
- `DELETE /api/assessment-questions/:id`
- `POST /api/assessment-attempts/submit`

