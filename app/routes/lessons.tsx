import { useRouteLoaderData } from "react-router";
import type { Route } from "./+types/lessons";
import { LessonCard } from "~/components/Cards";
import { SITE } from "~/config";
import { LESSONS, type Lesson } from "~/data/lessons";
import type { loader as rootLoader } from "~/root";
import { PassPitch } from "~/components/PassPitch";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: `Lessons | ${SITE.name}` },
		{ name: "description", content: "Short, fun lessons in math, reading and science for kids ages 3 to 9." },
	];
}

const SUBJECTS: Lesson["subject"][] = ["Math", "Reading", "Science"];

export default function Lessons() {
	const pass = useRouteLoaderData<typeof rootLoader>("root")?.pass ?? false;
	return (
		<>
			<h1 className="text-4xl font-bold text-indigo-950 mt-6">📚 Lessons</h1>
			<p className="text-lg text-slate-600 mb-6">A few friendly cards, then a quick quiz. Earn up to 3 stars each.</p>
			{SUBJECTS.map((s) => (
				<section key={s} className="mb-8" aria-labelledby={`s-${s}`}>
					<h2 id={`s-${s}`} className="text-2xl font-bold text-indigo-900 mb-3">{s}</h2>
					<div className="grid md:grid-cols-2 gap-4">
						{LESSONS.filter((l) => l.subject === s).map((l) => (
							<LessonCard key={l.slug} lesson={l} unlocked={pass} />
						))}
					</div>
				</section>
			))}
			{!pass && <PassPitch />}
		</>
	);
}
