/* FLOCK THE WORLD — wire corpus (seed batch, Aug 27)
   Pure data. The engine (wirePick in index.html) reads window.WIRE_CORPUS
   lazily; scripts/wire_lint.mjs holds every entry to the schema. Writers:
   your contract is WIRE-ENGINE-SPEC.md + HANDOFF-OPUS-WIRE.md. Composites of
   patterns, citations of nothing. Zero dashes. Civilians are people. */
window.WIRE_CORPUS=[

/* ---------------- DEPLOY lane: what the hardware does to a street ------- */
{id:'dep_pilot_1',lane:'dep',t:'The free pilot ends in {country}. The cameras stay. The invoice arrives addressed to a line item nobody remembers approving.',when:{owned:['pilot'],dayMin:40},wt:8,cd:200,cls:''},
{id:'dep_door_1',lane:'dep',t:'A doorbell in {rnd_country} records a marriage proposal, a repossession, and a stranger checking his reflection. All three clips are now training data.',when:{owned:['door']},wt:7,cd:180,cls:''},
{id:'dep_door_2',lane:'dep',t:'Insurance adjusters in {country} begin requesting doorbell archives by subpoena template. The form has a checkbox for "all footage, all dates."',when:{owned:['door'],dayMin:200},wt:6,cd:240,cls:'bad'},
{id:'dep_drone_1',lane:'dep',t:'Night flights over {country} log 4,000 backyard barbecues and one actual burglary. The burglary was already over. The barbecues are on file.',when:{owned:['drone']},wt:7,cd:180,cls:''},
{id:'dep_sat_1',lane:'dep',t:'Cloud cover clears above {region}. Somewhere in an operations room, a progress bar fills, and a hemisphere becomes a spreadsheet.',when:{owned:['sat']},wt:6,cd:220,cls:''},
{id:'dep_mesh_1',lane:'dep',t:'The sensor mesh in {country} learns footsteps. A widow who walks at 3am because the house is too quiet is flagged for pattern irregularity.',when:{owned:['mesh']},wt:6,cd:220,cls:'bad'},

/* the school arc: the beat Stephen named. Composite of real patterns,
   citing nothing. It escalates only while the player keeps building. */
{id:'school_1',lane:'dep',arc:{chain:'school',step:1},t:'Safety grant cameras go live in {country} schools. A third grader waves at the hallway dome every morning. It never waves back.',when:{owned:['school']},wt:9,cd:120,cls:''},
{id:'school_2',lane:'dep',arc:{chain:'school',step:2,gap:60},t:'{country} districts adopt automated discipline referrals. A boy is written up by a camera for running. He was running to his sister, who had fallen.',when:{owned:['school']},wt:9,cd:120,cls:'bad'},
{id:'school_3',lane:'dep',arc:{chain:'school',step:3,gap:90},t:'A contractor pitches {country} schools on restraint hardware rated for "compliance incidents." The demo unit is child sized. The board approves it under consent agenda.',when:{owned:['school'],tree:{cap:4}},wt:10,cd:150,cls:'crit'},
{id:'school_4',lane:'dep',arc:{chain:'school',step:4,gap:120},t:'First injury from an automated restraint in a {country} school. The vendor statement calls it an "interaction." The manual calls the setting FIRM.',when:{owned:['school'],tree:{cap:6}},once:true,wt:12,cls:'crit'},

/* ---------------- WATCHLIST lane: what the software decides ------------- */
{id:'cap_face_1',lane:'cap',t:'Face matching in {country} confuses two brothers for the fourth time. The younger one now carries his passport to buy groceries.',when:{owned:['face']},wt:8,cd:170,cls:'bad'},
{id:'cap_plate_1',lane:'cap',t:'Plate readers in {country} log a nurse commuting to night shifts 212 times. The 213th read flags her as a pattern anomaly. There is no appeal form for driving to work.',when:{owned:['plate']},wt:7,cd:180,cls:''},
{id:'cap_score_1',lane:'cap',t:'A landlord in {country} rejects a tenant over a risk score derived from her cousin. She has never met the cousin. The algorithm has.',when:{owned:['score']},wt:8,cd:170,cls:'bad'},
{id:'cap_patrol_1',lane:'cap',t:'Predictive patrol sends six cars to the same {country} block for the ninth week. Crime there is now mostly patrol related.',when:{owned:['patrol']},wt:7,cd:180,cls:''},
{id:'cap_arch_1',lane:'cap',t:'The archive in {region} passes one billion hours. An engineer calculates that watching it all would take 114,000 years, and files the calculation in the archive.',when:{owned:['arch']},wt:6,cd:240,cls:''},
{id:'cap_precog_1',lane:'cap',t:'{country} makes its first pre-incident arrest. The charge sheet lists a crime, a date, and a footnote: the date is next month.',when:{owned:['precog']},once:true,wt:12,cls:'crit'},

/* ---------------- STORY lane: the machine talking to itself ------------- */
{id:'inf_astro_1',lane:'inf',t:'"Concerned Parents for Safer Streets" holds its {country} rally. Attendance: 40. Payroll: 38.',when:{owned:['astro']},wt:7,cd:160,cls:''},
{id:'inf_anchor_1',lane:'inf',t:'The Anchor devotes eleven minutes to a stolen bicycle in {country} and forty seconds to the audit of who watches the watchers. The bicycle segment has a sponsor.',when:{owned:['anchor']},wt:7,cd:160,cls:''},
{id:'inf_blackout_1',lane:'inf',t:'Three {country} outlets kill the same story in one afternoon. The reporters compare notes at a bar. The bar has a camera.',when:{owned:['blackout']},wt:7,cd:170,cls:'bad'},
{id:'inf_narr_1',lane:'inf',t:'Media survey in {region}: every major outlet now shares a fact checking partner. The partner shares a parent company. The parent company is a client.',when:{owned:['narr']},wt:8,cd:200,cls:'bad'},
{id:'inf_capt_1',lane:'inf',t:'The {country} review board seats two new members. Both list the same former employer. The disclosure form has run out of lines.',when:{owned:['capt']},wt:7,cd:190,cls:''},
{id:'inf_deep_1',lane:'inf',t:'A university study finds {region} residents can no longer name a source they distrust less than the alternatives. The study is cited by nobody.',when:{tree:{inf:8}},wt:8,cd:220,cls:'bad'},

/* ---------------- CRISIS lane + war heat ladder ------------------------- */
{id:'war_threat_1',lane:'war',t:'Threat level in {country} rises to AMBER PLUS. Asked what changed, the ministry cites "the overall picture." The picture is not available for review.',when:{owned:['threat']},wt:7,cd:160,cls:''},
{id:'war_agit_1',lane:'war',t:'Organizers in {country} publish a spotters guide to provocateurs: new boots, old slogans, always first to the window with a rock.',when:{owned:['agit'],sus:[6,100]},wt:8,cd:170,cls:'res'},
{id:'war_heat_1',lane:'war',t:'Border shelling resumes in a province most {region} viewers cannot place. Coverage is wall to wall. The domestic audit story moves to page nine.',when:{warHeat:[0.25,0.55]},wt:8,cd:140,cls:''},
{id:'war_heat_2',lane:'war',t:'Two governments trade ultimatums drafted by the same consultancy. Defense contractors in {country} report record quarters. Bread is up nine percent.',when:{warHeat:[0.45,0.8]},wt:9,cd:140,cls:'bad'},
{id:'war_heat_3',lane:'war',t:'First conscription notices print in {rnd_country}. A father burns his in the sink, then apologizes to the smoke detector. It was listening.',when:{warHeat:[0.7,1]},wt:10,cd:160,cls:'crit'},

/* ---------------- combination arcs: choices multiplying ----------------- */
{id:'cmb_skydome_1',lane:'combo',arc:{chain:'skydome',step:1},t:'School drone day in {country}: the patrol unit visits the gym, hovers for the anthem, and follows one student to the bus. The vendor calls it engagement.',when:{owned:['school','drone']},wt:10,cd:150,cls:'bad'},
{id:'cmb_skydome_2',lane:'combo',arc:{chain:'skydome',step:2,gap:80},t:'{country} truancy enforcement goes aerial. A drone tails two kids skipping class to a funeral. The fine arrives before the flowers.',when:{owned:['school','drone']},wt:10,cd:150,cls:'crit'},
{id:'cmb_porch_1',lane:'combo',t:'A {country} porch camera identifies a census taker, a scout selling cookies, and a man leaving flowers for his late wife. All three are now associates of the household.',when:{owned:['face','door']},wt:9,cd:170,cls:'bad'},
{id:'cmb_debt_1',lane:'combo',t:'Stop quotas meet risk scores in {country}: the same forty people are stopped monthly to keep both dashboards green. One of them has started packing a lunch for it.',when:{owned:['quota','score']},wt:9,cd:170,cls:'bad'},
{id:'cmb_orbit_1',lane:'combo',t:'Orbital passes now annotate the social graph. A {country} analyst watches two dots share a bench for an hour and files them as a cell. It was a chess game.',when:{owned:['sat','graph']},wt:9,cd:180,cls:''},

/* ---------------- bloc voices: where you started shapes the story ------- */
{id:'bloc_na_1',lane:'bloc',t:'A {hq} morning show runs "Is Your Town Next?" for the eleventh straight week. Ratings say yes. The map says the town was first.',when:{bloc:'NA',dayMin:60},wt:7,cd:220,cls:''},
{id:'bloc_we_1',lane:'bloc',t:'A parliamentary committee across Western Europe requests your source code. Your lawyers request a definition of "request." The hearing adjourns for summer.',when:{bloc:'WE',dayMin:60},wt:7,cd:220,cls:''},
{id:'bloc_sa_1',lane:'bloc',t:'In South America the pitch says what it never says at home: the general asks for the price without the brochure. Procurement takes an afternoon.',when:{bloc:'SA',dayMin:60},wt:7,cd:220,cls:''},
{id:'bloc_ea_1',lane:'bloc',t:'The East Asia ministry does not buy your cameras. It benchmarks them against its own, and sends polite notes on your blind spots.',when:{bloc:'EA',dayMin:60},wt:7,cd:220,cls:''},
{id:'bloc_me_1',lane:'bloc',t:'The Middle East contract closes over coffee. Nobody mentions the journalists. The journalists have noticed.',when:{bloc:'ME',dayMin:60},wt:7,cd:220,cls:''},
{id:'bloc_ru_1',lane:'bloc',t:'Your Russia and Central Asia partner ministry requests a bulk export of "irregular persons." Legal renames the query before running it.',when:{bloc:'RU',dayMin:60},wt:7,cd:220,cls:'bad'},

/* ---------------- meter bands: the world reading its own gauges --------- */
{id:'ovr_low_1',lane:'meter',t:'An op-ed asks where the watchdogs went. The comment section knows: same place the classifieds went, and the pensions.',when:{ovr:[0,20],dayMin:150},wt:6,cd:240,cls:''},
{id:'ovr_mid_1',lane:'meter',t:'Patriotism hearings open in {region}. Witnesses are sworn in. Your name is spelled correctly, which everyone agrees is a bad sign.',when:{ovr:[45,70]},wt:8,cd:180,cls:'bad'},
{id:'ovr_high_1',lane:'meter',t:'Legislators who once toured your facilities now tour the protest camps. The photographers came with them. The wind is turning and it photographs well.',when:{ovr:[70,95]},wt:10,cd:150,cls:'crit'},
{id:'sus_high_1',lane:'meter',t:'A leaked slide deck titled "Normalization Roadmap" trends in {country}. Slide four is just the word PATIENCE in 96 point type.',when:{sus:[12,100]},wt:9,cd:160,cls:'bad'},
{id:'subj_half_1',lane:'meter',t:'Half of humanity now lives under meaningful coverage. The milestone press release calls them "members." Nobody remembers joining.',when:{subj:[0.5,0.6]},once:true,wt:12,cls:'crit'},
{id:'subj_third_1',lane:'meter',t:'One person in three now generates a daily behavioral file. Filed under routine. The word does the work.',when:{subj:[0.33,0.42]},once:true,wt:11,cls:'bad'},

/* ---------------- doctrine voices -------------------------------------- */
{id:'doc_glove_1',lane:'doctrine',t:'The convenience update ships in {country}: unlock your door with your face, your bus with your gait. Terms of service, page 61: your gait is now licensed.',when:{doctrine:'glove'},wt:7,cd:190,cls:''},
{id:'doc_glove_2',lane:'doctrine',t:'{country} wellness passports launch with confetti. The fine print says participation is voluntary. The bus lane says otherwise.',when:{doctrine:'glove',subj:[0.3,1]},wt:7,cd:200,cls:''},
{id:'doc_fist_1',lane:'doctrine',t:'Checkpoint queues in {country} now start before dawn. A vendor sells coffee down the line. He is the only person smiling, and he reports what he hears.',when:{doctrine:'fist'},wt:7,cd:190,cls:''},
{id:'doc_fist_2',lane:'doctrine',t:'{country} announces order has been restored. The announcement is mandatory listening. Restored is doing a lot of work.',when:{doctrine:'fist',subj:[0.3,1]},wt:7,cd:200,cls:''},

/* ---------------- the street answering back ----------------------------- */
{id:'ps_peace_1',lane:'street',t:'The {region} march passes a camera pole in silence. Ten thousand people, and the loudest sound is shoes. The operators find it worse than chanting.',when:{pstate:'peaceful'},wt:8,cd:130,cls:'res'},
{id:'ps_violent_1',lane:'street',t:'After the {region} riots, a hardware store owner sweeps glass and tells a reporter he blames whoever wanted this filmed. He does not say which side he means.',when:{pstate:'violent'},wt:8,cd:130,cls:''},
{id:'ps_upris_1',lane:'street',t:'In {region} the cameras come down faster than they went up. A municipal electrician does in one night what the council could not do in four years. He leaves the brackets.',when:{pstate:'uprising'},wt:10,cd:120,cls:'crit'},
{id:'crack_after_1',lane:'street',t:'Hospital admissions in {country} spike the night of the crackdown. The official count says minor injuries. The x-ray backlog says count again.',when:{crackWithin:20},wt:9,cd:110,cls:'bad'},
{id:'crack_after_2',lane:'street',t:'A grandmother in {country} frames the photo of her arrest. Visitors ask about it. She has started charging for the story, and donating the take.',when:{crackWithin:45,sus:[5,100]},wt:7,cd:200,cls:'res'},

/* ---------------- the money and the ledger ------------------------------ */
{id:'econ_run_1',lane:'econ',t:'The ban debate enters week {region} pundits call "decisive," as they did last week. Your revenue chart is displayed in the hearing room. It only goes up.',when:{econRun:20},wt:9,cd:120,cls:''},
{id:'econ_run_2',lane:'econ',t:'A senator holds up your invoice like a fish that offends him. Markets read it as guidance. You are too big to ban and both sides now know it.',when:{econRun:60},wt:10,cd:150,cls:'bad'},
{id:'fd_pages_1',lane:'econ',t:'A customs clerk in {rnd_country} photographs a crate manifest before it disappears. One page. Pages have a way of finding each other.',when:{fdPages:3},wt:8,cd:200,cls:'bad'},
{id:'lost_one_1',lane:'econ',t:'Your first expelled market publishes its exit audit. Other governments download it 4,000 times in a week. The template is the threat.',when:{lostMin:1},once:true,wt:12,cls:'crit'},

/* ---------------- mode + difficulty texture ----------------------------- */
{id:'mode_crisis_1',lane:'mode',t:'A think tank white paper prices instability by the point. Your Crisis desk is cited as "the demand side." The authors thank you for your openness.',when:{mode:'CRISIS',dayMin:100},wt:7,cd:220,cls:''},
{id:'mode_deep_1',lane:'mode',t:'Your two founding partner ministries compare dashboards at a summit. They have begun rating you. The scores are not shared with you.',when:{mode:'DEEPSTATE',dayMin:100},wt:7,cd:220,cls:''},
{id:'diff_inc_1',lane:'mode',t:'The investigative desk covering {hq} adds two reporters. Their beat is you. Their editor keeps your org chart on the wall like a trophy pending.',when:{diffMin:'Incumbent',dayMin:80},wt:8,cd:210,cls:'bad'}
];
