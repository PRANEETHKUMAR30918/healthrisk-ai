import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import { UploadPage } from './pages/UploadPage'
import { ExtractionReviewPage } from './pages/ExtractionReviewPage'
import { BaselinePage } from './pages/BaselinePage'
import { ConsistencyPage } from './pages/ConsistencyPage'
import { RiskPage } from './pages/RiskPage'
import { SummaryPage } from './pages/SummaryPage'
import { HistoryPage } from './pages/HistoryPage'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

/** Redirects patients away from doctor-only pages to their personal profile */
function DoctorRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'patient') {
    const patientId = user?.patient_id
    return <Navigate to={patientId ? `/patients/${patientId}/history` : '/upload'} replace />
  }
  return <>{children}</>
}

/** After login, route patient to their profile, doctors to dashboard */
function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'patient' && user?.patient_id) {
    return <Navigate to={`/patients/${user.patient_id}/history`} replace />
  }
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<HomeRedirect />} />
            <Route path="dashboard" element={<DoctorRoute><DashboardPage /></DoctorRoute>} />
            <Route path="patients" element={<DoctorRoute><PatientsPage /></DoctorRoute>} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="reports/:reportId/extraction" element={<ExtractionReviewPage />} />
            <Route path="reports/:reportId/baseline" element={<BaselinePage />} />
            <Route path="reports/:reportId/consistency" element={<ConsistencyPage />} />
            <Route path="reports/:reportId/risk" element={<RiskPage />} />
            <Route path="reports/:reportId/summary" element={<SummaryPage />} />
            <Route path="patients/:patientId/history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
