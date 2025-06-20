## Overview

Staynest is a MERN (MongoDB, Express.js, React.js, Node.js) stack-based homestay booking platform that connects hosts with guests. Hosts can list their vacant homes for travelers to book, while guests can browse, book, and manage their stays.

## Features

User Authentication & Role-Based Access Secure Sign-up/Login for hosts & guests.

JWT-based authentication for session management.

Separate dashboards for hosts & guests.

## Host Functionality

Property listing (upload images, descriptions, pricing, amenities).

Booking requests approval/rejection.

Earnings tracking & transaction history.

Guest communication via messaging system.

Review & rating system.

## Guest Functionality

Browse properties based on location, budget, amenities.

Secure booking & payment system.

Manage booking history & upcoming stays.

Wishlist feature for favorite properties.

Review stays & host interactions.

## Admin Panel

Monitor listings, bookings, and user activities.

Manage disputes, reviews, and payments.

## Technology Stack

## Frontend: React.js

React for UI development.

React Router for navigation.

Redux or Context API for state management.

Tailwind CSS / Material-UI for styling.

## Backend: Node.js & Express.js

REST API creation using Express.js..

Middleware for authentication, error handling.

Nodemailer for transactional emails (booking confirmations, notifications).

## Database: MongoDB

User schema (name, email, role).

Property schema (title, location, price, images).

Booking schema (guest ID, host ID, payment status, check-in/check-out dates).

Authentication: JWT & bcrypt.js JWT for secure access tokens.

bcrypt for password hashing.

## Payment Integration

Stripe or Razorpay for payment processing.

Secure transaction handling with order details.

## Hosting & Deployment

Frontend: Vercel, Netlify, or Firebase or Cloud Flare Hosting.

Backend: Render, DigitalOcean, or AWS.

Database: MongoDB Atlas for cloud storage.
