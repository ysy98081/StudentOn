
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Phone, GraduationCap, MessageSquare, Send, X, Trash2, Pencil, Check, MapPin, Calendar, Heart, User, Camera } from 'lucide-react';
import PromotionModal from './PromotionModal';
import { compressImage } from '../utils/imageUtils';

interface StudentDetailProps {
    studentId: string;
    onClose: () => void;
}

export default function StudentDetail({ studentId, onClose }: StudentDetailProps) {
    const { students, teachers, addHistoryLog, deleteStudent, updateStudent } = useStore();
    const student = students.find(s => s.id === studentId);

    const [comment, setComment] = useState('');
    const [actingTeacherId, setActingTeacherId] = useState('');
    const [showPromotionModal, setShowPromotionModal] = useState(false);

    // Name Editing State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editBirthDate, setEditBirthDate] = useState('');
    const [editSalvationDate, setEditSalvationDate] = useState('');
    const [editAddress, setEditAddress] = useState('');

    const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && student) {
            try {
                const compressedImage = await compressImage(file);
                updateStudent(student.id, { profileImage: compressedImage });
            } catch (error) {
                console.error("Image compression failed:", error);
                alert("이미지 처리 중 오류가 발생했습니다.");
            } finally {
                e.target.value = '';
            }
        }
    };

    if (!student) return null;

    const teacher = teachers.find(t => t.id === student.currentTeacherId);

    // Filter to show only comments (NOTES)
    const sortedHistory = [...student.history]
        .filter(log => log.type === 'NOTE')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const actingTeacher = teachers.find(t => t.id === actingTeacherId);
    // Only the assigned homeroom teacher can comment
    const canComment = actingTeacher?.id === student.currentTeacherId;

    const handleDelete = () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            deleteStudent(student.id);
            onClose();
        }
    };

    const handleStartEdit = () => {
        setEditNameValue(student.name);
        setIsEditingName(true);
    };

    const handleSaveName = () => {
        if (!editNameValue.trim()) return;
        updateStudent(student.id, { name: editNameValue.trim() });
        setIsEditingName(false);
    };

    const handleStartProfileEdit = () => {
        setEditBirthDate(student.birthDate || '');
        setEditSalvationDate(student.salvationDate || '');
        setEditAddress(student.address || '');
        setIsEditingProfile(true);
    };

    const handleSaveProfile = () => {
        updateStudent(student.id, {
            birthDate: editBirthDate || undefined,
            salvationDate: editSalvationDate || undefined,
            address: editAddress || undefined,
        });
        setIsEditingProfile(false);
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !actingTeacherId || !canComment) return;

        addHistoryLog(student.id, {
            date: new Date().toISOString(),
            type: 'NOTE',
            fromTeacherId: actingTeacherId,
            toTeacherId: null,
            comment: comment
        });

        setComment('');
    };

    return (
        <div className="h-full bg-white border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <div className="relative group shrink-0">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                                {student.profileImage ? (
                                    <img key={student.profileImage} src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-black/30 rounded-full cursor-pointer transition-all">
                                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100" />
                                <input type="file" accept="image/*" onChange={handleImageUpdate} className="hidden" />
                            </label>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editNameValue}
                                            onChange={(e) => setEditNameValue(e.target.value)}
                                            className="text-xl font-bold text-gray-900 border-b-2 border-indigo-500 outline-none px-1 py-0.5 bg-transparent w-40"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveName();
                                                if (e.key === 'Escape') setIsEditingName(false);
                                            }}
                                        />
                                        <button
                                            onClick={handleSaveName}
                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => setIsEditingName(false)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 group">
                                        {student.name}
                                        <button
                                            onClick={handleStartEdit}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-opacity p-1"
                                            title="이름 수정"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </h2>
                                )}
                                <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                    {student.grade}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Phone size={14} />
                                    {student.parentPhone}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap size={14} />
                                    {teacher?.name || '미배정'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Student Info Grid */}
                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User size={18} />
                            학생 정보
                        </h3>
                        {!isEditingProfile ? (
                            <button
                                onClick={handleStartProfileEdit}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                <Pencil size={14} /> 수정
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveProfile}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                >
                                    <Check size={14} /> 저장
                                </button>
                                <button
                                    onClick={() => setIsEditingProfile(false)}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    <X size={14} /> 취소
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 block text-xs mb-1">생년월일</span>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {isEditingProfile ? (
                                    <input
                                        type="date"
                                        value={editBirthDate}
                                        onChange={(e) => setEditBirthDate(e.target.value)}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 ml-[-8px] text-sm w-full"
                                    />
                                ) : (
                                    student.birthDate || '-'
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 block text-xs mb-1">성별</span>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                {student.gender || '-'}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 block text-xs mb-1">구원일</span>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                <Heart size={14} className="text-gray-400" />
                                {isEditingProfile ? (
                                    <input
                                        type="date"
                                        value={editSalvationDate}
                                        onChange={(e) => setEditSalvationDate(e.target.value)}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 ml-[-8px] text-sm w-full"
                                    />
                                ) : (
                                    student.salvationDate || '-'
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 block text-xs mb-1">주소</span>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 ml-[-8px] text-sm w-full"
                                        placeholder="주소 입력"
                                    />
                                ) : (
                                    student.address || '-'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPromotionModal(true)}
                        className="flex-1 bg-indigo-50 text-indigo-700 py-2.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <GraduationCap size={18} />
                        등반/졸업 관리
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        title="학생 삭제"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Comment Section */}
                <section>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare size={18} />
                        선생님 코멘트
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                        <div className="mb-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                작성자 (선생님 선택)
                            </label>
                            <select
                                value={actingTeacherId}
                                onChange={(e) => setActingTeacherId(e.target.value)}
                                className="w-full text-sm p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="">선생님 선택...</option>
                                {teachers
                                    .filter(t => t.id === student.currentTeacherId)
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.assignedGrade || '담당 없음'})
                                        </option>
                                    ))}
                            </select>
                            {/* Warning message if no teacher is selected or selected teacher is not the homeroom teacher */}
                            {!student.currentTeacherId && (
                                <p className="text-xs text-red-500 mt-1">
                                    * 담임 선생님이 배정되지 않았습니다. 코멘트를 작성하려면 먼저 선생님을 배정해주세요.
                                </p>
                            )}
                            {student.currentTeacherId && actingTeacherId && !canComment && (
                                <p className="text-xs text-red-500 mt-1">
                                    * 담임 선생님만 코멘트를 작성할 수 있습니다.
                                </p>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="relative">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="학생에 대한 코멘트를 입력하세요..."
                                className="w-full p-3 pr-12 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-colors resize-none h-24"
                                disabled={!actingTeacherId || !canComment}
                            />
                            <button
                                type="submit"
                                disabled={!comment.trim() || !actingTeacherId || !canComment}
                                className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        {sortedHistory.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                코멘트가 없습니다.
                            </div>
                        ) : (
                            sortedHistory.map((log, idx) => {
                                const fromTeacher = teachers.find(t => t.id === log.fromTeacherId);
                                const isNote = log.type === 'NOTE';

                                return (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isNote ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {isNote ? <MessageSquare size={14} /> : <GraduationCap size={14} />}
                                            </div>
                                            {idx !== sortedHistory.length - 1 && (
                                                <div className="w-px h-full bg-gray-200 my-1 group-hover:bg-gray-300 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {fromTeacher ? fromTeacher.name : '시스템'}
                                                    <span className="text-gray-500 font-normal ml-1">
                                                        {isNote ? '남김:' : '처리함:'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-lg">
                                                {log.comment}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>

            {showPromotionModal && (
                <PromotionModal
                    student={student}
                    onClose={() => setShowPromotionModal(false)}
                />
            )}
        </div>
    );
}
