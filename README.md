# Keystone Field Service Management System

A full-stack Field Service Management System developed as part of the Zidio Development Internship.

The application provides a centralized platform for managing customers, service sites, work orders, technicians, inventory, notifications, and field-service operations using role-based access control.

## 🚀 Live Application

Frontend:
https://keystone-field-service-frontend.onrender.com

Backend:
https://field-service-management-system.onrender.com

> The application is hosted on Render's free tier. The backend may take some time to respond to the first request after a period of inactivity.

---

## 📌 Project Overview

Keystone Field Service Management System is designed to manage the complete lifecycle of field-service operations.

The system supports four different user roles:

- Manager
- Dispatcher
- Technician
- Customer

Each role has its own protected workspace and permissions.

---

## 👥 User Roles

### Manager

The Manager has administrative access to the field-service platform.

Main capabilities include:

- View management dashboard
- Manage users
- Manage technicians
- Manage dispatchers
- Manage customers
- View and manage work orders
- Monitor field-service operations
- Manage inventory
- View operational information
- Manage account and profile information

### Dispatcher

The Dispatcher coordinates field-service activities.

Main capabilities include:

- View dispatcher dashboard
- View customers and service requests
- Create and manage work orders
- Assign technicians to work orders
- View technician workload and availability
- Monitor work-order status
- Manage operational workflow
- Receive notifications
- Manage profile information

### Technician

The Technician handles assigned field-service jobs.

Main capabilities include:

- View technician dashboard
- View assigned work orders
- Update work-order progress
- Complete assigned service jobs
- View job information
- Receive notifications
- Manage profile information

### Customer

Customers can access their own service workspace.

Main capabilities include:

- Register and log in
- View customer dashboard
- Manage customer profile
- Create service requests
- View service/work-order information
- Track service progress
- Receive notifications
- Upload and manage profile photo

---

## 🔄 Work Order Workflow

The application supports a complete field-service workflow:

Customer Service Request
↓
Dispatcher Reviews Request
↓
Work Order Created
↓
Technician Assigned
↓
Work Order Assigned
↓
Technician Starts Work
↓
Work In Progress
↓
Technician Completes Work
↓
Work Order Completed

The system maintains role-based access throughout the workflow.

---

## ✨ Key Features

- JWT-based authentication
- Role-based authorization
- Customer registration
- Secure login
- Manager dashboard
- Dispatcher dashboard
- Technician dashboard
- Customer dashboard
- Customer management
- Site management
- Technician management
- Work-order management
- Technician assignment
- Technician workload tracking
- Work-order status management
- Inventory management
- Notifications
- Email notifications
- User profile management
- Profile photo upload
- Persistent cloud profile-photo storage
- Password management
- Responsive user interface
- Protected frontend routes
- REST API integration
- Cloud database integration
- Production deployment

---

## 🛠️ Technologies Used

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- JWT Authentication
- Maven

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

### Database

- MySQL
- Aiven Cloud MySQL

### Cloud & Deployment

- Render
- Cloudinary
- Git
- GitHub

---

## 🔐 Authentication & Security

The application uses JWT-based authentication.

Protected backend endpoints are secured using Spring Security and role-based authorization.

Roles include:

- `ROLE_MANAGER`
- `ROLE_DISPATCHER`
- `ROLE_TECHNICIAN`
- `ROLE_CUSTOMER`

The frontend also contains protected routes to prevent unauthorized users from accessing restricted pages.

---

## 🖼️ Profile Photo Storage

Profile photos are stored using Cloudinary.

This allows uploaded profile photos to remain available across:

- Different devices
- Different browser sessions
- Application restarts
- Backend redeployments

Only the profile-photo URL is stored with the user's profile information.

---

## 🔔 Notifications

The system provides notifications for important field-service events such as:

- Work-order creation
- Technician assignment
- Work-order status changes
- Work-order completion

Email notifications are processed asynchronously to reduce delays in important application operations.

---

## 🗄️ Database

The production application uses a cloud-hosted MySQL database.

Database technology:

- MySQL
- Spring Data JPA
- Hibernate ORM
- Aiven Cloud Database

Sensitive database credentials are configured using environment variables and are not stored directly in the public repository.

---

## 🌐 Deployment Architecture

The production system uses the following architecture:

React Frontend
↓
Render
↓
Spring Boot REST API
↓
Aiven MySQL Database

Profile Images
↓
Cloudinary

The frontend communicates with the backend using REST APIs.

---

## 📂 Project Structure

```text
fieldservicemanagement/
│
├── field-service-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/fieldservicemanagement/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── exception/
│   │   │       ├── repository/
│   │   │       ├── security/
│   │   │       └── service/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│
├── pom.xml
└── README.md
```
