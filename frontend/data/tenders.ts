// Realistic tender data for SEO seeding pages
// Matches OCDS structure where possible

export interface SeedTender {
  id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  agency: string;
  closes: string;
  status: 'active' | 'closing-soon' | 'awarded';
  location: string;
  tags: string[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
  seoDescription: string;
  icon: string;
}

export const categories: Category[] = [
  {
    slug: 'government',
    name: 'Government & Public Sector',
    description: 'Federal, state and local government procurement opportunities across all agencies',
    count: 0, // filled below
    seoDescription: 'Browse Australian government tenders and procurement opportunities. Find federal, state and local government contracts across NSW, VIC, QLD, WA, SA, TAS, ACT and NT.',
    icon: '🏛'
  },
  {
    slug: 'ict',
    name: 'ICT & Technology',
    description: 'Software, hardware, cloud services, cybersecurity and digital transformation contracts',
    count: 0,
    seoDescription: 'ICT tenders and technology procurement opportunities in Australia. Software development, cloud services, cybersecurity, IT infrastructure and digital transformation contracts.',
    icon: '💻'
  },
  {
    slug: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Health services, medical equipment, aged care, and health infrastructure projects',
    count: 0,
    seoDescription: 'Healthcare tenders and medical procurement in Australia. Health services, medical equipment, aged care, hospital infrastructure and health technology contracts.',
    icon: '🏥'
  },
  {
    slug: 'construction',
    name: 'Construction & Infrastructure',
    description: 'Building projects, civil works, roads, bridges and infrastructure development',
    count: 0,
    seoDescription: 'Construction tenders and infrastructure procurement in Australia. Building projects, civil works, road construction, bridge and tunnel contracts, and infrastructure development.',
    icon: '🏗'
  },
  {
    slug: 'defence',
    name: 'Defence & Security',
    description: 'Defence contracts, security services, surveillance and defence technology',
    count: 0,
    seoDescription: 'Defence tenders and security procurement in Australia. Defence contracts, security services, surveillance systems, defence technology and national security opportunities.',
    icon: '🛡'
  },
  {
    slug: 'education',
    name: 'Education & Training',
    description: 'Education services, training programs, e-learning and education infrastructure',
    count: 0,
    seoDescription: 'Education tenders and training procurement in Australia. Schools, universities, vocational training, e-learning platforms and education infrastructure contracts.',
    icon: '📚'
  },
  {
    slug: 'transport',
    name: 'Transport & Logistics',
    description: 'Transport services, fleet management, logistics and public transport projects',
    count: 0,
    seoDescription: 'Transport tenders and logistics procurement in Australia. Public transport, fleet management, logistics services, road maintenance and transport infrastructure projects.',
    icon: '🚛'
  },
  {
    slug: 'energy',
    name: 'Energy & Environment',
    description: 'Renewable energy, utilities, environmental services and sustainability projects',
    count: 0,
    seoDescription: 'Energy tenders and environmental procurement in Australia. Renewable energy, solar, wind, battery storage, utilities management and sustainability contracts.',
    icon: '⚡'
  },
  {
    slug: 'consulting',
    name: 'Consulting & Professional Services',
    description: 'Management consulting, legal, financial advisory and professional services contracts',
    count: 0,
    seoDescription: 'Consulting tenders and professional services procurement in Australia. Management consulting, legal services, financial advisory, HR consulting and business strategy contracts.',
    icon: '📋'
  }
];

// Map category slugs to industry keywords for search
export const categoryKeywords: Record<string, string[]> = {
  government: ['government', 'public sector', 'local council', 'state government', 'federal', 'agency', 'municipal'],
  ict: ['ict', 'technology', 'software', 'cybersecurity', 'cloud', 'digital', 'it', 'hardware', 'data', 'ai', 'machine learning', 'telecommunications'],
  healthcare: ['health', 'medical', 'aged care', 'hospital', 'nursing', 'pharmaceutical', 'ambulance', 'mental health', 'disability'],
  construction: ['construction', 'building', 'infrastructure', 'civil', 'road', 'bridge', 'renovation', 'architect', 'engineering'],
  defence: ['defence', 'security', 'military', 'surveillance', 'defence force', 'national security', 'cyber defence'],
  education: ['education', 'training', 'school', 'university', 'tafe', 'vocational', 'elearning', 'curriculum', 'student'],
  transport: ['transport', 'logistics', 'fleet', 'bus', 'rail', 'road maintenance', 'shipping', 'aviation', 'warehouse'],
  energy: ['energy', 'renewable', 'solar', 'wind', 'sustainability', 'environmental', 'water', 'waste', 'emissions'],
  consulting: ['consulting', 'advisory', 'legal', 'financial', 'hr', 'strategy', 'audit', 'risk management', 'compliance']
};

export const seedTenders: Record<string, SeedTender[]> = {
  government: [
    { id: 'CN4892761', title: 'Cybersecurity Assessment and Penetration Testing Services', description: 'Provision of comprehensive cybersecurity assessment, vulnerability scanning, and penetration testing services for critical government infrastructure across New South Wales state agencies.', value: '$2,450,000', agency: 'NSW Department of Customer Service', closes: '31 Jan 2025', status: 'active', location: 'Sydney, NSW', tags: ['cybersecurity', 'government', 'NSW'] },
    { id: 'CN4893122', title: 'Digital Transformation Strategy & Implementation', description: 'End-to-end digital transformation services including legacy system modernisation, cloud migration strategy, and change management for Victorian government departments.', value: '$4,800,000', agency: 'VIC Department of Premier and Cabinet', closes: '15 Feb 2025', status: 'active', location: 'Melbourne, VIC', tags: ['digital', 'transformation', 'Vic'] },
    { id: 'CN4894510', title: 'Community Health Data Platform', description: 'Development and deployment of an integrated community health data analytics platform for regional health service coordination across Queensland.', value: '$1,950,000', agency: 'QLD Department of Health', closes: '28 Feb 2025', status: 'closing-soon', location: 'Brisbane, QLD', tags: ['health', 'data', 'QLD'] },
    { id: 'CN4895012', title: 'Smart City IoT Infrastructure', description: 'Design, supply and installation of IoT sensor network and data aggregation platform for smart city initiatives including traffic, waste and environmental monitoring.', value: '$3,200,000', agency: 'City of Sydney', closes: '10 Mar 2025', status: 'active', location: 'Sydney, NSW', tags: ['smart city', 'IoT', 'infrastructure'] },
    { id: 'CN4895310', title: 'Human Resources Management System', description: 'Implementation of a cloud-based HR management system for workforce planning, payroll, performance management and employee self-service across 15 government agencies.', value: '$6,500,000', agency: 'WA Department of Finance', closes: '22 Mar 2025', status: 'active', location: 'Perth, WA', tags: ['HR', 'cloud', 'WA'] },
    { id: 'CN4895821', title: 'Community Engagement Platform', description: 'Digital platform for community consultation, feedback collection and stakeholder engagement across local government regions.', value: '$890,000', agency: 'Local Government NSW', closes: '18 Jan 2025', status: 'closing-soon', location: 'Various, NSW', tags: ['community', 'digital', 'engagement'] },
    { id: 'CN4896100', title: 'Data Centre Migration Services', description: 'Migration of on-premise government data centres to hybrid cloud infrastructure including network design, security hardening and disaster recovery planning.', value: '$5,100,000', agency: 'ACT Government', closes: '5 Apr 2025', status: 'active', location: 'Canberra, ACT', tags: ['data centre', 'cloud', 'ACT'] },
    { id: 'CN4896505', title: 'Emergency Alert System Upgrade', description: 'Modernisation of the national emergency alert and warning system to support geo-targeted mobile alerts, multilingual notifications and integration with state emergency services.', value: '$8,200,000', agency: 'Australian Government - Home Affairs', closes: '30 Apr 2025', status: 'active', location: 'Canberra, ACT', tags: ['emergency', 'alert', 'national'] },
  ],
  ict: [
    { id: 'CN4898210', title: 'Enterprise AI/ML Platform', description: 'Design and implementation of an enterprise-grade AI/ML platform for predictive analytics, natural language processing and computer vision capabilities.', value: '$3,750,000', agency: 'Services Australia', closes: '14 Feb 2025', status: 'active', location: 'Canberra, ACT', tags: ['AI', 'ML', 'platform'] },
    { id: 'CN4898601', title: 'Cloud Security Posture Management', description: 'CSPM solution for continuous cloud security monitoring, compliance automation and threat detection across multi-cloud (AWS, Azure, GCP) environments.', value: '$1,800,000', agency: 'ATO', closes: '21 Mar 2025', status: 'active', location: 'Melbourne, VIC', tags: ['cloud', 'security', 'CSPM'] },
    { id: 'CN4899102', title: 'Government Service Delivery Portal', description: 'Development of a unified citizen service delivery portal with identity verification, document management and case tracking for birth certificates, licences and permits.', value: '$2,950,000', agency: 'Service NSW', closes: '7 Feb 2025', status: 'closing-soon', location: 'Sydney, NSW', tags: ['portal', 'government', 'services'] },
    { id: 'CN4899500', title: 'Enterprise Data Lake & Analytics Platform', description: 'Implementation of a scalable data lake architecture with real-time analytics, BI dashboards and self-service data access for 500+ users across the department.', value: '$4,200,000', agency: 'Department of Industry', closes: '15 Apr 2025', status: 'active', location: 'Canberra, ACT', tags: ['data', 'analytics', 'enterprise'] },
    { id: 'CN4899821', title: 'Network Infrastructure Refresh', description: 'Complete network infrastructure upgrade including SD-WAN implementation, next-gen firewall deployment, Wi-Fi 6E rollout and network operations centre setup.', value: '$6,800,000', agency: 'VIC Department of Education', closes: '30 May 2025', status: 'active', location: 'Melbourne, VIC', tags: ['network', 'infrastructure', 'refresh'] },
    { id: 'CN4900105', title: 'API Management Platform', description: 'Enterprise API management platform for government service integration, including API gateway, developer portal, analytics and security policy enforcement.', value: '$1,200,000', agency: 'DTA (Digital Transformation Agency)', closes: '28 Mar 2025', status: 'active', location: 'Canberra, ACT', tags: ['API', 'integration', 'DTA'] },
  ],
  healthcare: [
    { id: 'CN4901050', title: 'Electronic Medical Records (EMR) System', description: 'State-wide electronic medical records system implementation across 25 public hospitals including interoperability with existing GP and pharmacy systems.', value: '$12,500,000', agency: 'QLD Health', closes: '28 Feb 2025', status: 'closing-soon', location: 'Brisbane, QLD', tags: ['EMR', 'health', 'hospital'] },
    { id: 'CN4901410', title: 'Telehealth Platform Expansion', description: 'Expansion of existing telehealth platform to support remote patient monitoring, virtual consultations and integrated diagnostics for regional and remote communities.', value: '$3,400,000', agency: 'WA Country Health Service', closes: '15 Mar 2025', status: 'active', location: 'Perth, WA', tags: ['telehealth', 'regional', 'remote'] },
    { id: 'CN4901820', title: 'Medical Imaging AI Solution', description: 'AI-powered medical imaging analysis platform for radiology departments, supporting detection and diagnosis across X-ray, MRI and CT modalities.', value: '$2,100,000', agency: 'NSW Health Pathology', closes: '10 Apr 2025', status: 'active', location: 'Sydney, NSW', tags: ['AI', 'medical imaging', 'radiology'] },
    { id: 'CN4902210', title: 'Hospital Asset Management System', description: 'IoT-based asset tracking and management system for medical equipment, beds, and supplies across major metropolitan hospitals.', value: '$1,750,000', agency: 'Melbourne Health', closes: '5 May 2025', status: 'active', location: 'Melbourne, VIC', tags: ['IoT', 'asset', 'hospital'] },
  ],
  construction: [
    { id: 'CN4903510', title: 'Major Road Upgrade — Pacific Highway Section', description: 'Design and construction of 12km highway upgrade including bridge widening, intersection improvements, noise barriers and cycling infrastructure.', value: '$85,000,000', agency: 'Transport for NSW', closes: '30 Jun 2025', status: 'active', location: 'Coffs Harbour, NSW', tags: ['road', 'highway', 'NSW'] },
    { id: 'CN4903902', title: 'Regional Hospital Redevelopment', description: 'Design and construction of a new 150-bed regional hospital with emergency department, surgical suites, maternity ward and mental health unit.', value: '$220,000,000', agency: 'VIC Health Infrastructure', closes: '15 Sep 2025', status: 'active', location: 'Geelong, VIC', tags: ['hospital', 'construction', 'regional'] },
    { id: 'CN4904210', title: 'Public Housing Development — Stage 3', description: 'Construction of 250 new social and affordable housing dwellings including community spaces, landscaping and sustainable building features.', value: '$95,000,000', agency: 'Housing NSW', closes: '1 Aug 2025', status: 'active', location: 'Parramatta, NSW', tags: ['housing', 'construction', 'social'] },
    { id: 'CN4904710', title: 'Bridge Replacement Program', description: 'Replacement of 5 ageing bridges on key regional freight routes with modern concrete structures designed for higher load limits and flood resilience.', value: '$45,000,000', agency: 'QLD Department of Transport', closes: '15 Jul 2025', status: 'active', location: 'Various, QLD', tags: ['bridge', 'infrastructure', 'QLD'] },
  ],
  defence: [
    { id: 'CN4906010', title: 'Secure Communications System', description: 'Design and delivery of a hardened military-grade secure communications system for deployed forces with satellite backhaul and mesh networking capabilities.', value: '$45,000,000', agency: 'Department of Defence', closes: '30 Jun 2025', status: 'active', location: 'Canberra, ACT', tags: ['communications', 'defence', 'military'] },
    { id: 'CN4906410', title: 'Cyber Threat Intelligence Platform', description: 'Advanced cyber threat intelligence platform with automated threat detection, SOC integration and cross-government information sharing capabilities.', value: '$8,500,000', agency: 'Australian Signals Directorate', closes: '15 May 2025', status: 'active', location: 'Canberra, ACT', tags: ['cyber', 'intelligence', 'defence'] },
    { id: 'CN4906820', title: 'Unmanned Surveillance Systems', description: 'Supply and support of maritime surveillance drones for coastal border protection including training, maintenance and data analysis pipeline.', value: '$32,000,000', agency: 'Australian Border Force', closes: '20 Aug 2025', status: 'active', location: 'Canberra, ACT', tags: ['drones', 'surveillance', 'maritime'] },
  ],
  education: [
    { id: 'CN4908100', title: 'School Digital Infrastructure Program', description: 'Upgrade of digital infrastructure across 200+ public schools including high-speed broadband, campus Wi-Fi, device management and cybersecurity baseline implementation.', value: '$15,000,000', agency: 'NSW Department of Education', closes: '15 Apr 2025', status: 'active', location: 'Various, NSW', tags: ['schools', 'digital', 'NSW'] },
    { id: 'CN4908510', title: 'Online Learning Management System', description: 'Implementation of a unified learning management system for TAFE and vocational training providers supporting competency-based assessment and micro-credentialing.', value: '$4,200,000', agency: 'TAFE NSW', closes: '30 Mar 2025', status: 'active', location: 'Sydney, NSW', tags: ['LMS', 'TAFE', 'education'] },
    { id: 'CN4908910', title: 'Student Wellbeing Platform', description: 'Digital platform for student mental health and wellbeing support including counselling booking, self-assessment tools and crisis intervention integration.', value: '$980,000', agency: 'VIC Department of Education', closes: '10 May 2025', status: 'active', location: 'Melbourne, VIC', tags: ['wellbeing', 'mental health', 'VIC'] },
  ],
  transport: [
    { id: 'CN4910210', title: 'Smart Ticketing System — Regional Rail', description: 'Implementation of contactless smart ticketing across regional rail networks including account-based ticketing, fare compliance and real-time passenger information.', value: '$28,000,000', agency: 'Transport for NSW', closes: '30 Apr 2025', status: 'active', location: 'Various, NSW', tags: ['ticketing', 'rail', 'regional'] },
    { id: 'CN4910610', title: 'Electric Bus Fleet Procurement', description: 'Supply of 100 electric buses with charging infrastructure, depot upgrades and 5-year maintenance agreement for zero-emission public transport transition.', value: '$65,000,000', agency: 'Transit Australia', closes: '15 Aug 2025', status: 'active', location: 'Brisbane, QLD', tags: ['electric', 'buses', 'transport'] },
    { id: 'CN4911010', title: 'Intelligent Transport System', description: 'AI-powered traffic management system including adaptive traffic signals, incident detection and corridor optimisation for major metropolitan road network.', value: '$12,500,000', agency: 'VicRoads', closes: '30 Jun 2025', status: 'active', location: 'Melbourne, VIC', tags: ['traffic', 'AI', 'VicRoads'] },
  ],
  energy: [
    { id: 'CN4912110', title: 'Solar Farm Development — Regional NSW', description: 'Design, construction and 20-year operation of a 100MW solar farm with battery storage, grid connection and community benefit scheme.', value: '$180,000,000', agency: 'NSW Energy Corporation', closes: '30 Sep 2025', status: 'active', location: 'Dubbo, NSW', tags: ['solar', 'renewable', 'NSW'] },
    { id: 'CN4912510', title: 'Smart Meter Rollout — Phase 4', description: 'Supply and installation of 500,000 smart electricity meters including communications module, data platform integration and consumer portal.', value: '$55,000,000', agency: 'Ausgrid', closes: '15 Jul 2025', status: 'active', location: 'Sydney, NSW', tags: ['smart meter', 'energy', 'Ausgrid'] },
    { id: 'CN4912910', title: 'Waste-to-Energy Facility', description: 'Design and construction of a waste-to-energy processing facility processing 250,000 tonnes/year with emissions capture and district heating integration.', value: '$320,000,000', agency: 'Sustainability Victoria', closes: '30 Nov 2025', status: 'active', location: 'Melbourne, VIC', tags: ['waste', 'energy', 'sustainability'] },
  ],
  consulting: [
    { id: 'CN4914100', title: 'Organisational Change Management', description: 'Change management services for a major government digital transformation program spanning 5 departments, 3,000+ staff and 18-month implementation timeline.', value: '$2,800,000', agency: 'Department of Finance', closes: '14 Mar 2025', status: 'active', location: 'Canberra, ACT', tags: ['change management', 'consulting', 'Finance'] },
    { id: 'CN4914510', title: 'Procurement Process Optimisation', description: 'Strategic review and optimisation of procurement processes including category management strategy, supplier relationship framework and technology recommendation.', value: '$1,200,000', agency: 'QLD Government', closes: '28 Apr 2025', status: 'active', location: 'Brisbane, QLD', tags: ['procurement', 'optimisation', 'QLD'] },
    { id: 'CN4914910', title: 'Financial Modelling & Audit Services', description: 'Financial modelling, independent audit and assurance services for infrastructure projects over $50M including cost-benefit analysis and risk assessment.', value: '$950,000', agency: 'NSW Treasury', closes: '15 Jun 2025', status: 'active', location: 'Sydney, NSW', tags: ['financial', 'audit', 'NSW'] },
  ]
};

// Fill category counts
categories.forEach(cat => {
  cat.count = (seedTenders[cat.slug] || []).length;
});

export const allTenders = Object.values(seedTenders).flat();