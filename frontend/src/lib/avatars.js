import multiavatar from '@multiavatar/multiavatar/esm';

export const getAvatarUrl = (avatarUrl, fullName) => {
  if (
    !avatarUrl ||
    avatarUrl.includes('avatar.iran.liara.run') ||
    avatarUrl === ' ' ||
    avatarUrl.includes('ui-avatars.com/api')
  ) {
    const seed = fullName || 'User';
    const svgCode = multiavatar(seed);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
  }
  return avatarUrl;
};
