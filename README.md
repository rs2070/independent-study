# MyPropertyApp

MyPropertyApp is an application built with React and Flask that assists users in locating properties within a certain ZIP code and related areas. The software offers property listings and more filtering choices, such as radius-based searches, by utilizing the Zillow and Geoapify APIs. For smooth deployment across environments, it is Dockerized. 

---

## **Features**

- **ZIP Code Search**: Input a ZIP code to find housing listings within the area.
- **Radius Filtering**: Option to select a radius (e.g., 5, 10 miles) to include listings from nearby.
- **Property Details**:
  - View prices, addresses, and other key details.
  - View property images for a better experience.
- **Interactive UI**: Programmed with React for a user-friendly, responsive design.

---

## **Setup**

### **1. Install Image**
Ensure Docker is installed.  
Then, run this command to pull the Docker Image:

```
docker pull rs2070/mypropertyapp
```

### **2. Run Locally**
Start this application with the command:

```
docker run -p 3000:3000 rs2070/mypropertyapp
```
Open any browser, and head to ```http://localhost:3000``` to view the application.

### **3. Access on Other Devices**

To ensure that this program is accessible/viewable across other devices using the same network, find your device's local IP:

-macOS/Linux: Type ```ifconfig``` in Terminal.

-Windows: Type ```ipconfig``` in Command Prompt.

Then, to the run the container using this IP, you can run the command:

```
docker run -p 3000:3000 rs2070/mypropertyapp
```

Now for other devices on the same network, open a browser and go to http://[your-IP]:3000.

---

### **About**
Front-end: React (and Axios for API calls).

Back-end: Flask.

APIs:

-Zillow: Receive property data for specific city.

-Geoapify: Fetch cities within specific radius.

Deployment: Dockerized to ensure playability for cross-platform.

Future Features:

-User Preferences: Retrieve/store user preferences using SQL databases.

-Advanced Filtering: More filtering options for property type, amenities, and so forth.

Limitations:

-Ensure valid US-ZIP codes are inputted for accurate results.

-API limits may affect the number of results fetched.

