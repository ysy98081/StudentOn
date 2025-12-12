import { useStore } from '../store/useStore';
import { Users, GraduationCap } from 'lucide-react';

export default function Dashboard() {
    const { students, teachers } = useStore();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">대시보드</h2>
                <p className="text-gray-500">학생 관리 시스템 현황입니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">총 학생 수</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}명</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">총 선생님 수</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{teachers.length}명</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity Removed as per request */}
        </div>
    );
}
