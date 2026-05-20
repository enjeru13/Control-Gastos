import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import SettingsLayout from './components/layout/SettingsLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Metas from './pages/Metas'
import Tools from './pages/Tools'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="movimientos" element={<Transactions />} />
          <Route path="metas" element={<Metas />} />
          <Route path="herramientas" element={<Tools />} />
        </Route>
        <Route path="/configuracion" element={<SettingsLayout />}>
          <Route index element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
