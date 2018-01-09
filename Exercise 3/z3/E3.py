from z3 import *
from math import floor
from pprint import pprint
import itertools
import numbers
import time
from functools import reduce

init("..")

s = Solver()
nStates = 7

Chars = Datatype('Chars')
Chars.declare('a')
Chars.declare('b')
Chars = Chars.create()

States = Datatype('States')
for i in range(0,nStates):
	States.declare('S'+str(i))
States = States.create()

arrows = Function('arrows', States, Chars, States, BoolSort())

initials = Function('initials', States, BoolSort())
finals = Function('finals', States, BoolSort())

id = 0
def getSId():
	global id
	id = id+1
	return 's'+str(id)

def includes(word):
	length = len(word)
	states =		[Const(getSId(), States) for _ in range(0,length+1)]
	thereIsAPath =	And(
						*map(arrows, zip(states[:-1], word, states[1:])),
						initials(states[0]), finals(states[-1])
					)
	return Exists(states, thereIsAPath)
def noOtherOfLen(words, length):
	if -1 == reduce(lambda a, b: a if a==len(b) else -1, words, length):
		raise "Length mismatch"
	if length==0:
		s = Const(getSId(), States)
		return ForAll([s], Not(And(finals(s), initials(s))))
	states =		[Const(getSId(), States) for _ in range(0,length+1)]
	chars =			[Const(getSId(), Chars) for _ in range(0,length)]
	isOneOf =		Or(*[And(*[a==b for a,b in zip(w, chars)]) for w in words])
	thereIsAPath =	And(
						*map(arrows, zip(states[:-1], chars, states[1:])),
						initials(states[0]), finals(states[-1])
					)
	if len(words)==0:
		return ForAll(chars + states, Not(thereIsAPath))
	return And(*[includes(w) for w in words], ForAll(chars,
			ForAll(states, Implies(Not(isOneOf), Not(thereIsAPath)))
		))

a = Chars.a
b = Chars.b

s.add(noOtherOfLen([], 0))
s.add(noOtherOfLen([], 1))
s.add(noOtherOfLen([
	[a,a]
], 2))
s.add(noOtherOfLen([
	[a,b,a],
	[b,a,a]
], 3))
s.add(noOtherOfLen([
	[a,b,a,b],
	[b,a,b,b]
], 4))

s.add(includes([b,a,a,a,a])) # baaaa
s.add(includes([a,a,a,b,a])) # aaaba
s.add(Not(includes([a,b,a,a,a]))) # abaaa

print(s.to_smt2())

print("Check...")
print(s.check())

m = s.model()
# print(Z3_solver_from_string(s.ctx.ref(), s.solver, "(eval (arrows S0 a S1))"))
# s.assert_and_track(expr, nameTracker) !!
# print(s.from_string("(eval (arrows S0 a S1))"))

# print(solve(arrows(States.S0, Inputs.letter(Chars.b), States.S1) == True))

print("""digraph finite_state_machine {
	rankdir=LR;
""")
list_initials = ""
list_finals = ""
for i in range(0,nStates-1):
	sA = 'S'+str(i)
	A = getattr(States, sA)
	if m.evaluate(initials(A)):
		list_initials += " "+sA
	if m.evaluate(finals(A)):
		list_finals += " "+sA

print("""
	node [shape = square]; """ + list_initials + """;
	node [shape = doublecircle]; """ + list_finals + """;
	node [shape = circle];
""")

for i in range(0,nStates-1):
	for j in range(0,nStates-1):
		sA = 'S'+str(i)
		sB = 'S'+str(j)
		A = getattr(States, sA)
		B = getattr(States, sB)
		if m.evaluate(arrows(A, a, B)):
			print("\t"+sA + " -> " + sB + " [ label = \"a\" ];")
		if m.evaluate(arrows(A, b, B)):
			print("\t"+sA + " -> " + sB + " [ label = \"b\" ];")
print("}")

# print("traversing model...")
# for d in m.decls():
    # print("%s = %s" % (d.name(), m[d]))