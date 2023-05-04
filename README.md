

# 3308-Group-Project Team-04

Class: **3308 Software Dev Spring 2023**

Professor: **Sreesha Nath**

TA: **Swaminathan Sriram**

Team Name: **Agile Avengers**

Recitation: **014**

Team number: **04**

Group Members:

-   **Daniel Bonnecaze** - [danielbonnecaze](https://github.com/dbcolobuff)
    
-   **Noah Garrett** - [noahggarrett-1](https://github.com/noahggarrett-1), [person1234-ux](https://github.com/person1234-ux/person1234-ux)
    
-   **James Gashi** - [james-gashi](https://github.com/james-gashi)
    
-   **Brandon Schuster** - [Brandon-Schuster](https://github.com/Brandon-Schuster)
- **Jeremy Tang** - [jeta5277](https://github.com/jeta5277)

Technology Stack: 
1.  **Docker**: A platform for building, deploying, and running applications in containers, ensuring consistency across environments.
    
2.  **PostgreSQL**: An open-source, object-relational database system used for storing and managing application data.
    
3.  **Node.js**: A JavaScript runtime for building scalable network applications and web servers.
    
4.  **UI Tools - EJS, HTML, CSS, JavaScript**: Technologies used for creating dynamic, interactive, and responsive user interfaces.
    
5.  **External Google API**: Integration with Google APIs, such as Google Maps or Google Calendar, to provide additional functionality.
    
6.  **Mocha & Chai**: JavaScript test framework (Mocha) and assertion library (Chai) for writing and running tests.
    
7.  **GitHub**: A web-based platform for version control and collaboration built on Git.
    
8.  **Visual Studio Code**: A versatile code editor with features like syntax highlighting, code completion, debugging, and an integrated terminal.
    
9.  **Microsoft Azure & Ubuntu Server**: Public deployment of the application using Microsoft Azure cloud platform with an Ubuntu server.

Prerequisites: **Docker, Node.JS, PostgreSQL, Google Forms API**

Instructions:
- 
1. Clone Repo

    `git clone git@github.com:Brandon-Schuster/014-TEAM-04-StudyRoomBooker.git`

2. From Terminal, navigate your terminal to the directory /All_Project_Code/ & run *Docker-Compose up* to start the applicaiton (You are required to already have Docker installed on your machine)

	 `cd .\014-TEAM-04-StudyRoomBooker\All_Project_Code\ && docker-compose up`
 
3. Navigate to a web browser and locate the service on port 3000

	`http://localhost:3000/`

Tests
-
4. In the docker-compose.yaml file, change the "command: " line from *npm start* to *npm run testandrun*. 

	`command: 'npm run testandrun'`

<!-- Brief Application description

Contributors - In this case, it will be the team Members

Technology Stack used for the project

Prerequisites to run the application - Any software that needs to be installed to run the application

Instructions on how to run the application locally.

How to run the tests

Link to the deployed application -->
