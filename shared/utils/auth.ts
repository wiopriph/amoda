// Единственное место, где решается «кто админ»: роль лежит в app_metadata.roles пользователя Supabase
export const hasAdminRole = (user: any) => {
  const roles = user?.app_metadata?.roles || [];

  return Array.isArray(roles) && roles.includes('admin');
};
