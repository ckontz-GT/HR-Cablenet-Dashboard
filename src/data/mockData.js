// ---------------------------------------------------------------------------
// Cablenet HR — mock dataset
// Deterministic (seeded) so the dashboard is stable across reloads while still
// feeling like real, populated data. Subject world: a Cypriot telecom.
// ---------------------------------------------------------------------------

// Seeded PRNG (mulberry32) — stable, no Math.random.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
const between = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1))

export const COMPANY = {
  name: 'Cablenet',
  unit: 'Cablenet Communication Systems',
  sector: 'Telecommunications · Cyprus',
}

export const DEPARTMENTS = [
  { id: 'network', name: 'Network Engineering', short: 'Network', hue: 265 },
  { id: 'field', name: 'Field Operations', short: 'Field Ops', hue: 28 },
  { id: 'care', name: 'Customer Care', short: 'Care', hue: 200 },
  { id: 'sales', name: 'Sales & Retail', short: 'Sales', hue: 322 },
  { id: 'marketing', name: 'Marketing', short: 'Marketing', hue: 340 },
  { id: 'product', name: 'Product & Digital', short: 'Product', hue: 250 },
  { id: 'it', name: 'IT & Security', short: 'IT', hue: 215 },
  { id: 'finance', name: 'Finance', short: 'Finance', hue: 160 },
  { id: 'people', name: 'People & Culture', short: 'People', hue: 290 },
]

const LOCATIONS = ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Remote']
const TYPES = ['Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract']

const FIRST = ['Andreas', 'Maria', 'Christos', 'Eleni', 'Giorgos', 'Sofia', 'Nikos', 'Anna', 'Petros', 'Despina',
  'Marios', 'Katerina', 'Stavros', 'Chara', 'Costas', 'Ioanna', 'Panayiotis', 'Elena', 'Demetris', 'Marilena',
  'Antonis', 'Natasa', 'Savvas', 'Christina', 'Loukas', 'Georgia', 'Michalis', 'Andri', 'Pavlos', 'Stella',
  'Yiannis', 'Rania', 'Kyriacos', 'Thekla', 'Alexis', 'Niki', 'Charalambos', 'Melina', 'Theodoros', 'Lia']
const LAST = ['Georgiou', 'Charalambous', 'Ioannou', 'Constantinou', 'Christodoulou', 'Nicolaou', 'Demetriou',
  'Papadopoulos', 'Andreou', 'Kyriakou', 'Stavrou', 'Petrou', 'Antoniou', 'Savva', 'Michael', 'Pavlou',
  'Hadjipavlou', 'Loizou', 'Theodorou', 'Markou', 'Vasiliou', 'Economou', 'Frangos', 'Kyprianou']

const TITLES = {
  network: ['Network Engineer', 'Senior Network Engineer', 'NOC Specialist', 'RF Engineer', 'Network Architect', 'Network Team Lead'],
  field: ['Field Technician', 'Senior Field Technician', 'Installation Lead', 'Field Operations Supervisor', 'Fibre Splicer'],
  care: ['Customer Care Agent', 'Senior Care Agent', 'Retention Specialist', 'Care Team Lead', 'Quality Analyst'],
  sales: ['Retail Advisor', 'Account Executive', 'Store Manager', 'B2B Sales Specialist', 'Sales Team Lead'],
  marketing: ['Marketing Specialist', 'Brand Manager', 'Content Lead', 'Performance Marketer', 'Social Media Manager'],
  product: ['Product Manager', 'UX Designer', 'Frontend Engineer', 'Backend Engineer', 'Data Analyst', 'QA Engineer'],
  it: ['IT Support Specialist', 'Systems Administrator', 'Security Analyst', 'DevOps Engineer', 'IT Manager'],
  finance: ['Financial Analyst', 'Accountant', 'Billing Specialist', 'Finance Manager', 'Payroll Officer'],
  people: ['HR Business Partner', 'Recruiter', 'L&D Specialist', 'People Operations Lead', 'HR Coordinator'],
}

const SKILLS = {
  network: ['DOCSIS', 'Fibre/GPON', 'BGP', 'MPLS', 'Cisco IOS', 'Juniper', 'DWDM', 'SNMP', 'Linux', 'Python'],
  field: ['Fibre splicing', 'OTDR', 'CPE install', 'Cabling', 'Health & Safety', 'Troubleshooting', 'Driving licence'],
  care: ['CRM', 'De-escalation', 'Greek', 'English', 'Retention', 'Billing systems', 'Empathy', 'Upselling'],
  sales: ['Negotiation', 'CRM', 'B2B', 'Telecom products', 'Targets', 'Greek', 'English', 'Forecasting'],
  marketing: ['SEO', 'Google Ads', 'Meta Ads', 'Copywriting', 'Analytics', 'Brand', 'Figma', 'Email'],
  product: ['React', 'TypeScript', 'Node.js', 'Figma', 'SQL', 'Roadmapping', 'A/B testing', 'Python', 'AWS'],
  it: ['Windows Server', 'Active Directory', 'Azure', 'Networking', 'SIEM', 'Bash', 'Incident response', 'M365'],
  finance: ['Excel', 'SAP', 'IFRS', 'Forecasting', 'Reconciliation', 'Payroll', 'Power BI', 'Audit'],
  people: ['Recruiting', 'ATS', 'Employee relations', 'L&D', 'Payroll', 'Greek labour law', 'Onboarding', 'HRIS'],
}

const STATUS_WEIGHTS = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'On leave', 'Onboarding']

function makeEmployees() {
  const r = rng(20260630)
  const out = []
  const perDept = { network: 9, field: 11, care: 12, sales: 8, marketing: 5, product: 7, it: 5, finance: 5, people: 4 }
  let id = 1
  for (const dept of DEPARTMENTS) {
    const count = perDept[dept.id]
    for (let i = 0; i < count; i++) {
      const first = pick(r, FIRST)
      const last = pick(r, LAST)
      const isLead = i === 0
      const titlePool = TITLES[dept.id]
      const title = isLead ? titlePool[titlePool.length - 1] : pick(r, titlePool.slice(0, -1))
      const startYear = between(r, 2014, 2025)
      const startMonth = between(r, 1, 12)
      const startDay = between(r, 1, 28)
      const start = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`
      const tenure = +(2026.5 - (startYear + startMonth / 12)).toFixed(1)
      const skillPool = SKILLS[dept.id]
      const nSkills = between(r, 3, 5)
      const skills = [...skillPool].sort(() => r() - 0.5).slice(0, nSkills)
      const status = pick(r, STATUS_WEIGHTS)
      const gender = r() > 0.46 ? 'F' : 'M'
      const perf = pick(r, ['Exceeds', 'Exceeds', 'Meets', 'Meets', 'Meets', 'Developing'])
      const annualEntitlement = 21 + (tenure > 5 ? 4 : tenure > 2 ? 2 : 0)
      const taken = between(r, 2, Math.max(3, Math.min(annualEntitlement - 2, 18)))
      out.push({
        id: `EMP-${String(id).padStart(3, '0')}`,
        firstName: first,
        lastName: last,
        name: `${first} ${last}`,
        initials: (first[0] + last[0]).toUpperCase(),
        title,
        isLead,
        department: dept.id,
        departmentName: dept.name,
        location: pick(r, LOCATIONS),
        employmentType: pick(r, TYPES),
        status,
        gender,
        email: `${first}.${last}@cablenet.com.cy`.toLowerCase(),
        phone: `+357 9${between(r, 1000000, 9999999)}`,
        startDate: start,
        tenureYears: tenure,
        performance: perf,
        hue: dept.hue,
        skills,
        leave: { entitlement: annualEntitlement, taken, remaining: annualEntitlement - taken },
      })
      id++
    }
  }
  // assign managers: each non-lead reports to their dept lead
  const leadByDept = {}
  out.forEach((e) => { if (e.isLead) leadByDept[e.department] = e })
  out.forEach((e) => {
    e.managerId = e.isLead ? null : leadByDept[e.department]?.id ?? null
    e.managerName = e.isLead ? '—' : leadByDept[e.department]?.name ?? '—'
  })
  return out
}

export const EMPLOYEES = makeEmployees()
export const employeeById = (id) => EMPLOYEES.find((e) => e.id === id)
export const departmentById = (id) => DEPARTMENTS.find((d) => d.id === id)

// --- Leave / time off ---------------------------------------------------------
const LEAVE_TYPES = ['Annual', 'Annual', 'Sick', 'Parental', 'Unpaid']
function makeLeave() {
  const r = rng(7788)
  const out = []
  for (let i = 0; i < 26; i++) {
    const emp = pick(r, EMPLOYEES)
    const type = pick(r, LEAVE_TYPES)
    const month = between(r, 6, 8)
    const startDay = between(r, 1, 26)
    const len = type === 'Sick' ? between(r, 1, 3) : between(r, 2, 9)
    const endDay = Math.min(28, startDay + len)
    const status = i < 8 ? 'Pending' : pick(r, ['Approved', 'Approved', 'Approved', 'Rejected'])
    out.push({
      id: `LV-${1000 + i}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      type,
      startDate: `2026-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
      endDate: `2026-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
      days: endDay - startDay + 1,
      status,
      reason: { Annual: 'Annual leave', Sick: 'Sick leave', Parental: 'Parental leave', Unpaid: 'Unpaid leave' }[type],
      submitted: `2026-06-${String(between(r, 1, 28)).padStart(2, '0')}`,
    })
  }
  return out.sort((a, b) => (a.status === 'Pending' ? -1 : 1) - (b.status === 'Pending' ? -1 : 1))
}
export const LEAVE_REQUESTS = makeLeave()
export const PENDING_LEAVE = LEAVE_REQUESTS.filter((l) => l.status === 'Pending')

// who's out today (subset of On leave employees)
export const OUT_TODAY = EMPLOYEES.filter((e) => e.status === 'On leave').slice(0, 7).map((e) => ({
  id: e.id, name: e.name, department: e.departmentName, initials: e.initials, hue: e.hue,
  until: '2026-07-0' + ((e.id.charCodeAt(6) % 6) + 1),
  type: ['Annual', 'Sick', 'Parental'][e.id.charCodeAt(6) % 3],
}))

// --- Recruiting ---------------------------------------------------------------
export const JOB_OPENINGS = [
  { id: 'JOB-301', title: 'Senior Network Engineer', department: 'network', location: 'Nicosia', type: 'Full-time', openings: 2, posted: '2026-05-12', status: 'Open', applicants: 34, priority: 'High' },
  { id: 'JOB-302', title: 'Fibre Field Technician', department: 'field', location: 'Limassol', type: 'Full-time', openings: 4, posted: '2026-05-28', status: 'Open', applicants: 51, priority: 'High' },
  { id: 'JOB-303', title: 'Customer Care Agent (Greek/English)', department: 'care', location: 'Larnaca', type: 'Full-time', openings: 6, posted: '2026-06-02', status: 'Open', applicants: 88, priority: 'Medium' },
  { id: 'JOB-304', title: 'Frontend Engineer', department: 'product', location: 'Remote', type: 'Full-time', openings: 1, posted: '2026-06-10', status: 'Open', applicants: 42, priority: 'High' },
  { id: 'JOB-305', title: 'Performance Marketer', department: 'marketing', location: 'Nicosia', type: 'Full-time', openings: 1, posted: '2026-06-15', status: 'Open', applicants: 19, priority: 'Low' },
  { id: 'JOB-306', title: 'B2B Sales Specialist', department: 'sales', location: 'Limassol', type: 'Full-time', openings: 2, posted: '2026-04-30', status: 'Open', applicants: 27, priority: 'Medium' },
  { id: 'JOB-307', title: 'Security Analyst', department: 'it', location: 'Nicosia', type: 'Full-time', openings: 1, posted: '2026-06-20', status: 'Open', applicants: 12, priority: 'High' },
]
export const jobById = (id) => JOB_OPENINGS.find((j) => j.id === id)

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']
function makeCandidates() {
  const r = rng(4242)
  const sources = ['LinkedIn', 'Referral', 'Careers site', 'Agency', 'Indeed']
  const out = []
  let id = 1
  for (const job of JOB_OPENINGS) {
    const n = between(r, 5, 9)
    for (let i = 0; i < n; i++) {
      const first = pick(r, FIRST)
      const last = pick(r, LAST)
      const stageIdx = Math.min(STAGES.length - 1, Math.floor(Math.pow(r(), 1.7) * STAGES.length))
      const deptSkills = SKILLS[job.department]
      const skills = [...deptSkills].sort(() => r() - 0.5).slice(0, between(r, 3, 5))
      out.push({
        id: `CND-${2000 + id}`,
        name: `${first} ${last}`,
        initials: (first[0] + last[0]).toUpperCase(),
        jobId: job.id,
        role: job.title,
        department: job.department,
        stage: STAGES[stageIdx],
        rating: between(r, 2, 5),
        source: pick(r, sources),
        appliedDate: `2026-06-${String(between(r, 1, 28)).padStart(2, '0')}`,
        skills,
        hue: departmentById(job.department).hue,
      })
      id++
    }
  }
  return out
}
export const CANDIDATES = makeCandidates()

export const FUNNEL = STAGES.map((s) => ({ stage: s, count: CANDIDATES.filter((c) => c.stage === s).length }))

// --- Onboarding ---------------------------------------------------------------
const ONBOARD_TASKS = ['Contract signed', 'Equipment issued', 'Accounts provisioned', 'Induction completed', 'Buddy assigned', 'First-week check-in']
export const ONBOARDING = EMPLOYEES.filter((e) => e.status === 'Onboarding').slice(0, 6).map((e, i) => {
  const r = rng(900 + i)
  const done = between(r, 1, ONBOARD_TASKS.length)
  return {
    id: e.id, name: e.name, initials: e.initials, title: e.title, department: e.departmentName, hue: e.hue,
    startDate: e.startDate,
    tasks: ONBOARD_TASKS.map((t, j) => ({ label: t, done: j < done })),
    progress: Math.round((done / ONBOARD_TASKS.length) * 100),
  }
})

// --- Analytics / trends -------------------------------------------------------
export const HEADCOUNT_TREND = (() => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  let base = 52
  const r = rng(111)
  return months.map((m, i) => {
    base += between(r, -1, 4)
    return { label: m, headcount: base, hires: between(r, 0, 5), exits: between(r, 0, 3) }
  })
})()

export const HEADCOUNT_BY_DEPT = DEPARTMENTS.map((d) => ({
  id: d.id, name: d.short, fullName: d.name, hue: d.hue,
  count: EMPLOYEES.filter((e) => e.department === d.id).length,
}))

export const GENDER_SPLIT = (() => {
  const f = EMPLOYEES.filter((e) => e.gender === 'F').length
  return { female: f, male: EMPLOYEES.length - f, total: EMPLOYEES.length }
})()

export const TENURE_BUCKETS = (() => {
  const buckets = [
    { label: '<1y', test: (t) => t < 1 },
    { label: '1–3y', test: (t) => t >= 1 && t < 3 },
    { label: '3–5y', test: (t) => t >= 3 && t < 5 },
    { label: '5–8y', test: (t) => t >= 5 && t < 8 },
    { label: '8y+', test: (t) => t >= 8 },
  ]
  return buckets.map((b) => ({ label: b.label, count: EMPLOYEES.filter((e) => b.test(e.tenureYears)).length }))
})()

export const LOCATION_SPLIT = LOCATIONS.map((loc) => ({
  location: loc, count: EMPLOYEES.filter((e) => e.location === loc).length,
}))

// --- Activity feed ------------------------------------------------------------
export const ACTIVITY = [
  { id: 1, kind: 'leave', text: 'approved annual leave for', subject: EMPLOYEES[3].name, actor: 'You', time: '12m ago' },
  { id: 2, kind: 'hire', text: 'moved to Offer stage for Frontend Engineer', subject: CANDIDATES.find((c) => c.jobId === 'JOB-304')?.name ?? 'Candidate', actor: 'Recruiting', time: '40m ago' },
  { id: 3, kind: 'cv', text: 'screened 12 CVs for Customer Care Agent', subject: '', actor: 'CV Screening', time: '1h ago' },
  { id: 4, kind: 'onboard', text: 'completed induction', subject: ONBOARDING[0]?.name ?? 'New hire', actor: 'People Ops', time: '2h ago' },
  { id: 5, kind: 'leave', text: 'submitted a sick leave request', subject: PENDING_LEAVE[0]?.employeeName ?? 'Employee', actor: '', time: '3h ago' },
  { id: 6, kind: 'review', text: 'logged a performance review for Network Engineering', subject: '', actor: 'You', time: 'Yesterday' },
]

// --- Headline KPIs ------------------------------------------------------------
export const KPIS = {
  headcount: EMPLOYEES.length,
  headcountDelta: +4,
  openRoles: JOB_OPENINGS.reduce((s, j) => s + j.openings, 0),
  openReqs: JOB_OPENINGS.length,
  pendingLeave: PENDING_LEAVE.length,
  onLeaveToday: OUT_TODAY.length,
  onboarding: ONBOARDING.length,
  attrition: 8.4, // annualised %
  avgTenure: +(EMPLOYEES.reduce((s, e) => s + e.tenureYears, 0) / EMPLOYEES.length).toFixed(1),
  offerAcceptance: 86,
  timeToHireDays: 27,
  candidates: CANDIDATES.length,
}
