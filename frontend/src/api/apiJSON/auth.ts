import type { ILoginData } from '../../types';

export const APIJSON = {
  login: ({ email, password }: ILoginData) => ({
    email,
    password,
    role_id: 0,
  }),
};
