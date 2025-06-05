namespace LaunchTrace.Models;

public class Supplier
{
    public int SupplierId { get; set; }
    public string Name { get; set; } = "";
    
    // Navigation properties
    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
}
