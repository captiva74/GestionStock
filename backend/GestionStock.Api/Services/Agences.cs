namespace GestionStock.Api.Services;

public static class Agences
{
    public const string Prefixe = "GestionStockDb";

    public static string NomBase(int codeStructure)
    {
        if (codeStructure < 201 || codeStructure > 269)
            throw new ArgumentOutOfRangeException(nameof(codeStructure), "Code agence invalide.");

        return Prefixe + (codeStructure - 200).ToString("00");
    }
}