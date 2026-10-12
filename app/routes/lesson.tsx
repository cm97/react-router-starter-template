import { data, Link } from "react-router";
import type { Route } from "./+types/lesson";
import { LessonPlayer } from "~/components/LessonPlayer";
import { Locked } from "~/components/ui";
import { SITE } from "~/config";
import { getLesson, LESSONS } from "~/data/lessons";
import { hasPass } from "~/lib/pass.server";

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const lesson = getLesson(params.slug);
	if (!lesson) throw data(null, { status: 404 });
	const open = lesson.free || (await hasPass(request, context.cloudflare.env));
	const next = LESSONS[LESSONS.indexOf(lesson) + 1];
	// Locked lessons never send their content to the browser.
	return {
		lesson: open ? lesson : { ...lesson, cards: [], quiz: [] },
		open,
		next: next?.slug,
	};
}

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: `${data?.lesson.title ?? "Lesson"} | ${SITE.name}` },
		{ name: "description", content: data?.lesson.blurb },
	];
}

export default function LessonPage({ loaderData }: Route.ComponentProps) {
	const { lesson, open, next } = loaderData;
	return (
		<div className="max-w-3xl mx-auto py-6">
			<Link to="/lessons" className="inline-flex min-h-11 items-center font-bold text-indigo-700">← All lessons</Link>
			{open ? (
				<div className="card p-6 sm:p-10 mt-2">
					<h1 className="text-center text-xl font-bold text-slate-500 mb-4">
						{lesson.emoji} {lesson.title}
					</h1>
					<LessonPlayer key={lesson.slug} lesson={lesson} nextHref={next ? `/lessons/${next}` : undefined} />
				</div>
			) : (
				<div className="mt-6"><Locked title={lesson.title} emoji={lesson.emoji} /></div>
			)}
		</div>
	);
}
