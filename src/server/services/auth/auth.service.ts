import bcrypt from "bcryptjs";
import { UserRepository } from "@/server/repositories/user/user.repository";
import type { AuthTokenPayload } from "@/lib/auth-config";

const userRepo = new UserRepository();

/**
 * Auth business logic (no SSO).
 *
 * Credentials are verified against the `users` table with bcrypt — run
 * `npm run db:migrate && npm run db:seed` to create the demo admin
 * (admin@demo.com / password, both overridable via AUTH_DEMO_*).
 *
 * To add registration or SSO later, keep this class as the only place that
 * knows how a login becomes a token payload.
 */
export class AuthService {
  /** Verify credentials. Returns the token payload on success, null on failure. */
  static async authenticate(
    email: string,
    password: string,
  ): Promise<AuthTokenPayload | null> {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL belum diisi — jalankan migrasi & seed sebelum login",
      );
    }

    const user = await userRepo.findByEmail(email.trim().toLowerCase());
    if (!user || !user.isActive || !user.password) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    const role = await userRepo.findById(user.id, { include: { role: true } });
    return AuthService.toPayload({
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      roleCode: (role as { role?: { code?: string } } | null)?.role?.code ?? "",
    });
  }

  /** Resolve a user by id — used by /api/auth/refresh to re-issue an access token. */
  static async getById(id: string): Promise<AuthTokenPayload | null> {
    const user = await userRepo.findById(id, { include: { role: true } });
    if (!user || user.deletedAt || !user.isActive) return null;

    return AuthService.toPayload({
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      roleCode: (user as { role?: { code?: string } }).role?.code ?? "",
    });
  }

  private static toPayload(input: {
    id: string;
    email: string;
    fullname: string;
    roleCode: string;
  }): AuthTokenPayload {
    return {
      sub: input.id,
      email: input.email,
      fullname: input.fullname,
      role: input.roleCode,
    };
  }
}
