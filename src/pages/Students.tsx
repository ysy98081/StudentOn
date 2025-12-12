import { useState } from 'react';
import StudentList from '../components/StudentList';
import StudentDetail from '../components/StudentDetail';

export default function Students() {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 shrink-0">학생 관리</h2>

            <div className="flex-1 min-h-0 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col lg:flex-row">
                {/* List View */}
                <div className={`${selectedStudentId ? 'hidden lg:block lg:w-1/2 xl:w-5/12' : 'w-full'
                    } border-r border-gray-200 bg-white`}>
                    <div className="p-4 h-full">
                        <StudentList
                            selectedId={selectedStudentId}
                            onSelect={setSelectedStudentId}
                        />
                    </div>
                </div>

                {/* Detail View (Mobile: Replaces list, Desktop: Side-by-side) */}
                {selectedStudentId && (
                    <div className="flex-1 h-full bg-white animate-in slide-in-from-right-4 lg:animate-none">
                        <StudentDetail
                            studentId={selectedStudentId}
                            onClose={() => setSelectedStudentId(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
