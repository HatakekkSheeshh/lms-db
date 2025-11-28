from flask import Blueprint, jsonify, request
from config.database import get_db_connection
from utils.jwt_utils import require_auth

assignments_bp = Blueprint('assignments', __name__)

@assignments_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_assignments(user_id):
    return jsonify({'message': 'Assignments endpoint - to be implemented', 'user_id': user_id})

@assignments_bp.route('/<int:id>', methods=['GET'])
@require_auth
def get_assignment(id):
    """Get assignment details by AssignmentID or Assessment_ID"""
    try:
        university_id = request.args.get('university_id', type=int)
        section_id = request.args.get('section_id', type=str)
        course_id = request.args.get('course_id', type=str)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First try to get by AssignmentID
        cursor.execute('EXEC GetAssignmentById %s', (id,))
        result = cursor.fetchone()
        
        if result:
            # Found by AssignmentID
            assignment = {
                'AssignmentID': result[0],
                'Course_ID': result[1],
                'Semester': result[2],
                'MaxScore': result[3],
                'accepted_specification': result[4],
                'submission_deadline': str(result[5]) if result[5] else None,
                'instructions': result[6],
                'TaskURL': result[7] if len(result) > 7 else None,
                'Course_Name': result[8] if len(result) > 8 else None,
                'StudentCount': result[9] if len(result) > 9 else 0,
            }
            conn.close()
            return jsonify(assignment)
        
        # If not found, try to get by Assessment_ID
        cursor.execute('EXEC GetAssignmentByAssessmentID %s, %s, %s, %s', (
            id,  # Assessment_ID
            university_id,
            section_id,
            course_id
        ))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            assignment = {
                'AssignmentID': result[0],
                'Course_ID': result[1],
                'Semester': result[2],
                'MaxScore': result[3],
                'accepted_specification': result[4],
                'submission_deadline': str(result[5]) if result[5] else None,
                'instructions': result[6],
                'TaskURL': result[7] if len(result) > 7 else None,
                'Course_Name': result[8] if len(result) > 8 else None,
                'StudentCount': result[9] if len(result) > 9 else 0,
            }
            return jsonify(assignment)
        
        return jsonify({'success': False, 'error': 'Assignment not found'}), 404
    except Exception as e:
        print(f'Get assignment error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get assignment: {str(e)}'}), 500

@assignments_bp.route('/<int:id>/submit', methods=['POST'])
def submit_assignment(id):
    return jsonify({'success': True, 'message': 'Assignment submitted', 'id': id})
