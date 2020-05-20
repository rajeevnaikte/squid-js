module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverage: !process.env.NO_COVERAGE,
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  coverageReporters: [
    'json',
    'lcov',
    'clover',
    'text-summary'
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup-tests/setup.ts'
  ],
  testEnvironment: 'jest-environment-jsdom-sixteen'
}
