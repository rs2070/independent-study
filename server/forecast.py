import pandas as pd
from prophet import Prophet

def generate_forecast(zestimate_data, periods):
    try:
        # Prepare the DataFrame
        df = pd.DataFrame({
            'ds': pd.to_datetime([item['t'] for item in zestimate_data], unit='s'),
            'y': [item['v'] for item in zestimate_data]
        })

        # Initialize and fit the Prophet model
        model = Prophet()
        model.fit(df)

        # Create future DataFrame
        future = model.make_future_dataframe(periods=periods * 365 // 12, freq='M')
        forecast = model.predict(future)

        # Filter out the future data
        forecast_future = forecast[forecast['ds'] > df['ds'].max()]

        # Prepare the response
        forecast_data = forecast_future[['ds', 'yhat']].rename(columns={'ds': 'date', 'yhat': 'value'})
        return forecast_data.to_dict(orient='records')
    except Exception as e:
        print(f"Error in generating forecast: {str(e)}")
        return None
