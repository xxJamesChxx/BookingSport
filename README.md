# BookingSport

ระบบจองสนามกีฬาออนไลน์

## Setup

### 1. Database
นำไฟล์ SQL ในโฟลเดอร์ที่เตรียมไว้ไป Import เข้าที่ MS SQL SERVER

### 2. ฝั่ง Frontend (Next.js)
สร้างไฟล์ชื่อ `.env` ไว้ภายในโฟลเดอร์ `booking-frontend`
แล้วใส่ค่าคอนฟิกดังนี้:
NEXT_PUBLIC_API_URL=YOUR_URL_API

### 3. ฝั่ง Backend (C# Web API)
สร้างไฟล์ชื่อ `appsettings.json` และ `appsettings.Development.json` ไว้ภายในโฟลเดอร์ `BookingApi` แล้วใส่ค่าคอนฟิกดังนี้:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASS;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "BookingApi@SecretKey#2026$Project!",
    "Issuer": "BookingApi",
    "Audience": "BookingApi",
    "ExpireMinutes": 15
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}

### การใช้งาน 
User: `admin@admin.com` / Password: `password@admin`
