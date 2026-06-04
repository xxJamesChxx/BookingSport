namespace BookingApi.Models
{
    public class Court
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int? SportTypeId { get; set; }
        public Decimal? PricePerHour { get; set; }
        public string? Description { get; set; }
        public int? IsActive { get; set; }
        public string? ImageName { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
        public string? CreatedIp { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedUser { get; set; }
        public string? UpdatedIp { get; set; }
    }

    public class CourtRequest
    {
        public string? Name { get; set; }
        public int? SportType { get; set; }
        public int? IsActive { get; set; }
        public Decimal? PricePerHour { get; set; }
        public string? Description {get; set; }
        public string? ImageName { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class CourtResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int? SportType { get; set; }
        public string? SportTypeName { get; set; }
        public Decimal? PricePerHour { get; set; }
        public string? Description { get; set; }
        public int? IsActive { get; set; }
        public string? ImageName { get; set; }
        public string? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
    }

}