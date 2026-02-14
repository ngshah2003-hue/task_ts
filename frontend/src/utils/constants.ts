// API BASE URL – update for your backend
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/';
export const PAGE_LIMIT = 10;

// API method types (used by apiCallService + apiEndPoints)
export const GET = 'GET';
export const POST = 'POST';
export const GET_URL_PARAMS = 'GET_URL_PARAMS';
export const GET_ID_PARAMS = 'GET_ID_PARAMS';
export const GET_URL_ENCODED = 'GET_URL_ENCODED';
export const GET_URL_ID_PARAMS = 'GET_URL_ID_PARAMS';
export const POST_ID_PARAMS = 'POST_ID_PARAMS';
export const POST_RAW = 'POST_RAW';
export const POST_FORM = 'POST_FORM';
export const POST_URL_ENCODED = 'POST_URL_ENCODED';
export const POST_URL_PARAMS = 'POST_URL_PARAMS';
export const POST_URL_ENCODED_ID_PARAMS = 'POST_URL_ENCODED_ID_PARAMS';
export const MULTI_PART_POST = 'MULTI_PART';
export const PATCH = 'PATCH';
export const PATCH_ID = 'PATCH_ID';
export const PATCH_FORM = 'PATCH_FORM';
export const PATCH_FORM_ID = 'PATCH_FORM_ID';
export const PATCH_URL_ENCODED = 'PATCH_URL_ENCODED';
export const PATCH_FORM_ID_URL_ENCODED = 'PATCH_FORM_ID_URL_ENCODED';
export const MULTI_PART_ID_POST = 'MULTI_PART';
export const MULTI_PART_ID_PATCH = 'MULTI_PART_PATCH';
export const DELETE = 'DELETE';
export const DELETE_URL_PARAMS = 'DELETE_URL_PARAMS';
export const DELETE_URL_ENCODED = 'DELETE_URL_ENCODED';
export const DELETE_ID_PARAMS = 'DELETE_ID_PARAMS';

// Response
export const ResponseFail = 400;
export const ResponseSuccess = 200;
export const AuthError = 401;
