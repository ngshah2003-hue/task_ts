import { Request } from "express";
import ListService from "../db/services/ListService";

export async function create(req: Request) {
  const userId = req.user!._id;
  const { boardId } = req.params;
  const list = await ListService.create(boardId, userId, req.body);
  return { list };
}

export async function update(req: Request) {
  const userId = req.user!._id;
  const { boardId, listId } = req.params;
  const list = await ListService.update(boardId, listId, userId, req.body);
  return { list };
}

export async function remove(req: Request) {
  const userId = req.user!._id;
  const { boardId, listId } = req.params;
  await ListService.delete(boardId, listId, userId);
  return { success: true };
}
