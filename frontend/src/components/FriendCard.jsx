import { Link } from 'react-router';
import { MessageSquareIcon } from 'lucide-react';
import { getLanguageFlag } from '../lib/languages';
import { getAvatarUrl } from '../lib/avatars';

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="card-body p-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar">
            <div className="w-12 rounded-full ring-2 ring-primary/20">
              <img src={getAvatarUrl(friend.profilePic, friend.fullName)} alt={friend.fullName} />
            </div>
          </div>
          <h3 className="font-bold text-base text-base-content">{friend.fullName}</h3>
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {friend.nativeLanguage && (
            <span className="badge badge-md text-xs bg-primary/10 border border-primary/20 text-primary gap-1.5 px-3 py-1 rounded-full font-medium">
              {getLanguageFlag(friend.nativeLanguage)} Native: {friend.nativeLanguage}
            </span>
          )}
          {friend.learningLanguage && (
            <span className="badge badge-md text-xs bg-base-300 border border-base-content/10 text-base-content/90 gap-1.5 px-3 py-1 rounded-full font-medium">
              {getLanguageFlag(friend.learningLanguage)} Learning: {friend.learningLanguage}
            </span>
          )}
        </div>

        {/* Message button */}
        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-outline btn-sm w-full rounded-full gap-2 border-base-content/20 hover:bg-primary hover:text-white"
        >
          <MessageSquareIcon className="size-4" />
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;
