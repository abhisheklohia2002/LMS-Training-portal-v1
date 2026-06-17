import { Tabs } from "antd";
import { CourseModulesTab } from "./CourseModulesTab";
import { CourseAssessmentsTab } from "./CourseAssessmentsTab";
import { CourseRulesTab } from "./CourseRulesTab";
import { CourseCertificationTab } from "./CourseCertificationTab";
import { CourseAssignmentsTab } from "./CourseAssignmentsTab";

type CourseDetailProps = {
  courseId: number;
};

export function CourseDetail({ courseId }: CourseDetailProps) {
  return (
    <Tabs
      items={[
        {
          key: "modules",
          label: "Modules",
          children: <CourseModulesTab courseId={courseId} />,
        },
        {
          key: "rules",
          label: "Rules",
          children: <CourseRulesTab courseId={courseId} />,
        },
        {
          key: "assessments",
          label: "Assessments",
          children: <CourseAssessmentsTab courseId={courseId} />,
        },
        {
          key: "certification",
          label: "Certification",
          children: <CourseCertificationTab courseId={courseId} />,
        },
        {
          key: "assignments",
          label: "Assigned Users",
          children: <CourseAssignmentsTab courseId={courseId} />,
        },
      ]}
    />
  );
}