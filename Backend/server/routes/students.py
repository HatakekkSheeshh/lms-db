from flask import Blueprint, jsonify, request
from config.database import get_db_connection
from utils.jwt_utils import require_auth, require_role

students_bp = Blueprint('students', __name__)

@students_bp.route('/course/<string:course_id>', methods=['GET'])
def get_students_by_course(course_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT u.*, s.GPA, s.Year as Student_Year
            FROM [Student] s
            INNER JOIN [Users] u ON s.University_ID = u.University_ID
            INNER JOIN [Enrollment] e ON s.University_ID = e.University_ID
            INNER JOIN [Section] sec ON e.Section_ID = sec.Section_ID
            WHERE sec.Course_ID = ?
        """, course_id)

        students = cursor.fetchall()
        conn.close()

        result = []
        for student in students:
            result.append({
                'University_ID': student.University_ID,
                'First_Name': student.First_Name,
                'Last_Name': student.Last_Name,
                'Email': student.Email,
                'GPA': float(student.GPA) if student.GPA else None,
                'Year': student.Student_Year,
            })

        return jsonify(result)
    except Exception as e:
        print(f'Get students by course error: {e}')
        return jsonify({'success': False, 'error': 'Failed to fetch students'}), 500

# ==================== STUDENT DASHBOARD ====================

@students_bp.route('/dashboard/statistics', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_dashboard_statistics():
    """Get student dashboard statistics"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentDashboardStatistics %s', (university_id,))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({
                'total_courses': 0,
                'total_assignments': 0,
                'total_quizzes': 0,
                'completed_assignments': 0,
                'completed_quizzes': 0,
                'average_grade': 0.0,
                'total_study_hours': 0,
                'progress_percentage': 0.0,
                'leaderboard_rank': 0
            })
        
        return jsonify({
            'total_courses': int(result[0]) if result[0] else 0,
            'total_assignments': int(result[1]) if result[1] else 0,
            'total_quizzes': int(result[2]) if result[2] else 0,
            'completed_assignments': int(result[3]) if result[3] else 0,
            'completed_quizzes': int(result[4]) if result[4] else 0,
            'average_grade': float(result[5]) if result[5] else 0.0,
            'total_study_hours': int(result[6]) if result[6] else 0,
            'progress_percentage': float(result[7]) if result[7] else 0.0,
            'leaderboard_rank': int(result[8]) if result[8] else 0
        })
    except Exception as e:
        print(f'Get student dashboard statistics error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get statistics: {str(e)}'}), 500

@students_bp.route('/dashboard/upcoming-tasks', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_upcoming_tasks():
    """Get student upcoming tasks (assignments and quizzes)"""
    try:
        university_id = request.args.get('university_id', type=int)
        days_ahead = request.args.get('days_ahead', default=7, type=int)
        
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentUpcomingTasks %s, %s', (university_id, days_ahead))
        results = cursor.fetchall()
        conn.close()
        
        tasks = []
        for row in results:
            tasks.append({
                'task_type': row[0],
                'task_id': row[1],
                'task_title': row[2],
                'deadline': str(row[3]) if row[3] else None,
                'course_name': row[4],
                'course_id': row[5],
                'semester': row[6],
                'is_completed': bool(row[7]),
                'current_status': row[8]
            })
        
        return jsonify(tasks)
    except Exception as e:
        print(f'Get student upcoming tasks error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get upcoming tasks: {str(e)}'}), 500

@students_bp.route('/dashboard/leaderboard', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_leaderboard():
    """Get student leaderboard"""
    try:
        top_n = request.args.get('top_n', default=10, type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentLeaderboard %s', (top_n,))
        results = cursor.fetchall()
        conn.close()
        
        leaderboard = []
        for row in results:
            leaderboard.append({
                'rank': int(row[0]),
                'first_name': row[1],
                'last_name': row[2],
                'course': int(row[3]) if row[3] else 0,
                'hour': int(row[4]) if row[4] else 0,
                'point': float(row[5]) if row[5] else 0.0,
                'trend': row[6]
            })
        
        return jsonify(leaderboard)
    except Exception as e:
        print(f'Get student leaderboard error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get leaderboard: {str(e)}'}), 500

@students_bp.route('/dashboard/activity-chart', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_activity_chart():
    """Get student activity chart data"""
    try:
        university_id = request.args.get('university_id', type=int)
        months_back = request.args.get('months_back', default=5, type=int)
        
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentActivityChart %s, %s', (university_id, months_back))
        results = cursor.fetchall()
        conn.close()
        
        chart_data = []
        for row in results:
            chart_data.append({
                'month': row[0],
                'Study': int(row[1]) if row[1] else 0,
                'Exams': int(row[2]) if row[2] else 0
            })
        
        return jsonify(chart_data)
    except Exception as e:
        print(f'Get student activity chart error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get activity chart: {str(e)}'}), 500

@students_bp.route('/dashboard/grade-components', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_grade_components():
    """Get student grade components by course"""
    try:
        university_id = request.args.get('university_id', type=int)
        
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentGradeComponents %s', (university_id,))
        results = cursor.fetchall()
        conn.close()
        
        grade_components = []
        for row in results:
            grade_components.append({
                'course_name': row[0],
                'course_id': row[1],
                'semester': row[2],
                'final_grade': float(row[3]) if row[3] else 0.0,
                'midterm_grade': float(row[4]) if row[4] else 0.0,
                'quiz_grade': float(row[5]) if row[5] else 0.0,
                'assignment_grade': float(row[6]) if row[6] else 0.0
            })
        
        return jsonify(grade_components)
    except Exception as e:
        print(f'Get student grade components error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Failed to get grade components: {str(e)}'}), 500

@students_bp.route('/dashboard/courses', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_courses():
    """Get courses that the student is enrolled in"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'University ID is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('EXEC GetStudentCourses %s', (university_id,))
        results = cursor.fetchall()
        conn.close()
        
        courses = []
        for row in results:
            courses.append({
                'Course_ID': row[0],
                'Name': row[1],
                'Credit': int(row[2]) if row[2] else None,
            })
        
        return jsonify(courses)
    except Exception as e:
        print(f'Get student courses error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/courses/with-sections', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_courses_with_sections():
    """Get courses with sections that the student is enrolled in"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentCoursesWithSections %s', (university_id,))
        results = cursor.fetchall()
        conn.close()
        
        # Group by course
        courses_dict = {}
        for row in results:
            course_id = row[0]
            if course_id not in courses_dict:
                courses_dict[course_id] = {
                    'Course_ID': row[0],
                    'Name': row[1],
                    'Credit': int(row[2]) if row[2] else None,
                    'CCategory': row[3],
                    'Sections': []
                }
            courses_dict[course_id]['Sections'].append({
                'Section_ID': row[4],
                'Semester': row[5]
            })
        
        courses = list(courses_dict.values())
        return jsonify(courses)
    except Exception as e:
        print(f'Get student courses with sections error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/section/<string:section_id>/<string:course_id>/detail', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_section_detail(section_id, course_id):
    """Get section detail for a student"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentSectionDetail %s, %s, %s', (university_id, section_id, course_id))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'success': False, 'error': 'Section not found or student not enrolled'}), 404
        
        return jsonify({
            'Section_ID': result[0],
            'Course_ID': result[1],
            'Semester': result[2],
            'Course_Name': result[3],
            'Credit': int(result[4]) if result[4] else None,
            'CCategory': result[5]
        })
    except Exception as e:
        print(f'Get student section detail error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== STUDENT COURSE DETAIL ====================

@students_bp.route('/course/<string:course_id>/detail', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_course_detail(course_id):
    """Get course detail information for a student"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentCourseDetail %s, %s', (university_id, course_id))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'success': False, 'error': 'Course not found or student not enrolled'}), 404
        
        return jsonify({
            'Course_ID': result[0],
            'Name': result[1],
            'Credit': int(result[2]) if result[2] else None,
            'CCategory': result[3]
        })
    except Exception as e:
        print(f'Get student course detail error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/course/<string:course_id>/sections', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_course_sections(course_id):
    """Get sections of a course that the student is enrolled in"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentCourseSections %s, %s', (university_id, course_id))
        results = cursor.fetchall()
        conn.close()
        
        sections = []
        for row in results:
            sections.append({
                'Section_ID': row[0],
                'Course_ID': row[1],
                'Semester': row[2]
            })
        
        return jsonify(sections)
    except Exception as e:
        print(f'Get student course sections error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/course/<string:course_id>/quizzes', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_course_quizzes(course_id):
    """Get quizzes for a course that the student can see"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentCourseQuizzes %s, %s', (university_id, course_id))
        results = cursor.fetchall()
        conn.close()
        
        quizzes = []
        for row in results:
            quizzes.append({
                'QuizID': int(row[0]) if row[0] else None,
                'Section_ID': row[1],
                'Course_ID': row[2],
                'Semester': row[3],
                'Assessment_ID': row[4],
                'Grading_method': row[5],
                'pass_score': float(row[6]) if row[6] else None,
                'Time_limits': str(row[7]) if row[7] else None,
                'Start_Date': str(row[8]) if row[8] else None,
                'End_Date': str(row[9]) if row[9] else None,
                'content': row[10],
                'types': row[11],
                'Weight': float(row[12]) if row[12] else None,
                'Correct_answer': row[13],
                'Questions': row[14],
                'Responses': row[15],
                'completion_status': row[16] if row[16] else 'Not Taken',
                'score': float(row[17]) if row[17] else None,
                'status_display': row[18]
            })
        
        return jsonify(quizzes)
    except Exception as e:
        print(f'Get student course quizzes error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/course/<string:course_id>/grades', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_course_grades(course_id):
    """Get assessment grades for a student in a specific course"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentCourseGrades %s, %s', (university_id, course_id))
        results = cursor.fetchall()
        conn.close()
        
        grades = []
        for row in results:
            grades.append({
                'Assessment_ID': row[0],
                'Section_ID': row[1],
                'Course_ID': row[2],
                'Semester': row[3],
                'Quiz_Grade': float(row[4]) if row[4] else None,
                'Assignment_Grade': float(row[5]) if row[5] else None,
                'Midterm_Grade': float(row[6]) if row[6] else None,
                'Final_Grade': float(row[7]) if row[7] else None,
                'Status': row[8]
            })
        
        return jsonify(grades)
    except Exception as e:
        print(f'Get student course grades error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/course/<string:course_id>/students', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_course_students(course_id):
    """Get list of students enrolled in the same course"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentCourseStudents %s', (course_id,))
        results = cursor.fetchall()
        conn.close()
        
        students = []
        for row in results:
            students.append({
                'University_ID': int(row[0]) if row[0] else None,
                'First_Name': row[1],
                'Last_Name': row[2],
                'Email': row[3],
                'Major': row[4],
                'Current_degree': row[5]
            })
        
        return jsonify(students)
    except Exception as e:
        print(f'Get student course students error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== STUDENT SECTION DETAIL ====================

@students_bp.route('/section/<string:section_id>/<string:course_id>/<string:semester>/quizzes', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_section_quizzes(section_id, course_id, semester):
    """Get quizzes for a specific section that the student can see"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentSectionQuizzes %s, %s, %s, %s', (university_id, section_id, course_id, semester))
        results = cursor.fetchall()
        conn.close()
        
        quizzes = []
        for row in results:
            quizzes.append({
                'QuizID': int(row[0]) if row[0] else None,
                'Section_ID': row[1],
                'Course_ID': row[2],
                'Semester': row[3],
                'Assessment_ID': row[4],
                'Grading_method': row[5],
                'pass_score': float(row[6]) if row[6] else None,
                'Time_limits': str(row[7]) if row[7] else None,
                'Start_Date': str(row[8]) if row[8] else None,
                'End_Date': str(row[9]) if row[9] else None,
                'content': row[10],
                'types': row[11],
                'Weight': float(row[12]) if row[12] else None,
                'Correct_answer': row[13],
                'Questions': row[14],
                'Responses': row[15],
                'completion_status': row[16] if row[16] else 'Not Taken',
                'score': float(row[17]) if row[17] else None,
                'status_display': row[18]
            })
        
        return jsonify(quizzes)
    except Exception as e:
        print(f'Get student section quizzes error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/section/<string:section_id>/<string:course_id>/<string:semester>/assignments', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_section_assignments(section_id, course_id, semester):
    """Get assignments for a specific section that the student can see"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentSectionAssignments %s, %s, %s, %s', (university_id, section_id, course_id, semester))
        results = cursor.fetchall()
        conn.close()
        
        assignments = []
        for row in results:
            # Procedure returns: AssignmentID, Course_ID, Semester, instructions, accepted_specification, 
            # submission_deadline, TaskURL, MaxScore, Assessment_ID, score, status, SubmitDate, 
            # late_flag_indicator, attached_files, Comments, status_display
            assignments.append({
                'AssignmentID': int(row[0]) if row[0] else None,
                'Course_ID': row[1],
                'Semester': row[2],
                'instructions': row[3],
                'accepted_specification': row[4],
                'submission_deadline': str(row[5]) if row[5] else None,
                'TaskURL': row[6] if len(row) > 6 else None,  # TaskURL
                'MaxScore': int(row[7]) if len(row) > 7 and row[7] else None,  # MaxScore
                'Assessment_ID': row[8] if len(row) > 8 else None,
                'score': float(row[9]) if len(row) > 9 and row[9] else None,
                'status': row[10] if len(row) > 10 else None,
                'SubmitDate': str(row[11]) if len(row) > 11 and row[11] else None,
                'late_flag_indicator': bool(row[12]) if len(row) > 12 and row[12] is not None else None,
                'attached_files': row[13] if len(row) > 13 else None,
                'Comments': row[14] if len(row) > 14 else None,
                'status_display': row[15] if len(row) > 15 else None
            })
        
        return jsonify(assignments)
    except Exception as e:
        print(f'Get student section assignments error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/section/<string:section_id>/<string:course_id>/<string:semester>/grades', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_section_grades(section_id, course_id, semester):
    """Get assessment grades for a student in a specific section"""
    try:
        university_id = request.args.get('university_id', type=int)
        if not university_id:
            return jsonify({'success': False, 'error': 'university_id is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentSectionGrades %s, %s, %s, %s', (university_id, section_id, course_id, semester))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({
                'Assessment_ID': None,
                'Section_ID': section_id,
                'Course_ID': course_id,
                'Semester': semester,
                'Quiz_Grade': None,
                'Assignment_Grade': None,
                'Midterm_Grade': None,
                'Final_Grade': None,
                'Status': None
            })
        
        return jsonify({
            'Assessment_ID': result[0],
            'Section_ID': result[1],
            'Course_ID': result[2],
            'Semester': result[3],
            'Quiz_Grade': float(result[4]) if result[4] else None,
            'Assignment_Grade': float(result[5]) if result[5] else None,
            'Midterm_Grade': float(result[6]) if result[6] else None,
            'Final_Grade': float(result[7]) if result[7] else None,
            'Status': result[8]
        })
    except Exception as e:
        print(f'Get student section grades error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@students_bp.route('/section/<string:section_id>/<string:course_id>/<string:semester>/students', methods=['GET'])
@require_auth
@require_role(['student'])
def get_student_section_students(section_id, course_id, semester):
    """Get list of students enrolled in the same section"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('EXEC GetStudentSectionStudents %s, %s, %s', (section_id, course_id, semester))
        results = cursor.fetchall()
        conn.close()
        
        students = []
        for row in results:
            students.append({
                'University_ID': int(row[0]) if row[0] else None,
                'First_Name': row[1],
                'Last_Name': row[2],
                'Email': row[3],
                'Major': row[4],
                'Current_degree': row[5]
            })
        
        return jsonify(students)
    except Exception as e:
        print(f'Get student section students error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
