import { validate } from 'class-validator';
import { PromptDto } from './prompt.dto';

describe('PromptDto', () => {
  const createDto = (values: Record<string, unknown>) =>
    Object.assign(new PromptDto(), values);

  it('accepts question and answer key strings', async () => {
    const errors = await validate(
      createDto({
        questions: 'What is 2 + 2?',
        answerKeys: '4',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('accepts an empty answer key string', async () => {
    const errors = await validate(
      createDto({
        questions: 'What is 2 + 2?',
        answerKeys: '',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects missing required fields', async () => {
    const errors = await validate(createDto({}));

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['questions', 'answerKeys']),
    );
    expect(errors).toHaveLength(2);
  });

  it('rejects non-string field values', async () => {
    const errors = await validate(
      createDto({ questions: 42, answerKeys: ['answer'] }),
    );

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['questions', 'answerKeys']),
    );
    expect(
      errors.find(({ property }) => property === 'questions')?.constraints,
    ).toHaveProperty('isString');
    expect(
      errors.find(({ property }) => property === 'answerKeys')?.constraints,
    ).toHaveProperty('isString');
  });
});
