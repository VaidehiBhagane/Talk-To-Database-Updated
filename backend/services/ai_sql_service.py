from groq import Groq
import re
from config import Config
import os

class AISQLService:
    """Service for converting natural language queries to SQL using Groq (Llama 3.1)"""
    
    def __init__(self):
        api_key = Config.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"  # Latest Llama model - fast, free, and powerful
    
    def generate_sql(self, natural_query, schema_info, bu_name):
        """
        Convert natural language query to SQL
        
        Args:
            natural_query: User's natural language query
            schema_info: Database schema information for the BU
            bu_name: Business unit name
        
        Returns:
            Dictionary with SQL query and explanation
        """
        try:
            # Create comprehensive prompt for Groq
            prompt = self._create_prompt(natural_query, schema_info, bu_name)
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert SQL query generator. Generate valid MySQL queries from natural language."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0
            )
            
            # Extract response
            response_text = response.choices[0].message.content
            
            # Parse SQL and explanation from response
            sql_query, explanation = self._parse_response(response_text)
            
            return {
                'success': True,
                'sql': sql_query,
                'explanation': explanation,
                'raw_response': response_text
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'AI SQL generation failed: {str(e)}'
            }
    
    def _create_prompt(self, natural_query, schema_info, bu_name):
        """Create comprehensive prompt for Groq"""
        prompt = f"""You are an expert SQL query generator. Convert the following natural language query into a valid MySQL SQL query.

Business Unit: {bu_name}

Database Schema Information:
{schema_info}

User's Natural Language Query:
{natural_query}

Instructions:
1. Generate a valid MySQL SQL query that accurately answers the user's question
2. Use only the tables and columns provided in the schema
3. Include appropriate JOINs, WHERE clauses, GROUP BY, ORDER BY as needed
4. Optimize the query for performance
5. Use proper SQL formatting and best practices
6. Return ONLY executable SQL - no explanatory text in the SQL itself
7. After the SQL, provide a brief explanation of what the query does

Format your response EXACTLY as follows:
SQL:
[Your SQL query here]

EXPLANATION:
[Brief explanation of what the query does and what insights it provides]

Remember:
- Use backticks for table/column names if they contain special characters
- Be precise with column names and table names
- If the query cannot be answered with the given schema, explain why"""
        
        return prompt
    
    def _parse_response(self, response_text):
        """Parse SQL and explanation from Groq's response"""
        try:
            # Try to extract SQL between SQL: and EXPLANATION:
            sql_match = re.search(r'SQL:\s*\n(.*?)\n\s*EXPLANATION:', response_text, re.DOTALL | re.IGNORECASE)
            
            if sql_match:
                sql = sql_match.group(1).strip()
                # Remove markdown code blocks if present
                sql = re.sub(r'^```sql\s*\n?', '', sql)
                sql = re.sub(r'\n?```$', '', sql)
                sql = sql.strip()
            else:
                # Fallback: try to find SQL in code blocks
                code_block = re.search(r'```sql\s*\n(.*?)\n```', response_text, re.DOTALL)
                if code_block:
                    sql = code_block.group(1).strip()
                else:
                    # Last resort: use the whole response
                    sql = response_text.strip()
            
            # Extract explanation
            explanation_match = re.search(r'EXPLANATION:\s*\n(.*)', response_text, re.DOTALL | re.IGNORECASE)
            
            if explanation_match:
                explanation = explanation_match.group(1).strip()
            else:
                explanation = "SQL query generated successfully."
            
            return sql, explanation
            
        except Exception as e:
            return response_text.strip(), "Unable to parse response."
    
    def validate_sql(self, sql):
        """
        Basic SQL validation to prevent dangerous operations
        
        Args:
            sql: SQL query string
        
        Returns:
            Tuple (is_valid, error_message)
        """
        sql_upper = sql.upper().strip()
        
        # Check for dangerous operations
        dangerous_keywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE', 'GRANT', 'REVOKE']
        
        for keyword in dangerous_keywords:
            if re.search(r'\b' + keyword + r'\b', sql_upper):
                return False, f"SQL contains prohibited operation: {keyword}"
        
        # Ensure it's a SELECT query
        if not sql_upper.startswith('SELECT'):
            return False, "Only SELECT queries are allowed"
        
        # Check for multiple statements
        if ';' in sql.rstrip(';'):
            return False, "Multiple SQL statements are not allowed"
        
        return True, "Valid"

# Create singleton instance
ai_sql_service = AISQLService()
