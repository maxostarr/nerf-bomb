import { playAudio } from '$lib/audio';
import { write } from '$lib/io';
import { json, type RequestHandler } from '@sveltejs/kit';
import { Effect } from 'effect';

const panOn = {
	left: 'L',
	right: 'R'
} as const;

const panOff = {
	left: 'l',
	right: 'r'
} as const;

const verifyPan = (pan: string): pan is keyof typeof panOn => pan in panOn;

// export const POST: RequestHandler = async ({ request }) => {
//   const { pan } = await request.json();

//   // Assert that pan is a valid key of panOn
//   if (!verifyPan(pan)) {
//     return json({
//       status: 400,
//       body: { error: 'Invalid pan value' }
//     });
//   }

//   try {

//     console.log('Enabling pan', pan);
//     write(panOn[pan]);
//     await new Promise(resolve => setTimeout(resolve, 500));

//     console.log('Playing audio');
//     await playAudio(pan);
//     // wait one second

//     console.log('Disabling pan', pan);
//     write(panOff[pan]);

//     return json({
//       success: true
//     });
//   } catch (e) {
//     return json({
//       status: 500,
//       body: { error: e }
//     });
//   }
// }

export const POST: RequestHandler = async ({ request }) => {
	const responseEffect = Effect.gen(function* () {
		const { pan } = yield* Effect.promise(() => request.json());

		// Assert that pan is a valid key of panOn
		if (!verifyPan(pan)) {
			return {
				status: 400,
				body: { error: 'Invalid pan value' }
			};
		}

		// console.log('Enabling pan', pan);
		yield* Effect.log(`Enabling pan ${pan}`);
		yield* write(panOn[pan]);
		yield* Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 500)));

		// console.log('Playing audio');
		yield* Effect.log(`Playing audio on pan ${pan}`);
		yield* Effect.promise(() => playAudio(pan));
		// wait one second

		// console.log('Disabling pan', pan);
		yield* Effect.log(`Disabling pan ${pan}`);
		yield* write(panOff[pan]);

		return {
			success: true
		};
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed({
				status: 500,
				body: { error: String(error) }
			})
		)
	);

	const result = await Effect.runPromise(responseEffect);
	return json(result);
};
