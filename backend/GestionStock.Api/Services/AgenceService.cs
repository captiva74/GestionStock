namespace GestionStock.Api.Services;

public interface IAgenceService
{
    int CodeStructure { get; }
    string NomBase { get; }
}

public class AgenceService : IAgenceService
{
    private readonly IHttpContextAccessor _accessor;

    public AgenceService(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public int CodeStructure
    {
        get
        {
            var http = _accessor.HttpContext;
            var user = http?.User;

            // Seul le siège (rôle Admin) peut consulter une autre agence
            if (user is not null && user.IsInRole("Admin"))
            {
                var entete = http!.Request.Headers["X-Agence"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(entete))
                {
                    if (int.TryParse(entete, out var choisi) && choisi >= 201 && choisi <= 269)
                        return choisi;

                    throw new UnauthorizedAccessException("Agence demandée invalide.");
                }
            }

            // Pour tous les autres : le code vient du jeton signé
            var valeur = user?.FindFirst("code_structure")?.Value;
            if (!int.TryParse(valeur, out var code) || code < 201 || code > 269)
                throw new UnauthorizedAccessException("Agence invalide ou absente du jeton.");

            return code;
        }
    }

    public string NomBase => Agences.NomBase(CodeStructure);
}