"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* ===== Types ===== */

export interface FileUploadFile {
  file: File;
  id: string;
  preview?: string;
}

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  label?: string;
  description?: string;
  value?: FileUploadFile[];
  onChange?: (files: FileUploadFile[]) => void;
  onPreview?: (file: FileUploadFile) => void;
  className?: string;
  disabled?: boolean;
}

/* ===== Helpers ===== */

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function getAcceptLabel(accept?: string) {
  if (!accept) return "Semua file";
  return accept
    .split(",")
    .map((t) => t.trim().replace("image/", "").replace("application/", "").toUpperCase())
    .join(", ");
}

// Map file extension to icon path in /public/icon/
const ICON_MAP: Record<string, string> = {
  jpg: "/icon/jpg.svg",
  jpeg: "/icon/jpg.svg",
  png: "/icon/png.svg",
  pdf: "/icon/pdf.svg",
  csv: "/icon/csv.svg",
  xls: "/icon/xls.svg",
  xlsx: "/icon/xls.svg",
  doc: "/icon/docx.svg",
  docx: "/icon/docx.svg",
  txt: "/icon/txt.svg",
  url: "/icon/url.svg",
};

function getFileIcon(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return ICON_MAP[ext] || null;
}

/* ===== Component ===== */

export function FileUpload({
  multiple = false,
  accept,
  maxSize = 1 * 1024 * 1024,
  maxFiles = 5,
  label,
  description,
  value,
  onChange,
  onPreview,
  className,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadFile[]>(value || []);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentFiles = value !== undefined ? value : files;

  const updateFiles = useCallback(
    (newFiles: FileUploadFile[]) => {
      if (value === undefined) {
        setFiles(newFiles);
      }
      onChange?.(newFiles);
    },
    [value, onChange]
  );

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(incoming);

      // Validate file size
      const oversized = fileArray.find((f) => f.size > maxSize);
      if (oversized) {
        setError(`File "${oversized.name}" melebihi ukuran maksimal ${formatFileSize(maxSize)}`);
        return;
      }

      // Validate accept types
      if (accept) {
        const acceptTypes = accept.split(",").map((t) => t.trim());
        const invalid = fileArray.find((f) => {
          return !acceptTypes.some((type) => {
            if (type.startsWith(".")) {
              return f.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type.endsWith("/*")) {
              return f.type.startsWith(type.replace("/*", "/"));
            }
            return f.type === type;
          });
        });
        if (invalid) {
          setError(`File "${invalid.name}" tidak sesuai format yang diizinkan`);
          return;
        }
      }

      const newUploadFiles: FileUploadFile[] = fileArray.map((file) => ({
        file,
        id: generateId(),
        // Store preview URL for images (used only when Eye button clicked)
        preview: isImageFile(file) ? URL.createObjectURL(file) : undefined,
      }));

      if (multiple) {
        const merged = [...currentFiles, ...newUploadFiles];
        if (merged.length > maxFiles) {
          setError(`Maksimal ${maxFiles} file`);
          return;
        }
        updateFiles(merged);
      } else {
        // Single mode: replace
        currentFiles.forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        updateFiles([newUploadFiles[0]]);
      }
    },
    [accept, maxSize, maxFiles, multiple, currentFiles, updateFiles]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const file = currentFiles.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      updateFiles(currentFiles.filter((f) => f.id !== id));
    },
    [currentFiles, updateFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleBrowseClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const maxSizeLabel = formatFileSize(maxSize);
  const acceptLabel = getAcceptLabel(accept);
  const descriptionText = description || `${acceptLabel} maksimal ukuran ${maxSizeLabel}`;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label */}
      {label && (
        <p className="text-sm font-medium text-neutral-900">{label}</p>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isDragging
            ? "border-primary-400 bg-primary-50"
            : "border-neutral-300 bg-white",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer"
        )}
        onClick={handleBrowseClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleBrowseClick();
        }}
        aria-label="Upload file area"
      >
        <Upload className="h-6 w-6 text-neutral-400 mb-3" />
        <p className="text-sm text-neutral-700 text-center">
          Choose a file or drag and drop it here
        </p>
        <p className="text-xs text-neutral-500 mt-1 text-center">
          {descriptionText}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          disabled={disabled}
          className="mt-4 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:cursor-not-allowed"
        >
          Browse File
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}

      {/* File List */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          {currentFiles.map((uploadFile) => {
            const iconPath = getFileIcon(uploadFile.file.name);

            return (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3"
              >
                {/* File format icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                  {iconPath ? (
                    <Image
                      src={iconPath}
                      alt={uploadFile.file.name}
                      width={20}
                      height={26}
                      className="h-[26px] w-5 object-contain"
                    />
                  ) : (
                    <File className="h-5 w-5 text-neutral-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Preview button — only for image files */}
                  {onPreview && isImageFile(uploadFile.file) && (
                    <button
                      type="button"
                      onClick={() => onPreview(uploadFile)}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                      aria-label="Preview file"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(uploadFile.id)}
                    className="rounded-md p-1.5 text-neutral-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== Image Preview Modal ===== */

interface FilePreviewModalProps {
  file: FileUploadFile | null;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 text-neutral-600 shadow-md hover:bg-white hover:text-neutral-900 transition-colors"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        {file.preview && isImageFile(file.file) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.preview}
            alt={file.file.name}
            className="max-h-[80vh] max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-16 py-12">
            {(() => {
              const iconPath = getFileIcon(file.file.name);
              if (iconPath) {
                return (
                  <Image
                    src={iconPath}
                    alt={file.file.name}
                    width={48}
                    height={63}
                    className="h-16 w-12 object-contain"
                  />
                );
              }
              return <File className="h-16 w-16 text-neutral-400" />;
            })()}
            <p className="text-sm font-medium text-neutral-700">{file.file.name}</p>
            <p className="text-xs text-neutral-500">{formatFileSize(file.file.size)}</p>
          </div>
        )}

        {/* File name footer */}
        <div className="border-t border-neutral-100 px-4 py-3">
          <p className="text-sm text-neutral-700 truncate">{file.file.name}</p>
          <p className="text-xs text-neutral-500">{formatFileSize(file.file.size)}</p>
        </div>
      </div>
    </div>
  );
}
