namespace LaunchTrace.Models;

public class PartDto
{
    public int PartId { get; set; }
    public string Name { get; set; } = "";
    public string Status { get; set; } = "";
    public int SupplierId { get; set; }
    public SupplierDto Supplier { get; set; } = new();
}

public class SupplierDto
{
    public int SupplierId { get; set; }
    public string Name { get; set; } = "";
}

public class PartsResponse
{
    public int Total { get; set; }
    public List<PartDto> Items { get; set; } = new();
}

public class BuildDto
{
    public int BuildId { get; set; }
    public string SerialNumber { get; set; } = "";
    public DateTime BuildDate { get; set; }
}

public class BuildPartDto
{
    public int PartId { get; set; }
    public string PartName { get; set; } = "";
    public PartStatus PartStatus { get; set; }
    public int Quantity { get; set; }
    public string SupplierName { get; set; } = "";
}

public class BuildDetailDto
{
    public int BuildId { get; set; }
    public string SerialNumber { get; set; } = "";
    public DateTime BuildDate { get; set; }
    public int PartCount { get; set; }
    public int FaultyPartCount { get; set; }
    public List<PartDto> Parts { get; set; } = new();
}

public class CreateBuildRequest
{
    public string SerialNumber { get; set; } = "";
    public DateTime BuildDate { get; set; }
    public List<int> PartIds { get; set; } = new();
}
