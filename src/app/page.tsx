import { LoginForm } from "@/components/login-form";
// No need to import User icon as we're using the SVG logo

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full flex justify-center mb-4">
          {/* Using HMH-logo.svg instead of the simple avatar */}
          <img 
            src="/HMH-logo.svg" 
            alt="HMH Logo" 
            className="h-16 rounded-full shadow-lg bg-white" 
          />
        </div>
        
        <LoginForm />
      </div>
    </main>
  );
}