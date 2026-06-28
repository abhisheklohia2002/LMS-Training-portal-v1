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
  message,
} from "antd";

import {
  BookOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
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
import { useAttendanceByUser, useMark } from "../../hooks/useAttendance";
import {
  useModuleDocuments,
  useModuleVideo,
  useUpdateModuleVideoProgress,
} from "../../hooks/useModuleDocuments";
import { useCreateTrainingSession } from "../../hooks/useTrainingSessionsByCourse";
import { useQueryClient } from "@tanstack/react-query";

function moduleStatus(progress?: ModuleProgress) {
  if (!progress) return "locked";
  if (progress.status === "completed") return "done";
  if (progress.status === "in_progress") return "in progress";
  return "pending";
}
function formatDate(value?: any) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatExamTime(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(
      secs,
    ).padStart(2, "0")}s`;
  }

  return `${String(minutes).padStart(2, "0")}m ${String(secs).padStart(
    2,
    "0",
  )}s`;
}

function formatDuration(minutes?: number) {
  if (!minutes) return "0 min";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

function QuizModal({
  assessment,
  userId,
  open,
  onClose,
  durationMinutes,
}: {
  assessment?: Assessment;
  userId: number;
  open: boolean;
  onClose: () => void;
  durationMinutes: number;
}) {
  const [form] = Form.useForm();
  const quizContainerRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const hasAutoSubmittedRef = useRef(false);

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
    if (!open || !assessment) return;

    const totalSeconds = Math.max(Number(durationMinutes || 0) * 60, 0);

    if (totalSeconds <= 0) {
      message.error("Assessment timer is not configured.");
      onClose();
      return;
    }

    setRemainingSeconds(totalSeconds);
    hasAutoSubmittedRef.current = false;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);

          if (!hasAutoSubmittedRef.current && !isSubmittingRef.current) {
            hasAutoSubmittedRef.current = true;
            message.warning("Time is over. Submitting your assessment.");
            form.submit();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    open,
    assessment,
    assessment?.assessment_id,
    durationMinutes,
    form,
    onClose,
  ]);

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
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <div className="text-xl font-semibold">
            {assessment?.assessment_title ?? "Assessment"}
          </div>

          <div className="text-sm text-slate-500">
            Fullscreen test mode is active
          </div>
        </div>

        <Tag
          color={remainingSeconds <= 60 ? "red" : "blue"}
          icon={<ClockCircleOutlined />}
          className="px-3 py-1 text-base"
        >
          {formatExamTime(remainingSeconds)}
        </Tag>
      </div>

      <div className="shrink-0 px-6 pt-4">
        <Alert
          type="warning"
          showIcon
          message="Do not exit fullscreen, switch tabs, refresh, or close the browser."
          description="Leaving the test screen will close your test."
        />
      </div>

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
}

function ModuleLearningItem({
  progress,
  module,
  quizzes,
  userId,
  attendance,
  hasPassed,
  lastAttempt,
  onStartQuiz,
  onCompleteModule,
  completeLoading,
  courseId,
  assignmentId,
}: {
  progress: ModuleProgress;
  module?: any;
  quizzes: Assessment[];
  userId: number;
  attendance: any[];
  hasPassed: (assessmentId: number) => boolean;
  lastAttempt: (assessmentId: number) => any;
  onStartQuiz: (quiz: Assessment) => void;
  onCompleteModule: (progressId: number) => void;
  completeLoading: boolean;
  courseId: number;
  assignmentId: number;
}) {
  const queryClient = useQueryClient();

  const { data: docsRaw = [] } = useModuleDocuments(progress.module_id);
  const { data: videoData } = useModuleVideo(progress.module_id);

  const updateVideoProgress = useUpdateModuleVideoProgress(assignmentId);

  const moduleVideo = videoData?.video || null;

  const documents = Array.isArray(docsRaw)
    ? docsRaw
    : docsRaw?.data || docsRaw?.documents || [];

  const pdf = documents?.[0];

  const moduleTitle = module?.module_title ?? `Module ${progress.module_id}`;

  const hasAttendanceForThisModule = attendance.some((item) => {
    const remarks = String(item?.remarks || "").toLowerCase();
    const title = String(moduleTitle || "").toLowerCase();

    return item?.status === "present" && remarks.includes(title);
  });

  const alreadyCompletedReading =
    progress.status === "completed" ||
    progress.status === "in_progress" ||
    hasAttendanceForThisModule;

  const createSession = useCreateTrainingSession();
  const markAttendance = useMark();

  const [pdfOpen, setPdfOpen] = useState(false);
  const [hasReadPdf, setHasReadPdf] = useState(alreadyCompletedReading);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSyncedPercentRef = useRef(
    Number(progress.video_watched_percent ?? 0),
  );

  const VIDEO_REQUIRED_PERCENT = 70;

  const [videoPercent, setVideoPercent] = useState(
    Number(progress.video_watched_percent ?? 0),
  );

  const [hasCompletedVideo, setHasCompletedVideo] = useState(
    progress.status === "completed" ||
      Number(progress.video_watched_percent ?? 0) >= VIDEO_REQUIRED_PERCENT,
  );

  const hasVideo = Boolean(moduleVideo?.video_url);
  const hasPdf = Boolean(pdf);

  const learningCompleted = hasVideo
    ? hasCompletedVideo
    : hasPdf
      ? hasReadPdf
      : true;

  const canStartQuiz = learningCompleted;

  useEffect(() => {
    if (alreadyCompletedReading) {
      setHasReadPdf(true);
    }
  }, [alreadyCompletedReading]);

  useEffect(() => {
    const backendPercent = Number(progress.video_watched_percent ?? 0);

    setVideoPercent(backendPercent);
    lastSyncedPercentRef.current = backendPercent;

    if (
      progress.status === "completed" ||
      backendPercent >= VIDEO_REQUIRED_PERCENT
    ) {
      setHasCompletedVideo(true);
    }
  }, [progress.status, progress.video_watched_percent]);

  const getVideoPayload = () => {
    const video = videoRef.current;

    if (!video || !video.duration || Number.isNaN(video.duration)) {
      return null;
    }

    const watchedSeconds = Math.floor(video.currentTime);
    const durationSeconds = Math.floor(video.duration);

    if (durationSeconds <= 0) {
      return null;
    }

    const safeWatchedSeconds = Math.min(
      Math.max(watchedSeconds, 0),
      durationSeconds,
    );

    const percent = Math.floor((safeWatchedSeconds / durationSeconds) * 100);

    const safePercent = Math.min(Math.max(percent, 0), 100);

    return {
      watchedSeconds: safeWatchedSeconds,
      durationSeconds,
      safePercent,
    };
  };

  const syncVideoProgress = (force = false) => {
    const payload = getVideoPayload();

    if (!payload) {
      return;
    }

    const { watchedSeconds, durationSeconds, safePercent } = payload;

    setVideoPercent(safePercent);

    if (safePercent >= VIDEO_REQUIRED_PERCENT && !hasCompletedVideo) {
      setHasCompletedVideo(true);
      message.success("70% video completed. You can mark this module as done.");
    }

    const shouldSync =
  force ||
  safePercent >= lastSyncedPercentRef.current + 10 ||
  (safePercent >= 70 && lastSyncedPercentRef.current < 70);

    if (!shouldSync || updateVideoProgress.isPending) {
      return;
    }

    lastSyncedPercentRef.current = safePercent;

    updateVideoProgress.mutate({
      progressId: progress.id,
      payload: {
        watched_seconds: watchedSeconds,
        duration_seconds: durationSeconds,
      },
    });
  };

  const handleVideoProgress = () => {
    syncVideoProgress(false);
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
    if (hasReadPdf || alreadyCompletedReading) {
      setHasReadPdf(true);
      setPdfOpen(false);
      message.success("Reading already completed. You can start the test.");
      return;
    }

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
                remarks: `Finished reading ${moduleTitle}`,
              },
            },
            {
              onSuccess: async () => {
                await queryClient.invalidateQueries({
                  queryKey: ["attendance-by-user", userId],
                });

                await queryClient.invalidateQueries({
                  queryKey: ["attendance-summary", userId],
                });

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
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Tag
                color={
                  progress.status === "completed"
                    ? "green"
                    : progress.status === "in_progress"
                      ? "blue"
                      : "default"
                }
              >
                {moduleStatus(progress)}
              </Tag>

              {hasVideo ? (
                <Tag color="purple">Video available</Tag>
              ) : (
                <Tag color="orange">No video</Tag>
              )}

              {hasPdf ? (
                <Tag color="blue">PDF available</Tag>
              ) : (
                <Tag color="orange">No PDF</Tag>
              )}

              {hasVideo && (
                <Tag color={hasCompletedVideo ? "green" : "gold"}>
                  Video: {videoPercent}%
                </Tag>
              )}

              {learningCompleted ? (
                <Tag color="green">Learning unlocked</Tag>
              ) : (
                <Tag color="red">Learning pending</Tag>
              )}
            </div>

            <div className="text-base font-semibold text-slate-900">
              {moduleTitle}
            </div>

            <div className="mt-1 text-sm text-slate-500">
              Complete the learning material before starting the assessment.
            </div>

            {hasVideo && (
              <Card
                className="mt-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                bodyStyle={{ padding: 0 }}
              >
                <div className="bg-slate-950">
                  <div className="relative aspect-video w-full bg-black">
                    <video
                      ref={videoRef}
                      src={moduleVideo.video_url}
                      poster={pdf?.thumbnail_url}
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                      onTimeUpdate={handleVideoProgress}
                      onLoadedMetadata={handleVideoProgress}
                      onPause={() => syncVideoProgress(true)}
                      onEnded={() => syncVideoProgress(true)}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  </div>

                  <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 text-white">
                    <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold">
                          {moduleTitle}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          Watch at least {VIDEO_REQUIRED_PERCENT}% of this video
                          to unlock module completion.
                        </div>
                      </div>

                      <Tag color={hasCompletedVideo ? "green" : "purple"}>
                        {hasCompletedVideo
                          ? "Video completed"
                          : `${videoPercent}% watched`}
                      </Tag>
                    </div>

                    <Progress
                      percent={Math.min(videoPercent, 100)}
                      size="small"
                      status={hasCompletedVideo ? "success" : "active"}
                    />
                  </div>
                </div>
              </Card>
            )}

            {!pdf?.thumbnail_url && hasVideo && (
              <div className="mt-2 text-xs text-slate-400">
                No thumbnail uploaded for this module.
              </div>
            )}
          </div>

          <Space wrap className="lg:justify-end">
            {hasPdf ? (
              <Button icon={<BookOutlined />} onClick={() => setPdfOpen(true)}>
                Open PDF
              </Button>
            ) : (
              <Tag color="orange">No PDF uploaded</Tag>
            )}

            <Button
              type={progress.status === "completed" ? "default" : "primary"}
              disabled={progress.status === "completed" || !learningCompleted}
              loading={completeLoading}
              onClick={() => onCompleteModule(progress.id)}
            >
              {progress.status === "completed"
                ? "Completed"
                : learningCompleted
                  ? "Mark complete"
                  : hasVideo
                    ? `Watch ${VIDEO_REQUIRED_PERCENT}% video first`
                    : hasPdf
                      ? "Read PDF first"
                      : "Mark complete"}
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
                  ? hasVideo
                    ? `Locked: watch ${VIDEO_REQUIRED_PERCENT}% video first`
                    : hasPdf
                      ? "Locked: read PDF first"
                      : `Locked: ${quiz.assessment_title}`
                  : attemptsFinished
                    ? `Attempts finished: ${quiz.assessment_title}`
                    : latest
                      ? `Retake Test: ${quiz.assessment_title}`
                      : `Start Test: ${quiz.assessment_title}`;

              return (
                <div
                  key={quiz.assessment_id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
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

  const complete = useCompleteModule();
  const issueCertificate = useIssueCertificate();

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
    <Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <QuizModal
        assessment={activeQuiz}
        userId={userId}
        open={Boolean(activeQuiz)}
        onClose={() => setActiveQuiz(undefined)}
        durationMinutes={course?.total_duration_minutes ?? 0}
      />

      <div className="flex flex-col gap-6">
        <div className="grid gap-5 md:grid-cols-[240px_1fr]">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {course?.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course?.course_title ?? "Course thumbnail"}
                className="h-48 w-full object-cover md:h-full"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-slate-400 md:h-full">
                No thumbnail
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusTag value={assignment.status} />

                {assignment.is_mandatory && <Tag color="red">Mandatory</Tag>}

                <Tag icon={<ClockCircleOutlined />} color="blue">
                  {formatDuration(course?.total_duration_minutes)}
                </Tag>

                <Tag color="orange">Due: {formatDate(assignment.due_date)}</Tag>
              </div>

              <h3 className="text-2xl font-semibold text-slate-900">
                {course?.course_title ?? `Course ${assignment.course_id}`}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Continue your assigned learning path and complete modules,
                quizzes, and certification.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Course progress
                </span>

                <span className="text-slate-500">
                  {completed}/{total} modules completed
                </span>
              </div>

              <Progress
                percent={percent}
                status={percent === 100 ? "success" : "active"}
              />
            </div>
          </div>
        </div>

        <AttendanceSummary attendances={attendance} />

        {progress.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message="No accessible modules yet"
            description="Ask your manager to assign this course again after modules are created, or generate module progress for this assignment."
          />
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Learning path
                </div>
                <div className="text-sm text-slate-500">
                  Complete modules step by step.
                </div>
              </div>
            </div>

            <Timeline
              mode="left"
              items={progress.map((p, index) => {
                const mod = modules.find((m) => m.module_id === p.module_id);
                const quizzes = moduleAssessments(p.module_id);

                const isCompleted = p.status === "completed";
                const isInProgress = p.status === "in_progress";

                return {
                  color: isCompleted ? "green" : isInProgress ? "blue" : "gray",
                  dot: (
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                        isCompleted
                          ? "border-green-500 bg-green-50 text-green-700"
                          : isInProgress
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-300 bg-slate-50 text-slate-500",
                      ].join(" ")}
                    >
                      {index + 1}
                    </div>
                  ),
                  children: (
                    <ModuleLearningItem
                      progress={p}
                      courseId={assignment.course_id}
                      assignmentId={assignment.assignment_id}
                      module={mod}
                      quizzes={quizzes}
                      userId={userId}
                      attendance={attendance}
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
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="font-semibold text-slate-900">Certificate</div>

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
        subtitle="Continue your assigned learning path."
      />

      {meLoading || isLoading ? (
        <Card loading />
      ) : !userId ? (
        <Alert
          type="warning"
          showIcon
          message="User not found"
          description="Please login again to view your trainings."
        />
      ) : mine.length === 0 ? (
        <Empty description="No trainings assigned to you yet" />
      ) : (
        <div className="grid gap-5">
          {mine.map((assignment) => (
            <TrainingCard
              key={assignment.assignment_id}
              assignment={assignment}
              userId={userId}
            />
          ))}
        </div>
      )}
    </>
  );
}
