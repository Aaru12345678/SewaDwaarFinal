--
-- PostgreSQL database dump
--

\restrict hMeRFEj9pcUkWyn2KApPTaxM5CaMBq7lqL2Jkr3dqKD7vl0ca1cciohg2pAxGfj

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-27 21:44:07

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
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5663 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 396 (class 1255 OID 16427)
-- Name: auto_reject_expired_appointments(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_reject_expired_appointments() RETURNS void
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


ALTER FUNCTION public.auto_reject_expired_appointments() OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 16428)
-- Name: book_walkin_helpdesk(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, date, time without time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.book_walkin_helpdesk(p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_id_proof_no character varying, p_organization_id character varying, p_department_id character varying, p_officer_id character varying, p_purpose character varying, p_appointment_date date, p_time_slot time without time zone) RETURNS json
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


ALTER FUNCTION public.book_walkin_helpdesk(p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_id_proof_no character varying, p_organization_id character varying, p_department_id character varying, p_officer_id character varying, p_purpose character varying, p_appointment_date date, p_time_slot time without time zone) OWNER TO postgres;

--
-- TOC entry 334 (class 1255 OID 16429)
-- Name: cancel_appointment(character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cancel_appointment(p_appointment_id character varying, p_cancelled_by character varying DEFAULT 'visitor'::character varying, p_cancelled_reason text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_visitor_id VARCHAR;
    v_user_id VARCHAR;
BEGIN
    -- 1️⃣ Update appointment → cancelled
    UPDATE appointments
    SET status = 'cancelled',
        cancelled_reason = p_cancelled_reason,
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
        'You have cancelled your appointment ' || p_appointment_id || 
        COALESCE(' Reason: ' || p_cancelled_reason, ''),
        'warning'
    );

    -- 4️⃣ Response JSON
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Appointment cancelled and notification recorded'
    );

END;
$$;


ALTER FUNCTION public.cancel_appointment(p_appointment_id character varying, p_cancelled_by character varying, p_cancelled_reason text) OWNER TO postgres;

--
-- TOC entry 338 (class 1255 OID 16430)
-- Name: change_officer_password(character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.change_officer_password(p_officer_id character varying, p_new_password text) RETURNS boolean
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


ALTER FUNCTION public.change_officer_password(p_officer_id character varying, p_new_password text) OWNER TO postgres;

--
-- TOC entry 359 (class 1255 OID 16431)
-- Name: change_user_password(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.change_user_password(p_user_id character varying, p_old_password_hash character varying, p_new_password_hash character varying) RETURNS TABLE(success boolean, message text)
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


ALTER FUNCTION public.change_user_password(p_user_id character varying, p_old_password_hash character varying, p_new_password_hash character varying) OWNER TO postgres;

--
-- TOC entry 394 (class 1255 OID 16432)
-- Name: check_slot_config_conflict(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, smallint, time without time zone, time without time zone, date, date, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_slot_config_conflict(p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_day_of_week smallint, p_start_time time without time zone, p_end_time time without time zone, p_effective_from date, p_effective_to date, p_slot_config_id integer DEFAULT NULL::integer) RETURNS boolean
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


ALTER FUNCTION public.check_slot_config_conflict(p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_day_of_week smallint, p_start_time time without time zone, p_end_time time without time zone, p_effective_from date, p_effective_to date, p_slot_config_id integer) OWNER TO postgres;

--
-- TOC entry 356 (class 1255 OID 16433)
-- Name: create_slot_config(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, smallint, time without time zone, time without time zone, integer, integer, integer, date, date, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_slot_config(p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_day_of_week smallint, p_start_time time without time zone, p_end_time time without time zone, p_slot_duration_minutes integer, p_buffer_minutes integer, p_max_capacity integer, p_effective_from date, p_effective_to date, p_breaks jsonb) RETURNS integer
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


ALTER FUNCTION public.create_slot_config(p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_day_of_week smallint, p_start_time time without time zone, p_end_time time without time zone, p_slot_duration_minutes integer, p_buffer_minutes integer, p_max_capacity integer, p_effective_from date, p_effective_to date, p_breaks jsonb) OWNER TO postgres;

--
-- TOC entry 306 (class 1255 OID 16434)
-- Name: create_walkin_appointment(character varying, character varying, character varying, text, date, time without time zone, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, text, character varying, character varying, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_walkin_appointment(p_visitor_id character varying, p_organization_id character varying, p_service_id character varying, p_purpose text, p_walkin_date date, p_slot_time time without time zone, p_insert_by character varying, p_insert_ip character varying, p_full_name character varying, p_gender character varying, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_division_code character varying, p_officer_id character varying, p_department_id character varying DEFAULT NULL::character varying, p_status character varying DEFAULT 'pending'::character varying, p_remarks text DEFAULT NULL::text, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_insert_date timestamp without time zone DEFAULT NULL::timestamp without time zone) RETURNS character varying
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


ALTER FUNCTION public.create_walkin_appointment(p_visitor_id character varying, p_organization_id character varying, p_service_id character varying, p_purpose text, p_walkin_date date, p_slot_time time without time zone, p_insert_by character varying, p_insert_ip character varying, p_full_name character varying, p_gender character varying, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_division_code character varying, p_officer_id character varying, p_department_id character varying, p_status character varying, p_remarks text, p_district_code character varying, p_taluka_code character varying, p_insert_date timestamp without time zone) OWNER TO postgres;

--
-- TOC entry 348 (class 1255 OID 16435)
-- Name: deactivate_slot_config(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.deactivate_slot_config(p_slot_config_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE m_slot_config
    SET is_active = FALSE
    WHERE slot_config_id = p_slot_config_id;
END;
$$;


ALTER FUNCTION public.deactivate_slot_config(p_slot_config_id integer) OWNER TO postgres;

--
-- TOC entry 397 (class 1255 OID 16436)
-- Name: delete_appointment(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_appointment(p_appointment_id text) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.delete_appointment(p_appointment_id text) OWNER TO postgres;

--
-- TOC entry 357 (class 1255 OID 16437)
-- Name: find_user_for_password_reset(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_user_for_password_reset(p_identifier text) RETURNS TABLE(user_id character varying, email_id character varying)
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


ALTER FUNCTION public.find_user_for_password_reset(p_identifier text) OWNER TO postgres;

--
-- TOC entry 327 (class 1255 OID 16438)
-- Name: generate_password_reset_otp(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_password_reset_otp(p_identifier text) RETURNS json
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


ALTER FUNCTION public.generate_password_reset_otp(p_identifier text) OWNER TO postgres;

--
-- TOC entry 373 (class 1255 OID 16439)
-- Name: generate_user_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_user_id() RETURNS text
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.generate_user_id() OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 16440)
-- Name: generate_visitor_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_visitor_id() RETURNS text
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.generate_visitor_id() OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 16441)
-- Name: get_active_departments_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_active_departments_count() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    active_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO active_count
    FROM m_department
    WHERE is_active = TRUE;

    RETURN active_count;
END;
$$;


ALTER FUNCTION public.get_active_departments_count() OWNER TO postgres;

--
-- TOC entry 304 (class 1255 OID 16442)
-- Name: get_all_appointments_by_department_function(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_appointments_by_department_function(p_date date) RETURNS json
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


ALTER FUNCTION public.get_all_appointments_by_department_function(p_date date) OWNER TO postgres;

--
-- TOC entry 303 (class 1255 OID 16443)
-- Name: get_all_officers(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_officers() RETURNS TABLE(officer_id character varying, user_id character varying, full_name character varying, mobile_no character varying, email_id character varying, role_code character varying, role_name character varying, designation_code character varying, designation_name character varying, organization_id character varying, organization_name character varying, department_id character varying, department_name character varying, state_code character varying, division_code character varying, district_code character varying, taluka_code character varying, photo character varying, is_active boolean)
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


ALTER FUNCTION public.get_all_officers() OWNER TO postgres;

--
-- TOC entry 358 (class 1255 OID 16444)
-- Name: get_all_organizations(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_organizations() RETURNS TABLE(organization_id character varying, organization_name character varying, organization_name_ll character varying, state_code character varying, is_active boolean)
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


ALTER FUNCTION public.get_all_organizations() OWNER TO postgres;

--
-- TOC entry 381 (class 1255 OID 16445)
-- Name: get_application_appointment_kpis(character varying, character varying, character varying, character varying, character varying, character varying, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_application_appointment_kpis(p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_service_id character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date) RETURNS TABLE(total_appointments bigint, upcoming_appointments bigint, completed_appointments bigint, rejected_appointments bigint, pending_appointments bigint)
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


ALTER FUNCTION public.get_application_appointment_kpis(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_from_date date, p_to_date date) OWNER TO postgres;

--
-- TOC entry 399 (class 1255 OID 16446)
-- Name: get_application_appointments_trend(text, character varying, character varying, character varying, character varying, date, date, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_application_appointments_trend(p_date_type text DEFAULT 'month'::text, p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_service_id character varying DEFAULT NULL::character varying) RETURNS TABLE(period text, count bigint)
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


ALTER FUNCTION public.get_application_appointments_trend(p_date_type text, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_from_date date, p_to_date date, p_organization_id character varying, p_department_id character varying, p_service_id character varying) OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 16447)
-- Name: get_appointment_details1(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_appointment_details1(p_appointment_id character varying) RETURNS TABLE(appointment_id character varying, visitor_id character varying, visitor_name character varying, organization_id character varying, organization_name character varying, department_id character varying, department_name character varying, officer_id character varying, officer_name character varying, service_id character varying, service_name character varying, purpose text, appointment_date date, slot_time time without time zone, status character varying, reschedule_reason text, cancelled_reason text, qr_code_path character varying)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.appointment_id,
        a.visitor_id,
        vs.full_name AS visitor_name,
        a.organization_id,
        org.organization_name,
        a.department_id,
        dept.department_name,
        a.officer_id,

        -- ✅ Officer / Helpdesk Name Resolution
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
        a.cancelled_reason,       -- ✅ NEW FIELD
        a.qr_code_path
    FROM appointments a
    LEFT JOIN m_visitors_signup vs
        ON vs.visitor_id = a.visitor_id
    LEFT JOIN m_organization org
        ON org.organization_id = a.organization_id
    LEFT JOIN m_department dept
        ON dept.department_id = a.department_id
    LEFT JOIN m_services srv
        ON srv.service_id = a.service_id
    WHERE a.appointment_id = p_appointment_id
      AND a.is_active = TRUE;
END;
$$;


ALTER FUNCTION public.get_appointment_details1(p_appointment_id character varying) OWNER TO postgres;

--
-- TOC entry 354 (class 1255 OID 16448)
-- Name: get_appointments_by_date(character varying, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_appointments_by_date(p_officer_id character varying, p_date date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_appointments JSON;
    v_stats JSON;
BEGIN
    -- 1️⃣ Validate inputs
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

    -- 2️⃣ Fetch appointments for the date
    SELECT COALESCE(json_agg(
        json_build_object(
            'appointment_id', a.appointment_id,
            'appointment_date', a.appointment_date,
            'slot_time', a.slot_time,
            'status', a.status,
            'purpose', a.purpose,
            'reschedule_reason', a.reschedule_reason,
            'visitor_name', v.full_name,
            'visitor_mobile', v.mobile_no,
            'visitor_email', v.email_id,
            'department_name', d.department_name,
            'service_name', s.service_name
        )
        ORDER BY a.slot_time
    ), '[]'::json)
    INTO v_appointments
    FROM appointments a
    LEFT JOIN m_visitors_signup v ON v.visitor_id = a.visitor_id
    LEFT JOIN m_department d ON d.department_id = a.department_id
    LEFT JOIN m_services s ON s.service_id = a.service_id
    WHERE a.officer_id = p_officer_id
      AND DATE(a.appointment_date) = p_date;

    -- 3️⃣ Fetch stats for the date
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
        'rescheduled', COUNT(*) FILTER (WHERE status = 'rescheduled')
    )
    INTO v_stats
    FROM appointments
    WHERE officer_id = p_officer_id
      AND DATE(appointment_date) = p_date;

    -- 4️⃣ Return final response
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


ALTER FUNCTION public.get_appointments_by_date(p_officer_id character varying, p_date date) OWNER TO postgres;

--
-- TOC entry 420 (class 1255 OID 16449)
-- Name: get_appointments_by_department(character varying, character varying, character varying, character varying, date, date, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_appointments_by_department(p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying) RETURNS TABLE(department_id character varying, department_name text, count bigint)
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


ALTER FUNCTION public.get_appointments_by_department(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_from_date date, p_to_date date, p_organization_id character varying, p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 415 (class 1255 OID 16450)
-- Name: get_appointments_by_service(character varying, character varying, character varying, character varying, date, date, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_appointments_by_service(p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_service_id character varying DEFAULT NULL::character varying) RETURNS TABLE(service_id character varying, service_name text, count bigint)
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


ALTER FUNCTION public.get_appointments_by_service(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_from_date date, p_to_date date, p_organization_id character varying, p_department_id character varying, p_service_id character varying) OWNER TO postgres;

--
-- TOC entry 307 (class 1255 OID 16451)
-- Name: get_appointments_summary(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_appointments_summary(p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_appointments_summary(p_from_date date, p_to_date date) OWNER TO postgres;

--
-- TOC entry 346 (class 1255 OID 16452)
-- Name: get_available_slots(date, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_available_slots(p_date date, p_organization_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_department_id character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying) RETURNS TABLE(slot_time time without time zone, slot_end_time time without time zone, used_count integer, max_capacity integer, is_available boolean)
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


ALTER FUNCTION public.get_available_slots(p_date date, p_organization_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_department_id character varying, p_district_code character varying, p_taluka_code character varying) OWNER TO postgres;

--
-- TOC entry 287 (class 1255 OID 16453)
-- Name: get_department_by_id(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_department_by_id(p_department_id character varying) RETURNS json
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


ALTER FUNCTION public.get_department_by_id(p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 316 (class 1255 OID 16454)
-- Name: get_department_by_id_json(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_department_by_id_json(p_department_id character varying) RETURNS jsonb
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


ALTER FUNCTION public.get_department_by_id_json(p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 366 (class 1255 OID 16455)
-- Name: get_departments(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_departments(p_organization_id character varying) RETURNS TABLE(department_id character varying, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT d.department_id, d.department_name
  FROM m_department d
  WHERE d.organization_id = p_organization_id
    AND d.is_active = TRUE
  ORDER BY d.department_name;
END;
$$;


ALTER FUNCTION public.get_departments(p_organization_id character varying) OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 16456)
-- Name: get_departments_by_org(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_departments_by_org(p_organization_id character varying) RETURNS TABLE(department_id character varying, department_name character varying, department_name_ll character varying, organization_id character varying, state_code character varying, is_active boolean)
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


ALTER FUNCTION public.get_departments_by_org(p_organization_id character varying) OWNER TO postgres;

--
-- TOC entry 418 (class 1255 OID 16457)
-- Name: get_designations(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_designations() RETURNS TABLE(designation_code character varying, designation_name text)
    LANGUAGE sql
    AS $$
  SELECT designation_code, designation_name
  FROM m_designation
  WHERE is_active = TRUE
  ORDER BY designation_name;
$$;


ALTER FUNCTION public.get_designations() OWNER TO postgres;

--
-- TOC entry 296 (class 1255 OID 16458)
-- Name: get_districts(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_districts(p_state_code character varying, p_division_code character varying) RETURNS TABLE(district_code character varying, district_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT d.district_code, d.district_name
  FROM m_district d
  WHERE d.division_code = p_division_code
    AND d.state_code = p_state_code
    AND d.is_active = TRUE
  ORDER BY d.district_name;
END;
$$;


ALTER FUNCTION public.get_districts(p_state_code character varying, p_division_code character varying) OWNER TO postgres;

--
-- TOC entry 333 (class 1255 OID 16459)
-- Name: get_divisions(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_divisions(p_state_code character varying) RETURNS TABLE(division_code character varying, division_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT d.division_code, d.division_name
  FROM m_division d
  WHERE d.state_code = p_state_code AND d.is_active = TRUE
  ORDER BY d.division_name;
END;
$$;


ALTER FUNCTION public.get_divisions(p_state_code character varying) OWNER TO postgres;

--
-- TOC entry 395 (class 1255 OID 16460)
-- Name: get_helpdesk_by_userid(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_helpdesk_by_userid(p_user_id character varying) RETURNS TABLE(helpdesk_id character varying, user_id character varying, full_name character varying, mobile_no character varying, email_id character varying, designation_code character varying, department_id character varying, organization_id character varying, state_code character varying, division_code character varying, district_code character varying, taluka_code character varying, availability_status character varying, photo character varying)
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


ALTER FUNCTION public.get_helpdesk_by_userid(p_user_id character varying) OWNER TO postgres;

--
-- TOC entry 387 (class 1255 OID 16461)
-- Name: get_helpdesk_dashboard(character varying, character varying, character varying, character varying, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_helpdesk_dashboard(p_state character varying, p_district character varying DEFAULT NULL::character varying, p_division character varying DEFAULT NULL::character varying, p_taluka character varying DEFAULT NULL::character varying, p_date date DEFAULT CURRENT_DATE) RETURNS json
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


ALTER FUNCTION public.get_helpdesk_dashboard(p_state character varying, p_district character varying, p_division character varying, p_taluka character varying, p_date date) OWNER TO postgres;

--
-- TOC entry 390 (class 1255 OID 16462)
-- Name: get_helpdesk_dashboard2(character varying, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_helpdesk_dashboard2(p_helpdesk_id character varying, p_date date DEFAULT CURRENT_DATE) RETURNS json
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


ALTER FUNCTION public.get_helpdesk_dashboard2(p_helpdesk_id character varying, p_date date) OWNER TO postgres;

--
-- TOC entry 325 (class 1255 OID 16463)
-- Name: get_helpdesk_dashboard_counts(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_helpdesk_dashboard_counts(p_helpdesk_id text) RETURNS json
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


ALTER FUNCTION public.get_helpdesk_dashboard_counts(p_helpdesk_id text) OWNER TO postgres;

--
-- TOC entry 385 (class 1255 OID 16464)
-- Name: get_helpdesk_notifications(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_helpdesk_notifications(p_department_id character varying) RETURNS json
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


ALTER FUNCTION public.get_helpdesk_notifications(p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 326 (class 1255 OID 16465)
-- Name: get_helpdesk_user_by_username(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_helpdesk_user_by_username(p_username character varying) RETURNS TABLE(user_id character varying, username character varying, password_hash character varying, role_code character varying, is_active boolean)
    LANGUAGE sql
    AS $$
  SELECT user_id, username, password_hash, role_code, is_active
  FROM m_users
  WHERE username = p_username
    AND is_active = TRUE
    AND role_code = 'HD';
$$;


ALTER FUNCTION public.get_helpdesk_user_by_username(p_username character varying) OWNER TO postgres;

--
-- TOC entry 305 (class 1255 OID 16466)
-- Name: get_officer_availability(character varying, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officer_availability(p_helpdesk_id character varying, p_appointment_date date DEFAULT CURRENT_DATE) RETURNS TABLE(officer_id character varying, officer_name text, department_name text, appointments jsonb)
    LANGUAGE plpgsql STABLE
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


ALTER FUNCTION public.get_officer_availability(p_helpdesk_id character varying, p_appointment_date date) OWNER TO postgres;

--
-- TOC entry 324 (class 1255 OID 16467)
-- Name: get_officer_dashboard(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officer_dashboard(p_officer_id character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(

        /* =========================
           BASIC OFFICER INFO
        ========================== */
        'full_name', o.full_name,
        'designation', COALESCE(o.designation_code, ''),

        /* =========================
           TODAY STATS (APPOINTMENTS + WALKINS)
        ========================== */
        'stats', json_build_object(

            /* TOTAL TODAY = appointments + walkins */
            'today_total',
            (
                SELECT COUNT(*)
                FROM appointments
                WHERE officer_id = p_officer_id
                  AND DATE(appointment_date) = CURRENT_DATE
            ) +
            (
                SELECT COUNT(*)
                FROM walkins
                WHERE officer_id = p_officer_id
                  AND DATE(walkin_date) = CURRENT_DATE
            ),

            /* Appointment status counts (TODAY ONLY) */
            'pending', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'pending'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),
            'approved', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'approved'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),
            'completed', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'completed'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),
            'rejected', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'rejected'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),
            'rescheduled', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'rescheduled'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),
            'cancelled', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'cancelled'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),
            'expired', (
                SELECT COUNT(*) FROM appointments
                WHERE officer_id = p_officer_id
                  AND status = 'expired'
                  AND DATE(appointment_date) = CURRENT_DATE
            ),

            /* Walk-ins today */
            'walkins', (
                SELECT COUNT(*)
                FROM walkins
                WHERE officer_id = p_officer_id
                  AND DATE(walkin_date) = CURRENT_DATE
            )
        ),

        /* =========================
           TODAY APPOINTMENTS LIST
        ========================== */
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
                    v.full_name AS visitor_name,
                    v.mobile_no AS visitor_mobile,
                    v.email_id  AS visitor_email,
                    s.service_name,
                    d.department_name
                FROM appointments a
                LEFT JOIN m_visitors_signup v ON a.visitor_id = v.visitor_id
                LEFT JOIN m_services s ON a.service_id = s.service_id
                LEFT JOIN m_department d ON a.department_id = d.department_id
                WHERE a.officer_id = p_officer_id
                  AND DATE(a.appointment_date) = CURRENT_DATE
                ORDER BY a.slot_time
            ) t
        ),

        /* =========================
           WALK-IN APPOINTMENTS (TODAY)
        ========================== */
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
                    walkin_date AS appointment_date,
                    slot_time
                FROM walkins
                WHERE officer_id = p_officer_id
                  AND DATE(walkin_date) = CURRENT_DATE
                ORDER BY slot_time
            ) w
        ),

        /* =========================
           RECENT ACTIVITY
        ========================== */
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


ALTER FUNCTION public.get_officer_dashboard(p_officer_id character varying) OWNER TO postgres;

--
-- TOC entry 384 (class 1255 OID 16468)
-- Name: get_officer_dashboard_by_username(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officer_dashboard_by_username(p_username character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_officer_dashboard_by_username(p_username character varying) OWNER TO postgres;

--
-- TOC entry 380 (class 1255 OID 17542)
-- Name: get_officer_reports(character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officer_reports(p_officer_id character varying, p_start_date date, p_end_date date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(

        /* =========================
           SUMMARY COUNTS
        ========================== */
        'summary', json_build_object(
            'total_appointments', COUNT(*),
            'completed',    COUNT(*) FILTER (WHERE status = 'completed'),
            'approved',     COUNT(*) FILTER (WHERE status = 'approved'),
            'pending',      COUNT(*) FILTER (WHERE status = 'pending'),
            'rejected',     COUNT(*) FILTER (WHERE status = 'rejected'),
            'rescheduled',  COUNT(*) FILTER (WHERE status = 'rescheduled'),
            'cancelled',    COUNT(*) FILTER (WHERE status = 'cancelled'),
            'expired',      COUNT(*) FILTER (WHERE status = 'expired')
        ),

        /* =========================
           DAILY BREAKDOWN
        ========================== */
        'daily_breakdown', (
            SELECT COALESCE(json_agg(d ORDER BY d.full_date), '[]'::json)
            FROM (
                SELECT
                    appointment_date                            AS full_date,
                    to_char(appointment_date, 'DD Mon')         AS date,
                    COUNT(*) FILTER (WHERE status = 'completed')    AS completed,
                    COUNT(*) FILTER (WHERE status = 'approved')     AS approved,
                    COUNT(*) FILTER (WHERE status = 'pending')      AS pending,
                    COUNT(*) FILTER (WHERE status = 'rejected')     AS rejected,
                    COUNT(*) FILTER (WHERE status = 'rescheduled')  AS rescheduled,
                    COUNT(*) FILTER (WHERE status = 'cancelled')    AS cancelled,
                    COUNT(*) FILTER (WHERE status = 'expired')      AS expired
                FROM appointments
                WHERE officer_id = p_officer_id
                  AND is_active = true
                  AND appointment_date BETWEEN p_start_date AND p_end_date
                GROUP BY appointment_date
            ) d
        ),

        /* =========================
           STATUS DISTRIBUTION (PIE)
        ========================== */
        'status_distribution', json_build_array(
            json_build_object(
                'name','Completed',
                'value', COUNT(*) FILTER (WHERE status='completed'),
                'color','#10b981'
            ),
            json_build_object(
                'name','Approved',
                'value', COUNT(*) FILTER (WHERE status='approved'),
                'color','#3b82f6'
            ),
            json_build_object(
                'name','Pending',
                'value', COUNT(*) FILTER (WHERE status='pending'),
                'color','#f59e0b'
            ),
            json_build_object(
                'name','Rejected',
                'value', COUNT(*) FILTER (WHERE status='rejected'),
                'color','#ef4444'
            ),
            json_build_object(
                'name','Rescheduled',
                'value', COUNT(*) FILTER (WHERE status='rescheduled'),
                'color','#8b5cf6'
            ),
            json_build_object(
                'name','Cancelled',
                'value', COUNT(*) FILTER (WHERE status='cancelled'),
                'color','#6b7280'
            ),
            json_build_object(
                'name','Expired',
                'value', COUNT(*) FILTER (WHERE status='expired'),
                'color','#111827'
            )
        )

    )
    INTO result
    FROM appointments
    WHERE officer_id = p_officer_id
      AND is_active = true
      AND appointment_date BETWEEN p_start_date AND p_end_date;

    RETURN result;
END;
$$;


ALTER FUNCTION public.get_officer_reports(p_officer_id character varying, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 388 (class 1255 OID 16469)
-- Name: get_officer_reports(character varying, character varying, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officer_reports(p_officer_id character varying, p_type character varying DEFAULT 'monthly'::character varying, p_month character varying DEFAULT NULL::character varying, p_start date DEFAULT NULL::date, p_end date DEFAULT NULL::date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_days INT;

    officer_name TEXT;
    summary JSON;
    daily JSON;
    hourly JSON;
    peak_day JSON;
BEGIN
    -- 🔴 Validate officer
    IF NOT EXISTS (
        SELECT 1 FROM m_officers WHERE officer_id = p_officer_id
    ) THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Officer not found'
        );
    END IF;

    SELECT full_name
    INTO officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    -- 📅 Resolve date range
    IF p_type = 'monthly' AND p_month IS NOT NULL THEN
        v_start_date := (p_month || '-01')::DATE;
        v_end_date := (v_start_date + INTERVAL '1 month')::DATE;

    ELSIF p_type = 'weekly' AND p_start IS NOT NULL AND p_end IS NOT NULL THEN
        v_start_date := p_start;
        v_end_date := p_end;

    ELSIF p_type = 'custom' AND p_start IS NOT NULL AND p_end IS NOT NULL THEN
        v_start_date := p_start;
        v_end_date := p_end;

    ELSE
        v_start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
        v_end_date := CURRENT_DATE;
    END IF;

    v_days := GREATEST(1, (v_end_date - v_start_date));

    -- 📊 SUMMARY (no nesting)
    SELECT json_build_object(
        'total_appointments', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
        'rescheduled', COUNT(*) FILTER (WHERE status = 'rescheduled'),
        'completion_rate',
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC /
                 GREATEST(COUNT(*),1)) * 100, 1
            ),
        'approval_rate',
            ROUND(
                (COUNT(*) FILTER (WHERE status IN ('completed','approved'))::NUMERIC /
                 GREATEST(COUNT(*),1)) * 100, 1
            ),
        'avg_daily',
            ROUND((COUNT(*)::NUMERIC / v_days), 1)
    )
    INTO summary
    FROM appointments
    WHERE officer_id = p_officer_id
      AND appointment_date::DATE BETWEEN v_start_date AND v_end_date;

    -- 📅 DAILY BREAKDOWN (subquery → json_agg)
    SELECT json_agg(row_to_json(d))
    INTO daily
    FROM (
        SELECT
            appointment_date::DATE AS fullDate,
            TO_CHAR(appointment_date::DATE, 'DD Mon') AS date,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed,
            COUNT(*) FILTER (WHERE status = 'approved') AS approved,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending,
            COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
            COUNT(*) FILTER (WHERE status = 'rescheduled') AS rescheduled
        FROM appointments
        WHERE officer_id = p_officer_id
          AND appointment_date::DATE BETWEEN v_start_date AND v_end_date
        GROUP BY appointment_date::DATE
        ORDER BY appointment_date::DATE
    ) d;

    -- 🔥 PEAK DAY (single row → json)
    SELECT row_to_json(p)
    INTO peak_day
    FROM (
        SELECT
            TO_CHAR(appointment_date::DATE, 'DD Mon') AS date,
            COUNT(*) AS total
        FROM appointments
        WHERE officer_id = p_officer_id
          AND appointment_date::DATE BETWEEN v_start_date AND v_end_date
        GROUP BY appointment_date::DATE
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) p;

    -- ⏰ HOURLY DISTRIBUTION (subquery → json_agg)
    SELECT json_agg(row_to_json(h))
    INTO hourly
    FROM (
        SELECT
            TO_CHAR(
                MAKE_TIME(EXTRACT(HOUR FROM slot_time)::INT, 0, 0),
                'HH12 AM'
            ) AS hour,
            COUNT(*) AS appointments
        FROM appointments
        WHERE officer_id = p_officer_id
          AND slot_time IS NOT NULL
          AND appointment_date::DATE BETWEEN v_start_date AND v_end_date
        GROUP BY EXTRACT(HOUR FROM slot_time)
        ORDER BY EXTRACT(HOUR FROM slot_time)
    ) h;

    -- 🧾 FINAL RESPONSE
    RETURN json_build_object(
        'success', TRUE,
        'data', json_build_object(
            'officer_name', officer_name,
            'period', v_start_date || ' to ' || v_end_date,
            'summary', summary,
            'daily_breakdown', COALESCE(daily, '[]'::json),
            'peak_day', COALESCE(peak_day, json_build_object()),
            'hourly_distribution', COALESCE(hourly, '[]'::json),
            'status_distribution', json_build_array(
                json_build_object('name','Completed','value', summary->>'completed'),
                json_build_object('name','Approved','value', summary->>'approved'),
                json_build_object('name','Pending','value', summary->>'pending'),
                json_build_object('name','Rejected','value', summary->>'rejected'),
                json_build_object('name','Rescheduled','value', summary->>'rescheduled')
            )
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Error generating report: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.get_officer_reports(p_officer_id character varying, p_type character varying, p_month character varying, p_start date, p_end date) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 16471)
-- Name: get_officers_by_filters(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officers_by_filters(p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying) RETURNS TABLE(officer_id character varying, full_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT o.officer_id, o.full_name
    FROM m_officers o
    WHERE o.is_active = TRUE
      AND (p_organization_id IS NULL OR o.organization_id = p_organization_id)
      AND (p_department_id IS NULL OR o.department_id = p_department_id)
    ORDER BY o.full_name;
END;
$$;


ALTER FUNCTION public.get_officers_by_filters(p_organization_id character varying, p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 406 (class 1255 OID 16472)
-- Name: get_officers_for_booking_function(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officers_for_booking_function(p_org character varying, p_dept character varying) RETURNS json
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


ALTER FUNCTION public.get_officers_for_booking_function(p_org character varying, p_dept character varying) OWNER TO postgres;

--
-- TOC entry 393 (class 1255 OID 16473)
-- Name: get_officers_list(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officers_list() RETURNS TABLE(officer_id character varying, full_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT o.officer_id, o.full_name
    FROM m_officers o
    WHERE o.is_active = TRUE
    ORDER BY o.full_name;
END;
$$;


ALTER FUNCTION public.get_officers_list() OWNER TO postgres;

--
-- TOC entry 401 (class 1255 OID 16474)
-- Name: get_officers_same_location(character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_officers_same_location(p_state_code character varying, p_division_code character varying, p_organization_id character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying) RETURNS TABLE(officer_id character varying, full_name character varying, officer_type character varying)
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


ALTER FUNCTION public.get_officers_same_location(p_state_code character varying, p_division_code character varying, p_organization_id character varying, p_district_code character varying, p_taluka_code character varying, p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 318 (class 1255 OID 16475)
-- Name: get_organization_by_id(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_organization_by_id(p_organization_id character varying) RETURNS json
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


ALTER FUNCTION public.get_organization_by_id(p_organization_id character varying) OWNER TO postgres;

--
-- TOC entry 329 (class 1255 OID 16476)
-- Name: get_organizations(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_organizations() RETURNS TABLE(organization_id character varying, organization_name text)
    LANGUAGE sql
    AS $$
  SELECT 
      organization_id,
      organization_name::TEXT
  FROM 
      m_organization
  WHERE 
      is_active = TRUE
  ORDER BY 
      organization_name;
$$;


ALTER FUNCTION public.get_organizations() OWNER TO postgres;

--
-- TOC entry 367 (class 1255 OID 16477)
-- Name: get_organizations_by_location(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_organizations_by_location(p_state_code character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying) RETURNS TABLE(organization_id character varying, organization_name character varying, organization_name_ll character varying, address text, pincode character varying, state_code character varying, division_code character varying, district_code character varying, taluka_code character varying)
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


ALTER FUNCTION public.get_organizations_by_location(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying) OWNER TO postgres;

--
-- TOC entry 343 (class 1255 OID 16478)
-- Name: get_roles(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_roles() RETURNS TABLE(role_code character varying, role_name character varying, role_name_ll character varying, is_active boolean)
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


ALTER FUNCTION public.get_roles() OWNER TO postgres;

--
-- TOC entry 321 (class 1255 OID 16479)
-- Name: get_roles_summary(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_roles_summary() RETURNS json
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


ALTER FUNCTION public.get_roles_summary() OWNER TO postgres;

--
-- TOC entry 308 (class 1255 OID 16480)
-- Name: get_service_by_id(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_service_by_id(p_service_id character varying) RETURNS json
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


ALTER FUNCTION public.get_service_by_id(p_service_id character varying) OWNER TO postgres;

--
-- TOC entry 277 (class 1255 OID 16481)
-- Name: get_services(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_services(p_organization_id character varying, p_department_id character varying) RETURNS TABLE(service_id character varying, service_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT s.service_id, s.service_name
  FROM m_services s
  WHERE s.organization_id = p_organization_id
    AND s.department_id = p_department_id
    AND s.is_active = TRUE
  ORDER BY s.service_name;
END;
$$;


ALTER FUNCTION public.get_services(p_organization_id character varying, p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 353 (class 1255 OID 16482)
-- Name: get_services2(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_services2(p_organization_id character varying) RETURNS TABLE(service_id character varying, service_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT s.service_id, s.service_name
  FROM m_services s
  WHERE s.organization_id = p_organization_id
    AND s.is_active = TRUE
  ORDER BY s.service_name;
END;
$$;


ALTER FUNCTION public.get_services2(p_organization_id character varying) OWNER TO postgres;

--
-- TOC entry 319 (class 1255 OID 16483)
-- Name: get_services_by_department(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_services_by_department(p_org_id character varying, p_dept_id character varying) RETURNS TABLE(service_id character varying, organization_id character varying, department_id character varying, service_name character varying, service_name_ll character varying, state_code character varying, is_active boolean)
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


ALTER FUNCTION public.get_services_by_department(p_org_id character varying, p_dept_id character varying) OWNER TO postgres;

--
-- TOC entry 302 (class 1255 OID 16484)
-- Name: get_slot_configs(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_slot_configs() RETURNS TABLE(slot_config_id integer, organization_id character varying, organization_name character varying, department_id character varying, department_name character varying, service_id character varying, service_name character varying, officer_id character varying, officer_name character varying, state_code character varying, state_name character varying, division_code character varying, division_name character varying, district_code character varying, district_name character varying, taluka_code character varying, taluka_name character varying, day_of_week smallint, start_time time without time zone, end_time time without time zone, slot_duration_minutes integer, buffer_minutes integer, max_capacity integer, effective_from date, effective_to date, is_active boolean)
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


ALTER FUNCTION public.get_slot_configs() OWNER TO postgres;

--
-- TOC entry 279 (class 1255 OID 16485)
-- Name: get_states(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_states() RETURNS TABLE(state_code character varying, state_name text)
    LANGUAGE sql
    AS $$
  SELECT state_code, state_name::TEXT
  FROM m_state
  WHERE is_active = TRUE
  ORDER BY state_name;
$$;


ALTER FUNCTION public.get_states() OWNER TO postgres;

--
-- TOC entry 377 (class 1255 OID 16486)
-- Name: get_talukas(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_talukas(p_state_code character varying, p_division_code character varying, p_district_code character varying) RETURNS TABLE(taluka_code character varying, taluka_name character varying)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_talukas(p_state_code character varying, p_division_code character varying, p_district_code character varying) OWNER TO postgres;

--
-- TOC entry 323 (class 1255 OID 16487)
-- Name: get_unread_notification_count(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_unread_notification_count(p_username character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM notifications
  WHERE username = p_username
    AND is_read = FALSE;

  RETURN unread_count;
END;
$$;


ALTER FUNCTION public.get_unread_notification_count(p_username character varying) OWNER TO postgres;

--
-- TOC entry 355 (class 1255 OID 16488)
-- Name: get_user_by_id(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_id(p_user_id character varying) RETURNS TABLE(out_user_id character varying, out_password_hash character varying, out_role_code character varying, out_is_active boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT user_id, password_hash, role_code, is_active
    FROM m_users
    WHERE user_id = p_user_id;
END;
$$;


ALTER FUNCTION public.get_user_by_id(p_user_id character varying) OWNER TO postgres;

--
-- TOC entry 386 (class 1255 OID 16489)
-- Name: get_user_by_mobile_no(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_mobile_no(p_mobile_no character varying) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'visitor_id', v.visitor_id,
    'user_id', u.user_id,
    'username', u.username,
    'full_name', v.full_name,
    'gender', v.gender,
    'dob', v.dob,
    'mobile_no', v.mobile_no,
    'email_id', v.email_id,
    'role_code', u.role_code,
    'state_code', v.state_code,
    'division_code', v.division_code,
    'district_code', v.district_code,
    'taluka_code', v.taluka_code,
    'is_active', v.is_active
  )
  INTO result
  FROM m_visitors_signup v
  JOIN m_users u
    ON u.user_id = v.user_id
  WHERE v.mobile_no = p_mobile_no
    AND v.is_active = TRUE
    AND u.is_active = TRUE;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;


ALTER FUNCTION public.get_user_by_mobile_no(p_mobile_no character varying) OWNER TO postgres;

--
-- TOC entry 293 (class 1255 OID 16490)
-- Name: get_user_by_role_and_id(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_role_and_id(p_entity_id character varying, p_role_code character varying) RETURNS json
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


ALTER FUNCTION public.get_user_by_role_and_id(p_entity_id character varying, p_role_code character varying) OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 16491)
-- Name: get_user_by_username(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_username(p_username character varying) RETURNS TABLE(out_user_id character varying, out_username character varying, out_password_hash character varying, out_role_code character varying, out_is_active boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT user_id, username, password_hash, role_code, is_active
    FROM m_users
    WHERE username = p_username;
END;
$$;


ALTER FUNCTION public.get_user_by_username(p_username character varying) OWNER TO postgres;

--
-- TOC entry 332 (class 1255 OID 16492)
-- Name: get_user_by_username1(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_username1(p_username character varying) RETURNS TABLE(out_user_id character varying, out_username character varying, out_password_hash character varying, out_role_code character varying, out_is_active boolean, out_officer_id character varying, out_state_code character varying, out_division_code character varying, out_district_code character varying, out_taluka_code character varying)
    LANGUAGE plpgsql
    AS $$ BEGIN RETURN QUERY SELECT u.user_id, u.username, u.password_hash, u.role_code, u.is_active, o.officer_id, o.state_code, o.division_code, o.district_code, o.taluka_code FROM m_users u LEFT JOIN m_officers o ON o.user_id = u.user_id WHERE u.username = p_username; END; $$;


ALTER FUNCTION public.get_user_by_username1(p_username character varying) OWNER TO postgres;

--
-- TOC entry 392 (class 1255 OID 16493)
-- Name: get_user_by_username2(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_username2(p_login character varying) RETURNS TABLE(out_user_id character varying, out_username character varying, out_password_hash character varying, out_role_code character varying, out_is_active boolean, out_state_code character varying, out_division_code character varying, out_district_code character varying, out_taluka_code character varying)
    LANGUAGE plpgsql
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
$$;


ALTER FUNCTION public.get_user_by_username2(p_login character varying) OWNER TO postgres;

--
-- TOC entry 360 (class 1255 OID 16494)
-- Name: get_user_by_usernamehelpdesk(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_by_usernamehelpdesk(p_login character varying) RETURNS TABLE(out_user_id character varying, out_username character varying, out_password_hash character varying, out_role_code character varying, out_is_active boolean, out_organization_id character varying, out_state_code character varying, out_division_code character varying, out_district_code character varying, out_taluka_code character varying)
    LANGUAGE plpgsql
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
$$;


ALTER FUNCTION public.get_user_by_usernamehelpdesk(p_login character varying) OWNER TO postgres;

--
-- TOC entry 404 (class 1255 OID 16495)
-- Name: get_user_entity_by_id(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_entity_by_id(p_entity_id character varying) RETURNS json
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


ALTER FUNCTION public.get_user_entity_by_id(p_entity_id character varying) OWNER TO postgres;

--
-- TOC entry 337 (class 1255 OID 16496)
-- Name: get_visitor_dashboard_by_username(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_visitor_dashboard_by_username(p_username character varying) RETURNS json
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


ALTER FUNCTION public.get_visitor_dashboard_by_username(p_username character varying) OWNER TO postgres;

--
-- TOC entry 341 (class 1255 OID 16497)
-- Name: get_visitor_details(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_visitor_details(p_visitor_id character varying DEFAULT NULL::character varying, p_mobile_no character varying DEFAULT NULL::character varying, p_email_id character varying DEFAULT NULL::character varying) RETURNS json
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


ALTER FUNCTION public.get_visitor_details(p_visitor_id character varying, p_mobile_no character varying, p_email_id character varying) OWNER TO postgres;

--
-- TOC entry 342 (class 1255 OID 16498)
-- Name: get_visitor_details_by_id(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_visitor_details_by_id(p_visitor_id character varying) RETURNS TABLE(visitor_id character varying, user_id character varying, full_name character varying, gender character, dob date, mobile_no character varying, email_id character varying, state_code character varying, state_name character varying, division_code character varying, division_name character varying, district_code character varying, district_name character varying, taluka_code character varying, taluka_name character varying, pincode character varying, photo character varying, is_active boolean, insert_date timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_visitor_details_by_id(p_visitor_id character varying) OWNER TO postgres;

--
-- TOC entry 365 (class 1255 OID 16499)
-- Name: get_visitor_profile(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_visitor_profile(p_id character varying) RETURNS TABLE(out_visitor_id character varying, out_user_id character varying, out_full_name character varying, out_gender character, out_dob date, out_mobile_no character varying, out_email_id character varying, out_state_code character varying, out_state_name character varying, out_division_code character varying, out_division_name character varying, out_district_code character varying, out_district_name character varying, out_taluka_code character varying, out_taluka_name character varying, out_pincode character varying, out_photo character varying, out_is_active boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.visitor_id,
        v.user_id,
        v.full_name,
        v.gender,                -- CHAR(1)
        v.dob,
        v.mobile_no,
        v.email_id,
        COALESCE(v.state_code, 'NA') AS out_state_code,
        COALESCE(s.state_name, 'N/A') AS out_state_name,
        COALESCE(v.division_code, 'NA') AS out_division_code,
        COALESCE(dv.division_name, 'N/A') AS out_division_name,
        COALESCE(v.district_code, 'NA') AS out_district_code,
        COALESCE(di.district_name, 'N/A') AS out_district_name,
        COALESCE(v.taluka_code, 'NA') AS out_taluka_code,
        COALESCE(t.taluka_name, 'N/A') AS out_taluka_name,
        v.pincode,
        v.photo,
        v.is_active
    FROM m_visitors_signup v
    LEFT JOIN m_state s      ON v.state_code    = s.state_code
    LEFT JOIN m_division dv  ON v.division_code = dv.division_code
    LEFT JOIN m_district di  ON v.district_code = di.district_code
    LEFT JOIN m_taluka t     ON v.taluka_code   = t.taluka_code
    WHERE v.visitor_id = p_id;
END;
$$;


ALTER FUNCTION public.get_visitor_profile(p_id character varying) OWNER TO postgres;

--
-- TOC entry 310 (class 1255 OID 16500)
-- Name: get_walkin_kpis(character varying, character varying, character varying, character varying, character varying, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_walkin_kpis(p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date) RETURNS TABLE(total_walkins bigint, today_walkins bigint, approved_walkins bigint, completed_walkins bigint, pending_walkins bigint, rejected_walkins bigint)
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


ALTER FUNCTION public.get_walkin_kpis(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_organization_id character varying, p_department_id character varying, p_from_date date, p_to_date date) OWNER TO postgres;

--
-- TOC entry 403 (class 1255 OID 16501)
-- Name: get_walkins_by_department(character varying, character varying, character varying, character varying, date, date, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_walkins_by_department(p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying) RETURNS TABLE(department_id character varying, department_name text, count bigint)
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


ALTER FUNCTION public.get_walkins_by_department(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_from_date date, p_to_date date, p_organization_id character varying, p_department_id character varying) OWNER TO postgres;

--
-- TOC entry 409 (class 1255 OID 16502)
-- Name: get_walkins_by_service(character varying, character varying, character varying, character varying, date, date, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_walkins_by_service(p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_service_id character varying DEFAULT NULL::character varying) RETURNS TABLE(service_id character varying, service_name text, count bigint)
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


ALTER FUNCTION public.get_walkins_by_service(p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_from_date date, p_to_date date, p_organization_id character varying, p_department_id character varying, p_service_id character varying) OWNER TO postgres;

--
-- TOC entry 419 (class 1255 OID 16503)
-- Name: get_walkins_trend(text, character varying, character varying, character varying, character varying, date, date, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_walkins_trend(p_date_type text DEFAULT 'day'::text, p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_from_date date DEFAULT NULL::date, p_to_date date DEFAULT NULL::date, p_organization_id character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_service_id character varying DEFAULT NULL::character varying) RETURNS TABLE(period text, count bigint)
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


ALTER FUNCTION public.get_walkins_trend(p_date_type text, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_from_date date, p_to_date date, p_organization_id character varying, p_department_id character varying, p_service_id character varying) OWNER TO postgres;

--
-- TOC entry 351 (class 1255 OID 16504)
-- Name: insert_appointment(character varying, character varying, character varying, character varying, character varying, text, date, time without time zone, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_appointment(p_visitor_id character varying, p_organization_id character varying, p_department_id character varying, p_officer_id character varying, p_service_id character varying, p_purpose text, p_appointment_date date, p_slot_time time without time zone, p_insert_by character varying, p_insert_ip character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_appointment_id VARCHAR;
    v_officer_name VARCHAR;
    v_visitor_username VARCHAR;
    v_qr_token VARCHAR;
    v_qr_url TEXT;
BEGIN
    -- 🔐 Generate QR token
    v_qr_token := encode(gen_random_bytes(16), 'hex');

    -- 1️⃣ Insert appointment (officer_id is mandatory)
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
    RETURNING appointment_id INTO v_appointment_id;

    -- 2️⃣ Build QR URL
    v_qr_url :=
        'http://localhost:3000/qr-checkin/' ||
        v_appointment_id ||
        '?token=' ||
        v_qr_token;

    -- 3️⃣ Save QR URL in appointment
    UPDATE appointments
    SET qr_code_path = v_qr_url
    WHERE appointment_id = v_appointment_id;

    -- 4️⃣ Officer name lookup
    SELECT full_name
    INTO v_officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    -- 5️⃣ Helpdesk name lookup if not officer
    IF v_officer_name IS NULL THEN
        SELECT full_name
        INTO v_officer_name
        FROM m_helpdesk
        WHERE helpdesk_id = p_officer_id;
    END IF;

    -- 6️⃣ Visitor username
    SELECT u.username
    INTO v_visitor_username
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE vs.visitor_id = p_visitor_id;

    -- 7️⃣ Insert notification
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
        ' is created and pending approval from ' || v_officer_name,
        'info'
    );

    RETURN v_appointment_id;
END;
$$;


ALTER FUNCTION public.insert_appointment(p_visitor_id character varying, p_organization_id character varying, p_department_id character varying, p_officer_id character varying, p_service_id character varying, p_purpose text, p_appointment_date date, p_slot_time time without time zone, p_insert_by character varying, p_insert_ip character varying) OWNER TO postgres;

--
-- TOC entry 288 (class 1255 OID 16505)
-- Name: insert_appointment(character varying, character varying, character varying, character varying, text, date, time without time zone, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_appointment(p_visitor_id character varying, p_organization_id character varying, p_officer_id character varying, p_service_id character varying, p_purpose text, p_appointment_date date, p_slot_time time without time zone, p_state_code character varying, p_department_id character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_insert_by character varying DEFAULT NULL::character varying, p_insert_ip character varying DEFAULT NULL::character varying) RETURNS character varying
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


ALTER FUNCTION public.insert_appointment(p_visitor_id character varying, p_organization_id character varying, p_officer_id character varying, p_service_id character varying, p_purpose text, p_appointment_date date, p_slot_time time without time zone, p_state_code character varying, p_department_id character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_insert_by character varying, p_insert_ip character varying) OWNER TO postgres;

--
-- TOC entry 347 (class 1255 OID 16506)
-- Name: insert_appointment_document(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_appointment_document(p_appointment_id character varying, p_doc_type character varying, p_file_path character varying, p_uploaded_by character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.insert_appointment_document(p_appointment_id character varying, p_doc_type character varying, p_file_path character varying, p_uploaded_by character varying) OWNER TO postgres;

--
-- TOC entry 417 (class 1255 OID 16507)
-- Name: insert_department_data(text, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_department_data(p_organization_id text, p_departments json) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.insert_department_data(p_organization_id text, p_departments json) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 16508)
-- Name: insert_multiple_services(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_multiple_services(p_services jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.insert_multiple_services(p_services jsonb) OWNER TO postgres;

--
-- TOC entry 407 (class 1255 OID 16509)
-- Name: insert_organization_data(text, text, text, text, character varying, character varying, character varying, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_organization_data(p_organization_name text, p_organization_name_ll text, p_state_code text, p_address text, p_pincode character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_departments json) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.insert_organization_data(p_organization_name text, p_organization_name_ll text, p_state_code text, p_address text, p_pincode character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_departments json) OWNER TO postgres;

--
-- TOC entry 412 (class 1255 OID 16510)
-- Name: insert_walkin_appointment(character varying, character, character varying, character varying, character varying, character varying, character varying, character varying, text, date, time without time zone, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_walkin_appointment(p_full_name character varying, p_gender character, p_mobile_no character varying, p_visitor_id character varying, p_organization_id character varying, p_department_id character varying, p_officer_id character varying, p_service_id character varying, p_purpose text, p_walkin_date date, p_slot_time time without time zone, p_state_code character varying, p_email_id character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_insert_by character varying DEFAULT NULL::character varying, p_insert_ip character varying DEFAULT NULL::character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_walkin_id VARCHAR;
    v_officer_name VARCHAR;
    v_visitor_username VARCHAR;
BEGIN
    /* 🚫 Mandatory validations */
    IF p_full_name IS NULL THEN
        RAISE EXCEPTION 'full_name is required';
    END IF;

    IF p_mobile_no IS NULL THEN
        RAISE EXCEPTION 'mobile_no is required';
    END IF;

    IF p_state_code IS NULL THEN
        RAISE EXCEPTION 'state_code is required';
    END IF;

    /* 🔐 Validate officer exists (PREVENT FK ERROR) */
    IF NOT EXISTS (
        SELECT 1 FROM m_officers WHERE officer_id = p_officer_id
    ) THEN
        RAISE EXCEPTION 'Invalid officer_id';
    END IF;

    /* 1️⃣ Insert walk-in (status handled by DB default OR explicitly) */
    INSERT INTO walkins (
        full_name,
        gender,
        mobile_no,
        email_id,
        visitor_id,
        organization_id,
        department_id,
        officer_id,
        service_id,
        purpose,
        walkin_date,
        slot_time,
        status,
        remarks,
        state_code,
        division_code,
        district_code,
        taluka_code,
        insert_by,
        insert_ip
    )
    VALUES (
        p_full_name,
        p_gender,
        p_mobile_no,
        p_email_id,
        p_visitor_id,
        p_organization_id,
        p_department_id,
        p_officer_id,
        p_service_id,
        p_purpose,
        p_walkin_date,
        p_slot_time,
        'pending',
        NULL,
        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code,
        p_insert_by,
        p_insert_ip
    )
    RETURNING walkin_id INTO v_walkin_id;

    /* 2️⃣ Officer name */
    SELECT full_name
    INTO v_officer_name
    FROM m_officers
    WHERE officer_id = p_officer_id;

    /* 3️⃣ Visitor username */
    SELECT u.username
    INTO v_visitor_username
    FROM m_visitors_signup vs
    JOIN m_users u ON u.user_id = vs.user_id
    WHERE vs.visitor_id = p_visitor_id;

    /* 4️⃣ Notification */
    INSERT INTO notifications (
        username,
        appointment_id,
        title,
        message,
        type
    )
    VALUES (
        v_visitor_username,
        v_walkin_id,
        'Walk-in Registered',
        'Your walk-in request ' || v_walkin_id ||
        ' is registered and pending with ' || v_officer_name,
        'info'
    );

    RETURN v_walkin_id;
END;
$$;


ALTER FUNCTION public.insert_walkin_appointment(p_full_name character varying, p_gender character, p_mobile_no character varying, p_visitor_id character varying, p_organization_id character varying, p_department_id character varying, p_officer_id character varying, p_service_id character varying, p_purpose text, p_walkin_date date, p_slot_time time without time zone, p_state_code character varying, p_email_id character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_insert_by character varying, p_insert_ip character varying) OWNER TO postgres;

--
-- TOC entry 331 (class 1255 OID 16511)
-- Name: insert_walkin_appointment(character varying, character, character varying, character varying, character varying, character varying, character varying, character varying, text, date, time without time zone, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_walkin_appointment(p_full_name character varying, p_gender character, p_mobile_no character varying, p_email_id character varying, p_visitor_id character varying, p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_purpose text, p_walkin_date date, p_slot_time time without time zone, p_state_code character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_officer_id character varying DEFAULT NULL::character varying, p_helpdesk_id character varying DEFAULT NULL::character varying, p_insert_by character varying DEFAULT NULL::character varying, p_insert_ip character varying DEFAULT NULL::character varying) RETURNS character varying
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


ALTER FUNCTION public.insert_walkin_appointment(p_full_name character varying, p_gender character, p_mobile_no character varying, p_email_id character varying, p_visitor_id character varying, p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_purpose text, p_walkin_date date, p_slot_time time without time zone, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_officer_id character varying, p_helpdesk_id character varying, p_insert_by character varying, p_insert_ip character varying) OWNER TO postgres;

--
-- TOC entry 267 (class 1255 OID 16512)
-- Name: login_user(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.login_user(p_user_id character varying, p_password_hash character varying) RETURNS TABLE(out_user_id character varying, out_role_code character varying, message text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 1️⃣ Check if user exists
    IF NOT EXISTS (SELECT 1 FROM m_users WHERE user_id = p_user_id) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'User ID not found';
        RETURN;
    END IF;

    -- 2️⃣ Check password
    IF NOT EXISTS (
        SELECT 1 FROM m_users
        WHERE user_id = p_user_id
          AND password_hash = p_password_hash
    ) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'Invalid password';
        RETURN;
    END IF;

    -- 3️⃣ Check active status
    IF EXISTS (
        SELECT 1 FROM m_users
        WHERE user_id = p_user_id
          AND is_active = FALSE
    ) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'Account is inactive';
        RETURN;
    END IF;

    -- 4️⃣ Successful login
    RETURN QUERY
    SELECT user_id, role_code, 'Login successful'
    FROM m_users
    WHERE user_id = p_user_id
      AND password_hash = p_password_hash
      AND is_active = TRUE;
END;
$$;


ALTER FUNCTION public.login_user(p_user_id character varying, p_password_hash character varying) OWNER TO postgres;

--
-- TOC entry 278 (class 1255 OID 16513)
-- Name: preview_generated_slots(time without time zone, time without time zone, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.preview_generated_slots(p_start_time time without time zone, p_end_time time without time zone, p_slot_minutes integer, p_buffer_minutes integer) RETURNS TABLE(slot_time time without time zone, slot_end_time time without time zone)
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


ALTER FUNCTION public.preview_generated_slots(p_start_time time without time zone, p_end_time time without time zone, p_slot_minutes integer, p_buffer_minutes integer) OWNER TO postgres;

--
-- TOC entry 408 (class 1255 OID 16514)
-- Name: register_helpdesk(character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.register_helpdesk(p_username character varying, p_password_hash character varying, p_full_name character varying, p_email character varying, p_phone character varying, p_location character varying) RETURNS json
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


ALTER FUNCTION public.register_helpdesk(p_username character varying, p_password_hash character varying, p_full_name character varying, p_email character varying, p_phone character varying, p_location character varying) OWNER TO postgres;

--
-- TOC entry 376 (class 1255 OID 16515)
-- Name: register_officer(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.register_officer(p_password_hash character varying, p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_designation_code character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_organization_id character varying DEFAULT NULL::character varying, p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_photo character varying DEFAULT NULL::character varying, p_role_code character varying DEFAULT 'OF'::character varying) RETURNS TABLE(out_user_id character varying, out_officer_id character varying, message text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_uid VARCHAR(20);
    v_officer_id VARCHAR(20);
BEGIN
    -- 1️⃣ Check for duplicate mobile
    IF EXISTS (SELECT 1 FROM m_officers WHERE mobile_no = p_mobile_no) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'Mobile number already registered';
        RETURN;
    END IF;

    -- 2️⃣ Check for duplicate email
    IF EXISTS (SELECT 1 FROM m_officers WHERE email_id = p_email_id) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'Email already registered';
        RETURN;
    END IF;

    -- 3️⃣ Validate role exists
    IF NOT EXISTS (SELECT 1 FROM m_role WHERE role_code = p_role_code AND is_active = TRUE) THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'Invalid or inactive role code';
        RETURN;
    END IF;

    -- 4️⃣ Insert into m_users
    INSERT INTO m_users (username, password_hash, role_code, insert_by)
    VALUES ('temp_' || p_mobile_no, p_password_hash, p_role_code, 'admin')
    RETURNING m_users.user_id INTO v_uid;

    -- 5️⃣ Insert into m_officers
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
        p_photo, 'admin'
    )
    RETURNING m_officers.officer_id INTO v_officer_id;

    -- 6️⃣ Update username
    UPDATE m_users
    SET username = v_officer_id
    WHERE user_id = v_uid;

    -- 7️⃣ Return success
    RETURN QUERY SELECT v_uid, v_officer_id, 'Officer registered successfully';

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT NULL::VARCHAR, NULL::VARCHAR, 'Registration failed: ' || SQLERRM;
END;
$$;


ALTER FUNCTION public.register_officer(p_password_hash character varying, p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_designation_code character varying, p_department_id character varying, p_organization_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_photo character varying, p_role_code character varying) OWNER TO postgres;

--
-- TOC entry 301 (class 1255 OID 16516)
-- Name: register_user_by_role(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.register_user_by_role(p_password_hash character varying, p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_gender character varying DEFAULT NULL::character varying, p_designation_code character varying DEFAULT NULL::character varying, p_department_id character varying DEFAULT NULL::character varying, p_organization_id character varying DEFAULT NULL::character varying, p_officer_address character varying DEFAULT NULL::character varying, p_officer_state_code character varying DEFAULT NULL::character varying, p_officer_district_code character varying DEFAULT NULL::character varying, p_officer_division_code character varying DEFAULT NULL::character varying, p_officer_taluka_code character varying DEFAULT NULL::character varying, p_officer_pincode character varying DEFAULT NULL::character varying, p_photo character varying DEFAULT NULL::character varying, p_role_code character varying DEFAULT 'OF'::character varying) RETURNS TABLE(out_user_id character varying, out_entity_id character varying, full_name character varying, out_email_id character varying, message character varying)
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


ALTER FUNCTION public.register_user_by_role(p_password_hash character varying, p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_gender character varying, p_designation_code character varying, p_department_id character varying, p_organization_id character varying, p_officer_address character varying, p_officer_state_code character varying, p_officer_district_code character varying, p_officer_division_code character varying, p_officer_taluka_code character varying, p_officer_pincode character varying, p_photo character varying, p_role_code character varying) OWNER TO postgres;

--
-- TOC entry 292 (class 1255 OID 16518)
-- Name: register_visitor(character varying, character varying, character, date, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.register_visitor(p_password_hash character varying, p_full_name character varying, p_gender character, p_dob date, p_mobile_no character varying, p_email_id character varying, p_state_code character varying DEFAULT NULL::character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_pincode character varying DEFAULT NULL::character varying, p_photo character varying DEFAULT NULL::character varying) RETURNS TABLE(out_user_id character varying, visitor_id character varying, full_name character varying, out_email_id character varying, message character varying)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.register_visitor(p_password_hash character varying, p_full_name character varying, p_gender character, p_dob date, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_pincode character varying, p_photo character varying) OWNER TO postgres;

--
-- TOC entry 375 (class 1255 OID 16519)
-- Name: reschedule_appointment(character varying, character varying, date, time without time zone, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reschedule_appointment(p_appointment_id character varying, p_officer_id character varying, p_new_date date, p_new_time time without time zone, p_reason text DEFAULT 'Rescheduled by officer'::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_updated appointments%ROWTYPE;
    visitor_username VARCHAR;
    officer_name TEXT;
BEGIN
    -- 1️⃣ Validate required inputs
    IF p_appointment_id IS NULL
       OR p_officer_id IS NULL
       OR p_new_date IS NULL
       OR p_new_time IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Appointment ID, officer ID, new date, and new time are required'
        );
    END IF;

    -- 2️⃣ Verify appointment belongs to officer
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

    -- 3️⃣ Get visitor username
    SELECT a.username
    INTO visitor_username
    FROM appointments a
    WHERE a.appointment_id = p_appointment_id;

    -- 4️⃣ Get officer name (optional but recommended)
    SELECT o.full_name
    INTO officer_name
    FROM officers o
    WHERE o.officer_id = p_officer_id;

    -- 5️⃣ Update appointment
    UPDATE appointments
    SET
        appointment_date   = p_new_date,
        slot_time          = p_new_time,
        status             = 'rescheduled',
        reschedule_reason  = p_reason,
        updated_date       = NOW(),
        update_by          = p_officer_id
    WHERE appointment_id = p_appointment_id
    RETURNING * INTO v_updated;

    -- 6️⃣ Insert notification (REFERENCE STYLE – same as create/cancel)
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
        'Appointment Rescheduled',
        'Your appointment ' || p_appointment_id ||
        ' has been rescheduled to ' ||
        to_char(p_new_date, 'DD Mon YYYY') ||
        ' at ' ||
        to_char(p_new_time, 'HH12:MI AM') ||
        ' by ' || COALESCE(officer_name, 'Helpdesk'),
        'warning'
    );

    -- 7️⃣ Return success
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Appointment rescheduled successfully',
        'data', row_to_json(v_updated)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Server error while rescheduling appointment: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION public.reschedule_appointment(p_appointment_id character varying, p_officer_id character varying, p_new_date date, p_new_time time without time zone, p_reason text) OWNER TO postgres;

--
-- TOC entry 368 (class 1255 OID 16520)
-- Name: reset_password_with_otp(text, character varying, text, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_password_with_otp(p_identifier text, p_otp character varying, p_new_password_hash text, p_ip character varying DEFAULT 'NA'::character varying) RETURNS json
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


ALTER FUNCTION public.reset_password_with_otp(p_identifier text, p_otp character varying, p_new_password_hash text, p_ip character varying) OWNER TO postgres;

--
-- TOC entry 328 (class 1255 OID 16521)
-- Name: set_user_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_user_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := generate_user_id();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_user_id() OWNER TO postgres;

--
-- TOC entry 345 (class 1255 OID 16522)
-- Name: set_visitor_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_visitor_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.visitor_id IS NULL THEN
        NEW.visitor_id := generate_visitor_id();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_visitor_id() OWNER TO postgres;

--
-- TOC entry 339 (class 1255 OID 16523)
-- Name: signup(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.signup(p_state_code character varying) RETURNS TABLE(full_name text, gender character, dob date, mobile_no character varying, email_id character varying, pincode character varying, photo character varying)
    LANGUAGE sql
    AS $$
  SELECT 
    full_name,
    gender,
    dob,
    mobile_no,
    email_id,
    pincode,
    photo
  FROM m_visitors_signup
  WHERE is_active = TRUE
    AND state_code = p_state_code
  ORDER BY full_name;
$$;


ALTER FUNCTION public.signup(p_state_code character varying) OWNER TO postgres;

--
-- TOC entry 349 (class 1255 OID 16524)
-- Name: signup(character varying, character varying, character, date, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.signup(p_user_id character varying, p_full_name character varying, p_gender character, p_dob date, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_pincode character varying, p_password character varying, p_photo character varying, p_division_code character varying DEFAULT NULL::character varying, p_district_code character varying DEFAULT NULL::character varying, p_taluka_code character varying DEFAULT NULL::character varying, p_insert_by character varying DEFAULT 'system'::character varying, p_insert_ip character varying DEFAULT 'NA'::character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_visitor_id VARCHAR;
BEGIN
    INSERT INTO m_visitors_signup(
        user_id, full_name, gender, dob, mobile_no, email_id,
        state_code, division_code, district_code, taluka_code,
        pincode, password, photo, is_active, insert_by, insert_ip
    )
    VALUES(
        p_user_id, p_full_name, p_gender, p_dob, p_mobile_no, p_email_id,
        p_state_code, p_division_code, p_district_code, p_taluka_code,
        p_pincode, p_password, p_photo, TRUE, p_insert_by, p_insert_ip
    )
    RETURNING visitor_id INTO new_visitor_id;

    RETURN new_visitor_id; -- return the generated visitor_id
END;
$$;


ALTER FUNCTION public.signup(p_user_id character varying, p_full_name character varying, p_gender character, p_dob date, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_pincode character varying, p_password character varying, p_photo character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_insert_by character varying, p_insert_ip character varying) OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 16525)
-- Name: update_appointment_status(character varying, character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_appointment_status(p_appointment_id character varying, p_status character varying, p_officer_id character varying, p_reason text DEFAULT NULL::text) RETURNS json
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


ALTER FUNCTION public.update_appointment_status(p_appointment_id character varying, p_status character varying, p_officer_id character varying, p_reason text) OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 16526)
-- Name: update_department_data(text, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_department_data(p_organization_id text, p_departments json) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_department_data(p_organization_id text, p_departments json) OWNER TO postgres;

--
-- TOC entry 314 (class 1255 OID 16527)
-- Name: update_multiple_services(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_multiple_services(p_services jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_multiple_services(p_services jsonb) OWNER TO postgres;

--
-- TOC entry 362 (class 1255 OID 16528)
-- Name: update_organization_dept_service_only(character varying, json, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_organization_dept_service_only(p_organization_id character varying, p_org_data json, p_departments json) RETURNS json
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


ALTER FUNCTION public.update_organization_dept_service_only(p_organization_id character varying, p_org_data json, p_departments json) OWNER TO postgres;

--
-- TOC entry 350 (class 1255 OID 16529)
-- Name: update_organization_only(character varying, text, text, text, text, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_organization_only(p_organization_id character varying, p_organization_name text, p_organization_name_ll text, p_state_code text, p_address text, p_pincode character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_organization_only(p_organization_id character varying, p_organization_name text, p_organization_name_ll text, p_state_code text, p_address text, p_pincode character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying) OWNER TO postgres;

--
-- TOC entry 315 (class 1255 OID 16530)
-- Name: update_slot_config(integer, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, smallint, time without time zone, time without time zone, integer, integer, integer, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_slot_config(p_slot_config_id integer, p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_day_of_week smallint, p_start_time time without time zone, p_end_time time without time zone, p_slot_duration_minutes integer, p_buffer_minutes integer, p_max_capacity integer, p_effective_from date, p_effective_to date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    /* 🔒 Conflict check with NEW values */
    IF check_slot_config_conflict(
        p_organization_id,
        p_department_id,
        p_service_id,
        p_officer_id,

        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code,

        p_day_of_week,
        p_start_time,
        p_end_time,

        p_effective_from,
        p_effective_to,

        p_slot_config_id
    ) THEN
        RAISE EXCEPTION 'Slot configuration conflict detected';
    END IF;

    /* ✏️ Update slot config */
    UPDATE m_slot_config
    SET
        organization_id = p_organization_id,
        department_id   = p_department_id,
        service_id      = p_service_id,
        officer_id      = p_officer_id,

        state_code    = p_state_code,
        division_code = p_division_code,
        district_code = p_district_code,
        taluka_code   = p_taluka_code,

        day_of_week = p_day_of_week,
        start_time  = p_start_time,
        end_time    = p_end_time,

        slot_duration_minutes = p_slot_duration_minutes,
        buffer_minutes        = p_buffer_minutes,
        max_capacity          = p_max_capacity,

        effective_from = p_effective_from,
        effective_to   = p_effective_to
    WHERE slot_config_id = p_slot_config_id;
END;
$$;


ALTER FUNCTION public.update_slot_config(p_slot_config_id integer, p_organization_id character varying, p_department_id character varying, p_service_id character varying, p_officer_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_day_of_week smallint, p_start_time time without time zone, p_end_time time without time zone, p_slot_duration_minutes integer, p_buffer_minutes integer, p_max_capacity integer, p_effective_from date, p_effective_to date) OWNER TO postgres;

--
-- TOC entry 410 (class 1255 OID 16531)
-- Name: update_user_by_role(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_by_role(p_entity_id character varying, p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_gender character varying, p_designation_code character varying, p_department_id character varying, p_organization_id character varying, p_officer_address character varying, p_officer_state_code character varying, p_officer_district_code character varying, p_officer_division_code character varying, p_officer_taluka_code character varying, p_officer_pincode character varying, p_photo character varying, p_role_code character varying) RETURNS TABLE(out_entity_id character varying, full_name character varying, out_email_id character varying, message character varying)
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


ALTER FUNCTION public.update_user_by_role(p_entity_id character varying, p_full_name character varying, p_mobile_no character varying, p_email_id character varying, p_gender character varying, p_designation_code character varying, p_department_id character varying, p_organization_id character varying, p_officer_address character varying, p_officer_state_code character varying, p_officer_district_code character varying, p_officer_division_code character varying, p_officer_taluka_code character varying, p_officer_pincode character varying, p_photo character varying, p_role_code character varying) OWNER TO postgres;

--
-- TOC entry 313 (class 1255 OID 16532)
-- Name: update_user_password(bigint, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_password(p_user_id bigint, p_new_hash text) RETURNS boolean
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


ALTER FUNCTION public.update_user_password(p_user_id bigint, p_new_hash text) OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 16533)
-- Name: update_visitor_by_id(character varying, character varying, character, date, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_visitor_by_id(p_visitor_id character varying, p_full_name character varying, p_gender character, p_dob date, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_pincode character varying, p_photo character varying) RETURNS TABLE(visitor_id character varying, user_id character varying, full_name character varying, gender character, dob date, mobile_no character varying, email_id character varying, state_code character varying, state_name character varying, division_code character varying, division_name character varying, district_code character varying, district_name character varying, taluka_code character varying, taluka_name character varying, pincode character varying, photo character varying, is_active boolean, insert_date timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_visitor_by_id(p_visitor_id character varying, p_full_name character varying, p_gender character, p_dob date, p_mobile_no character varying, p_email_id character varying, p_state_code character varying, p_division_code character varying, p_district_code character varying, p_taluka_code character varying, p_pincode character varying, p_photo character varying) OWNER TO postgres;

--
-- TOC entry 402 (class 1255 OID 16534)
-- Name: update_visitor_profile(bigint, text, text, date, text, text, text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_visitor_profile(p_id bigint, p_full_name text, p_gender text, p_dob date, p_mobile_no text, p_email_id text, p_state_code text, p_district_code text, p_taluka_code text, p_pincode text, p_address text, p_division_code text, p_photo text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE m_visitors_signup
    SET
        full_name = p_full_name,
        gender = p_gender,
        dob = p_dob,
        mobile_no = p_mobile_no,
        email_id = p_email_id,
        state_code = p_state_code,
        district_code = p_district_code,
        taluka_code = p_taluka_code,
        pincode = p_pincode,
        address = p_address,
        division_code = p_division_code,
        photo = p_photo,
        updated_date = NOW()
    WHERE visitor_id = p_id OR user_id = p_id;

    RETURN get_visitor_profile(p_id);
END;
$$;


ALTER FUNCTION public.update_visitor_profile(p_id bigint, p_full_name text, p_gender text, p_dob date, p_mobile_no text, p_email_id text, p_state_code text, p_district_code text, p_taluka_code text, p_pincode text, p_address text, p_division_code text, p_photo text) OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16535)
-- Name: appointment_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_documents_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16536)
-- Name: appointment_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_documents (
    document_id character varying(20) DEFAULT ('DOC'::text || lpad((nextval('public.appointment_documents_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    appointment_id character varying(20) NOT NULL,
    doc_type character varying(100) NOT NULL,
    file_path character varying(500) NOT NULL,
    uploaded_by character varying(20) NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.appointment_documents OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16548)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16549)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id character varying(20) DEFAULT ('APT'::text || lpad((nextval('public.appointments_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    visitor_id character varying(20) NOT NULL,
    organization_id character varying(10) NOT NULL,
    department_id character varying(10) DEFAULT NULL::character varying,
    officer_id character varying(20) NOT NULL,
    service_id character varying(20) NOT NULL,
    purpose text NOT NULL,
    appointment_date date NOT NULL,
    slot_time time without time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reschedule_reason text,
    qr_code_path character varying(500),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    cancelled_reason text,
    state_code character varying(2) DEFAULT '27'::character varying,
    division_code character varying(2) DEFAULT '01'::character varying,
    district_code character varying(4),
    taluka_code character varying(5),
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'completed'::character varying, 'rejected'::character varying, 'rescheduled'::character varying, 'cancelled'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16573)
-- Name: checkins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checkins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkins_id_seq OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16574)
-- Name: checkins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkins (
    checkin_id character varying(20) DEFAULT ('CHK'::text || lpad((nextval('public.checkins_id_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    visitor_id character varying(20) NOT NULL,
    appointment_id character varying(20),
    walkin_id character varying(20),
    checkin_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    checkout_time timestamp without time zone,
    status character varying(20) DEFAULT 'checked-in'::character varying NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    CONSTRAINT checkins_status_check CHECK (((status)::text = ANY (ARRAY[('checked-in'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE public.checkins OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16588)
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_id_seq OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16589)
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    feedback_id character varying(20) DEFAULT ('FDB'::text || lpad((nextval('public.feedback_id_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    visitor_id character varying(20) NOT NULL,
    appointment_id character varying(20),
    walkin_id character varying(20),
    rating integer NOT NULL,
    comments text,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16603)
-- Name: m_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_admins_id_seq OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16604)
-- Name: m_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_admins (
    admin_id character varying(20) DEFAULT ('ADM'::text || lpad((nextval('public.m_admins_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    user_id character varying(20) NOT NULL,
    full_name character varying(255) NOT NULL,
    email_id character varying(255),
    mobile_no character varying(15),
    photo character varying(500),
    state_code character varying(2),
    division_code character varying(5),
    district_code character varying(5),
    taluka_code character varying(5),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    address character varying(500),
    pincode character varying(10),
    officer_address character varying(500),
    officer_state_code character varying(2),
    officer_district_code character varying(3),
    officer_division_code character varying(3),
    officer_taluka_code character varying(4),
    officer_pincode character varying(10),
    gender character varying(10)
);


ALTER TABLE public.m_admins OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16617)
-- Name: m_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_department_id_seq OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16618)
-- Name: m_department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_department (
    department_id character varying(10) DEFAULT ('DEP'::text || lpad((nextval('public.m_department_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    organization_id character varying(10) NOT NULL,
    department_name character varying(255) NOT NULL,
    department_name_ll character varying(255) NOT NULL,
    state_code character varying(10) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying,
    division_code character varying(2),
    district_code character varying(3),
    taluka_code character varying(4),
    address text,
    pincode character varying(6)
);


ALTER TABLE public.m_department OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16639)
-- Name: m_designation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_designation (
    designation_code character varying(5) NOT NULL,
    designation_name character varying(255) NOT NULL,
    designation_name_ll character varying(255) NOT NULL,
    state_code character varying(2) NOT NULL,
    division_code character varying(5),
    district_code character varying(5),
    taluka_code character varying(5),
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_designation OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16658)
-- Name: m_district; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_district (
    district_code character varying(3) NOT NULL,
    division_code character varying(3) NOT NULL,
    state_code character varying(2) NOT NULL,
    district_name character varying(255) NOT NULL,
    district_name_ll character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_district OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16678)
-- Name: m_division; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_division (
    division_code character varying(3) NOT NULL,
    state_code character varying(2) NOT NULL,
    division_name character varying(255) NOT NULL,
    division_name_ll character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_division OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16697)
-- Name: m_helpdesk_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_helpdesk_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_helpdesk_id_seq OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16698)
-- Name: m_helpdesk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_helpdesk (
    helpdesk_id character varying(20) DEFAULT ('HLP'::text || lpad((nextval('public.m_helpdesk_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    user_id character varying(20) NOT NULL,
    full_name character varying(255) NOT NULL,
    mobile_no character varying(15),
    email_id character varying(255),
    designation_code character varying(5),
    department_id character varying(10),
    organization_id character varying(10),
    state_code character varying(2),
    division_code character varying(3),
    district_code character varying(3),
    taluka_code character varying(4),
    availability_status character varying(50) DEFAULT 'Available'::character varying,
    photo character varying(500),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    gender character varying(10),
    address character varying(255),
    pincode character varying(6),
    officer_address character varying(255),
    officer_state_code character varying(2),
    officer_division_code character varying(2),
    officer_district_code character varying(3),
    officer_taluka_code character varying(4),
    officer_pincode character varying(6)
);


ALTER TABLE public.m_helpdesk OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16712)
-- Name: m_officers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_officers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_officers_id_seq OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16713)
-- Name: m_officers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_officers (
    officer_id character varying(20) DEFAULT ('OFF'::text || lpad((nextval('public.m_officers_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    user_id character varying(20) NOT NULL,
    full_name character varying(255) NOT NULL,
    mobile_no character varying(15),
    email_id character varying(255),
    designation_code character varying(5),
    department_id character varying(10),
    organization_id character varying(10),
    state_code character varying(2),
    division_code character varying(5),
    district_code character varying(5),
    taluka_code character varying(5),
    availability_status character varying(50) DEFAULT 'Available'::character varying,
    photo character varying(500),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    address character varying(500),
    pincode character varying(10),
    officer_address character varying(500),
    officer_state_code character varying(2),
    officer_district_code character varying(3),
    officer_division_code character varying(3),
    officer_taluka_code character varying(4),
    officer_pincode character varying(10),
    gender character varying(10)
);


ALTER TABLE public.m_officers OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16727)
-- Name: m_organization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_organization_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_organization_id_seq OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16728)
-- Name: m_organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_organization (
    organization_id character varying(10) DEFAULT ('ORG'::text || lpad((nextval('public.m_organization_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    organization_name character varying(255) NOT NULL,
    organization_name_ll character varying(255) NOT NULL,
    state_code character varying(10) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying,
    address text,
    pincode character varying(6),
    division_code character varying(2),
    district_code character varying(3),
    taluka_code character varying(4)
);


ALTER TABLE public.m_organization OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16748)
-- Name: m_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_role (
    role_code character varying(2) NOT NULL,
    role_name character varying(255) NOT NULL,
    role_name_ll character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_role OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16766)
-- Name: m_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_services_id_seq OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16767)
-- Name: m_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_services (
    service_id character varying(10) DEFAULT ('SRV'::text || lpad((nextval('public.m_services_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    organization_id character varying(10) NOT NULL,
    department_id character varying(10) NOT NULL,
    service_name character varying(255) NOT NULL,
    service_name_ll character varying(255) NOT NULL,
    state_code character varying(10) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying,
    division_code character varying(2),
    district_code character varying(3),
    taluka_code character varying(4),
    address text,
    pincode character varying(6)
);


ALTER TABLE public.m_services OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16789)
-- Name: m_slot_breaks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_slot_breaks (
    break_id integer NOT NULL,
    slot_config_id integer NOT NULL,
    break_start time without time zone NOT NULL,
    break_end time without time zone NOT NULL,
    reason character varying(100),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT m_slot_breaks_check CHECK ((break_start < break_end))
);


ALTER TABLE public.m_slot_breaks OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16799)
-- Name: m_slot_breaks_break_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_slot_breaks_break_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_slot_breaks_break_id_seq OWNER TO postgres;

--
-- TOC entry 5664 (class 0 OID 0)
-- Dependencies: 245
-- Name: m_slot_breaks_break_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.m_slot_breaks_break_id_seq OWNED BY public.m_slot_breaks.break_id;


--
-- TOC entry 246 (class 1259 OID 16800)
-- Name: m_slot_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_slot_config (
    slot_config_id integer NOT NULL,
    organization_id character varying(10) NOT NULL,
    department_id character varying(10) DEFAULT NULL::character varying,
    service_id character varying(10),
    officer_id character varying(20),
    state_code character varying(2) NOT NULL,
    division_code character varying(3),
    district_code character varying(3),
    taluka_code character varying(4),
    day_of_week smallint NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    slot_duration_minutes integer NOT NULL,
    buffer_minutes integer DEFAULT 0,
    max_capacity integer NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT m_slot_config_buffer_minutes_check CHECK ((buffer_minutes >= 0)),
    CONSTRAINT m_slot_config_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7))),
    CONSTRAINT m_slot_config_max_capacity_check CHECK ((max_capacity > 0)),
    CONSTRAINT m_slot_config_slot_duration_minutes_check CHECK ((slot_duration_minutes > 0))
);


ALTER TABLE public.m_slot_config OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16820)
-- Name: m_slot_config_slot_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_slot_config_slot_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_slot_config_slot_config_id_seq OWNER TO postgres;

--
-- TOC entry 5665 (class 0 OID 0)
-- Dependencies: 247
-- Name: m_slot_config_slot_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.m_slot_config_slot_config_id_seq OWNED BY public.m_slot_config.slot_config_id;


--
-- TOC entry 248 (class 1259 OID 16821)
-- Name: m_slot_holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_slot_holidays (
    holiday_id integer NOT NULL,
    organization_id character varying(10),
    department_id character varying(10),
    service_id character varying(10),
    state_code character varying(2),
    division_code character varying(3),
    district_code character varying(3),
    taluka_code character varying(4),
    holiday_date date NOT NULL,
    description character varying(100),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.m_slot_holidays OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16828)
-- Name: m_slot_holidays_holiday_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_slot_holidays_holiday_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_slot_holidays_holiday_id_seq OWNER TO postgres;

--
-- TOC entry 5666 (class 0 OID 0)
-- Dependencies: 249
-- Name: m_slot_holidays_holiday_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.m_slot_holidays_holiday_id_seq OWNED BY public.m_slot_holidays.holiday_id;


--
-- TOC entry 250 (class 1259 OID 16829)
-- Name: m_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_staff (
    staff_id character varying NOT NULL,
    full_name character varying NOT NULL
);


ALTER TABLE public.m_staff OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16836)
-- Name: m_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_state (
    state_code character varying(2) NOT NULL,
    state_name character varying(255) NOT NULL,
    state_name_ll character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_state OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16854)
-- Name: m_taluka; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_taluka (
    taluka_code character varying(4) NOT NULL,
    district_code character varying(5) NOT NULL,
    division_code character varying(5) NOT NULL,
    state_code character varying(2) NOT NULL,
    taluka_name character varying(255) NOT NULL,
    taluka_name_ll character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'NA'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_taluka OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16875)
-- Name: m_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_users (
    user_id character varying(20) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role_code character varying(2) NOT NULL,
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_ip character varying(50) DEFAULT 'NA'::character varying NOT NULL,
    insert_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    updated_date timestamp without time zone,
    update_ip character varying(50) DEFAULT NULL::character varying,
    update_by character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.m_users OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16892)
-- Name: m_visitors_signup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_visitors_signup (
    visitor_id character varying(20) NOT NULL,
    user_id character varying(20) NOT NULL,
    full_name character varying(255) NOT NULL,
    gender character(1),
    dob date,
    mobile_no character varying(15),
    email_id character varying(255),
    state_code character varying(2),
    division_code character varying(5),
    district_code character varying(5),
    taluka_code character varying(5),
    pincode character varying(10),
    photo character varying(255),
    is_active boolean DEFAULT true,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    CONSTRAINT m_visitors_signup_gender_check CHECK ((gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar, 'O'::bpchar])))
);


ALTER TABLE public.m_visitors_signup OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16905)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16906)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id character varying(20) DEFAULT ('NOT'::text || lpad((nextval('public.notifications_id_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    username character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    appointment_id character varying(20),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    walkin_id character varying
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 16919)
-- Name: password_reset_otp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_otp (
    id integer NOT NULL,
    user_id character varying(30) NOT NULL,
    otp_code character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_otp OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 16928)
-- Name: password_reset_otp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_otp_id_seq OWNER TO postgres;

--
-- TOC entry 5667 (class 0 OID 0)
-- Dependencies: 258
-- Name: password_reset_otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_otp_id_seq OWNED BY public.password_reset_otp.id;


--
-- TOC entry 259 (class 1259 OID 16929)
-- Name: queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_id_seq OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 16930)
-- Name: queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue (
    queue_id character varying(20) DEFAULT ('QUE'::text || lpad((nextval('public.queue_id_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    token_number character varying(20) NOT NULL,
    appointment_id character varying(20),
    walkin_id character varying(20),
    visitor_id character varying(20) NOT NULL,
    "position" character varying(10) NOT NULL,
    status character varying(20) DEFAULT 'waiting'::character varying NOT NULL,
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    updated_date timestamp without time zone,
    update_by character varying(100),
    update_ip character varying(50),
    CONSTRAINT queue_status_check CHECK (((status)::text = ANY (ARRAY[('waiting'::character varying)::text, ('served'::character varying)::text, ('skipped'::character varying)::text])))
);


ALTER TABLE public.queue OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16944)
-- Name: user_seq_monthly; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_seq_monthly (
    year_month character varying(7) NOT NULL,
    seq_no integer NOT NULL
);


ALTER TABLE public.user_seq_monthly OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 16949)
-- Name: visitor_seq_monthly; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_seq_monthly (
    year_month character varying(7) NOT NULL,
    seq_no integer NOT NULL
);


ALTER TABLE public.visitor_seq_monthly OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 16954)
-- Name: walkin_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.walkin_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.walkin_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 16955)
-- Name: walkin_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.walkin_tokens (
    token_id character varying(20) DEFAULT ('T'::text || lpad((nextval('public.walkin_tokens_id_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    walkin_id character varying(20) NOT NULL,
    token_number character varying(20) NOT NULL,
    issue_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'waiting'::character varying,
    called_time timestamp without time zone,
    completed_time timestamp without time zone,
    CONSTRAINT walkin_tokens_status_check CHECK (((status)::text = ANY (ARRAY[('waiting'::character varying)::text, ('in-progress'::character varying)::text, ('served'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE public.walkin_tokens OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 16965)
-- Name: walkins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.walkins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.walkins_id_seq OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 16966)
-- Name: walkins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.walkins (
    walkin_id character varying(20) DEFAULT ('W'::text || lpad((nextval('public.walkins_id_seq'::regclass))::text, 5, '0'::text)) NOT NULL,
    full_name character varying(255) NOT NULL,
    gender character(1),
    mobile_no character varying(15),
    email_id character varying(255),
    organization_id character varying(10) NOT NULL,
    department_id character varying(10) DEFAULT NULL::character varying,
    officer_id character varying(20),
    purpose character varying(500) NOT NULL,
    walkin_date date DEFAULT CURRENT_DATE NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    remarks character varying(500),
    state_code character varying(2),
    division_code character varying(3),
    district_code character varying(3),
    taluka_code character varying(4),
    insert_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    insert_by character varying(100) DEFAULT 'system'::character varying,
    insert_ip character varying(50) DEFAULT 'NA'::character varying,
    slot_time time without time zone DEFAULT '00:00:00'::time without time zone NOT NULL,
    service_id character varying(10) NOT NULL,
    visitor_id character varying(20),
    CONSTRAINT walkins_gender_check CHECK ((gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar, 'O'::bpchar]))),
    CONSTRAINT walkins_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE public.walkins OWNER TO postgres;

--
-- TOC entry 5214 (class 2604 OID 16989)
-- Name: m_slot_breaks break_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_breaks ALTER COLUMN break_id SET DEFAULT nextval('public.m_slot_breaks_break_id_seq'::regclass);


--
-- TOC entry 5217 (class 2604 OID 16990)
-- Name: m_slot_config slot_config_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config ALTER COLUMN slot_config_id SET DEFAULT nextval('public.m_slot_config_slot_config_id_seq'::regclass);


--
-- TOC entry 5222 (class 2604 OID 16991)
-- Name: m_slot_holidays holiday_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays ALTER COLUMN holiday_id SET DEFAULT nextval('public.m_slot_holidays_holiday_id_seq'::regclass);


--
-- TOC entry 5251 (class 2604 OID 16992)
-- Name: password_reset_otp id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otp ALTER COLUMN id SET DEFAULT nextval('public.password_reset_otp_id_seq'::regclass);


--
-- TOC entry 5612 (class 0 OID 16536)
-- Dependencies: 221
-- Data for Name: appointment_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_documents (document_id, appointment_id, doc_type, file_path, uploaded_by, uploaded_at) FROM stdin;
DOC001	APT014	General Document	uploads\\546dc1d2a3fd0ca12b798d48dd8401c2	USR024	2025-10-16 22:05:58.944354
DOC002	APT016	General Document	uploads\\645ce7a0a9a63535be244f2df73351d7	USR024	2025-11-07 15:20:33.873426
DOC003	APT017	General Document	uploads\\71d5f1fd7d5e9abf07f339ea466a9ad8	USR024	2025-12-03 16:43:05.543212
DOC004	APT018	General Document	uploads\\9e543c61e672169785e2f5210bf6a7fd	USR024	2025-12-05 16:45:29.476531
DOC005	APT019	General Document	uploads\\25f9cb76b040999c8789f78c00d80e91	USR024	2025-12-09 19:01:07.157793
DOC006	APT023	General Document	uploads\\e508cdb422f344bb027a51a424f05eee	USR049	2025-12-10 16:05:25.793046
DOC007	APT028	General Document	uploads\\78252c85cec68180823c232380548375	USR049	2025-12-22 19:19:20.442012
DOC008	APT029	General Document	uploads\\825b13a2fff6c3ee32170f67458ece1a	USR049	2025-12-22 19:27:01.873681
DOC009	APT030	General Document	uploads\\b1a66204912037479259a90035fcdffb	USR049	2025-12-22 19:31:32.172885
DOC010	APT031	General Document	uploads\\d24dccf263dea6a42ac81367e928f174	USR049	2025-12-22 19:35:00.607127
DOC011	APT033	General Document	uploads\\4cdc73f3dc33596b220c050e7cd93746	USR049	2025-12-22 23:03:28.995086
DOC012	APT038	General Document	uploads\\5c8b9e2c0be7d06547e82aadca5d863c	DEC-2025-USR-003	2025-12-24 16:15:19.502476
DOC013	APT040	General Document	uploads\\9676c5f6f33f71fcebf1050a0466e807	USR049	2025-12-25 17:19:54.504256
\.


--
-- TOC entry 5614 (class 0 OID 16549)
-- Dependencies: 223
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, visitor_id, organization_id, department_id, officer_id, service_id, purpose, appointment_date, slot_time, status, reschedule_reason, qr_code_path, is_active, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip, cancelled_reason, state_code, division_code, district_code, taluka_code) FROM stdin;
APT023	VIS030	ORG001	DEP001	OFF013	SER001	meet	2025-12-11	11:00:00	cancelled	\N	\N	t	2025-12-10 16:05:25.258313	USR049	127.0.0.1	2025-12-10 16:48:26.817855	visitor	\N	\N	27	01	\N	\N
APT016	VIS019	ORG001	DEP001	OFF005	SER001	jjjjjjjjjjjjjj	2025-11-07	09:00:00	cancelled	\N	\N	t	2025-11-07 15:20:33.630614	USR024	127.0.0.1	2025-12-19 22:23:30.339803	visitor	\N	\N	27	01	\N	\N
APT033	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-23	10:00:00	cancelled	\N	\N	t	2025-12-22 23:03:28.413935	USR049	127.0.0.1	2025-12-23 00:04:35.979348	visitor	\N	Not available	27	01	\N	\N
APT034	DEC-2025-VIS-001	ORG001	DEP001	OFF014	SER001	meet	2025-12-23	14:00:00	cancelled	\N	\N	t	2025-12-23 11:22:17.216396	DEC-2025-USR-002	127.0.0.1	2025-12-23 11:23:08.494536	visitor	\N	Not available	27	01	\N	\N
APT040	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet 	2025-12-26	14:00:00	cancelled	\N	\N	t	2025-12-25 17:19:54.384158	USR049	127.0.0.1	2025-12-26 12:53:36.527708	visitor	\N	not available	27	01	\N	\N
APT005	VIS018	ORG001	DEP001	OFF005	SER001	jjjjjjjjjj	2025-10-14	11:00:00	completed	\N	\N	t	2025-10-13 16:18:59.021984	USR024	127.0.0.1	2025-12-28 16:08:20.358401	OFF005	\N	\N	27	01	\N	\N
APT024	VIS031	ORG001	DEP001	OFF013	SER001	Timepass	2026-01-02	10:00:00	rescheduled	\N	\N	t	2025-12-10 16:26:13.649564	USR050	127.0.0.1	2025-12-31 13:42:53.349712	OFF013	\N	\N	27	01	\N	\N
APT018	VIS019	ORG001	DEP001	OFF005	SER001	ddd	2025-12-06	10:00:00	rejected	Not valid reason	\N	t	2025-12-05 16:45:28.275942	USR024	127.0.0.1	2025-12-28 16:11:50.988261	OFF005	\N	\N	27	01	\N	\N
APT017	VIS019	ORG001	DEP001	OFF005	SER001	rrrrr	2025-12-05	09:00:00	completed	\N	\N	t	2025-12-03 16:43:04.996291	USR024	127.0.0.1	2026-01-02 06:35:12.631615	OFF005	\N	\N	27	01	\N	\N
APT006	VIS018	ORG001	DEP001	OFF005	SER001	kkk	2025-10-15	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-14 18:41:49.848824	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT008	VIS018	ORG001	DEP001	OFF005	SER001	meeting	2025-10-16	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-15 16:49:25.510091	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT065	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	purpose is to meet	2026-01-13	15:00:00	cancelled	\N	http://localhost:3000/qr-checkin/APT065?token=c38e0784b9130b2c184f28688f6c25e3	t	2026-01-13 14:28:39.367995	JAN-2026-USR-004	127.0.0.1	2026-01-13 14:38:05.741183	visitor	\N	mood nhi hai	27	01	482	\N
APT009	VIS018	ORG001	DEP001	OFF005	SER001	jijiji	2025-10-17	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-16 15:23:20.390098	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT010	VIS018	ORG001	DEP001	OFF005	SER001	sgggg	2025-10-17	14:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-16 19:53:46.964506	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT011	VIS018	ORG001	DEP001	OFF005	SER001	sgggg	2025-10-17	14:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-16 21:25:32.231494	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT013	VIS018	ORG001	DEP001	OFF005	SER001	Milo	2025-10-17	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-16 21:54:30.859203	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT067	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	Hiii	2026-01-15	09:00:00	rejected	not valid reason	http://localhost:3000/qr-checkin/APT067?token=bf7e17e6e7b56d4187ec3ba02a10dcf5	t	2026-01-13 14:35:32.734121	JAN-2026-USR-004	127.0.0.1	2026-01-13 15:24:44.850199	OFF005	\N	\N	27	01	482	\N
APT068	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	hiiii	2026-01-17	09:00:00	rescheduled	\N	http://localhost:3000/qr-checkin/APT068?token=05376985a23f74d9028dc307df5df51c	t	2026-01-13 14:36:26.324408	JAN-2026-USR-004	127.0.0.1	2026-01-13 15:25:27.658302	OFF005	\N	\N	27	01	482	\N
APT066	JAN-2026-VIS-003	ORG002	\N	OFF005	SER002	mooo	2026-01-14	09:00:00	completed	\N	http://localhost:3000/qr-checkin/APT066?token=00fbbfc3d456e0011e1aae09690f4c71	t	2026-01-13 14:29:44.100953	JAN-2026-USR-004	127.0.0.1	2026-01-13 15:34:31.970445	OFF005	\N	\N	27	01	482	\N
APT060	VIS030	ORG013	DEP019	HLP002	SRV020	mmmm	2026-01-16	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT060?token=45b208a43af12e86de34121e4e2e7d72	t	2026-01-09 21:21:06.916869	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	04	\N	\N
APT061	VIS030	ORG013	DEP019	HLP002	SRV020	mm	2026-01-15	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT061?token=cae0921c8ff619cbc0ce92f5af328f4d	t	2026-01-09 21:43:38.426691	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	04	477	4112
APT014	VIS018	ORG001	DEP001	OFF005	SER001	hiii	2025-10-18	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-10-16 22:05:58.352621	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT025	VIS030	ORG001	DEP001	OFF013	SER001	meet	2025-12-20	09:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-19 15:06:30.427727	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT028	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-23	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-22 19:19:20.261221	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT029	VIS030	ORG013	DEP019	HELPDESK	SRV020	meet	2025-12-23	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-22 19:27:01.445275	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT030	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-23	09:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-22 19:31:31.692414	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT031	VIS030	ORG013	DEP019	HELPDESK	SRV020	meet	2025-12-23	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-22 19:35:00.455762	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT032	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-23	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-22 19:51:39.382773	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT035	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-25	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-23 20:46:33.08772	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT036	VIS019	ORG007	DEP013	HELPDESK	SRV014	meetttt	2025-12-25	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-23 23:13:00.096126	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT037	VIS019	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-30	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-24 13:03:46.25954	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT038	DEC-2025-VIS-002	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-25	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-24 16:15:18.880486	DEC-2025-USR-003	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT039	VIS030	ORG007	DEP013	HELPDESK	SRV014	me	2025-12-26	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-25 17:11:53.780017	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT041	VIS030	ORG007	DEP013	HELPDESK	SRV014	meet	2025-12-28	09:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-27 20:58:40.534372	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT042	VIS030	ORG013	DEP019	HLP002	SRV020	milna hai bhai kaam hai	2025-12-31	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-29 23:22:51.09886	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT043	VIS030	ORG013	DEP019	HLP002	SRV020	milooo	2025-12-31	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-30 20:43:37.231036	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT044	VIS019	ORG013	DEP019	HLP002	SRV020	meet me	2025-12-31	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-30 21:14:19.508434	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT048	VIS019	ORG013	DEP019	HLP002	SRV020	nngtt	2025-12-31	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-30 22:12:07.119301	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT049	VIS019	ORG013	DEP019	HLP002	SRV020	milo	2025-12-31	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-30 22:42:02.326601	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT050	VIS019	ORG013	DEP019	HLP002	SRV020	meet	2025-12-31	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-30 22:47:27.454903	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT051	DEC-2025-VIS-001	ORG013	DEP019	HLP002	SRV020	mmm	2026-01-02	14:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-30 22:54:14.767196	DEC-2025-USR-002	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT052	VIS019	ORG013	DEP019	HLP002	SRV020	mmeett	2026-01-01	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-31 11:40:14.679938	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT053	VIS019	ORG013	DEP019	HLP002	SRV020	mmooo	2026-01-01	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-31 11:55:57.201795	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT054	VIS019	ORG013	DEP019	HLP002	SRV020	mmmmmmmmmmmmmm	2026-01-02	09:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	t	2025-12-31 12:07:40.878586	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT045	VIS019	ORG013	DEP019	HLP002	SRV020	meet me plz	2025-12-31	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	\N	f	2025-12-30 21:26:13.401174	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT055	VIS019	ORG013	DEP019	HLP002	SRV020	Educationalpurpose	2026-01-09	14:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT055?token=056145aaf1f5abcb5a5151bb90d69a6d	f	2026-01-02 01:46:32.140402	USR024	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT056	JAN-2026-VIS-001	ORG013	DEP019	HLP002	SRV020	to meet	2026-01-09	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT056?token=f97fd3f4b5cca3821be1346f36e2e93c	t	2026-01-02 06:44:48.319393	JAN-2026-USR-002	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT057	VIS035	ORG013	DEP019	HLP002	SRV020	kande	2026-01-10	09:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT057?token=831f0a20e427d89dd45154686b6513a3	t	2026-01-07 22:01:55.435932	system	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT058	JAN-2026-VIS-002	ORG013	DEP019	HLP002	SRV020	milo bass	2026-01-09	10:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT058?token=3cc47d00fc1b259c1e389509f534fb70	t	2026-01-07 22:16:30.256738	USR059	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT059	JAN-2026-VIS-002	ORG013	DEP019	HLP002	SRV020	mmmmm	2026-01-16	14:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT059?token=aceaa2f25858c482abe452bc86d6fdf8	t	2026-01-07 22:31:44.321625	USR059	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	\N	\N
APT063	VIS030	ORG013	\N	HLP002	SRV020	mmmm	2026-01-16	11:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT063?token=a3292a998945cf4ce3fb0bf42d410711	t	2026-01-09 22:01:32.059652	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	04	477	4112
APT064	VIS030	ORG013	DEP019	HLP002	SRV020	mmm	2026-01-13	14:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT064?token=c30470e25e3df978630756fbc7f665e9	t	2026-01-13 11:31:16.934221	USR049	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	04	477	4112
APT101	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	mm	2026-01-19	09:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT101?token=4cb608bb00da0d6c78dc429f78fb4adb	t	2026-01-17 14:53:26.549558	JAN-2026-USR-004	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	482	\N
APT097	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	meet	2026-01-16	09:15:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT097?token=19eedfec7758be28aa028fbc3d2faa12	t	2026-01-15 03:13:32.995295	JAN-2026-USR-004	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	482	\N
APT098	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	mmm	2026-01-16	12:00:00	rejected	Please create another appointment since it was not approved for the selected date and time	http://localhost:3000/qr-checkin/APT098?token=40852f5637731ef99e7f44cf2c920d5b	t	2026-01-15 03:28:32.396631	JAN-2026-USR-004	127.0.0.1	2026-01-20 16:00:00.069585	system	scheduler	\N	27	01	482	\N
APT026	VIS030	ORG001	DEP001	OFF013	SER001	MEET	2025-12-20	10:00:00	expired	\N	\N	t	2025-12-19 15:14:56.698899	system	NA	\N	\N	\N	\N	27	01	\N	\N
APT019	VIS019	ORG001	DEP001	OFF005	SER001	To meet	2025-12-10	09:00:00	expired	\N	\N	t	2025-12-09 19:01:05.272633	USR024	127.0.0.1	2025-12-28 15:50:00.724764	OFF005	\N	\N	27	01	\N	\N
APT012	VIS018	ORG001	DEP001	OFF005	SER001	meet	2025-10-24	11:00:00	expired	\N	\N	t	2025-10-16 21:36:46.177851	USR024	127.0.0.1	2026-01-01 21:44:19.359976	OFF005	\N	\N	27	01	\N	\N
APT007	VIS018	ORG001	DEP001	OFF005	SER001	meeting	2025-10-16	10:00:00	expired	\N	\N	t	2025-10-15 16:34:37.222968	system	NA	2026-01-19 17:01:13.167455	OFF005	\N	\N	27	01	\N	\N
APT100	VIS030	ORG002	DEP002	OFF005	SER002	asach	2026-01-15	09:15:00	expired	\N	http://localhost:3000/qr-checkin/APT100?token=2bfa260baa1972a7dae211694e9a0c2d	t	2026-01-14 23:44:22.150649	USR049	127.0.0.1	2026-01-15 04:13:32.325822	OFF005	\N	\N	27	01	482	\N
APT099	JAN-2026-VIS-003	ORG002	DEP002	OFF005	SER002	mmm	2026-01-15	09:00:00	expired	mmm	http://localhost:3000/qr-checkin/APT099?token=1789d5866acac9bc1a9d8a64c60abe4c	t	2026-01-14 23:42:43.979255	JAN-2026-USR-004	127.0.0.1	2026-01-15 04:12:09.910031	OFF005	\N	\N	27	01	482	\N
\.


--
-- TOC entry 5616 (class 0 OID 16574)
-- Dependencies: 225
-- Data for Name: checkins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkins (checkin_id, visitor_id, appointment_id, walkin_id, checkin_time, checkout_time, status, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip) FROM stdin;
\.


--
-- TOC entry 5618 (class 0 OID 16589)
-- Dependencies: 227
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback (feedback_id, visitor_id, appointment_id, walkin_id, rating, comments, submitted_at, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip) FROM stdin;
\.


--
-- TOC entry 5620 (class 0 OID 16604)
-- Dependencies: 229
-- Data for Name: m_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_admins (admin_id, user_id, full_name, email_id, mobile_no, photo, state_code, division_code, district_code, taluka_code, is_active, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip, address, pincode, officer_address, officer_state_code, officer_district_code, officer_division_code, officer_taluka_code, officer_pincode, gender) FROM stdin;
ADM002	USR035	Admin1	admin1@gmail.com	987654321901	5c20b9f04ee1437b86f27a365227a997	\N	\N	\N	\N	t	2025-12-04 15:00:57.196642	system	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ADM003	USR053	Priya Deshmukh12	shrutimhambrey03@gmail.com	98765432526	0082e804e3e172180781117799b0be5b	\N	\N	\N	\N	t	2025-12-19 15:23:17.887374	system	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ADM004	USR054	Riya	riya@gmail.com	9876543219044	976adddd51556f3d2d10e68ddb37b54c	27	04	469	4137	t	2025-12-19 15:53:52.306236	system	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5622 (class 0 OID 16618)
-- Dependencies: 231
-- Data for Name: m_department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_department (department_id, organization_id, department_name, department_name_ll, state_code, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by, division_code, district_code, taluka_code, address, pincode) FROM stdin;
DEP002	ORG002	Department2	विभाग2	27	t	2025-10-06 15:28:56.89664	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP003	ORG003	Department3	विभाग3	27	t	2025-10-06 15:28:56.89664	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP005	ORG006	Mahsul	Mahsul	27	t	2025-12-10 11:09:09.965116	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP006	ORG006	Mahsul5	Mahsul5	27	t	2025-12-10 11:46:16.29443	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP008	ORG002	Revenue Department	महसूल विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP009	ORG003	Public Works Department	सार्वजनिक बांधकाम विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP010	ORG005	Health Department	आरोग्य विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP011	ORG005	Education Department	शिक्षण विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP012	ORG006	Women and Child Development	महिला व बाल विकास विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP013	ORG007	Rural Development	ग्रामीण विकास विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP014	ORG008	Urban Development	नगर विकास विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP015	ORG009	Social Welfare	सामाजिक कल्याण विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP016	ORG010	Agriculture Department	कृषी विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP017	ORG011	Water Resources	जलसंपदा विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP018	ORG012	Transport Department	परिवहन विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP019	ORG013	Labour Department	कामगार विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP020	ORG014	Food and Civil Supplies	अन्न व नागरी पुरवठा विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP021	ORG015	Environment Department	पर्यावरण विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP022	ORG016	Planning Department	नियोजन विभाग	27	t	2025-12-22 19:01:43.528644	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP023	ORG017	Education Department	शिक्षण विभाग	27	t	2026-01-01 19:58:53.435193	NA	NA	\N	\N	\N	06	484	4032	Nagpur	400701
DEP024	ORG017	Sports Department	क्रीडा विभाग	27	t	2026-01-01 20:53:08.67015	NA	NA	\N	\N	\N	06	484	4032	Nagpur	400701
DEP001	ORG001	Department1	विभाग1	27	t	2025-10-06 15:28:56.89664	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP028	ORG001	Department	विभाग1	27	t	2026-01-02 06:00:10.640814	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP029	ORG001	Department1	विभाग1	27	t	2026-01-02 07:19:08.77234	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP030	ORG001	Department	विभाग1	27	t	2026-01-02 12:43:19.130555	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP031	ORG001	Department	विभाग1	27	t	2026-01-02 12:43:19.130555	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
DEP025	ORG018	Pancard makinggg	पॅनकार्ड 	27	t	2026-01-02 04:36:38.622714	NA	NA	2026-01-15 08:14:09.79296	\N	\N	02	493	4300	Karad	400701
\.


--
-- TOC entry 5623 (class 0 OID 16639)
-- Dependencies: 232
-- Data for Name: m_designation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_designation (designation_code, designation_name, designation_name_ll, state_code, division_code, district_code, taluka_code, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
DES01	District Officer	जिल्हाधिकारी	27	01	482	\N	t	2025-10-07 13:45:14.398804	NA	NA	\N	\N	\N
DES02	Assistant Officer	सहाय्यक अधिकारी	27	01	482	\N	t	2025-10-07 13:45:14.398804	NA	NA	\N	\N	\N
DES03	Clerk	लिपिक	27	01	482	\N	t	2025-10-07 13:45:14.398804	NA	NA	\N	\N	\N
\.


--
-- TOC entry 5624 (class 0 OID 16658)
-- Dependencies: 233
-- Data for Name: m_district; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_district (district_code, division_code, state_code, district_name, district_name_ll, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
466	03	27	Ahilyanagar	अहिल्यानगर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
467	05	27	Akola	अकोला	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
468	05	27	Amravati	अमरावती	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
470	06	27	Beed	बीड	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
471	06	27	Bhandara	भंडारा	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
472	05	27	Buldhana	बुलढाणा	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
473	06	27	Chandrapur	चंद्रपूर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
469	04	27	Chhatrapati Sambhajinagar	छत्रपती संभाजीनगर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
488	04	27	Dharashiv	धाराशिव	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
474	03	27	Dhule	धुळे	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
475	06	27	Gadchiroli	गडचिरोली	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
476	06	27	Gondia	गोंदीया	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
477	04	27	Hingoli	हिंगोली	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
478	03	27	Jalgaon	जळगाव	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
479	04	27	Jalna	जालना	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
480	02	27	Kolhapur	कोल्हापूर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
481	04	27	Latur	लातूर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
482	01	27	Mumbai	मुंबई	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
483	01	27	Mumbai Suburban	मुंबई उपनगर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
484	06	27	Nagpur	नागपूर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
485	04	27	Nanded	नांदेड	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
486	03	27	Nandurbar	नंदूरबार	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
487	03	27	Nashik	नाशिक	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
665	01	27	Palghar	पालघर 	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
489	04	27	Parbhani	परभणी	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
490	02	27	Pune	पुणे	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
491	01	27	Raigad	रायगड	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
492	01	27	Ratnagiri	रत्नागिरी	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
493	02	27	Sangli	सांगली	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
494	02	27	Satara	सातारा	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
495	01	27	Sindhudurg	सिंधुदुर्ग	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
496	02	27	Solapur	सोलापूर	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
497	01	27	Thane	ठाणे	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
498	06	27	Wardha	वर्धा	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
499	05	27	Washim	वाशिम	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
500	05	27	Yavatmal	यवतमाळ	t	2025-09-27 23:02:13.838754	NA	NA	\N	\N	\N
\.


--
-- TOC entry 5625 (class 0 OID 16678)
-- Dependencies: 234
-- Data for Name: m_division; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_division (division_code, state_code, division_name, division_name_ll, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
01	27	Konkan	कोकण	t	2025-09-27 21:25:28.919783	NA	NA	\N	\N	\N
02	27	Pune	पुणे	t	2025-09-27 21:25:28.919783	NA	NA	\N	\N	\N
03	27	Nashik	नाशिक	t	2025-09-27 21:25:28.919783	NA	NA	\N	\N	\N
04	27	Aurangabad	औरंगाबाद	t	2025-09-27 21:25:28.919783	NA	NA	\N	\N	\N
05	27	Amravati	अमरावती	t	2025-09-27 21:25:28.919783	NA	NA	\N	\N	\N
06	27	Nagpur	नागपूर	t	2025-09-27 21:25:28.919783	NA	NA	\N	\N	\N
\.


--
-- TOC entry 5627 (class 0 OID 16698)
-- Dependencies: 236
-- Data for Name: m_helpdesk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_helpdesk (helpdesk_id, user_id, full_name, mobile_no, email_id, designation_code, department_id, organization_id, state_code, division_code, district_code, taluka_code, availability_status, photo, is_active, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip, gender, address, pincode, officer_address, officer_state_code, officer_division_code, officer_district_code, officer_taluka_code, officer_pincode) FROM stdin;
HLP002	DEC-2025-USR-005	Helpdesk Auragabad	1234567890	helpdesk@gmail.com	DES03	DEP019	ORG013	27	04	477	4112	Available	062290bffeb944329552ef7b0195ae3d	t	2025-12-29 23:05:37.089524	system	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
HLP003	JAN-2026-USR-005	Helpdesk Mumbai	9876543210	helpdesk482@gmail.com	DES03	DEP002	ORG002	27	01	482	\N	Available	5b368f5ef1f7a5f4d07c76f9b4a5ff2a	t	2026-01-14 16:04:50.349955	system	NA	\N	\N	\N	Female	\N	\N	Mumbai fort	27	01	482	\N	400789
\.


--
-- TOC entry 5629 (class 0 OID 16713)
-- Dependencies: 238
-- Data for Name: m_officers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_officers (officer_id, user_id, full_name, mobile_no, email_id, designation_code, department_id, organization_id, state_code, division_code, district_code, taluka_code, availability_status, photo, is_active, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip, address, pincode, officer_address, officer_state_code, officer_district_code, officer_division_code, officer_taluka_code, officer_pincode, gender) FROM stdin;
OFF006	USR028	Prashant	9876543213	prashant@gmail.com	DES02	DEP001	ORG001	27	05	467	3991	Available	45144e07411c701a10974dbbbec2e21a	t	2025-11-10 15:33:33.645976	admin	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF007	USR029	Priya desai	98765432144	priyadesai@gmail.com	DES02	DEP001	ORG001	27	05	467	3991	Available	773de6905469da9a19ba6753ec0351cb	t	2025-11-10 15:46:06.18239	admin	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF008	USR030	Admin	987654321902	admin@gmail.com	DES03	DEP001	ORG001	27	04	469	4137	Available	90951d3f881eb3cec60b4bfb41ef771f	t	2025-11-11 12:12:40.742271	admin	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF009	USR032	Admin2	98765432190266	admin2@gmail.com	DES03	DEP001	ORG001	27	01	482	\N	Available	76da025736ee623ea1b2e7ed5b1ed39d	t	2025-11-11 14:02:19.811191	admin	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF010	USR033	Admin3	98765432133	admin3@gmail.com	\N	DEP001	ORG001	27	05	467	3991	Available	b2ca2a9f5c41d1e64632a66bb7324f4e	t	2025-11-11 14:06:15.941634	admin	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF011	USR045	Janta	987654321444	priya@gmail.com	\N	DEP001	ORG001	27	05	468	4006	Available	1085dd8514cb77b5c036a463e7e06007	t	2025-12-08 18:40:19.613915	system	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF013	USR047	Aradhana Khandagale	9876543219088	khandagalearadhana@gmail.com	DES01	DEP001	ORG001	27	05	467	3991	Available	1fcfc357142906908fac1f3f53036eca	t	2025-12-08 19:01:34.597966	system	NA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF015	JAN-2026-USR-001	Yogesh Joshi	6521347899	yogesh@gmail.com	DES03	DEP022	ORG016	27	\N	\N	\N	Available	48742e7b415eb7cddf8df5554e9abd2a	t	2026-01-01 21:05:26.446903	system	NA	\N	\N	\N	\N	\N	Old custom Office, Mumbai Fort	27	482	01	\N	400789	Male
OFF014	USR048	Rahul Patil	9876543210	rahul.patil@gov.in	\N	DEP002	ORG002	27	01	482	\N	Available	\N	t	2025-12-21 19:53:10.018317	admin	127.0.0.1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
OFF005	USR026	Mohan Deshpande	9876543219	mohan@gmail.com	DES02	DEP002	ORG002	27	01	482	\N	Available	f8f53db5dc6d485fdf577e7833bd56ca	t	2025-10-11 19:19:37.342139	admin	NA	2026-01-15 19:41:15.136379	\N	\N	\N	\N	mumbai	27	482	01	\N	400789	Male
\.


--
-- TOC entry 5631 (class 0 OID 16728)
-- Dependencies: 240
-- Data for Name: m_organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_organization (organization_id, organization_name, organization_name_ll, state_code, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by, address, pincode, division_code, district_code, taluka_code) FROM stdin;
ORG003	Organization3	संस्था3	27	t	2025-10-06 15:26:14.42741	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG005	NIC 	NIC	27	t	2025-12-10 11:04:55.304375	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG006	Land Revenue	Land Revenue	27	t	2025-12-10 11:09:09.965116	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG007	District Collector Office, Amravati	जिल्हाधिकारी कार्यालय, अमरावती	27	t	2025-12-21 22:33:56.553508	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG008	Zilla Parishad, Amravati	जिल्हा परिषद, अमरावती	27	t	2025-12-21 22:33:56.553508	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG014	Nagpur Municipal Corporation	नागपूर महानगरपालिका	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG015	Nashik Municipal Corporation	नाशिक महानगरपालिका	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG016	Mumbai Municipal Corporation	मुंबई महानगरपालिका	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
ORG009	Pune Municipal Corporation	महानगरपालिका	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	02	480	4292
ORG010	Public Works Department,Pune	सार्वजनिक बांधकाम विभाग	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	02	480	4291
ORG011	Regional Transport Office, Pune	प्रादेशिक परिवहन कार्यालय	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	02	480	4294
ORG013	District Skill Development and Employment Office, Aurangabad	जिल्हा कौशल्य विकास व रोजगार कार्यालय, अमरावती	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	04	477	4112
ORG012	Maharashtra State Electricity Distribution Company Limited (MSEDCL),Aurangabad	महाराष्ट्र राज्य विद्युत वितरण कंपनी लिमिटेड	27	t	2025-12-21 22:55:18.102337	NA	NA	\N	\N	\N	\N	\N	04	477	4112
ORG017	Zilla Parishad Nagpur	जिल्हा परिषद नागपूर	27	t	2026-01-01 19:54:08.154083	NA	NA	\N	\N	\N	Nagpur	400701	06	484	4032
ORG018	Zilla Parishad Sangli	जिल्हा परिषद सांगली	27	t	2026-01-02 04:36:38.622714	NA	NA	\N	\N	\N	Karad	400701	02	493	4300
ORG001	Organization1	संस्था1	27	t	2025-10-06 15:26:14.42741	NA	NA	2026-01-02 12:58:40.543572	\N	\N	mumbai	400701	01	482	\N
ORG002	Organization2	संस्था2	27	t	2025-10-06 15:26:14.42741	NA	NA	\N	\N	\N	\N	\N	01	482	\N
\.


--
-- TOC entry 5632 (class 0 OID 16748)
-- Dependencies: 241
-- Data for Name: m_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_role (role_code, role_name, role_name_ll, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
AD	Admin	प्रशासक	t	2025-09-30 10:50:14.075398	NA	NA	\N	\N	\N
OF	Officer	अधिकारी	t	2025-09-30 10:50:14.075398	NA	NA	\N	\N	\N
HD	Helpdesk	सहायता केंद्र	t	2025-09-30 10:50:14.075398	NA	NA	\N	\N	\N
VS	Visitor	भेट देणारा	t	2025-09-30 10:50:14.075398	NA	NA	\N	\N	\N
\.


--
-- TOC entry 5634 (class 0 OID 16767)
-- Dependencies: 243
-- Data for Name: m_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_services (service_id, organization_id, department_id, service_name, service_name_ll, state_code, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by, division_code, district_code, taluka_code, address, pincode) FROM stdin;
SER002	ORG002	DEP002	Service2	सेवा2	27	t	2025-10-06 15:29:54.586079	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SER003	ORG003	DEP003	Service3	सेवा3	27	t	2025-10-06 15:29:54.586079	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV005	ORG006	DEP005	Mahsul1	Mahsul1	27	t	2025-12-10 11:09:09.965116	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV006	ORG006	DEP006	Service5	Service5	27	t	2025-12-10 11:46:16.29443	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV007	ORG006	DEP006	Service6	Service6	27	t	2025-12-10 11:49:46.535418	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV009	ORG002	DEP008	Land Record Verification	जमीन नोंद पडताळणी	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV010	ORG003	DEP009	Road Repair Request	रस्ता दुरुस्ती विनंती	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV011	ORG005	DEP010	Health Certificate Issuance	आरोग्य प्रमाणपत्र सेवा	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV012	ORG005	DEP011	School Admission Assistance	शाळा प्रवेश सहाय्य	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV013	ORG006	DEP012	Anganwadi Scheme Registration	अंगणवाडी योजना नोंदणी	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV014	ORG007	DEP013	Rural Housing Application	ग्रामीण गृहनिर्माण अर्ज	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV015	ORG008	DEP014	Property Tax Related Service	मालमत्ता कर सेवा	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV016	ORG009	DEP015	Pension Scheme Application	पेन्शन योजना अर्ज	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV017	ORG010	DEP016	Crop Subsidy Application	पीक अनुदान अर्ज	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV018	ORG011	DEP017	Water Connection Approval	पाणी जोडणी मान्यता	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV019	ORG012	DEP018	Driving License Assistance	वाहनचालक परवाना सहाय्य	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV020	ORG013	DEP019	Labour Registration Service	कामगार नोंदणी सेवा	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV022	ORG015	DEP021	Environmental Clearance Request	पर्यावरण मंजुरी सेवा	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV023	ORG016	DEP022	Development Planning Approval	विकास नियोजन मंजुरी	27	t	2025-12-22 19:09:31.10868	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV035	ORG017	DEP023	Scholarship	शिष्यवृत्ती	27	t	2026-01-01 20:50:57.326165	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV036	ORG017	DEP024	Sports management	क्रीडा व्यवस्थापन	27	t	2026-01-01 20:53:08.67015	NA	NA	\N	\N	\N	06	484	4032	Nagpur	400701
SRV021	ORG014	DEP020	Ration Card Update	रेशन कार्ड अद्ययावत सेवा	27	t	2025-12-22 19:09:31.10868	NA	NA	2026-01-15 11:56:03.681211	\N	\N	\N	\N	\N	\N	\N
SRV037	ORG018	DEP025	Pancardddddd	पॅनकार्ड 	27	t	2026-01-02 04:36:38.622714	NA	NA	2026-01-15 12:14:28.08637	\N	\N	02	493	4300	Karad	400701
SER001	ORG001	DEP001	Service1	सेवा1	27	t	2025-10-06 15:29:54.586079	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV040	ORG001	DEP028	Service1	सेवा1	27	t	2026-01-02 06:00:10.640814	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV041	ORG001	DEP029	Service1	सेवा1	27	t	2026-01-02 07:19:08.77234	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV042	ORG001	DEP030	Service1	सेवा1	27	t	2026-01-02 12:43:19.130555	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
SRV043	ORG001	DEP031	Service1	सेवा1	27	t	2026-01-02 12:43:19.130555	NA	NA	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5635 (class 0 OID 16789)
-- Dependencies: 244
-- Data for Name: m_slot_breaks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_slot_breaks (break_id, slot_config_id, break_start, break_end, reason, is_active, insert_date) FROM stdin;
\.


--
-- TOC entry 5637 (class 0 OID 16800)
-- Dependencies: 246
-- Data for Name: m_slot_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_slot_config (slot_config_id, organization_id, department_id, service_id, officer_id, state_code, division_code, district_code, taluka_code, day_of_week, start_time, end_time, slot_duration_minutes, buffer_minutes, max_capacity, effective_from, effective_to, is_active, insert_date) FROM stdin;
39	ORG002	DEP002	SER002	OFF005	27	01	482	\N	1	09:00:00	17:00:00	15	0	1	2026-01-01	2026-01-31	t	2026-01-14 21:12:47.174754
40	ORG002	DEP002	SER002	OFF005	27	01	482	\N	2	09:00:00	17:00:00	15	0	1	2026-01-01	2026-01-31	t	2026-01-14 21:12:47.222409
41	ORG002	DEP002	SER002	OFF005	27	01	482	\N	3	09:00:00	17:00:00	15	0	1	2026-01-01	2026-01-31	t	2026-01-14 21:12:47.236384
42	ORG002	DEP002	SER002	OFF005	27	01	482	\N	4	09:00:00	17:00:00	15	0	1	2026-01-01	2026-01-31	t	2026-01-14 21:12:47.252828
43	ORG002	DEP002	SER002	OFF005	27	01	482	\N	5	09:00:00	17:00:00	15	0	1	2026-01-01	2026-01-31	t	2026-01-14 21:12:47.265525
\.


--
-- TOC entry 5639 (class 0 OID 16821)
-- Dependencies: 248
-- Data for Name: m_slot_holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_slot_holidays (holiday_id, organization_id, department_id, service_id, state_code, division_code, district_code, taluka_code, holiday_date, description, is_active, insert_date) FROM stdin;
1	ORG001	\N	\N	27	\N	\N	\N	2026-01-26	Republic Day	t	2026-01-13 12:43:19.500196
\.


--
-- TOC entry 5641 (class 0 OID 16829)
-- Dependencies: 250
-- Data for Name: m_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_staff (staff_id, full_name) FROM stdin;
HLP002	Helpdesk Auragabad
OFF009	Admin2
OFF015	Yogesh Joshi
OFF011	Janta
OFF005	Mohan Deshpande
OFF007	Priya desai
OFF010	Admin3
OFF013	Aradhana Khandagale
OFF008	Admin
OFF014	Rahul Patil
OFF006	Prashant
\.


--
-- TOC entry 5642 (class 0 OID 16836)
-- Dependencies: 251
-- Data for Name: m_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_state (state_code, state_name, state_name_ll, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
35	Andaman And Nicobar Islands	अंदमान आणि निकोबार	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
28	Andhra Pradesh	आंध्र प्रदेश	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
12	Arunachal Pradesh	अरुणाचल प्रदेश	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
18	Assam	आसाम	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
10	Bihar	बिहार	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
4	Chandigarh	चंदीगढ	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
22	Chhattisgarh	छत्तीसगढ़	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
7	Delhi	दिल्ली	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
30	Goa	गोवा	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
24	Gujarat	गुजरात	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
6	Haryana	हरियाणा	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
2	Himachal Pradesh	हिमाचल प्रदेश	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
1	Jammu And Kashmir	जम्मू व काश्मीर	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
20	Jharkhand	झारखंड	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
29	Karnataka	कर्नाटक	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
32	Kerala	केरळ	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
37	Ladakh	लडाख	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
31	Lakshadweep	लक्षद्वीप	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
23	Madhya Pradesh	मध्यप्रदेश	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
27	Maharashtra	महाराष्ट्र	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
14	Manipur	मणिपूर	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
17	Meghalaya	मेघालय	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
15	Mizoram	मिझोरम	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
13	Nagaland	नागालॅंड	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
21	Odisha	ओरिसा	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
34	Puducherry	पुद्दूचेरी	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
3	Punjab	पंजाब	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
8	Rajasthan	राजस्थान	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
11	Sikkim	सिक्कीम	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
33	Tamil Nadu	तामिळ नाडू	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
36	Telangana	तेलंगणा	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
38	The Dadra And Nagar Haveli And Daman And Diu	दादरा आणि नगर हवेली आणि दमण आणि दीव	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
16	Tripura	त्रिपूरा	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
5	Uttarakhand	उत्तराखंड	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
9	Uttar Pradesh	उत्तर प्रदेश	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
19	West Bengal	पश्चिम बंगाल	t	2025-09-27 21:24:11.425809	NA	NA	\N	\N	\N
\.


--
-- TOC entry 5643 (class 0 OID 16854)
-- Dependencies: 252
-- Data for Name: m_taluka; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_taluka (taluka_code, district_code, division_code, state_code, taluka_name, taluka_name_ll, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
4004	468	05	27	Achalpur	अचलपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4062	475	06	27	Aheri	अहेरी 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4228	481	04	27	Ahmadpur	अहमदपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4292	480	02	27	Ajra	आजरा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4254	496	02	27	Akkalkot	अक्कलकोट	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3950	486	03	27	Akkalkuwa	अक्कलकुवा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3991	467	05	27	Akola	अकोला	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4201	466	03	27	Akole	अकोले	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3989	467	05	27	Akot	अकोट	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3951	486	03	27	Akrani	अकर्नी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4177	491	01	27	Alibag	अलिबाग	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3969	478	03	27	Amalner	अमळनेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4129	479	04	27	Ambad	अंबड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4170	497	01	27	Ambarnath	अंबरनाथ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4188	490	02	27	Ambegaon	आंबेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4225	470	06	27	Ambejogai	आंबेजोगाई	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4047	476	06	27	Amgaon	आमगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4009	468	05	27	Amravati	अमरावती	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
NA	483	01	27	Andheri	अंधेरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4003	468	05	27	Anjangaon Surji	अंजनगाव सुर्जी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4099	485	04	27	Ardhapur	अर्धापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4050	476	06	27	Arjuni Morgaon	अर्जुनी मोरगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4053	475	06	27	Armori	आरमोरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4088	500	05	27	Arni	अर्नी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4017	498	06	27	Arvi	आर्वी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4215	470	06	27	Ashti	आष्टी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4015	498	06	27	Ashti	आष्टी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4300	493	02	27	Atpadi	आटपाडी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4113	477	04	27	Aundha (Nagnath)	औंढा (नागनाथ)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4232	481	04	27	Ausa	औसा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4080	500	05	27	Babulgaon	बाबूलगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4128	479	04	27	Badnapur	बदनापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4145	487	03	27	Baglan	बागलण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3990	467	05	27	Balapur	बाळापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4074	473	06	27	Ballarpur	बल्लारपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4199	490	02	27	Baramati	बारामती	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4246	496	02	27	Barshi	बार्शी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3994	467	05	27	Barshitakli	बार्शीटाकळी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4221	470	06	27	Beed	बीड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3971	478	03	27	Bhadgaon	भडगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4070	473	06	27	Bhadravati	भद्रावती 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4061	475	06	27	Bhamragad	भामरागड 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4039	471	06	27	Bhandara	भंडारा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4010	468	05	27	Bhatkuli	भातकुली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4166	497	01	27	Bhiwandi	भिवंडी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4036	484	06	27	Bhiwapur	भिवापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4102	485	04	27	Bhokar	भोकर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4125	479	04	27	Bhokardan	भोकरदन	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4198	490	02	27	Bhor	भोर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4291	480	02	27	Bhudargad	भूदरगड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4237	488	04	27	Bhum	भूम	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3965	478	03	27	Bhusawal	भुसावळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4105	485	04	27	Biloli	बिलोली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3964	478	03	27	Bodvad	बोधवड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
NA1	483	01	27	Borivali	बोरीवली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4067	473	06	27	Brahmapuri	ब्रम्हपुरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3984	472	05	27	Buldana	बुलडाणा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4230	481	04	27	Chakur	चाकूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3972	478	03	27	Chalisgaon	चाळीसगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4058	475	06	27	Chamorshi	चामोर्शी 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4294	480	02	27	Chandgad	चंदगड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4071	473	06	27	Chandrapur	चंद्रपूर 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4005	468	05	27	Chandurbazar	चांदूर बाजार	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4013	468	05	27	Chandur Railway	चांदूर रेल्वे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4148	487	03	27	Chandvad	चांदवड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4137	469	04	27	Chhatrapati Sambhajinagar	छत्रपती संभाजीनगर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4002	468	05	27	Chikhaldara	चिखलदरा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3983	472	05	27	Chikhli	चिखली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4065	473	06	27	Chimur	चिमूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4269	492	01	27	Chiplun	चिपळूण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3960	478	03	27	Chopda	चोपडा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4158	665	01	27	Dahanu	डहाणू	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4267	492	01	27	Dapoli	दापोली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4083	500	05	27	Darwha	धारवा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4011	468	05	27	Daryapur	दर्यापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4195	490	02	27	Daund	दौंड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4110	485	04	27	Deglur	देगलुर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4144	487	03	27	Deola	देवळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3985	472	05	27	Deolgaon Raja	देउळगाव राजा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4020	498	06	27	Deoli	देवळी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4234	481	04	27	Deoni	देवनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4051	476	06	27	Deori	देवरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4052	475	06	27	Desaiganj (Vadasa)	देसाईगंज (वडसा)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4275	495	01	27	Devgad	देवगड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4014	468	05	27	Dhamangaon Railway	धामनगाव रेल्वे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4056	475	06	27	Dhanora	धानोरा 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3968	478	03	27	Dharangaon	धरणगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4240	488	04	27	Dharashiv	धाराशिव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4104	485	04	27	Dharmabad	धर्माबाद	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4001	468	05	27	Dharni	धारणी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4223	470	06	27	Dharur	धारूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3959	474	03	27	Dhule	धुळे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4084	500	05	27	Digras	दिग्रस	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4149	487	03	27	Dindori	दिंडोरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4282	495	01	27	Dodamarg	दोडामार्ग	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3967	478	03	27	Erandol	एरंडोल	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4060	475	06	27	Etapalli	एटापल्ली 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4057	475	06	27	Gadchiroli	गडचिरोली 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4293	480	02	27	Gadhinglaj	गडहिंग्लज	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4288	480	02	27	Gaganbawada	गगनबावडा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4122	489	04	27	Gangakhed	गंगाखेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4140	469	04	27	Gangapur	गंगापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4218	470	06	27	Georai	गेवराई	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4130	479	04	27	Ghansawangi	घनसावंगी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4089	500	05	27	Ghatanji	घाटंजी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4046	476	06	27	Gondiya	गोंदिया	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4078	473	06	27	Gondpipri	गोंडपिपरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4045	476	06	27	Goregaon	गोरेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4270	492	01	27	Guhagar	गुहाघर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4098	485	04	27	Hadgaon	हदगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4285	480	02	27	Hatkanangle	हातकणंगले	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4193	490	02	27	Haveli	हवेली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4097	485	04	27	Himayatnagar	हिमायतनगर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4021	498	06	27	Hinganghat	हिंगणघाट	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4033	484	06	27	Hingna	हिंगणा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4112	477	04	27	Hingoli	हिंगोली 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4153	487	03	27	Igatpuri	इगतपूरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4200	490	02	27	Indapur	इंदापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4126	479	04	27	Jafrabad	जाफ्राबाद	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3966	478	03	27	Jalgaon	जळगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3975	472	05	27	Jalgaon (Jamod)	जळगाव (जामोद)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4229	481	04	27	Jalkot	जलकोट	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4127	479	04	27	Jalna	जालना	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4214	466	03	27	Jamkhed	जामखेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3974	478	03	27	Jamner	जामनेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4263	494	02	27	Jaoli	जावळी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4304	493	02	27	Jat	जत	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4160	665	01	27	Jawhar	जव्हार	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4117	489	04	27	Jintur	जिंतुर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4076	473	06	27	Jiwati	जिवती	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4187	490	02	27	Junnar	जुन्नर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4298	493	02	27	Kadegaon	कडेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4290	480	02	27	Kagal	कागल	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4222	470	06	27	Kaij	केज	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4081	500	05	27	Kalamb	कळंब	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4239	488	04	27	Kalamb	कळंब	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4025	484	06	27	Kalameshwar	कळमेश्वर 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4114	477	04	27	Kalamnuri	कळमनुरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4143	487	03	27	Kalwan	कालवण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4168	497	01	27	Kalyan	कल्याण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4030	484	06	27	Kamptee	कामठी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4108	485	04	27	Kandhar	कंधार	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4277	495	01	27	Kankavli	कणकवली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4133	469	04	27	Kannad	कन्नड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4265	494	02	27	Karad	कराड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3997	499	05	27	Karanja	कारंजा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4016	498	06	27	Karanja	कारंजा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4213	466	03	27	Karjat	कर्जत	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4174	491	01	27	Karjat	कर्जत	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4244	496	02	27	Karmala	करमाळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4287	480	02	27	Karvir	करवीर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4024	484	06	27	Katol	काटोल	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4303	493	02	27	Kavathemahankal	कवठेमहांकाळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4090	500	05	27	Kelapur	केलापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4175	491	01	27	Khalapur	खालापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3981	472	05	27	Khamgaon	खामगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4299	493	02	27	Khanapur	खानापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4257	494	02	27	Khandala	खंडाळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4260	494	02	27	Khatav	खटाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4190	490	02	27	Khed	खेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4268	492	01	27	Khed	खेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4138	469	04	27	Khuldabad	खुलताबाद	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4096	485	04	27	Kinwat	किनवत	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4203	466	03	27	Kopargaon	कोपरगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4055	475	06	27	Korchi	कोरची	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4261	494	02	27	Koregaon	कोरेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4075	473	06	27	Korpana	कोरपना	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4280	495	01	27	Kudal	कुडाळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4035	484	06	27	Kuhi	कुही	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4054	475	06	27	Kurkheda	कुरखेडा 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
NA2	483	01	27	Kurla	कुर्ला	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4043	471	06	27	Lakhandur	लाखंदूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4041	471	06	27	Lakhani	लाखनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4273	492	01	27	Lanja	लांजा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4226	481	04	27	Latur	लातूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4107	485	04	27	Loha	लोहा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4242	488	04	27	Lohara	लोहारा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3987	472	05	27	Lonar	लोणार	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4245	496	02	27	Madha	माढा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4255	494	02	27	Mahabaleshwar	महाबळेश्वर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4185	491	01	27	Mahad	महाड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4087	500	05	27	Mahagaon	महागाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4095	485	04	27	Mahur	माहूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4219	470	06	27	Majalgaon	माजलगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3995	499	05	27	Malegaon	मालेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4146	487	03	27	Malegaon	मालेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3979	472	05	27	Malkapur	मलकापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4250	496	02	27	Malshiras	माळशिरस	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4278	495	01	27	Malwan	मालवण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4259	494	02	27	Man	माण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4266	492	01	27	Mandangad	मंडणगड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4252	496	02	27	Mangalvedhe	मंगळवेढे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4181	491	01	27	Mangaon	मानगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3996	499	05	27	Mangrulpir	मंगरूळपीर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3998	499	05	27	Manora	मानोरा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4132	479	04	27	Mantha	मंठा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4119	489	04	27	Manwath	मानवत	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4092	500	05	27	Maregaon	मारेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4029	484	06	27	Mauda	मौदा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4191	490	02	27	Mawal	मावळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3982	472	05	27	Mehkar	मेहकर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4184	491	01	27	Mhasla	म्हासळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4302	493	02	27	Miraj	मिरज	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4038	471	06	27	Mohadi	मोहाडी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4248	496	02	27	Mohol	मोहोळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4161	665	01	27	Mokhada	मोखाडा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4006	468	05	27	Morshi	मोर्शी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3980	472	05	27	Motala	मोताळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4101	485	04	27	Mudkhed	मुदखेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4109	485	04	27	Mukhed	मुखेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3963	478	03	27	Muktainagar (Edlabad)	मुक्ताईनगर(एदलाबाद)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4072	473	06	27	Mul	मुल	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4059	475	06	27	Mulchera	मुलचेरा 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4192	490	02	27	Mulshi	मुळशी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4171	497	01	27	Murbad	मुरबाड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3992	467	05	27	Murtijapur	मुर्तिजापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4178	491	01	27	Murud	मुरूड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4209	466	03	27	Nagar	नगर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4066	473	06	27	Nagbhid	नागभिड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4031	484	06	27	Nagpur (Rural)	नागपूर (ग्रामीण)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4032	484	06	27	Nagpur (Urban)	नागपूर (शहर)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4106	485	04	27	Naigaon (Khairgaon)	नायगाव (खैरगाव)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4100	485	04	27	Nanded	नांदेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4147	487	03	27	Nandgaon	नांदगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4012	468	05	27	Nandgaon-Khandeshwar	नांदगाव खंडेश्वर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3978	472	05	27	Nandura	नांदुरा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3954	486	03	27	Nandurbar	नंदूरबार	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4023	484	06	27	Narkhed	नरखेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4152	487	03	27	Nashik	नाशिक	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3955	486	03	27	Nawapur	नवापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4079	500	05	27	Ner	नेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4206	466	03	27	Nevasa	नेवासा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4233	481	04	27	Nilanga	निलंगा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4155	487	03	27	Niphad	निफाड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4243	488	04	27	Omarga	उमरगा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3973	478	03	27	Pachora	पाचोरा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4141	469	04	27	Paithan	पैठण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4123	489	04	27	Palam	पालम	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4163	665	01	27	Palghar	पालघर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4297	493	02	27	Palus	पलुस	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4249	496	02	27	Pandharpur	पंढरपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4284	480	02	27	Panhala	पन्हाळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4173	491	01	27	Panvel	पनवेल	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4236	488	04	27	Paranda	परंडा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4118	489	04	27	Parbhani	परभणी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4224	470	06	27	Parli	परळी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4211	466	03	27	Parner	पारनेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3970	478	03	27	Parola	पारोळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4027	484	06	27	Parseoni	पारशिवनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4131	479	04	27	Partur	परतूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4264	494	02	27	Patan	पाटण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4208	466	03	27	Pathardi	पाथर्डी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4120	489	04	27	Pathri	पाथ्री	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4216	470	06	27	Patoda	पाटोदा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3993	467	05	27	Patur	पातूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4042	471	06	27	Pauni	पवनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4176	491	01	27	Pen	पेण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4150	487	03	27	Peth	पेठ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4258	494	02	27	Phaltan	फलटण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4136	469	04	27	Phulambri	फुलंब्री	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4186	491	01	27	Poladpur	पोलादपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4073	473	06	27	Pombhurna	पोम्भूर्णा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4194	490	02	27	Pune City	पुणे शहर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4196	490	02	27	Purandhar	पुरंदर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4124	489	04	27	Purna	पुर्णा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4085	500	05	27	Pusad	पूसद	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4289	480	02	27	Radhanagari	राधानगरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4204	466	03	27	Rahta	रहाता	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4210	466	03	27	Rahuri	राहुरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4274	492	01	27	Rajapur	राजापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4077	473	06	27	Rajura	राजुरा 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4091	500	05	27	Ralegaon	राळेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4028	484	06	27	Ramtek	रामटेक	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4271	492	01	27	Ratnagiri	रत्नागिरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3962	478	03	27	Raver	रावेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4227	481	04	27	Renapur	रेनापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4000	499	05	27	Risod	रिसोड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4179	491	01	27	Roha	रोहा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4049	476	06	27	Sadak-Arjuni	सडक अर्जुनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4040	471	06	27	Sakoli	साकोली	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3958	474	03	27	Sakri	साक्री	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4048	476	06	27	Salekasa	सालेकसा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4022	498	06	27	Samudrapur	समुद्रपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4272	492	01	27	Sangameshwar	संगमेश्वर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4202	466	03	27	Sangamner	संगमनेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4251	496	02	27	Sangole	सांगोले	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3976	472	05	27	Sangrampur	संग्रामपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4262	494	02	27	Satara	सातारा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4026	484	06	27	Savner	सावनेर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4068	473	06	27	Sawali	सावली 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4281	495	01	27	Sawantwadi	सावंतवाडी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4018	498	06	27	Seloo	सेलू	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4116	489	04	27	Selu	सेलू	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4111	477	04	27	Sengaon	सेनगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3953	486	03	27	Shahade	शहादा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4167	497	01	27	Shahapur	शहापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4283	480	02	27	Shahuwadi	शाहूवाडी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3977	472	05	27	Shegaon	शेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4207	466	03	27	Shevgaon	शेगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4295	493	02	27	Shirala	शिराळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4286	480	02	27	Shirol	शिरोळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3956	474	03	27	Shirpur	शिरपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4189	490	02	27	Shirur	शिरूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4231	481	04	27	Shirur Anantpal	शिरूर अनंतपाळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4217	470	06	27	Shirur (Kasar)	शिरूर (कासार)	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4212	466	03	27	Shrigonda	श्रीगोंदा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4205	466	03	27	Shrirampur	श्रीरामपूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4183	491	01	27	Shrivardhan	श्रीवर्धन	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4135	469	04	27	Sillod	सिल्लोड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4069	473	06	27	Sindewahi	सिंदेवाही 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3957	474	03	27	Sindkhede	सिंदखेडे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3986	472	05	27	Sindkhed Raja	सिंदखेड राजा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4154	487	03	27	Sinnar	सिन्नर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4063	475	06	27	Sironcha	सिरोंचा 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4134	469	04	27	Soegaon	सोयगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4247	496	02	27	Solapur North	उत्तर सोलापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4253	496	02	27	Solapur South	दक्षिण सोलापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4121	489	04	27	Sonpeth	सोनपेठ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4180	491	01	27	Sudhagad	सुधागड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4142	487	03	27	Surgana	सुरगना	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4182	491	01	27	Tala	तळा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4157	665	01	27	Talasari	तलासरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3952	486	03	27	Talode	तलोदा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4301	493	02	27	Tasgaon	तासगाव	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3988	467	05	27	Telhara	तेल्हारा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4165	497	01	27	Thane	ठाणे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4008	468	05	27	Tiosa	तिवसा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4044	476	06	27	Tirora	तिरोडा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4151	487	03	27	Trimbakeshwar	त्र्यंबक	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4241	488	04	27	Tuljapur	तुळजापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4037	471	06	27	Tumsar	तुमसर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4235	481	04	27	Udgir	उदगीर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4169	497	01	27	Ulhasnagar	उल्हासनगर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4086	500	05	27	Umarkhed	उमरखेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4034	484	06	27	Umred	उमरेड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4103	485	04	27	Umri	उमरी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4172	491	01	27	Uran	उरण	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4276	495	01	27	Vaibhavvadi	वैभववाडी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4139	469	04	27	Vaijapur	वैजापूर	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4164	665	01	27	Vasai	वसई	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4115	477	04	27	Vasmath	वसमत	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4197	490	02	27	Velhe	वेल्हे	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4279	495	01	27	Vengurla	वेंगुर्ला	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4159	665	01	27	Vikramgad	विक्रमगड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4162	665	01	27	Wada	वाडा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4220	470	06	27	Wadwani	वडवणी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4256	494	02	27	Wai	वाई	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4296	493	02	27	Walwa	वाळवा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4094	500	05	27	Wani	वनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4019	498	06	27	Wardha	वर्धा	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4064	473	06	27	Warora	वरोरा 	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4007	468	05	27	Warud	वरूड	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4238	488	04	27	Washi	वाशी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3999	499	05	27	Washim	वाशिम	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4082	500	05	27	Yavatmal	यवतमाळ	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
3961	478	03	27	Yawal	यावल	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4156	487	03	27	Yevla	येवला	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
4093	500	05	27	Zari-Jamani	जरी जामनी	t	2025-09-27 23:03:00.881015	NA	NA	\N	\N	\N
\.


--
-- TOC entry 5644 (class 0 OID 16875)
-- Dependencies: 253
-- Data for Name: m_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_users (user_id, username, password_hash, role_code, is_active, insert_date, insert_ip, insert_by, updated_date, update_ip, update_by) FROM stdin;
priya@gmail.com	Priya Deshmukh	$2b$10$7Ts0y5RvVZ9eacvTr2oAIO/q/lpeISAsTZQPHzyhsj5PdirqffiEi	VS	t	2025-09-30 10:50:40.489101	0.0.0.0	frontend	\N	\N	\N
priya123@gmail.com	Neha Deshmukh	$2b$10$5ZAIWWmWXd1t8uIYRp63zuUu9sJhahrsOY6FEwa2pYvItsmwn7XGq	VS	t	2025-09-30 11:46:55.94304	0.0.0.0	frontend	\N	\N	\N
sneha@gmail.com	Sneha 	$2b$10$zZsVsDsrDDXbpZ60AB5YGORkgFCMdbFpMX2Put5wXGGGPgTAyIIGq	VS	t	2025-09-30 11:49:45.972515	0.0.0.0	frontend	\N	\N	\N
nilam@123gmail.com	Nilam	$2b$10$8wO/FoAj7KlEnudVbUuHdeiSLYXzUISQARnBGJdbd9UzJY.uxVn2K	VS	t	2025-09-30 11:52:27.461392	0.0.0.0	frontend	\N	\N	\N
rohan@123gmail.com	Rohan	$2b$10$8B.J4VAAePnieekcC5ouzuicmA0gkTpth9DDvHmXdkYVHerzLT93e	VS	t	2025-09-30 11:54:49.173471	0.0.0.0	frontend	\N	\N	\N
mohan@gmail.com	Mohan	$2b$10$iQRL48okomtWH6OOSbV7lOWGikhTsFWN5Hhfh/vxAeOwiD7zdxyMO	VS	t	2025-09-30 12:32:39.577805	0.0.0.0	frontend	\N	\N	\N
USR006	dan@gmail.com	$2b$10$h4C1t961CvzNNp45ZtBO.O0jtZ/axqBXvkZvKR3pyifhSqsAuliQK	VS	t	2025-10-01 13:18:14.030795	NA	self	\N	\N	\N
USR009	nancy@gmail.com	$2b$10$qkv6auqmvmwlHJyEpcFEUehEYCgxoe/vw.fRU7g5l6A.Pbz6v3rf2	VS	t	2025-10-02 20:09:35.51118	NA	self	\N	\N	\N
USR013	Sen	$2b$10$tZ.CENoNH9AlnoZpqNnCTO/pfQRy7EBbogMay.gmjjsLwaZqhBynG	VS	t	2025-10-06 12:32:14.19375	NA	self	\N	\N	\N
USR014	officer1	$2a$06$s3lciPR5CzvhNey2S8Bo9uk1e.6LsLPLzg6ripiPM9qN6YqnSFVLm	OF	t	2025-10-06 14:50:21.40907	NA	system	\N	\N	\N
USR019	VIS018	$2b$10$BIeNVRYaU8sO5lIE3UKpXeDO/HCibwt2zVkQxXT6S6TU0JyIRVg0W	VS	t	2025-10-07 12:28:38.66262	NA	self	\N	\N	\N
USR023	OFF003	$2b$10$.oz/zuI2ctCak1WiT.xrBe7vQobaSYpDaUSSr7GGgT7MimKfBYzJe	OF	t	2025-10-09 12:36:48.082211	NA	admin	\N	\N	\N
USR024	VIS019	$2b$10$LNotFoQFaIfHgq2Lc8plbenrX7qGCO9y/ghGjIUddRYLPcb2eLPyO	VS	t	2025-10-09 12:51:07.379822	NA	self	\N	\N	\N
USR025	OFF004	$2b$10$EUMrdeAiKAbtExIqhqxI9eG0nrWtmDfrbkFPvc53yLABzIIoMCmbO	OF	t	2025-10-09 16:23:17.281866	NA	admin	\N	\N	\N
USR026	OFF005	$2b$10$bDVRp8GO.cl0qBBxmRUdtuM3xt7zWyLL9T9KOyfNXknzFZAy5XeSe	OF	t	2025-10-11 19:19:37.342139	NA	admin	\N	\N	\N
USR027	VIS020	$2b$10$YsqPmpMfr9gD2RCGb8ycxO/hoQ4RwFvrECGr9GIJZRg/rLb8Axfo2	VS	t	2025-11-10 10:06:37.557124	NA	self	\N	\N	\N
USR028	OFF006	$2b$10$GUY3xDOxhoCtkhvycCytpeUBTqsdQ9rpdAKVwlk4u9gfcwq.xsaiC	OF	t	2025-11-10 15:33:33.645976	NA	admin	\N	\N	\N
USR029	OFF007	$2b$10$SbyTXkzQWF6XBUCp8PngSeSYI4kW0dOGnhUO4rHlu6I5etVaff./S	OF	t	2025-11-10 15:46:06.18239	NA	admin	\N	\N	\N
USR030	OFF008	$2b$10$KjgFEGWontWwiVFo5rUISuytuFu5GAZ4zJPJ0QfSvpYzqGyNU7MTy	OF	t	2025-11-11 12:12:40.742271	NA	admin	\N	\N	\N
USR032	OFF009	$2b$10$Oyt58OpBfmvlRRvrFcbBGODsF3.7vudZeDkGmDbWcoZ0rK2D6PDnW	OF	t	2025-11-11 14:02:19.811191	NA	admin	\N	\N	\N
USR033	OFF010	$2b$10$b.lsfzMJdQcZfThVt4R0heIJJ3I9sBQSaiJlxxGh0GnKKYYW7FYSq	OF	t	2025-11-11 14:06:15.941634	NA	admin	\N	\N	\N
USR034	ADM001	$2b$10$PkDfFgUKCtiEuLblm.B9D.B7Xj1Fkq.hVjCcTot3XprEoEC5LQbQu	AD	t	2025-11-12 16:56:26.895824	NA	system	\N	\N	\N
USR035	ADM002	$2b$10$s1qb1jxHRLoDBXkYmbVQ8uTLCdQ0nDOh.HijGm6CP08jXbAc6.d/S	AD	t	2025-12-04 15:00:57.196642	NA	system	\N	\N	\N
USR036	VIS021	$2b$10$WXsHxKI42pathGT3EVy1N.dOncGipQLRFcLiADhRGCF728Jy0vcVO	VS	t	2025-12-05 22:50:56.719271	NA	self	\N	\N	\N
USR037	VIS022	$2b$10$cbZuLu9g/IS1lym01y3Y4.K6zEBQa6vbgpVQLOTILgKQ7qi1IuhLu	VS	t	2025-12-05 23:48:13.962269	NA	self	\N	\N	\N
USR038	VIS023	$2b$10$r7ahl5ny1/1HVQJS/u2mEu1ktlDW6ZwXnWI5DE0RtkxujhmjQtQwO	VS	t	2025-12-08 11:40:11.767191	NA	self	\N	\N	\N
USR039	VIS024	$2b$10$O.r2r5FQE5QM49FHcb9RY.LDBRlBsi3Dcjj4mEdb5Ayyiy64wnZKW	VS	t	2025-12-08 11:49:27.287741	NA	self	\N	\N	\N
USR040	VIS025	$2b$10$cBSD7/l9wec7IOhxHnedPO9TtYKsazF4OVAxVTl4KM2JNlbjgCiii	VS	t	2025-12-08 11:57:04.776409	NA	self	\N	\N	\N
USR042	VIS026	$2b$10$fJkf2ZaBVxlosD.CPhFI8er72sVFPZPaVvnYueb7kOUBJMVUc2Yaq	VS	t	2025-12-08 12:18:33.127368	NA	self	\N	\N	\N
USR044	VIS028	$2b$10$zhoyltMCj6FBfRXJ.32Vr.WAcQQI5cB2Kpxs/yrAXyoC50aElGDdC	VS	t	2025-12-08 12:27:18.298534	NA	self	\N	\N	\N
USR045	OFF011	$2b$10$/hhLSlAhgBFVOz3pxYotzOEVROxHRRBiQY.fOd/3bhQTbqPd9jKJe	OF	t	2025-12-08 18:40:19.613915	NA	system	\N	\N	\N
USR046	OFF012	$2b$10$MIZS8vo/P7ZcJaN1RIPHfe9YUp.mV5y/q8tMw8kmx21gCZAYRXu0G	OF	t	2025-12-08 18:47:37.58201	NA	system	\N	\N	\N
USR049	VIS030	$2b$10$CxsqXCMtaph0QSzf7kzJTeLjji9HrYVZAig6wNgnzEqmNSXD5N.bq	VS	t	2025-12-10 15:50:58.760264	NA	self	\N	\N	\N
USR050	VIS031	$2b$10$fEcDHOKnb8p4zsJ.UGBRH.SB/sEmL5o8Xs08zEw/3al7CXK0a1OLW	VS	t	2025-12-10 16:22:45.270928	NA	self	\N	\N	\N
USR051	VIS032	$2b$10$qdpg0tfKg1uG1K88m8IqYe43DVIIjrulu4QyUzX4T3KV19AhldAJa	VS	t	2025-12-13 23:57:55.673159	NA	self	\N	\N	\N
USR052	VIS033	$2b$10$hZvulCLvFGmuz4UrqoeV6.Dirx6AEhFT7Yn6wYUdnSbwGmeo6c.ki	VS	t	2025-12-14 00:09:33.633405	NA	self	\N	\N	\N
USR053	ADM003	$2b$10$h0XsIu5LDom8o7fh01/qQ.SKSnyqgD5JkUkROR/2GxrbbONUzMZWC	AD	t	2025-12-19 15:23:17.887374	NA	system	\N	\N	\N
USR054	ADM004	$2b$10$TLu1Uc8laTgl3CodNS1wCeA0RwQtl1JCgbBPvrwgBUetJD4KzYtf.	AD	t	2025-12-19 15:53:52.306236	NA	system	\N	\N	\N
USR058	VIS034	$2b$10$hsvBtgclbSooftlm8fMpiuZL4gc6E04VuRkz5dkb/fE2T3Q4mcNRe	VS	t	2025-12-19 16:58:07.525938	NA	self	\N	\N	\N
USR059	VIS035	$2b$10$Shom6oJ1i.0XL6FDWAf8U.dqxIVJeim.1moppoMyYq5JWWJnnlZpG	VS	t	2025-12-23 00:16:31.605015	NA	self	\N	\N	\N
DEC-2025-USR-001	testuser1	hash	AD	t	2025-12-23 10:58:18.430143	NA	system	\N	\N	\N
DEC-2025-USR-002	DEC-2025-VIS-001	$2b$10$Y38gfeE2JDdcwB4ROVvbiOoYmuZWbb0Ecyg/maZCMyn.CS3yfUnCy	VS	t	2025-12-23 11:03:38.997081	NA	self	\N	\N	\N
DEC-2025-USR-003	DEC-2025-VIS-002	$2b$10$0hVRkTnhrYwHRQ2t4TUbYO4ExHWfaaJYc4VVwXMeFUegkJh1jxi5G	VS	t	2025-12-24 16:09:24.442757	NA	self	\N	\N	\N
DEC-2025-USR-004	HLP001	$2b$10$lmDGoNmxOkfNMVl.zszbYuWZ8/DA07Ha.k0pvMBz0.Klv.ozUyn6W	HD	t	2025-12-29 20:49:35.372658	NA	system	\N	\N	\N
DEC-2025-USR-005	HLP002	$2b$10$h7L9CF9VDAO7eEdC3ol.Gur2H6pkcmxhxkmUuSPyNSlHb5oEnMan2	HD	t	2025-12-29 23:05:37.089524	NA	system	\N	\N	\N
JAN-2026-USR-001	OFF015	$2b$10$2zQ07amDZvcMEVFNXs/XCOLsKHbXzzLfNWEWz/ybcoZA2J8sHpJxa	OF	t	2026-01-01 21:05:26.446903	NA	system	\N	\N	\N
JAN-2026-USR-002	JAN-2026-VIS-001	$2b$10$4fKbrw.zsPZfXws3I6nw3eo1nDqlBBkEGWIkTul0zfm6jTa.w3sBS	VS	t	2026-01-02 06:41:40.213317	NA	self	\N	\N	\N
JAN-2026-USR-003	JAN-2026-VIS-002	$2b$10$jH1Jq6NUgFiTdstQLVvRd.bxunburcn4h2ciAaqkJT9tmeO5ST29q	VS	t	2026-01-07 22:13:53.912229	NA	self	\N	\N	\N
JAN-2026-USR-004	JAN-2026-VIS-003	$2b$10$yN1fUc.rIOur6/TbKR7K3.uIkC8dW4jmWMKdiYMN0m59jzfb9DHFW	VS	t	2026-01-13 14:13:43.020212	NA	self	\N	\N	\N
USR048	VIS029	$2a$06$UOQXUxcJdPzPeTpRQAw1D.eYwEn90YPKW8Ktfr67SoeI2wfvEeE0m	VS	t	2025-12-10 15:42:45.012957	NA	self	\N	\N	\N
USR047	OFF013	$2b$10$/LSSvVuEPsJPejF/4D92TOQEqT0MCjP3PbERTKu7Fat9PX5IWGX56	OF	t	2025-12-08 19:01:34.597966	NA	system	2026-01-15 04:25:48.61291	::1	password_reset
JAN-2026-USR-005	HLP003	$2b$10$Q3ZohC774/JKQwqpHuKdQezLuJ1GlCHD2ZObnz.rTrBWggRYj3CHK	HD	t	2026-01-14 16:04:50.349955	NA	system	\N	\N	\N
JAN-2026-USR-006	JAN-2026-VIS-004	$2b$10$TdH3/Zav85zcqcBFLU2Hi./hhok.jQgjfPCqNK.vd7rzniTXOS/t6	VS	t	2026-01-20 14:53:12.725192	NA	self	\N	\N	\N
JAN-2026-USR-007	JAN-2026-VIS-005	$2b$10$UWoPMNQX7FkxLLVsAS11feCc3UML6NO8z2WHkYVwSY0KWv1ZFajy.	VS	t	2026-01-20 07:27:50.259389	NA	self	\N	\N	\N
\.


--
-- TOC entry 5645 (class 0 OID 16892)
-- Dependencies: 254
-- Data for Name: m_visitors_signup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.m_visitors_signup (visitor_id, user_id, full_name, gender, dob, mobile_no, email_id, state_code, division_code, district_code, taluka_code, pincode, photo, is_active, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip) FROM stdin;
VIS004	priya@gmail.com	Priya Deshmukh	F	2025-09-30	987654321	priya@gmail.com	27	04	469	4136	400709	errr	t	2025-09-30 10:50:40.498207	frontend	0.0.0.0	\N	\N	\N
VIS006	priya123@gmail.com	Neha Deshmukh	F	2025-10-01	9876543212	priya123@gmail.com	27	01	482	\N	400709	errr	t	2025-09-30 11:47:06.730036	frontend	0.0.0.0	\N	\N	\N
VIS007	sneha@gmail.com	Sneha 	F	2025-10-01	9876543213	sneha@gmail.com	27	04	488	4241	400709	errr	t	2025-09-30 11:49:45.977266	frontend	0.0.0.0	\N	\N	\N
VIS008	nilam@123gmail.com	Nilam	F	2025-09-30	9876543215	nilam@123gmail.com	27	05	467	\N	400709	errr	t	2025-09-30 11:52:27.476423	frontend	0.0.0.0	\N	\N	\N
VIS009	rohan@123gmail.com	Rohan	M	2025-09-25	9876543217	rohan@123gmail.com	27	04	488	\N	400709	errr	t	2025-09-30 11:54:49.178154	frontend	0.0.0.0	\N	\N	\N
VIS010	mohan@gmail.com	Mohan	M	2025-10-01	9876543219	mohan@gmail.com	27	01	482	\N	400709	errr	t	2025-09-30 12:32:39.593149	frontend	0.0.0.0	\N	\N	\N
VIS013	USR006	Dan	M	2025-10-02	9876543211	dan@gmail.com	\N	\N	\N	\N	400709	/uploads/visitors/1759304893876_264081848.png	t	2025-10-01 13:18:14.030795	self	NA	\N	\N	\N
VIS016	USR009	Nancy	F	2025-10-17	98765432190	nancy@gmail.com	27	05	467	3991	400709	2bae9e9ec90a85e460f03ccb63f3963f	t	2025-10-02 20:09:35.51118	self	NA	\N	\N	\N
VIS017	USR013	Sen	M	2025-10-08	98765432144	sen@gmail.com	27	04	469	4134	400709	1969e30722da872e2ec6266d390aabf4	t	2025-10-06 12:32:14.19375	self	NA	\N	\N	\N
VIS018	USR019	Priya Deshmukh	F	2025-10-01	98765432157	45priya@gmail.com	27	05	467	3991	233454	41be85c325767bbfd26c1e5b3415fa85	t	2025-10-07 12:28:38.66262	self	NA	\N	\N	\N
DEC-2025-VIS-002	DEC-2025-USR-003	Siddhesh	F	2001-10-24	1234567891	priya12@gmail.com	27	01	482	\N	123345	1766572764113.jpg	t	2025-12-24 16:09:24.442757	self	NA	\N	\N	\N
VIS020	USR027	Danny	M	2025-11-11	98765432122	danny@gmail.com	27	05	467	3991	400703	ef5b1c3340e3e4e6948beb2a0e9d1364	t	2025-11-10 10:06:37.557124	self	NA	\N	\N	\N
VIS021	USR036	Kabir	M	2025-12-06	98765432199	kabir@gmail.com	27	05	467	3991	400709	4eba4188cb874c37a664b524caf527d4	t	2025-12-05 22:50:56.719271	self	NA	\N	\N	\N
VIS028	USR044	Shobha Khandagale	F	2025-12-11	987654321905	khandagaleshobha875@gmail.com	27	05	467	3991	400709	49289b7532e9317fd8eb256bbaf8c4ae	t	2025-12-08 12:27:18.298534	self	NA	\N	\N	\N
VIS029	USR048	Shruti	F	1998-12-10	9876543219901	shrutimhambrey03@gmail.com	27	05	467	3991	400709	f8021fcd32ea1ab921278361c2a9365a	t	2025-12-10 15:42:45.012957	self	NA	\N	\N	\N
VIS030	USR049	Vivek	M	2002-06-10	987654321088	vivekp2704@gmail.com	27	05	467	3991	400709	34a8ba63ff8b2971b4413e43320a8fd3	t	2025-12-10 15:50:58.760264	self	NA	\N	\N	\N
VIS031	USR050	Mayuri	F	2025-12-11	987654321448	mayuritambe468@gmail.com	27	05	467	3991	400709	c6677eb36bf605617e89697f25c0cb74	t	2025-12-10 16:22:45.270928	self	NA	\N	\N	\N
VIS033	USR052	Ananthan	M	2001-08-09	9876543219000	khandagalearadhana@gmail.com	27	05	\N	\N	400709	1765651173491.jpg	t	2025-12-14 00:09:33.633405	self	NA	\N	\N	\N
JAN-2026-VIS-001	JAN-2026-USR-002	Vivek Pawar	M	2000-06-02	9876543218	vivek@gmail.com	27	02	490	4194	400700	1767316299917.jpg	t	2026-01-02 06:41:40.213317	self	NA	\N	\N	\N
JAN-2026-VIS-002	JAN-2026-USR-003	Suman	F	2001-06-13	6234567894	suman@123gmail.com	27	04	477	4112	400701	1767804233289.jpg	t	2026-01-07 22:13:53.912229	self	NA	\N	\N	\N
JAN-2026-VIS-003	JAN-2026-USR-004	Shruti	F	2001-06-13	6789012344	shruti@gmail.com	27	01	497	4165	400701	1768293822415.jpg	t	2026-01-13 14:13:43.020212	self	NA	\N	\N	\N
JAN-2026-VIS-004	JAN-2026-USR-006	Awanti Pawar	F	2000-06-20	6521347877	awanti@gmail.com	27	01	482	\N	400701	\N	t	2026-01-20 14:53:12.725192	self	NA	\N	\N	\N
JAN-2026-VIS-005	JAN-2026-USR-007	Jaikishan	M	2003-05-20	9345678222	jaimishra20031@gmail.com	27	01	482	\N	400701	\N	t	2026-01-20 07:27:50.259389	self	NA	\N	\N	\N
VIS034	USR058	<>#$%^&*(	M	1984-01-14	9870272069	kahonaamod@gmail.com	27	01	482	\N	abcdef	1766143687125.jpg	t	2025-12-19 16:58:07.525938	self	NA	\N	\N	\N
VIS019	USR024	Mayuri	F	2025-10-17	9876543244	mayuri@gmail.com	27	04	488	4239	233454	1766163924899_7184757.jpg	t	2025-10-09 12:51:07.379822	self	NA	2025-12-19 22:35:25.663051	\N	\N
VIS035	USR059	Aaru	F	2001-06-13	1234567890	aaru@gmail.com	27	01	482	\N	400709	1766429190385.jpg	t	2025-12-23 00:16:31.605015	self	NA	\N	\N	\N
DEC-2025-VIS-001	DEC-2025-USR-002	Priyanka	F	2000-06-22	6789543210	priyanka@gmail.com	27	01	482	\N	123456	1766468018256.jpg	t	2025-12-23 11:03:38.997081	self	NA	\N	\N	\N
\.


--
-- TOC entry 5647 (class 0 OID 16906)
-- Dependencies: 256
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, username, title, message, type, appointment_id, is_read, created_at, walkin_id) FROM stdin;
NOT00004	VIS030	Appointment Created	Your appointment APT023 is created and pending approval from Officer Aradhana Khandagale	info	APT023	f	2025-12-10 16:05:25.258313	\N
NOT00005	VIS031	Appointment Created	Your appointment APT024 is created and pending approval from Officer Aradhana Khandagale	info	APT024	f	2025-12-10 16:26:13.649564	\N
NOT00006	VIS030	Appointment Cancelled	You have cancelled your appointment APT023	warning	\N	f	2025-12-10 16:48:26.817855	\N
NOT00007	VIS030	Appointment Created	Your appointment APT025 is created and pending approval from Officer Aradhana Khandagale	info	APT025	f	2025-12-19 15:06:30.427727	\N
NOT00008	VIS019	Appointment Cancelled	You have cancelled your appointment APT016	warning	\N	f	2025-12-19 22:23:30.339803	\N
NOT00010	VIS030	Appointment Created	Your appointment APT028 is created and pending approval from Helpdesk	info	APT028	f	2025-12-22 19:19:20.261221	\N
NOT00011	VIS030	Appointment Created	Your appointment APT029 is created and pending approval from Helpdesk	info	APT029	f	2025-12-22 19:27:01.445275	\N
NOT00012	VIS030	Appointment Created	Your appointment APT030 is created and pending approval from Helpdesk	info	APT030	f	2025-12-22 19:31:31.692414	\N
NOT00013	VIS030	Appointment Created	Your appointment APT031 is created and pending approval from Helpdesk	info	APT031	f	2025-12-22 19:35:00.455762	\N
NOT00014	VIS030	Appointment Created	Your appointment APT032 is created and pending approval from Helpdesk	info	APT032	f	2025-12-22 19:51:39.382773	\N
NOT00015	VIS030	Appointment Created	Your appointment APT033 is created and pending approval from Helpdesk	info	APT033	f	2025-12-22 23:03:28.413935	\N
NOT00016	VIS030	Appointment Cancelled	You have cancelled your appointment APT033 Reason: Not available	warning	\N	f	2025-12-23 00:04:35.979348	\N
NOT00017	DEC-2025-VIS-001	Appointment Created	Your appointment APT034 is created and pending approval from Rahul Patil	info	APT034	f	2025-12-23 11:22:17.216396	\N
NOT00018	DEC-2025-VIS-001	Appointment Cancelled	You have cancelled your appointment APT034 Reason: Not available	warning	\N	f	2025-12-23 11:23:08.494536	\N
NOT00019	VIS030	Appointment Created	Your appointment APT035 is created and pending approval from Helpdesk	info	APT035	f	2025-12-23 20:46:33.08772	\N
NOT00020	VIS019	Appointment Created	Your appointment APT036 is created and pending approval from Helpdesk	info	APT036	f	2025-12-23 23:13:00.096126	\N
NOT00021	VIS019	Appointment Created	Your appointment APT037 is created and pending approval from Helpdesk	info	APT037	f	2025-12-24 13:03:46.25954	\N
NOT00022	DEC-2025-VIS-002	Appointment Created	Your appointment APT038 is created and pending approval from Helpdesk	info	APT038	f	2025-12-24 16:15:18.880486	\N
NOT00023	VIS030	Appointment Created	Your appointment APT039 is created and pending approval from Helpdesk	info	APT039	f	2025-12-25 17:11:53.780017	\N
NOT00024	VIS030	Appointment Created	Your appointment APT040 is created and pending approval from Helpdesk	info	APT040	f	2025-12-25 17:19:54.384158	\N
NOT00025	VIS030	Appointment Cancelled	You have cancelled your appointment APT040 Reason: not available	warning	\N	f	2025-12-26 12:53:36.527708	\N
NOT00026	VIS030	Appointment Created	Your appointment APT041 is created and pending approval from Helpdesk	info	APT041	f	2025-12-27 20:58:40.534372	\N
NOT00027	VIS030	Appointment Created	Your appointment APT042 is created and pending approval from Helpdesk	info	APT042	f	2025-12-29 23:22:51.09886	\N
NOT00028	VIS030	Appointment Created	Your appointment APT043 is created and pending approval from Helpdesk Auragabad	info	APT043	f	2025-12-30 20:43:37.231036	\N
NOT00029	VIS019	Appointment Created	Your appointment APT044 is created and pending approval from Helpdesk Auragabad	info	APT044	f	2025-12-30 21:14:19.508434	\N
NOT00030	VIS019	Appointment Created	Your appointment APT045 is created and pending approval from Helpdesk Auragabad	info	APT045	f	2025-12-30 21:26:13.401174	\N
NOT00031	VIS019	Appointment Created	Your appointment APT048 is created and pending approval from Helpdesk Auragabad	info	APT048	f	2025-12-30 22:12:07.119301	\N
NOT00032	VIS019	Appointment Created	Your appointment APT049 is created and pending approval from Helpdesk Auragabad	info	APT049	f	2025-12-30 22:42:02.326601	\N
NOT00033	VIS019	Appointment Created	Your appointment APT050 is created and pending approval from Helpdesk Auragabad	info	APT050	f	2025-12-30 22:47:27.454903	\N
NOT00034	DEC-2025-VIS-001	Appointment Created	Your appointment APT051 is created and pending approval from Helpdesk Auragabad	info	APT051	f	2025-12-30 22:54:14.767196	\N
NOT00035	VIS019	Appointment Created	Your appointment APT052 is created and pending approval from Helpdesk Auragabad	info	APT052	f	2025-12-31 11:40:14.679938	\N
NOT00036	VIS019	Appointment Created	Your appointment APT053 is created and pending approval from Helpdesk Auragabad	info	APT053	f	2025-12-31 11:55:57.201795	\N
NOT00037	VIS019	Appointment Created	Your appointment APT054 is created and pending approval from Helpdesk Auragabad	info	APT054	f	2025-12-31 12:07:40.878586	\N
NOT00038	VIS019	Appointment Created	Your appointment APT055 is created and pending approval from Helpdesk Auragabad	info	APT055	f	2026-01-02 01:46:32.140402	\N
NOT00039	JAN-2026-VIS-001	Appointment Created	Your appointment APT056 is created and pending approval from Helpdesk Auragabad	info	APT056	f	2026-01-02 06:44:48.319393	\N
NOT00040	VIS035	Appointment Created	Your appointment APT057 is created and pending approval from Helpdesk Auragabad	info	APT057	f	2026-01-07 22:01:55.435932	\N
NOT00041	JAN-2026-VIS-002	Appointment Created	Your appointment APT058 is created and pending approval from Helpdesk Auragabad	info	APT058	f	2026-01-07 22:16:30.256738	\N
NOT00042	JAN-2026-VIS-002	Appointment Created	Your appointment APT059 is created and pending approval from Helpdesk Auragabad	info	APT059	f	2026-01-07 22:31:44.321625	\N
NOT00044	VIS030	Walk-in Created	Your walk-in W00016 is created ...	info	\N	f	2026-01-09 18:54:03.686383	W00016
NOT00045	VIS030	Walk-in Created	Your walk-in W00017 is created and pending approval from Helpdesk Auragabad	info	\N	f	2026-01-09 19:09:05.20107	W00017
NOT00046	VIS030	Appointment Created	Your appointment APT060 is created and pending approval from Helpdesk Auragabad	info	APT060	f	2026-01-09 21:21:06.916869	\N
NOT00047	VIS030	Appointment Created	Your appointment APT061 is created and pending approval from Helpdesk Auragabad	info	APT061	f	2026-01-09 21:43:38.426691	\N
NOT00048	VIS030	Appointment Created	Your appointment APT063 is created and pending approval from Helpdesk Auragabad	info	APT063	f	2026-01-09 22:01:32.059652	\N
NOT00049	VIS019	Walk-in Created	Your walk-in W00018 is created and pending approval from Helpdesk Auragabad	info	\N	f	2026-01-09 22:20:57.686288	W00018
NOT00050	VIS030	Appointment Created	Your appointment APT064 is created and pending approval from Helpdesk Auragabad	info	APT064	f	2026-01-13 11:31:16.934221	\N
NOT00051	JAN-2026-VIS-003	Appointment Created	Your appointment APT065 is created and pending approval from Rahul Patil	info	APT065	f	2026-01-13 14:28:39.367995	\N
NOT00052	JAN-2026-VIS-003	Appointment Created	Your appointment APT066 is created and pending approval from Rahul Patil	info	APT066	f	2026-01-13 14:29:44.100953	\N
NOT00053	JAN-2026-VIS-003	Appointment Created	Your appointment APT067 is created and pending approval from Rahul Patil	info	APT067	f	2026-01-13 14:35:32.734121	\N
NOT00054	JAN-2026-VIS-003	Appointment Created	Your appointment APT068 is created and pending approval from Rahul Patil	info	APT068	f	2026-01-13 14:36:26.324408	\N
NOT00055	JAN-2026-VIS-003	Appointment Cancelled	You have cancelled your appointment APT065 Reason: mood nhi hai	warning	\N	f	2026-01-13 14:38:05.741183	\N
NOT00056	JAN-2026-VIS-003	Walk-in Created	Your walk-in W00019 is created and pending approval from Mohan Deshpande	info	\N	f	2026-01-13 15:42:27.552441	W00019
NOT00083	JAN-2026-VIS-003	Appointment Created	Your appointment APT097 is created and pending approval from Mohan Deshpande	info	APT097	f	2026-01-15 03:13:32.995295	\N
NOT00084	JAN-2026-VIS-003	Appointment Created	Your appointment APT098 is created and pending approval from Mohan Deshpande	info	APT098	f	2026-01-15 03:28:32.396631	\N
NOT00085	JAN-2026-VIS-003	Appointment Created	Your appointment APT099 is created and pending approval from Mohan Deshpande	info	APT099	f	2026-01-14 23:42:43.979255	\N
NOT00086	VIS030	Appointment Created	Your appointment APT100 is created and pending approval from Mohan Deshpande	info	APT100	f	2026-01-14 23:44:22.150649	\N
NOT00087	JAN-2026-VIS-003	Appointment Approved	Your appointment APT099 has been approved by Mohan Deshpande	success	APT099	f	2026-01-15 04:12:09.910031	\N
NOT00088	VIS030	Appointment Approved	Your appointment APT100 has been approved by Mohan Deshpande	success	APT100	f	2026-01-15 04:13:32.325822	\N
NOT00089	JAN-2026-VIS-003	Appointment Created	Your appointment APT101 is created and pending approval from Mohan Deshpande	info	APT101	f	2026-01-17 14:53:26.549558	\N
NOT00090	VIS019	Walk-in Created	Your walk-in W00052 is created and pending approval from Mohan Deshpande	info	\N	f	2026-01-17 15:41:18.498818	W00052
NOT00091	VIS018	Appointment Approved	Your appointment APT007 has been approved by Mohan Deshpande	success	APT007	f	2026-01-19 17:01:13.167455	\N
NOT00092	VIS019	Walk-in Created	Your walk-in W00053 is created and pending approval from Mohan Deshpande	info	\N	f	2026-01-20 14:48:21.835114	W00053
NOT00093	JAN-2026-VIS-004	Walk-in Created	Your walk-in W00054 is created and pending approval from Mohan Deshpande	info	\N	f	2026-01-20 14:53:17.021078	W00054
NOT00094	JAN-2026-VIS-005	Walk-in Created	Your walk-in W00055 is created and pending approval from Mohan Deshpande	info	\N	f	2026-01-20 07:27:54.637763	W00055
\.


--
-- TOC entry 5648 (class 0 OID 16919)
-- Dependencies: 257
-- Data for Name: password_reset_otp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_otp (id, user_id, otp_code, expires_at, is_used, created_at) FROM stdin;
1	USR047	703605	2026-01-15 04:29:52.858472	t	2026-01-15 04:24:52.858472
\.


--
-- TOC entry 5651 (class 0 OID 16930)
-- Dependencies: 260
-- Data for Name: queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queue (queue_id, token_number, appointment_id, walkin_id, visitor_id, "position", status, insert_date, insert_by, insert_ip, updated_date, update_by, update_ip) FROM stdin;
\.


--
-- TOC entry 5652 (class 0 OID 16944)
-- Dependencies: 261
-- Data for Name: user_seq_monthly; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_seq_monthly (year_month, seq_no) FROM stdin;
2025-12	5
2026-01	7
\.


--
-- TOC entry 5653 (class 0 OID 16949)
-- Dependencies: 262
-- Data for Name: visitor_seq_monthly; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_seq_monthly (year_month, seq_no) FROM stdin;
2025-12	2
2026-01	5
\.


--
-- TOC entry 5655 (class 0 OID 16955)
-- Dependencies: 264
-- Data for Name: walkin_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.walkin_tokens (token_id, walkin_id, token_number, issue_time, status, called_time, completed_time) FROM stdin;
\.


--
-- TOC entry 5657 (class 0 OID 16966)
-- Dependencies: 266
-- Data for Name: walkins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.walkins (walkin_id, full_name, gender, mobile_no, email_id, organization_id, department_id, officer_id, purpose, walkin_date, status, remarks, state_code, division_code, district_code, taluka_code, insert_date, insert_by, insert_ip, slot_time, service_id, visitor_id) FROM stdin;
W00016	Vivek	M	987654321088	vivekp2704@gmail.com	ORG013	DEP019	\N	mm	2026-01-17	pending	\N	27	04	477	4112	2026-01-09 18:54:03.606	system	::1	09:00:00	SRV020	VIS030
W00017	Vivek	M	987654321088	vivekp2704@gmail.com	ORG013	DEP019	HLP002	mmm	2026-01-16	pending	\N	27	04	477	4112	2026-01-09 19:09:05.117	system	::1	09:00:00	SRV020	VIS030
W00018	Mayuri	F	9876543244	mayuri@gmail.com	ORG013	DEP019	HLP002	mm	2026-01-16	pending	\N	27	04	477	4112	2026-01-09 22:20:57.547	system	::1	10:00:00	SRV020	VIS019
W00019	Shruti	F	6789012344	shruti@gmail.com	ORG002	DEP002	OFF005	meet	2026-01-14	pending	\N	27	01	482	\N	2026-01-13 15:42:27.483	system	::1	10:00:00	SER002	JAN-2026-VIS-003
W00052	Mayuri	F	9876543244	mayuri@gmail.com	ORG002	DEP002	OFF005	meet	2026-01-19	pending	\N	27	01	482	\N	2026-01-17 15:41:18.338	system	::1	11:00:00	SER002	VIS019
W00053	Mayuri	F	9876543244	mayuri@gmail.com	ORG002	DEP002	OFF005	meeting for aadhar verification	2026-01-20	pending	\N	27	01	482	\N	2026-01-20 14:48:21.731	system	::1	15:15:00	SER002	VIS019
W00054	Awanti Pawar	F	6521347877	awanti@gmail.com	ORG002	DEP002	OFF005	meeting for pancard registration	2026-01-20	pending	\N	27	01	482	\N	2026-01-20 14:53:17.018	system	::1	15:45:00	SER002	JAN-2026-VIS-004
W00055	Jaikishan 	M	9345678222	jaimishra20031@gmail.com	ORG002	DEP002	OFF005	meet	2026-01-20	pending	\N	27	01	482	\N	2026-01-20 07:27:54.622	system	::1	09:00:00	SER002	JAN-2026-VIS-005
\.


--
-- TOC entry 5668 (class 0 OID 0)
-- Dependencies: 220
-- Name: appointment_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_documents_id_seq', 13, true);


--
-- TOC entry 5669 (class 0 OID 0)
-- Dependencies: 222
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 101, true);


--
-- TOC entry 5670 (class 0 OID 0)
-- Dependencies: 224
-- Name: checkins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checkins_id_seq', 1, false);


--
-- TOC entry 5671 (class 0 OID 0)
-- Dependencies: 226
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedback_id_seq', 1, false);


--
-- TOC entry 5672 (class 0 OID 0)
-- Dependencies: 228
-- Name: m_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_admins_id_seq', 4, true);


--
-- TOC entry 5673 (class 0 OID 0)
-- Dependencies: 230
-- Name: m_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_department_id_seq', 31, true);


--
-- TOC entry 5674 (class 0 OID 0)
-- Dependencies: 235
-- Name: m_helpdesk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_helpdesk_id_seq', 35, true);


--
-- TOC entry 5675 (class 0 OID 0)
-- Dependencies: 237
-- Name: m_officers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_officers_id_seq', 15, true);


--
-- TOC entry 5676 (class 0 OID 0)
-- Dependencies: 239
-- Name: m_organization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_organization_id_seq', 18, true);


--
-- TOC entry 5677 (class 0 OID 0)
-- Dependencies: 242
-- Name: m_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_services_id_seq', 43, true);


--
-- TOC entry 5678 (class 0 OID 0)
-- Dependencies: 245
-- Name: m_slot_breaks_break_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_slot_breaks_break_id_seq', 33, true);


--
-- TOC entry 5679 (class 0 OID 0)
-- Dependencies: 247
-- Name: m_slot_config_slot_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_slot_config_slot_config_id_seq', 48, true);


--
-- TOC entry 5680 (class 0 OID 0)
-- Dependencies: 249
-- Name: m_slot_holidays_holiday_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_slot_holidays_holiday_id_seq', 33, true);


--
-- TOC entry 5681 (class 0 OID 0)
-- Dependencies: 255
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 94, true);


--
-- TOC entry 5682 (class 0 OID 0)
-- Dependencies: 258
-- Name: password_reset_otp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_otp_id_seq', 1, true);


--
-- TOC entry 5683 (class 0 OID 0)
-- Dependencies: 259
-- Name: queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.queue_id_seq', 1, false);


--
-- TOC entry 5684 (class 0 OID 0)
-- Dependencies: 263
-- Name: walkin_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.walkin_tokens_id_seq', 1, false);


--
-- TOC entry 5685 (class 0 OID 0)
-- Dependencies: 265
-- Name: walkins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.walkins_id_seq', 55, true);


--
-- TOC entry 5284 (class 2606 OID 16994)
-- Name: appointment_documents appointment_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 5286 (class 2606 OID 16996)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- TOC entry 5289 (class 2606 OID 16998)
-- Name: checkins checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_pkey PRIMARY KEY (checkin_id);


--
-- TOC entry 5291 (class 2606 OID 17000)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id);


--
-- TOC entry 5293 (class 2606 OID 17002)
-- Name: m_admins m_admins_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_email_id_key UNIQUE (email_id);


--
-- TOC entry 5295 (class 2606 OID 17004)
-- Name: m_admins m_admins_mobile_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_mobile_no_key UNIQUE (mobile_no);


--
-- TOC entry 5297 (class 2606 OID 17006)
-- Name: m_admins m_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 5299 (class 2606 OID 17008)
-- Name: m_admins m_admins_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_user_id_key UNIQUE (user_id);


--
-- TOC entry 5301 (class 2606 OID 17010)
-- Name: m_department m_department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_department
    ADD CONSTRAINT m_department_pkey PRIMARY KEY (department_id);


--
-- TOC entry 5303 (class 2606 OID 17012)
-- Name: m_designation m_designation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_designation
    ADD CONSTRAINT m_designation_pkey PRIMARY KEY (designation_code);


--
-- TOC entry 5305 (class 2606 OID 17014)
-- Name: m_district m_district_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_district
    ADD CONSTRAINT m_district_pkey PRIMARY KEY (district_code);


--
-- TOC entry 5307 (class 2606 OID 17016)
-- Name: m_division m_division_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_division
    ADD CONSTRAINT m_division_pkey PRIMARY KEY (division_code);


--
-- TOC entry 5309 (class 2606 OID 17018)
-- Name: m_helpdesk m_helpdesk_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_email_id_key UNIQUE (email_id);


--
-- TOC entry 5311 (class 2606 OID 17020)
-- Name: m_helpdesk m_helpdesk_mobile_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_mobile_no_key UNIQUE (mobile_no);


--
-- TOC entry 5313 (class 2606 OID 17022)
-- Name: m_helpdesk m_helpdesk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_pkey PRIMARY KEY (helpdesk_id);


--
-- TOC entry 5315 (class 2606 OID 17024)
-- Name: m_helpdesk m_helpdesk_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_user_id_key UNIQUE (user_id);


--
-- TOC entry 5317 (class 2606 OID 17026)
-- Name: m_officers m_officers_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_email_id_key UNIQUE (email_id);


--
-- TOC entry 5319 (class 2606 OID 17028)
-- Name: m_officers m_officers_mobile_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_mobile_no_key UNIQUE (mobile_no);


--
-- TOC entry 5321 (class 2606 OID 17030)
-- Name: m_officers m_officers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_pkey PRIMARY KEY (officer_id);


--
-- TOC entry 5323 (class 2606 OID 17032)
-- Name: m_officers m_officers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_user_id_key UNIQUE (user_id);


--
-- TOC entry 5325 (class 2606 OID 17034)
-- Name: m_organization m_organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_organization
    ADD CONSTRAINT m_organization_pkey PRIMARY KEY (organization_id);


--
-- TOC entry 5327 (class 2606 OID 17036)
-- Name: m_role m_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_role
    ADD CONSTRAINT m_role_pkey PRIMARY KEY (role_code);


--
-- TOC entry 5329 (class 2606 OID 17038)
-- Name: m_services m_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_services
    ADD CONSTRAINT m_services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 5331 (class 2606 OID 17040)
-- Name: m_slot_breaks m_slot_breaks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_breaks
    ADD CONSTRAINT m_slot_breaks_pkey PRIMARY KEY (break_id);


--
-- TOC entry 5333 (class 2606 OID 17042)
-- Name: m_slot_config m_slot_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_pkey PRIMARY KEY (slot_config_id);


--
-- TOC entry 5336 (class 2606 OID 17044)
-- Name: m_slot_holidays m_slot_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_pkey PRIMARY KEY (holiday_id);


--
-- TOC entry 5338 (class 2606 OID 17046)
-- Name: m_staff m_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_staff
    ADD CONSTRAINT m_staff_pkey PRIMARY KEY (staff_id);


--
-- TOC entry 5340 (class 2606 OID 17048)
-- Name: m_state m_state_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_state
    ADD CONSTRAINT m_state_pkey PRIMARY KEY (state_code);


--
-- TOC entry 5342 (class 2606 OID 17050)
-- Name: m_taluka m_taluka_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_taluka
    ADD CONSTRAINT m_taluka_pkey PRIMARY KEY (taluka_code);


--
-- TOC entry 5344 (class 2606 OID 17052)
-- Name: m_users m_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_users
    ADD CONSTRAINT m_users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5346 (class 2606 OID 17054)
-- Name: m_users m_users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_users
    ADD CONSTRAINT m_users_username_key UNIQUE (username);


--
-- TOC entry 5348 (class 2606 OID 17056)
-- Name: m_visitors_signup m_visitors_signup_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_email_id_key UNIQUE (email_id);


--
-- TOC entry 5350 (class 2606 OID 17058)
-- Name: m_visitors_signup m_visitors_signup_mobile_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_mobile_no_key UNIQUE (mobile_no);


--
-- TOC entry 5352 (class 2606 OID 17060)
-- Name: m_visitors_signup m_visitors_signup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_pkey PRIMARY KEY (visitor_id);


--
-- TOC entry 5354 (class 2606 OID 17062)
-- Name: m_visitors_signup m_visitors_signup_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_user_id_key UNIQUE (user_id);


--
-- TOC entry 5356 (class 2606 OID 17064)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 5359 (class 2606 OID 17066)
-- Name: password_reset_otp password_reset_otp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otp
    ADD CONSTRAINT password_reset_otp_pkey PRIMARY KEY (id);


--
-- TOC entry 5361 (class 2606 OID 17068)
-- Name: queue queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_pkey PRIMARY KEY (queue_id);


--
-- TOC entry 5363 (class 2606 OID 17070)
-- Name: user_seq_monthly user_seq_monthly_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_seq_monthly
    ADD CONSTRAINT user_seq_monthly_pkey PRIMARY KEY (year_month);


--
-- TOC entry 5365 (class 2606 OID 17072)
-- Name: visitor_seq_monthly visitor_seq_monthly_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_seq_monthly
    ADD CONSTRAINT visitor_seq_monthly_pkey PRIMARY KEY (year_month);


--
-- TOC entry 5367 (class 2606 OID 17074)
-- Name: walkin_tokens walkin_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkin_tokens
    ADD CONSTRAINT walkin_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5369 (class 2606 OID 17076)
-- Name: walkins walkins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_pkey PRIMARY KEY (walkin_id);


--
-- TOC entry 5287 (class 1259 OID 17544)
-- Name: idx_appointments_officer_date_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_officer_date_status ON public.appointments USING btree (officer_id, appointment_date, status);


--
-- TOC entry 5357 (class 1259 OID 17077)
-- Name: idx_password_reset_otp_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_otp_user ON public.password_reset_otp USING btree (user_id);


--
-- TOC entry 5334 (class 1259 OID 17078)
-- Name: ux_slot_config_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_slot_config_scope ON public.m_slot_config USING btree (organization_id, department_id, service_id, officer_id, state_code, division_code, district_code, taluka_code, day_of_week, effective_from);


--
-- TOC entry 5462 (class 2620 OID 17079)
-- Name: m_users trg_set_user_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_set_user_id BEFORE INSERT ON public.m_users FOR EACH ROW EXECUTE FUNCTION public.set_user_id();


--
-- TOC entry 5463 (class 2620 OID 17080)
-- Name: m_visitors_signup trg_set_visitor_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_set_visitor_id BEFORE INSERT ON public.m_visitors_signup FOR EACH ROW EXECUTE FUNCTION public.set_visitor_id();


--
-- TOC entry 5370 (class 2606 OID 17081)
-- Name: appointment_documents appointment_documents_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 5371 (class 2606 OID 17086)
-- Name: appointment_documents appointment_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.m_users(user_id);


--
-- TOC entry 5372 (class 2606 OID 17091)
-- Name: appointments appointments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5373 (class 2606 OID 17096)
-- Name: appointments appointments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5374 (class 2606 OID 17101)
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.m_services(service_id);


--
-- TOC entry 5375 (class 2606 OID 17106)
-- Name: appointments appointments_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.m_visitors_signup(visitor_id);


--
-- TOC entry 5380 (class 2606 OID 17111)
-- Name: checkins checkins_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 5381 (class 2606 OID 17116)
-- Name: checkins checkins_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.m_visitors_signup(visitor_id);


--
-- TOC entry 5382 (class 2606 OID 17121)
-- Name: feedback feedback_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 5383 (class 2606 OID 17126)
-- Name: feedback feedback_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.m_visitors_signup(visitor_id);


--
-- TOC entry 5376 (class 2606 OID 17131)
-- Name: appointments fk_appointments_district; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_district FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5377 (class 2606 OID 17136)
-- Name: appointments fk_appointments_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_division FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5378 (class 2606 OID 17141)
-- Name: appointments fk_appointments_state; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_state FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5379 (class 2606 OID 17146)
-- Name: appointments fk_appointments_taluka; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_taluka FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5384 (class 2606 OID 17151)
-- Name: m_admins fk_officer_district; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT fk_officer_district FOREIGN KEY (officer_district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5385 (class 2606 OID 17156)
-- Name: m_admins fk_officer_division; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT fk_officer_division FOREIGN KEY (officer_division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5386 (class 2606 OID 17161)
-- Name: m_admins fk_officer_state; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT fk_officer_state FOREIGN KEY (officer_state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5387 (class 2606 OID 17166)
-- Name: m_admins fk_officer_taluka; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT fk_officer_taluka FOREIGN KEY (officer_taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5453 (class 2606 OID 17171)
-- Name: walkins fk_walkins_service; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT fk_walkins_service FOREIGN KEY (service_id) REFERENCES public.m_services(service_id);


--
-- TOC entry 5454 (class 2606 OID 17176)
-- Name: walkins fk_walkins_visitor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT fk_walkins_visitor FOREIGN KEY (visitor_id) REFERENCES public.m_visitors_signup(visitor_id) ON DELETE SET NULL;


--
-- TOC entry 5388 (class 2606 OID 17181)
-- Name: m_admins m_admins_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5389 (class 2606 OID 17186)
-- Name: m_admins m_admins_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5390 (class 2606 OID 17191)
-- Name: m_admins m_admins_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5391 (class 2606 OID 17196)
-- Name: m_admins m_admins_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5392 (class 2606 OID 17201)
-- Name: m_admins m_admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_admins
    ADD CONSTRAINT m_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.m_users(user_id);


--
-- TOC entry 5393 (class 2606 OID 17206)
-- Name: m_department m_department_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_department
    ADD CONSTRAINT m_department_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5394 (class 2606 OID 17211)
-- Name: m_department m_department_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_department
    ADD CONSTRAINT m_department_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5395 (class 2606 OID 17216)
-- Name: m_designation m_designation_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_designation
    ADD CONSTRAINT m_designation_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5396 (class 2606 OID 17221)
-- Name: m_designation m_designation_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_designation
    ADD CONSTRAINT m_designation_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5397 (class 2606 OID 17226)
-- Name: m_designation m_designation_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_designation
    ADD CONSTRAINT m_designation_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5398 (class 2606 OID 17231)
-- Name: m_designation m_designation_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_designation
    ADD CONSTRAINT m_designation_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5399 (class 2606 OID 17236)
-- Name: m_district m_district_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_district
    ADD CONSTRAINT m_district_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5400 (class 2606 OID 17241)
-- Name: m_district m_district_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_district
    ADD CONSTRAINT m_district_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5401 (class 2606 OID 17246)
-- Name: m_division m_division_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_division
    ADD CONSTRAINT m_division_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5402 (class 2606 OID 17251)
-- Name: m_helpdesk m_helpdesk_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5403 (class 2606 OID 17256)
-- Name: m_helpdesk m_helpdesk_designation_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_designation_code_fkey FOREIGN KEY (designation_code) REFERENCES public.m_designation(designation_code);


--
-- TOC entry 5404 (class 2606 OID 17261)
-- Name: m_helpdesk m_helpdesk_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5405 (class 2606 OID 17266)
-- Name: m_helpdesk m_helpdesk_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5406 (class 2606 OID 17271)
-- Name: m_helpdesk m_helpdesk_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5407 (class 2606 OID 17276)
-- Name: m_helpdesk m_helpdesk_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5408 (class 2606 OID 17281)
-- Name: m_helpdesk m_helpdesk_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5409 (class 2606 OID 17286)
-- Name: m_helpdesk m_helpdesk_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_helpdesk
    ADD CONSTRAINT m_helpdesk_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.m_users(user_id);


--
-- TOC entry 5410 (class 2606 OID 17291)
-- Name: m_officers m_officers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5411 (class 2606 OID 17296)
-- Name: m_officers m_officers_designation_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_designation_code_fkey FOREIGN KEY (designation_code) REFERENCES public.m_designation(designation_code);


--
-- TOC entry 5412 (class 2606 OID 17301)
-- Name: m_officers m_officers_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5413 (class 2606 OID 17306)
-- Name: m_officers m_officers_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5414 (class 2606 OID 17311)
-- Name: m_officers m_officers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5415 (class 2606 OID 17316)
-- Name: m_officers m_officers_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5416 (class 2606 OID 17321)
-- Name: m_officers m_officers_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5417 (class 2606 OID 17326)
-- Name: m_officers m_officers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_officers
    ADD CONSTRAINT m_officers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.m_users(user_id);


--
-- TOC entry 5418 (class 2606 OID 17331)
-- Name: m_organization m_organization_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_organization
    ADD CONSTRAINT m_organization_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5419 (class 2606 OID 17336)
-- Name: m_services m_services_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_services
    ADD CONSTRAINT m_services_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5420 (class 2606 OID 17341)
-- Name: m_services m_services_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_services
    ADD CONSTRAINT m_services_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5421 (class 2606 OID 17346)
-- Name: m_services m_services_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_services
    ADD CONSTRAINT m_services_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5422 (class 2606 OID 17351)
-- Name: m_slot_breaks m_slot_breaks_slot_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_breaks
    ADD CONSTRAINT m_slot_breaks_slot_config_id_fkey FOREIGN KEY (slot_config_id) REFERENCES public.m_slot_config(slot_config_id) ON DELETE CASCADE;


--
-- TOC entry 5423 (class 2606 OID 17356)
-- Name: m_slot_config m_slot_config_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5424 (class 2606 OID 17361)
-- Name: m_slot_config m_slot_config_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5425 (class 2606 OID 17366)
-- Name: m_slot_config m_slot_config_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5426 (class 2606 OID 17371)
-- Name: m_slot_config m_slot_config_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.m_officers(officer_id);


--
-- TOC entry 5427 (class 2606 OID 17376)
-- Name: m_slot_config m_slot_config_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5428 (class 2606 OID 17381)
-- Name: m_slot_config m_slot_config_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.m_services(service_id);


--
-- TOC entry 5429 (class 2606 OID 17386)
-- Name: m_slot_config m_slot_config_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5430 (class 2606 OID 17391)
-- Name: m_slot_config m_slot_config_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_config
    ADD CONSTRAINT m_slot_config_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5431 (class 2606 OID 17396)
-- Name: m_slot_holidays m_slot_holidays_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5432 (class 2606 OID 17401)
-- Name: m_slot_holidays m_slot_holidays_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5433 (class 2606 OID 17406)
-- Name: m_slot_holidays m_slot_holidays_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5434 (class 2606 OID 17411)
-- Name: m_slot_holidays m_slot_holidays_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5435 (class 2606 OID 17416)
-- Name: m_slot_holidays m_slot_holidays_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.m_services(service_id);


--
-- TOC entry 5436 (class 2606 OID 17421)
-- Name: m_slot_holidays m_slot_holidays_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5437 (class 2606 OID 17426)
-- Name: m_slot_holidays m_slot_holidays_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_slot_holidays
    ADD CONSTRAINT m_slot_holidays_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5438 (class 2606 OID 17431)
-- Name: m_taluka m_taluka_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_taluka
    ADD CONSTRAINT m_taluka_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5439 (class 2606 OID 17436)
-- Name: m_taluka m_taluka_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_taluka
    ADD CONSTRAINT m_taluka_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5440 (class 2606 OID 17441)
-- Name: m_taluka m_taluka_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_taluka
    ADD CONSTRAINT m_taluka_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5441 (class 2606 OID 17446)
-- Name: m_users m_users_role_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_users
    ADD CONSTRAINT m_users_role_code_fkey FOREIGN KEY (role_code) REFERENCES public.m_role(role_code);


--
-- TOC entry 5442 (class 2606 OID 17451)
-- Name: m_visitors_signup m_visitors_signup_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5443 (class 2606 OID 17456)
-- Name: m_visitors_signup m_visitors_signup_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5444 (class 2606 OID 17461)
-- Name: m_visitors_signup m_visitors_signup_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5445 (class 2606 OID 17466)
-- Name: m_visitors_signup m_visitors_signup_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


--
-- TOC entry 5446 (class 2606 OID 17471)
-- Name: m_visitors_signup m_visitors_signup_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_visitors_signup
    ADD CONSTRAINT m_visitors_signup_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.m_users(user_id);


--
-- TOC entry 5447 (class 2606 OID 17476)
-- Name: notifications notifications_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 5448 (class 2606 OID 17481)
-- Name: notifications notifications_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_username_fkey FOREIGN KEY (username) REFERENCES public.m_users(username);


--
-- TOC entry 5449 (class 2606 OID 17486)
-- Name: notifications notifications_walkin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_walkin_id_fkey FOREIGN KEY (walkin_id) REFERENCES public.walkins(walkin_id);


--
-- TOC entry 5450 (class 2606 OID 17491)
-- Name: password_reset_otp password_reset_otp_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otp
    ADD CONSTRAINT password_reset_otp_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.m_users(user_id);


--
-- TOC entry 5451 (class 2606 OID 17496)
-- Name: queue queue_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);


--
-- TOC entry 5452 (class 2606 OID 17501)
-- Name: queue queue_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.m_visitors_signup(visitor_id);


--
-- TOC entry 5455 (class 2606 OID 17506)
-- Name: walkins walkins_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.m_department(department_id);


--
-- TOC entry 5456 (class 2606 OID 17511)
-- Name: walkins walkins_district_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.m_district(district_code);


--
-- TOC entry 5457 (class 2606 OID 17516)
-- Name: walkins walkins_division_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_division_code_fkey FOREIGN KEY (division_code) REFERENCES public.m_division(division_code);


--
-- TOC entry 5458 (class 2606 OID 17521)
-- Name: walkins walkins_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.m_staff(staff_id);


--
-- TOC entry 5459 (class 2606 OID 17526)
-- Name: walkins walkins_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.m_organization(organization_id);


--
-- TOC entry 5460 (class 2606 OID 17531)
-- Name: walkins walkins_state_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_state_code_fkey FOREIGN KEY (state_code) REFERENCES public.m_state(state_code);


--
-- TOC entry 5461 (class 2606 OID 17536)
-- Name: walkins walkins_taluka_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.walkins
    ADD CONSTRAINT walkins_taluka_code_fkey FOREIGN KEY (taluka_code) REFERENCES public.m_taluka(taluka_code);


-- Completed on 2026-01-27 21:44:07

--
-- PostgreSQL database dump complete
--

\unrestrict hMeRFEj9pcUkWyn2KApPTaxM5CaMBq7lqL2Jkr3dqKD7vl0ca1cciohg2pAxGfj

