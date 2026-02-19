'use client'

import { useRef, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FiPlus, FiAlertCircle } from 'react-icons/fi'

const CHANNEL_NAME = 'bookmark-sync'

export default function AddBookmarkForm() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME)
    return () => channelRef.current?.close()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !url.trim()) {
      setError('Both title and URL are required.')
      return
    }

    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setIsLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        title: title.trim(),
        url: finalUrl,
        user_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      setError('Failed to add bookmark. Please try again.')
    } else {
      channelRef.current?.postMessage({ type: 'INSERT', bookmark: data })
      setTitle('')
      setUrl('')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New Bookmark</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. My Favorite Website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="e.g. https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <FiAlertCircle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            <FiPlus size={18} className="mr-2" />
            {isLoading ? 'Adding...' : 'Add Bookmark'}
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}
