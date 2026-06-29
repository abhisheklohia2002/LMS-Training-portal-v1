import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Card, Progress, Skeleton, Timeline } from "antd";
import Text from "antd/es/typography/Text";

import { PageHeader } from "../../components/common/PageHeader";
import { MetricCard } from "../../components/common/MetricCard";
import { useUsers } from "../../hooks/useUsers";
import { useCourses } from "../../hooks/useCourses";
import { useTrainingAssignments } from "../../hooks/useTrainingAssignments";
import { useCertificateIssues } from "../../hooks/useCertificateIssues";
import { useAssessmentAttempts } from "../../hooks/useAssessmentAttempts";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

export function DashboardPage() {
  const { isDarkMode } = useThemeMode();

  const ui = {
    card: isDarkMode
      ? "rounded-2xl border border-[#253249] bg-[#111C2E] text-[#EAF0F7] shadow-sm"
      : "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm",

    skeletonCard: isDarkMode
      ? "rounded-2xl border border-[#253249] bg-[#111C2E] p-5"
      : "rounded-2xl border border-slate-200 bg-white p-5",

    text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",
    muted: isDarkMode ? "text-slate-400" : "text-slate-500",
  };

  const users = useUsers();
  const courses = useCourses();
  const assignments = useTrainingAssignments();
  const certs = useCertificateIssues();
  const attempts = useAssessmentAttempts();

  const isLoading = [users, courses, assignments, certs, attempts].some(
    (query) => query.isLoading,
  );

  if (isLoading) {
    return (
      <div className={ui.skeletonCard}>
        <Skeleton active />
      </div>
    );
  }

  const totalAssignments = assignments.data?.length || 0;

  const completedAssignments =
    assignments.data?.filter((assignment) => assignment.status === "completed")
      .length ?? 0;

  const pending =
    assignments.data?.filter((assignment) => assignment.status !== "completed")
      .length ?? 0;

  const passedAttempts =
    attempts.data?.filter((attempt) => attempt.result_status === "passed")
      .length ?? 0;

  const passRate = attempts.data?.length
    ? Math.round((passedAttempts / attempts.data.length) * 100)
    : 0;

  const completionPercent = Math.round(
    (completedAssignments / (totalAssignments || 1)) * 100,
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your training program."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total users"
          value={users.data?.length ?? 0}
          icon={<TeamOutlined />}
        />

        <MetricCard
          title="Active courses"
          value={courses.data?.filter((course) => course.is_active).length ?? 0}
          icon={<BookOutlined />}
        />

        <MetricCard
          title="Pending assignments"
          value={pending}
          icon={<ClockCircleOutlined />}
        />

        <MetricCard
          title="Certificates"
          value={certs.data?.length ?? 0}
          icon={<SafetyCertificateOutlined />}
        />

        <MetricCard
          title="Pass rate"
          value={passRate}
          suffix="%"
          icon={<CheckCircleOutlined />}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="Training completion"
          className={`${ui.card} lg:col-span-2`}
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Text className={ui.text}>Module completion</Text>
                <Text className={ui.muted}>{completionPercent}%</Text>
              </div>

              <Progress
                percent={completionPercent}
                status={completionPercent === 100 ? "success" : "active"}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Text className={ui.text}>Assessment pass rate</Text>
                <Text className={ui.muted}>{passRate}%</Text>
              </div>

              <Progress
                percent={passRate}
                status={passRate === 100 ? "success" : "active"}
              />
            </div>
          </div>
        </Card>

        <Card title="Recent activity" className={ui.card}>
          <Timeline
            items={[
              {
                color: "blue",
                children: <Text className={ui.text}>Course assigned to David</Text>,
              },
              {
                color: "green",
                children: <Text className={ui.text}>Password quiz passed</Text>,
              },
              {
                color: "purple",
                children: <Text className={ui.text}>Certificate issued</Text>,
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}