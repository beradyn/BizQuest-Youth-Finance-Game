import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt, lt } from "drizzle-orm";
import { Router, type NextFunction, type Request, type Response } from "express";
import { db, bizQuestAccounts, bizQuestSessions } from "@workspace/db";

const router = Router();
const PASSWORD_BYTES = 64;
const SCRYPT_COST = 16_384;
const SESSION_DAYS = 14;
const GENDERS = ["girl", "boy", "nonbinary", "prefer-not-to-say"] as const;
const scryptAsync = promisify(scrypt);

type Gender = (typeof GENDERS)[number];
type PublicAccount = { id: string; username: string; gender: Gender };
type AuthenticatedRequest = Request & { bizQuestAccount?: PublicAccount };

function publicAccount(account: {
  id: string;
  username: string;
  gender: string;
}): PublicAccount {
  return {
    id: account.id,
    username: account.username,
    gender: account.gender as Gender,
  };
}

function usernameFrom(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return /^[a-z0-9_]{3,18}$/.test(username) ? username : null;
}

function passwordFrom(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 8 || value.length > 72) {
    return null;
  }
  return value;
}

function genderFrom(value: unknown): Gender | null {
  return typeof value === "string" && GENDERS.includes(value as Gender)
    ? (value as Gender)
    : null;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, PASSWORD_BYTES, {
    N: SCRYPT_COST,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;
  return `scrypt$${SCRYPT_COST}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, cost, saltText, expectedText] = stored.split("$");
  if (algorithm !== "scrypt" || Number(cost) !== SCRYPT_COST || !saltText || !expectedText) {
    return false;
  }
  const salt = Buffer.from(saltText, "base64url");
  const expected = Buffer.from(expectedText, "base64url");
  if (salt.length !== 16 || expected.length !== PASSWORD_BYTES) return false;
  const actual = (await scryptAsync(password, salt, PASSWORD_BYTES, {
    N: SCRYPT_COST,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;
  return timingSafeEqual(actual, expected);
}

function digestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(account: PublicAccount) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(bizQuestSessions).where(lt(bizQuestSessions.expiresAt, new Date()));
  await db.insert(bizQuestSessions).values({
    accountId: account.id,
    tokenHash: digestToken(token),
    expiresAt,
  });
  return { token, user: account };
}

function bearerToken(request: Request): string | null {
  const header = request.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length >= 40 && token.length <= 128 ? token : null;
}

async function requireAccount(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = bearerToken(request);
  if (!token) {
    response.status(401).json({ message: "Please sign in again." });
    return;
  }

  const [row] = await db
    .select({
      id: bizQuestAccounts.id,
      username: bizQuestAccounts.username,
      gender: bizQuestAccounts.gender,
    })
    .from(bizQuestSessions)
    .innerJoin(
      bizQuestAccounts,
      eq(bizQuestSessions.accountId, bizQuestAccounts.id),
    )
    .where(
      and(
        eq(bizQuestSessions.tokenHash, digestToken(token)),
        gt(bizQuestSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    response.status(401).json({ message: "Please sign in again." });
    return;
  }

  (request as AuthenticatedRequest).bizQuestAccount = publicAccount(row);
  next();
}

router.post("/bizquest/auth/register", async (request, response) => {
  const input = request.body as Record<string, unknown> | null;
  const username = usernameFrom(input?.username);
  const password = passwordFrom(input?.password);
  const gender = genderFrom(input?.gender);

  if (!username || !password || !gender) {
    response.status(400).json({
      message:
        "Use a nickname with 3–18 letters, numbers, or underscores, a password with at least 8 characters, and choose an avatar style.",
    });
    return;
  }

  const passwordHash = await hashPassword(password);
  try {
    const [created] = await db
      .insert(bizQuestAccounts)
      .values({ username, passwordHash, gender })
      .returning({
        id: bizQuestAccounts.id,
        username: bizQuestAccounts.username,
        gender: bizQuestAccounts.gender,
      });
    response.status(201).json(await createSession(publicAccount(created)));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      response.status(409).json({ message: "That username is already taken." });
      return;
    }
    throw error;
  }
});

router.post("/bizquest/auth/login", async (request, response) => {
  const input = request.body as Record<string, unknown> | null;
  const username = usernameFrom(input?.username);
  const password = passwordFrom(input?.password);
  if (!username || !password) {
    response.status(401).json({ message: "Username or password is incorrect." });
    return;
  }

  const [account] = await db
    .select()
    .from(bizQuestAccounts)
    .where(eq(bizQuestAccounts.username, username))
    .limit(1);

  const valid = account
    ? await verifyPassword(password, account.passwordHash)
    : false;
  if (!account || !valid) {
    response.status(401).json({ message: "Username or password is incorrect." });
    return;
  }

  response.json(await createSession(publicAccount(account)));
});

router.get("/bizquest/auth/me", requireAccount, (request, response) => {
  response.json(
    (request as AuthenticatedRequest).bizQuestAccount,
  );
});

router.post("/bizquest/auth/logout", requireAccount, async (request, response) => {
  const token = bearerToken(request);
  if (token) {
    await db
      .delete(bizQuestSessions)
      .where(eq(bizQuestSessions.tokenHash, digestToken(token)));
  }
  response.status(204).end();
});

export default router;
