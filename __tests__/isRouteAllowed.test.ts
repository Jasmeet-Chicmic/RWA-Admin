import { isRouteAllowed } from "@/lib/isRouteAllowed";

describe("isRouteAllowed", () => {
  const allowed = ["/agent", "/dashboard", "/org/[orgId]/members"];

  it("allows exact match", () =>
    expect(isRouteAllowed("/agent", allowed)).toBe(true));
  it("allows direct child", () =>
    expect(isRouteAllowed("/agent/add", allowed)).toBe(true));
  it("allows deep nested child", () =>
    expect(isRouteAllowed("/agent/edit/123", allowed)).toBe(true));
  it("allows dynamic segment match", () =>
    expect(isRouteAllowed("/org/abc-123/members", allowed)).toBe(true));
  it("allows nested under dynamic", () =>
    expect(isRouteAllowed("/org/abc-123/members/invite", allowed)).toBe(true));

  it("denies sibling with shared prefix", () =>
    expect(isRouteAllowed("/agent-all", allowed)).toBe(false));
  it("denies sibling child with shared prefix", () =>
    expect(isRouteAllowed("/agent-all/export", allowed)).toBe(false));
  it("denies unlisted route", () =>
    expect(isRouteAllowed("/settings", allowed)).toBe(false));
  it("denies partial segment overlap", () =>
    expect(isRouteAllowed("/dashboard-old", allowed)).toBe(false));

  it("handles trailing slash on visited path", () =>
    expect(isRouteAllowed("/agent/", allowed)).toBe(true));
  it("handles query strings", () =>
    expect(isRouteAllowed("/agent?page=2", allowed)).toBe(true));
  it("handles root route", () => expect(isRouteAllowed("/", ["/"])).toBe(true));
});
