import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // janela de 15 minutos
  max: 5, // no máximo 5 requisições nessa janela
  message: { status: 429, message: "Too many requests, please try again later." },
});

export default limiter;
