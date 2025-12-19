--location tables: state->division->district->taluka
CREATE TABLE m_state (
    state_code VARCHAR(2) PRIMARY KEY,
    state_name VARCHAR(255) NOT NULL,
    state_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_division (
    division_code VARCHAR(3) PRIMARY KEY,
    state_code VARCHAR(2) NOT NULL,
    division_name VARCHAR(255) NOT NULL,
    division_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (state_code) REFERENCES m_state(state_code)
);


CREATE TABLE m_district (
    district_code VARCHAR(3) PRIMARY KEY,
    division_code VARCHAR(3) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    district_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,m
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code)
);

CREATE TABLE m_taluka (
    taluka_code VARCHAR(4) PRIMARY KEY,
    district_code VARCHAR(3) NOT NULL,
    division_code VARCHAR(3) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    taluka_name VARCHAR(255) NOT NULL,
    taluka_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code)
);


INSERT INTO m_division (division_code, state_code, division_name, division_name_ll)
VALUES 
('01', '27', 'Konkan', 'कोकण'),
('02', '27', 'Pune', 'पुणे'),
('03', '27', 'Nashik', 'नाशिक'),
('04', '27', 'Aurangabad', 'औरंगाबाद'),
('05', '27', 'Amravati', 'अमरावती'),
('06', '27', 'Nagpur', 'नागपूर');

---Onboard entity tables: Organization-->Department-->Services
CREATE TABLE m_organization (
    organization_id VARCHAR(10) PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    organization_name_ll VARCHAR(255) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (state_code) REFERENCES m_state(state_code)
);


CREATE TABLE m_department (
    department_id VARCHAR(10) PRIMARY KEY,
    organization_id VARCHAR(10) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    department_name_ll VARCHAR(255) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code)
);

select  * from m_department

CREATE TABLE m_services (
    service_id VARCHAR(10) PRIMARY KEY,
    organization_id VARCHAR(10) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_name_ll VARCHAR(255) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code)
);

CREATE SEQUENCE IF NOT EXISTS m_organization_id_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS m_department_id_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS m_services_id_seq START 1 INCREMENT 1;

ALTER TABLE m_organization
ALTER COLUMN organization_id
SET DEFAULT ('ORG' || LPAD(nextval('m_organization_id_seq')::TEXT, 3, '0'));

ALTER TABLE m_department
ALTER COLUMN department_id
SET DEFAULT ('DEP' || LPAD(nextval('m_department_id_seq')::TEXT, 3, '0'));

ALTER TABLE m_services
ALTER COLUMN service_id
SET DEFAULT ('SRV' || LPAD(nextval('m_services_id_seq')::TEXT, 3, '0'));

-- ROLE/DESIGNATION tables:
CREATE TABLE m_role (
    role_code VARCHAR(2) PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    role_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

select * from m_role;

CREATE TABLE m_designation (
    designation_code VARCHAR(5) PRIMARY KEY,
    designation_name VARCHAR(255) NOT NULL,
    designation_name_ll VARCHAR(255) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    division_code VARCHAR(3) NOT NULL,
    district_code VARCHAR(3) NOT NULL,
    taluka_code VARCHAR(4) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);


---VISITOR/OFFICER/HELPDESK/ADMIN 
CREATE TABLE user_seq_monthly (
    year_month VARCHAR(7) PRIMARY KEY,  -- Format YYYY-MM
    seq_no INT NOT NULL
);

-- Function to generate user_id
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
DECLARE
    ym VARCHAR(7);
    mon TEXT;
    yr TEXT;
    seq INT;
    formatted_seq TEXT;
BEGIN
    -- Current year-month
    ym := TO_CHAR(NOW(), 'YYYY-MM');

    -- Get existing sequence for this month
    SELECT seq_no INTO seq
    FROM user_seq_monthly
    WHERE year_month = ym;

    -- If no sequence exists, start from 1
    IF NOT FOUND THEN
        seq := 1;
        INSERT INTO user_seq_monthly(year_month, seq_no) VALUES (ym, seq);
    ELSE
        seq := seq + 1;
        UPDATE user_seq_monthly SET seq_no = seq WHERE year_month = ym;
    END IF;

    -- Format month name and year
    mon := TO_CHAR(NOW(), 'MON');  -- JAN, FEB, MAR
    yr := TO_CHAR(NOW(), 'YYYY');
    formatted_seq := LPAD(seq::TEXT, 3, '0');

    RETURN mon || '-' || yr || '-USR-' || formatted_seq;
END;
$$ LANGUAGE plpgsql;

-- Trigger function
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := generate_user_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table
CREATE TABLE m_users (
    user_id VARCHAR(30) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_code VARCHAR(2) NOT NULL REFERENCES m_role(role_code),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

-- Trigger
CREATE TRIGGER trg_set_user_id
BEFORE INSERT ON m_users
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

CREATE TABLE visitor_seq_monthly (
    year_month VARCHAR(7) PRIMARY KEY,   -- Format: YYYY-MM
    seq_no INT NOT NULL
);

CREATE OR REPLACE FUNCTION generate_visitor_id()
RETURNS TEXT AS $$
DECLARE
    ym VARCHAR(7);
    mon TEXT;
    yr TEXT;
    seq INT;
    formatted_seq TEXT;
BEGIN
    -- Current year-month
    ym := TO_CHAR(NOW(), 'YYYY-MM');

    -- Get existing sequence for this month
    SELECT seq_no INTO seq 
    FROM visitor_seq_monthly 
    WHERE year_month = ym
	FOR UPDATE;

    -- If no sequence exists, start from 1
    IF NOT FOUND THEN
        seq := 1;
        INSERT INTO visitor_seq_monthly(year_month, seq_no) 
        VALUES (ym, seq);
    ELSE
        seq := seq + 1;
        UPDATE visitor_seq_monthly 
        SET seq_no = seq 
        WHERE year_month = ym;
    END IF;

    -- Format month name, year, and sequence
    mon := TO_CHAR(NOW(), 'MON');     -- JAN, FEB, MAR
    yr := TO_CHAR(NOW(), 'YYYY');     -- 2025
    formatted_seq := LPAD(seq::TEXT, 3, '0');  -- 001, 002...

    RETURN mon || '-' || yr || '-VIS-' || formatted_seq;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE m_visitors_signup (
    visitor_id VARCHAR(30) PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M','F','O')),
    dob DATE,
    mobile_no VARCHAR(15) UNIQUE,
    email_id VARCHAR(255) UNIQUE,
    state_code VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code VARCHAR(4),
    pincode VARCHAR(10),
    photo VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),
    
    FOREIGN KEY (user_id) REFERENCES m_users(user_id),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);

CREATE OR REPLACE FUNCTION set_visitor_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.visitor_id IS NULL THEN
        NEW.visitor_id := generate_visitor_id();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_visitor_id
BEFORE INSERT ON m_visitors_signup
FOR EACH ROW
EXECUTE FUNCTION set_visitor_id();


CREATE SEQUENCE m_officers_id_seq START 1 INCREMENT 1;

CREATE TABLE m_officers (
    officer_id VARCHAR(20) PRIMARY KEY DEFAULT ('OFF' || LPAD(nextval('m_officers_id_seq')::TEXT, 3, '0')),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(15) UNIQUE,
    email_id VARCHAR(255) UNIQUE,
    designation_code VARCHAR(5),
    department_id VARCHAR(10),
    organization_id VARCHAR(10),
    state_code VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code VARCHAR(4),
    availability_status VARCHAR(50) DEFAULT 'Available',
    photo VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES m_users(user_id),
    FOREIGN KEY (designation_code) REFERENCES m_designation(designation_code),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);



CREATE SEQUENCE m_helpdesk_id_seq START 1 INCREMENT 1;

CREATE TABLE m_helpdesk (
    helpdesk_id VARCHAR(20) PRIMARY KEY DEFAULT ('HLP' || LPAD(nextval('m_helpdesk_id_seq')::TEXT, 3, '0')),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(15) UNIQUE,
    email_id VARCHAR(255) UNIQUE,
	designation_code VARCHAR(5),
    department_id VARCHAR(10),
    organization_id VARCHAR(10),
    state_code VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code VARCHAR(4),
    availability_status VARCHAR(50) DEFAULT 'Available',
    photo VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES m_users(user_id),
	FOREIGN KEY (designation_code) REFERENCES m_designation(designation_code),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);


CREATE SEQUENCE m_admins_id_seq START 1 INCREMENT 1;

CREATE TABLE m_admins (
    admin_id VARCHAR(20) PRIMARY KEY DEFAULT ('ADM' || LPAD(nextval('m_admins_id_seq')::TEXT, 3, '0')),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email_id VARCHAR(255) UNIQUE,
    mobile_no VARCHAR(15) UNIQUE,
	designation_code VARCHAR(5),
    department_id VARCHAR(10),
    organization_id VARCHAR(10),
    state_code VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code VARCHAR(4),
    availability_status VARCHAR(50) DEFAULT 'Available',
    photo VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES m_users(user_id),
	FOREIGN KEY (designation_code) REFERENCES m_designation(designation_code),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);

----
CREATE SEQUENCE appointments_id_seq START 1 INCREMENT 1;

CREATE TABLE appointments (
    appointment_id VARCHAR(20) PRIMARY KEY DEFAULT ('APT' || LPAD(nextval('appointments_id_seq')::TEXT, 5, '0')),
    visitor_id VARCHAR(20) NOT NULL,
    organization_id VARCHAR(10) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    officer_id VARCHAR(20) NOT NULL,
    service_id VARCHAR(20) NOT NULL,
    purpose TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','rescheduled','completed')),
    reschedule_reason TEXT,
    qr_code_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),

    FOREIGN KEY (visitor_id) REFERENCES m_visitors_signup(visitor_id),
    FOREIGN KEY (officer_id) REFERENCES m_officers(officer_id),
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (service_id) REFERENCES m_services(service_id)
);


CREATE SEQUENCE appointment_documents_id_seq START 1 INCREMENT 1;

CREATE TABLE appointment_documents (
    document_id VARCHAR(20) PRIMARY KEY DEFAULT ('DOC' || LPAD(nextval('appointment_documents_id_seq')::TEXT, 5, '0')),
    appointment_id VARCHAR(20) NOT NULL,
    doc_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by VARCHAR(20) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (uploaded_by) REFERENCES m_users(user_id)
);

CREATE SEQUENCE walkins_id_seq START 1 INCREMENT 1;

CREATE TABLE walkins (
    walkin_id VARCHAR(20) PRIMARY KEY DEFAULT ('W' || LPAD(nextval('walkins_id_seq')::TEXT, 5, '0')),
    full_name VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M','F','O')),
    mobile_no VARCHAR(15),
    email_id VARCHAR(255),
    id_proof_type VARCHAR(100),
    id_proof_no VARCHAR(50),
    organization_id VARCHAR(10) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    officer_id VARCHAR(20),
    purpose VARCHAR(500) NOT NULL,
    walkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed','cancelled')),
    remarks VARCHAR(500),
    state_code VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code VARCHAR(4),
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',

    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (officer_id) REFERENCES m_officers(officer_id),
	FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);

CREATE SEQUENCE walkin_tokens_id_seq START 1 INCREMENT 1;

CREATE TABLE walkin_tokens (
    token_id VARCHAR(20) PRIMARY KEY DEFAULT ('T' || LPAD(nextval('walkin_tokens_id_seq')::TEXT, 5, '0')),
    walkin_id VARCHAR(20) NOT NULL,
    token_number VARCHAR(20) NOT NULL,
    issue_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'waiting'  CHECK (status IN ('waiting','in-progress','served','cancelled')),
    called_time TIMESTAMP DEFAULT NULL,
    completed_time TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id)
);

CREATE SEQUENCE checkins_id_seq START 1 INCREMENT 1;

CREATE TABLE checkins (
    checkin_id VARCHAR(20) PRIMARY KEY DEFAULT ('CHK' || LPAD(nextval('checkins_id_seq')::TEXT, 5, '0')),
    visitor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    walkin_id VARCHAR(20),
    checkin_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checkout_time TIMESTAMP DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'checked-in' CHECK (status IN ('checked-in','completed','cancelled')),
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),

    FOREIGN KEY (visitor_id) REFERENCES m_visitors_signup(visitor_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id)
);

CREATE SEQUENCE queue_id_seq START 1 INCREMENT 1;

CREATE TABLE queue (
    queue_id VARCHAR(20) PRIMARY KEY DEFAULT ('QUE' || LPAD(nextval('queue_id_seq')::TEXT, 5, '0')),
    token_number VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    walkin_id VARCHAR(20),
    visitor_id VARCHAR(20) NOT NULL,
    position INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','served','skipped')),
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),

    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id),
    FOREIGN KEY (visitor_id) REFERENCES m_visitors_signup(visitor_id)
);

CREATE SEQUENCE feedback_id_seq START 1 INCREMENT 1;

CREATE TABLE feedback (
    feedback_id VARCHAR(20) PRIMARY KEY DEFAULT ('FDB' || LPAD(nextval('feedback_id_seq')::TEXT, 5, '0')),
    visitor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    walkin_id VARCHAR(20),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),

    FOREIGN KEY (visitor_id) REFERENCES m_visitors_signup(visitor_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id)
);

CREATE SEQUENCE notifications_id_seq START 1 INCREMENT 1;

CREATE TABLE notifications (
    notification_id VARCHAR(20) PRIMARY KEY DEFAULT ('NOT' || LPAD(nextval('notifications_id_seq')::TEXT, 5, '0')),
    username VARCHAR(20) NOT NULL,            -- VIS001 / OFF001 / HLP001 etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',-- e.g. success, warning, info, error
	appointment_id VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES m_users(username),
	FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

ALTER TABLE notifications RENAME user_name to username;

DROP table notifications

select * from m_users

---Functions:
CREATE OR REPLACE FUNCTION get_designations()
RETURNS TABLE(
    designation_code VARCHAR,
    designation_name TEXT
)
LANGUAGE sql
AS $$
  SELECT designation_code, designation_name
  FROM m_designation
  WHERE is_active = TRUE
  ORDER BY designation_name;
$$;

CREATE OR REPLACE FUNCTION public.get_organizations()
RETURNS TABLE(
    organization_id VARCHAR,
    organization_name TEXT
)
LANGUAGE sql
AS $function$
  SELECT 
      organization_id,
      organization_name::TEXT
  FROM 
      m_organization
  WHERE 
      is_active = TRUE
  ORDER BY 
      organization_name;
$function$;

SELECT * FROM get_organizations();


CREATE OR REPLACE FUNCTION public.get_departments(p_organization_id character varying)
RETURNS TABLE(
    department_id character varying,
    department_name character varying
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT d.department_id, d.department_name
  FROM m_department d
  WHERE d.organization_id = p_organization_id
    AND d.is_active = TRUE
  ORDER BY d.department_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_services(
    p_organization_id character varying,
    p_department_id character varying
)
RETURNS TABLE(
    service_id character varying,
    service_name character varying
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT s.service_id, s.service_name
  FROM m_services s
  WHERE s.organization_id = p_organization_id
    AND s.department_id = p_department_id
    AND s.is_active = TRUE
  ORDER BY s.service_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_states()
 RETURNS TABLE(state_code character varying, state_name text)
 LANGUAGE sql
AS $function$
  SELECT state_code, state_name::TEXT
  FROM m_state
  WHERE is_active = TRUE
  ORDER BY state_name;
$function$;

CREATE OR REPLACE FUNCTION public.get_divisions(p_state_code character varying)
 RETURNS TABLE(division_code character varying, division_name character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT d.division_code, d.division_name
  FROM m_division d
  WHERE d.state_code = p_state_code AND d.is_active = TRUE
  ORDER BY d.division_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_districts(p_state_code character varying, p_division_code character varying)
 RETURNS TABLE(district_code character varying, district_name character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT d.district_code, d.district_name
  FROM m_district d
  WHERE d.division_code = p_division_code
    AND d.state_code = p_state_code
    AND d.is_active = TRUE
  ORDER BY d.district_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_talukas(p_state_code character varying, p_division_code character varying, p_district_code character varying)
 RETURNS TABLE(taluka_code character varying, taluka_name character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT t.taluka_code, t.taluka_name
  FROM m_taluka t
  WHERE t.district_code = p_district_code
    AND t.division_code = p_division_code
    AND t.state_code = p_state_code
    AND t.is_active = TRUE
  ORDER BY t.taluka_name;
END;
$function$;

---Function 1:


---Insert Statements:
INSERT INTO m_organization (
    organization_id,
    organization_name,
    organization_name_ll,
    state_code
) VALUES 
('ORG001', 'Organization1', 'संस्था1', '27'),
('ORG002', 'Organization2', 'संस्था2', '27'),
('ORG003', 'Organization3', 'संस्था3', '27');


INSERT INTO m_department (
    department_id,
    organization_id,
    department_name,
    department_name_ll,
    state_code
) VALUES
('DEP001', 'ORG001', 'Department1', 'विभाग1', '27'),
('DEP002', 'ORG002', 'Department2', 'विभाग2', '27'),
('DEP003', 'ORG003', 'Department3', 'विभाग3', '27');

INSERT INTO m_services (
    service_id,
    organization_id,
    department_id,
    service_name,
    service_name_ll,
    state_code
) VALUES
('SER001', 'ORG001', 'DEP001', 'Service1', 'सेवा1', '27'),
('SER002', 'ORG002', 'DEP002', 'Service2', 'सेवा2', '27'),
('SER003', 'ORG003', 'DEP003', 'Service3', 'सेवा3', '27');

INSERT INTO m_role (role_code, role_name, role_name_ll, is_active, insert_ip, insert_by)
VALUES 
('AD', 'Administrator', 'प्रशासक', TRUE, '127.0.0.1', 'system'),
('OF', 'Officer', 'अधिकारी', TRUE, '127.0.0.1', 'system'),
('HD', 'Helpdesk', 'सहायता डेस्क', TRUE, '127.0.0.1', 'system');

ALTER TABLE m_designation ALTER COLUMN taluka_code DROP NOT NULL;
INSERT INTO m_designation (
    designation_code,
    designation_name,
    designation_name_ll,
    state_code,
    division_code,
    district_code,
    taluka_code
)
VALUES
('DES01', 'District Officer', 'जिल्हाधिकारी', '27', '01', '482', NULL),
('DES02', 'Assistant Officer', 'सहाय्यक अधिकारी', '27', '01', '482', NULL),
('DES03', 'Clerk', 'लिपिक', '27', '01', '482', NULL);

----Function 2:
CREATE OR REPLACE FUNCTION get_roles()
RETURNS TABLE (
    role_code VARCHAR,
    role_name VARCHAR,
    role_name_ll VARCHAR,
    is_active BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.role_code, r.role_name, r.role_name_ll, r.is_active
    FROM m_role r
    WHERE r.is_active = TRUE
      AND r.role_name <> 'Visitor'   -- exclude visitor
    ORDER BY r.role_name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION insert_organization_data(
    p_organization_name TEXT,
    p_organization_name_ll TEXT,
    p_state_code TEXT,
    p_departments JSON
)
RETURNS JSON AS
$$
DECLARE
    v_organization_id VARCHAR(10);
    v_department_id VARCHAR(10);
    dept_obj JSON;
    service_obj JSON;
BEGIN
    INSERT INTO m_organization(
        organization_name, organization_name_ll, state_code
    ) VALUES (
        p_organization_name, p_organization_name_ll, p_state_code
    )
    RETURNING organization_id INTO v_organization_id;

    IF p_departments IS NULL OR json_array_length(p_departments) = 0 THEN
        RETURN json_build_object('success', TRUE, 'organization_id', v_organization_id);
    END IF;

    FOR dept_obj IN SELECT * FROM json_array_elements(p_departments)
    LOOP
        INSERT INTO m_department(
            organization_id, department_name, department_name_ll, state_code
        ) VALUES (
            v_organization_id,
            dept_obj->>'dept_name',
            dept_obj->>'dept_name_ll',
            p_state_code
        ) RETURNING department_id INTO v_department_id;

        IF dept_obj->'services' IS NULL
           OR json_typeof(dept_obj->'services') <> 'array'
           OR json_array_length(dept_obj->'services') = 0 THEN
            CONTINUE;
        END IF;

        FOR service_obj IN SELECT * FROM json_array_elements(dept_obj->'services')
        LOOP
            INSERT INTO m_services(
                organization_id, department_id, service_name, service_name_ll, state_code
            ) VALUES (
                v_organization_id,
                v_department_id,
                service_obj->>'name',
                service_obj->>'name_ll',
                p_state_code
            );
        END LOOP;
    END LOOP;

    RETURN json_build_object(
        'success', TRUE,
        'organization_id', v_organization_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_appointment(
    p_visitor_id VARCHAR,
    p_organization_id VARCHAR,
    p_department_id VARCHAR,
    p_officer_id VARCHAR,
    p_service_id VARCHAR,
    p_purpose TEXT,
    p_appointment_date DATE,
    p_slot_time TIME,
    p_insert_by VARCHAR,
    p_insert_ip VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    appointment_id VARCHAR;
    officer_name VARCHAR;
    visitor_username VARCHAR;
BEGIN
    -- 1️⃣ Insert appointment
    INSERT INTO appointments(
        visitor_id,
        organization_id,
        department_id,
        officer_id,
        service_id,
        purpose,
        appointment_date,
        slot_time,
        insert_by,
        insert_ip
    )
    VALUES (
        p_visitor_id,
        p_organization_id,
        p_department_id,
        p_officer_id,
        p_service_id,
        p_purpose,
        p_appointment_date,
        p_slot_time,
        p_insert_by,
        p_insert_ip
    )
    RETURNING appointments.appointment_id INTO appointment_id; -- ✅ table name prefix

    -- 2️⃣ Get officer name for notification
    SELECT full_name INTO officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    -- 3️⃣ Get visitor username for notification
    SELECT u.username INTO visitor_username
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE vs.visitor_id = p_visitor_id;

    -- 4️⃣ Insert notification
    INSERT INTO notifications(
        username,
        appointment_id,
        title,
        message,
        type
    )
    VALUES (
        visitor_username,
        appointment_id,
        'Appointment Created',
        'Your appointment ' || appointment_id || ' is created and pending approval from Officer ' || officer_name,
        'info'
    );

    -- 5️⃣ Return the appointment ID
    RETURN appointment_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_appointment_document(
    p_appointment_id VARCHAR,
    p_doc_type VARCHAR,
    p_file_path VARCHAR,
    p_uploaded_by VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    v_document_id VARCHAR;
BEGIN
    INSERT INTO appointment_documents (
        appointment_id,
        doc_type,
        file_path,
        uploaded_by
    )
    VALUES (
        p_appointment_id,
        p_doc_type,
        p_file_path,
        p_uploaded_by
    )
    RETURNING appointment_documents.document_id INTO v_document_id;

    RETURN v_document_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_officers_same_location(
    p_state_code VARCHAR,
    p_division_code VARCHAR,
    p_district_code VARCHAR,
    p_taluka_code VARCHAR,
    p_organization_id VARCHAR,
    p_department_id VARCHAR
)
RETURNS TABLE (
    officer_id VARCHAR,
    full_name VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.officer_id,
        o.full_name
    FROM m_officers o
    WHERE o.is_active = TRUE
      AND o.state_code = p_state_code
      AND o.division_code = p_division_code
      AND o.district_code = p_district_code
      AND o.taluka_code = p_taluka_code
      AND o.organization_id = p_organization_id
      AND o.department_id = p_department_id
    ORDER BY o.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION insert_department_data(
    p_organization_id TEXT,
    p_state_code TEXT,
    p_departments JSON
)
RETURNS JSON AS
$$
DECLARE
    v_department_id VARCHAR(10);
    dept_obj JSON;
    service_obj JSON;
    v_inserted_departments INT := 0;
    v_inserted_services INT := 0;
BEGIN
    -- 🛑 Validate Organization
    IF NOT EXISTS (SELECT 1 FROM m_organization WHERE organization_id = p_organization_id) THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Organization not found'
        );
    END IF;

    -- 🛑 Validate Department list
    IF p_departments IS NULL OR json_array_length(p_departments) = 0 THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'No departments provided'
        );
    END IF;

    -- ✅ Loop through each department
    FOR dept_obj IN SELECT * FROM json_array_elements(p_departments)
    LOOP
        INSERT INTO m_department (
            organization_id,
            department_name,
            department_name_ll,
            state_code
        ) VALUES (
            p_organization_id,
            dept_obj->>'dept_name',
            dept_obj->>'dept_name_ll',
            p_state_code
        )
        RETURNING department_id INTO v_department_id;

        v_inserted_departments := v_inserted_departments + 1;

        -- ✅ If department has services
        IF dept_obj->'services' IS NOT NULL
           AND json_typeof(dept_obj->'services') = 'array'
           AND json_array_length(dept_obj->'services') > 0 THEN

            FOR service_obj IN SELECT * FROM json_array_elements(dept_obj->'services')
            LOOP
                INSERT INTO m_services (
                    organization_id,
                    department_id,
                    service_name,
                    service_name_ll,
                    state_code
                ) VALUES (
                    p_organization_id,
                    v_department_id,
                    service_obj->>'name',
                    service_obj->>'name_ll',
                    p_state_code
                );
                v_inserted_services := v_inserted_services + 1;
            END LOOP;

        END IF;
    END LOOP;

    RETURN json_build_object(
        'success', TRUE,
        'message', 'Departments and services inserted successfully',
        'organization_id', p_organization_id,
        'departments_added', v_inserted_departments,
        'services_added', v_inserted_services
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Error inserting data: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cancel_appointment(
    p_appointment_id VARCHAR,
    p_cancelled_by VARCHAR DEFAULT 'visitor'
)
RETURNS JSON AS $$
DECLARE
    v_visitor_id VARCHAR;
    v_user_id VARCHAR;
BEGIN
    -- 1️⃣ Update appointment → cancelled
    UPDATE appointments
    SET status = 'cancelled',
        updated_date = NOW(),
        update_by = p_cancelled_by
    WHERE appointment_id = p_appointment_id
    RETURNING visitor_id INTO v_visitor_id;

    -- If no appointment found
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Appointment not found'
        );
    END IF;

    -- 2️⃣ Get user_id (still needed later if required anywhere)
    SELECT user_id INTO v_user_id
    FROM m_visitors_signup
    WHERE visitor_id = v_visitor_id;

    -- 3️⃣ Insert notification using USERNAME (visitor_id)
    INSERT INTO notifications (
        username, 
        title, 
        message, 
        type
    ) VALUES (
        v_visitor_id,
        'Appointment Cancelled',
        'You have cancelled your appointment ' || p_appointment_id,
        'warning'
    );

    -- 4️⃣ Response JSON
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Appointment cancelled and notification recorded'
    );

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_visitor_dashboard_by_username(p_username VARCHAR)
RETURNS JSON AS $$
DECLARE
    appointment_data JSON;
    notification_data JSON;
    visitor_name VARCHAR;
BEGIN
    -- Get visitor full name
    SELECT vs.full_name
    INTO visitor_name
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username
    LIMIT 1;

    -- Fetch appointments
    SELECT json_agg(
        json_build_object(
            'appointment_id', a.appointment_id,
            'organization_name', o.organization_name,
            'department_name', d.department_name,
            'officer_name', off.full_name,
            'service_name', s.service_name,
            'appointment_date', a.appointment_date,
            'slot_time', a.slot_time,
            'status', a.status,
            'purpose', a.purpose
        ) ORDER BY a.insert_date DESC
    )
    INTO appointment_data
    FROM appointments a
    LEFT JOIN m_organization o ON o.organization_id = a.organization_id
    LEFT JOIN m_department d ON d.department_id = a.department_id
    LEFT JOIN m_officers off ON off.officer_id = a.officer_id
    LEFT JOIN m_services s ON s.service_id = a.service_id
    JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username;

    -- Fetch notifications from notifications table
    SELECT json_agg(
    json_build_object(
        'message', n.message,
        'type', n.type,
        'appointment_id', n.appointment_id,
        'created_at', n.created_at
    ) ORDER BY n.created_at DESC
)
INTO notification_data
FROM notifications n
WHERE n.username = p_username;

    -- Return dashboard JSON
    RETURN json_build_object(
        'full_name', COALESCE(visitor_name, ''),
        'appointments', COALESCE(appointment_data, '[]'::json),
        'notifications', COALESCE(notification_data, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_multiple_services(p_services jsonb)
RETURNS jsonb AS $$
DECLARE
    item jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_services)
    LOOP
        INSERT INTO m_services(
            organization_id,
            department_id,
            service_name,
            service_name_ll,
            state_code,
            is_active
        )
        VALUES(
            item->>'organization_id',
            item->>'department_id',
            item->>'service_name',
            item->>'service_name_ll',
            item->>'state_code',
            COALESCE((item->>'is_active')::BOOLEAN, TRUE)
        );
    END LOOP;

    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Services inserted successfully'
    );
END;
$$ LANGUAGE plpgsql;

-------------a-----------

CREATE OR REPLACE FUNCTION register_visitor(
    p_password_hash VARCHAR,
    p_full_name VARCHAR,
    p_gender CHAR(1),
    p_dob DATE,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_state_code VARCHAR DEFAULT NULL,
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_pincode VARCHAR DEFAULT NULL,
    p_photo VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    out_user_id VARCHAR,
    visitor_id VARCHAR,
    full_name VARCHAR,
    out_email_id VARCHAR,
    message VARCHAR
) AS $$
DECLARE
    v_uid VARCHAR(20);
    v_visitor_id VARCHAR(20);
BEGIN
    -- 1️⃣ Validate mobile
    IF EXISTS (SELECT 1 FROM m_visitors_signup v WHERE v.mobile_no = p_mobile_no) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 'Mobile number already registered'::VARCHAR;
        RETURN;
    END IF;

    -- 2️⃣ Validate email
    IF EXISTS (SELECT 1 FROM m_visitors_signup v WHERE v.email_id = p_email_id) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 'Email already registered'::VARCHAR;
        RETURN;
    END IF;

    -- 3️⃣ Insert user
    INSERT INTO m_users (username, password_hash, role_code, insert_by)
    VALUES ('temp_' || p_mobile_no, p_password_hash, 'VS', 'self')
    RETURNING user_id INTO v_uid;

    -- 4️⃣ Insert visitor
   INSERT INTO m_visitors_signup (
    user_id, full_name, gender, dob, mobile_no, email_id,
    state_code, division_code, district_code, taluka_code,
    pincode, photo, insert_by
)
VALUES (
    v_uid, p_full_name, p_gender, p_dob, p_mobile_no, p_email_id,
    p_state_code, p_division_code, p_district_code, p_taluka_code,
    p_pincode, p_photo, 'self'
)
RETURNING m_visitors_signup.visitor_id INTO v_visitor_id;


    -- 5️⃣ Update username
    UPDATE m_users SET username = v_visitor_id WHERE user_id = v_uid;

    -- 6️⃣ Return success (ensure types match)
    RETURN QUERY
    SELECT 
        v_uid::VARCHAR,
        v_visitor_id::VARCHAR,
        p_full_name::VARCHAR,
        p_email_id::VARCHAR,
        'Registration successful'::VARCHAR;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            ('Registration failed: ' || SQLERRM)::VARCHAR;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_by_username2(
    p_login VARCHAR
)
RETURNS TABLE(
    out_user_id VARCHAR,
    out_username VARCHAR,
    out_password_hash VARCHAR,
    out_role_code VARCHAR,
    out_is_active BOOLEAN,
    out_state_code VARCHAR,
    out_division_code VARCHAR,
    out_district_code VARCHAR,
    out_taluka_code VARCHAR
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.username,
        u.password_hash,
        u.role_code,
        u.is_active,
        COALESCE(o.state_code, v.state_code, a.state_code) AS out_state_code,
        COALESCE(o.division_code, v.division_code, a.division_code) AS out_division_code,
        COALESCE(o.district_code, v.district_code, a.district_code) AS out_district_code,
        COALESCE(o.taluka_code, v.taluka_code, a.taluka_code) AS out_taluka_code
    FROM m_users u
    LEFT JOIN m_officers o ON o.user_id = u.user_id
    LEFT JOIN m_visitors_signup v ON v.user_id = u.user_id
    LEFT JOIN m_admins a ON a.user_id = u.user_id
    LEFT JOIN m_helpdesk h ON h.user_id = u.user_id
    WHERE 
        u.username = p_login
        OR v.email_id = p_login
        OR v.mobile_no = p_login
        OR o.email_id = p_login
        OR o.mobile_no = p_login
        OR a.email_id = p_login
        OR a.mobile_no = p_login
        OR h.email_id = p_login
        OR h.mobile_no = p_login;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION register_user_by_role(
    p_password_hash VARCHAR,
    p_full_name VARCHAR,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_designation_code VARCHAR DEFAULT NULL,
    p_department_id VARCHAR DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_state_code VARCHAR DEFAULT NULL,
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_photo VARCHAR DEFAULT NULL,
    p_role_code VARCHAR DEFAULT 'OF'
)
RETURNS TABLE(
    out_user_id VARCHAR,
    out_entity_id VARCHAR,
    full_name VARCHAR,
    out_email_id VARCHAR,
    message VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid VARCHAR(20);
    v_entity_id VARCHAR(20);
BEGIN
    -- 1️⃣ Validate role exists & active
    IF NOT EXISTS (
        SELECT 1 FROM m_role r
        WHERE r.role_code = p_role_code AND r.is_active = TRUE
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Invalid or inactive role code';
        RETURN;
    END IF;

    -- 2️⃣ Check duplicates by role
    IF p_role_code = 'OF' AND EXISTS (
        SELECT 1 FROM m_officers WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Officer mobile/email already registered';
        RETURN;

    ELSIF p_role_code = 'HD' AND EXISTS (
        SELECT 1 FROM m_helpdesk WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Helpdesk mobile/email already registered';
        RETURN;

    ELSIF p_role_code = 'AD' AND EXISTS (
        SELECT 1 FROM m_admins WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Admin mobile/email already registered';
        RETURN;
    END IF;

    -- 3️⃣ Insert into m_users
    INSERT INTO m_users (username, password_hash, role_code, insert_by)
    VALUES ('temp_' || p_mobile_no, p_password_hash, p_role_code, 'system')
    RETURNING user_id INTO v_uid;

    -- 4️⃣ Insert into respective role table
    IF p_role_code = 'OF' THEN
        INSERT INTO m_officers (
            user_id, full_name, mobile_no, email_id,
            designation_code, department_id, organization_id,
            state_code, division_code, district_code, taluka_code,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_mobile_no, p_email_id,
            p_designation_code, p_department_id, p_organization_id,
            p_state_code, p_division_code, p_district_code, p_taluka_code,
            p_photo, 'system'
        )
        RETURNING officer_id INTO v_entity_id;

    ELSIF p_role_code = 'HD' THEN
        INSERT INTO m_helpdesk (
            user_id, full_name, mobile_no, email_id,
            assigned_department, assigned_location, photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_mobile_no, p_email_id,
            p_department_id, p_district_code, p_photo, 'system'
        )
        RETURNING helpdesk_id INTO v_entity_id;

    ELSIF p_role_code = 'AD' THEN
    INSERT INTO m_admins (
        user_id,
        full_name,
        email_id,
        mobile_no,
        state_code,
        division_code,
        district_code,
        taluka_code,
        photo,
        insert_by
    )
    VALUES (
        v_uid,
        p_full_name,
        p_email_id,
        p_mobile_no,
        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code,
        p_photo,
        'system'
    )
    RETURNING admin_id INTO v_entity_id;

    -- 5️⃣ Update username = entity_id
    UPDATE m_users SET username = v_entity_id WHERE user_id = v_uid;

    -- 6️⃣ Return proper success structure
    RETURN QUERY
    SELECT 
        v_uid::VARCHAR,
        v_entity_id::VARCHAR,
        p_full_name::VARCHAR,
        p_email_id::VARCHAR,
        'Registration successful'::VARCHAR;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            ('Registration failed: ' || SQLERRM)::VARCHAR;
END;
$$;

-- working function
CREATE OR REPLACE FUNCTION register_user_by_role(
    p_password_hash VARCHAR,
    p_full_name VARCHAR,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_designation_code VARCHAR DEFAULT NULL,
    p_department_id VARCHAR DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_state_code VARCHAR DEFAULT NULL,
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_photo VARCHAR DEFAULT NULL,
    p_role_code VARCHAR DEFAULT 'OF'
)
RETURNS TABLE(
    out_user_id VARCHAR,
    out_entity_id VARCHAR,
    full_name VARCHAR,
    out_email_id VARCHAR,
    message VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid VARCHAR(20);
    v_entity_id VARCHAR(20);
BEGIN
    -- 1️⃣ Validate role exists & active
    IF NOT EXISTS (
        SELECT 1 FROM m_role r
        WHERE r.role_code = p_role_code AND r.is_active = TRUE
    ) THEN
        RETURN QUERY
        SELECT NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR,
               'Invalid or inactive role code'::VARCHAR;
        RETURN;
    END IF;

    -- 2️⃣ Check duplicates by role
    IF p_role_code = 'OF' AND EXISTS (
        SELECT 1 FROM m_officers WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY
        SELECT NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR,
               'Officer mobile/email already registered'::VARCHAR;
        RETURN;

    ELSIF p_role_code = 'HD' AND EXISTS (
        SELECT 1 FROM m_helpdesk WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY
        SELECT NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR,
               'Helpdesk mobile/email already registered'::VARCHAR;
        RETURN;

    ELSIF p_role_code = 'AD' AND EXISTS (
        SELECT 1 FROM m_admins WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY
        SELECT NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR,
               'Admin mobile/email already registered'::VARCHAR;
        RETURN;
    END IF;

    -- 3️⃣ Insert into m_users
    INSERT INTO m_users (username, password_hash, role_code, insert_by)
    VALUES ('temp_' || p_mobile_no, p_password_hash, p_role_code, 'system')
    RETURNING user_id INTO v_uid;

    -- 4️⃣ Insert into respective role table
    IF p_role_code = 'OF' THEN
        INSERT INTO m_officers (
            user_id, full_name, mobile_no, email_id,
            designation_code, department_id, organization_id,
            state_code, division_code, district_code, taluka_code,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_mobile_no, p_email_id,
            p_designation_code, p_department_id, p_organization_id,
            p_state_code, p_division_code, p_district_code, p_taluka_code,
            p_photo, 'system'
        )
        RETURNING officer_id INTO v_entity_id;

    ELSIF p_role_code = 'HD' THEN
        INSERT INTO m_helpdesk (
            user_id, full_name, mobile_no, email_id,
            assigned_department, assigned_location, photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_mobile_no, p_email_id,
            p_department_id, p_district_code, p_photo, 'system'
        )
        RETURNING helpdesk_id INTO v_entity_id;

    ELSIF p_role_code = 'AD' THEN
        INSERT INTO m_admins (
            user_id, full_name, email_id, mobile_no,
            state_code, division_code, district_code, taluka_code,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_email_id, p_mobile_no,
            p_state_code, p_division_code, p_district_code, p_taluka_code,
            p_photo, 'system'
        )
        RETURNING admin_id INTO v_entity_id;
    END IF;  -- ✅ THIS WAS MISSING

    -- 5️⃣ Update username = entity_id
    UPDATE m_users SET username = v_entity_id WHERE user_id = v_uid;

    -- 6️⃣ Success return
    RETURN QUERY
    SELECT
        v_uid::VARCHAR,
        v_entity_id::VARCHAR,
        p_full_name::VARCHAR,
        p_email_id::VARCHAR,
        'Registration successful'::VARCHAR;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            ('Registration failed: ' || SQLERRM)::VARCHAR;
END;
$$;



ALTER TABLE appointments 
DROP CONSTRAINT appointments_status_check;

ALTER TABLE appointments
ADD CONSTRAINT appointments_status_check
CHECK (
    status IN (
        'pending',
        'approved',
        'rejected',
        'rescheduled',
        'completed',
        'cancelled'
    )
);


---------m (myprofile)-----------------------------------------

CREATE OR REPLACE FUNCTION get_visitor_details_by_id(
    p_visitor_id VARCHAR
)
RETURNS TABLE (
    visitor_id VARCHAR,
    user_id VARCHAR,
    full_name VARCHAR,
    gender CHAR,
    dob DATE,
    mobile_no VARCHAR,
    email_id VARCHAR,
    state_code VARCHAR,
    state_name VARCHAR,
    division_code VARCHAR,
    division_name VARCHAR,
    district_code VARCHAR,
    district_name VARCHAR,
    taluka_code VARCHAR,
    taluka_name VARCHAR,
    pincode VARCHAR,
    photo VARCHAR,
    is_active BOOLEAN,
    insert_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.visitor_id,
        v.user_id,
        v.full_name,
        v.gender,
        v.dob,
        v.mobile_no,
        v.email_id,
        v.state_code,
        s.state_name,
        v.division_code,
        dv.division_name,
        v.district_code,
        d.district_name,
        v.taluka_code,
        t.taluka_name,
        v.pincode,
        v.photo,
        v.is_active,
        v.insert_date
    FROM m_visitors_signup v
    LEFT JOIN m_state s ON s.state_code = v.state_code
    LEFT JOIN m_division dv ON dv.division_code = v.division_code
    LEFT JOIN m_district d ON d.district_code = v.district_code
    LEFT JOIN m_taluka t ON t.taluka_code = v.taluka_code
    WHERE v.visitor_id = p_visitor_id;
END;
$$ LANGUAGE plpgsql;


SELECT * FROM get_visitor_details_by_id('VIS032');
select * from m_visitors_signup;
delete  from m_visitors_signup where email_id='khandagalearadhana@gmail.com';


-- update profile
CREATE OR REPLACE FUNCTION update_visitor_by_id(
    p_visitor_id VARCHAR,
    p_full_name VARCHAR,
    p_gender CHAR,
    p_dob DATE,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_state_code VARCHAR,
    p_division_code VARCHAR,
    p_district_code VARCHAR,
    p_taluka_code VARCHAR,
    p_pincode VARCHAR,
    p_photo VARCHAR
)
RETURNS TABLE (
    visitor_id VARCHAR,
    user_id VARCHAR,
    full_name VARCHAR,
    gender CHAR,
    dob DATE,
    mobile_no VARCHAR,
    email_id VARCHAR,
    state_code VARCHAR,
    state_name VARCHAR,
    division_code VARCHAR,
    division_name VARCHAR,
    district_code VARCHAR,
    district_name VARCHAR,
    taluka_code VARCHAR,
    taluka_name VARCHAR,
    pincode VARCHAR,
    photo VARCHAR,
    is_active BOOLEAN,
    insert_date TIMESTAMP
) AS $$
BEGIN
    UPDATE m_visitors_signup v
    SET
        full_name     = p_full_name,
        gender        = p_gender,
        dob           = p_dob,
        mobile_no     = p_mobile_no,
        email_id      = p_email_id,
        state_code    = p_state_code,
        division_code = p_division_code,
        district_code = p_district_code,
        taluka_code   = p_taluka_code,
        pincode       = p_pincode,
        photo         = p_photo,
        updated_date  = NOW()
    WHERE v.visitor_id = p_visitor_id;

    RETURN QUERY
    SELECT *
    FROM get_visitor_details_by_id(p_visitor_id);
END;
$$ LANGUAGE plpgsql;

SELECT * FROM update_visitor_by_id(
    'VIS019',
    'Mayuri',
    'F',
    '2025-10-17',
    '987654321907',
    'mayuri@gmail.com',
    '27',
    '04',
    '488',
    '4239',
    '233454',
    '1765651173491.jpg'
);


-- change password
CREATE OR REPLACE FUNCTION update_user_password(p_user_id BIGINT, p_new_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE m_users
    SET password_hash = p_new_hash,
        updated_date = NOW()
    WHERE user_id = p_user_id;

    RETURN TRUE;
END;
$$;

SELECT get_visitor_dashboard_by_username('VIS019');
CREATE OR REPLACE FUNCTION get_officer_dashboard_by_username(p_username VARCHAR)
RETURNS JSON AS $$
DECLARE
    appointment_data JSON;
    notification_data JSON;
    officer_name VARCHAR;
BEGIN
    /* Get officer full name */
    SELECT off.full_name
    INTO officer_name
    FROM m_officers off
    JOIN m_users u ON u.user_id = off.user_id
    WHERE u.username = p_username
    LIMIT 1;

    /* Fetch appointments assigned to officer */
    SELECT json_agg(
        json_build_object(
            'appointment_id', a.appointment_id,
            'visitor_name', vs.full_name,
            'organization_name', o.organization_name,
            'department_name', d.department_name,
            'service_name', s.service_name,
            'appointment_date', a.appointment_date,
            'slot_time', a.slot_time,
            'status', a.status,
            'purpose', a.purpose
        )
        ORDER BY a.insert_date DESC
    )
    INTO appointment_data
    FROM appointments a
    LEFT JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    LEFT JOIN m_organization o ON o.organization_id = a.organization_id
    LEFT JOIN m_department d ON d.department_id = a.department_id
    LEFT JOIN m_services s ON s.service_id = a.service_id
    JOIN m_officers off ON off.officer_id = a.officer_id
    JOIN m_users u ON u.user_id = off.user_id
    WHERE u.username = p_username;

    /* Fetch officer notifications */
    SELECT json_agg(
        json_build_object(
            'message', n.message,
            'type', n.type,
            'appointment_id', n.appointment_id,
            'created_at', n.created_at
        )
        ORDER BY n.created_at DESC
    )
    INTO notification_data
    FROM notifications n
    WHERE n.username = p_username;

    /* Return dashboard JSON */
    RETURN json_build_object(
        'full_name', COALESCE(officer_name, ''),
        'appointments', COALESCE(appointment_data, '[]'::json),
        'notifications', COALESCE(notification_data, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql;

SELECT get_officer_dashboard_by_username('OFF005');




CREATE OR REPLACE FUNCTION get_appointments_summary()
RETURNS JSON AS $$
DECLARE
    total_count INT;
    pending_count INT;
    approved_count INT;
    rejected_count INT;
    rescheduled_count INT;
    completed_count INT;
    appointment_list JSON;
BEGIN
    /* Total appointments */
    SELECT COUNT(*) INTO total_count
    FROM appointments
    WHERE is_active = TRUE;

    /* Status-wise counts */
    SELECT COUNT(*) INTO pending_count
    FROM appointments
    WHERE status = 'pending' AND is_active = TRUE;

    SELECT COUNT(*) INTO approved_count
    FROM appointments
    WHERE status = 'approved' AND is_active = TRUE;

    SELECT COUNT(*) INTO rejected_count
    FROM appointments
    WHERE status = 'rejected' AND is_active = TRUE;

    SELECT COUNT(*) INTO rescheduled_count
    FROM appointments
    WHERE status = 'rescheduled' AND is_active = TRUE;

    SELECT COUNT(*) INTO completed_count
    FROM appointments
    WHERE status = 'completed' AND is_active = TRUE;

    /* Appointment details */
    SELECT json_agg(
        json_build_object(
            'appointment_id', a.appointment_id,
            'visitor_id', a.visitor_id,
            'visitor_name', vs.full_name,
            'organization_id', a.organization_id,
            'organization_name', o.organization_name,
            'department_id', a.department_id,
            'department_name', d.department_name,
            'officer_id', a.officer_id,
            'officer_name', off.full_name,
            'service_id', a.service_id,
            'service_name', s.service_name,
            'purpose', a.purpose,
            'appointment_date', a.appointment_date,
            'slot_time', a.slot_time,
            'status', a.status,
            'reschedule_reason', a.reschedule_reason,
            'qr_code_path', a.qr_code_path,
            'insert_date', a.insert_date
        )
        ORDER BY a.insert_date DESC
    )
    INTO appointment_list
    FROM appointments a
    LEFT JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    LEFT JOIN m_organization o ON o.organization_id = a.organization_id
    LEFT JOIN m_department d ON d.department_id = a.department_id
    LEFT JOIN m_officers off ON off.officer_id = a.officer_id
    LEFT JOIN m_services s ON s.service_id = a.service_id
    WHERE a.is_active = TRUE;

    /* Return final JSON */
    RETURN json_build_object(
        'total', total_count,
        'pending', pending_count,
        'approved', approved_count,
        'rejected', rejected_count,
        'rescheduled', rescheduled_count,
        'completed', completed_count,
        'appointments', COALESCE(appointment_list, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql;


SELECT get_appointments_summary();




CREATE OR REPLACE FUNCTION get_roles_summary()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_roles', COUNT(*),
        'roles', json_agg(
            json_build_object(
                'role_code', role_code,
                'role_name', role_name,
                'role_name_ll', role_name_ll,
                'is_active', is_active,
                'insert_date', insert_date,
                'insert_by', insert_by,
                'insert_ip', insert_ip,
                'updated_date', updated_date,
                'update_by', update_by,
                'update_ip', update_ip
            )
            ORDER BY role_name
        )
    )
    INTO result
    FROM m_role;

    RETURN result;
END;
$$;

SELECT get_roles_summary();


CREATE OR REPLACE FUNCTION get_all_organizations()
RETURNS TABLE (
    organization_id        character varying(10),
    organization_name      character varying(255),
    organization_name_ll   character varying(255),
    state_code             character varying(10),
    is_active               boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.organization_id,
        o.organization_name,
        o.organization_name_ll,
        o.state_code,
        o.is_active
    FROM m_organization o
    ORDER BY o.organization_id;
END;
$$;


CREATE OR REPLACE FUNCTION get_departments_by_org(
    p_organization_id character varying
)
RETURNS TABLE (
    department_id        character varying(10),
    department_name      character varying(255),
    department_name_ll   character varying(255),
    organization_id      character varying(10),
    state_code           character varying(10),
    is_active             boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.department_id,
        d.department_name,
        d.department_name_ll,
        d.organization_id,
        d.state_code,
        d.is_active
    FROM m_department d
    WHERE d.organization_id = p_organization_id
    ORDER BY d.department_id;
END;
$$;


CREATE OR REPLACE FUNCTION get_services_by_department(
  p_org_id character varying,
  p_dept_id character varying
)
RETURNS TABLE (
  service_id character varying,
  organization_id character varying,
  department_id character varying,
  service_name character varying,
  service_name_ll character varying,
  state_code character varying,
  is_active boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.service_id,
    s.organization_id,
    s.department_id,
    s.service_name,
    s.service_name_ll,
    s.state_code,
    s.is_active
  FROM m_services s
  WHERE s.organization_id = p_org_id
    AND s.department_id = p_dept_id
  ORDER BY s.service_id;
END;
$$;

SELECT *
FROM get_services_by_department('ORG001', 'DEP001');

select * from m_services


DROP FUNCTION get_all_officers()
CREATE OR REPLACE FUNCTION register_user_by_role(
    p_password_hash VARCHAR,
    p_full_name VARCHAR,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_designation_code VARCHAR DEFAULT NULL,
    p_department_id VARCHAR DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_state_code VARCHAR DEFAULT NULL,
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_photo VARCHAR DEFAULT NULL,
    p_role_code VARCHAR DEFAULT 'OF'
)
RETURNS TABLE(
    out_user_id VARCHAR,
    out_entity_id VARCHAR,
    full_name VARCHAR,
    out_email_id VARCHAR,
    message VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid VARCHAR(20);
    v_entity_id VARCHAR(20);
BEGIN
    -- 1️⃣ Validate role exists & active
    IF NOT EXISTS (
        SELECT 1 FROM m_role r
        WHERE r.role_code = p_role_code AND r.is_active = TRUE
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Invalid or inactive role code';
        RETURN;
    END IF;

    -- 2️⃣ Check duplicates by role
    IF p_role_code = 'OF' AND EXISTS (
        SELECT 1 FROM m_officers WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Officer mobile/email already registered';
        RETURN;

    ELSIF p_role_code = 'HD' AND EXISTS (
        SELECT 1 FROM m_helpdesk WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Helpdesk mobile/email already registered';
        RETURN;

    ELSIF p_role_code = 'AD' AND EXISTS (
        SELECT 1 FROM m_admins WHERE mobile_no = p_mobile_no OR email_id = p_email_id
    ) THEN
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, 'Admin mobile/email already registered';
        RETURN;
    END IF;

    -- 3️⃣ Insert into m_users
    INSERT INTO m_users (username, password_hash, role_code, insert_by)
    VALUES ('temp_' || p_mobile_no, p_password_hash, p_role_code, 'system')
    RETURNING user_id INTO v_uid;

    -- 4️⃣ Insert into respective role table
    IF p_role_code = 'OF' THEN
        INSERT INTO m_officers (
            user_id, full_name, mobile_no, email_id,
            designation_code, department_id, organization_id,
            state_code, division_code, district_code, taluka_code,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_mobile_no, p_email_id,
            p_designation_code, p_department_id, p_organization_id,
            p_state_code, p_division_code, p_district_code, p_taluka_code,
            p_photo, 'system'
        )
        RETURNING officer_id INTO v_entity_id;

    ELSIF p_role_code = 'HD' THEN
        INSERT INTO m_helpdesk (
            user_id, full_name, mobile_no, email_id,
            assigned_department, assigned_location, photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_mobile_no, p_email_id,
            p_department_id, p_district_code, p_photo, 'system'
        )
        RETURNING helpdesk_id INTO v_entity_id;

    ELSIF p_role_code = 'AD' THEN
        INSERT INTO m_admins (
            user_id, full_name, email_id, mobile_no, photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_email_id, p_mobile_no, p_photo, 'system'
        )
        RETURNING admin_id INTO v_entity_id;
    END IF;

    -- 5️⃣ Update username = entity_id
    UPDATE m_users SET username = v_entity_id WHERE user_id = v_uid;

    -- 6️⃣ Return proper success structure
    RETURN QUERY
    SELECT
        v_uid::VARCHAR,
        v_entity_id::VARCHAR,
        p_full_name::VARCHAR,
        p_email_id::VARCHAR,
        'Registration successful'::VARCHAR;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            ('Registration failed: ' || SQLERRM)::VARCHAR;
END;
$$;

select * from m_officers
 
SELECT * FROM get_all_officers();


 CREATE OR REPLACE FUNCTION get_all_officers()
RETURNS TABLE (
    officer_id          character varying,
    user_id             character varying,
    full_name           character varying,
    mobile_no           character varying,
    email_id            character varying,
    role_code           character varying,
    role_name           character varying,
    designation_code    character varying,
    designation_name    character varying,
    organization_id     character varying,
    organization_name   character varying,
    department_id       character varying,
    department_name     character varying,
    state_code          character varying,
    division_code       character varying,
    district_code       character varying,
    taluka_code         character varying,
    photo               character varying,
    is_active            boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.officer_id,
        o.user_id,
        o.full_name,
        o.mobile_no,
        o.email_id,

        u.role_code,
        r.role_name,

        o.designation_code,
        d.designation_name,

        o.organization_id,
        org.organization_name,

        o.department_id,
        dept.department_name,

        o.state_code,
        o.division_code,
        o.district_code,
        o.taluka_code,

        o.photo,
        o.is_active

    FROM m_officers o

    -- ✅ JOIN USERS (THIS WAS MISSING)
    LEFT JOIN m_users u
        ON u.user_id = o.user_id

    -- ✅ JOIN ROLE VIA USERS
    LEFT JOIN m_role r
        ON r.role_code = u.role_code

    LEFT JOIN m_designation d
        ON d.designation_code = o.designation_code

    LEFT JOIN m_organization org
        ON org.organization_id = o.organization_id

    LEFT JOIN m_department dept
        ON dept.department_id = o.department_id

    ORDER BY o.officer_id;
END;
$$;

select * from m_organization;


CREATE OR REPLACE FUNCTION get_appointment_details1(p_appointment_id VARCHAR)
RETURNS TABLE (
    appointment_id VARCHAR,
    visitor_id VARCHAR,
    visitor_name VARCHAR,
    organization_id VARCHAR,
    organization_name VARCHAR,
    department_id VARCHAR,
    department_name VARCHAR,
    officer_id VARCHAR,
    officer_name VARCHAR,
    service_id VARCHAR,
    service_name VARCHAR,
    purpose TEXT,
    appointment_date DATE,
    slot_time TIME,
    status VARCHAR,
    reschedule_reason TEXT,
    qr_code_path VARCHAR
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.appointment_id,
        a.visitor_id,
        vs.full_name AS visitor_name,         -- Visitor name added
        a.organization_id,
        org.organization_name,
        a.department_id,
        dept.department_name,
        a.officer_id,
        off.full_name AS officer_name,
        a.service_id,
        srv.service_name,
        a.purpose,
        a.appointment_date,
        a.slot_time,
        a.status,
        a.reschedule_reason,
        a.qr_code_path
    FROM appointments a
    LEFT JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id   -- join visitor table
    LEFT JOIN m_organization org ON org.organization_id = a.organization_id
    LEFT JOIN m_department dept ON dept.department_id = a.department_id
    LEFT JOIN m_officers off ON off.officer_id = a.officer_id
    LEFT JOIN m_services srv ON srv.service_id = a.service_id
    WHERE a.appointment_id = p_appointment_id
      AND a.is_active = TRUE;
END;
$$;

SELECT * FROM get_appointment_details1('APT010');

CREATE OR REPLACE FUNCTION get_active_departments_count()
RETURNS INTEGER AS $$
DECLARE
    active_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO active_count
    FROM m_department
    WHERE is_active = TRUE;

    RETURN active_count;
END;
$$ LANGUAGE plpgsql;

Select * from get_active_departments_count()

