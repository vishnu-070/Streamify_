export const getLanguageFlag = (lang) => {
  const flags = {
    'English': '🇺🇸',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Portuguese': '🇵🇹',
    'Russian': '🇷🇺',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Chinese (Mandarin)': '🇨🇳',
    'Chinese (Cantonese)': '🇭🇰',
    'Arabic': '🇸🇦',
    'Hindi': '🇮🇳',
    'Bengali': '🇧🇩',
    'Turkish': '🇹🇷',
    'Greek': '🇬🇷',
  };
  return flags[lang] || '🌐';
};
