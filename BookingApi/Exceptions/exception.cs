namespace BookingApi.Exceptions
{
    public class AppException : Exception
    {
        public int StatusCode { get; }
        public AppException(string message, int statusCode = 400)
            : base(message) { StatusCode = statusCode; }
    }

    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message = "Unauthorized")
            : base(message, 401) { }
    }

    public class ConflictException : AppException
    {
        public ConflictException(string message = "Conflict")
            : base(message, 409) { }
    }

    public class NotFoundException : AppException
    {
        public NotFoundException(string message = "Not found")
            : base(message, 404) { }
    }
}