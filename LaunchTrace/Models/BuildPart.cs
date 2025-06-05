namespace LaunchTrace.Models;

public class BuildPart
{
    public int BuildId { get; set; }
    public int PartId { get; set; }
    public int Quantity { get; set; }
    
    // Navigation properties
    public virtual Build? Build { get; set; }
    public virtual Part? Part { get; set; }
}
