// ---------------------------------------------------------------------------
// Local RAG engine for the HR assistant.
//
// This retrieves over the dashboard's own data and composes an answer — it is
// NOT a hosted LLM call. Intent detection routes a question to a handler; the
// handler retrieves matching records and returns a natural-language answer plus
// structured `sources` and `cards` the chat UI renders. Honest + offline.
// ---------------------------------------------------------------------------
import {
  EMPLOYEES, DEPARTMENTS, JOB_OPENINGS, CANDIDATES, LEAVE_REQUESTS, PENDING_LEAVE,
  OUT_TODAY, KPIS, HEADCOUNT_BY_DEPT, GENDER_SPLIT, departmentById, COMPANY, ONBOARDING,
} from '../data/mockData'
import { fmtRange } from './date'

const STOP = new Set('a an the is are was were do does of in on at to for with how many who what which whats our we have has and or me show tell about list give'.split(' '))
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9+#\s.]/g, ' ').replace(/\s+/g, ' ').trim()
const tokens = (s) => norm(s).split(' ').filter((t) => t && !STOP.has(t))

function matchDept(q) {
  const n = norm(q)
  return DEPARTMENTS.find((d) => n.includes(norm(d.name)) || n.includes(norm(d.short)) ||
    (d.id === 'network' && /network|noc|fibre|fiber/.test(n)) ||
    (d.id === 'care' && /care|support|call center|call centre/.test(n)) ||
    (d.id === 'field' && /field|technician|install/.test(n)) ||
    (d.id === 'sales' && /sales|retail|shop|store/.test(n)) ||
    (d.id === 'people' && /\bhr\b|people|culture|recruit/.test(n)) ||
    (d.id === 'it' && /\bit\b|security|infosec/.test(n)) ||
    (d.id === 'finance' && /finance|payroll|account/.test(n)) ||
    (d.id === 'product' && /product|engineer|developer|design|digital/.test(n)) ||
    (d.id === 'marketing' && /marketing|brand|content|ads/.test(n)))
}

function matchEmployee(q) {
  const n = norm(q)
  // by id
  const idm = q.match(/emp-?\d{1,3}/i)
  if (idm) {
    const id = 'EMP-' + idm[0].replace(/\D/g, '').padStart(3, '0')
    const e = EMPLOYEES.find((x) => x.id === id)
    if (e) return e
  }
  // by name token
  return EMPLOYEES.find((e) => {
    const fn = e.firstName.toLowerCase(), ln = e.lastName.toLowerCase()
    return (n.includes(fn) && n.includes(ln)) || n.includes(e.name.toLowerCase())
  }) || EMPLOYEES.find((e) => n.split(' ').includes(e.firstName.toLowerCase()))
}

const empCard = (e) => ({ type: 'employee', id: e.id, name: e.name, initials: e.initials, hue: e.hue, title: e.title, dept: e.departmentName, location: e.location, status: e.status })
const fmtList = (arr, n = 6) => arr.slice(0, n).map((x) => x.name).join(', ') + (arr.length > n ? ` and ${arr.length - n} more` : '')

const SUGGESTIONS = [
  'How many people work at Cablenet?',
  'Who is on leave today?',
  'How many open roles do we have?',
  'Show me the Network Engineering team',
  'Find people who know fibre splicing',
  "What's our attrition rate?",
  'Who is in the Offer stage?',
  'What is the average tenure?',
]

export function ragSuggestions() { return SUGGESTIONS }

export function ragQuery(raw) {
  const q = raw.trim()
  const n = norm(q)
  const t = tokens(q)
  const has = (...words) => words.some((w) => n.includes(w))

  // --- greetings / help -------------------------------------------------------
  if (/^(hi|hey|hello|yo|sup)\b/.test(n) || n === 'help') {
    return {
      answer: `Hi! I'm Signal, the Cablenet HR assistant. I answer from your live HR data — people, time off, recruiting, analytics. Try one of the suggestions below.`,
      sources: ['Assistant'], cards: [], chips: SUGGESTIONS.slice(0, 4),
    }
  }

  // --- headcount / company size ----------------------------------------------
  if (has('how many people', 'headcount', 'total employees', 'company size', 'staff', 'how many employees', 'how big')) {
    const dept = matchDept(q)
    if (dept) {
      const list = EMPLOYEES.filter((e) => e.department === dept.id)
      return {
        answer: `${dept.name} has ${list.length} people — ${list.filter((e) => e.status === 'Active').length} active, ${list.filter((e) => e.status === 'On leave').length} on leave. The team lead is ${list.find((e) => e.isLead)?.name ?? '—'}.`,
        sources: [`Directory · ${dept.name}`], cards: list.slice(0, 4).map(empCard),
      }
    }
    return {
      answer: `Cablenet currently has ${KPIS.headcount} employees across ${DEPARTMENTS.length} departments and ${[...new Set(EMPLOYEES.map((e) => e.location))].length} locations. Headcount is up ${KPIS.headcountDelta} this quarter, with ${KPIS.onboarding} people currently onboarding.`,
      sources: ['Overview · KPIs', 'Analytics · Headcount'],
      cards: HEADCOUNT_BY_DEPT.slice(0, 4).map((d) => ({ type: 'stat', label: d.fullName, value: d.count })),
    }
  }

  // --- list a department's people --------------------------------------------
  if ((has('who works', 'who is in', 'show me', 'people in', 'team', 'list') || matchDept(q)) && matchDept(q) && !has('open', 'role', 'hiring', 'vacanc')) {
    const dept = matchDept(q)
    const list = EMPLOYEES.filter((e) => e.department === dept.id)
    return {
      answer: `${dept.name} (${list.length}) — ${fmtList(list)}. Led by ${list.find((e) => e.isLead)?.name ?? '—'}.`,
      sources: [`Directory · ${dept.name}`], cards: list.slice(0, 6).map(empCard),
    }
  }

  // --- who's out / on leave today --------------------------------------------
  if (has('on leave today', 'out today', "who's out", 'whos out', 'away today', 'off today', 'absent')) {
    return {
      answer: OUT_TODAY.length
        ? `${OUT_TODAY.length} people are out today: ${OUT_TODAY.map((o) => `${o.name} (${o.type})`).join(', ')}.`
        : `Nobody is recorded as out today.`,
      sources: ['Time Off · Who’s out'],
      cards: OUT_TODAY.slice(0, 6).map((o) => ({ type: 'employee', id: o.id, name: o.name, initials: o.initials, hue: o.hue, title: o.type + ' leave', dept: o.department, status: 'On leave' })),
    }
  }

  // --- leave records ----------------------------------------------------------
  if (has('pending leave', 'leave request', 'approve', 'time off request', 'pending request', 'leave records', 'how much leave', 'leave on record')) {
    const totalDays = LEAVE_REQUESTS.reduce((s, l) => s + l.days, 0)
    return {
      answer: `There are ${LEAVE_REQUESTS.length} leave entries on record, totalling ${totalDays} days across annual, sick, parental and unpaid leave.`,
      sources: ['Time Off · Leave records'],
      cards: LEAVE_REQUESTS.slice(0, 4).map((l) => ({ type: 'leave', name: l.employeeName, kind: l.type, days: l.days, when: fmtRange(l.startDate, l.endDate) })),
    }
  }

  // --- open roles / recruiting ------------------------------------------------
  if (has('open role', 'open position', 'hiring', 'vacanc', 'open req', 'jobs', 'recruit')) {
    const dept = matchDept(q)
    const jobs = dept ? JOB_OPENINGS.filter((j) => j.department === dept.id) : JOB_OPENINGS
    const seats = jobs.reduce((s, j) => s + j.openings, 0)
    return {
      answer: dept
        ? `${dept.name} has ${jobs.length} open requisition(s) for ${seats} seat(s): ${jobs.map((j) => j.title).join(', ') || 'none'}.`
        : `There are ${JOB_OPENINGS.length} open requisitions for ${KPIS.openRoles} seats, with ${KPIS.candidates} candidates in the pipeline. Time-to-hire averages ${KPIS.timeToHireDays} days and offer acceptance is ${KPIS.offerAcceptance}%.`,
      sources: ['Recruiting · Open roles'],
      cards: jobs.slice(0, 4).map((j) => ({ type: 'job', id: j.id, title: j.title, dept: departmentById(j.department).name, openings: j.openings, applicants: j.applicants, priority: j.priority })),
    }
  }

  // --- candidates by stage ----------------------------------------------------
  if (has('offer stage', 'in offer', 'interview stage', 'screening stage', 'candidate', 'pipeline', 'applicant')) {
    const stage = ['Hired', 'Offer', 'Interview', 'Screening', 'Applied'].find((s) => n.includes(s.toLowerCase())) || 'Offer'
    const list = CANDIDATES.filter((c) => c.stage === stage)
    return {
      answer: `${list.length} candidate(s) are in the ${stage} stage: ${fmtList(list, 5)}.`,
      sources: ['Recruiting · Pipeline'],
      cards: list.slice(0, 4).map((c) => ({ type: 'candidate', name: c.name, initials: c.initials, hue: c.hue, role: c.role, stage: c.stage, rating: c.rating })),
    }
  }

  // --- attrition / tenure / diversity metrics --------------------------------
  if (has('attrition', 'turnover', 'churn')) {
    return { answer: `Annualised attrition is ${KPIS.attrition}%, below the telecom-sector benchmark. Average tenure across Cablenet is ${KPIS.avgTenure} years.`, sources: ['Analytics · Attrition'], cards: [{ type: 'stat', label: 'Attrition (annualised)', value: KPIS.attrition + '%' }, { type: 'stat', label: 'Avg tenure', value: KPIS.avgTenure + 'y' }] }
  }
  if (has('average tenure', 'avg tenure', 'how long', 'tenure')) {
    return { answer: `Average tenure is ${KPIS.avgTenure} years. The longest-serving team tends to be Finance and Network Engineering.`, sources: ['Analytics · Tenure'], cards: [{ type: 'stat', label: 'Avg tenure', value: KPIS.avgTenure + 'y' }] }
  }
  if (has('gender', 'diversity', 'female', 'male', 'women', 'men')) {
    const pct = Math.round((GENDER_SPLIT.female / GENDER_SPLIT.total) * 100)
    return { answer: `Gender balance is ${pct}% women / ${100 - pct}% men across ${GENDER_SPLIT.total} employees.`, sources: ['Analytics · Diversity'], cards: [{ type: 'stat', label: 'Women', value: pct + '%' }, { type: 'stat', label: 'Men', value: 100 - pct + '%' }] }
  }
  if (has('onboard', 'new hire', 'new starter')) {
    return { answer: `${ONBOARDING.length} people are currently onboarding: ${ONBOARDING.map((o) => `${o.name} (${o.progress}%)`).join(', ')}.`, sources: ['Recruiting · Onboarding'], cards: ONBOARDING.slice(0, 4).map((o) => ({ type: 'employee', id: o.id, name: o.name, initials: o.initials, hue: o.hue, title: o.title, dept: o.department, status: 'Onboarding' })) }
  }

  // --- skills search ----------------------------------------------------------
  if (has('know', 'skill', 'who can', 'find people', 'experience with', 'proficient')) {
    const allSkills = [...new Set(EMPLOYEES.flatMap((e) => e.skills))]
    const wanted = allSkills.filter((s) => n.includes(s.toLowerCase()) || t.some((tok) => s.toLowerCase().includes(tok) && tok.length > 2))
    if (wanted.length) {
      const list = EMPLOYEES.filter((e) => wanted.some((w) => e.skills.includes(w)))
      return {
        answer: `${list.length} people list ${wanted.join(' / ')}: ${fmtList(list)}.`,
        sources: ['Directory · Skills'], cards: list.slice(0, 4).map(empCard),
      }
    }
  }

  // --- specific person --------------------------------------------------------
  const emp = matchEmployee(q)
  if (emp) {
    return {
      answer: `${emp.name} is a ${emp.title} in ${emp.departmentName}, based in ${emp.location}. ${emp.status === 'Active' ? 'Currently active' : `Status: ${emp.status}`}, with ${emp.tenureYears} years tenure. Reports to ${emp.managerName}. Skills: ${emp.skills.join(', ')}. Leave balance: ${emp.leave.remaining}/${emp.leave.entitlement} days remaining.`,
      sources: [`Directory · ${emp.id}`], cards: [empCard(emp)],
    }
  }

  // --- keyword fallback: retrieve best-matching employees --------------------
  if (t.length) {
    const scored = EMPLOYEES.map((e) => {
      const hay = `${e.name} ${e.title} ${e.departmentName} ${e.location} ${e.skills.join(' ')}`.toLowerCase()
      const score = t.reduce((s, tok) => s + (hay.includes(tok) ? 1 : 0), 0)
      return { e, score }
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score)
    if (scored.length) {
      return {
        answer: `I found ${scored.length} record(s) matching “${q}”. Top matches: ${fmtList(scored.map((x) => x.e))}.`,
        sources: ['Directory · Search'], cards: scored.slice(0, 4).map((x) => empCard(x.e)),
      }
    }
  }

  return {
    answer: `I couldn't find anything for that in the HR data. I can answer about headcount, departments, time off, recruiting, candidates, skills, or a specific person. Try one of these:`,
    sources: ['Assistant'], cards: [], chips: SUGGESTIONS.slice(0, 4),
  }
}
