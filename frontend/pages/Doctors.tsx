import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService, departmentService } from '../services/hospitalService';
import { Doctor, Department, Gender, PageResponse } from '../types';
import { getImageUrl, getGenderText } from '../utils/helpers';
import CustomButton from '../components/ui/CustomButton';
import { APP_ROUTES } from '../constants/config';

const PAGE_SIZE = 9;

const Doctors: React.FC = () => {
  const navigate = useNavigate();

  // Dữ liệu
  const [pageData, setPageData] = useState<PageResponse<Doctor> | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters (được ánh xạ từ UI → params gửi lên backend)
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  // Phân trang (zero-based theo backend)
  const [currentPage, setCurrentPage] = useState(0);

  // Detail modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // ─── Lấy danh sách phòng khoa (một lần) ────────────────────────────────
  useEffect(() => {
    departmentService.getAll()
      .then(res => setDepartments(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Error loading departments', err));
  }, []);

  // ─── Gọi GET /api/doctors/search khi filter hoặc trang thay đổi ─────────
  const fetchDoctors = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await doctorService.search({
        name: search || undefined,
        gender: selectedGender || undefined,
        departmentId: selectedDept ? Number(selectedDept) : undefined,
        page,
        size: PAGE_SIZE,
      });
      setPageData(res.data);
    } catch (err) {
      console.error('Error searching doctors', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedGender, selectedDept]);

  // Debounce: chờ 400ms sau khi user ngừng gõ rồi mới gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);       // Reset về trang 1 khi filter thay đổi
      fetchDoctors(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedGender, selectedDept]); // fetchDoctors KHÔNG vào dep để tránh vòng lặp

  // Gọi lại khi user chuyển trang (currentPage đã được set đúng)
  useEffect(() => {
    fetchDoctors(currentPage);
  }, [currentPage]); // eslint-disable-line

  // Helper ghép departmentName vào Doctor
  const getDeptName = (deptId?: number) =>
    departments.find(d => d.id === deptId)?.name ?? 'Chưa xác định';

  const doctors = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedGender('');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight text-gray-800">Đội ngũ bác sĩ chuyên khoa</h1>
        <p className="text-gray-500">
          Tìm thấy <strong className="text-blue-600">{totalElements}</strong> bác sĩ
          {totalPages > 0 && ` — trang ${currentPage + 1} / ${totalPages}`}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Tìm kiếm bác sĩ</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Tên bác sĩ</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập tên bác sĩ..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phòng khoa</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Giới tính</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value={Gender.MALE}>Nam</option>
                  <option value={Gender.FEMALE}>Nữ</option>
                  <option value={Gender.OTHER}>Khác</option>
                </select>
              </div>

              {(search || selectedDept || selectedGender) && (
                <button
                  onClick={handleClearFilters}
                  className="w-full py-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-3xl h-96" />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-50 group-hover:border-blue-200 transition-colors shadow-md">
                    <img
                      src={getImageUrl(doc.pictureUrl, doc.gender, null)}
                      alt={doc.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = getImageUrl(null, doc.gender); }}
                    />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 text-gray-800 group-hover:text-[#0093E9] transition-colors line-clamp-1 w-full">{doc.fullName}</h3>
                  <p className="text-[#0093E9] text-sm font-semibold mb-3 line-clamp-1">{getDeptName(doc.departmentId)}</p>
                  <p className="text-gray-500 text-xs mb-4 italic line-clamp-1">{doc.specialization}</p>

                  <div className="flex gap-4 text-xs text-gray-500 mb-6 w-full justify-center border-t border-b border-gray-50 py-3">
                    <span className="flex items-center"><i className="fas fa-venus-mars mr-1.5 text-blue-400" /> {getGenderText(doc.gender)}</span>
                    <span className="flex items-center"><i className="fas fa-award mr-1.5 text-yellow-500" /> {doc.experienceYear} năm KN</span>
                  </div>

                  <div className="flex items-center gap-1 mb-4 text-sm">
                    <i className="fas fa-star text-yellow-400" />
                    <span className="font-bold text-gray-700">{doc.avgRating?.toFixed(1) ?? '0.0'}</span>
                    <span className="text-gray-400 text-xs">({doc.totalReviews ?? 0} đánh giá)</span>
                  </div>

                  <div className="flex gap-2 w-full mt-auto">
                    <CustomButton
                      className="flex-1 py-2.5 text-sm font-semibold shadow-md shadow-blue-100"
                      onClick={() => navigate(`${APP_ROUTES.BOOKING}?doctorId=${doc.id}&deptId=${doc.departmentId}`)}
                    >
                      Đặt lịch
                    </CustomButton>
                    <CustomButton
                      variant="outline"
                      className="flex-1 py-2.5 text-sm font-semibold"
                      onClick={() => setSelectedDoctor(doc)}
                    >
                      Chi tiết
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-3xl text-center text-gray-500 border border-dashed border-gray-300">
              <i className="fas fa-search text-5xl mb-4 text-gray-300" />
              <p className="text-xl font-medium">Không tìm thấy bác sĩ phù hợp.</p>
              <button onClick={handleClearFilters} className="mt-4 text-blue-600 hover:underline">Xóa bộ lọc</button>
            </div>
          )}

          {/* Pagination — do backend trả về totalPages */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12 flex-wrap">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              >
                <i className="fas fa-chevron-left" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${currentPage === page
                      ? 'bg-[#0093E9] text-white shadow-lg scale-110'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {page + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="w-10 h-10 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-xl text-blue-600 flex items-center gap-2">
                <i className="fas fa-user-md" /> Hồ sơ chi tiết
              </h3>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors shadow-sm"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 text-center">
                  <div className="relative inline-block w-full">
                    <img
                      src={getImageUrl(selectedDoctor.pictureUrl, selectedDoctor.gender)}
                      alt={selectedDoctor.fullName}
                      className="w-full aspect-[3/4] object-cover rounded-2xl shadow-lg mb-4 border-4 border-white"
                      onError={(e) => { (e.target as HTMLImageElement).src = getImageUrl(null, selectedDoctor.gender); }}
                    />
                    <div className="absolute bottom-6 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      <i className="fas fa-check-circle mr-1" />Đang làm việc
                    </div>
                  </div>
                  <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-100">
                    ID: #{selectedDoctor.id}
                  </span>
                </div>

                <div className="md:col-span-8 flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedDoctor.fullName}</h2>
                    <p className="text-lg text-[#0093E9] font-bold mb-1">{selectedDoctor.specialization}</p>
                    <p className="text-gray-500 text-sm">{getDeptName(selectedDoctor.departmentId)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm border-t border-b border-gray-100 py-6 mb-6">
                    {[
                      { label: 'Giới tính', value: getGenderText(selectedDoctor.gender) },
                      { label: 'Kinh nghiệm', value: `${selectedDoctor.experienceYear} năm` },
                      { label: 'Email', value: selectedDoctor.email || 'N/A' },
                      { label: 'Số điện thoại', value: selectedDoctor.phone || 'N/A' },
                      { label: 'Đánh giá TB', value: `${selectedDoctor.avgRating?.toFixed(1) ?? '0.0'} / 5.0` },
                      { label: 'Tổng lượt review', value: selectedDoctor.totalReviews ?? 0 },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">{label}</span>
                        <span className="font-medium text-gray-700 truncate block">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-3 text-gray-800">
                      <i className="fas fa-info-circle text-[#0093E9]" /> Tiểu sử & Giới thiệu
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-600 leading-relaxed text-sm italic">
                        {selectedDoctor.bio ? `"${selectedDoctor.bio}"` : 'Chưa có thông tin giới thiệu chi tiết về bác sĩ.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <CustomButton
                      className="flex-1 py-3 text-base shadow-lg shadow-blue-200"
                      onClick={() => {
                        setSelectedDoctor(null);
                        navigate(`${APP_ROUTES.BOOKING}?doctorId=${selectedDoctor.id}&deptId=${selectedDoctor.departmentId}`);
                      }}
                    >
                      Đặt lịch khám ngay
                    </CustomButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;