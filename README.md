# Advanced Programming 2 Submission 2 - Submission by Ron Zamir and Ziv Naim.
## Part 1 - Project documentation and explanation about features we implemented.
**Project Documentation:**
In this project, we used the mvc (model, view, controller) design pattern to create a program which, once activated, forms a web page which is accesible by any user via chrome and allows the user to send 2 files for anomaly detection via one of two algorithms we implemented.
In addition, we also implemented an API for the user to use if he so pleases.
We seperated each of the elements (model, view, controller) in the following fasion:
* The model contained the algorithmic part of the project - we wrote the algorithms in javascript and saved them as our model portion. It is Then loaded by the controller which will be soon expanded upon.
* The controller portion contained the main javascript code for sending the information given by the view (the user interface) to the model, and formatting the response correctly and delivering it back to the view so the user will see the results of his anomaly detection.
* Lastly, the view portion is basically responsible for the web part of this exercise. It has the html, css and the javascript portion that are responsible for accepting user input, sending it to the controller, and displaying the results of the model to the user.
**Unique Features**
I'm afraid we didn't add any unique features this time around.
## Part 2 - File documentation and explanation.
**File System Documentation:**
The project's git repository is build in the following manner:
In the main folder of the repository are our other folders and our "useless" files (readme, uml and so on).
The different parts of the exercise (the model, the view and the controller) are each seperated into their own folders.
In those folders are the different files responsible for the part that is the folder's name.
Now, I'll expand upon each file in particular:
Inside the folder:
* Controller: the file server.js which is responsible for the running of the servers itself.
* Model: the file detector.js which is responsible for the detection of anomalies and the implementation of the algorithms which are required to detect said anomalies.
* View: the files front.js which is responsible for the logical part of the behavior of our web interface, as well as index.html and style.css which are responsible for the web page itself.
### Part 3 - Installations required for any developer who wants to work on our project.
**Installations and frameworks**
Our project doesn't require too much in this regard. tho the user must:
* Download nodejs.
* Additionally, a developer might need an ide. You can go with vs code and so on if you so choose.
#### Part 4 - Installation and running of the program from scratch.
To run our program from scratch, the user will need to:
* Clone our code from the git repository. (could install it via zip from the web page or install git and login and so on and then git clone it).
* Install nodejs environment.
* Install the express library for javascript (npm install express in cmd).
* Run the server files with nodejs (go to cmd, type node server.js).
Quite simple I believe (hopefully I didn't forget anything)
##### Part 5 - Graphs and UMLs.
A draw.io file is inside the git repository, which contains all relevant information and graphs.
In addition, we added a picture of the uml in case you don't feel like opening draw.io.
###### Part 6 - A video of the project.
Link to said video is: https://youtu.be/EguSYT05kFQ
