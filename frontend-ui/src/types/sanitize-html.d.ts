declare module "sanitize-html" {
  export interface SanitizeHtmlAttributes {
    [attribute: string]: string;
  }

  export interface SanitizeHtmlTransformResult {
    tagName: string;
    attribs: SanitizeHtmlAttributes;
    text?: string;
  }

  export interface SanitizeHtmlOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    allowProtocolRelative?: boolean;
    transformTags?: Record<
      string,
      (tagName: string, attribs: SanitizeHtmlAttributes) => SanitizeHtmlTransformResult
    >;
  }

  export default function sanitizeHtml(dirty: string, options?: SanitizeHtmlOptions): string;
}
