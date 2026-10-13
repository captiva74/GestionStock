# Base de donnees : une base par agence

- GestionStockDb : base centrale (Utilisateurs, Agences)
- GestionStockDb01 a GestionStockDb69 : stock de chaque agence
- Agence 44 = code_structure 244 = base GestionStockDb44

Ordre d'execution pour reconstruire (SSMS pour les .sql, PowerShell pour le .ps1) :
1. 00_utilisateurs_agence.sql
2. 01_creer_bases_agences.sql
3. 02_table_agences.sql
4. 04_appliquer_tables_stock.ps1  (utilise 03_tables_stock.sql)
5. 05_ajout_fournisseurs.sql      (complete les bases avec Fournisseurs)

Remarque : 03_tables_stock.sql est la structure d'origine, sans la table
Fournisseurs. Le script 05 la complete, il faut donc toujours l'executer apres le 04.

ATTENTION : si la structure d'une table de stock change, il faut
l'appliquer aux 69 bases (un seul script en boucle), pas seulement a une.
