export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts'],
    setupFiles: ['<rootDir>/jest.setup.ts'],
};