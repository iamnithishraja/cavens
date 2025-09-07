import { Colors } from '@/constants/Colors';

export const normalizeClubType = (raw?: string): string[] => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '_'))
    .filter(Boolean);
};

// Central mapping for club type -> color to keep map markers and selectors in sync
export const CLUB_TYPE_COLORS: Record<string, string> = {
  nightclub: Colors.primary,
  night_club: Colors.primary,
  rooftop: Colors.blueAccent,
  bar: Colors.warning,
  lounge: Colors.success,
  pool_club: Colors.info,
  beach_club: Colors.info,
};

export const getClubTypeColor = (typeOrTypes?: string): string | undefined => {
  const tokens = normalizeClubType(typeOrTypes);
  for (const token of tokens) {
    const c = CLUB_TYPE_COLORS[token];
    if (c) return c;
  }
  return undefined;
};


