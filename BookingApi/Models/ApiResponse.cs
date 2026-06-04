namespace BookingApi.Models
{
    public class ApiResponse
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; }

        public static ApiResponse Ok(string message = "Success")
            => new() { StatusCode = 200, Message = message };

        public static ApiResponse Fail(string message, int statusCode = 400)
            => new() { StatusCode = statusCode, Message = message };
    }

    public class ApiResponse<T> : ApiResponse
    {
        public T? Token { get; set; }

        public static ApiResponse<T> Ok(T token, string message = "Success")
            => new() { StatusCode = 200, Message = message, Token = token };

        public static new ApiResponse<T> Fail(string message, int statusCode = 400)
            => new() { StatusCode = statusCode, Message = message, Token = default };
    }

    public class ApiDataResponse<T> : ApiResponse
    {
        public T? Data { get; set; }

        public static ApiDataResponse<T> Ok(T data, string message = "Success")
            => new() { StatusCode = 200, Message = message, Data = data };

        public static new ApiDataResponse<T> Fail(string message, int statusCode = 400)
            => new() { StatusCode = statusCode, Message = message, Data = default };
    }
}