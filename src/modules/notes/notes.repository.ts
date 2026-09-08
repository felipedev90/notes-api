import { prisma } from "../../lib/prisma.js";

type CreateNoteInput = {
  title: string;
  content: string;
  userId: string;
};

type UpdateNoteInput = Partial<Omit<CreateNoteInput, "userId">> & {
  id: string;
};

export async function createNote(note: CreateNoteInput) {
  return prisma.note.create({
    data: note,
  });
}

export async function findNotesByUserId(userId: string, skip: number, take: number) {
  return prisma.note.findMany({
    where: { userId },
    skip,
    take,
  });
}

export async function findNoteById(id: string) {
  return prisma.note.findUnique({
    where: { id },
  });
}

export async function updateNote(note: UpdateNoteInput) {
  return prisma.note.update({
    where: { id: note.id },
    data: { title: note.title, content: note.content },
  });
}

export async function deleteNote(id: string) {
  return prisma.note.delete({
    where: { id },
  });
}
