using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Invoice;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _service;

    public InvoiceController(IInvoiceService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAll();
        return Ok(new ApiResponse<IEnumerable<InvoiceDto>>(
            true,
            "Invoices retrieved successfully",
            data));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Create(CreateInvoiceDto dto)
    {
        await _service.Add(dto);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<string>(
            true, "Invoice created successfully", null));
    }
}
