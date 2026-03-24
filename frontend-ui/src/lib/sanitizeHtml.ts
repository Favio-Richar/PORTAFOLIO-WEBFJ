import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "hr",
  "span",
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  code: ["class"],
  pre: ["class"],
  span: ["class"],
};

export function sanitizeHtmlContent(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const rel = attribs.rel ? attribs.rel : "noopener noreferrer";
        return {
          tagName,
          attribs: {
            ...attribs,
            rel,
          },
        };
      },
    },
  });
}
