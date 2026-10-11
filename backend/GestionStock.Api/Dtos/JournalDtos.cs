namespace GestionStock.Api.Dtos;

public class JournalActiviteDto
{
    public int Id { get; set; }
    public string NomUtilisateur { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Entite { get; set; } = string.Empty;
    public int? EntiteId { get; set; }
    public string? Details { get; set; }
    public DateTime DateAction { get; set; }
}