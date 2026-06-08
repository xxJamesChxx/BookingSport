using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Exceptions;
using BookingApi.Models;

namespace BookingApi.Services
{
    public interface ICourtService
    {
        Task<PagedResult<CourtResponse>> GetAll(CourtRequest request);
        Task<CourtResponse> GetById(int id);
        Task Create(CourtRequest request, IFormFile? file, string createdUser, string ipAddress);
        Task Update(int id, CourtRequest request, IFormFile? file, string updatedUser, string ipAddress);
        Task Delete(int id);
        Task<List<CourtAvailableResponse>> GetAvailability(int courtId, DateTime date);
    }

    public class CourtService : ICourtService
    {
        private readonly AppDbContext _db;

        public CourtService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<CourtResponse>> GetAll(CourtRequest request)
        {
            var q = from c in _db.Courts
                    join s in _db.SportTypes on c.SportTypeId equals s.Id
                    select new { c, s };

            if (!string.IsNullOrEmpty(request.Name))
                q = q.Where(x => x.c.Name!.Contains(request.Name));

            if (request.SportType.HasValue)
                q = q.Where(x => x.c.SportTypeId == request.SportType);

            if (request.IsActive.HasValue)
                q = q.Where(x => x.c.IsActive == request.IsActive);

            var total = await q.CountAsync();

            var court = await q
                .OrderByDescending(x => x.c.CreatedDate)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var items = court.Select(x => new CourtResponse
            {
                Id = x.c.Id,
                Name = x.c.Name,
                SportType = x.c.SportTypeId,
                SportTypeName = x.s.Name,
                IsActive = x.c.IsActive,
                PricePerHour = x.c.PricePerHour,
                ImageName = x.c.ImageName,
                Description = x.c.Description,
                CreatedDate = x.c.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = x.c.CreatedUser
            }).ToList();

            return new PagedResult<CourtResponse>
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / request.PageSize)
            };
        }

        public async Task<CourtResponse> GetById(int id)
        {
            var response = await (from c in _db.Courts
                                  join s in _db.SportTypes on c.SportTypeId equals s.Id
                                  where c.Id == id
                                  select new CourtResponse
                                  {
                                      Id = c.Id,
                                      Name = c.Name,
                                      SportType = c.SportTypeId,
                                      SportTypeName = s.Name,
                                      PricePerHour = c.PricePerHour,
                                      ImageName = c.ImageName,
                                      Description = c.Description,
                                      IsActive = c.IsActive,
                                      CreatedDate = c.CreatedDate.HasValue
                                          ? c.CreatedDate.Value.ToString("dd/MM/yyyy HH:mm:ss")
                                          : null,
                                      CreatedUser = c.CreatedUser
                                  })
                        .FirstOrDefaultAsync();

            if (response == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            return response;
        }

        private async Task<string?> SaveImage(IFormFile? file)
        {
            if (file == null || file.Length == 0) return null;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                throw new AppException("ไฟล์ต้องเป็น .jpg, .jpeg, .png, .webp เท่านั้น");

            if (file.Length > 5 * 1024 * 1024)
                throw new AppException("ไฟล์ต้องมีขนาดไม่เกิน 5MB");

            var imageName = $"{Guid.NewGuid()}{extension}";
            var savePath = Path.Combine("wwwroot", "images", imageName);

            Directory.CreateDirectory(Path.Combine("wwwroot", "images"));

            using (var stream = new FileStream(savePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return imageName;
        }

        private void DeleteImage(string? imageName)
        {
            if (string.IsNullOrEmpty(imageName)) return;
            var path = Path.Combine("wwwroot", "images", imageName);
            if (File.Exists(path)) File.Delete(path);
        }

        public async Task Create(CourtRequest request, IFormFile? file, string createdUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อสนาม");

            if (!request.SportType.HasValue)
                throw new AppException("กรุณาเลือก ประเภทกีฬา");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");

            if (!request.PricePerHour.HasValue)
                throw new AppException("กรุณาระบุ ราคาต่อชั่วโมง");

            var exists = await _db.Courts.AnyAsync(s => s.Name == request.Name);
            if (exists)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ ชื่อนี้มีอยู่แล้ว");

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var imageName = await SaveImage(file);

                var court = new Court
                {
                    Name = request.Name,
                    SportTypeId = request.SportType,
                    IsActive = request.IsActive,
                    PricePerHour = request.PricePerHour,
                    Description = request.Description,
                    ImageName = imageName,
                    CreatedDate = DateTime.Now,
                    CreatedUser = createdUser,
                    CreatedIp = ipAddress
                };

                _db.Courts.Add(court);

                var result = await _db.SaveChangesAsync();
                if (result == 0)
                {
                    DeleteImage(imageName);
                    throw new AppException("เพิ่มข้อมูลไม่สำเร็จ");
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task Update(int id, CourtRequest request, IFormFile? file, string updatedUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อสนาม");

            if (!request.SportType.HasValue)
                throw new AppException("กรุณาเลือก ประเภทกีฬา");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");

            if (!request.PricePerHour.HasValue)
                throw new AppException("กรุณาระบุ ราคาต่อชั่วโมง");

            var court = await _db.Courts.FirstOrDefaultAsync(s => s.Id == id);
            if (court == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                if (request.Name != null) court.Name = request.Name;
                if (request.SportType.HasValue) court.SportTypeId = request.SportType.Value;
                if (request.IsActive.HasValue) court.IsActive = request.IsActive.Value;
                if (request.PricePerHour.HasValue) court.PricePerHour = request.PricePerHour.Value;

                court.Description = request.Description;

                if (file != null && file.Length > 0)
                {
                    DeleteImage(court.ImageName);
                    court.ImageName = await SaveImage(file);
                }

                court.UpdatedDate = DateTime.Now;
                court.UpdatedUser = updatedUser;
                court.UpdatedIp = ipAddress;

                var result = await _db.SaveChangesAsync();
                if (result == 0)
                    throw new AppException("อัพเดตข้อมูลไม่สำเร็จ");

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task Delete(int id)
        {
            var court = await _db.Courts.FirstOrDefaultAsync(s => s.Id == id);
            if (court == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            DeleteImage(court.ImageName);

            _db.Courts.Remove(court);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("ลบข้อมูลไม่สำเร็จ");
        }

        public async Task<List<CourtAvailableResponse>> GetAvailability(int courtId, DateTime date)
        {
            var court = await _db.Courts.FirstOrDefaultAsync(c => c.Id == courtId);
            if (court == null)
                throw new NotFoundException("ไม่พบสนาม");

            var timeSlots = await _db.TimeSlots
                .Where(t => t.IsActive == 1)
                .ToListAsync();

            var bookedSlotIds = await (
                from b in _db.Bookings
                join bts in _db.BookingTimeSlots on b.Id equals bts.BookingId
                where b.CourtId == courtId
                    && b.BookingDate == date.Date
                    && b.Status != 3
                select bts.TimeSlotId
            ).ToListAsync();

            var now = DateTime.Now;
            var isToday = date.Date == now.Date;

            var result = timeSlots.Select(t =>
            {

                var isBooked = bookedSlotIds.Contains(t.Id);

                var isExpired = false;
                if (isToday && t.StartTime.HasValue)
                {
                    var slotStart = now.Date.Add(t.StartTime.Value);
                    isExpired = slotStart <= now;
                }

                string reason = "";
                if (isBooked) reason = "booked";
                else if (isExpired) reason = "expired";

                return new CourtAvailableResponse
                {
                    TimeSlotId = t.Id,
                    StartTime = t.StartTime.HasValue
                        ? t.StartTime.Value.ToString(@"hh\:mm")
                        : null,
                    EndTime = t.EndTime.HasValue
                        ? t.EndTime.Value.ToString(@"hh\:mm")
                        : null,
                    Price = court.PricePerHour,
                    IsAvailable = !isBooked && !isExpired,
                    UnavailableReason = reason
                };
            }).ToList();

            return result;
        }
    }
}