param([string]$Ffmpeg = 'ffmpeg')
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
$sourceRoot = Join-Path (Split-Path $siteRoot -Parent) 'Website_Loop_Assets/expressive'
$outputRoot = Join-Path $siteRoot 'assets/loops'
foreach ($name in @('Intro','Signage')) {
  $sourceFolder = Join-Path $sourceRoot $name
  foreach ($i in 1..96) {
    if (!(Test-Path -LiteralPath (Join-Path $sourceFolder ('frame_{0:0000}.png' -f $i)))) { throw "Missing $name frame $i" }
  }
  $outputName = $name.ToLowerInvariant() + '-expressive'
  & $Ffmpeg -hide_banner -loglevel error -y -framerate 24 -i (Join-Path $sourceFolder 'frame_%04d.png') -frames:v 96 -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -an -movflags +faststart (Join-Path $outputRoot ($outputName + '.mp4'))
  if ($LASTEXITCODE) { throw "Encoding failed: $name" }
  & $Ffmpeg -hide_banner -loglevel error -y -i (Join-Path $sourceFolder 'frame_0001.png') -frames:v 1 -q:v 2 (Join-Path $outputRoot ($outputName + '.jpg'))
  if ($LASTEXITCODE) { throw "Poster failed: $name" }
}
