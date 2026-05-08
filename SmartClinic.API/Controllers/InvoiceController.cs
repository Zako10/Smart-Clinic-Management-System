using System.ComponentModel.DataAnnotations;
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

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Get([Range(1, int.MaxValue)] int id)
    {
        var invoice = await _service.GetById(id);
        if (invoice == null)
            return NotFound(new ApiResponse<string>(
                false, "Invoice not found", null));

        return Ok(new ApiResponse<InvoiceDto>(
            true,
            "Invoice retrieved successfully",
            invoice));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Create(CreateInvoiceDto dto)
    {
        await _service.Add(dto);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<string>(
            true, "Invoice created successfully", null));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Update([Range(1, int.MaxValue)] int id, CreateInvoiceDto dto)
    {
        await _service.Update(id, dto);

        return Ok(new ApiResponse<string>(
            true, "Invoice updated successfully", null));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete([Range(1, int.MaxValue)] int id)
    {
        await _service.Delete(id);

        return Ok(new ApiResponse<string>(
            true, "Invoice deleted successfully", null));
    }
}
