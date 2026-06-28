export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Carlos's convention: specific types only, never `chore:`.
    "type-enum": [
      2,
      "always",
      ["build", "ci", "docs", "feat", "fix", "refactor", "test"],
    ],
    // Allow capitalised subjects (e.g. "Add VM listing command").
    "subject-case": [0],
  },
};
