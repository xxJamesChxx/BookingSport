namespace BookingApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public int? Role { get; set; }
        public int? IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
        public string? CreatedIp { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedUser { get; set; }
        public string? UpdatedIp { get; set; }
    }

    public class UserRequest
    {
        public string? Name { get; set; }
        public int? Role { get; set; }
        public int? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class UserResponse
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public int? Role { get; set; }
        public string? RoleName { get; set; }
        public int? IsActive { get; set; }
        public string? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
    }
}