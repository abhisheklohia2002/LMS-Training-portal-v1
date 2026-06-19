import { useEffect, useState } from "react";
import { Button, Modal, Space, Tag, Upload, message } from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
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

  thumbnail_name?: string;
  thumbnail_url?: string;
  thumbnail_public_id?: string;
  thumbnail_size?: number;
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState<ModuleDocument | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const documents: ModuleDocument[] = data?.documents || data || [];
  const latestPdf = currentPdf || documents?.[0] || null;

  useEffect(() => {
    if (!currentPdf && documents?.length > 0) {
      setCurrentPdf(documents[0]);
    }
  }, [documents, currentPdf]);

  const resetUploadState = () => {
    setPdfFile(null);
    setThumbnailFile(null);
  };

  const handleUpload = () => {
    if (!pdfFile) {
      message.error("Please select PDF file");
      return;
    }

    if (!thumbnailFile) {
      message.error("Please select thumbnail image");
      return;
    }

    const payload: {
      moduleId: number;
      file: File;
      thumbnail: File;
      title: string;
      publicId?: string;
      oldThumbnailPublicId?: string;
    } = {
      moduleId,
      file: pdfFile,
      thumbnail: thumbnailFile,
      title: moduleTitle,
    };

    if (latestPdf?.public_id) {
      payload.publicId = latestPdf.public_id;
    }

    if (latestPdf?.thumbnail_public_id) {
      payload.oldThumbnailPublicId = latestPdf.thumbnail_public_id;
    }

    uploadModulePdf.mutate(payload, {
      onSuccess: (data) => {
        message.success("PDF uploaded successfully");

        if (data?.document) {
          setCurrentPdf(data.document);
          setPreviewOpen(true);
        }

        setUploadOpen(false);
        resetUploadState();
      },
      onError: () => {
        message.error("PDF upload failed");
      },
    });
  };

  return (
    <>
      <Space>
        {latestPdf ? (
          <>
            <Tag color="green">PDF uploaded</Tag>

            {latestPdf.thumbnail_url ? (
              <img
                src={latestPdf.thumbnail_url}
                alt={latestPdf.title}
                style={{
                  width: 42,
                  height: 42,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Tag color="orange">No thumbnail</Tag>
            )}

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

        <Button
          size="small"
          icon={<UploadOutlined />}
          loading={uploadModulePdf.isPending}
          onClick={() => setUploadOpen(true)}
        >
          {latestPdf ? "Replace/Add" : "Upload PDF"}
        </Button>
      </Space>

      <Modal
        open={uploadOpen}
        title={latestPdf ? "Replace PDF and Thumbnail" : "Upload PDF and Thumbnail"}
        onCancel={() => {
          setUploadOpen(false);
          resetUploadState();
        }}
        onOk={handleUpload}
        okText={latestPdf ? "Replace" : "Upload"}
        confirmLoading={uploadModulePdf.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <p style={{ marginBottom: 8 }}>PDF file</p>

            <Upload
              accept="application/pdf"
              maxCount={1}
              beforeUpload={(file) => {
                if (file.type !== "application/pdf") {
                  message.error("Only PDF files are allowed");
                  return Upload.LIST_IGNORE;
                }

                setPdfFile(file);
                return false;
              }}
              onRemove={() => {
                setPdfFile(null);
              }}
            >
              <Button icon={<UploadOutlined />}>Select PDF</Button>
            </Upload>
          </div>

          <div>
            <p style={{ marginBottom: 8 }}>Thumbnail image</p>

            <Upload
              accept="image/png,image/jpeg,image/jpg,image/webp"
              maxCount={1}
              listType="picture"
              beforeUpload={(file) => {
                const allowedTypes = [
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/webp",
                ];

                if (!allowedTypes.includes(file.type)) {
                  message.error("Only PNG, JPG, JPEG, or WEBP images are allowed");
                  return Upload.LIST_IGNORE;
                }

                setThumbnailFile(file);
                return false;
              }}
              onRemove={() => {
                setThumbnailFile(null);
              }}
            >
              <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
            </Upload>
          </div>
        </Space>
      </Modal>

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