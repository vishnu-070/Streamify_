import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user);
      toast.success('Welcome back!');
    },
    onError: (error) => {
      const message = error.response?.data?.Message || error.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });

  return { login, isPending };
};
