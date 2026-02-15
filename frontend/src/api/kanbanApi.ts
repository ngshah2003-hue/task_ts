import axios, { AxiosError } from 'axios';
import { BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ error?: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = `${window.location.origin}/login`;
    }
    return Promise.reject(err);
  }
);

export interface User {
  _id: string;
  email: string;
  name?: string;
}

export interface Board {
  _id: string;
  title: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  boardId: string;
  order: number;
  cards: Card[];
}

export interface Card {
  _id: string;
  title: string;
  listId: string;
  boardId: string;
  order: number;
  dueDate?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const cardStatuses = ['todo', 'in_progress', 'done'] as const;

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const { data } = await api.post<{ user: User; token: string }>('/user/login', { email, password });
  return data;
}

export async function signup(body: { email: string; password: string; name?: string }): Promise<{ user: User; token: string }> {
  const { data } = await api.post<{ user: User; token: string }>('/user/signup', body);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/user/logout');
}

export async function getBoards(): Promise<{ boards: Board[]; total: number }> {
  const { data } = await api.get<{ boards: Board[]; total: number }>('/user/boards');
  return data;
}

export async function getBoard(
  boardId: string,
  params?: { q?: string; status?: string; listPage?: number; listLimit?: number }
): Promise<{ board: Board; lists: List[]; totalLists: number; totalPages: number }> {
  const { data } = await api.get<{ board: Board; lists: List[]; totalLists: number; totalPages: number }>(`/user/boards/${boardId}`, {
    params: params
      ? {
          q: params.q || undefined,
          status: params.status || undefined,
          listPage: params.listPage,
          listLimit: params.listLimit,
        }
      : undefined,
  });
  return data;
}

export async function createBoard(title: string): Promise<{ board: Board }> {
  const { data } = await api.post<{ board: Board }>('/user/boards', { title });
  return data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await api.delete(`/user/boards/${boardId}`);
}

export async function createList(boardId: string, title: string): Promise<{ list: List }> {
  const { data } = await api.post<{ list: List }>(`/user/boards/${boardId}/lists`, { title });
  return data;
}

export async function updateList(boardId: string, listId: string, body: { title?: string; order?: number }): Promise<{ list: List }> {
  const { data } = await api.patch<{ list: List }>(`/user/boards/${boardId}/lists/${listId}`, body);
  return data;
}

export async function deleteList(boardId: string, listId: string): Promise<void> {
  await api.delete(`/user/boards/${boardId}/lists/${listId}`);
}

export async function createCard(
  boardId: string,
  listId: string,
  body: { title: string; dueDate?: string; status?: string }
): Promise<{ card: Card }> {
  const { data } = await api.post<{ card: Card }>(`/user/boards/${boardId}/lists/${listId}/cards`, body);
  return data;
}

export async function updateCard(cardId: string, body: { title?: string; dueDate?: string | null; status?: string }): Promise<{ card: Card }> {
  const { data } = await api.patch<{ card: Card }>(`/user/cards/${cardId}`, body);
  return data;
}

export async function deleteCard(cardId: string): Promise<void> {
  await api.delete(`/user/cards/${cardId}`);
}

export async function moveCard(cardId: string, listId: string, position: number): Promise<{ card: Card }> {
  const { data } = await api.patch<{ card: Card }>(`/user/cards/${cardId}/move`, { listId, position });
  return data;
}

export async function getCards(
  boardId: string,
  params?: { page?: number; limit?: number; status?: string; q?: string }
): Promise<{ cards: Card[]; total: number; page: number; limit: number; totalPages: number }> {
  const { data } = await api.get<{ cards: Card[]; total: number; page: number; limit: number; totalPages: number }>(
    `/user/boards/${boardId}/cards`,
    { params }
  );
  return data;
}

export interface ActivityItem {
  _id: string;
  boardId: string;
  userId: { _id: string; name?: string; email?: string };
  actionType: string;
  cardTitle?: string;
  listTitle?: string;
  fromListTitle?: string;
  toListTitle?: string;
  createdAt: string;
}

export interface ActivityItemWithBoard extends Omit<ActivityItem, 'boardId'> {
  boardId?: { _id: string; title?: string };
}

export async function getBoardActivity(
  boardId: string,
  params?: { page?: number; limit?: number }
): Promise<{ activities: ActivityItem[]; total: number; totalPages: number }> {
  const { data } = await api.get<{ activities: ActivityItem[]; total: number; totalPages: number }>(
    `/user/boards/${boardId}/activity`,
    { params }
  );
  return data;
}

export async function getMyActivity(
  params?: { page?: number; limit?: number }
): Promise<{ activities: ActivityItemWithBoard[]; total: number; totalPages: number }> {
  const { data } = await api.get<{ activities: ActivityItemWithBoard[]; total: number; totalPages: number }>(
    '/user/activity',
    { params }
  );
  return data;
}

export interface BoardMemberItem {
  _id: string;
  userId: { _id: string; name?: string; email?: string };
  role: string;
}

export interface BoardInvitationItem {
  _id: string;
  email: string;
  expiresAt: string;
  invitedBy?: { name?: string; email?: string };
}

export async function inviteToBoard(boardId: string, email: string): Promise<{ token: string; expiresAt: string; message: string }> {
  const { data } = await api.post<{ token: string; expiresAt: string; message: string }>(`/user/boards/${boardId}/invite`, { email });
  return data;
}

export async function getBoardMembers(boardId: string): Promise<{ members: BoardMemberItem[]; invitations: BoardInvitationItem[] }> {
  const { data } = await api.get<{ members: BoardMemberItem[]; invitations: BoardInvitationItem[] }>(
    `/user/boards/${boardId}/members`
  );
  return data;
}

export async function acceptInvite(token: string): Promise<{ boardId: string }> {
  const { data } = await api.post<{ boardId: string }>('/user/invite/accept', { token });
  return data;
}

export async function removeBoardMember(boardId: string, userId: string): Promise<void> {
  await api.delete(`/user/boards/${boardId}/members/${userId}`);
}

export async function cancelBoardInvite(boardId: string, invitationId: string): Promise<void> {
  await api.delete(`/user/boards/${boardId}/invitations/${invitationId}`);
}

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.error) return err.response.data.error as string;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
