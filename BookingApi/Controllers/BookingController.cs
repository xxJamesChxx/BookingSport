using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingApi.Models;
using BookingApi.Services;
using System.Security.Claims;

namespace BookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] BookingRequest request)
        {
            // Customer ดูเฉพาะของตัวเอง

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "Admin")
            {
                request.UserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? ""; ;
            }

            var result = await _bookingService.GetAll(request);
            return Ok(ApiDataResponse<PagedResult<BookingResponse>>.Ok(result, "Get bookings successful"));
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _bookingService.GetById(id);
            return Ok(ApiDataResponse<BookingResponse>.Ok(result, "Get booking successful"));
        }

        // POST: api/booking
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookingRequest request)
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var createdUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _bookingService.Create(request, userEmail, createdUser, ip);
            return Ok(ApiResponse.Ok("จองสนามสำเร็จ"));

        }

        // PUT: api/booking/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var updatedUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

            await _bookingService.Cancel(id, userEmail, updatedUser, ip);
            return Ok(ApiResponse.Ok("ยกเลิกการจองสำเร็จ"));
        }

    }
}