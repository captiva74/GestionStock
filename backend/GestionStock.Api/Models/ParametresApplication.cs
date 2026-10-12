using System.ComponentModel.DataAnnotations;

namespace GestionStock.Api.Models;

public class ParametresApplication
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string? EmailAlerteStock { get; set; }
}
