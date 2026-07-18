using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.API.Extensions;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.DTOs.Auth;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.Register(request);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<object>(
            true,
            "User registered successfully",
            result));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.Login(request);

        return Ok(new ApiResponse<object>(
            true,
            "Login successful",
            result
        ));
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.GetUserId();
        var role = User.GetRole();
        var clinicId = User.GetClinicId();

        return Ok(new ApiResponse<object>(
            true,
            "User claims retrieved",
            new
            {
                UserId = userId,
                Role = role,
                ClinicId = clinicId
            }));
    }
}
