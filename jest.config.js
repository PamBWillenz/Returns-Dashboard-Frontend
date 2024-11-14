module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "mjs", "node"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\(.js|jsx|ts|tsx|mjs)?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios/.*)", // Transform axios module
  ],
};
