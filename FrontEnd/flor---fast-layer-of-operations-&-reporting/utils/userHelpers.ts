export const buildPasswordChangeUrl = (userId: string): string => {
  return `/usuarios/${userId}/password`;
};