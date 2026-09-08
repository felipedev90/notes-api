import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createUserNote,
  getUserNotes,
  getNoteById,
  updateUserNote,
  deleteUserNote,
} from "./notes.service.js";
import {
  createNote,
  findNotesByUserId,
  findNoteById,
  updateNote,
  deleteNote,
} from "./notes.repository.js";
import { NotFoundError, ForbiddenError } from "../../errors/AppError.js";

vi.mock("./notes.repository.js");

const fakeNote = {
  id: "note-1",
  title: "test",
  content: "testing",
  userId: "owner-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("notes.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUserNote", () => {
    it("should create and return the note", async () => {
      vi.mocked(createNote).mockResolvedValue(fakeNote);

      const result = await createUserNote({
        title: "test",
        content: "testing",
        userId: "owner-id",
      });

      expect(createNote).toHaveBeenCalledWith({
        title: "test",
        content: "testing",
        userId: "owner-id",
      });
      expect(result).toEqual(fakeNote);
    });
  });

  describe("getUserNotes", () => {
    it("should return the list of notes for the user", async () => {
      vi.mocked(findNotesByUserId).mockResolvedValue([fakeNote]);

      const result = await getUserNotes("owner-id", 1, 10);

      expect(findNotesByUserId).toHaveBeenCalledWith("owner-id", 0, 10);
      expect(result).toEqual([fakeNote]);
    });
  });

  describe("getNoteById", () => {
    it("should throw NotFoundError when note does not exist", async () => {
      vi.mocked(findNoteById).mockResolvedValue(null);

      await expect(getNoteById("owner-id", "note-1")).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when note belongs to another user", async () => {
      vi.mocked(findNoteById).mockResolvedValue(fakeNote);

      await expect(getNoteById("other-user-id", "note-1")).rejects.toThrow(ForbiddenError);
    });

    it("should return the note when user is the owner", async () => {
      vi.mocked(findNoteById).mockResolvedValue(fakeNote);

      const result = await getNoteById("owner-id", "note-1");

      expect(result).toEqual(fakeNote);
    });
  });

  describe("updateUserNote", () => {
    it("should throw NotFoundError when note does not exist", async () => {
      vi.mocked(findNoteById).mockResolvedValue(null);

      await expect(updateUserNote("owner-id", "note-1", { title: "new title" })).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ForbiddenError when note belongs to another user", async () => {
      vi.mocked(findNoteById).mockResolvedValue(fakeNote);

      await expect(
        updateUserNote("other-user-id", "note-1", { title: "new title" })
      ).rejects.toThrow(ForbiddenError);
    });

    it("should update and return the note when user is the owner", async () => {
      vi.mocked(findNoteById).mockResolvedValue(fakeNote);
      vi.mocked(updateNote).mockResolvedValue({ ...fakeNote, title: "new title" });

      const result = await updateUserNote("owner-id", "note-1", { title: "new title" });

      expect(updateNote).toHaveBeenCalledWith({ id: "note-1", title: "new title" });
      expect(result.title).toBe("new title");
    });
  });

  describe("deleteUserNote", () => {
    it("should throw NotFoundError when note does not exist", async () => {
      vi.mocked(findNoteById).mockResolvedValue(null);

      await expect(deleteUserNote("owner-id", "note-1")).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when note belongs to another user", async () => {
      vi.mocked(findNoteById).mockResolvedValue(fakeNote);

      await expect(deleteUserNote("other-user-id", "note-1")).rejects.toThrow(ForbiddenError);
    });

    it("should delete the note when user is the owner", async () => {
      vi.mocked(findNoteById).mockResolvedValue(fakeNote);
      vi.mocked(deleteNote).mockResolvedValue(fakeNote);

      await deleteUserNote("owner-id", "note-1");

      expect(deleteNote).toHaveBeenCalledWith("note-1");
    });
  });
});
