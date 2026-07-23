import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';

export const useAuth = () => {
  const { data: authUser, isLoading, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        return res.data.user;
      } catch (err) {
        if (err.response?.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { authUser, isLoading, error };
};
