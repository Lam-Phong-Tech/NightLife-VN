Add-Type -AssemblyName System.Drawing

$sizes = @(192, 512)

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    # Dark background #101014
    $bg = [System.Drawing.Color]::FromArgb(255, 16, 16, 20)
    $g.Clear($bg)

    # Gold "V" text
    $gold = [System.Drawing.Color]::FromArgb(255, 212, 178, 106)
    $brush = New-Object System.Drawing.SolidBrush($gold)
    $fontSize = [int]($size * 0.48)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)

    $g.DrawString("V", $font, $brush, $rect, $sf)

    $outPath = "public\icon-$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $font.Dispose()
    $brush.Dispose()

    Write-Host "Created $outPath"
}
