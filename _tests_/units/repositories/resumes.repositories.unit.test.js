import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { ResumesRepository } from '../../../src/repositories/resumes.repository.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';
import { RESUME_STATUS } from '../../../src/constants/resume.constant.js';
import { USER_ROLE } from '../../../src/constants/user.constant.js';

//prisma인 척 하는 !
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
    //코드가 정상작동하는지 확인 (원래 정상작동한다는 가정하에)
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
    //몇번 호출이 됐냐 (1)
    expect(mockPrisma.resume.create).toHaveBeenCalledTimes(1);
    //호출이 어떤 파라미터들로 호출이 됐냐
    expect(mockPrisma.resume.create).toHaveBeenCalledWith({
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
    //기존에 있는 정보를 조회해야하니 id 1 가져오기
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
        ...resume,
        userName: resume.user.name,
        userId: undefined,
        user: undefined,
      };
    });

    expect(mockPrisma.resume.findMany).toHaveBeenCalledTimes(1);

    const whereCondition = { userId: user.id };

    expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
      where: whereCondition,
      orderBy: { createdAt: sort },
      include: {
        user: true,
      },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('readOne Method - includeAuth : true', async () => {
    // GIVEN
    const id = '1';
    const userId = 1;
    const includeUser = true;
    const mockReturn = dummyResumes[+id];
    const whereCondition = { id };

    mockPrisma.resume.findUnique.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.readOne(
      whereCondition,
      includeUser
    );

    // THEN
    const expectedResult = {
      ...mockReturn,
      userName: mockReturn.user.name,
      userId: undefined,
      user: undefined,
    };

    expect(mockPrisma.resume.findUnique).toHaveBeenCalledTimes(1);

    expect(mockPrisma.resume.findUnique).toHaveBeenCalledWith({
      where: whereCondition,
      include: { user: includeUser },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('readOne Method - includeAuth : false', async () => {
    // GIVEN
    const id = '1';
    const userId = 1;
    const includeUser = false;
    const mockReturn = dummyResumes[+id];
    const whereCondition = { id };

    mockPrisma.resume.findUnique.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.readOne(
      whereCondition,
      includeUser
    );

    // THEN
    const expectedResult = mockReturn;

    expect(mockPrisma.resume.findUnique).toHaveBeenCalledTimes(1);

    expect(mockPrisma.resume.findUnique).toHaveBeenCalledWith({
      where: whereCondition,
      include: { user: includeUser },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('update Method', async () => {
    // GIVEN
    const id = '1';
    const userId = 1;
    const title = '슈퍼 튼튼한 개발자 스파르탄';
    const introduction =
      '아주 그냥 저는 튼튼함을 제 자랑거리로 선보일 수 있습니다. 어떤 도전이든 두려워하지 않고, 견고한 코드와 해결책을 제시할 자신이 있습니다. 복잡한 문제에 직면했을 때에도 냉정하게 분석하고 빠르게 대응하는 능력을 갖췄습니다. 또한, 팀원들과의 원활한 커뮤니케이션을 통해 프로젝트의 성공을 이끌어내는데 기여할 것입니다. 최고의 결과물을 위해 끊임없이 노력하며, 스파르타코딩클럽에서도 이 같은 튼튼함을 발휘하여 뛰어난 성과를 이루고자 합니다.';

    const mockReturn = { ...dummyResumes[+id], title, introduction };

    mockPrisma.resume.update.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.update(
      id,
      userId,
      title,
      introduction
    );

    // THEN
    const expectedResult = mockReturn;

    expect(mockPrisma.resume.update).toHaveBeenCalledTimes(1);

    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      where: { id: +id, userId: +userId },
      data: {
        ...(title && { title }),
        ...(introduction && { introduction }),
      },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('update Method - title만 있는 경우', async () => {
    // GIVEN
    const id = '1';
    const userId = 1;
    const title = '슈퍼 튼튼한 개발자 스파르탄';
    const introduction = undefined;

    const mockReturn = { ...dummyResumes[+id], title };

    mockPrisma.resume.update.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.update(
      id,
      userId,
      title,
      introduction
    );

    // THEN
    const expectedResult = mockReturn;

    expect(mockPrisma.resume.update).toHaveBeenCalledTimes(1);

    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      where: { id: +id, userId: +userId },
      data: { title },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('update Method - introduction만 있을 경우', async () => {
    // GIVEN
    const id = '1';
    const userId = 1;
    const title = undefined;
    const introduction =
      '아주 그냥 저는 튼튼함을 제 자랑거리로 선보일 수 있습니다. 어떤 도전이든 두려워하지 않고, 견고한 코드와 해결책을 제시할 자신이 있습니다. 복잡한 문제에 직면했을 때에도 냉정하게 분석하고 빠르게 대응하는 능력을 갖췄습니다. 또한, 팀원들과의 원활한 커뮤니케이션을 통해 프로젝트의 성공을 이끌어내는데 기여할 것입니다. 최고의 결과물을 위해 끊임없이 노력하며, 스파르타코딩클럽에서도 이 같은 튼튼함을 발휘하여 뛰어난 성과를 이루고자 합니다.';

    const mockReturn = { ...dummyResumes[+id], introduction };

    mockPrisma.resume.update.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.update(
      id,
      userId,
      title,
      introduction
    );

    // THEN
    const expectedResult = mockReturn;

    expect(mockPrisma.resume.update).toHaveBeenCalledTimes(1);

    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      where: { id: +id, userId: +userId },
      data: { introduction },
    });
    expect(actualResult).toEqual(expectedResult);
  });

  test('delete Method', async () => {
    // GIVEN
    const id = '1';
    const userId = 1;
    const mockReturn = dummyResumes[+id];

    mockPrisma.resume.delete.mockReturnValue(mockReturn);
    // WHEN
    const actualResult = await resumesRepository.delete(id, userId);

    // THEN
    const expectedResult = { id: mockReturn.id };

    expect(mockPrisma.resume.delete).toHaveBeenCalledTimes(1);

    expect(mockPrisma.resume.delete).toHaveBeenCalledWith({
      where: { id: +id, userId: +userId },
    });
    expect(actualResult).toEqual(expectedResult);
  });
});
