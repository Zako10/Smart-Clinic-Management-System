using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Invoice;
using SmartClinic.Application.Interfaces;
using SmartClinic.Application.Services;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly InvoiceService _service;

    public InvoiceController(InvoiceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAll();
        return Ok(new ApiResponse<IEnumerable<InvoiceDto>>(true, "Success", data));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateInvoiceDto dto)
    {
        await _service.Add(dto);

        return Created("", new ApiResponse<string>(
            true, "Invoice created", null));
    }
}
