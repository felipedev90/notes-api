import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { createNoteSchema, updateNoteSchema } from "./notes.schema.js";
import { createNote, getNotes, getNote, updateNote, deleteNote } from "./notes.controller.js";

const router = Router();

router.post("/", authenticate, validate(createNoteSchema), createNote);
router.get("/", authenticate, getNotes);
router.get("/:id", authenticate, getNote);
router.patch("/:id", authenticate, validate(updateNoteSchema), updateNote);
router.delete("/:id", authenticate, deleteNote);

export default router;
