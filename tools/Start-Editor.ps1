param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8"; break }
    ".htm" { "text/html; charset=utf-8"; break }
    ".js" { "text/javascript; charset=utf-8"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".svg" { "image/svg+xml"; break }
    ".png" { "image/png"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".gif" { "image/gif"; break }
    ".webp" { "image/webp"; break }
    default { "application/octet-stream" }
  }
}

function Resolve-RequestPath {
  param([string]$UrlPath)

  $relative = [Uri]::UnescapeDataString($UrlPath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($relative)) {
    $relative = "index.html"
  }

  $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $relative))
  if (-not $candidate.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  if (Test-Path -LiteralPath $candidate -PathType Container) {
    return Join-Path $candidate "index.html"
  }

  return $candidate
}

$listener = [System.Net.HttpListener]::new()
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "HTML Slide Editor is running at $prefix"
Write-Host "Close this PowerShell window or press Ctrl+C to stop."
Start-Process $prefix

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = Resolve-RequestPath $context.Request.Url.AbsolutePath

    if ($null -eq $path -or -not (Test-Path -LiteralPath $path -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($path)
    $context.Response.ContentType = Get-ContentType $path
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
