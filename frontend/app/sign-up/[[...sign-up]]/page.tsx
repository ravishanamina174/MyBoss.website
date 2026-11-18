import { SignUp } from "@clerk/nextjs";
import { AuthFrame, clerkAppearance } from "@/components/shared/auth-frame";

export default function SignUpPage() {
  return (
    <AuthFrame>
      <SignUp fallbackRedirectUrl="/onboarding" appearance={clerkAppearance} />
    </AuthFrame>
  );
}
