using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;
using System.Security.Claims;

namespace BookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] RoleRequest request)
        {
            var result = await _roleService.GetAll(request);
            return Ok(ApiDataResponse<PagedResult<RoleResponse>>.Ok(result, "Success"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _roleService.GetById(id);
            return Ok(ApiDataResponse<RoleResponse>.Ok(result, "Success"));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] RoleRequest request)
        {
            // var role = User.FindFirst("role")?.Value;
            // if (role != "Admin") return Forbid();

            var createdUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "unknown";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            await _roleService.Create(request, createdUser, ipAddress);
            return Ok(ApiResponse.Ok("เพิ่มข้อมูลสำเร็จ"));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] RoleRequest request)
        {
            var updatedUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _roleService.Update(id, request, updatedUser, ipAddress);
            return Ok(ApiResponse.Ok("อัพเดตข้อมูลสำเร็จ"));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _roleService.Delete(id);
            return Ok(ApiResponse.Ok("ลบข้อมูลสำเร็จ"));
        }
    }
}