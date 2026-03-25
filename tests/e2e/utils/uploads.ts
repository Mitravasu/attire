import path from "node:path";

export const frontImagePath = path.resolve(
  process.cwd(),
  "tests/e2e/fixtures/images/front-test.svg",
);

export const backImagePath = path.resolve(
  process.cwd(),
  "tests/e2e/fixtures/images/back-test.svg",
);
