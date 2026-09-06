export type AccountProfile = {
  name: string | null
  phone: string | null
  email: string | null
};

export const useAccountProfile = () => useFetch<AccountProfile>('/api/account/profile', {
  key: 'account-profile',
});
