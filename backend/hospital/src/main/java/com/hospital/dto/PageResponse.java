package com.hospital.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic paged response envelope — bao gồm dữ liệu hiện tại và metadata phân
 * trang.
 *
 * @param <T> kiểu dữ liệu của mỗi phần tử trong trang
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {

    /** Dữ liệu của trang hiện tại */
    private List<T> content;

    /** Trang hiện tại (zero-based) */
    private Integer page;

    /** Số bản ghi mỗi trang */
    private Integer size;

    /** Tổng số bản ghi thỏa điều kiện lọc */
    private long totalElements;

    /** Tổng số trang */
    private Integer totalPages;
}
