import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from forecast import generate_forecast
import random

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all domains

# API key configuration
API_KEY = '455fe49fd9mshf2aa11941a0b9bep1a9583jsn2fb1854349f0'
HEADERS = {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'zillow-com1.p.rapidapi.com'
}

@app.route('/api/properties/search', methods=['GET'])
def search_properties():
    """ Search properties based on filters from the frontend """
    params = request.args.to_dict()
    response = requests.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', headers=HEADERS, params=params)
    return jsonify(response.json())

@app.route('/api/zestimatehistory', methods=['GET'])
def get_zestimate_history():
    zpid = request.args.get('zpid')
    if not zpid:
        return jsonify({'error': 'zpid parameter is required'}), 400

    url = f'https://zillow-com1.p.rapidapi.com/zestimateHistory?zpid={zpid}'
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to fetch data', 'statusCode': response.status_code}), response.status_code

@app.route('/api/forecast/<int:zpid>/<int:periods>', methods=['GET'])
def get_forecast(zpid, periods):
    print(f"Received forecast request for ZPID: {zpid} with periods: {periods}")
    valid_periods = [5, 10, 20]  # Valid periods for 5, 10, and 20 years
    if periods not in valid_periods:
        print("Invalid periods parameter provided")
        return jsonify({"error": "Invalid periods parameter"}), 400

    try:
        forecast_data = fetch_forecast_data(zpid, periods)
        if forecast_data:
            print("Forecast data successfully fetched and returned")
            return jsonify(forecast_data)
        else:
            print("No forecast data available for the provided parameters")
            return jsonify({"error": "No forecast data available"}), 404
    except Exception as e:
        print(f"Error processing forecast data: {str(e)}")
        return jsonify({"error": "Server error"}), 500

def fetch_forecast_data(zpid, periods):
    """Simulate fetching forecast data based on the property ZPID and the number of years."""
    try:
        base_value = 500000 + random.randint(0, 100000)  # Random base value for variation
        data = [{
            "date": f"{2020 + i}",
            "value": base_value + i * 10000  # Simple formula to increment value each year
        } for i in range(periods)]
        print(f"Generated forecast data for ZPID: {zpid} over {periods} periods")
        return {
            "zpid": zpid,
            "periods": periods,
            "forecast": data
        }
    except Exception as e:
        print(f"Error generating forecast data: {str(e)}")
        return None
    
@app.route('/api/properties/update-preferences', methods=['POST'])
def update_preferences():
    """ Update user preferences, example endpoint """
    try:
        data = request.json
        # Handle the preference update logic here
        return jsonify({'success': 'Preferences updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
