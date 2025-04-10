import Chip from './Chip';

type WorkHistory = {
  company: string;
  title: string;
  location: string;
  start: string;
  skills: string[];
};

export default function WorkHistory() {
  const data: WorkHistory[] = [
    {
      company: 'Southern Made',
      title: 'Staff Engineer',
      location: 'Nashville, Tennessee (Remote)',
      start: 'May, 2024',
      skills: [
        'AWS',
        'Heroku',
        'Project Management',
        'Cloud Computing',
        'AI/ML',
        'Project Estimation',
        'Google Cloud',
        'Gemini AI',
        'Video Intelligence API',
      ],
    },
    {
      company: '24hrcarunlocking.com',
      title: 'Full Stack Engineer',
      location: 'Austin, Texas',
      start: 'August, 2023',
      skills: [
        'AWS',
        'Heroku',
        'Nuxt',
        'Twilio',
        'Twilio Flex',
        'PostGIS',
      ],
    },
    {
      company: 'Marani Health',
      title: 'Full Stack Software Engineer',
      location: 'Remote',
      start: 'March, 2022',
      skills: [
        'Python',
        'JavaScript',
        'TypeScript',
        'React',
        'React Native',
        'Expo',
        'AWS',
        'Amplify',
        'HighCharts',
        'Excel Automation',
        'Docker',
      ],
    },
    {
      company: 'festivalPass',
      title: 'React Native Engineer',
      location: 'Austin, Texas',
      start: 'March, 2021',
      skills: ['Strapi', 'Expo', 'React Native', 'TypeScript'],
    },
    {
      company: 'Lifecycle Insights ',
      title: 'Full Stack Engineer',
      location: 'Austin, Texas',
      start: 'Jan, 2019',
      skills: [
        'Vue',
        'MongoDB',
        'Node',
        'Express',
        'Google Cloud',
        'Firebase',
        'Vuetify',
      ],
    },
    {
      company: 'Rock Candy Media',
      title: 'Full Stack Developer',
      location: 'Austin, Texas',
      start: 'Apr, 2018',
      skills: [
        'WordPress',
        'SASS',
        'JavaScript',
        'Bootstrap',
        'Materialize',
        'Linux',
        'Apache',
        'PHP',
        'MySQL',
        'Composer',
        'AWS',
        'Google Cloud',
        'SEO',
      ],
    },
    {
      company: 'Glide Design',
      title: 'Web Developer',
      location: 'Austin, Texas',
      start: 'Jan, 2017',
      skills: [
        'Angular',
        'WordPress',
        'Linux',
        'Apache',
        'PHP',
        'mySQL',
        'Composer',
        'JavaScript',
        'HTML5',
        'SASS',
        'AWS',
        'Google Cloud',
      ],
    },
    {
      company: 'Smart Insurance',
      title: 'Full Stack Developer',
      location: 'Remote',
      start: 'Jun, 2016',
      skills: [
        'GravityForms',
        'WordPress',
        'Linux',
        'Apache',
        'PHP',
        'mySQL',
        'JavaScript',
        'HTML5',
        'AWS',
      ],
    },
    {
      company: 'Obzervant',
      title: 'Full Stack Developer',
      location: 'Austin, Texas',
      start: 'Jun, 2015',
      skills: [
        'WordPress',
        'PHP',
        'mySQL',
        'JavaScript',
        'React',
        'HTML5',
        'SASS',
        'Google Cloud',
      ],
    },
    {
      company: 'RiskPro®',
      title: 'Full Stack Web Developer',
      location: 'Remote',
      start: 'Jan, 2014',
      skills: [
        'HighCharts',
        'WordPress',
        'PHP',
        'mySQL',
        'JavaScript',
        'jQuery',
        'HTML5',
        'CSS3',
        'AWS',
      ],
    },
    {
      company: 'SqueekPress',
      title: 'Full Stack Developer',
      location: 'Remote',
      start: 'Aug, 2013',
      skills: [
        'WordPress',
        'Linux',
        'PHP',
        'mySQL',
        'JavaScript',
        'jQuery',
        'AJAX',
        'GravityForms',
        'wooCommerce',
        'Apache',
        'NGINX',
      ],
    },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-0">The Road So Far...</h1>
      {data.map((job: WorkHistory, index: number) => (
        <div className="relative pl-8 sm:pl-32 py-6 group" key={`wh-${index}`}>
          <div className="font-caveat font-medium text-2xl text-gray-200 mb-1 sm:mb-0">
            {job.company}
          </div>
          <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-indigo-600 after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
            <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-24 h-6 mb-3 sm:mb-0 text-blue-700 bg-blue-100 rounded">
              {job.start}
            </time>
            <div className="text-lg text-gray-400">{job.title}</div>
          </div>
          <div className="text-slate-500">
            {job.skills &&
              job.skills.map((skill: string, index: number) => (
                <Chip key={`ch-${index}`} label={skill} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
