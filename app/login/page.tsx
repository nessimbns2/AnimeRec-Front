"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import API_BASE_URL from '@/lib/utils';

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: email,
          password: password,
          scope: "",
          client_id: "string",
          client_secret: "string"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || errorData.message || errorData.error || "Failed to log in"
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Login successful:", data)
      
      // Save the access token
      localStorage.setItem("accessToken", data.access_token)
      
      // Fetch user information using the token
      try {
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${data.access_token}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          console.log("User data:", userData)
          
          // Store user data in local storage
          localStorage.setItem("currentUser", JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email
          }))
          
          router.push("/dashboard")
        } else {
          throw new Error("Failed to fetch user data")
        }
      } catch (userError) {
        console.error("Error fetching user data:", userError)
        setError("Login successful but failed to fetch user data")
      }
    } catch (error: any) {
      console.error("Error logging in:", error)
      setError(error.message || "Failed to log in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-700 border-slate-600 text-white"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-700 border-slate-600 text-white"
          />
          {error && <p className="text-red-500 text-sm text-center text-white">{error}</p>}
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-slate-300 text-white">Don't have an account? <a href="/signup" className="text-purple-500 hover:underline">Sign Up</a></p>
        </div>
      </Card>
    </div>
  )
}

