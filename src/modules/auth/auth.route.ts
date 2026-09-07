import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { login, register, me } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;
