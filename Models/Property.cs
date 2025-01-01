namespace PropertyAppApi.Models
{
    public class Property
    {
        public int Id { get; set; }
        public string? Address { get; set; }  // Make nullable if that's acceptable
        public decimal Price { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public int SqFt { get; set; }
    }
}
