-- Create Database Tables here
DROP TABLE IF EXISTS students CASCADE;
CREATE TABLE students (
    StudentID INT PRIMARY KEY NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    pwd VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS rooms CASCADE;
Create TABLE rooms (
    RoomId INT PRIMARY KEY NOT NULL,
    RoomCapacity VARCHAR(10) NOT NULL,
    RoomName VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
    RoomId INT NOT NULL REFERENCES rooms(RoomId),
    StudentID INT NOT NULL REFERENCES students(StudentID),
    BookingStatus BOOLEAN NOT NULL,
    BookingTime VARCHAR(60) NOT NULL
    
    -- booking status true = booked --
);

-- DROP TABLE IF EXISTS student_rooms CASCADE;
-- CREATE TABLE student_rooms (
--     StudentID INT NOT NULL REFERENCES students(StudentID),
--     RoomId INT NOT NULL REFERENCES rooms(RoomId)
-- )