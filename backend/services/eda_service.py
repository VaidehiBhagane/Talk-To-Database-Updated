"""
Service for Exploratory Data Analysis (EDA) with anomaly detection
"""
import pandas as pd
import numpy as np
from scipy import stats
from groq import Groq
from config import Config
import os

class EDAService:
    """Service for automated exploratory data analysis and anomaly detection"""
    
    def __init__(self):
        # Get Groq API key for AI interpretation
        self.api_key = Config.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
        else:
            self.client = None
        
        self.model = "llama-3.3-70b-versatile"
    
    def analyze_data(self, data, bu_name):
        """
        Perform comprehensive EDA on dataset
        
        Args:
            data: List of dictionaries (query results)
            bu_name: Business unit name for context
        
        Returns:
            Dictionary with stats, anomalies, and AI summary
        """
        try:
            if not data or len(data) == 0:
                return {
                    'success': True,
                    'stats': {'row_count': 0},
                    'anomalies': [],
                    'summary': 'No data available to analyze.'
                }
            
            # Convert to DataFrame
            df = pd.DataFrame(data)
            
            # Basic statistics
            stats_dict = self._compute_basic_stats(df)
            
            # Column-level analysis
            column_stats = self._analyze_columns(df)
            stats_dict['columns'] = column_stats
            
            # Detect anomalies using Z-score
            anomalies = self._detect_anomalies(df)
            
            # Generate AI interpretation
            summary = self._generate_ai_summary(stats_dict, anomalies, bu_name)
            
            return {
                'success': True,
                'stats': stats_dict,
                'anomalies': anomalies,
                'summary': summary
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'EDA analysis failed: {str(e)}'
            }
    
    def _compute_basic_stats(self, df):
        """Compute basic dataset statistics"""
        return {
            'row_count': int(len(df)),
            'column_count': int(len(df.columns)),
            'memory_usage': float(df.memory_usage(deep=True).sum() / 1024),  # KB
            'duplicate_rows': int(df.duplicated().sum()),
        }
    
    def _analyze_columns(self, df):
        """Analyze each column in detail"""
        column_stats = {}
        
        for col in df.columns:
            col_data = df[col]
            stats = {
                'name': col,
                'dtype': str(col_data.dtype),
                'null_count': int(col_data.isnull().sum()),
                'null_percentage': float(round(col_data.isnull().sum() / len(df) * 100, 2)),
                'unique_count': int(col_data.nunique()),
            }
            
            # Numeric column analysis
            if pd.api.types.is_numeric_dtype(col_data):
                stats['type'] = 'numeric'
                stats['min'] = float(col_data.min()) if not col_data.isnull().all() else None
                stats['max'] = float(col_data.max()) if not col_data.isnull().all() else None
                stats['mean'] = float(col_data.mean()) if not col_data.isnull().all() else None
                stats['median'] = float(col_data.median()) if not col_data.isnull().all() else None
                stats['std'] = float(col_data.std()) if not col_data.isnull().all() else None
            
            # Categorical column analysis  
            else:
                stats['type'] = 'categorical'
                # Top 5 values
                value_counts = col_data.value_counts().head(5)
                stats['top_values'] = [
                    {'value': str(val), 'count': int(count)}
                    for val, count in value_counts.items()
                ]
            
            column_stats[col] = stats
        
        return column_stats
    
    def _detect_anomalies(self, df, threshold=3):
        """
        Detect anomalies using Z-score method
        
        Args:
            df: DataFrame
            threshold: Z-score threshold (default 3 = 99.7% confidence)
        
        Returns:
            List of anomalous rows with details
        """
        anomalies = []
        
        # Get numeric columns only
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) == 0:
            return anomalies
        
        # Calculate Z-scores for numeric columns
        z_scores = np.abs(stats.zscore(df[numeric_cols], nan_policy='omit'))
        
        # Find rows with at least one anomalous value
        anomaly_mask = (z_scores > threshold).any(axis=1)
        anomaly_indices = df[anomaly_mask].index.tolist()
        
        # Collect anomaly details
        for idx in anomaly_indices[:50]:  # Limit to first 50 anomalies
            row = df.loc[idx]
            row_z_scores = z_scores[idx]
            
            # Find which columns are anomalous
            anomalous_columns = []
            for i, col in enumerate(numeric_cols):
                if row_z_scores[i] > threshold:
                    anomalous_columns.append({
                        'column': col,
                        'value': float(row[col]) if pd.notna(row[col]) else None,
                        'z_score': float(row_z_scores[i])
                    })
            
            # Convert row data to native Python types
            row_data_dict = {}
            for key, val in row.to_dict().items():
                if pd.isna(val):
                    row_data_dict[key] = None
                elif isinstance(val, (np.integer, np.int64)):
                    row_data_dict[key] = int(val)
                elif isinstance(val, (np.floating, np.float64)):
                    row_data_dict[key] = float(val)
                else:
                    row_data_dict[key] = str(val)
            
            anomalies.append({
                'row_index': int(idx),
                'row_data': row_data_dict,
                'anomalous_columns': anomalous_columns
            })
        
        return anomalies
    
    def _generate_ai_summary(self, stats_dict, anomalies, bu_name):
        """Generate AI interpretation of the EDA results"""
        if not self.client:
            return self._generate_fallback_summary(stats_dict, anomalies)
        
        try:
            # Create a concise summary of findings
            findings_text = f"""Business Unit: {bu_name}

Dataset Overview:
- Rows: {stats_dict['row_count']}
- Columns: {stats_dict['column_count']}
- Duplicate rows: {stats_dict['duplicate_rows']}
- Anomalies detected: {len(anomalies)}

Column Analysis:
"""
            for col_name, col_stats in list(stats_dict['columns'].items())[:5]:  # First 5 columns
                findings_text += f"\n{col_name} ({col_stats['type']}):\n"
                findings_text += f"  - Null values: {col_stats['null_percentage']}%\n"
                findings_text += f"  - Unique values: {col_stats['unique_count']}\n"
                
                if col_stats['type'] == 'numeric' and col_stats['mean']:
                    findings_text += f"  - Mean: {col_stats['mean']:.2f}, Std: {col_stats['std']:.2f}\n"
            
            if anomalies:
                findings_text += f"\nAnomalies: {len(anomalies)} rows with unusual values detected.\n"
            
            prompt = f"""{findings_text}

Based on the above data analysis, provide a clear 3-4 sentence summary that:
1. Describes the overall data quality
2. Highlights any concerning patterns (missing data, duplicates, anomalies)
3. Provides actionable insights or recommendations

Keep it concise and professional."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data quality analyst providing insights on dataset analysis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"AI summary generation failed: {e}")
            return self._generate_fallback_summary(stats_dict, anomalies)
    
    def _generate_fallback_summary(self, stats_dict, anomalies):
        """Generate a basic summary without AI"""
        summary = f"Dataset contains {stats_dict['row_count']} rows and {stats_dict['column_count']} columns."
        
        if stats_dict['duplicate_rows'] > 0:
            summary += f" Found {stats_dict['duplicate_rows']} duplicate rows."
        
        if anomalies:
            summary += f" Detected {len(anomalies)} anomalous records that deviate significantly from normal patterns."
        
        # Check for columns with high null percentage
        high_null_cols = [
            name for name, stats in stats_dict['columns'].items()
            if stats['null_percentage'] > 20
        ]
        
        if high_null_cols:
            summary += f" Columns with >20% missing data: {', '.join(high_null_cols[:3])}."
        
        return summary

# Create singleton instance
eda_service = EDAService()
