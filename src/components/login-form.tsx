"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { signInAction } from "@/app/actions"
import { createClient } from "@/utils/supabase/client"
import { FormMessage, Message } from "@/components/form-message"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  message,
  ...props
}: React.ComponentProps<"div"> & { message?: Message }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formMessage, setFormMessage] = useState<Message | null>(message || null)
  const isRedirecting = useRef(false)
  const supabase = createClient()

  // Clean up form message when component unmounts
  useEffect(() => {
    return () => {
      setFormMessage(null)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading || isRedirecting.current) return // Prevent multiple submissions
    
    if (!email || !password) {
      setFormMessage({ error: "Email and password are required" })
      return
    }
    
    setIsLoading(true)
    setFormMessage(null)

    try {
      // Try client-side authentication first
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // If client-side auth fails, show the error
        setFormMessage({ error: error.message })
        setIsLoading(false)
        return
      }
      
      // Authentication succeeded, check if user has completed questionnaire
      const { data: patientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()
      
      // Mark as redirecting to prevent flash of error
      isRedirecting.current = true
      
      if (!patientData) {
        // If no patient data exists, redirect to questionnaire
        router.push('/questionnaire')
        return
      }
      
      // Create and submit the form data to server action
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      
      // The try/catch below is just a safety measure
      try {
        // This should trigger a redirect to dashboard
        await signInAction(formData)
        
        // If we get here, the server action didn't redirect as expected
        // Wait a brief moment (giving time for any state changes) then redirect manually
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 100)
      } catch (serverError) {
        // This shouldn't happen normally, but handle it just in case
        console.error("Server action error:", serverError)
        
        // Still redirect since we've already authenticated on the client
        window.location.href = "/dashboard"
      }
    } catch (error) {
      // Only show error if we're not already redirecting
      if (!isRedirecting.current) {
        console.error("Sign in error:", error)
        setFormMessage({ error: "An unexpected error occurred" })
        setIsLoading(false)
      }
    }
  }

  const handleGoogleSignIn = async () => {
    if (isLoading || isRedirecting.current) return
    
    setIsLoading(true)
    setFormMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) throw error
      // Google sign-in handles redirection automatically
      isRedirecting.current = true
    } catch (error) {
      if (!isRedirecting.current) {
        console.error("Google login error:", error)
        setFormMessage({ error: "Failed to sign in with Google" })
        setIsLoading(false)
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-98 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center text-balance">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password"
                placeholder="Your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            {formMessage && !isRedirecting.current && <FormMessage message={formMessage} />}
            <div className="flex flex-col gap-3 mt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                Sign in with Google
              </Button>
            </div>
            <div className="text-center text-sm mt-2">
              Don&apos;t have an account?{" "}
              <Link 
                className="font-medium text-primary underline hover:text-primary/90" 
                href="/sign-up"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}