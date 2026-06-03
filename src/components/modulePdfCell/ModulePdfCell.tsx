import { Button, message, Space, Tag, Upload } from "antd";
import { useModuleDocuments } from "../../hooks/useModuleDocuments";
import { useUploadModulePdf } from "../../hooks/useuploadfile";
import { UploadOutlined } from "@ant-design/icons";

export default function ModulePdfCell({
  moduleId,
  moduleTitle,
  courseId,
}: {
  moduleId: number;
  moduleTitle: string;
  courseId: number;
}) {
  const { data, isLoading } = useModuleDocuments(moduleId);
  const uploadModulePdf = useUploadModulePdf(courseId);

  const documents = data?.documents || data || [];
  const latestPdf = documents?.[0];

  return (
    <Space>
      {latestPdf ? (
        <Button
          size="small"
          onClick={() => window.open(latestPdf.file_url, "_blank")}
        >
          Preview PDF
        </Button>
      ) : (
        <Tag color="red">No PDF</Tag>
      )}

      <Upload
        accept="application/pdf"
        showUploadList={false}
        beforeUpload={(file) => {
          if (file.type !== "application/pdf") {
            message.error("Only PDF files are allowed");
            return Upload.LIST_IGNORE;
          }

          uploadModulePdf.mutate(
            {
              moduleId,
              file,
              title: moduleTitle,
            },
            {
              onSuccess: () => {
                message.success("PDF uploaded successfully");
              },
              onError: () => {
                message.error("PDF upload failed");
              },
            },
          );

          return false;
        }}
      >
        <Button
          size="small"
          icon={<UploadOutlined />}
          loading={uploadModulePdf.isPending}
        >
          {latestPdf ? "Replace/Add" : "Upload PDF"}
        </Button>
      </Upload>
    </Space>
  );
}