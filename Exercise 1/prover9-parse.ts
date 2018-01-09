declare var require;

let ithrow = (msg: string): any => {
	throw msg;
}

type entry = {neg: boolean, params: number[]};
let parse = (s: string) => {
	let functions: {[index: string]: entry[]} = {};
	s.split('\n').map(o => o.match(/^[ \t]*([- ]) ([A-Z])\((\d+(?:,\d+)*)\).[ \t]*$/)).filter(o=>o)
	 .forEach(([_, neg, name, params]) => 
			(functions[name] = functions[name] || <entry[]>[]).push({
				neg: neg=='-', params: params.split(',').map(o => +o)
			})
		);
	let notNeg = (s: string) => functions[s].filter(({neg}) => !neg).map(({params}) => params);
	let out = `
digraph finite_state_machine {
	rankdir=LR;
	size="8,5"
	node [shape = doublecircle]; ${notNeg('I').map(([o]) => 's'+o).join(' ')};
	node [shape = doublecircle]; ${notNeg('T').map(([o]) => 's'+o).join(' ')};
	node [shape = circle];
	${notNeg('F').map(([f,l,t]) => 's'+f+' -> s'+t+' [ label = "'+l+'" ];').join('\n\t')}
}
`;
	return out;
}

let fs = require('fs');
var stdinBuffer = fs.readFileSync(0);

console.log(parse(stdinBuffer.toString()));
