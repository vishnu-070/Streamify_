import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useLogout = () => {
  const queryClient = useQueryClient();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Logout failed';
      toast.error(message);
    },
  });

  return { logout, isPending };
};
