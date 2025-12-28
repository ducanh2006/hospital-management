const API_BASE_URL = 'http://localhost:8080/api';
const UPLOAD_BASE_URL = 'http://localhost:8080/uploads'; // Đường dẫn ảnh từ server

// Biến lưu trạng thái validation
let isDoctorValid = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Xử lý URL Params và khởi tạo form
    initFormFromURL();

    // 2. Lắng nghe sự kiện nhập ID Bác sĩ (Live Check)
    const docInput = document.getElementById('bookingDocId');
    if (docInput) {
        // Dùng debounce 500ms để tránh gọi API liên tục khi đang gõ
        docInput.addEventListener('input', debounce(handleDoctorIdChange, 500));
    }

    // 3. Xử lý nút Đặt lịch (Submit Form)
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // 4. Xử lý Form đăng ký bệnh nhân mới (trong Modal)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
});

// --- PHẦN 1: KHỞI TẠO & DOCTOR PREVIEW (NÂNG CẤP) ---

function initFormFromURL() {
    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get('doctorId');
    const deptId = params.get('deptId');

    // Nếu có doctorId trên URL, điền vào input và kích hoạt tìm kiếm
    if (doctorId) {
        const docInput = document.getElementById('bookingDocId');
        if (docInput) {
            docInput.value = doctorId;
            // Gọi hàm check thủ công
            handleDoctorIdChange({ target: docInput });
        }
    }

    // Lưu deptId vào hidden field
    if (deptId) {
        const deptInput = document.getElementById('bookingDeptId');
        if (deptInput) deptInput.value = deptId;
    }
}

async function handleDoctorIdChange(e) {
    const id = e.target.value.trim();
    const previewBox = document.getElementById('docInfoContent');
    const emptyState = document.getElementById('docEmptyState');
    const errorState = document.getElementById('docErrorState');

    // Reset UI
    isDoctorValid = false;
    if (previewBox) previewBox.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    
    // Nếu ô nhập trống -> Hiện trạng thái chờ
    if (!id) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    try {
        // Gọi API lấy thông tin bác sĩ
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`);
        
        if (response.status === 404) {
            // Hiển thị lỗi ID không tồn tại
            if (errorState) errorState.style.display = 'block';
            return;
        }

        if (!response.ok) throw new Error('API Error');

        const doctor = await response.json();
        
        // --- XỬ LÝ DỮ LIỆU HIỂN THỊ ---
        isDoctorValid = true;
        
        const genderText = doctor.gender === 'MALE' ? 'Nam' : (doctor.gender === 'FEMALE' ? 'Nữ' : 'Khác');
        const ratingText = doctor.avgRating ? `${doctor.avgRating.toFixed(1)} / 5.0` : 'Chưa có đánh giá';
        const reviewCount = doctor.totalReviews || 0;
        const bioText = doctor.bio || 'Chưa có thông tin giới thiệu chi tiết.';
        const email = doctor.email || 'Liên hệ bệnh viện';
        const phone = doctor.phone || 'Liên hệ bệnh viện';

        // Xử lý ảnh: Logic tương tự trang Đội ngũ bác sĩ
        let photoUrl = `${UPLOAD_BASE_URL}/doctor-male-1.png`;
        if (doctor.gender === 'FEMALE') {
            photoUrl = `${UPLOAD_BASE_URL}/doctor-female-1.png`;
        }

        // Nếu có pictureId, gọi API để lấy tên file thật
        if (doctor.pictureId) {
            try {
                const picRes = await fetch(`${API_BASE_URL}/pictures/find-by-id?id=${doctor.pictureId}`);
                if (picRes.ok) {
                    const picData = await picRes.json();
                    photoUrl = `${UPLOAD_BASE_URL}/${picData.pictureUrl}`;
                }
            } catch (err) {
                // Lỗi load ảnh thì dùng ảnh mặc định, không cần log
            }
        }

        // Ảnh fallback khi link ảnh bị hỏng
        const fallbackImg = `${UPLOAD_BASE_URL}/logo.png`;

        // --- CẬP NHẬT GIAO DIỆN (Rich UI) ---
        if (previewBox) {
            previewBox.innerHTML = `
                <div style="text-align: center;">
                    <img src="${photoUrl}" alt="Avatar" class="doc-img" 
                         style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                         onerror="this.onerror=null; this.src='${fallbackImg}';">
                </div>
                
                <h3 style="color: #0093E9; margin: 10px 0 5px; text-align: center;">${doctor.fullName}</h3>
                <div style="color: #666; font-weight: bold; margin-bottom: 15px; text-align: center; text-transform: uppercase; font-size: 0.9em;">
                    ${doctor.specialization}
                </div>

                <div style="text-align: left; font-size: 0.95rem; line-height: 1.8; color: #333; background: #fff; padding: 15px; border-radius: 8px;">
                    <p>👤 <strong>Giới tính:</strong> ${genderText}</p>
                    <p>🎓 <strong>Kinh nghiệm:</strong> ${doctor.experienceYear || 0} năm</p>
                    <p>⭐ <strong>Đánh giá:</strong> <span style="color: #f59e0b; font-weight: bold;">${ratingText}</span> <small>(${reviewCount} lượt)</small></p>
                    <hr style="border: 0; border-top: 1px dashed #ddd; margin: 10px 0;">
                    <p>📧 <strong>Email:</strong> ${email}</p>
                    <p>📞 <strong>SĐT:</strong> ${phone}</p>
                    <div style="margin-top: 10px;">
                        <strong>📝 Giới thiệu:</strong>
                        <p style="font-style: italic; color: #555; margin-top: 5px; font-size: 0.9em; text-align: justify;">
                            "${bioText}"
                        </p>
                    </div>
                </div>
            `;
            
            previewBox.style.display = 'block';
        }

    } catch (error) {
        console.error("Lỗi tìm bác sĩ:", error);
        if (errorState) errorState.style.display = 'block';
    }
}

// --- PHẦN 2: XỬ LÝ ĐẶT LỊCH & KIỂM TRA BỆNH NHÂN ---

async function handleBookingSubmit(e) {
    e.preventDefault();

    if (!isDoctorValid) {
        alert("Vui lòng nhập ID Bác sĩ hợp lệ trước khi đặt lịch.");
        return;
    }

    const cccd = document.getElementById('bookingCCCD').value.trim();
    if (!cccd || cccd.length < 9) {
        alert("Vui lòng nhập số CCCD hợp lệ.");
        return;
    }

    // Bước 1: Kiểm tra xem bệnh nhân đã có trong DB chưa
    try {
        const checkRes = await fetch(`${API_BASE_URL}/patients/${cccd}`);
        
        if (checkRes.ok) {
            // CASE A: Bệnh nhân đã tồn tại -> Tiến hành đặt lịch luôn
            await createAppointment();
        } else if (checkRes.status === 404) {
            // CASE B: Bệnh nhân chưa tồn tại -> Mở Modal đăng ký
            openRegisterModal(cccd);
        } else {
            throw new Error("Lỗi kết nối Server khi kiểm tra bệnh nhân");
        }
    } catch (error) {
        console.error(error);
        alert("Không thể kiểm tra thông tin bệnh nhân. Vui lòng thử lại.");
    }
}

async function createAppointment() {
    // Lấy dữ liệu từ Form đặt lịch
    const cccd = document.getElementById('bookingCCCD').value;
    const docId = document.getElementById('bookingDocId').value;
    const timeVal = document.getElementById('bookingTime').value;
    const notes = document.getElementById('bookingNotes').value;
    const deptId = document.getElementById('bookingDeptId').value; 

    // Validate time
    if (!timeVal) {
        alert("Vui lòng chọn thời gian khám.");
        return;
    }

    // Tạo payload đúng với AppointmentEntity
    const appointmentPayload = {
        patientIdentityNumber: parseInt(cccd),
        doctorId: parseInt(docId),
        departmentId: deptId ? parseInt(deptId) : null,
        time: timeVal,
        status: "PENDING",
        rating: null,
        notes: notes,
        testResults: null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentPayload)
        });

        if (response.ok) {
            alert("ĐẶT LỊCH THÀNH CÔNG! \nHệ thống đã ghi nhận lịch khám của bạn.");
            window.location.reload(); // Tải lại trang để reset form
        } else {
            const errText = await response.text();
            alert("Lỗi đặt lịch: " + errText);
        }
    } catch (error) {
        console.error("Lỗi đặt lịch:", error);
        alert("Không thể kết nối đến server để đặt lịch.");
    }
}

// --- PHẦN 3: XỬ LÝ ĐĂNG KÝ BỆNH NHÂN MỚI (MODAL) ---

function openRegisterModal(cccd) {
    const modal = document.getElementById('registerModal');
    const cccdInput = document.getElementById('regCCCD');
    
    if (modal && cccdInput) {
        // Điền sẵn CCCD vào form đăng ký (ẩn)
        cccdInput.value = cccd;
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Đóng modal khi click ra ngoài vùng nội dung
window.onclick = function(event) {
    const modal = document.getElementById('registerModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();

    // Lấy dữ liệu từ form modal
    const patientData = {
        identityNumber: parseInt(document.getElementById('regCCCD').value),
        fullName: document.getElementById('regFullName').value.trim(),
        gender: document.getElementById('regGender').value,
        dateOfBirth: document.getElementById('regDob').value || null,
        phone: document.getElementById('regPhone').value.trim(),
        address: document.getElementById('regAddress').value || "",
        email: "", 
        insuranceNumber: "",
        emergencyContactPhone: "",
        lastUpdate: new Date().toISOString()
    };

    if (!patientData.fullName || !patientData.phone) {
        alert("Vui lòng điền đầy đủ Họ tên và Số điện thoại.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });

        if (response.ok) {
            alert("Đăng ký hồ sơ bệnh nhân thành công! \nĐang tự động tiếp tục đặt lịch...");
            closeModal();
            // Sau khi đăng ký xong, tự động gọi lại hàm đặt lịch
            await createAppointment();
        } else {
            const errText = await response.text();
            alert("Lỗi tạo hồ sơ: " + errText);
        }
    } catch (error) {
        console.error("Lỗi tạo patient:", error);
        alert("Không thể tạo hồ sơ bệnh nhân do lỗi kết nối.");
    }
}

// --- UTILS ---
// Hàm debounce để tránh gọi API quá nhiều khi đang gõ
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}