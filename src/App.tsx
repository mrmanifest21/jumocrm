import { Routes, Route } from 'react-router'
import AppLayout from '@/components/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Contacts from '@/pages/Contacts'
import Deals from '@/pages/Deals'
import Tasks from '@/pages/Tasks'
import Projects from '@/pages/Projects'
import Services from '@/pages/Services'
import AIAssistant from '@/pages/AIAssistant'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Messages from '@/pages/Messages'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppLayoutWrapper><Dashboard /></AppLayoutWrapper>} />
      <Route path="/contacts" element={<AppLayoutWrapper><Contacts /></AppLayoutWrapper>} />
      <Route path="/deals" element={<AppLayoutWrapper><Deals /></AppLayoutWrapper>} />
      <Route path="/tasks" element={<AppLayoutWrapper><Tasks /></AppLayoutWrapper>} />
      <Route path="/projects" element={<AppLayoutWrapper><Projects /></AppLayoutWrapper>} />
      <Route path="/services" element={<AppLayoutWrapper><Services /></AppLayoutWrapper>} />
      <Route path="/ai-assistant" element={<AppLayoutWrapper><AIAssistant /></AppLayoutWrapper>} />
      <Route path="/reports" element={<AppLayoutWrapper><Reports /></AppLayoutWrapper>} />
      <Route path="/messages" element={<AppLayoutWrapper><Messages /></AppLayoutWrapper>} />
      <Route path="/settings" element={<AppLayoutWrapper><Settings /></AppLayoutWrapper>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
