import { validate } from 'class-validator';
import { SignUpDto } from './signup.dto';

describe('SignUpDto', () => {
  const createDto = (values: Record<string, unknown>) =>
    Object.assign(new SignUpDto(), values);

  it('accepts valid sign-up data', async () => {
    const errors = await validate(
      createDto({
        email: 'person@example.com',
        name: 'Person',
        password: 'password123',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid email, too-short name, and too-short password', async () => {
    const errors = await validate(
      createDto({ email: 'invalid', name: 'P', password: 'short' }),
    );

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'name', 'password']),
    );
    expect(errors).toHaveLength(3);
  });

  it('rejects missing required fields', async () => {
    const errors = await validate(createDto({}));

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'name', 'password']),
    );
  });

  it('rejects values with invalid types', async () => {
    const errors = await validate(
      createDto({ email: 123, name: 7, password: false }),
    );

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'name', 'password']),
    );
    expect(errors.find(({ property }) => property === 'name')?.constraints)
      .toHaveProperty('isString');
    expect(errors.find(({ property }) => property === 'password')?.constraints)
      .toHaveProperty('isString');
  });

  it('rejects values exceeding the maximum name or password length', async () => {
    const errors = await validate(
      createDto({
        email: 'person@example.com',
        name: 'n'.repeat(101),
        password: 'p'.repeat(101),
      }),
    );

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['name', 'password']),
    );
  });
});
