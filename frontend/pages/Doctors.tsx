import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService, departmentService } from '../services/hospitalService';
import { Doctor, Department, Gender } from '../types';
import { getImageUrl, getGenderText } from '../utils/helpers';
import CustomButton from '../components/ui/CustomButton';
import { APP_ROUTES } from '../constants/config';

// Interface mở rộng cho Doctor để bao gồm departmentName tính toán
interface DoctorWithDept extends Doctor {
  departmentName: string;
}

const Doctors: React.FC = () => {

  const resizeImage = 50;
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorWithDept[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithDept[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, deptsRes] = await Promise.all([
          doctorService.getAllWithRating(),
          departmentService.getAll()
        ]);

        const depts = Array.isArray(deptsRes.data) ? deptsRes.data : [];
        const rawDocs = Array.isArray(docsRes.data) ? docsRes.data : [];

        // Ghép tên phòng ban vào đối tượng bác sĩ
        const docs: DoctorWithDept[] = rawDocs.map(doc => {
          const dept = depts.find(d => d.id === doc.departmentId);
          return {
            ...doc,
            departmentName: dept?.name || 'Chưa xác định'
          };
        });

        setDepartments(depts);
        setDoctors(docs);
        setFilteredDoctors(docs);
      } catch (err) {
        console.error("Error loading doctors", err);
        // Có thể thêm toast thông báo lỗi ở đây
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(doc => {
      const matchSearch = doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase());

      const matchDept = !selectedDept || doc.departmentId?.toString() === selectedDept;

      // Xử lý so sánh giới tính an toàn
      const matchGender = !selectedGender || doc.gender === selectedGender;

      return matchSearch && matchDept && matchGender;
    });
    setFilteredDoctors(filtered);
    setCurrentPage(1); // Reset về trang 1 khi bộ lọc thay đổi
  }, [search, selectedDept, selectedGender, doctors]);

  const paginated = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredDoctors.length / pageSize);

  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<DoctorWithDept | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight text-gray-800">Đội ngũ bác sĩ chuyên khoa</h1>
        <p className="text-gray-500">Hiện có <strong className="text-blue-600">{filteredDoctors.length}</strong> bác sĩ đang hiển thị.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Tìm kiếm bác sĩ</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Tên / Chuyên khoa</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập từ khóa..."
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
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-3xl h-96"></div>
              ))}
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginated.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-50 group-hover:border-blue-200 transition-colors shadow-md">
                    {/* SỬA LỖI CHÍNH: Đổi photoUrl thành pictureUrl */}
                    <img
                      src={getImageUrl(doc.pictureUrl, doc.gender, resizeImage)}
                      alt={doc.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback nếu ảnh lỗi
                        const target = e.target as HTMLImageElement;
                        target.src = getImageUrl(null, doc.gender);
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 text-gray-800 group-hover:text-[#0093E9] transition-colors line-clamp-1 w-full">{doc.fullName}</h3>
                  <p className="text-[#0093E9] text-sm font-semibold mb-3 line-clamp-1">{doc.departmentName}</p>
                  <p className="text-gray-500 text-xs mb-4 italic line-clamp-1">{doc.specialization}</p>

                  <div className="flex gap-4 text-xs text-gray-500 mb-6 w-full justify-center border-t border-b border-gray-50 py-3">
                    <span className="flex items-center"><i className="fas fa-venus-mars mr-1.5 text-blue-400"></i> {getGenderText(doc.gender)}</span>
                    <span className="flex items-center"><i className="fas fa-award mr-1.5 text-yellow-500"></i> {doc.experienceYear} năm KN</span>
                  </div>

                  <div className="flex items-center gap-1 mb-4 text-sm">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="font-bold text-gray-700">{doc.avgRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400 text-xs">({doc.totalReviews} đánh giá)</span>
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
                      onClick={() => setSelectedDoctorDetail(doc)}
                    >
                      Chi tiết
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-3xl text-center text-gray-500 border border-dashed border-gray-300">
              <i className="fas fa-search text-5xl mb-4 text-gray-300"></i>
              <p className="text-xl font-medium">Không tìm thấy bác sĩ phù hợp.</p>
              <button onClick={() => { setSearch(''); setSelectedDept(''); setSelectedGender('') }} className="mt-4 text-blue-600 hover:underline">Xóa bộ lọc</button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12 flex-wrap">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${currentPage === page
                    ? 'bg-[#0093E9] text-white shadow-lg scale-110'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctorDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up relative">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-xl text-blue-600 flex items-center gap-2">
                <i className="fas fa-user-md"></i> Hồ sơ chi tiết
              </h3>
              <button onClick={() => setSelectedDoctorDetail(null)} className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors shadow-sm">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Cột ảnh */}
                <div className="md:col-span-4 text-center">
                  <div className="relative inline-block">
                    <img
                      src={getImageUrl(selectedDoctorDetail.pictureUrl, selectedDoctorDetail.gender)}
                      alt={selectedDoctorDetail.fullName}
                      className="w-full aspect-[3/4] object-cover rounded-2xl shadow-lg mb-4 border-4 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getImageUrl(null, selectedDoctorDetail.gender);
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      <i className="fas fa-check-circle mr-1"></i> Đang làm việc
                    </div>
                  </div>
                  <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-100">
                    ID: #{selectedDoctorDetail.id}
                  </span>
                </div>

                {/* Cột thông tin */}
                <div className="md:col-span-8 flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedDoctorDetail.fullName}</h2>
                    <p className="text-lg text-[#0093E9] font-bold mb-1">{selectedDoctorDetail.specialization}</p>
                    <p className="text-gray-500 text-sm">{selectedDoctorDetail.departmentName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm border-t border-b border-gray-100 py-6 mb-6">
                    <div>
                      <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">Giới tính</span>
                      <span className="font-medium text-gray-700">{getGenderText(selectedDoctorDetail.gender)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">Kinh nghiệm</span>
                      <span className="font-medium text-gray-700">{selectedDoctorDetail.experienceYear} năm</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">Email</span>
                      <span className="font-medium text-gray-700 truncate block" title={selectedDoctorDetail.email}>{selectedDoctorDetail.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">Số điện thoại</span>
                      <span className="font-medium text-gray-700">{selectedDoctorDetail.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">Đánh giá trung bình</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-yellow-500 text-base">{selectedDoctorDetail.avgRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-400 text-xs">/ 5.0</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase text-[10px] mb-1 tracking-wider">Tổng lượt review</span>
                      <span className="font-medium text-gray-700">{selectedDoctorDetail.totalReviews || 0}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h4 className="font-bold flex items-center gap-2 mb-3 text-gray-800">
                      <i className="fas fa-info-circle text-[#0093E9]"></i> Tiểu sử & Giới thiệu
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-600 leading-relaxed text-sm italic">
                        {selectedDoctorDetail.bio ? `"${selectedDoctorDetail.bio}"` : 'Chưa có thông tin giới thiệu chi tiết về bác sĩ.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <CustomButton
                      className="flex-1 py-3 text-base shadow-lg shadow-blue-200"
                      onClick={() => {
                        setSelectedDoctorDetail(null);
                        navigate(`${APP_ROUTES.BOOKING}?doctorId=${selectedDoctorDetail.id}&deptId=${selectedDoctorDetail.departmentId}`);
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