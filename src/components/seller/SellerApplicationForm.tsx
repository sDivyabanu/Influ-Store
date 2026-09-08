"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  MapPin,
  FileCheck2,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DocumentUploader } from "./DocumentUploader";
import { useToast } from "@/features/toast/toast-context";
import { SellerApplicationItem, SellerDocumentItem } from "@/types/seller";
import { BUSINESS_TYPE_OPTIONS, APPLICATION_DESCRIPTION_MAX_LENGTH } from "@/lib/constants/seller";
import { cn } from "@/lib/utils/cn";

interface SellerApplicationFormProps {
  initialApplication: SellerApplicationItem | null;
}

interface FormFields {
  businessName: string;
  businessType: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const STEPS = [
  { key: "business", label: "Business Information", icon: Building2 },
  { key: "contact", label: "Contact Information", icon: Mail },
  { key: "address", label: "Business Address", icon: MapPin },
  { key: "documents", label: "Verification Documents", icon: FileCheck2 },
  { key: "review", label: "Review & Submit", icon: ClipboardCheck },
] as const;

function fieldsFromApplication(app: SellerApplicationItem | null): FormFields {
  return {
    businessName: app?.businessName ?? "",
    businessType: app?.businessType ?? "",
    description: app?.description ?? "",
    contactEmail: app?.contactEmail ?? "",
    contactPhone: app?.contactPhone ?? "",
    addressLine: app?.addressLine ?? "",
    city: app?.city ?? "",
    state: app?.state ?? "",
    country: app?.country ?? "",
    postalCode: app?.postalCode ?? "",
  };
}

export function SellerApplicationForm({ initialApplication }: SellerApplicationFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [fields, setFields] = useState<FormFields>(fieldsFromApplication(initialApplication));
  const [documents, setDocuments] = useState<SellerDocumentItem[]>(initialApplication?.documents ?? []);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const step = STEPS[stepIndex];
  const isRejected = initialApplication?.status === "REJECTED";

  function updateField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function persistDraft(): Promise<boolean> {
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/seller/application", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setFieldErrors(data.errors);
        throw new Error(data.message || "Failed to save your progress.");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your progress.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    const saved = await persistDraft();
    if (!saved) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function handleBack() {
    setError("");
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
    const saved = await persistDraft();
    if (!saved) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/seller/application/submit", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your application.");
      }
      showToast("Application submitted for review!");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {isRejected && initialApplication?.rejectionReason && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
          <p className="font-semibold">Your previous application wasn&apos;t approved:</p>
          <p className="mt-1">{initialApplication.rejectionReason}</p>
        </div>
      )}

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-between overflow-x-auto pb-1">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === stepIndex;
          const isDone = index < stepIndex;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition",
                    isActive
                      ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
                      : isDone
                        ? "border-fuchsia-500 bg-fuchsia-500 text-white"
                        : "border-neutral-300 text-neutral-400 dark:border-neutral-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "hidden text-center text-[10px] font-semibold uppercase tracking-wider sm:block",
                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    isDone ? "bg-fuchsia-500" : "bg-neutral-200 dark:bg-neutral-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Card className="space-y-6 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{step.label}</h2>

        {step.key === "business" && (
          <div className="space-y-5">
            <Input
              label="Business Name"
              value={fields.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              error={fieldErrors.businessName?.[0]}
              placeholder="e.g. Maya's Style Studio"
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Business Type
              </label>
              <select
                value={fields.businessType}
                onChange={(e) => updateField("businessType", e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white/70 px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-fuchsia-500/80 focus:ring-2 focus:ring-fuchsia-500/20 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-white"
              >
                <option value="">Select a business type</option>
                {BUSINESS_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.businessType?.[0] && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.businessType[0]}</p>
              )}
            </div>
            <Textarea
              label="Description (optional)"
              value={fields.description}
              onChange={(e) =>
                updateField("description", e.target.value.slice(0, APPLICATION_DESCRIPTION_MAX_LENGTH))
              }
              charCount={fields.description.length}
              maxCharCount={APPLICATION_DESCRIPTION_MAX_LENGTH}
              placeholder="Tell us a bit about what you plan to sell..."
              rows={4}
            />
          </div>
        )}

        {step.key === "contact" && (
          <div className="space-y-5">
            <Input
              label="Contact Email"
              type="email"
              value={fields.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              error={fieldErrors.contactEmail?.[0]}
              placeholder="business@example.com"
              required
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={fields.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              error={fieldErrors.contactPhone?.[0]}
              placeholder="+1 555 123 4567"
              required
            />
          </div>
        )}

        {step.key === "address" && (
          <div className="space-y-5">
            <Input
              label="Address"
              value={fields.addressLine}
              onChange={(e) => updateField("addressLine", e.target.value)}
              error={fieldErrors.addressLine?.[0]}
              required
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="City"
                value={fields.city}
                onChange={(e) => updateField("city", e.target.value)}
                error={fieldErrors.city?.[0]}
                required
              />
              <Input
                label="State / Region"
                value={fields.state}
                onChange={(e) => updateField("state", e.target.value)}
                error={fieldErrors.state?.[0]}
                required
              />
              <Input
                label="Country"
                value={fields.country}
                onChange={(e) => updateField("country", e.target.value)}
                error={fieldErrors.country?.[0]}
                required
              />
              <Input
                label="Postal Code"
                value={fields.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                error={fieldErrors.postalCode?.[0]}
                required
              />
            </div>
          </div>
        )}

        {step.key === "documents" && (
          <DocumentUploader documents={documents} onDocumentsChange={setDocuments} />
        )}

        {step.key === "review" && (
          <div className="space-y-6">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <ReviewField label="Business Name" value={fields.businessName} />
              <ReviewField label="Business Type" value={fields.businessType} />
              <ReviewField label="Contact Email" value={fields.contactEmail} />
              <ReviewField label="Contact Phone" value={fields.contactPhone} />
              <ReviewField label="Address" value={fields.addressLine} />
              <ReviewField label="City" value={fields.city} />
              <ReviewField label="State" value={fields.state} />
              <ReviewField label="Country" value={fields.country} />
              <ReviewField label="Postal Code" value={fields.postalCode} />
            </div>
            {fields.description && <ReviewField label="Description" value={fields.description} />}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Documents ({documents.length})
              </p>
              {documents.length === 0 ? (
                <p className="text-sm text-red-500 dark:text-red-400">
                  Add at least one verification document before submitting.
                </p>
              ) : (
                <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {documents.map((d) => (
                    <li key={d.id}>• {d.originalFilename}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={stepIndex === 0 || saving || submitting}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {step.key === "review" ? (
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={documents.length === 0}
            className="min-w-[160px]"
          >
            Submit Application
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} isLoading={saving} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-0.5 text-neutral-900 dark:text-white">{value || <span className="text-neutral-400">—</span>}</p>
    </div>
  );
}
