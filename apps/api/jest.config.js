// jest.config.js
// Jest doesn't fully support ESM yet, so we keep this as CommonJS
// But configure it for ESM transformation

export default {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    setupFiles: ['dotenv/config'],
    transform: {},
    moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
};
