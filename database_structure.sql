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
    division_code VARCHAR(3) NOT NULL PRIMARY KEY,
    state_code VARCHAR(2) NOT NULL,
    division_name VARCHAR(255) NOT NULL,
    division_name_ll VARCHAR(255) NOT NULL,
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_district (
    district_code VARCHAR(3) NOT NULL PRIMARY KEY,
    division_code VARCHAR(3) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    district_name_ll VARCHAR(255) NOT NULL,
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_taluka (
    taluka_code VARCHAR(4) NOT NULL PRIMARY KEY,
    district_code VARCHAR(5) NOT NULL,
    division_code VARCHAR(5) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    taluka_name VARCHAR(255) NOT NULL,
    taluka_name_ll VARCHAR(255) NOT NULL,
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

INSERT INTO m_division (division_code, state_code, division_name, division_name_ll)
VALUES 
('01', '27', 'Konkan', 'कोकण'),
('02', '27', 'Pune', 'पुणे'),
('03', '27', 'Nashik', 'नाशिक'),
('04', '27', 'Aurangabad', 'औरंगाबाद'),
('05', '27', 'Amravati', 'अमरावती'),
('06', '27', 'Nagpur', 'नागपूर');

CREATE TABLE m_organization (
    organization_id VARCHAR(10) PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    organization_name_ll VARCHAR(255) NOT NULL,
	state_code VARCHAR(10) NOT NULL,
	FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_department (
    department_id VARCHAR(10) PRIMARY KEY,
	organization_id VARCHAR(10) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    department_name_ll VARCHAR(255) NOT NULL,
	state_code VARCHAR(10) NOT NULL,
	FOREIGN KEY (state_code) REFERENCES m_state(state_code),
	FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_services (
    service_id VARCHAR(10) PRIMARY KEY,
	organization_id VARCHAR(10) NOT NULL,
	department_id VARCHAR(10) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_name_ll VARCHAR(255) NOT NULL,
	state_code VARCHAR(10) NOT NULL,
	FOREIGN KEY (state_code) REFERENCES m_state(state_code),
	FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
	FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

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

CREATE TABLE m_designation (
    designation_code VARCHAR(5) PRIMARY KEY,
    designation_name VARCHAR(255) NOT NULL,
    designation_name_ll VARCHAR(255) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    division_code VARCHAR(5) NOT NULL,
    district_code VARCHAR(5) NOT NULL,
    taluka_code VARCHAR(5) NOT NULL,
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

CREATE SEQUENCE m_users_user_id_seq START 1 INCREMENT 1;

CREATE TABLE m_users (
    user_id VARCHAR(20) PRIMARY KEY DEFAULT ('USR' || LPAD(nextval('m_users_user_id_seq')::TEXT, 3, '0')),
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

CREATE SEQUENCE m_visitors_signup_id_seq START 1 INCREMENT 1;

CREATE TABLE m_visitors_signup (
    visitor_id VARCHAR(20) PRIMARY KEY DEFAULT ('VIS' || LPAD(nextval('m_visitors_signup_id_seq')::TEXT, 3, '0')),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M','F','O')),
    dob DATE,
    mobile_no VARCHAR(15) UNIQUE,
    email_id VARCHAR(255) UNIQUE,
    state_code VARCHAR(2),
    division_code VARCHAR(5),
    district_code VARCHAR(5),
    taluka_code VARCHAR(5),
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
    division_code VARCHAR(5),
    district_code VARCHAR(5),
    taluka_code VARCHAR(5),
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
    assigned_department VARCHAR(5),
    assigned_location VARCHAR(5),
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '17:00',
    photo VARCHAR(500),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES m_users(user_id),
    FOREIGN KEY (assigned_department) REFERENCES m_department(department_id),
    FOREIGN KEY (assigned_location) REFERENCES m_district(district_code)
);

CREATE SEQUENCE appointments_id_seq START 1 INCREMENT 1;

CREATE TABLE appointments (
    appointment_id VARCHAR(20) PRIMARY KEY DEFAULT ('APT' || LPAD(nextval('appointments_id_seq')::TEXT, 3, '0')),
    visitor_id VARCHAR(20) NOT NULL,
    organization_id VARCHAR(10) NOT NULL,
    department_id VARCHAR(10) NOT NULL,
    officer_id VARCHAR(20) NOT NULL,
    service_id VARCHAR(20) NOT NULL,purpose TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    slot_time TIME NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','rescheduled','completed')),
	reschedule_reason TEXT,
    qr_code_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    document_id VARCHAR(20) PRIMARY KEY DEFAULT ('DOC' || LPAD(nextval('appointment_documents_id_seq')::TEXT, 3, '0')),
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
	id_proof_type VARCHAR(100) DEFAULT NULL,      
    id_proof_no VARCHAR(50) DEFAULT NULL,
	organization_id VARCHAR(10) NOT NULL,                  
    department_id VARCHAR(10) NOT NULL,                 
    officer_id VARCHAR(20),                       
    purpose VARCHAR(500) NOT NULL,
    walkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
    remarks VARCHAR(500),insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
	FOREIGN KEY (organization_id) REFERENCES m_organization(organization_id),
    FOREIGN KEY (department_id) REFERENCES m_department(department_id),
    FOREIGN KEY (officer_id) REFERENCES m_officers(officer_id)
);

CREATE SEQUENCE walkin_tokens_id_seq START 1 INCREMENT 1;


CREATE TABLE walkin_tokens (
    token_id VARCHAR(20) PRIMARY KEY DEFAULT ('T' || LPAD(nextval('walkin_tokens_id_seq')::TEXT, 5, '0')),
    walkin_id VARCHAR(20) NOT NULL,  
    token_number VARCHAR(20) NOT NULL,             
    issue_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','in-progress','served','cancelled')),
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
    position VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','served','skipped')),
	insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id),
    FOREIGN KEY (visitor_id) REFERENCES m_visitors_signup(visitor_id)
);

CREATE SEQUENCE feedback_id_seq START 1 INCREMENT 1;

CREATE TABLE feedback (
    feedback_id VARCHAR(20) PRIMARY KEY DEFAULT ('FDB' || LPAD(nextval('feedback_id_seq')::TEXT, 5, '0')),
	visitor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    walkin_id VARCHAR(20),rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insert_by VARCHAR(100) DEFAULT 'system',
    insert_ip VARCHAR(50) DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_by VARCHAR(100),
    update_ip VARCHAR(50),FOREIGN KEY (visitor_id) REFERENCES m_visitors_signup(visitor_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES walkins(walkin_id)
);

Select * from get_visitor_dashboard_by_username('VIS001')

-- Insert dummy appointments
INSERT INTO appointments (
    visitor_id, organization_id, department_id, officer_id, service_id,
    purpose, appointment_date, slot_time, status, reschedule_reason, qr_code_path, insert_by, insert_ip
)
VALUES
('VIS001', 'ORG001', 'DEP001', 'OFF001', 'SRV001',
 'Discuss new digital service implementation', '2025-10-12', '10:30', 'approved', NULL, '/qrcodes/apt001.png', 'system', '127.0.0.1'),

('VIS002', 'ORG001', 'DEP001', 'OFF002', 'SRV001',
 'Submit official documents for verification', '2025-10-13', '11:15', 'pending', NULL, '/qrcodes/apt002.png', 'system', '127.0.0.1'),

('VIS001', 'ORG001', 'DEP001', 'OFF001', 'SRV001',
 'Follow-up on service request', '2025-10-09', '15:00', 'completed', NULL, '/qrcodes/apt003.png', 'system', '127.0.0.1'),

('VIS002', 'ORG001', 'DEP001', 'OFF002', 'SRV001',
 'Request clarification on rejected application', '2025-10-08', '09:45', 'rejected', 'Officer unavailable', '/qrcodes/apt004.png', 'system', '127.0.0.1');

CREATE SEQUENCE notifications_id_seq START 1 INCREMENT 1;

CREATE TABLE notifications (
    notification_id VARCHAR(20) PRIMARY KEY DEFAULT ('NOT' || LPAD(nextval('notifications_id_seq')::TEXT, 5, '0')),
    username VARCHAR(20) NOT NULL,              -- VIS001 / OFF001 / HLP001 etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',            -- e.g. success, warning, info, error
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES m_users(username)
);


INSERT INTO notifications (username, title, message, type, is_read)
VALUES
('VIS003', 'Appointment Approved', 'Your appointment APT001 has been approved by Officer OFF001 for 2025-10-12 at 10:30 AM.', 'success', FALSE),
('VIS003', 'Appointment Pending', 'Your appointment APT002 is pending approval by Officer OFF002.', 'info', FALSE),
('VIS001', 'Appointment Completed', 'Your appointment APT003 was completed successfully. Please provide feedback.', 'success', TRUE),
('VIS002', 'Appointment Rejected', 'Your appointment APT004 was rejected due to officer unavailability.', 'warning', TRUE),
('OFF001', 'New Appointment Assigned', 'A new appointment (APT001) has been scheduled with visitor VIS001.', 'info', FALSE),
('OFF002', 'Pending Appointment', 'Visitor VIS002 has requested a new appointment (APT002).', 'info', FALSE);

CREATE OR REPLACE FUNCTION get_visitor_dashboard_by_username(p_username VARCHAR)
RETURNS JSON AS $$
DECLARE
    appointment_data JSON;
    notification_data JSON;
    visitor_name VARCHAR;
BEGIN
    -- Get the full name of the visitor
    SELECT vs.full_name
    INTO visitor_name
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username
    LIMIT 1;

    -- Fetch all appointments for this visitor
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
        )
        ORDER BY a.insert_date DESC
    )
    INTO appointment_data
    FROM appointments a
    JOIN m_organization o ON o.organization_id = a.organization_id
    JOIN m_department d ON d.department_id = a.department_id
    JOIN m_officers off ON off.officer_id = a.officer_id
    JOIN m_services s ON s.service_id = a.service_id
    JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username;

    -- Notifications based on appointments
    SELECT json_agg(
        json_build_object(
            'message', 
            CASE 
                WHEN a.status = 'approved' THEN 'Your appointment ' || a.appointment_id || ' has been approved.'
                WHEN a.status = 'rejected' THEN 'Your appointment ' || a.appointment_id || ' was rejected.'
                WHEN a.status = 'completed' THEN 'Your appointment ' || a.appointment_id || ' is completed.'
                ELSE 'Your appointment ' || a.appointment_id || ' is pending.'
            END,
            'status', a.status,
            'appointment_id', a.appointment_id
        )
        ORDER BY a.insert_date DESC
    )
    INTO notification_data
    FROM appointments a
    JOIN m_visitors_signup vs ON vs.visitor_id = a.visitor_id
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE u.username = p_username;

    RETURN json_build_object(
        'full_name', visitor_name,
        'appointments', COALESCE(appointment_data, '[]'::json),
        'notifications', COALESCE(notification_data, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql;



-- Insert dummy appointments
INSERT INTO appointments (
    visitor_id, organization_id, department_id, officer_id, service_id,
    purpose, appointment_date, slot_time, status, reschedule_reason, qr_code_path, insert_by, insert_ip
)
VALUES
('VIS003', 'ORG001', 'DEP001', 'OFF001', 'SER001',
 'Discuss new digital service implementation', '2025-10-12', '10:30', 'approved', NULL, '/qrcodes/apt001.png', 'system', '127.0.0.1'),

('VIS003', 'ORG001', 'DEP001', 'OFF002', 'SER001',
 'Submit official documents for verification', '2025-10-13', '11:15', 'pending', NULL, '/qrcodes/apt002.png', 'system', '127.0.0.1');

 Select * from m_officers