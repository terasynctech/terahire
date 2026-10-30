import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const configured = SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const sampleJobs = [
{id:"sample-1",title:"Frontend Developer",company_name:"Nexa Digital",location:"Bengaluru / Hybrid",job_type:"Full-time",experience:"2–4 years",salary:"₹6–10 LPA",category:"Development",skills:["React","JavaScript","CSS"],posted:"2 days ago",description:"Build responsive web experiences with React and modern JavaScript. Work closely with design and backend teams."},
{id:"sample-2",title:"Python Developer",company_name:"CloudSpring Labs",location:"Remote · India",job_type:"Full-time",experience:"1–3 years",salary:"₹4–8 LPA",category:"Development",skills:["Python","Django","REST API"],posted:"1 day ago",description:"Develop and maintain Python services and REST APIs. Familiarity with databases and version control is preferred."},
{id:"sample-3",title:"Data Analyst",company_name:"InsightWorks",location:"Pune",job_type:"Full-time",experience:"2–5 years",salary:"₹5–9 LPA",category:"Data",skills:["SQL","Power BI","Excel"],posted:"3 days ago",description:"Turn business data into actionable insights using SQL, dashboards and clear communication."},
{id:"sample-4",title:"DevOps Engineer",company_name:"Vertex Systems",location:"Hyderabad / Hybrid",job_type:"Full-time",experience:"3–6 years",salary:"₹8–14 LPA",category:"Cloud",skills:["AWS","Docker","CI/CD"],posted:"4 days ago",description:"Support cloud infrastructure, deployment automation, monitoring and reliability initiatives."},
{id:"sample-5",title:"QA Automation Engineer",company_name:"BrightByte",location:"Noida",job_type:"Full-time",experience:"2–4 years",salary:"₹5–9 LPA",category:"Testing",skills:["Selenium","Java","API Testing"],posted:"5 days ago",description:"Design and maintain automated test suites and collaborate with engineering teams to improve quality."},
{id:"sample-6",title:"Machine Learning Associate",company_name:"Aster AI",location:"Remote · India",job_type:"Full-time",experience:"0–2 years",salary:"₹5–8 LPA",category:"Data",skills:["Python","ML","Pandas"],posted:"1 week ago",description:"Assist with data preparation, model experiments and evaluation. Strong Python fundamentals required."}
];
let jobs = [...sampleJobs], activeFilter = "All", saved = new Set();
const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2800)}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderJobs(){
 const q=$("keyword").value.trim().toLowerCase(), loc=$("location").value.trim().toLowerCase();
 const filtered=jobs.filter(j=>(activeFilter==="All"||j.category===activeFilter)&&(!q||[j.title,j.company_name,...(j.skills||[])].join(" ").toLowerCase().includes(q))&&(!loc||j.location.toLowerCase().includes(loc)));
 $("resultCount").textContent=`${filtered.length} opportunities`;
 $("emptyState").hidden=filtered.length!==0;
 $("jobGrid").innerHTML=filtered.map(j=>`<article class="job-card"><div class="job-card-head"><span class="company-logo">${escapeHTML((j.company_name||"T").slice(0,1).toUpperCase())}</span><button class="save-job" data-save="${escapeHTML(j.id)}" aria-label="Save job">${saved.has(j.id)?"♥":"♡"}</button></div><h3>${escapeHTML(j.title)}</h3><div class="company">${escapeHTML(j.company_name)}</div><div class="job-meta"><span>⌖ ${escapeHTML(j.location)}</span><span>◷ ${escapeHTML(j.experience)}</span></div><div class="job-tags">${(j.skills||[]).slice(0,3).map(s=>`<span>${escapeHTML(s)}</span>`).join("")}</div><div class="job-foot"><small>${escapeHTML(j.salary||"Salary not disclosed")} · ${escapeHTML(j.posted||"Recently")}</small><button class="apply-link" data-job="${escapeHTML(j.id)}">View details →</button></div></article>`).join("");
}
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderJobs()});
$("searchForm").addEventListener("submit",e=>{e.preventDefault();renderJobs();$("jobs").scrollIntoView({behavior:"smooth"})});
$("viewAll").addEventListener("click",()=>{$("keyword").value="";$("location").value="";activeFilter="All";document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter==="All"));renderJobs()});
$("jobGrid").addEventListener("click",e=>{const save=e.target.closest("[data-save]");if(save){const id=save.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);renderJobs();return}const btn=e.target.closest("[data-job]");if(btn){const job=jobs.find(x=>x.id===btn.dataset.job);showJob(job)}});
function openModal(html){$("modalContent").innerHTML=html;$("modal").hidden=false}
function closeModal(){$("modal").hidden=true}
$("closeModal").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
function showJob(j){openModal(`<div class="eyebrow">JOB DETAILS</div><h2>${escapeHTML(j.title)}</h2><p>${escapeHTML(j.company_name)} · ${escapeHTML(j.location)}</p><p><b>${escapeHTML(j.salary||"Salary not disclosed")}</b> &nbsp;·&nbsp; ${escapeHTML(j.experience)} &nbsp;·&nbsp; ${escapeHTML(j.job_type)}</p><p>${escapeHTML(j.description||"Contact our recruitment team for details.")}</p><p><b>Skills:</b> ${escapeHTML((j.skills||[]).join(", "))}</p><button class="btn btn-primary" id="applyNow">Apply for this job →</button><p class="hint">Demo mode: sample jobs are illustrative and not confirmed vacancies.</p>`);$("applyNow").onclick=()=>applyFor(j)}
async function applyFor(j){
 if(!configured){toast("Connect Supabase to submit and save real applications.");return}
 const {data:{user}}=await supabase.auth.getUser();
 if(!user){toast("Please log in or create a candidate account first.");authModal("login");return}
 const {error}=await supabase.from("applications").insert({job_id:j.id,candidate_id:user.id,status:"applied"});
 if(error){toast(error.message.includes("foreign key")?"This is a sample listing. Add a live job before applying.":error.message);return}
 toast("Application submitted successfully.");closeModal()
}
function authModal(mode){const signup=mode==="signup";openModal(`<div class="eyebrow">TERAHIRE ACCOUNT</div><h2>${signup?"Create your account":"Welcome back"}</h2><p>${signup?"Join TeraHire and take the next step in your career.":"Log in to continue to your account."}</p><form id="authForm"><label>Email address</label><input id="authEmail" type="email" required placeholder="you@example.com"><label>Password</label><input id="authPassword" type="password" minlength="8" required placeholder="At least 8 characters">${signup?'<label>Account type</label><select id="authRole"><option value="candidate">Job seeker</option><option value="recruiter">Recruiter</option></select>':''}<button class="btn btn-primary" type="submit">${signup?"Create account":"Log in"}</button></form><p class="hint">${configured?"Supabase authentication is enabled.":"Demo preview only. Add Supabase settings to enable authentication."}</p>`);
 $("authForm").onsubmit=async e=>{e.preventDefault();if(!configured){toast("Add Supabase URL and anon key in config.js first.");return}const email=$("authEmail").value,password=$("authPassword").value;let result;if(signup){result=await supabase.auth.signUp({email,password,options:{data:{role:$("authRole").value}}})}else{result=await supabase.auth.signInWithPassword({email,password})}if(result.error){toast(result.error.message);return}toast(signup?"Check your email to confirm your account.":"Logged in successfully.");closeModal()};
}
$("loginBtn").onclick=()=>authModal("login");$("signupBtn").onclick=()=>authModal("signup");
$("employerBtn").onclick=()=>openModal(`<div class="eyebrow">EMPLOYER ENQUIRY</div><h2>Let's find your next hire.</h2><p>Share your hiring requirement and our consultancy team can follow up.</p><form id="enquiryForm"><label>Company name</label><input required placeholder="Your company"><label>Work email</label><input required type="email" placeholder="name@company.com"><label>Hiring requirement</label><textarea rows="3" placeholder="Role, skills and number of openings"></textarea><button class="btn btn-primary">Send enquiry</button></form><p class="hint">Enquiry form is a UI preview. Connect a secure backend before collecting real enquiries.</p>`);$("modalContent").addEventListener("submit",e=>{if(e.target.id==="enquiryForm"){e.preventDefault();toast("Preview only — connect the enquiry backend to receive submissions.");closeModal()}});
$("menuBtn").onclick=()=>document.querySelector(".topbar nav").classList.toggle("open");
async function loadLiveJobs(){if(!configured)return;const {data,error}=await supabase.from("jobs").select("id,title,company_name,location,job_type,experience,salary,category,skills,description,created_at").eq("status","published").order("created_at",{ascending:false});if(!error&&data?.length){jobs=data.map(j=>({...j,posted:"Recently"}));renderJobs()}else if(error)console.warn("Live jobs not loaded:",error.message)}
renderJobs();loadLiveJobs();
