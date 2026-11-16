import { SignIn } from "@clerk/nextjs";
import { Brand } from "@/components/shared/brand";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
        <Brand href="/" />
      </div>
      <SignIn fallbackRedirectUrl="/onboarding" />
    </main>
  );
}