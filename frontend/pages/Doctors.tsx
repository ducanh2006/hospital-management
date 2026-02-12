
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService, departmentService } from '../services/hospitalService';
import { Doctor, Department, Gender } from '../types';
import { getImageUrl, getGenderText } from '../utils/helpers';
import CustomButton from '../components/ui/CustomButton';
import { APP_ROUTES } from '../constants/config';

const Doctors: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
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
        
        const docs = rawDocs.map(doc => {
          const dept = depts.find(d => d.id === doc.departmentId);
          return { ...doc, departmentName: dept?.name || 'Chưa xác định' };
        });

        setDepartments(depts);
        setDoctors(docs);
        setFilteredDoctors(docs);
      } catch (err) {
        console.error("Error loading doctors", err);
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
      const matchDept = !selectedDept || doc.departmentId.toString() === selectedDept;
      const matchGender = !selectedGender || doc.gender === selectedGender;
      return matchSearch && matchDept && matchGender;
    });
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [search, selectedDept, selectedGender, doctors]);

  const paginated = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredDoctors.length / pageSize);

  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<Doctor | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight">Đội ngũ bác sĩ chuyên khoa</h1>
        <p className="text-gray-500">Hiện có <strong className="text-blue-600">{filteredDoctors.length}</strong> bác sĩ đang hiển thị.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg mb-4">Tìm kiếm bác sĩ</h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Tên / Chuyên khoa</label>
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập từ khóa..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phòng khoa</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
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
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-3xl h-80"></div>
              ))}
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginated.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl transition-all">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-blue-50 group-hover:scale-105 transition-transform">
                    <img src={getImageUrl(doc.photoUrl, doc.gender)} alt={doc.fullName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-[#0093E9] transition-colors">{doc.fullName}</h3>
                  <p className="text-[#0093E9] text-sm font-semibold mb-3">{doc.departmentName}</p>
                  
                  <div className="flex gap-4 text-xs text-gray-500 mb-6">
                    <span><i className="fas fa-venus-mars mr-1"></i> {getGenderText(doc.gender)}</span>
                    <span><i className="fas fa-award mr-1"></i> {doc.experienceYear} năm KN</span>
                  </div>

                  <div className="flex gap-2 w-full">
                    <CustomButton 
                      className="flex-1 py-2 text-xs" 
                      onClick={() => navigate(`${APP_ROUTES.BOOKING}?doctorId=${doc.id}&deptId=${doc.departmentId}`)}
                    >
                      Đặt lịch
                    </CustomButton>
                    <CustomButton 
                      variant="outline" 
                      className="flex-1 py-2 text-xs"
                      onClick={() => setSelectedDoctorDetail(doc)}
                    >
                      Chi tiết
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-12 rounded-3xl text-center text-gray-500">
              <i className="fas fa-search text-5xl mb-4"></i>
              <p className="text-xl font-medium">Không tìm thấy bác sĩ phù hợp.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-full font-bold transition-all ${
                    currentPage === page 
                    ? 'bg-[#0093E9] text-white shadow-lg' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctorDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-blue-600">Hồ sơ chi tiết Bác sĩ</h3>
              <button onClick={() => setSelectedDoctorDetail(null)} className="text-2xl text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 text-center">
                <img 
                  src={getImageUrl(selectedDoctorDetail.photoUrl, selectedDoctorDetail.gender)} 
                  className="w-full aspect-[3/4] object-cover rounded-2xl shadow-lg mb-4" 
                />
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-100">
                  ID: {selectedDoctorDetail.id}
                </span>
              </div>
              <div className="md:col-span-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedDoctorDetail.fullName}</h2>
                <p className="text-xl text-[#0093E9] font-bold mb-6">{selectedDoctorDetail.departmentName} - {selectedDoctorDetail.specialization}</p>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t pt-6">
                  <div><span className="text-gray-400 block font-bold uppercase text-[10px] mb-1">Giới tính</span> {getGenderText(selectedDoctorDetail.gender)}</div>
                  <div><span className="text-gray-400 block font-bold uppercase text-[10px] mb-1">Kinh nghiệm</span> {selectedDoctorDetail.experienceYear} năm</div>
                  <div><span className="text-gray-400 block font-bold uppercase text-[10px] mb-1">Email</span> {selectedDoctorDetail.email || 'N/A'}</div>
                  <div><span className="text-gray-400 block font-bold uppercase text-[10px] mb-1">Số điện thoại</span> {selectedDoctorDetail.phone || 'N/A'}</div>
                  <div><span className="text-gray-400 block font-bold uppercase text-[10px] mb-1">Đánh giá</span> {selectedDoctorDetail.avgRating?.toFixed(1) || 0} / 5.0</div>
                  <div><span className="text-gray-400 block font-bold uppercase text-[10px] mb-1">Lượt review</span> {selectedDoctorDetail.totalReviews || 0}</div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold flex items-center gap-2 mb-3">
                    <i className="fas fa-info-circle text-[#0093E9]"></i> Tiểu sử
                  </h4>
                  <p className="text-gray-600 leading-relaxed italic text-sm">
                    "{selectedDoctorDetail.bio || 'Chưa có thông tin giới thiệu.'}"
                  </p>
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
