using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserProfile User { get; set; } = new UserProfile();
    }
    public class UserProfile
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string roleName { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required(ErrorMessage = "กรุณาระบุ Email")]
        [EmailAddress(ErrorMessage = "รูบแบบ Email ไม่ถูกต้อง")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "กรุณาระบุ Password")]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required(ErrorMessage = "กรุณาระบุ ชื่อ-นามสกุล")]
        [MaxLength(100, ErrorMessage = "ชื่อ-นามสกุล ต้องมีไม่เกิน 100 ตัวอักษร")]
        public string Name { get; set; } = string.Empty;
        [Required(ErrorMessage = "กรุณาระบุ Email")]
        [EmailAddress(ErrorMessage = "รูบแบบ Email ไม่ถูกต้อง")]
        [MaxLength(100, ErrorMessage = "Email ต้องมีไม่เกิน 100 ตัวอักษร")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "กรุณาระบุ Password")]
        [MinLength(8, ErrorMessage = "Password ต้องมีอย่างน้อย 8 ตัวอักษร")]
        [MaxLength(50, ErrorMessage = "Password ต้องมีไม่เกิน 50 ตัวอักษร")]
        public string Password { get; set; } = string.Empty;
        public int Role { get; set; } = 2;
        public int IsActive { get; set; } = 1;

    }
}