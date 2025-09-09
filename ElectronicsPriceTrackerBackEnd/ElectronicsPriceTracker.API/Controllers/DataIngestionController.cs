using System.Globalization;
using System.Text.RegularExpressions;
using ElectronicsPriceTracker.Application.DTOs;
using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsPriceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataIngestionController : ControllerBase
{
    private readonly ILogger<DataIngestionController> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public DataIngestionController(IUnitOfWork unitOfWork, ILogger<DataIngestionController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpPost("ingest")]
    public async Task<IActionResult> IngestData([FromBody] List<ScrapedProductDto> scrapedProducts)
    {
        if (scrapedProducts == null || !scrapedProducts.Any())
        {
            _logger.LogWarning("IngestData called with no products.");
            return BadRequest("No products to ingest.");
        }

        _logger.LogInformation("Received {Count} products for ingestion.", scrapedProducts.Count);
        var successCount = 0;
        var errorCount = 0;
        var processedUrlsInBatch = new HashSet<string>();

        foreach (var dto in scrapedProducts)
        {
            if (string.IsNullOrWhiteSpace(dto.ProductTitle) || string.IsNullOrWhiteSpace(dto.ProductUrl) ||
                string.IsNullOrWhiteSpace(dto.PlatformName))
            {
                _logger.LogWarning(
                    "Skipping DTO due to missing essential fields: Title='{Title}', Url='{Url}', Platform='{Platform}'.",
                    dto.ProductTitle, dto.ProductUrl, dto.PlatformName);
                errorCount++;
                continue;
            }

            var uniqueKeyForBatch = $"{dto.PlatformName}|{dto.ProductUrl}";
            if (processedUrlsInBatch.Contains(uniqueKeyForBatch))
            {
                _logger.LogInformation(
                    "Skipping duplicate ProductUrl '{ProductUrl}' on Platform '{PlatformName}' already processed in this batch.",
                    dto.ProductUrl, dto.PlatformName);
                continue;
            }

            try
            {
                var platform = await _unitOfWork.Platforms.FindOneAsync(p => p.Name == dto.PlatformName);
                if (platform == null)
                {
                    platform = new Platform
                    {
                        Name = dto.PlatformName,
                        Url = DeterminePlatformBaseUrl(dto.PlatformName, dto.ProductUrl)
                    };
                    await _unitOfWork.Platforms.AddAsync(platform);
                    await _unitOfWork.SaveAsync();
                    _logger.LogInformation("Created new platform: {PlatformName} with ID {PlatformId}", platform.Name,
                        platform.PlatformId);
                }

                var listing = await _unitOfWork.Listings.FindOneAsync(l =>
                    l.Url == dto.ProductUrl && l.PlatformId == platform.PlatformId);
                Product product;

                if (listing != null)
                {
                    _logger.LogInformation(
                        "Found existing listing (ID: {ListingId}) for URL '{ProductUrl}' on platform '{PlatformName}'.",
                        listing.ListingId, dto.ProductUrl, platform.Name);
                    product = await _unitOfWork.Products.GetByIdAsync(listing.ProductId);
                    if (product == null)
                    {
                        _logger.LogError(
                            "CRITICAL: Product with ID {ProductId} not found for existing ListingID {ListingId}. Data inconsistency. Skipping.",
                            listing.ProductId, listing.ListingId);
                        errorCount++;
                        continue;
                    }

                    // Update existing product's image paths if they are different or new
                    var productUpdated = false;
                    if (product.ImageUrl != dto.ProductImageUrl && !string.IsNullOrWhiteSpace(dto.ProductImageUrl))
                    {
                        product.ImageUrl = dto.ProductImageUrl;
                        productUpdated = true;
                    }

                    if (product.ScrapedImageLocalPath != dto.ProductImageLocalPath &&
                        !string.IsNullOrWhiteSpace(dto.ProductImageLocalPath))
                    {
                        product.ScrapedImageLocalPath = dto.ProductImageLocalPath;
                        productUpdated = true;
                    }

                    // Update other product details if necessary
                    if (product.Name != dto.ProductTitle)
                    {
                        product.Name = dto.ProductTitle;
                        productUpdated = true;
                    }

                    if (product.Category != (dto.CategoryName ?? "Unknown"))
                    {
                        product.Category = dto.CategoryName ?? "Unknown";
                        productUpdated = true;
                    }


                    if (productUpdated)
                    {
                        _unitOfWork.Products.Update(product);
                        _logger.LogInformation("Updating product '{ProductName}' (ID: {ProductId}) details.",
                            product.Name, product.ProductId);
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "No existing listing for URL '{ProductUrl}' on platform '{PlatformName}'. Creating new product and listing.",
                        dto.ProductUrl, platform.Name);
                    product = new Product
                    {
                        Name = dto.ProductTitle,
                        Category = dto.CategoryName ?? "Unknown",
                        ImageUrl = dto.ProductImageUrl,
                        ScrapedImageLocalPath = dto.ProductImageLocalPath
                    };
                    await _unitOfWork.Products.AddAsync(product);
                    await _unitOfWork.SaveAsync();
                    _logger.LogInformation("Created new product '{ProductName}' (ID: {ProductId}).", product.Name,
                        product.ProductId);

                    listing = new Listing
                    {
                        ProductId = product.ProductId,
                        PlatformId = platform.PlatformId,
                        Url = dto.ProductUrl
                    };
                    await _unitOfWork.Listings.AddAsync(listing);
                    await _unitOfWork.SaveAsync();
                    _logger.LogInformation("Created new listing (ID: {ListingId}) for the new product.",
                        listing.ListingId);
                }

                if (TryParsePrice(dto.ProductPrice, out var currentPriceNumeric))
                {
                    if (listing.CurrentPrice != currentPriceNumeric)
                    {
                        listing.CurrentPrice = currentPriceNumeric;
                        _unitOfWork.Listings.Update(listing);
                        _logger.LogDebug("Updating listing (ID: {ListingId}) price to {Price}.", listing.ListingId,
                            currentPriceNumeric);
                    }


                    var mostRecentPriceEntry = (await _unitOfWork.PriceHistories.GetAllAsync())
                        .Where(ph => ph.ListingId == listing.ListingId)
                        .OrderByDescending(ph => ph.DateRecorded)
                        .FirstOrDefault();

                    var addNewHistory = false;
                    if (mostRecentPriceEntry == null || mostRecentPriceEntry.Price != currentPriceNumeric)
                        addNewHistory = true;
                    else if (mostRecentPriceEntry.Price == currentPriceNumeric &&
                             mostRecentPriceEntry.DateRecorded.Date != DateTime.UtcNow.Date)
                        addNewHistory = true;
                    else
                        _logger.LogDebug(
                            "Price {Price} for listing {ListingId} is same as last record today. Skipping new price history entry.",
                            currentPriceNumeric, listing.ListingId);

                    if (addNewHistory)
                    {
                        var priceHistoryEntry = new PriceHistory
                        {
                            ListingId = listing.ListingId,
                            Price = currentPriceNumeric,
                            DateRecorded = DateTime.UtcNow
                        };
                        await _unitOfWork.PriceHistories.AddAsync(priceHistoryEntry);
                        _logger.LogDebug("Adding new price history for ListingID {ListingId}, Price: {Price}",
                            listing.ListingId, currentPriceNumeric);
                    }
                }
                else
                {
                    _logger.LogWarning(
                        "Could not parse price '{ProductPrice}' for listing URL '{ProductUrl}'. Price not updated.",
                        dto.ProductPrice, dto.ProductUrl);
                }

                await _unitOfWork.SaveAsync();

                processedUrlsInBatch.Add(uniqueKeyForBatch);
                successCount++;
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx,
                    "Database update error ingesting product DTO with Title '{ProductTitle}' and URL '{ProductUrl}': {ErrorMessage}. Inner: {InnerMessage}",
                    dto.ProductTitle, dto.ProductUrl, dbEx.Message, dbEx.InnerException?.Message);
                errorCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Generic error ingesting product DTO with Title '{ProductTitle}' and URL '{ProductUrl}': {ErrorMessage}",
                    dto.ProductTitle, dto.ProductUrl, ex.Message);
                errorCount++;
            }
        }

        _logger.LogInformation(
            "Ingestion batch complete. Processed attempts: {TotalAttempts}, Success: {SuccessCount}, Errors: {ErrorCount}",
            scrapedProducts.Count, successCount, errorCount);
        return Ok(new
        {
            message =
                $"Ingestion complete. Success: {successCount}, Errors: {errorCount} out of {scrapedProducts.Count} DTOs received."
        });
    }

    private bool TryParsePrice(string? priceString, out float parsedPrice)
    {
        parsedPrice = 0;
        if (string.IsNullOrWhiteSpace(priceString) ||
            priceString.Equals("N/A", StringComparison.OrdinalIgnoreCase)) return false;
        var cleanedPriceString = Regex.Replace(priceString, @"[^\d\.]", "");
        if (string.IsNullOrWhiteSpace(cleanedPriceString)) return false;
        if (float.TryParse(cleanedPriceString, NumberStyles.Any, CultureInfo.InvariantCulture, out parsedPrice))
            return true;
        return false;
    }

    private string DeterminePlatformBaseUrl(string platformName, string productUrl)
    {
        if (!string.IsNullOrWhiteSpace(productUrl))
            try
            {
                var uri = new Uri(productUrl);
                if ((uri.Scheme == "http" || uri.Scheme == "https") && !string.IsNullOrWhiteSpace(uri.Host))
                    return $"{uri.Scheme}://{uri.Host}";
            }
            catch (UriFormatException ex)
            {
                _logger.LogWarning(ex, "Could not parse ProductUrl '{ProductUrl}' to determine platform base URL.",
                    productUrl);
            }

        return platformName.ToLowerInvariant().Trim() switch
        {
            "amazon" => "https://www.amazon.eg",
            "jumia" => "https://www.jumia.com.eg",
            "2b" => "https://2b.com.eg",
            _ => "N/A"
        };
    }
}