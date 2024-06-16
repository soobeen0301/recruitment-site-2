import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { ResumesRepository } from '../../../src/repositories/resumes.repository.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';
import { RESUME_STATUS } from '../../../src/constants/resume.constant.js';
import { USER_ROLE } from '../../../src/constants/user.constant.js';

const mockPrisma = {
  resume: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const resumesRepository = new ResumesRepository(mockPrisma);

describe('ResumesRepository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다
  });

  test('create Method', async () => {
    // GIVEN : 주어진 조건 (값을 더미파일에서 가져와서 prisma에서 가짜로 저장)
    const { userId, title, introduction } = dummyResumes[0];
    const mockReturn = {
      id: 100,
      userId,
      title,
      introduction,
      status: RESUME_STATUS.APPLY,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.resume.create.mockReturnValue(mockReturn);
    // WHEN : 메소드를 호출하면, 이러한 상황이 주어졌을 때
    const actualResult = await resumesRepository.create(
      userId,
      title,
      introduction
    );
    // THEN : 이러한 값이 나와야한다. (기대하는 결과)
    const expectedResult = mockReturn;

    expect(mockPrisma.resume.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resume.create).toBeCalledWith({
      data: {
        userId,
        title,
        introduction,
      },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('readMany Method', async () => {
    // GIVEN
    const user = { id: 1, role: USER_ROLE.APPLICANT };
    const sort = 'asc';
    const status = undefined;

    const mockReturn = dummyResumes
      .filter((resume) => resume.userId === user.id)
      .sort((a, b) => a.createdAt - b.createdAt);

    mockPrisma.resume.findMany.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.readMany(user, sort, status);

    // THEN
    const expectedResult = mockReturn.map((resume) => {
      return {
        id: resume.id,
        userName: resume.user.name,
        title: resume.title,
        introduction: resume.introduction,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
    });

    expect(mockPrisma.resume.findMany).toHaveBeenCalledTimes(1);

    const whereCondition = { userId: user.id };

    expect(mockPrisma.resume.findMany).toBeCalledWith({
      where: whereCondition,
      orderBy: { createdAt: sort },
      include: {
        user: true,
      },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('readOne Method', async () => {
    // GIVEN
    const id = 1;
    const includeUser = true;
    const mockReturn = dummyResumes.find((resume) => resume.id === id);

    mockPrisma.resume.findUnique.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.readOne({ id }, includeUser);

    // THEN
    const expectedResult =
      includeUser && mockReturn
        ? {
            id: mockReturn.id,
            userName: mockReturn.user.name,
            title: mockReturn.title,
            introduction: mockReturn.introduction,
            status: mockReturn.status,
            createdAt: mockReturn.createdAt,
            updatedAt: mockReturn.updatedAt,
          }
        : mockReturn;

    expect(mockPrisma.resume.findUnique).toHaveBeenCalledTimes(1);

    const whereCondition = { id };

    expect(mockPrisma.resume.findUnique).toBeCalledWith({
      where: whereCondition,
      include: { user: includeUser },
    });
    expect(actualResult).toEqual(expectedResult);
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
