/** Top-level route definitions — all pages render inside AppShell. */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { MarkPage } from '@/pages/MarkPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { TimetablePage } from '@/pages/TimetablePage'
import { SettingsPage } from '@/pages/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="today" element={<MarkPage />} />
          <Route path="mark" element={<Navigate to="/today" replace />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
