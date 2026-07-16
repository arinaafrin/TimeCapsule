import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { GoogleCallbackPage } from '../features/auth/GoogleCallbackPage';
import { ExplorerPage } from '../features/explorer/ExplorerPage';
import { ExperienceDetailPage } from '../features/experience/ExperienceDetailPage';
import { ModerationQueuePage } from '../features/moderation/ModerationQueuePage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/explorer" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<GoogleCallbackPage />} />
        <Route
          path="/explorer"
          element={
            <ProtectedRoute>
              <ExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experiences/:id"
          element={
            <ProtectedRoute>
              <ExperienceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ModerationQueuePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
