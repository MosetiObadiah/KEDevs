docker exec -i -e PGPASSWORD="123a456k" kedevs_postgres psql -U moseti -d kedevs_db <<'SQL'
INSERT INTO users (id, email, password, full_name, role, email_verified, account_status, approved_by_admin, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'admin@kedevs.com', crypt('12345678', gen_salt('bf')), 'Admin', 'ADMIN', true, 'ACTIVE', true, now(), now()),
  (gen_random_uuid(), 'root@kedevs.com', crypt('12345678', gen_salt('bf')), 'Root', 'ADMIN', true, 'ACTIVE', true, now(), now())
ON CONFLICT (email) DO NOTHING;
COMMIT;
SQL


docker exec -i -e PGPASSWORD="123a456k" kedevs_postgres psql -U moseti -d kedevs_db <<'SQL'
DO $$
DECLARE
    v_user_id UUID;
    v_person TEXT;
    v_company TEXT;
    v_industry TEXT;
    v_first_names TEXT[] := ARRAY['James','Grace','Peter','Martha','David','Esther','Samuel','Ruth','Joseph','Mercy','Thomas','Agnes','Paul','Naomi','Andrew','Faith','John','Sarah','Daniel','Rebecca'];
    v_last_names TEXT[]  := ARRAY['Kiprop','Wangui','Nyambura','Makau','Wanjala','Mukami','Kariuki','Wairimu','Owino','Anyango','Mwangi','Cherotich','Kipsang','Wangu','Oloo','Muthoni','Ochieng','Wambui','Njeri','Omondi'];
    v_companies TEXT[]   := ARRAY[
        'Savanna Tech Solutions','Twiga Innovations','JengaDev Studio','Simba Systems','Zawadi Labs',
        'Fahari Digital','Baraka Enterprises','Tumaini IT Group','MajiMoto Software','AfriCloud Kenya',
        'Maadili Data','Ushindi Apps','Njia Networks','Ukulima Analytics','Duma Robotics',
        'PendaPay','Chakula Fresh','Sasa Media','Boma Architects','Anga Space'
    ];
    v_industries TEXT[]  := ARRAY['Financial Services','Healthcare','Agriculture','Education','E-commerce','Logistics','Energy','Media','PropTech','LegalTech'];
    i INT;
BEGIN
    FOR i IN 1..20 LOOP
        v_person  := v_first_names[floor(random()*array_length(v_first_names,1)+1)] || ' ' || v_last_names[floor(random()*array_length(v_last_names,1)+1)];
        v_company := v_companies[i];
        v_industry := v_industries[floor(random()*array_length(v_industries,1)+1)];

        -- Create user account (password: 12345678)
        INSERT INTO users (id, email, password, full_name, role, email_verified, account_status, approved_by_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'emp' || i || '@kedevs.co.ke', crypt('12345678', gen_salt('bf')), v_person, 'EMPLOYER', true, 'ACTIVE', true, now(), now())
        RETURNING id INTO v_user_id;

        -- Create employer profile
        INSERT INTO employer_profiles (
            id, user_id, contact_person_name, company_name, company_website,
            industry, company_size, location_hq, company_bio, is_approved, is_verified,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_person, v_company,
            'https://www.' || replace(lower(v_company), ' ', '') || '.co.ke',
            v_industry, 'TEN_TO_FIFTY', 'Nairobi, Kenya',
            'Leading provider of innovative solutions in the ' || v_industry || ' sector.',
            true, random() < 0.3,
            now(), now()
        );
    END LOOP;
END $$;
COMMIT;
SQL



docker exec -i -e PGPASSWORD="123a456k" kedevs_postgres psql -U moseti -d kedevs_db <<'SQL'
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

        INSERT INTO users (id, email, password, full_name, role, email_verified, account_status, approved_by_admin, created_at, updated_at)
        VALUES (gen_random_uuid(), 'dev' || i || '@kedevs.dev', crypt('12345678', gen_salt('bf')), v_full, 'DEVELOPER', true, 'ACTIVE', true, now(), now())
        RETURNING id INTO v_user_id;

        INSERT INTO developer_profiles (
            id, user_id, first_name, last_name, bio, current_last_role,
            years_of_experience, availability_status, preferred_work_type,
            location_city, location_country, profile_visibility, is_verified,
            can_employers_reach_out, github_url, linkedin_url, portfolio_url,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_first, v_last, v_bio, v_role,
            (ARRAY['ZERO_TO_ONE','ONE_TO_THREE','THREE_TO_FIVE','FIVE_TO_TEN'])[floor(random()*4+1)],
            (ARRAY['OPEN_TO_OFFERS','NOT_AVAILABLE'])[floor(random()*2+1)],
            (ARRAY['REMOTE','ONSITE','HYBRID'])[floor(random()*3+1)],
            'Nairobi', 'Kenya', 'PUBLIC', random() < 0.3, true,
            'https://github.com/' || lower(v_first) || lower(v_last),
            'https://linkedin.com/in/' || lower(v_first) || lower(v_last),
            'https://' || lower(v_first) || lower(v_last) || '.dev',
            now(), now()
        )
        RETURNING id INTO v_profile_id;

        FOR s IN 1..(3 + floor(random()*4)) LOOP
            v_skill := v_skills[floor(random()*array_length(v_skills,1)+1)];
            INSERT INTO developer_skills (id, developer_id, skill, created_at, updated_at)
            VALUES (gen_random_uuid(), v_profile_id, v_skill, now(), now())
            ON CONFLICT DO NOTHING;
        END LOOP;

        FOR l IN 1..(1 + floor(random()*2)) LOOP
            v_lang := v_languages[floor(random()*array_length(v_languages,1)+1)];
            INSERT INTO developer_languages (id, developer_id, language, created_at, updated_at)
            VALUES (gen_random_uuid(), v_profile_id, v_lang, now(), now())
            ON CONFLICT DO NOTHING;
        END LOOP;

        INSERT INTO developer_education (id, developer_id, institution, qualification, year_completed, field_of_study, start_year, created_at, updated_at)
        VALUES (
            gen_random_uuid(), v_profile_id,
            v_edu_institutions[floor(random()*array_length(v_edu_institutions,1)+1)],
            v_qualifications[floor(random()*array_length(v_qualifications,1)+1)],
            2018 + floor(random()*7), 'Computer Science', 2014 + floor(random()*4),
            now(), now()
        );

        IF random() < 0.6 THEN
            INSERT INTO developer_certifications (id, developer_id, name, issued_by, issued_date, created_at, updated_at)
            VALUES (
                gen_random_uuid(), v_profile_id,
                v_certs[floor(random()*array_length(v_certs,1)+1)],
                'Certification Body',
                (CURRENT_DATE - (random()*365*3)::int),
                now(), now()
            );
        END IF;

        FOR p IN 1..(1 + floor(random()*2)) LOOP
            INSERT INTO developer_projects (id, developer_id, title, description, tech_stack, project_url, repo_url, is_featured, created_at, updated_at)
            VALUES (
                gen_random_uuid(), v_profile_id,
                'Project ' || i || '-' || p,
                'A sample project built with ' || v_skills[floor(random()*array_length(v_skills,1)+1)],
                array_to_string((ARRAY(SELECT unnest(v_skills) ORDER BY random() LIMIT 3)), ','),
                'https://example.com/project' || i || p,
                'https://github.com/' || lower(v_first) || lower(v_last) || '/project' || p,
                random() < 





docker exec -i -e PGPASSWORD="123a456k" kedevs_postgres psql -U moseti -d kedevs_db <<'SQL'
-- =============================================================================
-- KEDevs Jobs Seeder (Peer-Sourced, Personal Developer, and Employer Jobs)
-- =============================================================================

-- ---------- 5 peer-sourced jobs (5 different developers, real external URLs) ----------
DO $$
DECLARE
    dev_ids UUID[];
    peer_urls TEXT[] := ARRAY[
        'https://www.brightermonday.co.ke/listings/software-developer-8m09xr',
        'https://www.brightermonday.co.ke/listings/backend-developer-ev04x4',
        'https://www.linkedin.com/jobs/view/1840919235/',
        'https://www.linkedin.com/jobs/view/java-software-engineer-at-obss-4327940544',
        'https://www.ardentuniverse.com/jobs/junior-java-backend-engineer-zeraki/'
    ];
    peer_titles TEXT[] := ARRAY[
        'Software Developer – Java J2EE (Total Solutions Ltd)',
        'Backend Developer – Insurance Tech (BrighterMonday)',
        'Entry Level Software Engineer – The Jitu (Nyeri, Remote)',
        'Java Software Engineer – OBSS (Nairobi)',
        'Junior Java Backend Engineer – Zeraki (Nairobi)'
    ];
    peer_descs TEXT[] := ARRAY[
        'Total Solutions Ltd is hiring a Software Developer responsible for developing web applications using Java (J2EE), PostgreSQL, and AngularJS. 3 years experience required. Based in Nairobi.',
        'Backend Developer role in Nairobi focused on architecting scalable REST APIs, claims workflow automation, and database optimisation. 5 years experience required in the insurance/healthcare sector.',
        'The Jitu is a software company based in Nyeri, Kenya, hiring entry-level Software Engineers. Ideal for recent graduates in Computer Science. Skills: JavaScript, React, Node.js, AWS, SQL Server.',
        'OBSS is Turkey''s largest technology consultancy hiring a Java Software Engineer in Nairobi. Requires 3+ years Java, Spring Framework, REST APIs, and CI/CD experience. Work on large-scale projects.',
        'Zeraki, a Kenyan edtech company, is hiring a Junior Java EE & Spring Boot Engineer. Requires 2-5 years experience with Java, Spring Boot, PostgreSQL, and microservices. Based in Nairobi.'
    ];
    v_job_id UUID;
    i INT;
BEGIN
    SELECT array_agg(dp.user_id) INTO dev_ids
    FROM developer_profiles dp
    WHERE dp.availability_status = 'OPEN_TO_OFFERS'
    ORDER BY random()
    LIMIT 5;

    FOR i IN 1..5 LOOP
        INSERT INTO job_posts (
            id, posted_by_id, title, description, company_name,
            location_city, location_country, job_type, work_type, experience_level,
            salary_range_min, salary_range_max, salary_currency,
            application_deadline, source_url, is_peer_sourced, visibility, status,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), dev_ids[i],
            peer_titles[i], peer_descs[i], 'Various Companies',
            'Nairobi', 'Kenya',
            (ARRAY['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP'])[1 + floor(random()*4)],
            (ARRAY['REMOTE','ONSITE','HYBRID'])[1 + floor(random()*3)],
            (ARRAY['ENTRY','MID','SENIOR'])[1 + floor(random()*3)],
            null, null, 'KES',
            CURRENT_DATE + (random()*45)::int,
            peer_urls[i], true, 'PUBLIC', 'OPEN',
            now(), now()
        )
        RETURNING id INTO v_job_id;

        INSERT INTO job_tags (id, job_id, tag, created_at, updated_at)
        SELECT gen_random_uuid(), v_job_id, t, now(), now()
        FROM unnest(ARRAY(SELECT unnest(ARRAY['Java','Spring Boot','REST API','SQL','Git','Agile','JavaScript','Docker','Cloud']) ORDER BY random() LIMIT (3+floor(random()*4)))) AS t;
    END LOOP;
END $$;

-- ---------- 10 personal jobs (10 different developers, their own gigs/startups) ----------
DO $$
DECLARE
    dev_ids UUID[];
    personal_titles TEXT[] := ARRAY[
        'Freelance Full‑Stack Developer Available for Hire',
        'Custom Mobile App Development – Android & iOS',
        'Website Builder & UI/UX Designer for Small Businesses',
        'Python Automation & Data Scraping Specialist',
        'Cloud Migration & DevOps Consultant',
        'Affordable E‑commerce Website – Shopify & WordPress',
        'React/Next.js Frontend Developer for Hire',
        'Database Design & Optimisation Services',
        'AI Chatbot & LLM Integration for Kenyan Businesses',
        'Cybersecurity Audit & Penetration Testing'
    ];
    personal_descs TEXT[] := ARRAY[
        'I build complete web applications using React, Node.js, and PostgreSQL. From landing pages to complex dashboards. Available for contract and freelance work. Based in Nairobi.',
        'I develop native and cross‑platform mobile apps using Kotlin, Swift, and Flutter. 3+ years of experience delivering polished mobile experiences for startups and SMEs.',
        'I design and build responsive websites with modern UI/UX. Specialising in Tailwind CSS, Figma, and Next.js. Perfect for small businesses needing an online presence.',
        'I automate repetitive tasks, scrape data from websites, and build data pipelines using Python, BeautifulSoup, Selenium, and Pandas. Quick turnaround.',
        'I help businesses migrate to AWS/Azure, containerise applications with Docker and Kubernetes, and set up CI/CD pipelines. 5 years of DevOps experience.',
        'I set up fully functional online stores using Shopify, WooCommerce, and WordPress. Includes payment gateway integration (M‑Pesa, Stripe) and SEO optimisation.',
        'I build fast, accessible, and SEO‑friendly frontends with React, Next.js, and TypeScript. Portfolio includes dashboards, marketing sites, and SaaS products.',
        'I design normalised database schemas, write complex SQL queries, and optimise slow‑running databases. Experienced with PostgreSQL, MySQL, and MongoDB.',
        'I integrate GPT‑4, Claude, and other LLMs into your business applications. Build chatbots, knowledge bases, and AI‑powered customer support systems.',
        'I perform security audits on web applications, APIs, and networks. Identify vulnerabilities and provide actionable remediation reports. OSCP certified.'
    ];
    v_job_id UUID;
    i INT;
BEGIN
    SELECT array_agg(dp.user_id) INTO dev_ids
    FROM developer_profiles dp
    WHERE dp.user_id NOT IN (
        SELECT posted_by_id FROM job_posts WHERE is_peer_sourced = true
    )
    ORDER BY random()
    LIMIT 10;

    FOR i IN 1..10 LOOP
        INSERT INTO job_posts (
            id, posted_by_id, title, description, company_name,
            location_city, location_country, job_type, work_type, experience_level,
            salary_range_min, salary_range_max, salary_currency,
            application_deadline, source_url, is_peer_sourced, visibility, status,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), dev_ids[i],
            personal_titles[i], personal_descs[i], 'Self‑Employed / Freelance',
            'Nairobi', 'Kenya',
            (ARRAY['FREELANCE','CONTRACT','PART_TIME'])[1 + floor(random()*3)],
            'REMOTE',
            (ARRAY['MID','SENIOR'])[1 + floor(random()*2)],
            (30000 + floor(random()*150000))::numeric,
            (80000 + floor(random()*250000))::numeric, 'KES',
            CURRENT_DATE + (random()*60)::int,
            null, false, 'PUBLIC', 'OPEN',
            now(), now()
        )
        RETURNING id INTO v_job_id;

        INSERT INTO job_tags (id, job_id, tag, created_at, updated_at)
        SELECT gen_random_uuid(), v_job_id, t, now(), now()
        FROM unnest(ARRAY(SELECT unnest(ARRAY['React','Node.js','TypeScript','Python','Kotlin','Flutter','Docker','AWS','PostgreSQL','Figma','Next.js','Shopify','Cybersecurity','AI/ML','GraphQL','Tailwind CSS']) ORDER BY random() LIMIT (3+floor(random()*5)))) AS t;
    END LOOP;
END $$;

-- ---------- Employer jobs (15 employers, 3‑5 jobs each) ----------
DO $$
DECLARE
    emp RECORD;
    job_count INT;
    i INT;
    v_job_id UUID;
    v_title TEXT;
    v_desc TEXT;
    v_tags TEXT[] := ARRAY['JavaScript','TypeScript','Python','Java','Kotlin','Swift','React','Angular','Vue.js','Node.js','Spring Boot','Django','Flask','PostgreSQL','MongoDB','Docker','Kubernetes','AWS','Azure','Git','CI/CD','Agile','Scrum','REST APIs','GraphQL','Machine Learning','DevOps','Linux','Microservices','Redis'];
    v_title_tmpl TEXT[] := ARRAY[
        'Senior %s Developer', 'Junior %s Engineer', 'Lead %s Architect',
        '%s Specialist', 'Full‑Stack %s Developer', '%s DevOps Engineer',
        '%s Data Analyst', '%s UI/UX Designer', '%s Mobile Developer',
        '%s Cloud Engineer', 'Principal %s Engineer', '%s Team Lead'
    ];
    v_techs TEXT[] := ARRAY['Java','Python','React','Node.js','Kotlin','Swift','Angular','Vue.js','Spring Boot','Django','Flask','.NET','Go','Rust','PHP','Ruby'];
    v_locations TEXT[] := ARRAY['Nairobi','Nairobi','Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Nairobi','Nairobi','Nyeri'];
    v_countries TEXT[] := ARRAY['Kenya','Kenya','Kenya','Kenya','Kenya','Kenya','Kenya','Kenya','Kenya','Kenya'];
    v_statuses TEXT[] := ARRAY['OPEN','OPEN','OPEN','OPEN','OPEN','CLOSED'];
    v_desc_tmpl TEXT[] := ARRAY[
        'Join our growing engineering team to build and scale innovative products that serve thousands of customers across Africa. You will work with modern technologies in a collaborative environment.',
        'We are looking for a talented engineer to help us deliver high‑quality software solutions. This role offers the opportunity to work on challenging problems with a supportive team.',
        'Come build the future with us. We need a skilled professional to drive technical excellence and mentor junior team members while delivering critical features.',
        'Our company is expanding and we need someone who can hit the ground running. You''ll own key components of our platform and help shape our technical direction.',
        'We believe in writing clean, maintainable code and investing in our people. Join a team where your contributions make a real difference to our customers.'
    ];
BEGIN
    FOR emp IN SELECT u.id as uid, ep.company_name, ep.location_hq
                FROM users u
                JOIN employer_profiles ep ON ep.user_id = u.id
                WHERE u.role = 'EMPLOYER'
                ORDER BY random()
                LIMIT 15
    LOOP
        job_count := 3 + floor(random() * 3)::int; -- 3 to 5 jobs

        FOR i IN 1..job_count LOOP
            v_title := replace(v_title_tmpl[1 + floor(random()*array_length(v_title_tmpl,1))], '%s', v_techs[1 + floor(random()*array_length(v_techs,1))]);
            v_desc := v_desc_tmpl[1 + floor(random()*array_length(v_desc_tmpl,1))];

            INSERT INTO job_posts (
                id, posted_by_id, title, description, company_name,
                location_city, location_country, job_type, work_type, experience_level,
                salary_range_min, salary_range_max, salary_currency,
                application_deadline, source_url, is_peer_sourced, visibility, status,
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(), emp.uid,
                v_title, v_desc, emp.company_name,
                v_locations[1 + floor(random()*array_length(v_locations,1))],
                'Kenya',
                (ARRAY['FULL_TIME','PART_TIME','CONTRACT','FREELANCE','INTERNSHIP'])[1 + floor(random()*5)],
                (ARRAY['REMOTE','ONSITE','HYBRID'])[1 + floor(random()*3)],
                (ARRAY['ENTRY','MID','SENIOR','LEAD'])[1 + floor(random()*4)],
                (50000 + floor(random()*200000))::numeric,
                (120000 + floor(random()*300000))::numeric, 'KES',
                CURRENT_DATE + (random()*60)::int,
                null, false, 'PUBLIC', v_statuses[1 + floor(random()*array_length(v_statuses,1))],
                now(), now()
            )
            RETURNING id INTO v_job_id;

            INSERT INTO job_tags (id, job_id, tag, created_at, updated_at)
            SELECT gen_random_uuid(), v_job_id, t, now(), now()
            FROM unnest(ARRAY(SELECT unnest(v_tags) ORDER BY random() LIMIT (3+floor(random()*5)))) AS t;
        END LOOP;
    END LOOP;
END $$;

-- Sync upvote counts (if any votes were added via previous seed)
UPDATE job_posts j SET upvote_count = (
    SELECT count(*) FROM job_votes WHERE job_id = j.id AND vote_type = 'UPVOTE'
);

COMMIT;
SQL