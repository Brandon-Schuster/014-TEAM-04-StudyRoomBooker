-- Create data for the database
INSERT INTO students (StudentID, first_name, last_name, pwd, email) VALUES (1101, "Guy", "Fawkes", "london", "guyfawkes@colorado.edu");
INSERT INTO csel (TableID, bookingTime) VALUES (0, "11:00");
INSERT INTO student_tables (TableID, StudentID) VALUES (0, 1101);