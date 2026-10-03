"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * RichEditor — Quill-based WYSIWYG.
 *
 * `react-quill-new` touches `document` at import time, so the editor is loaded
 * with `ssr: false`. This file is only the public wrapper; the implementation
 * lives in `rich-editor-inner.tsx` and the CSS is imported there so it only
 * loads on the client.
 *
 * Keep importing `RichEditor` from this module — the public API is unchanged.
 */

export interface RichEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const RichEditorInner = dynamic(
  () =>
    import("@/components/ui/rich-editor-inner").then((m) => m.RichEditorInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-32 w-full rounded-md" />,
  },
);

export function RichEditor(props: RichEditorProps) {
  return <RichEditorInner {...props} />;
}
