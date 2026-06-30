// ---------------------------------------------------------------------------
// CV screening engine — deterministic, local.
// Parses pasted CV text, extracts skills/signals, and scores a candidate
// against a role's requirement profile. Transparent scoring (no black box):
// every point is traceable to a matched or missing requirement.
// ---------------------------------------------------------------------------

// Per-role requirement profiles (weighted skills + experience expectations).
export const ROLE_PROFILES = {
  'JOB-301': {
    title: 'Senior Network Engineer',
    mustHave: ['BGP', 'MPLS', 'Fibre', 'DOCSIS', 'Cisco', 'Juniper'],
    niceToHave: ['Python', 'Linux', 'DWDM', 'SNMP', 'Automation'],
    minYears: 5,
    keywords: ['network', 'isp', 'telecom', 'noc', 'routing', 'switching'],
  },
  'JOB-302': {
    title: 'Fibre Field Technician',
    mustHave: ['Fibre', 'Splicing', 'OTDR', 'Cabling', 'Installation'],
    niceToHave: ['Health & Safety', 'Driving licence', 'Troubleshooting', 'CPE'],
    minYears: 2,
    keywords: ['field', 'technician', 'fttх', 'ftth', 'civil', 'outdoor'],
  },
  'JOB-303': {
    title: 'Customer Care Agent',
    mustHave: ['Greek', 'English', 'CRM', 'Communication'],
    niceToHave: ['Retention', 'Billing', 'De-escalation', 'Upselling', 'Sales'],
    minYears: 1,
    keywords: ['customer', 'support', 'call', 'service', 'contact', 'helpdesk'],
  },
  'JOB-304': {
    title: 'Frontend Engineer',
    mustHave: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
    niceToHave: ['Node.js', 'Figma', 'Testing', 'AWS', 'Accessibility', 'Tailwind'],
    minYears: 3,
    keywords: ['frontend', 'web', 'ui', 'spa', 'component', 'git'],
  },
  'JOB-307': {
    title: 'Security Analyst',
    mustHave: ['SIEM', 'Incident response', 'Networking', 'Security'],
    niceToHave: ['Azure', 'Python', 'Forensics', 'ISO 27001', 'Threat'],
    minYears: 3,
    keywords: ['security', 'soc', 'analyst', 'vulnerability', 'compliance'],
  },
}

// Broad skill vocabulary the parser can recognise (alias → canonical).
const SKILL_ALIASES = {
  react: 'React', 'react.js': 'React', reactjs: 'React',
  javascript: 'JavaScript', js: 'JavaScript', es6: 'JavaScript',
  typescript: 'TypeScript', ts: 'TypeScript',
  css: 'CSS', scss: 'CSS', sass: 'CSS', tailwind: 'Tailwind', html: 'HTML',
  'node.js': 'Node.js', node: 'Node.js', nodejs: 'Node.js',
  figma: 'Figma', aws: 'AWS', azure: 'Azure', testing: 'Testing', jest: 'Testing', cypress: 'Testing',
  accessibility: 'Accessibility', a11y: 'Accessibility', git: 'Git',
  bgp: 'BGP', mpls: 'MPLS', docsis: 'DOCSIS', cisco: 'Cisco', juniper: 'Juniper',
  dwdm: 'DWDM', snmp: 'SNMP', python: 'Python', linux: 'Linux', automation: 'Automation', ansible: 'Automation',
  fibre: 'Fibre', fiber: 'Fibre', gpon: 'Fibre', splicing: 'Splicing', otdr: 'OTDR',
  cabling: 'Cabling', installation: 'Installation', cpe: 'CPE', troubleshooting: 'Troubleshooting',
  'health & safety': 'Health & Safety', 'health and safety': 'Health & Safety', 'driving licence': 'Driving licence', 'driving license': 'Driving licence',
  greek: 'Greek', english: 'English', crm: 'CRM', salesforce: 'CRM', communication: 'Communication',
  retention: 'Retention', billing: 'Billing', 'de-escalation': 'De-escalation', upselling: 'Upselling', sales: 'Sales',
  siem: 'SIEM', splunk: 'SIEM', 'incident response': 'Incident response', networking: 'Networking',
  security: 'Security', forensics: 'Forensics', 'iso 27001': 'ISO 27001', threat: 'Threat',
  vulnerability: 'Threat',
}

const EDU = [/\bbsc\b/i, /\bb\.?s\.?c?\b/i, /bachelor/i, /\bmsc\b/i, /master/i, /\bphd\b/i, /degree/i, /diploma/i, /university/i, /\bhnd\b/i]

export function extractFromCV(text) {
  const lower = ' ' + text.toLowerCase().replace(/[\n\r]+/g, ' ') + ' '
  const found = new Set()
  for (const [alias, canon] of Object.entries(SKILL_ALIASES)) {
    const re = new RegExp(`(^|[^a-z0-9+#])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9+#]|$)`, 'i')
    if (re.test(lower)) found.add(canon)
  }
  // years of experience
  let years = 0
  const ym = text.match(/(\d{1,2})\+?\s*(?:years|yrs|yr)\b/i)
  if (ym) years = Math.min(40, parseInt(ym[1], 10))
  // fall back: infer from date ranges like 2018–2024
  if (!years) {
    const ranges = [...text.matchAll(/(20\d{2})\s*[–\-to]+\s*(20\d{2}|present|now)/gi)]
    for (const m of ranges) {
      const start = parseInt(m[1], 10)
      const end = /present|now/i.test(m[2]) ? 2026 : parseInt(m[2], 10)
      if (end >= start) years += end - start
    }
    years = Math.min(40, years)
  }
  const education = EDU.some((re) => re.test(text))
  const wordCount = (text.trim().match(/\S+/g) || []).length
  return { skills: [...found], years, education, wordCount }
}

export function scoreCV(text, jobId) {
  const profile = ROLE_PROFILES[jobId]
  const parsed = extractFromCV(text)
  const skillSet = new Set(parsed.skills.map((s) => s.toLowerCase()))

  const mustMatched = profile.mustHave.filter((s) => skillSet.has(s.toLowerCase()))
  const mustMissing = profile.mustHave.filter((s) => !skillSet.has(s.toLowerCase()))
  const niceMatched = profile.niceToHave.filter((s) => skillSet.has(s.toLowerCase()))

  // Weighted score out of 100
  const mustScore = (mustMatched.length / profile.mustHave.length) * 55
  const niceScore = (niceMatched.length / profile.niceToHave.length) * 20
  const expScore = Math.min(1, parsed.years / profile.minYears) * 15
  const eduScore = parsed.education ? 5 : 0
  const lengthSignal = parsed.wordCount > 120 ? 5 : parsed.wordCount > 40 ? 3 : 1
  const total = Math.round(mustScore + niceScore + expScore + eduScore + lengthSignal)

  const band = total >= 75 ? 'Strong match' : total >= 55 ? 'Worth a screen' : total >= 35 ? 'Borderline' : 'Likely pass'
  const tone = total >= 75 ? 'good' : total >= 55 ? 'brand' : total >= 35 ? 'warn' : 'crit'

  const breakdown = [
    { label: 'Must-have skills', got: +mustScore.toFixed(0), max: 55, detail: `${mustMatched.length}/${profile.mustHave.length} matched` },
    { label: 'Nice-to-have skills', got: +niceScore.toFixed(0), max: 20, detail: `${niceMatched.length}/${profile.niceToHave.length} matched` },
    { label: 'Experience', got: +expScore.toFixed(0), max: 15, detail: `${parsed.years || '0'}y vs ${profile.minYears}y target` },
    { label: 'Education', got: eduScore, max: 5, detail: parsed.education ? 'Degree/diploma found' : 'Not detected' },
    { label: 'CV completeness', got: lengthSignal, max: 5, detail: `${parsed.wordCount} words` },
  ]

  const flags = []
  if (mustMissing.length) flags.push({ tone: 'crit', text: `Missing must-have: ${mustMissing.join(', ')}` })
  if (parsed.years < profile.minYears) flags.push({ tone: 'warn', text: `Below target experience (${parsed.years || 0}y < ${profile.minYears}y)` })
  if (!parsed.education) flags.push({ tone: 'warn', text: 'No education / qualification detected' })
  if (niceMatched.length >= 3) flags.push({ tone: 'good', text: `Strong extras: ${niceMatched.slice(0, 4).join(', ')}` })
  if (mustMatched.length === profile.mustHave.length) flags.push({ tone: 'good', text: 'Meets every must-have requirement' })

  return { total, band, tone, breakdown, mustMatched, mustMissing, niceMatched, flags, parsed, profile }
}

// A couple of sample CVs so the page is demonstrable without a real upload.
export const SAMPLE_CVS = {
  'JOB-304': `Andreas Georgiou — Frontend Engineer
Limassol, Cyprus

Summary
Frontend engineer with 5 years building responsive web apps. Specialised in React and TypeScript.

Experience
Senior Frontend Developer, Tech Co (2021 - present)
- Built component libraries in React, TypeScript and Tailwind CSS
- Improved accessibility (a11y) and added Jest/Cypress testing
- Worked with Node.js APIs and deployed on AWS

Frontend Developer, Agency (2019 - 2021)
- HTML, CSS, JavaScript, Figma handoffs, Git workflows

Education
BSc Computer Science, University of Cyprus`,

  'JOB-301': `Maria Constantinou — Network Engineer
Nicosia

7 years experience in ISP and telecom networks (NOC, routing, switching).
Skills: BGP, MPLS, Cisco IOS, Juniper, DOCSIS, fibre/GPON, Python automation, Linux, SNMP.
MSc Telecommunications.`,

  'JOB-302': `Costas Petrou — Field Technician
3 years FTTH installation experience.
Fibre splicing, OTDR testing, cabling, CPE installation, troubleshooting.
Valid driving licence. Health and safety certified.`,
}
