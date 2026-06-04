using Microsoft.AspNetCore.Mvc;
using BookingApi.Services;
using BookingApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace BookingApi.Controllers
{
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
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            var success = await _authService.Register(request, ipAddress);

            if (!success)
                return BadRequest(ApiResponse.Fail("Email already exists"));

            return Ok(ApiResponse.Ok("Register successful"));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            var forceLogin = Request.Headers["X-Force-Login"].FirstOrDefault() == "true";

            var result = await _authService.Login(request, ipAddress, forceLogin);
            return Ok(ApiDataResponse<AuthResponse>.Ok(result, "Login successful"));
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            var result = await _authService.RefreshToken(request.RefreshToken, ipAddress);

            if (result == null)
                return Unauthorized(ApiResponse.Fail("Invalid or expired refresh token", 401));

            return Ok(ApiDataResponse<AuthResponse>.Ok(result, "Token refreshed successful"));
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
        {
            var success = await _authService.Logout(request.RefreshToken);

            if (!success)
                return BadRequest(ApiResponse.Fail("Invalid refresh token"));

            return Ok(ApiResponse.Ok("Logout successful"));
        }
    }
}