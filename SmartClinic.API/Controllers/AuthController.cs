using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartClinic.API.Extensions;
using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Auth.Handlers;
using SmartClinic.Application.Common.Responses;

namespace SmartClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RegisterHandler _registerHandler;
    private readonly LoginHandler _loginHandler;

    public AuthController(RegisterHandler registerHandler, LoginHandler loginHandler)
    {
        _registerHandler = registerHandler;
        _loginHandler = loginHandler;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _registerHandler.Handle(command);

        return StatusCode(StatusCodes.Status201Created, new ApiResponse<object>(
            true,
            "User registered successfully",
            result));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _loginHandler.Handle(command);

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
