using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace ElectronicsPriceTracker.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Roles = "Admin")]

    public class ScraperController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ScraperController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetScraperStatus()
        {
            try
            {
                var scraperServiceUrl = _configuration["ScraperServiceUrl"];
                if (string.IsNullOrEmpty(scraperServiceUrl))
                {
                    return StatusCode(500, "Scraper service URL is not configured.");
                }

                var response = await _httpClient.GetAsync($"{scraperServiceUrl}/scrapers/status");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Ok(JsonDocument.Parse(content).RootElement);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, $"Error calling scraper service: {response.StatusCode} - {errorContent}");
                }
            }
            catch (HttpRequestException e)
            {
                return StatusCode(500, $"Error connecting to scraper service: {e.Message}");
            }
        }
    }
}
