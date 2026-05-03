# Frontend Setup And Build

## Runtime
- Node.js: 24.x
- npm: 11.x
- Shell: Windows PowerShell with `npm.cmd`

## Install
```powershell
npm.cmd install
```

## Run
```powershell
npm.cmd run dev
```

## Build
```powershell
npm.cmd run build
```

## Preview
```powershell
npm.cmd run preview
```

## Editable HTML Contract
- Each slide is a `section.slide` element.
- Editable elements must include:
  - `data-editable="true"`
  - `data-id="<stable-id>"`
  - `data-type="text|image|rect|ellipse|line|svg-group"`
- Position and size must be explicit inline styles:
  - `position:absolute`
  - `left`
  - `top`
  - `width`
  - `height`

## Unsupported For v1 Editing
- Complex CSS Grid/Flex layout editing
- Pseudo-elements
- JavaScript-generated slide content
- Complex SVG paths, filters, masks, clip paths, and animations

Unsupported content should remain visible and should be preserved when saving.
