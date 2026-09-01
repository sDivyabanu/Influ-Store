import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join the next generation of social commerce."
    >
      <RegisterForm />
    </AuthCard>
  );
}