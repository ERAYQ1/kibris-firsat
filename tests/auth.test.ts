import { describe, expect, it, beforeEach } from "vitest";
import {
  register,
  login,
  getSessionUser,
  destroySession,
  requireUser,
  requireAdmin,
} from "@/server/auth";
import { AppError } from "@/lib/errors";
import { createTestDb, VALID_PASSWORD } from "./helpers";

describe("auth", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
  });

  describe("register", () => {
    it("geçerli veriyle kullanıcı oluşturur ve session token döner", async () => {
      const { user, token } = await register(
        { email: "Eray@Test.local", password: VALID_PASSWORD, displayName: "Eray" },
        db
      );
      expect(user.email).toBe("eray@test.local");
      expect(user.displayName).toBe("Eray");
      expect(token).toBeTruthy();
      expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it("aynı e-posta ile ikinci kayıt engellenir", async () => {
      await register({ email: "a@test.local", password: VALID_PASSWORD, displayName: "AA" }, db);
      await expect(
        register({ email: "a@test.local", password: "Farkli123456", displayName: "BB" }, db)
      ).rejects.toMatchObject({ status: 409 });
    });

    it.each([
      [{ email: "geçersiz", password: VALID_PASSWORD, displayName: "XX" }, "email"],
      [{ email: "ok@test.local", password: "kisa1", displayName: "XX" }, "şifre"],
      [{ email: "ok2@test.local", password: "sadeceharfler", displayName: "XX" }, "rakam"],
      [{ email: "ok3@test.local", password: VALID_PASSWORD, displayName: "" }, "isim"],
      [null, "null body"],
      [{}, "eksik alanlar"],
      [
        { email: "extra@test.local", password: VALID_PASSWORD, displayName: "X", role: "admin" },
        "mass assignment",
      ],
    ] as unknown as Array<[unknown]>)("geçersiz girdi reddedilir", async (input) => {
      await expect(register(input, db)).rejects.toBeTruthy();
    });

    it("client role gönderimi yoksayılır (mass assignment)", async () => {
      process.env.ADMIN_EMAILS = "";
      const { user } = await register(
        {
          email: "role@test.local",
          password: VALID_PASSWORD,
          displayName: "Role",
          role: "admin",
        },
        db
      );
      expect(user.role).toBe("user");
    });

    it("ADMIN_EMAILS içindeki e-posta admin olur", async () => {
      process.env.ADMIN_EMAILS = "boss@test.local";
      const { user } = await register(
        { email: "boss@test.local", password: VALID_PASSWORD, displayName: "Boss" },
        db
      );
      expect(user.role).toBe("admin");
      delete process.env.ADMIN_EMAILS;
    });
  });

  describe("login", () => {
    it("doğru bilgilerle giriş yapılır", async () => {
      await register({ email: "l@test.local", password: VALID_PASSWORD, displayName: "LL" }, db);
      const { user, token } = await login(
        { email: "l@test.local", password: VALID_PASSWORD },
        db
      );
      expect(user.email).toBe("l@test.local");
      expect(token).toBeTruthy();
    });

    it("yanlış şifre reddedilir ve genel hata verir", async () => {
      await register({ email: "w@test.local", password: VALID_PASSWORD, displayName: "WW" }, db);
      await expect(
        login({ email: "w@test.local", password: "YanlisSifre99" }, db)
      ).rejects.toMatchObject({
        status: 401,
        code: "auth_failed",
      });
    });

    it("olmayan kullanıcı için de aynı hata döner (user enumeration önleme)", async () => {
      await register({ email: "x@test.local", password: VALID_PASSWORD, displayName: "XX" }, db);
      let missingError: unknown;
      try {
        await login({ email: "yok@test.local", password: "YanlisSifre99" }, db);
      } catch (e) {
        missingError = e;
      }
      await expect(
        login({ email: "x@test.local", password: "YanlisSifre99" }, db)
      ).rejects.toThrow();
      expect(missingError).toBeInstanceOf(AppError);
    });
  });

  describe("sessions", () => {
    it("token ile kullanıcı çözümlenir", async () => {
      const { token } = await register(
        { email: "s@test.local", password: VALID_PASSWORD, displayName: "SS" },
        db
      );
      const user = getSessionUser(token, db);
      expect(user?.email).toBe("s@test.local");
    });

    it("geçersiz token null döner", () => {
      expect(getSessionUser("sahte-token", db)).toBeNull();
      expect(getSessionUser(undefined, db)).toBeNull();
    });

    it("logout sonrası token geçersiz olur", async () => {
      const { token } = await register(
        { email: "o@test.local", password: VALID_PASSWORD, displayName: "OO" },
        db
      );
      destroySession(token, db);
      expect(getSessionUser(token, db)).toBeNull();
    });
  });

  describe("authorization helpers", () => {
    it("requireUser anoniste fırlatır", () => {
      expect(() => requireUser(null, db)).toThrow(AppError);
    });

    it("requireUser geçerli token ile kullanıcı döner", async () => {
      const { token } = await register(
        { email: "ru@test.local", password: VALID_PASSWORD, displayName: "RU" },
        db
      );
      expect(requireUser(token, db).email).toBe("ru@test.local");
    });

    it("requireAdmin normal kullanıcıyı reddeder", async () => {
      process.env.ADMIN_EMAILS = "";
      const { token, user } = await register(
        { email: "nu@test.local", password: VALID_PASSWORD, displayName: "NU" },
        db
      );
      expect(user.role).toBe("user");
      expect(() => requireAdmin(token, db)).toThrow(/yetkiniz/);
    });

    it("requireAdmin admin tokenını kabul eder", async () => {
      process.env.ADMIN_EMAILS = "adm@test.local";
      const { token } = await register(
        { email: "adm@test.local", password: VALID_PASSWORD, displayName: "AD" },
        db
      );
      delete process.env.ADMIN_EMAILS;
      expect(requireAdmin(token, db).role).toBe("admin");
    });
  });
});
