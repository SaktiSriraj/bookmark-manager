'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FiTrash2, FiAlertCircle, FiExternalLink } from 'react-icons/fi'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

type BroadcastMessage =
  | { type: 'INSERT'; bookmark: Bookmark }
  | { type: 'DELETE'; id: string }

const CHANNEL_NAME = 'bookmark-sync'

function formatUrl(url: string, maxLength = 50) {
  try {
    const { hostname, pathname } = new URL(url)
    const short = hostname + pathname
    return short.length > maxLength ? short.slice(0, maxLength) + '...' : short
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength) + '...' : url
  }
}

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()
  const channelRef = useRef<BroadcastChannel | null>(null)

  const fetchBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError('Failed to load bookmarks. Please refresh.')
    } else {
      setBookmarks(data || [])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchBookmarks()

    const channel = new BroadcastChannel(CHANNEL_NAME)
    channelRef.current = channel

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data
      if (message.type === 'INSERT') {
        setBookmarks((prev) => {
          const exists = prev.some((b) => b.id === message.bookmark.id)
          if (exists) return prev
          return [message.bookmark, ...prev]
        })
      }
      if (message.type === 'DELETE') {
        setBookmarks((prev) => prev.filter((b) => b.id !== message.id))
      }
    }

    return () => {
      channel.close()
    }
  }, [])

  const handleDelete = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      setError('Failed to delete bookmark. Please try again.')
      fetchBookmarks()
    } else {
      channelRef.current?.postMessage({ type: 'DELETE', id })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-7 rounded-md ml-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <FiAlertCircle size={16} />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">

        {/* Bookmark count */}
        <p className="text-sm text-muted-foreground">
          {bookmarks.length === 0
            ? 'No bookmarks yet'
            : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`}
        </p>

        {/* Empty state */}
        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <p className="text-3xl mb-2">🔖</p>
              <p className="font-medium text-sm">No bookmarks yet!</p>
              <p className="text-xs">Add your first bookmark using the form above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between py-2.5 px-4">

                  {/* Left: Title + URL */}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">

                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm text-gray-800 hover:text-blue-600 hover:underline transition-colors truncate flex items-center gap-1"
                    >
                      🔗 {bookmark.title}
                      <FiExternalLink size={10} className="shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatUrl(bookmark.url)}
                    </p>
                  </div>

                  {/* Right: Date + Delete */}
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Badge variant="secondary" className="text-xs hidden sm:block">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </Badge>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bookmark.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7"
                        >
                          <FiTrash2 size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete bookmark</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </TooltipProvider>
  )
}
