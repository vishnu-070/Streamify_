import { useEffect, useState, useCallback } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallingState,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { X, Loader, Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from 'lucide-react';
import { getAvatarUrl } from '../lib/avatars';
import { streamClient } from '../lib/stream';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || 'n5psykq5nde3';

// Inner component that has access to call state hooks and useCall
const CallUI = ({ onLeave, callId, messageId }) => {
  const call = useCall();
  const {
    useCallCallingState,
    useCameraState,
    useMicrophoneState,
    useScreenShareState,
    useParticipants,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const { isMute: isCameraMuted } = useCameraState();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { isSharing: isScreenSharing } = useScreenShareState();
  const participants = useParticipants();

  const [partnerHasJoined, setPartnerHasJoined] = useState(false);

  // Auto-leave when call ends
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onLeave();
    }
  }, [callingState, onLeave]);

  const otherParticipants = participants.filter((p) => p.userId !== call?.currentUserId);

  useEffect(() => {
    if (otherParticipants.length > 0) {
      setPartnerHasJoined(true);
      // Update message status to connected in-place in Stream Chat
      if (streamClient && callId && messageId) {
        streamClient.updateMessage({
          id: messageId,
          text: '🟢 Video Call Connected',
          attachments: [{ type: 'video_call_invite', status: 'connected', callId }],
        }).catch(console.error);
      }
    } else if (partnerHasJoined && otherParticipants.length === 0) {
      onLeave();
    }
  }, [otherParticipants, partnerHasJoined, onLeave, callId, messageId]);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white space-y-3">
          <Loader className="size-10 animate-spin mx-auto text-primary" />
          <p>Joining call...</p>
        </div>
      </div>
    );
  }

  const hasPartnerJoined = otherParticipants.length > 0;

  if (callingState === CallingState.JOINED && !hasPartnerJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-ping absolute" />
          <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center relative z-10 animate-pulse">
            <Video className="size-10 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Calling Partner...</h3>
          <p className="text-sm text-gray-400">Waiting for them to accept and join the video call</p>
        </div>
        <button
          onClick={onLeave}
          className="btn btn-circle btn-lg btn-error text-white hover:bg-red-700 mt-4"
          title="Cancel Call"
        >
          <PhoneOff className="size-6" />
        </button>
      </div>
    );
  }

  const handleToggleMic = async () => {
    try {
      await call.microphone.toggle();
    } catch (e) {
      console.error('Error toggling microphone:', e);
    }
  };

  const handleToggleCamera = async () => {
    try {
      await call.camera.toggle();
    } catch (e) {
      console.error('Error toggling camera:', e);
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      await call.screenShare.toggle();
    } catch (e) {
      console.error('Error toggling screen share:', e);
    }
  };

  const handleEndCall = async () => {
    try {
      await call.endCall();
    } catch (e) {
      console.error('Error ending call:', e);
    }
    onLeave();
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 relative">
      {/* Video feeds area */}
      <div className="flex-1 overflow-hidden">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>

      {/* Custom premium calling controls */}
      <div className="shrink-0 py-6 flex items-center justify-center gap-4 bg-gray-900 border-t border-gray-800 z-10">
        {/* Toggle Mic */}
        <button
          onClick={handleToggleMic}
          className={`btn btn-circle btn-lg ${
            isMicMuted ? 'btn-error text-white' : 'btn-ghost bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
          title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMicMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={handleToggleCamera}
          className={`btn btn-circle btn-lg ${
            isCameraMuted ? 'btn-error text-white' : 'btn-ghost bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
          title={isCameraMuted ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraMuted ? <VideoOff className="size-6" /> : <Video className="size-6" />}
        </button>

        {/* Toggle Screen Share */}
        <button
          onClick={handleToggleScreenShare}
          className={`btn btn-circle btn-lg ${
            isScreenSharing ? 'btn-accent text-white' : 'btn-ghost bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        >
          <Monitor className="size-6" />
        </button>

        {/* Leave Call */}
        <button
          onClick={onLeave}
          className="btn btn-circle btn-lg btn-error text-white hover:bg-red-700"
          title="Leave Call"
        >
          <PhoneOff className="size-6" />
        </button>

        {/* End Call for Everyone */}
        <button
          onClick={handleEndCall}
          className="btn btn-error btn-outline rounded-full px-6 btn-lg text-red-500 hover:text-white"
          title="End Call for All"
        >
          End Call for All
        </button>
      </div>
    </div>
  );
};

const VideoCallModal = ({ authUser, token, channelId, callId, messageId, targetUserId, onClose }) => {
  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  const handleLeave = useCallback(async () => {
    if (call) {
      try {
        await call.leave();
      } catch (err) {
        console.error('Error leaving call:', err);
      }
    }

    // Send call_declined event to target partner to clean up their call screen immediately
    if (streamClient && targetUserId) {
      streamClient.sendUserCustomEvent(targetUserId, {
        type: 'call_declined',
        callId: callId,
      }).catch(console.error);
    }

    // Update message status to ended in-place in Stream Chat
    if (streamClient && messageId) {
      streamClient.updateMessage({
        id: messageId,
        text: '📞 Video Call Ended',
        attachments: [{ type: 'video_call_invite', status: 'ended', callId }],
      }).catch(console.error);
    }

    onClose();
  }, [call, onClose, targetUserId, callId, messageId]);

  // Signaling listener for real-time declined / ended calls synchronization
  useEffect(() => {
    if (!streamClient) return;

    const handleSignaling = (event) => {
      if (event.type === 'call_declined' && event.callId === callId) {
        setError('Call Declined');
        setTimeout(() => {
          handleLeave();
        }, 2000);
      }
    };

    streamClient.on(handleSignaling);

    return () => {
      streamClient.off(handleSignaling);
    };
  }, [callId, handleLeave]);

  useEffect(() => {
    if (!authUser || !token || !channelId || !callId) return;

    let client;
    let activeCall;

    const initCall = async () => {
      try {
        // Create a StreamVideoClient (separate from StreamChat client)
        client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: getAvatarUrl(authUser.profilePic, authUser.fullName),
          },
          token,
        });

        setVideoClient(client);

        activeCall = client.call('default', callId);

        // Create or join the call
        await activeCall.join({ create: true });
        setCall(activeCall);
      } catch (err) {
        console.error('Error initializing video call:', err);
        setError(err.message || 'Failed to start video call');
      }
    };

    initCall();

    return () => {
      // Cleanup: leave the call and disconnect client on unmount
      if (activeCall) {
        activeCall.leave().catch(console.error);
      }
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [authUser, token, channelId, callId]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 h-12 flex items-center justify-between px-4 shrink-0">
        <span className="text-white font-semibold text-sm">Video Call</span>
        <button
          onClick={handleLeave}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Call area */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-950">
            <div className="text-center text-white space-y-4 p-6 max-w-sm border border-gray-800 rounded-2xl bg-gray-900 shadow-2xl">
              <p className="text-red-400 font-bold text-xl">
                {error === 'Call Declined' ? 'Call Declined' : 'Failed to start call'}
              </p>
              <p className="text-gray-400 text-sm">
                {error === 'Call Declined' ? 'The call partner declined or left the conversation.' : error}
              </p>
              <button
                onClick={handleLeave}
                className="btn btn-error rounded-xl w-full font-bold h-10 mt-2 text-white"
              >
                Close
              </button>
            </div>
          </div>
        ) : !videoClient || !call ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white space-y-3">
              <Loader className="size-10 animate-spin mx-auto text-primary" />
              <p className="text-gray-300">Starting video call...</p>
            </div>
          </div>
        ) : (
          <StreamVideo client={videoClient}>
            <StreamCall call={call}>
              <CallUI onLeave={handleLeave} callId={callId} messageId={messageId} />
            </StreamCall>
          </StreamVideo>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
