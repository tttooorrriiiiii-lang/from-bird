# FROM BIRD CMS connection

This source is connected to the existing Supabase CMS.

Homepage sections driven by CMS:
- Categories: public.categories where is_active = true
- PICK UP PROJECTS: public.contents where status = published and is_featured = true
- NEWS: public.news where status = published

The static items that were previously hard-coded are also seeded into Supabase, so the current look/content is preserved.

Required Vercel environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (recommended)
  OR existing NEXT_PUBLIC_SUPABASE_ANON_KEY

CMS admin itself is a separate deployment (FROM BIRD ADMIN v2).
