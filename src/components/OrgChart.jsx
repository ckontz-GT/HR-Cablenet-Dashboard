import { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap, Panel, Handle, Position,
  useNodesState, useEdgesState, BackgroundVariant, getNodesBounds, getViewportForBounds,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { toPng } from 'html-to-image'
import {
  Users, X, BellRing, Download, Rows3, Columns3, ChevronUp, ChevronDown,
  Mail, MapPin, Calendar,
} from 'lucide-react'
import { Avatar, Pill, Progress, STATUS_TONE } from './ui'
import { Slashes } from './Logo'
import { clsx } from '../lib/clsx'
import { EMPLOYEES, DEPARTMENTS, COMPANY, employeeById, departmentById, NEEDS_ATTENTION } from '../data/mockData'

const STATUS_DOT = { Active: 'bg-good-500', 'On leave': 'bg-warn-500', Onboarding: 'bg-info-500' }
const ATTENTION_IDS = new Set(NEEDS_ATTENTION.map((i) => i.employeeId))
const attentionCountFor = (id) => NEEDS_ATTENTION.filter((i) => i.employeeId === id).length
const EMPTY_SET = new Set()

const HANDLES = {
  vertical: { target: Position.Top, source: Position.Bottom },
  horizontal: { target: Position.Left, source: Position.Right },
}

// ---- Custom nodes -----------------------------------------------------------
const hidden = { opacity: 0, width: 1, height: 1, minWidth: 0, border: 0 }

function CompanyNode({ data }) {
  const h = HANDLES[data.orientation]
  return (
    <div className={clsx('inline-flex items-center gap-2.5 rounded-2xl bg-signal text-white px-4 py-3 shadow-lg w-[210px] transition-opacity duration-200', data.dimmed && 'opacity-25')}>
      <Handle type="source" position={h.source} style={hidden} />
      <Slashes height={18} color="#fff" />
      <div className="text-left min-w-0">
        <p className="font-display font-700 text-[15px] leading-tight">{data.name}</p>
        <p className="text-[11.5px] text-white/70 leading-tight">{data.sub}</p>
      </div>
    </div>
  )
}

function DeptNode({ data }) {
  const h = HANDLES[data.orientation]
  return (
    <div
      className={clsx('rounded-2xl text-white px-3.5 py-3 shadow-md w-[200px] cursor-pointer transition-opacity duration-200 hover:brightness-105', data.dimmed && 'opacity-25')}
      style={{ background: `linear-gradient(135deg, hsl(${data.hue} 52% 46%), hsl(${data.hue + 28} 58% 36%))` }}
      title="Click to focus this team"
    >
      <Handle type="target" position={h.target} style={hidden} />
      <Handle type="source" position={h.source} style={hidden} />
      <p className="font-display font-700 text-[14px] leading-tight truncate">{data.name}</p>
      <div className="flex items-center gap-2 mt-1.5 text-[12px] text-white/80">
        <span className="inline-flex items-center gap-1"><Users size={12} />{data.count}</span>
        <span className="text-white/50">·</span>
        <span className="truncate">Lead: {data.lead}</span>
      </div>
    </div>
  )
}

function PersonNode({ data }) {
  const h = HANDLES[data.orientation]
  return (
    <div className={clsx(
      'w-[184px] rounded-2xl bg-white border p-3 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-lg',
      data.isLead ? 'border-brand-300 ring-1 ring-brand-200' : 'border-ink-200',
      data.selected && 'ring-2 ring-brand-500 border-brand-500 shadow-lg scale-[1.03]',
      data.dimmed && !data.selected && 'opacity-25',
    )}>
      <Handle type="target" position={h.target} style={hidden} />
      <Handle type="source" position={h.source} style={hidden} />
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <Avatar name={data.name} initials={data.initials} hue={data.hue} size={38} />
          <span className={clsx('absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white', STATUS_DOT[data.status])} title={data.status} />
          {data.hasAttention && (
            <span className="absolute -top-1.5 -right-1.5 grid place-items-center size-4 rounded-full bg-crit-500 ring-2 ring-white" title={`${data.attentionCount} item(s) need attention`}>
              <BellRing size={9} className="text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-600 text-ink-900 truncate leading-tight">{data.name}</p>
          <p className="text-[11px] text-ink-500 truncate leading-tight mt-0.5">{data.title}</p>
        </div>
      </div>
    </div>
  )
}

const NODE_TYPES = { company: CompanyNode, dept: DeptNode, person: PersonNode }

// ---- Structural layout (positions only — recomputed on dept-filter / orientation change) --
const COL = 210
const DEPT_GAP = 90
const Y = { company: 0, dept: 190, lead: 360, member: 530 }
const MEMBER_ROW = 150
const MAX_PER_ROW = 6

const staticPersonData = (e, orientation) => ({
  name: e.name, initials: e.initials, hue: e.hue, title: e.title, status: e.status, isLead: e.isLead,
  empId: e.id, orientation, dimmed: false, selected: false,
  hasAttention: ATTENTION_IDS.has(e.id), attentionCount: attentionCountFor(e.id),
})
const rawEdge = (source, target, hue, thick) => ({
  id: `${source}-${target}`, source, target, type: 'smoothstep',
  data: { hue, thick },
  style: { stroke: `hsl(${hue} 35% 70%)`, strokeWidth: thick ? 2 : 1.5 },
})

function buildLayout(depts, orientation) {
  return orientation === 'horizontal' ? buildHorizontal(depts) : buildVertical(depts)
}

// Top-down: departments side by side (uses the screen's wide axis for breadth,
// where there's plenty of room for many people).
function buildVertical(depts) {
  const nodes = []
  const edges = []
  let cursorX = 0

  depts.forEach((dept) => {
    const team = EMPLOYEES.filter((e) => e.department === dept.id)
    const lead = team.find((e) => e.isLead) ?? team[0]
    const members = team.filter((e) => e.id !== lead?.id)
    const perRow = Math.min(MAX_PER_ROW, Math.max(1, members.length))
    const bandWidth = perRow * COL
    const center = cursorX + bandWidth / 2

    nodes.push({ id: dept.id, type: 'dept', position: { x: center - 100, y: Y.dept },
      data: { name: dept.name, count: team.length, lead: lead?.firstName ?? '—', hue: dept.hue, orientation: 'vertical', dimmed: false } })

    if (lead) {
      nodes.push({ id: lead.id, type: 'person', position: { x: center - 92, y: Y.lead }, data: staticPersonData(lead, 'vertical') })
      edges.push(rawEdge(dept.id, lead.id, dept.hue, false))

      members.forEach((m, i) => {
        const row = Math.floor(i / perRow)
        const inRow = i % perRow
        const countThisRow = Math.min(perRow, members.length - row * perRow)
        const rowWidth = countThisRow * COL
        const rowStart = center - rowWidth / 2
        nodes.push({ id: m.id, type: 'person',
          position: { x: rowStart + inRow * COL + (COL - 184) / 2, y: Y.member + row * MEMBER_ROW },
          data: staticPersonData(m, 'vertical') })
        edges.push(rawEdge(lead.id, m.id, dept.hue, false))
      })
    }
    cursorX += bandWidth + DEPT_GAP
  })

  const totalWidth = Math.max(cursorX - DEPT_GAP, COL)
  nodes.push({ id: 'company', type: 'company', position: { x: totalWidth / 2 - 105, y: Y.company },
    data: { name: COMPANY.name, sub: `${EMPLOYEES.length} people · ${depts.length} ${depts.length === 1 ? 'team' : 'teams'}`, orientation: 'vertical', dimmed: false } })
  depts.forEach((d) => edges.push(rawEdge('company', d.id, d.hue, true)))

  return { nodes, edges }
}

// Left-to-right: each department is its own compact row (root → lead → members
// fanning rightward), rows stacked vertically. Naively swapping the vertical
// layout's axes would stack all 66 people along one axis and force an
// unreadable zoom — a real horizontal tree needs breadth (many people) on the
// wide axis regardless of orientation, so this is a dedicated layout, not a
// coordinate swap of the vertical one.
const ROW_H = 118
const LEAD_X = 230
const MEMBER_START_X = 460
const MEMBER_GAP = 200

function buildHorizontal(depts) {
  const nodes = []
  const edges = []
  let y = 0

  depts.forEach((dept) => {
    const team = EMPLOYEES.filter((e) => e.department === dept.id)
    const lead = team.find((e) => e.isLead) ?? team[0]
    const members = team.filter((e) => e.id !== lead?.id)

    nodes.push({ id: dept.id, type: 'dept', position: { x: 0, y: y - 30 },
      data: { name: dept.name, count: team.length, lead: lead?.firstName ?? '—', hue: dept.hue, orientation: 'horizontal', dimmed: false } })

    if (lead) {
      nodes.push({ id: lead.id, type: 'person', position: { x: LEAD_X, y: y - 38 }, data: staticPersonData(lead, 'horizontal') })
      edges.push(rawEdge(dept.id, lead.id, dept.hue, false))

      members.forEach((m, i) => {
        nodes.push({ id: m.id, type: 'person', position: { x: MEMBER_START_X + i * MEMBER_GAP, y: y - 38 }, data: staticPersonData(m, 'horizontal') })
        edges.push(rawEdge(lead.id, m.id, dept.hue, false))
      })
    }
    y += ROW_H
  })

  const totalHeight = y - ROW_H
  nodes.push({ id: 'company', type: 'company', position: { x: -270, y: totalHeight / 2 - 30 },
    data: { name: COMPANY.name, sub: `${EMPLOYEES.length} people · ${depts.length} ${depts.length === 1 ? 'team' : 'teams'}`, orientation: 'horizontal', dimmed: false } })
  depts.forEach((d) => edges.push(rawEdge('company', d.id, d.hue, true)))

  return { nodes, edges }
}

// ---- Emphasis (dim / select / chain-highlight — patched in without touching layout) --------
function computeChainIds(selectedId) {
  if (!selectedId) return EMPTY_SET
  const emp = employeeById(selectedId)
  if (!emp) return EMPTY_SET
  const ids = new Set(['company', emp.department, emp.id])
  if (emp.managerId) ids.add(emp.managerId)
  EMPLOYEES.forEach((e) => { if (e.managerId === emp.id) ids.add(e.id) })
  return ids
}

function computeDimmedFor(node, matches, chainIds, selectedId) {
  const chainActive = !!selectedId
  if (node.type === 'person') {
    if (chainActive) return !chainIds.has(node.id)
    const emp = employeeById(node.id)
    return emp ? !matches(emp) : false
  }
  return chainActive ? !chainIds.has(node.id) : false
}

function computeEdgeStyleFor(edge, chainIds, selectedId) {
  const chainActive = !!selectedId
  const inChain = chainActive && chainIds.has(edge.source) && chainIds.has(edge.target)
  const { hue, thick } = edge.data ?? { hue: 265, thick: false }
  return {
    stroke: inChain ? '#7c3aed' : `hsl(${hue} 35% 70%)`,
    strokeWidth: inChain ? (thick ? 3.5 : 3) : (thick ? 2 : 1.5),
    opacity: chainActive && !inChain ? 0.18 : 1,
    transition: 'opacity 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease',
  }
}

function applyEmphasis(nodes, edges, matches, chainIds, selectedId) {
  const newNodes = nodes.map((n) => ({ ...n, data: { ...n.data, dimmed: computeDimmedFor(n, matches, chainIds, selectedId), selected: n.id === selectedId } }))
  const newEdges = edges.map((e) => ({ ...e, animated: !!selectedId && chainIds.has(e.source) && chainIds.has(e.target), style: computeEdgeStyleFor(e, chainIds, selectedId) }))
  return { newNodes, newEdges }
}

// ---- Preview drawer -----------------------------------------------------------
const Row = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2"><Icon size={13} className="text-ink-400 shrink-0" /><span className="truncate">{text}</span></div>
)
function MiniPersonRow({ e, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 w-full text-left hover:bg-ink-50 rounded-lg -mx-1.5 px-1.5 py-1 transition">
      <Avatar name={e.name} initials={e.initials} hue={e.hue} size={26} />
      <div className="min-w-0 flex-1"><p className="text-[12.5px] font-500 text-ink-900 truncate">{e.name}</p><p className="text-[11px] text-ink-500 truncate">{e.title}</p></div>
    </button>
  )
}

function PreviewDrawer({ employeeId, onClose, onSelect, onFocusTeam, onNavigate }) {
  const e = employeeById(employeeId)
  if (!e) return null
  const dept = departmentById(e.department)
  const manager = e.managerId ? employeeById(e.managerId) : null
  const reports = EMPLOYEES.filter((r) => r.managerId === e.id)
  const attention = NEEDS_ATTENTION.filter((i) => i.employeeId === e.id)
  const leavePct = (e.leave.remaining / e.leave.entitlement) * 100

  return (
    <div className="absolute right-3 top-3 bottom-3 w-[320px] max-w-[calc(100%-24px)] bg-white rounded-2xl border border-ink-200 shadow-2xl flex flex-col overflow-hidden z-20 animate-slide-in">
      <div className="bg-signal text-white p-4 flex items-start gap-3 shrink-0">
        <Avatar name={e.name} initials={e.initials} hue={e.hue} size={44} className="ring-2 ring-white/25" />
        <div className="min-w-0 flex-1">
          <p className="font-display font-700 text-[15px] leading-tight truncate">{e.name}</p>
          <p className="text-[12px] text-white/75 truncate">{e.title}</p>
        </div>
        <button onClick={onClose} className="grid place-items-center size-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-[13px]">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill tone={STATUS_TONE[e.status]} dot>{e.status}</Pill>
          {e.isLead && <Pill tone="flare">Team Lead</Pill>}
        </div>

        <div className="flex flex-col gap-2 text-ink-600">
          <Row icon={Users} text={dept?.name} />
          <Row icon={MapPin} text={e.location} />
          <Row icon={Mail} text={e.email} />
          <Row icon={Calendar} text={`Started ${e.startDate} · ${e.tenureYears}y`} />
        </div>

        <div>
          <p className="text-[11px] font-600 uppercase tracking-wide text-ink-400 mb-1.5">Leave balance</p>
          <div className="flex items-center justify-between text-ink-700 mb-1"><span>{e.leave.remaining} of {e.leave.entitlement} days left</span></div>
          <Progress value={leavePct} />
        </div>

        {attention.length > 0 && (
          <div>
            <p className="text-[11px] font-600 uppercase tracking-wide text-ink-400 mb-1.5">Needs attention</p>
            <div className="flex flex-col gap-1.5">
              {attention.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-[12.5px] bg-crit-50 text-crit-700 rounded-lg px-2.5 py-1.5">
                  <BellRing size={12} className="shrink-0" /> {a.label} — {a.detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {manager && (
          <div>
            <p className="text-[11px] font-600 uppercase tracking-wide text-ink-400 mb-1.5">Reports to</p>
            <MiniPersonRow e={manager} onClick={() => onSelect(manager.id)} />
          </div>
        )}

        {reports.length > 0 && (
          <div>
            <p className="text-[11px] font-600 uppercase tracking-wide text-ink-400 mb-1.5">Direct reports ({reports.length})</p>
            <div className="flex flex-col gap-0.5">{reports.map((r) => <MiniPersonRow key={r.id} e={r} onClick={() => onSelect(r.id)} />)}</div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-ink-100 flex gap-2 shrink-0">
        {reports.length > 0 && (
          <button onClick={onFocusTeam} className="flex-1 text-[12.5px] font-500 rounded-xl border border-ink-200 text-ink-700 hover:bg-ink-50 transition px-3 py-2">Focus team</button>
        )}
        <button onClick={onNavigate} className="flex-1 text-[12.5px] font-600 rounded-xl accent-gradient text-white px-3 py-2 hover:brightness-110 transition">View full profile</button>
      </div>
    </div>
  )
}

const LegendRow = ({ color, label, count }) => (
  <div className="flex items-center gap-2">
    <span className={clsx('size-2 rounded-full shrink-0', color)} />
    <span className="text-ink-600 flex-1 truncate">{label}</span>
    <span className="text-ink-800 font-600 tnum">{count}</span>
  </div>
)

// ---- Component ----------------------------------------------------------------
function Flow({ deptFilter, query, statusFilter, attentionOnly }) {
  const navigate = useNavigate()
  const [orientation, setOrientation] = useState('vertical')
  const [selectedId, setSelectedId] = useState(null)
  const [matchIndex, setMatchIndex] = useState(0)
  const flowRef = useRef(null)
  const didMount = useRef(false)

  const depts = deptFilter === 'all' ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.id === deptFilter)
  const q = query.toLowerCase().trim()

  const matches = useCallback((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (attentionOnly && !ATTENTION_IDS.has(e.id)) return false
    if (q && !(`${e.name} ${e.title} ${e.location} ${e.skills.join(' ')}`.toLowerCase().includes(q))) return false
    return true
  }, [q, statusFilter, attentionOnly])

  const chainIds = useMemo(() => computeChainIds(selectedId), [selectedId])

  const visibleEmployees = useMemo(() => depts.flatMap((d) => EMPLOYEES.filter((e) => e.department === d.id)), [deptFilter])
  const statusCounts = useMemo(() => {
    const c = { Active: 0, 'On leave': 0, Onboarding: 0 }
    visibleEmployees.forEach((e) => { c[e.status] = (c[e.status] ?? 0) + 1 })
    return c
  }, [visibleEmployees])
  const attentionVisible = useMemo(() => visibleEmployees.filter((e) => ATTENTION_IDS.has(e.id)).length, [visibleEmployees])
  const matchIds = useMemo(() => (q ? visibleEmployees.filter(matches).map((e) => e.id) : []), [visibleEmployees, matches, q])

  useEffect(() => { setMatchIndex(0) }, [q, deptFilter, statusFilter, attentionOnly])

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => buildLayout(depts, orientation), [deptFilter, orientation])
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges)

  // Structural rebuild (dept filter / orientation) — full relayout + refit, emphasis reapplied
  // immediately from current filters/selection so it never looks stale for a frame.
  useEffect(() => {
    const { newNodes, newEdges } = applyEmphasis(layoutNodes, layoutEdges, matches, chainIds, selectedId)
    setNodes(newNodes)
    setEdges(newEdges)
    if (didMount.current) requestAnimationFrame(() => flowRef.current?.fitView({ padding: 0.18, duration: 450 }))
    else didMount.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutNodes, layoutEdges])

  // Emphasis-only patch (search / status / attention / selection) — updates data in place,
  // no relayout and no camera jump, so drag positions and pan/zoom are preserved.
  useEffect(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, dimmed: computeDimmedFor(n, matches, chainIds, selectedId), selected: n.id === selectedId } })))
    setEdges((eds) => eds.map((e) => ({ ...e, animated: !!selectedId && chainIds.has(e.source) && chainIds.has(e.target), style: computeEdgeStyleFor(e, chainIds, selectedId) })))
  }, [matches, chainIds, selectedId, setNodes, setEdges])

  const focusOnIds = useCallback((ids) => {
    flowRef.current?.fitView({ nodes: ids.map((id) => ({ id })), duration: 500, padding: 0.4, maxZoom: 1.4 })
  }, [])
  const fitAll = useCallback(() => flowRef.current?.fitView({ duration: 500, padding: 0.18 }), [])

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'person') {
      setSelectedId((cur) => (cur === node.data.empId ? null : node.data.empId))
    } else if (node.type === 'dept') {
      const team = EMPLOYEES.filter((e) => e.department === node.id)
      focusOnIds([node.id, ...team.map((e) => e.id)])
    } else {
      fitAll()
    }
  }, [focusOnIds, fitAll])

  const onFocusTeam = useCallback(() => {
    if (!selectedId) return
    const reports = EMPLOYEES.filter((e) => e.managerId === selectedId)
    focusOnIds([selectedId, ...reports.map((e) => e.id)])
  }, [selectedId, focusOnIds])

  const nextMatch = useCallback(() => {
    if (!matchIds.length) return
    const next = (matchIndex + 1) % matchIds.length
    setMatchIndex(next)
    focusOnIds([matchIds[next]])
  }, [matchIds, matchIndex, focusOnIds])
  const prevMatch = useCallback(() => {
    if (!matchIds.length) return
    const prev = (matchIndex - 1 + matchIds.length) % matchIds.length
    setMatchIndex(prev)
    focusOnIds([matchIds[prev]])
  }, [matchIds, matchIndex, focusOnIds])

  const exportPng = useCallback(() => {
    const instance = flowRef.current
    const el = document.querySelector('.react-flow__viewport')
    if (!instance || !el) return
    const bounds = getNodesBounds(instance.getNodes())
    const width = 1600, height = 1000
    const viewport = getViewportForBounds(bounds, width, height, 0.15, 2, 0.08)
    toPng(el, {
      backgroundColor: '#f7f5fb',
      width, height,
      style: { width: `${width}px`, height: `${height}px`, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` },
    }).then((dataUrl) => {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `cablenet-org-chart.png`
      a.click()
    }).catch(() => {})
  }, [])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={() => setSelectedId(null)}
      onInit={(instance) => { flowRef.current = instance }}
      nodeTypes={NODE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.05}
      maxZoom={2}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
      className="bg-ink-50"
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#d4cce0" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor={(n) => n.type === 'person' ? '#c4b5e6' : n.type === 'dept' ? `hsl(${n.data.hue} 50% 55%)` : '#5b2d8e'} nodeStrokeWidth={2} maskColor="rgba(27,20,48,0.06)" />

      <Panel position="top-left" className="!m-3">
        <div className="bg-white/95 backdrop-blur rounded-xl border border-ink-200 shadow-sm px-3.5 py-3 flex flex-col gap-2 text-[12px] w-[188px]">
          <div className="flex items-center justify-between">
            <span className="font-600 text-ink-800">{visibleEmployees.length} people</span>
            <span className="text-ink-400">{depts.length} {depts.length === 1 ? 'team' : 'teams'}</span>
          </div>
          <div className="flex flex-col gap-1 pt-1.5 border-t border-ink-100">
            <LegendRow color="bg-good-500" label="Active" count={statusCounts.Active} />
            <LegendRow color="bg-warn-500" label="On leave" count={statusCounts['On leave']} />
            <LegendRow color="bg-info-500" label="Onboarding" count={statusCounts.Onboarding} />
            <LegendRow color="bg-crit-500" label="Needs attention" count={attentionVisible} />
          </div>
        </div>
      </Panel>

      <Panel position="top-right" className="!m-3">
        <div className="flex gap-1.5">
          <button onClick={() => setOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))} title="Switch layout orientation" className="grid place-items-center size-9 rounded-xl bg-white border border-ink-200 text-ink-600 hover:text-brand-700 hover:border-brand-300 shadow-sm transition">
            {orientation === 'vertical' ? <Columns3 size={16} /> : <Rows3 size={16} />}
          </button>
          <button onClick={exportPng} title="Export as PNG" className="grid place-items-center size-9 rounded-xl bg-white border border-ink-200 text-ink-600 hover:text-brand-700 hover:border-brand-300 shadow-sm transition">
            <Download size={16} />
          </button>
        </div>
      </Panel>

      {q && (
        <Panel position="top-center" className="!m-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-ink-200 shadow-sm px-2 py-1.5">
            <span className="text-[12px] text-ink-600 px-1.5 tnum">
              {matchIds.length ? `${matchIndex + 1} / ${matchIds.length} match${matchIds.length === 1 ? '' : 'es'}` : 'No matches'}
            </span>
            {matchIds.length > 0 && (
              <>
                <button onClick={prevMatch} className="grid place-items-center size-7 rounded-lg text-ink-500 hover:bg-ink-100 transition"><ChevronUp size={15} /></button>
                <button onClick={nextMatch} className="grid place-items-center size-7 rounded-lg text-ink-500 hover:bg-ink-100 transition"><ChevronDown size={15} /></button>
              </>
            )}
          </div>
        </Panel>
      )}

      {selectedId && (
        <PreviewDrawer
          employeeId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelect={setSelectedId}
          onFocusTeam={onFocusTeam}
          onNavigate={() => navigate(`/directory/${selectedId}`)}
        />
      )}
    </ReactFlow>
  )
}

// Fills whatever container it's placed in (used full-screen by the Directory).
export function OrgCanvas({ deptFilter = 'all', query = '', statusFilter = 'all', attentionOnly = false }) {
  return (
    <div className="h-full w-full">
      <Flow deptFilter={deptFilter} query={query} statusFilter={statusFilter} attentionOnly={attentionOnly} />
    </div>
  )
}
