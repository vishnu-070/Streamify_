import { useQuery } from '@tanstack/react-query';
import { BellIcon, UserCheckIcon, ClockIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import Layout from '../components/Layout';
import { formatDistanceToNow } from 'date-fns';

const NotificationPage = ({ onThemeChange, currentTheme }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/friend-requests');
      return res.data;
    },
  });

  const acceptedRequests = data?.acceptedReqs || [];

  return (
    <Layout showSidebar onThemeChange={onThemeChange} currentTheme={currentTheme}>
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : acceptedRequests.length === 0 ? (
          <div className="text-center py-16 text-base-content/40">
            <BellIcon className="size-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">No notifications yet</p>
            <p className="text-sm">When someone accepts your friend request, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="size-5 text-primary" />
              <h2 className="font-semibold text-base">New Connections</h2>
            </div>

            {/* Notification items */}
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
                          src={req.recipient?.profilePic}
                          alt={req.recipient?.fullName}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{req.recipient?.fullName}</p>
                      <p className="text-sm text-base-content/60">
                        {req.recipient?.fullName} accepted your friend request
                      </p>
                      <div className="flex items-center gap-1 text-xs text-base-content/40 mt-0.5">
                        <ClockIcon className="size-3" />
                        {req.updatedAt
                          ? formatDistanceToNow(new Date(req.updatedAt), { addSuffix: true })
                          : 'Recently'}
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="badge badge-primary badge-sm gap-1 shrink-0">
                    <UserCheckIcon className="size-3" />
                    New Friend
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationPage;