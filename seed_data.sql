-- KEDevs Complete Seed Data
-- Pipe directly into your Docker PostgreSQL:
-- docker exec -i -e PGPASSWORD="123a456k" kedevs_postgres psql -U moseti -d kedevs_db < seed.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Truncate all tables (order respects foreign keys)
TRUNCATE TABLE
    verification_request_certificates,
    verification_requests,
    comment_flags,
    comment_votes,
    forum_comments,
    job_flags,
    job_votes,
    job_tags,
    job_applications,
    pinned_job_slots,
    spotlight_slots,
    contact_requests,
    company_inquiries,
    endorsements,
    developer_projects,
    developer_achievements,
    developer_oss_contributions,
    developer_certifications,
    developer_education,
    developer_languages,
    developer_skills,
    developer_profiles,
    employer_profiles,
    admin_actions,
    blocked_users,
    refresh_tokens,
    verification_codes,
    payments,
    notifications,
    notification_preferences,
    platform_settings,
    contact_messages,
    user_flags,
    users
CASCADE;

-- Platform Settings (use UPDATE if keys already exist)
INSERT INTO platform_settings (id, setting_key, setting_value, description)
VALUES
    (gen_random_uuid(), 'VERIFIED_BADGE_DEVELOPER', '250', 'Developer verified badge fee (KES)'),
    (gen_random_uuid(), 'VERIFIED_BADGE_EMPLOYER', '500', 'Employer verified badge fee (KES)'),
    (gen_random_uuid(), 'SPOTLIGHT_DAY_FEE', '50', 'Spotlight per day (KES)'),
    (gen_random_uuid(), 'SPOTLIGHT_WEEK_FEE', '250', 'Spotlight per week (KES)'),
    (gen_random_uuid(), 'PINNED_JOB_DAY_FEE', '50', 'Pin job 1 day (KES)'),
    (gen_random_uuid(), 'PINNED_JOB_3DAYS_FEE', '100', 'Pin job 3 days (KES)'),
    (gen_random_uuid(), 'PINNED_JOB_7DAYS_FEE', '200', 'Pin job 7 days (KES)'),
    (gen_random_uuid(), 'CONTACT_REQUEST_DAILY_LIMIT', '5', 'Max daily contact requests per employer'),
    (gen_random_uuid(), 'COMMENT_EDIT_WINDOW', '15', 'Minutes allowed to edit a comment'),
    (gen_random_uuid(), 'COMMENT_DELETE_WINDOW', '60', 'Minutes allowed to delete a comment')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Admin users
INSERT INTO users (id, email, password, full_name, role, email_verified, account_status, approved_by_admin)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin1@kedevs.co.ke', crypt('12345678', gen_salt('bf')), 'Admin User', 'ADMIN', true, 'ACTIVE', true),
    ('a0000000-0000-0000-0000-000000000002', 'admin2@kedevs.co.ke', crypt('12345678', gen_salt('bf')), 'Super Admin', 'ADMIN', true, 'ACTIVE', true);

-- 30 Developers
DO $$
DECLARE
    i INT;
    v_user_id UUID;
    v_profile_id UUID;
    v_first TEXT;
    v_last TEXT;
    v_full TEXT;
    v_bio TEXT;
    v_role TEXT;
    v_skill TEXT;
    v_lang TEXT;
    v_skills TEXT[] := ARRAY['JavaScript','TypeScript','Python','Java','Kotlin','Swift','React','Angular','Vue.js','Node.js','Spring Boot','Django','Flask','PostgreSQL','MongoDB','Docker','Kubernetes','AWS','Azure','Git','Figma','Tailwind CSS','GraphQL','REST APIs'];
    v_languages TEXT[] := ARRAY['English','Swahili','French','German','Arabic'];
    v_edu_institutions TEXT[] := ARRAY['University of Nairobi','Strathmore University','JKUAT','Kenyatta University','Moi University','Riara University','USIU Africa','Multimedia University'];
    v_qualifications TEXT[] := ARRAY['BSc. Computer Science','BSc. Information Technology','Diploma in Software Engineering','MSc. Data Science','BSc. Electrical Engineering'];
    v_certs TEXT[] := ARRAY['AWS Solutions Architect','Google Associate Cloud Engineer','Oracle Certified Professional','Cisco CCNA','Scrum Master'];
    v_job_titles TEXT[] := ARRAY['Full-Stack Developer','Frontend Engineer','Backend Developer','Mobile Developer','DevOps Engineer','Data Scientist','UI/UX Designer','QA Engineer'];
    v_bio_tmpl TEXT[] := ARRAY['Passionate about building scalable web applications.','Love creating beautiful UIs with great UX.','Backend architect focusing on distributed systems.','Data-driven developer with ML experience.','DevOps enthusiast automating everything.','Mobile developer crafting smooth animations.','Full-stack generalist who loves learning new tech.','Cloud-native engineer building on AWS and Azure.'];
    v_first_names TEXT[] := ARRAY['Amani','Baraka','Chipo','Daudi','Eshe','Fatima','Gamba','Halima','Ibrahim','Jamila','Kofi','Lulu','Mosi','Nia','Obasi','Penda','Rashidi','Safiya','Tendaji','Uzuri','Vumbi','Wema','Xolani','Yara','Zuri','Asha','Bakari','Chiku','Dunia','Enzi'];
    v_last_names TEXT[] := ARRAY['Odhiambo','Wanjiku','Mwangi','Akinyi','Kamau','Otieno','Muthoni','Ochieng','Wambui','Njeri','Omondi','Chebet','Kiprotich','Njuguna','Wafula','Achieng','Korir','Muthama','Oduor','Wanjiru'];
BEGIN
    FOR i IN 1..30 LOOP
        v_first := v_first_names[floor(random()*array_length(v_first_names,1)+1)];
        v_last := v_last_names[floor(random()*array_length(v_last_names,1)+1)];
        v_full := v_first || ' ' || v_last;
        v_bio := v_bio_tmpl[floor(random()*array_length(v_bio_tmpl,1)+1)];
        v_role := v_job_titles[floor(random()*array_length(v_job_titles,1)+1)];

        INSERT INTO users (id, email, password, full_name, role, email_verified, account_status, approved_by_admin)
        VALUES (gen_random_uuid(), 'dev' || i || '@kedevs.dev', crypt('12345678', gen_salt('bf')), v_full, 'DEVELOPER', true, 'ACTIVE', true)
        RETURNING id INTO v_user_id;

        INSERT INTO developer_profiles (
            id, user_id, first_name, last_name, bio, current_last_role,
            years_of_experience, availability_status, preferred_work_type,
            location_city, location_country, profile_visibility, is_verified,
            can_employers_reach_out, github_url, linkedin_url, portfolio_url
        ) VALUES (
            gen_random_uuid(), v_user_id, v_first, v_last, v_bio, v_role,
            (ARRAY['ZERO_TO_ONE','ONE_TO_THREE','THREE_TO_FIVE','FIVE_TO_TEN'])[floor(random()*4+1)],
            (ARRAY['OPEN_TO_OFFERS','NOT_AVAILABLE'])[floor(random()*2+1)],
            (ARRAY['REMOTE','ONSITE','HYBRID'])[floor(random()*3+1)],
            'Nairobi', 'Kenya', 'PUBLIC', random() < 0.3, true,
            'https://github.com/' || lower(v_first) || lower(v_last),
            'https://linkedin.com/in/' || lower(v_first) || lower(v_last),
            'https://' || lower(v_first) || lower(v_last) || '.dev'
        )
        RETURNING id INTO v_profile_id;

        -- 3-6 random skills
        FOR s IN 1..(3 + floor(random()*4)) LOOP
            v_skill := v_skills[floor(random()*array_length(v_skills,1)+1)];
            INSERT INTO developer_skills (id, developer_id, skill)
            VALUES (gen_random_uuid(), v_profile_id, v_skill)
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- 1-2 languages
        FOR l IN 1..(1 + floor(random()*2)) LOOP
            v_lang := v_languages[floor(random()*array_length(v_languages,1)+1)];
            INSERT INTO developer_languages (id, developer_id, language)
            VALUES (gen_random_uuid(), v_profile_id, v_lang)
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- 1 education entry
        INSERT INTO developer_education (id, developer_id, institution, qualification, year_completed, field_of_study, start_year)
        VALUES (
            gen_random_uuid(), v_profile_id,
            v_edu_institutions[floor(random()*array_length(v_edu_institutions,1)+1)],
            v_qualifications[floor(random()*array_length(v_qualifications,1)+1)],
            2018 + floor(random()*7), 'Computer Science', 2014 + floor(random()*4)
        );

        -- 0-1 certification
        IF random() < 0.6 THEN
            INSERT INTO developer_certifications (id, developer_id, name, issued_by, issued_date)
            VALUES (
                gen_random_uuid(), v_profile_id,
                v_certs[floor(random()*array_length(v_certs,1)+1)],
                'Certification Body',
                (CURRENT_DATE - (random()*365*3)::int)
            );
        END IF;

        -- 1-2 projects
        FOR p IN 1..(1 + floor(random()*2)) LOOP
            INSERT INTO developer_projects (id, developer_id, title, description, tech_stack, project_url, repo_url, is_featured)
            VALUES (
                gen_random_uuid(), v_profile_id,
                'Project ' || i || '-' || p,
                'A sample project built with ' || v_skills[floor(random()*array_length(v_skills,1)+1)],
                array_to_string((ARRAY(SELECT unnest(v_skills) ORDER BY random() LIMIT 3)), ','),
                'https://example.com/project' || i || p,
                'https://github.com/' || lower(v_first) || lower(v_last) || '/project' || p,
                random() < 0.3
            );
        END LOOP;

        -- 0-1 OSS contribution
        IF random() < 0.5 THEN
            INSERT INTO developer_oss_contributions (id, developer_id, project_name, contribution_url, description, role)
            VALUES (
                gen_random_uuid(), v_profile_id,
                'Open Source Project ' || i,
                'https://github.com/opensource/repo' || i,
                'Contributed to documentation and bug fixes.',
                'Contributor'
            );
        END IF;

        -- 0-1 achievement
        IF random() < 0.4 THEN
            INSERT INTO developer_achievements (id, developer_id, title, description, year)
            VALUES (
                gen_random_uuid(), v_profile_id,
                'Award for Excellence in ' || v_role,
                'Recognized for outstanding contributions in tech.',
                2022 + floor(random()*4)
            );
        END IF;
    END LOOP;
END $$;

-- 15 Employers
DO $$
DECLARE
    i INT;
    v_user_id UUID;
    v_company TEXT;
    v_industry TEXT;
    v_person TEXT;
    v_first_names TEXT[] := ARRAY['James','Grace','Peter','Martha','David','Esther','Samuel','Ruth','Joseph','Mercy','Thomas','Agnes','Paul','Naomi','Andrew'];
    v_last_names TEXT[] := ARRAY['Kiprop','Wangui','Nyambura','Makau','Wanjala','Mukami','Kariuki','Wairimu','Owino','Anyango','Mwangi','Cherotich','Kipsang','Wangu','Oloo'];
    v_companies TEXT[] := ARRAY['Savanna Tech Solutions','Twiga Innovations','JengaDev Studio','Simba Systems','Zawadi Labs','Fahari Digital','Baraka Enterprises','Tumaini IT Group','MajiMoto Software','AfriCloud Kenya','Maadili Data','Ushindi Apps','Njia Networks','Ukulima Analytics','Duma Robotics'];
    v_industries TEXT[] := ARRAY['Financial Services','Healthcare','Agriculture','Education','E-commerce','Logistics','Energy','Media'];
BEGIN
    FOR i IN 1..15 LOOP
        v_person := v_first_names[floor(random()*array_length(v_first_names,1)+1)] || ' ' || v_last_names[floor(random()*array_length(v_last_names,1)+1)];
        v_company := v_companies[i];
        v_industry := v_industries[floor(random()*array_length(v_industries,1)+1)];

        INSERT INTO users (id, email, password, full_name, role, email_verified, account_status, approved_by_admin)
        VALUES (gen_random_uuid(), 'emp' || i || '@kedevs.co.ke', crypt('12345678', gen_salt('bf')), v_person, 'EMPLOYER', true, 'ACTIVE', true)
        RETURNING id INTO v_user_id;

        INSERT INTO employer_profiles (
            id, user_id, contact_person_name, company_name, company_website,
            industry, company_size, location_hq, company_bio, is_approved, is_verified
        ) VALUES (
            gen_random_uuid(), v_user_id, v_person, v_company,
            'https://www.' || replace(lower(v_company), ' ', '') || '.co.ke',
            v_industry, 'TEN_TO_FIFTY', 'Nairobi, Kenya',
            'Leading provider of innovative solutions in the ' || v_industry || ' sector.',
            true, random() < 0.3
        );
    END LOOP;
END $$;

-- Jobs (official + peer-sourced)
DO $$
DECLARE
    emp_user RECORD;
    dev_user RECORD;
    v_job_id UUID;
    v_title TEXT;
    v_tags TEXT[] := ARRAY['JavaScript','TypeScript','Python','Java','Kotlin','React','Node.js','Spring Boot','Docker','AWS','PostgreSQL','MongoDB','GraphQL','CI/CD','Agile','Scrum','Machine Learning','Data Science','Mobile','Web'];
    v_title_tmpl TEXT[] := ARRAY['Senior %s Developer','Junior %s Engineer','Lead %s Architect','%s Specialist','Full-Stack %s Developer','%s DevOps Engineer','%s Data Analyst','%s UI/UX Designer'];
    v_techs TEXT[] := ARRAY['Java','Python','React','Node.js','Kotlin','Swift','Angular','Vue.js','Spring Boot','Django','Flask','.NET','Go','Rust'];
    v_statuses TEXT[] := ARRAY['OPEN','OPEN','OPEN','OPEN','CLOSED'];
BEGIN
    -- Employer jobs
    FOR emp_user IN SELECT u.id as uid, ep.company_name
                     FROM users u JOIN employer_profiles ep ON ep.user_id = u.id
                     WHERE u.role = 'EMPLOYER'
                     ORDER BY random() LIMIT 10
    LOOP
        FOR i IN 1..2 LOOP
            v_title := replace(v_title_tmpl[floor(random()*array_length(v_title_tmpl,1)+1)], '%s', v_techs[floor(random()*array_length(v_techs,1)+1)]);
            INSERT INTO job_posts (
                id, posted_by_id, title, description, company_name, location_city, location_country,
                job_type, work_type, experience_level, salary_range_min, salary_range_max,
                salary_currency, application_deadline, is_peer_sourced, visibility, status
            ) VALUES (
                gen_random_uuid(), emp_user.uid,
                v_title,
                'We are looking for a talented ' || v_title || ' to join our team.',
                emp_user.company_name,
                'Nairobi', 'Kenya',
                (ARRAY['FULL_TIME','PART_TIME','CONTRACT','FREELANCE','INTERNSHIP'])[floor(random()*5+1)],
                (ARRAY['REMOTE','ONSITE','HYBRID'])[floor(random()*3+1)],
                (ARRAY['ENTRY','MID','SENIOR','LEAD'])[floor(random()*4+1)],
                (50000 + floor(random()*150000))::numeric,
                (100000 + floor(random()*200000))::numeric,
                'KES',
                CURRENT_DATE + (random()*60)::int,
                false, 'EXTERNAL', v_statuses[floor(random()*array_length(v_statuses,1)+1)]
            )
            RETURNING id INTO v_job_id;

            INSERT INTO job_tags (id, job_id, tag)
            SELECT gen_random_uuid(), v_job_id, unnest(ARRAY(SELECT unnest(v_tags) ORDER BY random() LIMIT (3 + floor(random()*3))));
        END LOOP;
    END LOOP;

    -- Peer-sourced jobs from developers
    FOR dev_user IN SELECT u.id as uid
                     FROM users u JOIN developer_profiles dp ON dp.user_id = u.id
                     WHERE u.role = 'DEVELOPER'
                     ORDER BY random() LIMIT 8
    LOOP
        FOR i IN 1..(1 + floor(random()*2)) LOOP
            v_title := replace(v_title_tmpl[floor(random()*array_length(v_title_tmpl,1)+1)], '%s', v_techs[floor(random()*array_length(v_techs,1)+1)]);
            INSERT INTO job_posts (
                id, posted_by_id, title, description, company_name, location_city, location_country,
                job_type, work_type, experience_level, salary_range_min, salary_range_max,
                salary_currency, application_deadline, is_peer_sourced, visibility, status
            ) VALUES (
                gen_random_uuid(), dev_user.uid,
                v_title,
                'Found this role through my network. Apply at the source link.',
                'Various Companies',
                'Nairobi', 'Kenya',
                (ARRAY['FULL_TIME','PART_TIME','CONTRACT','FREELANCE','INTERNSHIP'])[floor(random()*5+1)],
                (ARRAY['REMOTE','ONSITE','HYBRID'])[floor(random()*3+1)],
                (ARRAY['ENTRY','MID','SENIOR','LEAD'])[floor(random()*4+1)],
                null, null, 'KES', CURRENT_DATE + (random()*30)::int,
                true, 'EXTERNAL', 'OPEN'
            )
            RETURNING id INTO v_job_id;

            INSERT INTO job_tags (id, job_id, tag)
            SELECT gen_random_uuid(), v_job_id, unnest(ARRAY(SELECT unnest(v_tags) ORDER BY random() LIMIT (3 + floor(random()*3))));
        END LOOP;
    END LOOP;
END $$;

-- Applications
DO $$
DECLARE
    dev RECORD;
    job RECORD;
BEGIN
    FOR dev IN SELECT dp.user_id as uid
               FROM developer_profiles dp
               WHERE dp.availability_status = 'OPEN_TO_OFFERS'
               LIMIT 20
    LOOP
        FOR job IN SELECT id FROM job_posts WHERE status = 'OPEN' ORDER BY random() LIMIT 3 LOOP
            INSERT INTO job_applications (id, job_id, applicant_id, cover_letter, status)
            VALUES (
                gen_random_uuid(), job.id, dev.uid,
                'I am very interested in this position.',
                (ARRAY['PENDING','REVIEWED','ACCEPTED','REJECTED'])[floor(random()*4+1)]
            )
            ON CONFLICT (job_id, applicant_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Job votes
DO $$
DECLARE
    u RECORD;
    j RECORD;
BEGIN
    FOR u IN SELECT id FROM users WHERE role = 'DEVELOPER' LIMIT 20 LOOP
        FOR j IN SELECT id FROM job_posts ORDER BY random() LIMIT 5 LOOP
            INSERT INTO job_votes (id, job_id, user_id, vote_type)
            VALUES (gen_random_uuid(), j.id, u.id, (ARRAY['UPVOTE','DOWNVOTE'])[floor(random()*2+1)])
            ON CONFLICT (job_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Job flags
INSERT INTO job_flags (id, job_id, flagged_by_id, reason, status)
SELECT gen_random_uuid(), j.id, u.id, 'This job looks suspicious.', 'PENDING'
FROM job_posts j CROSS JOIN users u
WHERE u.role = 'DEVELOPER' AND random() < 0.1
LIMIT 5;

-- Forum comments
DO $$
DECLARE
    u RECORD;
    j RECORD;
    v_comment_id UUID;
    v_content TEXT[] := ARRAY['Great opportunity!','Has anyone applied?','What is the tech stack?','I love this role!','Any tips for the interview?','Is remote work an option?','Sounds exciting!','When is the deadline?','Thanks for sharing!'];
BEGIN
    FOR j IN SELECT id FROM job_posts ORDER BY random() LIMIT 15 LOOP
        FOR u IN SELECT id FROM users WHERE role = 'DEVELOPER' ORDER BY random() LIMIT 3 LOOP
            INSERT INTO forum_comments (id, job_id, author_id, content, parent_comment_id)
            VALUES (gen_random_uuid(), j.id, u.id, v_content[floor(random()*array_length(v_content,1)+1)], null)
            RETURNING id INTO v_comment_id;

            IF random() < 0.4 THEN
                INSERT INTO forum_comments (id, job_id, author_id, content, parent_comment_id)
                VALUES (gen_random_uuid(), j.id, (SELECT id FROM users WHERE role = 'DEVELOPER' ORDER BY random() LIMIT 1), 'Thanks for the info!', v_comment_id);
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Comment votes & flags
DO $$
DECLARE
    c RECORD;
    u RECORD;
BEGIN
    FOR c IN SELECT id FROM forum_comments LIMIT 30 LOOP
        FOR u IN SELECT id FROM users WHERE role = 'DEVELOPER' ORDER BY random() LIMIT 2 LOOP
            INSERT INTO comment_votes (id, comment_id, user_id, vote_type)
            VALUES (gen_random_uuid(), c.id, u.id, (ARRAY['UPVOTE','DOWNVOTE'])[floor(random()*2+1)])
            ON CONFLICT (comment_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

INSERT INTO comment_flags (id, comment_id, flagged_by_id, reason, status)
SELECT gen_random_uuid(), c.id, u.id, 'Inappropriate comment', 'PENDING'
FROM forum_comments c CROSS JOIN users u
WHERE u.role = 'DEVELOPER' AND random() < 0.05
LIMIT 5;

-- Contact requests
DO $$
DECLARE
    emp RECORD;
    dev RECORD;
BEGIN
    FOR emp IN SELECT ep.id as epid, ep.user_id as uid FROM employer_profiles ep LIMIT 5 LOOP
        FOR dev IN SELECT dp.id as dpid, dp.user_id as uid FROM developer_profiles dp WHERE dp.can_employers_reach_out = true ORDER BY random() LIMIT 2 LOOP
            INSERT INTO contact_requests (id, employer_id, developer_id, message, status)
            VALUES (gen_random_uuid(), emp.epid, dev.dpid, 'We think your skills match a role we have open.', (ARRAY['PENDING','ACCEPTED','REJECTED'])[floor(random()*3+1)]);
        END LOOP;
    END LOOP;
END $$;

-- Endorsements (fixed)
INSERT INTO endorsements (id, recipient_id, author_id, content)
SELECT gen_random_uuid(), dp1.id, u2.id, 'Excellent developer, highly recommended!'
FROM developer_profiles dp1
CROSS JOIN users u2
WHERE u2.role = 'DEVELOPER'
  AND dp1.user_id <> u2.id
ORDER BY random()
LIMIT 50;

-- Payments
DO $$
DECLARE
    dev RECORD;
    emp RECORD;
    v_type TEXT;
BEGIN
    FOR dev IN SELECT u.id as uid FROM users u WHERE u.role = 'DEVELOPER' ORDER BY random() LIMIT 15 LOOP
        v_type := (ARRAY['VERIFIED_BADGE','SPOTLIGHT_DAY','SPOTLIGHT_WEEK'])[floor(random()*3+1)];
        INSERT INTO payments (id, user_id, type, amount, currency, status, mpesa_receipt_no, phone_number, paid_at)
        VALUES (gen_random_uuid(), dev.uid, v_type,
                CASE v_type WHEN 'VERIFIED_BADGE' THEN 250 WHEN 'SPOTLIGHT_DAY' THEN 50 ELSE 250 END,
                'KES', 'COMPLETED', 'RECPT' || floor(random()*1000000)::text, '254712345678', NOW() - random()*interval '30 days');
    END LOOP;
    FOR emp IN SELECT u.id as uid FROM users u WHERE u.role = 'EMPLOYER' ORDER BY random() LIMIT 5 LOOP
        INSERT INTO payments (id, user_id, type, amount, currency, status, mpesa_receipt_no, phone_number, paid_at)
        VALUES (gen_random_uuid(), emp.uid, 'VERIFIED_BADGE', 500, 'KES', 'COMPLETED', 'RECPT' || floor(random()*1000000)::text, '254723456789', NOW() - random()*interval '30 days');
    END LOOP;
END $$;

-- Spotlight slots
INSERT INTO spotlight_slots (id, developer_id, type, start_date, end_date, payment_id, is_active)
SELECT gen_random_uuid(), dp.id,
       CASE WHEN p.type = 'SPOTLIGHT_DAY' THEN 'DAY' ELSE 'WEEK' END,
       NOW() - interval '1 day', NOW() + interval '6 days',
       p.id, true
FROM payments p
JOIN users u ON u.id = p.user_id
JOIN developer_profiles dp ON dp.user_id = u.id
WHERE p.type IN ('SPOTLIGHT_DAY','SPOTLIGHT_WEEK') AND p.status = 'COMPLETED'
LIMIT 5;

-- Notifications
DO $$
DECLARE
    dev RECORD;
    notif_types TEXT[] := ARRAY['JOB_APPLICATION','COMMENT_REPLY','ENDORSEMENT','SPOTLIGHT_EXPIRED','VERIFIED_BADGE','CONTACT_REQUEST'];
    msgs TEXT[] := ARRAY['You have a new job application.','Someone replied to your comment.','You received a new endorsement!','Your spotlight has expired.','Your verified badge was approved.','An employer sent you a contact request.'];
BEGIN
    FOR dev IN SELECT u.id as uid FROM users u WHERE u.role = 'DEVELOPER' LIMIT 30 LOOP
        FOR i IN 1..(2 + floor(random()*4)) LOOP
            INSERT INTO notifications (id, user_id, category, title, message, is_read)
            VALUES (gen_random_uuid(), dev.uid,
                    notif_types[floor(random()*array_length(notif_types,1)+1)],
                    'Notification', msgs[floor(random()*array_length(msgs,1)+1)], random() < 0.5);
        END LOOP;
    END LOOP;
END $$;

-- Verification requests
INSERT INTO verification_requests (id, user_id, role, status)
SELECT gen_random_uuid(), u.id, u.role, (ARRAY['PENDING','APPROVED','REJECTED'])[floor(random()*3+1)]
FROM users u
WHERE random() < 0.2;

-- Admin actions
INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, notes)
SELECT gen_random_uuid(),
       'a0000000-0000-0000-0000-000000000001',
       (ARRAY['REVIEW_FLAG','BAN_USER','APPROVE_EMPLOYER','GRANT_BADGE'])[floor(random()*4+1)],
       (ARRAY['JobPost','User','EmployerProfile'])[floor(random()*3+1)],
       gen_random_uuid(),
       'Demo action'
FROM generate_series(1,10);

-- Blocked users (fixed)
INSERT INTO blocked_users (id, blocker_id, blocked_id)
SELECT gen_random_uuid(), u1.id, u2.id
FROM users u1
CROSS JOIN users u2
WHERE u1.id <> u2.id
ORDER BY random()
LIMIT 5;

-- Contact messages
INSERT INTO contact_messages (id, name, email, subject, message)
VALUES (gen_random_uuid(), 'John Doe', 'john@example.com', 'Partnership Inquiry', 'I would like to partner with KEDevs.');

INSERT INTO company_inquiries (id, sender_user_id, employer_profile_id, message, status)
SELECT gen_random_uuid(), u.id, ep.id, 'Interested in your open roles.', 'PENDING'
FROM users u CROSS JOIN employer_profiles ep
WHERE u.role = 'DEVELOPER' AND random() < 0.1
LIMIT 5;

-- Sync upvote counts
UPDATE job_posts j SET upvote_count = (
    SELECT count(*) FROM job_votes WHERE job_id = j.id AND vote_type = 'UPVOTE'
);

COMMIT;