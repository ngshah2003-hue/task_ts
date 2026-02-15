import { Request } from "express";
import ActivityService from "../db/services/ActivityService";

export async function listByBoard(req: Request) {
  const userId = req.user!._id;
  const boardId = req.params.boardId;
  const page = req.query.page != null ? Math.max(1, parseInt(String(req.query.page), 10) || 1) : 1;
  const limit = req.query.limit != null ? Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20)) : 20;
  const result = await ActivityService.listByBoard(boardId, userId, page, limit);
  return result;
}

export async function listForUser(req: Request) {
  const userId = req.user!._id;
  const page = req.query.page != null ? Math.max(1, parseInt(String(req.query.page), 10) || 1) : 1;
  const limit = req.query.limit != null ? Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20)) : 20;
  return ActivityService.listForUser(userId, page, limit);
}
