export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatPhoneNumber(phone: string): string {
  // Basic phone formatting - customize as needed
  return phone;
}