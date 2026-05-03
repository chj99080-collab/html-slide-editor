export type EditableType =
  | "text"
  | "image"
  | "rect"
  | "ellipse"
  | "line"
  | "svg-group"
  | "unsupported";

export interface SlideInfo {
  id: string;
  index: number;
  title: string;
  html: string;
  editableCount: number;
}

export interface EditableElement {
  id: string;
  type: EditableType;
  tagName: string;
  slideIndex: number;
  text: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  opacity: number;
}

export interface DeckState {
  html: string;
  slides: SlideInfo[];
  editables: EditableElement[];
}

export interface EditablePatch {
  text?: string;
  src?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
}

export interface DragPatch {
  id: string;
  left: number;
  top: number;
}

export interface ResizePatch {
  id: string;
  width: number;
  height: number;
}
