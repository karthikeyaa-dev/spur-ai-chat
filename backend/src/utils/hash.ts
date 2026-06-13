import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;


export async function getPasswordHash(password: string): Promise<string> {
  const truncatedPassword = password.slice(0, 72);
  const hashedPassword = await bcrypt.hash(
    truncatedPassword,
    SALT_ROUNDS
  );

  return hashedPassword;
}


export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(
    plainPassword.slice(0, 72),
    hashedPassword
  );
}


export function isPasswordHashed(value: string): boolean {
  return /^\$2[aby]\$/.test(value);
}
