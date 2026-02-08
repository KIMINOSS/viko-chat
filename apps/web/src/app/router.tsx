import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProfileSetup } from '@/features/auth/pages/ProfileSetup';
import { ConversationList } from '@/features/chat/pages/ConversationList';
import { ChatRoom } from '@/features/chat/pages/ChatRoom';
import { ContactsPage } from '@/features/contacts/pages/ContactsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { Loading } from '@/shared/components/Loading';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile?.name) return <Navigate to="/profile-setup" replace />;

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/" element={<ProtectedRoute><ConversationList /></ProtectedRoute>} />
      <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
