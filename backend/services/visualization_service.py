import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import json

class VisualizationService:
    """Service for generating Plotly visualizations from query results"""
    
    @staticmethod
    def auto_detect_chart_type(df, query_text=""):
        """
        Automatically detect the most appropriate chart type based on data
        
        Args:
            df: Pandas DataFrame with query results
            query_text: Original user query for context
        
        Returns:
            Suggested chart type
        """
        if df.empty:
            return 'table'
        
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Keyword-based detection
        query_lower = query_text.lower()
        
        if 'trend' in query_lower or 'over time' in query_lower:
            return 'line'
        elif 'distribution' in query_lower or 'breakdown' in query_lower:
            return 'pie'
        elif 'compare' in query_lower or 'comparison' in query_lower:
            return 'bar'
        
        # Data-based detection
        if len(num_cols) >= 1 and len(cat_cols) >= 1:
            if len(df) <= 10:
                return 'pie'
            else:
                return 'bar'
        elif len(num_cols) >= 2:
            return 'scatter'
        elif len(num_cols) == 1 and len(cat_cols) >= 1:
            return 'bar'
        
        return 'table'
    
    @staticmethod
    def generate_visualization(data, chart_type='auto', title='Query Results', query_text=""):
        """
        Generate Plotly visualization from query results
        
        Args:
            data: List of dictionaries (query results)
            chart_type: Type of chart ('auto', 'bar', 'line', 'pie', 'scatter', 'table')
            title: Chart title
            query_text: Original query for context
        
        Returns:
            Dictionary with Plotly figure JSON and metadata
        """
        try:
            if not data:
                return {
                    'success': False,
                    'error': 'No data to visualize'
                }
            
            # Convert to DataFrame
            df = pd.DataFrame(data)
            
            # Auto-detect chart type if needed
            if chart_type == 'auto':
                chart_type = VisualizationService.auto_detect_chart_type(df, query_text)
            
            # Generate appropriate visualization
            if chart_type == 'bar':
                fig = VisualizationService._create_bar_chart(df, title)
            elif chart_type == 'line':
                fig = VisualizationService._create_line_chart(df, title)
            elif chart_type == 'pie':
                fig = VisualizationService._create_pie_chart(df, title)
            elif chart_type == 'scatter':
                fig = VisualizationService._create_scatter_plot(df, title)
            elif chart_type == 'table':
                fig = VisualizationService._create_table(df, title)
            else:
                fig = VisualizationService._create_bar_chart(df, title)
            
            # Convert to JSON
            fig_json = json.loads(fig.to_json())
            
            return {
                'success': True,
                'figure': fig_json,
                'chart_type': chart_type,
                'data_summary': {
                    'rows': len(df),
                    'columns': len(df.columns),
                    'column_names': df.columns.tolist()
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Visualization generation failed: {str(e)}'
            }
    
    @staticmethod
    def _create_bar_chart(df, title):
        """Create bar chart"""
        # Get first categorical and first numerical column
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        if not cat_cols or not num_cols:
            # Fallback to first two columns
            x_col = df.columns[0]
            y_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        else:
            x_col = cat_cols[0]
            y_col = num_cols[0]
        
        fig = px.bar(df, x=x_col, y=y_col, title=title,
                     labels={x_col: x_col.replace('_', ' ').title(),
                            y_col: y_col.replace('_', ' ').title()})
        
        fig.update_layout(template='plotly_white', hovermode='x unified')
        return fig
    
    @staticmethod
    def _create_line_chart(df, title):
        """Create line chart"""
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        if not cat_cols or not num_cols:
            x_col = df.columns[0]
            y_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        else:
            x_col = cat_cols[0]
            y_col = num_cols[0]
        
        fig = px.line(df, x=x_col, y=y_col, title=title, markers=True,
                      labels={x_col: x_col.replace('_', ' ').title(),
                             y_col: y_col.replace('_', ' ').title()})
        
        fig.update_layout(template='plotly_white', hovermode='x unified')
        return fig
    
    @staticmethod
    def _create_pie_chart(df, title):
        """Create pie chart"""
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        if not cat_cols or not num_cols:
            names_col = df.columns[0]
            values_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        else:
            names_col = cat_cols[0]
            values_col = num_cols[0]
        
        # Limit to top 10 for readability
        if len(df) > 10:
            df = df.nlargest(10, values_col)
        
        fig = px.pie(df, names=names_col, values=values_col, title=title)
        fig.update_traces(textposition='inside', textinfo='percent+label')
        fig.update_layout(template='plotly_white')
        return fig
    
    @staticmethod
    def _create_scatter_plot(df, title):
        """Create scatter plot"""
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        if len(num_cols) >= 2:
            x_col = num_cols[0]
            y_col = num_cols[1]
        else:
            x_col = df.columns[0]
            y_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        
        fig = px.scatter(df, x=x_col, y=y_col, title=title,
                        labels={x_col: x_col.replace('_', ' ').title(),
                               y_col: y_col.replace('_', ' ').title()})
        
        fig.update_layout(template='plotly_white')
        return fig
    
    @staticmethod
    def _create_table(df, title):
        """Create interactive table"""
        fig = go.Figure(data=[go.Table(
            header=dict(values=list(df.columns),
                       fill_color='paleturquoise',
                       align='left',
                       font=dict(size=12, color='black')),
            cells=dict(values=[df[col] for col in df.columns],
                      fill_color='lavender',
                      align='left',
                      font=dict(size=11)))
        ])
        
        fig.update_layout(title=title, template='plotly_white')
        return fig

# Create singleton instance
visualization_service = VisualizationService()
