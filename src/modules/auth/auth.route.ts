import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { registerSchema } from "./auth.schema.js";
import { register } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

export default router;
