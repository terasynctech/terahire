
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const configured =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY.length > 20;

const db = configured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const $ = id => document.getElementById(id);

let currentUser = null;
let allJobs = [];
let allCandidates = [];

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3200);
}

function esc(v = "") {
  return String(v).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function showLogin() {
  $("loginPanel").hidden = false;
  $("dashboard").hidden = true;
  $("logoutBtn").hidden = true;
  $("userEmail").textContent = "";
}

function showDashboard() {
  $("loginPanel").hidden = true;
  $("dashboard").hidden = false;
  $("logoutBtn").hidden = false;
  $("userEmail").textContent = currentUser?.email || "";

  loadJobs();
  loadCandidates();
}

async function verifyAdmin() {
  if (!configured) {
    showLogin();
    toast("Add the Supabase URL and publishable key in config.js first.");
    return;
  }

  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    showLogin();
    return;
  }

  const { data: profile, error } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    await db.auth.signOut();
    showLogin();
    toast("This account does not have administrator access.");
    return;
  }

  currentUser = user;
  showDashboard();
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();

  if (!configured) {
    toast("Configure Supabase in config.js first.");
    return;
  }

  const { error } = await db.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });

  if (error) {
    toast(error.message);
    return;
  }

  await verifyAdmin();
});

$("logoutBtn").onclick = async () => {
  await db.auth.signOut();
  currentUser = null;
  allJobs = [];
  allCandidates = [];
  showLogin();
  toast("Logged out.");
};

// ===============================
// JOB MANAGEMENT
// ===============================

async function loadJobs() {
  $("jobsBody").innerHTML =
    '<tr><td colspan="5" class="empty">Loading jobs…</td></tr>';

  const { data, error } = await db
    .from("jobs")
    .select("id,title,company_name,location,status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    $("jobsBody").innerHTML =
      `<tr><td colspan="5" class="empty">${esc(error.message)}</td></tr>`;
    return;
  }

  allJobs = data || [];
  renderJobs();
}

function renderJobs() {
  const term = $("jobSearch").value.trim().toLowerCase();
  const state = $("statusFilter").value;

  const list = allJobs.filter(j =>
    (state === "all" || j.status === state) &&
    [j.title, j.company_name, j.location]
      .join(" ")
      .toLowerCase()
      .includes(term)
  );

  $("totalCount").textContent = allJobs.length;
  $("publishedCount").textContent =
    allJobs.filter(j => j.status === "published").length;
  $("draftCount").textContent =
    allJobs.filter(j => j.status === "draft").length;
  $("closedCount").textContent =
    allJobs.filter(j => j.status === "closed").length;

  if (!list.length) {
    $("jobsBody").innerHTML =
      '<tr><td colspan="5" class="empty">No jobs found. Use “Add new job” to create your first vacancy.</td></tr>';
    return;
  }

  $("jobsBody").innerHTML = list.map(j => `
    <tr>
      <td>
        <strong>${esc(j.title)}</strong>
        <small>${esc(j.company_name)}</small>
      </td>
      <td>${esc(j.location)}</td>
      <td>${new Date(j.created_at).toLocaleDateString()}</td>
      <td>
        <span class="status ${esc(j.status)}">
          ${j.status === "closed" ? "Closed / filled" : esc(j.status)}
        </span>
      </td>
      <td class="actions">
        <button data-edit="${esc(j.id)}" class="action">Edit</button>
        <button data-toggle="${esc(j.id)}" class="action">
          ${j.status === "published" ? "Unpublish" :
            j.status === "closed" ? "Reopen" : "Publish"}
        </button>
        <button data-delete="${esc(j.id)}" class="action danger">Delete</button>
      </td>
    </tr>
  `).join("");
}

$("jobSearch").addEventListener("input", renderJobs);
$("statusFilter").addEventListener("change", renderJobs);
$("refreshBtn").onclick = loadJobs;

function openEditor(job = null) {
  $("jobForm").reset();
  $("jobId").value = job?.id || "";
  $("editorTitle").textContent =
    job ? "Edit vacancy" : "Add a new vacancy";

  $("title").value = job?.title || "";
  $("company").value = job?.company_name || "";
  $("jobLocation").value = job?.location || "";
  $("jobType").value = job?.job_type || "Full-time";
  $("experience").value = job?.experience || "";
  $("salary").value = job?.salary || "";
  $("category").value = job?.category || "Development";
  $("skills").value = (job?.skills || []).join(", ");
  $("description").value = job?.description || "";
  $("status").value = job?.status || "draft";

  $("editor").hidden = false;
}

function closeEditor() {
  $("editor").hidden = true;
}

$("newJobBtn").onclick = () => openEditor();
$("closeEditor").onclick = closeEditor;
$("cancelEdit").onclick = closeEditor;

$("editor").addEventListener("click", e => {
  if (e.target.id === "editor") closeEditor();
});

$("jobForm").addEventListener("submit", async e => {
  e.preventDefault();

  if (!currentUser) {
    toast("Please sign in again.");
    return;
  }

  const id = $("jobId").value;

  const payload = {
    title: $("title").value.trim(),
    company_name: $("company").value.trim(),
    location: $("jobLocation").value.trim(),
    job_type: $("jobType").value,
    experience: $("experience").value.trim(),
    salary: $("salary").value.trim(),
    category: $("category").value,
    skills: $("skills").value.split(",").map(x => x.trim()).filter(Boolean),
    description: $("description").value.trim(),
    status: $("status").value,
    recruiter_id: currentUser.id,
    updated_at: new Date().toISOString()
  };

  $("saveJobBtn").disabled = true;

  const result = id
    ? await db.from("jobs").update(payload).eq("id", id)
    : await db.from("jobs").insert(payload);

  $("saveJobBtn").disabled = false;

  if (result.error) {
    toast(result.error.message);
    return;
  }

  toast(id ? "Job updated successfully." : "New job saved successfully.");
  closeEditor();
  await loadJobs();
});

$("jobsBody").addEventListener("click", async e => {
  const edit = e.target.closest("[data-edit]");
  const toggle = e.target.closest("[data-toggle]");
  const del = e.target.closest("[data-delete]");

  if (edit) {
    const j = allJobs.find(x => x.id === edit.dataset.edit);

    if (j) {
      const { data } = await db
        .from("jobs")
        .select("*")
        .eq("id", j.id)
        .single();

      if (data) openEditor(data);
      else toast("Could not load job details.");
    }
    return;
  }

  if (toggle) {
    const j = allJobs.find(x => x.id === toggle.dataset.toggle);
    if (!j) return;

    const next = j.status === "published" ? "draft" : "published";

    const { error } = await db
      .from("jobs")
      .update({
        status: next,
        updated_at: new Date().toISOString()
      })
      .eq("id", j.id);

    if (error) {
      toast(error.message);
      return;
    }

    toast(next === "published"
      ? "Vacancy published."
      : "Vacancy unpublished.");

    loadJobs();
    return;
  }

  if (del) {
    const j = allJobs.find(x => x.id === del.dataset.delete);

    if (!j || !confirm(`Delete “${j.title}”? This cannot be undone.`)) return;

    const { error } = await db
      .from("jobs")
      .delete()
      .eq("id", j.id);

    if (error) {
      toast(error.message);
      return;
    }

    toast("Job deleted.");
    loadJobs();
  }
});

// ===============================
// CANDIDATE MANAGEMENT
// ===============================

async function loadCandidates() {
  $("candidatesBody").innerHTML =
    '<tr><td colspan="5" class="empty">Loading candidates…</td></tr>';

  const { data, error } = await db
    .from("profiles")
    .select("id,full_name,email,phone,role,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    $("candidatesBody").innerHTML =
      `<tr><td colspan="5" class="empty">
        Unable to load candidates: ${esc(error.message)}
      </td></tr>`;

    $("candidateCount").textContent = "—";
    return;
  }

  allCandidates = (data || []).filter(
    candidate => candidate.role === "candidate"
  );

  renderCandidates();
}

function renderCandidates() {
  const term = $("candidateSearch").value.trim().toLowerCase();

  const list = allCandidates.filter(candidate =>
    [
      candidate.full_name,
      candidate.email,
      candidate.phone,
      candidate.role
    ].join(" ").toLowerCase().includes(term)
  );

  $("candidateCount").textContent = allCandidates.length;

  if (!list.length) {
    $("candidatesBody").innerHTML =
      '<tr><td colspan="5" class="empty">No candidates found.</td></tr>';
    return;
  }

  $("candidatesBody").innerHTML = list.map(candidate => `
    <tr>
      <td><strong>${esc(candidate.full_name || "Name not available")}</strong></td>
      <td>${esc(candidate.email || "Email not available")}</td>
      <td>${esc(candidate.phone || "Not provided")}</td>
      <td><span class="status">${esc(candidate.role || "candidate")}</span></td>
      <td>${candidate.created_at
        ? new Date(candidate.created_at).toLocaleDateString()
        : "Not available"}</td>
    </tr>
  `).join("");
}

$("candidateSearch").addEventListener("input", renderCandidates);
$("refreshCandidatesBtn").onclick = loadCandidates;

// START ADMIN APPLICATION
verifyAdmin();
