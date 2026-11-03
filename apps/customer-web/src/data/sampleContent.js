export const sampleLibraries = [
  {
    id: 1,
    name: 'The Reading Room',
    area: 'Model Town, Sonipat',
    price: 800,
    seats: 13,
    rating: '4.8',
    hours: '6:00 AM – 10:00 PM',
    image: '/images/sonipat-study-space.webp',
    facilities: ['Air conditioned', 'High-speed Wi-Fi', 'Power backup'],
    color: 'sky',
  },
  {
    id: 2,
    name: 'Gyandeep Study Library',
    area: 'Kundli, Sonipat',
    price: 650,
    seats: 18,
    rating: '4.7',
    hours: '5:30 AM – 11:00 PM',
    image: '/images/study-community.webp',
    facilities: ['Quiet study zone', 'Personal lockers', 'CCTV'],
    color: 'lime',
  },
  {
    id: 3,
    name: 'Scholars Corner',
    area: 'Murthal Road, Sonipat',
    price: 900,
    seats: 6,
    rating: '4.9',
    hours: 'Open 24 hours',
    image: '/images/study-session.webp',
    facilities: ['24-hour access', 'Ergonomic desks', 'Tea & coffee'],
    color: 'blue',
  },
  {
    id: 4,
    name: 'The Study Nook',
    area: 'Sector 14, Sonipat',
    price: 750,
    seats: 9,
    rating: '4.6',
    hours: '6:00 AM – 9:30 PM',
    image: '/images/library-gathering.webp',
    facilities: ['Reserved seating', 'Wi-Fi', 'Filtered water'],
    color: 'coral',
  },
]

export const studyCategories = [
  { icon: 'BookOpen', title: 'Quiet study rooms', color: 'sky', search: 'quiet' },
  { icon: 'Clock3', title: 'Flexible hours', color: 'lime', search: '24' },
  { icon: 'MapPin', title: 'Spaces near you', color: 'blue', search: 'Sonipat' },
]

export const eventFormats = [
  { number: '01', title: 'Quiet co-work', description: 'A little company for the long study sessions.', color: 'event-yellow', image: '/images/study-circle.webp' },
  { number: '02', title: 'Reading circles', description: 'Bring a book, find a corner, share a thought.', color: 'event-lilac', image: '/images/student-community.webp' },
  { number: '03', title: 'Exam season', description: 'Calm spaces and good routines for big days.', color: 'event-green', image: '/images/community-study.webp' },
]

export const customerUpdates = [
  { title: 'A better way to find your study space', image: '/images/study-session.webp' },
  { title: 'Make a routine that works for you', image: '/images/library-gathering.webp' },
  { title: 'Your neighbourhood, one quiet corner at a time', image: '/images/study-community.webp' },
]
