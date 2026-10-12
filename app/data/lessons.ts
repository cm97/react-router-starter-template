export type LessonCard = { big: string; text: string };
export type QuizQuestion = { q: string; show?: string; choices: string[]; answer: string };

export type Lesson = {
	slug: string;
	title: string;
	emoji: string;
	subject: "Math" | "Reading" | "Science";
	ages: string;
	free: boolean;
	blurb: string;
	cards: LessonCard[];
	quiz: QuizQuestion[];
};

export const LESSONS: Lesson[] = [
	{
		slug: "counting-to-10",
		title: "Counting to 10",
		emoji: "🔟",
		subject: "Math",
		ages: "3–5",
		free: true,
		blurb: "Count bugs, apples and stars all the way to ten.",
		cards: [
			{ big: "🐞", text: "This is ONE ladybug. One means just a single thing." },
			{ big: "🍎🍎🍎", text: "Point and count with me. One, two, THREE apples!" },
			{ big: "⭐⭐⭐⭐⭐", text: "Five stars. That is the same as the fingers on one hand." },
			{ big: "🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝", text: "Ten bees! Ten is the same as all your fingers." },
		],
		quiz: [
			{ q: "How many fish?", show: "🐟🐟🐟", choices: ["2", "3", "4"], answer: "3" },
			{ q: "How many flowers?", show: "🌸🌸🌸🌸🌸", choices: ["5", "6", "4"], answer: "5" },
			{ q: "What comes after 7?", choices: ["6", "8", "9"], answer: "8" },
		],
	},
	{
		slug: "letter-sounds",
		title: "Letter Sounds A–E",
		emoji: "🔤",
		subject: "Reading",
		ages: "3–5",
		free: true,
		blurb: "Every letter makes a sound. Meet the first five.",
		cards: [
			{ big: "A 🍎", text: "A says “a” like in apple." },
			{ big: "B 🐻", text: "B says “b” like in bear." },
			{ big: "C 🐱", text: "C says “k” like in cat." },
			{ big: "D 🐶", text: "D says “d” like in dog." },
			{ big: "E 🥚", text: "E says “e” like in egg." },
		],
		quiz: [
			{ q: "Which letter starts the word?", show: "🐻 bear", choices: ["A", "B", "D"], answer: "B" },
			{ q: "Which letter starts the word?", show: "🐶 dog", choices: ["D", "C", "E"], answer: "D" },
			{ q: "Which letter starts the word?", show: "🍎 apple", choices: ["E", "B", "A"], answer: "A" },
		],
	},
	{
		slug: "shapes-around-us",
		title: "Shapes Around Us",
		emoji: "🔺",
		subject: "Math",
		ages: "4–6",
		free: false,
		blurb: "Find circles, squares and triangles hiding everywhere.",
		cards: [
			{ big: "⚪", text: "A circle is round. It has no corners. A pizza is a circle!" },
			{ big: "🟥", text: "A square has 4 sides that are all the same length." },
			{ big: "🔺", text: "A triangle has 3 sides and 3 corners. Like a slice of pizza." },
			{ big: "⭐", text: "A star has 5 points. Can you count them?" },
		],
		quiz: [
			{ q: "How many sides does a triangle have?", choices: ["3", "4", "5"], answer: "3" },
			{ q: "Which shape has no corners?", choices: ["Square", "Circle", "Triangle"], answer: "Circle" },
			{ q: "How many sides does a square have?", choices: ["3", "4", "6"], answer: "4" },
		],
	},
	{
		slug: "adding-small-numbers",
		title: "Adding Small Numbers",
		emoji: "➕",
		subject: "Math",
		ages: "5–7",
		free: false,
		blurb: "Put groups together and count them all.",
		cards: [
			{ big: "🍪🍪 + 🍪", text: "Adding means putting groups together. 2 cookies plus 1 cookie..." },
			{ big: "🍪🍪🍪", text: "...makes 3 cookies! We write it 2 + 1 = 3." },
			{ big: "🐸🐸🐸 + 🐸🐸", text: "Start with the bigger group and count up. 3... 4, 5!" },
			{ big: "3 + 2 = 5", text: "Counting up is a superpower. Use your fingers anytime." },
		],
		quiz: [
			{ q: "2 + 2 = ?", show: "🍓🍓 + 🍓🍓", choices: ["3", "4", "5"], answer: "4" },
			{ q: "4 + 1 = ?", choices: ["5", "6", "3"], answer: "5" },
			{ q: "3 + 3 = ?", choices: ["5", "7", "6"], answer: "6" },
		],
	},
	{
		slug: "rhyming-words",
		title: "Rhyming Words",
		emoji: "🎵",
		subject: "Reading",
		ages: "5–7",
		free: false,
		blurb: "Words that sound the same at the end. Cat, hat, bat!",
		cards: [
			{ big: "🐱 🎩", text: "Cat and hat rhyme. They both end in “at”." },
			{ big: "🐸 🪵", text: "Frog and log rhyme. They both end in “og”." },
			{ big: "☀️ 🏃", text: "Sun and run rhyme. They both end in “un”." },
			{ big: "🎶", text: "Songs and poems use rhymes. Try making up your own!" },
		],
		quiz: [
			{ q: "What rhymes with cat?", choices: ["Dog", "Hat", "Cup"], answer: "Hat" },
			{ q: "What rhymes with frog?", choices: ["Log", "Fish", "Tree"], answer: "Log" },
			{ q: "What rhymes with sun?", choices: ["Moon", "Run", "Sky"], answer: "Run" },
		],
	},
	{
		slug: "animal-homes",
		title: "Animal Homes",
		emoji: "🏡",
		subject: "Science",
		ages: "4–7",
		free: false,
		blurb: "Nests, hives, dens and ponds. Who lives where?",
		cards: [
			{ big: "🐦 🪺", text: "Birds build nests out of twigs and grass to keep eggs safe." },
			{ big: "🐝 🍯", text: "Bees live together in a hive and make honey." },
			{ big: "🦊 🕳️", text: "Foxes sleep in a den. It is a cozy hole in the ground." },
			{ big: "🐟 🌊", text: "Fish live in water. Some in ponds, some in the big ocean." },
		],
		quiz: [
			{ q: "Where does a bee live?", choices: ["Hive", "Den", "Nest"], answer: "Hive" },
			{ q: "Where does a bird lay eggs?", choices: ["Pond", "Nest", "Hive"], answer: "Nest" },
			{ q: "Where does a fox sleep?", choices: ["Den", "Ocean", "Tree top"], answer: "Den" },
		],
	},
	{
		slug: "telling-time",
		title: "Telling Time",
		emoji: "⏰",
		subject: "Math",
		ages: "6–8",
		free: false,
		blurb: "The short hand and the long hand. What time is it?",
		cards: [
			{ big: "🕐", text: "A clock has a short hand for hours and a long hand for minutes." },
			{ big: "🕒", text: "When the long hand points at 12, it is “o’clock”. This is 3 o’clock." },
			{ big: "🕡", text: "When the long hand points at 6, it is half past. This is half past 6." },
			{ big: "🌅 🌙", text: "There are 24 hours in a day. Morning, afternoon, evening and night." },
		],
		quiz: [
			{ q: "What time is it?", show: "🕒", choices: ["3 o’clock", "12 o’clock", "9 o’clock"], answer: "3 o’clock" },
			{ q: "The long hand points to 6. It is...", choices: ["O’clock", "Half past", "Midnight"], answer: "Half past" },
			{ q: "How many hours in a day?", choices: ["12", "24", "60"], answer: "24" },
		],
	},
	{
		slug: "our-solar-system",
		title: "Our Solar System",
		emoji: "🪐",
		subject: "Science",
		ages: "6–9",
		free: false,
		blurb: "Blast off past the Sun, the Moon and eight planets.",
		cards: [
			{ big: "☀️", text: "The Sun is a star. It is so big that a million Earths could fit inside." },
			{ big: "🌍", text: "Earth is our home planet. It goes around the Sun once a year." },
			{ big: "🌕", text: "The Moon goes around Earth. It shines because sunlight bounces off it." },
			{ big: "🪐", text: "There are 8 planets. Saturn is the one with the big rings." },
		],
		quiz: [
			{ q: "The Sun is a...", choices: ["Planet", "Star", "Moon"], answer: "Star" },
			{ q: "How many planets are there?", choices: ["8", "5", "12"], answer: "8" },
			{ q: "Which planet has big rings?", choices: ["Earth", "Mars", "Saturn"], answer: "Saturn" },
		],
	},
];

export const getLesson = (slug: string | undefined) =>
	LESSONS.find((l) => l.slug === slug);
