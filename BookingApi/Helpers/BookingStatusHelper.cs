namespace BookingApi.Helpers
{
    public static class BookingStatusHelper
    {
        public static string GetStatusName(int? status)
        {
            if (status == 1) return "Confirmed";
            if (status == 2) return "Cancelled";
            return "";
        }
    }
}