# Applique 03_tables_stock.sql aux bases GestionStockDb01 a GestionStockDb69
# Les bases qui contiennent deja des tables sont ignorees.
param([string]$Serveur = ".\SQLEXPRESS")

$contenu = Get-Content "$PSScriptRoot\03_tables_stock.sql" -Raw

foreach ($i in 1..69) {
    $nom = "GestionStockDb" + $i.ToString("00")
    $n = sqlcmd -S $Serveur -E -C -h -1 -W -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM [$nom].sys.tables"
    if ([int]($n | Select-Object -First 1) -ne 0) { Write-Host "$nom ignoree (contient deja des tables)"; continue }

    $tmp = "$env:TEMP\agence_$nom.sql"
    $contenu.Replace("USE [GestionStockDb]", "USE [$nom]") | Set-Content $tmp -Encoding Unicode
    sqlcmd -S $Serveur -E -C -b -i $tmp
    if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR sur $nom"; break }
    Write-Host "$nom OK"
}
