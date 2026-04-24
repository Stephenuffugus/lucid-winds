// ═══ LUCID WINDS — Sprout (5-letter word puzzle) ═══
// 6 guesses to find the hidden 5-letter word.
//   Green  = right letter, right position
//   Gold   = right letter, wrong position
//   Muted  = letter not in the word
// Modes: DAILY (same word for everyone that day) and RANDOM (unlimited).
// Streak persists across sessions. Share button copies an emoji grid.
// On-screen QWERTY + hardware keyboard support.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

// ── SOLUTIONS: words that CAN be the hidden answer. ~700 common English
// 5-letter words; bias away from plurals ending in S and rare archaic forms.
var SOLUTIONS=('about above abuse actor acute admit adopt adult after again agent agile agree ahead aimed alarm album alert alien alike alive allow alloy alone along aloof alpha altar alter among ample anger angle angry ankle apart apple apply arbor ardor arena argue arise armed armor aroma arose arrow aside asked asset audio audit avoid awake award aware awful badge badly baked baker baler banjo basic basil basin basis batch beach beads beams beans beard beast began begin being belie bells below belts bench bends berry bible bicep bikes binds binge birch birds birth black blade blame bland blank blare blast blaze bleak bleat blend bless blind bliss block blond blood bloom blown blues bluff blunt blurt blush board boats bobby bodes bogey boils bolts bonds bones bonus boost booth booty boozy bored born bosom bossy botch bough boulder bound bowed bowel bower bowls boxed boxer brace brain brake bran branch brass brave bread break breed brews briar brick bride brief brine bring brink briny brisk broad brook broom broth brown brunt brush brute buddy bugle build built bulge bulky bunch bunny burly burnt burst bused bushy busts butch buxom buyer cabal cabin cable cacao cadet cagey cairn camel cameo candy canny canoe caper carat cargo carol carry carve casts catch cater caulk cause cedar cello chafe chain chair chalk champ chant chaos chard charm chart chase chasm cheap cheat check cheek cheer chess chest chick chide chief child chili chill chime china chirp chock choir choke chord chore chose chuck chump chunk churn chute cider cigar cinch cinder circa civic civil clack claim clamp clang clank clash clasp class clean clear cleat cleft clerk click cliff climb clime cling clink clock clone close cloth cloud clove clown cluck clued clump clung coach coast cobra cocoa comet comfy comic comma conch condo coral corks corny couch cough could count court coven cover covet covey cower coyly craft cramp crane crank crash crass crate crave crawl craze crazy creak cream credo creed creek creep creme crepe crept cress crest crick cried crier crime crimp crisp croak crock crony crook cross crowd crown crude cruel crumb crump crunch crush crust crypt cubby cubic cumin curio curly curry curse curve curvy cushy cynic daily dairy daisy dance dandy dated dealt death debar debit debug debut decal decay decor decoy decry deeds deign deity delay delta delve demon depth derby deter devil devon diary digit diner dines dingo dingy dirge dirty ditch ditty diver dizzy dodge doing dolls donor donut doped dough douse dowdy dowel downs dowry dozen draft drain drake drama drank drape drawl drawn dread dream dress dried drier drift drill drink drive droll drone drool droop dross drove drown druid drunk dryer dryly duchy dully dummy dunce dusky dusty dutch dwarf dwell dwelt dying eager eagle early earth eased eaten eater ebony eerie eight eject elate elbow elder elect elegy elfin elite elope elude email embed ember emcee empty enact ended endow enemy enact enjoy enter entry envoy epoch epoxy equal equip erase error erupt essay ester ether ethic evade evoke exact exalt excel exile exist extol extra exude fable facet faced faint fairy faith false fancy farms farts fatty fault faulty fawns feast fence feral ferry fetch fever fewer fiber field fiery fifth fifty fight filet filed filly filmy final finch fined fires first fishy fives fixed fizzy fjord flail flair flake flaky flame flank flare flash flask fleck fleet flesh flick flier fling flint flirt float flock flood floor flora floss flour flout flown fluff fluid flume flung flunk flush flute flyer foamy focal focus foggy foist folks folly foods force forge forgo forks forth forty forum found fount fower foyer frail frame frank fraud fresh fried frill frisk frock frond front frost froth frown froze fruit fudge fully fungi funky funny furor furry fussy fuzzy gaffe gaily gamer gamut gassy gaudy gauge gaunt gauze gavel gawky gazed gears geeky geese genie genre ghost ghoul giant gifts gipsy girls girth given giver glade glare glass glaze gleam glean glide gloat globe gloom glory gloss glove glows glued gnash gnome godly going golly goody goose gorge gouge gourd grace grade graft grail grain grand grant grape graph grasp grass grate grave gravy graze great greed green greet grief grill grime grimy grind gripe gritty groan groin groom gross group grout grove growl grown gruel gruff grump grunt guard guava guess guest guide guild guile guilt guise gulch gulls gully gulps gumbo gummy guppy gushy gussy gusts gutsy gypsy habit hairy halls halve handy happy hardy harms harps harry harsh haste hasty hatch hater haunt haven havoc hazel heads heaps heard heart heats heath heave heavy hedge hefty heirs helix hello hence henna herbs hertz hicks hilly hinge hippy hissy hitch hives hoard hobby hoist holds holes holly honey honor hoped hopes horde horns horse hosed hosts hotel hotly hound house hover howdy howls hubby human humid humor humph hunch hunks hurry hurts husky hymns hyper ideal ideas idiom idiot idler idols igloo image imbue impel imply inane inbox incur index inept inert infer ingot inlet inner input inset intro iodic ionic irate irony islet issue itchy ivory jaded jagged jaunt jazzy jeans jelly jerky jersey jester jewel jiffy joint joist joker jolly joust joyed judge juice juicy julep jumbo jumps jumpy junky jurors kaput karma kayak kebab kebob kelpy kempt khaki kicks kicky kiddo kills kilns kilts kinda kinds kings kinks kinky kiosk kitty knack knave kneed kneel knelt knife knits knobs knock knoll knots known koala label labor laced laden ladle laity lakes lance lanky lapel lapse large larva laser later laugh layer leafy leaks leant leapt learn lease leash least leaves ledge leech leers lefty legal legit lemon lemur leper level lever libel liege light liked likes lilac limbo limbs limes limit linen linens liner linens lingo links lions lipid liver livid living llama loads loamy loans loath lobby local locus lodge lofty logic loins loopy loose loped lords lores loser losty loudly lousy loved lover lower loyal lucid lucky lumen lumpy lunar lunch lunge lupus lusty lying lymph lyric macaw macho macro madam madly mafia magic magma maize major maker mamba mango mangy mania manic manor maple march marsh marts masks match mated maths matte mauve mayor mazes meant meats medal media melee melon meowed mercy merge merit merry metal meter metro midst might mince miner minim minor minty minus mirth missy misty mixed mixer moats mocks modal model modem mogul moist molar moldy molds money month moody moons moose moped moral moral morph morsel mosaic moss mossy motel motif motor motto mound mount mourn mouse mousy mouth moves mover movie mucky mucus muddy mulch mules mummy munch mural mused music musky mussy musty muter mutes muzzy myrrh myths nadir naive naked nanny nappy nasal nasty natal naval navel nears necks needs needy neigh nerds nerdy nerve never newer newly newts nicer niche niece nicks night nines ninja ninny ninth noble nodes noise noisy nomad noose north nosed noses notch noted notes novel nudge nurse nutty nylon nymph oases obese occur ocean octal octet odder odium offal offer often ogled olden older olive ombre omega onset oozes opals opens opera opine opium optic orbit order organ other otter ouchy ought ounce outdo outed outer outgo owing owned owner oxide ozone paces paddy pagan pages paint paled paler palms panda panel panic panko pansy pants papal paper parch parry parse party pasta paste pasty patch pater patio patty pause payer peace peach pearl pearly pecan pedal penal perch peril perky pesky pesto petal petty phase phone phony photo phyla piano picks picky piece piers pigmy pilaf piles pinch pined pines pinks pinky pinto piped piper pipes pique pitch pithy piths pitta pivot pixel pixie pizza place plaid plain plait plane plank plans plant plate plats playa plays plaza plead pleat plied plies pliers plops plots plowed plows pluck plugs plumb plume plump plums plunk plush poesy point poise poked poker poles polka polls polyp ponds pooch poppy porch pored pores pores porky posed poser poses posit posts pouch pound pours pouts power prank prawn press price prick pride pried prier prime primp print prior prism privy prize probe prone prong proof prose prosy proud prove prowl proxy prude prune psalm psych pubic puddly puffs puffy pugs pulls pulpy pulse pumas punch punts puppy puree purer purse pushy putty pygmy quack quaff quail quake qualm quark quart quash quasi quays queen queer quell query quest queue quick quiet quill quilt quint quirk quirky quite quits quiver quote rabbi rabid racer radar radii radio rainy raise rally ranch random range rangy rants rapid rapper rarer raspy rated rater rates ratio ravel raven raver raves rayon razor reach react ready realm reams reaps rebar rebel rebid rebus recap recur redo reds reedy reefs reeks reels reign reins relax relay relic remit renew repay repel reply reran rerun reset resin retch retro rhino rhyme rider rides ridge rifle right rigid rimes rings rinks rinse rioter ripen risen riser risks ritzy rival river rivet roach roads roams roast roast robes robin robot rocks rocky rodeo roger rogue roles rolls roman rooms roomy roots ropes roses rotor rough round rouse route rover rowed royal ruddy rugby ruins ruled ruler rumba runes rungs runts runty rupee rural rustic rusty ruths saber sable sadly safer saint salad sales sally salon salsa salts salty salve salvo sandy saner sappy sassy sated satin satyr sauce saucy saute saved saver savor savvy scale scalp scaly scamp scant scare scarf scary scene scent scoff scold scone scoop scope score scorn scour scout scowl scram scrap scree screw scrub scrum scuba sects sedan seedy seeds seeks seems sensed sepia serve setup seven sever shack shade shady shaft shake shaky shale shall shalt shame shank shape shard share shark sharp shave shawl sheaf shear sheds sheen sheep sheer sheet sheik shelf shell shied shift shine shiny ships shire shirk shirt shoal shock shone shook shoot shops shore shorn short shove shown shows shrew shrug shuck shunt shush shyer shyly siege sieve sight sigma sills silky silly since sinew singe sings sinks sired sires sissy sixes sixth sixty sized sizes skate skewed skier skies skiff skill skinks skirt skulk skull skunk slack slain slang slate slather slaty slave sleek sleep sleet slept slice slick slide slime slimy sling slink sloop slope slops slosh sloth slugs slump slung slunk slurs slush slyly small smart smash smear smell smelt smile smirk smite smith smock smoke smoky smote smuggle snack snail snake snaky snaps snare snarl sneak sneer sniff snipe snips snoop snore snort snout snows snowy snuck snuff soapy soars sober socks sodas sofas soggy solar solid solve sonar sonic sorry sorts sough sound soupy south sowed sower space spade spank spark spasm spawn spays speak spear specs spell spelt spend spent sperm spice spicy spied spiel spies spike spiky spill spilt spine spiny spire spite split spoil spoke spoof spook spool spoon spore sport spout spray spree sprig spuds spunk spurn spurs sputum squab squad squat squib stack staff stage staid stain stair stake stale stalk stall stamp stand stank stark stars start stash state stave stead steak steal steam steed steel steep steer stein stems step stern stews stick stiff still stilt sting stink stint stirs stock stoic stoke stole stomp stone stony stood stool stoop store stork storm story stoup stout stove stows strap straw stray strep strew strip strut stubs stuck study stuff stump stung stunk stunt style suave sucks sudsy suede sugar suing suite suits sulky sully sumac sunny super surer surge surly sushi swami swamp swans swarm swath swats sweat sweep sweet swell swept swift swill swims swine swing swipe swirl swish swoon swoop sword swore sworn swung synod syrup table taboo tacit tacky taffy taint taken taker tales tally talus tamed tamer tangy tank tarot tarts taste tasty tatty taunt taupe tavern tawny taxed taxer tease teddy teens teeny teeth telly tempo tempt tenet tenor tense tenth tepee tepid terms terns terra terse testy thank thaws theft their theme there these theta thick thief thigh thine thing think third thirty thong thorn those three threw throb throw thrum thuds thumb thump thyme tiara tibia tidal tides tiers tiger tight tilde tiled tiles tilts timed times timid tipsy tired tires titan tithe title toady toast today toddy toffee toga token tombs tonal tonic tooth topaz topic toppy torch torso torus total totem touch tough towed tower towns toxic toxin trace track tract trade trail train trait tramp trans trash trawl tread treat trees trend tress trial tribe trice trick tried trier tries trill trims tripe trite troll troop trope trout trove truce truck truer truly trump trunk truss trust truth tryst tubal tubby tuber tulip tulips tunas tuner tunes tunic turbo turds turfs turfy turns tusks tutor tweak tweed tweet twelve twice twigs twine twins twirl twist twits twixt tying typed typos ulcer ultra umbra uncap uncle uncut under undid undue unfed unfit unify union unite units unity unjam unlit unmet unrig unset until unwed unzip upend upper upset urban urged urges usage users usher using usual usurp utile utter vague vales valet valid valor value valve vapid vapor vault vaunt veers vegan veins velar venom vents venue verb verge verse verso verve vests vexed vexes vial vibes video views vigil vigor villa vines vinyl viola viper viral virus visas vises visit vista vital vivid vixen vocal vodka vogue voice voila volts voted voter votes vouch vowed vowel vying wacky waddy wafer wager wages wagon wails waist waits waive waked waken walks walls waltz waned waney wanly wants wards wares warts warty waste watch water waved waver waves waxed waxen waxes weary weave webby wedge weeds weeks weepy weigh weird welds wells welsh welts wench wends whack whale wharf wheat wheel where which whiff while whims whine whiny whirl whirr whisk whist white whole whoop whose wicks widen wider width wield wiles wilts wince winch winds windy wines winey wines wings winks wiper wipes wires wiry wise wisp witch withe witty wived wiver wives wizen woken wolfs woman women woods woody wooed woofs wooly woozy wordy works world worms wormy worry worse worst worth would wound woven wraith wrath wreck wrens wrest wring wrist write writs wrong wrote wrung wryly yacht yards yarns yawns yawps years yeast yeesh yield yodel yoked yokel yokes yolks young yours youth yowls yucca yucky zaped zappy zebra zeros zests zesty zeta zilch zings zippy zlotys zonal zoned zones zoner zooms').split(/\s+/);

// ── VALID GUESSES: additional accepted inputs. Plurals, archaic variants,
// less common but real English 5-letter words. These are NEVER the answer.
var EXTRA_GUESSES=('aahed aalii aargh abaca abaci aback abafts abamp abase abash abate abaya abbey abbot abeam abets abhor abide abled abler ables abode abort abuzz abyes abyss acing acini acned acnes acorn acrid acted actin acyls adage added adder addle adepts adieu adios adits adobe adobo adore adorn adown adozen adult adzed adzes aegis aerie aeons affix afire afoot afore afoul afros after agave agazed agene agers aggie aggro aghas aging agist agita aglow agone agora agree ahead ahems ahold aided aides aides aimed aimer aioli aired airer aisle aitch aitus ajuga alack alamo alans alarm alary alate albas album alcid alder aldol alecs aleph alert alfas algal algas algid algin algum alias alibi alien align alike alist alive aliya alkyd alkyl allay allee alley allow alloy aloes aloft aloha alone along aloof aloud alpha altar alter altho altos alums alway amahs amass amaze ambit amble ambos ameba amebi amend amens amide amido amids amies amiga amigo amine amino amirs amiss amity ammon amnio amoks among amore amort amour amped ample amply ampul amuck amuse amyls anchor ancon andro anear anele anent angel anger angle angst anile anils anima anime animi anion anise ankhs ankle annal annas annex annoy annul anode anole anoles antae antas anted antes antic antis antra antre antsy anvil aorta apace apart apeak apeek apers aphid aphis apian aping apish aplomb apnea apogee apols apped apple apply apres april apron apses apsis apter aquas aquae arabs araks arbor arced arcos arcus areal areas areca areic arena arene arepa arete argal argil argle argon argosy argot argue argus arhat arias ariel arils arise aroma arose arrow arsed arsen arson artsy arums aryls asana ascot aside asked asker askew aspen aspic assai assay assed asses asset aster astir asura asway aswim atlas atman atoll atoms atomy atone atria atrip attar audio audit auger aught augur aunts aunty aurae aural auras auric aurum autos auxin avail avant avast avens avers aviso avoid avows await awake award aware awash awful awoke axels axial axile axils axing axion axles axman axmen ayahs ayins azans azide azido azine azlon azole azons azoth azuki azure baaed baals babas babes babka baboo babul babus bacon badge bads badly bagel baggy bails bairn baith baiza baize baked baker bakes balas balds baldy baled baler bales balks balky balls balmy banal bancs banco banda bands bandy banes bangs banjo banks bantu banty barbe barbs barca bards bared barer bares barfs barge baric barks barky barms barmy barns barny baron baser bases basha basic basil basin basis basks basso bassy baste bated bates bathe baths batik bats batty bawds bawdy bawls bayed bayou bazar beach beads beady beaks beaky beams beany bears beast beats beaus beaut beavy beccos becks bedel bedew bedim beech beefs beefy beers beery beets beggar begin begot begum beige being belay belch belie bells belly below belts bemix bemoan bench bends bendy benes benny bents beret berms berth beryl beset besom bests betas betel bethel betel bevel bezel bhang bialy bibbs bible bicep bided bides bidet bield biers biffs bigly bigos bijou biked biker bikes bikie bilbo biles bilge bilgy bills billy bimah bimbo binal binds binge bingo binit biome bionic biota biped birch birds birls birrs birth bison bitch biter bites bitsy bitty blabs black blade blah blame bland blank blare blase blast blats blaze bleak blear bleat blebs bleed bleep blend blent bless blest blimp blind blini blink blips bliss blitz bloat blobs block blocs blogs bloke blond blood bloom blots blown blows blued bluer blues bluey bluff blunt blurb blurs blurt blush blype boars boars boast boats bobby bocce bocci bocks bodes boded bodes boffo bogan bogey boggy bogie bogus bohea boils boing boite bolas boles bolls bolos bolts boma bombe bombo bombs bonds boned boner bones boney bongo bongs bonks bonny bonus bonzo booby booed books boomy boons boors boost booth boots booty booze boozy boppy borax bored borer bores boric boron borsh borts bosky bosns bosom boson bossa bossy bosun botch botel boths bough boules bound bourn bouse bousy bouts bovid bovine bower bowed bowel bower bowls boxer boxes boxier boxy boyar boyla boyos bozos braai brace bract brads braes brags braid brain brake brand brans brant brash brass brats brava brave bravo brawl brawn brays braze bread break bream breast breath breed brews briar bribe brick bride brief brier brigs briny brisk broad broch brock broil broke broll bronc broods brook broom broth brown brows brrrs brunch brung brunt brush brusk brute bubba bubby buchu bucko bucks buddy budge buffo buffs buffy buggy bugle bugs build built bulge bulgy bulks bulky bulls bully bumfs bumph bumps bumpy bunch bunco bundt bundy bungs bungy bunko bunks bunks bunny bunts bunya buoys burak buran buras burds burgh burgs burin burls burly burns burnt burps burqa burro burrs burry bursa burse burst bused buses bushy busks busty butch butes butle butte butts butty butyl buxom buyer buzzy byres bylaw byway').split(/\s+/);

(function injectStyle(){
  if(document.getElementById('pw-petal-style'))return;
  var s=document.createElement('style');s.id='pw-petal-style';
  s.cssText=[
    '.pw-stage{display:flex;flex-direction:column;align-items:center;gap:10px;padding:6px 6px 14px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;}',
    '.pw-board{display:grid;grid-template-columns:1fr;gap:8px;padding:6px 0;width:min(380px,94vw);margin:0 auto;}',
    '.pw-row{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:100%;}',
    '.pw-cell{aspect-ratio:1;width:100%;border:2.5px solid rgba(74,124,53,0.5);background:rgba(13,16,12,0.7);color:var(--cream,#e8dcc8);font-family:Bebas Neue,sans-serif;font-size:clamp(1.9rem,8vw,2.8rem);font-weight:400;display:flex;align-items:center;justify-content:center;text-transform:uppercase;border-radius:10px;transition:background .28s ease,border-color .28s ease,color .28s ease,transform .1s ease;line-height:1;user-select:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 2px 0 rgba(0,0,0,0.3);box-sizing:border-box;}',
    '.pw-cell.pw-typed{border-color:rgba(200,168,75,0.8);box-shadow:0 0 12px rgba(200,168,75,0.25);}',
    '.pw-cell.pw-active{border-color:rgba(200,168,75,0.65);box-shadow:inset 0 0 0 1px rgba(200,168,75,0.25);}',
    '.pw-cell.pw-hit{background:var(--sage,#7ab356);border-color:var(--sage,#7ab356);color:#0d100c;}',
    '.pw-cell.pw-near{background:var(--gold,#c8a84b);border-color:var(--gold,#c8a84b);color:#0d100c;}',
    '.pw-cell.pw-miss{background:rgba(40,44,36,0.85);border-color:rgba(60,68,54,0.85);color:rgba(232,220,200,0.55);}',
    '.pw-flip{animation:pwFlip .6s ease both;}',
    '@keyframes pwFlip{0%{transform:rotateX(0)}45%{transform:rotateX(90deg)}55%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}',
    '.pw-shake{animation:pwShake .42s ease;}',
    '@keyframes pwShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}35%{transform:translateX(6px)}55%{transform:translateX(-3px)}75%{transform:translateX(3px)}}',
    '.pw-ctrls{display:flex;gap:10px;justify-content:center;padding:2px 0 4px;width:100%;}',
    '.pw-ctrl{flex:1;max-width:200px;min-height:52px;border:1.5px solid rgba(122,179,86,0.4);background:rgba(26,31,23,0.85);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.16em;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:8px;}',
    '.pw-ctrl:active{transform:scale(0.96);background:rgba(122,179,86,0.2);}',
    '.pw-ctrl.primary{background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.6);color:#c8e09b;}',
    '.pw-howto{font-family:DM Mono,monospace;font-size:0.72rem;color:var(--cream);background:rgba(26,31,23,0.5);border:1px solid rgba(122,179,86,0.25);border-radius:8px;padding:7px 12px;margin:2px auto;max-width:420px;text-align:center;line-height:1.4;letter-spacing:0.02em;}',
    '.pw-howto strong{color:var(--gold);}',
    '.pw-msg{font-family:DM Mono,monospace;font-size:0.76rem;color:var(--gold,#c8a84b);text-align:center;min-height:1.4em;letter-spacing:0.06em;padding:2px 0;}',
    '.pw-modebar{display:flex;justify-content:center;gap:6px;padding:4px 0;}',
    '.pw-modebtn{padding:6px 14px;background:rgba(26,31,23,0.7);border:1px solid rgba(122,179,86,0.3);border-radius:6px;color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.14em;cursor:pointer;transition:background .2s ease;}',
    '.pw-modebtn.active{background:rgba(122,179,86,0.25);border-color:rgba(122,179,86,0.7);color:#c8e09b;}',
    '.pw-stats{display:flex;justify-content:center;gap:14px;padding:2px 0 4px;font-family:DM Mono,monospace;font-size:0.68rem;color:rgba(232,220,200,0.75);letter-spacing:0.06em;}',
    '.pw-stats strong{color:var(--gold);}',
    '.pw-result{margin:8px auto;padding:10px 14px;max-width:380px;background:rgba(13,16,12,0.85);border:1.5px solid rgba(122,179,86,0.35);border-radius:9px;text-align:center;font-family:DM Mono,monospace;font-size:0.78rem;color:var(--cream);}',
    '.pw-result strong{color:var(--gold);display:block;font-family:Bebas Neue,sans-serif;font-size:1.05rem;letter-spacing:0.1em;margin-bottom:4px;}',
    '.pw-share{margin-top:8px;padding:8px 16px;background:rgba(122,179,86,0.2);border:1px solid rgba(122,179,86,0.5);color:#c8e09b;border-radius:6px;cursor:pointer;font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.14em;}',
    '.pw-share:active{background:rgba(122,179,86,0.35);}',
    '.pw-hidden-input{position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;border:0;padding:0;font-size:16px;}'
  ].join('');
  document.head.appendChild(s);
})();

// Build merged set for guess validation (solutions + extras)
var VALID_SET=null;
function buildValidSet(){
  if(VALID_SET)return VALID_SET;
  var seen={};
  for(var i=0;i<SOLUTIONS.length;i++){var w=SOLUTIONS[i].toLowerCase();if(w.length===5)seen[w]=1;}
  for(var j=0;j<EXTRA_GUESSES.length;j++){var e=EXTRA_GUESSES[j].toLowerCase();if(e.length===5)seen[e]=1;}
  VALID_SET=seen;
  return seen;
}
// Dedupe + validate solutions as unique 5-letter words
(function(){var seen={},out=[];for(var i=0;i<SOLUTIONS.length;i++){var w=SOLUTIONS[i].toLowerCase();if(w.length===5&&!seen[w]){seen[w]=1;out.push(w);}}SOLUTIONS=out;})();

// Daily word: derive index from date using a small FNV-style hash
function dailyIndex(){
  var d=new Date();
  var s=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  var h=2166136261;
  for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=(h*16777619)>>>0;}
  return h%SOLUTIONS.length;
}
function todayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}

function loadStats(){
  var stats={streak:0,best:0,lastDay:'',winsByRow:[0,0,0,0,0,0],played:0,won:0};
  try{
    var raw=localStorage.getItem('lw_sprout_stats');
    if(raw){var p=JSON.parse(raw);for(var k in p)stats[k]=p[k];}
  }catch(e){}
  return stats;
}
function saveStats(s){try{localStorage.setItem('lw_sprout_stats',JSON.stringify(s));}catch(e){}}
function loadDaily(){
  try{
    var raw=localStorage.getItem('lw_sprout_daily');
    if(raw){var p=JSON.parse(raw);if(p.day===todayKey())return p;}
  }catch(e){}
  return null;
}
function saveDaily(d){try{localStorage.setItem('lw_sprout_daily',JSON.stringify(d));}catch(e){}}

window._gameFns=window._gameFns||{};
window._gameFns.sprout=function GPW(a){
  buildValidSet();
  var answer='',row=0,col=0,grid=[],done=false;
  var keyState={};
  var mode='daily';
  var rowStatuses=[]; // per submitted row: array of 'hit'|'near'|'miss'
  var rowGuesses=[];  // per submitted row: the 5-letter guess as lowercase string
  var stats=loadStats();

  ms(a,'Guess: <strong id="PWg">0</strong>/6 · streak <strong id="PWstreak">'+stats.streak+'</strong>');
  mm(a,'Find the 5-letter word');

  var stage=document.createElement('div');stage.className='pw-stage';a.appendChild(stage);

  var modeBar=document.createElement('div');modeBar.className='pw-modebar';
  modeBar.innerHTML='<button class="pw-modebtn" data-m="daily">DAILY</button><button class="pw-modebtn" data-m="random">RANDOM</button>';
  stage.appendChild(modeBar);

  var statsRow=document.createElement('div');statsRow.className='pw-stats';
  statsRow.id='PWstats';
  stage.appendChild(statsRow);

  var howto=document.createElement('div');howto.className='pw-howto';
  howto.innerHTML='Type 5 letters, tap <strong>ENTER</strong>. <strong style="color:#7ab356">Green</strong> = right spot. <strong style="color:#c8a84b">Gold</strong> = wrong spot.';
  stage.appendChild(howto);
  var wrap=document.createElement('div');wrap.className='pw-board';wrap.id='PWboard';stage.appendChild(wrap);
  var msg=document.createElement('div');msg.className='pw-msg';msg.id='PWmsg';stage.appendChild(msg);

  // Hidden input drives the native device keyboard on mobile. Focusing it
  // pops up iOS/Android keyboard; on desktop it quietly collects keystrokes
  // via keydown below.
  var hiddenIn=document.createElement('input');
  hiddenIn.className='pw-hidden-input';
  hiddenIn.setAttribute('autocomplete','off');
  hiddenIn.setAttribute('autocorrect','off');
  hiddenIn.setAttribute('autocapitalize','off');
  hiddenIn.setAttribute('spellcheck','false');
  hiddenIn.setAttribute('inputmode','text');
  hiddenIn.setAttribute('type','text');
  hiddenIn.setAttribute('maxlength','5');
  hiddenIn.setAttribute('aria-label','Type your guess');
  stage.appendChild(hiddenIn);

  var ctrlRow=document.createElement('div');ctrlRow.className='pw-ctrls';
  var delBtn=document.createElement('button');delBtn.className='pw-ctrl';delBtn.innerHTML='⌫ DELETE';delBtn.type='button';
  var enterBtn=document.createElement('button');enterBtn.className='pw-ctrl primary';enterBtn.innerHTML='⏎ ENTER';enterBtn.type='button';
  ctrlRow.appendChild(delBtn);ctrlRow.appendChild(enterBtn);
  stage.appendChild(ctrlRow);

  var resultHost=document.createElement('div');resultHost.id='PWresult';stage.appendChild(resultHost);

  mc(a).innerHTML='<button class="gb" onclick="window._PWNew()">🔄 NEW</button>';

  function focusInput(){
    if(done)return;
    try{hiddenIn.focus({preventScroll:true});}catch(_){try{hiddenIn.focus();}catch(__){}}
  }
  // Tapping anywhere on the stage re-focuses the input so the native
  // keyboard comes back if it closed. Use mousedown/touchstart so the
  // focus happens inside the user-gesture window.
  stage.addEventListener('mousedown',function(e){
    if(e.target===delBtn||e.target===enterBtn||e.target.closest('.pw-modebtn'))return;
    setTimeout(focusInput,0);
  });
  stage.addEventListener('touchstart',function(e){
    if(e.target===delBtn||e.target===enterBtn||e.target.closest('.pw-modebtn'))return;
    setTimeout(focusInput,0);
  },{passive:true});

  delBtn.addEventListener('click',function(e){e.preventDefault();deleteLetter();focusInput();});
  enterBtn.addEventListener('click',function(e){e.preventDefault();submitGuess();focusInput();});

  // Normalize the hidden input on every keystroke so mobile browsers that
  // fire 'input' instead of 'keydown' still work.
  hiddenIn.addEventListener('input',function(){
    var v=(hiddenIn.value||'').toLowerCase().replace(/[^a-z]/g,'');
    // Snap the row to match what's currently in the input
    syncFromInput(v);
  });

  modeBar.addEventListener('click',function(e){
    var t=e.target;
    if(t.className&&t.className.indexOf('pw-modebtn')>=0){
      mode=t.getAttribute('data-m');
      _PWNew();
    }
  });

  function updateModeUI(){
    var btns=modeBar.querySelectorAll('.pw-modebtn');
    for(var i=0;i<btns.length;i++){
      if(btns[i].getAttribute('data-m')===mode)btns[i].classList.add('active');
      else btns[i].classList.remove('active');
    }
  }
  function updateStatsRow(){
    var winPct=stats.played?Math.round(stats.won/stats.played*100):0;
    statsRow.innerHTML='played <strong>'+stats.played+'</strong> · won <strong>'+winPct+'%</strong> · streak <strong>'+stats.streak+'</strong> · best <strong>'+stats.best+'</strong>';
    var sEl=document.getElementById('PWstreak');if(sEl)sEl.textContent=stats.streak;
  }

  function pickWord(){
    if(mode==='daily'){return SOLUTIONS[dailyIndex()];}
    return SOLUTIONS[Math.floor(Math.random()*SOLUTIONS.length)];
  }

  function buildBoard(){
    // Belt-and-suspenders layout: every structural rule is set inline so
    // it survives even when the injected <style> block fails to apply
    // (Stephen hit this on his phone — cells rendered as plain letters
    // stacking vertically). Color state (hit/near/miss) is also set
    // inline during submitGuess, so the game never depends on the CSS
    // classes for any visible effect.
    wrap.innerHTML='';grid=[];rowStatuses=[];
    wrap.style.cssText='display:grid;grid-template-columns:1fr;gap:8px;padding:6px 0;width:min(420px,96vw);margin:0 auto;box-sizing:border-box;';
    for(var r=0;r<6;r++){
      var rowEl=document.createElement('div');rowEl.className='pw-row';
      rowEl.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:100%;box-sizing:border-box;';
      var cells=[];
      for(var c=0;c<5;c++){
        var cell=document.createElement('div');cell.className='pw-cell';
        cell.style.cssText='aspect-ratio:1;width:100%;box-sizing:border-box;border:2.5px solid rgba(74,124,53,0.5);background:rgba(13,16,12,0.7);color:#e8dcc8;font-family:Bebas Neue,sans-serif;font-size:clamp(1.8rem,7.5vw,2.6rem);font-weight:400;display:flex;align-items:center;justify-content:center;text-transform:uppercase;border-radius:10px;transition:background .28s ease,border-color .28s ease,color .28s ease;line-height:1;user-select:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 2px 0 rgba(0,0,0,0.3);';
        rowEl.appendChild(cell);cells.push(cell);
      }
      wrap.appendChild(rowEl);grid.push(cells);
    }
  }

  function showMsg(t){msg.textContent=t;}

  // Apply hit/near/miss colors inline so the game is legible even when
  // the injected stylesheet is blocked. Inline wins class specificity.
  function applyStatusStyle(cell,st){
    if(st==='hit'){cell.style.background='#7ab356';cell.style.borderColor='#7ab356';cell.style.color='#0d100c';}
    else if(st==='near'){cell.style.background='#c8a84b';cell.style.borderColor='#c8a84b';cell.style.color='#0d100c';}
    else if(st==='miss'){cell.style.background='rgba(40,44,36,0.85)';cell.style.borderColor='rgba(60,68,54,0.85)';cell.style.color='rgba(232,220,200,0.55)';}
  }

  // Mark which cell has the "active" cursor glow (just the next-empty cell
  // in the current row).
  function markActive(){
    if(!grid[row])return;
    for(var c=0;c<5;c++){
      var cell=grid[row][c];if(!cell)continue;
      if(c===col) cell.classList.add('pw-active');
      else cell.classList.remove('pw-active');
    }
  }

  function typeLetter(ch){
    if(done||row>=6||col>=5)return;
    var cell=grid[row][col];
    cell.textContent=ch;
    cell.classList.add('pw-typed');
    col++;
    markActive();
    _play('tap');
  }

  function deleteLetter(){
    if(done||col<=0)return;
    col--;
    var cell=grid[row][col];
    cell.textContent='';
    cell.classList.remove('pw-typed');
    markActive();
    // Also trim the hidden input so native keyboard stays in sync
    if(hiddenIn.value.length>col)hiddenIn.value=hiddenIn.value.slice(0,col);
  }

  // Keep the visible row synced with whatever's in the hidden input.
  // Handles paste, autocorrect interference, and the generic 'input' event.
  function syncFromInput(v){
    if(done)return;
    v=(v||'').slice(0,5);
    // Rebuild the current row from v
    for(var c=0;c<5;c++){
      var cell=grid[row][c];if(!cell)continue;
      if(c<v.length){
        cell.textContent=v[c];
        cell.classList.add('pw-typed');
      } else {
        cell.textContent='';
        cell.classList.remove('pw-typed');
      }
    }
    col=v.length;
    markActive();
  }

  function shakeRow(r){
    for(var c=0;c<5;c++){
      grid[r][c].classList.add('pw-shake');
      (function(cell){setTimeout(function(){cell.classList.remove('pw-shake');},440);})(grid[r][c]);
    }
  }

  function buildGuess(){
    var g='';for(var c=0;c<5;c++)g+=(grid[row][c].textContent||'').toLowerCase();
    return g;
  }

  function submitGuess(){
    if(done)return;
    if(col<5){showMsg('Need 5 letters');shakeRow(row);return;}
    var guess=buildGuess();
    if(!VALID_SET[guess]){showMsg('Not in word list');shakeRow(row);return;}
    showMsg('');
    var status=['miss','miss','miss','miss','miss'];
    var ansArr=answer.split('');
    var taken=[false,false,false,false,false];
    for(var c=0;c<5;c++){if(guess[c]===ansArr[c]){status[c]='hit';taken[c]=true;}}
    for(var c=0;c<5;c++){
      if(status[c]==='hit')continue;
      for(var k=0;k<5;k++){if(!taken[k]&&guess[c]===ansArr[k]){status[c]='near';taken[k]=true;break;}}
    }
    rowStatuses.push(status.slice());
    rowGuesses.push(guess);
    // Freeze the hidden input during the flip reveal so late keystrokes
    // don't bleed into the next row.
    hiddenIn.blur();hiddenIn.value='';
    for(var c=0;c<5;c++){
      (function(c){
        setTimeout(function(){
          var cell=grid[row][c];
          cell.classList.add('pw-flip');
          cell.classList.remove('pw-typed','pw-active');
          setTimeout(function(){
            cell.classList.add('pw-'+status[c]);
            applyStatusStyle(cell,status[c]);
            keyState[guess[c]]=status[c];
          },280);
        },c*250);
      })(c);
    }
    setTimeout(function(){
      if(guess===answer){
        done=true;
        var bonus=6-row;
        for(var b=0;b<bonus;b++)_e('milestone');
        _e('game_win');
        if(_playWin)_playWin();
        recordResult(true,row+1);
        showResult(true,row+1);
        _sr('sprout',{w:true,s:row+1});
      } else {
        row++;col=0;
        var gEl=document.getElementById('PWg');if(gEl)gEl.textContent=row;
        if(row>=6){
          done=true;
          recordResult(false,null);
          showResult(false,null);
          _sr('sprout',{w:false,s:answer});
        } else {
          markActive();
          focusInput();
        }
      }
    },5*250+340);
  }

  function recordResult(won,guesses){
    stats.played++;
    var isDaily=(mode==='daily');
    if(won){
      stats.won++;
      if(guesses){
        stats.winsByRow[guesses-1]=(stats.winsByRow[guesses-1]||0)+1;
      }
      if(isDaily){
        var today=todayKey();
        if(stats.lastDay){
          // Day delta: 1 = consecutive, else reset
          var yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
          var yKey=yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate();
          if(stats.lastDay===yKey)stats.streak++;
          else if(stats.lastDay===today){/* same day, already counted */}
          else stats.streak=1;
        } else {
          stats.streak=1;
        }
        stats.lastDay=today;
        if(stats.streak>stats.best)stats.best=stats.streak;
        saveDaily({day:today,won:true,guesses:guesses,answer:answer,rows:rowStatuses,letters:rowGuesses});
      }
    } else {
      if(isDaily){
        stats.streak=0;
        saveDaily({day:todayKey(),won:false,guesses:null,answer:answer,rows:rowStatuses,letters:rowGuesses});
      }
    }
    saveStats(stats);
    updateStatsRow();
  }

  function emojiGrid(){
    var lines=[];
    for(var r=0;r<rowStatuses.length;r++){
      var line='';
      for(var c=0;c<5;c++){
        var s=rowStatuses[r][c];
        line+=(s==='hit'?'🟩':s==='near'?'🟨':'⬛');
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  function showResult(won,guesses){
    var host=document.getElementById('PWresult');
    host.innerHTML='';
    var box=document.createElement('div');box.className='pw-result';
    var header=won?('🌿 Solved in '+guesses+'!'):('🥀 The word was '+answer.toUpperCase());
    var modeLabel=mode==='daily'?('Daily puzzle · '+todayKey()):'Random';
    box.innerHTML='<strong>'+header+'</strong>'+modeLabel+'<br>'+emojiGrid().replace(/\n/g,'<br>');
    var share=document.createElement('button');share.className='pw-share';share.textContent='SHARE';
    share.onclick=function(){
      var text='SPROUT · '+modeLabel+' · '+(won?guesses+'/6':'X/6')+'\n\n'+emojiGrid()+'\n\nlucidwinds.com';
      if(navigator.share){
        navigator.share({text:text}).catch(function(){copyToClip(text);});
      } else {
        copyToClip(text);
      }
    };
    box.appendChild(share);
    host.appendChild(box);
  }

  function copyToClip(text){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){showMsg('Copied!');}).catch(function(){fallbackCopy(text);});
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text){
    var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
    document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');showMsg('Copied!');}catch(e){showMsg('Copy failed');}
    document.body.removeChild(ta);
  }

  // Desktop hardware keyboard — handles ENTER/BACKSPACE directly. Letter
  // keys fall through to the hidden input's own input handler.
  function onKey(e){
    if(done)return;
    if(e.key==='Enter'){submitGuess();e.preventDefault();return;}
    if(e.key==='Backspace'){
      // If the hidden input already has focus, let its native backspace
      // fire and the 'input' listener will sync. Otherwise delete manually.
      if(document.activeElement!==hiddenIn){deleteLetter();e.preventDefault();}
      return;
    }
    // If nothing is focused on the input, mirror letters manually so
    // desktop users can type without clicking first.
    if(document.activeElement!==hiddenIn){
      var ch=(e.key||'').toLowerCase();
      if(ch.length===1&&ch>='a'&&ch<='z'){typeLetter(ch);hiddenIn.value=buildGuess().slice(0,col);}
    }
  }
  document.addEventListener('keydown',onKey);
  var watcher=setInterval(function(){
    if(!document.body.classList.contains('game-active')){
      document.removeEventListener('keydown',onKey);
      clearInterval(watcher);
    }
  },1000);

  window._PWNew=function(){
    answer=pickWord();row=0;col=0;done=false;keyState={};rowStatuses=[];rowGuesses=[];
    var gEl=document.getElementById('PWg');if(gEl)gEl.textContent='0';
    showMsg('');document.getElementById('PWresult').innerHTML='';
    hiddenIn.value='';
    buildBoard();updateModeUI();updateStatsRow();markActive();
    // If daily is already solved today, show result + locked state
    if(mode==='daily'){
      var saved=loadDaily();
      if(saved){
        answer=saved.answer;
        rowStatuses=saved.rows||[];
        rowGuesses=saved.letters||[];
        // Replay the rows visually: write the letters AND the colors.
        for(var rr=0;rr<rowStatuses.length;rr++){
          var letters=rowGuesses[rr]||'';
          for(var cc=0;cc<5;cc++){
            var cell=grid[rr][cc];
            if(letters[cc])cell.textContent=letters[cc];
            cell.classList.add('pw-'+rowStatuses[rr][cc]);
            applyStatusStyle(cell,rowStatuses[rr][cc]);
          }
        }
        done=true;
        if(saved.won)showMsg('Daily done. Come back tomorrow for a new word.');
        else showMsg('Daily complete. Try random mode or come back tomorrow.');
        showResult(saved.won,saved.guesses);
      }
    }
  };
  _PWNew();
  // Auto-focus the hidden input so mobile users see the native keyboard
  // right away. Wrap in a short timeout to land after the DOM paints.
  setTimeout(focusInput,60);
};
})();
