declare var console;

let eq = (a: string, b: string) => a + '=' + b;
let neg = (s: string) => s ? '-('+s+')' : '';
let Neg = (n: number, s: string) => s ? '-'+Par(n, s) : '';
let par = (...s: string[]) => filter(s).length ? '('+filter(s).join(' ')+')' : '';
let tab = (n: number) => '\n'+new Array(n).fill('\t').join('');
let Par = (n: number, ...s: string[]) => filter(s).length ? '('+tab(n+1) + filter(s).join(' ') + tab(n) +')' : '';
let F = (a: string, b: string, c: string) => 'F('+a+', '+b+', '+c+')';
let filter = (s: string[]) => s.filter(s => s);

let includes = (word: string) => {
	word = word.replace(/./gi, x => x=='a' ? '0' : '1');
	
}
let noWordsOtherThan = (_words: string[] | number) => {
	let len = typeof _words == 'number' ? _words : _words.map(o => o.length).reduce((p, c) => {
		if(p==c)
			return p;
		throw "NOOO words of diff len";
	});
	if(len==0){
		return Par(1, 'all x ((I(x) -> -T(x)) & (T(x) -> -I(x)))');
	}
	let words = typeof _words == 'number' ? [] : _words.map(o => o.replace(/./gi, x => x=='a' ? '0' : '1'));
	let impl = '->';
	let states = (new Array(len+1)).fill(0).map((_,i) => 's'+i);
	let letters = (new Array(len)).fill(0).map((_,i) => 'a'+i);

	let alls = [...states, ...letters].map(_ => 'all '+_).join(' ');
	let allsLetters = letters.map(_ => 'all '+_).join(' ');
	let allsStates = states.map(_ => 'all '+_).join(' ');
	let exists = [...states, ...letters].map(_ => 'exists '+_).join(' ');
	let existsStates = states.map(_ => 'exists '+_).join(' ');
	let constraintsStates = [
		'I('+states[0]+')', /*...states.slice(1,-1).map(_ => 'Q('+_+')'),*/ 'T('+states.slice(-1)[0]+')'];
	let constraintsLetters = letters.map(l => 'A('+l+')');
	let constraints = [...constraintsStates, ...constraintsLetters];
	// let isOneOf = filter(letters.map((l,i) => par(words.map(w => eq(l, w[i])).join(' | ')))).join(' & ');
	let isOneOf = filter(words.map(w => par(letters.map((l,i) => eq(l, w[i])).join(' & ')))).join(' | ');
	let pairStates = states.slice(0, -1).map((c, i): [string, string] => [c, states[i+1]]);
	let linkStates = pairStates.map(([f,t], i) => F(f, letters[i], t)).join(' & ');

	// let A = par(alls, par(par(filter([neg(isOneOf)]).join(' & ')), impl, [...constraints, neg(linkStates)].join(' & ')));
	let contentA = Neg(5,[...constraintsStates, linkStates].join(' & '));
	let A = Par(3, allsStates, isOneOf ? Par(4, Neg(5,isOneOf), impl, contentA) : contentA);
	// let B = par(exists, par(filter([...constraints, linkStates]).join(' & ')));
	// let X = par(allsLetters, par(filter([...constraints, linkStates]).join('&')))
	// let B = par(exists, par(par(filter([...constraints, isOneOf]).join(' & ')), impl, linkStates));

	let B = Par(3, existsStates, 
					Par(4,
						Par(5, isOneOf),
						'->',
						Par(5, filter([...constraintsStates, linkStates]).join(' & '))
					)
				);

	return Par(1, allsLetters,
				Par(2,
					filter([
						A,
						words.length ? B : ''
					]).join(' & ')
				)
					// par(filter([...constraints, linkStates]).join(' & '))
			);

	// return Par(1, filter([A, words.length ? B : '']).join('&'));
}

let l = [	noWordsOtherThan(['aa'])
		,	noWordsOtherThan(['aba','baa'])
		// ,	noWordsOtherThan(['abab','babb'])
		// ,	noWordsOtherThan(['000','111'])
		,	noWordsOtherThan(0)
		,	noWordsOtherThan(1)
		// ,	noWordsOtherThan(2)
		];

let _IDS = 0;
let pretty = (s: string, nth=0) => {
	// console.log('>>', s);
	if(nth > 40)
		return s;
	let id = '__'+(_IDS++)+'__';
	let w = '';
	let tab = new Array(nth).fill('\t').join('');
	let tab2 = new Array(nth ? nth-1 : 0).fill('\t').join('');
	return pretty(s.replace(/\(([^(]*)\)/, (_,c) => {
		w = c.length > 2 ? '\n(\n'+c+'\n)\n' : '('+c+')';
		return id;
	}), nth+1).replace(id, w.replace(/\n(?!\))/g, '\n'+tab).replace(/\n(?=\))/g, '\n'+tab2));
};

let input = `
assign(max_seconds, -1).
assign(max_megs, -1).

formulas(assumptions).
all x all y all a (F(x,a,y) -> A(a) & Q(x) & Q(y)).
all x (I(x) -> Q(x)).
all x (T(x) -> Q(x)).

A(0).
A(1).
end_of_list.

formulas(goals).
${pretty('-'+Par(0, l.join(' & '))+'.', 50)}
end_of_list.`;

console.log(input);
