namespace LaunchTrace.Models;

public class Part
{
    public int PartId { get; set; }
    public string Name { get; set; } = "";
    public PartStatus Status { get; set; }
    public int SupplierId { get; set; }
    
    // Navigation properties
    public virtual Supplier? Supplier { get; set; }
    public virtual ICollection<BuildPart> BuildParts { get; set; } = new List<BuildPart>();
}
