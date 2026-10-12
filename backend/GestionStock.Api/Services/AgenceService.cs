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

    // Lu dans le jeton signé : le client ne peut pas le modifier
    public int CodeStructure
    {
        get
        {
            var valeur = _accessor.HttpContext?.User.FindFirst("code_structure")?.Value;
            if (!int.TryParse(valeur, out var code) || code < 201 || code > 269)
                throw new UnauthorizedAccessException("Agence invalide ou absente du jeton.");
            return code;
        }
    }

    public string NomBase => Agences.NomBase(CodeStructure);
}