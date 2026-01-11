import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="bg- flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <img
          src="/logo/light.png"
          alt="Kumasoft Logo"
          className="w-44 object-contain self-center"
        />
        <LoginForm />
      </div>
    </div>
  );
}
