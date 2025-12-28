const API_URL = 'http://localhost:8080/api/medical-news';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tạo sẵn cái khung hiển thị chi tiết (Full Screen) khi trang vừa load
    createFullScreenContainer();
    
    // 2. Tải danh sách tin tức
    fetchAndRenderNews();
});

async function fetchAndRenderNews() {
    const container = document.getElementById('news-list');
    container.innerHTML = '<p style="text-align:center; color:#666;">Đang tải tin tức...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Lỗi kết nối');
        
        const data = await response.json();
        container.innerHTML = ''; // Xóa loading

        if (!data || data.length === 0) {
            container.innerHTML = '<p>Chưa có tin tức nào.</p>';
            return;
        }

        // Sắp xếp tin mới nhất lên đầu
        data.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

        data.forEach(news => {
            const dateStr = new Date(news.lastUpdate).toLocaleDateString('vi-VN');
            const desc = news.content ? news.content.substring(0, 150) + '...' : '';

            const article = document.createElement('article');
            article.className = 'news-card';
            article.innerHTML = `
                <h2>
                    <a href="javascript:void(0)" onclick='openFullScreenDetail(${JSON.stringify(news)})'>
                        ${news.title}
                    </a>
                </h2>
                <p class="news-meta">${dateStr}</p>
                <p class="news-desc">${desc}</p>
            `;
            container.appendChild(article);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Không thể tải tin tức.</p>';
    }
}

// --- LOGIC HIỂN THỊ TOÀN MÀN HÌNH ---

function createFullScreenContainer() {
    // Tạo một div phủ kín màn hình (z-index cực cao để che hết Header/Footer)
    const overlayHTML = `
    <div id="news-detail-overlay" style="
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100vw; 
        height: 100vh; 
        background-color: #ffffff; 
        z-index: 2147483647; 
        overflow-y: auto; 
        display: none; 
        padding-bottom: 50px;
    ">
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            
            <div style="position: sticky; top: 0; background: #fff; padding: 20px 0; border-bottom: 1px solid #eee; margin-bottom: 30px;">
                <button onclick="closeFullScreenDetail()" style="
                    background: transparent; 
                    border: 1px solid #0093E9; 
                    color: #0093E9; 
                    padding: 8px 20px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-weight: bold; 
                    display: flex; 
                    align-items: center; 
                    gap: 8px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#e0f7fa'" onmouseout="this.style.background='transparent'">
                    ← Quay lại danh sách
                </button>
            </div>

            <div id="detail-container">
                <h1 id="detail-title" style="color: #333; font-size: 2rem; margin-bottom: 10px;"></h1>
                <p id="detail-date" style="color: #888; font-style: italic; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px;"></p>
                <div id="detail-body" style="font-size: 1.1rem; line-height: 1.8; color: #222; white-space: pre-line; text-align: justify;"></div>
            </div>

        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
}

// Hàm mở chế độ toàn màn hình
window.openFullScreenDetail = function(news) {
    const overlay = document.getElementById('news-detail-overlay');
    
    // Đổ dữ liệu vào
    document.getElementById('detail-title').textContent = news.title;
    document.getElementById('detail-date').textContent = "Cập nhật ngày: " + new Date(news.lastUpdate).toLocaleDateString('vi-VN');
    document.getElementById('detail-body').textContent = news.content;

    // Hiện overlay
    overlay.style.display = 'block';
    
    // Khóa cuộn trang gốc bên dưới để trải nghiệm như trang mới
    document.body.style.overflow = 'hidden'; 
};

// Hàm đóng (Quay lại)
window.closeFullScreenDetail = function() {
    const overlay = document.getElementById('news-detail-overlay');
    
    // Ẩn overlay
    overlay.style.display = 'none';
    
    // Mở lại cuộn cho trang gốc
    document.body.style.overflow = 'auto';
};