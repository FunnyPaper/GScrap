/** @type {import('jest').Config} */
const config = {
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    testEnvironment: "jsdom",
    testMatch: [
        "**/__tests__/**/*.?([mc])[jt]s?(x)",
        "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    }
};

module.exports = config;
