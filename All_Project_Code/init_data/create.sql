-- Create Database Tables here
DROP TABLE IF EXISTS students CASCADE;
CREATE TABLE students (
    StudentID INT PRIMARY KEY NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    pwd VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS csel CASCADE;
CREATE TABLE csel (
    TableID INT PRIMARY KEY NOT NULL,
    bookingTime VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS rooms CASCADE;
Create TABLE rooms (
    RoomId INT PRIMARY KEY NOT NULL,
    RoomCapacity VARCHAR(10) NOT NULL,
    RoomName VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS csel_rooms CASCADE;
CREATE TABLE csel_rooms (
    TableID INT NOT NULL REFERENCES csel(TableID),
    RoomId INT NOT NULL REFERENCES rooms(RoomId)
);

DROP TABLE IF EXISTS student_tables CASCADE;
CREATE TABLE student_tables (
    TableID INT NOT NULL REFERENCES csel(TableID),
    StudentID INT NOT NULL REFERENCES students(StudentID)
);
