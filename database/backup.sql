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
  `keycloak_user_id` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `keycloak_user_id` (`keycloak_user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uk_keycloak_user_id` (`keycloak_user_id`),
  KEY `fk_account_role` (`role_id`),
  CONSTRAINT `fk_account_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'9ce9d928-8f8b-4fb9-b932-053d6ed9ed9a','duongducanh06','duongducanh06@gmail.com',1),(2,'fe1c2929-8e3c-472e-9674-6898382dd99e','duongducanhcnnttcspbkhn@gmail.com','duongducanhcnnttcspbkhn@gmail.com',1),(3,'c46a9ab0-d1eb-4e60-aa90-81ac62d79644','tadung','nguyentadung02@gmail.com',1),(4,'b20bfce6-f58c-4add-8cee-2c5a4eed4550','doctor','adfadsf@gmail.com',2),(5,'09106d39-e953-4f85-80f8-846abbd1132b','admin','admin@gmail.com',3),(6,'f17e734f-1e52-440a-b678-3790eac67356','top1chuyentinsupham@gmail.com','top1chuyentinsupham@gmail.com',1),(7,'9a84d48f-475a-405a-9189-855d75081e90','patient','adfasdf@hotmail.com',1);
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
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `notes` varchar(500) DEFAULT NULL,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `test_results` text,
  PRIMARY KEY (`id`),
  KEY `fk_appt_doctor` (`doctor_id`),
  KEY `fk_appt_patient` (`patient_id`),
  KEY `fk_appt_department` (`department_id`),
  CONSTRAINT `fk_appt_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_rating_only_completed` CHECK (((`rating` is null) or (`status` = _utf8mb4'COMPLETED'))),
  CONSTRAINT `chk_rating_point` CHECK (((`rating` is null) or (`rating` between 1 and 5)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,1,1,1,5,'2025-11-10 08:00:00','COMPLETED','Khám tốt','2026-02-22 21:33:32','{\"blood_pressure\": \"120/80\"}'),(2,1,2,1,NULL,'2025-11-14 08:00:00','CONFIRMED','Chờ xác nhận','2026-02-24 00:05:57',NULL),(3,2,4,4,NULL,'2025-11-15 09:00:00','CONFIRMED','Bác sĩ A đi khám','2026-02-22 21:33:32',NULL),(4,3,8,4,NULL,'2026-02-24 08:55:00','COMPLETED','Em sắp xết','2026-02-24 09:19:34','Ngon rồi e ơi'),(5,3,8,4,NULL,'2026-02-24 01:18:00','COMPLETED','Em sắp chớt','2026-02-24 09:19:22','Xong rồi em nhé');
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
  PRIMARY KEY (`id`),
  KEY `fk_department_head_doctor` (`head_doctor_id`),
  CONSTRAINT `fk_department_head_doctor` FOREIGN KEY (`head_doctor_id`) REFERENCES `doctor` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Khoa Nội',NULL,'0123456789','Chuyên điều trị các bệnh nội tổng quát'),(2,'Khoa Ngoại',NULL,'0987654321','Phẫu thuật và chăm sóc hậu phẫu'),(3,'Khoa Nhi',NULL,'0905123456','Khám và điều trị cho trẻ em'),(4,'Khoa Tim mạch',NULL,'0912345678','Chẩn đoán và điều trị bệnh tim'),(5,'Khoa Da liễu',NULL,'0933221100','Chăm sóc và điều trị các bệnh về da');
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
  `profile_id` int NOT NULL,
  `specialization` varchar(50) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `bio` text,
  `experience_year` int DEFAULT NULL,
  `picture_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profile_id` (`profile_id`),
  UNIQUE KEY `uk_doctor_profile_id` (`profile_id`),
  KEY `fk_doctor_department` (`department_id`),
  KEY `fk_doctor_picture` (`picture_id`),
  CONSTRAINT `fk_doctor_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_doctor_picture` FOREIGN KEY (`picture_id`) REFERENCES `picture` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_doctor_profile` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (3,4,'Chưa cập nhật',4,'KHông có',11,NULL);
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_news`
--

DROP TABLE IF EXISTS `medical_news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `last_update` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_news`
--

LOCK TABLES `medical_news` WRITE;
/*!40000 ALTER TABLE `medical_news` DISABLE KEYS */;
INSERT INTO `medical_news` VALUES (1,'Bộ Y tế xây dựng gói dịch vụ y tế cơ bản','Chủ trương tiến tới miễn viện phí...','2026-02-22 21:33:32'),(2,'WHO khuyến nghị Việt Nam mạnh tay với thuốc lá điện tử','Đại diện WHO tại Việt Nam đề xuất...','2026-02-22 21:33:32');
/*!40000 ALTER TABLE `medical_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `insurance_number` varchar(50) DEFAULT NULL,
  `emergency_contact_phone` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profile_id` (`profile_id`),
  UNIQUE KEY `uk_patient_profile_id` (`profile_id`),
  CONSTRAINT `fk_patient_profile` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,1,NULL,NULL),(2,2,NULL,NULL),(3,3,NULL,NULL),(4,4,'123','123123'),(7,5,NULL,NULL),(8,6,NULL,NULL);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `picture`
--

DROP TABLE IF EXISTS `picture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `picture` (
  `id` int NOT NULL AUTO_INCREMENT,
  `picture_url` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `picture`
--

LOCK TABLES `picture` WRITE;
/*!40000 ALTER TABLE `picture` DISABLE KEYS */;
INSERT INTO `picture` VALUES (1,'doctor-female-1.png'),(2,'doctor-male-1.png'),(3,'avatar-default.png');
/*!40000 ALTER TABLE `picture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile`
--

DROP TABLE IF EXISTS `profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `identity_number` varchar(12) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_id` (`account_id`),
  UNIQUE KEY `uk_profile_account_id` (`account_id`),
  UNIQUE KEY `identity_number` (`identity_number`),
  UNIQUE KEY `uk_identity_number` (`identity_number`),
  CONSTRAINT `fk_profile_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile`
--

LOCK TABLES `profile` WRITE;
/*!40000 ALTER TABLE `profile` DISABLE KEYS */;
INSERT INTO `profile` VALUES (1,1,'Duong Duc Anh','123456789001','MALE','1990-02-20','Ha Noi','0916000001'),(2,2,'Tran Binh','123456789002','MALE','1985-05-10','Hai Phong','0916000002'),(3,3,'Le Chi','123456789003','FEMALE','1992-03-14','Nam Dinh','0916000003'),(4,4,'Bác Sĩ','111111111111','MALE','1980-01-15','Bắc từ liêm','123456779'),(5,5,'Admin User','123456789123','OTHER','1990-01-01','Ha Noi','0900000000'),(6,7,'Bệnh Nhân',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'patient','This role is for the client/patient.'),(2,'doctor','This role is for healthcare professionals.'),(3,'admin','Full Access.');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24 10:01:16
