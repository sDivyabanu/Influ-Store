"use client";

import React, { useState } from "react";
import { SellerApplicationItem } from "@/types/seller";
import { SellerApplicationForm } from "./SellerApplicationForm";
import { SellerApplicationStatus } from "./SellerApplicationStatus";

interface SellerApplicationPageClientProps {
  initialApplication: SellerApplicationItem | null;
}

/** Branches between the multi-step form and the read-only status card based on application state. */
export function SellerApplicationPageClient({ initialApplication }: SellerApplicationPageClientProps) {
  const [editing, setEditing] = useState(false);

  const showForm =
    !initialApplication ||
    initialApplication.status === "DRAFT" ||
    (initialApplication.status === "REJECTED" && editing);

  if (showForm) {
    return <SellerApplicationForm initialApplication={initialApplication} />;
  }

  return (
    <SellerApplicationStatus
      application={initialApplication}
      onEditRequested={initialApplication.status === "REJECTED" ? () => setEditing(true) : undefined}
    />
  );
}
