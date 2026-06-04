using System.ComponentModel.DataAnnotations;

namespace BookingApi.Models
{
    public class SportType
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int? IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
        public string? CreatedIp { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedUser { get; set; }
        public string? UpdatedIp { get; set; }
    }

    public class SportTypeRequest
    {
        public string? Name { get; set; }
        public int? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class SportTypeResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int? IsActive { get; set; }
        public string? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
    }
}