import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import { streamClient } from '../lib/stream';
import {
  Channel,
  ChannelList,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  MessageUI,
  useMessageContext,
  useChannelStateContext,
  ComponentProvider,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { VideoIcon, LoaderIcon, ShipWheelIcon, BellIcon, LogOutIcon, Palette, ArrowLeft } from 'lucide-react';
import VideoCallModal from '../components/VideoCallModal';
import { getAvatarUrl } from '../lib/avatars';

const CURATED_THEMES = [
  { id: 'emerald', name: 'Emerald Green', color: '#10B981' },
  { id: 'night', name: 'Ocean Blue', color: '#3B82F6' },
  { id: 'dracula', name: 'Royal Purple', color: '#8B5CF6' },
  { id: 'bumblebee', name: 'Autumn Gold', color: '#F59E0B' },
  { id: 'sunset', name: 'Sunset Rose', color: '#EF4444' },
  { id: 'dark', name: 'Charcoal Dark', color: '#1F2937' },
  { id: 'light', name: 'Classic Light', color: '#F3F4F6' },
];

const ChatPage = ({ onThemeChange, currentTheme }) => {
  const { authUser } = useAuth();
  const { logout } = useLogout();
  const { userId: targetUserId } = useParams();

  const [clientReady, setClientReady] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [inCall, setInCall] = useState(false);

  // Fetch Stream token (used for both chat AND video)
  const { data: tokenData } = useQuery({
    queryKey: ['streamToken'],
    queryFn: async () => {
      const res = await axiosInstance.get('/chat/token');
      return res.data;
    },
    enabled: !!authUser,
  });

  // Connect Stream Chat user
  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    const connectUser = async () => {
      try {
        if (streamClient.userID) {
          setClientReady(true);
          return;
        }
        await streamClient.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: getAvatarUrl(authUser.profilePic, authUser.fullName),
          },
          tokenData.token
        );
        setClientReady(true);
      } catch (err) {
        console.error('Error connecting Stream user:', err);
      }
    };

    connectUser();
  }, [authUser, tokenData]);

  // Create / get channel when a targetUserId is provided (from Message button)
  useEffect(() => {
    if (!clientReady || !targetUserId || !authUser) return;

    const initChannel = async () => {
      const channel = streamClient.channel('messaging', {
        members: [authUser._id, targetUserId],
      });
      await channel.watch();
      setActiveChannel(channel);
    };

    initChannel();
  }, [clientReady, targetUserId, authUser]);

  if (!clientReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center space-y-3">
          <LoaderIcon className="size-10 animate-spin text-primary mx-auto" />
          <p className="text-base-content/60 text-sm">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Send a call invite message to the channel so the other user receives a Join prompt
  const startVideoCall = async () => {
    if (!activeChannel) return;
    const sanitizedChannelId = activeChannel.id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const callId = `call-${sanitizedChannelId}`;
    try {
      await activeChannel.sendMessage({
        text: '📞 Video Call Started',
        attachments: [
          {
            type: 'video_call_invite',
            callId: callId,
          },
        ],
      });
    } catch (err) {
      console.error('Error sending video call invite:', err);
    }
    setInCall(true);
  };

  // Custom channel header with video call button aligned via flexbox
  const CustomChannelHeader = () => {
    const { channel } = useChannelStateContext();
    
    // Find the other member in a 1-on-1 channel to show their details
    const members = Object.values(channel?.state?.members || {});
    const otherMember = members.find(m => m.user?.id !== streamClient.userID);
    const displayName = otherMember?.user?.name || otherMember?.user?.id || 'Conversation';
    const displayImage = otherMember?.user?.image || 'https://avatar.iran.liara.run/public';

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300 h-16 shrink-0 w-full z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn btn-ghost btn-circle btn-sm mr-1" title="Go back">
            <ArrowLeft className="size-5 text-base-content" />
          </Link>
          <div className="avatar">
            <div className="w-10 rounded-full ring-2 ring-primary/20">
              <img src={displayImage} alt={displayName} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content leading-tight">{displayName}</h3>
            <p className="text-xs text-success flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
              Online
            </p>
          </div>
        </div>
        
        <button
          className="btn btn-primary btn-circle btn-sm shrink-0"
          onClick={startVideoCall}
          title="Start video call"
        >
          <VideoIcon className="size-4" />
        </button>
      </div>
    );
  };

  // Custom message component to render the call invite card with a Join button
  const CustomMessage = (props) => {
    const { message } = useMessageContext();
    const invite = message.attachments?.find((a) => a.type === 'video_call_invite');

    if (invite) {
      return (
        <div className="flex justify-center my-3">
          <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 shadow-md text-center max-w-xs w-full space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
              <VideoIcon className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Video Call</h4>
              <p className="text-xs text-base-content/60 mt-1">
                Started by {message.user?.name || 'User'}
              </p>
            </div>
            <button
              onClick={() => setInCall(true)}
              className="btn btn-primary btn-sm rounded-full w-full gap-1.5"
            >
              <VideoIcon className="size-3.5" />
              Join Call
            </button>
          </div>
        </div>
      );
    }

    return <MessageUI {...props} />;
  };

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Top bar */}
      <div className="bg-base-200 border-b border-base-300 h-14 flex items-center px-4 gap-3 shrink-0 z-20">
        <Link to="/" className="flex items-center gap-2">
          <ShipWheelIcon className="size-7 text-primary" />
          <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Streamify
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <Link to="/notifications" className="btn btn-ghost btn-circle btn-sm">
            <BellIcon className="size-5 text-base-content/70" />
          </Link>

          {/* Theme picker */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <Palette className="size-5 text-base-content/70" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 border border-base-300 rounded-box w-56 shadow-2xl mt-2 p-2 z-50 space-y-1"
            >
              <div className="px-3 py-1.5 text-xs font-semibold text-base-content/50 uppercase tracking-wider text-left">
                Select Theme Color
              </div>
              {CURATED_THEMES.map((theme) => (
                <li key={theme.id}>
                  <button
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full ${
                      currentTheme === theme.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-base-300'
                    }`}
                    onClick={() => onThemeChange(theme.id)}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-base-content/10 shrink-0 shadow-inner"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Avatar */}
          {authUser && (
            <div className="avatar">
              <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                <img src={getAvatarUrl(authUser.profilePic, authUser.fullName)} alt={authUser.fullName} />
              </div>
            </div>
          )}

          {/* Logout */}
          <button onClick={logout} className="btn btn-ghost btn-circle btn-sm" title="Logout">
            <LogOutIcon className="size-5 text-base-content/70" />
          </button>
        </div>
      </div>

      {/* Chat UI */}
      <div className="flex-1 overflow-hidden">
        <Chat client={streamClient} theme="str-chat__theme-dark">
          <div className="flex h-full w-full">
            {/* Message Area (Full Width) */}
            <div className="flex-1 overflow-hidden h-full w-full">
              {activeChannel ? (
                <Channel channel={activeChannel} key={activeChannel.cid}>
                  <ComponentProvider value={{ MessageUI: CustomMessage }}>
                    <Window>
                      <CustomChannelHeader />
                      <MessageList />
                      <MessageComposer />
                    </Window>
                    <Thread />
                  </ComponentProvider>
                </Channel>
              ) : (
                <div className="h-full flex items-center justify-center text-base-content/40 bg-base-100">
                  <div className="text-center">
                    <VideoIcon className="size-12 mx-auto mb-3 opacity-30 animate-pulse" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-1">Choose a friend from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Chat>
      </div>

      {/* Real Video Call — shown as fullscreen overlay */}
      {inCall && activeChannel && tokenData?.token && (
        <VideoCallModal
          authUser={authUser}
          token={tokenData.token}
          channelId={activeChannel.id}
          onClose={() => setInCall(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;