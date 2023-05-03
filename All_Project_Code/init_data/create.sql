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
    id SERIAL PRIMARY KEY NOT NULL,
    timeStamp TIMESTAMP,
    chosenDate date NOT NULL,
    room smallint NOT NULL,
    chosenTime smallint NOT NULL, 
    username INT NOT NULL,
    notes VARCHAR(200)
);
