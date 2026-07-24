import { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { streamClient } from './lib/stream';
import toast from 'react-hot-toast';

import HomePage from './pages/HomePage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CallPage from './pages/CallPage.jsx';
import NotificationPage from './pages/NotificationPage.jsx';
import PageLoader from './components/PageLoader.jsx';

const App = () => {
  const { authUser, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authUser) return;

    const handleEvent = (event) => {
      if (event.type === 'friend_request_received') {
        queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
        queryClient.invalidateQueries({ queryKey: ['recommendedUsers'] });
        toast.success('New friend request received! 🔔');
      } else if (event.type === 'friend_request_accepted') {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
        queryClient.invalidateQueries({ queryKey: ['recommendedUsers'] });
        queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });
        toast.success('Your friend request was accepted! 🎉');
      }
    };

    streamClient.on(handleEvent);

    return () => {
      streamClient.off(handleEvent);
    };
  }, [authUser, queryClient]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('streamify-theme') || 'night';
  });

  useEffect(() => {
    localStorage.setItem('streamify-theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => setTheme(newTheme);

  if (isLoading) return <PageLoader />;

  // Shared props for pages that need theme control
  const themeProps = { onThemeChange: handleThemeChange, currentTheme: theme };

  return (
    <div className="min-h-screen" data-theme={theme}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />

        {/* Onboarding — logged in but not yet onboarded */}
        <Route
          path="/onboarding"
          element={
            authUser
              ? !authUser.isOnboarded
                ? <OnboardingPage />
                : <Navigate to="/" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            authUser
              ? authUser.isOnboarded
                ? <HomePage {...themeProps} />
                : <Navigate to="/onboarding" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/friends"
          element={
            authUser
              ? authUser.isOnboarded
                ? <FriendsPage {...themeProps} />
                : <Navigate to="/onboarding" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/notifications"
          element={
            authUser
              ? authUser.isOnboarded
                ? <NotificationPage {...themeProps} />
                : <Navigate to="/onboarding" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chat"
          element={
            authUser
              ? authUser.isOnboarded
                ? <ChatPage {...themeProps} />
                : <Navigate to="/onboarding" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chat/:userId"
          element={
            authUser
              ? authUser.isOnboarded
                ? <ChatPage {...themeProps} />
                : <Navigate to="/onboarding" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/call"
          element={
            authUser
              ? authUser.isOnboarded
                ? <CallPage {...themeProps} />
                : <Navigate to="/onboarding" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)/1))',
            color: 'var(--fallback-bc,oklch(var(--bc)/1))',
            border: '1px solid var(--fallback-b3,oklch(var(--b3)/1))',
          },
        }}
      />
    </div>
  );
};

export default App;