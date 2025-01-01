using Microsoft.AspNetCore.Mvc;
using PropertyAppApi.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Include this to enable logging

namespace PropertyAppApi.Controllers
{
    [ApiController]
    [Route("api/properties")]
    public class PropertiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PropertiesController> _logger; // Dependency injection of logger

        public PropertiesController(ApplicationDbContext context, ILogger<PropertiesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Fetch all properties
        [HttpGet]
        public IActionResult Get()
        {
            var properties = _context.Properties.ToList();
            return Ok(properties);
        }

        // Create a new property
        [HttpPost]
        public async Task<IActionResult> CreateProperty([FromBody] Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return CreatedAtAction("Get", new { id = property.Id }, property);
        }

        // Update user preferences
        [HttpPost("update-preferences")]
        public async Task<IActionResult> UpdateUserPreferences([FromBody] UserPreferenceUpdateDto request)
        {
            _logger.LogInformation("Updating user preferences for User ID: {UserId}, Key: {Key}", request.UserId, request.Key);
            var existingPreference = await _context.UserPreferences
                .FirstOrDefaultAsync(up => up.UserId == request.UserId && up.Key == request.Key);

            if (existingPreference != null)
            {
                _logger.LogInformation("Found existing preference, updating value...");
                existingPreference.Value = request.Value;
            }
            else
            {
                _logger.LogInformation("No existing preference found, creating new one...");
                _context.UserPreferences.Add(new UserPreference
                {
                    UserId = request.UserId,
                    Key = request.Key,
                    Value = request.Value
                });
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("User preferences updated successfully.");
            return NoContent(); // 204 No Content
        }

        // Get user preferences by user ID
        [HttpGet("get-user-preferences/{userId}")]
        public IActionResult GetUserPreferences(int userId)
        {
            _logger.LogInformation("Fetching preferences for User ID: {UserId}", userId);
            var preferences = _context.UserPreferences.Where(p => p.UserId == userId).ToList();
            if (preferences == null || preferences.Count == 0)
            {
                _logger.LogWarning("No preferences found for User ID: {UserId}", userId);
                return NotFound(); // Return 404 if no preferences found
            }
            return Ok(preferences);
        }
    }
}
