import { Link } from 'react-router';
import { BellIcon, ShipWheelIcon, LogOutIcon, Palette, UserPlusIcon, UserCheckIcon, LoaderIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import { getAvatarUrl } from '../lib/avatars';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { streamClient } from '../lib/stream';
import toast from 'react-hot-toast';

const CURATED_THEMES = [
  { id: 'emerald', name: 'Emerald Green', color: '#10B981' },
  { id: 'night', name: 'Ocean Blue', color: '#3B82F6' },
  { id: 'dracula', name: 'Royal Purple', color: '#8B5CF6' },
  { id: 'bumblebee', name: 'Autumn Gold', color: '#F59E0B' },
  { id: 'sunset', name: 'Sunset Rose', color: '#EF4444' },
  { id: 'dark', name: 'Charcoal Dark', color: '#1F2937' },
  { id: 'light', name: 'Classic Light', color: '#F3F4F6' },
];

const Navbar = ({ onThemeChange, currentTheme }) => {
  const { authUser } = useAuth();
  const { logout } = useLogout();
  const queryClient = useQueryClient();

  // Fetch incoming friend requests globally
  const { data: friendRequestsData } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/friend-requests');
      return res.data;
    },
    enabled: !!authUser,
  });

  const incomingRequests = friendRequestsData?.incomingReqs || [];

  // Accept request mutation
  const { mutate: acceptRequest, isPending: acceptPending } = useMutation({
    mutationFn: (requestId) => axiosInstance.put(`/users/friend-request/${requestId}/accept`),
    onSuccess: (data, variables) => {
      const request = incomingRequests.find((r) => r._id === variables);
      const senderId = request?.sender?._id;

      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['recommendedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });

      // Trigger live custom event
      if (streamClient && streamClient.userID && senderId) {
        streamClient.sendUserCustomEvent(senderId, {
          type: 'friend_request_accepted',
          senderId: streamClient.userID,
        }).catch((err) => console.error('Error sending live event:', err));
      }

      toast.success('Friend request accepted!');
    },
    onError: () => toast.error('Failed to accept request'),
  });

  return (
    <header className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between w-full">
        {/* Logo (mobile only) */}
        <Link to="/" className="flex items-center gap-2.5 lg:hidden">
          <ShipWheelIcon className="size-7 text-primary" />
          <span className="text-xl font-bold font-mono text-primary">Streamify</span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Friend Requests (Pill/Badge Button with Dropdown) */}
          {authUser && (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm relative" title="Friend Requests">
                <UserPlusIcon className="size-5 text-base-content/70" />
                {incomingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 badge badge-primary badge-xs scale-90 px-1 py-0.5 font-bold">
                    {incomingRequests.length}
                  </span>
                )}
              </button>
              <div
                tabIndex={0}
                className="dropdown-content bg-base-200 border border-base-300 rounded-xl shadow-2xl p-4 w-80 mt-2 z-50"
              >
                <h3 className="font-semibold mb-3 text-base text-left text-base-content">Friend Requests</h3>
                {incomingRequests.length === 0 ? (
                  <p className="text-sm text-base-content/60 text-center py-3">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <div key={req._id} className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-10 rounded-full">
                            <img src={getAvatarUrl(req.sender?.profilePic, req.sender?.fullName)} alt={req.sender?.fullName} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold truncate text-base-content">{req.sender?.fullName}</p>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {req.sender?.nativeLanguage && (
                              <span className="badge badge-xs text-xs">🗣️ {req.sender.nativeLanguage}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => acceptRequest(req._id)}
                          disabled={acceptPending}
                          className="btn btn-primary btn-xs rounded-full"
                        >
                          {acceptPending ? (
                            <LoaderIcon className="size-3 animate-spin" />
                          ) : (
                            <UserCheckIcon className="size-3" />
                          )}
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          <Link to="/notifications" className="btn btn-ghost btn-circle btn-sm" title="Notifications">
            <BellIcon className="size-5 text-base-content/70" />
          </Link>

          {/* Theme Picker */}
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
              <div className="w-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
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
    </header>
  );
};

export default Navbar;
