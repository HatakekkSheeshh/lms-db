from flask import Blueprint, jsonify
from config.database import get_db_connection

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_schedule(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get schedule based on enrollments
        # Note: Using Assessment table to get student enrollments
        cursor.execute("""
            SELECT DISTINCT
                s.Section_ID,
                c.Name as Course_Name,
                c.Course_ID,
                s.Semester
            FROM [Assessment] a
            INNER JOIN [Section] s ON a.Section_ID = s.Section_ID AND a.Course_ID = s.Course_ID AND a.Semester = s.Semester
            INNER JOIN [Course] c ON s.Course_ID = c.Course_ID
            WHERE a.University_ID = ?
        """, user_id)

        schedule_items = cursor.fetchall()
        conn.close()

        result = []
        for item in schedule_items:
            result.append({
                'Section_ID': item.Section_ID,
                'Course_Name': item.Course_Name,
                'Course_ID': item.Course_ID,
                'Semester': item.Semester,
            })

        return jsonify(result)
    except Exception as e:
        print(f'Get user schedule error: {e}')
        return jsonify({'success': False, 'error': 'Failed to fetch schedule'}), 500
