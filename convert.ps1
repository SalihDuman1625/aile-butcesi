Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("public\pwa-icon.jpg")

$img192 = New-Object System.Drawing.Bitmap(192, 192)
$g192 = [System.Drawing.Graphics]::FromImage($img192)
$g192.DrawImage($img, 0, 0, 192, 192)
$img192.Save("public\pwa-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$img512 = New-Object System.Drawing.Bitmap(512, 512)
$g512 = [System.Drawing.Graphics]::FromImage($img512)
$g512.DrawImage($img, 0, 0, 512, 512)
$img512.Save("public\pwa-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g192.Dispose()
$g512.Dispose()
$img192.Dispose()
$img512.Dispose()
$img.Dispose()
