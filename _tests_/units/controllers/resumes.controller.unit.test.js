import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumesController } from '../../../src/controllers/resumes.controller.js';
import { dummyUsers } from '../../dummies/users.dummy.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';
import { RESUME_STATUS } from '../../../src/constants/resume.constant.js';
import { HTTP_STATUS } from '../../../src/constants/http-status.constant.js';
import { MESSAGES } from '../../../src/constants/messages.constant.js';

const mockResumesService = {
  create: jest.fn(),
  readMany: jest.fn(),
  readOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRequest = {
  user: jest.fn(),
  body: jest.fn(),
  query: jest.fn(),
  params: jest.fn(),
};

//res.status.json 형식 목킹
const mockResponse = {
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const resumesController = new ResumesController(mockResumesService);

describe('ResumesController Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });

  test('create Method', async () => {
    // GIVEN
    const { title, introduction } = dummyResumes[0];
    const mockUser = dummyUsers[1];
    const userId = dummyUsers[1].id;
    const mockBody = { title, introduction };
    const mockReturn = {
      id: 100,
      userId,
      title,
      introduction,
      status: RESUME_STATUS.APPLY,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRequest.user = mockUser;
    mockRequest.body = mockBody;
    mockResumesService.create.mockReturnValue(mockReturn);

    // WHEN
    await resumesController.create(mockRequest, mockResponse, mockNext);

    // THEN
    const expectedJsonCalledWith = {
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.RESUMES.CREATE.SUCCEED,
      data: mockReturn,
    };

    expect(mockResumesService.create).toHaveBeenCalledTimes(1);
    expect(mockResumesService.create).toHaveBeenCalledWith(
      userId,
      title,
      introduction
    );
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedJsonCalledWith);
  });

  test('readMany Method', async () => {
    // GIVEN
    const mockUser = dummyUsers[1];
    const sort = 'asc';
    const mockQuery = { sort };
    const userId = mockUser.id;
    const mockReturn = dummyResumes
      .filter((resume) => resume.userId === userId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((resume) => {
        return {
          ...resume,
          userName: resume.user.name,
          userId: undefined,
          user: undefined,
        };
      });

    mockRequest.user = { id: mockUser.id };
    mockRequest.query = mockQuery;

    mockResumesService.readMany.mockReturnValue(mockReturn);

    // WHEN
    await resumesController.readMany(mockRequest, mockResponse, mockNext);

    // THEN
    const expectedJsonCalledWith = {
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data: mockReturn,
    };

    expect(mockResumesService.readMany).toHaveBeenCalledTimes(1);
    expect(mockResumesService.readMany).toHaveBeenCalledWith(
      { id: mockUser.id },
      sort,
      undefined
    );

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedJsonCalledWith);
  });

  test('readOne Method', async () => {
    // GIVEN
    const mockUser = dummyUsers[1];
    const id = 1;
    const userId = mockUser.id;
    const mockParams = { id };
    let mockReturn = dummyResumes[id];
    mockReturn = {
      ...mockReturn,
      userName: mockReturn.user.name,
      userId: undefined,
      user: undefined,
    };

    mockRequest.user = mockUser.id;
    mockRequest.params = mockParams;

    mockResumesService.readOne.mockReturnValue(mockReturn);

    // WHEN
    await resumesController.readOne(mockRequest, mockResponse, mockNext);

    // THEN
    const expectedJsonCalledWith = {
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data: mockReturn,
    };

    expect(mockResumesService.readOne).toHaveBeenCalledTimes(1);
    expect(mockResumesService.readOne).toHaveBeenCalledWith(id, userId);

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedJsonCalledWith);
  });

  test('update Method', async () => {
    // GIVEN
    const mockUser = dummyUsers[1];
    const id = 1;
    const userId = mockUser.id;
    const title = '슈퍼 튼튼한 개발자 스파르탄';
    const introduction =
      '아주 그냥 저는 튼튼함을 제 자랑거리로 선보일 수 있습니다...';
    const mockParams = { id };
    const mockBody = { title, introduction };
    const mockReturn = { ...dummyResumes[id], title, introduction };

    mockRequest.user = mockUser.id;
    mockRequest.params = mockParams;
    mockRequest.body = mockBody;

    mockResumesService.update.mockReturnValue(mockReturn);

    // WHEN
    await resumesController.update(mockRequest, mockResponse, mockNext);

    // THEN
    const expectedJsonCalledWith = {
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      data: mockReturn,
    };

    expect(mockResumesService.update).toHaveBeenCalledTimes(1);
    expect(mockResumesService.update).toHaveBeenCalledWith(
      id,
      userId,
      title,
      introduction
    );

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedJsonCalledWith);
  });

  test('delete Method', async () => {
    // GIVEN
    const mockUser = dummyUsers[1];
    const userId = mockUser.id;
    const id = 1;
    const mockParams = { id };
    const mockReturn = mockUser.id;

    mockRequest.user = mockUser.id;
    mockRequest.params = mockParams;

    mockResumesService.delete.mockReturnValue(mockReturn);

    // WHEN
    await resumesController.delete(mockRequest, mockResponse, mockNext);

    // THEN
    const expectedJsonCalledWith = {
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: mockReturn,
    };

    expect(mockResumesService.delete).toHaveBeenCalledTimes(1);
    expect(mockResumesService.delete).toHaveBeenCalledWith(id, userId);

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedJsonCalledWith);
  });
});
