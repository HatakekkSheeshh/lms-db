from flask import Blueprint, jsonify
from config.database import get_db_connection
from utils.jwt_utils import require_auth

grades_bp = Blueprint('grades', __name__)

@grades_bp.route('/user/<int:user_id>', methods=['GET'])
@require_auth
def get_user_grades(user_id):
    """Get all grades for a student from all sections"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentAllGrades %s', (user_id,))
        results = cursor.fetchall()
        conn.close()
        
        grades = []
        for row in results:
            grades.append({
                'Assessment_ID': int(row[0]) if row[0] else None,
                'Section_ID': row[1],
                'Course_ID': row[2],
                'Semester': row[3],
                'Quiz_Grade': float(row[4]) if row[4] is not None else None,
                'Assignment_Grade': float(row[5]) if row[5] is not None else None,
                'Midterm_Grade': float(row[6]) if row[6] is not None else None,
                'Final_Grade': float(row[7]) if row[7] is not None else None,
                'Status': row[8],
                'Registration_Date': str(row[9]) if row[9] else None,
                'Potential_Withdrawal_Date': str(row[10]) if row[10] else None,
                'Course_Name': row[11],
                'Credits': int(row[12]) if row[12] else None,
                'GPA': float(row[13]) if row[13] is not None else None,
            })
        
        return jsonify(grades)
    except Exception as e:
        print(f'Get user grades error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get grades: {str(e)}'}), 500
