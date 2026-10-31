# TeraHire — IT Recruitment & Consultancy Platform

A responsive recruitment consultancy demo by TeraSyncTech. The project includes a public job board, Supabase authentication, and an administrator console for managing vacancies.

## Project files

- `index.html`, `styles.css`, `app.js` — public website and job listings
- `admin.html`, `admin.css`, `admin.js` — secure admin sign-in and job management dashboard
- `config.js` — Supabase project URL and publishable (anon) key
- `supabase/schema.sql` — database tables, Row Level Security policies, resume bucket, and role protection

## 1. Create and configure Supabase

1. Create a Supabase project named **TeraHire**.
2. Open **SQL Editor → New query**.
3. Copy all contents of `supabase/schema.sql`, paste them, and run the script.
4. Open **Project Settings → API** (or API Keys) and copy the Project URL and the **publishable key** (or legacy anon key).
5. Open `config.js` and replace the two placeholders. Never put a `service_role` or secret key in this file.
6. In Supabase **Authentication → URL Configuration**, set the Site URL to your GitHub Pages address, for example `https://terasynctech.github.io/terahire/`, and add that address to the allowed redirect URLs.

## 2. Create the first administrator

1. Open the deployed website and create an account using the normal **Create account** flow.
2. Confirm the email if email confirmation is enabled.
3. In Supabase, open **SQL Editor** and run this command after replacing the email with the exact admin email:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

4. Open `https://terasynctech.github.io/terahire/admin.html` and sign in using that account.
5. The dashboard checks the profile role in Supabase. Candidate/recruiter accounts cannot use the admin panel.

Do not share the admin password or secret keys. Create separate accounts for other staff and grant access deliberately.

## 3. Publish to GitHub Pages

1. Create a public repository named `terahire` in the TeraSyncTech GitHub account.
2. Upload the extracted contents of this ZIP to the repository root (not the ZIP file itself).
3. Commit the files. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
4. Wait for GitHub Pages deployment. Open the public URL and test the website and `/admin.html`.

## 4. Daily job posting workflow

1. Open the admin URL and sign in.
2. Select **Add new job** and fill in title, company, location, job type, experience, salary, category, skills and description.
3. Choose **Publish on website** and save. Choose **Save as draft** to keep a vacancy private, or **Closed / filled** when the role is no longer accepting applications.
4. Use Edit, Publish/Unpublish, and Delete actions from the job list. Published vacancies load from Supabase on the public website; no GitHub edit is required for daily postings.

## Important notes

- Sample jobs are display-only preview content. Once Supabase is configured, the public board shows database vacancies only, including an empty state if no vacancies have been published.
- The admin dashboard is the first management phase. Candidate profile editing, resume upload, recruiter self-service, application pipeline, interview scheduling, email notifications, analytics and production hardening are future phases.
- The schema uses Row Level Security. Review and test all policies, storage access and operational requirements before using real candidate data in production. Resume storage is private and currently owner-only; do not promise recruiter access to candidate resumes until a deliberate secure workflow is implemented.
- This is a GitHub Pages static frontend. Never place Supabase service-role credentials or other secrets in browser files.
