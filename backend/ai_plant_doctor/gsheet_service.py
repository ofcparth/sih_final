import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

SPREADSHEET_ID = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "1dnLEKXHdmtnZHZSwXRdZ2RI2w9DTtPWOQFyAF3pBOuQ")

def run_ml_predictions(df):
    """
    Placeholder function to run ML predictions on the dataframe.
    Iterates over rows, simulates a prediction, and adds 'AI_Prediction' column.
    """
    # Simulate a prediction based on mock logic (e.g. if Temperature > 30 -> High Risk)
    predictions = []
    for index, row in df.iterrows():
        # Fallback to defaults if columns are missing
        temp = row.get('Temperature', 25)
        moisture = row.get('Average', row.get('Moisture', 50))
        
        # Make a mock prediction
        if temp > 35 or moisture < 30:
            pred = "High Stress"
        elif temp > 30 or moisture < 40:
            pred = "Moderate Stress"
        else:
            pred = "Optimal"
        predictions.append(pred)
        
    df['AI_Prediction'] = predictions
    return df

def fetch_and_process_gsheet_data():
    """
    Fetches live data from a public Google Sheet via CSV export link,
    cleans it, and runs ML predictions.
    """
    url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv"
    
    try:
        # Read data using pandas
        df = pd.read_csv(url)
        
        # Clean data: drop empty rows
        df = df.dropna(how='all')
        
        # Ensure numeric columns are properly formatted
        numeric_cols = ['Temperature', 'Average', 'Moisture', 'Humidity', 'Nitrogen', 'Phosphorus', 'Potassium', 'pH']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                
        # Drop rows where critical numeric columns became NaN
        df = df.dropna(subset=[col for col in numeric_cols if col in df.columns])
        
        # Run predictions
        df = run_ml_predictions(df)
        
        return df
    except Exception as e:
        print(f"Error fetching or processing Google Sheets data: {e}")
        return None

if __name__ == "__main__":
    df_final = fetch_and_process_gsheet_data()
    if df_final is not None:
        print("--- Final Processed Data ---")
        print(df_final.tail())
        print("\n--- Summary ---")
        print(df_final.describe())
