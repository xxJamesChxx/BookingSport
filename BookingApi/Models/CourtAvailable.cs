namespace BookingApi.Models
{
    public class CourtAvailableResponse
    {
        public int TimeSlotId { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public decimal? Price { get; set; }
        public bool IsAvailable { get; set; }
        public string? UnavailableReason { get; set; }
    }
}