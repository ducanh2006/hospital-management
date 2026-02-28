--
-- PostgreSQL database dump
--

\restrict DDPhScUa0c3as2f930PHIyboPiofGs21f5IhjcbTBK4wc7dYi8oGbZnh6afK6DA

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_timestamp_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id integer NOT NULL,
    keycloak_user_id character varying(36) NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(150) DEFAULT NULL::character varying,
    role_id integer
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    patient_id integer NOT NULL,
    department_id integer,
    rating integer,
    "time" timestamp without time zone,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    notes character varying(500) DEFAULT NULL::character varying,
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    test_results text,
    CONSTRAINT chk_rating_only_completed CHECK (((rating IS NULL) OR ((status)::text = 'COMPLETED'::text))),
    CONSTRAINT chk_rating_point CHECK (((rating IS NULL) OR ((rating >= 1) AND (rating <= 5))))
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_id_seq OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_id_seq OWNED BY public.appointment.id;


--
-- Name: department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    head_doctor_id integer,
    phone character varying(30) DEFAULT NULL::character varying,
    description text
);


ALTER TABLE public.department OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.department_id_seq OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.department_id_seq OWNED BY public.department.id;


--
-- Name: doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor (
    id integer NOT NULL,
    profile_id integer NOT NULL,
    specialization character varying(50) DEFAULT NULL::character varying,
    department_id integer,
    bio text,
    experience_year integer,
    picture_id integer
);


ALTER TABLE public.doctor OWNER TO postgres;

--
-- Name: doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_id_seq OWNER TO postgres;

--
-- Name: doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_id_seq OWNED BY public.doctor.id;


--
-- Name: medical_news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_news (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.medical_news OWNER TO postgres;

--
-- Name: medical_news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_news_id_seq OWNER TO postgres;

--
-- Name: medical_news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_news_id_seq OWNED BY public.medical_news.id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    id integer NOT NULL,
    profile_id integer NOT NULL,
    insurance_number character varying(50) DEFAULT NULL::character varying,
    emergency_contact_phone character varying(30) DEFAULT NULL::character varying
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_id_seq OWNER TO postgres;

--
-- Name: patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_id_seq OWNED BY public.patient.id;


--
-- Name: picture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.picture (
    id integer NOT NULL,
    picture_url character varying(500) NOT NULL
);


ALTER TABLE public.picture OWNER TO postgres;

--
-- Name: picture_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.picture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.picture_id_seq OWNER TO postgres;

--
-- Name: picture_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.picture_id_seq OWNED BY public.picture.id;


--
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id integer NOT NULL,
    account_id integer NOT NULL,
    full_name character varying(100) DEFAULT NULL::character varying,
    identity_number character varying(12) DEFAULT NULL::character varying,
    gender character varying(20),
    date_of_birth date,
    address character varying(255) DEFAULT NULL::character varying,
    phone_number character varying(15) DEFAULT NULL::character varying
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- Name: profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_id_seq OWNER TO postgres;

--
-- Name: profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_id_seq OWNED BY public.profile.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_id_seq OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: appointment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment ALTER COLUMN id SET DEFAULT nextval('public.appointment_id_seq'::regclass);


--
-- Name: department id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department ALTER COLUMN id SET DEFAULT nextval('public.department_id_seq'::regclass);


--
-- Name: doctor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor ALTER COLUMN id SET DEFAULT nextval('public.doctor_id_seq'::regclass);


--
-- Name: medical_news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_news ALTER COLUMN id SET DEFAULT nextval('public.medical_news_id_seq'::regclass);


--
-- Name: patient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient ALTER COLUMN id SET DEFAULT nextval('public.patient_id_seq'::regclass);


--
-- Name: picture id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picture ALTER COLUMN id SET DEFAULT nextval('public.picture_id_seq'::regclass);


--
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, keycloak_user_id, username, email, role_id) FROM stdin;
1	9ce9d928-8f8b-4fb9-b932-053d6ed9ed9a	duongducanh06	duongducanh06@gmail.com	1
2	fe1c2929-8e3c-472e-9674-6898382dd99e	duongducanhcnnttcspbkhn@gmail.com	duongducanhcnnttcspbkhn@gmail.com	1
3	c46a9ab0-d1eb-4e60-aa90-81ac62d79644	tadung	nguyentadung02@gmail.com	1
4	b20bfce6-f58c-4add-8cee-2c5a4eed4550	doctor	adfadsf@gmail.com	2
5	09106d39-e953-4f85-80f8-846abbd1132b	admin	admin@gmail.com	3
6	f17e734f-1e52-440a-b678-3790eac67356	top1chuyentinsupham@gmail.com	top1chuyentinsupham@gmail.com	1
7	9a84d48f-475a-405a-9189-855d75081e90	patient	adfasdf@hotmail.com	1
\.


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (id, doctor_id, patient_id, department_id, rating, "time", status, notes, last_update, test_results) FROM stdin;
1	3	1	1	5	2025-11-10 08:00:00	COMPLETED	Khám tốt	2026-02-22 21:33:32	{"blood_pressure": "120/80"}
3	3	4	4	\N	2025-11-15 09:00:00	CONFIRMED	Bác sĩ A đi khám	2026-02-22 21:33:32	\N
4	3	8	4	\N	2026-02-24 08:55:00	COMPLETED	Em sắp xết	2026-02-24 09:19:34	Ngon rồi e ơi
5	3	8	4	\N	2026-02-24 01:18:00	COMPLETED	Em sắp chớt	2026-02-24 09:19:22	Xong rồi em nhé
2	3	2	1	\N	2025-11-14 08:00:00	COMPLETED	Chờ xác nhận	2026-02-27 16:11:00.620112	\N
6	3	8	4	\N	2026-02-27 16:26:00	PENDING	EM bị lứng	2026-02-27 16:23:10.917014	\N
\.


--
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department (id, name, head_doctor_id, phone, description) FROM stdin;
1	Khoa Nội	\N	0123456789	Chuyên điều trị các bệnh nội tổng quát
2	Khoa Ngoại	\N	0987654321	Phẫu thuật và chăm sóc hậu phẫu
3	Khoa Nhi	\N	0905123456	Khám và điều trị cho trẻ em
4	Khoa Tim mạch	\N	0912345678	Chẩn đoán và điều trị bệnh tim
5	Khoa Da liễu	\N	0933221100	Chăm sóc và điều trị các bệnh về da
\.


--
-- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor (id, profile_id, specialization, department_id, bio, experience_year, picture_id) FROM stdin;
3	4	sâdsfsdf	4	KHông có	11	\N
\.


--
-- Data for Name: medical_news; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_news (id, title, content, last_update) FROM stdin;
1	Bộ Y tế xây dựng gói dịch vụ y tế cơ bản	Chủ trương tiến tới miễn viện phí...	2026-02-22 21:33:32
2	WHO khuyến nghị Việt Nam mạnh tay với thuốc lá điện tử	Đại diện WHO tại Việt Nam đề xuất...	2026-02-22 21:33:32
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (id, profile_id, insurance_number, emergency_contact_phone) FROM stdin;
1	1	\N	\N
2	2	\N	\N
3	3	\N	\N
4	4	123	123123
7	5	\N	\N
8	6	adf	11111
\.


--
-- Data for Name: picture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.picture (id, picture_url) FROM stdin;
1	doctor-female-1.png
2	doctor-male-1.png
3	avatar-default.png
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile (id, account_id, full_name, identity_number, gender, date_of_birth, address, phone_number) FROM stdin;
2	2	Tran Binh	123456789002	MALE	1985-05-10	Hai Phong	0916000002
3	3	Le Chi	123456789003	FEMALE	1992-03-14	Nam Dinh	0916000003
4	4	Bác Sĩ	111111111111	MALE	1980-01-15	Bắc từ liêm	123456779
5	5	Admin User	123456789123	OTHER	1990-01-01	Ha Noi	0900000000
6	7	Bệnh Nhân	22222	MALE	\N	Địa chỉ của hồ sơ bệnh nhân.	\N
1	1	Duong Duc Anh	123456789001	FEMALE	1990-02-20	Ha Noi	0916000001
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, role_name, description) FROM stdin;
1	patient	This role is for the client/patient.
2	doctor	This role is for healthcare professionals.
3	admin	Full Access.
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 197, true);


--
-- Name: appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_id_seq', 54, true);


--
-- Name: department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_id_seq', 29, true);


--
-- Name: doctor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_id_seq', 51, true);


--
-- Name: medical_news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_news_id_seq', 82, true);


--
-- Name: patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_id_seq', 132, true);


--
-- Name: picture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.picture_id_seq', 3, true);


--
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 202, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_id_seq', 19, true);


--
-- Name: account account_keycloak_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_keycloak_user_id_key UNIQUE (keycloak_user_id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account account_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: doctor doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_pkey PRIMARY KEY (id);


--
-- Name: doctor doctor_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_profile_id_key UNIQUE (profile_id);


--
-- Name: medical_news medical_news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_news
    ADD CONSTRAINT medical_news_pkey PRIMARY KEY (id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (id);


--
-- Name: patient patient_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_profile_id_key UNIQUE (profile_id);


--
-- Name: picture picture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picture
    ADD CONSTRAINT picture_pkey PRIMARY KEY (id);


--
-- Name: profile profile_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_account_id_key UNIQUE (account_id);


--
-- Name: profile profile_identity_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_identity_number_key UNIQUE (identity_number);


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: role role_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_role_name_key UNIQUE (role_name);


--
-- Name: appointment update_appointment_last_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_appointment_last_update BEFORE UPDATE ON public.appointment FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: medical_news update_medical_news_last_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_medical_news_last_update BEFORE UPDATE ON public.medical_news FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();


--
-- Name: account fk_account_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT fk_account_role FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE SET NULL;


--
-- Name: appointment fk_appt_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk_appt_department FOREIGN KEY (department_id) REFERENCES public.department(id) ON DELETE SET NULL;


--
-- Name: appointment fk_appt_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctor(id) ON DELETE RESTRICT;


--
-- Name: appointment fk_appt_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE RESTRICT;


--
-- Name: department fk_department_head_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT fk_department_head_doctor FOREIGN KEY (head_doctor_id) REFERENCES public.doctor(id) ON DELETE SET NULL;


--
-- Name: doctor fk_doctor_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES public.department(id) ON DELETE SET NULL;


--
-- Name: doctor fk_doctor_picture; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT fk_doctor_picture FOREIGN KEY (picture_id) REFERENCES public.picture(id) ON DELETE SET NULL;


--
-- Name: doctor fk_doctor_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT fk_doctor_profile FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- Name: patient fk_patient_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT fk_patient_profile FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;


--
-- Name: profile fk_profile_account; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT fk_profile_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DDPhScUa0c3as2f930PHIyboPiofGs21f5IhjcbTBK4wc7dYi8oGbZnh6afK6DA

