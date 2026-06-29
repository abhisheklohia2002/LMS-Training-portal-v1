import { Button, Card, Progress, Table } from "antd";
import Text from "antd/es/typography/Text";
import { PageHeader } from "../../components/common/PageHeader";
import { useReports } from "../../hooks/useReports";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

export function ReportsPage() {
  const { isDarkMode } = useThemeMode();

  const ui = {
    card: isDarkMode
      ? "rounded-2xl border border-[#253249] bg-[#111C2E] text-[#EAF0F7] shadow-sm"
      : "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm",

    text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",

    actionButton: isDarkMode
      ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
      : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",
  };

  const { data, isLoading } = useReports();

  const completion = data?.completion ?? [];

  const completed = completion.filter(
    (a: { status: string }) => a.status === "completed",
  ).length;

  const completionPercent = Math.round(
    (completed / (completion.length || 1)) * 100,
  );

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Training, assessment and certificate mock reports."
        actions={
          <Button className={ui.actionButton}>
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          loading={isLoading}
          title="Training completion report"
          className={ui.card}
        >
          <Progress
            percent={completionPercent}
            status={completionPercent === 100 ? "success" : "active"}
          />

          <Table
            size="small"
            dataSource={completion}
            rowKey="assignment_id"
            pagination={false}
            columns={[
              {
                title: "Assignment",
                dataIndex: "assignment_id",
                render: (value: number) => (
                  <Text className={ui.text}>{value ?? "-"}</Text>
                ),
              },
              {
                title: "User",
                dataIndex: "user_id",
                render: (value: number) => (
                  <Text className={ui.text}>{value ?? "-"}</Text>
                ),
              },
              {
                title: "Course",
                dataIndex: "course_id",
                render: (value: number) => (
                  <Text className={ui.text}>{value ?? "-"}</Text>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (value: string) => (
                  <Text className={ui.text}>{value || "-"}</Text>
                ),
              },
            ]}
          />
        </Card>

        <Card
          loading={isLoading}
          title="Certificate expiry report"
          className={ui.card}
        >
          <Table
            size="small"
            dataSource={data?.certificates ?? []}
            rowKey="certificate_issue_id"
            pagination={false}
            columns={[
              {
                title: "Number",
                dataIndex: "certificate_number",
                render: (value: string) => (
                  <Text className={ui.text}>{value || "-"}</Text>
                ),
              },
              {
                title: "User",
                dataIndex: "user_id",
                render: (value: number) => (
                  <Text className={ui.text}>{value ?? "-"}</Text>
                ),
              },
              {
                title: "Expiry",
                dataIndex: "expiry_date",
                render: (value: string) => (
                  <Text className={ui.text}>{value || "-"}</Text>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}