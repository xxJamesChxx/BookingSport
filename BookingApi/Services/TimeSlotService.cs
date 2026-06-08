using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Exceptions;
using BookingApi.Models;

namespace BookingApi.Services
{
    public interface ITimeSlotService
    {
        Task<PagedResult<TimeSlotResponse>> GetAll(TimeSlotRequest request);
        Task<TimeSlotResponse> GetById(int id);
        Task Create(TimeSlotRequest request, string createdUser, string ipAddress);
        Task Update(int id, TimeSlotRequest request, string updatedUser, string ipAddress);
        Task Delete(int id);
    }

    public class TimeSlotService : ITimeSlotService
    {
        private readonly AppDbContext _db;

        public TimeSlotService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<TimeSlotResponse>> GetAll(TimeSlotRequest request)
        {
            var q = _db.TimeSlots.AsQueryable();

            if (request.IsActive.HasValue)
                q = q.Where(t => t.IsActive == request.IsActive);

            var total = await q.CountAsync();

            var timeSlots = await q
                .OrderByDescending(x => x.CreatedDate)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var items = timeSlots.Select(t => new TimeSlotResponse
            {
                Id = t.Id,
                StartTime = t.StartTime.HasValue
                    ? t.StartTime.Value.ToString(@"hh\:mm")
                    : null,
                EndTime = t.EndTime.HasValue
                    ? t.EndTime.Value.ToString(@"hh\:mm")
                    : null,
                IsActive = t.IsActive,
                CreatedDate = t.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = t.CreatedUser
            }).ToList();

            return new PagedResult<TimeSlotResponse>
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / request.PageSize)
            };
        }

        public async Task<TimeSlotResponse> GetById(int id)
        {
            var timeSlot = await _db.TimeSlots.FirstOrDefaultAsync(t => t.Id == id);
            if (timeSlot == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            return new TimeSlotResponse
            {
                Id = timeSlot.Id,
                StartTime = timeSlot.StartTime.HasValue
                    ? timeSlot.StartTime.Value.ToString(@"hh\:mm")
                    : null,
                EndTime = timeSlot.EndTime.HasValue
                    ? timeSlot.EndTime.Value.ToString(@"hh\:mm")
                    : null,
                IsActive = timeSlot.IsActive,
                CreatedDate = timeSlot.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = timeSlot.CreatedUser
            };
        }

        public async Task Create(TimeSlotRequest request, string createdUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.StartTime))
                throw new AppException("StartTime is required");

            if (string.IsNullOrEmpty(request.EndTime))
                throw new AppException("EndTime is required");

            if (!request.IsActive.HasValue)
                throw new AppException("IsActive is required");

            if (!TimeSpan.TryParse(request.StartTime, out var startTime))
                throw new AppException("StartTime format invalid (HH:mm)");

            if (!TimeSpan.TryParse(request.EndTime, out var endTime))
                throw new AppException("EndTime format invalid (HH:mm)");

            if (endTime <= startTime)
                throw new AppException("EndTime must be greater than StartTime");

            var exists = await _db.TimeSlots.AnyAsync(t =>
                t.StartTime == startTime && t.EndTime == endTime
            );
            if (exists)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ TimeSlot นี้มีอยู่แล้ว");

            var timeSlot = new TimeSlot
            {
                StartTime = startTime,
                EndTime = endTime,
                IsActive = request.IsActive,
                CreatedDate = DateTime.Now,
                CreatedUser = createdUser,
                CreatedIp = ipAddress
            };

            _db.TimeSlots.Add(timeSlot);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ");
        }

        public async Task Update(int id, TimeSlotRequest request, string updatedUser, string ipAddress)
        {
            var timeSlot = await _db.TimeSlots.FirstOrDefaultAsync(t => t.Id == id);
            if (timeSlot == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            if (!string.IsNullOrEmpty(request.StartTime))
            {
                if (!TimeSpan.TryParse(request.StartTime, out var startTime))
                    throw new AppException("เวลาเริ่ม รูปแบบไม่ถูกต้อง (HH:mm)");
                timeSlot.StartTime = startTime;
            }

            if (!string.IsNullOrEmpty(request.EndTime))
            {
                if (!TimeSpan.TryParse(request.EndTime, out var endTime))
                    throw new AppException("เวลาสิ้นสุด รูปแบบไม่ถูกต้อง (HH:mm)");
                timeSlot.EndTime = endTime;
            }

            if (request.IsActive.HasValue)
                timeSlot.IsActive = request.IsActive.Value;

            if (timeSlot.EndTime <= timeSlot.StartTime)
                throw new AppException("กรุณาระบุเวลาสิ้นสุดมากกว่าเวลาเริ่ม");

            timeSlot.UpdatedDate = DateTime.Now;
            timeSlot.UpdatedUser = updatedUser;
            timeSlot.UpdatedIp = ipAddress;

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("อัพเดตข้อมูลไม่สำเร็จ");
        }

        public async Task Delete(int id)
        {
            var timeSlot = await _db.TimeSlots.FirstOrDefaultAsync(t => t.Id == id);
            if (timeSlot == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            _db.TimeSlots.Remove(timeSlot);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("ลบข้อมูลไม่สำเร็จ");
        }
    }
}