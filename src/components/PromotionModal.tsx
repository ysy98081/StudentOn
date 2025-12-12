import { useState } from 'react';
import { useStore, type Student } from '../store/useStore';
import { X, ArrowRight } from 'lucide-react';
import { GRADES } from '../constants';

interface PromotionModalProps {
    student: Student;
    onClose: () => void;
}

export default function PromotionModal({ student, onClose }: PromotionModalProps) {
    const { teachers, updateStudent, addHistoryLog } = useStore();
    const [newGrade, setNewGrade] = useState(student.grade);
    const [newTeacherId, setNewTeacherId] = useState(student.currentTeacherId || '');
    const [comment, setComment] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const currentTeacher = teachers.find(t => t.id === student.currentTeacherId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            alert('변경 사유를 입력해주세요.');
            return;
        }

        const isPromotion = newGrade !== student.grade;
        const isTeacherChange = newTeacherId !== student.currentTeacherId;

        if (!isPromotion && !isTeacherChange) {
            onClose();
            return;
        }

        addHistoryLog(student.id, {
            date: new Date().toISOString(),
            type: isPromotion ? 'PROMOTION' : 'TEACHER_CHANGE',
            fromTeacherId: student.currentTeacherId,
            toTeacherId: newTeacherId || null,
            comment: comment,
        });

        updateStudent(student.id, {
            grade: newGrade,
            currentTeacherId: newTeacherId || null,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">학생 관리: {student.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setShowHistory(false)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${!showHistory ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            상태 변경
                        </button>
                        <button
                            onClick={() => setShowHistory(true)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${showHistory ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            히스토리 로그
                        </button>
                    </div>

                    {!showHistory ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 border-b pb-2">현재 상태</h4>
                                    <div>
                                        <label className="block text-sm text-gray-500">학년</label>
                                        <p className="font-medium text-lg">{student.grade}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-500">담당 선생님</label>
                                        <p className="font-medium text-lg">{currentTeacher?.name || '미배정'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-indigo-600 border-b pb-2 border-indigo-100">변경할 상태</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">새 학년</label>
                                        <select
                                            value={newGrade}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setNewGrade(val);
                                                if (val === '졸업') {
                                                    setNewTeacherId(''); // Clear teacher for graduates
                                                } else {
                                                    setNewTeacherId(''); // Reset teacher for other grade changes too
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {GRADES.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                            <option value="졸업">졸업</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">새 선생님</label>
                                        <select
                                            value={newTeacherId}
                                            onChange={(e) => setNewTeacherId(e.target.value)}
                                            disabled={newGrade === '졸업'}
                                            className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${newGrade === '졸업' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{newGrade === '졸업' ? '졸업생은 선생님 배정 없음' : '선생님 없음'}</option>
                                            {newGrade !== '졸업' && teachers
                                                .filter(t => !newGrade || t.assignedGrade === newGrade)
                                                .map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name}
                                                        {t.assignedGrade ? ` (${t.assignedGrade}` : ''}
                                                        {t.assignedClass ? ` ${t.assignedClass})` : t.assignedGrade ? ')' : ''}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    변경 사유 (필수)
                                </label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                    placeholder="학년 진급, 담당 선생님 변경 사유 등을 입력하세요..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    변경사항 저장
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {student.history.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">히스토리 내역이 없습니다.</p>
                            ) : (
                                student.history.map((log, index) => {
                                    const fromTeacher = teachers.find(t => t.id === log.fromTeacherId);
                                    const toTeacher = teachers.find(t => t.id === log.toTeacherId);

                                    return (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${log.type === 'PROMOTION' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {log.type === 'PROMOTION' ? '진급' : '담당 변경'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                <span>{fromTeacher?.name || '미배정'}</span>
                                                <ArrowRight size={14} />
                                                <span className="font-medium text-gray-900">{toTeacher?.name || '미배정'}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                                {log.comment}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
