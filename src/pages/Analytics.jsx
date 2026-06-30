import { TrendingUp, Users, UserMinus, Clock, MapPin, PieChart, BarChart3 } from 'lucide-react'
import { Card, CardHeader, Eyebrow, Pill } from '../components/ui'
import { StatCard } from '../components/StatCard'
import { AreaChart, BarPairs, HBars, Donut } from '../components/charts'
import {
  KPIS, HEADCOUNT_TREND, HEADCOUNT_BY_DEPT, GENDER_SPLIT, TENURE_BUCKETS, LOCATION_SPLIT, DEPARTMENTS,
} from '../data/mockData'

export default function Analytics() {
  const femalePct = Math.round((GENDER_SPLIT.female / GENDER_SPLIT.total) * 100)
  const totalHires = HEADCOUNT_TREND.reduce((s, d) => s + d.hires, 0)
  const totalExits = HEADCOUNT_TREND.reduce((s, d) => s + d.exits, 0)

  return (
    <div className="flex flex-col gap-6 animate-rise">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Headcount" value={KPIS.headcount} icon={Users} delta={KPIS.headcountDelta} deltaLabel="" tone="brand" spark={HEADCOUNT_TREND.map((d) => d.headcount)} />
        <StatCard label="Attrition (ann.)" value={KPIS.attrition} suffix="%" icon={UserMinus} delta={-1.2} deltaLabel="%" tone="good" />
        <StatCard label="Avg tenure" value={KPIS.avgTenure} suffix="y" icon={Clock} tone="brand" />
        <StatCard label="Net hires (12m)" value={totalHires - totalExits} icon={TrendingUp} delta={totalHires} deltaLabel=" in" tone="flare" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 pb-2">
          <CardHeader title="Headcount trajectory" subtitle="Trailing 12 months" icon={TrendingUp} />
          <div className="px-2 pt-2"><AreaChart data={HEADCOUNT_TREND} valueKey="headcount" height={250} /></div>
        </Card>

        <Card>
          <CardHeader title="Gender balance" subtitle={`${GENDER_SPLIT.total} employees`} icon={PieChart} />
          <div className="p-5 flex flex-col items-center gap-4">
            <Donut
              size={168} thickness={22}
              segments={[{ value: GENDER_SPLIT.female, color: '#7c3aed' }, { value: GENDER_SPLIT.male, color: '#ff944d' }]}
              center={<div><p className="font-display font-700 text-2xl text-ink-900 tnum">{femalePct}%</p><p className="text-[11px] text-ink-500">women</p></div>}
            />
            <div className="flex items-center gap-5">
              <Legend color="#7c3aed" label="Women" value={GENDER_SPLIT.female} />
              <Legend color="#ff944d" label="Men" value={GENDER_SPLIT.male} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Hires vs exits" subtitle={`${totalHires} hires · ${totalExits} exits (12m)`} icon={BarChart3} />
          <div className="px-3 py-3"><BarPairs data={HEADCOUNT_TREND} height={220} /></div>
          <div className="px-5 pb-4 flex items-center gap-5">
            <Legend color="#7c3aed" label="Hires" /><Legend color="#e4dfec" label="Exits" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Headcount by department" subtitle={`${DEPARTMENTS.length} teams`} icon={Users} />
          <div className="p-5 pt-4"><HBars data={[...HEADCOUNT_BY_DEPT].sort((a, b) => b.count - a.count)} /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Tenure distribution" subtitle="How long people stay" icon={Clock} />
          <div className="p-5 pt-4"><TenureChart /></div>
        </Card>

        <Card>
          <CardHeader title="Location split" subtitle="Where the team is based" icon={MapPin} />
          <div className="p-5 pt-4">
            <HBars data={[...LOCATION_SPLIT].sort((a, b) => b.count - a.count)} labelKey="location" colorFn={() => 'linear-gradient(90deg,#7c3aed,#c026d3)'} />
          </div>
        </Card>
      </div>
    </div>
  )
}

function TenureChart() {
  const max = Math.max(...TENURE_BUCKETS.map((b) => b.count))
  return (
    <div className="flex items-end justify-between gap-3 h-48">
      {TENURE_BUCKETS.map((b) => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <span className="font-display font-700 text-ink-900 tnum">{b.count}</span>
          <div className="w-full rounded-t-xl bg-linear-to-t from-brand-700 to-brand-400 transition-[height] duration-700" style={{ height: `${(b.count / max) * 100}%` }} />
          <span className="text-[12px] text-ink-500">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

const Legend = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <span className="size-3 rounded-full" style={{ background: color }} />
    <span className="text-[13px] text-ink-600">{label}{value != null && <span className="font-600 text-ink-900 ml-1 tnum">{value}</span>}</span>
  </div>
)
