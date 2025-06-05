namespace LaunchTrace.Models;

public class Build
{
    public int BuildId { get; set; }
    public string SerialNumber { get; set; } = "";
    public DateTime BuildDate { get; set; }
    
    // Navigation properties
    public virtual ICollection<BuildPart> BuildParts { get; set; } = new List<BuildPart>();
}
