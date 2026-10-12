USE GestionStockDb;
GO
IF OBJECT_ID('dbo.Agences') IS NULL
CREATE TABLE dbo.Agences (
    code_structure  INT           NOT NULL PRIMARY KEY
        CONSTRAINT CK_Agences_code CHECK (code_structure BETWEEN 201 AND 269),
    Nom             NVARCHAR(100) NOT NULL,
    CodeInscription NVARCHAR(50)  NOT NULL,
    EstActive       BIT           NOT NULL CONSTRAINT DF_Agences_EstActive DEFAULT 1
);
GO
DECLARE @i INT = 201;
WHILE @i <= 269
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Agences WHERE code_structure = @i)
        INSERT INTO dbo.Agences (code_structure, Nom, CodeInscription)
        VALUES (@i, 'Agence ' + CAST(@i - 200 AS VARCHAR(2)),
                LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 8));
    SET @i += 1;
END
GO
