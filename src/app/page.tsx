import { LoginForm } from "@/components/login-form";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        
        <LoginForm />
      </div>
    </main>
  );
}