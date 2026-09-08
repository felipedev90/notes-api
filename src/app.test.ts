import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

beforeAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /health", () => {
  it("should return 200", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
  });
});

describe("POST /auth/register", () => {
  it("should create a new user and return 201", async () => {
    const response = await request(app).post("/auth/register").send({
      userName: "integrationtest",
      email: "integration@test.com",
      password: "senha1234",
    });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe("integration@test.com");
    expect(response.body.passwordHash).toBeUndefined();
  });

  it("should return 409 when email already exists", async () => {
    const response = await request(app).post("/auth/register").send({
      userName: "integrationtest",
      email: "integration@test.com",
      password: "senha1234",
    });

    expect(response.status).toBe(409);
  });
});
