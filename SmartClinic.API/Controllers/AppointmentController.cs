using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Appointment;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentController(IAppointmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var appointments = await _service.GetAll();
        return Ok(new ApiResponse<IEnumerable<AppointmentDto>>(
            true, "Appointments retrieved successfully", appointments));
    }

    [HttpGet("{id}")]
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
    public async Task<IActionResult> Create(CreateAppointmentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false, "Invalid data", null));
        await _service.Add(dto);
        return Ok(new ApiResponse<string>(
            true, "Appointment created successfully", null));
    }

    [HttpPut("{id}")]
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