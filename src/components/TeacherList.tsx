import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, User, Phone, Pencil, X, Check } from 'lucide-react';
import { GRADES } from '../constants';
import { compressImage } from '../utils/imageUtils';

export default function TeacherList() {
    const { teachers, addTeacher, deleteTeacher, updateTeacher } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState('');

    // Add Form State
    const [newTeacherName, setNewTeacherName] = useState('');
    const [newTeacherPhone, setNewTeacherPhone] = useState('');
    const [assignedGrade, setAssignedGrade] = useState('');
    const [assignedClass, setAssignedClass] = useState('');
    const [profileImage, setProfileImage] = useState('');

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedImage = await compressImage(file);
                setProfileImage(compressedImage);
            } catch (error) {
                console.error("Image compression failed:", error);
                alert("이미지 처리 중 오류가 발생했습니다.");
            }
        }
    };

    // Edit State
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editGrade, setEditGrade] = useState('');
    const [editClass, setEditClass] = useState('');
    const [editProfileImage, setEditProfileImage] = useState('');
    const [isImageProcessing, setIsImageProcessing] = useState(false);

    const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setIsImageProcessing(true);
                const compressedImage = await compressImage(file);
                setEditProfileImage(compressedImage);
            } catch (error) {
                console.error("Image compression failed:", error);
                alert("이미지 처리 중 오류가 발생했습니다.");
            } finally {
                setIsImageProcessing(false);
                // Reset input
                e.target.value = '';
            }
        }
    };

    // Department Filter
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const departments = [
        { id: 'kinder', label: '유치부', prefix: '유치부' },
        { id: 'elementary', label: '초등부', prefix: '초등' },
        { id: 'middle_high', label: '중고등부', prefixes: ['중등', '고등'] },
    ];

    const filteredTeachers = teachers.filter(t => {
        // Grade Filter
        if (selectedGrade && t.assignedGrade !== selectedGrade) return false;

        // Department Filter
        if (selectedDepartment) {
            const grade = t.assignedGrade || '';
            if (selectedDepartment === 'kinder') return grade.startsWith('유치부');
            if (selectedDepartment === 'elementary') return grade.startsWith('초등');
            if (selectedDepartment === 'middle_high') return grade.startsWith('중등') || grade.startsWith('고등');
        }

        return true;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeacherName.trim()) return;

        addTeacher({
            name: newTeacherName,
            phoneNumber: newTeacherPhone,
            assignedGrade: assignedGrade || undefined,
            assignedClass: assignedClass || undefined,
            profileImage: profileImage || undefined,
        });

        setNewTeacherName('');
        setNewTeacherPhone('');
        setAssignedGrade('');
        setAssignedClass('');
        setProfileImage('');
        setIsAdding(false);
    };

    const startEditing = (teacher: typeof teachers[0]) => {
        setEditingTeacherId(teacher.id);
        setEditName(teacher.name);
        setEditPhone(teacher.phoneNumber || '');
        setEditGrade(teacher.assignedGrade || '');
        setEditClass(teacher.assignedClass || '');
        setEditProfileImage(teacher.profileImage || '');
    };

    const saveEdit = () => {
        if (!editingTeacherId || !editName.trim()) return;

        updateTeacher(editingTeacherId, {
            name: editName,
            phoneNumber: editPhone,
            assignedGrade: editGrade || undefined,
            assignedClass: editClass || undefined,
            profileImage: editProfileImage || undefined,
        });

        setEditingTeacherId(null);
    };

    const cancelEdit = () => {
        setEditingTeacherId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">선생님 목록</h3>
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                        <option value="">전체 부서</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.label}</option>
                        ))}
                    </select>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                        <option value="">전체 학년</option>
                        {GRADES
                            .filter(g => {
                                if (!selectedDepartment) return true;
                                if (selectedDepartment === 'kinder') return g.startsWith('유치부');
                                if (selectedDepartment === 'elementary') return g.startsWith('초등');
                                if (selectedDepartment === 'middle_high') return g.startsWith('중등') || g.startsWith('고등');
                                return true;
                            })
                            .map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                    </select>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        선생님 추가
                    </button>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Plus size={16} className="text-indigo-600" />
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                            <input
                                type="text"
                                value={newTeacherName}
                                onChange={(e) => setNewTeacherName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="선생님 이름"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                            <input
                                type="text"
                                value={newTeacherPhone}
                                onChange={(e) => setNewTeacherPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">담당 학년 (선택)</label>
                                <select
                                    value={assignedGrade}
                                    onChange={(e) => setAssignedGrade(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">담당 없음</option>
                                    {GRADES.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">담당 반 (선택)</label>
                                <select
                                    value={assignedClass}
                                    onChange={(e) => setAssignedClass(e.target.value)}
                                    disabled={!assignedGrade}
                                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white ${!assignedGrade ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">반 선택</option>
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={`${i + 1}반`}>{i + 1}반</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            저장
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((teacher) => (
                    <div key={teacher.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 group relative">
                        {editingTeacherId === teacher.id ? (
                            <div className="space-y-3">
                                <div className="flex justify-center mb-2">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {editProfileImage ? (
                                                <img src={editProfileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={30} className="text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <Pencil size={12} className="text-indigo-600" />
                                            <input type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    placeholder="이름"
                                />
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    placeholder="전화번호"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={editGrade}
                                        onChange={(e) => {
                                            setEditGrade(e.target.value);
                                            setEditClass(''); // Reset class when grade changes
                                        }}
                                        className="flex-1 p-2 border border-gray-200 rounded text-sm bg-white"
                                    >
                                        <option value="">담당 없음</option>
                                        {GRADES.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={editClass}
                                        onChange={(e) => setEditClass(e.target.value)}
                                        disabled={!editGrade}
                                        className={`flex-1 p-2 border border-gray-200 rounded text-sm bg-white ${!editGrade ? 'bg-gray-50 text-gray-400' : ''}`}
                                    >
                                        <option value="">반 선택</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={`${i + 1}반`}>{i + 1}반</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={saveEdit}
                                        disabled={isImageProcessing}
                                        className={`p-1.5 rounded ${isImageProcessing ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button onClick={cancelEdit} className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="min-w-10 min-h-10 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center overflow-hidden">
                                            {teacher.profileImage ? (
                                                <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{teacher.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {teacher.assignedGrade || '담당 학년 없음'}
                                                {teacher.assignedClass && ` ${teacher.assignedClass}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(teacher)}
                                            className="p-1 text-gray-400 hover:text-indigo-600"
                                            title="수정"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('정말 삭제하시겠습니까?')) {
                                                    deleteTeacher(teacher.id);
                                                }
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {teacher.phoneNumber && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 pl-[52px]">
                                        <Phone size={14} />
                                        {teacher.phoneNumber}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {teachers.length === 0 && !isAdding && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        <p>등록된 선생님이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
