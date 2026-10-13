-- Ajoute la table Fournisseurs et la colonne FournisseurId a toutes les bases d'agence.
-- A executer APRES 03/04 (tables de stock). Sans danger si relance : chaque element est verifie avant creation.
DECLARE @db SYSNAME;
DECLARE @pre NVARCHAR(200);

DECLARE c CURSOR LOCAL STATIC FOR
    SELECT name FROM sys.databases
    WHERE name LIKE 'GestionStockDb[0-9][0-9]'
    ORDER BY name;

OPEN c;
FETCH NEXT FROM c INTO @db;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        SET @pre = N'USE ' + QUOTENAME(@db) + N'; ';

        EXEC(@pre + N'
        IF OBJECT_ID(''dbo.Fournisseurs'') IS NULL
        CREATE TABLE dbo.Fournisseurs (
            Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Fournisseurs PRIMARY KEY,
            Nom          NVARCHAR(100) NOT NULL,
            Prenom       NVARCHAR(100) NOT NULL,
            Activite     NVARCHAR(200) NOT NULL,
            Adresse      NVARCHAR(300) NULL,
            Email        NVARCHAR(254) NULL,
            NumTelephone NVARCHAR(30)  NULL
        );');

        EXEC(@pre + N'
        IF COL_LENGTH(''dbo.MouvementsStock'', ''FournisseurId'') IS NULL
            ALTER TABLE dbo.MouvementsStock ADD FournisseurId INT NULL;');

        EXEC(@pre + N'
        IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = ''FK_MouvementsStock_Fournisseurs_FournisseurId'')
            ALTER TABLE dbo.MouvementsStock
            ADD CONSTRAINT FK_MouvementsStock_Fournisseurs_FournisseurId
            FOREIGN KEY (FournisseurId) REFERENCES dbo.Fournisseurs(Id) ON DELETE SET NULL;');

        EXEC(@pre + N'
        IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = ''IX_MouvementsStock_FournisseurId'')
            CREATE INDEX IX_MouvementsStock_FournisseurId ON dbo.MouvementsStock (FournisseurId);');

        PRINT @db + ' : OK';
    END TRY
    BEGIN CATCH
        PRINT @db + ' : ERREUR - ' + ERROR_MESSAGE();
    END CATCH

    FETCH NEXT FROM c INTO @db;
END

CLOSE c;
DEALLOCATE c;
