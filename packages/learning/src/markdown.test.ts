import { describe, it, expect } from "vitest"
import { parseInline } from "./markdown"

describe("parseInline", () => {
  it("parses plain text", () => {
    expect(parseInline("hello")).toEqual([{ kind: "text", text: "hello" }])
  })

  it("parses bold", () => {
    expect(parseInline("a **b** c")).toEqual([
      { kind: "text", text: "a " },
      { kind: "bold", children: [{ kind: "text", text: "b" }] },
      { kind: "text", text: " c" },
    ])
  })

  it("parses italic", () => {
    expect(parseInline("a _b_ c")).toEqual([
      { kind: "text", text: "a " },
      { kind: "italic", children: [{ kind: "text", text: "b" }] },
      { kind: "text", text: " c" },
    ])
  })

  it("parses nested bold inside italic", () => {
    expect(parseInline("_a **b** c_")).toEqual([
      {
        kind: "italic",
        children: [
          { kind: "text", text: "a " },
          { kind: "bold", children: [{ kind: "text", text: "b" }] },
          { kind: "text", text: " c" },
        ],
      },
    ])
  })

  it("treats unclosed delimiters as literal text", () => {
    expect(parseInline("a **b")).toEqual([
      { kind: "text", text: "a " },
      { kind: "text", text: "**" },
      { kind: "text", text: "b" },
    ])
  })

  it("does not pass through HTML", () => {
    const result = parseInline("<script>alert('x')</script>")
    expect(result).toEqual([
      { kind: "text", text: "<script>alert('x')</script>" },
    ])
  })
})
