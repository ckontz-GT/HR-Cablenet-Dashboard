import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap, Handle, Position,
  useNodesState, useEdgesState, BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Users } from 'lucide-react'
import { Avatar } from './ui'
import { Slashes } from './Logo'
import { clsx } from '../lib/clsx'
import { EMPLOYEES, DEPARTMENTS, COMPANY } from '../data/mockData'

const STATUS_DOT = { Active: 'bg-good-500', 'On leave': 'bg-warn-500', Onboarding: 'bg-info-500' }

// ---- Custom nodes -----------------------------------------------------------
const hidden = { opacity: 0, width: 1, height: 1, minWidth: 0, border: 0 }

function CompanyNode({ data }) {
  return (
    <div className="org-node inline-flex items-center gap-2.5 rounded-2xl bg-signal text-white px-4 py-3 shadow-lg w-[210px]">
      <Handle type="source" position={Position.Bottom} style={hidden} />
      <Slashes height={18} color="#fff" />
      <div className="text-left min-w-0">
        <p className="font-display font-700 text-[15px] leading-tight">{data.name}</p>
        <p className="text-[11.5px] text-white/70 leading-tight">{data.sub}</p>
      </div>
    </div>
  )
}

function DeptNode({ data }) {
  return (
    <div className="rounded-2xl text-white px-3.5 py-3 shadow-md w-[200px]"
      style={{ background: `linear-gradient(135deg, hsl(${data.hue} 52% 46%), hsl(${data.hue + 28} 58% 36%))` }}>
      <Handle type="target" position={Position.Top} style={hidden} />
      <Handle type="source" position={Position.Bottom} style={hidden} />
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
  return (
    <div className={clsx('org-node w-[184px] rounded-2xl bg-white border p-3 shadow-sm transition-shadow hover:shadow-lg',
      data.isLead ? 'border-brand-300 ring-1 ring-brand-200' : 'border-ink-200', data.dim && 'opacity-30')}>
      <Handle type="target" position={Position.Top} style={hidden} />
      <Handle type="source" position={Position.Bottom} style={hidden} />
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <Avatar name={data.name} initials={data.initials} hue={data.hue} size={38} />
          <span className={clsx('absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white', STATUS_DOT[data.status])} title={data.status} />
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

// ---- Layout -----------------------------------------------------------------
const COL = 210            // horizontal spacing between member columns
const DEPT_GAP = 90        // gap between department bands
const Y = { company: 0, dept: 190, lead: 360, member: 530 }
const MEMBER_ROW = 150     // vertical spacing when members wrap to multiple rows
const MAX_PER_ROW = 6      // wrap members so bands aren't absurdly wide

function buildGraph(depts, matches) {
  const nodes = []
  const edges = []
  let cursorX = 0
  const bandCenters = []

  depts.forEach((dept) => {
    const team = EMPLOYEES.filter((e) => e.department === dept.id)
    const lead = team.find((e) => e.isLead) ?? team[0]
    const members = team.filter((e) => e.id !== lead?.id)
    const perRow = Math.min(MAX_PER_ROW, Math.max(1, members.length))
    const bandWidth = perRow * COL
    const bandStart = cursorX
    const center = bandStart + bandWidth / 2

    // dept node
    nodes.push({ id: dept.id, type: 'dept', position: { x: center - 100, y: Y.dept },
      data: { name: dept.name, count: team.length, lead: lead?.firstName ?? '—', hue: dept.hue } })

    // lead
    if (lead) {
      nodes.push({ id: lead.id, type: 'person', position: { x: center - 92, y: Y.lead },
        data: nodeData(lead, matches) })
      edges.push(edge(dept.id, lead.id, dept.hue))

      // members, wrapped into rows centered under the lead
      members.forEach((m, i) => {
        const row = Math.floor(i / perRow)
        const inRow = i % perRow
        const countThisRow = Math.min(perRow, members.length - row * perRow)
        const rowWidth = countThisRow * COL
        const rowStart = center - rowWidth / 2
        nodes.push({ id: m.id, type: 'person',
          position: { x: rowStart + inRow * COL + (COL - 184) / 2, y: Y.member + row * MEMBER_ROW },
          data: nodeData(m, matches) })
        edges.push(edge(lead.id, m.id, dept.hue))
      })
    }

    bandCenters.push(center)
    cursorX += bandWidth + DEPT_GAP
  })

  const totalWidth = Math.max(cursorX - DEPT_GAP, COL)
  // company centered, connected to every dept
  nodes.push({ id: 'company', type: 'company', position: { x: totalWidth / 2 - 105, y: Y.company },
    data: { name: COMPANY.name, sub: `${EMPLOYEES.length} people · ${depts.length} ${depts.length === 1 ? 'team' : 'teams'}` } })
  depts.forEach((d) => edges.push(edge('company', d.id, d.hue, true)))

  return { nodes, edges }
}

const nodeData = (e, matches) => ({
  name: e.name, initials: e.initials, hue: e.hue, title: e.title, status: e.status, isLead: e.isLead,
  empId: e.id, dim: !matches(e),
})
const edge = (source, target, hue, thick = false) => ({
  id: `${source}-${target}`, source, target, type: 'smoothstep',
  style: { stroke: `hsl(${hue} 35% 70%)`, strokeWidth: thick ? 2 : 1.5 },
})

// ---- Component --------------------------------------------------------------
function Flow({ deptFilter, query }) {
  const navigate = useNavigate()
  const depts = deptFilter === 'all' ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.id === deptFilter)
  const q = query.toLowerCase().trim()
  const matches = useCallback((e) => !q || `${e.name} ${e.title} ${e.location} ${e.skills.join(' ')}`.toLowerCase().includes(q), [q])

  const { nodes: initNodes, edges: initEdges } = useMemo(() => buildGraph(depts, matches), [deptFilter, matches])
  const [nodes, , onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'person') navigate(`/directory/${node.data.empId}`)
  }, [navigate])

  return (
    <ReactFlow
      key={deptFilter + q} // re-layout when filters change
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={NODE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.1}
      maxZoom={2}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
      className="bg-ink-50"
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#d4cce0" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor={(n) => n.type === 'person' ? '#c4b5e6' : n.type === 'dept' ? `hsl(${n.data.hue} 50% 55%)` : '#5b2d8e'} nodeStrokeWidth={2} maskColor="rgba(27,20,48,0.06)" />
    </ReactFlow>
  )
}

export function OrgChart({ deptFilter = 'all', query = '' }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-ink-500 px-1">Scroll to zoom · drag the canvas to pan · drag a card to reposition · click a person to open their profile</p>
      <div className="rounded-[var(--radius-card)] bg-white border border-ink-200/70 card-shadow overflow-hidden" style={{ height: 'calc(100vh - 230px)', minHeight: 460 }}>
        <Flow deptFilter={deptFilter} query={query} />
      </div>
    </div>
  )
}
