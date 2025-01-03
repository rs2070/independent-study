<p float="left">
  <img src="https://i.postimg.cc/mDcFFCGx/Screenshot-2024-12-13-at-12-44-52-PM.jpg" width="225px" height="550px">
  <img src="https://i.postimg.cc/rpZrmg3C/Screenshot-2024-12-13-at-12-44-16-PM.jpg" width="225px" height="550px">
  <img src = "https://i.postimg.cc/gJfLyjYx/Screenshot-2024-12-13-at-12-44-30-PM.jpg" width="225px" height="550px">
</p>


# MyPropertyApp

MyPropertyApp is an application built with React, Flask, and .NET Core with Entity Framework that assists users in locating properties within a certain city, state. The software offers property listings and more filtering choices, such as filter-based searches, by utilizing the Zillow APIs. For smooth deployment across environments, it is Dockerized. 

---

## **Features**

- **Dynamic Property Search**: Users can search for properties by location, price range, property type, and other criteria.
- **Future Price Visualization:** Uses the Prophet library to forecast property prices, which improves investment decisions.
- **Responsive Design**: Developed with React to ensure a consistent experience across all devices.
- **User Preferences**: Uses Entity Framework to perform CRUD actions on user preferences that persist between sessions.
- **API/Data Integration**: Uses Zillow for real-time property data and New York Time's JSON data for political analysis.

---

## **Frameworks**

- **Front-End**: React enables dynamic and interactive user interfaces.
  - **CSS**: Styles for frontend components.
  - **JavaScript/JSX**: Used to handle UI logic and API queries.
- **Back-End**: Flask serves the backend API, which interacts with front-end queries.
  - **Prophet**: Used to forecast property prices based on historical data.
- **Databases**: Entity Framework is used in .NET to persist data and store user preferences in SQL databases.
- **APIs**: Include Zillow's Rapid API endpoints, which provides detailed information on properties and their Zestimate data, in order to model chart data and future-trend visualization.
- **New York Times JSON Data**: To enhance search capability with political preferences data.

---

## **Setup**

### **1. Clone Repo (Optional)**

Run this command to pull and view the Repo:

```
git clone https://github.com/rs2070/independent-study.git
cd independent-study
```

### **2. Build Docker Image**

Ensure Docker is installed, then build this application with the command:

```
docker build -t mypropertyapp .
```

### **3. Run Container**

Run:

```
docker run -p 3000:3000 mypropertyapp
```

Open any browser, and head to ```http://localhost:3000``` to view the application.

---

## **Documentation**

API documentation is available at ```/api/docs``` for backend endpoints utilized by frontend services.

---

## **Limitations**

Ensure that Zillow's API keys are up to date, as the present keys may be limited to a particular number of monthly calls.
The application is designed to run in a development environment; however, changes are required for production deployment to improve security and performance.

---

## **Note**
This project is currently a working demo with further implementations planned to iron out front-end processing. The present version of the application uses free-tier APIs, which may limit its usefulness due to rate limiting or data cap constraints. The displayed statistics, particularly the forecast and property photos, are for demonstration purposes and may not always reflect real-time changes owing to API constraints.
