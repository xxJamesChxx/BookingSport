using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookingApi.Models;
using BookingApi.Data;
using BookingApi.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace BookingApi.Services
{
    public interface IAuthService
    {
        Task<bool> Register(RegisterRequest request, string ipAddress);
        Task<AuthResponse> Login(LoginRequest request, string ipAddress, bool forceLogin = false);
        Task<AuthResponse?> RefreshToken(string refreshToken, string ipAddress);
        Task<bool> Logout(string refreshToken);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<bool> Register(RegisterRequest request, string ipAddress)
        {
            var exists = _db.Users.Any(u => u.Email == request.Email);
            if (exists) return false;

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                IsActive = request.IsActive,
                CreatedDate = DateTime.Now,
                CreatedUser = request.Email,
                CreatedIp = ipAddress
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<AuthResponse> Login(LoginRequest request, string ipAddress, bool forceLogin = false)
        {
            var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive == 1);

            if (user == null)
                throw new UnauthorizedException("Email หรือ Password ไม่ถูกต้อง");

            var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isValid)
            {
                throw new UnauthorizedException("Email หรือ Password ไม่ถูกต้อง");
            }

            var isAlreadyLoggedIn = _db.RefreshTokens.Any(t =>
                t.UserId == user.Id &&
                !t.IsRevoked &&
                t.ExpireDate > DateTime.Now
            );

            if (isAlreadyLoggedIn && !forceLogin)
                throw new ConflictException("มีผู้ใช้กำลังล็อกอินอยู่ ต้องการเข้าสู่ระบบไหม?");

            if (isAlreadyLoggedIn && forceLogin)
            {
                await _db.RefreshTokens
                .Where(t => t.UserId == user.Id && !t.IsRevoked)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsRevoked, true));
            }

            var roleName = (await _db.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == user.Role))?.Name ?? "";

            var accessToken = GenerateToken(user, roleName);
            var refreshToken = await GenerateRefreshToken(user.Id, ipAddress);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserProfile
                {
                    Id = user.Id,
                    Email = user.Email ?? "",
                    Name = user.Name ?? "",
                    roleName = roleName ?? ""
                }
            };
        }

        private string GenerateToken(User user, string roleName)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var claims = new[]
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("email", user.Email ?? string.Empty),
                new Claim("role", roleName)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(
                    double.Parse(_config["Jwt:ExpireMinutes"]!)
                ),
                signingCredentials: new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha256
                )
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<AuthResponse?> RefreshToken(string refreshToken, string ipAddress)
        {
            var token = _db.RefreshTokens.FirstOrDefault(t =>
                t.Token == refreshToken &&
                !t.IsRevoked &&
                t.ExpireDate > DateTime.Now
            );

            if (token == null) return null;

            token.IsRevoked = true;
            await _db.SaveChangesAsync();

            var user = _db.Users.FirstOrDefault(u => u.Id == token.UserId);
            if (user == null) return null;

            var roleName = _db.Roles
                .FirstOrDefault(r => r.Id == user.Role)?.Name ?? "";

            var newAccessToken = GenerateToken(user, roleName);
            var newRefreshToken = await GenerateRefreshToken(user.Id, ipAddress);

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }

        public async Task<bool> Logout(string refreshToken)
        {
            var token = _db.RefreshTokens.FirstOrDefault(t => t.Token == refreshToken);
            if (token == null) return false;

            token.IsRevoked = true;
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task<string> GenerateRefreshToken(int userId, string ipAddress)
        {
            var oldTokens = _db.RefreshTokens.Where(t => t.UserId == userId);
            _db.RefreshTokens.RemoveRange(oldTokens);

            var refreshToken = new RefreshToken
            {
                UserId = userId,
                Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) +
                        Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
                ExpireDate = DateTime.Now.AddMinutes(30),
                IsRevoked = false,
                CreatedDate = DateTime.Now,
                CreatedUser = userId.ToString(),
                CreatedIp = ipAddress
            };

            _db.RefreshTokens.Add(refreshToken);
            await _db.SaveChangesAsync();

            return refreshToken.Token;
        }
    }
}