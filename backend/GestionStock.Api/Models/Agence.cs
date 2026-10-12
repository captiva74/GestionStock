namespace GestionStock.Api.Models;

public class Agence
{
    public int CodeStructure { get; set; }
    public string Nom { get; set; } = default!;
    public string CodeInscription { get; set; } = default!;
    public bool EstActive { get; set; }
}