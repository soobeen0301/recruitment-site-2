import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// TODO: template 이라고 되어 있는 부분을 다 올바르게 수정한 후 사용해야 합니다.

const mockTemplateRepository = {
  create: jest.fn(),
  readMany: jest.fn(),
  readOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const templateService = new TemplateService(mockTemplateRepository);

describe('TemplateService Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('create Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('readMany Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('readOne Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('readOne Method - 이력서 없는 경우', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('update Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });

  test('delete Method', async () => {
    // GIVEN
    // WHEN
    // THEN
  });
});
