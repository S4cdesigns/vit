import { expect } from "chai";
import { existsSync, readFileSync, unlinkSync } from "fs";
import { downloadFile } from "../../src/utils/download";

describe("Download file", () => {
  it("Should download file to disk", async () => {
    const file = "download-test.json";
    if (existsSync(file)) {
      unlinkSync(file);
    }
    expect(existsSync(file)).to.be.false;
    await downloadFile("https://gitlab.com/porn-vault/porn-vault/-/raw/dev/tsconfig.json", file);
    expect(existsSync(file)).to.be.true;
    expect(readFileSync(file, "utf-8")).to.include("compilerOptions");
    unlinkSync(file);
    expect(existsSync(file)).to.be.false;
  });
});
