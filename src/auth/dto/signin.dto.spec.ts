import { validate } from 'class-validator';
import { SignInDto } from './signin.dto';

describe('SignInDto', () => {
  const createDto = (values: Record<string, unknown>) =>
    Object.assign(new SignInDto(), values);

  it('accepts valid sign-in data', async () => {
    const errors = await validate(
      createDto({ email: 'person@example.com', password: 'password123' }),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email and a password shorter than eight characters', async () => {
    const errors = await validate(
      createDto({ email: 'invalid', password: 'short' }),
    );

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
    expect(errors).toHaveLength(2);
  });

  it('rejects missing required fields', async () => {
    const errors = await validate(createDto({}));

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
  });

  it('rejects values with invalid types', async () => {
    const errors = await validate(createDto({ email: 123, password: false }));

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
    expect(errors.find(({ property }) => property === 'password')?.constraints)
      .toHaveProperty('isString');
  });

  it('rejects passwords exceeding the maximum length', async () => {
    const errors = await validate(
      createDto({ email: 'person@example.com', password: 'p'.repeat(101) }),
    );

    expect(errors.map(({ property }) => property)).toContain('password');
  });
});
