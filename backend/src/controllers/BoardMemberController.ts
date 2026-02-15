import { Request } from "express";
import ValidationError from "../utils/ValidationError";
import BoardService from "../db/services/BoardService";

export async function invite(req: Request) {
  const userId = req.user!._id;
  const boardId = req.params.boardId;
  const email = req.body?.email;
  if (!email || typeof email !== "string") throw new ValidationError("Email is required.");
  const result = await BoardService.invite(boardId, email, userId);
  return { ...result, message: "Invitation sent." };
}

export async function listMembers(req: Request) {
  const userId = req.user!._id;
  const boardId = req.params.boardId;
  return BoardService.listMembersAndInvites(boardId, userId);
}

export async function acceptInvite(req: Request) {
  const userId = req.user!._id;
  const token = req.body?.token ?? req.query?.token;
  if (!token || typeof token !== "string") throw new ValidationError("Token is required.");
  return BoardService.acceptInvite(token, userId);
}

export async function removeMember(req: Request) {
  const byUserId = req.user!._id;
  const boardId = req.params.boardId;
  const memberUserId = req.params.userId;
  await BoardService.removeMember(boardId, memberUserId, byUserId);
  return { success: true };
}

export async function cancelInvite(req: Request) {
  const byUserId = req.user!._id;
  const boardId = req.params.boardId;
  const invitationId = req.params.invitationId;
  await BoardService.cancelInvite(boardId, invitationId, byUserId);
  return { success: true };
}
