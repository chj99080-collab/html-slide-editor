import type { DeckState, EditableElement, EditablePatch, EditableType } from "./types";

const SUPPORTED_TYPES = new Set<EditableType>([
  "text",
  "image",
  "rect",
  "ellipse",
  "line",
  "svg-group",
]);

const parser = new DOMParser();

export function parseDeck(html: string): DeckState {
  const doc = parser.parseFromString(html, "text/html");
  const slides = Array.from(doc.querySelectorAll<HTMLElement>("section.slide"));
  const editables = slides.flatMap((slide, slideIndex) =>
    Array.from(slide.querySelectorAll<HTMLElement>('[data-editable="true"]')).map((element) =>
      readEditable(element, slideIndex),
    ),
  );

  return {
    html,
    slides: slides.map((slide, index) => ({
      id: slide.id || `slide-${index + 1}`,
      index,
      title: slide.getAttribute("aria-label") || slide.dataset.title || `Slide ${index + 1}`,
      html: slide.outerHTML,
      editableCount: slide.querySelectorAll('[data-editable="true"]').length,
    })),
    editables,
  };
}

export function createSlidePreviewHtml(html: string, slideIndex: number, selectedId: string | null): string {
  const doc = parser.parseFromString(html, "text/html");
  const slides = Array.from(doc.querySelectorAll<HTMLElement>("section.slide"));
  slides.forEach((slide, index) => {
    if (index === slideIndex) {
      slide.style.display = "block";
      slide.setAttribute("data-active-slide", "true");
    } else {
      slide.remove();
    }
  });

  doc.querySelectorAll<HTMLElement>('[data-editable="true"]').forEach((element) => {
    element.style.cursor = "move";
    element.style.outline = element.dataset.id === selectedId ? "2px solid #1d4ed8" : "1px dashed rgba(29, 78, 216, 0.45)";
    element.style.outlineOffset = "2px";
  });

  const style = doc.createElement("style");
  style.textContent = `
    html, body { margin: 0; min-height: 100%; background: #f5f7fb; }
    body { display: grid; place-items: start center; padding: 0; overflow: hidden; }
    section.slide[data-active-slide="true"] { position: relative; transform-origin: top left; overflow: hidden; }
    [data-editable="true"][data-editor-dragging="true"] { outline: 2px solid #0f766e !important; }
  `;
  doc.head.appendChild(style);

  return serializeDocument(doc);
}

export function updateEditable(html: string, id: string, patch: EditablePatch): string {
  const doc = parser.parseFromString(html, "text/html");
  const element = doc.querySelector<HTMLElement>(`[data-editable="true"][data-id="${cssEscape(id)}"]`);
  if (!element) {
    return html;
  }

  if (patch.text !== undefined) {
    element.textContent = patch.text;
  }
  if (patch.src !== undefined) {
    if (element instanceof HTMLImageElement) {
      element.src = patch.src;
    } else {
      element.setAttribute("src", patch.src);
    }
  }

  setPx(element, "left", patch.left);
  setPx(element, "top", patch.top);
  setPx(element, "width", patch.width);
  setPx(element, "height", patch.height);
  setPx(element, "fontSize", patch.fontSize);
  setPx(element, "borderWidth", patch.borderWidth);

  setStyle(element, "color", patch.color);
  setStyle(element, "backgroundColor", patch.backgroundColor);
  setStyle(element, "borderColor", patch.borderColor);

  if (patch.opacity !== undefined) {
    element.style.opacity = String(clamp(patch.opacity, 0, 1));
  }

  return serializeDocument(doc);
}

export function serializeDocument(doc: Document): string {
  const doctype = doc.doctype
    ? `<!doctype ${doc.doctype.name}${doc.doctype.publicId ? ` public "${doc.doctype.publicId}"` : ""}${doc.doctype.systemId ? ` "${doc.doctype.systemId}"` : ""}>\n`
    : "<!doctype html>\n";
  return `${doctype}${doc.documentElement.outerHTML}`;
}

function readEditable(element: HTMLElement, slideIndex: number): EditableElement {
  const styles = element.style;
  const computed = window.getComputedStyle(element);
  const declaredType = element.dataset.type as EditableType | undefined;
  const type = declaredType && SUPPORTED_TYPES.has(declaredType) ? declaredType : "unsupported";

  return {
    id: element.dataset.id || "",
    type,
    tagName: element.tagName.toLowerCase(),
    slideIndex,
    text: element.textContent || "",
    src: element.getAttribute("src") || "",
    left: parsePx(styles.left || computed.left),
    top: parsePx(styles.top || computed.top),
    width: parsePx(styles.width || computed.width),
    height: parsePx(styles.height || computed.height),
    color: styles.color || computed.color || "#111827",
    backgroundColor: styles.backgroundColor || computed.backgroundColor || "transparent",
    fontSize: parsePx(styles.fontSize || computed.fontSize),
    borderColor: styles.borderColor || computed.borderColor || "#111827",
    borderWidth: parsePx(styles.borderWidth || computed.borderWidth),
    opacity: Number(styles.opacity || computed.opacity || "1"),
  };
}

function parsePx(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function setPx(element: HTMLElement, property: keyof CSSStyleDeclaration, value: number | undefined): void {
  if (value !== undefined) {
    element.style[property as "left"] = `${Math.max(0, Math.round(value * 100) / 100)}px`;
  }
}

function setStyle(element: HTMLElement, property: keyof CSSStyleDeclaration, value: string | undefined): void {
  if (value !== undefined) {
    element.style[property as "color"] = value;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cssEscape(value: string): string {
  if (window.CSS?.escape) {
    return window.CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}
