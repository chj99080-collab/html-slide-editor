# html-slide-editor

HTML slide editor is a browser-based viewer and visual editor for Codex-generated
HTML slide decks.

The editor targets slide HTML that follows a constrained editable schema:

- Slides are represented by `section.slide`.
- Editable elements have `data-editable="true"`, `data-id`, and `data-type`.
- v1 supports `text`, `image`, `rect`, `ellipse`, `line`, and `svg-group`.
- Position and size are read from inline absolute-positioned styles.

This project intentionally does not try to make arbitrary HTML/CSS/SVG fully
editable like PowerPoint. It preserves unsupported content while only editing
known, metadata-tagged elements.
