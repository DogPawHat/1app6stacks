const MAX_DEX_ID = 1025;

export function getRandomPokemonPair(seed: number) {
	const first = Math.floor(seed * MAX_DEX_ID);
	let second = first;
	while (second === first) {
		second = Math.floor(Math.random() * MAX_DEX_ID);
	}
	const result: [number, number] = [first, second];

	return result;
}
