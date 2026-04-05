module.exports = {
  verbose: true,
  preset: "ts-jest",
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx)"],
  testPathIgnorePatterns: ["node_modules"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  moduleFileExtensions: ["js", "ts", "tsx"]
}
