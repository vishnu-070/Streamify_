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
import { VideoIcon, LoaderIcon, ShipWheelIcon, BellIcon, LogOutIcon, Palette } from 'lucide-react';
import VideoCallModal from '../components/VideoCallModal';
import { getAvatarUrl } from '../lib/avatars';

const THEMES = [
  'light','dark','cupcake','bumblebee','emerald','corporate','synthwave','retro',
  'cyberpunk','valentine','halloween','garden','forest','aqua','lofi','pastel',
  'fantasy','wireframe','black','luxury','dracula','cmyk','night','coffee','winter','dim','nord','sunset',
];

const THEME_PREVIEW_COLORS = {
  light: ['#570df8', '#f000b8', '#37cdbe', '#3d4451'],
  dark: ['#661ae6', '#d926a9', '#1fb2a6', '#a6adba'],
  cupcake: ['#65c3c8', '#ef9fbc', '#eeaf3a', '#291334'],
  bumblebee: ['#e0a82e', '#f9d72f', '#181830', '#0d102b'],
  emerald: ['#66cc8a', '#377cfb', '#ea5234', '#333c4d'],
  corporate: ['#4b6bfb', '#7b92b2', '#67cba0', '#181a2a'],
  synthwave: ['#e779c1', '#58c7f3', '#f3cc30', '#2d1b69'],
  retro: ['#ef9900', '#dc2626', '#65c3c8', '#282425'],
  cyberpunk: ['#ff7598', '#75d1f0', '#c07eec', '#423f00'],
  pastel: ['#d1c1d7', '#f6cbd1', '#b4e9d6', '#70acc7'],
  fantasy: ['#6e0b75', '#007ebd', '#4ada89', '#1f2937'],
  wireframe: ['#b8b8b8', '#b8b8b8', '#b8b8b8', '#b8b8b8'],
  black: ['#343232', '#343232', '#343232', '#cdcdcd'],
  luxury: ['#ffffff', '#152747', '#513448', '#aaaaaa'],
  dracula: ['#ff79c6', '#bd93f9', '#ffb86c', '#f8f8f2'],
  cmyk: ['#45ade5', '#e8488a', '#ffe01b', '#00c2cb'],
  night: ['#38bdf8', '#818cf8', '#fb7185', '#94a3b8'],
};

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
              className="dropdown-content menu bg-base-200 border border-base-300 rounded-box w-56 shadow-2xl mt-2 p-2 max-h-72 overflow-y-auto z-50"
            >
              {THEMES.map((t) => {
                const colors = THEME_PREVIEW_COLORS[t] || ['#888', '#888', '#888', '#888'];
                return (
                  <li key={t}>
                    <button
                      className={`flex items-center justify-between px-3 py-2 rounded-lg w-full ${
                        currentTheme === t ? 'bg-base-300 font-medium' : 'hover:bg-base-300'
                      }`}
                      onClick={() => onThemeChange(t)}
                    >
                      <span className="capitalize text-sm">{t}</span>
                      <div className="flex gap-1">
                        {colors.slice(0, 4).map((color, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  </li>
                );
              })}
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
          <div className="flex h-full">
            {/* Channel List */}
            <div className="w-72 border-r border-base-300 shrink-0 overflow-y-auto">
              <ChannelList
                filters={{ type: 'messaging', members: { $in: [authUser._id] } }}
                sort={{ last_message_at: -1 }}
                options={{ state: true, presence: true, limit: 30 }}
                customActiveChannel={activeChannel}
              />
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-hidden">
              {activeChannel ? (
                <Channel channel={activeChannel}>
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
                <div className="h-full flex items-center justify-center text-base-content/40">
                  <div className="text-center">
                    <VideoIcon className="size-12 mx-auto mb-3 opacity-30" />
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