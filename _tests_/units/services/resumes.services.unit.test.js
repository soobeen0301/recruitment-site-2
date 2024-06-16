import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumesService } from '../../../src/services/resumes.service.js';

const mockResumesRepository = {
  create: jest.fn(),
  readMany: jest.fn(),
  readOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const resumesService = new ResumesService(mockResumesRepository);

describe('ResumesService Unit Test', () => {
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
