/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  coverageDirectory: "<rootDir>/coverage",
  testMatch: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
};
