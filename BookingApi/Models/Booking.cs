namespace BookingApi.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string? BookingNo { get; set; }
        public string? UserEmail { get; set; }
        public int? CourtId { get; set; }
        public DateTime? BookingDate { get; set; }
        public decimal? TotalPrice { get; set; }
        public int? Status { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
        public string? CreatedIp { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedUser { get; set; }
        public string? UpdatedIp { get; set; }
    }

    public class BookingTimeSlot
    {
        public int Id { get; set; }
        public int? BookingId { get; set; }
        public int? TimeSlotId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
        public string? CreatedIp { get; set; }
    }

    public class BookingRequest
    {
        public int? CourtId { get; set; }
        public List<int>? TimeSlotIds { get; set; }
        public DateTime? BookingDate { get; set; }
        public string? UserEmail { get; set; } 
        public string? Name { get; set; } 
        public int? Status { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class BookingResponse
    {
        public int Id { get; set; }
        public string? BookingNo { get; set; }
        public string? UserEmail { get; set; } 
        public string? Name { get; set; }
        public int? CourtId { get; set; }
        public string? CourtName { get; set; }
        public List<TimeSlotInfo>? TimeSlots { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? BookingDate { get; set; }
        public decimal? TotalPrice { get; set; }
        public int? Status { get; set; }
        public string? StatusName { get; set; }
        public string? CreatedDate { get; set; }
        public string? CreatedUser { get; set; }
    }

    public class TimeSlotInfo
    {
        public int TimeSlotId { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
    }
}