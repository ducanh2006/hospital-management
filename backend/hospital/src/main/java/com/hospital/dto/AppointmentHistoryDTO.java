package com.hospital.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentHistoryDTO {
    private Integer id;
    private LocalDateTime time;
    private AppointmentStatus status;
    private String notes;
    private Integer rating;    
    private String doctorName;
    private String departmentName;
    private String testResults;
}