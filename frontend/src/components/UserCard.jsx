import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlusIcon, MapPinIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { getLanguageFlag } from '../lib/languages';
import { getAvatarUrl } from '../lib/avatars';
import toast from 'react-hot-toast';

const UserCard = ({ user, hasRequested }) => {
  const queryClient = useQueryClient();

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: () => axiosInstance.post(`/users/friend-request/${user._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });
      toast.success(`Friend request sent to ${user.fullName}!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to send request';
      toast.error(msg);
    },
  });

  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="card-body p-5 gap-3">
        {/* Header: avatar + name + location */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-14 rounded-full ring-2 ring-primary/20">
              <img src={getAvatarUrl(user.profilePic, user.fullName)} alt={user.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base text-base-content">{user.fullName}</h3>
            {user.location && (
              <p className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                <MapPinIcon className="size-3" />
                {user.location}
              </p>
            )}
          </div>
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap gap-2">
          {user.nativeLanguage && (
            <span className="badge badge-md text-xs bg-teal-900/40 border border-teal-500/20 text-teal-300 gap-1.5 px-3 py-1 rounded-full font-medium">
              {getLanguageFlag(user.nativeLanguage)} Native: {user.nativeLanguage}
            </span>
          )}
          {user.learningLanguage && (
            <span className="badge badge-md text-xs bg-base-300 border border-base-content/10 text-base-content/90 gap-1.5 px-3 py-1 rounded-full font-medium">
              {getLanguageFlag(user.learningLanguage)} Learning: {user.learningLanguage}
            </span>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-base-content/70 line-clamp-2">{user.bio}</p>
        )}

        {/* Send Friend Request button */}
        <button
          onClick={() => sendRequest()}
          disabled={isPending || hasRequested}
          className={`btn btn-sm w-full rounded-full gap-2 mt-1 ${
            hasRequested ? 'btn-success btn-outline' : 'btn-primary'
          }`}
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Sending...
            </>
          ) : hasRequested ? (
            <>
              <ClockIcon className="size-4" />
              Request Sent
            </>
          ) : (
            <>
              <UserPlusIcon className="size-4" />
              Send Friend Request
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
