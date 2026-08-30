"use client";

import React, { useRef, useState } from "react";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { useToast } from "@/features/toast/toast-context";
import { uploadSellerDocumentFile } from "@/lib/client/upload-seller-document";
import {
  SUPPORTED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_DOCUMENTS_PER_APPLICATION,
} from "@/lib/constants/seller";
import { SellerDocumentItem, SellerDocumentType } from "@/types/seller";
import { cn } from "@/lib/utils/cn";

const DOCUMENT_TYPE_LABELS: Record<SellerDocumentType, string> = {
  IDENTITY_PROOF: "Identity Proof",
  BUSINESS_PROOF: "Business Proof",
  ADDRESS_PROOF: "Address Proof",
  OTHER: "Other",
};

interface DocumentUploaderProps {
  documents: SellerDocumentItem[];
  onDocumentsChange: (documents: SellerDocumentItem[]) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function DocumentUploader({ documents, onDocumentsChange, disabled }: DocumentUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<SellerDocumentType>("IDENTITY_PROOF");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  function resetInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError("");

    if (!SUPPORTED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number])) {
      setError("That file isn't a supported type. Use JPG, PNG, WEBP, or PDF.");
      resetInput();
      return;
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setError(`File is larger than ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB.`);
      resetInput();
      return;
    }
    if (documents.length >= MAX_DOCUMENTS_PER_APPLICATION) {
      setError(`You can upload up to ${MAX_DOCUMENTS_PER_APPLICATION} documents.`);
      resetInput();
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadSellerDocumentFile(file);
      const res = await fetch("/api/seller/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          storageKey: uploaded.key,
          originalFilename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save document.");
      }
      onDocumentsChange([...documents, data.document]);
      showToast("Document uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document.");
    } finally {
      setUploading(false);
      resetInput();
    }
  }

  async function handleRemove(documentId: string) {
    setRemovingId(documentId);
    try {
      const res = await fetch(`/api/seller/documents/${documentId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove document.");
      }
      onDocumentsChange(documents.filter((d) => d.id !== documentId));
      showToast("Document removed");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove document.", "error");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {documents.length > 0 && (
        <ul className="space-y-2.5">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-500">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {doc.originalFilename}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {DOCUMENT_TYPE_LABELS[doc.type]} · {formatFileSize(doc.fileSize)}
                  </p>
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(doc.id)}
                  disabled={removingId === doc.id}
                  aria-label={`Remove ${doc.originalFilename}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && documents.length < MAX_DOCUMENTS_PER_APPLICATION && (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-4 space-y-3">
          <div>
            <label
              htmlFor="document-type"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
            >
              Document type
            </label>
            <select
              id="document-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as SellerDocumentType)}
              className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 px-4 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-500/80 focus:ring-2 focus:ring-fuchsia-500/20"
            >
              {(Object.keys(DOCUMENT_TYPE_LABELS) as SellerDocumentType[]).map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 transition hover:border-fuchsia-400 hover:text-fuchsia-600",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            <Upload className="h-4 w-4" />
            <span>{uploading ? "Uploading..." : "Choose file"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_DOCUMENT_MIME_TYPES.join(",")}
              onChange={(e) => handleFileSelected(e.target.files)}
              className="hidden"
              disabled={uploading}
              aria-label="Upload verification document"
            />
          </label>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            JPG, PNG, WEBP, or PDF — up to {MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB. Up to{" "}
            {MAX_DOCUMENTS_PER_APPLICATION} documents.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
