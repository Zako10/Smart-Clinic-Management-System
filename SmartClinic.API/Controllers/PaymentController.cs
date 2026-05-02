using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Payment;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentController(IPaymentService service)
    {
        _service = service;
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Create(CreatePaymentDto dto)
    {
        await _service.Add(dto);

        return Ok(new ApiResponse<string>(
            true, "Payment created successfully", null));
    }
}
