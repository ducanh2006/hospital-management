package com.hospital.dto;

import lombok.Data;

/**
 * Tham số tìm kiếm bác sĩ nâng cao.
 * Tất cả các trường đều là optional — null nghĩa là không lọc theo tiêu chí đó.
 */
@Data
public class DoctorSearchRequest {

    /** Tìm theo tên, kiểu LIKE %name% (không phân biệt hoa/thường) */
    private String name;

    /** Lọc theo giới tính: MALE | FEMALE | OTHER */
    private String gender;

    /** Lọc theo phòng khoa (department_id) */
    private Integer departmentId;

    /** Trang hiện tại, bắt đầu từ 0 (zero-based) */
    private Integer page = 0;

    /** Số bản ghi mỗi trang */
    private Integer size = 10;
}
