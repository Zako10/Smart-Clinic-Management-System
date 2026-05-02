using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.DTOs.Clinic;
using SmartClinic.Application.Interfaces;
using SmartClinic.Application.Common.Responses;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClinicController : ControllerBase
{
    private readonly IClinicService _service;

    public ClinicController(IClinicService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAll();

        return Ok(new ApiResponse<IEnumerable<ClinicDto>>(
            true,
            "Clinics retrieved successfully",
            data
        ));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Get(int id)
    {
        var clinic = await _service.GetById(id);

        if (clinic == null)
        {
            return NotFound(new ApiResponse<string>(
                false,
                "Clinic not found",
                null
            ));
        }

        return Ok(new ApiResponse<ClinicDto>(
            true,
            "Clinic retrieved successfully",
            clinic
        ));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create(CreateClinicDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<string>(
                false,
                "Invalid data",
                null
            ));
        }

        await _service.Add(dto);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<string>(
            true,
            "Clinic created successfully",
            null
        ));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, CreateClinicDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<string>(
                false,
                "Invalid data",
                null
            ));
        }

        var existing = await _service.GetById(id);

        if (existing == null)
        {
            return NotFound(new ApiResponse<string>(
                false,
                "Clinic not found",
                null
            ));
        }

        await _service.Update(id, dto);

        return Ok(new ApiResponse<string>(
            true,
            "Clinic updated successfully",
            null
        ));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetById(id);

        if (existing == null)
        {
            return NotFound(new ApiResponse<string>(
                false,
                "Clinic not found",
                null
            ));
        }

        await _service.Delete(id);

        return Ok(new ApiResponse<string>(
            true,
            "Clinic deleted successfully",
            null
        ));
    }
}
