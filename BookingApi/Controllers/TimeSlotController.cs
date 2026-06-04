using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;
using System.Security.Claims;

namespace BookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeSlotController : ControllerBase
    {
        private readonly ITimeSlotService _timeSlotService;

        public TimeSlotController(ITimeSlotService timeSlotService)
        {
            _timeSlotService = timeSlotService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] TimeSlotRequest request)
        {
            var result = await _timeSlotService.GetAll(request);
            return Ok(ApiDataResponse<PagedResult<TimeSlotResponse>>.Ok(result, "Get time slots successful"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _timeSlotService.GetById(id);
            return Ok(ApiDataResponse<TimeSlotResponse>.Ok(result, "Get time slot successful"));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] TimeSlotRequest request)
        {
            // var role = User.FindFirst("role")?.Value;
            // if (role != "Admin") return Forbid();

            var createdUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "unknown";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            await _timeSlotService.Create(request, createdUser, ipAddress);
            return Ok(ApiResponse.Ok("เพิ่มข้อมูลสำเร็จ"));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] TimeSlotRequest request)
        {
            var updatedUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _timeSlotService.Update(id, request, updatedUser, ipAddress);
            return Ok(ApiResponse.Ok("อัพเดตข้อมูลสำเร็จ"));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            await _timeSlotService.Delete(id);
            return Ok(ApiResponse.Ok("ลบข้อมูลสำเร็จ"));
        }
    }
}