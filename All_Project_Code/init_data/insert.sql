-- Create data for the database 
-- the password for the the studentid of 1101 ios london
INSERT INTO students (StudentID, first_name, last_name, pwd, email) VALUES (1101, 'Guy', 'Fawkes', '$2a$10$wI3VW/Tm06AYvc92Lx8.revaD/Ge0FN1CLdGAgEym91IcvKM39PSC', 'guyfawkes@colorado.edu');
INSERT INTO csel (TableID, bookingTime) VALUES (0, '11:00');
INSERT INTO student_tables (TableID, StudentID) VALUES (0, 1101);
INSERT INTO rooms (RoomId, RoomCapacity, RoomName) VALUES (1, 4, 'eccs114B');
INSERT INTO rooms (RoomId, RoomCapacity, RoomName) VALUES (2, 4, 'eccs114C');
INSERT INTO rooms (RoomId, RoomCapacity, RoomName) VALUES (3, 4, 'eccs114D');
INSERT INTO rooms (RoomId, RoomCapacity, RoomName) VALUES (4, 4, 'eccs114E');
INSERT INTO rooms (RoomId, RoomCapacity, RoomName) VALUES (5, 4, 'eccs114G');
INSERT INTO rooms (RoomId, RoomCapacity, RoomName) VALUES (6, 4, 'eccs114J');