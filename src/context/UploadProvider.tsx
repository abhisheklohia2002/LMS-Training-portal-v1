// src/context/UploadProvider.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Progress, Button, message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useThemeMode } from "./ThemeProvider/ThemeProvider";

type UploadKind = "pdf" | "video";

type UploadStatus =
  | "uploading"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

type UploadItem = {
  localId: string;
  taskId?: string;
  kind: UploadKind;
  courseId: number;
  moduleId: number;
  fileName: string;
  status: UploadStatus;
  progress: number;
  message: string;
};

type StartVideoUploadParams = {
  courseId: number;
  moduleId: number;
  video: File;
  title?: string;
  oldVideoPublicId?: string;
};

type StartPDFUploadParams = {
  courseId: number;
  moduleId: number;
  file: File;
  thumbnail: File;
  title?: string;
  publicId?: string;
  oldThumbnailPublicId?: string;
};

type UploadContextValue = {
  uploads: UploadItem[];
  startVideoUpload: (params: StartVideoUploadParams) => Promise<void>;
  startPDFUpload: (params: StartPDFUploadParams) => Promise<void>;
  removeUpload: (localId: string) => void;
};

const UPLOAD_STORAGE_KEY = "lms_active_uploads";

function saveUploadsToStorage(uploads: UploadItem[]) {
  const restorableUploads = uploads.filter((item) => item.taskId);

  localStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(restorableUploads));
}

function loadUploadsFromStorage(): UploadItem[] {
  try {
    const raw = localStorage.getItem(UPLOAD_STORAGE_KEY);
    if (!raw) return [];

    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadItem[]>(() =>
    loadUploadsFromStorage(),
  );
  const timers = useRef<Record<string, number>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timerId) => {
        clearInterval(timerId);
      });

      timers.current = {};
    };
  }, []);

  const startVideoUpload = async ({
    courseId,
    moduleId,
    video,
    title,
    oldVideoPublicId,
  }: StartVideoUploadParams) => {
    const localId = crypto.randomUUID();

    setUploads((prev) => [
      ...prev,
      {
        localId,
        kind: "video",
        courseId,
        moduleId,
        fileName: video.name,
        status: "uploading",
        progress: 0,
        message: "Uploading video...",
      },
    ]);

    try {
      const data = await api.uploadModuleVideo({
        courseId,
        moduleId,
        video,
        title,
        oldVideoPublicId,
        onProgress: (percent: number) => {
          setUploads((prev) =>
            prev.map((item) =>
              item.localId === localId
                ? {
                    ...item,
                    progress: Math.min(percent, 95),
                    message: `Uploading video... ${percent}%`,
                  }
                : item,
            ),
          );
        },
      });

      setUploads((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? {
                ...item,
                taskId: data.task_id,
                status: "queued",
                progress: 95,
                message: "Video accepted. Processing started.",
              }
            : item,
        ),
      );

      pollVideoTask({
        localId,
        taskId: data.task_id,
        courseId,
        moduleId,
      });
    } catch (error: any) {
      setUploads((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? {
                ...item,
                status: "failed",
                progress: 100,
                message: error?.message || "Video upload failed",
              }
            : item,
        ),
      );
    }
  };

  const startPDFUpload = async ({
    courseId,
    moduleId,
    file,
    thumbnail,
    title,
    publicId,
    oldThumbnailPublicId,
  }: StartPDFUploadParams) => {
    const localId = crypto.randomUUID();

    setUploads((prev) => [
      ...prev,
      {
        localId,
        kind: "pdf",
        courseId,
        moduleId,
        fileName: file.name,
        status: "uploading",
        progress: 0,
        message: "Uploading PDF and thumbnail...",
      },
    ]);

    try {
      const data = await api.uploadModulePdf({
        moduleId,
        file,
        thumbnail,
        title,
        publicId,
        oldThumbnailPublicId,
        onProgress: (percent: number) => {
          setUploads((prev) =>
            prev.map((item) =>
              item.localId === localId
                ? {
                    ...item,
                    progress: Math.min(percent, 95),
                    message: `Uploading PDF... ${percent}%`,
                  }
                : item,
            ),
          );
        },
      });

      console.log("PDF upload response:", data);

      const taskId = data?.task_id;

      if (!taskId) {
        throw new Error("Upload accepted but task_id missing from response");
      }

      setUploads((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? {
                ...item,
                taskId,
                status: "queued",
                progress: 95,
                message: "PDF accepted. Processing started.",
              }
            : item,
        ),
      );

      pollPDFTask({
        localId,
        taskId,
        courseId,
        moduleId,
      });
    } catch (error: any) {
      setUploads((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? {
                ...item,
                status: "failed",
                progress: 100,
                message: error?.message || "PDF upload failed",
              }
            : item,
        ),
      );
    }
  };

  const pollVideoTask = ({
    localId,
    taskId,
    courseId,
    moduleId,
  }: {
    localId: string;
    taskId: string;
    courseId: number;
    moduleId: number;
  }) => {
    if (timers.current[taskId]) return;

    timers.current[taskId] = window.setInterval(async () => {
      try {
        const data = await api.getVideoUploadTaskStatus(taskId);

        setUploads((prev) =>
          prev.map((item) =>
            item.localId === localId
              ? {
                  ...item,
                  status: data.status,
                  progress: data.progress,
                  message: data.error || data.message,
                }
              : item,
          ),
        );

        if (data.status === "completed") {
          stopPolling(taskId);

          queryClient.invalidateQueries({
            queryKey: ["module-video", moduleId],
          });

          queryClient.invalidateQueries({
            queryKey: ["module-documents", moduleId],
          });

          queryClient.invalidateQueries({
            queryKey: ["modules", courseId],
          });

          message.success("Video uploaded successfully");
        }

        if (data.status === "failed") {
          stopPolling(taskId);
          message.error(data.error || "Video upload failed");
        }
      } catch {
        // Temporary network issue. Do not fail immediately.
      }
    }, 1500);
  };

  const pollPDFTask = ({
    localId,
    taskId,
    courseId,
    moduleId,
  }: {
    localId: string;
    taskId: string;
    courseId: number;
    moduleId: number;
  }) => {
    if (!taskId) {
      message.error("Missing PDF upload task ID");
      return;
    }

    if (timers.current[taskId]) return;

    timers.current[taskId] = window.setInterval(async () => {
      try {
        const data = await api.getPDFUploadTaskStatus(taskId);

        setUploads((prev) =>
          prev.map((item) =>
            item.localId === localId
              ? {
                  ...item,
                  status: data.status,
                  progress: data.progress,
                  message: data.error || data.message,
                }
              : item,
          ),
        );

        if (data.status === "completed") {
          stopPolling(taskId);

          queryClient.invalidateQueries({
            queryKey: ["module-documents", moduleId],
          });

          queryClient.invalidateQueries({
            queryKey: ["modules", courseId],
          });

          message.success("PDF uploaded successfully");
        }

        if (data.status === "failed") {
          stopPolling(taskId);
          message.error(data.error || "PDF upload failed");
        }
      } catch {
        // Temporary network issue. Do not fail immediately.
      }
    }, 1500);
  };

  const stopPolling = (taskId: string) => {
    if (!timers.current[taskId]) return;

    clearInterval(timers.current[taskId]);
    delete timers.current[taskId];
  };

  const removeUpload = (localId: string) => {
    setUploads((prev) => prev.filter((item) => item.localId !== localId));
  };
  useEffect(() => {
    saveUploadsToStorage(uploads);
  }, [uploads]);

  useEffect(() => {
    uploads.forEach((item) => {
      if (!item.taskId) return;

      if (item.status === "completed" || item.status === "failed") {
        return;
      }

      if (item.kind === "video") {
        pollVideoTask({
          localId: item.localId,
          taskId: item.taskId,
          courseId: item.courseId,
          moduleId: item.moduleId,
        });
      }

      if (item.kind === "pdf") {
        pollPDFTask({
          localId: item.localId,
          taskId: item.taskId,
          courseId: item.courseId,
          moduleId: item.moduleId,
        });
      }
    });
  }, []);

  return (
    <UploadContext.Provider
      value={{
        uploads,
        startVideoUpload,
        startPDFUpload,
        removeUpload,
      }}
    >
      {children}
      <GlobalUploadWidget />
    </UploadContext.Provider>
  );
}

export function useUploadManager() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUploadManager must be used inside UploadProvider");
  }

  return context;
}


function GlobalUploadWidget() {
  const { uploads, removeUpload } = useUploadManager();
  const { isDarkMode } = useThemeMode();

  if (!uploads.length) return null;

  const ui = {
    wrapper: {
      position: "fixed" as const,
      right: 20,
      bottom: 20,
      width: 360,
      background: isDarkMode ? "#111C2E" : "#FFFFFF",
      border: `1px solid ${isDarkMode ? "#253249" : "#E5E7EB"}`,
      borderRadius: 12,
      padding: 14,
      boxShadow: isDarkMode
        ? "0 10px 35px rgba(0,0,0,0.45)"
        : "0 10px 35px rgba(0,0,0,0.18)",
      zIndex: 9999,
      color: isDarkMode ? "#EAF0F7" : "#111827",
    },

    title: {
      color: isDarkMode ? "#EAF0F7" : "#111827",
    },

    item: {
      marginTop: 12,
      borderTop: `1px solid ${isDarkMode ? "#253249" : "#EEF2F7"}`,
      paddingTop: 12,
    },

    fileName: {
      fontSize: 13,
      fontWeight: 500,
      color: isDarkMode ? "#EAF0F7" : "#111827",
      wordBreak: "break-word" as const,
    },

    message: {
      fontSize: 12,
      color: isDarkMode ? "#94A3B8" : "#666666",
      marginBottom: 6,
      marginTop: 4,
    },

    dismissButton: isDarkMode
      ? "border-[#253249] bg-[#0F172A] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
      : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",
  };

  return (
    <div style={ui.wrapper}>
      <strong style={ui.title}>Uploads</strong>

      {uploads.map((item) => (
        <div key={item.localId} style={ui.item}>
          <div style={ui.fileName}>
            <strong>
              {item.kind === "pdf" ? "PDF Upload" : "Video Upload"}
            </strong>
            : {item.fileName}
          </div>

          <div style={ui.message}>{item.message}</div>

          <Progress
            percent={item.progress}
            strokeColor={isDarkMode ? "#22C7B8" : "#F86A5B"}
            trailColor={isDarkMode ? "#253249" : "#F1F5F9"}
            size="small"
            status={item.status === "failed" ? "exception" : "active"}
          />

          {(item.status === "completed" || item.status === "failed") && (
            <Button
              size="small"
              className={ui.dismissButton}
              style={{ marginTop: 8 }}
              onClick={() => removeUpload(item.localId)}
            >
              Dismiss
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
