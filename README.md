# Technical test for ABB

## 1. Project scenario

In this assignment a scenario is described where machines that produce certain parts must report their activity to a server, where this reports should be elaborated (by verifying the production), registered and notified in real-time to connected clients.

A machine can produce a single type of part (it may be able to produce many different, but for simplicty of the demo design, I will assume they produce only one type). A part has many features and for each feature there can be multiple controls to validate the production of the whole part. A control has at least four components (x, y, z and diameter). For each control there is an ideal value and a maximum error tolerance value. The system must compute the deviations between the ideal and the produced values, for each component of the feature's control.


## 2. Questions

1. **How do you imagine the back-end architecture?**

I have though on a system that can handle at least two different profiles: one for production machines -that will send messages to register production activity and performance-, and another one for user -clients that will access to real-time monitoring-.
A machine profile will hold data about all different "controls" that the machine posses, and for each of them, the ideal values, the maximum error tolerance, and other elementary information.

A machine receives its profile once it has connected and authenticated on the server. With the information on its profile it can build up the structure of the notification messages to be sent to the server every time a new part has been produced.

On the server side, with the arrival of a new notification message from a machine, the part production data is verified by comparing the's values with the ideal values and the error tolerance values of the corresponding part. Then the production register and the computed data is combined in a single record that is saved in the database for the corresponding machine.

The monitoring clients connect to the server and receive the list of machines that are currently online and available for monitoring. The client can then select a machine and access to the real-time activity reports. At first, it would receive the last production registry. Later on, every time a new part is registered on the server, the client received a push notification from the server to update the view with fresh data. There should also exist a different type of user profile with access to machine and user management.


2. **How would you connect the back-end and the front-end so that application would update on each new register?**

As I have done in my demo, I would use Socket.IO with websockets transport (there's also the possibility to use 'polling' as a transport with Socket.IO, but this can be more demanding). Socket.IO provides an very useful framework to handle this communication model where many clients connect to a server and interact between each other. In my demo each machine creates a socket channel once it connects to the server. The clients can then subscribe to a channel to receive updates.


3. **How would you divide the described application into software / docker components?**


#### A. Software

In this demo I have chosen to separate the system into three different components: **Machine Client**, **Server App** and **Web Client**.

The machines with the scanners would use the **Machine Client** application to connect to the **Server App** and retrieve their  configured machine profile, that holdd all relevant information about the machine's control set. The client applications sends notifications to the server on the production of each part.

The **App Server** verifies and registers the parts sent by the machines. Each new piece that arrives at the server is first verified: the observable deviations in the part's features are computed and also the validity of features and parts. This data is then registered in the database and a notification is sent to all clients that are subscribed to monitor the corresponding machine.

The **Web Client** is a front-end application that can be served independently (using Nginx or Apache for example). The application connects to the **Server App** and starts **user** session, then requests the list of online machines that are available for live monitoring. 

In the demo that I created, the user can only monitor the activity of the machines but of course it could also include functionality to carry out maintenance tasks or operate the machines remotely. Machine-to-machine communication is also possible.


#### B. Containers

In an ideal scenario where I would have different equipment available to work with, I think I would seek to distribute the workload into three components: **Data Base**, **Server App** and **Client App**. Each of these components would have its own Docker container and could thus run on different computers or instances.
I do not know the details about the integration of the NodeJS application in the parts production machines as I ignore the nature of this machines, but I think there would be different options: at least, the machines could access a repository to download the machine client software. If this machines already use Docker container, I would add the repository to the image and use a script to install the application once the Docker image is launched.

If, perhaps, the scenario were different from what I first imagined, and there were hundreds of machines producing parts and hundreds of other customers monitoring and operating machines remotely, I think it would be possible to set up an in-site system with a micro services architecture that would be able to manage the high demand of the described scenario. There are very interesting options in node such as the use of clusters or application designs based on node workers that could certainly be applicable to such a scenario.


## 3. Installation

1. Make sure you have MongoDB installed in your system. Version **4.2** was used but should run with 4.0 too (not tested).
2. Clone this repo:
`git clone git@github.com:GorillaBus/abb-test.git` 
3. Install dependencies with `npm install`
4. Import the database by running: `mongorestore -d abb-test db/`


## 4. Run the simulation

1- Run the server app: enter the src/ directory and run: `node server.js`
2- Use the script in src/machine-client.js to run a machine simulator. There are three preloaded machine profiles, each of which should be used with its corresponding token. The machine profile to use can be specified by command line arguments:

`node machine-client.js --client <0-2>`

If no argument is given then profile 0 is used by default.
Once launched, the client will start emiting part messages to the server every two seconds (you should see the log in the console). To change the interval edit the machine-client.js file, search for the method `initSession()` and pass a different value in ms.

You can open up to three terminals and run `node machine-client.js --client 0`, `node machine-client.js --client 1` and `node machine-client.js --client 2` to have up to three machine simulators sending data.


## 5. Run the web client

1- Clone the web-client repo:

`git clone git@github.com:GorillaBus/abb-test-front.git`
`cd abb-test-front`

2- Install dependencies:
`npm install`

3- Run the create-react-app pre-configured environment (launches web-server and browser):
`npm start`

(A browser window should open at: 127.0.0.1:3001 and you should see a list of online machines)

4- Click on a machine to start monitoring in real-time

Note: if you want to connect the client from a different computer within your local network just edit src/components/App/App.js.


## 6. The "worst values over the last 30 registers" query

The front-end displays data from the last registers but also the worst deviation registered over the last 30 produced parts. I resolved this on my demo by using the aggregation framework.

Lets first define: **N_CONTROLS** as the total number of controls for a part and **N_LAST** the number of registers to aggregate, in this case, a number of 30 was requested (but it can be configured in **src/config/config.json**).

The query:
```javascript
db.logs.aggregate([
  { $match: { machine_id: ObjectId("5e29a2c5e22adc395f5744ac") } },
  { $sort: { date: -1 } },
  { $limit:  N_CONTROLS * N_LAST },
  { $group: {
              _id: "$control_id",
              total_dx: { $max: "$x_dev" },
              total_dy: { $max: "$y_dev" },
              total_dz: { $max: "$z_dev" },
              total_dd: { $max: "$d_dev" }
            }
  }
])
```
First I'm matching a particular machine. Remember that this demo assumes one PART per machine, that is why I'm matching MACHINE IDs and not PART IDs (there is not PART collection).
Secondly I'm sorting by date to have the last records first.
Then I'm limiting the total records to work with the first **N_CONTROLS * N_LAST** ones: because each time a part is registered all controls are saved in batch, **N_CONTROLS * N_LAST** brings all the relevant registers.
Finally, I'm grouping all the registers by CONTROL_ID and calculating the maximum value for each control component (X, Y, Z, DIAMETER).

Note that using $match -> $sort -> $limit order is recommended by MongoDB as a [pipeline optimization](https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/). Also, two indexes help improve the query's performance:

Single index: machine_id
Compound index: machine_id + date

In other order of optimizations, if you check the services/* modules you will find that most queries are returned with lean(). Mongoose will return a POJO (Plain Old Javascript Ojbect) instead of a Mongoose object when using lean(). This usually helps improve performance.


