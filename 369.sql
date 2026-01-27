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

INSERT INTO m_organization (
    organization_id,
    organization_name,
    organization_name_ll,
    state_code
)
VALUES
-- ('ORG007', 'District Collector Office, Amravati', 'जिल्हाधिकारी कार्यालय, अमरावती', '27'),
-- ('ORG008', 'Zilla Parishad, Amravati', 'जिल्हा परिषद, अमरावती', '27'),
('ORG009', 'Pune Municipal Corporation', 'महानगरपालिका', '27'),

('ORG010', 'Public Works Department,Pune', 'सार्वजनिक बांधकाम विभाग', '27'),

('ORG011', 'Regional Transport Office, Pune', 'प्रादेशिक परिवहन कार्यालय', '27'),

('ORG012', 'Maharashtra State Electricity Distribution Company Limited (MSEDCL),Aurangabad', 
 'महाराष्ट्र राज्य विद्युत वितरण कंपनी लिमिटेड', '27'),

('ORG013', 'District Skill Development and Employment Office, Aurangabad', 
 'जिल्हा कौशल्य विकास व रोजगार कार्यालय, अमरावती', '27'),

('ORG014', 'Nagpur Municipal Corporation', 'नागपूर महानगरपालिका', '27'),
('ORG015', 'Nashik Municipal Corporation', 'नाशिक महानगरपालिका', '27'),
('ORG016', 'Mumbai Municipal Corporation', 'मुंबई महानगरपालिका', '27');

UPDATE m_organization
SET division_code = '04',
    district_code = '477',
    taluka_code = '4112'
WHERE organization_id = 'ORG012';



UPDATE m_organization
SET division_code = '02',
    district_code = '480',
    taluka_code = '4292'
WHERE organization_id = 'ORG009';

UPDATE m_organization
SET division_code = '02',
    district_code = '480',
    taluka_code = '4291'
WHERE organization_id = 'ORG010';

UPDATE m_organization
SET division_code = '02',
    district_code = '480',
    taluka_code = '4294'
WHERE organization_id = 'ORG011';



UPDATE m_organization
SET division_code = '02',
    district_code = '515',
    taluka_code = '0001'
WHERE organization_id = 'ORG012';

UPDATE m_organization
SET division_code = '04',
    district_code = '505',
    taluka_code = '0001'
WHERE organization_id = 'ORG014';

UPDATE m_organization
SET division_code = '03',
    district_code = '516',
    taluka_code = '0001'
WHERE organization_id = 'ORG015';

UPDATE m_organization
SET division_code = '06',
    district_code = '514',
    taluka_code = '0001'
WHERE organization_id = 'ORG016';


----------------------------------------
-- get organization function working:

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
select * from get_department_by_id('DEP001')
------




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

-- insert department:
INSERT INTO m_department (
    department_id,
    organization_id,
    department_name,
    department_name_ll,
    state_code
)
VALUES
('DEP007', 'ORG001', 'General Administration', 'सामान्य प्रशासन', '27'),
('DEP008', 'ORG002', 'Revenue Department', 'महसूल विभाग', '27'),
('DEP009', 'ORG003', 'Public Works Department', 'सार्वजनिक बांधकाम विभाग', '27'),
('DEP010', 'ORG005', 'Health Department', 'आरोग्य विभाग', '27'),
('DEP011', 'ORG005', 'Education Department', 'शिक्षण विभाग', '27'),
('DEP012', 'ORG006', 'Women and Child Development', 'महिला व बाल विकास विभाग', '27'),
('DEP013', 'ORG007', 'Rural Development', 'ग्रामीण विकास विभाग', '27'),
('DEP014', 'ORG008', 'Urban Development', 'नगर विकास विभाग', '27'),
('DEP015', 'ORG009', 'Social Welfare', 'सामाजिक कल्याण विभाग', '27'),
('DEP016', 'ORG010', 'Agriculture Department', 'कृषी विभाग', '27'),
('DEP017', 'ORG011', 'Water Resources', 'जलसंपदा विभाग', '27'),
('DEP018', 'ORG012', 'Transport Department', 'परिवहन विभाग', '27'),
('DEP019', 'ORG013', 'Labour Department', 'कामगार विभाग', '27'),
('DEP020', 'ORG014', 'Food and Civil Supplies', 'अन्न व नागरी पुरवठा विभाग', '27'),
('DEP021', 'ORG015', 'Environment Department', 'पर्यावरण विभाग', '27'),
('DEP022', 'ORG016', 'Planning Department', 'नियोजन विभाग', '27');

-- 



	
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

select * from m_services
	
-- insert for services
INSERT INTO m_services (
    service_id,
    organization_id,
    department_id,
    service_name,
    service_name_ll,
    state_code
)
VALUES
('SRV008', 'ORG001', 'DEP007', 'File Processing Service', 'फाईल प्रक्रिया सेवा', '27'),
('SRV009', 'ORG002', 'DEP008', 'Land Record Verification', 'जमीन नोंद पडताळणी', '27'),
('SRV010', 'ORG003', 'DEP009', 'Road Repair Request', 'रस्ता दुरुस्ती विनंती', '27'),
('SRV011', 'ORG005', 'DEP010', 'Health Certificate Issuance', 'आरोग्य प्रमाणपत्र सेवा', '27'),
('SRV012', 'ORG005', 'DEP011', 'School Admission Assistance', 'शाळा प्रवेश सहाय्य', '27'),
('SRV013', 'ORG006', 'DEP012', 'Anganwadi Scheme Registration', 'अंगणवाडी योजना नोंदणी', '27'),
('SRV014', 'ORG007', 'DEP013', 'Rural Housing Application', 'ग्रामीण गृहनिर्माण अर्ज', '27'),
('SRV015', 'ORG008', 'DEP014', 'Property Tax Related Service', 'मालमत्ता कर सेवा', '27'),
('SRV016', 'ORG009', 'DEP015', 'Pension Scheme Application', 'पेन्शन योजना अर्ज', '27'),
('SRV017', 'ORG010', 'DEP016', 'Crop Subsidy Application', 'पीक अनुदान अर्ज', '27'),
('SRV018', 'ORG011', 'DEP017', 'Water Connection Approval', 'पाणी जोडणी मान्यता', '27'),
('SRV019', 'ORG012', 'DEP018', 'Driving License Assistance', 'वाहनचालक परवाना सहाय्य', '27'),
('SRV020', 'ORG013', 'DEP019', 'Labour Registration Service', 'कामगार नोंदणी सेवा', '27'),
('SRV021', 'ORG014', 'DEP020', 'Ration Card Update', 'रेशन कार्ड अद्ययावत सेवा', '27'),
('SRV022', 'ORG015', 'DEP021', 'Environmental Clearance Request', 'पर्यावरण मंजुरी सेवा', '27'),
('SRV023', 'ORG016', 'DEP022', 'Development Planning Approval', 'विकास नियोजन मंजुरी', '27');




-------
	
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

select * from m_helpdesk;
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
select * from  appointments

select * from m_helpdesk;
select * from  m_officers
drop table m_helpdesk;
	
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

INSERT INTO m_helpdesk (
    user_id,
    full_name,
    mobile_no,
    email_id,
    
    assigned_department,
    assigned_location,
    state_code,
    division_code,
    district_code,
    taluka_code,
    availability_status,
    insert_by
)
VALUES
-- Amravati
( 'Amravati Helpdesk Officer', '9000000001', 'amravati.helpdesk@gov.in',
  'DEP001', , '27', '05', NULL, NULL, 'Available', 'system'),

-- Aurangabad
('USR_HLP_02', 'Aurangabad Helpdesk Officer', '9000000002', 'aurangabad.helpdesk@gov.in',
  NULL, NULL, '27', '04', NULL, NULL, 'Available', 'system'),

-- Konkan
('USR_HLP_03', 'Konkan Helpdesk Officer', '9000000003', 'konkan.helpdesk@gov.in',
 NULL, NULL, '27', '01', NULL, NULL, 'Available', 'system'),

-- Nagpur
('USR_HLP_04', 'Nagpur Helpdesk Officer', '9000000004', 'nagpur.helpdesk@gov.in',
  NULL, NULL, '27', '06', NULL, NULL, 'Available', 'system'),

-- Nashik
('USR_HLP_05', 'Nashik Helpdesk Officer', '9000000005', 'nashik.helpdesk@gov.in', NULL, NULL, '27', '03', NULL, NULL, 'Available', 'system'),

-- Pune
('USR_HLP_06', 'Pune Helpdesk Officer', '9000000006', 'pune.helpdesk@gov.in',
  NULL, NULL, '27', '02', NULL, NULL, 'Available', 'system');

select * from m_helpdesk

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
select * from appointments;

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
select * from appointments;

ALTER TABLE appointments
ALTER COLUMN department_id DROP NOT NULL;


ALTER TABLE appointments
ALTER COLUMN department_id SET DEFAULT NULL;


ALTER TABLE walkins
ALTER COLUMN department_id DROP NOT NULL;


ALTER TABLE walkins
ALTER COLUMN department_id SET DEFAULT NULL;



SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;


SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'm_helpdesk'
ORDER BY ordinal_position;


SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'walkins'
ORDER BY ordinal_position;


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
drop table walkins;

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


select * from walkins;

-- optional: create a staff view/table combining both
CREATE VIEW m_staff AS
SELECT officer_id AS staff_id, full_name FROM m_officers
UNION
SELECT helpdesk_id AS staff_id, full_name FROM m_helpdesk;

CREATE TABLE m_staff (
    staff_id VARCHAR PRIMARY KEY,
    full_name VARCHAR NOT NULL
);

-- Populate it from existing officers & helpdesk
INSERT INTO m_staff(staff_id, full_name)
SELECT officer_id, full_name FROM m_officers
UNION
SELECT helpdesk_id, full_name FROM m_helpdesk;

ALTER TABLE walkins
ADD CONSTRAINT walkins_officer_id_fkey FOREIGN KEY (officer_id)
REFERENCES m_staff(staff_id);


-- then officer_id FK points to m_staff.staff_id
ALTER TABLE walkins
DROP CONSTRAINT walkins_officer_id_fkey;

ALTER TABLE walkins
ADD CONSTRAINT walkins_officer_id_fkey FOREIGN KEY (officer_id)
REFERENCES m_staff(staff_id);



ALTER TABLE walkins
ADD COLUMN slot_time TIME NOT NULL DEFAULT '00:00';

ALTER TABLE walkins
ADD COLUMN service_id VARCHAR(10) NOT NULL;

ALTER TABLE walkins
ADD CONSTRAINT fk_walkins_service
FOREIGN KEY (service_id)
REFERENCES m_services(service_id);

ALTER TABLE walkins
ADD COLUMN visitor_id VARCHAR(20);

ALTER TABLE walkins
ADD CONSTRAINT fk_walkins_visitor
FOREIGN KEY (visitor_id)
REFERENCES m_visitors_signup(visitor_id)
ON DELETE SET NULL;

ALTER TABLE walkins
ADD COLUMN helpdesk_id VARCHAR;

ALTER TABLE walkins
ADD CONSTRAINT walkins_helpdesk_id_fkey
FOREIGN KEY (helpdesk_id)
REFERENCES m_helpdesk(helpdesk_id);


ALTER TABLE walkins
DROP COLUMN id_proof_type,
DROP COLUMN id_proof_no;





select * from walkins;
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
select * from notifications

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
ALTER TABLE notifications
DROP CONSTRAINT notifications_appointment_id_fkey;

ALTER TABLE notifications
ADD COLUMN source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('APPOINTMENT','WALKIN'));

ALTER TABLE notifications
ADD COLUMN walkin_id VARCHAR(20);

ALTER TABLE notifications
ADD CONSTRAINT notifications_appointment_fkey
FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id);

ALTER TABLE notifications
ADD CONSTRAINT notifications_walkin_fkey
FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id);



ALTER TABLE notifications RENAME user_name to username;

DROP table notifications

select * from appointments

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

select * from appointments 

--main:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION insert_appointment(
    /* 🔗 Mandatory references */
    p_visitor_id VARCHAR,
    p_organization_id VARCHAR,
    p_officer_id VARCHAR,
    p_service_id VARCHAR,
    p_purpose TEXT,
    p_appointment_date DATE,
    p_slot_time TIME,

    /* 📍 Location (state mandatory) */
    p_state_code VARCHAR,

    /* 🔽 OPTIONAL PARAMETERS (DEFAULT NULL) */
    p_department_id VARCHAR DEFAULT NULL,
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_insert_by VARCHAR DEFAULT NULL,
    p_insert_ip VARCHAR DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_appointment_id VARCHAR;
    v_officer_name VARCHAR;
    v_visitor_username VARCHAR;
    v_qr_token VARCHAR;
    v_qr_url TEXT;
BEGIN
    /* 🔐 Generate QR token */
    v_qr_token := encode(gen_random_bytes(16), 'hex');

    /* 1️⃣ Insert appointment */
    INSERT INTO appointments(
        visitor_id,
        organization_id,
        department_id,
        officer_id,
        service_id,
        purpose,
        appointment_date,
        slot_time,
        state_code,
        division_code,
        district_code,
        taluka_code,
        insert_by,
        insert_ip
    )
    VALUES (
        p_visitor_id,
        p_organization_id,
        p_department_id,   -- ✅ now optional
        p_officer_id,
        p_service_id,
        p_purpose,
        p_appointment_date,
        p_slot_time,
        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code,
        p_insert_by,
        p_insert_ip
    )
    RETURNING appointment_id INTO v_appointment_id;

    /* 2️⃣ Build QR URL */
    v_qr_url :=
        'http://localhost:3000/qr-checkin/' ||
        v_appointment_id ||
        '?token=' ||
        v_qr_token;

    /* 3️⃣ Update QR path */
    UPDATE appointments
    SET qr_code_path = v_qr_url
    WHERE appointment_id = v_appointment_id;

    /* 4️⃣ Officer name */
    SELECT full_name
    INTO v_officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    IF v_officer_name IS NULL THEN
        SELECT full_name
        INTO v_officer_name
        FROM m_helpdesk
        WHERE helpdesk_id = p_officer_id;
    END IF;

    /* 5️⃣ Visitor username */
    SELECT u.username
    INTO v_visitor_username
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE vs.visitor_id = p_visitor_id;

    /* 6️⃣ Notification */
    INSERT INTO notifications(
        username,
        appointment_id,
        title,
        message,
        type
    )
    VALUES (
        v_visitor_username,
        v_appointment_id,
        'Appointment Created',
        'Your appointment ' || v_appointment_id ||
        ' is created and pending approval from ' || COALESCE(v_officer_name, 'officer'),
        'info'
    );

    RETURN v_appointment_id;
END;
$$;


-- 
select * from m_officers;

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

select * from get_officers_same_location('27', '01', 'ORG002', '482', null, 'DEP002')
select * from m_officers
-- newwwwwwwwww get officers by organization:
CREATE OR REPLACE FUNCTION get_officers_same_location(
    p_state_code VARCHAR,
    p_division_code VARCHAR,
    p_organization_id VARCHAR,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_department_id VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    officer_id VARCHAR,
    full_name VARCHAR,
    officer_type VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY

    -- 🔹 Regular Officers
    SELECT 
        o.officer_id,
        o.full_name,
        CAST('OFFICER' AS VARCHAR) AS officer_type
    FROM m_officers o
    WHERE o.is_active = TRUE
      AND o.state_code = p_state_code
      AND o.division_code = p_division_code
      AND o.organization_id = p_organization_id
      AND (p_district_code IS NULL OR o.district_code = p_district_code)
      AND (p_taluka_code IS NULL OR o.taluka_code = p_taluka_code)
      AND (p_department_id IS NULL OR o.department_id = p_department_id)

    UNION ALL

    -- 🔹 Helpdesk Officers
    SELECT
        h.helpdesk_id AS officer_id,
        h.full_name,
        CAST('HELPDESK' AS VARCHAR) AS officer_type
    FROM m_helpdesk h
    WHERE h.is_active = TRUE
      AND h.state_code = p_state_code
      AND h.division_code = p_division_code
      AND h.organization_id = p_organization_id
      AND (p_district_code IS NULL OR h.district_code = p_district_code)
      AND (p_taluka_code IS NULL OR h.taluka_code = p_taluka_code)
      AND (p_department_id IS NULL OR h.department_id = p_department_id)

    ORDER BY full_name;
END;
$$;
-- 

-- 
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



------vistors data
CREATE OR REPLACE FUNCTION get_visitor_dashboard_by_username(p_username VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    appointment_data JSON;
    notification_data JSON;
    visitor_name VARCHAR;
BEGIN
    -- 1️⃣ Get visitor full name
    SELECT vs.full_name
    INTO visitor_name
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username
    LIMIT 1;

    -- 2️⃣ Fetch appointments (OFFICER + HELPDESK SAFE)
    SELECT json_agg(
        json_build_object(
            'appointment_id', a.appointment_id,
            'organization_name', o.organization_name,
            'department_name', d.department_name,

            -- ✅ Unified officer/helpdesk name
            'officer_name',
            (
                SELECT x.full_name
                FROM (
                    SELECT o2.officer_id AS staff_id, o2.full_name
                    FROM m_officers o2
                    UNION ALL
                    SELECT h.helpdesk_id AS staff_id, h.full_name
                    FROM m_helpdesk h
                ) x
                WHERE x.staff_id = a.officer_id
                LIMIT 1
            ),

            'service_name', s.service_name,
            'appointment_date', TO_CHAR(a.appointment_date, 'DD-MM-YYYY'),
            'slot_time', TO_CHAR(a.slot_time, 'HH12:MI AM'),
            'status', a.status,
            'purpose', a.purpose
        )
        ORDER BY a.insert_date DESC
    )
    INTO appointment_data
    FROM appointments a
    LEFT JOIN m_organization o ON o.organization_id = a.organization_id
    LEFT JOIN m_department d ON d.department_id = a.department_id
    LEFT JOIN m_services s ON s.service_id = a.service_id
    JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username;

    -- 3️⃣ Fetch notifications
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

    -- 4️⃣ Return dashboard JSON
    RETURN json_build_object(
        'full_name', COALESCE(visitor_name, ''),
        'appointments', COALESCE(appointment_data, '[]'::json),
        'notifications', COALESCE(notification_data, '[]'::json)
    );
END;
$$;

SELECT get_visitor_dashboard_by_username('VIS019');


------------
CREATE OR REPLACE FUNCTION insert_multiple_services(p_services jsonb)
RETURNS jsonb AS $$
DECLARE
    item jsonb;
    v_state_code VARCHAR(2);
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_services)
    LOOP
        -- 🔐 Fetch state_code from organization
        SELECT state_code
        INTO v_state_code
        FROM m_organization
        WHERE organization_id = item->>'organization_id';

        IF v_state_code IS NULL THEN
            RETURN jsonb_build_object(
                'status', 'error',
                'message', 'Invalid organization_id: ' || item->>'organization_id'
            );
        END IF;

        INSERT INTO m_services (
            organization_id,
            department_id,
            service_name,
            service_name_ll,
            state_code,
            is_active
        )
        VALUES (
            item->>'organization_id',
            item->>'department_id',
            item->>'service_name',
            item->>'service_name_ll',
            v_state_code,
            COALESCE((item->>'is_active')::BOOLEAN, TRUE)
        );
    END LOOP;

    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Services inserted successfully'
    );
END;
$$ LANGUAGE plpgsql;


---------------
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
select * from m_services

-- 
CREATE OR REPLACE FUNCTION update_multiple_services(p_services jsonb)
RETURNS jsonb AS $$
DECLARE
    item jsonb;
    v_updated INT := 0;
BEGIN
    IF p_services IS NULL OR jsonb_array_length(p_services) = 0 THEN
        RETURN jsonb_build_object(
            'status', 'failed',
            'message', 'No services provided'
        );
    END IF;

    FOR item IN SELECT * FROM jsonb_array_elements(p_services)
    LOOP
        UPDATE m_services
        SET
            service_name     = item->>'service_name',
            service_name_ll  = item->>'service_name_ll',
            is_active        = COALESCE((item->>'is_active')::BOOLEAN, is_active),
            updated_date     = NOW()
        WHERE service_id = item->>'service_id';

        IF FOUND THEN
            v_updated := v_updated + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'status', 'success',
        'services_updated', v_updated
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

select * from m_users

CREATE OR REPLACE FUNCTION register_visitor_walkin(
    p_password_hash VARCHAR,
    p_full_name VARCHAR,
    p_gender CHAR(1),
    p_dob DATE,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR DEFAULT NULL,
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
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid VARCHAR(20);
    v_visitor_id VARCHAR(20);
BEGIN
    /* 1️⃣ Mobile validation */
    IF EXISTS (
        SELECT 1 FROM m_visitors_signup
        WHERE mobile_no = p_mobile_no
    ) THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            'Mobile number already registered'::VARCHAR;
        RETURN;
    END IF;

    /* 2️⃣ Email validation only if provided */
    IF p_email_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM m_visitors_signup
        WHERE email_id = p_email_id
    ) THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            'Email already registered'::VARCHAR;
        RETURN;
    END IF;

    /* 3️⃣ Insert user */
    INSERT INTO m_users (
        username,
        password_hash,
        role_code,
        insert_by,
        is_first_login
    )
    VALUES (
        'temp_' || p_mobile_no,
        p_password_hash,
        'VS',
        'self',
        TRUE
    )
    RETURNING user_id INTO v_uid;

    /* 4️⃣ Insert visitor (FIXED) */
    INSERT INTO m_visitors_signup (
        user_id,
        full_name,
        gender,
        dob,
        mobile_no,
        email_id,
        state_code,
        division_code,
        district_code,
        taluka_code,
        pincode,
        photo,
        insert_by
    )
    VALUES (
        v_uid,
        p_full_name,
        p_gender,
        p_dob,
        p_mobile_no,
        p_email_id,
        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code,
        p_pincode,
        p_photo,
        'self'
    )
    RETURNING m_visitors_signup.visitor_id INTO v_visitor_id;

    /* 5️⃣ Update username */
    UPDATE m_users
    SET username = v_visitor_id
    WHERE user_id = v_uid;

    /* 6️⃣ Success */
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
$$;




select * from walkins;

select * from m_users;

select * from m_visitors_signup;


select * from m_officers;
select * from get_user_by_usernameHelpdesk('HLP003')
-- helpdesk login function:
CREATE OR REPLACE FUNCTION get_user_by_usernameHelpdesk(
    p_login VARCHAR
)
RETURNS TABLE(
    out_user_id VARCHAR,
    out_username VARCHAR,
    out_password_hash VARCHAR,
    out_role_code VARCHAR,
    out_is_active BOOLEAN,
    out_organization_id VARCHAR,
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

        -- organization_id (admins removed)
        COALESCE(
            o.organization_id,
            h.organization_id
        ) AS out_organization_id,

        -- location hierarchy (admins removed)
        COALESCE(o.state_code, v.state_code, h.state_code) AS out_state_code,
        COALESCE(o.division_code, v.division_code, h.division_code) AS out_division_code,
        COALESCE(o.district_code, v.district_code, h.district_code) AS out_district_code,
        COALESCE(o.taluka_code, v.taluka_code, h.taluka_code) AS out_taluka_code

    FROM m_users u
    LEFT JOIN m_officers o        ON o.user_id = u.user_id
    LEFT JOIN m_visitors_signup v ON v.user_id = u.user_id
    LEFT JOIN m_helpdesk h        ON h.user_id = u.user_id

    WHERE 
        u.username = p_login
        OR v.email_id = p_login
        OR v.mobile_no = p_login
        OR o.email_id = p_login
        OR o.mobile_no = p_login
        OR h.email_id = p_login
        OR h.mobile_no = p_login;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION get_user_by_username2(character varying)

select * from get_user_by_username2('khandagalearadhana@gmail.com')

	
	
-- 
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
        COALESCE(o.state_code, v.state_code, a.state_code,h.state_code) AS out_state_code,
        COALESCE(o.division_code, v.division_code, a.division_code,h.division_code) AS out_division_code,
        COALESCE(o.district_code, v.district_code, a.district_code,h.district_code) AS out_district_code,
        COALESCE(o.taluka_code, v.taluka_code, a.taluka_code,h.taluka_code) AS out_taluka_code
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
-- 
select * from m_users

CREATE OR REPLACE FUNCTION get_user_by_username2(
    p_login VARCHAR
)
RETURNS TABLE(
    out_user_id VARCHAR,
    out_username VARCHAR,
    out_password_hash VARCHAR,
    out_role_code VARCHAR,
    out_is_active BOOLEAN,
    out_is_first_login BOOLEAN,       -- ✅ ADD THIS
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
        COALESCE(u.is_first_login, false) AS out_is_first_login,  -- ✅ ADD THIS
        COALESCE(o.state_code, v.state_code, a.state_code, h.state_code),
        COALESCE(o.division_code, v.division_code, a.division_code, h.division_code),
        COALESCE(o.district_code, v.district_code, a.district_code, h.district_code),
        COALESCE(o.taluka_code, v.taluka_code, a.taluka_code, h.taluka_code)
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


SELECT * FROM get_user_by_username2('khandagalearadhana@gmail.com');

select * from m_users





select * from m_visitors_signup


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
ALTER TABLE appointments
ALTER COLUMN district_code TYPE VARCHAR(1);



ALTER TABLE appointments
ADD COLUMN state_code VARCHAR(2) DEFAULT '27',
ADD COLUMN division_code VARCHAR(2) DEFAULT '01',
ADD COLUMN district_code VARCHAR(4) DEFAULT NULL,
ADD COLUMN taluka_code VARCHAR(4) DEFAULT NULL;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_state
FOREIGN KEY (state_code)
REFERENCES m_state(state_code);

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_division
FOREIGN KEY (division_code)
REFERENCES m_division(division_code);

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_district
FOREIGN KEY (district_code)
REFERENCES m_district(district_code);

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_taluka
FOREIGN KEY (taluka_code)
REFERENCES m_taluka(taluka_code);

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;



SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY column_name;

ALTER TABLE appointments
ALTER COLUMN taluka_code TYPE VARCHAR(5);

select * from appointments

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
select * from m_visitors_signup
select * from m_users
select change_user_password('JAN-2026-USR-011','Aaru@369')
CREATE OR REPLACE FUNCTION change_user_password(
    p_user_id VARCHAR,
    p_new_password_hash VARCHAR
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update password + reset first-login flag
    UPDATE m_users
    SET password_hash = p_new_password_hash,
        is_first_login = FALSE,
        updated_date = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    -- Check if user existed
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT FALSE, 'User not found';
        RETURN;
    END IF;

    RETURN QUERY
    SELECT TRUE, 'Password changed successfully';
END;
$$;

-- change password
CREATE OR REPLACE FUNCTION change_user_password(
    p_user_id VARCHAR,
    p_old_password_hash VARCHAR,
    p_new_password_hash VARCHAR
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if old password matches
    IF NOT EXISTS (
        SELECT 1
        FROM m_users
        WHERE user_id = p_user_id
          AND password_hash = p_old_password_hash
    ) THEN
        RETURN QUERY
        SELECT FALSE, 'Old password is incorrect';
        RETURN;
    END IF;

    -- Update password
    UPDATE m_users
    SET password_hash = p_new_password_hash,
        updated_date = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    RETURN QUERY
    SELECT TRUE, 'Password changed successfully';
END;
$$;

select * from m_users

-- work
CREATE OR REPLACE FUNCTION change_user_password(
    p_user_id VARCHAR,
    p_new_password_hash VARCHAR
)
RETURNS TABLE(success BOOLEAN, message TEXT, is_first_login BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update first-login flag
    UPDATE m_users
    SET is_first_login = FALSE,
        updated_date = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    -- Update password
    UPDATE m_users
    SET password_hash = p_new_password_hash,
        updated_date = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT FALSE, 'User not found', NULL;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT TRUE,
           'Password changed successfully',
           u.is_first_login   -- ✅ QUALIFIED
    FROM m_users u
    WHERE u.user_id = p_user_id;
END;
$$;


select * from m_users

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'm_users'
AND column_name = 'is_first_login';

SELECT user_id, is_first_login
FROM m_users
WHERE user_id = 'JAN-2026-USR-012';

UPDATE m_users
SET is_first_login = FALSE
WHERE user_id = 'JAN-2026-USR-012'
RETURNING user_id, is_first_login;

SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'm_users'::regclass
AND NOT tgisinternal;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'm_users'
AND column_name = 'is_first_login';
UPDATE m_users
SET is_first_login = FALSE
WHERE user_id = 'YOUR_USER_ID'
RETURNING user_id, is_first_login;


SELECT user_id
FROM m_users
WHERE user_id = 'JAN-2026-USR-012';


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
-- 


drop function get_appointments_summary(INT,INT,INT,INT,INT,INT,JSON);
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

DROP FUNCTION get_appointment_details1(character varying)
--------
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
    cancelled_reason TEXT,
    qr_code_path VARCHAR
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY

    /* =======================
       NORMAL APPOINTMENTS
    ======================== */
    SELECT
        a.appointment_id,
        a.visitor_id,
        vs.full_name AS visitor_name,
        a.organization_id,
        org.organization_name,
        a.department_id,
        dept.department_name,
        a.officer_id,

        (
            SELECT x.full_name
            FROM (
                SELECT o.officer_id AS staff_id, o.full_name
                FROM m_officers o
                UNION ALL
                SELECT h.helpdesk_id AS staff_id, h.full_name
                FROM m_helpdesk h
            ) x
            WHERE x.staff_id = a.officer_id
            LIMIT 1
        ) AS officer_name,

        a.service_id,
        srv.service_name,
        a.purpose,
        a.appointment_date,
        a.slot_time,
        a.status,
        a.reschedule_reason,
        a.cancelled_reason,
        a.qr_code_path
    FROM appointments a
    LEFT JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    LEFT JOIN m_organization org ON org.organization_id = a.organization_id
    LEFT JOIN m_department dept ON dept.department_id = a.department_id
    LEFT JOIN m_services srv ON srv.service_id = a.service_id
    WHERE a.appointment_id = p_appointment_id
      AND a.is_active = TRUE

    UNION ALL

    /* =======================
       WALK-IN APPOINTMENTS
    ======================== */
    SELECT
        w.walkin_id AS appointment_id,
        w.visitor_id,
        vs.full_name AS visitor_name,
        w.organization_id,
        org.organization_name,
        w.department_id,
        dept.department_name,
        w.officer_id,

        (
            SELECT x.full_name
            FROM (
                SELECT o.officer_id AS staff_id, o.full_name
                FROM m_officers o
                UNION ALL
                SELECT h.helpdesk_id AS staff_id, h.full_name
                FROM m_helpdesk h
            ) x
            WHERE x.staff_id = w.officer_id
            LIMIT 1
        ) AS officer_name,

        w.service_id,
        srv.service_name,
        w.purpose,
        w.walkin_date AS appointment_date,
        w.slot_time,
        w.status,
        w.reschedule_reason,
        NULL::TEXT AS cancelled_reason,   -- ✅ not in walkins
        NULL::VARCHAR AS qr_code_path     -- ✅ not in walkins
    FROM walkins w
    LEFT JOIN m_visitors_signup vs ON vs.visitor_id = w.visitor_id
    LEFT JOIN m_organization org ON org.organization_id = w.organization_id
    LEFT JOIN m_department dept ON dept.department_id = w.department_id
    LEFT JOIN m_services srv ON srv.service_id = w.service_id
    WHERE w.walkin_id = p_appointment_id
      AND w.is_active = TRUE;

END;
$$;

select * from walkins
ALTER TABLE walkins
	ADD COLUMN updated_date TIMESTAMP DEFAULT NULL;
------
select * from appointments
SELECT * FROM get_appointment_details1('W00053');

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

--alter for VIS id: 
ALTER TABLE m_users
ALTER COLUMN user_id DROP DEFAULT;


ALTER TABLE m_visitors_signup
ALTER COLUMN visitor_id DROP DEFAULT;


DROP SEQUENCE IF EXISTS m_users_user_id_seq;
DROP SEQUENCE IF EXISTS m_visitors_signup_id_seq;


CREATE TABLE user_seq_monthly ( year_month VARCHAR(7) PRIMARY KEY, -- Format YYYY-MM 
	seq_no INT NOT NULL );  
CREATE TABLE visitor_seq_monthly ( year_month VARCHAR(7) PRIMARY KEY, -- Format: YYYY-MM 
	seq_no INT NOT NULL );

-- user id:
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
DECLARE
    ym VARCHAR(7);
    mon TEXT;
    yr TEXT;
    seq INT;
BEGIN
    ym := TO_CHAR(NOW(), 'YYYY-MM');

    SELECT seq_no INTO seq
    FROM user_seq_monthly
    WHERE year_month = ym
    FOR UPDATE;

    IF NOT FOUND THEN
        seq := 1;
        INSERT INTO user_seq_monthly(year_month, seq_no)
        VALUES (ym, seq);
    ELSE
        seq := seq + 1;
        UPDATE user_seq_monthly
        SET seq_no = seq
        WHERE year_month = ym;
    END IF;

    mon := TO_CHAR(NOW(), 'MON');
    yr  := TO_CHAR(NOW(), 'YYYY');

    RETURN mon || '-' || yr || '-USR-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- visitor id:
CREATE OR REPLACE FUNCTION generate_visitor_id()
RETURNS TEXT AS $$
DECLARE
    ym VARCHAR(7);
    mon TEXT;
    yr TEXT;
    seq INT;
BEGIN
    ym := TO_CHAR(NOW(), 'YYYY-MM');

    SELECT seq_no INTO seq
    FROM visitor_seq_monthly
    WHERE year_month = ym
    FOR UPDATE;

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

    mon := TO_CHAR(NOW(), 'MON');
    yr  := TO_CHAR(NOW(), 'YYYY');

    RETURN mon || '-' || yr || '-VIS-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;


-- triggers:
-- User trigger
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := generate_user_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Visitor trigger
CREATE OR REPLACE FUNCTION set_visitor_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.visitor_id IS NULL THEN
        NEW.visitor_id := generate_visitor_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 
-- m_users
DROP TRIGGER IF EXISTS trg_set_user_id ON m_users;

CREATE TRIGGER trg_set_user_id
BEFORE INSERT ON m_users
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS trg_set_visitor_id ON m_visitors_signup;

CREATE TRIGGER trg_set_visitor_id
BEFORE INSERT ON m_visitors_signup
FOR EACH ROW
EXECUTE FUNCTION set_visitor_id();


INSERT INTO m_users (username, password_hash, role_code)
VALUES ('testuser1', 'hash', 'AD');

INSERT INTO m_users (username, password_hash, role_code)
VALUES ('testuser2', 'hash', 'AD');

select * from m_users;
-- 




-- alter table m_organization:
ALTER TABLE m_organization
ADD COLUMN address TEXT,
ADD COLUMN pincode VARCHAR(6),
ADD COLUMN division_code VARCHAR(2),
ADD COLUMN district_code VARCHAR(3),
ADD COLUMN taluka_code VARCHAR(4);

Select * from m_organization
Select * from m_department


SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'm_services'
ORDER BY ordinal_position;

	
CREATE OR REPLACE FUNCTION insert_organization_data(
    p_organization_name     TEXT,
    p_organization_name_ll  TEXT,
    p_state_code            TEXT,
    p_address               TEXT,
    p_pincode               VARCHAR(6),
    p_division_code         VARCHAR(2),
    p_district_code         VARCHAR(3),
    p_taluka_code           VARCHAR(4),
    p_departments           JSON
)
RETURNS JSON AS
$$
DECLARE
    v_organization_id VARCHAR(10);
    v_department_id   VARCHAR(10);
    dept_obj          JSON;
    service_obj       JSON;
BEGIN
    -- ===============================
    -- INSERT ORGANIZATION
    -- ===============================
    INSERT INTO m_organization (
        organization_name,
        organization_name_ll,
        state_code,
        address,
        pincode,
        division_code,
        district_code,
        taluka_code
    )
    VALUES (
        p_organization_name,
        p_organization_name_ll,
        p_state_code,
        p_address,
        p_pincode,
        p_division_code,
        p_district_code,
        p_taluka_code
    )
    RETURNING organization_id INTO v_organization_id;

    -- ===============================
    -- NO DEPARTMENTS → RETURN
    -- ===============================
    IF p_departments IS NULL
       OR json_typeof(p_departments) <> 'array'
       OR json_array_length(p_departments) = 0 THEN
        RETURN json_build_object(
            'success', TRUE,
            'organization_id', v_organization_id
        );
    END IF;

    -- ===============================
    -- DEPARTMENTS LOOP
    -- ===============================
    FOR dept_obj IN
        SELECT * FROM json_array_elements(p_departments)
    LOOP
        INSERT INTO m_department (
            organization_id,
            department_name,
            department_name_ll,
            state_code
        )
        VALUES (
            v_organization_id,
            dept_obj->>'dept_name',
            dept_obj->>'dept_name_ll',
            p_state_code
        )
        RETURNING department_id INTO v_department_id;

        -- ===============================
        -- SERVICES LOOP
        -- ===============================
        IF dept_obj->'services' IS NULL
           OR json_typeof(dept_obj->'services') <> 'array'
           OR json_array_length(dept_obj->'services') = 0 THEN
            CONTINUE;
        END IF;

        FOR service_obj IN
            SELECT * FROM json_array_elements(dept_obj->'services')
        LOOP
            INSERT INTO m_services (
                organization_id,
                department_id,
                service_name,
                service_name_ll,
                state_code
            )
            VALUES (
                v_organization_id,
                v_department_id,
                service_obj->>'name',
                service_obj->>'name_ll',
                p_state_code
            );
        END LOOP;
    END LOOP;

    -- ===============================
    -- SUCCESS RESPONSE
    -- ===============================
    RETURN json_build_object(
        'success', TRUE,
        'organization_id', v_organization_id
    );
END;
$$ LANGUAGE plpgsql;

drop function get_organizations();

--get organization by location:
CREATE OR REPLACE FUNCTION get_organizations_by_location(
    p_state_code VARCHAR,
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    organization_id VARCHAR,
    organization_name VARCHAR,
    organization_name_ll VARCHAR,
    address TEXT,
    pincode VARCHAR,
    state_code VARCHAR,
    division_code VARCHAR,
    district_code VARCHAR,
    taluka_code VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.organization_id,
        o.organization_name,
        o.organization_name_ll,
        o.address,
        o.pincode,
        o.state_code,
        o.division_code,
        o.district_code,
        o.taluka_code
    FROM m_organization o
    WHERE o.is_active = TRUE
      AND o.state_code = p_state_code
      AND (p_division_code IS NULL OR o.division_code = p_division_code)
      AND (p_district_code IS NULL OR o.district_code = p_district_code)
      AND (p_taluka_code IS NULL OR o.taluka_code = p_taluka_code)
    ORDER BY o.organization_name;
END;
$$;

SELECT * FROM get_organizations_by_location('27','01','482',null);
select * from walkins;

select * from m_helpdesk;

INSERT INTO m_helpdesk (
    user_id,
    full_name,
    mobile_no,
    email_id,
    designation_code,
    department_id,
    organization_id,
    state_code,
    division_code,
    district_code,
    taluka_code,
    insert_by,
    insert_ip
)
VALUES (
    'DEC-2025-USR-004',
    'Amit Kulkarni',
    '9876543210',
    'amit@gov.in',
    'DES01',
    'DEP001',
    'ORG009',
    '27',
    '04',
    '481',
    '4230',
    'admin',
    '127.0.0.1'
);

select * from m_designation;
select * from m_role;

--Add organization edit:

ALTER TABLE m_department
ADD COLUMN division_code VARCHAR(2),
ADD COLUMN district_code VARCHAR(3),
ADD COLUMN taluka_code VARCHAR(4),
ADD COLUMN address TEXT,
ADD COLUMN pincode VARCHAR(6);

DROP FUNCTION IF EXISTS insert_department_data(TEXT, JSON);


CREATE OR REPLACE FUNCTION insert_department_data(
    p_organization_id TEXT,
    p_departments JSON
)
RETURNS JSON AS
$$
DECLARE
    v_department_id VARCHAR(10);
    dept_obj JSON;
    service_obj JSON;

    -- 📍 Location details from organization
    v_state_code     VARCHAR(2);
    v_division_code  VARCHAR(2);
    v_district_code  VARCHAR(3);
    v_taluka_code    VARCHAR(4);
    v_address        TEXT;
    v_pincode        VARCHAR(6);

    v_inserted_departments INT := 0;
    v_inserted_services INT := 0;
BEGIN
    -- 🛑 Validate Organization & fetch location
    SELECT
        state_code,
        division_code,
        district_code,
        taluka_code,
        address,
        pincode
    INTO
        v_state_code,
        v_division_code,
        v_district_code,
        v_taluka_code,
        v_address,
        v_pincode
    FROM m_organization
    WHERE organization_id = p_organization_id;

    IF NOT FOUND THEN
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

    -- ✅ Loop departments
    FOR dept_obj IN SELECT * FROM json_array_elements(p_departments)
    LOOP
        INSERT INTO m_department (
            organization_id,
            department_name,
            department_name_ll,
            state_code,
            division_code,
            district_code,
            taluka_code,
            address,
            pincode
        ) VALUES (
            p_organization_id,
            dept_obj->>'dept_name',
            dept_obj->>'dept_name_ll',
            v_state_code,
            v_division_code,
            v_district_code,
            v_taluka_code,
            v_address,
            v_pincode
        )
        RETURNING department_id INTO v_department_id;

        v_inserted_departments := v_inserted_departments + 1;

        -- ✅ Services
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
                    state_code,
                    division_code,
                    district_code,
                    taluka_code,
address,
                    pincode
                ) VALUES (
                    p_organization_id,
                    v_department_id,
                    service_obj->>'name',
                    service_obj->>'name_ll',
                    v_state_code,
                    v_division_code,
                    v_district_code,
                    v_taluka_code,
v_address,
                    v_pincode
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

select * from m_department;


-- update department:
CREATE OR REPLACE FUNCTION update_department_data(
    p_organization_id TEXT,
    p_departments JSON
)
RETURNS JSON AS
$$
DECLARE
    dept_obj JSON;
    service_obj JSON;

    v_department_id VARCHAR;
    v_service_id VARCHAR;

    -- 📍 Location details
    v_state_code     VARCHAR(2);
    v_division_code  VARCHAR(2);
    v_district_code  VARCHAR(3);
    v_taluka_code    VARCHAR(4);
    v_address        TEXT;
    v_pincode        VARCHAR(6);

    v_updated_departments INT := 0;
    v_updated_services INT := 0;
    v_inserted_services INT := 0;
BEGIN
    -- 🔍 Fetch organization location
    SELECT
        state_code,
        division_code,
        district_code,
        taluka_code,
        address,
        pincode
    INTO
        v_state_code,
        v_division_code,
        v_district_code,
        v_taluka_code,
        v_address,
        v_pincode
    FROM m_organization
    WHERE organization_id = p_organization_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Organization not found'
        );
    END IF;

    IF p_departments IS NULL OR json_array_length(p_departments) = 0 THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'No departments provided'
        );
    END IF;

    -- 🔁 Loop departments
    FOR dept_obj IN SELECT * FROM json_array_elements(p_departments)
    LOOP
        v_department_id := dept_obj->>'department_id';

        IF v_department_id IS NULL THEN
            CONTINUE;
        END IF;

        -- 🏢 Update department
        UPDATE m_department
        SET
            department_name     = dept_obj->>'dept_name',
            department_name_ll  = dept_obj->>'dept_name_ll',
            state_code          = v_state_code,
            division_code       = v_division_code,
            district_code       = v_district_code,
            taluka_code         = v_taluka_code,
            address             = v_address,
            pincode             = v_pincode,
            updated_date        = NOW()
        WHERE department_id = v_department_id
          AND organization_id = p_organization_id;

        IF FOUND THEN
            v_updated_departments := v_updated_departments + 1;
        END IF;

        -- 🔁 Services
        IF dept_obj->'services' IS NOT NULL
           AND json_typeof(dept_obj->'services') = 'array' THEN

            FOR service_obj IN SELECT * FROM json_array_elements(dept_obj->'services')
            LOOP
                v_service_id := service_obj->>'service_id';

                -- 🔄 Update existing service
                IF v_service_id IS NOT NULL THEN
                    UPDATE m_services
                    SET
                        service_name     = service_obj->>'name',
                        service_name_ll  = service_obj->>'name_ll',
                        state_code       = v_state_code,
                        division_code    = v_division_code,
                        district_code    = v_district_code,
                        taluka_code      = v_taluka_code,
                        address          = v_address,
                        pincode          = v_pincode,
                        updated_date     = NOW()
                    WHERE service_id = v_service_id
                      AND department_id = v_department_id
                      AND organization_id = p_organization_id;

                    IF FOUND THEN
                        v_updated_services := v_updated_services + 1;
                    END IF;

                -- ➕ Insert new service
                ELSE
                    INSERT INTO m_services (
                        organization_id,
                        department_id,
                        service_name,
                        service_name_ll,
                        state_code,
                        division_code,
                        district_code,
                        taluka_code,
                        address,
                        pincode
                    ) VALUES (
                        p_organization_id,
                        v_department_id,
                        service_obj->>'name',
                        service_obj->>'name_ll',
                        v_state_code,
                        v_division_code,
                        v_district_code,
                        v_taluka_code,
                        v_address,
                        v_pincode
                    );

                    v_inserted_services := v_inserted_services + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    RETURN json_build_object(
        'success', TRUE,
        'message', 'Departments and services updated successfully',
        'organization_id', p_organization_id,
        'departments_updated', v_updated_departments,
        'services_updated', v_updated_services,
        'services_inserted', v_inserted_services
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Error updating data: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;




SELECT organization_id, state_code
FROM m_organization
WHERE organization_id = 'ORG017';  -- your org

SELECT
    tgname,
    pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'm_services'
  AND NOT t.tgisinternal;



ALTER TABLE m_services
ADD COLUMN division_code VARCHAR(2),
ADD COLUMN district_code VARCHAR(3),
ADD COLUMN taluka_code VARCHAR(4),
ADD COLUMN address TEXT,
ADD COLUMN pincode VARCHAR(6);


Select * from m_services
Select * from m_admins
Select * from m_department


SELECT column_name
FROM information_schema.columns
WHERE table_name = 'm_officers'

	select * from m_admins

ALTER TABLE m_admins
-- Admin address fields

-- ADD COLUMN organization_id VARCHAR(10),
-- ADD COLUMN department_id VARCHAR(10),
-- ADD COLUMN designation_code VARCHAR(5),
ADD COLUMN address VARCHAR(500),
ADD COLUMN pincode VARCHAR(10),
-- ADD COLUMN state_code VARCHAR(2),
-- ADD COLUMN district_code VARCHAR(3),
-- ADD COLUMN division_code VARCHAR(3),
-- ADD COLUMN taluka_code VARCHAR(4),
-- Officer-specific address fields
ADD COLUMN officer_address VARCHAR(500),
ADD COLUMN officer_state_code VARCHAR(2),
ADD COLUMN officer_district_code VARCHAR(3),
ADD COLUMN officer_division_code VARCHAR(3),
ADD COLUMN officer_taluka_code VARCHAR(4),
ADD COLUMN officer_pincode VARCHAR(10);

ALTER TABLE m_admins
ADD CONSTRAINT fk_officer_state FOREIGN KEY (officer_state_code) REFERENCES m_state(state_code),
ADD CONSTRAINT fk_officer_division FOREIGN KEY (officer_division_code) REFERENCES m_division(division_code),
ADD CONSTRAINT fk_officer_district FOREIGN KEY (officer_district_code) REFERENCES m_district(district_code),
ADD CONSTRAINT fk_officer_taluka FOREIGN KEY (officer_taluka_code) REFERENCES m_taluka(taluka_code);
ALTER TABLE m_admins
ADD CONSTRAINT fk_state FOREIGN KEY (state_code) REFERENCES m_state(state_code),
ADD CONSTRAINT fk_division FOREIGN KEY (division_code) REFERENCES m_division(division_code),
ADD CONSTRAINT fkr_district FOREIGN KEY (district_code) REFERENCES m_district(district_code),
ADD CONSTRAINT fk_taluka FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code);

ALTER TABLE m_admins
-- Add gender column
ADD COLUMN gender VARCHAR(10);

-- main working:
CREATE OR REPLACE FUNCTION register_user_by_role(
    p_password_hash VARCHAR,
    p_full_name VARCHAR,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_gender VARCHAR DEFAULT NULL,
    p_designation_code VARCHAR DEFAULT NULL,
    p_department_id VARCHAR DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_officer_address VARCHAR DEFAULT NULL,
    p_officer_state_code VARCHAR DEFAULT NULL,
    p_officer_district_code VARCHAR DEFAULT NULL,
    p_officer_division_code VARCHAR DEFAULT NULL,
    p_officer_taluka_code VARCHAR DEFAULT NULL,
    p_officer_pincode VARCHAR DEFAULT NULL,
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

    -- organization location
    v_org_state VARCHAR(2);
    v_org_division VARCHAR(3);
    v_org_district VARCHAR(3);
    v_org_taluka VARCHAR(4);
    v_org_address VARCHAR(255);
    v_org_pincode VARCHAR(10);

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

    -- 4️⃣ Get organization location if provided
    IF p_organization_id IS NOT NULL THEN
    SELECT state_code, division_code, district_code, taluka_code, address, pincode
    INTO v_org_state, v_org_division, v_org_district, v_org_taluka, v_org_address, v_org_pincode
    FROM m_organization
    WHERE organization_id = p_organization_id;
END IF;


    -- 5️⃣ Insert into role tables with all columns identical
    IF p_role_code = 'OF' THEN
        INSERT INTO m_officers (
            user_id, full_name, gender, email_id, mobile_no,
            designation_code, department_id, organization_id,
            state_code, division_code, district_code, taluka_code,
            address, pincode,
            officer_address, officer_state_code, officer_district_code, officer_division_code, officer_taluka_code, officer_pincode,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_gender, p_email_id, p_mobile_no,
            p_designation_code, p_department_id, p_organization_id,
            v_org_state, v_org_division, v_org_district, v_org_taluka,v_org_address, v_org_pincode,
            p_officer_address, p_officer_state_code, p_officer_district_code, p_officer_division_code, p_officer_taluka_code, p_officer_pincode,
            p_photo, 'system'
        )
        RETURNING officer_id INTO v_entity_id;

    ELSIF p_role_code = 'HD' THEN
        INSERT INTO m_helpdesk (
            user_id, full_name, gender, email_id, mobile_no,
            designation_code, department_id, organization_id,
            state_code, division_code, district_code, taluka_code,
            address, pincode,
            officer_address, officer_state_code, officer_district_code, officer_division_code, officer_taluka_code, officer_pincode,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_gender, p_email_id, p_mobile_no,
            p_designation_code, p_department_id, p_organization_id,
            v_org_state, v_org_division, v_org_district, v_org_taluka,v_org_address, v_org_pincode,
            p_officer_address, p_officer_state_code, p_officer_district_code, p_officer_division_code, p_officer_taluka_code, p_officer_pincode,
            p_photo, 'system'
        )
        RETURNING helpdesk_id INTO v_entity_id;

    ELSIF p_role_code = 'AD' THEN
        INSERT INTO m_admins (
            user_id, full_name, gender, email_id, mobile_no,
            designation_code, department_id, organization_id,
            state_code, division_code, district_code, taluka_code,
            address, pincode,
            officer_address, officer_state_code, officer_district_code, officer_division_code, officer_taluka_code, officer_pincode,
            photo, insert_by
        )
        VALUES (
            v_uid, p_full_name, p_gender, p_email_id, p_mobile_no,
            p_designation_code, p_department_id, p_organization_id,
            v_org_state, v_org_division, v_org_district, v_org_taluka,v_org_address, v_org_pincode,
            p_officer_address, p_officer_state_code, p_officer_district_code, p_officer_division_code, p_officer_taluka_code, p_officer_pincode,
            p_photo, 'system'
        )
        RETURNING admin_id INTO v_entity_id;
    END IF;

    -- 6️⃣ Update username = entity_id
    UPDATE m_users SET username = v_entity_id WHERE user_id = v_uid;

    -- 7️⃣ Return success
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

select * from m_organization

ALTER TABLE m_officers
ADD COLUMN address VARCHAR(500),
ADD COLUMN pincode VARCHAR(10);
ADD COLUMN state_code VARCHAR(2),
ADD COLUMN district_code VARCHAR(3),
ADD COLUMN division_code VARCHAR(3),
ADD COLUMN taluka_code VARCHAR(4),
-- Officer-specific address fields
ALTER TABLE m_officers
ADD COLUMN officer_address VARCHAR(500),
ADD COLUMN officer_state_code VARCHAR(2),
ADD COLUMN officer_district_code VARCHAR(3),
ADD COLUMN officer_division_code VARCHAR(3),
ADD COLUMN officer_taluka_code VARCHAR(4),
ADD COLUMN officer_pincode VARCHAR(10);

ALTER TABLE m_officers
ADD CONSTRAINT fk_state FOREIGN KEY (state_code) REFERENCES m_state(state_code),
ADD CONSTRAINT fk_division FOREIGN KEY (division_code) REFERENCES m_division(division_code),
ADD CONSTRAINT fkr_district FOREIGN KEY (district_code) REFERENCES m_district(district_code),
ADD CONSTRAINT fk_taluka FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code);
;

ALTER TABLE m_officers
-- Add gender column
ADD COLUMN gender VARCHAR(10);

SELECT setval( 'm_organization_id_seq', (SELECT COALESCE(MAX(organization_id), 0) FROM m_organization) + 1, false );

SELECT setval(
    'm_organization_id_seq',
    COALESCE(
        MAX(CAST(SUBSTRING(organization_id FROM 4) AS INTEGER)),
        0
    )
)
FROM m_organization;


SELECT setval(
    'm_department_id_seq',
    COALESCE(
        MAX(CAST(SUBSTRING(department_id FROM 4) AS INTEGER)),
        0
    )
)
FROM m_department;


SELECT setval(
    'm_services_id_seq',
    COALESCE(
        MAX(CAST(SUBSTRING(service_id FROM 4) AS INTEGER)),
        0
    )
)
FROM m_services;

-------------------------------------------------------------------------------------------

--deleete appointment function
CREATE OR REPLACE FUNCTION delete_appointment(
    p_appointment_id TEXT
)
RETURNS JSON AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM appointments
    WHERE appointment_id::TEXT = p_appointment_id
      AND is_active = TRUE;

    IF v_count = 0 THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Appointment not found or already deleted'
        );
    END IF;

    UPDATE appointments
    SET is_active = FALSE
    WHERE appointment_id::TEXT = p_appointment_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Appointment deleted successfully'
    );
END;
$$ LANGUAGE plpgsql;




-- new one summary
CREATE OR REPLACE FUNCTION get_appointments_summary(
    p_from_date DATE DEFAULT NULL,
    p_to_date   DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    total_count INT;
    total_pages INT;
    pending_count INT;
    approved_count INT;
    rejected_count INT;
    completed_count INT;
    appointment_list JSON;
    page_size INT := 10;
BEGIN
    /* ===============================
       TOTAL COUNT
    =============================== */
    SELECT COUNT(*)
    INTO total_count
    FROM appointments a
    WHERE a.is_active = TRUE
      AND (p_from_date IS NULL OR a.appointment_date >= p_from_date)
      AND (p_to_date   IS NULL OR a.appointment_date <= p_to_date);

    /* TOTAL PAGES */
    total_pages := CEIL(total_count::DECIMAL / page_size);

    /* ===============================
       STATUS COUNTS
    =============================== */
    SELECT COUNT(*) INTO pending_count
    FROM appointments WHERE is_active = TRUE AND status = 'pending';

    SELECT COUNT(*) INTO approved_count
    FROM appointments WHERE is_active = TRUE AND status = 'approved';

    SELECT COUNT(*) INTO rejected_count
    FROM appointments WHERE is_active = TRUE AND status = 'rejected';

    SELECT COUNT(*) INTO completed_count
    FROM appointments WHERE is_active = TRUE AND status = 'completed';

    /* ===============================
       APPOINTMENT LIST (CORRECT WAY)
    =============================== */
    SELECT json_agg(row_data)
    INTO appointment_list
    FROM (
        SELECT
            json_build_object(
                'appointment_id', a.appointment_id,
                'visitor_name', vs.full_name,
                'appointment_date', a.appointment_date,
                'slot_time', a.slot_time,
                'officer_name', off.full_name,
                'status', a.status
            ) AS row_data
        FROM appointments a
        LEFT JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
        LEFT JOIN m_officers off ON off.officer_id = a.officer_id
        WHERE a.is_active = TRUE
          AND (p_from_date IS NULL OR a.appointment_date >= p_from_date)
          AND (p_to_date   IS NULL OR a.appointment_date <= p_to_date)
        ORDER BY a.appointment_date DESC
        LIMIT page_size
    ) sub;

    /* ===============================
       FINAL JSON
    =============================== */
    RETURN json_build_object(
        'total', total_count,
        'pending', pending_count,
        'approved', approved_count,
        'rejected', rejected_count,
        'completed', completed_count,
        'appointments', COALESCE(appointment_list, '[]'::json),
        'total_pages', total_pages
    );
END;
$$ LANGUAGE plpgsql;


drop function get_appointments_summary();
select * from get_organization_by_id('ORG001')
-- get organization detail by id:
CREATE OR REPLACE FUNCTION get_organization_by_id(
    p_organization_id VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
BEGIN
    -- 🔍 Validate organization
    IF NOT EXISTS (
        SELECT 1 FROM m_organization WHERE organization_id = p_organization_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Organization not found'
        );
    END IF;

    -- 📦 Build full organization JSON
    SELECT json_build_object(
        'success', true,

        -- 🏢 Organization
        'organization', json_build_object(
            'organization_id', o.organization_id,
            'organization_name', o.organization_name,
            'organization_name_ll', o.organization_name_ll,
            'address', o.address,
            'pincode', o.pincode,
            'state_code', o.state_code,
            'state_name', s.state_name,
            'division_code', o.division_code,
            'division_name', dv.division_name,
            'district_code', o.district_code,
            'district_name', dt.district_name,
            'taluka_code', o.taluka_code,
            'taluka_name', tk.taluka_name,
            'is_active', o.is_active,
            'insert_date', o.insert_date
        ),

        -- 🏬 Departments + Services
        'departments', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'department_id', d.department_id,
                    'department_name', d.department_name,
                    'department_name_ll', d.department_name_ll,

                    'services', COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'service_id', s.service_id,
                                'service_name', s.service_name,
                                'service_name_ll', s.service_name_ll,
                                'is_active', s.is_active
                            )
                        )
                        FROM m_services s
                        WHERE s.department_id = d.department_id
                          AND s.is_active = true
                    ), '[]'::json)
                )
            )
            FROM m_department d
            WHERE d.organization_id = o.organization_id
              AND d.is_active = true
        ), '[]'::json)

    )
    INTO v_result
    FROM m_organization o
    LEFT JOIN m_state s     ON s.state_code = o.state_code
    LEFT JOIN m_division dv ON dv.division_code = o.division_code
    LEFT JOIN m_district dt ON dt.district_code = o.district_code
    LEFT JOIN m_taluka tk   ON tk.taluka_code = o.taluka_code
    WHERE o.organization_id = p_organization_id;

    RETURN v_result;
END;
$$;


SELECT get_organization_by_id('ORG017');
select * from m_organization;
SELECT COUNT(*) 
FROM m_officers 
WHERE department_id = v_department_id;

SELECT COUNT(*)
FROM m_officers
WHERE department_id = 'DEP001';


-- update only organization data:
CREATE OR REPLACE FUNCTION update_organization_only(
    p_organization_id       VARCHAR(10),
    p_organization_name     TEXT,
    p_organization_name_ll  TEXT,
    p_state_code            TEXT,
    p_address               TEXT,
    p_pincode               VARCHAR(6),
    p_division_code         VARCHAR(2),
    p_district_code         VARCHAR(3),
    p_taluka_code           VARCHAR(4)
)
RETURNS JSON AS
$$
BEGIN
    -- ===============================
    -- UPDATE ORGANIZATION ONLY
    -- ===============================
    UPDATE m_organization
    SET
        organization_name     = p_organization_name,
        organization_name_ll  = p_organization_name_ll,
        state_code            = p_state_code,
        address               = p_address,
        pincode               = p_pincode,
        division_code         = p_division_code,
        district_code         = p_district_code,
        taluka_code           = p_taluka_code,
        updated_date          = CURRENT_TIMESTAMP
    WHERE organization_id = p_organization_id;

    -- ===============================
    -- NOT FOUND CHECK
    -- ===============================
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Organization not found'
        );
    END IF;

    -- ===============================
    -- SUCCESS RESPONSE
    -- ===============================
    RETURN json_build_object(
        'success', TRUE,
        'organization_id', p_organization_id,
        'message', 'Organization updated successfully'
    );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_organization_dept_service_only(
    p_organization_id VARCHAR(10),
    p_org_data JSON,
    p_departments JSON
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    dept_obj JSON;
    srv_obj  JSON;
BEGIN
    -- ===============================
    -- UPDATE ORGANIZATION
    -- ===============================
    UPDATE m_organization
    SET
        organization_name     = p_org_data->>'organization_name',
        organization_name_ll  = p_org_data->>'organization_name_ll',
        state_code            = p_org_data->>'state_code',
        address               = p_org_data->>'address',
        pincode               = p_org_data->>'pincode',
        division_code         = p_org_data->>'division_code',
        district_code         = p_org_data->>'district_code',
        taluka_code           = p_org_data->>'taluka_code',
        updated_date          = CURRENT_TIMESTAMP
    WHERE organization_id = p_organization_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Organization not found'
        );
    END IF;

    -- ===============================
    -- UPDATE DEPARTMENTS (ONLY)
    -- ===============================
    FOR dept_obj IN SELECT * FROM json_array_elements(p_departments)
    LOOP
        IF dept_obj ? 'department_id' THEN
            UPDATE m_department
            SET
                department_name     = dept_obj->>'dept_name',
                department_name_ll  = dept_obj->>'dept_name_ll',
                updated_date        = CURRENT_TIMESTAMP
            WHERE department_id = dept_obj->>'department_id'
              AND organization_id = p_organization_id;
        END IF;

        -- ===============================
        -- UPDATE SERVICES (ONLY)
        -- ===============================
        IF dept_obj ? 'services' THEN
            FOR srv_obj IN SELECT * FROM json_array_elements(dept_obj->'services')
            LOOP
                IF srv_obj ? 'service_id' THEN
                    UPDATE m_services
                    SET
                        service_name     = srv_obj->>'name',
                        service_name_ll  = srv_obj->>'name_ll',
                        updated_date     = CURRENT_TIMESTAMP
                    WHERE service_id = srv_obj->>'service_id'
                      AND organization_id = p_organization_id;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    -- ===============================
    -- SUCCESS
    -- ===============================
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Organization, departments and services updated successfully'
    );
END;
$$;



drop function get_department_by_id(VARCHAR);
	drop function get_department_by_id(TEXT)
-- get department by id:
CREATE OR REPLACE FUNCTION get_department_by_id(
    p_department_id VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    dept_data JSON;
BEGIN
    SELECT row_to_json(d)
    INTO dept_data
    FROM (
        SELECT
            department_id,
            organization_id,
            department_name,
            department_name_ll,
            state_code,
            division_code,
            district_code,
            taluka_code,
            address,
            pincode,
            insert_date,
            updated_date
        FROM m_department
        WHERE department_id = p_department_id
    ) d;

    IF dept_data IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Department not found'
        );
    END IF;

    RETURN json_build_object(
        'success', TRUE,
        'data', dept_data
    );
END;
$$;


select * from get_department_by_id('DEP010')

SELECT department_id
FROM m_department
WHERE department_id = 'DEP001';

select * from get_service_by_id('SRV012')
-- getservices by id:
CREATE OR REPLACE FUNCTION get_service_by_id(
    p_service_id VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(s)
    INTO result
    FROM (
        SELECT
            service_id,
            organization_id,
            department_id,
            service_name,
            service_name_ll,
            state_code,
            is_active
        FROM m_services
        WHERE service_id = p_service_id
    ) s;

    RETURN result;
END;
$$;



----------------------------------
-- Helpdesk
/* 1) fetch helpdesk user by username (used for login - controller will still bcrypt-compare) */
CREATE OR REPLACE FUNCTION get_helpdesk_user_by_username(p_username VARCHAR)
RETURNS TABLE (
  user_id VARCHAR,
  username VARCHAR,
  password_hash VARCHAR,
  role_code VARCHAR,
  is_active BOOLEAN
)
LANGUAGE sql
AS $$
  SELECT user_id, username, password_hash, role_code, is_active
  FROM m_users
  WHERE username = p_username
    AND is_active = TRUE
    AND role_code = 'HD';
$$;

select * from m_helpdesk;

/* 2) fetch helpdesk details by user_id */
CREATE OR REPLACE FUNCTION get_helpdesk_by_userid(p_user_id VARCHAR)
RETURNS TABLE (
    helpdesk_id VARCHAR,
    user_id VARCHAR,
    full_name VARCHAR,
    mobile_no VARCHAR,
    email_id VARCHAR,
    designation_code VARCHAR,
    department_id VARCHAR,
    organization_id VARCHAR,
    state_code VARCHAR,
    division_code VARCHAR,
    district_code VARCHAR,
    taluka_code VARCHAR,
    availability_status VARCHAR,
    photo VARCHAR
)
LANGUAGE sql
AS $$
    SELECT
        helpdesk_id,
        user_id,
        full_name,
        mobile_no,
        email_id,
        designation_code,
        department_id,
        organization_id,
        state_code,
        division_code,
        district_code,
        taluka_code,
        availability_status,
        photo
    FROM m_helpdesk
    WHERE user_id = p_user_id
      AND is_active = TRUE;
$$;

SELECT *
FROM get_helpdesk_by_userid('DEC-2025-USR-005');

/* 3) helpdesk dashboard - returns JSON with sections (today, completed, pending, rescheduled, reassigned, walkins) */
-- REQUIRED column names in m_helpdesk:
-- state_code, district_code, division_code, taluka_code
SELECT get_helpdesk_dashboard('27');

select * from walkins;
select * from m_visitor_signup;

select * from get_helpdesk_dashboard('27')

CREATE OR REPLACE FUNCTION get_helpdesk_dashboard(
  p_state VARCHAR,
  p_district VARCHAR DEFAULT NULL,
  p_division VARCHAR DEFAULT NULL,
  p_taluka VARCHAR DEFAULT NULL,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  today_apps JSON;
  completed_apps JSON;
  pending_apps JSON;
  rescheduled_apps JSON;
  walkins_apps JSON;
BEGIN

  /* TODAY */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO today_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      v.full_name AS visitor_name,
      v.email_id AS visitor_email,
      v.mobile_no AS visitor_phone,
      s.service_name
    FROM appointments a
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    JOIN m_helpdesk h ON h.user_id = a.officer_id
    WHERE a.appointment_date = p_date
      AND h.state_code = p_state
      AND (p_district IS NULL OR h.district_code = p_district)
      AND (p_division IS NULL OR h.division_code = p_division)
      AND (p_taluka IS NULL OR h.taluka_code = p_taluka)
    ORDER BY a.slot_time
  ) t;

  /* COMPLETED */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO completed_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      v.full_name AS visitor_name,
      s.service_name
    FROM appointments a
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    JOIN m_helpdesk h ON h.user_id = a.officer_id
    WHERE a.status = 'completed'
      AND h.state_code = p_state
      AND (p_district IS NULL OR h.district_code = p_district)
      AND (p_division IS NULL OR h.division_code = p_division)
      AND (p_taluka IS NULL OR h.taluka_code = p_taluka)
    ORDER BY a.appointment_date DESC
    LIMIT 20
  ) t;

  /* PENDING */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO pending_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      v.full_name AS visitor_name,
      s.service_name
    FROM appointments a
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    JOIN m_helpdesk h ON h.user_id = a.officer_id
    WHERE a.status = 'pending'
      AND h.state_code = p_state
      AND (p_district IS NULL OR h.district_code = p_district)
      AND (p_division IS NULL OR h.division_code = p_division)
      AND (p_taluka IS NULL OR h.taluka_code = p_taluka)
    ORDER BY a.appointment_date
    LIMIT 20
  ) t;

  /* RESCHEDULED */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO rescheduled_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      a.reschedule_reason,
      v.full_name AS visitor_name,
      s.service_name
    FROM appointments a
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    JOIN m_helpdesk h ON h.user_id = a.officer_id
    WHERE a.status = 'rescheduled'
      AND h.state_code = p_state
      AND (p_district IS NULL OR h.district_code = p_district)
      AND (p_division IS NULL OR h.division_code = p_division)
      AND (p_taluka IS NULL OR h.taluka_code = p_taluka)
    ORDER BY a.updated_date DESC
    LIMIT 20
  ) t;

  /* WALKINS */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO walkins_apps
  FROM (
    SELECT
      w.walkin_id,
      w.walkin_date,
      w.status,
      w.full_name AS visitor_name,
      w.mobile_no AS visitor_phone,
      w.email_id AS visitor_email,
      w.purpose
    FROM walkins w
    WHERE w.state_code = p_state
      AND (p_district IS NULL OR w.district_code = p_district)
      AND (p_division IS NULL OR w.division_code = p_division)
      AND (p_taluka IS NULL OR w.taluka_code = p_taluka)
    ORDER BY w.walkin_date DESC
    LIMIT 20
  ) t;

  RETURN json_build_object(
    'success', TRUE,
    'today_appointments', today_apps,
    'completed_appointments', completed_apps,
    'pending_appointments', pending_apps,
    'rescheduled_appointments', rescheduled_apps,
    'walkin_appointments', walkins_apps
  );
END;
$$;

SELECT get_helpdesk_dashboard2('HLP002', CURRENT_DATE);


-- demo
CREATE OR REPLACE FUNCTION get_helpdesk_dashboard2(
  p_helpdesk_id VARCHAR,          -- logged-in helpdesk_id
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  today_apps JSON;
  completed_apps JSON;
  pending_apps JSON;
  rescheduled_apps JSON;
  walkins_apps JSON;
BEGIN

  /* -------- TODAY -------- */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO today_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      v.full_name AS visitor_name,
      v.email_id AS visitor_email,
      v.mobile_no AS visitor_phone,
      s.service_name
    FROM appointments a
    JOIN m_helpdesk h
         ON h.user_id = a.officer_id
        AND h.helpdesk_id = p_helpdesk_id
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    WHERE a.appointment_date = p_date
    ORDER BY a.slot_time
  ) t;

  /* -------- COMPLETED -------- */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO completed_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      v.full_name AS visitor_name,
      s.service_name
    FROM appointments a
    JOIN m_helpdesk h
         ON h.user_id = a.officer_id
        AND h.helpdesk_id = p_helpdesk_id
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    WHERE LOWER(a.status) = 'completed'
    ORDER BY a.appointment_date DESC
    LIMIT 20
  ) t;

  /* -------- PENDING -------- */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO pending_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      v.full_name AS visitor_name,
      s.service_name
    FROM appointments a
    JOIN m_helpdesk h
         ON h.user_id = a.officer_id
        AND h.helpdesk_id = p_helpdesk_id
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    WHERE LOWER(a.status) = 'pending'
    ORDER BY a.appointment_date
    LIMIT 20
  ) t;

  /* -------- RESCHEDULED -------- */
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  INTO rescheduled_apps
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      a.reschedule_reason,
      v.full_name AS visitor_name,
      s.service_name
    FROM appointments a
    JOIN m_helpdesk h
         ON h.user_id = a.officer_id
        AND h.helpdesk_id = p_helpdesk_id
    JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    JOIN m_services s ON s.service_id = a.service_id
    WHERE LOWER(a.status) = 'rescheduled'
    ORDER BY a.updated_date DESC
    LIMIT 20
  ) t;

  /* -------- WALKINS (OPTIONAL) -------- */
  /* -------- WALKINS -------- */
SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
INTO walkins_apps
FROM (
  SELECT
    w.walkin_id,
    w.walkin_date,
    w.status,
    w.full_name AS visitor_name,
    w.mobile_no AS visitor_phone,
    w.email_id AS visitor_email,
    w.purpose
  FROM walkins w
  JOIN m_helpdesk h
       ON h.user_id = w.user_id   -- 🔴 IMPORTANT
      AND h.helpdesk_id = p_helpdesk_id
  ORDER BY w.walkin_date DESC
  LIMIT 20
) t;

  RETURN json_build_object(
    'success', TRUE,
    'today_appointments', today_apps,
    'completed_appointments', completed_apps,
    'pending_appointments', pending_apps,
    'rescheduled_appointments', rescheduled_apps,
    'walkin_appointments', walkins_apps
  );
END;
$$;




SELECT appointment_id, appointment_date
FROM appointments
WHERE appointment_date::date = CURRENT_DATE;

-- 
/* 4) register helpdesk (controller should pass already-hashed password) */
CREATE OR REPLACE FUNCTION register_helpdesk(
  p_username VARCHAR,
  p_password_hash VARCHAR,
  p_full_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_location VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id VARCHAR;
BEGIN
  IF EXISTS (SELECT 1 FROM m_users WHERE username = p_username) THEN
    RETURN json_build_object('success', FALSE, 'message', 'Username already exists');
  END IF;

  INSERT INTO m_users (username, password_hash, role_code)
  VALUES (p_username, p_password_hash, 'HD')
  RETURNING user_id INTO v_user_id;

  INSERT INTO m_helpdesk (user_id, full_name, email_id, mobile_no, assigned_location)
  VALUES (v_user_id, p_full_name, p_email, p_phone, p_location);

  RETURN json_build_object('success', TRUE, 'user_id', v_user_id);
END;
$$;


/* 5) book walk-in appointment via helpdesk */
CREATE OR REPLACE FUNCTION book_walkin_helpdesk(
  p_full_name VARCHAR,
  p_mobile_no VARCHAR,
  p_email_id VARCHAR,
  p_id_proof_no VARCHAR,
  p_organization_id VARCHAR,
  p_department_id VARCHAR,
  p_officer_id VARCHAR,
  p_purpose VARCHAR,
  p_appointment_date DATE,
  p_time_slot TIME
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_id VARCHAR;
BEGIN
  INSERT INTO walkins (
    full_name, mobile_no, email_id, id_proof_no,
    organization_id, department_id, officer_id,
    purpose, appointment_date, time_slot,
    status, is_walkin
  )
  VALUES (
    p_full_name, p_mobile_no, p_email_id, p_id_proof_no,
    p_organization_id, p_department_id, p_officer_id,
    p_purpose, p_appointment_date, p_time_slot,
    'pending', TRUE
  )
  RETURNING walkin_id INTO v_id;

  RETURN json_build_object('success', TRUE, 'walkin_id', v_id);
END;
$$;

/* 6) get officers for booking */
CREATE OR REPLACE FUNCTION get_officers_for_booking_function(p_org VARCHAR, p_dept VARCHAR)
RETURNS JSON
LANGUAGE sql
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
    SELECT officer_id, full_name, designation_code, mobile_no, email_id
    FROM m_officers
    WHERE organization_id = p_org
      AND department_id = p_dept
      AND is_active = TRUE
    ORDER BY full_name ASC
  ) t;
$$;

select * from get_all_appointments_by_department_function('2026-01-09')

/* 7) get all appointments grouped by department (returns JSON) */
CREATE OR REPLACE FUNCTION get_all_appointments_by_department_function(p_date DATE)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  depts JSON;
  appts JSON;
  grouped JSON;
BEGIN
  SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
  INTO depts
  FROM (
    SELECT DISTINCT d.department_id, d.department_name, o.organization_name
    FROM m_department d
    JOIN m_organization o ON d.organization_id = o.organization_id
    WHERE d.is_active = TRUE
    ORDER BY d.department_name
  ) d;

  SELECT COALESCE(json_agg(row_to_json(a)), '[]'::json)
  INTO appts
  FROM (
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.slot_time,
      a.status,
      a.purpose,
      a.reschedule_reason,
      a.department_id,
      a.officer_id,
      a.visitor_id,
      v.full_name AS visitor_name,
      v.email_id AS visitor_email,
      v.mobile_no AS visitor_phone,
      s.service_name,
      d.department_name,
      o.full_name AS officer_name,
      o.designation_code AS officer_designation,
      org.organization_name
    FROM appointments a
    LEFT JOIN m_visitors_signup v ON a.visitor_id = v.visitor_id
    LEFT JOIN m_services s ON a.service_id = s.service_id
    LEFT JOIN m_department d ON a.department_id = d.department_id
    LEFT JOIN m_officers o ON a.officer_id = o.officer_id
    LEFT JOIN m_organization org ON a.organization_id = org.organization_id
    WHERE a.appointment_date::date = p_date
    ORDER BY d.department_name, o.full_name, a.slot_time
  ) a;

  RETURN json_build_object('success', TRUE, 'departments', depts, 'appointments', appts);

EXCEPTION
  WHEN others THEN
    RETURN json_build_object('success', FALSE, 'message', 'Error in get_all_appointments_by_department_function: ' || SQLERRM);
END;
$$;


/* 8) get notifications for helpdesk (simple recent appointment updates) */
-- working:
select * from get_helpdesk_notifications('DEP001');
CREATE OR REPLACE FUNCTION get_helpdesk_notifications(p_department_id VARCHAR)
RETURNS JSON
LANGUAGE sql
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      a.appointment_id,
      a.status,
      v.full_name AS visitor_name,
      s.service_name,
      a.updated_date AS updated_at,
      a.insert_date AS created_at
    FROM appointments a
    LEFT JOIN m_visitors_signup v ON a.visitor_id = v.visitor_id
    LEFT JOIN m_services s ON a.service_id = s.service_id
    WHERE (
        p_department_id IS NULL
        OR a.department_id = p_department_id
    )
    ORDER BY COALESCE(a.updated_date, a.insert_date) DESC
    LIMIT 20
  ) t;
$$;
select * from get_user_by_mobile_no('1234567890')
-- helpdesk officer availability:
CREATE OR REPLACE FUNCTION public.get_officer_availability(
  p_helpdesk_id integer,
  p_location_id integer,
  p_appointment_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  officer_id integer,
  officer_name text,
  department_name text,
  appointments jsonb
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.officer_id,
    o.officer_name,
    d.department_name,
    json_agg(
      json_build_object(
        'appointment_id', a.appointment_id,
        'visitor_name', a.visitor_name,
        'slot_time', a.slot_time,
        'status', a.status
      )
    ) FILTER (WHERE a.appointment_id IS NOT NULL) :: jsonb AS appointments
  FROM m_officers o
  LEFT JOIN m_departments d ON o.department_id = d.department_id
  LEFT JOIN t_appointments a
    ON o.officer_id = a.officer_id
    AND DATE(a.appointment_date) = COALESCE(p_appointment_date, CURRENT_DATE)
    AND a.status IN ('scheduled', 'completed')
  WHERE (p_location_id IS NULL OR o.location_id = p_location_id)
    AND (p_helpdesk_id IS NULL OR o.helpdesk_id = p_helpdesk_id)
  GROUP BY o.officer_id, o.officer_name, d.department_name
  ORDER BY o.officer_name;
END;
$$;

drop function get_officer_availability(VARCHAR,DATE);
-- new :
CREATE OR REPLACE FUNCTION public.get_officer_availability(
  p_helpdesk_id VARCHAR,
  p_appointment_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  officer_id VARCHAR,
  officer_name TEXT,
  department_name TEXT,
  appointments JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.officer_id,
    o.full_name::TEXT AS officer_name,   -- ✅ CAST FIX
    d.department_name::TEXT,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'appointment_id', a.appointment_id,
          'visitor_name', v.full_name,
          'slot_time', a.slot_time,
          'status', a.status
        )
      ) FILTER (WHERE a.appointment_id IS NOT NULL),
      '[]'::jsonb
    ) AS appointments
  FROM m_helpdesk h
  JOIN m_officers o
    ON o.department_id   = h.department_id
   AND o.organization_id = h.organization_id
   AND o.state_code      = h.state_code
   AND o.division_code   = h.division_code
   AND o.district_code   = h.district_code
   AND o.taluka_code     = h.taluka_code
  LEFT JOIN m_department d
    ON o.department_id = d.department_id
  LEFT JOIN appointments a
    ON a.officer_id = o.officer_id
   AND a.appointment_date = COALESCE(p_appointment_date, CURRENT_DATE)
   AND a.status IN ('scheduled', 'completed')
  LEFT JOIN m_visitors_signup v
    ON v.visitor_id = a.visitor_id
  WHERE
    h.helpdesk_id = p_helpdesk_id
    AND h.is_active = TRUE
    AND o.is_active = TRUE
  GROUP BY
    o.officer_id,
    o.full_name,
    d.department_name
  ORDER BY o.full_name;
END;
$$;




select * from appointments;


SELECT * FROM get_officer_availability(
  'HLP002',
  '2026-01-09'
);

-----------------test
SELECT
  department_id,
  LENGTH(department_id),
  LENGTH(TRIM(department_id)),
  department_id = 'DEP010' AS direct_match,
  TRIM(department_id) = 'DEP010' AS trim_match
FROM m_department;

SELECT
  department_id,
  encode(department_id::bytea, 'escape')
FROM m_department
WHERE department_id LIKE '%DEP%';
SELECT * FROM get_department_by_id_json('DEP010');

CREATE OR REPLACE FUNCTION get_department_by_id_json(p_department_id VARCHAR)
RETURNS JSONB
LANGUAGE sql
AS $$
  SELECT jsonb_build_object(
    'department_id', d.department_id,
    'organization_id', d.organization_id,
    'department_name', d.department_name,
    'department_name_ll', d.department_name_ll,
    'state_code', d.state_code,
    'services', COALESCE(jsonb_agg(
      jsonb_build_object(
        'service_id', s.service_id,
        'service_name', s.service_name,
        'service_name_ll', s.service_name_ll
      )
    ) FILTER (WHERE s.service_id IS NOT NULL), '[]'::jsonb)
  )
  FROM m_department d
  LEFT JOIN m_services s ON s.department_id = d.department_id
  WHERE d.department_id = p_department_id
  GROUP BY d.department_id;
$$;


select * from m_helpdesk;
drop function get_visitor_by_id(VARCHAR)
select * from get_visitor_details('VIS019')
-- get visitor by id:
CREATE OR REPLACE FUNCTION get_visitor_details(
    p_visitor_id VARCHAR DEFAULT NULL,
    p_mobile_no  VARCHAR DEFAULT NULL,
    p_email_id   VARCHAR DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    visitor_data JSON;
BEGIN
    SELECT json_build_object(
        'visitor_id', v.visitor_id,
        'user_id', v.user_id,
        'full_name', v.full_name,
        'gender', v.gender,
        'dob', v.dob,
        'mobile_no', v.mobile_no,
        'email_id', v.email_id,
        'state_code', v.state_code,
        'division_code', v.division_code,
        'district_code', v.district_code,
        'taluka_code', v.taluka_code,
        'pincode', v.pincode,
        'photo', v.photo,
        'is_active', v.is_active,
        'insert_date', v.insert_date,
        'updated_date', v.updated_date
    )
    INTO visitor_data
    FROM m_visitors_signup v
    WHERE
        (p_visitor_id IS NOT NULL AND v.visitor_id = p_visitor_id)
        OR
        (p_visitor_id IS NULL AND p_mobile_no IS NOT NULL AND v.mobile_no = p_mobile_no)
        OR
        (p_visitor_id IS NULL AND p_mobile_no IS NULL AND p_email_id IS NOT NULL AND v.email_id = p_email_id)
    LIMIT 1;

    IF visitor_data IS NULL THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Visitor not found'
        );
    END IF;

    RETURN json_build_object(
        'status', 'success',
        'data', visitor_data
    );
END;
$$;


SELECT column_name
FROM information_schema.columns
WHERE table_name = 'walkins'
ORDER BY ordinal_position;

drop function insert_walkin_appointment(VARCHAR,VARCHAR,)


	ALTER TABLE walkins ADD CONSTRAINT chk_assignment
CHECK (
    (officer_id IS NOT NULL AND helpdesk_id IS NULL)
 OR (officer_id IS NULL AND helpdesk_id IS NOT NULL)
);


-- insert walkin appointment:
CREATE OR REPLACE FUNCTION insert_walkin_appointment(
    /* 👤 Walk-in person */
    p_full_name VARCHAR,
    p_gender CHAR(1),
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,

    /* 🔗 References */
    p_visitor_id VARCHAR,
    p_organization_id VARCHAR,
    p_department_id VARCHAR,
    p_service_id VARCHAR,

    /* 📝 Appointment */
    p_purpose TEXT,
    p_walkin_date DATE,
    p_slot_time TIME,

    /* 📍 Location */
    p_state_code VARCHAR,

    /* 🔽 OPTIONAL PARAMETERS (ALL DEFAULTS AT END) */
    p_division_code VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_officer_id VARCHAR DEFAULT NULL,
    p_helpdesk_id VARCHAR DEFAULT NULL,
    p_insert_by VARCHAR DEFAULT NULL,
    p_insert_ip VARCHAR DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_walkin_id VARCHAR;
BEGIN
    /* 🚫 Assignment rule */
    IF (p_officer_id IS NULL AND p_helpdesk_id IS NULL)
       OR (p_officer_id IS NOT NULL AND p_helpdesk_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Provide either officer_id OR helpdesk_id (not both)';
    END IF;

    INSERT INTO walkins (
        full_name, gender, mobile_no, email_id,
        visitor_id, organization_id, department_id,
        officer_id, helpdesk_id,
        service_id, purpose, walkin_date, slot_time,
        status, remarks,
        state_code, division_code, district_code, taluka_code,
        insert_by, insert_ip
    )
    VALUES (
        p_full_name, p_gender, p_mobile_no, p_email_id,
        p_visitor_id, p_organization_id, p_department_id,
        p_officer_id, p_helpdesk_id,
        p_service_id, p_purpose, p_walkin_date, p_slot_time,
        'pending', NULL,
        p_state_code, p_division_code, p_district_code, p_taluka_code,
        p_insert_by, p_insert_ip
    )
    RETURNING walkin_id INTO v_walkin_id;

    RETURN v_walkin_id;
END;
$$;



-- analytics:
CREATE OR REPLACE FUNCTION get_walkins_trend(
    p_date_type TEXT DEFAULT 'day',
    p_state_code      VARCHAR DEFAULT NULL,
    p_division_code   VARCHAR DEFAULT NULL,
    p_district_code   VARCHAR DEFAULT NULL,
    p_taluka_code     VARCHAR DEFAULT NULL,
    p_from_date DATE DEFAULT NULL,
    p_to_date DATE DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_department_id   VARCHAR DEFAULT NULL,
    p_service_id      VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    period TEXT,
    count  BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        CASE
            WHEN p_date_type = 'day'
                THEN TO_CHAR(w.walkin_date, 'YYYY-MM-DD')
            WHEN p_date_type = 'month'
                THEN TO_CHAR(w.walkin_date, 'YYYY-MM')
            WHEN p_date_type = 'year'
                THEN TO_CHAR(w.walkin_date, 'YYYY')
            ELSE TO_CHAR(w.walkin_date, 'YYYY-MM-DD')
        END AS period,
        COUNT(*) AS count
    FROM walkins w
    WHERE 1 = 1
      AND (p_state_code      IS NULL OR w.state_code = p_state_code)
      AND (p_division_code   IS NULL OR w.division_code = p_division_code)
      AND (p_district_code   IS NULL OR w.district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR w.taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR w.organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR w.department_id = p_department_id)
      AND (p_service_id      IS NULL OR w.service_id = p_service_id)
      AND (p_from_date IS NULL OR w.walkin_date >= p_from_date)
      AND (p_to_date   IS NULL OR w.walkin_date <= p_to_date)
    GROUP BY period
    ORDER BY period;
$$;

CREATE OR REPLACE FUNCTION get_walkins_by_department(
    p_state_code        VARCHAR DEFAULT NULL,
    p_division_code     VARCHAR DEFAULT NULL,
    p_district_code     VARCHAR DEFAULT NULL,
    p_taluka_code       VARCHAR DEFAULT NULL,
    p_from_date         DATE DEFAULT NULL,
    p_to_date           DATE DEFAULT NULL,
    p_organization_id   VARCHAR DEFAULT NULL,
    p_department_id     VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    department_id   VARCHAR,
    department_name TEXT,
    count           BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        d.department_id,
        d.department_name,
        COUNT(w.walkin_id) AS count
    FROM walkins w
    JOIN m_department d
      ON w.department_id = d.department_id
    WHERE 1 = 1
      AND (p_state_code      IS NULL OR w.state_code = p_state_code)
      AND (p_division_code   IS NULL OR w.division_code = p_division_code)
      AND (p_district_code   IS NULL OR w.district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR w.taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR w.organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR w.department_id = p_department_id)
      AND (p_from_date IS NULL OR w.walkin_date >= p_from_date)
      AND (p_to_date   IS NULL OR w.walkin_date <= p_to_date)
    GROUP BY d.department_id, d.department_name
    ORDER BY count DESC;
$$;

CREATE OR REPLACE FUNCTION get_walkins_by_service(
    p_state_code        VARCHAR DEFAULT NULL,
    p_division_code     VARCHAR DEFAULT NULL,
    p_district_code     VARCHAR DEFAULT NULL,
    p_taluka_code       VARCHAR DEFAULT NULL,
    p_from_date         DATE DEFAULT NULL,
    p_to_date           DATE DEFAULT NULL,
    p_organization_id   VARCHAR DEFAULT NULL,
    p_department_id     VARCHAR DEFAULT NULL,
    p_service_id        VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    service_id   VARCHAR,
    service_name TEXT,
    count        BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        s.service_id,
        s.service_name,
        COUNT(w.walkin_id) AS count
    FROM walkins w
    JOIN m_services s
      ON w.service_id = s.service_id
    WHERE 1 = 1
      AND (p_state_code      IS NULL OR w.state_code = p_state_code)
      AND (p_division_code   IS NULL OR w.division_code = p_division_code)
      AND (p_district_code   IS NULL OR w.district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR w.taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR w.organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR w.department_id = p_department_id)
      AND (p_service_id      IS NULL OR w.service_id = p_service_id)
      AND (p_from_date IS NULL OR w.walkin_date >= p_from_date)
      AND (p_to_date   IS NULL OR w.walkin_date <= p_to_date)
    GROUP BY s.service_id, s.service_name
    ORDER BY count DESC;
$$;

CREATE OR REPLACE FUNCTION get_walkin_kpis(
    p_state_code      VARCHAR DEFAULT NULL,
    p_division_code   VARCHAR DEFAULT NULL,
    p_district_code   VARCHAR DEFAULT NULL,
    p_taluka_code     VARCHAR DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_department_id   VARCHAR DEFAULT NULL,
    p_from_date       DATE DEFAULT NULL,
    p_to_date         DATE DEFAULT NULL
)
RETURNS TABLE (
    total_walkins        BIGINT,
    today_walkins        BIGINT,
    approved_walkins     BIGINT,
    completed_walkins    BIGINT,
    pending_walkins      BIGINT,
    rejected_walkins     BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        COUNT(*) AS total_walkins,

        COUNT(*) FILTER (
            WHERE walkin_date = CURRENT_DATE
        ) AS today_walkins,

        COUNT(*) FILTER (
            WHERE status = 'approved'
        ) AS approved_walkins,

        COUNT(*) FILTER (
            WHERE status = 'completed'
        ) AS completed_walkins,

        COUNT(*) FILTER (
            WHERE status = 'pending'
        ) AS pending_walkins,

        COUNT(*) FILTER (
            WHERE status IN ('rejected', 'cancelled')
        ) AS rejected_walkins

    FROM walkins
    WHERE
        (p_state_code      IS NULL OR state_code = p_state_code)
        AND (p_division_code   IS NULL OR division_code = p_division_code)
        AND (p_district_code   IS NULL OR district_code = p_district_code)
        AND (p_taluka_code     IS NULL OR taluka_code = p_taluka_code)
        AND (p_organization_id IS NULL OR organization_id = p_organization_id)
        AND (p_department_id   IS NULL OR department_id = p_department_id)
        AND (p_from_date IS NULL OR walkin_date >= p_from_date)
        AND (p_to_date   IS NULL OR walkin_date <= p_to_date);
$$;

CREATE OR REPLACE FUNCTION get_application_appointment_kpis(
    p_state_code      VARCHAR DEFAULT NULL,
    p_division_code   VARCHAR DEFAULT NULL,
    p_district_code   VARCHAR DEFAULT NULL,
    p_taluka_code     VARCHAR DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_department_id   VARCHAR DEFAULT NULL,
    p_service_id      VARCHAR DEFAULT NULL,
    p_from_date       DATE DEFAULT NULL,
    p_to_date         DATE DEFAULT NULL
)
RETURNS TABLE (
    total_appointments        BIGINT,
    upcoming_appointments     BIGINT,
    completed_appointments    BIGINT,
    rejected_appointments     BIGINT,
    pending_appointments      BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        COUNT(*) AS total_appointments,
        COUNT(*) FILTER (WHERE status = 'approved') AS upcoming_appointments,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_appointments,
        COUNT(*) FILTER (WHERE status IN ('rejected','cancelled','no-show')) AS rejected_appointments,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_appointments
    FROM appointments
    WHERE is_active = TRUE
      AND (p_state_code      IS NULL OR state_code = p_state_code)
      AND (p_division_code   IS NULL OR division_code = p_division_code)
      AND (p_district_code   IS NULL OR district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR department_id = p_department_id)
      AND (p_service_id      IS NULL OR service_id = p_service_id)
      AND (p_from_date IS NULL OR appointment_date >= p_from_date)
      AND (p_to_date   IS NULL OR appointment_date <= p_to_date);
$$;


CREATE OR REPLACE FUNCTION get_application_appointments_trend(
    p_date_type TEXT DEFAULT 'month',
    p_state_code      VARCHAR DEFAULT NULL,
    p_division_code   VARCHAR DEFAULT NULL,
    p_district_code   VARCHAR DEFAULT NULL,
    p_taluka_code     VARCHAR DEFAULT NULL,
    p_from_date DATE DEFAULT NULL,
    p_to_date DATE DEFAULT NULL,
    p_organization_id VARCHAR DEFAULT NULL,
    p_department_id   VARCHAR DEFAULT NULL,
    p_service_id      VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    period TEXT,
    count BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        CASE
            WHEN p_date_type = 'today' THEN TO_CHAR(appointment_date, 'DD Mon')
            WHEN p_date_type = 'week'  THEN TO_CHAR(appointment_date, 'DD Mon')
            WHEN p_date_type = 'month' THEN TO_CHAR(appointment_date, 'Mon YYYY')
            WHEN p_date_type = 'year'  THEN TO_CHAR(appointment_date, 'YYYY')
            ELSE TO_CHAR(appointment_date, 'DD Mon')
        END AS period,
        COUNT(*) AS count
    FROM appointments
    WHERE is_active = TRUE
      AND (p_state_code      IS NULL OR state_code = p_state_code)
      AND (p_division_code   IS NULL OR division_code = p_division_code)
      AND (p_district_code   IS NULL OR district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR department_id = p_department_id)
      AND (p_service_id      IS NULL OR service_id = p_service_id)
      AND (p_from_date IS NULL OR appointment_date >= p_from_date)
      AND (p_to_date   IS NULL OR appointment_date <= p_to_date)
    GROUP BY period
    ORDER BY MIN(appointment_date);
$$;

CREATE OR REPLACE FUNCTION get_appointments_by_department(
    p_state_code        VARCHAR DEFAULT NULL,
    p_division_code     VARCHAR DEFAULT NULL,
    p_district_code     VARCHAR DEFAULT NULL,
    p_taluka_code       VARCHAR DEFAULT NULL,
    p_from_date         DATE DEFAULT NULL,
    p_to_date           DATE DEFAULT NULL,
    p_organization_id   VARCHAR DEFAULT NULL,
    p_department_id     VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    department_id   VARCHAR,
    department_name TEXT,
    count           BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        d.department_id,
        d.department_name,
        COUNT(a.appointment_id) AS count
    FROM appointments a
    JOIN m_department d
      ON a.department_id = d.department_id
    WHERE a.is_active = TRUE
      AND (p_state_code      IS NULL OR a.state_code = p_state_code)
      AND (p_division_code   IS NULL OR a.division_code = p_division_code)
      AND (p_district_code   IS NULL OR a.district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR a.taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR a.organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR a.department_id = p_department_id)
      AND (p_from_date IS NULL OR a.appointment_date >= p_from_date)
      AND (p_to_date   IS NULL OR a.appointment_date <= p_to_date)
    GROUP BY d.department_id, d.department_name
    ORDER BY count DESC;
$$;


CREATE OR REPLACE FUNCTION get_appointments_by_service(
    p_state_code        VARCHAR DEFAULT NULL,
    p_division_code     VARCHAR DEFAULT NULL,
    p_district_code     VARCHAR DEFAULT NULL,
    p_taluka_code       VARCHAR DEFAULT NULL,
    p_from_date         DATE DEFAULT NULL,
    p_to_date           DATE DEFAULT NULL,
    p_organization_id   VARCHAR DEFAULT NULL,
    p_department_id     VARCHAR DEFAULT NULL,
    p_service_id        VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    service_id   VARCHAR,
    service_name TEXT,
    count        BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        s.service_id,
        s.service_name,
        COUNT(a.appointment_id) AS count
    FROM appointments a
    JOIN m_services s
      ON a.service_id = s.service_id
    WHERE a.is_active = TRUE
      AND (p_state_code      IS NULL OR a.state_code = p_state_code)
      AND (p_division_code   IS NULL OR a.division_code = p_division_code)
      AND (p_district_code   IS NULL OR a.district_code = p_district_code)
      AND (p_taluka_code     IS NULL OR a.taluka_code = p_taluka_code)
      AND (p_organization_id IS NULL OR a.organization_id = p_organization_id)
      AND (p_department_id   IS NULL OR a.department_id = p_department_id)
      AND (p_service_id      IS NULL OR a.service_id = p_service_id)
      AND (p_from_date IS NULL OR a.appointment_date >= p_from_date)
      AND (p_to_date   IS NULL OR a.appointment_date <= p_to_date)
    GROUP BY s.service_id, s.service_name
    ORDER BY count DESC;
$$;

DROP FUNCTION create_walkin_appointment(character varying,character varying,character varying,character varying,character varying,text,date,time without time zone,character varying,character varying,character varying,character varying,character varying,character varying,character varying,character varying,character varying,text,character varying,character varying,timestamp without time zone)
ALTER TABLE walkins ALTER COLUMN officer_id DROP NOT NULL;
select *  from walkins

ALTER TABLE walkins
DROP COLUMN helpdesk_id;
ALTER TABLE notifications ADD COLUMN walkin_id VARCHAR REFERENCES walkins(walkin_id);

-- insert walkins main:
CREATE OR REPLACE FUNCTION create_walkin_appointment(
    /* 🔴 Mandatory parameters (NO defaults first) */
    p_visitor_id VARCHAR,
    p_organization_id VARCHAR,
    p_service_id VARCHAR,
    p_purpose TEXT,
    p_walkin_date DATE,
    p_slot_time TIME,
    p_insert_by VARCHAR,
    p_insert_ip VARCHAR,
    p_full_name VARCHAR,
    p_gender VARCHAR,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_state_code VARCHAR,
    p_division_code VARCHAR,
    p_officer_id VARCHAR,        -- officer OR helpdesk

    /* 🟢 Optional parameters (ALL defaults below) */
    p_department_id VARCHAR DEFAULT NULL,
    p_status VARCHAR DEFAULT 'pending',
    p_remarks TEXT DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL,
    p_insert_date TIMESTAMP DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_walkin_id VARCHAR;
    v_officer_name VARCHAR;
    v_visitor_username VARCHAR;
BEGIN
    /* 1️⃣ Insert walk-in */
    INSERT INTO walkins (
        visitor_id,
        organization_id,
        department_id,
        officer_id,
        service_id,
        purpose,
        walkin_date,
        slot_time,
        insert_by,
        insert_ip,
        full_name,
        gender,
        mobile_no,
        email_id,
        status,
        state_code,
        division_code,
        remarks,
        district_code,
        taluka_code,
        insert_date
    )
    VALUES (
        p_visitor_id,
        p_organization_id,
        p_department_id,          -- ✅ DEFAULT NULL
        p_officer_id,
        p_service_id,
        p_purpose,
        p_walkin_date,
        p_slot_time,
        p_insert_by,
        p_insert_ip,
        p_full_name,
        p_gender,
        p_mobile_no,
        p_email_id,
        p_status,
        p_state_code,
        p_division_code,
        p_remarks,
        p_district_code,
        p_taluka_code,
        COALESCE(p_insert_date, NOW())
    )
    RETURNING walkin_id INTO v_walkin_id;

    /* 2️⃣ Officer / Helpdesk name */
    SELECT full_name
    INTO v_officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    IF v_officer_name IS NULL THEN
        SELECT full_name
        INTO v_officer_name
        FROM m_helpdesk
        WHERE helpdesk_id = p_officer_id;
    END IF;

    /* 3️⃣ Visitor username */
    SELECT u.username
    INTO v_visitor_username
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE vs.visitor_id = p_visitor_id;

    /* 4️⃣ Notification */
    INSERT INTO notifications (
        username,
        walkin_id,
        title,
        message,
        type
    )
    VALUES (
        v_visitor_username,
        v_walkin_id,
        'Walk-in Created',
        'Your walk-in ' || v_walkin_id ||
        ' is created and pending approval from ' ||
        COALESCE(v_officer_name, 'officer'),
        'info'
    );

    RETURN v_walkin_id;
END;
$$;

select * from walkins
-- get helpdesk dashboard:main function working:
select * from get_helpdesk_dashboard_counts('HLP002')
	
	SELECT COUNT(*)
FROM walkins
WHERE walkin_date::date = CURRENT_DATE;

SELECT DISTINCT
  organization_id,
  department_id,
  state_code,
  division_code,
  district_code,
  taluka_code
FROM walkins
WHERE walkin_date::date = CURRENT_DATE;


CREATE OR REPLACE FUNCTION get_helpdesk_dashboard_counts(
    p_helpdesk_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_helpdesk RECORD;

    v_today_appointments INT := 0;
    v_pending INT := 0;
    v_completed INT := 0;
    v_rejected INT := 0;
    v_rescheduled INT := 0;
    v_walkins INT := 0;
BEGIN
    -- 1️⃣ Fetch helpdesk details
    SELECT *
    INTO v_helpdesk
    FROM m_helpdesk
    WHERE helpdesk_id = p_helpdesk_id
      AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Helpdesk not found or inactive';
    END IF;

    -- 2️⃣ Today’s Appointments
    SELECT COUNT(*)
    INTO v_today_appointments
    FROM appointments a
    WHERE a.organization_id = v_helpdesk.organization_id
      AND a.department_id = v_helpdesk.department_id
      AND a.state_code = v_helpdesk.state_code
      AND a.division_code = v_helpdesk.division_code
      AND a.district_code = v_helpdesk.district_code
      AND a.taluka_code = v_helpdesk.taluka_code
      AND a.is_active = true
      AND a.appointment_date = CURRENT_DATE;

   -- 3️⃣ Pending Appointments (FIXED)
SELECT COUNT(*)
INTO v_pending
FROM appointments a
WHERE a.organization_id = v_helpdesk.organization_id
  AND (a.department_id = v_helpdesk.department_id OR v_helpdesk.department_id IS NULL)
  AND a.state_code = v_helpdesk.state_code
  AND a.division_code = v_helpdesk.division_code
  AND a.district_code = v_helpdesk.district_code
  AND a.taluka_code = v_helpdesk.taluka_code
  AND a.is_active = true
  AND UPPER(a.status) = 'PENDING';

    -- 4️⃣ Completed Appointments
    SELECT COUNT(*)
    INTO v_completed
    FROM appointments a
    WHERE a.organization_id = v_helpdesk.organization_id
      AND a.department_id = v_helpdesk.department_id
      AND a.state_code = v_helpdesk.state_code
      AND a.division_code = v_helpdesk.division_code
      AND a.district_code = v_helpdesk.district_code
      AND a.taluka_code = v_helpdesk.taluka_code
      AND a.is_active = true
      AND a.status = 'COMPLETED';

    -- 5️⃣ Rejected Appointments
    SELECT COUNT(*)
    INTO v_rejected
    FROM appointments a
    WHERE a.organization_id = v_helpdesk.organization_id
      AND a.department_id = v_helpdesk.department_id
      AND a.state_code = v_helpdesk.state_code
      AND a.division_code = v_helpdesk.division_code
      AND a.district_code = v_helpdesk.district_code
      AND a.taluka_code = v_helpdesk.taluka_code
      AND a.is_active = true
      AND a.status = 'REJECTED';

    -- 6️⃣ Rescheduled Appointments
    SELECT COUNT(*)
    INTO v_rescheduled
    FROM appointments a
    WHERE a.organization_id = v_helpdesk.organization_id
      AND a.department_id = v_helpdesk.department_id
      AND a.state_code = v_helpdesk.state_code
      AND a.division_code = v_helpdesk.division_code
      AND a.district_code = v_helpdesk.district_code
      AND a.taluka_code = v_helpdesk.taluka_code
      AND a.is_active = true
      AND a.status = 'RESCHEDULED';

    -- 7️⃣ Walk-ins (Today) - FIXED
SELECT COUNT(*)
INTO v_walkins
FROM walkins w
WHERE w.organization_id = v_helpdesk.organization_id
  AND (w.department_id = v_helpdesk.department_id OR v_helpdesk.department_id IS NULL)
  AND w.state_code = v_helpdesk.state_code
  AND w.division_code = v_helpdesk.division_code
  AND w.district_code = v_helpdesk.district_code
  AND w.taluka_code = v_helpdesk.taluka_code
  AND w.walkin_date::date = CURRENT_DATE;

    -- 8️⃣ Return JSON
    RETURN json_build_object(
        'today_appointments', v_today_appointments,
        'pending_appointments', v_pending,
        'completed_appointments', v_completed,
        'rejected_appointments', v_rejected,
        'rescheduled_appointments', v_rescheduled,
        'walkins', v_walkins
    );
END;
$$;


SELECT status, is_active, COUNT(*)
FROM appointments
GROUP BY status, is_active;

ALTER TABLE m_slot_config
ALTER COLUMN department_id SET DEFAULT NULL;


-- admin slot config:

CREATE TABLE m_slot_config (
    slot_config_id SERIAL PRIMARY KEY,

    -- =========================
    -- ORG HIERARCHY
    -- =========================
    organization_id VARCHAR(10) NOT NULL,
    department_id   VARCHAR(10),
    service_id      VARCHAR(10),
    officer_id      VARCHAR(20),

    -- =========================
    -- LOCATION HIERARCHY
    -- =========================
    state_code    VARCHAR(2) NOT NULL,
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code   VARCHAR(4), -- NULL = applies to all talukas of district

    -- =========================
    -- SLOT RULES
    -- =========================
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,

    slot_duration_minutes INT NOT NULL CHECK (slot_duration_minutes > 0),
    buffer_minutes INT DEFAULT 0 CHECK (buffer_minutes >= 0),
    max_capacity INT NOT NULL CHECK (max_capacity > 0),

    -- =========================
    -- VALIDITY
    -- =========================
    effective_from DATE NOT NULL,
    effective_to   DATE,

    is_active BOOLEAN DEFAULT TRUE,

    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- =========================
    -- FOREIGN KEYS
    -- =========================
    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (department_id)   REFERENCES m_department(department_id),
    FOREIGN KEY (service_id)      REFERENCES m_services(service_id),
    FOREIGN KEY (officer_id)      REFERENCES m_officers(officer_id),

    FOREIGN KEY (state_code)      REFERENCES m_state(state_code),
    FOREIGN KEY (division_code)   REFERENCES m_division(division_code),
    FOREIGN KEY (district_code)   REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code)     REFERENCES m_taluka(taluka_code)
);


CREATE TABLE m_slot_breaks (
    break_id SERIAL PRIMARY KEY,

    slot_config_id INT NOT NULL,

    break_start TIME NOT NULL,
    break_end   TIME NOT NULL,

    reason VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,

    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (slot_config_id)
        REFERENCES m_slot_config(slot_config_id)
        ON DELETE CASCADE,

    CHECK (break_start < break_end)
);

CREATE TABLE m_slot_holidays (
    holiday_id SERIAL PRIMARY KEY,

    organization_id VARCHAR(10),
    department_id   VARCHAR(10),
    service_id      VARCHAR(10),

    state_code    VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code   VARCHAR(4),

    holiday_date DATE NOT NULL,
    description VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (department_id)   REFERENCES m_department(department_id),
    FOREIGN KEY (service_id)      REFERENCES m_services(service_id),

    FOREIGN KEY (state_code)      REFERENCES m_state(state_code),
    FOREIGN KEY (division_code)   REFERENCES m_division(division_code),
    FOREIGN KEY (district_code)   REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code)     REFERENCES m_taluka(taluka_code)
);

CREATE UNIQUE INDEX ux_slot_config_scope
ON m_slot_config (
    organization_id,
    department_id,
    service_id,
    officer_id,
    state_code,
    division_code,
    district_code,
    taluka_code,
    day_of_week,
    effective_from
);

SELECT * FROM get_available_slots(
    p_date => '2026-01-15',
    p_organization_id => 'ORG002',
    p_service_id => 'SER002',
    p_officer_id => 'OFF005',
    p_state_code => '27',
    p_division_code => '01',
    p_department_id => 'DEP002',
    p_district_code => '482',
    p_taluka_code => NULL
);

SELECT
  '2026-01-31'::date AS date,
  EXTRACT(DOW FROM '2026-01-31'::date) AS raw_dow,
  ((EXTRACT(DOW FROM '2026-01-31'::date)::INT + 6) % 7) + 1 AS normalized_dow;

SELECT slot_config_id, day_of_week
FROM m_slot_config
WHERE organization_id = 'ORG002'
  AND officer_id = 'OFF005'
  AND is_active = true;


SELECT proname, proargnames, proargtypes
FROM pg_proc
WHERE proname = 'get_available_slots';


select * from m_slot_config

SELECT
    slot_config_id,
    organization_id,
    service_id,
    department_id,
    day_of_week,
    start_time,
    end_time,
    is_active,
    effective_from,
    effective_to
FROM m_slot_config
WHERE district_code ='482'
  AND is_active = true;





SELECT DISTINCT day_of_week
FROM m_slot_config
WHERE organization_id = 'ORG002';






SELECT
  CURRENT_DATE,
  EXTRACT(DOW FROM CURRENT_DATE),
  ((EXTRACT(DOW FROM CURRENT_DATE)::INT + 6) % 7) + 1;




SELECT *
FROM m_slot_config
WHERE day_of_week = 3
  AND is_active = true;






SELECT
  slot_time,
  slot_end_time
FROM generate_time_slots(
  '09:00',
  '17:00',
  INTERVAL '15 minutes'
);

SELECT
  EXTRACT(DOW FROM DATE '2026-01-20') + 1 AS computed,
  day_of_week
FROM m_slot_config
WHERE organization_id = 'ORG013';

DROP FUNCTION get_available_slots(date,character varying,character varying,character varying,character varying,character varying,character varying,character varying,character varying)
-- get available slots:::
CREATE OR REPLACE FUNCTION get_available_slots(
    p_date DATE,
    p_organization_id VARCHAR,
    p_service_id VARCHAR,
    p_officer_id VARCHAR,
    p_state_code VARCHAR,
    p_division_code VARCHAR,
    p_department_id VARCHAR DEFAULT NULL,
    p_district_code VARCHAR DEFAULT NULL,
    p_taluka_code VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    slot_time TIME,
    slot_end_time TIME,
    used_count INT,
    max_capacity INT,
    is_available BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_day_of_week INT;
    v_slot_config m_slot_config;
BEGIN
    /* ✅ FIXED day_of_week */
    v_day_of_week := ((EXTRACT(DOW FROM p_date)::INT + 6) % 7) + 1;

    /* ✅ SLOT CONFIG */
    SELECT *
    INTO v_slot_config
    FROM m_slot_config
    WHERE is_active = TRUE
      AND organization_id = p_organization_id
      AND (officer_id = p_officer_id OR officer_id IS NULL)
      AND (service_id = p_service_id OR service_id IS NULL)
      AND (department_id = p_department_id OR department_id IS NULL)
      AND state_code = p_state_code
      AND (division_code = p_division_code OR division_code IS NULL)
      AND (district_code = p_district_code OR district_code IS NULL)
      AND (taluka_code = p_taluka_code OR taluka_code IS NULL)
      AND day_of_week = v_day_of_week
      AND p_date BETWEEN effective_from AND COALESCE(effective_to, p_date)
    ORDER BY
      (officer_id IS NOT NULL) DESC,
      (service_id IS NOT NULL) DESC,
      (department_id IS NOT NULL) DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    /* HOLIDAY CHECK */
    IF EXISTS (
        SELECT 1 FROM m_slot_holidays h
        WHERE h.holiday_date = p_date
          AND h.is_active = TRUE
          AND (h.organization_id = p_organization_id OR h.organization_id IS NULL)
    ) THEN
        RETURN;
    END IF;

    /* SLOT GENERATION */
    RETURN QUERY
    WITH generated_slots AS (
        SELECT
            gs AS slot_ts,
            gs + (v_slot_config.slot_duration_minutes || ' minutes')::INTERVAL AS slot_end_ts
        FROM generate_series(
            p_date + v_slot_config.start_time,
            p_date + v_slot_config.end_time
              - (v_slot_config.slot_duration_minutes || ' minutes')::INTERVAL,
            (v_slot_config.slot_duration_minutes + v_slot_config.buffer_minutes || ' minutes')::INTERVAL
        ) gs
    ),
    appointment_counts AS (
        SELECT a.slot_time AS slot_ts, COUNT(*) cnt
        FROM appointments a
        WHERE a.appointment_date = p_date
          AND a.officer_id = p_officer_id
          AND a.status IN ('pending','approved','rescheduled')
        GROUP BY a.slot_time
    ),
    walkin_counts AS (
        SELECT w.slot_time AS slot_ts, COUNT(*) cnt
        FROM walkins w
        WHERE w.walkin_date = p_date
          AND w.officer_id = p_officer_id
          AND w.status IN ('pending','approved','rescheduled')
        GROUP BY w.slot_time
    ),
    total_usage AS (
        SELECT
            COALESCE(a.slot_ts, w.slot_ts) slot_ts,
            COALESCE(a.cnt,0) + COALESCE(w.cnt,0) used_count
        FROM appointment_counts a
        FULL JOIN walkin_counts w ON a.slot_ts = w.slot_ts
    )
    SELECT
        g.slot_ts::TIME,
        g.slot_end_ts::TIME,
        COALESCE(t.used_count,0)::INT,
        v_slot_config.max_capacity,
        COALESCE(t.used_count,0) < v_slot_config.max_capacity
    FROM generated_slots g
    LEFT JOIN total_usage t ON t.slot_ts = g.slot_ts::TIME
    WHERE p_date > CURRENT_DATE OR g.slot_ts::TIME > CURRENT_TIME
    ORDER BY g.slot_ts;
END;
$$;

select * from appointments;

SELECT slot_config_id, officer_id
FROM m_slot_config
WHERE organization_id = 'ORG002';

delete from m_slot_config;


select * from m_slot_config;
----------------------------------------------------------------

INSERT INTO m_slot_config (
    organization_id, department_id, service_id, officer_id,
    state_code, division_code, district_code, taluka_code,
    day_of_week, start_time, end_time,
    slot_duration_minutes, buffer_minutes, max_capacity,
    effective_from
)
VALUES (
    'ORG001', NULL, NULL, NULL,
    '27', NULL, NULL, NULL,
    1, '09:00', '10:00',
    15, 0, 1,
    CURRENT_DATE
);
Select * from m_slot_config
INSERT INTO m_slot_breaks (slot_config_id, break_start, break_end, reason)
VALUES (1, '13:00', '14:00', 'Lunch break');

INSERT INTO m_slot_holidays (organization_id, state_code, holiday_date, description)
VALUES ('ORG001', '27', '2026-01-26', 'Republic Day');

------------------------


CREATE OR REPLACE FUNCTION check_slot_config_conflict(
    p_organization_id VARCHAR,
    p_department_id   VARCHAR,
    p_service_id      VARCHAR,
    p_officer_id      VARCHAR,

    p_state_code    VARCHAR,
    p_division_code VARCHAR,
    p_district_code VARCHAR,
    p_taluka_code   VARCHAR,

    p_day_of_week SMALLINT,
    p_start_time TIME,
    p_end_time TIME,

    p_effective_from DATE,
    p_effective_to   DATE,

    p_slot_config_id INT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM m_slot_config c
        WHERE c.is_active = TRUE
          AND (p_slot_config_id IS NULL OR c.slot_config_id <> p_slot_config_id)

          AND c.organization_id = p_organization_id
          AND (c.department_id = p_department_id OR c.department_id IS NULL)
          AND (c.service_id = p_service_id OR c.service_id IS NULL)
          AND (c.officer_id = p_officer_id OR c.officer_id IS NULL)

          AND c.state_code = p_state_code
          AND (c.division_code = p_division_code OR c.division_code IS NULL)
          AND (c.district_code = p_district_code OR c.district_code IS NULL)
          AND (c.taluka_code = p_taluka_code OR c.taluka_code IS NULL)

          AND c.day_of_week = p_day_of_week

          -- ⏰ time overlap
          AND c.start_time < p_end_time
          AND c.end_time > p_start_time

          -- 📅 date overlap
          AND daterange(c.effective_from, COALESCE(c.effective_to, 'infinity')) &&
              daterange(p_effective_from, COALESCE(p_effective_to, 'infinity'))
    );
END;
$$;

CREATE OR REPLACE FUNCTION create_slot_config(
    p_organization_id VARCHAR,
    p_department_id   VARCHAR,
    p_service_id      VARCHAR,
    p_officer_id      VARCHAR,

    p_state_code    VARCHAR,
    p_division_code VARCHAR,
    p_district_code VARCHAR,
    p_taluka_code   VARCHAR,

    p_day_of_week SMALLINT,
    p_start_time TIME,
    p_end_time TIME,

    p_slot_duration_minutes INT,
    p_buffer_minutes INT,
    p_max_capacity INT,

    p_effective_from DATE,
    p_effective_to   DATE,

    p_breaks JSONB
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_slot_config_id INT;
    b JSONB;
BEGIN
    -- 🔒 Conflict check
    IF check_slot_config_conflict(
        p_organization_id, p_department_id, p_service_id, p_officer_id,
        p_state_code, p_division_code, p_district_code, p_taluka_code,
        p_day_of_week, p_start_time, p_end_time,
        p_effective_from, p_effective_to,
        NULL
    ) THEN
        RAISE EXCEPTION 'Slot configuration conflict detected';
    END IF;

    INSERT INTO m_slot_config (
        organization_id, department_id, service_id, officer_id,
        state_code, division_code, district_code, taluka_code,
        day_of_week, start_time, end_time,
        slot_duration_minutes, buffer_minutes, max_capacity,
        effective_from, effective_to
    )
    VALUES (
        p_organization_id, p_department_id, p_service_id, p_officer_id,
        p_state_code, p_division_code, p_district_code, p_taluka_code,
        p_day_of_week, p_start_time, p_end_time,
        p_slot_duration_minutes, p_buffer_minutes, p_max_capacity,
        p_effective_from, p_effective_to
    )
    RETURNING slot_config_id INTO v_slot_config_id;

    -- ⏸ Insert breaks
    IF p_breaks IS NOT NULL THEN
        FOR b IN SELECT * FROM jsonb_array_elements(p_breaks)
        LOOP
            INSERT INTO m_slot_breaks (
                slot_config_id,
                break_start,
                break_end,
                reason
            )
            VALUES (
                v_slot_config_id,
                (b->>'from')::TIME,
                (b->>'to')::TIME,
                b->>'reason'
            );
        END LOOP;
    END IF;

    RETURN v_slot_config_id;
END;
$$;

SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'get_available_slots';

DROP FUNCTION IF EXISTS get_available_slots(
    VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE
);


-- get current slots:
CREATE OR REPLACE FUNCTION get_available_slots(
    -- REQUIRED
    p_organization_id VARCHAR,
    p_service_id      VARCHAR,
    p_date            DATE,

    -- OPTIONAL
    p_department_id   VARCHAR DEFAULT NULL,
    p_state_code      VARCHAR DEFAULT NULL,
    p_division_code   VARCHAR DEFAULT NULL,
    p_district_code   VARCHAR DEFAULT NULL,
    p_taluka_code     VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    slot_config_id INT,
    slot_start_time TIME,
    slot_end_time   TIME,
    max_capacity INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.slot_config_id,
        gs.slot_start_ts::TIME AS slot_start_time,
        (gs.slot_start_ts
            + make_interval(mins => sc.slot_duration_minutes)
        )::TIME AS slot_end_time,
        sc.max_capacity
    FROM m_slot_config sc
    CROSS JOIN LATERAL generate_series(
        -- START TIMESTAMP
        (p_date::timestamp + sc.start_time),

        -- LAST POSSIBLE SLOT START
        (p_date::timestamp + sc.end_time)
            - make_interval(mins => sc.slot_duration_minutes),

        -- STEP = SLOT + BUFFER
        make_interval(mins => sc.slot_duration_minutes + sc.buffer_minutes)
    ) AS gs(slot_start_ts)
    WHERE
        sc.organization_id = p_organization_id
        AND sc.service_id = p_service_id

        AND (p_department_id IS NULL OR sc.department_id = p_department_id)

        AND (p_state_code IS NULL OR sc.state_code = p_state_code)
        AND (p_division_code IS NULL OR sc.division_code = p_division_code)
        AND (p_district_code IS NULL OR sc.district_code = p_district_code)
        AND (p_taluka_code IS NULL OR sc.taluka_code = p_taluka_code)

        AND sc.day_of_week = EXTRACT(DOW FROM p_date)
        AND p_date BETWEEN sc.effective_from AND sc.effective_to;
END;
$$;



---------
CREATE OR REPLACE FUNCTION deactivate_slot_config(
    p_slot_config_id INT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE m_slot_config
    SET is_active = FALSE
    WHERE slot_config_id = p_slot_config_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_slot_configs()
RETURNS TABLE (
    slot_config_id INT,

    organization_id VARCHAR,
    organization_name VARCHAR,

    department_id VARCHAR,
    department_name VARCHAR,

    service_id VARCHAR,
    service_name VARCHAR,

    officer_id VARCHAR,
    officer_name VARCHAR,

    state_code VARCHAR,
    state_name VARCHAR,

    division_code VARCHAR,
    division_name VARCHAR,

    district_code VARCHAR,
    district_name VARCHAR,

    taluka_code VARCHAR,
    taluka_name VARCHAR,

    day_of_week SMALLINT,

    start_time TIME,
    end_time TIME,

    slot_duration_minutes INT,
    buffer_minutes INT,
    max_capacity INT,

    effective_from DATE,
    effective_to DATE,

    is_active BOOLEAN
)
LANGUAGE sql
AS $$
SELECT
    sc.slot_config_id,

    sc.organization_id,
    org.organization_name,

    sc.department_id,
    dept.department_name,

    sc.service_id,
    srv.service_name,

    sc.officer_id,
    off.full_name,

    sc.state_code,
    st.state_name,

    sc.division_code,
    div.division_name,

    sc.district_code,
    dist.district_name,

    sc.taluka_code,
    tal.taluka_name,

    sc.day_of_week,

    sc.start_time,
    sc.end_time,

    sc.slot_duration_minutes,
    sc.buffer_minutes,
    sc.max_capacity,

    sc.effective_from,
    sc.effective_to,

    sc.is_active
FROM m_slot_config sc
LEFT JOIN m_organization org ON org.organization_id = sc.organization_id
LEFT JOIN m_department dept ON dept.department_id = sc.department_id
LEFT JOIN m_services srv ON srv.service_id = sc.service_id
LEFT JOIN m_officers off ON off.officer_id = sc.officer_id

LEFT JOIN m_state st ON st.state_code = sc.state_code
LEFT JOIN m_division div ON div.division_code = sc.division_code
LEFT JOIN m_district dist ON dist.district_code = sc.district_code
LEFT JOIN m_taluka tal ON tal.taluka_code = sc.taluka_code

ORDER BY sc.insert_date DESC;
$$;
select * from m_organization

select * from m_department
CREATE OR REPLACE FUNCTION preview_generated_slots(
    p_start_time TIME,
    p_end_time TIME,
    p_slot_minutes INT,
    p_buffer_minutes INT
)
RETURNS TABLE (
    slot_time TIME,
    slot_end_time TIME
)
LANGUAGE sql
AS $$
SELECT
    gs::TIME AS slot_time,
    (gs + (p_slot_minutes || ' minutes')::INTERVAL)::TIME AS slot_end_time
FROM generate_series(
    TIMESTAMP '1970-01-01' + p_start_time,
    TIMESTAMP '1970-01-01' + p_end_time
        - (p_slot_minutes || ' minutes')::INTERVAL,
    (p_slot_minutes + p_buffer_minutes || ' minutes')::INTERVAL
) gs
ORDER BY gs;
$$;


Select * from m_slot_config

CREATE OR REPLACE FUNCTION change_officer_password(
    p_officer_id VARCHAR,
    p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id VARCHAR;
BEGIN
    -- Get user_id linked to officer
    SELECT user_id
    INTO v_user_id
    FROM m_officers
    WHERE officer_id = p_officer_id;

    -- Officer not found
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update password in m_users
    UPDATE m_users
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE user_id = v_user_id;

    RETURN TRUE;
END;
$$;

alter table m_helpdesk add column gender varchar(10);
alter table m_helpdesk add column address varchar(255);
alter table m_helpdesk add column pincode varchar(06);
alter table m_helpdesk add column officer_state_code varchar(02);
alter table m_helpdesk add column officer_division_code varchar(02);
alter table m_helpdesk add column officer_district_code varchar(03);
alter table m_helpdesk add column officer_taluka_code varchar(04);
alter table m_helpdesk add column officer_pincode varchar(06);

SELECT change_officer_password('OFF014', 'Rahul@123');


CREATE OR REPLACE FUNCTION get_officer_dashboard(p_officer_id VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'full_name', o.full_name,
    'designation', COALESCE(o.designation_code, ''),

    'stats', json_build_object(
      'today', (
        SELECT COUNT(*)
        FROM appointments
        WHERE officer_id = p_officer_id
          AND DATE(appointment_date) = CURRENT_DATE
      ),
      'pending', (
        SELECT COUNT(*)
        FROM appointments
        WHERE officer_id = p_officer_id
          AND status = 'pending'
      ),
      'completed', (
        SELECT COUNT(*)
        FROM appointments
        WHERE officer_id = p_officer_id
          AND status = 'completed'
      ),
      'rescheduled', (
        SELECT COUNT(*)
        FROM appointments
        WHERE officer_id = p_officer_id
          AND status = 'rescheduled'
      ),
      'walkins', (
        SELECT COUNT(*)
        FROM walkins
        WHERE officer_id = p_officer_id
      )
    ),

    'today_appointments', (
      SELECT COALESCE(json_agg(t), '[]'::json)
      FROM (
        SELECT
          a.appointment_id,
          a.visitor_id,
          a.purpose,
          a.status,
          a.appointment_date,
          a.slot_time,
          v.full_name        AS visitor_name,
          v.mobile_no        AS visitor_mobile,
          v.email_id         AS visitor_email,
          s.service_name,
          d.department_name,
          org.organization_name
        FROM appointments a
        LEFT JOIN m_visitors_signup v ON a.visitor_id = v.visitor_id
        LEFT JOIN m_services s ON a.service_id = s.service_id
        LEFT JOIN m_department d ON a.department_id = d.department_id
        LEFT JOIN m_organization org ON a.organization_id = org.organization_id
        WHERE a.officer_id = p_officer_id
          AND DATE(a.appointment_date) = CURRENT_DATE
        ORDER BY a.slot_time
      ) t
    ),

    'pending_appointments', (
      SELECT COALESCE(json_agg(p), '[]'::json)
      FROM (
        SELECT *
        FROM appointments
        WHERE officer_id = p_officer_id
          AND status = 'pending'
        ORDER BY appointment_date, slot_time
        LIMIT 20
      ) p
    ),

    'rescheduled_appointments', (
      SELECT COALESCE(json_agg(r), '[]'::json)
      FROM (
        SELECT *
        FROM appointments
        WHERE officer_id = p_officer_id
          AND status = 'rescheduled'
        ORDER BY appointment_date, slot_time
        LIMIT 20
      ) r
    ),

    'completed_appointments', (
      SELECT COALESCE(json_agg(c), '[]'::json)
      FROM (
        SELECT *
        FROM appointments
        WHERE officer_id = p_officer_id
          AND status = 'completed'
        ORDER BY updated_date DESC
        LIMIT 20
      ) c
    ),

    'walkin_appointments', (
      SELECT COALESCE(json_agg(w), '[]'::json)
      FROM (
        SELECT
          walkin_id AS appointment_id,
          full_name AS visitor_name,
          mobile_no AS visitor_mobile,
          email_id  AS visitor_email,
          purpose,
          status,
          COALESCE(walkin_date) AS appointment_date,
          slot_time AS slot_time
        FROM walkins
        WHERE officer_id = p_officer_id
        ORDER BY COALESCE(walkin_date) DESC
        LIMIT 20
      ) w
    ),

    'recent_activity', (
      SELECT COALESCE(json_agg(r), '[]'::json)
      FROM (
        SELECT
          a.appointment_id,
          a.purpose,
          a.status,
          a.appointment_date,
          a.slot_time,
          v.full_name AS visitor_name,
          COALESCE(a.updated_date, a.insert_date) AS activity_date
        FROM appointments a
        LEFT JOIN m_visitors_signup v ON a.visitor_id = v.visitor_id
        WHERE a.officer_id = p_officer_id
        ORDER BY COALESCE(a.updated_date, a.insert_date) DESC
        LIMIT 5
      ) r
    )
  )
  INTO result
  FROM m_officers o
  WHERE o.officer_id = p_officer_id;

  RETURN result;
END;
$$;
select * from get_officer_dashboard('OFF005')
-- new function:
CREATE OR REPLACE FUNCTION get_officer_dashboard(p_officer_id VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'full_name', o.full_name,
    'designation', COALESCE(o.designation_code, ''),

    /* =======================
       STATS
       ======================= */
    'stats', json_build_object(

      /* Today (appointments + walkins) */
      'today',
      (
        SELECT COUNT(*) FROM (
          SELECT appointment_id
          FROM appointments
          WHERE officer_id = p_officer_id
            AND appointment_date::date = CURRENT_DATE

          UNION ALL

          SELECT walkin_id
          FROM walkins
          WHERE officer_id = p_officer_id
            AND walkin_date::date = CURRENT_DATE
        ) t
      ),

      /* Pending – LAST 7 DAYS (appointments + walkins) */
      'pending',
(
  SELECT COUNT(*) FROM (
    SELECT appointment_id
    FROM appointments
    WHERE officer_id = p_officer_id
      AND status = 'pending'
      AND appointment_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 5

    UNION ALL

    SELECT walkin_id
    FROM walkins
    WHERE officer_id = p_officer_id
      AND status = 'pending'
      AND walkin_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 5
  ) x
),

      /* Completed – TODAY (appointments + walkins) */
      'completed',
      (
        SELECT COUNT(*) FROM (
          SELECT appointment_id
          FROM appointments
          WHERE officer_id = p_officer_id
            AND status = 'completed'
            AND appointment_date::date = CURRENT_DATE

          UNION ALL

          SELECT walkin_id
          FROM walkins
          WHERE officer_id = p_officer_id
            AND status = 'completed'
            AND walkin_date::date = CURRENT_DATE
        ) c
      ),

      /* Rescheduled – TODAY (appointments + walkins) */
      'rescheduled',
      (
        SELECT COUNT(*) FROM (
          SELECT appointment_id
          FROM appointments
          WHERE officer_id = p_officer_id
            AND status = 'rescheduled'
            AND appointment_date::date = CURRENT_DATE

          UNION ALL

          SELECT walkin_id
          FROM walkins
          WHERE officer_id = p_officer_id
            AND status = 'rescheduled'
            AND walkin_date::date = CURRENT_DATE
        ) r
      ),

      /* Walkins – TODAY */
      'walkins',
      (
        SELECT COUNT(*)
        FROM walkins
        WHERE officer_id = p_officer_id
          AND walkin_date::date = CURRENT_DATE
      )
    ),

    /* =======================
       LISTS (Appointments + Walkins combined)
       ======================= */

    /* ✅ TODAY LIST (Appointments + Walkins) */
    'today_appointments',
    (
      SELECT COALESCE(json_agg(x ORDER BY x.slot_time), '[]'::json)
      FROM (
        /* Appointments */
        SELECT
          ap.appointment_id AS appointment_id,
          ap.visitor_id,
          v.full_name AS visitor_name,
          v.mobile_no AS visitor_mobile,
          v.email_id  AS visitor_email,
          ap.purpose,
          ap.status,
          ap.appointment_date AS appointment_date,
          ap.slot_time,
          'APPOINTMENT'::TEXT AS source_type
        FROM appointments ap
        LEFT JOIN m_visitors_signup v ON v.visitor_id = ap.visitor_id
        WHERE ap.officer_id = p_officer_id
          AND ap.appointment_date::date = CURRENT_DATE

        UNION ALL

        /* Walkins */
        SELECT
          w.walkin_id AS appointment_id,
          w.visitor_id,
          w.full_name AS visitor_name,
          w.mobile_no AS visitor_mobile,
          w.email_id  AS visitor_email,
          w.purpose,
          w.status,
          w.walkin_date AS appointment_date,
          w.slot_time,
          'WALKIN'::TEXT AS source_type
        FROM walkins w
        WHERE w.officer_id = p_officer_id
          AND w.walkin_date::date = CURRENT_DATE
      ) x
    ),

    /* ✅ PENDING LIST – LAST 7 DAYS (Appointments + Walkins) */
    'pending_appointments',
(
  SELECT COALESCE(json_agg(x ORDER BY x.appointment_date, x.slot_time), '[]'::json)
  FROM (
    /* ✅ Appointments */
    SELECT
      ap.appointment_id AS appointment_id,
      ap.visitor_id,
      v.full_name AS visitor_name,
      v.mobile_no AS visitor_mobile,
      v.email_id  AS visitor_email,
      ap.purpose,
      ap.status,
      ap.appointment_date AS appointment_date,
      ap.slot_time,
      'APPOINTMENT'::TEXT AS source_type
    FROM appointments ap
    LEFT JOIN m_visitors_signup v ON v.visitor_id = ap.visitor_id
    WHERE ap.officer_id = p_officer_id
      AND ap.status = 'pending'
      AND ap.appointment_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 5

    UNION ALL

    /* ✅ Walkins */
    SELECT
      w.walkin_id AS appointment_id,
      w.visitor_id,
      w.full_name AS visitor_name,
      w.mobile_no AS visitor_mobile,
      w.email_id  AS visitor_email,
      w.purpose,
      w.status,
      w.walkin_date AS appointment_date,
      w.slot_time,
      'WALKIN'::TEXT AS source_type
    FROM walkins w
    WHERE w.officer_id = p_officer_id
      AND w.status = 'pending'
      AND w.walkin_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 5
  ) x
  LIMIT 50
),

    /* ✅ RESCHEDULED LIST – TODAY (Appointments + Walkins) */
    'rescheduled_appointments',
    (
      SELECT COALESCE(json_agg(x ORDER BY x.slot_time), '[]'::json)
      FROM (
        /* Appointments */
        SELECT
          ap.appointment_id AS appointment_id,
          ap.visitor_id,
          v.full_name AS visitor_name,
          v.mobile_no AS visitor_mobile,
          v.email_id  AS visitor_email,
          ap.purpose,
          ap.status,
          ap.appointment_date AS appointment_date,
          ap.slot_time,
          'APPOINTMENT'::TEXT AS source_type
        FROM appointments ap
        LEFT JOIN m_visitors_signup v ON v.visitor_id = ap.visitor_id
        WHERE ap.officer_id = p_officer_id
          AND ap.status = 'rescheduled'
          AND ap.appointment_date::date = CURRENT_DATE

        UNION ALL

        /* Walkins */
        SELECT
          w.walkin_id AS appointment_id,
          w.visitor_id,
          w.full_name AS visitor_name,
          w.mobile_no AS visitor_mobile,
          w.email_id  AS visitor_email,
          w.purpose,
          w.status,
          w.walkin_date AS appointment_date,
          w.slot_time,
          'WALKIN'::TEXT AS source_type
        FROM walkins w
        WHERE w.officer_id = p_officer_id
          AND w.status = 'rescheduled'
          AND w.walkin_date::date = CURRENT_DATE
      ) x
      LIMIT 50
    ),

    /* ✅ COMPLETED LIST – TODAY (Appointments + Walkins) */
    'completed_appointments',
    (
      SELECT COALESCE(json_agg(x ORDER BY x.slot_time), '[]'::json)
      FROM (
        /* Appointments */
        SELECT
          ap.appointment_id AS appointment_id,
          ap.visitor_id,
          v.full_name AS visitor_name,
          v.mobile_no AS visitor_mobile,
          v.email_id  AS visitor_email,
          ap.purpose,
          ap.status,
          ap.appointment_date AS appointment_date,
          ap.slot_time,
          'APPOINTMENT'::TEXT AS source_type
        FROM appointments ap
        LEFT JOIN m_visitors_signup v ON v.visitor_id = ap.visitor_id
        WHERE ap.officer_id = p_officer_id
          AND ap.status = 'completed'
          AND ap.appointment_date::date = CURRENT_DATE

        UNION ALL

        /* Walkins */
        SELECT
          w.walkin_id AS appointment_id,
          w.visitor_id,
          w.full_name AS visitor_name,
          w.mobile_no AS visitor_mobile,
          w.email_id  AS visitor_email,
          w.purpose,
          w.status,
          w.walkin_date AS appointment_date,
          w.slot_time,
          'WALKIN'::TEXT AS source_type
        FROM walkins w
        WHERE w.officer_id = p_officer_id
          AND w.status = 'completed'
          AND w.walkin_date::date = CURRENT_DATE
      ) x
      LIMIT 50
    ),

    /* OPTIONAL: keep walkins separately also */
    'walkin_appointments',
    (
      SELECT COALESCE(json_agg(w ORDER BY w.slot_time), '[]'::json)
      FROM (
        SELECT
          walkin_id AS appointment_id,
          visitor_id,
          full_name AS visitor_name,
          mobile_no AS visitor_mobile,
          email_id  AS visitor_email,
          purpose,
          status,
          walkin_date AS appointment_date,
          slot_time,
          'WALKIN'::TEXT AS source_type
        FROM walkins
        WHERE officer_id = p_officer_id
          AND walkin_date::date = CURRENT_DATE
      ) w
    )

  )
  INTO result
  FROM m_officers o
  WHERE o.officer_id = p_officer_id;

  RETURN result;
END;
$$;

select * from walkins;



CREATE OR REPLACE FUNCTION update_appointment_status(
    p_appointment_id VARCHAR,
    p_status VARCHAR,
    p_officer_id VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_updated_row appointments%ROWTYPE;
    visitor_username VARCHAR;
    officer_name TEXT;
    v_message TEXT;
    v_title TEXT;
    v_type TEXT;
BEGIN
    -- 1️⃣ Validate required inputs
    IF p_appointment_id IS NULL
       OR p_status IS NULL
       OR p_officer_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Appointment ID, status, and officer ID are required'
        );
    END IF;

    -- 2️⃣ Validate status (ONLY allowed states)
    IF LOWER(p_status) NOT IN ('approved', 'rejected', 'completed') THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Invalid status. Must be approved, rejected, or completed'
        );
    END IF;

    -- 3️⃣ Verify appointment belongs to officer
    IF NOT EXISTS (
        SELECT 1
        FROM appointments
        WHERE appointment_id = p_appointment_id
          AND officer_id = p_officer_id
    ) THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Appointment not found or does not belong to this officer'
        );
    END IF;

    -- 4️⃣ Fetch visitor username
    SELECT visitor_id
    INTO visitor_username
    FROM appointments
    WHERE appointment_id = p_appointment_id;

    -- 5️⃣ Fetch officer name
    SELECT full_name
    INTO officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    -- 6️⃣ Update appointment
    UPDATE appointments
    SET
        status = LOWER(p_status),
        updated_date = NOW(),
        update_by = p_officer_id,
        reschedule_reason = p_reason
    WHERE appointment_id = p_appointment_id
    RETURNING * INTO v_updated_row;

    -- 7️⃣ Build notification (status-specific)
    CASE LOWER(p_status)
        WHEN 'approved' THEN
            v_title   := 'Appointment Approved';
            v_message := 'Your appointment ' || p_appointment_id ||
                         ' has been approved by ' ||
                         COALESCE(officer_name, 'Helpdesk');
            v_type := 'success';

        WHEN 'rejected' THEN
            v_title   := 'Appointment Rejected';
            v_message := 'Your appointment ' || p_appointment_id ||
                         ' has been rejected by ' ||
                         COALESCE(officer_name, 'Helpdesk') ||
                         CASE
                             WHEN p_reason IS NOT NULL THEN
                                 '. Reason: ' || p_reason
                             ELSE ''
                         END;
            v_type := 'error';

        WHEN 'completed' THEN
            v_title   := 'Appointment Completed';
            v_message := 'Your appointment ' || p_appointment_id ||
                         ' has been completed by ' ||
                         COALESCE(officer_name, 'Helpdesk') ||
                         CASE
                             WHEN p_reason IS NOT NULL THEN
                                 '. Remark: ' || p_reason
                             ELSE ''
                         END;
            v_type := 'info';
    END CASE;

    -- 8️⃣ Insert notification
    INSERT INTO notifications (
        username,
        appointment_id,
        title,
        message,
        type
    )
    VALUES (
        visitor_username,
        p_appointment_id,
        v_title,
        v_message,
        v_type
    );

    -- 9️⃣ Return success JSON
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Appointment ' || LOWER(p_status) || ' successfully',
        'data', row_to_json(v_updated_row)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Error updating appointment: ' || SQLERRM
        );
END;
$$;
-- 
SELECT * FROM NOTIFICATIONS
select * from update_appointment_status('W00019','approved','OFF005','meet')
ALTER TABLE walkins 
	ADD column update_by VARCHAR DEFAULT NULL;
-- update for both:walkins + app
CREATE OR REPLACE FUNCTION update_appointment_status(
    p_appointment_id VARCHAR,
    p_status VARCHAR,
    p_officer_id VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_updated_appointment appointments%ROWTYPE;
    v_updated_walkin      walkins%ROWTYPE;

    visitor_username VARCHAR;
    officer_name TEXT;
    v_message TEXT;
    v_title TEXT;
    v_type TEXT;

    v_is_appointment BOOLEAN := FALSE;
    v_is_walkin      BOOLEAN := FALSE;
BEGIN
    /* 1️⃣ Validate required inputs */
    IF p_appointment_id IS NULL
       OR p_status IS NULL
       OR p_officer_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Appointment ID, status, and officer ID are required'
        );
    END IF;

    /* 2️⃣ Validate status */
    IF LOWER(p_status) NOT IN ('approved', 'rejected', 'completed') THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Invalid status. Must be approved, rejected, or completed'
        );
    END IF;

    /* 3️⃣ Check where this ID belongs (appointments / walkins) */
    SELECT EXISTS (
        SELECT 1
        FROM appointments
        WHERE appointment_id = p_appointment_id
          AND officer_id = p_officer_id
    )
    INTO v_is_appointment;

    SELECT EXISTS (
        SELECT 1
        FROM walkins
        WHERE walkin_id = p_appointment_id
          AND officer_id = p_officer_id
    )
    INTO v_is_walkin;

    IF NOT v_is_appointment AND NOT v_is_walkin THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Appointment/Walk-in not found or does not belong to this officer'
        );
    END IF;

    /* 4️⃣ Get visitor username (from correct table) */
    IF v_is_appointment THEN
        SELECT visitor_id
        INTO visitor_username
        FROM appointments
        WHERE appointment_id = p_appointment_id;
    ELSE
        SELECT visitor_id
        INTO visitor_username
        FROM walkins
        WHERE walkin_id = p_appointment_id;
    END IF;

    /* 5️⃣ Fetch officer name */
    SELECT full_name
    INTO officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    /* 6️⃣ Update Appointment / Walk-in */
    IF v_is_appointment THEN

        UPDATE appointments
        SET
            status = LOWER(p_status),
            updated_date = NOW(),
            update_by = p_officer_id,
            reschedule_reason = p_reason
        WHERE appointment_id = p_appointment_id
        RETURNING * INTO v_updated_appointment;

    ELSE

        UPDATE walkins
        SET
            status = LOWER(p_status),
            updated_date = NOW(),
            update_by = p_officer_id,
            reschedule_reason = p_reason
        WHERE walkin_id = p_appointment_id
        RETURNING * INTO v_updated_walkin;

    END IF;

    /* 7️⃣ Build notification */
    CASE LOWER(p_status)
        WHEN 'approved' THEN
            v_title   := 'Appointment Approved';
            v_message := 'Your appointment ' || p_appointment_id ||
                         ' has been approved by ' ||
                         COALESCE(officer_name, 'Helpdesk');
            v_type := 'success';

        WHEN 'rejected' THEN
            v_title   := 'Appointment Rejected';
            v_message := 'Your appointment ' || p_appointment_id ||
                         ' has been rejected by ' ||
                         COALESCE(officer_name, 'Helpdesk') ||
                         CASE
                             WHEN p_reason IS NOT NULL THEN
                                 '. Reason: ' || p_reason
                             ELSE ''
                         END;
            v_type := 'error';

        WHEN 'completed' THEN
            v_title   := 'Appointment Completed';
            v_message := 'Your appointment ' || p_appointment_id ||
                         ' has been completed by ' ||
                         COALESCE(officer_name, 'Helpdesk') ||
                         CASE
                             WHEN p_reason IS NOT NULL THEN
                                 '. Remark: ' || p_reason
                             ELSE ''
                         END;
            v_type := 'info';
    END CASE;

    /* 8️⃣ Insert notification */
    INSERT INTO notifications (
        username,
        appointment_id,
        title,
        message,
        type
    )
    VALUES (
        visitor_username,
        p_appointment_id,
        v_title,
        v_message,
        v_type
    );

    /* 9️⃣ Return success JSON (with correct updated data) */
    IF v_is_appointment THEN
        RETURN json_build_object(
            'success', TRUE,
            'message', 'Appointment ' || LOWER(p_status) || ' successfully',
            'data', row_to_json(v_updated_appointment),
            'source', 'appointments'
        );
    ELSE
        RETURN json_build_object(
            'success', TRUE,
            'message', 'Walk-in ' || LOWER(p_status) || ' successfully',
            'data', row_to_json(v_updated_walkin),
            'source', 'walkins'
        );
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Error updating appointment/walk-in: ' || SQLERRM
        );
END;
$$;

-- 


-- forget pass:
CREATE TABLE password_reset_otp (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(30) NOT NULL REFERENCES m_users(user_id),
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_otp_user ON password_reset_otp(user_id);

CREATE OR REPLACE FUNCTION find_user_for_password_reset(
    p_identifier TEXT
)
RETURNS TABLE (
    user_id VARCHAR,
    email_id VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, v.email_id
    FROM m_users u
    JOIN m_visitors_signup v ON v.user_id = u.user_id
    WHERE u.username = p_identifier
       OR v.email_id = p_identifier
       OR v.mobile_no = p_identifier

    UNION

    SELECT u.user_id, o.email_id
    FROM m_users u
    JOIN m_officers o ON o.user_id = u.user_id
    WHERE u.username = p_identifier
       OR o.email_id = p_identifier
       OR o.mobile_no = p_identifier

    UNION

    SELECT u.user_id, h.email_id
    FROM m_users u
    JOIN m_helpdesk h ON h.user_id = u.user_id
    WHERE u.username = p_identifier
       OR h.email_id = p_identifier
       OR h.mobile_no = p_identifier

    UNION

    SELECT u.user_id, a.email_id
    FROM m_users u
    JOIN m_admins a ON a.user_id = u.user_id
    WHERE u.username = p_identifier
       OR a.email_id = p_identifier
       OR a.mobile_no = p_identifier;
END;
$$;

CREATE OR REPLACE FUNCTION generate_password_reset_otp(
    p_identifier TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id VARCHAR;
    v_email VARCHAR;
    v_otp VARCHAR := LPAD(FLOOR(random() * 1000000)::TEXT, 6, '0');
BEGIN
    SELECT user_id, email_id
    INTO v_user_id, v_email
    FROM find_user_for_password_reset(p_identifier)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'User not found'
        );
    END IF;

    -- Invalidate previous OTPs
    UPDATE password_reset_otp
    SET is_used = TRUE
    WHERE user_id = v_user_id;

    -- Insert new OTP
    INSERT INTO password_reset_otp (
        user_id,
        otp_code,
        expires_at
    )
    VALUES (
        v_user_id,
        v_otp,
        NOW() + INTERVAL '5 minutes'
    );

    -- Email sending handled by backend (Node)
    RETURN json_build_object(
        'success', TRUE,
        'message', 'OTP sent successfully',
        'email', v_email,
        'otp', v_otp -- ⚠ REMOVE in production, keep for testing only
    );
END;
$$;

CREATE OR REPLACE FUNCTION reset_password_with_otp(
    p_identifier TEXT,
    p_otp VARCHAR,
    p_new_password_hash TEXT,
    p_ip VARCHAR DEFAULT 'NA'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id VARCHAR;
BEGIN
    SELECT user_id
    INTO v_user_id
    FROM find_user_for_password_reset(p_identifier)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Invalid user'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM password_reset_otp
        WHERE user_id = v_user_id
          AND otp_code = p_otp
          AND is_used = FALSE
          AND expires_at > NOW()
    ) THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Invalid or expired OTP'
        );
    END IF;

    -- Update password
    UPDATE m_users
    SET
        password_hash = p_new_password_hash,
        updated_date = NOW(),
        update_ip = p_ip,
        update_by = 'password_reset'
    WHERE user_id = v_user_id;

    -- Mark OTP used
    UPDATE password_reset_otp
    SET is_used = TRUE
    WHERE user_id = v_user_id;

    RETURN json_build_object(
        'success', TRUE,
        'message', 'Password reset successfully'
    );
END;
$$;

select * from m_role;

select * from get_user_entity_by_id('OFF005');

select * from m_officers;

-- 
CREATE OR REPLACE FUNCTION get_user_entity_by_id(p_entity_id VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    /* -------- OFFICER -------- */
    SELECT row_to_json(o) INTO result
    FROM m_officers o
    WHERE o.officer_id = p_entity_id;

    IF result IS NOT NULL THEN
        RETURN json_build_object(
            'role_code', 'OF',
            'data', result
        );
    END IF;

    /* -------- HELPDESK -------- */
    SELECT row_to_json(h) INTO result
    FROM m_helpdesk h
    WHERE h.helpdesk_id = p_entity_id;

    IF result IS NOT NULL THEN
        RETURN json_build_object(
            'role_code', 'HD',
            'data', result
        );
    END IF;

    /* -------- ADMIN -------- */
    SELECT row_to_json(a) INTO result
    FROM m_admins a
    WHERE a.admin_id = p_entity_id;

    IF result IS NOT NULL THEN
        RETURN json_build_object(
            'role_code', 'AD',
            'data', result
        );
    END IF;

    RETURN json_build_object(
        'success', false,
        'message', 'Entity not found'
    );
END;
$$;

select * from get_user_entity_by_id('OFF005');


-- get officers by id:OFF,AD,HLP:
CREATE OR REPLACE FUNCTION get_user_by_role_and_id(
    p_entity_id VARCHAR,
    p_role_code VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    IF p_role_code = 'OF' THEN
        SELECT row_to_json(t) INTO result
        FROM (
            SELECT
                o.officer_id      AS entity_id,
                o.user_id,
                o.full_name,
                o.gender,
                o.mobile_no,
                o.email_id,
                o.designation_code,
                o.department_id,
                o.organization_id,

                o.state_code,
                o.division_code,
                o.district_code,
                o.taluka_code,
                o.address,
                o.pincode,

                o.officer_address,
                o.officer_state_code,
                o.officer_district_code,
                o.officer_division_code,
                o.officer_taluka_code,
                o.officer_pincode,

                o.photo
            FROM m_officers o
            WHERE o.officer_id = p_entity_id
              AND o.is_active = TRUE
        ) t;

    ELSIF p_role_code = 'HD' THEN
        SELECT row_to_json(t) INTO result
        FROM (
            SELECT
                h.helpdesk_id     AS entity_id,
                h.user_id,
                h.full_name,
                h.gender,
                h.mobile_no,
                h.email_id,
                h.designation_code,
                h.department_id,
                h.organization_id,

                h.state_code,
                h.division_code,
                h.district_code,
                h.taluka_code,
                h.address,
                h.pincode,

                h.officer_address,
                h.officer_state_code,
                h.officer_district_code,
                h.officer_division_code,
                h.officer_taluka_code,
                h.officer_pincode,

                h.photo
            FROM m_helpdesk h
            WHERE h.helpdesk_id = p_entity_id
              AND h.is_active = TRUE
        ) t;

    ELSIF p_role_code = 'AD' THEN
        SELECT row_to_json(t) INTO result
        FROM (
            SELECT
                a.admin_id        AS entity_id,
                a.user_id,
                a.full_name,
                a.gender,
                a.mobile_no,
                a.email_id,
                a.designation_code,
                a.department_id,
                a.organization_id,

                a.state_code,
                a.division_code,
                a.district_code,
                a.taluka_code,
                a.address,
                a.pincode,

                a.officer_address,
                a.officer_state_code,
                a.officer_district_code,
                a.officer_division_code,
                a.officer_taluka_code,
                a.officer_pincode,

                a.photo
            FROM m_admins a
            WHERE a.admin_id = p_entity_id
              AND a.is_active = TRUE
        ) t;
    END IF;

    IF result IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'data', result
    );
END;
$$;




-- update officers:OFF,AD,HLP
CREATE OR REPLACE FUNCTION update_user_by_role(
    p_entity_id VARCHAR,
    p_full_name VARCHAR,
    p_mobile_no VARCHAR,
    p_email_id VARCHAR,
    p_gender VARCHAR,
    p_designation_code VARCHAR,
    p_department_id VARCHAR,
    p_organization_id VARCHAR,
    p_officer_address VARCHAR,
    p_officer_state_code VARCHAR,
    p_officer_district_code VARCHAR,
    p_officer_division_code VARCHAR,
    p_officer_taluka_code VARCHAR,
    p_officer_pincode VARCHAR,
    p_photo VARCHAR,
    p_role_code VARCHAR
)
RETURNS TABLE(
    out_entity_id VARCHAR,
    full_name VARCHAR,
    out_email_id VARCHAR,
    message VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_org_state    VARCHAR(2);
    v_org_division VARCHAR(3);
    v_org_district VARCHAR(3);
    v_org_taluka   VARCHAR(4);
    v_org_address  VARCHAR(255);
    v_org_pincode  VARCHAR(10);
BEGIN
    /* ---------------- ROLE VALIDATION ---------------- */
    IF NOT EXISTS (
        SELECT 1
        FROM m_role
        WHERE role_code = p_role_code
          AND is_active = TRUE
    ) THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            'Invalid or inactive role code'::VARCHAR;
        RETURN;
    END IF;

    /* ---------------- ORGANIZATION LOCATION ---------------- */
    IF p_organization_id IS NOT NULL THEN
        SELECT
            state_code,
            division_code,
            district_code,
            taluka_code,
            address,
            pincode
        INTO
            v_org_state,
            v_org_division,
            v_org_district,
            v_org_taluka,
            v_org_address,
            v_org_pincode
        FROM m_organization
        WHERE organization_id = p_organization_id;
    END IF;

    /* ---------------- ROLE-BASED UPDATE ---------------- */
    IF p_role_code = 'OF' THEN
        UPDATE m_officers
        SET
            full_name              = p_full_name,
            gender                 = p_gender,
            email_id               = p_email_id,
            mobile_no              = p_mobile_no,
            designation_code       = p_designation_code,
            department_id          = p_department_id,
            organization_id        = p_organization_id,
            state_code             = v_org_state,
            division_code          = v_org_division,
            district_code          = v_org_district,
            taluka_code            = v_org_taluka,
            address                = v_org_address,
            pincode                = v_org_pincode,
            officer_address        = p_officer_address,
            officer_state_code     = p_officer_state_code,
            officer_district_code  = p_officer_district_code,
            officer_division_code  = p_officer_division_code,
            officer_taluka_code    = p_officer_taluka_code,
            officer_pincode        = p_officer_pincode,
            photo                  = COALESCE(p_photo, photo),
            updated_date           = NOW()
        WHERE officer_id = p_entity_id;

    ELSIF p_role_code = 'HD' THEN
        UPDATE m_helpdesk
        SET
            full_name              = p_full_name,
            gender                 = p_gender,
            email_id               = p_email_id,
            mobile_no              = p_mobile_no,
            designation_code       = p_designation_code,
            department_id          = p_department_id,
            organization_id        = p_organization_id,
            state_code             = v_org_state,
            division_code          = v_org_division,
            district_code          = v_org_district,
            taluka_code            = v_org_taluka,
            address                = v_org_address,
            pincode                = v_org_pincode,
            officer_address        = p_officer_address,
            officer_state_code     = p_officer_state_code,
            officer_district_code  = p_officer_district_code,
            officer_division_code  = p_officer_division_code,
            officer_taluka_code    = p_officer_taluka_code,
            officer_pincode        = p_officer_pincode,
            photo                  = COALESCE(p_photo, photo),
            updated_date           = NOW()
        WHERE helpdesk_id = p_entity_id;

    ELSIF p_role_code = 'AD' THEN
        UPDATE m_admins
        SET
            full_name              = p_full_name,
            gender                 = p_gender,
            email_id               = p_email_id,
            mobile_no              = p_mobile_no,
            designation_code       = p_designation_code,
            department_id          = p_department_id,
            organization_id        = p_organization_id,
            state_code             = v_org_state,
            division_code          = v_org_division,
            district_code          = v_org_district,
            taluka_code            = v_org_taluka,
            address                = v_org_address,
            pincode                = v_org_pincode,
            officer_address        = p_officer_address,
            officer_state_code     = p_officer_state_code,
            officer_district_code  = p_officer_district_code,
            officer_division_code  = p_officer_division_code,
            officer_taluka_code    = p_officer_taluka_code,
            officer_pincode        = p_officer_pincode,
            photo                  = COALESCE(p_photo, photo),
            updated_date           = NOW()
        WHERE admin_id = p_entity_id;
    END IF;

    /* ---------------- UPDATE CHECK ---------------- */
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            'No record found to update'::VARCHAR;
        RETURN;
    END IF;

    /* ---------------- SUCCESS RESPONSE ---------------- */
    RETURN QUERY
    SELECT
        p_entity_id::VARCHAR,
        p_full_name::VARCHAR,
        p_email_id::VARCHAR,
        'User updated successfully'::VARCHAR;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
        SELECT
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            ('Update failed: ' || SQLERRM)::VARCHAR;
END;
$$;


CREATE OR REPLACE FUNCTION auto_reject_expired_appointments()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE appointments
    SET
        status = 'rejected',
        reschedule_reason =
            'Please create another appointment since it was not approved for the selected date and time',
        updated_date = NOW(),
        update_by = 'system',
        update_ip = 'scheduler'
    WHERE
        status = 'pending'
        AND (appointment_date::timestamp + slot_time) < NOW();
END;
$$;

select * from m_users
	
ALTER TABLE m_users 
ADD COLUMN is_first_login BOOLEAN DEFAULT false
	
ALTER COLUMN is_first_login
TYPE VARCHAR
USING CASE
  WHEN is_first_login = TRUE THEN 'true'
  ELSE 'false'
END;

ALTER TABLE m_users
DROP COLUMN is_first_login;

CREATE OR REPLACE FUNCTION get_visitor_dashboard_by_username(p_username VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    appointment_data JSON;
    walkin_data JSON;
    notification_data JSON;
    visitor_name VARCHAR;
BEGIN
    -- 1️⃣ Get visitor full name
    SELECT vs.full_name
    INTO visitor_name
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username
    LIMIT 1;

    -- 2️⃣ Fetch NORMAL appointments
    SELECT json_agg(
        json_build_object(
            'appointment_id', a.appointment_id,
            'organization_name', o.organization_name,
            'department_name', d.department_name,

            'officer_name',
            (
                SELECT x.full_name
                FROM (
                    SELECT o2.officer_id AS staff_id, o2.full_name
                    FROM m_officers o2
                    UNION ALL
                    SELECT h.helpdesk_id AS staff_id, h.full_name
                    FROM m_helpdesk h
                ) x
                WHERE x.staff_id = a.officer_id
                LIMIT 1
            ),

            'service_name', s.service_name,
            'appointment_date', TO_CHAR(a.appointment_date, 'DD-MM-YYYY'),
            'slot_time', TO_CHAR(a.slot_time, 'HH12:MI AM'),
            'status', a.status,
            'purpose', a.purpose
        )
        ORDER BY a.insert_date DESC
    )
    INTO appointment_data
    FROM appointments a
    LEFT JOIN m_organization o ON o.organization_id = a.organization_id
    LEFT JOIN m_department d ON d.department_id = a.department_id
    LEFT JOIN m_services s ON s.service_id = a.service_id
    JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username;

    -- ✅ 3️⃣ Fetch WALK-IN appointments from walkins table
    SELECT json_agg(
        json_build_object(
            'walkin_id', w.walkin_id,
            'organization_name', o.organization_name,
            'department_name', d.department_name,

            'officer_name',
            (
                SELECT x.full_name
                FROM (
                    SELECT o2.officer_id AS staff_id, o2.full_name
                    FROM m_officers o2
                    UNION ALL
                    SELECT h.helpdesk_id AS staff_id, h.full_name
                    FROM m_helpdesk h
                ) x
                WHERE x.staff_id = w.officer_id
                LIMIT 1
            ),

            'service_name', s.service_name,
            'walkin_date', TO_CHAR(w.walkin_date, 'DD-MM-YYYY'),
            'slot_time', TO_CHAR(w.slot_time, 'HH12:MI AM'),
            'status', w.status,
            'purpose', w.purpose
        )
        ORDER BY w.insert_date DESC
    )
    INTO walkin_data
    FROM walkins w
    LEFT JOIN m_organization o ON o.organization_id = w.organization_id
    LEFT JOIN m_department d ON d.department_id = w.department_id
    LEFT JOIN m_services s ON s.service_id = w.service_id
    JOIN m_visitors_signup vs ON vs.visitor_id = w.visitor_id
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username;

    -- 4️⃣ Fetch notifications
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

    -- ✅ 5️⃣ Return dashboard JSON
    RETURN json_build_object(
        'full_name', COALESCE(visitor_name, ''),
        'appointments', COALESCE(appointment_data, '[]'::json),
        'walkins', COALESCE(walkin_data, '[]'::json),
        'notifications', COALESCE(notification_data, '[]'::json)
    );
END;
$$;
select * from appointments

ALTER TABLE walkins
ADD COLUMN reschedule_reason TEXT DEFAULT NULL;





-- new function:
CREATE OR REPLACE FUNCTION get_admin_details_by_id(
    p_admin_id VARCHAR
)
RETURNS TABLE (
    admin_id        VARCHAR,
    user_id         VARCHAR,
    full_name       VARCHAR,
    mobile_no       VARCHAR,
    email_id        VARCHAR,

    state_name      VARCHAR,
    division_name   VARCHAR,
    district_name   VARCHAR,
    taluka_name     VARCHAR,
    address         VARCHAR,
    pincode         VARCHAR,

    role_name       VARCHAR,
    designation     VARCHAR,
    department_name VARCHAR,
    organization_name VARCHAR,

    photo           VARCHAR,
    is_active       BOOLEAN,
    updated_date    TIMESTAMP
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.admin_id,
        a.user_id,
        a.full_name,
        a.mobile_no,
        a.email_id,

        st.state_name,
        dv.division_name,
        dt.district_name,
        tl.taluka_name,
        a.address,
        a.pincode,

        r.role_name,
        des.designation_name,
        dp.department_name,
        org.organization_name,

        a.photo,
        a.is_active,
        a.updated_date

    FROM m_admins a

    LEFT JOIN m_state st
      ON st.state_code = a.state_code

    LEFT JOIN m_division dv
      ON dv.division_code = a.division_code

    LEFT JOIN m_district dt
      ON dt.district_code = a.district_code

    LEFT JOIN m_taluka tl
      ON tl.taluka_code = a.taluka_code

    LEFT JOIN m_role r
      ON r.role_code = 'AD'

    LEFT JOIN m_designation des  
      ON des.designation_code = a.designation_code

    LEFT JOIN m_department dp
      ON dp.department_id = a.department_id

    LEFT JOIN m_organization org
      ON org.organization_id = a.organization_id

    WHERE a.admin_id = p_admin_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_appointments_by_date(
    p_officer_id VARCHAR,
    p_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_appointments JSON;
    v_stats JSON;
BEGIN
    -- 1️⃣ Validation
    IF p_officer_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Officer ID is required'
        );
    END IF;

    IF p_date IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Date is required'
        );
    END IF;

    -- 2️⃣ ONLINE + WALK-IN merged timeline
    SELECT COALESCE(
        json_agg(t ORDER BY slot_time),   -- ✅ FIXED
        '[]'::json
    )
    INTO v_appointments
    FROM (
        /* 🔵 ONLINE APPOINTMENTS */
        SELECT
            json_build_object(
                'appointment_id', a.appointment_id,
                'walkin_id', NULL,
                'appointment_type', 'ONLINE',
                'appointment_date', a.appointment_date,
                'slot_time', a.slot_time,
                'status', a.status,
                'purpose', a.purpose,
                'reschedule_reason', a.reschedule_reason,
                'visitor_name', v.full_name,
                'visitor_mobile', v.mobile_no,
                'visitor_email', v.email_id,
                'department_id', a.department_id,
                'service_id', a.service_id
            ) AS t,
            a.slot_time AS slot_time
        FROM appointments a
        LEFT JOIN m_visitors_signup v 
            ON v.visitor_id = a.visitor_id
        WHERE a.officer_id = p_officer_id
          AND DATE(a.appointment_date) = p_date

        UNION ALL

        /* 🟢 WALK-IN APPOINTMENTS */
        SELECT
            json_build_object(
                'appointment_id', NULL,
                'walkin_id', w.walkin_id,
                'appointment_type', 'WALKIN',
                'appointment_date', w.walkin_date,
                'slot_time', w.slot_time,
                'status', w.status,
                'purpose', w.purpose,
                'reschedule_reason', w.reschedule_reason,
                'visitor_name', w.full_name,
                'visitor_mobile', w.mobile_no,
                'visitor_email', w.email_id,
                'department_id', w.department_id,
                'service_id', w.service_id
            ) AS t,
            w.slot_time AS slot_time
        FROM walkins w
        WHERE w.officer_id = p_officer_id
          AND w.is_active = TRUE
          AND DATE(w.walkin_date) = p_date
    ) x;

    -- 3️⃣ Stats
    SELECT json_build_object(
        'total',
            (SELECT COUNT(*) FROM appointments
             WHERE officer_id = p_officer_id
               AND DATE(appointment_date) = p_date)
          +
            (SELECT COUNT(*) FROM walkins
             WHERE officer_id = p_officer_id
               AND is_active = TRUE
               AND DATE(walkin_date) = p_date),

        'online',
            (SELECT COUNT(*) FROM appointments
             WHERE officer_id = p_officer_id
               AND DATE(appointment_date) = p_date),

        'walkin',
            (SELECT COUNT(*) FROM walkins
             WHERE officer_id = p_officer_id
               AND is_active = TRUE
               AND DATE(walkin_date) = p_date)
    )
    INTO v_stats;

    -- 4️⃣ Final response
    RETURN json_build_object(
        'success', TRUE,
        'data', json_build_object(
            'date', p_date,
            'appointments', v_appointments,
            'stats', v_stats
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Server error while fetching appointments: ' || SQLERRM
        );
END;
$$;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;


select * from walkins


ALTER TABLE walkins
ADD COLUMN update_ip VARCHAR DEFAULT NULL