import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loading } from '@/shared/components/Loading';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const ConversationList = lazy(() =>
  import('@/features/chat/pages/ConversationList').then((m) => ({ default: m.ConversationList })),
);
const ChatRoom = lazy(() =>
  import('@/features/chat/pages/ChatRoom').then((m) => ({ default: m.ChatRoom })),
);
const ContactsPage = lazy(() =>
  import('@/features/contacts/pages/ContactsPage').then((m) => ({ default: m.ContactsPage })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

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
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/" element={<ProtectedRoute><ConversationList /></ProtectedRoute>} />
        <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
