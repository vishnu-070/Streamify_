export const getAvatarUrl = (avatarUrl, fullName) => {
  if (!avatarUrl || avatarUrl.includes('avatar.iran.liara.run') || avatarUrl === ' ') {
    // Generate a highly reliable, beautiful initials avatar with a premium background
    const name = encodeURIComponent(fullName || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=10B981&color=fff&rounded=true&bold=true`;
  }
  return avatarUrl;
};
