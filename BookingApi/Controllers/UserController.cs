using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;
using System.Security.Claims;

namespace BookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] UserRequest request)
        {
            var result = await _userService.GetAll(request);
            return Ok(ApiDataResponse<PagedResult<UserResponse>>.Ok(result, "Success"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userService.GetById(id);
            return Ok(ApiDataResponse<UserResponse>.Ok(result, "Success"));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UserRequest request)
        {
            var updatedUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _userService.Update(id, request, updatedUser, ipAddress);
            return Ok(ApiResponse.Ok("อัพเดตข้อมูลสำเร็จ"));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _userService.Delete(id);
            return Ok(ApiResponse.Ok("ลบข้อมูลสำเร็จ"));
        }
    }
}