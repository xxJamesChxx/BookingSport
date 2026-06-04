using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;
using System.Security.Claims;

namespace BookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SportTypeController : ControllerBase
    {
        private readonly ISportTypeService _sportTypeService;

        public SportTypeController(ISportTypeService sportTypeService)
        {
            _sportTypeService = sportTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] SportTypeRequest request)
        {
            var result = await _sportTypeService.GetAll(request);
            return Ok(ApiDataResponse<PagedResult<SportTypeResponse>>.Ok(result, "Success"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _sportTypeService.GetById(id);
            return Ok(ApiDataResponse<SportTypeResponse>.Ok(result, "Success"));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] SportTypeRequest request)
        {
            var createdUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _sportTypeService.Create(request, createdUser, ipAddress);
            return Ok(ApiResponse.Ok("เพิ่มข้อมูลสำเร็จ"));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] SportTypeRequest request)
        {
            var updatedUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _sportTypeService.Update(id, request, updatedUser, ipAddress);
            return Ok(ApiResponse.Ok("อัพเดตข้อมูลสำเร็จ"));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _sportTypeService.Delete(id);
            return Ok(ApiResponse.Ok("ลบข้อมูลสำเร็จ"));
        }
    }
}