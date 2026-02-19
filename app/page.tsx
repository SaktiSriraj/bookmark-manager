'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">

          <div className="text-6xl mb-2">📑</div>

          <CardTitle className="text-3xl font-bold">
            Bookmark Manager
          </CardTitle>

          <CardDescription className="text-base mt-2">
            Save and organize your favorite links in one place.
            Access them from anywhere, anytime.
          </CardDescription>

        </CardHeader>

        <Separator className="mb-4" />

        <CardContent className="space-y-6">

          <div className="space-y-2">
            {[
              'Save bookmarks with a title and URL',
              'Private to your account only',
              'Real-time sync across all your tabs',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-green-500 font-bold">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full flex items-center gap-3 h-11"
          >
            <FcGoogle size={20} />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Built for Abstrabit Assessment
          </p>

        </CardContent>
      </Card>
    </main>
  )
}
