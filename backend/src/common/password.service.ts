import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

    return `scrypt:${salt}:${key.toString('hex')}`;
  }

  async verify(
    password: string,
    passwordHash?: string | null,
  ): Promise<boolean> {
    if (typeof password !== 'string' || typeof passwordHash !== 'string') {
      return false;
    }

    const [algorithm, salt, storedKey] = passwordHash.split(':');
    if (algorithm !== 'scrypt' || !salt || !storedKey) {
      return false;
    }

    if (
      !/^[a-f0-9]+$/i.test(storedKey) ||
      storedKey.length !== KEY_LENGTH * 2
    ) {
      return false;
    }

    try {
      const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
      const storedKeyBuffer = Buffer.from(storedKey, 'hex');

      return (
        key.length === storedKeyBuffer.length &&
        timingSafeEqual(key, storedKeyBuffer)
      );
    } catch {
      return false;
    }
  }
}
