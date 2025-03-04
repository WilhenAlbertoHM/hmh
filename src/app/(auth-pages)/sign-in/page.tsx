"use client"

import { LoginForm } from "@/components/login-form"
import { Message } from "@/components/form-message"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  // Prepare message object if error exists
  const message: Message | undefined = error 
    ? { error: error } 
    : undefined

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <LoginForm message={message} />
    </div>
  )
}