import { Request } from "express";
import ValidationError from "../utils/ValidationError";
import CardService from "../db/services/CardService";

export async function create(req: Request) {
  const userId = req.user!._id;
  const { boardId, listId } = req.params;
  const card = await CardService.create(boardId, listId, userId, req.body);
  return { card };
}

export async function update(req: Request) {
  const userId = req.user!._id;
  const card = await CardService.update(req.params.cardId, userId, req.body);
  return { card };
}

export async function remove(req: Request) {
  const userId = req.user!._id;
  await CardService.delete(req.params.cardId, userId);
  return { success: true };
}

export async function move(req: Request) {
  const userId = req.user!._id;
  const { listId, position } = req.body;
  if (listId == null) throw new ValidationError("listId is required.");
  const positionNum = typeof position === "number" ? position : parseInt(String(position), 10);
  if (Number.isNaN(positionNum) || positionNum < 0) throw new ValidationError("position must be a non-negative number.");
  const card = await CardService.move(req.params.cardId, userId, listId, positionNum);
  return { card };
}

export async function listByBoard(req: Request) {
  const userId = req.user!._id;
  const { boardId } = req.params;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const q = req.query.q ? String(req.query.q) : undefined;
  const result = await CardService.listByBoard(boardId, userId, { page, limit, status, q });
  return result;
}
