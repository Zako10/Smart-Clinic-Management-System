using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Doctor;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DoctorController : ControllerBase
{
    private readonly IDoctorService _service;

    public DoctorController(IDoctorService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrDoctor")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationRequest request)
    {
        var data = await _service.GetPagedAsync(request);

        return Ok(new ApiResponse<PaginatedResult<DoctorDto>>(
            true,
            "Doctors retrieved successfully",
            data));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOrDoctor")]
    public async Task<IActionResult> Get(int id)
    {
        var doctor = await _service.GetById(id);
        if (doctor == null)
            return NotFound(new ApiResponse<string>(
                false, "Doctor not found", null));
        return Ok(new ApiResponse<DoctorDto>(
            true, "Doctor retrieved successfully", doctor));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create(CreateDoctorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false, "Invalid data", null));
        await _service.Add(dto);
        return StatusCode(StatusCodes.Status201Created, new ApiResponse<string>(
            true, "Doctor created successfully", null));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, CreateDoctorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false, "Invalid data", null));
        var existing = await _service.GetById(id);
        if (existing == null)
            return NotFound(new ApiResponse<string>(
                false, "Doctor not found", null));
        await _service.Update(id, dto);
        return Ok(new ApiResponse<string>(
            true, "Doctor updated successfully", null));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetById(id);
        if (existing == null)
            return NotFound(new ApiResponse<string>(
                false, "Doctor not found", null));
        await _service.Delete(id);
        return Ok(new ApiResponse<string>(
            true, "Doctor deleted successfully", null));
    }
}
