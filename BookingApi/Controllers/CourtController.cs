using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;
using System.Security.Claims;

namespace BookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourtController : ControllerBase
    {
        private readonly ICourtService _courtService;

        public CourtController(ICourtService courtService)
        {
            _courtService = courtService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] CourtRequest request)
        {
            var result = await _courtService.GetAll(request);
            return Ok(ApiDataResponse<PagedResult<CourtResponse>>.Ok(result, "Success"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _courtService.GetById(id);
            return Ok(ApiDataResponse<CourtResponse>.Ok(result, "Success"));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] CourtRequest request, IFormFile? file)
        {
            // var role = User.FindFirst("role")?.Value;
            // if (role != "Admin") return Forbid();

            var createdUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _courtService.Create(request, file, createdUser, ipAddress);
            return Ok(ApiResponse.Ok("เพิ่มข้อมูลสำเร็จ"));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromForm] CourtRequest request, IFormFile? file)
        {
            // var role = User.FindFirst("role")?.Value;
            // if (role != "Admin") return Forbid();

            var updatedUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _courtService.Update(id, request, file, updatedUser, ipAddress);
            return Ok(ApiResponse.Ok("อัพเดตข้อมูลสำเร็จ"));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _courtService.Delete(id);
            return Ok(ApiResponse.Ok("ลบข้อมูลสำเร็จ"));
        }

        [HttpGet("{id}/courtavailable")]
        [Authorize]
        public async Task<IActionResult> GetAvailability(int id, [FromQuery] DateTime date)
        {
            var result = await _courtService.GetAvailability(id, date);
            return Ok(ApiDataResponse<List<CourtAvailableResponse>>.Ok(result, "Get successful"));
        }
    }
}