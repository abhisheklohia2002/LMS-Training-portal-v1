import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Form,
  Modal,
  Progress,
  Radio,
  Space,
  Tag,
  Timeline,
  Tooltip,
  message,
} from "antd";

import {
  BookOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { useMe } from "../../hooks/useAuth";
import { useCourses } from "../../hooks/useCourses";
import {
  useAssessmentAttemptsByUser,
  useSubmitAssessment,
} from "../../hooks/useAssessmentAttempts";
import { useAssessmentsByCourse } from "../../hooks/useAssessments";
import { useLearnerAssessmentQuestions } from "../../hooks/useAssessmentQuestions";
import {
  useCertificateIssuesByUser,
  useIssueCertificate,
} from "../../hooks/useCertificateIssues";
import { useCertificationsByCourse } from "../../hooks/useCertifications";
import {
  useCompleteModule,
  useModuleProgress,
  useModules,
} from "../../hooks/useModules";
import { useTrainingAssignmentsByUser } from "../../hooks/useTrainingAssignments";
import { api, getApiErrorMessage } from "../../services/api";
import type {
  Assessment,
  AssessmentQuestion,
  ModuleProgress,
  SubmitAssessmentAnswer,
  TrainingAssignment,
} from "../../types";
import { findCourse } from "../../utils/lookup";
import { AttendanceSummary } from "../../components/attendance/AttendanceSummary";
import {
  useAttendanceByUser,
  useAttendanceSummary,
  useMark,
} from "../../hooks/useAttendance";
import {
  useModuleDocuments,
  useModuleVideo,
} from "../../hooks/useModuleDocuments";
import { useCreateTrainingSession } from "../../hooks/useTrainingSessionsByCourse";

function moduleStatus(progress?: ModuleProgress) {
  if (!progress) return "locked";
  if (progress.status === "completed") return "done";
  if (progress.status === "in_progress") return "in progress";
  return "pending";
}

function QuizModal({
  assessment,
  userId,
  open,
  onClose,
}: {
  assessment?: Assessment;
  userId: number;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const quizContainerRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef(false);

  const { data: questions = [], isLoading } = useLearnerAssessmentQuestions(
    assessment?.assessment_id,
  );

  const submit = useSubmitAssessment();

  const closeTestForViolation = (reason: string) => {
    if (!open || isSubmittingRef.current) return;

    message.error(reason);
    form.resetFields();
    onClose();
  };

  const exitFullscreenSafely = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore browser fullscreen exit errors
    }
  };

  useEffect(() => {
    if (!open) return;

    isSubmittingRef.current = false;

    const startFullscreen = async () => {
      try {
        await quizContainerRef.current?.requestFullscreen();
      } catch {
        message.warning("Please allow fullscreen mode to start the test.");
        onClose();
      }
    };

    const timer = window.setTimeout(startFullscreen, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current) {
        closeTestForViolation(
          "Test closed because fullscreen mode was exited.",
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        closeTestForViolation("Test closed because you left the test screen.");
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isSubmittingRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [open]);

  const submitQuiz = (values: Record<string, number | number[] | string>) => {
    if (!assessment) return;

    isSubmittingRef.current = true;

    const answers: SubmitAssessmentAnswer[] = questions.map(
      (q: AssessmentQuestion) => {
        const value = values[`q_${q.question_id}`];

        return {
          question_id: q.question_id,
          selected_option_ids: Array.isArray(value)
            ? value
            : typeof value === "number"
              ? [value]
              : [],
          text_answer: typeof value === "string" ? value : "",
        };
      },
    );

    submit.mutate(
      {
        assessment_id: assessment.assessment_id,
        user_id: userId,
        answers,
      },
      {
        onSuccess: async (attempt) => {
          await exitFullscreenSafely();

          (attempt.result_status === "passed"
            ? message.success
            : message.warning)(
            `Score ${attempt.score_obtained}: ${attempt.result_status}`,
          );

          form.resetFields();
          onClose();
        },
        onError: (error) => {
          isSubmittingRef.current = false;
          message.error(getApiErrorMessage(error));
        },
      },
    );
  };
  if (!open) return null;

  return (
    <div
      ref={quizContainerRef}
      className="fixed inset-0 z-[9999] flex flex-col bg-white"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <div className="text-xl font-semibold">
            {assessment?.assessment_title ?? "Assessment"}
          </div>
          <div className="text-sm text-slate-500">
            Fullscreen test mode is active
          </div>
        </div>

        <Button
          type="primary"
          loading={submit.isPending}
          onClick={() => form.submit()}
        >
          Submit quiz
        </Button>
      </div>

      {/* Warning */}
      <div className="shrink-0 px-6 pt-4">
        <Alert
          type="warning"
          showIcon
          message="Do not exit fullscreen, switch tabs, refresh, or close the browser."
          description="Leaving the test screen will close your test."
        />
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <Card loading />
        ) : questions.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            message="No questions created for this assessment yet"
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={submitQuiz}>
            <div className="space-y-4 pb-24">
              {questions.map((q, index) => (
                <Card
                  key={q.question_id}
                  size="small"
                  title={`${index + 1}. ${q.question_text}`}
                  extra={<Tag>{q.marks} marks</Tag>}
                >
                  <Form.Item
                    name={`q_${q.question_id}`}
                    rules={[
                      {
                        required: q.question_type !== "text",
                        message: "Please answer this question",
                      },
                    ]}
                  >
                    {q.question_type === "multiple_choice" ? (
                      <Checkbox.Group
                        className="grid gap-2"
                        options={q.options.map((o) => ({
                          label: o.option_text,
                          value: o.option_id,
                        }))}
                      />
                    ) : q.question_type === "text" ? (
                      <textarea
                        className="w-full rounded-xl border border-slate-200 p-3"
                        rows={4}
                        placeholder="Type your answer"
                      />
                    ) : (
                      <Radio.Group className="grid gap-2">
                        {q.options.map((o) => (
                          <Radio key={o.option_id} value={o.option_id}>
                            {o.option_text}
                          </Radio>
                        ))}
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Card>
              ))}
            </div>
          </Form>
        )}
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-6 py-4">
        <Button
          type="primary"
          size="large"
          loading={submit.isPending}
          onClick={() => form.submit()}
        >
          Submit quiz
        </Button>
      </div>
    </div>
  );
  // return (
  //   <Modal
  //     title={assessment?.assessment_title ?? "Assessment"}
  //     open={open}
  //     onCancel={() => {
  //       closeTestForViolation("Test closed because you tried to exit.");
  //     }}
  //     onOk={() => form.submit()}
  //     confirmLoading={submit.isPending}
  //     okText="Submit quiz"
  //     width="100vw"
  //     centered
  //     maskClosable={false}
  //     keyboard={false}
  //     closable={false}
  //     destroyOnClose
  //     styles={{
  //       body: {
  //         height: "calc(100vh - 130px)",
  //         overflowY: "auto",
  //       },
  //     }}
  //   >
  //     <div ref={quizContainerRef} className="min-h-screen bg-white p-4">
  //       <Alert
  //         type="warning"
  //         showIcon
  //         className="mb-4"
  //         message="Fullscreen test mode is active"
  //         description="Do not exit fullscreen, switch tabs, refresh, or close the browser. Leaving the test screen will close your test."
  //       />

  //       {isLoading ? (
  //         <Card loading />
  //       ) : questions.length === 0 ? (
  //         <Alert
  //           type="warning"
  //           showIcon
  //           message="No questions created for this assessment yet"
  //         />
  //       ) : (
  //         <Form form={form} layout="vertical" onFinish={submitQuiz}>
  //           <div className="space-y-4">
  //             {questions.map((q, index) => (
  //               <Card
  //                 key={q.question_id}
  //                 size="small"
  //                 title={`${index + 1}. ${q.question_text}`}
  //                 extra={<Tag>{q.marks} marks</Tag>}
  //               >
  //                 <Form.Item
  //                   name={`q_${q.question_id}`}
  //                   rules={[
  //                     {
  //                       required: q.question_type !== "text",
  //                       message: "Please answer this question",
  //                     },
  //                   ]}
  //                 >
  //                   {q.question_type === "multiple_choice" ? (
  //                     <Checkbox.Group
  //                       className="grid gap-2"
  //                       options={q.options.map((o) => ({
  //                         label: o.option_text,
  //                         value: o.option_id,
  //                       }))}
  //                     />
  //                   ) : q.question_type === "text" ? (
  //                     <textarea
  //                       className="w-full rounded-xl border border-slate-200 p-3"
  //                       rows={4}
  //                       placeholder="Type your answer"
  //                     />
  //                   ) : (
  //                     <Radio.Group className="grid gap-2">
  //                       {q.options.map((o) => (
  //                         <Radio key={o.option_id} value={o.option_id}>
  //                           {o.option_text}
  //                         </Radio>
  //                       ))}
  //                     </Radio.Group>
  //                   )}
  //                 </Form.Item>
  //               </Card>
  //             ))}
  //           </div>
  //         </Form>
  //       )}
  //     </div>
  //   </Modal>
  // );
}

function ModuleLearningItem({
  progress,
  module,
  quizzes,
  userId,
  sessionId,
  hasPassed,
  lastAttempt,
  onStartQuiz,
  onCompleteModule,
  completeLoading,
  courseId,
}: {
  progress: ModuleProgress;
  module?: any;
  quizzes: Assessment[];
  userId: number;
  sessionId?: number;
  hasPassed: (assessmentId: number) => boolean;
  lastAttempt: (assessmentId: number) => any;
  onStartQuiz: (quiz: Assessment) => void;
  onCompleteModule: (progressId: number) => void;
  completeLoading: boolean;
  courseId: number;
}) {
  const { data: docsRaw = [] } = useModuleDocuments(progress.module_id);
  const { data: videoData } = useModuleVideo(progress.module_id);

  const moduleVideo = videoData?.video || null;
  const documents = Array.isArray(docsRaw)
    ? docsRaw
    : docsRaw?.data || docsRaw?.documents || [];

  const pdf = documents?.[0];

  const createSession = useCreateTrainingSession();
  const markAttendance = useMark();

  const [pdfOpen, setPdfOpen] = useState(false);

  const [hasReadPdf, setHasReadPdf] = useState(
    progress.status === "completed" || progress.status === "in_progress",
  );

  const canStartQuiz = hasReadPdf || !pdf;

  const getPassingValue = (quiz: Assessment) => {
    const q: any = quiz;

    return (
      q.passing_score ??
      q.passing_marks ??
      q.passing_percentage ??
      q.pass_score ??
      q.pass_marks ??
      "N/A"
    );
  };
  const getMaxAttempts = (quiz: Assessment) => {
    return quiz.rule?.max_attempts ?? 1;
  };

  const getRetakeAllowed = (quiz: Assessment) => {
    return quiz.rule?.retake_allowed ?? false;
  };

  const getPassingScore = (quiz: Assessment) => {
    return quiz.rule?.passing_score ?? quiz.passing_score;
  };
  const handleFinishedReading = () => {
    const checkIn = new Date();
    const checkOut = new Date(checkIn.getTime() + 60 * 1000);

    createSession.mutate(
      {
        course_id: courseId,
        module_id: progress.module_id,
        created_by_user_id: userId,
        session_title: `${module?.module_title ?? "Module"} Reading Session`,
        session_type: "self_paced",
        start_time: checkIn.toISOString(),
        end_time: checkOut.toISOString(),
        is_mandatory: true,
      },
      {
        onSuccess: (sessionResponse: any) => {
          const session =
            sessionResponse?.data ||
            sessionResponse?.session ||
            sessionResponse;

          const sessionId = session?.session_id || session?.id;

          if (!sessionId) {
            message.error("Session created but session id missing");
            return;
          }

          markAttendance.mutate(
            {
              sessionId,
              payload: {
                user_id: userId,
                marked_by_user_id: userId,
                status: "present",
                check_in_time: checkIn.toISOString(),
                check_out_time: checkOut.toISOString(),
                attendance_source: "manual",
                remarks: `Finished reading ${
                  module?.module_title ?? "module PDF"
                }`,
              },
            },
            {
              onSuccess: () => {
                setHasReadPdf(true);
                setPdfOpen(false);
                message.success("Reading completed. You can start the test.");
              },
              onError: (error) => {
                message.error(getApiErrorMessage(error));
              },
            },
          );
        },
        onError: (error) => {
          message.error(getApiErrorMessage(error));
        },
      },
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="font-semibold">
              {module?.module_title ?? `Module ${progress.module_id}`}
            </div>

            <div className="text-sm text-slate-500">
              Module status: {moduleStatus(progress)}
            </div>
            {moduleVideo?.video_url && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">Module Video</div>
                  <Tag color="purple">Video available</Tag>
                </div>

                <video
                  src={moduleVideo.video_url}
                  poster={pdf?.thumbnail_url}
                  controls
                  className="w-full rounded-xl bg-black"
                  style={{
                    maxHeight: 420,
                    objectFit: "contain",
                  }}
                />

                {!pdf?.thumbnail_url && (
                  <div className="mt-2 text-xs text-slate-400">
                    No thumbnail uploaded for this module.
                  </div>
                )}
              </div>
            )}
          </div>

          <Space wrap>
            {pdf ? (
              <Button icon={<BookOutlined />} onClick={() => setPdfOpen(true)}>
                Open PDF
              </Button>
            ) : (
              <Tag color="orange">No PDF uploaded</Tag>
            )}

            {moduleVideo?.video_url ? (
              <Tag color="purple">Video uploaded</Tag>
            ) : (
              <Tag color="orange">No video uploaded</Tag>
            )}

            <Button
              type={progress.status === "completed" ? "default" : "primary"}
              disabled={progress.status === "completed" || !hasReadPdf}
              loading={completeLoading}
              onClick={() => onCompleteModule(progress.id)}
            >
              {progress.status === "completed"
                ? "Completed"
                : hasReadPdf
                  ? "Mark complete"
                  : "Read PDF first"}
            </Button>
          </Space>
        </div>

        <div className="mt-4 grid gap-3">
          {quizzes.length === 0 ? (
            <Tag>No quiz linked</Tag>
          ) : (
            quizzes.map((quiz) => {
              const passed = hasPassed(quiz.assessment_id);
              const latest = lastAttempt(quiz.assessment_id);

              const maxAttempts = getMaxAttempts(quiz);
              const retakeAllowed = getRetakeAllowed(quiz);
              const passingScore = getPassingScore(quiz);

              const usedAttempts = latest?.attempt_no ?? 0;
              const remainingAttempts = Math.max(maxAttempts - usedAttempts, 0);

              const attemptsFinished = usedAttempts >= maxAttempts;

              const canTakeQuiz =
                canStartQuiz &&
                !passed &&
                !attemptsFinished &&
                (usedAttempts === 0 || retakeAllowed);

              const statusText = passed
                ? "Passed"
                : attemptsFinished
                  ? "Attempts finished"
                  : latest
                    ? "Failed"
                    : "Not attempted";

              const buttonText = passed
                ? `Quiz passed: ${quiz.assessment_title}`
                : !canStartQuiz
                  ? `Locked: ${quiz.assessment_title}`
                  : attemptsFinished
                    ? `Attempts finished: ${quiz.assessment_title}`
                    : latest
                      ? `Retake Test: ${quiz.assessment_title}`
                      : `Start Test: ${quiz.assessment_title}`;

              return (
                <div
                  key={quiz.assessment_id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Tag
                      color={
                        passed ? "green" : attemptsFinished ? "red" : "blue"
                      }
                    >
                      {statusText}
                    </Tag>

                    <Tag>Score: {latest?.score_obtained ?? "N/A"}</Tag>

                    <Tag>Passing: {passingScore}</Tag>

                    <Tag>
                      Attempts: {usedAttempts}/{maxAttempts}
                    </Tag>

                    <Tag color={remainingAttempts > 0 ? "green" : "red"}>
                      Remaining: {remainingAttempts}
                    </Tag>

                    {!retakeAllowed && usedAttempts > 0 && !passed && (
                      <Tag color="red">Retake not allowed</Tag>
                    )}
                  </div>

                  <Button
                    icon={
                      passed ? <FileDoneOutlined /> : <PlayCircleOutlined />
                    }
                    type={passed ? "default" : "primary"}
                    disabled={!canTakeQuiz}
                    onClick={() => onStartQuiz(quiz)}
                  >
                    {buttonText}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        open={pdfOpen}
        title={pdf?.title || module?.module_title || "Module PDF"}
        onCancel={() => setPdfOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPdfOpen(false)}>
            Close
          </Button>,
          <Button key="read" type="primary" onClick={handleFinishedReading}>
            I finished reading
          </Button>,
        ]}
        width="85%"
        style={{ top: 20 }}
      >
        {pdf?.file_url ? (
          <iframe
            src={pdf.file_url}
            title={pdf.title || "Module PDF"}
            style={{
              width: "100%",
              height: "78vh",
              border: "none",
            }}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="No PDF uploaded for this module"
          />
        )}
      </Modal>
    </>
  );
}

function TrainingCard({
  assignment,
  userId,
}: {
  assignment: TrainingAssignment;
  userId: number;
}) {
  const [activeQuiz, setActiveQuiz] = useState<Assessment | undefined>();
  const { data: courses } = useCourses();
  const { data: modules = [] } = useModules(assignment.course_id);
  const { data: progress = [] } = useModuleProgress(assignment.assignment_id);
  const { data: assessments = [] } = useAssessmentsByCourse(
    assignment.course_id,
  );
  const { data: attempts = [] } = useAssessmentAttemptsByUser(userId);
  const { data: certifications = [] } = useCertificationsByCourse(
    assignment.course_id,
  );
  const { data: certificateIssues = [] } = useCertificateIssuesByUser(userId);
  const { data: attendance = [] } = useAttendanceByUser(userId);
  // const { data: attendanceSummary } = useAttendanceSummary(
    //   userId,
    //   assignment.course_id,
    // );
    console.log(attendance, "attendance------");
  const complete = useCompleteModule();
  const issueCertificate = useIssueCertificate();
  const { data: sessions } = useCreateTrainingSession();
  const courseSessions = Array.isArray(sessions) ? sessions : [];

  const getSessionForModule = (moduleId: number) => {
    const moduleSession = courseSessions.find(
      (s: any) => Number(s.module_id) === Number(moduleId),
    );

    if (moduleSession) {
      return moduleSession.session_id;
    }

    const courseSession = courseSessions.find(
      (s: any) =>
        !s.module_id || Number(s.course_id) === Number(assignment.course_id),
    );

    return courseSession?.session_id;
  };
  const course = findCourse(courses, assignment.course_id);
  const completed = progress.filter((p) => p.status === "completed").length;
  const total = progress.length || 1;
  const percent = Math.round((completed / total) * 100);
  const courseCert = certifications.find(
    (c) => c.course_id === assignment.course_id && c.is_active,
  );
  const issuedCert = courseCert
    ? certificateIssues.find(
        (i) =>
          i.certification_id === courseCert.certification_id &&
          i.issue_status === "issued",
      )
    : undefined;

  const attemptsForAssessment = (assessmentId: number) =>
    attempts.filter((a) => a.assessment_id === assessmentId);
  const hasPassed = (assessmentId: number) =>
    attemptsForAssessment(assessmentId).some(
      (a) => a.result_status === "passed",
    );
  const lastAttempt = (assessmentId: number) =>
    attemptsForAssessment(assessmentId)
      .slice()
      .sort((a, b) => b.attempt_no - a.attempt_no)[0];
  const moduleAssessments = (moduleId: number) =>
    assessments.filter(
      (a) => a.is_active && Number(a.module_id) === Number(moduleId),
    );

  const allRequiredQuizzes = progress.flatMap((p) =>
    moduleAssessments(p.module_id),
  );

  const allModulesCompleted =
    progress.length > 0 && progress.every((p) => p.status === "completed");

  const allQuizzesPassed =
    allRequiredQuizzes.length === 0 ||
    allRequiredQuizzes.every((quiz) => hasPassed(quiz.assessment_id));

  const canClaimCertificate =
    Boolean(courseCert) && allModulesCompleted && allQuizzesPassed;

  const claimCertificate = () => {
    if (!courseCert) {
      return message.warning(
        "No active certification is configured for this course yet.",
      );
    }

    if (!allModulesCompleted) {
      return message.warning("Please complete all modules first.");
    }

    if (!allQuizzesPassed) {
      return message.warning("Please pass all required quizzes first.");
    }

    issueCertificate.mutate(
      {
        user_id: userId,
        certification_id: courseCert.certification_id,
        training_assignment_id: assignment.assignment_id,
      },
      {
        onSuccess: () => message.success("Certificate issued successfully"),
        onError: (error) => message.error(getApiErrorMessage(error)),
      },
    );
  };

  return (
    <Card className="page-card">
      <QuizModal
        assessment={activeQuiz}
        userId={userId}
        open={Boolean(activeQuiz)}
        onClose={() => setActiveQuiz(undefined)}
      />
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {course?.course_title ?? `Course ${assignment.course_id}`}
              </h3>
              <p className="text-slate-500">
                Only modules and quizzes from your assigned training are shown
                here. Unassigned course content is hidden.
              </p>
            </div>
            <StatusTag value={assignment.status} />
          </div>
          <Progress
            percent={percent}
            status={percent === 100 ? "success" : "active"}
          />
          <AttendanceSummary attendances={attendance} />
        </div>

        {progress.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message="No accessible modules yet"
            description="Ask your manager to assign this course again after modules are created, or generate module progress for this assignment."
          />
        ) : (
          <Timeline
            items={progress.map((p) => {
              const mod = modules.find((m) => m.module_id === p.module_id);
              const quizzes = moduleAssessments(p.module_id);
              return {
                color:
                  p.status === "completed"
                    ? "green"
                    : p.status === "in_progress"
                      ? "blue"
                      : "gray",
                // children: (
                //   <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                //     <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                //       <div>
                //         <div className="font-semibold">
                //           {mod?.module_title ?? `Module ${p.module_id}`}
                //         </div>
                //         <div className="text-sm text-slate-500">
                //           Module status: {moduleStatus(p)}
                //         </div>
                //       </div>
                //       <Button
                //         type={p.status === "completed" ? "default" : "primary"}
                //         disabled={p.status === "completed"}
                //         onClick={() =>
                //           complete.mutate(p.id, {
                //             onSuccess: () =>
                //               message.success("Module completed"),
                //             onError: (error) =>
                //               message.error(getApiErrorMessage(error)),
                //           })
                //         }
                //       >
                //         {p.status === "completed"
                //           ? "Completed"
                //           : "Mark complete"}
                //       </Button>
                //     </div>

                //     <div className="mt-4 flex flex-wrap gap-2">
                //       {quizzes.length === 0 ? (
                //         <Tag>No quiz linked</Tag>
                //       ) : (
                //         quizzes.map((quiz) => {
                //           const passed = hasPassed(quiz.assessment_id);
                //           const latest = lastAttempt(quiz.assessment_id);
                //           return (
                //             <Tooltip
                //               key={quiz.assessment_id}
                //               title={
                //                 latest
                //                   ? `Last score: ${latest.score_obtained}, attempt ${latest.attempt_no}`
                //                   : "No attempts yet"
                //               }
                //             >
                //               <Button
                //                 icon={
                //                   passed ? (
                //                     <FileDoneOutlined />
                //                   ) : (
                //                     <PlayCircleOutlined />
                //                   )
                //                 }
                //                 type={passed ? "default" : "primary"}
                //                 disabled={passed}
                //                 onClick={() => setActiveQuiz(quiz)}
                //               >
                //                 {passed
                //                   ? `Quiz passed: ${quiz.assessment_title}`
                //                   : `Take quiz: ${quiz.assessment_title}`}
                //               </Button>
                //             </Tooltip>
                //           );
                //         })
                //       )}
                //     </div>
                //   </div>
                // ),
                children: (
                  <ModuleLearningItem
                    progress={p}
                    courseId={assignment.course_id}
                    sessionId={getSessionForModule(p.module_id)}
                    module={mod}
                    quizzes={quizzes}
                    userId={userId}
                    hasPassed={hasPassed}
                    lastAttempt={lastAttempt}
                    onStartQuiz={(quiz) => setActiveQuiz(quiz)}
                    completeLoading={complete.isPending}
                    onCompleteModule={(progressId) =>
                      complete.mutate(progressId, {
                        onSuccess: () => message.success("Module completed"),
                        onError: (error) =>
                          message.error(getApiErrorMessage(error)),
                      })
                    }
                  />
                ),
              };
            })}
          />
        )}

        <div className="rounded-2xl border border-dashed border-slate-200 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="font-semibold">Certificate</div>

              <div className="text-sm text-slate-500">
                {issuedCert
                  ? `Issued: ${issuedCert.certificate_number}`
                  : !courseCert
                    ? "No active certificate is configured for this course."
                    : !allModulesCompleted
                      ? "Complete all modules to unlock certificate."
                      : !allQuizzesPassed
                        ? "Pass all required quizzes to unlock certificate."
                        : "You are eligible. Claim your certificate."}
              </div>

              {!issuedCert && courseCert && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Tag color={allModulesCompleted ? "green" : "orange"}>
                    Modules: {completed}/{total}
                  </Tag>

                  <Tag color={allQuizzesPassed ? "green" : "orange"}>
                    Quizzes passed:{" "}
                    {
                      allRequiredQuizzes.filter((quiz) =>
                        hasPassed(quiz.assessment_id),
                      ).length
                    }
                    /{allRequiredQuizzes.length}
                  </Tag>
                </div>
              )}
            </div>

            <Space wrap>
              {issuedCert ? (
                <Button
                  icon={<DownloadOutlined />}
                  href={api.certificateIssues.downloadUrl(
                    issuedCert.certificate_issue_id,
                  )}
                  target="_blank"
                >
                  Download certificate
                </Button>
              ) : (
                <Button
                  icon={<SafetyCertificateOutlined />}
                  type="primary"
                  disabled={!canClaimCertificate}
                  loading={issueCertificate.isPending}
                  onClick={claimCertificate}
                >
                  Claim certificate
                </Button>
              )}
            </Space>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MyTrainingsPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const userId = me?.user.user_id;
  const { data: mine = [], isLoading } = useTrainingAssignmentsByUser(userId);

  return (
    <>
      <PageHeader
        title="My Trainings"
        subtitle="Learners only see courses, modules, quizzes, and certificates assigned to them through Training Assignment."
      />
      {meLoading || isLoading ? (
        <Card loading />
      ) : mine.length === 0 ? (
        <Empty description="No trainings assigned to you yet" />
      ) : (
        <div className="grid gap-4">
          {mine.map((a) => (
            <div key={a.assignment_id}>
              <div className="mb-2 flex items-center gap-2">
                <StatusTag value={a.status} />
                {a.is_mandatory && <Tag color="red">Mandatory</Tag>}
                <span className="text-slate-500">Due {a.due_date}</span>
              </div>
              <TrainingCard assignment={a} userId={userId!} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
