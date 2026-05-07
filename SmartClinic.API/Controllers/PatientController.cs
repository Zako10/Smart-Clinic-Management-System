using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.Interfaces;
using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Application.Common.Responses;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly IPatientService _service;

    public PatientController(IPatientService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationRequest request)
    {
        var data = await _service.GetPagedAsync(request);

        return Ok(new ApiResponse<PaginatedResult<PatientDto>>(
            true,
            "Patients retrieved successfully",
            data));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Get(int id)
    {
        var patient = await _service.GetById(id);

        if (patient == null)
            return NotFound(new ApiResponse<string>(
                false,
                "Patient not found",
                null
            ));

        return Ok(new ApiResponse<PatientDto>(
            true,
            "Patient retrieved successfully",
            patient
        ));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Create(CreatePatientDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false,
                "Invalid data",
                null
            ));

        await _service.Add(dto);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<string>(
            true,
            "Patient created successfully",
            null
        ));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrReceptionist")]
    public async Task<IActionResult> Update(int id, CreatePatientDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiResponse<string>(
                false,
                "Invalid data",
                null
            ));

        var existing = await _service.GetById(id);

        if (existing == null)
            return NotFound(new ApiResponse<string>(
                false,
                "Patient not found",
                null
            ));

        await _service.Update(id, dto);

        return Ok(new ApiResponse<string>(
            true,
            "Patient updated successfully",
            null
        ));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetById(id);

        if (existing == null)
            return NotFound(new ApiResponse<string>(
                false,
                "Patient not found",
                null
            ));

        await _service.Delete(id);

        return Ok(new ApiResponse<string>(
            true,
            "Patient deleted successfully",
            null
        ));
    }
}
