import { useEffect, useState } from "react";
import { Button, Modal, Space, Tag, Upload, message } from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";
import {
  useModuleDocuments,
  useModuleVideo,
  useUploadModulePdf,
  useUploadModuleVideo,
} from "../../hooks/useModuleDocuments";
import { Progress } from "antd";

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

type ModuleVideo = {
  video_id: number;
  course_id: number;
  module_id: number;
  title?: string;
  video_name?: string;
  video_url?: string;
  video_public_id?: string;
  video_size?: number;
  video_type?: string;
  is_active?: boolean;
};

type Props = {
  moduleId: number;
  moduleTitle: string;
  courseId: number;
};

export function ModulePdfCell({ moduleId, moduleTitle, courseId }: Props) {
  const { data } = useModuleDocuments(moduleId);
  const { data: videoData } = useModuleVideo(moduleId);

  const [videoProgress, setVideoProgress] = useState(0);
  const uploadModulePdf = useUploadModulePdf(courseId);
  const uploadModuleVideo = useUploadModuleVideo(courseId);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [videoUploadOpen, setVideoUploadOpen] = useState(false);
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);

  const [currentPdf, setCurrentPdf] = useState<ModuleDocument | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const documents: ModuleDocument[] = data?.documents || data || [];
  const latestPdf = currentPdf || documents?.[0] || null;

  const moduleVideo: ModuleVideo | null = videoData?.video || null;

  useEffect(() => {
    if (!currentPdf && documents.length > 0) {
      setCurrentPdf(documents[0]);
    }
  }, [documents, currentPdf]);

  const resetPdfUploadState = () => {
    setPdfFile(null);
    setThumbnailFile(null);
  };

  const resetVideoUploadState = () => {
    setVideoFile(null);
    setVideoProgress(0);
  };

  const handlePdfUpload = () => {
    if (!pdfFile) {
      message.error("Please select PDF file");
      return;
    }

    if (!thumbnailFile) {
      message.error("Please select thumbnail image");
      return;
    }
    setUploadOpen(!uploadOpen);

    uploadModulePdf.mutate(
      {
        moduleId,
        file: pdfFile,
        thumbnail: thumbnailFile,
        title: moduleTitle,
        publicId: latestPdf?.public_id,
        oldThumbnailPublicId: latestPdf?.thumbnail_public_id,
      },
      {
        onSuccess: (response) => {
          message.success("PDF and thumbnail uploaded successfully");

          if (response?.document) {
            setCurrentPdf(response.document);
            setPreviewOpen(true);
          }

          setUploadOpen(false);
          resetPdfUploadState();
        },
        onError: () => {
          message.error("PDF upload failed");
        },
      },
    );
  };

  const handleVideoUpload = () => {
    if (!videoFile) {
      message.error("Please select video file");
      return;
    }
    // setVideoUploadOpen(!videoUploadOpen)
    uploadModuleVideo.mutate(
      {
        courseId,
        moduleId,
        video: videoFile,
        title: moduleTitle,
        oldVideoPublicId: moduleVideo?.video_public_id,
      },
      {
        onSuccess: () => {
          message.success("Video uploaded successfully");
          setVideoUploadOpen(false);
          resetVideoUploadState();
        },
        onError: () => {
          message.error("Video upload failed");
        },
      },
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 620,
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            background: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {latestPdf?.thumbnail_url ? (
            <img
              src={latestPdf.thumbnail_url}
              alt={latestPdf.title || moduleTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ fontSize: 11, color: "#999" }}>No image</span>
          )}
        </div>

        <Space direction="vertical" size={8}>
          <Space size={8}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              disabled={!latestPdf?.file_url}
              onClick={() => setPreviewOpen(true)}
              style={{
                width: 90,
                backgroundColor: latestPdf?.file_url ? "green" : undefined,
                color: latestPdf?.file_url ? "white" : undefined,
              }}
            >
              PDF
            </Button>

            <Button
              size="small"
              type={latestPdf ? "default" : "primary"}
              icon={<UploadOutlined />}
              loading={uploadModulePdf.isPending}
              onClick={() => setUploadOpen(true)}
              style={{ width: 130 }}
            >
              {latestPdf ? "Replace PDF" : "Upload PDF"}
            </Button>
          </Space>

          <Space size={8}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              disabled={!moduleVideo?.video_url}
              onClick={() => setVideoPreviewOpen(true)}
              style={{
                width: 90,
                backgroundColor: moduleVideo?.video_url ? "green" : undefined,
                color: moduleVideo?.video_url ? "white" : undefined,
              }}
            >
              Video
            </Button>

            <Button
              size="small"
              icon={<UploadOutlined />}
              loading={uploadModuleVideo.isPending}
              onClick={() => setVideoUploadOpen(true)}
              style={{ width: 130 }}
            >
              {moduleVideo?.video_url ? "Replace Video" : "Upload Video"}
            </Button>
          </Space>
        </Space>
      </div>

      <Modal
        open={uploadOpen}
        title={
          latestPdf ? "Replace PDF and Thumbnail" : "Upload PDF and Thumbnail"
        }
        onCancel={() => {
          setUploadOpen(false);
          resetPdfUploadState();
        }}
        onOk={handlePdfUpload}
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
                  message.error(
                    "Only PNG, JPG, JPEG, or WEBP images are allowed",
                  );
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
        open={videoUploadOpen}
        title={moduleVideo?.video_url ? "Replace Video" : "Upload Video"}
        onCancel={() => {
          setVideoUploadOpen(false);
          resetVideoUploadState();
        }}
        onOk={handleVideoUpload}
        okText={moduleVideo?.video_url ? "Replace Video" : "Upload Video"}
        confirmLoading={uploadModuleVideo.isPending}
      >
        <Upload
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          maxCount={1}
          beforeUpload={(file) => {
            const allowedTypes = [
              "video/mp4",
              "video/quicktime",
              "video/webm",
              "video/x-matroska",
            ];

            if (!allowedTypes.includes(file.type)) {
              message.error("Only MP4, MOV, WEBM, or MKV videos are allowed");
              return Upload.LIST_IGNORE;
            }

            setVideoFile(file);
            return false;
          }}
          onRemove={() => {
            setVideoFile(null);
          }}
        >
          <Button icon={<UploadOutlined />}>Select Video</Button>
        </Upload>
        {uploadModuleVideo.isPending && (
          <Progress percent={videoProgress} size="small" status="active" />
        )}
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
            title={latestPdf.title || "PDF Preview"}
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

      <Modal
        open={videoPreviewOpen}
        title={moduleVideo?.title || moduleVideo?.video_name || "Video Preview"}
        onCancel={() => setVideoPreviewOpen(false)}
        footer={null}
        width="70%"
        style={{ top: 30 }}
      >
        {moduleVideo?.video_url ? (
          <video
            src={moduleVideo.video_url}
            controls
            style={{
              width: "100%",
              maxHeight: "75vh",
              borderRadius: 8,
              background: "#000",
            }}
          />
        ) : (
          <p>No video available</p>
        )}
      </Modal>
    </>
  );
}
