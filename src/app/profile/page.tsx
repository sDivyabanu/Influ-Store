import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProfileIndexPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  redirect(`/profile/${user.username}`);
}