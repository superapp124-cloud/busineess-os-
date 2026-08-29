import { 
  normalizePhone, 
  canonicalNationalPhone, 
  formatPhoneDisplay, 
  isSamePhone, 
  findUserByPhone,
  isValidPhone
} from '@/core/phone/phoneIdentity';

export { 
  normalizePhone, 
  canonicalNationalPhone, 
  formatPhoneDisplay, 
  isSamePhone, 
  findUserByPhone,
  isValidPhone 
};

// Backward-compatible aliases
export const normalizeToInternational = normalizePhone;
export const normalizePhoneNumber = normalizePhone;

export function isUsablePhoneNumber(phone: string | null | undefined): boolean {
  return isValidPhone(phone);
}

// Utility for hashing phone numbers for privacy
export async function hashPhoneNumber(phone: string): Promise<string> {
  const normalized = normalizeToInternational(phone);
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Update phone hash for a user profile
export async function updateUserPhoneHash(
  supabase: any,
  userId: string,
  phoneNumber: string
): Promise<void> {
  const normalized = normalizePhoneNumber(phoneNumber);
  const phoneHash = await hashPhoneNumber(normalized);

  await supabase
    .from('profiles')
    .update({
      phone_number: normalized,
      phone_hash: phoneHash,
    })
    .eq('id', userId);
}
