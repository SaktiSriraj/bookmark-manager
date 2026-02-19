# Bookmark Manager

A personal bookmark manager built with Next.js, Supabase, and Tailwind CSS. Sign in with Google, save your favourite links, and watch them sync instantly across all your open tabs.

**Live URL:** [mybookmark-manager.vercel.app](https://mybookmark-manager.vercel.app)

---

## Features

- Google OAuth sign-in (no email/password)
- Add bookmarks with a title and URL
- Bookmarks are private to each user
- Real-time sync across tabs — no page refresh needed
- Delete bookmarks instantly
- Responsive UI built with shadcn/ui

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Backend & Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Language:** TypeScript

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/saktisriraj/bookmark-manager.git
cd bookmark-manager
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the Supabase database

Run this SQL in your Supabase SQL editor:

```sql
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table bookmarks enable row level security;

create policy "Users can manage their own bookmarks"
  on bookmarks
  for all
  using (auth.uid() = user_id);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Problems & How I Solved Them

### Real-time updates without Supabase Realtime

**The problem:** The requirement was for bookmarks to appear in other open tabs without a page refresh. The straightforward approach would be to use Supabase Realtime subscriptions, but that requires enabling the Realtime extension and setting up a channel subscription, which adds complexity and cost.

**The solution:** I used the browser's native **BroadcastChannel API** instead. When a bookmark is added or deleted, the component broadcasts a typed message (`INSERT` or `DELETE`) on a shared channel called `bookmark-sync`. Every other open tab has a listener on the same channel and updates its local state immediately when a message arrives — no database re-fetch, no extra Supabase subscription, zero latency.

```ts
// Sender (AddBookmarkForm.tsx) — after a successful insert
channelRef.current?.postMessage({ type: 'INSERT', bookmark: data })

// Receiver (BookmarkList.tsx) — listening in useEffect
channel.onmessage = (event) => {
  if (message.type === 'INSERT') setBookmarks([message.bookmark, ...prev])
  if (message.type === 'DELETE') setBookmarks(prev.filter(b => b.id !== id))
}
```

This approach is simpler, works entirely in the browser, and satisfies the requirement perfectly for same-browser tabs.
