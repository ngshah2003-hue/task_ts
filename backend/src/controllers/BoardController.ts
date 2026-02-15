import { Request } from "express";
import ValidationError from "../utils/ValidationError";
import BoardService from "../db/services/BoardService";

export async function list(req: Request) {
  const userId = req.user!._id;
  const boards = await BoardService.listByOwner(userId);
  return { boards, total: boards.length };
}

export async function getOne(req: Request) {
  const userId = req.user!._id;
  const boardId = req.params.boardId;
  const q = req.query.q != null ? String(req.query.q).trim() : undefined;
  const status = req.query.status != null ? String(req.query.status).trim() : undefined;
  const listPage = req.query.listPage != null ? Math.max(1, parseInt(String(req.query.listPage), 10) || 1) : 1;
  const listLimit = req.query.listLimit != null ? Math.max(0, parseInt(String(req.query.listLimit), 10) || 0) : 0;
  const result = await BoardService.getBoardWithListsAndCards(boardId, userId, { q, status }, { page: listPage, limit: listLimit });
  if (!result) throw new ValidationError("Board not found.");
  return result;
}

export async function create(req: Request) {
  const userId = req.user!._id;
  const board = await BoardService.create(userId, req.body);
  return { board };
}

export async function remove(req: Request) {
  const userId = req.user!._id;
  await BoardService.delete(req.params.boardId, userId);
  return { success: true };
}
