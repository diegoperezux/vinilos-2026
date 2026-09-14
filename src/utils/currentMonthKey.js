// "YYYY-MM" for the current calendar month — comparable lexicographically
// against monthlyAlbums' own "YYYY-MM" keys to tell past/present/future apart.
export function currentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}
