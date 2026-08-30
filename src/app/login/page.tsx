import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue exploring Influ-Store."
    >
      <Suspense fallback={<div className="h-60 flex items-center justify-center text-sm text-neutral-400">Loading sign in form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}