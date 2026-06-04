using Microsoft.EntityFrameworkCore;
using BookingApi.Data;
using BookingApi.Exceptions;
using BookingApi.Models;

namespace BookingApi.Services
{
    public interface IUserService
    {
        Task<PagedResult<UserResponse>> GetAll(UserRequest request);
        Task<UserResponse> GetById(int id);
        Task Update(int id, UserRequest request, string updatedUser, string ipAddress);
        Task Delete(int id);
    }

    public class UserService : IUserService
    {
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<UserResponse>> GetAll(UserRequest request)
        {
            var q = from u in _db.Users
                    join r in _db.Roles on u.Role equals r.Id
                    select new { u, r };

            if (!string.IsNullOrEmpty(request.Name))
                q = q.Where(x => x.u.Name!.Contains(request.Name));

            if (request.Role.HasValue)
                q = q.Where(x => x.u.Role == request.Role);

            if (request.IsActive.HasValue)
                q = q.Where(x => x.u.IsActive == request.IsActive);

            var total = await q.CountAsync();

            var user = await q
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var items = user.Select(x => new UserResponse
            {
                Id = x.u.Id,
                Email = x.u.Email,
                Name = x.u.Name,
                Role = x.u.Role,
                RoleName = x.r.Name,
                IsActive = x.u.IsActive,
                CreatedDate = x.u.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = x.u.CreatedUser
            }).ToList();

            return new PagedResult<UserResponse>
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / request.PageSize)
            };
        }

        public async Task<UserResponse> GetById(int id)
        {
            var response = await (from u in _db.Users
                                  join r in _db.Roles on u.Role equals r.Id
                                  where u.Id == id
                                  select new UserResponse
                                  {
                                      Id = u.Id,
                                      Email = u.Email,
                                      Name = u.Name,
                                      Role = u.Role,
                                      RoleName = r.Name,
                                      IsActive = u.IsActive,
                                      CreatedDate = u.CreatedDate.HasValue
                                          ? u.CreatedDate.Value.ToString("dd/MM/yyyy HH:mm:ss")
                                          : null,
                                      CreatedUser = u.CreatedUser
                                  })
                        .FirstOrDefaultAsync();

            if (response == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            return response;
        }

        public async Task Update(int id, UserRequest request, string updatedUser, string ipAddress)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new AppException("กรุณาระบุ ชื่อ-นามสกุล");

            if (!request.Role.HasValue)
                throw new AppException("กรุณาเลือก ประเภทผู้ใช้");

            if (!request.IsActive.HasValue)
                throw new AppException("กรุณาระบุ สถานะ");

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                throw new NotFoundException("ไม่พบข้อมูลผู้ใช้");

            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == request.Role);
            if (role == null)
                throw new NotFoundException("ไม่พบประเภทผู้ใช้งาน");

            user.Name = request.Name;
            user.Role = request.Role;
            user.IsActive = request.IsActive;
            user.UpdatedDate = DateTime.Now;
            user.UpdatedUser = updatedUser;
            user.UpdatedIp = ipAddress;

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("อัพเดตข้อมูลไม่สำเร็จ");
        }

        public async Task Delete(int id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(s => s.Id == id);
            if (user == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            _db.Users.Remove(user);

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("ลบข้อมูลไม่สำเร็จ");
        }
    }
}