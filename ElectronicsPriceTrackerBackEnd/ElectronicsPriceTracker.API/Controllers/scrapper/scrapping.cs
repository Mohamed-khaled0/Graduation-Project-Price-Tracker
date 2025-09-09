using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.API.Controllers.Scrapper;
[ApiController]
[Route("api/[controller]")]
public class ScraperController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public ScraperController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpPost("amazon")]
    public async Task<IActionResult> TriggerAmazonScrape()
    {
        var response = await _httpClient.PostAsync("http://localhost:8000/scrape/amazon", null);

        if (response.IsSuccessStatusCode)
            return Ok("Amazon scrape triggered successfully.");
        
        var error = await response.Content.ReadAsStringAsync();
        return StatusCode((int)response.StatusCode, $"Error: {error}");
    }

    [HttpPost("2b")]
    public async Task<IActionResult> Trigger2BScrape()
    {
        var response = await _httpClient.PostAsync("http://localhost:8000/scrape/2b", null);
        var content = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
            return Ok(content);

        return StatusCode((int)response.StatusCode, $"Error: {content}");
    }

    [HttpPost("jumia")]
    public async Task<IActionResult> TriggerJumiaScrape()
    {
        var response = await _httpClient.PostAsync("http://localhost:8000/scrape/jumia", null);
        var content = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
            return Ok(content);

        return StatusCode((int)response.StatusCode, $"Error: {content}");
    }
}
