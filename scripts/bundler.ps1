$loadAdminTokenContent = Get-Content -Path "loadAdminToken.ps1" -Encoding UTF8
$getTicketContent = Get-Content -Path "getTicket.ps1" -Encoding UTF8 | Select-Object -Skip 1

$combinedContent = $loadAdminTokenContent + $getTicketContent

$combinedContent | Out-File -FilePath "compiled.ps1" -Encoding UTF8

& "ps2exe" "compiled.ps1" "output.exe"

Remove-Item -Path "compiled.ps1" -Force