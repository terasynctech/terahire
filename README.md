# TeraHire — TeraSyncTech IT Recruitment Consultancy Demo

A responsive IT recruitment website starter built for GitHub Pages + Supabase.

## Included in this starter
- Responsive public homepage and job discovery UI
- Keyword, location and category filters
- Sample IT vacancies for presentation
- Job detail modal and save-job interaction (browser-session demo)
- Supabase email/password sign-up and login wiring
- Live published-job loading from Supabase
- Application submission for authenticated users
- Supabase SQL schema for candidates, recruiters, companies, jobs, applications and interviews
- RLS policies and private resume storage bucket setup

## Project structure
```text
terahire/
├── index.html
├── styles.css
├── app.js
├── config.js
├── README.md
└── supabase/
    └── schema.sql
```

## 1. Run a local preview
Because the app uses JavaScript modules, serve the folder using a local web server. For example:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## 2. Configure Supabase
1. Create a new Supabase project for TeraHire.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Project Settings → API, copy the Project URL and publishable/anon key.
4. Paste them into `config.js`.
5. In Authentication → URL Configuration, add your GitHub Pages URL to Site URL / Redirect URLs.
6. Enable email authentication and configure email confirmation as appropriate.
7. Sign up using your own email, then promote that account to admin using the SQL statement at the bottom of `schema.sql`.

**Never put the `service_role` key in `config.js`, GitHub, or browser code.** Only the publishable/anon key belongs in the frontend, with RLS enabled.

## 3. Publish on GitHub Pages
1. Create a public repository named `terahire` under `terasynctech`.
2. Upload the files and folders from this project.
3. In repository Settings → Pages, choose Deploy from a branch.
4. Select `main` and `/ (root)`, then Save.
5. Your expected URL will be `https://terasynctech.github.io/terahire/`.

## 4. Add the first live job
After creating a recruiter account, the account role is `recruiter`. Use Supabase Table Editor or a secure recruiter dashboard (to be built in the next phase) to insert a job with:
- `recruiter_id`: the recruiter's Auth user UUID
- `title`, `company_name`, `location`, `description`
- `status`: `published`
- `category`, `skills`, `experience`, `salary`

The public homepage will load published jobs. The sample jobs are display-only and cannot receive real applications.

## 5. Important current limitations
This is Phase 1 — public website + backend foundation, not a complete production recruitment platform yet.
- Candidate profile editor and resume upload UI are next.
- Recruiter job-management dashboard is next.
- Consultancy admin CRM, pipeline, interview scheduler and reports are next.
- AI resume scoring/matching must be added through a server-side Edge Function or trusted API backend. Never expose an AI provider secret in frontend JavaScript.
- Employer enquiry form is a visual preview only.
- Sample job data is illustrative, not actual vacancies.

## Suggested next phase
Build the authenticated candidate dashboard (profile, resume upload, saved jobs and application tracking), followed by the recruiter dashboard and consultancy admin CRM.
