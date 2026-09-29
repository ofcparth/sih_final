import pandas as pd
import time

def process_gsheet_data(sheet_url):
    print(f"🚀 Initializing AI Pipeline...")
    print(f"🌐 Fetching data from Google Sheet URL...")
    
    try:
        # For public Google Sheets, you can export directly to CSV using the URL format:
        # https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv
        
        # Read the Google Sheet data directly into a pandas DataFrame
        df = pd.read_csv(sheet_url)
        
        print(f"✅ Successfully loaded {len(df)} rows and {len(df.columns)} columns from Google Sheets.")
        print("-" * 40)
        
        print("📊 Data Preview (Top 5 rows):")
        print(df.head())
        print("-" * 40)
        
        print("🧠 Running AI/ML extraction and analysis...")
        time.sleep(2) # Simulating processing time
        
        # Basic data analysis (Replace with actual ML model logic)
        for column in df.select_dtypes(include=['number']).columns:
            mean_val = df[column].mean()
            max_val = df[column].max()
            print(f"Feature '{column}' -> Mean: {mean_val:.2f}, Max: {max_val:.2f}")
            
        print("-" * 40)
        print("✅ Google Sheet Pipeline execution completed successfully.")
        
    except Exception as e:
        print(f"❌ Failed to process the Google Sheet. Error: {e}")
        print("Make sure the Google Sheet link is correct, set to 'Anyone with the link can view', and formatted as a CSV export link.")

if __name__ == "__main__":
    # Replace this URL with your actual Google Sheet export link.
    # The format must be: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
    # Example mock URL (this specific link won't work unless it's a real public sheet ID):
    PUBLIC_GSHEET_URL = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv"
    
    process_gsheet_data(PUBLIC_GSHEET_URL)
