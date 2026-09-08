import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.schema.js";
import { login, register, me, refresh, logout } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import limiter from "../../middlewares/authLimiter.js";

const router = Router();

router.post("/register", limiter, validate(registerSchema), register);
router.post("/login", limiter, validate(loginSchema), login);
router.get("/me", authenticate, me);
router.post("/logout", validate(refreshTokenSchema), logout);

router.post("/refresh", validate(refreshTokenSchema), refresh);

export default router;
