// Non-interactive database setup for Render
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[DB SETUP] DATABASE_URL not set!");
  process.exit(1);
}

async function setup() {
  console.log("[DB SETUP] Starting database setup...");
  console.log("[DB SETUP] DATABASE_URL is set:", !!DATABASE_URL);

  const conn = await mysql.createConnection({ uri: DATABASE_URL, connectTimeout: 10000 });
  console.log("[DB SETUP] Connected to MySQL");

  // Create all tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      unionId VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      email VARCHAR(320),
      avatar TEXT,
      role ENUM('admin','manager','sales','support') DEFAULT 'sales' NOT NULL,
      phone VARCHAR(50),
      department VARCHAR(100),
      isActive BOOLEAN DEFAULT true NOT NULL,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW(),
      lastSignInAt TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS local_users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      email VARCHAR(320),
      role ENUM('admin','manager','sales','support') DEFAULT 'sales' NOT NULL,
      phone VARCHAR(50),
      department VARCHAR(100),
      isActive BOOLEAN DEFAULT true NOT NULL,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(200),
      jobTitle VARCHAR(200),
      status ENUM('lead','prospect','customer','churned') DEFAULT 'lead' NOT NULL,
      source ENUM('website','referral','social','cold_call','event','other') DEFAULT 'other' NOT NULL,
      score INT DEFAULT 0 NOT NULL,
      assignedTo BIGINT UNSIGNED,
      lastActivityAt TIMESTAMP,
      notes TEXT,
      address TEXT,
      city VARCHAR(100),
      country VARCHAR(100) DEFAULT 'South Africa',
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS deals (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      contactId BIGINT UNSIGNED,
      company VARCHAR(200),
      value DECIMAL(12,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'ZAR' NOT NULL,
      stage ENUM('new','qualified','proposal','negotiation','won','lost') DEFAULT 'new' NOT NULL,
      probability INT DEFAULT 0 NOT NULL,
      expectedCloseDate DATE,
      actualCloseDate DATE,
      description TEXT,
      assignedTo BIGINT UNSIGNED,
      source VARCHAR(100),
      competitor VARCHAR(200),
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS activities (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      type ENUM('call','email','meeting','note','task','sms') NOT NULL,
      contactId BIGINT UNSIGNED,
      dealId BIGINT UNSIGNED,
      userId BIGINT UNSIGNED NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      dueDate TIMESTAMP,
      completedAt TIMESTAMP,
      status ENUM('pending','completed','overdue','cancelled') DEFAULT 'pending' NOT NULL,
      duration INT,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      projectCode VARCHAR(20) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      clientId BIGINT UNSIGNED,
      description TEXT,
      services JSON,
      status ENUM('planning','in_progress','on_hold','completed','cancelled') DEFAULT 'planning' NOT NULL,
      startDate DATE,
      endDate DATE,
      budget DECIMAL(12,2),
      actualCost DECIMAL(12,2) DEFAULT 0 NOT NULL,
      revenue DECIMAL(12,2),
      received DECIMAL(12,2) DEFAULT 0 NOT NULL,
      outstanding DECIMAL(12,2) DEFAULT 0 NOT NULL,
      assignedTo BIGINT UNSIGNED,
      priority ENUM('low','medium','high','urgent') DEFAULT 'medium' NOT NULL,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status ENUM('todo','in_progress','review','done') DEFAULT 'todo' NOT NULL,
      priority ENUM('low','medium','high','urgent') DEFAULT 'medium' NOT NULL,
      assignedTo BIGINT UNSIGNED,
      contactId BIGINT UNSIGNED,
      dealId BIGINT UNSIGNED,
      projectId BIGINT UNSIGNED,
      dueDate TIMESTAMP,
      completedAt TIMESTAMP,
      createdBy BIGINT UNSIGNED NOT NULL,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category ENUM('web_dev','graphic_design','business_doc','tech_services','creative','admin','consultation','ai_automation','crm','data_analytics','marketing') NOT NULL,
      description TEXT,
      priceMin DECIMAL(10,2),
      priceMax DECIMAL(10,2),
      pricingUnit ENUM('per_hour','per_project','per_month','fixed') DEFAULT 'per_project' NOT NULL,
      isActive BOOLEAN DEFAULT true NOT NULL,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ai_conversations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNSIGNED NOT NULL,
      title VARCHAR(255) NOT NULL,
      messages JSON,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
      updatedAt TIMESTAMP DEFAULT NOW() NOT NULL ON UPDATE NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS email_templates (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      body TEXT NOT NULL,
      category ENUM('welcome','follow_up','proposal','invoice','reminder','custom') DEFAULT 'custom' NOT NULL,
      createdBy BIGINT UNSIGNED,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      senderId BIGINT UNSIGNED NOT NULL,
      senderName VARCHAR(255) NOT NULL,
      recipientId BIGINT UNSIGNED NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      isRead BOOLEAN DEFAULT false NOT NULL,
      parentId BIGINT UNSIGNED,
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNSIGNED,
      action VARCHAR(100) NOT NULL,
      entityType VARCHAR(50) NOT NULL,
      entityId BIGINT UNSIGNED,
      oldValues JSON,
      newValues JSON,
      ipAddress VARCHAR(45),
      createdAt TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
  ];

  for (const sql of tables) {
    try {
      await conn.query(sql);
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      console.log(`[DB SETUP] Table '${tableName}' OK`);
    } catch (e: any) {
      console.error(`[DB SETUP] Table error:`, e.message);
    }
  }

  // Check if admin1 exists
  const [admins] = await conn.query("SELECT id FROM local_users WHERE username = ?", ["admin1"]);
  if ((admins as any[]).length === 0) {
    const hash1 = bcrypt.hashSync("admin123", 10);
    await conn.query(
      "INSERT INTO local_users (username, passwordHash, name, email, role, department, isActive) VALUES (?,?,?,?,?,?,?)",
      ["admin1", hash1, "Daniel Menji", "daniel@omegaelz.co.za", "admin", "Management", true]
    );
    console.log("[DB SETUP] Created admin1 (daniel / admin123)");

    const hash2 = bcrypt.hashSync("admin456", 10);
    await conn.query(
      "INSERT INTO local_users (username, passwordHash, name, email, role, department, isActive) VALUES (?,?,?,?,?,?,?)",
      ["admin2", hash2, "Temosho", "temosho@omegaelz.co.za", "admin", "Management", true]
    );
    console.log("[DB SETUP] Created admin2 (temosho / admin456)");
  } else {
    console.log("[DB SETUP] Admin accounts already exist");
  }

  // Seed sample messages
  const [msgCount] = await conn.query("SELECT COUNT(*) as c FROM messages");
  if ((msgCount as any[])[0].c == 0) {
    const [a1] = await conn.query("SELECT id FROM local_users WHERE username = ?", ["admin1"]);
    const [a2] = await conn.query("SELECT id FROM local_users WHERE username = ?", ["admin2"]);
    if ((a1 as any[]).length > 0 && (a2 as any[]).length > 0) {
      const id1 = (a1 as any[])[0].id;
      const id2 = (a2 as any[])[0].id;
      await conn.query(
        "INSERT INTO messages (senderId, senderName, recipientId, subject, body, isRead) VALUES (?,?,?,?,?,?)",
        [id1, "Daniel Menji", id2, "Welcome to OmegaElz CRM", "Hi Temosho,\n\nThe CRM is now live! We can use this to manage all our clients, projects, and deals. Let me know if you need any help getting started.\n\n- Daniel", false]
      );
      await conn.query(
        "INSERT INTO messages (senderId, senderName, recipientId, subject, body, isRead) VALUES (?,?,?,?,?,?)",
        [id2, "Temosho", id1, "RE: Welcome to OmegaElz CRM", "Hi Daniel,\n\nThanks for setting this up! It looks great. I will start adding our active deals and updating the pipeline.\n\n- Temosho", false]
      );
      console.log("[DB SETUP] Sample messages created");
    }
  }

  // Seed contacts if empty
  const [contactCount] = await conn.query("SELECT COUNT(*) as c FROM contacts");
  if ((contactCount as any[])[0].c == 0) {
    const contactsData = [
      ["SABSA","Representative","info@sabsa.co.za","+27 11 123 4567","SABSA","IT Manager","customer","referral",85,null,"Johannesburg","South Africa","Website development, business email, social media management"],
      ["Lizorah","Brand Manager","contact@lizorah.com","+27 82 345 6789","Lizorah Brand","Brand Director","customer","website",72,null,"Pretoria","South Africa","Website development, business registration, social media"],
      ["Thabo","Chibuwe","thabo@chibuwec.co.za","+27 71 456 7890","Chibuwe Construction","Owner","customer","cold_call",90,null,"Johannesburg","South Africa","Website development, domain hosting, business email"],
      ["Beast","Initiatives","info@beastinitiatives.com","+27 63 567 8901","BeastInitiatives","Founder","customer","social",95,null,"Cape Town","South Africa","Website design, operational strategy, digital consultation"],
      ["Sarah","Mokoena","sarah@techstart.co.za","+27 72 678 9012","TechStart SA","CEO","lead","event",45,null,"Durban","South Africa","Interested in AI automation package"],
      ["David","van der Merwe","david@vanderconsulting.co.za","+27 83 789 0123","Van der Merwe Consulting","Managing Director","prospect","referral",68,null,"Pretoria","South Africa","CRM implementation and business documentation"],
      ["Nomsa","Dlamini","nomsa@dlaminidesigns.co.za","+27 64 890 1234","Dlamini Designs","Creative Director","lead","social",38,null,"Johannesburg","South Africa","Graphic design agency looking for web dev partnership"],
      ["Peter","Okafor","peter@globaltrade.ng","+234 80 901 2345","Global Trade Nigeria","Operations Manager","lead","website",55,null,"Lagos","Nigeria","Business documentation and company registration"],
      ["Anne-Marie","du Preez","am@dupreezlegal.co.za","+27 71 012 3456","Du Preez Legal","Partner","prospect","referral",78,null,"Cape Town","South Africa","Law firm needing IT support and cloud migration"],
      ["Kabelo","Mashaba","kabelo@mashabafitness.co.za","+27 82 123 4567","Mashaba Fitness","Owner","lead","cold_call",30,null,"Bloemfontein","South Africa","Fitness brand startup needing logo, website, social media"],
    ];
    for (const c of contactsData) {
      await conn.query("INSERT INTO contacts (firstName,lastName,email,phone,company,jobTitle,status,source,score,assignedTo,city,country,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", c);
    }
    console.log("[DB SETUP] 10 contacts seeded");
  }

  // Seed deals if empty
  const [dealCount] = await conn.query("SELECT COUNT(*) as c FROM deals");
  if ((dealCount as any[])[0].c == 0) {
    const dealsData = [
      ["SABSA Website & Digital Package",1,"SABSA",4050.00,"ZAR","negotiation",85,"2026-06-15",null,"Website development, business email, social media, domain, hosting",null],
      ["Lizorah Brand Digital Transformation",2,"Lizorah Brand",3000.00,"ZAR","proposal",60,"2026-07-01",null,"Website development, business registration, social media",null],
      ["Chibuwe Construction Web Package",3,"Chibuwe Construction",1050.00,"ZAR","won",100,"2026-05-30","2026-05-29","Website development, domain hosting, business email",null],
      ["BeastInitiatives Global Strategy",4,"BeastInitiatives",11069.73,"ZAR","won",100,"2026-05-15","2026-05-10","Website design, operational strategy, digital consultation",null],
      ["TechStart AI Automation Package",5,"TechStart SA",8500.00,"ZAR","qualified",40,"2026-07-30",null,"AI chatbot, workflow automation, email management, CRM setup",null],
      ["Van der Merwe CRM Implementation",6,"Van der Merwe Consulting",12500.00,"ZAR","proposal",55,"2026-08-15",null,"CRM system implementation, business documentation, workflow automation",null],
      ["Dlamini Design Partnership",7,"Dlamini Designs",4500.00,"ZAR","new",25,"2026-09-01",null,"Web development partnership for design clients",null],
      ["Global Trade Business Setup",8,"Global Trade Nigeria",7500.00,"ZAR","qualified",45,"2026-08-30",null,"Company registration, business documentation, compliance",null],
      ["Du Preez Legal IT Migration",9,"Du Preez Legal",18000.00,"ZAR","proposal",70,"2026-07-20",null,"IT support, cloud migration, network setup, security",null],
      ["Mashaba Fitness Startup Package",10,"Mashaba Fitness",2800.00,"ZAR","new",20,"2026-09-15",null,"Logo design, website, social media management",null],
    ];
    for (const d of dealsData) {
      await conn.query("INSERT INTO deals (title,contactId,company,value,currency,stage,probability,expectedCloseDate,actualCloseDate,description,assignedTo) VALUES (?,?,?,?,?,?,?,?,?,?,?)", d);
    }
    console.log("[DB SETUP] 10 deals seeded");
  }

  // Seed projects if empty
  const [projectCount] = await conn.query("SELECT COUNT(*) as c FROM projects");
  if ((projectCount as any[])[0].c == 0) {
    await conn.query(`INSERT INTO projects (projectCode,title,clientId,description,services,status,startDate,endDate,budget,revenue,received,outstanding,priority) VALUES
      ('OE001','SABSA Digital Presence',1,'Complete digital transformation','["Website Development","Business Email","Social Media Management","Domain Registration","Hosting"]','in_progress','2026-05-04','2026-06-07',4500.00,4050.00,3500.00,550.00,'high'),
      ('OE002','Lizorah Brand Launch',2,'Brand development and digital launch','["Website Development","Business Registration","Social Media Creation","Social Media Optimization"]','in_progress','2026-02-06','2026-07-15',3500.00,3000.00,0.00,3000.00,'medium'),
      ('OE003','Chibuwe Construction Web Setup',3,'Rapid website deployment','["Website Development","Domain Hosting","Business Email","Social Media Creation"]','completed','2026-05-28','2026-05-29',1200.00,1050.00,1050.00,0.00,'high'),
      ('OE004','BeastInitiatives Global Strategy',4,'International client strategy','["Website Design","Operational Strategy","Digital Business Consultation"]','completed','2026-03-01','2026-05-10',12000.00,11069.73,11069.73,0.00,'urgent'),
      ('OE005','TechStart AI Integration',5,'AI automation implementation','["AI Chatbot","Workflow Automation","AI Email Management","Basic CRM Setup"]','planning','2026-07-01','2026-08-30',10000.00,8500.00,0.00,8500.00,'medium'),
      ('OE006','Van der Merwe Digital Office',6,'Complete digital office setup','["CRM Implementation","Business Documentation","Workflow Automation","Cloud Solutions"]','planning','2026-07-15','2026-09-30',15000.00,12500.00,0.00,12500.00,'high')`);
    console.log("[DB SETUP] 6 projects seeded");
  }

  // Seed tasks if empty
  const [taskCount] = await conn.query("SELECT COUNT(*) as c FROM tasks");
  if ((taskCount as any[])[0].c == 0) {
    await conn.query(`INSERT INTO tasks (title,description,status,priority,dueDate,contactId,projectId,createdBy) VALUES
      ('Complete SABSA website homepage','Finalize the homepage layout and responsive design','in_progress','high','2026-06-05 00:00:00',1,1,1),
      ('Setup business email for SABSA','Configure Google Workspace email accounts','todo','medium','2026-06-06 00:00:00',1,1,1),
      ('Lizorah brand identity review','Review and finalize brand guidelines','todo','medium','2026-06-10 00:00:00',2,2,1),
      ('Submit business registration docs','Complete CIPC registration process','todo','high','2026-06-15 00:00:00',2,2,1),
      ('Follow up with TechStart AI proposal','Send detailed AI automation proposal','todo','high','2026-06-08 00:00:00',5,null,1),
      ('Prepare CRM demo for Van der Merwe','Create personalized CRM demonstration','todo','medium','2026-06-12 00:00:00',6,null,1),
      ('Design Mashaba Fitness logo concepts','Create 3-5 logo design concepts','todo','low','2026-06-20 00:00:00',10,null,1),
      ('Du Preez Legal IT assessment','On-site IT infrastructure assessment','todo','high','2026-06-10 00:00:00',9,null,1),
      ('Monthly social media content for SABSA','Create and schedule June social media posts','review','medium','2026-06-07 00:00:00',1,1,1),
      ('Update OmegaElz service catalog','Add new AI services to the catalog','done','low','2026-06-01 00:00:00',null,null,1),
      ('Send invoice for Chibuwe project','Issue final invoice for completed work','done','medium','2026-05-30 00:00:00',3,3,1),
      ('BeastInitiatives project handover','Complete project documentation and handover','done','high','2026-05-12 00:00:00',4,4,1)`);
    console.log("[DB SETUP] 12 tasks seeded");
  }

  // Seed services if empty
  const [svcCount] = await conn.query("SELECT COUNT(*) as c FROM services");
  if ((svcCount as any[])[0].c == 0) {
    const svcs = [
      ['Website Design (Basic)','web_dev','3-5 page responsive website with basic SEO',1500.00,3500.00,'per_project'],
      ['Website Design (Advanced)','web_dev','5-10 page website with advanced features',3500.00,7000.00,'per_project'],
      ['E-commerce Development','web_dev','Full online store with payment integration',6000.00,15000.00,'per_project'],
      ['Logo Design','graphic_design','Professional logo with 3-5 concepts',500.00,1200.00,'fixed'],
      ['Brand Identity Package','graphic_design','Complete branding solution',6000.00,18000.00,'per_project'],
      ['Social Media Management','marketing','Content creation and platform management',1500.00,3500.00,'per_month'],
      ['Company Registration','business_doc','CIPC company registration and incorporation',1750.00,3500.00,'fixed'],
      ['Business Plan Development','business_doc','Comprehensive business plan with financials',800.00,2500.00,'per_project'],
      ['IT Support','tech_services','Remote technical support and troubleshooting',120.00,250.00,'per_hour'],
      ['Network Setup','tech_services','Office network infrastructure setup',2500.00,8000.00,'per_project'],
      ['Cloud Migration','tech_services','Data and systems migration to cloud',8000.00,18000.00,'per_project'],
      ['Video Editing','creative','Professional video editing services',300.00,800.00,'per_hour'],
      ['Virtual Assistant','admin','Remote administrative support',120.00,300.00,'per_hour'],
      ['Business Consultation','consultation','Strategic business planning and advice',500.00,1200.00,'per_hour'],
      ['AI Chatbot Development','ai_automation','Custom AI chatbot for customer engagement',7500.00,75000.00,'per_project'],
      ['Workflow Automation','ai_automation','Business process automation setup',3500.00,15000.00,'per_project'],
      ['CRM Implementation','crm','CRM system setup and configuration',5500.00,25000.00,'per_project'],
      ['Data Analytics Setup','data_analytics','Business intelligence and analytics dashboard',10000.00,45000.00,'per_project'],
      ['AI Content Generation','ai_automation','AI-powered content creation',2500.00,8000.00,'per_month'],
      ['SEO Optimization','marketing','Search engine optimization services',5000.00,18000.00,'per_month'],
    ];
    for (const s of svcs) {
      await conn.query("INSERT INTO services (name,category,description,priceMin,priceMax,pricingUnit) VALUES (?,?,?,?,?,?)", s);
    }
    console.log("[DB SETUP] 20 services seeded");
  }

  // Seed activities if empty
  const [actCount] = await conn.query("SELECT COUNT(*) as c FROM activities");
  if ((actCount as any[])[0].c == 0) {
    await conn.query(`INSERT INTO activities (type,contactId,dealId,userId,title,description,status,duration) VALUES
      ('email',1,1,1,'Sent website mockup to SABSA','Shared Figma designs for review','completed',null),
      ('call',2,2,1,'Discovery call with Lizorah Brand','Discussed brand requirements and timeline','completed',45),
      ('meeting',5,5,1,'AI demo for TechStart','Presented AI automation capabilities','completed',60),
      ('note',9,9,1,'Du Preez requirements gathered','IT infrastructure needs documented','completed',null),
      ('task',6,6,1,'Send CRM proposal to Van der Merwe','Include pricing and implementation timeline','pending',null),
      ('email',3,null,1,'Chibuwe project completion email','Sent final deliverables and login credentials','completed',null),
      ('call',8,8,1,'Follow-up with Global Trade Nigeria','Discussed documentation requirements','completed',30),
      ('meeting',4,null,1,'BeastInitiatives strategy session','Final review of operational strategy document','completed',90)`);
    console.log("[DB SETUP] 8 activities seeded");
  }

  await conn.end();
  console.log("[DB SETUP] COMPLETE - All tables and data ready!");
}

setup().catch((e) => {
  console.error("[DB SETUP] FATAL:", e.message);
  process.exit(1);
});
