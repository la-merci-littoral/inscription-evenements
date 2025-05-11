. $PSScriptRoot/loadAdminToken.ps1

$ticket = Read-Host "Entrez le numéro du ticket"

# Vérifie si l'utilisateur a fourni un ID de billet
if ([string]::IsNullOrEmpty($ticket)) {
    Write-Error "L'ID du billet ne peut pas être vide."
    exit 1 # Quitte le script si l'ID du billet est manquant
}

# Construit le chemin du fichier de sortie
$outputFile = Join-Path -Path (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path -ChildPath "Ticket_$($ticket)_LML.pdf"

try {
    Invoke-WebRequest -Uri "$url$ticket" -Method Get -Headers @{"authorization" = $adminToken} -OutFile $outputFile -UseBasicParsing
    Write-Host "Billet téléchargé avec succès vers $outputFile"
} catch {
    Write-Error "Erreur lors du téléchargement du billet : $($_.Exception.Message)"
} finally {
    Start-Sleep -Seconds 3
    exit 1
}