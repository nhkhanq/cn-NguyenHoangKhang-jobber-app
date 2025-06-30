const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  coverageDirectory: "coverage",
  collectCoverage: false,
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/test/*.ts", "<rootDir>/test/**/*.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/test/*.ts?(x)",
    "!**/node_modules/**",
    "!build/**",
    "!coverage/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ["text-summary", "lcov", "html"],
  moduleNameMapper: {
    "@crypto/(.*)": "<rootDir>/src/$1",
  },
  // setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  testTimeout: 30000,
  maxWorkers: 1, // Important for blockchain tests
};

export default config; 