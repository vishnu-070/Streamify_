import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import Layout from '../components/Layout';
import FriendCard from '../components/FriendCard';
import { UsersIcon } from 'lucide-react';
import { Link } from 'react-router';

const FriendsPage = ({ onThemeChange, currentTheme }) => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/Friends');
      return res.data;
    },
  });

  return (
    <Layout showSidebar onThemeChange={onThemeChange} currentTheme={currentTheme}>
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Your Friends</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-20 text-base-content/50">
            <UsersIcon className="size-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No friends yet</p>
            <p className="text-sm mb-6">Start connecting with language learners!</p>
            <Link to="/" className="btn btn-primary rounded-full">
              Discover Learners
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FriendsPage;
