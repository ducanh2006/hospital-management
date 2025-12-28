const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('labLookupForm');
    if (form) {
        form.addEventListener('submit', handleLookup);
    }
});

async function handleLookup(e) {
    e.preventDefault();

    const cccdInput = document.getElementById('patientCCCD');
    const errorDiv = document.querySelector('.error[data-error="patientCCCD"]');
    const cccd = cccdInput.value.trim();

    // Reset lỗi cũ
    if (errorDiv) errorDiv.textContent = '';
    
    // Validate cơ bản
    if (!cccd || cccd.length !== 12) {
        if (errorDiv) errorDiv.textContent = 'Vui lòng nhập đúng 12 số CCCD.';
        return;
    }

    // UI Elements
    const resultsSection = document.getElementById('testResults');
    const containerNon = document.getElementById('testResultsNonCompleted');
    const containerCompleted = document.getElementById('testResultsCompleted');
    const btnSubmit = e.target.querySelector('button[type="submit"]');

    // Hiệu ứng Loading
    const originalBtnText = btnSubmit.textContent;
    btnSubmit.textContent = 'Đang tra cứu...';
    btnSubmit.disabled = true;
    resultsSection.hidden = true;

    try {
        // Gọi API
        const response = await fetch(`${API_BASE_URL}/patients/appointments/${cccd}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Không tìm thấy hồ sơ bệnh nhân với số CCCD này.');
            } else {
                throw new Error('Lỗi kết nối đến máy chủ.');
            }
        }

        const data = await response.json();

        // Xóa kết quả cũ
        containerNon.innerHTML = '';
        containerCompleted.innerHTML = '';

        if (!data || data.length === 0) {
            alert('Bệnh nhân chưa có lịch sử khám bệnh nào.');
            btnSubmit.textContent = originalBtnText;
            btnSubmit.disabled = false;
            return;
        }

        // Sắp xếp: Mới nhất lên đầu
        data.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Phân loại
        const completedList = data.filter(item => item.status === 'COMPLETED');
        const nonCompletedList = data.filter(item => item.status !== 'COMPLETED');

        // --- Render Phần chưa hoàn thành (Non-Completed) ---
        if (nonCompletedList.length > 0) {
            const title = document.createElement('h2');
            title.className = 'section-title warning';
            title.innerHTML = '<i class="fa-regular fa-calendar"></i> Lịch hẹn sắp tới / Chờ khám';
            containerNon.appendChild(title);

            nonCompletedList.forEach(appt => {
                containerNon.appendChild(createAppointmentCard(appt));
            });
        }

        // --- Render Phần đã hoàn thành & Kết quả (Completed) ---
        if (completedList.length > 0) {
            const title = document.createElement('h2');
            title.className = 'section-title success';
            title.style.marginTop = '30px'; // Cách đoạn trên ra một chút
            title.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Kết quả khám & Xét nghiệm';
            containerCompleted.appendChild(title);

            completedList.forEach(appt => {
                containerCompleted.appendChild(createAppointmentCard(appt));
            });
        } else {
            // Nếu không có lịch sử khám xong
            containerCompleted.innerHTML = '<p style="text-align:center; color:#666; margin-top:20px;">Chưa có kết quả xét nghiệm nào.</p>';
        }

        // Hiện section kết quả
        resultsSection.hidden = false;

    } catch (err) {
        console.error(err);
        if (errorDiv) errorDiv.textContent = err.message;
    } finally {
        btnSubmit.textContent = originalBtnText;
        btnSubmit.disabled = false;
    }
}

/**
 * Hàm tạo HTML cho thẻ Card
 */
function createAppointmentCard(appt) {
    const card = document.createElement('div');
    card.className = 'result-card'; // Bạn có thể style thêm class này trong CSS nếu muốn

    // Style inline nhẹ để đảm bảo hiển thị đẹp ngay cả khi chưa sửa CSS nhiều
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '8px';
    card.style.padding = '15px';
    card.style.marginBottom = '15px';
    card.style.backgroundColor = '#fff';
    card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
    
    // Border trái phân biệt màu sắc
    const statusColor = getStatusColor(appt.status);
    card.style.borderLeft = `5px solid ${statusColor}`;

    // Format ngày giờ
    const dateObj = new Date(appt.time);
    const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('vi-VN');

    // Xử lý status
    const statusText = translateStatus(appt.status);

    // Xử lý Kết quả xét nghiệm (Chỉ hiện khi có dữ liệu)
    let testResultHtml = '';
    if (appt.testResults) {
        testResultHtml = `
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #eee;">
                <strong style="color: #0093E9;"><i class="fa-solid fa-microscope"></i> KẾT QUẢ XÉT NGHIỆM:</strong>
                <p style="background: #f0f9ff; padding: 10px; border-radius: 4px; color: #333; margin-top: 5px;">
                    ${appt.testResults}
                </p>
            </div>
        `;
    } else if (appt.status === 'COMPLETED') {
        testResultHtml = `
            <div style="margin-top: 10px; font-style: italic; color: #999;">
                (Chưa cập nhật chi tiết kết quả xét nghiệm lên hệ thống)
            </div>
        `;
    }

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
                <div style="font-size: 0.9em; color: #666;">
                    <i class="fa-regular fa-clock"></i> ${timeStr} - ${dateStr}
                </div>
                <h3 style="margin: 5px 0; color: #333;">${appt.departmentName || 'Chuyên khoa'}</h3>
                <div style="font-weight: 500;">BS. ${appt.doctorName || 'Chưa chỉ định'}</div>
            </div>
            <span style="background:${statusColor}; color:white; padding: 4px 10px; border-radius: 12px; font-size: 0.8em; font-weight: bold;">
                ${statusText}
            </span>
        </div>
        
        ${appt.notes ? `<div style="color: #555; font-size: 0.95em;"><strong>Ghi chú:</strong> ${appt.notes}</div>` : ''}
        
        ${testResultHtml}
    `;

    return card;
}

// --- Helper Functions ---

function translateStatus(status) {
    const map = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'COMPLETED': 'Đã hoàn thành',
        'CANCELLED': 'Đã hủy'
    };
    return map[status] || status;
}

function getStatusColor(status) {
    const map = {
        'PENDING': '#f59e0b',    // Vàng cam
        'CONFIRMED': '#3b82f6',  // Xanh dương
        'COMPLETED': '#10b981',  // Xanh lá
        'CANCELLED': '#ef4444'   // Đỏ
    };
    return map[status] || '#9ca3af'; // Xám
}