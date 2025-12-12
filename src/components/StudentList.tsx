import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, User, Phone, GraduationCap } from 'lucide-react';
import { GRADES } from '../constants';
import { compressImage } from '../utils/imageUtils';

interface StudentListProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function StudentList({ selectedId, onSelect }: StudentListProps) {
    const { students, teachers, addStudent } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [grade, setGrade] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<'남' | '여'>('남');
    const [salvationDate, setSalvationDate] = useState('');
    const [address, setAddress] = useState('');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !parentPhone.trim() || !grade) return;

        addStudent({
            name,
            parentPhone,
            grade,
            currentTeacherId: teacherId || null,
            birthDate: birthDate || undefined,
            gender: gender || undefined,
            salvationDate: salvationDate || undefined,
            address: address || undefined,
            profileImage: profileImage || undefined,
        });

        setName('');
        setParentPhone('');
        setGrade('');
        setTeacherId('');
        setBirthDate('');
        setGender('남');
        setSalvationDate('');
        setAddress('');
        setProfileImage('');
        setIsAdding(false);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentPhone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between gap-4 shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="학생 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                    <Plus size={20} />
                    학생 추가
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">새 학생 등록</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex justify-center">
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
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="학생 이름"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">부모님 연락처</label>
                            <input
                                required
                                type="tel"
                                value={parentPhone}
                                onChange={(e) => setParentPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="010-0000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
                            <select
                                required
                                value={grade}
                                onChange={(e) => {
                                    setGrade(e.target.value);
                                    setTeacherId(''); // Reset teacher
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">학년 선택</option>
                                {GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">담당 선생님 (선택)</label>
                            <select
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">선생님 없음</option>
                                {teachers
                                    .filter(t => !grade || t.assignedGrade === grade)
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                            {t.assignedGrade ? ` (${t.assignedGrade}` : ''}
                                            {t.assignedClass ? ` ${t.assignedClass})` : t.assignedGrade ? ')' : ''}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as '남' | '여')}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="남">남</option>
                                <option value="여">여</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">구원일 (선택)</label>
                            <input
                                type="date"
                                value={salvationDate}
                                onChange={(e) => setSalvationDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="주소 입력"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">학생</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">학년</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">선생님</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">연락처</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => {
                            const teacher = teachers.find(t => t.id === student.currentTeacherId);
                            const isSelected = selectedId === student.id;

                            return (
                                <tr
                                    key={student.id}
                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => onSelect(student.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 overflow-hidden">
                                                {student.profileImage ? (
                                                    <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={16} />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {student.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {teacher ? (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <GraduationCap size={16} className="text-gray-400" />
                                                {teacher.name}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">미배정</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone size={16} className="text-gray-400" />
                                            {student.parentPhone}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    학생이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
