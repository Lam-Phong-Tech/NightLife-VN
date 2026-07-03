import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('verifies a password against a generated hash', async () => {
    const hash = await service.hash('Str0ngPass!');

    await expect(service.verify('Str0ngPass!', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await service.hash('Str0ngPass!');

    await expect(service.verify("' OR 1=1 --", hash)).resolves.toBe(false);
  });

  it.each([
    undefined,
    null,
    '',
    'legacy-password-hash',
    'bcrypt:salt:key',
    'scrypt:salt:not-hex',
    'scrypt:salt:abcd',
  ])('fails closed for malformed password hash %p', async (hash) => {
    await expect(
      service.verify('<script>alert(1)</script>', hash),
    ).resolves.toBe(false);
  });
});
