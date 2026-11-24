import { toMallUrl } from "../src/controller/scrape/mallUrl";

describe("toMallUrl", () => {
  test("resolves a relative path against mall.hr", () => {
    expect(toMallUrl("/i/73304017/240/235")).toBe("https://www.mall.hr/i/73304017/240/235");
  });

  test("keeps an absolute mall.hr URL", () => {
    expect(toMallUrl("https://www.mall.hr/i/1/240/235")).toBe("https://www.mall.hr/i/1/240/235");
  });

  test("rejects a host that only starts with www.mall.hr", () => {
    expect(toMallUrl("https://www.mall.hr.evil.example/x.jpg")).toBeNull();
  });

  test("rejects a protocol-relative URL to another host", () => {
    expect(toMallUrl("//evil.example/x.jpg")).toBeNull();
  });

  test("rejects plain http, a custom port and embedded credentials", () => {
    expect(toMallUrl("http://www.mall.hr/i/1")).toBeNull();
    expect(toMallUrl("https://www.mall.hr:8080/i/1")).toBeNull();
    expect(toMallUrl("https://user:pw@www.mall.hr/i/1")).toBeNull();
  });

  test("rejects an empty value", () => {
    expect(toMallUrl("")).toBeNull();
  });
});
