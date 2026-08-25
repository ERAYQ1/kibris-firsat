import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, makeUser, makeAdmin } from "./helpers";
import {
  getUserProfile,
  updateUserProfile,
  adminGetStats,
  adminListUsers,
  adminToggleBanUser,
} from "@/server/users";

describe("users & admin moderation service", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("kullanıcı profilini getirir ve günceller", async () => {
    const user = await makeUser(db);
    const profile = await getUserProfile(user.id, db);
    expect(profile.user.email).toBe(user.email);
    expect(profile.user.displayName).toBe(user.displayName);

    updateUserProfile(user.id, { displayName: "Yeni İsim", bio: "Fırsat avcısı" }, db);
    const updated = await getUserProfile(user.id, db);
    expect(updated.user.displayName).toBe("Yeni İsim");
    expect(updated.user.bio).toBe("Fırsat avcısı");
  });

  it("admin istatistiklerini ve kullanıcı listesini getirir", async () => {
    const admin = await makeAdmin(db);
    await makeUser(db);

    const stats = adminGetStats(admin, db);
    expect(stats.totalUsers).toBeGreaterThanOrEqual(2);

    const list = adminListUsers(admin, db);
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it("admin kullanıcıyı banlar ve engelini kaldırır", async () => {
    const admin = await makeAdmin(db);
    const regularUser = await makeUser(db);

    // 1. Banla
    const banRes = adminToggleBanUser(regularUser.id, admin, db);
    expect(banRes.isBanned).toBe(true);

    // 2. Unban
    const unbanRes = adminToggleBanUser(regularUser.id, admin, db);
    expect(unbanRes.isBanned).toBe(false);
  });

  it("yetkisiz kullanıcı admin fonksiyonlarına erişemez (403)", async () => {
    const regularUser = await makeUser(db);
    expect(() => adminGetStats(regularUser, db)).toThrow();
    expect(() => adminListUsers(regularUser, db)).toThrow();
    expect(() => adminToggleBanUser(1, regularUser, db)).toThrow();
  });
});
