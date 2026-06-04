using Microsoft.EntityFrameworkCore;
using System.Data;
using BookingApi.Data;
using BookingApi.Exceptions;
using BookingApi.Models;
using BookingApi.Helpers;

namespace BookingApi.Services
{
    public interface IBookingService
    {
        Task<PagedResult<BookingResponse>> GetAll(BookingRequest request);
        Task<BookingResponse> GetById(int id);
        Task Create(BookingRequest request, string userEmail, string createdUser, string ipAddress);
        Task Cancel(int id, string userEmail, string updatedUser, string ipAddress);
    }

    public class BookingService : IBookingService
    {
        private readonly AppDbContext _db;


        public BookingService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<BookingResponse>> GetAll(BookingRequest request)
        {
            var q = from b in _db.Bookings
                    join c in _db.Courts on b.CourtId equals c.Id
                    join u in _db.Users on b.UserEmail equals u.Email
                    select new { b, c, u };

            if (request.CourtId.HasValue)
                q = q.Where(x => x.b.CourtId == request.CourtId);

            if (!string.IsNullOrEmpty(request.Name))
                q = q.Where(x => x.u.Name!.Contains(request.Name));

            if (request.Status.HasValue)
                q = q.Where(x => x.b.Status == request.Status);

            if (request.BookingDate.HasValue)
                q = q.Where(x => x.b.BookingDate == request.BookingDate);

            var total = await q.CountAsync();

            var bookings = await q
                .OrderByDescending(x => x.b.CreatedDate)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var bookingIds = bookings.Select(x => x.b.Id).ToList();
            var bookingTimeSlots = await (
                from bts in _db.BookingTimeSlots
                join t in _db.TimeSlots on bts.TimeSlotId equals t.Id
                where bookingIds.Contains(bts.BookingId ?? 0)
                select new { bts.BookingId, bts.TimeSlotId, t.StartTime, t.EndTime }
            ).ToListAsync();

            var items = bookings.Select(x => new BookingResponse
            {
                Id = x.b.Id,
                BookingNo = x.b.BookingNo,
                UserEmail = x.b.UserEmail,
                Name = x.u.Name,
                CourtId = x.b.CourtId,
                CourtName = x.c.Name,
                TimeSlots = bookingTimeSlots
                    .Where(t => t.BookingId == x.b.Id)
                    .Select(t => new TimeSlotInfo
                    {
                        TimeSlotId = t.TimeSlotId ?? 0,
                        StartTime = t.StartTime.HasValue ? t.StartTime.Value.ToString(@"hh\:mm") : null,
                        EndTime = t.EndTime.HasValue ? t.EndTime.Value.ToString(@"hh\:mm") : null,
                    }).ToList(),
                BookingDate = x.b.BookingDate?.ToString("dd/MM/yyyy"),
                TotalPrice = x.b.TotalPrice,
                Status = x.b.Status,
                StatusName = BookingStatusHelper.GetStatusName(x.b.Status),
                CreatedDate = x.b.CreatedDate?.ToString("dd/MM/yyyy HH:mm:ss"),
                CreatedUser = x.b.CreatedUser
            }).ToList();

            return new PagedResult<BookingResponse>
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)total / request.PageSize)
            };
        }

        public async Task<BookingResponse> GetById(int id)
        {
            var result = await (from b in _db.Bookings
                                join c in _db.Courts on b.CourtId equals c.Id
                                join u in _db.Users on b.UserEmail equals u.Email
                                where b.Id == id
                                select new BookingResponse
                                {
                                    Id = b.Id,
                                    BookingNo = b.BookingNo,
                                    UserEmail = b.UserEmail,
                                    Name = u.Name,
                                    CourtId = b.CourtId,
                                    CourtName = c.Name,
                                    BookingDate = b.BookingDate.HasValue
                                        ? b.BookingDate.Value.ToString("dd/MM/yyyy")
                                        : null,
                                    TotalPrice = b.TotalPrice,
                                    Status = b.Status,
                                    StatusName = BookingStatusHelper.GetStatusName(b.Status),
                                    CreatedDate = b.CreatedDate.HasValue
                                        ? b.CreatedDate.Value.ToString("dd/MM/yyyy HH:mm:ss")
                                        : null,
                                    CreatedUser = b.CreatedUser
                                })
                                .FirstOrDefaultAsync();

            if (result == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            result.TimeSlots = await (
                from bts in _db.BookingTimeSlots
                join t in _db.TimeSlots on bts.TimeSlotId equals t.Id
                where bts.BookingId == id
                select new TimeSlotInfo
                {
                    TimeSlotId = bts.TimeSlotId ?? 0,
                    StartTime = t.StartTime.HasValue ? t.StartTime.Value.ToString(@"hh\:mm") : null,
                    EndTime = t.EndTime.HasValue ? t.EndTime.Value.ToString(@"hh\:mm") : null,
                }
            ).ToListAsync();

            return result;
        }

        public async Task Create(BookingRequest request, string userEmail, string createdUser, string ipAddress)
        {
            if (!request.CourtId.HasValue)
                throw new AppException("กรุณาเลือก สนาม");

            if (request.TimeSlotIds == null || request.TimeSlotIds.Count == 0)
                throw new AppException("กรุณาเลือกช่วงเวลาอย่างน้อย 1 ช่วง");

            if (!request.BookingDate.HasValue)
                throw new AppException("กรุณาเลือก วันจอง");

            var court = await _db.Courts.FirstOrDefaultAsync(c => c.Id == request.CourtId);
            if (court == null)
                throw new NotFoundException("ไม่พบสนาม");

            if (request.BookingDate.Value.Date < DateTime.Now.Date)
                throw new AppException("ไม่สามารถจองวันในอดีตได้");

            using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            try
            {
                foreach (var timeSlotId in request.TimeSlotIds)
                {
                    var isAvailable = !await (
                        from b in _db.Bookings
                        join bts in _db.BookingTimeSlots on b.Id equals bts.BookingId
                        where b.CourtId == request.CourtId
                            && b.BookingDate == request.BookingDate.Value.Date
                            && b.Status != 2
                            && bts.TimeSlotId == timeSlotId
                        select b
                    ).AnyAsync();

                    if (!isAvailable)
                    {
                        var slot = await _db.TimeSlots.FirstOrDefaultAsync(t => t.Id == timeSlotId);
                        var startTime = slot?.StartTime?.ToString(@"hh\:mm");
                        var endTime = slot?.EndTime?.ToString(@"hh\:mm");
                        throw new AppException($"ช่วงเวลา {startTime}–{endTime} ถูกจองแล้ว");
                    }
                }

                var hours = 1;
                var totalPrice = (decimal)hours * (court.PricePerHour ?? 0) * request.TimeSlotIds.Count;

                var booking = new Booking
                {
                    BookingNo = await GenerateBookingNo(),
                    UserEmail = userEmail,
                    CourtId = request.CourtId,
                    BookingDate = request.BookingDate.Value.Date,
                    TotalPrice = totalPrice,
                    Status = 1,
                    CreatedDate = DateTime.Now,
                    CreatedUser = createdUser,
                    CreatedIp = ipAddress
                };

                _db.Bookings.Add(booking);
                await _db.SaveChangesAsync();

                foreach (var timeSlotId in request.TimeSlotIds)
                {
                    _db.BookingTimeSlots.Add(new BookingTimeSlot
                    {
                        BookingId = booking.Id,
                        TimeSlotId = timeSlotId,
                        CreatedDate = DateTime.Now,
                        CreatedUser = createdUser,
                        CreatedIp = ipAddress
                    });
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task Cancel(int id, string userEmail, string updatedUser, string ipAddress)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null)
                throw new NotFoundException("ไม่พบข้อมูล");

            if (booking.UserEmail != userEmail)
                throw new AppException("ไม่มีสิทธิ์ยกเลิกการจองนี้");

            if (booking.Status == 2)
                throw new AppException("การจองนี้ถูกยกเลิกแล้ว");

            booking.Status = 2;
            booking.UpdatedDate = DateTime.Now;
            booking.UpdatedUser = updatedUser;
            booking.UpdatedIp = ipAddress;

            var result = await _db.SaveChangesAsync();
            if (result == 0)
                throw new AppException("ยกเลิกการจองไม่สำเร็จ");
        }

        private async Task<string> GenerateBookingNo()
        {
            var year = DateTime.Now.Year.ToString();

            var count = await _db.Bookings
                .Where(b => b.CreatedDate.HasValue &&
                            b.CreatedDate.Value.Year == DateTime.Now.Year)
                .CountAsync();

            var running = (count + 1).ToString("D6");

            return $"{year}{running}";
        }
    }
}