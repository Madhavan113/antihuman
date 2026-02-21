import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Tabs } from '../components/ui'
import { PageHeader } from '../components/layout/PageHeader'
import { PredictionsTab } from './tabs/PredictionsTab'
import { DerivativesTab } from './tabs/DerivativesTab'
import { ServicesTab } from './tabs/ServicesTab'

const tabs = [
  { id: 'predictions', label: 'Predictions' },
  { id: 'derivatives', label: 'Derivatives' },
  { id: 'services', label: 'Services' },
]

export function MarketsHub() {
  const navigate = useNavigate()
  const location = useLocation()

  const segments = location.pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const activeTab = tabs.find(t => t.id === lastSegment)?.id ?? 'predictions'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PageHeader title="Markets" />
      <Tabs
        tabs={tabs}
        activeId={activeTab}
        onChange={id => navigate(`/app/markets/${id}`, { replace: true })}
        className="px-8"
      />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route index element={<Navigate to="predictions" replace />} />
          <Route path="predictions" element={<PredictionsTab />} />
          <Route path="derivatives" element={<DerivativesTab />} />
          <Route path="services" element={<ServicesTab />} />
        </Routes>
      </div>
    </div>
  )
}
