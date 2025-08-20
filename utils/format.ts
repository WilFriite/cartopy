export const formatListItems = (items?: string | null) => {
  if (!items) return [];
  return items
    .split(',')
    .filter(Boolean)
    .map(item => item.trim());
};
