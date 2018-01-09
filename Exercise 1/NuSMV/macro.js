let fs = require('fs');
let content = fs.readFileSync('second.smv').toString();
let nodes = 'abcd'.split(''); 
let next = n => 'next('+n+')';
let log = f => (...l) => ('>>>', console.log(...l), f(...l));
content = content.replace(/move\{([^\}]*),[ \t\n]*(\w)[ \t\n]*\}/g, (_, d, node) => {
	let str = [];
	let tt = '\n\t\t\t\t';
	for(let n of nodes){
		let vars = {d, n};
		let esc = s => 
			Object.keys(vars).reduce(
					(p, c) => 
						p.replace(new RegExp("\\b"+c+"\\b", "g"), vars[c])
				, s);
		// esc = log(esc);
		let add = s => str.push(esc(s));
		vars['new_n'] = esc('n - d');
		if(n==node){
			vars['maxToAdd'] = esc('max_'+n+' - (new_n)'); // warning : shoudl never be negative
			vars['amountAdd'] = esc('(((maxToAdd) > t) ? t : (maxToAdd))');
			//  \text{min} \{max_dest - (dest - dist), t\}
			add('(next(n) = n + amountAdd - d) &'+tt+'\t(next(t) = t - amountAdd)');
		}else
			add('next(n) = new_n');
	}
	return str.map(o => tt+'('+o+')').join(' & ') + tt+'& (next(n) = '+(nodes.indexOf(node)+1)+')';
});

let nnodes = [...nodes.join(''), 's'];
let re = new RegExp("can_move_from_(["+nnodes+"])_to_(["+nnodes+"])", "g");
content = content.replace(re, (_, a, b) => {
	let d = 'd_'+[a,b].sort().join('_');
	return '(' + nodes.map(n => n + '>' + d).join(' & ') + ')';
});

let defines = {
	  "d_a_s": 15
	, "d_a_c": 11
	, "d_c_s": 15
	, "d_b_c": 11
	, "d_c_d": 20
	, "d_b_d": 20
	, "d_a_b": 17
	, "max_a": 110
	, "max_b": 160
	, "max_c": 110
	, "max_d": 160
	, "max_n": 4
	, "max_t": 362
};
// for(let k in defines){
// 	let re = new RegExp("\\b"+k+"\\b", 'g');
// 	content = content.replace(re, defines[k]);
// }
fs.writeFileSync('macro-output.smv', content);
