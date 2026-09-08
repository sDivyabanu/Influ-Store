"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Layers, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { AdminSellerApplicationSummary, SellerApplicationStatus } from "@/types/seller";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/format-time";

type FilterTab = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const TABS: { key: FilterTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "APPROVED", label: "Approved", icon: CheckCircle2 },
  { key: "REJECTED", label: "Rejected", icon: XCircle },
  { key: "ALL", label: "All", icon: Layers },
];

const STATUS_BADGE: Record<
  SellerApplicationStatus,
  { label: string; variant: "warning" | "success" | "outline" | "secondary" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "outline" },
};

interface SellerApplicationsListProps {
  initialApplications: AdminSellerApplicationSummary[];
  initialCursor: string | null;
}

export function SellerApplicationsList({ initialApplications, initialCursor }: SellerApplicationsListProps) {
  const [tab, setTab] = useState<FilterTab>("PENDING");
  const [applications, setApplications] = useState(initialApplications);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isInitialMount = useRef(true);

  async function loadTab() {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (tab !== "ALL") params.set("status", tab);
      const res = await fetch(`/api/admin/seller-applications?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setApplications(data.applications);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ cursor });
      if (tab !== "ALL") params.set("status", tab);
      const res = await fetch(`/api/admin/seller-applications?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setApplications((current) => [...current, ...data.applications]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition",
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                  : "border border-neutral-200 bg-white/60 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {applications.length === 0 && !loading ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Layers className="h-8 w-8 text-neutral-400" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No applications in this view.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {applications.map((app) => {
            const badge = STATUS_BADGE[app.status];
            return (
              <Link
                key={app.id}
                href={`/admin/seller-applications/${app.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/60 p-4 transition hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 dark:border-neutral-800 dark:bg-neutral-900/60"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <Avatar src={app.applicant.avatarUrl} name={app.applicant.displayName} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {app.businessName || "Untitled business"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      @{app.applicant.username} ·{" "}
                      {app.submittedAt
                        ? `Submitted ${formatRelativeTime(app.submittedAt)}`
                        : `Created ${formatRelativeTime(app.createdAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Couldn&apos;t load applications.</p>
          <Button type="button" variant="outline" size="sm" onClick={cursor ? loadMore : loadTab}>
            Retry
          </Button>
        </div>
      )}

      {cursor && !error && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" size="sm" isLoading={loading} onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
