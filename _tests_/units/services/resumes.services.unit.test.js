import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumesService } from '../../../src/services/resumes.service.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';
import { RESUME_STATUS } from '../../../src/constants/resume.constant.js';
import { MESSAGES } from '../../../src/constants/messages.constant.js';
import { HttpError } from '../../../src/errors/http.error.js';

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
    mockResumesRepository.create.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesService.create(
      userId,
      title,
      introduction
    );
    // THEN
    const expectedResult = mockReturn;

    expect(mockResumesRepository.create).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.create).toHaveBeenCalledWith(
      userId,
      title,
      introduction
    );
    expect(actualResult).toEqual(expectedResult);
  });

  test('readMany Method', async () => {
    // GIVEN
    const userId = 1;
    const sort = 'asc';
    const status = undefined;
    const mockReturn = dummyResumes
      .filter((resume) => resume.userId === userId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((resume) => {
        return {
          ...resume,
          userName: resume.user.name,
          userId: undefined,
          user: undefined,
        };
      });
    mockResumesRepository.readMany.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesService.readMany(userId, sort, status);
    // THEN
    const expectedResult = mockReturn;

    expect(mockResumesRepository.readMany).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.readMany).toHaveBeenCalledWith(
      userId,
      sort,
      status
    );
    expect(actualResult).toEqual(expectedResult);
  });

  test('readOne Method', async () => {
    // GIVEN
    const id = 1;
    const user = { id: 1 };
    const includeUser = true;
    let mockReturn = dummyResumes[id];
    mockReturn = {
      ...mockReturn,
      userName: mockReturn.user.name,
      userId: undefined,
      user: undefined,
    };
    mockResumesRepository.readOne.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesService.readOne(user, id);
    // THEN
    const expectedResult = mockReturn;
    expect(mockResumesRepository.readOne).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.readOne).toHaveBeenCalledWith(
      { id, userId: user.id },
      includeUser
    );
    expect(actualResult).toEqual(expectedResult);
  });

  test('readOne Method - 이력서 없는 경우', async () => {
    // GIVEN
    const id = 1;
    const user = { id: 1 };
    const includeUser = true;
    const mockReturn = null;
    mockResumesRepository.readOne.mockReturnValue(mockReturn);
    // WHEN
    try {
      await resumesService.readOne(user, id);
    } catch (error) {
      // THEN
      expect(mockResumesRepository.readOne).toHaveBeenCalledTimes(1);
      expect(mockResumesRepository.readOne).toHaveBeenCalledWith(
        { id, userId: user.id },
        includeUser
      );
      expect(error).toEqual(
        new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND)
      );
    }
  });

  test('update Method', async () => {
    // GIVEN
    const id = 1;
    const user = { id: 1 };
    const title = '슈퍼 튼튼한 개발자 스파르탄';
    const introduction =
      '아주 그냥 저는 튼튼함을 제 자랑거리로 선보일 수 있습니다...';
    const mockReadOneReturn = dummyResumes[id];
    const mockUpdateReturn = { ...dummyResumes[id], title, introduction };

    mockResumesRepository.readOne.mockReturnValue({
      ...mockReadOneReturn,
      userId: mockReadOneReturn.user.id,
    });
    mockResumesRepository.update.mockReturnValue(mockUpdateReturn);

    // WHEN
    const actualResult = await resumesService.update(
      user,
      id,
      title,
      introduction
    );

    // THEN
    const expectedResult = mockUpdateReturn;
    expect(mockResumesRepository.readOne).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.readOne).toHaveBeenCalledWith({
      id,
      userId: user.id,
    });

    expect(mockResumesRepository.update).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.update).toHaveBeenCalledWith(
      id,
      user.id,
      title,
      introduction
    );
    expect(actualResult).toEqual(expectedResult);
  });

  test('update Method-이력서가 없는 경우', async () => {
    // GIVEN
    const id = 1;
    const user = { id: 1 };
    const title = '슈퍼 튼튼한 개발자 스파르탄';
    const introduction =
      '아주 그냥 저는 튼튼함을 제 자랑거리로 선보일 수 있습니다...';
    //이력서 id가 null일때
    const mockReadOneReturn = null;
    //readOne 메소드 호출 시 null반환
    mockResumesRepository.readOne.mockReturnValue(mockReadOneReturn);
    //update 메서드 호출 시 null반환 (없어도될 것 같음)
    mockResumesRepository.update.mockReturnValue(null);

    // WHEN
    //update 메소드 호출 시 에러가 발생하는지 확인
    try {
      await resumesService.update(user, id, title, introduction);
    } catch (error) {
      // THEN
      expect(mockResumesRepository.readOne).toHaveBeenCalledTimes(1);
      expect(mockResumesRepository.readOne).toHaveBeenCalledWith({
        id,
        userId: user.id,
      });

      expect(error).toEqual(
        new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND)
      );
    }
  });

  test('delete Method', async () => {
    // GIVEN
    const id = 1;
    const user = { id: 1 };
    const mockReadOneReturn = dummyResumes[id];
    const mockdeleteReturn = dummyResumes[id].id;

    mockResumesRepository.readOne.mockReturnValue({
      ...mockReadOneReturn,
      userId: mockReadOneReturn.user.id,
    });
    mockResumesRepository.delete.mockReturnValue(mockdeleteReturn);

    // WHEN
    const actualResult = await resumesService.delete(user, id);

    // THEN
    const expectedResult = mockdeleteReturn;
    expect(mockResumesRepository.readOne).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.readOne).toHaveBeenCalledWith({
      id,
      userId: user.id,
    });

    expect(mockResumesRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockResumesRepository.delete).toHaveBeenCalledWith(id, user.id);
    expect(actualResult).toEqual(expectedResult);
  });

  test('delete Method - 이력서 없는 경우', async () => {
    // GIVEN
    const id = 1;
    const user = { id: 1 };
    const mockReadOneReturn = null;

    mockResumesRepository.readOne.mockReturnValue(mockReadOneReturn);
    mockResumesRepository.delete.mockReturnValue(null);

    // WHEN
    try {
      await resumesService.delete(user, id);
    } catch (error) {
      // THEN
      expect(mockResumesRepository.readOne).toHaveBeenCalledTimes(1);
      expect(mockResumesRepository.readOne).toHaveBeenCalledWith({
        id,
        userId: user.id,
      });

      expect(error).toEqual(
        new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND)
      );
    }
  });
});
