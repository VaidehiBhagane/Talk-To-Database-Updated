"""
Service for generating natural language summaries of query results using Groq (Llama 3.3)
"""
import os
from groq import Groq
from config import Config

class SummarizationService:
    """Service for generating AI summaries of query results using Groq Llama 3.3"""
    
    def __init__(self):
        # Get Groq API key from environment (same key used for SQL generation)
        self.api_key = Config.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        if not self.api_key:
            print("Warning: GROQ_API_KEY not set - summarization will not work")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
        
        self.model = "llama-3.3-70b-versatile"  # Same model as SQL generation
    
    def generate_summary(self, results, question, max_rows_to_analyze=100):
        """
        Generate a plain English summary of query results
        
        Args:
            results: List of dictionaries containing query results
            question: The user's original natural language question
            max_rows_to_analyze: Maximum number of rows to send to Claude (default: 100)
        
        Returns:
            Dictionary with summary text or error
        """
        try:
            if not self.client:
                return {
                    'success': False,
                    'error': 'Summarization service not configured (missing GROQ_API_KEY)'
                }
            
            if not results or len(results) == 0:
                return {
                    'success': True,
                    'summary': 'No results were returned from the query.'
                }
            
            # Limit the number of rows sent to Groq to avoid token limits
            sample_results = results[:max_rows_to_analyze]
            total_rows = len(results)
            
            # Format results for Groq
            results_text = self._format_results(sample_results, total_rows)
            
            # Create prompt for Groq
            prompt = self._create_prompt(question, results_text, total_rows)
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data analyst providing clear, concise insights on query results."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            # Extract summary from response
            summary = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'summary': summary
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Summarization failed: {str(e)}'
            }
    
    def _format_results(self, results, total_rows):
        """Format query results into a readable text format"""
        if not results:
            return "No data"
        
        # Get column names
        columns = list(results[0].keys())
        
        # Format as a table-like text
        formatted = f"Total rows: {total_rows}\n"
        formatted += f"Showing first {len(results)} rows:\n\n"
        formatted += "Columns: " + ", ".join(columns) + "\n\n"
        
        # Add sample rows
        for i, row in enumerate(results[:10], 1):  # Show first 10 rows
            formatted += f"Row {i}:\n"
            for col, val in row.items():
                formatted += f"  {col}: {val}\n"
            formatted += "\n"
        
        if len(results) > 10:
            formatted += f"... and {len(results) - 10} more rows in the sample\n"
        
        return formatted
    
    def _create_prompt(self, question, results_text, total_rows):
        """Create prompt for Groq"""
        prompt = f"""You are a data analyst providing insights on query results. 

User's Question: {question}

Query Results:
{results_text}

Based on the data above, provide a clear, concise 2-3 sentence summary that:
1. Directly answers the user's question
2. Highlights the most important insights or patterns in the data
3. Mentions key numbers, trends, or findings

Keep it simple and conversational. Focus on what the data is telling us, not how the query works.

Summary:"""
        
        return prompt

# Create singleton instance
summarization_service = SummarizationService()
