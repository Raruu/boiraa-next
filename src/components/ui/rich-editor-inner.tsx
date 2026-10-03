"use client";

import { useRef, useMemo, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "@/styles/rich-editor.css";
import { cn } from "@/lib/utils";
import type { RichEditorProps } from "@/components/ui/rich-editor";

/**
 * Client-only Quill implementation.
 * Import `RichEditor` from `@/components/ui/rich-editor` instead of this file —
 * that wrapper loads this module with `ssr: false`.
 */

export function RichEditorInner({
  value = "",
  onChange,
  label,
  error,
  placeholder = "Tulis konten di sini...",
  disabled = false,
  className,
  onImageUpload,
}: RichEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  // Image handler
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const editor = quillRef.current?.getEditor();
      if (!editor) return;

      const range = editor.getSelection(true);

      if (onImageUpload) {
        try {
          const url = await onImageUpload(file);
          editor.insertEmbed(range.index, "image", url);
          editor.setSelection(range.index + 1, 0);
        } catch {
          console.error("[RichEditor] Image upload failed");
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          editor.insertEmbed(range.index, "image", base64);
          editor.setSelection(range.index + 1, 0);
        };
        reader.readAsDataURL(file);
      }
    };
  }, [onImageUpload]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          ["link"],
          [{ color: [] }],
          ["clean"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          [{ script: "super" }, { script: "sub" }],
          ["image"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  );

  const formats = [
    "font",
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "link",
    "color",
    "list",
    "align",
    "script",
    "image",
  ];

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          className={cn(
            "block text-sm font-medium",
            disabled ? "text-neutral-400" : "text-neutral-900",
          )}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "rich-editor rounded-md border transition-colors overflow-hidden",
          error ? "border-error-500" : "border-neutral-300",
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
        />
      </div>
      {error && <p className="text-xs text-error-600 mt-1">{error}</p>}
    </div>
  );
}
