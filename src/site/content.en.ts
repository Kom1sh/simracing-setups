import type { LandingContent } from './content'

export const en: LandingContent = {
  meta: {
    title: 'iRacing setup help by symptom: fix understeer and oversteer',
    description: 'Describe what your car does, from understeer on entry to a loose rear on exit, and get an iRacing setup change from a checked rule with its effect and limits.',
    ogAlt: 'Spa-Francorchamps track map with a setup change for understeer at Pouhon',
    siteName: 'Setups for sim racing',
  },
  nav: { skip: 'Skip to content', how: 'How it works', symptoms: 'Symptoms', faq: 'Questions', login: 'Log in', signup: 'Create account', dashboard: 'Open dashboard', language: 'Language' },
  hero: {
    title: 'What to change in your iRacing setup when the car misbehaves',
    lead: 'Describe the problem in your own words: the front pushes wide on entry, the rear steps out on exit, the car is nervous under braking. The assistant finds a checked rule and tells you which adjustment to change, what to expect and what to watch for.',
    cta: 'Try it free',
    login: 'Log in',
    note: 'Free while we are testing. All you need is an email.',
    examplesLabel: 'Examples',
    complaintLabel: 'Driver’s complaint',
    answerLabel: 'Assistant’s answer',
    effect: 'What changes',
    watch: 'Watch for',
    checked: 'Sample rule',
    directions: { increase: 'Increase', decrease: 'Decrease' },
    photoAlt: 'A sim racer at a rig with a wheel and three monitors in a dark room',
    examples: [
      {
        id: 'understeer', chip: 'Understeer',
        complaint: 'In the long left-hander the front pushes wide, even when I hold the throttle steady.',
        param: 'Front anti-roll bar', direction: 'decrease', action: 'Soften the front anti-roll bar by 1 click',
        effect: 'The front holds the line better in long corners.', watch: 'The car responds more slowly to quick direction changes.', rule: 'R-002',
      },
      {
        id: 'exit', chip: 'Loose on exit',
        complaint: 'Out of the hairpin the rear steps out as soon as I get on the power.',
        param: 'Traction control', direction: 'increase', action: 'Raise traction control by 1 step',
        effect: 'Fewer slides as you open the throttle.', watch: 'Slightly slower drive out of slow corners.', rule: 'R-008',
      },
      {
        id: 'braking', chip: 'Unstable under braking',
        complaint: 'At the end of the long straight the rear goes light under braking and the car wanders.',
        param: 'Brake bias', direction: 'increase', action: 'Move brake bias 1% to the front',
        effect: 'The rear stays planted under hard braking.', watch: 'The fronts lock earlier, so ease off at the limit.', rule: 'R-010',
      },
    ],
  },
  about: {
    title: 'What a setup is, and where the assistant helps',
    paragraphs: [
      'A setup is the car’s settings in the iRacing garage: tyre pressures, anti-roll bars, springs, brake bias, differential, rear wing. They decide how the car turns, brakes and leaves a corner.',
      'A ready-made setup from a shop or a friend rarely fits perfectly: you have to tune it to your driving, the track and the weather. And with dozens of adjustments, it is hard to know which one to touch.',
      'The assistant helps with that step: you describe what the car does wrong, and it suggests one specific change from a base of rules reviewed by the team’s expert.',
    ],
    photoAlt: 'Gloved hands on a sim racing wheel',
  },
  how: {
    title: 'How it works',
    intro: 'The assistant sits on top of the usual iRacing setup screen. You keep driving your own setup and change it one step at a time.',
    steps: [
      { title: 'Describe the problem', text: 'Pick what the car does and where in the corner, or just write it in your own words.' },
      { title: 'Get a change from a checked rule', text: 'What to adjust and by how much, the expected effect and the limits. If no checked rule fits, you are told so.' },
      { title: 'Change one thing and drive', text: 'Make the change in the garage, run three to five laps and compare. Keep your setups in the dashboard.' },
    ],
  },
  handling: {
    title: 'Understeer and oversteer',
    intro: 'Almost every handling complaint comes down to one of two things: the car turns less than you want, or more.',
    planned: 'Where you steer',
    actual: 'Where the car goes',
    items: [
      { id: 'understeer', title: 'Understeer', text: 'The front tyres lose grip before the rear. You turn the wheel and the car runs wider, towards the outside of the corner. Front-axle adjustments and brake bias are the usual suspects.' },
      { id: 'oversteer', title: 'Oversteer', text: 'The rear tyres lose grip first. The car rotates into the corner and you have to catch it with opposite lock. It shows up most on entry under braking and on exit under power.' },
    ],
  },
  symptoms: {
    title: 'Handling problems it understands',
    intro: 'Where in the corner a problem shows up matters more than the problem itself: understeer on entry and understeer on exit have different causes and different fixes.',
    paramsLabel: 'Usually involves',
    items: [
      { id: 'understeer-entry', title: 'Understeer on entry', text: 'Understeer means the front tyres run out of grip before the rear and the car runs wide of the line you steer. On entry it usually happens while you are still on the brakes.', params: ['Brake bias', 'Front anti-roll bar', 'Front toe'] },
      { id: 'understeer-mid', title: 'Understeer mid-corner', text: 'At steady throttle the car will not hold the line, and adding steering lock changes nothing.', params: ['Front anti-roll bar', 'Front camber', 'Splitter'] },
      { id: 'understeer-exit', title: 'Understeer on exit', text: 'The car runs wide as soon as you get back on the power.', params: ['Diff preload', 'Rear anti-roll bar', 'Rear ride height'] },
      { id: 'oversteer-entry', title: 'Oversteer on entry', text: 'Oversteer means the rear tyres lose grip first and the back of the car slides out. On entry it happens as you brake and turn in.', params: ['Brake bias', 'Diff preload', 'Rear toe'] },
      { id: 'oversteer-exit', title: 'Oversteer on exit', text: 'The rear slides when you open the throttle, most of all out of slow corners.', params: ['Traction control', 'Rear anti-roll bar', 'Rear wing'] },
      { id: 'braking', title: 'Unstable under braking', text: 'The car wanders or the rear feels light under hard braking in a straight line.', params: ['Brake bias', 'Brake pressure', 'Rear toe'] },
      { id: 'lockups', title: 'Front lock-ups', text: 'The front wheels stop turning and the car slides straight on past the apex.', params: ['Brake bias', 'Brake pressure', 'ABS'] },
      { id: 'bottoming', title: 'Bottoming out and kerbs', text: 'The floor hits the track in compressions or the car bounces off kerbs.', params: ['Ride height', 'Bump stops', 'Fast bump damping'] },
    ],
  },
  rules: {
    title: 'Rules, not guesses',
    intro: 'Generic chatbots happily suggest setups that break the car’s limits or fix the wrong thing. The assistant works differently.',
    items: [
      { title: 'Only rules with a source', text: 'Every answer comes from a rule with a source and a review status. Rules nobody has checked do not reach you.' },
      { title: '“No match” is an answer too', text: 'If no rule fits your car and symptom, the assistant says so instead of inventing a tip.' },
      { title: 'Every answer is traceable', text: 'Each recommendation comes with its rule ID and basis, so you can see where it came from.' },
    ],
  },
  numbers: {
    title: 'Why we are building it',
    intro: 'Before writing code we talked to drivers and compared setup shops.',
    rows: [
      { value: '≈1.5 h', text: 'One driver we interviewed spends about an hour and a half fitting each bought setup to his driving, sometimes two to three hours with his team.' },
      { value: '$16.56', text: 'Median monthly price of a setup subscription across 12 shops. iRacing itself costs $14.75 a month.' },
      { value: '7 of 28', text: 'Drivers in our survey who are fully happy with a ready-made setup. Half say it fits in most cases, so setups usually need tuning rather than replacing.' },
    ],
    source: 'Survey of 41 sim racers and 4 in-depth interviews, September 2026. Prices taken from shop websites on 21 September 2026.',
  },
  preview: {
    title: 'The dashboard behind it',
    text: 'Track and weather, every GT3 adjustment grouped like the garage, a race fuel plan and a check for contradictions such as slicks in the rain. The assistant has its own tab next to it.',
    points: ['28 circuits with real track maps', 'GT3, GT4, GT2 and cup cars', 'Fuel plan for races up to 24 hours', 'Setups saved to your account and as files'],
    alt: 'The setup dashboard: Spa-Francorchamps track map, car choice and the tyre adjustments',
    cta: 'Open the dashboard',
  },
  faq: {
    title: 'Questions',
    items: [
      { q: 'What is understeer, and what is oversteer?', a: 'Understeer is when the front tyres lose grip first and the car runs wide of the line you steer. Oversteer is when the rear tyres lose grip first and the back of the car slides out. Where in the corner it happens, on entry, mid-corner or on exit, points to different setup changes.' },
      { q: 'Which sims and cars does it support?', a: 'The dashboard covers GT3, GT4, GT2 and cup cars on 28 circuits with a general GT3 adjustment template, so there are no separate LMU or ACC setups yet. The first assistant rules cover one car on iRacing ovals.' },
      { q: 'Is this an AI chatbot?', a: 'No. The assistant looks for a rule whose condition matches your complaint, and only rules that passed a review are used. No language model writes the advice, and if no rule fits, it tells you so.' },
      { q: 'Will it edit my .sto setup file?', a: 'Not yet. You get the change to make in the garage: which adjustment, which way and by how much.' },
      { q: 'Where are my account and setups stored?', a: 'For now, in your browser: the account in a cookie and setups in local storage. Clearing site data removes them. Server accounts will arrive with the backend.' },
      { q: 'How much does it cost?', a: 'Nothing while we are testing it.' },
      { q: 'Who is building it?', a: 'A student team of six, sim racers, developers and analysts, as a university product project. The code is open on GitHub.' },
    ],
  },
  final: { title: 'Bring us your worst corner', text: 'Create an account and describe what the car does in the corner that costs you the most time.', cta: 'Try it free', photoAlt: 'A race car cornering at sunset' },
  footer: { project: 'A university project by a student team.', code: 'Code on GitHub', data: 'Track maps: bacinger/f1-circuits (MIT) and © OpenStreetMap contributors (ODbL).' },
}
