using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Appointment;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentController(IAppointmentService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrDoctor")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationRequest request)
    {
        var data = await _service.GetPagedAsync(request);

        return Ok(new ApiResponse<PaginatedResult<AppointmentDto>>(
            true,
            "Appointment retrieved successfully",
            data));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOrDoctor")]
    public async Task<IActionResult> Get(int id)
    {
        var appointment = await _service.GetById(id);
        if (appointment == null)
            return NotFound(new ApiResponse<string>(
                false, "Appointment not found", null));
        return Ok(new ApiResponse<AppointmentDto>(
            true, "Appointment retrieved successfully", appointment));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Create(CreateAppointmentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false, "Invalid data", null));
        await _service.Add(dto);
        return StatusCode(StatusCodes.Status201Created, new ApiResponse<string>(
            true, "Appointment created successfully", null));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrDoctor")]
    public async Task<IActionResult> Update(int id, CreateAppointmentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false, "Invalid data", null));
        var existing = await _service.GetById(id);
        if (existing == null)
            return NotFound(new ApiResponse<string>(
                false, "Appointment not found", null));
        await _service.Update(id, dto);
        return Ok(new ApiResponse<string>(
            true, "Appointment updated successfully", null));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetById(id);
        if (existing == null)
            return NotFound(new ApiResponse<string>(
                false, "Appointment not found", null));
        await _service.Delete(id);
        return Ok(new ApiResponse<string>(
            true, "Appointment deleted successfully", null));
    }
}
