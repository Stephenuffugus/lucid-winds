# LIVING STONES — Spec
## Go Life-and-Death Puzzles (Tsumego)

**Game #20** | Hash Code: `livingstones` | Puzzle | 2-10 min sessions

### The Name
Lithops are real succulents called "living stones." In Go, stones are literally "alive" or "dead." Perfect botanical double meaning.

### What It Is
NOT full Go. Tsumego only — focused life-and-death puzzles. "Find the move that kills white" or "Make your group live." One correct answer (sometimes alternates accepted).

### Competition
Tsumego Pro ($5 iOS), 101weiqi.com (Chinese), OGS puzzles (part of full server). Reddit: "I want clean tsumego without signing up for a full Go server." None have botanical aesthetic or hash integration.

### Go Rule Engine
- Liberty counting via flood-fill group detection
- Capture when group reaches 0 liberties
- Suicide prevention (invalid move if self-capture with no opponent capture)
- Capture-over-suicide (placing into 0 liberties is valid if it captures first)

### Puzzle Bank
- 10 Beginner: 1-move captures, simple eye destruction
- 10 Intermediate: 2-3 move sequences, killing shapes, capture races
- 10 Advanced (partial): complex corners, semeai, large group life/death
- All puzzles validated: board setup legal, solution moves are playable

### 3 Difficulty Levels
Beginner (learn to see eyes), Intermediate (killing shapes), Advanced (ko fights, complex life/death)

### Selector Entry
```javascript
{ id:'livingstones', name:'Living Stones', icon:'⚫', desc:'Go life-and-death puzzles', cat:'strategy', diff:'hard', time:'2-10 min' }
```
