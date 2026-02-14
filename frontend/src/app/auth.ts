export const getAuth = (): string | null => {
  return localStorage.getItem('token');
};

export const useAuth = () => {
  const saveAuth = (token: string | undefined) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  };

  const currentUser: Record<string, unknown> = {};

  const saveCurrentUser = (user: { _id?: string } | undefined) => {
    if (user?._id) localStorage.setItem('userId', user._id);
    else localStorage.removeItem('userId');
  };

  return { getAuth, saveAuth, currentUser, saveCurrentUser };
};
