module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // 'src/' 경로를 실제 디렉토리로 매핑
  },
};
