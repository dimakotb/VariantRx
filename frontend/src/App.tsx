import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ModelProvider } from '@/context/ModelContext';
import { VariantProvider } from '@/context/VariantContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import AboutPage from '@/pages/AboutPage';
import MainPage from '@/pages/MainPage';
import ReportsPage from '@/pages/ReportsPage';
import ProtectedRoute from '@/components/router/ProtectedRoute';

function SessionLoader() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center font-mono">
      <svg className="animate-spin h-10 w-10 text-[var(--accent)] mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-[var(--muted)] text-[9px] uppercase tracking-[0.16em]">
        Verifying security session…
      </span>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <SessionLoader />;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VariantProvider>
        <ModelProvider>
          <AppRoutes />
        </ModelProvider>
      </VariantProvider>
    </AuthProvider>
  );
}
