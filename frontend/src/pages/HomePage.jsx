import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheckIcon, BellIcon, UserPlusIcon, LoaderIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import FriendCard from '../components/FriendCard';
import UserCard from '../components/UserCard';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../lib/avatars';

const HomePage = ({ onThemeChange, currentTheme }) => {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  // Fetch my friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/Friends');
      return res.data;
    },
  });

  // Fetch recommended users
  const { data: recommendedUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['recommendedUsers'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/');
      return res.data.users;
    },
  });

  // Fetch outgoing requests (to know which users already received a request)
  const { data: outgoingData } = useQuery({
    queryKey: ['outgoingRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/outgoing-friend-requests');
      return res.data.outgoingReqs;
    },
  });

  // Fetch incoming friend requests
  const { data: friendRequestsData } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/friend-requests');
      return res.data;
    },
  });

  const { mutate: acceptRequest, isPending: acceptPending } = useMutation({
    mutationFn: (requestId) => axiosInstance.put(`/users/friend-request/${requestId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['recommendedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });
      toast.success('Friend request accepted!');
    },
    onError: () => toast.error('Failed to accept request'),
  });

  const outgoingIds = new Set((outgoingData || []).map((r) => r.recipient?._id));
  const incomingRequests = friendRequestsData?.incomingReqs || [];

  return (
    <Layout showSidebar onThemeChange={onThemeChange} currentTheme={currentTheme}>
      <div className="container mx-auto p-6 space-y-10 max-w-6xl">

        {/* YOUR FRIENDS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
          {friendsLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-40 w-48 rounded-xl" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-10 text-base-content/50">
              <UserCheckIcon className="size-12 mx-auto mb-3 opacity-30" />
              <p>No friends yet. Discover language partners below!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        {/* MEET NEW LEARNERS */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Meet New Learners</h2>
            <p className="text-base-content/60 text-sm mt-1">
              Discover perfect language exchange partners based on your profile
            </p>
          </div>

          {usersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-56 rounded-xl" />
              ))}
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="text-center py-10 text-base-content/50">
              <UserPlusIcon className="size-12 mx-auto mb-3 opacity-30" />
              <p>No new learners to discover right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  hasRequested={outgoingIds.has(user._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;