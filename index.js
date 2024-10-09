import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Create the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware to parse URL
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic route
app.get('/', (req, res) => {
    res.render('index', { uvIndex: null, error: null });
});

app.post('/get-uv', async (req, res) => {
    const { latitude, longitude } = req.body;
    const apiKey = 'openuv-1mxfsvrm205plch-io'; // Replace with your actual API key
    const apiUrl = `https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'x-access-token': apiKey
            }
        });

        const uvData = response.data.result; // Get the entire result object

        console.log('API Response:', response.data); // Log the API response
        
        // Format the safe exposure time from the API response
        const safeExposureTime = Object.entries(uvData.safe_exposure_time)
            .map(([key, value]) => `${key}: ${value} minutes`)
            .join(', ');

        // Function to format time strings and handle invalid dates
        const formatTime = (timeString) => {
            if (!timeString) {
                return "Data not available"; // Return an informative string for null values
            }
            const date = new Date(timeString);
            return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString(); // Format valid dates
        };

        const sunrise = formatTime(uvData.sun_info.sun_times.sunrise);
        const solarNoon = formatTime(uvData.sun_info.sun_times.solarNoon);
        const sunset = formatTime(uvData.sun_info.sun_times.sunset);

        res.render('index', {
            uvIndex: uvData.uv,
            uvTime: formatTime(uvData.uv_time), // Format UV time
            uvMax: uvData.uv_max,
            uvMaxTime: formatTime(uvData.uv_max_time), // Format max UV time
            safeExposureTime: safeExposureTime, // Ensure that safeExposureTime is defined
           
            sunrise: sunrise, // Properly access sunrise

            solarNoon: solarNoon, // Properly access solar noon

            sunset: sunset, // Properly access sunset
            
            error: null
        });
    } catch (error) {
        console.error('Error fetching UV data:', error.response ? error.response.data : error.message);
        res.render('index', { uvIndex: null, error: error.response?.data?.error || 'Error retrieving data.' });
    }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} hahaha`);
});

