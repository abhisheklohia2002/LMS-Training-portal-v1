import { Card, Empty, Tag } from "antd";
import type { Attendance } from "../../hooks/useAttendance";

type Props = {
  attendances: Attendance[];
};

export function AttendanceSummary({ attendances }: Props) {
  const total = attendances.length;

  const present = attendances.filter((a) => a.status === "present").length;
  const absent = attendances.filter((a) => a.status === "absent").length;
  const late = attendances.filter((a) => a.status === "late").length;
  const excused = attendances.filter((a) => a.status === "excused").length;

  const attended = present + late + excused;
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

  if (total === 0) {
    return (
      <Card size="small" className="border-dashed">
        <Empty description="No attendance marked yet" />
      </Card>
    );
  }

  return (
    <Card size="small" className="border-dashed">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Attendance</div>
          <Tag color="blue">{percentage}%</Tag>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tag color="green">Present: {present}</Tag>
          <Tag color="red">Absent: {absent}</Tag>
          <Tag color="orange">Late: {late}</Tag>
          <Tag color="cyan">Excused: {excused}</Tag>
        </div>
      </div>
    </Card>
  );
}