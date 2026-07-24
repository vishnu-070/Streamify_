import multiavatar from '@multiavatar/multiavatar/esm';

export const getAvatarUrl = (avatarUrl, fullName) => {
  if (
    !avatarUrl ||
    avatarUrl.includes('avatar.iran.liara.run') ||
    avatarUrl === ' ' ||
    avatarUrl.includes('ui-avatars.com/api')
  ) {
    const seed = fullName || 'User';
    // Use the public multiavatar API URL so it remains well under Stream's 5KB user custom data limit
    return `https://api.multiavatar.com/${encodeURIComponent(seed)}.svg`;
  }
  return avatarUrl;
};
