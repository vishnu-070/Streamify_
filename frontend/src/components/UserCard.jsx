import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlusIcon, MapPinIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { getLanguageFlag } from '../lib/languages';
import { getAvatarUrl } from '../lib/avatars';
import { streamClient } from '../lib/stream';
import toast from 'react-hot-toast';

const UserCard = ({ user, hasRequested }) => {
  const queryClient = useQueryClient();

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: () => axiosInstance.post(`/users/friend-request/${user._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['recommendedUsers'] });

      // Trigger live custom event
      if (streamClient && streamClient.userID) {
        streamClient.sendUserCustomEvent(user._id, {
          type: 'friend_request_received',
          senderId: streamClient.userID,
        }).catch(err => console.error("Error sending live event:", err));
      }

      toast.success(`Friend request sent to ${user.fullName}!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to send request';
      toast.error(msg);
    },
  });

  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/40 hover:shadow-lg transition-all duration-200 rounded-xl">
      <div className="card-body p-6 gap-4">
        {/* Header: avatar + name + location */}
        <div className="flex items-start gap-4">
          <div className="avatar">
            <div className="w-14 h-14 rounded-full ring-2 ring-primary/20 overflow-hidden shadow-sm">
              <img src={getAvatarUrl(user.profilePic, user.fullName)} alt={user.fullName} className="object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-bold text-base text-base-content truncate">{user.fullName}</h3>
            {user.location ? (
              <p className="text-xs text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                <MapPinIcon className="size-3 text-primary/70" />
                {user.location}
              </p>
            ) : (
              <p className="text-xs text-base-content/40 mt-1">Language Partner</p>
            )}
          </div>
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {user.nativeLanguage && (
            <span className="badge badge-md text-xs bg-primary/10 border border-primary/20 text-primary gap-1.5 px-3 py-1.5 rounded-full font-semibold">
              {getLanguageFlag(user.nativeLanguage)} Native: {user.nativeLanguage}
            </span>
          )}
          {user.learningLanguage && (
            <span className="badge badge-md text-xs bg-secondary/10 border border-secondary/20 text-secondary gap-1.5 px-3 py-1.5 rounded-full font-semibold">
              {getLanguageFlag(user.learningLanguage)} Learning: {user.learningLanguage}
            </span>
          )}
        </div>

        {/* Bio */}
        {user.bio ? (
          <p className="text-sm text-base-content/70 line-clamp-2 min-h-10 leading-relaxed text-left mt-1">{user.bio}</p>
        ) : (
          <p className="text-sm text-base-content/45 italic min-h-10 text-left mt-1">No bio provided yet.</p>
        )}

        {/* Action Button */}
        <button
          onClick={() => sendRequest()}
          disabled={isPending || hasRequested}
          className={`btn btn-sm w-full rounded-full gap-2 mt-3 h-10 font-bold transition-all ${
            hasRequested 
              ? 'btn-success btn-outline border-2' 
              : 'btn-primary'
          }`}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : hasRequested ? (
            <>
              <CheckIcon className="size-4 stroke-[2.5]" />
              Request Sent
            </>
          ) : (
            <>
              <UserPlusIcon className="size-4 stroke-[2.5]" />
              Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
