import { useQuery } from '@tanstack/react-query';
import { BellIcon, UserCheckIcon, ClockIcon, MessageSquareIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import Layout from '../components/Layout';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl } from '../lib/avatars';
import { streamClient } from '../lib/stream';
import { Link } from 'react-router';

const NotificationPage = ({ onThemeChange, currentTheme }) => {
  const { data: requestData, isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/friend-requests');
      return res.data;
    },
  });

  const { data: recentMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['recentMessages'],
    queryFn: async () => {
      if (!streamClient || !streamClient.userID) return [];
      const channels = await streamClient.queryChannels(
        { members: { $in: [streamClient.userID] } },
        { last_message_at: -1 },
        { limit: 15, state: true }
      );

      const latestMessages = [];
      for (const channel of channels) {
        const messages = channel.state.messages;
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.user.id !== streamClient.userID) {
            latestMessages.push({
              id: lastMsg.id,
              text: lastMsg.text,
              createdAt: lastMsg.created_at,
              sender: lastMsg.user,
              channelId: channel.id,
            });
          }
        }
      }
      return latestMessages;
    },
    enabled: !!streamClient?.userID,
  });

  const acceptedRequests = requestData?.acceptedReqs || [];
  const hasNotifications = acceptedRequests.length > 0 || recentMessages.length > 0;
  const isLoading = requestsLoading || messagesLoading;

  return (
    <Layout showSidebar onThemeChange={onThemeChange} currentTheme={currentTheme}>
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-left">Notifications</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : !hasNotifications ? (
          <div className="text-center py-16 text-base-content/40 bg-base-200 rounded-2xl border border-base-300">
            <BellIcon className="size-12 mx-auto mb-4 opacity-30 animate-bounce" />
            <p className="text-lg font-medium mb-1">No notifications yet</p>
            <p className="text-sm">New messages and friend requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recent Messages Section */}
            {recentMessages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareIcon className="size-5 text-primary" />
                  <h2 className="font-semibold text-base">Recent Messages</h2>
                </div>
                <div className="space-y-2">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3 border border-base-300 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img
                              src={msg.sender.image || 'https://avatar.iran.liara.run/public'}
                              alt={msg.sender.name || msg.sender.id}
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-semibold text-sm text-base-content">{msg.sender.name || msg.sender.id}</p>
                          <p className="text-sm text-base-content/60 truncate">
                            {msg.text || '📷 Sent an attachment'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-base-content/40 mt-0.5">
                            <ClockIcon className="size-3" />
                            {msg.createdAt
                              ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })
                              : 'Recently'}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/chat/${msg.sender.id}`}
                        className="btn btn-primary btn-sm rounded-xl gap-1 px-4 ml-3 shrink-0"
                      >
                        Reply
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friend Requests Section */}
            {acceptedRequests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="size-5 text-primary" />
                  <h2 className="font-semibold text-base">New Connections</h2>
                </div>
                <div className="space-y-2">
                  {acceptedRequests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3 border border-base-300 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img
                              src={getAvatarUrl(req.recipient?.profilePic, req.recipient?.fullName)}
                              alt={req.recipient?.fullName}
                            />
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm text-base-content">{req.recipient?.fullName}</p>
                          <p className="text-sm text-base-content/60">
                            accepted your friend request
                          </p>
                          <div className="flex items-center gap-1 text-xs text-base-content/40 mt-0.5">
                            <ClockIcon className="size-3" />
                            {req.updatedAt
                              ? formatDistanceToNow(new Date(req.updatedAt), { addSuffix: true })
                              : 'Recently'}
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-primary badge-sm gap-1 shrink-0 px-3 py-2 rounded-lg font-bold">
                        <UserCheckIcon className="size-3" />
                        Connected
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationPage;