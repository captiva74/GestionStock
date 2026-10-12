USE master;
GO
DECLARE @i INT = 1;
DECLARE @nom NVARCHAR(50);
WHILE @i <= 69
BEGIN
    SET @nom = 'GestionStockDb' + RIGHT('0' + CAST(@i AS VARCHAR(2)), 2);
    IF DB_ID(@nom) IS NULL
        EXEC('CREATE DATABASE [' + @nom + ']');
    SET @i += 1;
END
GO
