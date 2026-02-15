import * as constants from '../utils/constants';

export const LOGIN = 'admin/login' + ` ${constants.POST_RAW}`;
export const LOGOUT = 'admin/logout' + ` ${constants.POST_RAW}`;

export const AUTH = {
  FORGOT_PASSWORD: 'admin/password/forgot' + ` ${constants.POST_RAW}`,
  VERIFY_OTP: 'admin/verify/otp' + ` ${constants.POST_URL_ENCODED}`,
  RESET_PASSWORD: 'admin/password/reset' + ` ${constants.POST_URL_ENCODED}`,
  CHANGE_PASSWORD: 'admin/password/change' + ` ${constants.PATCH}`,
  myProfile: 'auth/me' + ` ${constants.GET}`,
};

export const CATEGORIES = {
  LIST_CATEGORIES: 'admin/category-list' + ` ${constants.GET_URL_PARAMS}`,
  GET_CATEGORY: 'admin/category' + ` ${constants.GET_ID_PARAMS}`,
  ADD_CATEGORY: 'admin/category' + ` ${constants.POST_FORM}`,
  UPDATE_CATEGORY: 'admin/category-update' + ` ${constants.MULTI_PART_ID_PATCH}`,
  DELETE_CATEGORY: 'admin/category-delete' + ` ${constants.DELETE_ID_PARAMS}`,
  ACTIVE_DEACTIVE: 'admin/category-status' + ` ${constants.PATCH_ID}`,
};

export const DASHBOARD = {
  GET: 'admin/dashboard' + ` ${constants.GET_URL_PARAMS}`,
};
