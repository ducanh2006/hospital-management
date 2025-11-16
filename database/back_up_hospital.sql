-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: hospital
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `password` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `doctor_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'duc anh','12312',1),(3,'ducanh','12312',2),(4,'admin','123',3);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slot_id` bigint NOT NULL,
  `appointment_code` varchar(20) DEFAULT NULL,
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `department_id` int NOT NULL,
  `time` datetime DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `notes` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_appt_slot` (`slot_id`),
  UNIQUE KEY `appointment_code` (`appointment_code`),
  KEY `fk_appt_doctor` (`doctor_id`),
  KEY `fk_appt_patient` (`patient_id`),
  KEY `fk_appt_department` (`department_id`),
  CONSTRAINT `fk_appt_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`),
  CONSTRAINT `fk_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `fk_appt_slot` FOREIGN KEY (`slot_id`) REFERENCES `doctor_day_slot` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,1,'ENHD1937',1,1,1,'2025-11-01 08:00:00','CONFIRMED','Khám định kỳ','2025-11-02 08:11:17'),(2,2,'ENHD1938',2,2,1,'2025-11-01 09:00:00','PENDING','Khám tiêu hóa','2025-11-02 08:11:17'),(3,3,'ENHD1939',3,3,1,'2025-11-01 10:00:00','CONFIRMED','Kiểm tra thần kinh','2025-11-02 08:11:17'),(4,4,'ENHD1940',4,4,1,'2025-11-01 11:00:00','CANCELLED','Đã hủy bởi bệnh nhân','2025-11-02 08:11:17'),(5,5,'ENHD1941',5,5,2,'2025-11-01 08:00:00','COMPLETED','Khám hậu phẫu','2025-11-02 08:11:17');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `head_doctor_id` int DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `description` text,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Khoa Nội',1,'0123456789','Chuyên điều trị các bệnh nội tổng quát','2025-11-02 08:11:17'),(2,'Khoa Ngoại',2,'0987654321','Phẫu thuật và chăm sóc hậu phẫu','2025-11-02 08:11:17'),(3,'Khoa Nhi',3,'0905123456','Khám và điều trị cho trẻ em','2025-11-02 08:11:17'),(4,'Khoa Tim mạch',4,'0912345678','Chẩn đoán và điều trị bệnh tim','2025-11-02 08:11:17'),(5,'Khoa Da liễu',5,'0933221100','Chăm sóc và điều trị các bệnh về da','2025-11-02 08:11:17');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `specialization` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `department_id` int NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `bio` text,
  `picture_url` varchar(500) DEFAULT NULL,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_doctor_department` (`department_id`),
  CONSTRAINT `fk_doctor_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (1,'Nguyen Van A','MALE','Nội tổng quát','1980-02-15',1,'a@hospital.com','0901000001','BSCKII chuyên Nội tổng quát.',NULL,'2025-11-02 08:11:17'),(2,'Tran Thi B','FEMALE','Nội tiêu hóa','1985-04-22',1,'b@hospital.com','0901000002','ThS chuyên Nội tiêu hóa.',NULL,'2025-11-02 08:11:17'),(3,'Le Van C','MALE','Nội thần kinh','1978-09-10',1,'c@hospital.com','0901000003','BS chuyên Nội thần kinh.',NULL,'2025-11-02 08:11:17'),(4,'Pham Thi D','FEMALE','Nội tiết','1983-01-05',1,'d@hospital.com','0901000004','ThS Nội tiết.',NULL,'2025-11-02 08:11:17'),(5,'Nguyễn Văn E','MALE','Phẫu thuật tổng quát','1975-06-12',4,'e@hospital.com','0902000001','BSCKII Ngoại tổng quát.',NULL,'2025-11-16 17:25:33'),(6,'Tran Thi F','FEMALE','Phẫu thuật tiêu hóa','1986-11-21',2,'f@hospital.com','0902000002','ThS Ngoại tiêu hóa.',NULL,'2025-11-02 08:11:17'),(7,'Le Van G','MALE','Ngoại thần kinh','1977-03-14',2,'g@hospital.com','0902000003','BS Ngoại thần kinh.',NULL,'2025-11-02 08:11:17'),(8,'Pham Thi H','FEMALE','Chấn thương chỉnh hình','1989-08-01',2,'h@hospital.com','0902000004','BS chỉnh hình.',NULL,'2025-11-02 08:11:17'),(9,'Nguyen Van I','MALE','Nhi tổng quát','1982-05-18',3,'i@hospital.com','0903000001','BS Nhi tổng quát.',NULL,'2025-11-02 08:11:17'),(10,'Tran Thi K','FEMALE','Nhi sơ sinh','1984-02-11',3,'k@hospital.com','0903000002','BS Nhi sơ sinh.',NULL,'2025-11-02 08:11:17'),(11,'Le Van L','MALE','Tim mạch nội','1979-07-09',4,'l@hospital.com','0904000001','BS Tim mạch nội.',NULL,'2025-11-02 08:11:17'),(12,'Pham Thi M','FEMALE','Tim mạch can thiệp','1987-03-25',4,'m@hospital.com','0904000002','BS Tim mạch can thiệp.',NULL,'2025-11-02 08:11:17'),(13,'Nguyen Van N','MALE','Da liễu tổng quát','1981-09-30',5,'n@hospital.com','0905000001','BS Da liễu tổng quát.',NULL,'2025-11-02 08:11:17'),(14,'Tran Thi O','FEMALE','Da liễu thẩm mỹ','1988-04-17',5,'o@hospital.com','0905000002','BS thẩm mỹ da.',NULL,'2025-11-02 08:11:17'),(15,'Le Van P','MALE','Da liễu dị ứng','1983-12-05',5,'p@hospital.com','0905000003','BS dị ứng da.',NULL,'2025-11-02 08:11:17'),(16,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg',NULL),(17,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg',NULL),(18,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 10:38:45'),(19,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:06:43'),(20,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:07:16'),(21,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:09:20'),(22,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:10:04'),(23,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:10:34'),(24,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:17:38'),(25,'Nguyễn Văn A','MALE','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:18:48'),(26,'Nguyễn Văn Bắc','OTHER','Cardiology','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:28:43'),(27,'Tập cận bình','OTHER','Tim mạch','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 15:49:22'),(28,'Tập cận bình','OTHER','Tim mạch','1980-05-15',3,'nguyenvana@hospital.com','+84901234567','Bác sĩ chuyên khoa Tim mạch với hơn 10 năm kinh nghiệm.','https://example.com/images/doctor-123.jpg','2025-11-16 16:21:28');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_day_slot`
--

DROP TABLE IF EXISTS `doctor_day_slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_day_slot` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `start_utc` datetime NOT NULL,
  `end_utc` datetime NOT NULL,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_doc_slot` (`doctor_id`,`start_utc`),
  CONSTRAINT `fk_slot_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `doctor_day_slot_chk_1` CHECK ((`start_utc` < `end_utc`))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_day_slot`
--

LOCK TABLES `doctor_day_slot` WRITE;
/*!40000 ALTER TABLE `doctor_day_slot` DISABLE KEYS */;
INSERT INTO `doctor_day_slot` VALUES (1,1,'2025-11-01 08:00:00','2025-11-01 09:00:00','2025-11-02 08:11:17'),(2,2,'2025-11-01 09:00:00','2025-11-01 10:00:00','2025-11-02 08:11:17'),(3,3,'2025-11-01 10:00:00','2025-11-01 11:00:00','2025-11-02 08:11:17'),(4,4,'2025-11-01 11:00:00','2025-11-01 12:00:00','2025-11-02 08:11:17'),(5,5,'2025-11-01 08:00:00','2025-11-01 09:00:00','2025-11-02 08:11:17');
/*!40000 ALTER TABLE `doctor_day_slot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `identity_number` bigint NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `insurance_number` varchar(50) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(50) DEFAULT NULL,
  `emergency_contact_phone` varchar(30) DEFAULT NULL,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,'Nguyen Anh',123456789001,'MALE','1990-02-20','0916000001','anh@gmail.com',NULL,'Ha Noi',NULL,NULL,'2025-11-02 08:11:17'),(2,'Tran Binh',123456789002,'MALE','1985-05-10','0916000002','binh@gmail.com',NULL,'Hai Phong',NULL,NULL,'2025-11-02 08:11:17'),(3,'Le Chi',123456789003,'FEMALE','1992-03-14','0916000003','chi@gmail.com',NULL,'Nam Dinh',NULL,NULL,'2025-11-02 08:11:17'),(4,'Pham Duong',123456789004,'MALE','2000-07-09','0916000004','duong@gmail.com',NULL,'Thai Binh',NULL,NULL,'2025-11-02 08:11:17'),(5,'Hoang Giang',123456789005,'FEMALE','1998-11-01','0916000005','giang@gmail.com',NULL,'Ha Noi',NULL,NULL,'2025-11-02 08:11:17');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 17:33:45
