from z3 import *
from math import floor, nan, inf, log, ceil
from pprint import pprint
import itertools
import numbers
import time
from functools import reduce, cmp_to_key

init("..")

pancakes = [6,2,9,34,5]

def getByIndex(i, l, j=0):
	return If(i==j, l[j], getByIndex(i, l, j+1)) if j < len(l) else -1

def getAfterFlips(i, flips): # i from 0 to n
	if flips==[]:
		return i
	flip = flips[0] # everything <=flip swap 
	return getAfterFlips(If(i <= flip,flip - i,i), flips[1:])
def isFinalSorted(pancakes, flips, s, prefix=""):
	def getNewIndex(i):
		index = getAfterFlips(i, flips)
		s.add(Int(prefix+"index"+str(i)) == index)
		return index
	sPancakes = sorted(pancakes)
	return And(*[
		p == getByIndex(getNewIndex(i), sPancakes)
		for i, p in enumerate(pancakes)])


def tryToSolve(pancakes, nFlips):
	flips = [Int('f'+str(i)) for i in range(0,nFlips)]

	s = Solver()
	s.add(isFinalSorted(pancakes, flips, s))

	for flip in flips:
		s.add(flip >= 0)
		s.add(flip < len(pancakes))

	if str(s.check())!="sat":
		return (False, False)
	return (s.model(), flips)

def find(pancakes, n=0):
	m = False
	flips = []
	while m==False:
		print("Try with "+str(n)+" flips...")
		(m, flips) = tryToSolve(pancakes, n)
		n = n+1
	vflips = [m.get_interp(f) for f in flips]
	print("Flips:", vflips)
	indexes = [m.get_interp(Int("index"+str(i))) for i in range(0, len(pancakes))]
	print("Indexes:", indexes)
	print("Resulting", [pancakes[int(str(i))] for i in indexes])

	for k in m.decls():
		print(k, m.get_interp(k))

	npancakes = [i for i in pancakes]
	print("")
	ff = lambda s: "{"+str(list(reversed(s)))[1:-1]+"}"
	pp = lambda s, i: print("\\begin{tikzpicture}\\makeallpancakething"+ff(s)+"{10cm}{"+str(len(pancakes) - i)+"}\\end{tikzpicture}~\\\\~\\\\")
	for flipstr in vflips:
		flip = int(str(flipstr)) + 1
		pp(npancakes, flip)
		npancakes[0:flip] = reversed(npancakes[0:flip])
	pp(npancakes, 100)

# tryToSolve([2, 4, 3, 1, 5]m)

# find([2, 4, 3, 1, 5])
find([2, 4, 3, 6, 1, 5])
# find([2, 4, 3, 1, 5], 8)

# [9,8,7,6]   [0,1,2,3]
# [7,8,9,6]   [2,1,0,3] <-{2}
# [8,7,9,6]   [1,2,0,3] <-{1}
# print((getAfterFlips(1, [2,1])))
# print(simplify(getAfterFlips(0, [2,1]))) {9} -> pos 2 sorted[2] = 9
# print(simplify(getAfterFlips(1, [2,1]))) {8} -> pos 0 sorted[0] = 8
# print(simplify(getAfterFlips(2, [2,1]))) {7} -> pos 1 sorted[1] = 7
# print(simplify(getAfterFlips(3, [2,1]))) {6} -> pos 3 sorted[3] = 6
