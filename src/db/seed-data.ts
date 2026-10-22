// Demonstration content. Replace or delete it from the admin area once real
// photos, stories and programmes are available.
const d = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

export const MEDIA_SEED = [
  {
    title: "131st Annual Commencement Valedictory Cap Toss",
    eventName: "Commencement & Honors Convocation",
    category: "Commencement & Traditions",
    kind: "image",
    externalUrl:
      "https://images.pexels.com/photos/28896831/pexels-photo-28896831.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    externalThumbUrl:
      "https://images.pexels.com/photos/28896831/pexels-photo-28896831.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption:
      "Seniors of the Class of 2025 celebrate on Founders' Lawn in their Oxford Navy and Imperial Gold regalia following the conferring of diplomas.",
    eventDate: "2025-05-29",
    location: "Founders' Great Lawn",
    uploadedBy: "Communications Office",
    durationSeconds: null,
    featured: true,
  },
  {
    title: "Bodleian Hall Seminar & Archival Research Session (Short Film)",
    eventName: "Humanities & Fellows Symposium",
    category: "Academics & STEM",
    kind: "video",
    externalUrl:
      "https://videos.pexels.com/video-files/5940171/5940171-uhd_3840_2160_25fps.mp4",
    externalThumbUrl:
      "https://images.pexels.com/videos/5940171/pexels-photo-5940171.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    caption:
      "Short video highlight of Upper School Senior Fellows discussing primary historical manuscripts with faculty mentors inside the Sterling Library.",
    eventDate: "2026-02-18",
    location: "Sterling Memorial Library",
    uploadedBy: "Communications Office",
    durationSeconds: 13,
    featured: true,
  },
  {
    title: "Annual Molecular Biology & Robotics Innovation Expo",
    eventName: "Spring STEM Research Colloquium",
    category: "Academics & STEM",
    kind: "image",
    externalUrl:
      "https://images.pexels.com/photos/33992840/pexels-photo-33992840.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    externalThumbUrl:
      "https://images.pexels.com/photos/33992840/pexels-photo-33992840.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption:
      "Upper School engineering scholars test autonomous circuit prototypes during the regional Science & Robotics Invitational.",
    eventDate: "2026-03-04",
    location: "Cavendish Science Pavilion",
    uploadedBy: "Communications Office",
    durationSeconds: null,
    featured: true,
  },
  {
    title: "Autumn Morning Across the Historic Quadrangle (Campus Reel)",
    eventName: "Founders' Day Convocation",
    category: "Campus Life",
    kind: "video",
    externalUrl:
      "https://videos.pexels.com/video-files/30614764/13110064_1920_1080_25fps.mp4",
    externalThumbUrl:
      "https://images.pexels.com/videos/30614764/architecture-books-building-campus-30614764.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    caption:
      "Short video reel capturing students arriving at the Classical Portico prior to the morning Founders' Day bell ringing.",
    eventDate: "2025-10-14",
    location: "Heritage North Portico",
    uploadedBy: "Communications Office",
    durationSeconds: 14,
    featured: true,
  },
  {
    title: "Lower School Microscopy & Natural Sciences Discovery Day",
    eventName: "Junior Scientists Workshop",
    category: "Academics & STEM",
    kind: "image",
    externalUrl:
      "https://images.pexels.com/photos/31864441/pexels-photo-31864441.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    externalThumbUrl:
      "https://images.pexels.com/photos/31864441/pexels-photo-31864441.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption:
      "Fifth-grade scholars examine cellular plant structures under compound optical microscopes during STEM Discovery Week.",
    eventDate: "2026-01-22",
    location: "Lower School Discovery Lab",
    uploadedBy: "Communications Office",
    durationSeconds: null,
    featured: false,
  },
  {
    title: "Collegiate Cloisters Collaborative Reading Circle (Short Video)",
    eventName: "Oxford House Literary Week",
    category: "Campus Life",
    kind: "video",
    externalUrl:
      "https://videos.pexels.com/video-files/6279713/6279713-uhd_3840_2160_24fps.mp4",
    externalThumbUrl:
      "https://images.pexels.com/videos/6279713/afro-hair-architect-architectural-architectural-building-6279713.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    caption:
      "Short video clip of House Prefects hosting an outdoor Socratic reading discussion on the marble steps of St. Jude Hall.",
    eventDate: "2025-11-08",
    location: "St. Jude Marble Steps",
    uploadedBy: "Communications Office",
    durationSeconds: 25,
    featured: false,
  },
  {
    title: "Honors Chemistry Titration Championship Finals",
    eventName: "Regional Science Olympiad",
    category: "Academics & STEM",
    kind: "image",
    externalUrl:
      "https://images.pexels.com/photos/8471913/pexels-photo-8471913.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    externalThumbUrl:
      "https://images.pexels.com/photos/8471913/pexels-photo-8471913.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption:
      "Middle and Upper School Science Olympiad medalists demonstrating quantitative chemical analysis.",
    eventDate: "2026-02-09",
    location: "Boyle Chemistry Suite",
    uploadedBy: "Communications Office",
    durationSeconds: null,
    featured: false,
  },
  {
    title: "Senior Scholars Honours Procession Across Neoclassical Quad",
    eventName: "Baccalaureate Investiture",
    category: "Commencement & Traditions",
    kind: "image",
    externalUrl:
      "https://images.pexels.com/photos/29229896/pexels-photo-29229896.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    externalThumbUrl:
      "https://images.pexels.com/photos/29229896/pexels-photo-29229896.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption:
      "Cum Laude Society inductees gather in ceremonial academic dress in front of Westminster Hall.",
    eventDate: "2025-05-27",
    location: "Westminster Neoclassical Lawn",
    uploadedBy: "Communications Office",
    durationSeconds: null,
    featured: true,
  },
  {
    title: "Evening Study & Digital Thesis Archive Session (Short Video)",
    eventName: "Senior Capstone Defense Prep",
    category: "Academics & STEM",
    kind: "video",
    externalUrl:
      "https://videos.pexels.com/video-files/5939916/5939916-uhd_3840_2160_25fps.mp4",
    externalThumbUrl:
      "https://images.pexels.com/videos/5939916/pexels-photo-5939916.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    caption:
      "Short video documenting senior thesis scholars preparing their oral defenses in the Rare Book Reading Room.",
    eventDate: "2026-03-11",
    location: "Upper Library Reading Room",
    uploadedBy: "Communications Office",
    durationSeconds: 17,
    featured: false,
  },
  {
    title: "Historic Red Brick Collegiate Hall in Golden Hour",
    eventName: "Heritage Architecture Tour",
    category: "Campus Life",
    kind: "image",
    externalUrl:
      "https://images.pexels.com/photos/29704448/pexels-photo-29704448.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    externalThumbUrl:
      "https://images.pexels.com/photos/29704448/pexels-photo-29704448.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption:
      "Built in 1894, Founders' Hall remains the architectural heart of Westminster Heritage Academy's 85-acre campus.",
    eventDate: "2025-09-20",
    location: "Founders' Quadrangle",
    uploadedBy: "Communications Office",
    durationSeconds: null,
    featured: false,
  },
];

export const NEWS_SEED = [
  {
    title: "Westminster Scholars Capture First Place at New England STEM & Robotics Invitational",
    slug: "westminster-scholars-stem-robotics-champions-2026",
    kind: "news",
    category: "Academics",
    eventDate: "2026-03-12",
    eventTime: "9:00 AM EST",
    location: "Cavendish Science Pavilion",
    summary:
      "Our Upper School Autonomous Systems team bested 44 regional academies with their solar-assisted environmental sensing rover.",
    content:
      "Westminster Heritage Academy's Upper School Robotics & Applied Physics Society earned the Grand Chancellor's Cup at the 2026 New England STEM Invitational this past weekend. Led by senior captains Julian Vance and Priya Ramanathan, the 14-student engineering team designed, fabricated, and programmed an autonomous micro-rover capable of testing soil pH and atmospheric particulates in real time. Judges praised the team's rigorous mathematical modeling and presentation clarity.",
    coverUrl:
      "https://images.pexels.com/photos/33992840/pexels-photo-33992840.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "Dr. Eleanor Vance",
    featured: true,
  },
  {
    title: "Autumn Open House & Headmaster's Classical Forum for Prospective Families",
    slug: "autumn-open-house-headmasters-forum-2026",
    kind: "event",
    category: "Admissions",
    eventDate: d(24),
    eventTime: "9:30 AM – 1:30 PM",
    location: "Founders' Great Hall & Quadrangle",
    summary:
      "Experience student-led quadrangle tours, faculty demonstration seminars, chamber orchestra prelude, and a keynote by Dr. Alistair Sterling.",
    content:
      "Prospective families for Lower, Middle, and Upper School divisions are cordially invited to our Autumn Open House. Beginning with a Chamber Strings prelude in Founders' Great Hall, families will tour our molecular biology labs, fine arts studios, and athletic complex alongside Student Ambassadors. Financial Aid & Merit Scholarship officers will hold individual consultations throughout the afternoon.",
    coverUrl:
      "https://images.pexels.com/photos/18668992/pexels-photo-18668992.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "Office of Admissions",
    featured: true,
  },
  {
    title: "132nd Annual Founders' Day Gala & Symphony Orchestra Conservatory Concert",
    slug: "132nd-founders-day-symphony-gala-2026",
    kind: "event",
    category: "Arts & Culture",
    eventDate: d(38),
    eventTime: "7:00 PM – 9:30 PM",
    location: "Royal Navy & Gold Conservatory Auditorium",
    summary:
      "An evening of Dvořák, Elgar, and original student compositions performed by the 72-piece Westminster Symphony Orchestra and Concert Choir.",
    content:
      "Join alumni, parents, trustees, and students in celebrating the artistic pinnacle of the spring term. Under the baton of Maestro Henrik Lindqvist, the Westminster Symphony Orchestra will perform Dvořák's Symphony No. 9 ('From the New World') alongside the premiere of Senior Fellow Clara Chen's concerto for solo cello and strings.",
    coverUrl:
      "https://images.pexels.com/photos/33281155/pexels-photo-33281155.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "Conservatory of Fine Arts",
    featured: false,
  },
  {
    title: "Class of 2026 Early University Matriculation & Rhodes-Style Fellowship Honors",
    slug: "class-of-2026-early-matriculation-honors",
    kind: "news",
    category: "Academics",
    eventDate: "2026-02-28",
    eventTime: "2:00 PM EST",
    location: "Sterling Library Reading Room",
    summary:
      "Ninety-four percent of graduating seniors have already secured admission to their first-choice universities across the Ivy League, Oxbridge, and top research institutions.",
    content:
      "The College Counseling Office is proud to announce extraordinary early outcomes for the Class of 2026. Students have earned offers of admission to Harvard, Yale, Princeton, Oxford, Cambridge, MIT, Stanford, Williams, and Johns Hopkins, supported by over $4.1 million in national merit and research fellowships.",
    coverUrl:
      "https://images.pexels.com/photos/28896831/pexels-photo-28896831.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "College Counseling Office",
    featured: false,
  },
  {
    title: "Varsity Lions Regatta & Autumn Athletics Homecoming Weekend",
    slug: "varsity-lions-regatta-spring-homecoming-2026",
    kind: "event",
    category: "Athletics",
    eventDate: d(52),
    eventTime: "10:00 AM – 5:00 PM",
    location: "Charles River Boathouse & Gold Crest Stadium",
    summary:
      "Cheer on the Navy & Gold Lions in Varsity Crew, Lacrosse, Track & Field, and Tennis as we defend the Commonwealth Cup.",
    content:
      "Wear your Navy and Imperial Gold for our annual Autumn Athletics Homecoming! Morning races commence at the Westminster Boathouse at 10:00 AM, followed by the Headmaster's Pavilion Luncheon and afternoon Varsity Boys & Girls Lacrosse and Tennis championship matches.",
    coverUrl:
      "https://images.pexels.com/photos/37410979/pexels-photo-37410979.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "Department of Athletics",
    featured: false,
  },
];

export const ACTIVITY_SEED = [
  {
    name: "Varsity Crew & Rowing Club (The Navy & Gold Eight)",
    category: "Varsity Athletics",
    season: "Fall & Spring",
    advisor: "Coach Marcus Sterling (Former Olympic Oarsman)",
    schedule: "Mon – Fri • 3:45 PM – 6:00 PM",
    location: "Westminster Heritage Boathouse",
    description:
      "Founded in 1908, our Varsity and Novice Rowing squads train on the river in sleek Oxford Navy shells, cultivating endurance, synchronicity, and discipline.",
    achievements: "6x New England Interscholastic Regatta Gold Medalists • Royal Henley Qualifier",
    imageUrl:
      "https://images.pexels.com/photos/18668992/pexels-photo-18668992.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    memberCount: 48,
  },
  {
    name: "Autonomous Robotics, AI & Quantum Computing Society",
    category: "STEM & Academic Societies",
    season: "Year-Round",
    advisor: "Dr. Vikram Patel, Ph.D. (MIT)",
    schedule: "Tue & Thu • 3:30 PM – 5:30 PM",
    location: "Cavendish Engineering Lab 204",
    description:
      "Students design custom PCBs, train computer-vision neural networks, and build competitive autonomous rovers for national STEM olympiads.",
    achievements: "2026 New England STEM Invitational 1st Place • 4 Provisional Student Patents",
    imageUrl:
      "https://images.pexels.com/photos/33992840/pexels-photo-33992840.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    memberCount: 36,
  },
  {
    name: "Westminster Symphony Orchestra & Chamber Ensemble",
    category: "Performing Arts",
    season: "Year-Round",
    advisor: "Maestro Henrik Lindqvist (Juilliard)",
    schedule: "Mon, Wed, Fri • 3:30 PM – 5:15 PM",
    location: "Gold Crest Conservatory Hall",
    description:
      "A conservatory-caliber symphonic ensemble performing classical masterworks, chamber music, and annual international concert tours.",
    achievements: "Carnegie Hall Youth Invitational Featured Ensemble • 19 All-State Soloists",
    imageUrl:
      "https://images.pexels.com/photos/33281155/pexels-photo-33281155.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    memberCount: 72,
  },
  {
    name: "Oxford Parliamentary Debate & Model United Nations",
    category: "STEM & Academic Societies",
    season: "Year-Round",
    advisor: "Prof. Catherine Montgomery, J.D.",
    schedule: "Wed & Fri • 3:45 PM – 5:30 PM",
    location: "Clarendon Debate Chamber",
    description:
      "Training eloquent public speakers in British Parliamentary style debate, constitutional jurisprudence, and international diplomacy.",
    achievements: "Harvard Model UN Best Delegation (3 Consecutive Years) • National Forensics Finalists",
    imageUrl:
      "https://images.pexels.com/photos/39714016/pexels-photo-39714016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    memberCount: 54,
  },
  {
    name: "Varsity Soccer, Lacrosse & Track & Field (The Golden Lions)",
    category: "Varsity Athletics",
    season: "Fall, Winter & Spring",
    advisor: "Director of Athletics Coach Devon Brooks",
    schedule: "Mon – Fri • 3:45 PM – 5:45 PM",
    location: "Imperial Gold Turf Complex & Fieldhouse",
    description:
      "Our 22 interscholastic Varsity and JV teams embody 'Mens Sana in Corpore Sano'—competing fiercely while upholding the highest standards of sportsmanship.",
    achievements: "48 League Championship Banners • 14 NCAA Division I Student-Athletes (2023–2026)",
    imageUrl:
      "https://images.pexels.com/photos/28896831/pexels-photo-28896831.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    memberCount: 165,
  },
  {
    name: "The Four Collegiate Houses & Prefect Civic Service Guild",
    category: "Leadership & Service",
    season: "Year-Round",
    advisor: "Dean of Students Mr. Arthur Pendelton",
    schedule: "Weekly House Assemblies • Thursdays 1:15 PM",
    location: "Great Hall & Kensington Community Partner Sites",
    description:
      "Every student belongs to one of four historic Houses—Clarendon, Pembroke, Trinity, or Waverley—competing for the Golden House Cup through scholarship, arts, athletics, and 6,000+ hours of civic service.",
    achievements: "$85,000 Raised for Local Literacy Initiatives • Presidential Youth Service Gold Award",
    imageUrl:
      "https://images.pexels.com/photos/7972528/pexels-photo-7972528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    memberCount: 420,
  },
];
