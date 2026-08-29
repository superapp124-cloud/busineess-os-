/**
 * Centralized Avatar Resolver for CHATR Business OS
 */
export function getAvatarUrl(name?: string | null, rawAvatarUrl?: string | null): string {
  if (rawAvatarUrl && typeof rawAvatarUrl === 'string' && rawAvatarUrl.trim()) {
    const trimmed = rawAvatarUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `https://cenxckpxaqborfqyexot.supabase.co/storage/v1/object/public/avatars/${trimmed.replace(/^\/+/, '')}`;
  }

  const cleanName = name && name.trim() ? name.trim() : 'CHATR User';
  const seed = encodeURIComponent(cleanName);
  return `https://ui-avatars.com/api/?name=${seed}&background=6366f1&color=fff&bold=true&font-size=0.45`;
}
