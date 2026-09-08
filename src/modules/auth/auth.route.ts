import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.schema.js";
import { login, register, me, refresh } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

router.post("/refresh", validate(refreshTokenSchema), refresh);

export default router;
