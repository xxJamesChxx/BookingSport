using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Exceptions;
using BookingApi.Models;

namespace BookingApi.Services
{
    public interface IRoleService
    {
        Task<PagedResult<RoleResponse>> GetAll(RoleRequest request);
        Task<RoleResponse> GetById(int id);
        Task Create(RoleRequest request, string createdUser, string ipAddress);
        Task Update(int id, RoleRequest request, string updatedUser, string ipAddress);
        Task Delete(int id);
    }

    public class RoleService : IRoleService
    {
        private readonly AppDbContext _db;

        public RoleService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<RoleResponse>> GetAll(RoleRequest request)
        {
            var q = _db.Roles.AsQueryable();

            if (!string.IsNullOrEmpty(request.Name))
                q = q.Where(s => s.Name!.Contains(request.Name));

            if (request.IsActive.HasValue)
                q = q.Where(s => s.IsActive == request.IsActive);

            var total = await q.CountAsync();

            var role = await q
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var items = role.Select(s => new RoleResponse
            {
                Id = s.Id,
                Name = s.Name,
                IsActive = s.IsActive,
                CreatedDate = s.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = s.CreatedUser
            }).ToList();

            return new PagedResult<RoleResponse>
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / request.PageSize)
            };
        }

        public async Task<RoleResponse> GetById(int id)
        {
            var role = await _db.Roles.FirstOrDefaultAsync(s => s.Id == id);
            if (role == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            var response = new RoleResponse
            {
                Id = role.Id,
                Name = role.Name,
                IsActive = role.IsActive,
                CreatedDate = role.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = role.CreatedUser
            };

            return response;
        }

        public async Task Create(RoleRequest request, string createdUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อประเภทผู้ใช้");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");
                
            var exists = await _db.Roles.AnyAsync(s => s.Name == request.Name);
            if (exists)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ ชื่อนี้มีอยู่แล้ว");

            var role = new Role
            {
                Name = request.Name,
                IsActive = request.IsActive,
                CreatedDate = DateTime.Now,
                CreatedUser = createdUser,
                CreatedIp = ipAddress
            };

            _db.Roles.Add(role);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("เพิ่มข้อมูลไม่สำเร็จ");
        }

        public async Task Update(int id, RoleRequest request, string updatedUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อประเภทผู้ใช้");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");

            var role = await _db.Roles.FirstOrDefaultAsync(s => s.Id == id);
            if (role == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            if (request.Name != null) role.Name = request.Name;
            if (request.IsActive.HasValue) role.IsActive = request.IsActive.Value;

            role.UpdatedDate = DateTime.Now;
            role.UpdatedUser = updatedUser;
            role.UpdatedIp = ipAddress;

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("อัพเดตข้อมูลไม่สำเร็จ");
        }

        public async Task Delete(int id)
        {
            var role = await _db.Roles.FirstOrDefaultAsync(s => s.Id == id);
            if (role == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            _db.Roles.Remove(role);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("ลบข้อมูลไม่สำเร็จ");
        }
    }
}