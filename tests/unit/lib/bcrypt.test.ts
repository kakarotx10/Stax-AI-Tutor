import { hashPassword, comparePassword } from '@/src/lib/bcrypt';

describe('bcrypt helpers', () => {
  it('hashes password and verifies match', async () => {
    const plain = 'P@ssw0rd123';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);
    expect(await comparePassword(plain, hash)).toBe(true);
  });

  it('rejects wrong password', async () => {
    const hash = await hashPassword('correct');
    expect(await comparePassword('wrong', hash)).toBe(false);
  });
});
