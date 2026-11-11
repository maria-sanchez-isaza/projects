param([string]$HeroSource)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'media'
New-Item -ItemType Directory -Force -Path $out | Out-Null

Copy-Item (Join-Path $root 'Assets/Logo.png') (Join-Path $out 'logo.png') -Force

$source = [System.Drawing.Image]::FromFile((Join-Path $root 'Assets/Garrafas-1.png'))
$names = @('apd', 'xn', 'opl', 'n', 'tx', 'tc')
for ($i = 0; $i -lt 6; $i++) {
    $left = [int][Math]::Floor($i * $source.Width / 6)
    $right = [int][Math]::Floor(($i + 1) * $source.Width / 6)
    $bitmap = [System.Drawing.Bitmap]::new(540, 620, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, 540, 620), [System.Drawing.Rectangle]::new($left, 0, ($right - $left), $source.Height), [System.Drawing.GraphicsUnit]::Pixel)
    $bitmap.Save((Join-Path $out ("sellalit-$($names[$i]).png")), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}
$source.Dispose()

if ($HeroSource) {
    $hero = [System.Drawing.Image]::FromFile($HeroSource)
    $target = [System.Drawing.Bitmap]::new(1600, [int][Math]::Round($hero.Height * 1600 / $hero.Width))
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($hero, 0, 0, $target.Width, $target.Height)
    $jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $options = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $options.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]86)
    $target.Save((Join-Path $out 'imprenta-hero.jpg'), $jpeg, $options)
    $options.Dispose()
    $g.Dispose()
    $target.Dispose()
    $hero.Dispose()
}
