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
    <div className="card bg-base-200/50 backdrop-blur-md border border-base-content/10 hover:border-primary/45 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <div className="card-body p-6 gap-4">
        {/* Header: avatar + name + location */}
        <div className="flex items-start gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-2xl ring-4 ring-primary/10 overflow-hidden shadow-md">
              <img src={getAvatarUrl(user.profilePic, user.fullName)} alt={user.fullName} className="object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-bold text-lg text-base-content truncate">{user.fullName}</h3>
            {user.location ? (
              <p className="text-xs text-base-content/50 flex items-center gap-1 mt-1 font-medium">
                <MapPinIcon className="size-3.5 text-primary/75" />
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
            <span className="badge badge-md text-xs bg-primary/10 border-none text-primary gap-1.5 px-3 py-1.5 rounded-lg font-semibold">
              {getLanguageFlag(user.nativeLanguage)} Native: {user.nativeLanguage}
            </span>
          )}
          {user.learningLanguage && (
            <span className="badge badge-md text-xs bg-secondary/10 border-none text-secondary gap-1.5 px-3 py-1.5 rounded-lg font-semibold">
              {getLanguageFlag(user.learningLanguage)} Learning: {user.learningLanguage}
            </span>
          )}
        </div>

        {/* Bio */}
        {user.bio ? (
          <p className="text-sm text-base-content/70 line-clamp-2 min-h-10 leading-relaxed text-left">{user.bio}</p>
        ) : (
          <p className="text-sm text-base-content/40 italic min-h-10 text-left">No bio provided yet.</p>
        )}

        {/* Action Button */}
        <button
          onClick={() => sendRequest()}
          disabled={isPending || hasRequested}
          className={`btn btn-sm w-full rounded-xl gap-2 mt-2 h-10 font-bold transition-all ${
            hasRequested 
              ? 'btn-success btn-outline border-2 hover:bg-success/10' 
              : 'btn-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/35'
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
