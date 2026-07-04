// ═══ TRELLIS — Scrabble-grade word-builder on a 15×15 board ═══
//
// Researched from Words With Friends, Scrabble Go, and Lexulous:
// - Drag-and-drop rack tiles onto the board (touch + mouse)
// - Tap a placed tentative tile to pop it back to the rack
// - Drag a placed tentative tile to move or rack it
// - Standard 100-tile Scrabble distribution + values
// - Bingo bonus (50) for using all 7 rack tiles
// - Premium squares (TW/DW/TL/DL) with a legend
// - Swap tiles action (return N, draw N, skip turn)
// - Stats: games won / win % / streak / best
// - Rich tile visuals (raised wood chip look, value pip)
// - Haptic feedback on placement + commit
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.trellis = function TR(a){
  var BOARD_SIZE=15,RACK_SIZE=7,BINGO_BONUS=50,CENTER=7;
  var TILE_VALUES={A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10,' ':0};
  var TILE_DIST={A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1,' ':2};

  var PREMIUMS={};
  (function(){
    var tw=[[0,0],[0,7],[0,14],[7,0],[7,14],[14,0],[14,7],[14,14]];
    var dw=[[1,1],[1,13],[2,2],[2,12],[3,3],[3,11],[4,4],[4,10],[7,7],[10,4],[10,10],[11,3],[11,11],[12,2],[12,12],[13,1],[13,13]];
    var tl=[[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],[9,1],[9,5],[9,9],[9,13],[13,5],[13,9]];
    var dl=[[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],[7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],[14,3],[14,11]];
    for(var i=0;i<tw.length;i++)PREMIUMS[tw[i][0]+','+tw[i][1]]='tw';
    for(i=0;i<dw.length;i++)PREMIUMS[dw[i][0]+','+dw[i][1]]='dw';
    for(i=0;i<tl.length;i++)PREMIUMS[tl[i][0]+','+tl[i][1]]='tl';
    for(i=0;i<dl.length;i++)PREMIUMS[dl[i][0]+','+dl[i][1]]='dl';
  })();

  var WORDS=(
    'AA AB AD AE AG AH AI AL AM AN AR AS AT AW AX AY BA BE BI BO BY DA DE DO ED EF EH EL EM EN ER ES ET EX FA FE GO HA HE HI HM HO ID IF IN IS IT JO KA KI LA LI LO MA ME MI MM MO MU MY NA NE NO NU OD OE OF OH OI OK OM ON OP OR OS OU OW OX OY PA PE PI PO QI RE SH SI SO TA TI TO UH UM UN UP US UT WE WO XI XU YA YE YO ZA '+
    'ACE ACT ADD ADO AGE AGO AHA AID AIM AIR ALE ALL ALP AMP AND ANT ANY APE APT ARC ARE ARK ARM ART ASH ASK ASP ATE AWE AXE BAD BAG BAR BAT BAY BED BEE BEG BET BID BIG BIN BIT BOA BOB BOW BOX BOY BRA BUD BUG BUN BUS BUT BUY BYE CAB CAM CAN CAP CAR CAT COB COD COG COO COP COT COW CRY CUB CUE CUP CUR CUT DAD DAM DAY DEN DEW DID DIE DIG DIM DIN DIP DOE DOG DOT DRY DUB DUE DUG DUO DYE EAR EAT EEL EGG EGO ELF ELK ELM END ERA ERR EVE EWE EYE FAD FAN FAR FAT FEE FEW FIB FIG FIN FIR FIT FIX FLU FLY FOE FOG FOR FOX FRY FUN FUR GAL GAP GAS GEL GEM GET GIG GOD GOT GUM GUN GUT GUY GYM HAD HAM HAS HAT HAY HEM HEN HEW HEX HID HIM HIS HIT HOE HOG HOP HOT HOW HUB HUG HUM HUT ICE ICY IDS ILL IMP INK INN INS ION IRE IRK ITS IVY JAB JAM JAR JAW JET JOB JOG JOT JOY JUG JUT KEY KID KIN KIT LAB LAD LAG LAP LAW LAY LED LEG LET LID LIE LIP LIT LOG LOT LOW LUG LYE MAD MAN MAP MAR MAT MAY MEN MET MID MIX MOB MOD MOM MOP MOW MUD MUG NAG NAP NAY NEW NIL NIP NIT NOD NOR NOT NOW NUB NUN NUT OAF OAK OAR OAT ODD ODE OFF OHM OIL OLD ONE OPT ORB ORE OUR OUT OWE OWL OWN PAD PAL PAN PAT PAW PAY PEA PEG PEN PEP PER PET PEW PIE PIG PIN PIT POD POP POT POW PRO PRY PUB PUG PUN PUP PUS PUT QAT RAG RAM RAN RAP RAT RAW RAY RED REF REV RIB RID RIG RIM RIP ROB ROD ROE ROT ROW RUB RUE RUG RUM RUN RUT RYE SAC SAD SAG SAP SAT SAW SAY SEA SEE SET SEW SHE SHY SIN SIP SIR SIT SIX SKI SKY SLY SOB SOD SON SOP SOS SOT SOW SOY SPA SPY SUB SUM SUN SUP TAB TAD TAG TAN TAP TAR TAX TEA TED TEE TEN THE THY TIC TIE TIN TIP TOE TOG TOM TON TOO TOP TOR TOW TOY TRY TUB TUG TUN TUX TWO TYE UGH ULE UMP URN USE VAN VAT VET VIA VID VIE VIM VIS VOW WAD WAG WAN WAR WAS WAX WAY WEB WED WEE WEN WET WHO WHY WIG WIN WIT WOE WOK WON WOO YAK YAM YAP YAW YEA YEN YES YET YEW YON YOU ZAG ZAP ZED ZEE ZIG ZIP ZIT ZOO '+
    'ABLE ACID ACME ACNE ACRE AGED AGES AIDE AIMS AIRS AIRY AJAR AKIN ALAS AMID AREA ARIA ARMY ARTS ATOM AUTO AXES AXIS BABE BACK BADE BAIL BAIT BAKE BALD BALE BALL BALM BAND BANE BANG BANK BARE BARK BARN BASE BASS BATH BATS BEAD BEAK BEAM BEAN BEAR BEAT BEEF BEEN BEER BEES BELL BELT BEND BENT BETA BIAS BIKE BILL BIND BIRD BITE BITS BLED BLEW BLIP BLOB BLOC BLOT BLOW BLUE BLUR BOAR BOAT BODY BOIL BOLD BOLT BOMB BOND BONE BOOK BOOM BOON BOOT BORE BORN BOSS BOTH BOUT BOWL BOYS BRAN BRAT BRED BREW BRIM BROW BUCK BUFF BULB BULK BULL BUMP BUNK BURN BURR BURY BUSH BUST BUSY BUZZ BYTE CAFE CAGE CAKE CALF CALL CALM CAME CAMP CANE CAPE CARD CARE CARP CARS CART CASE CASH CAST CAVE CELL CHAP CHAT CHEF CHIN CHIP CHOP CITE CITY CLAD CLAM CLAN CLAP CLAW CLAY CLIP CLOG CLOT CLUB CLUE COAL COAT CODE COIL COIN COLD COLT COMB COME CONE COOK COOL COPE COPY CORD CORE CORK CORN COST COVE CRAB CREW CRIB CROP CROW CUBE CUED CUES CULT CURB CURE CURL CUSP CUTE DAME DAMP DARE DARK DARN DART DASH DATA DATE DAWN DAYS DEAD DEAF DEAL DEAR DEBT DECK DEED DEEM DEEP DEER DENT DENY DESK DIAL DICE DIED DIES DIET DIME DINE DINT DIRE DIRT DISH DIVE DOCK DOES DOLL DOME DONE DOOM DOOR DOPE DOSE DOWN DOZE DRAB DRAG DRAW DREW DRIP DROP DRUM DUAL DUCK DUCT DUDE DUEL DUET DUKE DULL DUMB DUMP DUNE DUSK DUST DUTY DYED DYES EACH EARL EARN EARS EASE EAST EASY EATS ECHO EDGE EDIT EELS EGGS ELKS ELSE EMIT ENDS ENVY EPIC ETCH EVEN EVER EVIL EXAM EXEC EXIT EXPO EYED EYES FACE FACT FADE FAIL FAIR FAKE FALL FAME FANS FARE FARM FAST FATE FAWN FEAR FEAT FEED FEEL FEES FEET FELL FELT FERN FEUD FIEF FILE FILL FILM FIND FINE FIRE FIRM FISH FIST FITS FIVE FLAG FLAP FLAT FLAW FLEA FLED FLEE FLEW FLEX FLIP FLIT FLOP FLOW FLUE FLUX FOAM FOES FOIL FOLD FOLK FOND FONT FOOD FOOL FOOT FORD FORE FORK FORM FORT FOUL FOUR FOWL FREE FROM FUEL FULL FUME FUND FUNK FURY FUSE FUSS FUZZ GAIN GAIT GALE GAME GANG GAPE GARB GASH GASP GATE GAVE GAZE GEAR GENE GERM GIFT GILD GILT GIRD GIRL GIST GIVE GLAD GLEN GLOW GLUE GLUM GLUT GNAT GNAW GOAD GOAT GOES GOLD GOLF GONE GOOD GORE GORY GOWN GRAB GRAM GRAY GREW GRID GRIM GRIN GRIP GRIT GROW GULF GULL GULP GUMS GUNS GUSH GUST GYMS HACK HAIL HAIR HALE HALF HALL HALT HAND HANG HARD HARE HARK HARM HARP HASH HASP HATE HATH HAUL HAVE HAWK HAZE HAZY HEAD HEAL HEAP HEAR HEAT HEED HEEL HEFT HEIR HELD HELL HELM HELP HERB HERD HERE HERO HERS HEWN HIDE HIGH HIKE HILL HILT HIND HINT HIRE HITS HIVE HOAR HOAX HOLD HOLE HOME HONE HOOD HOOK HOOP HOOT HOPE HORN HOSE HOST HOUR HOWL HUED HUES HUFF HUGE HULK HULL HUMP HUNG HUNT HURL HURT HUSH HUSK HYMN HYPE ICED IDEA IDLE IDLY IDOL IFFY INKS INNS INTO IONS IRIS IRON ISLE ITCH ITEM JACK JADE JAIL JAMS JARS JAVA JAWS JAZZ JEAN JEER JEST JETS JIBE JIVE JOCK JOIN JOKE JOLT JOSH JOWL JOYS JURY JUST JUTE KALE KEEN KEEP KELP KEPT KEYS KICK KIDS KILL KILN KILO KILT KIND KING KINK KISS KITE KITS KNEE KNEW KNIT KNOB KNOT KNOW LACE LACK LACY LAID LAIR LAKE LAMB LAME LAMP LAND LANE LAPS LARD LARK LASH LASS LAST LATE LAVA LAWN LAYS LAZY LEAD LEAF LEAK LEAN LEAP LEFT LEND LENS LENT LESS LEST LEVY LIAR LICE LICK LIED LIEN LIES LIFE LIFT LIKE LILY LIMB LIME LIMP LINE LINK LINT LION LIPS LIST LIVE LOAD LOAF LOAM LOAN LOBE LOCK LODE LOFT LOGE LOGS LONE LONG LOOK LOOM LOON LOOP LOOT LORD LORE LORN LOSE LOSS LOST LOTS LOUD LOVE LOWS LUCK LULL LUMP LUNG LURE LURK LUSH LUST LUTE LYNX LYRE MACE MADE MAID MAIL MAIN MAKE MALE MALL MALT MANE MANY MAPS MARE MARK MARS MASH MASK MASS MAST MATE MATH MATS MAZE MEAL MEAN MEAT MEEK MEET MELD MELT MEMO MEND MENU MERE MESH MESS MICE MILD MILE MILK MILL MIME MIND MINE MINI MINT MIRE MISS MIST MITE MITT MOAN MOAT MOCK MODE MOLD MOLE MOLT MONK MOOD MOON MOOR MOOT MOPE MORE MORN MOSS MOST MOTH MOVE MUCH MUCK MUFF MULE MULL MUSE MUSH MUSK MUST MUTE MUTT NAIL NAME NAPE NAPS NAVY NEAR NEAT NECK NEED NEST NETS NEWS NEXT NICE NICK NINE NODE NONE NOOK NOON NORM NOSE NOTE NOUN NUDE NULL NUMB NUNS NUTS OAFS OAKS OATH OATS OBEY ODDS OFFS OGLE OILS OILY OKAY OMEN OMIT ONCE ONES ONLY ONTO OPAL OPEN OPTS ORAL ORCA OUCH OURS OUST OVAL OVEN OVER OWED OWES OWLS OWNS OXEN PACE PACK PACT PAGE PAID PAIL PAIN PAIR PALE PALM PANE PANG PANS PANT PARK PART PASS PAST PATH PAVE PAWN PEAK PEAL PEAR PEAT PEEL PEER PELT PEND PENS PENT PERK PERM PEST PICK PIER PIKE PILE PILL PINE PING PINK PINT PIPE PITS PITY PLAN PLAY PLEA PLED PLOD PLOT PLOW PLOY PLUG PLUM PLUS POCK POEM POET POKE POLE POLL POMP POND PONY POOL POOR PORE PORT POSE POSH POST POUR POUT PRAY PREP PREY PRIM PROD PROM PROP PROW PUCK PUFF PULL PULP PUMP PUNK PURE PURR PUSH PUTS PUTT QUAD QUAY QUID QUIP QUIT QUIZ RACE RACK RAFT RAGE RAGS RAID RAIL RAIN RAKE RAMP RANG RANK RANT RARE RASH RASP RATE RAVE RAZE READ REAL REAM REAP REAR REDO REED REEF REEK REEL REIN RELY REND RENT REST RIBS RICE RICH RICK RIDE RIFT RILE RILL RIME RIND RING RINK RIOT RIPE RISE RISK RITE ROAD ROAM ROAR ROBE ROCK RODE ROLE ROLL ROMP ROOF ROOK ROOM ROOT ROPE ROSE ROSY ROTE ROUT ROVE RUBE RUBY RUDE RUFF RUIN RULE RUMP RUNE RUNG RUNS RUNT RUSE RUSH RUST SACK SAFE SAGE SAID SAIL SAKE SALE SALT SAME SAND SANE SANG SANK SASH SAVE SAWS SAYS SCAB SCAM SCAN SCAR SEAL SEAM SEAR SEAS SEAT SECT SEED SEEK SEEM SEEN SEEP SELF SELL SEMI SEND SENT SEPT SERA SETS SEWN SHED SHIM SHIN SHIP SHOD SHOE SHOO SHOP SHOT SHOW SHUN SHUT SICK SIDE SIFT SIGH SIGN SILK SILL SILO SILT SINE SING SINK SIRE SITS SIZE SKEW SKID SKIM SKIN SKIP SKIT SLAB SLAG SLAM SLAP SLAT SLAY SLED SLEW SLID SLIM SLIT SLOB SLOE SLOG SLOP SLOT SLOW SLUG SLUM SLUR SMOG SNAG SNAP SNIP SNIT SNOB SNOT SNOW SNUB SNUG SOAK SOAP SOAR SOBS SOCK SODA SOFA SOFT SOIL SOLD SOLE SOLO SOME SONG SOON SOOT SORE SORT SOUL SOUP SOUR SOWN SPAN SPAR SPAT SPEC SPED SPIN SPIT SPOT SPRY SPUR STAB STAG STAR STAY STEM STEP STEW STIR STOP STOW STUB STUD STUN SWAY SWIM TABS TACK TACO TACT TAGS TAIL TAKE TALE TALK TALL TAME TANG TANK TAPE TAPS TARN TARP TARS TASK TAUT TEAL TEAM TEAR TEAS TEED TEEM TEEN TELL TEMP TEND TENS TENT TERM TERN TEST TEXT THAN THAT THAW THEM THEN THEY THIN THIS THUD THUG THUS TICK TIDE TIDY TIED TIER TIES TILE TILL TILT TIME TINE TINS TINY TIPS TIRE TOAD TOED TOES TOIL TOLD TOLL TOMB TOME TONE TONS TOOK TOOL TOOT TOPS TORE TORN TORT TOSS TOTE TOUR TOUT TOWN TOYS TRAP TRAY TREE TREK TRIM TRIO TRIP TROD TRUE TUBE TUCK TUFT TUGS TUNA TUNE TURF TURN TUSK TWIN TWIT TYPE UGLY UNDO UNIT UNTO UPON URGE USED USER USES VAIN VALE VANE VANS VARY VASE VAST VATS VEAL VEER VEIL VEIN VEND VENT VERB VERY VEST VETO VIEW VILE VINE VISA VOID VOLE VOLT VOTE VOWS WADE WAGE WAIL WAIT WAKE WALK WALL WAND WANE WANT WARD WARM WARN WARP WARS WART WARY WASH WASP WAVE WAVY WAXY WAYS WEAK WEAN WEAR WEBS WEDS WEED WEEK WEEP WELD WELL WELT WEND WENT WEPT WERE WEST WETS WHAT WHEN WHET WHEY WHIM WHIP WHIR WHOM WICK WIDE WIFE WILD WILL WILT WILY WIMP WIND WINE WING WINK WINS WIPE WIRE WIRY WISE WISH WISP WITH WITS WOKE WOLF WOMB WONT WOOD WOOF WOOL WORD WORE WORK WORM WORN WORT WOVE WRAP WREN WRIT YAKS YAMS YANK YAPS YARD YARN YAWN YEAR YELL YELP YOUR YOWL YULE ZANY ZAPS ZEAL ZERO ZEST ZINC ZING ZONE ZOOM '+
    'ABIDE ABOUT ABOVE ABUSE ACTED ACTOR ACUTE ADDED ADMIT ADOPT ADULT AFTER AGAIN AGENT AGING AGREE AHEAD AISLE ALARM ALBUM ALERT ALIEN ALIGN ALIKE ALIVE ALLEY ALLOT ALLOW ALLOY ALONE ALONG ALOOF ALTER AMAZE AMBER AMEND AMPLE ANGEL ANGER ANGLE ANGRY ANKLE ANNEX ANNOY APART APPLE APPLY ARENA ARGUE ARISE ARMOR AROMA AROSE ARRAY ARROW ASIDE ATLAS ATTIC AUDIO AUDIT AVAIL AVOID AWAIT AWAKE AWARD AWARE AWFUL AZURE BADGE BADLY BAKER BASED BASIC BASIN BASIS BATCH BEACH BEARD BEAST BEGAN BEGIN BEING BELOW BENCH BERRY BIBLE BIRTH BLACK BLADE BLAME BLAND BLANK BLAST BLAZE BLEAK BLEED BLEND BLESS BLIND BLINK BLISS BLOCK BLOOD BLOOM BLOWN BLUES BLUFF BLUNT BLURT BOARD BONES BONUS BOOKS BOOST BORED BOUND BRAIN BRAND BRAVE BREAD BREAK BREED BRICK BRIDE BRIEF BRING BRINK BRISK BROAD BROKE BROOK BROOM BROTH BROWN BRUSH BUDDY BUILD BUILT BUNCH BURST BUYER CABIN CABLE CAMEL CANDY CARGO CARRY CATCH CAUSE CEASE CHAIN CHAIR CHALK CHAMP CHAOS CHARM CHART CHASE CHEAP CHEAT CHECK CHEEK CHEER CHESS CHEST CHIEF CHILD CHILL CHINA CHOIR CHORD CHOSE CHUNK CIVIL CLAIM CLAMP CLASH CLASS CLEAN CLEAR CLERK CLICK CLIFF CLIMB CLING CLOCK CLONE CLOSE CLOTH CLOUD CLOWN COACH COAST COBRA COLOR COMET COMIC CORAL COUNT COURT COVER CRACK CRAFT CRANE CRASH CRAZY CREAM CRIME CRISP CROSS CROWD CROWN CRUDE CRUSH CURVE CYCLE DAILY DANCE DEATH DECAY DECOR DELTA DEMON DENSE DEPOT DEPTH DERBY DEVIL DIARY DIGIT DIRTY DITCH DIZZY DODGE DOING DONOR DOUBT DOUGH DRAFT DRAIN DRAMA DRANK DRAPE DRAWN DREAD DREAM DRESS DRIED DRIFT DRILL DRINK DRIVE DRONE DROOL DROWN DRUNK DRYER DWARF DWELL EAGER EAGLE EARLY EARTH EASED EIGHT ELDER ELECT ELITE EMBED EMBER EMPTY ENEMY ENJOY ENTER ENTRY EQUAL EQUIP ERASE ERROR ESSAY EVENT EVERY EXACT EXALT EXILE EXIST EXTRA FABLE FAINT FAIRY FAITH FALSE FANCY FATAL FAULT FAVOR FEAST FENCE FETCH FEVER FIBER FIELD FIERY FIFTY FIGHT FINAL FIRST FIXED FLAME FLASH FLASK FLESH FLIES FLOAT FLOCK FLOOD FLOOR FLOSS FLOUR FLUID FLUSH FLUTE FOCAL FOCUS FOGGY FORCE FORGE FORMS FORTH FORTY FOUND FRAME FRANK FRAUD FRESH FRONT FROST FROZE FRUIT FULLY FUNNY FUZZY GAUGE GHOST GIANT GIVEN GLAND GLARE GLASS GLEAM GLIDE GLOBE GLOOM GLORY GLOSS GLOVE GOING GRACE GRADE GRAIN GRAND GRANT GRAPE GRAPH GRASP GRASS GRAVE GRAVY GREED GREEN GREET GRIEF GRIND GROAN GROOM GROSS GROUP GROVE GROWN GUARD GUESS GUEST GUIDE GUILD GUILT GUISE HABIT HAPPY HARSH HASTE HASTY HAVEN HEART HEAVY HEDGE HEIST HENCE HINGE HOBBY HONEY HONOR HORSE HOTEL HOUSE HUMAN HUMOR HURRY IDEAL INDEX INFER INNER INPUT ISSUE IVORY JEWEL JOKER JOLLY JUICE JUICY JUMBO KAYAK KNEEL KNIFE KNOCK KNOWN LABEL LABOR LANCE LARGE LASER LATCH LATER LAUGH LAYER LEARN LEASE LEAST LEAVE LEGAL LEMON LEVEL LEVER LIGHT LIMIT LINEN LIVER LODGE LOGIC LOOSE LOVER LOWER LOYAL LUCKY LUNAR LUNCH LYING MAGIC MAJOR MAKER MANOR MAPLE MARCH MARSH MATCH MAYBE MAYOR MEDIA MERCY MERGE MERIT METAL METER MIGHT MINOR MINUS MODAL MODEL MONEY MONTH MORAL MOUNT MOUSE MOUTH MOVIE MUDDY MURAL MUSIC NAIVE NAKED NAVAL NERVE NEVER NEWLY NICHE NIGHT NOBLE NOISE NORTH NOVEL OCCUR OCEAN OFFER OFTEN OLIVE ONSET OPERA ORDER ORGAN OTHER OUGHT OUTER OWNER OXIDE PAINT PANEL PANIC PAPER PARTY PASTE PATCH PAUSE PEACE PEACH PEARL PENNY PHASE PHONE PHOTO PIECE PILOT PINCH PITCH PIXEL PLACE PLAIN PLANE PLANT PLATE PLAZA PLUMB PLUME PLUSH POINT POLAR POUCH POWER PRESS PRICE PRIDE PRIME PRINT PRIOR PRIZE PROBE PRONE PROOF PROSE PROUD PROVE PRUNE PSALM PULSE PUNCH PUPIL PURSE QUEEN QUERY QUEST QUEUE QUICK QUIET QUILT QUIRK QUOTA QUOTE RADAR RADIO RAISE RALLY RANGE RAPID RAVEN REACH REALM REBEL REIGN RELAY RENEW REPAY REPLY RIDER RIDGE RIFLE RIGHT RIGID RIPEN RISEN RISKY RIVAL RIVER ROAST ROBOT ROCKY ROMAN ROUGH ROUND ROUTE ROVER ROYAL RUGBY RULER RURAL RUSTY SADLY SAINT SALAD SALON SAUCE SAVED SCALE SCARE SCARF SCENE SCOPE SCORE SCOUT SCRAP SENSE SERVE SEVEN SHADE SHADY SHALL SHAME SHAPE SHARE SHARK SHARP SHAVE SHEAR SHEEN SHEER SHELF SHELL SHIFT SHINE SHINY SHIRT SHOCK SHONE SHOOK SHOOT SHORE SHORT SHOUT SHOWN SIGHT SIGMA SINCE SIXTH SIXTY SIZED SKILL SKULL SLASH SLATE SLEEP SLICE SLIDE SLOPE SMALL SMART SMELL SMILE SMOKE SNACK SNAKE SOLAR SOLID SOLVE SORRY SOUND SOUTH SPACE SPARE SPARK SPAWN SPEAK SPEED SPELL SPEND SPENT SPICE SPIKE SPINE SPLIT SPOKE SPOON SPORT SPRAY SQUAD STACK STAFF STAGE STAIN STAKE STALE STALL STAMP STAND STARE START STATE STEAK STEAL STEAM STEEL STEEP STEER STERN STICK STIFF STILL STING STOCK STOLE STONE STOOD STOOL STORE STORM STORY STOUT STOVE STRAP STRAW STRAY STRIP STUCK STUDY STUFF STUMP STYLE SUGAR SUITE SUNNY SUPER SURGE SWAMP SWEAR SWEEP SWEET SWEPT SWIFT SWING SWIRL SWORD SWORE SWORN SWUNG TABLE TAKEN TASTE TEACH TEETH TEMPO TENSE TENTH THEME THERE THESE THICK THING THINK THIRD THORN THOSE THREE THREW THROW THUMB TIDAL TIGER TIGHT TIMER TIRED TITLE TODAY TOKEN TOOTH TOPIC TORCH TOTAL TOUCH TOUGH TOWEL TOWER TOXIC TRACE TRACK TRADE TRAIL TRAIN TRAIT TRASH TREAT TREND TRIAL TRIBE TRICK TRIED TROOP TROUT TRUCK TRULY TRUMP TRUNK TRUST TRUTH TULIP TUNED TUTOR TWICE TWIST ULCER ULTRA UNCLE UNDER UNDUE UNFIT UNION UNITE UNITY UNTIL UPPER UPSET URBAN USAGE USUAL UTTER VAGUE VALID VALUE VALVE VAPOR VAULT VERGE VERSE VIDEO VIGOR VINYL VIRAL VIRUS VISIT VISTA VITAL VIVID VOCAL VOICE VOTED VOTER VOWEL WAGED WALLS WASTE WATCH WATER WEARY WEAVE WEIGH WEIRD WHEEL WHERE WHICH WHILE WHITE WHOLE WHOSE WIDTH WITCH WOMAN WOMEN WORDS WORLD WORRY WORSE WORST WORTH WOULD WOUND WRATH WRIST WRITE WRONG WROTE YACHT YEARS YIELD YOUNG YOUTH ZEROS ZONES '+
    'ACCEPT ACCESS ACROSS ACTION ACTIVE ACTUAL ADJUST ADMIRE ADVICE AFFORD AGENDA AGREED ALMOST ALWAYS AMOUNT ANCHOR ANNUAL ANYONE ANYWAY APPEAL APPEAR AROUND ARRIVE ARTIST ASPECT ASSERT ASSESS ASSIGN ASSIST ASSUME ATTACK ATTAIN ATTEND AUTHOR AUTUMN BARELY BATTLE BEAUTY BECAME BECOME BEFORE BEHAVE BEHIND BELIEF BELONG BESIDE BEYOND BISHOP BITTER BOTTOM BOUNCE BRANCH BREATH BREEZE BRIDGE BRIGHT BROKEN BRONZE BRUTAL BUBBLE BUDGET BUNDLE BURDEN BUTTON BUYING CALLED CAMERA CAMPUS CANCEL CANDLE CANNOT CARBON CAREER CARING CASTLE CASUAL CAUGHT CAUSED CENTER CEREAL CHAIRS CHANCE CHANGE CHARGE CHOSEN CHURCH CIRCLE CLAIMS CLIENT CLINIC CLOSED COLONY COLUMN COMBAT COMEDY COMING COMMIT COMMON COMPLY COOKIE COPPER CORNER COTTON COUPLE COURSE COUSIN COVERS CREATE CREDIT CRISIS CUSTOM DAMAGE DANGER DECADE DECENT DEFEAT DEFEND DEFINE DEGREE DEMAND DENTAL DEPEND DEPUTY DERIVE DESERT DESIGN DESIRE DETAIL DETECT DEVICE DIRECT DIVIDE DIVINE DOMAIN DONATE DOUBLE DRAGON DRIVEN DRIVER DURING EASILY EDITOR EFFECT EFFORT EITHER ELEVEN EMPIRE ENABLE ENDURE ENERGY ENGINE ENOUGH ENSURE ENTIRE EQUITY ESCAPE ESTATE ETHNIC EVOLVE EXCEED EXCEPT EXCITE EXCUSE EXPAND EXPECT EXPERT EXPORT EXPOSE EXTEND EXTENT FABRIC FACTOR FAILED FAIRLY FAMILY FAMOUS FATHER FILTER FIGURE FINISH FLAVOR FLIGHT FLOWER FOLLOW FORCED FOREST FORGET FORMAL FORMAT FORMER FOUGHT FOURTH FREEZE FRIEND FROZEN FUTURE GARDEN GATHER GENDER GENTLE GIFTED GLOBAL GOLDEN GOVERN GROUND GROWTH GUIDED HANDLE HAPPEN HARBOR HARDLY HAZARD HEALTH HEAVEN HIDDEN HONEST HOUSED HUMBLE HUNGER HYBRID IGNORE IMMUNE IMPACT IMPOSE IMPORT INCOME INDEED INDOOR INFORM INJURY INSECT INSIDE INSERT INSIST INSURE INTACT INTEND INTENT INVEST INWARD ISLAND ITSELF JUDGED JUNGLE JUNIOR LADDER LANDED LAUNCH LAYERS LEADER LEAGUE LEARNS LEGACY LENGTH LESSON LETTER LEVELS LIABLE LIKELY LIMITS LINEAR LINING LIQUID LISTEN LITTLE LIVELY LIVING LOCATE LOOSEN LOVELY LUXURY MAINLY MANAGE MANNER MARGIN MARINE MARKET MASTER MATTER MATURE MEDIUM MEMBER MEMORY MENTAL METHOD MIDDLE MIGHTY MINUTE MIRROR MOBILE MODERN MODEST MODIFY MODULE MOMENT MOSTLY MOTHER MOTION MOTIVE MOVING MUTUAL MYSELF NARROW NATION NATIVE NATURE NEARBY NEARLY NEEDED NORMAL NOTICE NOTION NUMBER OBJECT OBTAIN OCCUPY OFFICE ONLINE OPPOSE OPTION ORANGE ORDERS ORIGIN OUTPUT OXYGEN PACKED PARADE PARENT PASSED PATENT PATROL PAYING PENCIL PEOPLE PEPPER PERIOD PERMIT PERSON PICKED PLANET PLAYED PLAYER PLEASE PLEDGE PLENTY POCKET POETRY POLICE POLICY POLISH POLITE PORTAL POSTER POWDER PRAYER PREFER PRETTY PRINCE PRISON PROFIT PROMPT PROPER PROVEN PUBLIC PULLED PURSUE PUZZLE RACIAL RADIUS RAISED RANDOM RARELY RATHER RATING READER REALLY REASON RECALL RECENT RECORD REDUCE REFORM REFUGE REGARD REGIME REGION REJECT RELATE RELIEF REMAIN REMOTE REMOVE RENDER REPAIR REPEAT REPORT RESCUE RESIDE RESIST RESORT RESULT RETAIL RETAIN RETIRE RETURN REVEAL REVIEW REWARD RHYTHM RIBBON RIGHTS RISING ROBUST ROCKET ROTATE RULING SACRED SAFELY SAFETY SALARY SAMPLE SAVING SCHEME SCHOOL SCREEN SCRIPT SEARCH SEASON SECOND SECRET SECTOR SECURE SEEING SELECT SELLER SENIOR SERIES SERVED SERVER SETTLE SEVERE SHAPED SHIELD SHIFTS SHOULD SHOWER SHRINK SIGNAL SIGNED SILENT SILVER SIMPLE SIMPLY SINGER SINGLE SISTER SKETCH SKILLS SMOOTH SOCIAL SOLEMN SOLVED SOUGHT SOURCE SPHERE SPIRIT SPLASH SPOKEN SPREAD SPRING SQUARE STABLE STATUS STEADY STOLEN STORED STREAM STREET STRESS STRICT STRIKE STRING STROKE STRONG STRUCK STUDIO SUDDEN SUFFER SUMMER SUMMIT SUPPLY SURELY SURVEY SWITCH SYMBOL SYSTEM TACKLE TALENT TARGET TEMPLE TENANT TENDER TENNIS TESTED THANKS THIRST THREAD THROWN TICKET TIMING TISSUE TOWARD TRAVEL TREATY TRIPLE TROPHY TUNNEL TURNED TWELVE TWENTY UNIQUE UNITED UNLESS UNLIKE UPDATE UPHOLD URGENT USEFUL VALLEY VALUED VENDOR VERBAL VERIFY VERSUS VESSEL VICTIM VIEWER VIRTUE VISION VISUAL VOLUME WALKED WALLET WANDER WANTED WARMTH WARNED WEALTH WEAPON WEEKLY WEIGHT WIDELY WINDOW WINNER WINTER WISDOM WITHIN WONDER WORKER WORTHY WRITER YELLOW '+
    'ABILITY ABSENCE ACADEMY ACCOUNT ACHIEVE ACQUIRE ADDRESS ADVANCE ANCIENT ANOTHER ANXIETY APPLIED AVERAGE BALANCE BECAUSE BEDROOM BELIEVE BENEATH BENEFIT BETWEEN BROUGHT CABINET CALLING CAPABLE CAPTAIN CAPTURE CAREFUL CEILING CENTRAL CERTAIN CHAMBER CHANGED CHAPTER CHARGED CHARITY CHECKED CHICKEN CIRCUIT CITIZEN CLIMATE CLOSING CLUSTER COLLECT COLLEGE COMBINE COMFORT COMMAND COMMENT COMPANY COMPARE COMPETE COMPLEX CONCEPT CONCERN CONDUCT CONFIRM CONNECT CONSENT CONSIST CONTACT CONTAIN CONTENT CONTEXT CONTROL CONVERT COOKING CORRECT COUNCIL COUNTRY COURAGE CRYSTAL CULTURE CURRENT CUTTING DECIDED DEFAULT DEFENSE DELIVER DESERVE DESPITE DESTROY DIGITAL DISABLE DISEASE DISPLAY DISPUTE DIVERSE DRIVING EARLIER EASTERN ECONOMY EDITION ELEMENT EMOTION EMPEROR ENDLESS ENHANCE EPISODE EVENING EVIDENT EXACTLY EXAMINE EXAMPLE EXHIBIT EXPENSE EXPLAIN EXPLOIT EXTRACT EXTREME FACTORY FAILURE FASHION FEELING FICTION FIGHTER FINALLY FINANCE FINDING FOREIGN FOREVER FORMULA FORTUNE FORWARD FREEDOM FURTHER GALLERY GENERAL GENETIC GENUINE GETTING HABITAT HARBOUR HARVEST HEALTHY HEARING HELPFUL HERSELF HIGHWAY HIMSELF HISTORY HOLIDAY HORIZON HOUSING HOWEVER HUSBAND IMAGINE IMPROVE INCLUDE INITIAL INQUIRY INSIGHT INSTALL INSTEAD INVOLVE JOURNEY JUSTICE KITCHEN LEADING LEATHER LEAVING LIBERAL LIBERTY LIMITED LOGICAL MACHINE MANAGED MANAGER MANDATE MARRIED MASSIVE MEANING MEASURE MEDICAL MEETING MENTION MERCURY MESSAGE MIRACLE MISSING MISSION MISTAKE MIXTURE MONITOR MONTHLY MORNING MYSTERY NETWORK NOTABLE NOTHING NURSERY OBVIOUS OFFERED OFFICER OPENING OPINION ORGANIC OUTDOOR OUTLINE OUTSIDE OVERALL PACIFIC PACKAGE PARKING PARTNER PASSAGE PATIENT PATTERN PAYMENT PENDING PENSION PERCENT PERFECT PERHAPS PHANTOM PHYSICS PIONEER PLANNED PLASTIC PLEASED POINTED PORTION POVERTY PREMIUM PREPARE PRESENT PRIMARY PRIVATE PROBLEM PROCEED PROCESS PRODUCE PRODUCT PROFILE PROGRAM PROJECT PROMISE PROMOTE PROTECT PROTEIN PROTEST PROVIDE PUBLISH PURPOSE QUALIFY QUALITY QUARTER REACHED READING REALITY REALIZE RECEIVE REDUCED REFLECT REGULAR RELEASE REPLACE REQUIRE RESERVE RESOLVE RESPECT RESPOND RESTORE RETREAT REVENUE REVERSE ROUTINE RUNNING SCIENCE SECTION SEEKING SEGMENT SERVING SESSION SETTING SETTLED SEVENTH SEVERAL SHELTER SIMILAR SIXTEEN SKILLED SMOKING SOCIETY SOLDIER SPECIAL SPECIES SPONSOR STADIUM STATION STORAGE STRANGE STRETCH SUBJECT SUCCEED SUCCESS SUGGEST SUMMARY SUNRISE SUPPORT SUPPOSE SURFACE SURGEON SURVIVE SUSPECT SUSPEND SYMPTOM TEACHER TENSION THERAPY THEREBY THOUGHT THROUGH TONIGHT TOURIST TOWARDS TRADING TRAFFIC TRAINED TRAVELS TREATED TRIGGER TROUBLE TURNING TYPICAL UNIFORM USUALLY UTILITY VERSION VETERAN VICTORY VILLAGE VIRTUAL VISIBLE WAITING WALKING WARNING WEATHER WEBSITE WEDDING WEEKEND WELFARE WESTERN WHISPER WITHOUT WITNESS WRITING WRITTEN'
  ).split(/\s+/);

  var board,bag,playerRack,aiRack,playerScore,aiScore;
  var isPlayerTurn,gameOver,consecutivePasses,tentativeTiles,selectedRackIndex;
  var wordSet={},wordSetBuilt=false;
  var stats={w:0,l:0,d:0,streak:0,best:0};
  try{var _ss=localStorage.getItem('lw_tr_stats');if(_ss){var _p=JSON.parse(_ss);for(var _k in _p)stats[_k]=_p[_k];}}catch(e){}

  // ── Drag state ──
  var dragTile=null; // {src:'rack'|'board', rackIndex, row?, col?, letter, isBlank, blankLetter, el (ghost)}
  var dragGhost=null;
  var lastTargetCell=null;

  function buildWordSet(){
    if(wordSetBuilt)return;
    for(var i=0;i<WORDS.length;i++){var w=WORDS[i].toUpperCase();if(w.length>=2)wordSet[w]=true;}
    wordSetBuilt=true;
  }
  // Full ENABLE dictionary (168k words, shared with Vine Words) — loaded
  // lazily by the game loader / shell. Curated WORDS stays as the floor:
  // it has the 2-letter Scrabble words ENABLE lacks, and the AI plays
  // from it so the CPU stays beatable.
  function bigDict(){
    if(window.LW_VINE_DICT_SET)return window.LW_VINE_DICT_SET;
    var arr=window.LW_VINE_DICT_ARR||[];
    if(!arr.length)return null;
    var st={};
    for(var i=0;i<arr.length;i++)st[arr[i]]=1;
    window.LW_VINE_DICT_SET=st;
    return st;
  }
  function isWord(w){
    w=w.toUpperCase();
    if(wordSet[w])return true;
    var big=bigDict();
    return big?!!big[w.toLowerCase()]:false;
  }

  function initBoard(){board=[];for(var r=0;r<BOARD_SIZE;r++){board[r]=[];for(var c=0;c<BOARD_SIZE;c++)board[r][c]=null;}}
  function isOccupied(r,c){return r>=0&&r<BOARD_SIZE&&c>=0&&c<BOARD_SIZE&&board[r][c]!==null;}
  function boardHasTiles(){for(var r=0;r<BOARD_SIZE;r++)for(var c=0;c<BOARD_SIZE;c++)if(board[r][c]!==null)return true;return false;}
  function shuffleArr(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function initBag(){bag=[];var ls=Object.keys(TILE_DIST);for(var i=0;i<ls.length;i++){for(var j=0;j<TILE_DIST[ls[i]];j++)bag.push(ls[i]);}shuffleArr(bag);}
  function drawTiles(rack,n){var d=0;while(d<n&&bag.length>0&&rack.length<RACK_SIZE){rack.push(bag.pop());d++;}return d;}
  function refillRack(rack){return drawTiles(rack,RACK_SIZE-rack.length);}

  function getTentativeAt(r,c){for(var i=0;i<tentativeTiles.length;i++)if(tentativeTiles[i].row===r&&tentativeTiles[i].col===c)return tentativeTiles[i];return null;}
  function letterAt(r,c){
    if(r<0||r>=BOARD_SIZE||c<0||c>=BOARD_SIZE)return null;
    var cell=board[r][c];if(cell)return cell.letter;
    var t=getTentativeAt(r,c);if(t)return t.isBlank?t.blankLetter:t.letter;
    return null;
  }

  function getWordScore(word,positions,isNewTile){
    var tot=0,wm=1;
    for(var i=0;i<word.length;i++){
      var r=positions[i].r,c=positions[i].c,letter=word[i];
      var lv=TILE_VALUES[letter]||0;
      var cell=board[r]?board[r][c]:null;
      if(cell&&cell.isBlank)lv=0;
      var tent=getTentativeAt(r,c);if(tent&&tent.isBlank)lv=0;
      var prem=PREMIUMS[r+','+c];
      if(prem&&isNewTile(r,c)){
        if(prem==='dl')lv*=2;else if(prem==='tl')lv*=3;
        else if(prem==='dw')wm*=2;else if(prem==='tw')wm*=3;
      }
      tot+=lv;
    }
    return tot*wm;
  }
  function getFormedWord(r,c,horiz){
    var dr=horiz?0:1,dc=horiz?1:0;
    var sr=r,sc=c;
    while(letterAt(sr-dr,sc-dc)!==null){sr-=dr;sc-=dc;}
    var w='',pos=[],cr=sr,cc=sc;
    while(letterAt(cr,cc)!==null){w+=letterAt(cr,cc);pos.push({r:cr,c:cc});cr+=dr;cc+=dc;}
    if(w.length<2)return null;
    return{word:w,positions:pos};
  }

  function validatePlacement(){
    if(tentativeTiles.length===0)return{valid:false,error:'Place tiles first'};
    var rows=[],cols=[];
    for(var i=0;i<tentativeTiles.length;i++){rows.push(tentativeTiles[i].row);cols.push(tentativeTiles[i].col);}
    var sameRow=true,sameCol=true;
    for(i=1;i<rows.length;i++){if(rows[i]!==rows[0])sameRow=false;if(cols[i]!==cols[0])sameCol=false;}
    if(!sameRow&&!sameCol)return{valid:false,error:'Tiles must be in a line'};
    var horiz=sameRow;
    if(tentativeTiles.length===1){
      var r=rows[0],c=cols[0];
      if(isOccupied(r,c-1)||isOccupied(r,c+1))horiz=true;else horiz=false;
    }
    var sorted=tentativeTiles.slice().sort(function(a,b){return horiz?a.col-b.col:a.row-b.row;});
    var first=sorted[0],last=sorted[sorted.length-1];
    if(horiz){for(var cc=first.col;cc<=last.col;cc++)if(!isOccupied(first.row,cc)&&!getTentativeAt(first.row,cc))return{valid:false,error:'No gaps allowed'};}
    else{for(var rr=first.row;rr<=last.row;rr++)if(!isOccupied(rr,first.col)&&!getTentativeAt(rr,first.col))return{valid:false,error:'No gaps allowed'};}
    var preExisting=false;
    for(var rrr=0;rrr<BOARD_SIZE;rrr++)for(var ccc=0;ccc<BOARD_SIZE;ccc++)if(board[rrr][ccc])preExisting=true;
    if(!preExisting){
      var cr=false;
      for(i=0;i<tentativeTiles.length;i++)if(tentativeTiles[i].row===CENTER&&tentativeTiles[i].col===CENTER){cr=true;break;}
      if(!cr)return{valid:false,error:'First word must cross the center star'};
      if(tentativeTiles.length<2)return{valid:false,error:'First word needs at least 2 tiles'};
    }else{
      var conn=false;
      for(i=0;i<tentativeTiles.length;i++){
        var tr=tentativeTiles[i].row,tc=tentativeTiles[i].col;
        if(isOccupied(tr-1,tc)||isOccupied(tr+1,tc)||isOccupied(tr,tc-1)||isOccupied(tr,tc+1)){conn=true;break;}
      }
      if(!conn)return{valid:false,error:'Must connect to existing tiles'};
    }
    var words=[],tot=0;
    function isNew(r,c){return !!getTentativeAt(r,c);}
    var mw=getFormedWord(first.row,first.col,horiz);
    if(mw&&mw.word.length>=2){
      if(!isWord(mw.word))return{valid:false,error:'"'+mw.word+'" not a word'};
      mw.score=getWordScore(mw.word,mw.positions,isNew);words.push(mw);tot+=mw.score;
    }
    for(i=0;i<tentativeTiles.length;i++){
      var cw=getFormedWord(tentativeTiles[i].row,tentativeTiles[i].col,!horiz);
      if(cw&&cw.word.length>=2){
        if(!isWord(cw.word))return{valid:false,error:'"'+cw.word+'" not a word'};
        cw.score=getWordScore(cw.word,cw.positions,isNew);words.push(cw);tot+=cw.score;
      }
    }
    if(words.length===0)return{valid:false,error:'No valid word'};
    var isBingo=tentativeTiles.length===RACK_SIZE;
    if(isBingo)tot+=BINGO_BONUS;
    return{valid:true,words:words,totalScore:tot,isBingo:isBingo};
  }

  // ── AI move generation (greedy search, same as before) ───────
  function generateAIMoves(rack){
    var moves=[];
    var anchors=[];
    if(!boardHasTiles())anchors.push({r:CENTER,c:CENTER});
    else{
      for(var r=0;r<BOARD_SIZE;r++)for(var c=0;c<BOARD_SIZE;c++){
        if(board[r][c]!==null)continue;
        if(isOccupied(r-1,c)||isOccupied(r+1,c)||isOccupied(r,c-1)||isOccupied(r,c+1))anchors.push({r:r,c:c});
      }
    }
    var rackLetters=[];
    for(var i=0;i<rack.length;i++){rackLetters.push({letter:rack[i],idx:i,isBlank:rack[i]===' '});}
    for(var ai=0;ai<anchors.length&&moves.length<40;ai++){
      var an=anchors[ai];
      for(var hv=0;hv<2;hv++){
        var horiz=hv===0;var dr=horiz?0:1,dc=horiz?1:0;
        var maxLen=Math.min(5,rack.length);
        tryCombinations(an.r,an.c,dr,dc,rackLetters,maxLen,horiz,moves);
      }
    }
    return moves;
  }
  function tryCombinations(sr,sc,dr,dc,rackLs,maxLen,horiz,moves){
    function recurse(len,pos,used,usedIdx){
      if(len===0){
        if(used.length===0)return;
        var saved=tentativeTiles;tentativeTiles=used.slice();
        var res=null;
        try{res=validatePlacement();}catch(e){res=null;}
        tentativeTiles=saved;
        if(res&&res.valid)moves.push({tiles:used.slice(),score:res.totalScore,words:res.words,isBingo:res.isBingo});
        return;
      }
      var r=pos.r,c=pos.c;
      if(r<0||r>=BOARD_SIZE||c<0||c>=BOARD_SIZE)return;
      if(board[r][c]!==null){recurse(len,{r:r+dr,c:c+dc},used,usedIdx);return;}
      for(var i=0;i<rackLs.length&&moves.length<40;i++){
        if(usedIdx[i])continue;
        var rl=rackLs[i];
        if(rl.isBlank){
          var tryLetters=['E','A','R','T','S'];
          for(var li=0;li<tryLetters.length;li++){
            var L=tryLetters[li];
            usedIdx[i]=true;
            used.push({row:r,col:c,letter:' ',rackIndex:rl.idx,isBlank:true,blankLetter:L});
            recurse(len-1,{r:r+dr,c:c+dc},used,usedIdx);
            used.pop();usedIdx[i]=false;
          }
        }else{
          usedIdx[i]=true;
          used.push({row:r,col:c,letter:rl.letter,rackIndex:rl.idx,isBlank:false,blankLetter:null});
          recurse(len-1,{r:r+dr,c:c+dc},used,usedIdx);
          used.pop();usedIdx[i]=false;
        }
      }
    }
    for(var L=2;L<=maxLen&&moves.length<40;L++){
      recurse(L,{r:sr,c:sc},[],{});
    }
  }

  // ── CSS injection (once per session) ──
  if(!document.getElementById('TRstyle')){
    var trStyle=document.createElement('style');trStyle.id='TRstyle';
    trStyle.textContent=[
      '#TRpan{padding-top:8px;}',
      '#TRboard{display:grid;grid-template-columns:repeat(15,1fr);gap:1px;max-width:100%;width:clamp(300px,94vw,440px);margin:6px auto;background:linear-gradient(135deg,#3b2a14,#5a3f22,#3b2a14);padding:5px;border-radius:10px;box-shadow:0 8px 26px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.08);border:2px solid #2a1d0e;}',
      '.tr-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:2px;transition:background .15s,transform .12s,box-shadow .15s;position:relative;font-family:Bebas Neue,sans-serif;-webkit-tap-highlight-color:transparent;}',
      '.tr-cell.prem-tw{background:#c75050;color:#fff;box-shadow:inset 0 0 6px rgba(0,0,0,0.35);}',
      '.tr-cell.prem-dw{background:#e89846;color:#fff;box-shadow:inset 0 0 6px rgba(0,0,0,0.3);}',
      '.tr-cell.prem-tl{background:#3a8bd8;color:#fff;box-shadow:inset 0 0 6px rgba(0,0,0,0.3);}',
      '.tr-cell.prem-dl{background:#5aa0e0;color:#fff;box-shadow:inset 0 0 6px rgba(0,0,0,0.3);}',
      '.tr-cell.prem-empty{background:linear-gradient(180deg,#2a2f22,#1e2318);}',
      '.tr-cell.center{background:#4a5038;color:#c8a84b;}',
      '.tr-cell.drop-ok{background:rgba(200,168,75,0.45)!important;box-shadow:inset 0 0 0 2px #c8a84b,0 0 10px rgba(200,168,75,0.4)!important;}',
      '.tr-cell.committed{background:linear-gradient(180deg,#f3e8c8,#d8c89a);color:#1a1205;box-shadow:inset 0 -2px 0 rgba(110,80,30,0.35),0 1px 0 rgba(0,0,0,0.25);}',
      '.tr-cell.tentative{background:linear-gradient(180deg,#ffe480,#e0b830);color:#2a1a05;box-shadow:inset 0 -2px 0 rgba(110,80,20,0.4),0 2px 6px rgba(200,168,75,0.35);animation:trPlaced .25s cubic-bezier(.34,1.56,.64,1);cursor:grab;}',
      '.tr-cell.tentative:active{cursor:grabbing;}',
      '@keyframes trPlaced{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
      '.tr-letter{font-weight:700;font-size:clamp(11px,2.4vw,16px);line-height:1;}',
      '.tr-val{position:absolute;bottom:2px;right:3px;font-family:DM Mono,monospace;font-size:7px;opacity:0.75;}',
      '.tr-prem-label{font-size:7px;letter-spacing:.05em;opacity:0.88;text-shadow:0 1px 1px rgba(0,0,0,0.4);}',
      '.tr-center-star{font-size:clamp(12px,2.8vw,18px);opacity:0.9;}',
      // Rack
      '#TRrack{display:flex;gap:5px;justify-content:center;padding:8px 6px;flex-wrap:wrap;background:linear-gradient(180deg,rgba(42,30,14,0.55),rgba(28,20,10,0.65));border-radius:10px;margin:6px auto;max-width:clamp(280px,94vw,400px);border:1px solid rgba(200,168,75,0.18);box-shadow:inset 0 2px 6px rgba(0,0,0,0.35);}',
      '.tr-rack-tile{width:44px;height:54px;border-radius:6px;background:linear-gradient(180deg,#fbf6e1,#e8dba8);color:#1a1205;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:grab;font-weight:700;border:2px solid #8a7044;box-shadow:0 3px 6px rgba(0,0,0,0.4),inset 0 -2px 0 rgba(110,80,20,0.4),inset 0 1px 0 rgba(255,255,255,0.6);position:relative;font-family:Bebas Neue,sans-serif;transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;touch-action:none;}',
      '.tr-rack-tile:active{cursor:grabbing;transform:translateY(-3px) scale(1.02);box-shadow:0 8px 14px rgba(0,0,0,0.5),inset 0 -2px 0 rgba(110,80,20,0.4);}',
      '.tr-rack-tile.sel{border-color:#c8a84b;transform:translateY(-4px) scale(1.04);box-shadow:0 10px 18px rgba(200,168,75,0.35),inset 0 -2px 0 rgba(110,80,20,0.4);}',
      '.tr-rack-tile .letter{font-size:22px;line-height:1;}',
      '.tr-rack-tile .val{position:absolute;bottom:3px;right:5px;font-family:DM Mono,monospace;font-size:10px;opacity:0.65;}',
      '.tr-rack-empty{width:44px;height:54px;border-radius:6px;background:rgba(60,50,30,0.3);border:2px dashed rgba(200,168,75,0.3);}',
      // Drag ghost
      '.tr-drag-ghost{position:fixed;pointer-events:none;z-index:200000;width:44px;height:54px;border-radius:6px;background:linear-gradient(180deg,#fff5c4,#e8b830);color:#1a1205;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;font-family:Bebas Neue,sans-serif;box-shadow:0 14px 30px rgba(0,0,0,0.6),inset 0 -2px 0 rgba(110,80,20,0.4);transform:translate(-50%,-50%) scale(1.15);opacity:0.95;}',
      '.tr-drag-ghost .letter{font-size:22px;line-height:1;}',
      '.tr-drag-ghost .val{position:absolute;bottom:3px;right:5px;font-family:DM Mono,monospace;font-size:10px;opacity:0.7;}',
      // Legend + stats
      '.tr-stats{display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em;}',
      '.tr-stats strong{color:var(--gold);}',
      '.tr-score-bar{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;font-family:Bebas Neue,sans-serif;letter-spacing:1px;background:rgba(26,31,23,0.6);border-radius:8px;margin:4px auto;max-width:clamp(280px,94vw,400px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);}',
      '.tr-score-bar .you{color:#7ab356;font-size:.95rem;}',
      '.tr-score-bar .bag{color:rgba(232,220,200,0.68);font-size:.65rem;font-family:DM Mono,monospace;}',
      '.tr-score-bar .cpu{color:#c47a7a;font-size:.95rem;}',
      '.tr-btn-row{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;padding:4px;margin:2px auto;}',
      '.tr-btn-row .gb{min-height:44px;padding:8px 12px;font-size:0.68rem;}',
      '.tr-btn-row .gb.primary{background:rgba(122,179,86,0.24);color:var(--sage);border-color:rgba(122,179,86,0.55);}',
      '.tr-btn-row .gb.primary:active{background:rgba(122,179,86,0.4);}',
      // Rules modal
      '#TRrulesOV{position:fixed;inset:0;z-index:200000;background:rgba(5,8,4,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;animation:trFadeIn .25s ease;}',
      '#TRrulesOV .card{max-width:440px;width:100%;max-height:86vh;overflow-y:auto;padding:22px 20px;background:linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;box-shadow:0 32px 64px rgba(0,0,0,0.7);font-family:DM Mono,monospace;color:var(--cream);font-size:0.72rem;line-height:1.6;}',
      '@keyframes trFadeIn{from{opacity:0}to{opacity:1}}',
      '#TRrulesOV h2{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.14em;color:var(--gold);border-bottom:1px solid rgba(200,168,75,0.3);margin:14px 0 8px;padding-bottom:4px;}'
    ].join('');
    document.head.appendChild(trStyle);
  }

  var pan;

  function renderStats(){
    var p=stats.w+stats.l+stats.d;
    var pct=p?Math.round(stats.w/p*100):0;
    return '<div class="tr-stats">played <strong>'+p+'</strong> · won <strong>'+pct+'%</strong> · streak <strong>'+stats.streak+'</strong> · best <strong>'+stats.best+'</strong></div>';
  }

  function render(){
    var h='';
    h+=renderStats();
    h+='<div class="tr-score-bar"><span class="you">🌱 YOU '+playerScore+'</span><span class="bag">BAG '+bag.length+'</span><span class="cpu">CPU '+aiScore+' 🐝</span></div>';
    // Board
    h+='<div id="TRboard">';
    for(var r=0;r<BOARD_SIZE;r++){
      for(var c=0;c<BOARD_SIZE;c++){
        var cell=board[r][c],tent=getTentativeAt(r,c),prem=PREMIUMS[r+','+c];
        var cls='tr-cell';
        var inner='';
        if(cell){
          cls+=' committed';
          inner='<span class="tr-letter">'+cell.letter+'</span><span class="tr-val">'+(cell.isBlank?'':TILE_VALUES[cell.letter])+'</span>';
        } else if(tent){
          cls+=' tentative';
          inner='<span class="tr-letter">'+(tent.isBlank?tent.blankLetter:tent.letter)+'</span><span class="tr-val">'+(tent.isBlank?'':TILE_VALUES[tent.letter])+'</span>';
        } else if(r===CENTER&&c===CENTER&&!boardHasTiles()){
          cls+=' center';
          inner='<span class="tr-center-star">★</span>';
        } else if(prem){
          cls+=' prem-'+prem;
          var lbl=prem==='tw'?'TW':prem==='dw'?'DW':prem==='tl'?'TL':'DL';
          inner='<span class="tr-prem-label">'+lbl+'</span>';
        } else {
          cls+=' prem-empty';
        }
        h+='<div class="'+cls+'" data-r="'+r+'" data-c="'+c+'">'+inner+'</div>';
      }
    }
    h+='</div>';
    // Rack
    h+='<div id="TRrack">';
    for(var i=0;i<playerRack.length;i++){
      var placed=false;
      for(var t=0;t<tentativeTiles.length;t++)if(tentativeTiles[t].rackIndex===i){placed=true;break;}
      if(placed){h+='<div class="tr-rack-empty"></div>';continue;}
      var L=playerRack[i],isBl=L===' ';
      var sel=i===selectedRackIndex;
      h+='<div class="tr-rack-tile'+(sel?' sel':'')+'" data-idx="'+i+'" data-letter="'+L+'"><span class="letter">'+(isBl?'?':L)+'</span><span class="val">'+(isBl?'0':TILE_VALUES[L])+'</span></div>';
    }
    h+='</div>';
    // Button rows
    h+='<div class="tr-btn-row">';
    h+='<button class="gb primary" onclick="_TRplay()">✓ PLAY</button>';
    h+='<button class="gb" onclick="_TRrecall()">↩ RECALL</button>';
    h+='<button class="gb" onclick="_TRshuffle()">🔀 SHUFFLE</button>';
    h+='</div>';
    h+='<div class="tr-btn-row">';
    h+='<button class="gb" onclick="_TRswap()">🔄 SWAP</button>';
    h+='<button class="gb" onclick="_TRpass()">PASS</button>';
    h+='<button class="gb" onclick="_TRrules()">📖 RULES</button>';
    h+='</div>';
    pan.innerHTML=h;
    wireInput();
  }

  // ── Wire drag + tap input after every render ──
  function wireInput(){
    var boardEl=document.getElementById('TRboard');
    if(!boardEl)return;
    // Tap to pick up a tentative tile → put it back on the rack
    boardEl.addEventListener('click',function(e){
      if(dragTile)return; // drag will handle its own drop
      var cell=e.target.closest('.tr-cell');if(!cell)return;
      var r=parseInt(cell.getAttribute('data-r'),10),c=parseInt(cell.getAttribute('data-c'),10);
      if(isNaN(r)||isNaN(c))return;
      _TRcell(r,c);
    });
    // Rack tap-select + drag-start
    var rackEl=document.getElementById('TRrack');
    if(rackEl){
      rackEl.addEventListener('click',function(e){
        if(dragTile)return;
        var tile=e.target.closest('.tr-rack-tile');if(!tile)return;
        var idx=parseInt(tile.getAttribute('data-idx'),10);
        if(!isNaN(idx))_TRrack(idx);
      });
    }
    // Drag start on rack tiles
    var rackTiles=pan.querySelectorAll('.tr-rack-tile');
    for(var i=0;i<rackTiles.length;i++){
      (function(t){
        t.addEventListener('pointerdown',function(e){onDragStart(e,'rack',t);});
      })(rackTiles[i]);
    }
    // Drag start on tentative board tiles
    var tentCells=pan.querySelectorAll('.tr-cell.tentative');
    for(var j=0;j<tentCells.length;j++){
      (function(t){
        t.addEventListener('pointerdown',function(e){onDragStart(e,'board',t);});
      })(tentCells[j]);
    }
  }

  function onDragStart(ev,src,el){
    if(!isPlayerTurn||gameOver)return;
    if(dragTile)return;
    ev.preventDefault();
    var info={src:src};
    if(src==='rack'){
      info.rackIndex=parseInt(el.getAttribute('data-idx'),10);
      var L=playerRack[info.rackIndex];
      info.letter=L;info.isBlank=(L===' ');
    } else {
      info.row=parseInt(el.getAttribute('data-r'),10);
      info.col=parseInt(el.getAttribute('data-c'),10);
      var tent=getTentativeAt(info.row,info.col);
      if(!tent)return;
      info.rackIndex=tent.rackIndex;
      info.letter=tent.letter;
      info.isBlank=tent.isBlank;
      info.blankLetter=tent.blankLetter;
    }
    dragTile=info;
    // Ghost
    var ghost=document.createElement('div');ghost.className='tr-drag-ghost';
    var disp=info.isBlank?(info.blankLetter||'?'):info.letter;
    var val=info.isBlank?'0':(TILE_VALUES[info.letter]||0);
    ghost.innerHTML='<span class="letter">'+disp+'</span><span class="val">'+val+'</span>';
    ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';
    document.body.appendChild(ghost);
    dragGhost=ghost;
    el.style.opacity='0.4';
    window.addEventListener('pointermove',onDragMove);
    window.addEventListener('pointerup',onDragEnd);
    window.addEventListener('pointercancel',onDragEnd);
    try{if(navigator.vibrate)navigator.vibrate(4);}catch(e){}
  }
  function onDragMove(ev){
    if(!dragTile||!dragGhost)return;
    dragGhost.style.left=ev.clientX+'px';
    dragGhost.style.top=ev.clientY+'px';
    // Highlight target cell if over board
    var target=document.elementFromPoint(ev.clientX,ev.clientY);
    var cell=target&&target.closest?target.closest('.tr-cell'):null;
    // Clear previous
    if(lastTargetCell&&lastTargetCell!==cell)lastTargetCell.classList.remove('drop-ok');
    if(cell){
      var r=parseInt(cell.getAttribute('data-r'),10);
      var c=parseInt(cell.getAttribute('data-c'),10);
      // Valid drop: empty cell (not committed, not tentative — unless it's the SAME tile's source)
      var canDrop=false;
      if(!isNaN(r)&&!isNaN(c)){
        var isSource=(dragTile.src==='board'&&dragTile.row===r&&dragTile.col===c);
        if(isSource)canDrop=true;
        else if(board[r][c]===null){
          var tAt=getTentativeAt(r,c);
          if(!tAt)canDrop=true;
        }
      }
      if(canDrop){cell.classList.add('drop-ok');lastTargetCell=cell;}
      else{lastTargetCell=null;}
    } else {
      lastTargetCell=null;
    }
  }
  function onDragEnd(ev){
    window.removeEventListener('pointermove',onDragMove);
    window.removeEventListener('pointerup',onDragEnd);
    window.removeEventListener('pointercancel',onDragEnd);
    if(!dragTile){cleanupDrag();return;}
    var target=document.elementFromPoint(ev.clientX,ev.clientY);
    var cell=target&&target.closest?target.closest('.tr-cell'):null;
    var rackEl=target&&target.closest?target.closest('#TRrack'):null;
    var dropR=-1,dropC=-1;
    if(cell){
      dropR=parseInt(cell.getAttribute('data-r'),10);
      dropC=parseInt(cell.getAttribute('data-c'),10);
    }
    if(dragTile.src==='rack'){
      if(cell&&!isNaN(dropR)&&!isNaN(dropC)&&board[dropR][dropC]===null&&!getTentativeAt(dropR,dropC)){
        // Place rack tile onto board
        var L=dragTile.letter;
        if(L===' '){
          var pick=prompt('Choose letter for blank (A-Z):','E');
          if(pick){pick=pick.toUpperCase().charAt(0);if(/[A-Z]/.test(pick)){tentativeTiles.push({row:dropR,col:dropC,letter:' ',rackIndex:dragTile.rackIndex,isBlank:true,blankLetter:pick});_play('tap');try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}}}
        }else{
          tentativeTiles.push({row:dropR,col:dropC,letter:L,rackIndex:dragTile.rackIndex,isBlank:false,blankLetter:null});
          _play('tap');try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
        }
      }
    } else if(dragTile.src==='board'){
      // Moving a tentative tile
      if(rackEl||!cell){
        // Drop on rack or nothing → remove from board (return to rack)
        for(var i=0;i<tentativeTiles.length;i++)if(tentativeTiles[i].row===dragTile.row&&tentativeTiles[i].col===dragTile.col){tentativeTiles.splice(i,1);break;}
        _play('tap');
      } else if(cell&&!isNaN(dropR)&&!isNaN(dropC)){
        var sameSpot=(dropR===dragTile.row&&dropC===dragTile.col);
        if(sameSpot){/* no-op */}
        else if(board[dropR][dropC]===null&&!getTentativeAt(dropR,dropC)){
          // Move the tile
          for(var j=0;j<tentativeTiles.length;j++)if(tentativeTiles[j].row===dragTile.row&&tentativeTiles[j].col===dragTile.col){tentativeTiles[j].row=dropR;tentativeTiles[j].col=dropC;break;}
          _play('tap');try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}
        }
      }
    }
    cleanupDrag();
    render();
  }
  function cleanupDrag(){
    if(dragGhost){dragGhost.remove();dragGhost=null;}
    if(lastTargetCell){lastTargetCell.classList.remove('drop-ok');lastTargetCell=null;}
    dragTile=null;
  }

  function aiTurn(){
    sm('CPU thinking...');
    setTimeout(function(){
      var moves=generateAIMoves(aiRack);
      if(moves.length===0){
        if(bag.length>=RACK_SIZE){
          var ret=aiRack.splice(0,aiRack.length);
          for(var i=0;i<ret.length;i++)bag.push(ret[i]);
          shuffleArr(bag);refillRack(aiRack);
          sm('CPU exchanged tiles');consecutivePasses=0;
        }else{consecutivePasses++;sm('CPU passed');}
        finishAITurn();return;
      }
      moves.sort(function(a,b){return b.score-a.score;});
      var chosen=moves[0];
      for(var ti=0;ti<chosen.tiles.length;ti++){
        var t=chosen.tiles[ti];
        var letter=t.isBlank?t.blankLetter:t.letter;
        board[t.row][t.col]={letter:letter,value:t.isBlank?0:(TILE_VALUES[t.letter]||0),isBlank:t.isBlank};
        var rl=t.isBlank?' ':t.letter;
        var idx=aiRack.indexOf(rl);if(idx>=0)aiRack.splice(idx,1);
      }
      aiScore+=chosen.score;consecutivePasses=0;
      refillRack(aiRack);
      var wl=chosen.words.map(function(w){return w.word;}).join(', ');
      sm('CPU: '+wl+' (+'+chosen.score+(chosen.isBingo?' BINGO!':'')+')');
      _play('snap');
      finishAITurn();
    },350);
  }
  function finishAITurn(){
    checkGameOver();
    if(gameOver)return;
    isPlayerTurn=true;render();
  }

  function checkGameOver(){
    if(consecutivePasses>=4){endGame();return;}
    if(bag.length===0&&(playerRack.length===0||aiRack.length===0)){endGame();return;}
  }
  function endGame(){
    gameOver=true;
    var pd=0,ad=0;
    for(var i=0;i<playerRack.length;i++)pd+=TILE_VALUES[playerRack[i]]||0;
    for(i=0;i<aiRack.length;i++)ad+=TILE_VALUES[aiRack[i]]||0;
    playerScore-=pd;aiScore-=ad;
    if(playerRack.length===0)playerScore+=ad;
    if(aiRack.length===0)aiScore+=pd;
    var won=playerScore>aiScore;
    if(won){
      _e('game_win');_playWin();sm('🌱 You win! '+playerScore+' — '+aiScore);
      stats.w++;stats.streak++;if(stats.streak>stats.best)stats.best=stats.streak;
    } else if(playerScore<aiScore){
      _e('game_loss');_play('lose');sm('CPU wins. '+playerScore+' — '+aiScore);
      stats.l++;stats.streak=0;
    } else {
      sm('Draw. '+playerScore+' — '+aiScore);stats.d++;stats.streak=0;
    }
    saveStats();
    _sr('trellis',{w:won,s:playerScore});
    render();
    (function(pw,as2,wn){setTimeout(function(){
      var _o=document.getElementById('TR-over');if(_o)_o.remove();
      var ov=document.createElement('div');ov.id='TR-over';
      ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,'+(wn?'rgba(122,179,86,0.3)':'rgba(199,138,80,0.16)')+' 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';
      ov.innerHTML='<div style="font-size:3rem;line-height:1;">'+(wn?'\ud83c\udfc6':'\ud83c\udf42')+'</div>'
        +'<div style="font-size:1.7rem;font-weight:700;color:'+(wn?'#7ab356':'#c78a50')+';letter-spacing:0.08em;margin-top:12px;">'+(wn?'YOU WIN THE TRELLIS':(pw===as2?'A DRAW':'THE AI TAKES IT'))+'</div>'
        +'<div style="font-size:1rem;color:#e8dcc8;margin-top:10px;">You <b style="color:#c8a84b">'+pw+'</b> \u00b7 AI <b style="color:#c8a84b">'+as2+'</b></div>'
        +'<div style="font-style:italic;font-size:0.8rem;color:#8a9178;margin-top:6px;">'+stats.w+'W / '+stats.l+'L'+(stats.streak>1?' \u00b7 \ud83d\udd25 '+stats.streak+' streak':'')+'</div>'
        +'<button id="TR-again" style="margin-top:22px;min-height:48px;padding:12px 28px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">\u21bb NEW GAME</button>'
        +'<button id="TR-view" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">view the board</button>';
      ov.querySelector('#TR-again').onclick=function(){ov.remove();if(window._TRnew)_TRnew();};
      ov.querySelector('#TR-view').onclick=function(){ov.remove();};
      ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
      document.body.appendChild(ov);
    },450);})(playerScore,aiScore,won);
  }
  function saveStats(){try{localStorage.setItem('lw_tr_stats',JSON.stringify(stats));}catch(e){}}

  ms(a,'<strong id="TRt">Word Trellis</strong>');
  mm(a);
  pan=document.createElement('div');pan.id='TRpan';
  pan.style.cssText='max-width:460px;margin:0 auto;padding:6px 4px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_TRnew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  window._TRnew=function(){
    var _to=document.getElementById('TR-over');if(_to)_to.remove();
    buildWordSet();
    initBoard();initBag();
    playerRack=[];aiRack=[];refillRack(playerRack);refillRack(aiRack);
    playerScore=0;aiScore=0;isPlayerTurn=true;gameOver=false;
    consecutivePasses=0;tentativeTiles=[];selectedRackIndex=-1;
    cleanupDrag();
    sm('Your turn');render();
  };
  // Tap the board with a selected rack tile (tap-to-place) OR tap a
  // tentative tile to pop it back to the rack.
  window._TRcell=function(r,c){
    if(!isPlayerTurn||gameOver)return;
    // Tentative tile tap → remove it
    for(var i=0;i<tentativeTiles.length;i++){
      if(tentativeTiles[i].row===r&&tentativeTiles[i].col===c){
        tentativeTiles.splice(i,1);_play('tap');render();return;
      }
    }
    // Place selected rack tile
    if(selectedRackIndex<0||board[r][c]!==null)return;
    var L=playerRack[selectedRackIndex];
    if(L===' '){
      var pick=prompt('Choose letter for blank (A-Z):','E');
      if(!pick)return;
      pick=pick.toUpperCase().charAt(0);
      if(!/[A-Z]/.test(pick))return;
      tentativeTiles.push({row:r,col:c,letter:' ',rackIndex:selectedRackIndex,isBlank:true,blankLetter:pick});
    }else{
      tentativeTiles.push({row:r,col:c,letter:L,rackIndex:selectedRackIndex,isBlank:false,blankLetter:null});
    }
    selectedRackIndex=-1;_play('tap');render();
  };
  window._TRrack=function(idx){
    if(!isPlayerTurn||gameOver)return;
    selectedRackIndex=(selectedRackIndex===idx)?-1:idx;
    render();
  };
  window._TRplay=function(){
    if(!isPlayerTurn||gameOver||tentativeTiles.length===0)return;
    var res=validatePlacement();
    if(!res.valid){sm(res.error);_play('lose');return;}
    for(var i=0;i<tentativeTiles.length;i++){
      var t=tentativeTiles[i];
      var letter=t.isBlank?t.blankLetter:t.letter;
      board[t.row][t.col]={letter:letter,value:t.isBlank?0:(TILE_VALUES[t.letter]||0),isBlank:t.isBlank};
    }
    playerScore+=res.totalScore;consecutivePasses=0;
    var idxs=tentativeTiles.map(function(t){return t.rackIndex;}).sort(function(a,b){return b-a;});
    for(i=0;i<idxs.length;i++)playerRack.splice(idxs[i],1);
    refillRack(playerRack);
    var wl=res.words.map(function(w){return w.word;}).join(', ');
    sm('+'+res.totalScore+' : '+wl+(res.isBingo?' BINGO!':''));
    _e(res.totalScore>=30?'milestone':'progress');
    if(res.isBingo)_e('milestone');
    _playWin();
    try{if(navigator.vibrate)navigator.vibrate(res.isBingo?[12,30,12]:14);}catch(e){}
    tentativeTiles=[];selectedRackIndex=-1;
    render();checkGameOver();if(gameOver)return;
    isPlayerTurn=false;setTimeout(aiTurn,300);
  };
  window._TRrecall=function(){tentativeTiles=[];selectedRackIndex=-1;render();};
  window._TRshuffle=function(){
    // Tentative tiles reference the rack by index — shuffling underneath them
    // made PLAY splice the WRONG letters out of the rack (duplication/loss).
    if(tentativeTiles.length>0){tentativeTiles=[];selectedRackIndex=-1;sm('Tiles recalled');}
    shuffleArr(playerRack);_play('tap');render();
  };
  window._TRpass=function(){
    if(!isPlayerTurn||gameOver)return;
    tentativeTiles=[];selectedRackIndex=-1;consecutivePasses++;
    sm('You passed');checkGameOver();if(gameOver){render();return;}
    isPlayerTurn=false;render();setTimeout(aiTurn,300);
  };
  window._TRswap=function(){
    if(!isPlayerTurn||gameOver)return;
    if(bag.length<RACK_SIZE){sm('Not enough tiles in bag to swap');return;}
    if(tentativeTiles.length>0){sm('Recall your tiles first');return;}
    var pick=prompt('Type the letters to swap (e.g. AEQ) or blank for ?',' ');
    if(pick==null)return;
    pick=pick.toUpperCase();
    if(!pick.length){sm('No tiles chosen');return;}
    // Validate every requested letter is actually in rack
    var rackCopy=playerRack.slice();
    var swapIdx=[];
    for(var i=0;i<pick.length;i++){
      var ch=pick.charAt(i);
      var want=(ch==='?'||ch===' ')?' ':ch;
      var idx=rackCopy.indexOf(want);
      if(idx<0){sm('You don\'t have '+ch);return;}
      rackCopy[idx]='#'; // mark consumed
      swapIdx.push(idx);  // rackCopy mirrors playerRack, so idx IS the rack index — indexOf(want) returned the same first slot for duplicates (2026-07-03 fix)
    }
    // Remove and return to bag
    var removed=[];
    swapIdx.sort(function(a,b){return b-a;});
    for(i=0;i<swapIdx.length;i++){removed.push(playerRack.splice(swapIdx[i],1)[0]);}
    for(i=0;i<removed.length;i++)bag.push(removed[i]);
    shuffleArr(bag);
    refillRack(playerRack);
    consecutivePasses=0; // swap is not a pass
    sm('Swapped '+removed.length+' tile'+(removed.length!==1?'s':''));
    _play('tap');
    isPlayerTurn=false;render();setTimeout(aiTurn,300);
  };
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){['TRrulesOV','TR-over'].forEach(function(id){var o=document.getElementById(id);if(o)o.remove();});});
  window._TRrules=function(){
    var _ex=document.getElementById('TRrulesOV');if(_ex){_ex.remove();} // repeated RULES taps used to stack duplicate overlays
    var ov=document.createElement('div');ov.id='TRrulesOV';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    var h='<div class="card">';
    h+='<h2>🌱 Word Trellis — How to Play</h2>';
    h+='<p>Build words on a 15×15 board. Each tile has a letter and a value. Play words that connect to existing tiles. First word must cross the <strong style="color:#c8a84b">★ center star</strong>.</p>';
    h+='<h2>Your turn — pick ONE</h2>';
    h+='<p><strong style="color:var(--sage)">PLAY</strong> — Drag tiles from your rack onto the board (or tap a rack tile then tap the board). Your tiles must form a single line and connect to existing tiles. Tap <strong>PLAY</strong> to commit.</p>';
    h+='<p><strong style="color:var(--sage)">SWAP</strong> — Exchange any number of tiles for new ones from the bag (needs 7+ in the bag). Costs your turn.</p>';
    h+='<p><strong style="color:var(--sage)">PASS</strong> — Skip your turn. Four passes in a row ends the game.</p>';
    h+='<h2>Premium squares</h2>';
    h+='<p><span style="color:#c75050">TW</span> Triple Word · <span style="color:#e89846">DW</span> Double Word · <span style="color:#3a8bd8">TL</span> Triple Letter · <span style="color:#5aa0e0">DL</span> Double Letter. Bonus applies only when you play a NEW tile on that square.</p>';
    h+='<h2>Bingo</h2>';
    h+='<p>Use all 7 of your rack tiles in one turn for a <strong style="color:var(--gold)">+50 Bingo bonus</strong>.</p>';
    h+='<h2>Drag & drop tips</h2>';
    h+='<p>• Drag any rack tile onto the board to place it.<br>• Drag a placed (gold) tile to move it to a new spot.<br>• Drag a placed tile onto the rack to return it.<br>• Tap a placed tile to pop it back.<br>• <strong>RECALL</strong> returns every tentative tile.<br>• <strong>SHUFFLE</strong> reorders your rack.</p>';
    h+='<h2>Game end</h2>';
    h+='<p>Bag empties + one rack empty → game ends. Players lose the value of tiles still in their rack; the player who emptied their rack GAINS the opponent\'s leftover.</p>';
    h+='<div style="text-align:center;margin-top:14px;"><button class="gb" onclick="document.getElementById(\'TRrulesOV\').remove()" style="min-height:48px;padding:10px 22px;">CLOSE</button></div>';
    h+='</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
    try{localStorage.setItem('lw_tr_rules_seen','1');}catch(e){}
  };

  // First-time auto-open
  try{
    if(!localStorage.getItem('lw_tr_rules_seen')){
      setTimeout(function(){if(window._TRrules)window._TRrules();},700);
    }
  }catch(e){}

  _TRnew();
};
})();
