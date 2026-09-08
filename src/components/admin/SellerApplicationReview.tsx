"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/features/toast/toast-context";
import { AdminSellerApplicationDetail, SellerApplicationStatus, SellerDocumentType } from "@/types/seller";
import { REJECTION_REASON_MAX_LENGTH } from "@/lib/constants/seller";
import { cn } from "@/lib/utils/cn";

const STATUS_BADGE: Record<
  SellerApplicationStatus,
  { label: string; variant: "warning" | "success" | "outline" | "secondary" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "outline" },
};

const DOCUMENT_TYPE_LABELS: Record<SellerDocumentType, string> = {
  IDENTITY_PROOF: "Identity Proof",
  BUSINESS_PROOF: "Business Proof",
  ADDRESS_PROOF: "Address Proof",
  OTHER: "Other",
};

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

interface SellerApplicationReviewProps {
  application: AdminSellerApplicationDetail;
}

export function SellerApplicationReview({ application }: SellerApplicationReviewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  const badge = STATUS_BADGE[application.status];
  const canReview = application.status === "PENDING";

  async function handleViewDocument(documentId: string) {
    setViewingDocId(documentId);
    try {
      const res = await fetch(
        `/api/admin/seller-applications/${application.id}/documents/${documentId}/signed-url`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to open document.");
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to open document.", "error");
    } finally {
      setViewingDocId(null);
    }
  }

  async function handleApprove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/seller-applications/${application.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to approve application.");
      }
      showToast("Application approved");
      setApproveOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to approve application.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 5) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/seller-applications/${application.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reject application.");
      }
      showToast("Application rejected");
      setRejectOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reject application.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar src={application.applicant.avatarUrl} name={application.applicant.displayName} size="lg" />
          <div>
            <Link
              href={`/profile/${application.applicant.username}`}
              className="text-lg font-bold text-neutral-900 hover:underline dark:text-white"
            >
              {application.applicant.displayName}
            </Link>
            <p className="text-sm text-neutral-500">
              @{application.applicant.username} · {application.applicant.email}
            </p>
          </div>
        </div>
        <Badge variant={badge.variant} className="w-fit">
          {badge.label}
        </Badge>
      </Card>

      {/* BUSINESS INFO */}
      <Card className="space-y-4 p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Business Information</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <Field label="Business Name" value={application.businessName} />
          <Field label="Business Type" value={application.businessType} />
        </div>
        {application.description && <Field label="Description" value={application.description} />}
      </Card>

      {/* CONTACT + ADDRESS */}
      <Card className="space-y-4 p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Contact &amp; Address</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <Field label="Contact Email" value={application.contactEmail} />
          <Field label="Contact Phone" value={application.contactPhone} />
          <Field label="Address" value={application.addressLine} />
          <Field label="City" value={application.city} />
          <Field label="State" value={application.state} />
          <Field label="Country" value={application.country} />
          <Field label="Postal Code" value={application.postalCode} />
        </div>
      </Card>

      {/* DOCUMENTS */}
      <Card className="space-y-4 p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
          Verification Documents ({application.documents.length})
        </h2>
        {application.documents.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No documents were uploaded.</p>
        ) : (
          <ul className="space-y-2.5">
            {application.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {doc.originalFilename}
                    </p>
                    <p className="text-xs text-neutral-500">{DOCUMENT_TYPE_LABELS[doc.type]}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => handleViewDocument(doc.id)}
                  disabled={viewingDocId === doc.id}
                >
                  {viewingDocId === doc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )}
                  View
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* TIMESTAMPS */}
      <Card className="space-y-3 p-6 text-sm sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Timeline</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Created" value={formatDate(application.createdAt)} />
          <Field label="Submitted" value={formatDate(application.submittedAt)} />
          <Field label="Reviewed" value={formatDate(application.reviewedAt)} />
          <Field label="Reviewed By" value={application.reviewer ? `@${application.reviewer.username}` : "—"} />
        </div>
        {application.status === "REJECTED" && application.rejectionReason && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 text-sm text-red-600 dark:text-red-400">
            {application.rejectionReason}
          </div>
        )}
      </Card>

      {/* ACTIONS */}
      {canReview && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="danger" onClick={() => setRejectOpen(true)} className="gap-2">
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          <Button type="button" onClick={() => setApproveOpen(true)} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Approve
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={approveOpen}
        title="Approve this application?"
        description={`${application.applicant.displayName} will become a verified seller.`}
        confirmLabel="Approve"
        loading={busy}
        onConfirm={handleApprove}
        onCancel={() => setApproveOpen(false)}
      />

      <RejectDialog
        open={rejectOpen}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        loading={busy}
        onConfirm={handleReject}
        onCancel={() => {
          setRejectOpen(false);
          setRejectReason("");
        }}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-0.5 text-neutral-900 dark:text-white">{value || <span className="text-neutral-400">—</span>}</p>
    </div>
  );
}

interface RejectDialogProps {
  open: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function RejectDialog({ open, reason, onReasonChange, loading, onConfirm, onCancel }: RejectDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const tooShort = reason.trim().length > 0 && reason.trim().length < 5;

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reject-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 id="reject-dialog-title" className="text-lg font-bold text-neutral-900 dark:text-white">
          Reject this application?
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          The applicant will see this reason on their application status page.
        </p>

        <div className="mt-4">
          <Textarea
            label="Rejection reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value.slice(0, REJECTION_REASON_MAX_LENGTH))}
            charCount={reason.length}
            maxCharCount={REJECTION_REASON_MAX_LENGTH}
            placeholder="e.g. The uploaded ID document is unclear. Please re-upload a valid, legible copy."
            rows={4}
            autoFocus
          />
          {tooShort && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5" /> Please provide a more detailed reason.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={loading}
            disabled={reason.trim().length < 5}
            className={cn(reason.trim().length < 5 && "opacity-50")}
          >
            Reject Application
          </Button>
        </div>
      </div>
    </div>
  );
}
