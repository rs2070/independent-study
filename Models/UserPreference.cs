namespace PropertyAppApi.Models
{
    public class UserPreference
    {
        public int Id { get; set; } // Primary key
        public int UserId { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
