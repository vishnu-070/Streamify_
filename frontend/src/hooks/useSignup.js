import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useSignup = () => {
  const queryClient = useQueryClient();

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/auth/signup', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user);
      toast.success('Account created successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.Message || error.response?.data?.message || 'Signup failed';
      toast.error(message);
    },
  });

  return { signup, isPending };
};
