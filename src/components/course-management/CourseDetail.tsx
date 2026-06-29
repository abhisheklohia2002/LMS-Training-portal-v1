import { Tabs } from "antd";
import { CourseModulesTab } from "./CourseModulesTab";
import { CourseAssessmentsTab } from "./CourseAssessmentsTab";
import { CourseRulesTab } from "./CourseRulesTab";
import { CourseCertificationTab } from "./CourseCertificationTab";
import { CourseAssignmentsTab } from "./CourseAssignmentsTab";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

type CourseDetailProps = {
  courseId: number;
};

export function CourseDetail({ courseId }: CourseDetailProps) {
   const { isDarkMode } = useThemeMode();

  const ui = {
    wrapper: isDarkMode
      ? "rounded-xl bg-[#0F172A] text-[#EAF0F7]"
      : "rounded-xl bg-slate-50 text-slate-900",
  };
  return (
    <div className={ui.wrapper}>
      <Tabs
      className={isDarkMode ? "course-tabs-dark" : "course-tabs-light"}
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
    </div>
  );
}