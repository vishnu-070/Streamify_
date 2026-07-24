import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { streamClient } from './lib/stream';
import { axiosInstance } from './lib/axios';
import { getAvatarUrl } from './lib/avatars';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [incomingCall, setIncomingCall] = useState(null);

  // Fetch Stream token globally
  const { data: tokenData } = useQuery({
    queryKey: ['streamToken'],
    queryFn: async () => {
      const res = await axiosInstance.get('/chat/token');
      return res.data;
    },
    enabled: !!authUser,
  });

  // Global user connection to Stream Chat for accurate presence status
  useEffect(() => {
    if (!authUser) {
      if (streamClient.userID) {
        streamClient.disconnectUser().catch(console.error);
      }
      return;
    }

    if (!tokenData?.token) return;

    const connectUser = async () => {
      try {
        if (streamClient.userID === authUser._id) return;

        if (streamClient.userID) {
          await streamClient.disconnectUser();
        }

        await streamClient.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: getAvatarUrl(authUser.profilePic, authUser.fullName),
          },
          tokenData.token
        );
      } catch (err) {
        console.error('Error connecting Stream user globally:', err);
      }
    };

    connectUser();
  }, [authUser, tokenData]);

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

    const handleNewMessage = (event) => {
      const invite = event.message.attachments?.find((a) => a.type === 'video_call_invite');
      if (invite) {
        if (event.message.user.id !== streamClient.userID) {
          let declined = [];
          try {
            declined = JSON.parse(localStorage.getItem('declined-calls') || '[]');
          } catch {}

          if (!declined.includes(invite.callId)) {
            setIncomingCall({
              callId: invite.callId,
              senderName: event.message.user.name || event.message.user.id,
              senderAvatar: event.message.user.image,
              userId: event.message.user.id,
            });
          }
        }
      }
    };

    const handleSignalingEvent = (event) => {
      if (event.type === 'call_declined') {
        setIncomingCall((prev) => {
          if (prev && prev.callId === event.callId) {
            return null;
          }
          return prev;
        });
      }
    };

    streamClient.on(handleEvent);
    streamClient.on('message.new', handleNewMessage);
    streamClient.on('call_declined', handleSignalingEvent);

    return () => {
      streamClient.off(handleEvent);
      streamClient.off('message.new', handleNewMessage);
      streamClient.off('call_declined', handleSignalingEvent);
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

  const showCallPopup = incomingCall && location.pathname === '/';

  return (
    <div className="min-h-screen" data-theme={theme}>
      {showCallPopup && (
        <div className="fixed bottom-4 right-4 z-50 bg-base-200 border-2 border-primary rounded-2xl p-4 shadow-2xl w-80 max-w-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="avatar ring-2 ring-primary ring-offset-2 rounded-full relative">
              <div className="w-12 rounded-full">
                <img src={incomingCall.senderAvatar || 'https://avatar.iran.liara.run/public'} alt={incomingCall.senderName} />
              </div>
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-base-100 animate-ping" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-base-content truncate text-left">{incomingCall.senderName}</p>
              <p className="text-xs text-base-content/70 animate-pulse text-left">Incoming video call...</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => {
                let declined = [];
                try {
                  declined = JSON.parse(localStorage.getItem('declined-calls') || '[]');
                } catch {}
                declined.push(incomingCall.callId);
                localStorage.setItem('declined-calls', JSON.stringify(declined));
                
                // Notify the caller that Dev declined the call
                if (streamClient && incomingCall.userId) {
                  streamClient.sendUserCustomEvent(incomingCall.userId, {
                    type: 'call_declined',
                    callId: incomingCall.callId,
                  }).catch(console.error);
                }
                
                setIncomingCall(null);
              }}
              className="btn btn-error btn-xs rounded-xl px-4 gap-1 font-bold h-9"
            >
              Decline
            </button>
            <button
              onClick={() => {
                navigate(`/chat/${incomingCall.userId}?joinCall=true`);
                setIncomingCall(null);
              }}
              className="btn btn-success btn-xs rounded-xl px-4 gap-1 font-bold h-9 text-white"
            >
              Join
            </button>
          </div>
        </div>
      )}

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