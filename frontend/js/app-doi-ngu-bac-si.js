const API_BASE_URL = 'http://localhost:8080/api';
const UPLOAD_BASE_URL = 'http://localhost:8080/uploads'; // Định nghĩa hằng số cho đường dẫn ảnh

// Biến lưu trữ dữ liệu tập trung
let allDoctors = [];
let allDepartments = [];
let filteredDoctors = [];

// Cấu hình phân trang
const PAGE_SIZE = 9;
let currentPage = 1;

/**
 * Khởi tạo trang khi DOM sẵn sàng
 */
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;

    showLoading(true);
    try {
        // Bước 1: Gọi song song 2 API chính
        const [docsRes, deptsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/doctors/with-rating`),
            fetch(`${API_BASE_URL}/departments`)
        ]);

        if (!docsRes.ok || !deptsRes.ok) throw new Error("Lỗi kết nối API");

        const rawDoctors = await docsRes.json();
        allDepartments = await deptsRes.json();

        // Bước 2: Xử lý dữ liệu bác sĩ (Map phòng ban và lấy URL ảnh)
        allDoctors = await Promise.all(rawDoctors.map(async (doc) => {
            // Tìm tên phòng ban dựa trên departmentId
            const dept = allDepartments.find(d => d.id === doc.departmentId);
            const deptName = dept ? dept.name : "Chưa xác định";

            // Xử lý ảnh: Mặc định là ảnh nam
            let photoUrl = `${UPLOAD_BASE_URL}/doctor-male-1.png`; 
            
            // Nếu là nữ thì đổi ảnh mặc định nữ
            if (doc.gender === 'FEMALE') {
                photoUrl = `${UPLOAD_BASE_URL}/doctor-female-1.png`;
            }

            if (doc.pictureId) {
                try {
                    const picRes = await fetch(`${API_BASE_URL}/pictures/find-by-id?id=${doc.pictureId}`);
                    if (picRes.ok) {
                        const picData = await picRes.json();
                        // Sử dụng đường dẫn từ backend upload folder
                        photoUrl = `${UPLOAD_BASE_URL}/${picData.pictureUrl}`;
                    }
                } catch (e) { 
                    // Nếu lỗi API ảnh thì giữ nguyên ảnh mặc định, không log quá nhiều gây rối console
                    // console.warn(`Lỗi ảnh bác sĩ ID ${doc.id}`); 
                }
            }

            return {
                ...doc,
                departmentName: deptName,
                photoUrl: photoUrl,
                genderVN: doc.gender === 'MALE' ? 'Nam' : (doc.gender === 'FEMALE' ? 'Nữ' : 'Khác')
            };
        }));

        // Bước 3: Cập nhật UI
        renderDepartmentFilter();
        setupFilterEvents();
        applyFilters();

    } catch (error) {
        console.error("Initialization Error:", error);
        // Không alert lỗi để tránh làm phiền người dùng nếu chỉ là lỗi mạng thoáng qua
        grid.innerHTML = '<p style="text-align:center; color:red">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>';
    } finally {
        showLoading(false);
    }
});

/**
 * Đổ dữ liệu phòng ban vào thanh lọc (Filter)
 */
function renderDepartmentFilter() {
    const specSelect = document.getElementById('filterSpecialty');
    if (!specSelect) return;

    // Reset options
    specSelect.innerHTML = '<option value="">Tất cả chuyên khoa</option>';

    allDepartments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        opt.textContent = dept.name;
        specSelect.appendChild(opt);
    });
}

/**
 * Lọc danh sách bác sĩ dựa trên Input
 */
function applyFilters() {
    const keyword = document.getElementById('doctorSearch')?.value.toLowerCase() || "";
    const gender = document.getElementById('filterGender')?.value || "";
    const deptId = document.getElementById('filterSpecialty')?.value || "";

    filteredDoctors = allDoctors.filter(doc => {
        const matchKeyword = doc.fullName.toLowerCase().includes(keyword) || 
                             doc.specialization.toLowerCase().includes(keyword);
        const matchGender = !gender || doc.gender === gender;
        const matchDept = !deptId || doc.departmentId == deptId;

        return matchKeyword && matchGender && matchDept;
    });

    currentPage = 1; // Reset về trang 1 khi lọc
    renderGrid();
}

/**
 * Hiển thị danh sách bác sĩ lên màn hình (Kèm phân trang)
 */
function renderGrid() {
    const grid = document.getElementById('doctorsGrid');
    const countEl = document.getElementById('doctorCount');
    if (!grid) return;

    grid.innerHTML = '';
    if (countEl) countEl.textContent = filteredDoctors.length;

    // Logic cắt mảng cho trang hiện tại
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredDoctors.slice(start, start + PAGE_SIZE);

    if (pageItems.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Không tìm thấy bác sĩ phù hợp.</p>';
        renderPagination(); // Render phân trang rỗng
        return;
    }

    pageItems.forEach(doc => {
        const card = document.createElement('article');
        card.className = 'doctor-card';
        
        // Xử lý fallback ảnh bằng base64 trong suốt hoặc ảnh mặc định chắc chắn tồn tại
        // Thêm this.onerror = null để ngăn vòng lặp vô hạn
        const fallbackImg = `${UPLOAD_BASE_URL}/logo.png`; 

        card.innerHTML = `
            <div class="doctor-avatar">
                <img src="${doc.photoUrl}" alt="${doc.fullName}" 
                     onerror="this.onerror=null; this.src='${fallbackImg}';">
            </div>
            <div class="doctor-info">
                <h3>${doc.fullName}</h3>
                <div class="doctor-specialty">${doc.departmentName}</div>
                <div class="doctor-meta">
                    <span><i class="fas fa-venus-mars"></i> ${doc.genderVN}</span>
                    <span><i class="fas fa-award"></i> ${doc.experienceYear} năm KN</span>
                </div>
                <div class="doctor-actions">
                    <button class="doctor-btn primary" onclick="goToBooking(${doc.id}, '${doc.departmentId}')">Đặt lịch</button>
                    <button class="doctor-btn outline" onclick='showDoctorDetail(${JSON.stringify(doc).replace(/'/g, "&apos;")})'>Xem chi tiết</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // QUAN TRỌNG: Gọi hàm renderPagination sau khi render grid
    renderPagination();
}

/**
 * Hàm hiển thị các nút phân trang
 */
function renderPagination() {
    const pagEl = document.getElementById('doctorsPagination');
    if (!pagEl) return;
    
    pagEl.innerHTML = ''; // Xóa nút cũ
    
    const totalPages = Math.ceil(filteredDoctors.length / PAGE_SIZE);

    // Nếu chỉ có 1 trang hoặc không có dữ liệu thì ẩn phân trang
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `page-btn ${i === currentPage ? 'is-active' : ''}`;
        
        btn.onclick = () => {
            currentPage = i;
            renderGrid();
            // Cuộn nhẹ lên đầu danh sách để người dùng dễ xem
            document.querySelector('.doctors-listing')?.scrollIntoView({ behavior: 'smooth' });
        };
        
        pagEl.appendChild(btn);
    }
}

/**
 * Hiển thị Modal chi tiết
 */
window.showDoctorDetail = function(doc) {
    let modal = document.getElementById('docDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'docDetailModal';
        modal.className = 'doctor-modal-overlay';
        document.body.appendChild(modal);
    }
    
    // Fallback ảnh cho modal
    const fallbackImg = `${UPLOAD_BASE_URL}/logo.png`;

    modal.innerHTML = `
        <div class="doctor-modal">
            <div class="doctor-modal-head">
                <h3>Hồ sơ chi tiết Bác sĩ</h3>
                <button class="doctor-modal-close" onclick="this.closest('.doctor-modal-overlay').classList.remove('open')">&times;</button>
            </div>
            <div class="doctor-modal-body" style="display: flex; gap: 20px; padding: 20px; flex-wrap: wrap;">
                <div style="flex: 0 0 200px; margin: 0 auto;">
                    <img src="${doc.photoUrl}" style="width: 100%; border-radius: 8px; object-fit: cover;" 
                         onerror="this.onerror=null; this.src='${fallbackImg}';">
                    <div style="margin-top: 15px; text-align: center;">
                        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                            ID BÁC SĨ: ${doc.id}
                        </span>
                    </div>
                </div>
                <div style="flex: 1; min-width: 250px;">
                    <h2 style="margin: 0; color: #0093E9;">${doc.fullName}</h2>
                    <p style="font-weight: bold; color: #666; margin: 5px 0 15px;">${doc.departmentName} - ${doc.specialization}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                        <div><strong>Giới tính:</strong> ${doc.genderVN}</div>
                        <div><strong>Kinh nghiệm:</strong> ${doc.experienceYear} năm</div>
                        <div><strong>Email:</strong> ${doc.email || 'N/A'}</div>
                        <div><strong>Số điện thoại:</strong> ${doc.phone || 'N/A'}</div>
                        <div><strong>Đánh giá TB:</strong> ${doc.avgRating?.toFixed(1) || 0} / 5.0</div>
                        <div><strong>Lượt review:</strong> ${doc.totalReviews || 0}</div>
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                        <h4 style="margin-bottom: 8px;"><i class="fas fa-info-circle"></i> Tiểu sử:</h4>
                        <p style="font-style: italic; color: #555; line-height: 1.6;">${doc.bio || 'Chưa có thông tin giới thiệu.'}</p>
                    </div>
                    
                    <p style="margin-top: 15px; font-size: 11px; color: #999;">Cập nhật lần cuối: ${new Date(doc.lastUpdate).toLocaleString('vi-VN')}</p>
                </div>
            </div>
        </div>
    `;
    
    // Thêm delay nhỏ để transition mượt mà
    setTimeout(() => modal.classList.add('open'), 10);
};

function setupFilterEvents() {
    ['doctorSearch', 'filterGender', 'filterSpecialty'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', applyFilters);
            if (id === 'doctorSearch') el.addEventListener('input', applyFilters);
        }
    });
}

function showLoading(status) {
    const loader = document.getElementById('loadingState');
    if (loader) loader.style.display = status ? 'block' : 'none';
}

window.goToBooking = function(id, deptId) {
    window.location.href = `dat-lich-kham.html?doctorId=${id}&deptId=${deptId}`;
};