import { NotFoundError, ForbiddenError } from "../../errors/AppError.js";
import {
  createNote,
  findNotesByUserId,
  findNoteById,
  updateNote,
  deleteNote,
} from "./notes.repository.js";

type CreateUserNoteInput = {
  title: string;
  content: string;
  userId: string;
};

type UpdateUserNote = Partial<Omit<CreateUserNoteInput, "userId">>;

export async function createUserNote(note: CreateUserNoteInput) {
  return createNote(note);
}

export async function getUserNotes(userId: string, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const note = await findNotesByUserId(userId, skip, pageSize);

  return note;
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await findNoteById(noteId);

  if (!note) {
    throw new NotFoundError("Note not found.");
  }

  if (note.userId !== userId) {
    throw new ForbiddenError("You cannot get this note.");
  }

  return note;
}

export async function updateUserNote(userId: string, noteId: string, data: UpdateUserNote) {
  const note = await findNoteById(noteId);

  if (!note) {
    throw new NotFoundError("Note not found.");
  }

  if (note.userId !== userId) {
    throw new ForbiddenError("You cannot get this note.");
  }

  return updateNote({ id: noteId, ...data });
}

export async function deleteUserNote(userId: string, noteId: string) {
  const note = await findNoteById(noteId);

  if (!note) {
    throw new NotFoundError("Note not found.");
  }

  if (note.userId !== userId) {
    throw new ForbiddenError("You cannot delete this note.");
  }

  return deleteNote(noteId);
}
