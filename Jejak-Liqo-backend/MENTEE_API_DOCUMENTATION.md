# API Documentation - Mentee Management

## Base URL: `http://your-domain.com/api`

## Authentication
All endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer your-token-here
```

## Endpoints

### 1. Get All Mentees
**GET** `/mentees`

**Query Parameters:**
- `search` (string, optional): Search by name, nickname, phone, or activity class
- `group_id` (integer, optional): Filter by group ID
- `status` (string, optional): Filter by status (Aktif, Non-Aktif, Lulus)
- `gender` (string, optional): Filter by gender (Ikhwan, Akhwat)
- `sort_by` (string, optional): Sort by field (default: created_at)
- `sort_order` (string, optional): Sort order (asc, desc) (default: desc)
- `per_page` (integer, optional): Items per page (default: 10)

**Example Request:**
```
GET /mentees?search=john&status=Aktif&sort_by=full_name&sort_order=asc&per_page=20
```

**Response:**
```json
{
  "status": "success",
  "message": "Mentees fetched successfully",
  "data": [
    {
      "id": 1,
      "group": {
        "id": 1,
        "group_name": "Group A",
        "description": "Description",
        "mentor": {
          "id": 1,
          "role": "admin",
          "email": "mentor@example.com",
          "profile": {
            "full_name": "Mentor Name"
          }
        },
        "created_at": "2023-01-01T00:00:00.000000Z"
      },
      "full_name": "John Doe",
      "gender": "Ikhwan",
      "nickname": "John",
      "birth_date": "2000-01-01",
      "phone_number": "08123456789",
      "activity_class": "Class A",
      "hobby": "Reading",
      "address": "Address",
      "status": "Aktif",
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  }
}
```

### 2. Get Single Mentee
**GET** `/mentees/{id}`

**Response:**
```json
{
  "status": "success",
  "message": "Mentee fetched successfully",
  "data": {
    "id": 1,
    "group": { /* group object */ },
    "full_name": "John Doe",
    "gender": "Ikhwan",
    "nickname": "John",
    "birth_date": "2000-01-01",
    "phone_number": "08123456789",
    "activity_class": "Class A",
    "hobby": "Reading",
    "address": "Address",
    "status": "Aktif",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  }
}
```

### 3. Create Mentee
**POST** `/mentees`

**Request Body:**
```json
{
  "group_id": 1,
  "full_name": "John Doe",
  "gender": "Ikhwan",
  "nickname": "John",
  "birth_date": "2000-01-01",
  "phone_number": "08123456789",
  "activity_class": "Class A",
  "hobby": "Reading",
  "address": "Address",
  "status": "Aktif"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Mentee created successfully",
  "data": {
    "id": 1,
    "group": { /* group object */ },
    "full_name": "John Doe",
    "gender": "Ikhwan",
    "nickname": "John",
    "birth_date": "2000-01-01",
    "phone_number": "08123456789",
    "activity_class": "Class A",
    "hobby": "Reading",
    "address": "Address",
    "status": "Aktif",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  }
}
```

### 4. Update Mentee
**PUT** `/mentees/{id}`

**Request Body:** (same as create)

**Response:**
```json
{
  "status": "success",
  "message": "Mentee updated successfully",
  "data": { /* updated mentee object */ }
}
```

### 5. Delete Mentee
**DELETE** `/mentees/{id}`

**Response:**
```json
{
  "status": "success",
  "message": "Mentee deleted successfully"
}
```

### 6. Get Mentee Statistics
**GET** `/mentees/stats`

**Response:**
```json
{
  "status": "success",
  "message": "Mentee statistics fetched successfully",
  "data": {
    "total_mentees": 100,
    "active_mentees": 80,
    "inactive_mentees": 15,
    "graduated_mentees": 5,
    "mentees_by_gender": [
      {
        "gender": "Ikhwan",
        "count": 60
      },
      {
        "gender": "Akhwat",
        "count": 40
      }
    ],
    "mentees_by_group": [
      {
        "group_id": 1,
        "count": 25
      }
    ]
  }
}
```

### 7. Export Mentees
**GET** `/mentees/export`

**Query Parameters:** (same as get all mentees for filtering)

**Response:**
```json
{
  "status": "success",
  "message": "Mentees exported successfully",
  "data": [
    {
      "ID": 1,
      "Nama Lengkap": "John Doe",
      "Nama Panggilan": "John",
      "Tanggal Lahir": "2000-01-01",
      "Nomor Telepon": "08123456789",
      "Kelas Aktivitas": "Class A",
      "Hobi": "Reading",
      "Alamat": "Address",
      "Status": "Aktif",
      "Jenis Kelamin": "Ikhwan",
      "Grup": "Group A",
      "Mentor": "Mentor Name",
      "Tanggal Dibuat": "2023-01-01 00:00:00"
    }
  ]
}
```

### 8. Bulk Update Mentees
**POST** `/mentees/bulk-update`

**Request Body:**
```json
{
  "mentee_ids": [1, 2, 3],
  "updates": {
    "status": "Lulus",
    "activity_class": "Graduated"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully updated 3 mentees",
  "updated_count": 3
}
```

### 9. Bulk Delete Mentees
**POST** `/mentees/bulk-delete`

**Request Body:**
```json
{
  "mentee_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully deleted 3 mentees",
  "deleted_count": 3
}
```

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "field_name": ["The field name is required."]
  }
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Mentee not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Frontend Integration Examples

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useMentees = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchMentees = async (params = {}) => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/mentees?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setMentees(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  return { mentees, loading, pagination, fetchMentees };
};
```

### Axios Example
```javascript
import axios from 'axios';

const menteeAPI = {
  getAll: (params) => axios.get('/api/mentees', { params }),
  getById: (id) => axios.get(`/api/mentees/${id}`),
  create: (data) => axios.post('/api/mentees', data),
  update: (id, data) => axios.put(`/api/mentees/${id}`, data),
  delete: (id) => axios.delete(`/api/mentees/${id}`),
  getStats: () => axios.get('/api/mentees/stats'),
  export: (params) => axios.get('/api/mentees/export', { params }),
  bulkUpdate: (data) => axios.post('/api/mentees/bulk-update', data),
  bulkDelete: (data) => axios.post('/api/mentees/bulk-delete', data),
};
```

