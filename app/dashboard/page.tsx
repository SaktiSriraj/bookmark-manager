import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import AddBookmarkForm from '@/components/AddBookmarkForm'
import BookmarkList from '@/components/BookmarkList'
import { FiLogOut } from 'react-icons/fi'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  const fullName = user.user_metadata?.full_name || user.email || 'U'
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <span className="text-2xl">📑</span>
            <span className="font-bold text-gray-800">Bookmark Manager</span>
          </div>

          <div className="flex items-center gap-3">

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Badge variant="secondary" className="hidden sm:block">
              {user.email}
            </Badge>

            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <FiLogOut size={16} className="mr-2" />
                Logout
              </Button>
            </form>

          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello, {fullName.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your bookmarks below. Changes sync in real-time across all tabs.
          </p>
        </div>

        <Separator />

        <AddBookmarkForm />

        <Separator />

        <div>
          <h2 className="text-lg font-semibold mb-4">Your Bookmarks</h2>
          <BookmarkList />
        </div>

      </div>
    </main>
  )
}
