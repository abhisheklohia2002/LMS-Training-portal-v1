import { useEffect, useState } from "react";
import { Button, Modal, Space, Tag, Upload, message } from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";
import {
  useModuleDocuments,
  useUploadModulePdf,
} from "../../hooks/useModuleDocuments";

type ModuleDocument = {
  document_id: number;
  module_id: number;
  title: string;
  file_name: string;
  file_url: string;
  public_id: string;
  file_type: string;
  file_size: number;
  page_count: number;
  is_active: boolean;
};

export function ModulePdfCell({
  moduleId,
  moduleTitle,
  courseId,
}: {
  moduleId: number;
  moduleTitle: string;
  courseId: number;
}) {
  const { data } = useModuleDocuments(moduleId);
  const uploadModulePdf = useUploadModulePdf(courseId);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState<ModuleDocument | null>(null);

  const documents: ModuleDocument[] = data?.documents || data || [];
  const latestPdf = currentPdf || documents?.[0] || null;

  useEffect(() => {
    if (!currentPdf && documents?.length > 0) {
      setCurrentPdf(documents[0]);
    }
  }, [documents, currentPdf]);

  return (
    <>
      <Space>
        {latestPdf ? (
          <>
            <Tag color="green">PDF uploaded</Tag>

            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
          </>
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
                onSuccess: (data) => {
                  message.success("PDF uploaded successfully");
                  if (data?.document) {
                    setCurrentPdf(data.document);
                    setPreviewOpen(true);
                  }
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

      <Modal
        open={previewOpen}
        title={latestPdf?.title || "PDF Preview"}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        {latestPdf?.file_url ? (
          <iframe
            src={latestPdf.file_url}
            title={latestPdf.title}
            style={{
              width: "100%",
              height: "80vh",
              border: "none",
            }}
          />
        ) : (
          <p>No PDF available</p>
        )}
      </Modal>
    </>
  );
}