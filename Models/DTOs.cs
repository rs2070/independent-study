namespace PropertyAppApi.Models
{
    public class UserPreferenceUpdateDto
    {
        public int UserId { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
