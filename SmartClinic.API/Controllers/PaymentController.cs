using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Payment;
using SmartClinic.Application.Services;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly PaymentService _service;

    public PaymentController(PaymentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentDto dto)
    {
        await _service.Add(dto);

        return Ok(new ApiResponse<string>(
            true, "Payment successful", null));
    }
}
