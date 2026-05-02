using Microsoft.AspNetCore.Mvc;
using SmartClinic.Application.Services;
using SmartClinic.Domain.Entities;
using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Application.Common.Responses;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientController : ControllerBase
{
    private readonly PatientService _service;

    public PatientController(PatientService service)
    {
        _service = service;
    }

    [HttpGet]
public async Task<IActionResult> GetAll()
{
    var data = await _service.GetAll();

    return Ok(new ApiResponse<IEnumerable<PatientDto>>(
        true,
        "Patients retrieved successfully",
        data
    ));
}

    [HttpGet("{id}")]
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
public async Task<IActionResult> Create(CreatePatientDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(new ApiResponse<string>(
            false,
            "Invalid data",
            null
        ));

    await _service.Add(dto);

    return Created("", new ApiResponse<string>(
        true,
        "Patient created successfully",
        null
    ));
}

    [HttpPut("{id}")]
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
