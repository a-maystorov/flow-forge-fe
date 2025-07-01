/**
 * Validates if a string is a valid MongoDB ObjectId
 * MongoDB ObjectIds are 24 character hexadecimal strings
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id) return false;

  // MongoDB ObjectId must be a 24 character hex string
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}
