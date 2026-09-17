param([string]$Ffmpeg = 'ffmpeg')
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
$framesRoot = Join-Path (Split-Path $siteRoot -Parent) 'Website_Loop_Assets/frames'
$outputRoot = Join-Path $siteRoot 'assets/loops'
New-Item -ItemType Directory -Force $outputRoot | Out-Null
foreach ($name in @('Intro','Signage')) {
  $sourceFolder = Join-Path $framesRoot ($name + '_Loop')
  foreach ($i in 1..96) {
    if (!(Test-Path -LiteralPath (Join-Path $sourceFolder ('frame_{0:0000}.png' -f $i)))) { throw "Missing $name frame $i" }
  }
  $outputName = $name.ToLowerInvariant()
  & $Ffmpeg -hide_banner -loglevel error -y -framerate 24 -i (Join-Path $sourceFolder 'frame_%04d.png') -frames:v 96 -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -an -movflags +faststart (Join-Path $outputRoot ($outputName + '.mp4'))
  if ($LASTEXITCODE) { throw "Encoding failed: $name" }
  & $Ffmpeg -hide_banner -loglevel error -y -i (Join-Path $sourceFolder 'frame_0001.png') -frames:v 1 -q:v 2 (Join-Path $outputRoot ($outputName + '.jpg'))
  if ($LASTEXITCODE) { throw "Poster failed: $name" }
}
& $Ffmpeg -hide_banner -loglevel error -y -i (Join-Path $framesRoot 'Final Render/Tosolini_3D-Animation.mp4') -c:v libx264 -preset slow -crf 22 -g 12 -pix_fmt yuv420p -an -movflags +faststart (Join-Path $siteRoot 'assets/showroom-journey.mp4')
if ($LASTEXITCODE) { throw 'Journey encoding failed' }
