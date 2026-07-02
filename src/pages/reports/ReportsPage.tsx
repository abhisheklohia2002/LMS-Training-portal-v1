import { Button, Card, Progress, Table } from "antd";
import Text from "antd/es/typography/Text";
import { PageHeader } from "../../components/common/PageHeader";
import { useReports } from "../../hooks/useReports";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import { TrainingAssignment } from "../../types";
import { formatDate } from "../../helper/formatDate";
import * as XLSX from "xlsx";

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
  const handleExportCSV = ()=>{
    const csvContent = completion.map((item: any) =>{
      return {
        assignment_id: item.assignment_id,
        user: item.user?.full_name ?? "-",
        email: item.user?.email ?? "-",
        courseName: item.courseName,
        due_date: formatDate(item.due_date) || "-",
        completion_date: formatDate(item.completion_date) || "-",
        status: item.status || "-"
      }
    })
    const worksheet = XLSX.utils.json_to_sheet(csvContent);
        const workbook = XLSX.utils.book_new();
    
        XLSX.utils.book_append_sheet(workbook, worksheet, "CSV");
    
        const time = new Date();
    
        XLSX.writeFile(workbook, `Completion-Report-${String(time.getTime())}.xlsx`);
  }
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Training, assessment and certificate mock reports."
        actions={<Button 
          onClick={handleExportCSV}
          className={ui.actionButton}>Export CSV</Button>}
      />

      <div className="grid gap-4">
        <Card
          loading={isLoading}
          title="Training completion report"
          className={ui.card + "w-full"}
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
                render: (_: number, record: TrainingAssignment) => (
                  <Text className={ui.text}>
                    {record.user?.full_name ?? "-"}
                  </Text>
                ),
              },
              {
                title: "Email",
                dataIndex: "user_id",
                render: (_: number, record: TrainingAssignment) => (
                  <Text className={ui.text}>{record.user?.email ?? "-"}</Text>
                ),
              },
              {
                title: "Course",
                dataIndex: "courseName",
                render: (value: string) => (
                  <Text className={ui.text}>{value ?? "-"}</Text>
                ),
              },
             
              {
                title: "Due Date",
                dataIndex: "due_date",
                render: (value: string) => (
                  <Text className={ui.text}>{formatDate(value) || "-"}</Text>
                ),
              },
              {
                title: "Completion Date",
                dataIndex: "completion_date",
                render: (value: string) => (
                  <Text className={ui.text}>{formatDate(value) || "-"}</Text>
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
      </div>
    </>
  );
}
