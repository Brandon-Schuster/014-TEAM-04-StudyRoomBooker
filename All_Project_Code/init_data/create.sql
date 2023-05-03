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


DROP TABLE IF EXISTS api_data CASCADE;
CREATE TABLE api_data (
    id SERIAL PRIMARY KEY NOT NULL,
    timeStamp TIMESTAMP,
    name VARCHAR(60),
    party_size INT,
    time VARCHAR(60),
    notes VARCHAR(255),
    status boolean
);
