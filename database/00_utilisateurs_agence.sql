USE GestionStockDb;
GO
IF COL_LENGTH('dbo.Utilisateurs', 'code_structure') IS NULL
    ALTER TABLE dbo.Utilisateurs
    ADD code_structure INT NOT NULL
        CONSTRAINT DF_Utilisateurs_code_structure DEFAULT 201
        CONSTRAINT CK_Utilisateurs_code_structure CHECK (code_structure BETWEEN 201 AND 269);
GO
IF COL_LENGTH('dbo.Utilisateurs', 'nom_base') IS NULL
    ALTER TABLE dbo.Utilisateurs
    ADD nom_base AS ('GestionStockDb' + RIGHT('0' + CAST(code_structure - 200 AS VARCHAR(2)), 2));
GO
