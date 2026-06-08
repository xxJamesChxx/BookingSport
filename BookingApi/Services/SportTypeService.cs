using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Exceptions;
using BookingApi.Models;

namespace BookingApi.Services
{
    public interface ISportTypeService
    {
        Task<PagedResult<SportTypeResponse>> GetAll(SportTypeRequest request);
        Task<SportTypeResponse> GetById(int id);
        Task Create(SportTypeRequest request, string createdUser, string ipAddress);
        Task Update(int id, SportTypeRequest request, string updatedUser, string ipAddress);
        Task Delete(int id);
    }

    public class SportTypeService : ISportTypeService
    {
        private readonly AppDbContext _db;

        public SportTypeService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<SportTypeResponse>> GetAll(SportTypeRequest request)
        {
            var q = _db.SportTypes.AsQueryable();

            if (!string.IsNullOrEmpty(request.Name))
                q = q.Where(s => s.Name!.Contains(request.Name));

            if (request.IsActive.HasValue)
                q = q.Where(s => s.IsActive == request.IsActive);

            var total = await q.CountAsync();

            var sportTypes = await q
                .OrderByDescending(x => x.CreatedDate)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var items = sportTypes.Select(s => new SportTypeResponse
            {
                Id = s.Id,
                Name = s.Name,
                IsActive = s.IsActive,
                CreatedDate = s.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = s.CreatedUser
            }).ToList();

            return new PagedResult<SportTypeResponse>
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / request.PageSize)
            };
        }

        public async Task<SportTypeResponse> GetById(int id)
        {
            var sportType = await _db.SportTypes.FirstOrDefaultAsync(s => s.Id == id);
            if (sportType == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            var response = new SportTypeResponse
            {
                Id = sportType.Id,
                Name = sportType.Name,
                IsActive = sportType.IsActive,
                CreatedDate = sportType.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = sportType.CreatedUser
            };

            return response;
        }

        public async Task Create(SportTypeRequest request, string createdUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อประเภทกีฬา");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");
                
            var exists = await _db.SportTypes.AnyAsync(s => s.Name == request.Name);
            if (exists)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ ชื่อนี้มีอยู่แล้ว");

            var sportType = new SportType
            {
                Name = request.Name,
                IsActive = request.IsActive,
                CreatedDate = DateTime.Now,
                CreatedUser = createdUser,
                CreatedIp = ipAddress
            };

            _db.SportTypes.Add(sportType);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ");
        }

        public async Task Update(int id, SportTypeRequest request, string updatedUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อประเภทกีฬา");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");

            var sportType = await _db.SportTypes.FirstOrDefaultAsync(s => s.Id == id);
            if (sportType == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            if (request.Name != null) sportType.Name = request.Name;
            if (request.IsActive.HasValue) sportType.IsActive = request.IsActive.Value;

            sportType.UpdatedDate = DateTime.Now;
            sportType.UpdatedUser = updatedUser;
            sportType.UpdatedIp = ipAddress;

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("อัพเดตข้อมูลไม่สำเร็จ");
        }

        public async Task Delete(int id)
        {
            var sportType = await _db.SportTypes.FirstOrDefaultAsync(s => s.Id == id);
            if (sportType == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            _db.SportTypes.Remove(sportType);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("ลบข้อมูลไม่สำเร็จ");
        }
    }
}