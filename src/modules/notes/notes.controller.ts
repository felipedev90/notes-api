import type { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync.js";
import { ValidationError } from "../../errors/AppError.js";
import {
  createUserNote,
  getUserNotes,
  getNoteById,
  updateUserNote,
  deleteUserNote,
} from "./notes.service.js";

export const createNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const note = await createUserNote({ ...req.body, userId: req.userId });

  res.status(201).json(note);
  return;
});

export const getNotes = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const notes = await getUserNotes(req.userId);

  res.status(200).json(notes);
  return;
});

export const getNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const noteId = req.params.id as string;

  if (!noteId) {
    throw new ValidationError("Note id is required");
  }

  const note = await getNoteById(req.userId, noteId);

  res.status(200).json(note);
  return;
});

export const updateNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const noteId = req.params.id as string;

  if (!noteId) {
    throw new ValidationError("Note id is required");
  }

  const updatedNote = await updateUserNote(req.userId, noteId, req.body);

  res.status(200).json(updatedNote);
});

export const deleteNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const noteId = req.params.id as string;

  if (!noteId) {
    throw new ValidationError("Note id is required");
  }

  await deleteUserNote(req.userId, noteId);
  res.status(204).send();
});
