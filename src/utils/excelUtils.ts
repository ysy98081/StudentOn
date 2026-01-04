import * as XLSX from 'xlsx';
import type { Student, Teacher } from '../store/useStore';

export const exportToExcel = (students: Student[], teachers: Teacher[]) => {
  const wb = XLSX.utils.book_new();

  // Helper to find teacher name
  const getTeacherName = (id: string | null) => {
    if (!id) return '';
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.name : '';
  };

  // Helper to find teacher class
  const getTeacherClass = (id: string | null) => {
    if (!id) return '';
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.assignedClass || '' : '';
  };

  // Students Sheet
  const studentsData = students.map(s => ({
    '이름': s.name,
    '학년': s.grade,
    '반': getTeacherClass(s.currentTeacherId),
    '학부모 연락처': s.parentPhone,
    '부모님 성함': s.parentName || '',
    '담임선생님': getTeacherName(s.currentTeacherId),
    '생년월일': s.birthDate || '',
    '성별': s.gender || '',
    '주소': s.address || '',
    '구원일': s.salvationDate || ''
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentsData);
  XLSX.utils.book_append_sheet(wb, wsStudents, "학생");

  // Teachers Sheet
  const teachersData = teachers.map(t => ({
    '이름': t.name,
    '담당 학년': t.assignedGrade || '',
    '담당 반': t.assignedClass || '',
    '연락처': t.phoneNumber || ''
  }));
  const wsTeachers = XLSX.utils.json_to_sheet(teachersData);
  XLSX.utils.book_append_sheet(wb, wsTeachers, "교사");

  // Download
  XLSX.writeFile(wb, "StudentOn_Data.xlsx");
};

export const importFromExcel = async (file: File): Promise<{ students: Student[], teachers: Teacher[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // 1. Process Teachers (First, to generate IDs)
        const teacherSheet = workbook.Sheets["교사"] || workbook.Sheets["Teachers"];
        const teachersRaw = teacherSheet ? XLSX.utils.sheet_to_json(teacherSheet) : [];

        // Generate IDs for teachers immediately and create a lookup map
        const teacherMap = new Map<string, string>(); // Name -> ID
        const teachers: Teacher[] = teachersRaw
          .filter((row: any) => row && (row['이름'] || row.name))
          .map((row: any) => {
            const id = crypto.randomUUID();
            const name = String(row['이름'] || row.name || "").trim();
            if (name) teacherMap.set(name, id);

            return {
              id,
              name,
              assignedGrade: row['담당 학년'] ? String(row['담당 학년']) : (row.assignedGrade ? String(row.assignedGrade) : undefined),
              assignedClass: row['담당 반'] ? String(row['담당 반']) : (row.assignedClass ? String(row.assignedClass) : undefined),
              phoneNumber: row['연락처'] ? String(row['연락처']) : (row.phoneNumber ? String(row.phoneNumber) : undefined),
              profileImage: undefined
            };
          });

        // 2. Process Students (Link to Teacher IDs)
        const studentSheet = workbook.Sheets["학생"] || workbook.Sheets["Students"];
        const studentsRaw = studentSheet ? XLSX.utils.sheet_to_json(studentSheet) : [];

        const students: Student[] = studentsRaw
          .filter((row: any) => row && (row['이름'] || row.name))
          .map((row: any) => {
            const teacherName = String(row['담임선생님'] || "").trim();
            let teacherId = null;

            if (teacherName) {
              if (teacherMap.has(teacherName)) {
                teacherId = teacherMap.get(teacherName) || null;
              } else {
                // Auto-create missing teacher
                const newTeacherId = crypto.randomUUID();
                teacherMap.set(teacherName, newTeacherId);
                teacherId = newTeacherId;

                // Infer teacher's grade and class from the student data
                const grade = row['학년'] ? String(row['학년']) : (row.grade ? String(row.grade) : undefined);
                const assignedClass = row['반'] ? String(row['반']) : (row.class ? String(row.class) : undefined);

                teachers.push({
                  id: newTeacherId,
                  name: teacherName,
                  assignedGrade: grade,
                  assignedClass: assignedClass,
                  phoneNumber: undefined,
                  profileImage: undefined
                });
              }
            }

            return {
              id: crypto.randomUUID(),
              name: String(row['이름'] || row.name || "").trim(),
              grade: row['학년'] ? String(row['학년']) : (row.grade ? String(row.grade) : ""),
              parentPhone: row['학부모 연락처'] ? String(row['학부모 연락처']) : (row.parentPhone ? String(row.parentPhone) : ""),
              parentName: row['부모님 성함'] ? String(row['부모님 성함']) : (row.parentName ? String(row.parentName) : ""),
              currentTeacherId: teacherId,
              birthDate: row['생년월일'] ? String(row['생년월일']) : (row.birthDate ? String(row.birthDate) : undefined),
              gender: (row['성별'] || row.gender) as '남' | '여' | undefined,
              address: row['주소'] ? String(row['주소']) : (row.address ? String(row.address) : undefined),
              salvationDate: row['구원일'] ? String(row['구원일']) : (row.salvationDate ? String(row.salvationDate) : undefined),
              profileImage: undefined,
              history: []
            };
          });

        resolve({ students, teachers });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
