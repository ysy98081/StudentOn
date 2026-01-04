import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { exportToExcel, importFromExcel } from '../utils/excelUtils';

export default function DataManagement() {
    const { students, teachers, setAllData } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = () => {
        try {
            exportToExcel(students, teachers);
            setMessage({ type: 'success', text: '데이터가 성공적으로 다운로드되었습니다.' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '데이터 다운로드 중 오류가 발생했습니다.' });
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('기존 데이터가 모두 삭제되고 엑셀 파일의 데이터로 대체됩니다. 계속하시겠습니까?')) {
            e.target.value = ''; // Reset input
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { students: newStudents, teachers: newTeachers } = await importFromExcel(file);
            setAllData(newStudents, newTeachers);
            setMessage({ type: 'success', text: `학생 ${newStudents.length}명, 선생님 ${newTeachers.length}명의 데이터가 불러와졌습니다.` });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '데이터 불러오기 중 오류가 발생했습니다. 파일 형식을 확인해주세요.' });
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">데이터 관리</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Export Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                            <Download size={24} />
                            <h2 className="text-xl font-semibold">데이터 내보내기 (저장)</h2>
                        </div>
                        <p className="text-gray-600">
                            현재 등록된 학생 및 선생님 데이터를 엑셀 파일(.xlsx)로 다운로드합니다.
                            이 파일을 백업용으로 보관하거나 나중에 다시 불러올 수 있습니다.
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Download size={20} />
                            엑셀 파일로 저장하기
                        </button>
                    </div>

                    {/* Import Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-green-600 mb-2">
                            <Upload size={24} />
                            <h2 className="text-xl font-semibold">데이터 가져오기 (불러오기)</h2>
                        </div>
                        <p className="text-gray-600">
                            저장된 엑셀 파일을 업로드하여 데이터를 복구합니다.
                            <br />
                            <span className="text-red-500 font-medium">주의: 현재 데이터는 모두 삭제됩니다.</span>
                        </p>
                        <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload size={20} className="text-gray-500" />
                            <span className="text-gray-700">{isLoading ? '불러오는 중...' : '엑셀 파일 선택하기'}</span>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleImport}
                                className="hidden"
                                disabled={isLoading}
                            />
                        </label>
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <p>{message.text}</p>
                    </div>
                )}
            </div>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="text-orange-600 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-orange-900 mb-1">사용 가이드</h3>
                        <ul className="list-disc list-inside text-orange-800 space-y-1">
                            <li><strong>저장하기:</strong> 작업을 마치면 반드시 엑셀 파일로 저장해두세요. 브라우저 캐시가 삭제되면 데이터가 날아갈 수 있습니다.</li>
                            <li><strong>불러오기:</strong> 저장해둔 엑셀 파일을 선택하면 이전 작업 내용을 그대로 복구할 수 있습니다.</li>
                            <li>불러오기 시 학생의 '히스토리(메모, 진급 기록 등)'는 초기화될 수 있습니다. (현재 버전은 기본 정보만 복구됨)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
