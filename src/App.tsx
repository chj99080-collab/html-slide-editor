import { useMemo, useRef, useState } from "react";
import {
  Download,
  FileDown,
  FolderOpen,
  Image,
  MousePointer2,
  Save,
  Square,
  Type,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { createSlidePreviewHtml, parseDeck, updateEditable } from "./deck";
import { SAMPLE_DECK_PATH } from "./sampleDeck";
import type { DeckState, DragPatch, EditableElement, EditablePatch, ResizePatch } from "./types";

const DEFAULT_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Untitled HTML Slide Deck</title>
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: #eef2f7; }
    .slide { width: 1280px; height: 720px; background: white; position: relative; overflow: hidden; }
  </style>
</head>
<body>
  <section class="slide" id="slide-1" data-title="Blank slide">
    <div data-editable="true" data-id="title" data-type="text" style="position:absolute;left:90px;top:76px;width:760px;height:80px;font-size:52px;color:#172033;">HTML Slide Editor</div>
    <div data-editable="true" data-id="subtitle" data-type="text" style="position:absolute;left:96px;top:170px;width:720px;height:54px;font-size:26px;color:#3f4f66;">Open an editable HTML slide deck to begin.</div>
  </section>
</body>
</html>`;

export function App() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [fileName, setFileName] = useState("untitled.html");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>("title");
  const [zoom, setZoom] = useState(0.62);
  const [status, setStatus] = useState("Ready");
  const [isDropActive, setIsDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const deck: DeckState = useMemo(() => parseDeck(html), [html]);
  const selected = deck.editables.find((item) => item.id === selectedId) || null;
  const activeEditables = deck.editables.filter((item) => item.slideIndex === activeSlide);

  function applyPatch(id: string, patch: EditablePatch) {
    setHtml((current) => updateEditable(current, id, patch));
    setStatus("Edited");
  }

  async function openWithPicker() {
    if (window.showOpenFilePicker) {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{ description: "HTML", accept: { "text/html": [".html", ".htm"] } }],
      });
      const file = await handle.getFile();
      await loadFile(file);
      setFileHandle(handle);
      return;
    }
    fileInputRef.current?.click();
  }

  async function loadFile(file: File) {
    const text = await file.text();
    setHtml(text);
    setFileName(file.name);
    setFileHandle(null);
    setActiveSlide(0);
    setSelectedId(parseDeck(text).editables[0]?.id || null);
    setStatus(`Opened ${file.name}`);
  }

  async function loadDroppedFile(file: File) {
    if (!isHtmlFile(file)) {
      setStatus("Drop an .html or .htm slide deck");
      return;
    }

    await loadFile(file);
    setFileHandle(null);
    setStatus(`Dropped ${file.name}; Save will download`);
  }

  async function loadSample() {
    const response = await fetch(SAMPLE_DECK_PATH);
    const text = await response.text();
    setHtml(text);
    setFileName("editable-deck.html");
    setFileHandle(null);
    setActiveSlide(0);
    setSelectedId(parseDeck(text).editables[0]?.id || null);
    setStatus("Loaded sample deck");
  }

  async function save() {
    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(new Blob([html], { type: "text/html" }));
      await writable.close();
      setStatus(`Saved ${fileName}`);
      return;
    }
    downloadHtml();
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${fileName}`);
  }

  function handleDrag(patch: DragPatch) {
    applyPatch(patch.id, { left: patch.left, top: patch.top });
  }

  function handleResize(patch: ResizePatch) {
    applyPatch(patch.id, { width: patch.width, height: patch.height });
  }

  return (
    <div
      className={`app-shell ${isDropActive ? "drop-active" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDropActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) {
          setIsDropActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDropActive(false);
        const file = event.dataTransfer.files[0];
        if (file) {
          void loadDroppedFile(file);
        }
      }}
    >
      <input
        ref={fileInputRef}
        className="hidden-input"
        type="file"
        accept=".html,.htm,text/html"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void loadFile(file);
          }
          event.currentTarget.value = "";
        }}
      />

      <header className="toolbar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>HTML Slide Editor</strong>
            <span>{fileName}</span>
          </div>
        </div>
        <div className="tool-group">
          <button type="button" onClick={() => void openWithPicker()} title="Open HTML">
            <FolderOpen size={18} /> Open
          </button>
          <button type="button" onClick={() => void loadSample()} title="Load sample">
            <FileDown size={18} /> Sample
          </button>
          <button type="button" onClick={() => void save()} title="Save or download">
            <Save size={18} /> Save
          </button>
          <button type="button" onClick={downloadHtml} title="Download HTML">
            <Download size={18} /> Export
          </button>
        </div>
        <div className="tool-group">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.3, value - 0.08))} title="Zoom out">
            <ZoomOut size={18} />
          </button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.25, value + 0.08))} title="Zoom in">
            <ZoomIn size={18} />
          </button>
        </div>
        <span className="status">{status}</span>
      </header>

      <main className="workspace">
        <SlideList
          slides={deck.slides}
          activeSlide={activeSlide}
          onSelect={(index) => {
            setActiveSlide(index);
            setSelectedId(deck.editables.find((item) => item.slideIndex === index)?.id || null);
          }}
        />

        <section className="canvas-panel" aria-label="Slide canvas">
          {deck.slides.length === 0 ? (
            <EmptyState />
          ) : (
            <SlideCanvas
              html={createSlidePreviewHtml(html, activeSlide, selectedId)}
              zoom={zoom}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDrag={handleDrag}
              onResize={handleResize}
            />
          )}
        </section>

        <PropertiesPanel
          selected={selected}
          elements={activeEditables}
          onSelect={setSelectedId}
          onChange={(patch) => {
            if (selected) {
              applyPatch(selected.id, patch);
            }
          }}
        />
      </main>
      {isDropActive ? (
        <div className="drop-overlay">
          <Upload size={34} />
          <strong>Drop HTML slide deck</strong>
          <span>Drop an .html or .htm file to load it for editing.</span>
        </div>
      ) : null}
    </div>
  );
}

function isHtmlFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type === "text/html" || name.endsWith(".html") || name.endsWith(".htm");
}

function SlideList({
  slides,
  activeSlide,
  onSelect,
}: {
  slides: DeckState["slides"];
  activeSlide: number;
  onSelect: (index: number) => void;
}) {
  return (
    <aside className="slide-list">
      <div className="panel-heading">Slides</div>
      {slides.map((slide) => (
        <button
          className={`slide-row ${slide.index === activeSlide ? "active" : ""}`}
          key={slide.id}
          type="button"
          onClick={() => onSelect(slide.index)}
        >
          <span>{slide.index + 1}</span>
          <div>
            <strong>{slide.title}</strong>
            <small>{slide.editableCount} editable</small>
          </div>
        </button>
      ))}
    </aside>
  );
}

function SlideCanvas({
  html,
  zoom,
  selectedId,
  onSelect,
  onDrag,
  onResize,
}: {
  html: string;
  zoom: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDrag: (patch: DragPatch) => void;
  onResize: (patch: ResizePatch) => void;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  function wireFrame() {
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    if (!doc) {
      return;
    }

    doc.querySelectorAll<HTMLElement>('[data-editable="true"]').forEach((element) => {
      element.addEventListener("pointerdown", (event) => {
        const id = element.dataset.id;
        if (!id) {
          return;
        }
        event.preventDefault();
        onSelect(id);

        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = Number.parseFloat(element.style.left || "0");
        const startTop = Number.parseFloat(element.style.top || "0");
        element.setAttribute("data-editor-dragging", "true");

        const move = (moveEvent: PointerEvent) => {
          const left = Math.max(0, startLeft + (moveEvent.clientX - startX) / zoom);
          const top = Math.max(0, startTop + (moveEvent.clientY - startY) / zoom);
          element.style.left = `${left}px`;
          element.style.top = `${top}px`;
        };

        const up = (upEvent: PointerEvent) => {
          doc.removeEventListener("pointermove", move);
          doc.removeEventListener("pointerup", up);
          element.removeAttribute("data-editor-dragging");
          const left = Math.max(0, startLeft + (upEvent.clientX - startX) / zoom);
          const top = Math.max(0, startTop + (upEvent.clientY - startY) / zoom);
          onDrag({ id, left, top });
        };

        doc.addEventListener("pointermove", move);
        doc.addEventListener("pointerup", up);
      });
    });
  }

  return (
    <div className="canvas-stage" style={{ "--zoom": zoom } as React.CSSProperties}>
      <iframe ref={frameRef} title="Slide preview" srcDoc={html} onLoad={wireFrame} />
      {selectedId ? (
        <button
          className="resize-handle"
          type="button"
          title="Increase selected size"
          onClick={() => {
            const doc = frameRef.current?.contentDocument;
            const element = doc?.querySelector<HTMLElement>(`[data-id="${selectedId}"]`);
            if (!element) {
              return;
            }
            const width = Number.parseFloat(element.style.width || "0") + 16;
            const height = Number.parseFloat(element.style.height || "0") + 10;
            onResize({ id: selectedId, width, height });
          }}
        >
          <Square size={14} />
        </button>
      ) : null}
    </div>
  );
}

function PropertiesPanel({
  selected,
  elements,
  onSelect,
  onChange,
}: {
  selected: EditableElement | null;
  elements: EditableElement[];
  onSelect: (id: string) => void;
  onChange: (patch: EditablePatch) => void;
}) {
  return (
    <aside className="properties">
      <div className="panel-heading">Properties</div>
      <div className="layer-list">
        {elements.map((element) => (
          <button
            className={`layer-row ${selected?.id === element.id ? "active" : ""}`}
            key={element.id}
            type="button"
            onClick={() => onSelect(element.id)}
          >
            {iconForType(element.type)}
            <span>{element.id || "(missing id)"}</span>
            <small>{element.type}</small>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="field-grid">
          <label>
            ID
            <input value={selected.id} readOnly />
          </label>
          <label>
            Type
            <input value={selected.type} readOnly />
          </label>
          {selected.type === "text" ? (
            <label className="full">
              Text
              <textarea value={selected.text} onChange={(event) => onChange({ text: event.target.value })} />
            </label>
          ) : null}
          {selected.type === "image" ? (
            <label className="full">
              Image URL
              <input value={selected.src} onChange={(event) => onChange({ src: event.target.value })} />
            </label>
          ) : null}
          <NumberField label="Left" value={selected.left} onChange={(left) => onChange({ left })} />
          <NumberField label="Top" value={selected.top} onChange={(top) => onChange({ top })} />
          <NumberField label="Width" value={selected.width} onChange={(width) => onChange({ width })} />
          <NumberField label="Height" value={selected.height} onChange={(height) => onChange({ height })} />
          <NumberField label="Font" value={selected.fontSize} onChange={(fontSize) => onChange({ fontSize })} />
          <NumberField label="Stroke" value={selected.borderWidth} onChange={(borderWidth) => onChange({ borderWidth })} />
          <label>
            Text color
            <input value={selected.color} onChange={(event) => onChange({ color: event.target.value })} />
          </label>
          <label>
            Fill
            <input value={selected.backgroundColor} onChange={(event) => onChange({ backgroundColor: event.target.value })} />
          </label>
          <label>
            Border
            <input value={selected.borderColor} onChange={(event) => onChange({ borderColor: event.target.value })} />
          </label>
          <label>
            Opacity
            <input
              max="1"
              min="0"
              step="0.05"
              type="number"
              value={selected.opacity}
              onChange={(event) => onChange({ opacity: Number(event.target.value) })}
            />
          </label>
        </div>
      ) : (
        <div className="empty-properties">
          <MousePointer2 size={22} />
          <span>Select an editable element.</span>
        </div>
      )}
    </aside>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      {label}
      <input type="number" value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function iconForType(type: EditableElement["type"]) {
  if (type === "text") {
    return <Type size={16} />;
  }
  if (type === "image") {
    return <Image size={16} />;
  }
  return <Square size={16} />;
}

function EmptyState() {
  return (
    <div className="empty-state">
      <strong>No slide sections found</strong>
      <span>The deck must contain at least one section with class "slide".</span>
    </div>
  );
}
